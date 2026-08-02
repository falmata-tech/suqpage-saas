import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const databasePath = path.resolve(process.env.MIRTPAGE_DB_PATH || "data/mirtpage.db");
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-dashboard-attention");
fs.mkdirSync(output, { recursive: true });

const db = new DatabaseSync(databasePath);
const admin = db.prepare(`
  SELECT u.id,u.must_change_password FROM users u
  JOIN user_access_profiles p ON p.user_id=u.id
  WHERE p.access_role='platform_admin'
  ORDER BY u.id LIMIT 1
`).get();
assert.ok(admin, "a local platform administrator is required for dashboard capture");

const token = crypto.randomBytes(32).toString("base64url");
const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
const now = Date.now();
db.prepare("UPDATE users SET must_change_password=0 WHERE id=?").run(admin.id);
db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?)")
  .run(tokenHash, admin.id, now + 10 * 60 * 1000, now, now);

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  await context.addCookies([{ name: "mirtpage_session", value: token, url: baseURL, httpOnly: true, sameSite: "Lax" }]);
  for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile-390", { width: 390, height: 844 }]]) {
    const page = await context.newPage();
    await page.setViewportSize(viewport);
    await page.goto(`${baseURL}/dashboard`, { waitUntil: "networkidle" });
    const cards = page.locator(".attention-card");
    assert.equal(await cards.count(), 3, `${name} shows account, showroom-request, and support attention`);
    await page.getByRole("heading", { name: "Start with what changed." }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width, `${name} dashboard has no horizontal overflow`);
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
    await page.close();
  }
  console.log(`Dashboard attention visuals passed at desktop and 390px: ${output}`);
} finally {
  await browser.close();
  db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash);
  db.prepare("UPDATE users SET must_change_password=? WHERE id=?").run(admin.must_change_password, admin.id);
  db.close();
}
