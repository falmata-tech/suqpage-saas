import assert from "node:assert/strict";
import fs from "node:fs";
import pg from "pg";
import { chromium, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".local/supabase-runtime.env");
const provider = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL),
  database = new URL(process.env.SUQPAGE_POSTGRES_URL);
assert.ok(
  ["127.0.0.1", "localhost"].includes(provider.hostname) &&
    provider.port === "54321",
);
assert.ok(
  ["127.0.0.1", "localhost"].includes(database.hostname) &&
    database.port === "54322",
);
const out = ".local/mobile-review";
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
const pool = new pg.Pool({
  connectionString: database.href,
  max: 1,
  options: "-cdefault_transaction_read_only=on",
});
const browser = await chromium.launch();
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  // Automated gestures must not drive the public OSM tile service.
  await context.route('https://tile.openstreetmap.org/**', route => route.fulfill({
    contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=', 'base64'),
  }));
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:8082");
  await expect(
    page.getByText(/results$/, { exact: false }).first(),
  ).toBeVisible({ timeout: 60000 });
  await page.screenshot({ path: out + "/market-phone.png" });
  await page.getByRole("button", { name: "View products", exact: true }).click();
  await page.getByRole("textbox", { name: "Search", exact: true }).fill("gras");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByText("Farm Grass with Dirt", { exact: true }).first(),
  ).toBeVisible({ timeout: 30000 });
  await page.screenshot({ path: out + "/search-phone.png" });
  await page.getByText("Farm Grass with Dirt", { exact: true }).first().click();
  await expect(
    page.getByRole("button", { name: "Add to inquiry list" }),
  ).toBeVisible();
  await page.screenshot({ path: out + "/product-phone.png" });
  await page.getByRole("button", { name: "Add to inquiry list" }).click();
  await expect(page.getByText("Added to inquiry list")).toBeVisible();
  await page.getByRole("button", { name: /View inquiry list/ }).click();
  await expect(
    page.getByRole("button", { name: "Send inquiry on Suqpage" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send inquiry on Suqpage" }).click();
  await expect(page.getByLabel("Phone", { exact: true })).toBeVisible();
  await page.screenshot({ path: out + "/inquiry-phone.png" });
  await page.goto("http://localhost:8082/featured");
  await expect(page.getByText("Daily Featured", { exact: true })).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: out + "/featured-phone.png" });
  await page.goto("http://localhost:8082/buying");
  await expect(page.getByRole("button", { name: "Start chat" })).toBeVisible();
  await page.screenshot({ path: out + "/buying-phone.png" });
  await page.goto("http://localhost:8082/about");
  await page.getByRole("button", { name: "Language", exact: true }).click();
  await page.getByRole("radio", { name: "አማርኛ", exact: true }).click();
  await page.screenshot({ path: out + "/amharic-phone.png" });
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).last().click();
  await page.goto("http://localhost:8082/account");
  const rows = (
    await pool.query(
      "SELECT u.email FROM users u JOIN user_access_profiles p ON p.user_id=u.id JOIN businesses b ON b.id=u.business_id JOIN auth_identity_links a ON a.user_id=u.id WHERE p.access_role='client' AND b.is_demo=1 AND b.status='active' ORDER BY u.id LIMIT 1",
    )
  ).rows;
  assert.ok(rows[0]);
  await page.getByLabel("Email", { exact: true }).fill(rows[0].email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await expect(
    page.getByLabel("Verification code", { exact: true }),
  ).toBeVisible({ timeout: 15000 });
  const admin = createClient(
    provider.origin,
    process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const generated = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: rows[0].email,
  });
  assert.ok(!generated.error && generated.data.properties?.email_otp);
  await page
    .getByLabel("Verification code", { exact: true })
    .fill(generated.data.properties.email_otp);
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Your page", exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await page.screenshot({ path: out + "/owner-dashboard-phone.png" });
  for (const [label, file] of [
    ["Your page", "owner-page-phone"],
    ["Business details", "owner-location-phone"],
    ["Products & services", "owner-products-phone"],
    ["Customer inquiries", "owner-inquiries-phone"],
    ["Support", "owner-support-phone"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    const required = {
      "Your page": page.getByLabel("About the business", {exact:true}),
      "Business details": page.getByLabel("Business name", {exact:true}),
      "Products & services": page.getByRole("button", {name:"Add product or service", exact:true}),
      "Customer inquiries": page.getByText("Customer inquiries", {exact:true}),
      "Support": page.getByLabel("Subject", {exact:true}),
    }[label];
    await expect(required.filter({visible:true})).toBeVisible({timeout:15000});
    await expect(page.getByText("Page not found.", {exact:true})).toHaveCount(0);
    await page.screenshot({ path: out + "/" + file + ".png" });
    await page.goBack();
    await expect(
      page.getByRole("button", { name: "Your page", exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Send code", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("http://localhost:8082");
  await expect(page.getByText(/results$/).first()).toBeVisible();
  await page.screenshot({ path: out + "/market-tablet.png" });
  assert.deepEqual(errors, []);
  console.log(
    "Mobile browser checks passed: search, product, inquiry, featured, buying intake, language, real local OTP verification, owner navigation and sign-out.",
  );
  fs.writeFileSync(
    out + "/browser-results.json",
    JSON.stringify({ passed: true, checks: 13, errors }, null, 2),
  );
} finally {
  await browser.close();
  await pool.end();
}
