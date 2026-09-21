import assert from "node:assert/strict";
import fs from "node:fs";
import manifest from "../supabase/templates/manifest.json";
import { notifyNewInquiry } from "../lib/notifications";
import type { Business } from "../lib/types";

async function main() {
const config = fs.readFileSync("supabase/config.toml", "utf8");
assert.equal(manifest.length, 13);
assert.equal(new Set(manifest.map(entry => entry.key)).size, 13);
for (const entry of manifest) {
  const html = fs.readFileSync(`supabase/templates/${entry.file}`, "utf8");
  assert.match(html, /Suqpage/);
  assert.doesNotMatch(html + entry.subject, /africmade|africpage|mirtpage|<script/i);
  assert.match(entry.subject, /Suqpage/);
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
  if (["invite", "email_change"].includes(entry.key)) assert.match(html, /\{\{ \.ConfirmationURL \}\}/);
  if (entry.key === "recovery") {
    assert.match(html, /\{\{ \.SiteURL \}\}\/login/);
    assert.doesNotMatch(html, /ConfirmationURL|Reset password/);
  }
}
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
