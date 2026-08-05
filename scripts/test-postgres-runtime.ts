import assert from "node:assert/strict";
import { createPostgresPool, PostgresTransactionRunner, postgresRuntimeConfig } from "../lib/postgres-runtime";
import { consumePostgresRateLimit, resetPostgresRateLimit } from "../lib/rate-limit-postgres";
import { PostgresCatalogRepository } from "../lib/postgres-catalog-repository";
import { PostgresSessionRepository } from "../lib/postgres-session-repository";
import { createPostgresPublicInquiry } from "../lib/inquiries-postgres";
import { createPostgresPublicClientWorkspace } from "../lib/signup-postgres";
import { PostgresRequestRepository } from "../lib/postgres-request-repository";

async function main() {
  const config = postgresRuntimeConfig({
    MIRTPAGE_POSTGRES_URL: process.env.MIRTPAGE_POSTGRES_REHEARSAL_URL,
    MIRTPAGE_POSTGRES_POOL_MAX: "2",
  });
  assert.ok(config, "A disposable PostgreSQL URL is required for runtime adapter tests.");

  const pool = createPostgresPool(config);
  const runner = new PostgresTransactionRunner(pool);
  try {
    const evidence = await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      const businesses = await runner.query<{ count: number }>(
        "SELECT COUNT(*)::int AS count FROM businesses WHERE status=?",
        ["active"],
      );
      assert.ok(businesses.rows[0]?.count > 0, "Expected active rehearsed businesses.");

      const outer = await runner.query<{ pid: number }>("SELECT pg_backend_pid()::int AS pid");
      const inner = await runner.transaction(async () =>
        runner.query<{ pid: number }>("SELECT pg_backend_pid()::int AS pid"),
      );
      assert.equal(inner.rows[0]?.pid, outer.rows[0]?.pid, "Nested work must retain one transaction client.");
      return { activeBusinesses: businesses.rows[0].count, backendPid: outer.rows[0].pid };
    });
    assert.ok(evidence.activeBusinesses > 0);
    assert.ok(evidence.backendPid > 0);

    await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      const repository = new PostgresCatalogRepository(runner);
      const businesses = await repository.getAllBusinesses();
      const business = businesses[0];
      assert.ok(business, "Expected a rehearsed business.");
      assert.equal((await repository.getBusinessByHandle(`@${business.handle}`))?.id, business.id);
      assert.equal((await repository.getBusinessByHandleAny(business.handle))?.id, business.id);
      const catalog = await repository.getCatalogByBusinessId(business.id, true);
      assert.equal(catalog?.business.id, business.id);
      assert.ok(catalog?.categories.length);
      const user = (await runner.query<{ id: number; email: string }>(
        "SELECT id,email FROM users WHERE business_id=? ORDER BY id LIMIT 1",
        [business.id],
      )).rows[0];
      if (user) {
        assert.equal((await repository.getUserById(user.id))?.id, user.id);
        assert.equal((await repository.getUserByEmail(user.email))?.id, user.id);

        const sessions = new PostgresSessionRepository(runner);
        const now = Date.now();
        const tokenHash = `postgres-runtime-${now}`;
        const sessionId = await sessions.create({
          tokenHash,
          userId: user.id,
          expiresAt: now + 60_000,
          now,
          ipHash: "test-ip-hash",
          userAgent: "PostgreSQL runtime test",
        });
        assert.equal((await sessions.findActive(tokenHash, now))?.id, sessionId);
        await sessions.touch(sessionId, now + 1);
        assert.equal((await sessions.findActive(tokenHash, now + 1))?.last_seen_at, now + 1);
        await sessions.revokeByToken(tokenHash, now + 2);
        assert.equal(await sessions.findActive(tokenHash, now + 2), undefined);
      }

      const product = (await runner.query<{ id: number }>(
        "SELECT id FROM products WHERE business_id=? AND is_published=1 AND availability IN ('available','limited') ORDER BY id LIMIT 1",
        [business.id],
      )).rows[0];
      if (product) {
        const groups = (await runner.query<{ id: number; name: string }>("SELECT id,name FROM option_groups WHERE product_id=? ORDER BY position,id", [product.id])).rows;
        const options: Record<string, string> = {};
        for (const group of groups) {
          const value = (await runner.query<{ value: string }>("SELECT value FROM option_values WHERE option_group_id=? ORDER BY id LIMIT 1", [group.id])).rows[0];
          assert.ok(value, `Expected an option value for ${group.name}.`);
          options[group.name] = value.value;
        }
        const key = `postgres-inquiry-${Date.now()}`;
        const first = await createPostgresPublicInquiry(runner, {
          businessId: business.id,
          customerName: "PostgreSQL rehearsal visitor",
          contact: "+251911123456",
          contactMethod: "phone",
          note: "Rehearsal inquiry",
          idempotencyKey: key,
          items: [{ productId: product.id, quantity: "20 kg", options }],
        }, "postgres-rehearsal-ip", async () => undefined);
        assert.equal(first.duplicate, false);
        const repeated = await createPostgresPublicInquiry(runner, {
          businessId: business.id,
          customerName: "PostgreSQL rehearsal visitor",
          contact: "+251911123456",
          contactMethod: "phone",
          idempotencyKey: key,
          items: [{ productId: product.id, options }],
        }, "postgres-rehearsal-ip", async () => undefined);
        assert.equal(repeated.duplicate, true);
        assert.equal(repeated.inquiryId, first.inquiryId);
      }
    });

    await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      const requests = new PostgresRequestRepository(runner);
      const key = `postgres-request-${Date.now()}`;
      const input = { contactName: "PostgreSQL request", contactValue: "+251911123456", businessName: "PostgreSQL Works", requestText: "We need a professional showroom for the products made in our workshop.", idempotencyKey: key, consent: true };
      const created = await requests.createPublicInterest(input, "postgres-request-ip");
      assert.ok(created.id && created.publicRef);
      assert.equal((await requests.createPublicInterest(input, "postgres-request-ip")).id, created.id);
      const detail = await requests.getRequestDetail(created.id);
      assert.equal(detail?.id, created.id);
      assert.equal(detail?.events.length, 1);
      const admin = (await runner.query<{ id: number; email: string; name: string; role: "admin"; business_id: null; must_change_password: number; access_role: "platform_admin" }>("SELECT u.id,u.email,u.name,u.role,u.business_id,u.must_change_password,'platform_admin' access_role FROM users u WHERE u.role='admin' ORDER BY id LIMIT 1")).rows[0];
      assert.ok(admin, "Expected an administrator fixture.");
      const page = await requests.listRequestsPage(admin, { page: 1, q: "postgresql request" });
      assert.ok(page.items.some((item) => item.id === created.id));
      const changed = await requests.updateStatus(created.id, "under_review", admin.id);
      assert.equal(changed?.businessId, null);
      const updated = await requests.getRequestDetail(created.id);
      assert.equal(updated?.status, "under_review");
    });

    await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      const unique = `${Date.now()}${Math.floor(Math.random() * 10_000)}`;
      const input = {
        name: "PostgreSQL Signup",
        email: `postgres-${unique}@example.test`,
        phone: "+251911123456",
        businessName: `PostgreSQL Works ${unique}`,
        handle: `postgres-works-${unique}`,
        password: "PostgresSignup123",
        confirmPassword: "PostgresSignup123",
        requestText: "We make durable goods and need a clear public showroom for local buyers.",
        idempotencyKey: `postgres-signup-${unique}`,
        consent: true,
      };
      const signup = await createPostgresPublicClientWorkspace(runner, input);
      assert.ok(signup.userId && signup.businessId && signup.requestId);
      await assert.rejects(
        () => createPostgresPublicClientWorkspace(runner, { ...input, handle: `other-${unique}`, idempotencyKey: `again-${unique}` }),
        /already uses this email/,
      );
    });

    await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      await resetPostgresRateLimit(runner, "postgres-runtime-test");
      assert.equal((await consumePostgresRateLimit(runner, "postgres-runtime-test", 2, 60_000)).remaining, 1);
      assert.equal((await consumePostgresRateLimit(runner, "postgres-runtime-test", 2, 60_000)).remaining, 0);
      const blocked = await consumePostgresRateLimit(runner, "postgres-runtime-test", 2, 60_000, 120_000);
      assert.equal(blocked.allowed, false);
      assert.equal(blocked.remaining, 0);
      assert.ok(blocked.retryAfterSeconds > 0);
    });

    const runtimeUrl = new URL(process.env.MIRTPAGE_POSTGRES_REHEARSAL_URL!);
    runtimeUrl.searchParams.set("options", "-c search_path=mirtpage_rehearsal");
    process.env.MIRTPAGE_DATABASE_DRIVER = "postgres";
    process.env.MIRTPAGE_POSTGRES_RUNTIME_PREVIEW = "1";
    process.env.MIRTPAGE_POSTGRES_URL = runtimeUrl.toString();
    const {
      listBusinessesPage,
      listInquiriesPage,
      listPublicIndustries,
      listPublicShowrooms,
    } = await import("../lib/scalable-queries");
    const { closePostgresRuntimeForTests } = await import("../lib/postgres-runtime-services");
    try {
      const businesses = await listBusinessesPage({ page: 1 });
      assert.ok(businesses.items.length > 0, "Expected PostgreSQL business pagination results.");
      const industries = await listPublicIndustries();
      assert.ok(industries.length > 0, "Expected PostgreSQL JSON industry extraction results.");
      const showrooms = await listPublicShowrooms({ page: 1, industry: industries[0].key });
      assert.ok(showrooms.totalItems > 0, "Expected PostgreSQL public showroom results.");
      const {
        runtimeListRequestsPage,
        runtimeRequestAttachment,
        runtimeRequestDetail,
        runtimeRequestTypeForBusiness,
      } = await import("../lib/request-runtime");
      const runtimeAdmin = await runner.transaction(async () => {
        await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
        return (await runner.query<{
          id: number;
          email: string;
          name: string;
          role: "admin";
          must_change_password: number;
        }>("SELECT id,email,name,role,must_change_password FROM users WHERE role='admin' ORDER BY id LIMIT 1")).rows[0];
      });
      const runtimeAdminUser = { ...runtimeAdmin, access_role: "platform_admin" as const, business_id: null };
      const requestPage = await runtimeListRequestsPage(runtimeAdminUser, { page: 1 });
      assert.ok(requestPage.items.length > 0, "Expected runtime-facade request results.");
      assert.equal((await runtimeRequestDetail(requestPage.items[0].id))?.id, requestPage.items[0].id);
      const requestBusinessId = requestPage.items.find((item) => item.business_id)?.business_id;
      if (requestBusinessId) assert.ok(await runtimeRequestTypeForBusiness(requestBusinessId));
      const attachmentTarget = await runner.transaction(async () => {
        await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
        return (await runner.query<{ id: number; request_id: number }>(
          "SELECT id,request_id FROM request_attachments ORDER BY id LIMIT 1",
        )).rows[0];
      });
      if (attachmentTarget) {
        assert.equal((await runtimeRequestAttachment(attachmentTarget.request_id, attachmentTarget.id))?.id, attachmentTarget.id);
      }
      const inquiryBusiness = (await runner.transaction(async () => {
        await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
        return (await runner.query<{ business_id: number }>(
          "SELECT business_id FROM inquiries ORDER BY id DESC LIMIT 1",
        )).rows[0];
      }))?.business_id;
      if (inquiryBusiness) {
        const inquiries = await listInquiriesPage(inquiryBusiness, { page: 1 });
        assert.ok(inquiries.items.length > 0, "Expected PostgreSQL inquiry pagination results.");
        assert.ok(inquiries.items[0].items.length > 0, "Expected scoped PostgreSQL inquiry item hydration.");
      }

      const upkeepTarget = await runner.transaction(async () => {
        await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
        return (await runner.query<{
          business_id: number;
          content_version: number;
          category_id: number;
          user_id: number;
          email: string;
          name: string;
          role: "owner";
          must_change_password: number;
        }>(`
          SELECT b.id business_id,b.content_version,c.id category_id,u.id user_id,u.email,u.name,u.role,u.must_change_password
          FROM businesses b
          JOIN categories c ON c.business_id=b.id
          JOIN users u ON u.business_id=b.id
          JOIN user_access_profiles p ON p.user_id=u.id AND p.access_role='client'
          WHERE b.status='active'
            AND EXISTS(SELECT 1 FROM published_catalog_versions v WHERE v.business_id=b.id)
          ORDER BY b.id,c.id,u.id LIMIT 1
        `)).rows[0];
      });
      assert.ok(upkeepTarget, "Expected a published client showroom for PostgreSQL upkeep.");
      const { executeBasicProductUpkeep } = await import("../lib/product-upkeep");
      const { runtimeProductUpkeepPort } = await import("../lib/product-upkeep-runtime");
      const upkeepKey = `postgres-upkeep-${Date.now()}`;
      const upkeepCommand = {
        kind: "create",
        businessId: upkeepTarget.business_id,
        productId: null,
        expectedContentVersion: upkeepTarget.content_version,
        idempotencyKey: upkeepKey,
        name: "PostgreSQL Runtime Offering",
        description: "A production capability created during the disposable PostgreSQL runtime rehearsal.",
        availability: "available",
        offeringKind: "manufacturing_capability",
        quantityMode: "optional",
        capacitySummary: "Capacity discussed with each buyer",
        minimumOrderSummary: "Flexible trial order",
        leadTimeSummary: "Confirmed after specification review",
        priceMinor: null,
        quantityUnit: "",
        highlights: ["Made in Ethiopia", "Buyer specifications accepted"],
        videoRef: "",
        categoryId: upkeepTarget.category_id,
        imageAction: "keep",
        serviceNote: "",
      };
      const upkeepUser = {
        id: upkeepTarget.user_id,
        email: upkeepTarget.email,
        name: upkeepTarget.name,
        role: upkeepTarget.role,
        access_role: "client" as const,
        business_id: upkeepTarget.business_id,
        must_change_password: upkeepTarget.must_change_password,
      };
      const upkeep = await executeBasicProductUpkeep(runtimeProductUpkeepPort(), upkeepUser, upkeepCommand, null);
      assert.equal(upkeep.contentVersion, upkeepTarget.content_version + 1);
      assert.equal((await executeBasicProductUpkeep(runtimeProductUpkeepPort(), upkeepUser, upkeepCommand, null)).duplicate, true);

      process.env.PRIVACY_SALT = "postgres-runtime-privacy-salt-long-enough";
      const {
        getBusinessSubscription,
        getShowroomInsights,
        recordManualPayment,
        recordShowroomVisit,
      } = await import("../lib/account-health");
      const accountTarget = await runner.transaction(async () => {
        await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
        const business = (await runner.query<{ id: number; handle: string }>(
          "SELECT id,handle FROM businesses WHERE status='active' ORDER BY id LIMIT 1",
        )).rows[0];
        const operations = (await runner.query<{
          id: number;
          email: string;
          name: string;
          role: "admin";
          must_change_password: number;
        }>(`
          SELECT u.id,u.email,u.name,u.role,u.must_change_password
          FROM users u JOIN user_access_profiles p ON p.user_id=u.id
          WHERE p.access_role='operations_manager' ORDER BY u.id LIMIT 1
        `)).rows[0];
        return { business, operations };
      });
      assert.ok(accountTarget.business && accountTarget.operations, "Expected account-health rehearsal fixtures.");
      const operationsUser = {
        ...accountTarget.operations,
        access_role: "operations_manager" as const,
        business_id: null,
      };
      const subscription = await getBusinessSubscription(accountTarget.business.id);
      assert.equal(subscription?.businessId, accountTarget.business.id);
      const paymentKey = `postgres-payment-${Date.now()}`;
      const payment = await recordManualPayment(operationsUser, {
        businessId: accountTarget.business.id,
        amount: "",
        idempotencyKey: paymentKey,
      });
      assert.equal(payment.duplicate, false);
      assert.equal((await recordManualPayment(operationsUser, {
        businessId: accountTarget.business.id,
        amount: "",
        idempotencyKey: paymentKey,
      })).duplicate, true);
      const visitToken = `postgres-visitor-${Date.now()}`;
      assert.equal((await recordShowroomVisit({
        handle: accountTarget.business.handle,
        visitorToken: visitToken,
        source: "directory",
      })).recorded, true);
      assert.ok((await getShowroomInsights(operationsUser, accountTarget.business.id)).directoryVisitors > 0);

      const {
        assignRequestToTeamMember,
        createStaffAccount,
        listAssignedBusinesses,
      } = await import("../lib/staff-operations");
      const staffUnique = Date.now();
      const staff = await createStaffAccount({
        name: "PostgreSQL Runtime Team Member",
        email: `postgres-staff-${staffUnique}@example.test`,
        password: "PostgresStaff123",
        accessRole: "team_member",
      });
      const assignableRequest = await runner.transaction(async () => {
        await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
        return (await runner.query<{ id: number; business_id: number }>(
          "SELECT id,business_id FROM service_requests WHERE business_id IS NOT NULL ORDER BY id LIMIT 1",
        )).rows[0];
      });
      assert.ok(assignableRequest, "Expected a business-scoped request for assignment rehearsal.");
      const assignment = await assignRequestToTeamMember(assignableRequest.id, staff.userId, operationsUser.id);
      assert.equal(assignment.assignedUserId, staff.userId);
      assert.ok((await listAssignedBusinesses(staff.userId)).some((business) => business.id === assignableRequest.business_id));

      const {
        createClientInvitation,
        getActiveInvitation,
        redeemClientInvitation,
      } = await import("../lib/invitations");
      const invitationUnique = Date.now();
      const invitationToken = `I${String(invitationUnique).padStart(42, "0")}`;
      const invitation = await createClientInvitation({
        requestId: null,
        clientName: "PostgreSQL Invited Client",
        email: `postgres-invite-${invitationUnique}@example.test`,
        businessName: `PostgreSQL Invitation Works ${invitationUnique}`,
        handle: `postgres-invitation-${invitationUnique}`,
        designKey: "alhaya",
        actorUserId: operationsUser.id,
      }, { token: invitationToken });
      assert.equal((await getActiveInvitation(invitationToken))?.business_id, invitation.businessId);
      const redeemedInvitation = await redeemClientInvitation({
        token: invitationToken,
        name: "PostgreSQL Invited Client",
        password: "PostgresInvite123",
      });
      assert.equal(redeemedInvitation.businessId, invitation.businessId);
      assert.equal(await getActiveInvitation(invitationToken), undefined);

      const {
        closeSupportConversation,
        createSupportConversation,
        getSupportConversation,
        listSupportConversations,
        postSupportMessage,
        reopenSupportConversation,
        updateSupportAgentSetting,
      } = await import("../lib/support");
      await updateSupportAgentSetting(operationsUser, {
        userId: staff.userId,
        enabled: true,
        maxOpenConversations: 2,
      });
      const supportClientRow = await runner.transaction(async () => {
        await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
        return (await runner.query<{
          id: number;
          email: string;
          name: string;
          role: "owner";
          business_id: number;
          must_change_password: number;
        }>("SELECT id,email,name,role,business_id,must_change_password FROM users WHERE id=?", [redeemedInvitation.userId])).rows[0];
      });
      const supportClient = { ...supportClientRow, access_role: "client" as const };
      const supportConversation = await createSupportConversation(supportClient, {
        subject: "PostgreSQL runtime support",
        message: "Verify the native support queue on PostgreSQL.",
        idempotencyKey: `postgres-support-${Date.now()}`,
      });
      assert.equal((await getSupportConversation(supportClient, supportConversation.id)).conversation.assignedUserId, staff.userId);
      await postSupportMessage(operationsUser, supportConversation.id, {
        message: "The PostgreSQL support queue is responding.",
        idempotencyKey: `postgres-support-reply-${Date.now()}`,
      });
      assert.ok((await getSupportConversation(supportClient, supportConversation.id)).messages.length >= 2);
      await closeSupportConversation(operationsUser, supportConversation.id);
      await reopenSupportConversation(supportClient, supportConversation.id);
      assert.ok((await listSupportConversations(operationsUser, { q: "PostgreSQL runtime" })).items.some(
        (conversation) => conversation.id === supportConversation.id,
      ));

      const { audit } = await import("../lib/security");
      const auditAction = `postgres.runtime.${Date.now()}`;
      await audit(auditAction, {
        userId: operationsUser.id,
        businessId: accountTarget.business.id,
        detail: { evidence: "runtime" },
      });
      const auditRow = await runner.transaction(async () => {
        await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
        return (await runner.query<{ action: string }>(
          "SELECT action FROM audit_logs WHERE action=? ORDER BY id DESC LIMIT 1",
          [auditAction],
        )).rows[0];
      });
      assert.equal(auditRow?.action, auditAction);
    } finally {
      await closePostgresRuntimeForTests();
    }
    console.log("PostgreSQL runtime pool, placeholder, and transaction tests passed.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
