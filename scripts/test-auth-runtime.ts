import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { authDriver, supabaseAuthConfig } from "../lib/config";
import { getDb } from "../lib/db";

function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-auth-runtime-"));
  process.env.MIRTPAGE_DB_PATH = path.join(root, "auth.db");
  process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.MIRTPAGE_AUTH_DRIVER = "local";

  try {
    const db = getDb();
    assert.equal(authDriver(), "local");
    assert.ok(db.prepare("SELECT 1 FROM schema_migrations WHERE version=37").get(), "migration 37 is recorded");
    const user = db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('identity@example.test','hash','Identity Test','admin')").run();
    db.prepare("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase','11111111-1111-4111-8111-111111111111','identity@example.test',?)").run(Number(user.lastInsertRowid), Date.now());
    assert.throws(() => db.prepare("UPDATE auth_identity_links SET provider_user_id='22222222-2222-4222-8222-222222222222' WHERE user_id=?").run(Number(user.lastInsertRowid)), /immutable/);
    process.env.MIRTPAGE_AUTH_DRIVER = "invalid";
    assert.throws(() => authDriver(), /local or supabase/);
    process.env.MIRTPAGE_AUTH_DRIVER = "local";
    assert.equal(supabaseAuthConfig().requestTimeoutMs, 8000);

    const authSource = fs.readFileSync("lib/auth.ts", "utf8");
    const providerSource = fs.readFileSync("lib/supabase-auth.ts", "utf8");
    assert.match(authSource, /currentSupabaseIdentity/);
    assert.match(providerSource, /auth_identity_links/);
    assert.doesNotMatch(providerSource, /user_metadata.*access_role|user_metadata.*business_id/);

    db.close();
    console.log("Selectable Supabase identity-link and local rollback contracts passed.");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

try { main(); }
catch (error) {
  console.error(error instanceof Error ? error.message : "Auth runtime test failed.");
  process.exitCode = 1;
}
