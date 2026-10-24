import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import sharp from "sharp";
import { chromium, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createUiText, languageNames } from "../lib/i18n/core.ts";

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
let chosenHandle = `mobile-review-${crypto.randomUUID().slice(0, 8)}`;
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
let home;
let handle;
const browser = await chromium.launch();
const errors = [];
const checks = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route("https://tile.openstreetmap.org/**", r => r.abort());
  const page = await context.newPage();
  page.on("response", async response => {
    if (response.status() >= 400 && response.url().startsWith(api + "owner/"))
      fs.writeFileSync(out + "/owner-failure.json", JSON.stringify({ path: new URL(response.url()).pathname, status: response.status(), response: await response.json().catch(() => null) }, null, 2), { mode: 0o600 });
  });
  let locale = "en";
  let t = createUiText({});
  async function selectLanguage(next) {
    await page.getByRole("button", { name: t("Language"), exact: true }).click();
    await page.getByRole("radio", { name: languageNames[next], exact: true }).click();
    locale = next;
    t = createUiText(next === "en" ? {} : JSON.parse(fs.readFileSync(`lib/i18n/messages/${next}.json`, "utf8")));
    if(await page.getByRole("button", { name: t("Close"), exact: true }).last().isVisible()) await page.getByRole("button", { name: t("Close"), exact: true }).last().click();
  }
  async function localizedCapture(state) {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${state}/${locale}: no overflow`);
    await page.screenshot({ path: `${out}/${state}-${locale}-phone.png` });
  }
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(web + "/account");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await expect(page.getByLabel("Verification code", { exact: true })).toBeVisible({ timeout: 30000 });
  const login = await admin.auth.admin.generateLink({ type: "magiclink", email });
  assert.equal(login.error, null);
  await page.getByLabel("Verification code", { exact: true }).fill(login.data.properties.email_otp);
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(page.getByRole("button", { name: "Create your business page", exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Create your business page", exact: true }).click();
  for (const next of ["en", "am", "om", "so", "ti"]) {
    if (next !== locale) await selectLanguage(next);
    await expect(page.getByLabel(t("Your name"), { exact: true })).toBeVisible();
    await expect(page.getByLabel(t("Account phone"), { exact: true })).toBeVisible();
    await expect(page.getByLabel(t("Business name"), { exact: true })).toBeVisible();
    await expect(page.getByLabel(t("Page handle"), { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: t("Create your business page"), exact: true })).toBeDisabled();
    await localizedCapture("essential-setup");
  }
  await selectLanguage("en");
  await page.getByLabel("Your name", { exact: true }).fill("Mobile Audit Owner");
  await page.getByLabel("Account phone", { exact: true }).fill("+251911000123");
  await page.getByLabel("Business name", { exact: true }).fill("Mobile Workflow Audit");
  await page.getByRole("button", { name: "Farms, livestock & feed", exact: true }).click();
  await page.getByRole("button", { name: "I agree to the Terms and Privacy Policy", exact: true }).click();
  const address = page.getByLabel("Page handle", {exact: true});
  const create = page.getByRole("button", {name: "Create your business page", exact: true});
  await address.fill("a/b"); await expect(page.getByText("Use 3–60 English letters, numbers or hyphens.", {exact:true})).toBeVisible(); await expect(create).toBeDisabled();
  await address.fill("demo-nile-sensor-studio"); await expect(page.getByText("This handle is already taken. Choose another.", {exact:true})).toBeVisible(); await expect(create).toBeDisabled();
  const handlePattern = "**/api/mobile/v1/handles?*";
  await page.route(handlePattern, route => route.fulfill({status:503,json:{error:"Unavailable"}}));
  await address.fill(chosenHandle); await expect(page.getByText("Could not check this handle. Try again.", {exact:true})).toBeVisible(); await expect(create).toBeDisabled();
  await page.unroute(handlePattern); await page.getByRole("button", {name:"Retry",exact:true}).click(); await expect(page.getByText("Available", {exact:true})).toBeVisible();
  let release; const held = new Promise(resolve => {release=resolve;});
  await page.route(handlePattern, async route => { if (new URL(route.request().url()).searchParams.get("handle") === "delayed-mobile-check") {await held; try {await route.fulfill({json:{handle:"delayed-mobile-check",available:true}});} catch {}} else await route.continue(); });
  const delayed = page.waitForRequest(r => r.url().includes("handle=delayed-mobile-check"));
  await address.fill("delayed-mobile-check"); await delayed;
  await address.fill("demo-nile-sensor-studio"); await expect(page.getByText("This handle is already taken. Choose another.", {exact:true})).toBeVisible(); release(); await expect(create).toBeDisabled();
  await page.unroute(handlePattern); await address.fill(chosenHandle); await expect(page.getByText("Available", {exact:true})).toBeVisible();
  let conflict = false;
  await page.route(handlePattern, route => conflict && new URL(route.request().url()).searchParams.get("handle") === chosenHandle ? route.fulfill({json:{handle:chosenHandle,available:false}}) : route.continue());
  await page.route("**/api/mobile/v1/signup", route => {conflict=true; return route.fulfill({status:409,json:{error:"This handle is already taken. Choose another."}});});
  await create.click(); await expect(page.getByText("This handle is already taken. Choose another.", {exact:true}).first()).toBeVisible(); await expect(create).toBeDisabled();
  await expect(page.getByLabel("Business name", {exact:true})).toHaveValue("Mobile Workflow Audit");
  await page.unroute("**/api/mobile/v1/signup"); await page.unroute(handlePattern);
  chosenHandle += "-store"; await address.fill(chosenHandle); await expect(page.getByText("Available", {exact:true})).toBeVisible();
  await page.screenshot({path:out+"/chosen-handle-phone.png"});
  await create.click();
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeVisible({ timeout: 30000 });
  home = await call("owner/home");
  handle = home.shop.handle;
  assert.equal(home.shop.status, "draft");
  assert.equal(home.shop.handle, chosenHandle);
  await expect(page.getByRole("button", {name:"Save changes",exact:true})).toHaveCount(0);
  await expect(page.getByRole("button", {name:"Page color",exact:true})).toHaveCount(0);
  assert.equal(home.shop.products.length, 3);
  assert.ok(home.shop.cover && home.shop.videoUrl && home.shop.contacts.website);
  await expect(page.getByLabel("About the business", { exact: true })).toHaveCount(0);
  await expect(page.getByText(home.shop.name, { exact: true })).toBeVisible();
  for (const item of home.shop.products)
    await expect(page.getByRole("button", { name: item.name, exact: true })).toBeVisible();
  assert.equal((await fetch(api + "shops/" + handle)).status, 404);
  await page.screenshot({ path: out + "/initial-starter-preview-phone.png" });
  for (const next of ["en", "am", "om", "so", "ti"]) {
    if (next !== locale) await selectLanguage(next);
    await expect(page.getByRole("button", { name: t("Edit"), exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: t("Page color"), exact: true })).toHaveCount(0);
    await expect(page.getByText(home.shop.name, { exact: true })).toBeVisible();
    for (const item of home.shop.products)
      await expect(page.getByRole("button", { name: item.name, exact: true })).toBeVisible();
    await localizedCapture("initial-starter-preview");
  }
  await selectLanguage("en");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByLabel("About the business", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Page handle", {exact:true})).toHaveValue(chosenHandle);
  const renamedHandle = chosenHandle + "-shop";
  await page.getByLabel("Page handle", {exact:true}).fill(renamedHandle);
  await expect(page.getByText("Available", {exact:true})).toBeVisible();
  await page.getByRole("button", {name:"Save handle",exact:true}).click();
  await expect(page.getByRole("button", {name:"Contact support",exact:true})).toBeVisible();
  assert.equal((await call("owner/home")).shop.handle, renamedHandle); handle = renamedHandle;
  await expect(page.getByLabel("Page handle", {exact:true})).toHaveCount(0);
  await page.screenshot({path:out+"/page-handle-cooldown-phone.png"});
  checks.push("chosen handle checks invalid/taken/failure/stale paths; Page rename persists and exposes cooldown/support");
  checks.push("real first signup opens complete styled private sample before editing; setup and preview work in all five languages with merchant values unchanged");
  // Navigation preserves the browser-preview's intentionally memory-only session.
  async function owner(label) {
    await page.getByRole("tab", { name: "Overview", exact: true }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
  }
  const about = "Locally tested repairs and crafted goods, available by appointment.";
  await page.getByLabel("About the business", { exact: true }).fill(about);
  for (const label of ["Email", "WhatsApp", "Telegram", "TikTok", "Instagram", "Facebook", "Website"]) {
    const field = page.getByLabel(label, { exact: true });
    // Exercise the same deletion events a person generates in React Native Web.
    await field.press("ControlOrMeta+A");
    await field.press("Backspace");
    await expect(field).toHaveValue("");
  }
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
  const savedContacts = (await call("owner/home")).draft.content.contacts;
  assert.equal(savedContacts.phone, "+251911000123");
  for (const key of ["email", "whatsapp", "telegram", "tiktok", "instagram", "facebook", "website"])
    assert.equal(savedContacts[key], "", `cleared ${key} persists after save`);
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
  await expect(page.getByRole("button", {name:"Edit",exact:true})).toBeVisible();
  await page.screenshot({path:out+"/reentry-private-preview-phone.png"});
  await expect(page.getByLabel("About the business",{exact:true})).not.toBeVisible();
  await page.getByRole("button", {name:"Edit",exact:true}).click();
  await expect(page.getByLabel("Phone", { exact: true }).filter({visible:true})).toHaveValue("+251911000123");
  for (const label of ["Email", "WhatsApp", "Telegram", "TikTok", "Instagram", "Facebook", "Website"])
    await expect(page.getByLabel(label, { exact: true }).filter({visible:true})).toHaveValue("");
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
  try { if (home) await pool.query("UPDATE businesses SET status='draft' WHERE id=$1 AND handle=$2", [home.shop.id, handle]); }
  finally { await pool.end(); await browser.close(); }
}
