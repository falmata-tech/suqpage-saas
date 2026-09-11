import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-signup-"));
process.env.MIRTPAGE_DB_PATH = path.join(root, "signup.db");
process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");

async function main() {
try {
  const { closeDbForTests, getDb } = await import("../lib/db");
  const { createPublicClientWorkspace, parseSignupInput, SignupError } = await import("../lib/signup");
  const { getDiscoveryView } = await import("../lib/discovery");
  const valid = {
    name: "Aster Bekele",
    phone: "+251911234567",
    businessName: "Aster Food Studio",
    businessCategory: "food-farming",
    idempotencyKey: "signup-test-key-0001",
    consent: true,
  };
  const identity = { providerUserId: "11111111-1111-4111-8111-111111111111", email: "aster@example.test" };

  const created = await createPublicClientWorkspace(valid, identity);
  const db = getDb();
  assert.equal(created.businessId > 0 && created.userId > 0, true);
  assert.deepEqual({ ...(db.prepare("SELECT handle,name,status,contact_email,whatsapp FROM businesses WHERE id=?").get(created.businessId) as object) }, {
    handle: (db.prepare("SELECT handle FROM businesses WHERE id=?").get(created.businessId) as { handle: string }).handle,
    name: "Aster Food Studio",
    status: "draft",
    contact_email: "aster@example.test",
    whatsapp: "+251911234567",
  });
  assert.match((db.prepare("SELECT handle FROM businesses WHERE id=?").get(created.businessId) as { handle: string }).handle, /^aster-food-studio-[a-f0-9]{12}$/);
  assert.deepEqual({ ...(db.prepare("SELECT role,business_id,must_change_password FROM users WHERE id=?").get(created.userId) as object) }, {
    role: "owner",
    business_id: created.businessId,
    must_change_password: 0,
  });
  assert.deepEqual({ ...(db.prepare("SELECT provider,provider_user_id,email_at_link FROM auth_identity_links WHERE user_id=?").get(created.userId) as object) }, {
    provider: "supabase",
    provider_user_id: identity.providerUserId,
    email_at_link: identity.email,
  });
  assert.equal((db.prepare("SELECT access_role FROM user_access_profiles WHERE user_id=?").get(created.userId) as { access_role: string }).access_role, "client");
  assert.deepEqual({ ...(db.prepare("SELECT business_id,declared_category_key,idempotency_key FROM business_onboarding_profiles WHERE business_id=?").get(created.businessId) as object) }, {
    business_id: created.businessId,
    declared_category_key: "food-farming",
    idempotency_key: valid.idempotencyKey,
  });
  assert.equal((db.prepare("SELECT COUNT(*) count FROM service_requests WHERE business_id=?").get(created.businessId) as { count: number }).count, 0, "account setup does not create a page project");
  assert.equal((db.prepare("SELECT COUNT(*) count FROM business_industries WHERE business_id=?").get(created.businessId) as { count: number }).count, 0, "private category does not publish discovery classification");
  assert.equal((await getDiscoveryView({ db, industry: "food-farming" })).total, 0, "a self-created draft is never public");

  const counts = () => ({
    businesses: Number((db.prepare("SELECT COUNT(*) count FROM businesses").get() as { count: number }).count),
    users: Number((db.prepare("SELECT COUNT(*) count FROM users").get() as { count: number }).count),
    requests: Number((db.prepare("SELECT COUNT(*) count FROM service_requests").get() as { count: number }).count),
    onboardingProfiles: Number((db.prepare("SELECT COUNT(*) count FROM business_onboarding_profiles").get() as { count: number }).count),
  });
  const beforeConflict = counts();
  await assert.rejects(
    () => createPublicClientWorkspace({ ...valid, idempotencyKey: "signup-test-key-0002" }, identity),
    (error: unknown) => error instanceof SignupError && error.status === 409 && error.code === "already_linked",
  );
  assert.deepEqual(counts(), beforeConflict, "duplicate provider identity creates no partial tenant state");
  await assert.rejects(
    () => createPublicClientWorkspace({ ...valid, idempotencyKey: "signup-test-key-0003" }, { providerUserId: "22222222-2222-4222-8222-222222222222", email: identity.email }),
    (error: unknown) => error instanceof SignupError && error.status === 409 && error.code === "email_conflict",
  );
  assert.deepEqual(counts(), beforeConflict, "duplicate verified email creates no partial tenant state");
  const parsed = parseSignupInput({ ...valid, email: "forged@example.test", handle: "forged", password: "forged" }, { providerUserId: "33333333-3333-4333-8333-333333333333", email: "verified@example.test" });
  assert.equal(parsed.email, "verified@example.test");
  assert.notEqual(parsed.handle, "forged");
  assert.throws(
    () => parseSignupInput(valid, { providerUserId: "bad", email: "bad" }),
    SignupError,
  );

  console.log("Private account bootstrap, category privacy, atomicity, and conflict tests passed.");
  closeDbForTests();
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
}

main();
