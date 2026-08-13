import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const databasePath = path.resolve(process.env.MIRTPAGE_DB_PATH || "data/mirtpage.db");
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-pwa-shell");
fs.mkdirSync(output, { recursive: true });

const db = new DatabaseSync(databasePath);
const admin = db.prepare(`
  SELECT u.id,u.must_change_password
  FROM users u JOIN user_access_profiles p ON p.user_id=u.id
  WHERE p.access_role='platform_admin'
  ORDER BY u.id LIMIT 1
`).get();
const showroom = db.prepare(`
  SELECT handle FROM businesses
  WHERE status='active' AND design_manifest_json!='' AND content_blocks_json!=''
  ORDER BY id LIMIT 1
`).get();
assert.ok(admin, "PWA shell capture requires a platform administrator");
assert.ok(showroom, "PWA shell capture requires an active composed showroom");

const token = crypto.randomBytes(32).toString("base64url");
const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
const now = Date.now();
db.prepare("UPDATE users SET must_change_password=0 WHERE id=?").run(admin.id);
db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?)")
  .run(tokenHash, admin.id, now + 10 * 60 * 1000, now, now);

async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${label} has horizontal overflow`);
}

async function cleanPage(browser, viewport, authenticated = false) {
  const context = await browser.newContext({ viewport });
  if (authenticated) await context.addCookies([{ name: "mirtpage_session", value: token, url: baseURL, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  return { context, page, errors };
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.MIRTPAGE_PLAYWRIGHT_EXECUTABLE_PATH || undefined,
});
try {
  const desktop = await cleanPage(browser, { width: 1440, height: 1000 });
  await desktop.page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await desktop.page.getByRole("heading", { name: "Find Ethiopian makers and producers." }).waitFor();
  await desktop.page.locator("link[rel='manifest']").waitFor({ state: "attached" });
  assert.equal(await desktop.page.locator(".public-app-header").isVisible(), true);
  assert.equal(await desktop.page.locator(".public-app-rail").isVisible(), true);
  assert.equal(await desktop.page.locator(".public-mobile-tabs").isVisible(), false);
  await noOverflow(desktop.page, "desktop public shell");
  await desktop.page.screenshot({ path: path.join(output, "home-1440.png"), caret: "initial" });
  assert.deepEqual(desktop.errors, []);
  await desktop.context.close();

  const phone = await cleanPage(browser, { width: 390, height: 844 });
  await phone.page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await phone.page.getByRole("heading", { name: "Find Ethiopian makers and producers." }).waitFor();
  assert.equal(await phone.page.locator(".public-app-header").isVisible(), false);
  assert.equal(await phone.page.locator(".public-app-rail").isVisible(), false);
  const publicTabs = phone.page.getByRole("navigation", { name: "MirtPage application navigation" });
  await publicTabs.waitFor();
  assert.equal(await publicTabs.locator(":scope > a").count(), 3);
  assert.equal(await publicTabs.locator(":scope > button").count(), 1);
  assert.equal(await publicTabs.locator(":scope > a, :scope > button").evaluateAll((targets) => targets.every((target) => target.getBoundingClientRect().height >= 44)), true);
  const phoneTabBox = await publicTabs.boundingBox();
  assert.ok(phoneTabBox && Math.abs(phoneTabBox.y + phoneTabBox.height - 844) <= 1, "public tabs sit on the phone safe-area edge");
  await noOverflow(phone.page, "390px public shell");
  await phone.page.screenshot({ path: path.join(output, "home-390.png"), caret: "initial" });
  assert.deepEqual(phone.errors, []);
  await phone.context.close();

  const narrowPhone = await cleanPage(browser, { width: 320, height: 720 });
  await narrowPhone.page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await narrowPhone.page.getByRole("heading", { name: "Find Ethiopian makers and producers." }).waitFor();
  assert.equal(await narrowPhone.page.locator(".public-app-header").isVisible(), false);
  assert.equal(await narrowPhone.page.locator(".public-app-rail").isVisible(), false);
  const narrowTabs = narrowPhone.page.getByRole("navigation", { name: "MirtPage application navigation" });
  await narrowTabs.waitFor();
  assert.equal(await narrowTabs.locator(":scope > a").count(), 3);
  assert.equal(await narrowTabs.locator(":scope > button").count(), 1);
  assert.equal(await narrowTabs.locator(":scope > a, :scope > button").evaluateAll((targets) => targets.every((target) => target.getBoundingClientRect().height >= 44)), true);
  const narrowTabBox = await narrowTabs.boundingBox();
  assert.ok(narrowTabBox && Math.abs(narrowTabBox.y + narrowTabBox.height - 720) <= 1, "public tabs sit on the narrow phone safe-area edge");
  await noOverflow(narrowPhone.page, "320px public shell");
  await narrowPhone.page.screenshot({ path: path.join(output, "home-320.png"), caret: "initial" });
  assert.deepEqual(narrowPhone.errors, []);
  await narrowPhone.context.close();

  const login = await cleanPage(browser, { width: 390, height: 844 });
  await login.page.goto(`${baseURL}/login`, { waitUntil: "domcontentloaded" });
  await login.page.getByRole("heading", { name: "Welcome back to MirtPage." }).waitFor();
  assert.equal(await login.page.locator(".landing-header").isVisible(), false);
  assert.equal(await login.page.getByRole("navigation", { name: "MirtPage application navigation" }).isVisible(), true);
  await noOverflow(login.page, "390px login shell");
  await login.page.screenshot({ path: path.join(output, "login-390.png"), caret: "initial" });
  assert.deepEqual(login.errors, []);
  await login.context.close();

  const hosted = await cleanPage(browser, { width: 390, height: 844 });
  await hosted.page.goto(`${baseURL}/@${showroom.handle}`, { waitUntil: "domcontentloaded" });
  await hosted.page.getByRole("navigation", { name: "MirtPage showroom host navigation" }).waitFor();
  assert.equal(await hosted.page.getByRole("navigation", { name: "MirtPage showroom host navigation" }).isVisible(), true);
  const showroomFooter = hosted.page.locator('[data-slot="footer"]');
  if (await showroomFooter.count()) assert.equal(await showroomFooter.isVisible(), false);
  await noOverflow(hosted.page, "390px hosted showroom shell");
  await hosted.page.screenshot({ path: path.join(output, "showroom-390.png"), caret: "initial" });
  assert.deepEqual(hosted.errors, []);
  await hosted.context.close();

  const workspace = await cleanPage(browser, { width: 390, height: 844 }, true);
  await workspace.page.goto(`${baseURL}/dashboard/admin`, { waitUntil: "domcontentloaded" });
  await workspace.page.locator("main").waitFor();
  assert.equal(await workspace.page.locator(".workspace-mobile-header").count(), 0);
  const workspaceTabs = workspace.page.getByRole("navigation", { name: "Workspace application navigation" });
  await workspaceTabs.waitFor();
  assert.equal(await workspaceTabs.locator("a").count(), 4);
  assert.equal(await workspaceTabs.locator("a,button").evaluateAll((targets) => targets.every((target) => target.getBoundingClientRect().height >= 44)), true);
  await workspace.page.getByRole("button", { name: "Open all workspace navigation" }).click();
  const drawer = workspace.page.getByRole("dialog", { name: "Workspace menu" });
  await drawer.waitFor();
  const drawerBox = await drawer.boundingBox();
  assert.ok(drawerBox && Math.abs(drawerBox.y + drawerBox.height - 844) <= 1, "workspace More menu opens as a bottom sheet");
  await noOverflow(workspace.page, "390px authenticated shell");
  await workspace.page.screenshot({ path: path.join(output, "workspace-more-390.png"), caret: "initial" });
  assert.deepEqual(workspace.errors, []);
  await workspace.context.close();

  console.log(`PWA shell visuals passed: ${output}`);
} finally {
  await browser.close();
  db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash);
  db.prepare("UPDATE users SET must_change_password=? WHERE id=?").run(admin.must_change_password, admin.id);
  db.close();
}
