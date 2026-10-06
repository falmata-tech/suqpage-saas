import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import sharp from "sharp";
import { chromium, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Local-only, uniquely named disposable owner. Never modify a demo or real owner.
process.loadEnvFile(".local/supabase-runtime.env");
const provider = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
assert.equal(provider.hostname, "127.0.0.1");
assert.equal(provider.port, "54321");
const api = "http://127.0.0.1:3102/api/mobile/v1/";
const web = "http://localhost:8082";
const out = ".local/mobile-owner-review";
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
const admin = createClient(provider.origin, process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const email = `mobile-audit-${crypto.randomUUID()}@example.test`;
const created = await admin.auth.admin.createUser({ email, email_confirm: true });
assert.equal(created.error, null);
const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
assert.equal(link.error, null);
const client = createClient(provider.origin, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const verified = await client.auth.verifyOtp({ type: "magiclink", token_hash: link.data.properties.hashed_token });
assert.equal(verified.error, null);
const token = verified.data.session.access_token;
async function call(path, body) {
  const r = await fetch(api + path, { method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  const data = await r.json();
  assert.equal(r.status, 200, JSON.stringify(data));
  return data;
}
await call("signup", { name: "Mobile Audit Owner", phone: "+251911000123",
  businessName: "Mobile Workflow Audit", businessCategory: "agriculture-growers",
  consent: true, idempotencyKey: crypto.randomUUID() });
let home = await call("owner/home");
const handle = home.shop.handle;
const browser = await chromium.launch();
const errors = [];
const checks = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route("https://tile.openstreetmap.org/**", r => r.abort());
  const page = await context.newPage();
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(web + "/account");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await expect(page.getByLabel("Verification code", { exact: true })).toBeVisible({ timeout: 30000 });
  const login = await admin.auth.admin.generateLink({ type: "magiclink", email });
  assert.equal(login.error, null);
  await page.getByLabel("Verification code", { exact: true }).fill(login.data.properties.email_otp);
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(page.getByRole("button", { name: "Your page", exact: true })).toBeVisible({ timeout: 30000 });
  // Navigation preserves the browser-preview's intentionally memory-only session.
  async function owner(label) {
    await page.getByRole("tab", { name: "Overview", exact: true }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
  }
  await page.getByRole("button", { name: "Your page", exact: true }).click();
  const about = "Locally tested repairs and crafted goods, available by appointment.";
  await page.getByLabel("About the business", { exact: true }).fill(about);
  for (const label of ["Email", "WhatsApp", "Telegram", "TikTok", "Instagram", "Facebook", "Website"])
    await page.getByLabel(label, { exact: true }).fill("");
  await page.getByLabel("Phone", { exact: true }).fill("+251911000123");
  const image = await sharp({ create: { width: 300, height: 300, channels: 3, background: "#e45b17" } }).png().toBuffer();
  async function choosePhoto(button) {
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: button, exact: true }).click();
    await (await chooser).setFiles({ name: "audit-photo.png", mimeType: "image/png", buffer: image });
  }
  await choosePhoto("Cover photo");
  await expect(page.getByText("Photo ready. Save your page to apply it.", { exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByText(about, { exact: true })).toBeVisible();
  await expect(page.getByText("Stay in touch", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open website", exact: true })).toHaveCount(0);
  const first = home.shop.products.find(p => p.published);
  await page.getByRole("button", { name: first.name, exact: true }).click();
  await expect(page.getByText(first.description, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to inquiry list" })).toHaveCount(0);
  await page.getByRole("button", { name: "Back", exact: true }).last().click();
  await page.screenshot({ path: out + "/private-preview-phone.png" });
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByLabel("About the business", { exact: true })).toHaveValue(about);
  assert.notEqual((await call("owner/home")).draft.content.about, about);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Saved", { exact: true }).filter({visible:true})).toBeVisible({ timeout: 30000 });
  assert.equal((await call("owner/home")).draft.content.about, about);
  assert.equal((await fetch(api + "shops/" + handle)).status, 404);
  checks.push("private unsaved preview, gallery, contacts, save and draft privacy");
  await owner("Products & services");
  await page.getByRole("button", { name: "Add product or service", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Audit repair service");
  await page.getByRole("button", { name: "Service", exact: true }).click();
  await page.getByLabel("Description", { exact: true }).fill("Appliance repair booked by appointment.");
  await page.getByLabel("Price in ETB", { exact: true }).fill("125.50");
  await choosePhoto("Add photos");
  await expect(page.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Audit repair service", { exact: true })).toBeVisible({ timeout: 30000 });
  home = await call("owner/home");
  let offering = home.shop.products.find(p => p.name === "Audit repair service");
  assert.equal(offering.kind, "service"); assert.equal(offering.priceMinor, 12550);
  assert.ok(offering.media.some(m => m.kind === "image" && m.ref.includes("product-private-")));
  checks.push("photo-backed service creation and persisted price");
  // Hide starter offerings via UI, then publish only the authored service.
  for (const item of home.shop.products) {
    const card = page.getByText(item.name, { exact: true }).locator("..");
    await card.getByRole("button", { name: "Edit", exact: true }).click();
    if (item.id === offering.id) {
      await page.getByLabel("Name", { exact: true }).fill("Audit repair and servicing");
      await page.getByLabel("Price in ETB", { exact: true }).fill("150");
    } else await page.getByRole("button", { name: "Show on my page", exact: true }).click();
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByRole("button", { name: "Add product or service", exact: true })).toBeVisible({ timeout: 30000 });
  }
  home = await call("owner/home");
  assert.equal(home.shop.products.filter(p => p.published).length, 1);
  offering = home.shop.products.find(p => p.id === offering.id);
  assert.equal(offering.name, "Audit repair and servicing"); assert.equal(offering.priceMinor, 15000);
  checks.push("offering update and hide persist across list reloads");
  await owner("Business details");
  await page.getByLabel("Search a city or town", { exact: true }).fill("Hawassa");
  await page.getByRole("button", { name: /^Hawassa ·/ }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Saved", { exact: true }).filter({visible:true})).toBeVisible({ timeout: 30000 });
  assert.equal((await call("owner/business")).proposal.city, "Hawassa");
  await owner("Your page");
  await page.getByRole("button", { name: "Publish page", exact: true }).click();
  await expect(page.getByRole("button", { name: "Publish page", exact: true })).toHaveCount(0, { timeout: 30000 });
  const published = await fetch(api + "shops/" + handle);
  assert.equal(published.status, 200);
  const shop = await published.json();
  assert.equal(shop.about, about); assert.equal(shop.products.length, 1);
  assert.equal(shop.products[0].id, offering.id);
  checks.push("location confirmation, first publication and public offering visibility");
  await page.screenshot({ path: out + "/saved-page-phone.png" });
  assert.deepEqual(errors, []);
  fs.writeFileSync(out + "/results.json", JSON.stringify({ passed: true, checks }, null, 2));
  console.log("Passed mobile owner browser workflows: " + checks.join("; "));
} finally {
  // Keep the uniquely created local audit workspace private after either outcome.
  // No existing business or hosted account is touched.
  const pg = await import("pg");
  const database = new URL(process.env.SUQPAGE_POSTGRES_URL);
  assert.equal(database.hostname, "127.0.0.1"); assert.equal(database.port, "54322");
  const pool = new pg.default.Pool({ connectionString: database.href });
  try { await pool.query("UPDATE businesses SET status='draft' WHERE id=$1 AND handle=$2", [home.shop.id, handle]); }
  finally { await pool.end(); await browser.close(); }
}
