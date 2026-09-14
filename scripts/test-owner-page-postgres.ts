import assert from "node:assert/strict";
import { ownerPagePort } from "../lib/owner-page-runtime";
import { readOwnerPage, saveOwnerPage, setOwnerPageAssistance, startOwnerPage } from "../lib/owner-page-service";
import { closePostgresRuntimeForTests, postgresRuntimeServices } from "../lib/postgres-runtime-services";
import { runtimeCatalogByBusinessId } from "../lib/catalog-runtime";
import { initialBusinessProfile } from "../lib/business-profile";
import { OwnerPageError } from "../lib/owner-page-domain";
import type { SessionUser } from "../lib/types";
import { changePagePublication } from "../lib/owner-page-publication";
import { pagePublicationPort, runtimePublishedPage } from "../lib/owner-page-publication-runtime";
import { getMarketplaceDiscoveryView } from "../lib/discovery";

async function main() {
  const target = new URL(process.env.MIRTPAGE_POSTGRES_URL || "");
  assert.ok(["localhost", "127.0.0.1"].includes(target.hostname) && target.port === "54322", "Only this project's local Supabase may be tested.");
  assert.equal(process.env.MIRTPAGE_DATABASE_DRIVER, "postgres");
  process.env.SUQPAGE_OWNER_EDITOR_ENABLED = "1";
  const { runner } = postgresRuntimeServices();
  const rollback = new Error("ROLLBACK_TEST_ONLY");
  try {
    await runner.transaction(async () => {
      const selectUser = `SELECT u.id,u.email,u.name,u.role,u.business_id,u.must_change_password,p.access_role
        FROM users u JOIN user_access_profiles p ON p.user_id=u.id`;
      const owner = (await runner.query<SessionUser>(`${selectUser} WHERE p.access_role='client' AND u.business_id IN (SELECT id FROM businesses WHERE status='active') ORDER BY u.id LIMIT 1`)).rows[0];
      const admin = (await runner.query<SessionUser>(`${selectUser} WHERE p.access_role='platform_admin' ORDER BY u.id LIMIT 1`)).rows[0];
      assert.ok(owner && admin && owner.business_id, "Existing local test identities are required.");
      const businessId = owner.business_id;
      const before = await runtimeCatalogByBusinessId(businessId, true);
      assert.ok(before);
      // All fixture mutations below, including cleanup, are rolled back together.
      await runner.query("DELETE FROM owner_page_events WHERE business_id=?", [businessId]);
      await runner.query("DELETE FROM owner_page_drafts WHERE business_id=?", [businessId]);
      const content = initialBusinessProfile(before);
      const created = await startOwnerPage(ownerPagePort, owner, businessId, content);
      assert.equal(created.version, 1);
      await assert.rejects(readOwnerPage(ownerPagePort, admin, businessId), (error: unknown) => error instanceof OwnerPageError && error.status === 403);
      const granted = await setOwnerPageAssistance(ownerPagePort, owner, businessId, 1, true);
      const saved = await saveOwnerPage(ownerPagePort, admin, businessId, granted.version, { ...content, coverStyle: "overlay", videoUrl: "https://youtu.be/abcdefghijk", about: "Private profile test.", contacts: { email: "public@example.com", website: "https://example.com/" } });
      assert.equal(saved.content.videoUrl, "https://www.youtube.com/watch?v=abcdefghijk");
      assert.equal(saved.content.coverStyle, "overlay");
      assert.equal(saved.updatedBy, admin.id);
      await assert.rejects(saveOwnerPage(ownerPagePort, owner, businessId, granted.version, content), (error: unknown) => error instanceof OwnerPageError && error.status === 409);
      const loadedByStaff = await readOwnerPage(ownerPagePort, admin, businessId);
      assert.ok(loadedByStaff);
      assert.equal(loadedByStaff.content.contacts?.email, "public@example.com");
      await setOwnerPageAssistance(ownerPagePort, owner, businessId, saved.version, false);
      assert.equal(await ownerPagePort.commit(admin, loadedByStaff, { kind: "content", content }), null, "Atomic adapter blocks a stale staff save after revocation.");
      const events = (await runner.query<{ kind: string; actor_user_id: number }>("SELECT kind,actor_user_id FROM owner_page_events WHERE business_id=? ORDER BY version", [businessId])).rows;
      assert.deepEqual(events.map((e) => e.kind), ["created", "consent_enabled", "content", "consent_revoked"]);
      assert.equal(events[2].actor_user_id, admin.id);
      assert.deepEqual(await runtimeCatalogByBusinessId(businessId, true), before, "Private edits do not modify any canonical catalog field.");
      const draft = (await ownerPagePort.read(businessId))!;
      const published = await changePagePublication(ownerPagePort, pagePublicationPort, owner, businessId, { action: "publish", version: draft.version, revision: 0 });
      assert.deepEqual(await runtimePublishedPage(businessId), draft.content);
      const market = await getMarketplaceDiscoveryView({ industry: "all" });
      const listing = market.showrooms.find((row) => row.id === businessId);
      assert.ok(listing, "Fixture is an approved public listing.");
      assert.equal(listing.heroImagePath, draft.content.heroImage, "Discovery uses the current published cover.");
      assert.equal(published.publishedBy, owner.id);
      assert.equal(await pagePublicationPort.commit(admin, draft, published.revision, draft.content, "publish"), null);
      assert.equal(await pagePublicationPort.commit(owner, draft, 0, draft.content, "publish"), null, "Concurrent publication revision is checked under lock.");
      const nextDraft = await saveOwnerPage(ownerPagePort, owner, businessId, draft.version, { ...draft.content, heroImage: "", about: "Not published yet" });
      assert.deepEqual(await runtimePublishedPage(businessId), draft.content, "New edits stay private.");
      assert.equal((await getMarketplaceDiscoveryView({ industry: "all" })).showrooms.find((row) => row.id === businessId)?.heroImagePath,
        draft.content.heroImage, "Later draft covers do not leak into discovery.");
      assert.equal(await pagePublicationPort.commit(owner, draft, published.revision, draft.content, "publish"), null, "An edit between review and publication cannot be overwritten.");
      await changePagePublication(ownerPagePort, pagePublicationPort, owner, businessId, { action: "restore", version: nextDraft.version, revision: 1 });
      assert.equal(await runtimePublishedPage(businessId), undefined, "Restoring the first publication selects the canonical shared profile.");
      assert.equal((await getMarketplaceDiscoveryView({ industry: "all" })).showrooms.find((row) => row.id === businessId)?.heroImagePath,
        before.business.hero_image_path, "Restoring the baseline also restores its discovery cover.");
      await changePagePublication(ownerPagePort, pagePublicationPort, owner, businessId, { action: "publish", version: nextDraft.version, revision: 2 });
      assert.equal((await runtimePublishedPage(businessId))?.about, "Not published yet");
      process.env.SUQPAGE_OWNER_EDITOR_ENABLED = "0";
      assert.equal(await runtimePublishedPage(businessId), undefined, "Gate-off uses canonical content in the shared renderer.");
      process.env.SUQPAGE_OWNER_EDITOR_ENABLED = "1";
      for (const status of ["draft", "suspended"]) {
        await runner.query("UPDATE businesses SET status=? WHERE id=?", [status, businessId]);
        assert.equal(await runtimePublishedPage(businessId), undefined);
        assert.equal(await pagePublicationPort.commit(owner, nextDraft, 3, nextDraft.content, "publish"), null);
      }
      await runner.query("UPDATE businesses SET status='active' WHERE id=?", [businessId]);
      assert.deepEqual(await runtimeCatalogByBusinessId(businessId, true), before, "Publish and restore preserve products, contacts, handle, design and approval fields.");
      // Exercise read compatibility without a destructive migration or a new live design.
      await runner.query("UPDATE owner_page_drafts SET content_json=? WHERE business_id=?", [JSON.stringify({ template: "shop-v1", layout: "catalog", title: "Old title", introduction: "Old intro", about: "Old about", heroImage: "" }), businessId]);
      assert.equal((await ownerPagePort.read(businessId))?.content.introduction, "Old intro");
      const permissions = (await runner.query<{ blocked: boolean }>(`SELECT NOT (
        has_table_privilege('anon','owner_page_drafts','SELECT') OR
        has_table_privilege('authenticated','owner_page_drafts','UPDATE') OR
        has_table_privilege('authenticated','owner_page_events','SELECT') OR
        has_table_privilege('anon','owner_page_publications','SELECT') OR
        has_table_privilege('authenticated','owner_page_publications','INSERT')
      ) AS blocked`)).rows[0];
      assert.equal(permissions.blocked, true, "Supabase public API roles cannot access private page drafts.");
      throw rollback;
    });
  } catch (error) { if (error !== rollback) throw error; }
  finally { await closePostgresRuntimeForTests(); }
  console.log("PASS: local PostgreSQL drafts, owner publication/restore, version conflicts, inactive-business denial, gate rollback, unchanged catalog and public API denial. Test writes rolled back.");
}
main().catch((error: unknown) => {
  console.error("Owner page PostgreSQL verification failed.", error instanceof Error ? error.name : "Unknown failure");
  if (error && typeof error === "object" && "code" in error) console.error("Database error code:", String(error.code));
  if (error instanceof Error) console.error(error.stack?.split("\n").filter((line) => line.trim().startsWith("at ")).slice(0, 3).join("\n"));
  process.exitCode = 1;
});
