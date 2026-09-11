import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { authDriver, supabaseAuthConfig } from "../lib/config";
import { getDb } from "../lib/db";
import { providerDisplayName } from "../lib/supabase-auth";

function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-auth-runtime-"));
  process.env.MIRTPAGE_DB_PATH = path.join(root, "auth.db");
  process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.MIRTPAGE_AUTH_DRIVER = "local";

  try {
    const db = getDb();
    assert.equal(authDriver(), "local");
    assert.ok(db.prepare("SELECT 1 FROM schema_migrations WHERE version=38").get(), "migration 38 is recorded");
    const user = db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('identity@example.test','hash','Identity Test','admin')").run();
    db.prepare("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase','11111111-1111-4111-8111-111111111111','identity@example.test',?)").run(Number(user.lastInsertRowid), Date.now());
    assert.throws(() => db.prepare("UPDATE auth_identity_links SET provider_user_id='22222222-2222-4222-8222-222222222222' WHERE user_id=?").run(Number(user.lastInsertRowid)), /immutable/);
    process.env.MIRTPAGE_AUTH_DRIVER = "invalid";
    assert.throws(() => authDriver(), /local or supabase/);
    process.env.MIRTPAGE_AUTH_DRIVER = "local";
    process.env.MIRTPAGE_EMAIL_OTP_ENABLED = "1";
    assert.equal(supabaseAuthConfig().requestTimeoutMs, 8000);
    assert.equal(supabaseAuthConfig().emailOtpEnabled, true);
    assert.equal(providerDisplayName({ full_name: "  Aster Bekele  " }), "Aster Bekele");
    assert.equal(providerDisplayName({ display_name: "A\u0000ster" }), "Aster");
    assert.equal(providerDisplayName({ name: "A" }), "");

    const authSource = fs.readFileSync("lib/auth.ts", "utf8");
    const providerSource = fs.readFileSync("lib/supabase-auth.ts", "utf8");
    const migrationSource = fs.readFileSync("scripts/migrate-supabase-auth.ts", "utf8");
    const preflightSource = fs.readFileSync("scripts/preflight.ts", "utf8");
    const otpStartSource = fs.readFileSync("app/api/auth/email/start/route.ts", "utf8");
    const otpVerifySource = fs.readFileSync("app/api/auth/email/verify/route.ts", "utf8");
    const signupRouteSource = fs.readFileSync("app/api/signup/route.ts", "utf8");
    const supabaseConfigSource = fs.readFileSync("supabase/config.toml", "utf8");
    const emailOtpTemplate = fs.readFileSync("supabase/templates/magic-link.html", "utf8");
    assert.match(authSource, /currentSupabaseIdentity/);
    assert.match(providerSource, /auth_identity_links/);
    assert.match(providerSource, /signInWithOtp/);
    assert.match(providerSource, /verifyOtp/);
    assert.match(providerSource, /currentSupabaseProviderIdentity/);
    assert.match(otpStartSource, /assertSameOrigin/);
    assert.match(otpStartSource, /otp:start:email:/);
    assert.match(otpVerifySource, /\^\\d\{6\}\$/);
    assert.match(supabaseConfigSource, /\[auth\.email\.template\.magic_link\][\s\S]*?subject = "Your AfricMade sign-in code"[\s\S]*?content_path = "\.\/supabase\/templates\/magic-link\.html"/);
    assert.match(supabaseConfigSource, /\[auth\.email\.template\.confirmation\][\s\S]*?subject = "Your AfricMade sign-in code"[\s\S]*?content_path = "\.\/supabase\/templates\/magic-link\.html"/);
    assert.match(emailOtpTemplate, /\{\{ \.Token \}\}/);
    assert.doesNotMatch(emailOtpTemplate, /ConfirmationURL/);
    assert.match(signupRouteSource, /currentSupabaseProviderIdentity/);
    assert.doesNotMatch(signupRouteSource, /provisionSupabasePasswordIdentity|signInWithSupabasePassword|removePendingSupabaseIdentity/);
    assert.match(migrationSource, /finally[\s\S]*closePostgresRuntimeForTests/);
    assert.match(preflightSource, /finally[\s\S]*closePostgresRuntimeForTests/);
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
