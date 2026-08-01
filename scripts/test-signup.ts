import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-signup-"));
process.env.SUQPAGE_DB_PATH = path.join(root, "signup.db");
process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");

async function main() {
try {
  const { closeDbForTests, getDb } = await import("../lib/db");
  const { createPublicClientWorkspace, parseSignupInput, SignupError } = await import("../lib/signup");
  const { getDiscoveryView } = await import("../lib/discovery");
  const valid = {
    name: "Aster Bekele",
    email: "aster@example.test",
    phone: "+251911234567",
    businessName: "Aster Food Studio",
    handle: "Aster Food Studio",
    password: "StrongPassword12",
    confirmPassword: "StrongPassword12",
    requestText: "We make shelf-stable pepper sauces and need a clear product-led showroom.",
    idempotencyKey: "signup-test-key-0001",
    consent: true,
  };

  const created = createPublicClientWorkspace(valid);
  const db = getDb();
  assert.equal(created.businessId > 0 && created.userId > 0 && created.requestId > 0, true);
  assert.deepEqual({ ...(db.prepare("SELECT handle,name,status,contact_email,whatsapp FROM businesses WHERE id=?").get(created.businessId) as object) }, {
    handle: "aster-food-studio",
    name: "Aster Food Studio",
    status: "draft",
    contact_email: "aster@example.test",
    whatsapp: "+251911234567",
  });
  assert.deepEqual({ ...(db.prepare("SELECT role,business_id,must_change_password FROM users WHERE id=?").get(created.userId) as object) }, {
    role: "owner",
    business_id: created.businessId,
    must_change_password: 0,
  });
  assert.equal((db.prepare("SELECT access_role FROM user_access_profiles WHERE user_id=?").get(created.userId) as { access_role: string }).access_role, "client");
  assert.deepEqual({ ...(db.prepare("SELECT business_id,represented_client_user_id,request_type,status,submitter_kind,submitted_by_user_id FROM service_requests WHERE id=?").get(created.requestId) as object) }, {
    business_id: created.businessId,
    represented_client_user_id: created.userId,
    request_type: "onboarding",
    status: "submitted",
    submitter_kind: "client",
    submitted_by_user_id: created.userId,
  });
  assert.equal(getDiscoveryView({ db, industry: "food-farming" }).total, 0, "a self-created draft is never public");

  const counts = () => ({
    businesses: Number((db.prepare("SELECT COUNT(*) count FROM businesses").get() as { count: number }).count),
    users: Number((db.prepare("SELECT COUNT(*) count FROM users").get() as { count: number }).count),
    requests: Number((db.prepare("SELECT COUNT(*) count FROM service_requests").get() as { count: number }).count),
  });
  const beforeConflict = counts();
  assert.throws(
    () => createPublicClientWorkspace({ ...valid, handle: "different", idempotencyKey: "signup-test-key-0002" }),
    (error: unknown) => error instanceof SignupError && error.status === 409 && error.code === "email_conflict",
  );
  assert.deepEqual(counts(), beforeConflict, "duplicate email creates no partial tenant state");
  assert.throws(
    () => createPublicClientWorkspace({ ...valid, email: "other@example.test", idempotencyKey: "signup-test-key-0003" }),
    (error: unknown) => error instanceof SignupError && error.status === 409 && error.code === "handle_conflict",
  );
  assert.deepEqual(counts(), beforeConflict, "duplicate handle creates no partial tenant state");
  assert.throws(
    () => parseSignupInput({ ...valid, email: "bad", password: "weak", confirmPassword: "weak" }),
    SignupError,
  );

  console.log("Public client bootstrap atomicity, privacy, and conflict tests passed.");
  closeDbForTests();
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
}

main();
