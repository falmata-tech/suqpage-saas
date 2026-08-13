import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const databasePath = path.resolve(process.env.MIRTPAGE_DB_PATH || "data/mirtpage.db");
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-workspace-navigation");
fs.mkdirSync(output, { recursive: true });

const db = new DatabaseSync(databasePath);
const profiles = db.prepare(`
  SELECT u.id,u.must_change_password,p.access_role
  FROM users u JOIN user_access_profiles p ON p.user_id=u.id
  WHERE p.access_role IN ('platform_admin','client')
  ORDER BY CASE p.access_role WHEN 'platform_admin' THEN 0 ELSE 1 END,u.id
`).all();
const admin = profiles.find((profile) => profile.access_role === "platform_admin");
const client = profiles.find((profile) => profile.access_role === "client");
assert.ok(admin && client, "workspace capture requires a platform administrator and client");

function createSession(user) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = Date.now();
  db.prepare("UPDATE users SET must_change_password=0 WHERE id=?").run(user.id);
  db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?)")
    .run(tokenHash, user.id, now + 10 * 60 * 1000, now, now);
  return { token, tokenHash, user };
}

async function contextFor(browser, session, viewport) {
  const context = await browser.newContext({ viewport });
  await context.addCookies([{
    name: "mirtpage_session",
    value: session.token,
    url: baseURL,
    httpOnly: true,
    sameSite: "Lax",
  }]);
  return context;
}

async function assertNoOverflow(page, label) {
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    true,
    `${label} has horizontal overflow`,
  );
}

const sessions = [createSession(admin), createSession(client)];
const browser = await chromium.launch({ headless: true });
try {
  const desktopContext = await contextFor(browser, sessions[0], { width: 1440, height: 1000 });
  const desktop = await desktopContext.newPage();
  await desktop.goto(`${baseURL}/dashboard/admin`, { waitUntil: "networkidle" });
  await desktop.getByRole("heading", { name: /Good (morning|afternoon|evening)/ }).waitFor();
  assert.deepEqual(
    await desktop.locator(".admin-command strong").allTextContents(),
    ["Businesses", "Showroom requests", "Support inbox", "Staff & access", "Featured schedule", "Renewals", "Design library"],
  );
  await assertNoOverflow(desktop, "desktop administrator overview");
  await desktop.screenshot({ path: path.join(output, "admin-overview-1440.png"), fullPage: true });
  await desktopContext.close();

  const adminPhoneContext = await contextFor(browser, sessions[0], { width: 390, height: 844 });
  const adminPhone = await adminPhoneContext.newPage();
  await adminPhone.goto(`${baseURL}/dashboard/admin/staff`, { waitUntil: "networkidle" });
  await adminPhone.getByRole("heading", { name: "Staff & access" }).waitFor();
  assert.equal(await adminPhone.locator(".admin-data-surface thead").isVisible(), false);
  assert.ok(await adminPhone.locator('.admin-data-surface td[data-label="Role"]').count());
  await assertNoOverflow(adminPhone, "390px staff access");
  await adminPhone.screenshot({ path: path.join(output, "staff-access-390.png"), fullPage: true });
  await adminPhoneContext.close();

  const agentPhoneContext = await contextFor(browser, sessions[0], { width: 320, height: 700 });
  const agentPhone = await agentPhoneContext.newPage();
  await agentPhone.goto(`${baseURL}/dashboard/support/agents`, { waitUntil: "networkidle" });
  await agentPhone.getByRole("heading", { name: "Support agents" }).waitFor();
  assert.ok(await agentPhone.locator(".support-agent-list form").count());
  assert.ok((await agentPhone.locator(".support-agent-list form").count()) <= 10);
  await assertNoOverflow(agentPhone, "320px support agents");
  await agentPhone.screenshot({ path: path.join(output, "support-agents-320.png"), fullPage: true });
  await agentPhoneContext.close();

  const clientContext = await contextFor(browser, sessions[1], { width: 390, height: 844 });
  const clientPage = await clientContext.newPage();
  await clientPage.goto(`${baseURL}/dashboard`, { waitUntil: "networkidle" });
  await clientPage.getByRole("main").getByText("Business workspace", { exact: true }).waitFor();
  await clientPage.locator(".client-workspace-actions").getByText("Project history", { exact: true }).waitFor();
  assert.equal(await clientPage.locator(".client-workspace-actions").getByText("Showroom project", { exact: true }).count(), 0);
  await assertNoOverflow(clientPage, "390px business workspace");
  await clientPage.screenshot({ path: path.join(output, "client-workspace-390.png"), fullPage: true });
  await clientPage.getByRole("button", { name: "Open all workspace navigation" }).click();
  const drawer = clientPage.getByRole("dialog", { name: "Workspace menu" });
  await drawer.waitFor();
  await clientPage.getByRole("button", { name: "Close workspace menu" }).waitFor();
  await assertNoOverflow(clientPage, "390px business workspace menu");
  await clientPage.screenshot({ path: path.join(output, "client-menu-390.png") });
  await clientContext.close();

  console.log(`Workspace navigation visuals passed at 1440px, 390px, and 320px: ${output}`);
} finally {
  await browser.close();
  for (const session of sessions) {
    db.prepare("DELETE FROM sessions WHERE token_hash=?").run(session.tokenHash);
    db.prepare("UPDATE users SET must_change_password=? WHERE id=?")
      .run(session.user.must_change_password, session.user.id);
  }
  db.close();
}
