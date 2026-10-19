import assert from "node:assert/strict";
import fs from "node:fs";
import manifest from "../supabase/templates/manifest.json";
import { notifyNewInquiry } from "../lib/notifications";
import type { Business } from "../lib/types";
import { PLATFORM_BRAND } from "../lib/brand";

async function main() {
const config = fs.readFileSync("supabase/config.toml", "utf8");
assert.equal(manifest.length, 13);
assert.equal(new Set(manifest.map(entry => entry.key)).size, 13);
for (const entry of manifest) {
  const html = fs.readFileSync(`supabase/templates/${entry.file}`, "utf8");
  assert.match(html, /MirtPage/);
  assert.doesNotMatch(html + entry.subject, /africmade|africpage|suqpage|<script/i);
  assert.match(entry.subject, /MirtPage/);
  assert.ok(html.includes(`src="{{ .SiteURL }}${PLATFORM_BRAND.assets.emailWordmark}" alt="MirtPage" width="220" height="48"`));
  assert.equal((html.match(/<img\b/g) || []).length, 1, 'One canonical wordmark without external tracking images.');
  const notification = entry.key.endsWith("_notification");
  const section = `auth.email.${notification ? "notification" : "template"}.${entry.key.replace(/_notification$/, "")}`;
  const content = config.split(`[${section}]`)[1]?.split("\n[")[0];
  assert.ok(content, section);
  assert.ok(content.includes(`subject = "${entry.subject}"`));
  assert.ok(content.includes(`content_path = "./supabase/templates/${entry.file}"`));
  if (notification) assert.match(content, /enabled = false/);
  if (["confirmation", "magic_link", "reauthentication"].includes(entry.key)) {
    assert.match(html, /\{\{ \.Token \}\}/);
    assert.doesNotMatch(html, /ConfirmationURL/);
  }
  if (entry.key === "invite") assert.match(html, /\{\{ \.ConfirmationURL \}\}/);
  if (entry.key === "email_change") {
    assert.match(html, /\{\{ \.Token \}\}/, "Each mailbox must receive a code for the owner-verified email change.");
    assert.doesNotMatch(html, /ConfirmationURL/, "Email change must not fall back to a one-click confirmation link.");
  }
  if (entry.key === "recovery") {
    assert.match(html, /\{\{ \.SiteURL \}\}\/login/);
    assert.doesNotMatch(html, /ConfirmationURL|Reset password/);
  }
}
const smtp = config.split('\n[auth.email.smtp]\n')[1]?.split('\n[')[0];
assert.ok(smtp?.includes('sender_name = "MirtPage"'));
assert.ok(smtp.includes('user = "suqpage-local"') && smtp.includes('admin_email = "no-reply@suqpage.test"'), 'Display-only branding preserves local SMTP technical identities.');
assert.ok(fs.existsSync('public' + PLATFORM_BRAND.assets.emailWordmark));
const before = { key: process.env.RESEND_API_KEY, from: process.env.NOTIFICATION_FROM_EMAIL };
try {
  process.env.RESEND_API_KEY = "fixture-not-a-provider-key";
  const business = { name: "Customer business", contact_email: "owner@example.test" } as Business;
  for (const from of ["verified@example.test", "Retired brand <verified@example.test>"]) {
    process.env.NOTIFICATION_FROM_EMAIL = from;
    let calls = 0;
    assert.equal(await notifyNewInquiry(business, 2, "Customer", { send: async (_url, init) => {
      calls++;
      const email = JSON.parse(String(init?.body));
      assert.equal(email.from, "Suqpage <verified@example.test>");
      assert.equal(email.subject, "New Suqpage inquiry #2");
      assert.deepEqual(email.to, [business.contact_email]);
      return new Response(null, { status: 202 });
    }}), "sent");
    assert.equal(calls, 1);
  }
  process.env.NOTIFICATION_FROM_EMAIL = "verified@example.test\r\nBcc: another@example.test";
  assert.equal(await notifyNewInquiry(business, 2, "Customer", { send: async () => { throw Error("Invalid sender must not send"); } }), "skipped");
} finally {
  for (const [key, value] of [["RESEND_API_KEY", before.key], ["NOTIFICATION_FROM_EMAIL", before.from]]) {
    if (value === undefined) delete process.env[key!]; else process.env[key!] = value;
  }
}
console.log("PASS 13 branded email types, OTP/link semantics, disabled notification defaults and verified sender preservation; no real email sent.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
