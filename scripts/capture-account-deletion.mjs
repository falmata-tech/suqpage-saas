import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { chromium, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createUiText, languageNames } from "../lib/i18n/core.ts";

const directory = ".local/account-deletion-review";
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
const browser = await chromium.launch();
const screenshots = [];
const errors = [];
const web = "http://127.0.0.1:3102";
const native = "http://localhost:8082";
try {
  for (const mobile of [false, true]) {
    for (const [width, locale] of [[390, "en"], [320, "en"], ...(!mobile ? [[1440, "en"]] : []), ...["am", "om", "so", "ti"].map(locale => [320, locale])]) {
      const t = createUiText(locale === "en" ? {} : JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`, "utf8")));
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      if (!mobile) await context.addCookies([{ name: "suqpage-language", value: locale, url: web }]);
      const response = await page.goto((mobile ? native : web) + "/account-deletion");
      assert.equal(response.status(), 200);
      if (mobile && locale !== "en") {
        await page.getByRole("button", { name: "Language", exact: true }).click();
        await page.getByRole("radio", { name: languageNames[locale], exact: true }).click();
        await page.getByRole("button", { name: t("Close"), exact: true }).last().click();
        await expect(page.getByRole("button", { name: t("Close"), exact: true })).toHaveCount(0);
      }
      await expect(page.getByText(t("Delete your Suqpage account"), { exact: true })).toBeVisible();
      const email = page.getByRole(mobile ? "button" : "link", { name: t("Email deletion request"), exact: true });
      await expect(email).toBeVisible();
      await expect(page.getByText("falmata.dawano@gmail.com", { exact: true })).toBeVisible();
      if (!mobile) await expect(email).toHaveAttribute("href", "mailto:falmata.dawano@gmail.com?subject=Suqpage%20account%20deletion%20request");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "No horizontal overflow");
      const name = `${mobile ? "native-browser" : "web"}-${width}-${locale}.png`;
      await page.screenshot({ path: `${directory}/${name}`, fullPage: true, style: "nextjs-portal { visibility: hidden }" });
      screenshots.push(name);
      if (!mobile && locale === "en" && width === 390) {
        await page.goto(web + "/privacy");
        await page.getByRole("link", { name: "Request account deletion", exact: true }).click();
        await expect(page).toHaveURL(web + "/account-deletion");
      }
      await context.close();
    }
  }

  // Only an ephemeral, local Auth identity; no tenant or customer data is created.
  process.loadEnvFile(".local/supabase-runtime.env");
  const provider = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  assert.equal(provider.hostname, "127.0.0.1");
  assert.equal(provider.port, "54321");
  const admin = createClient(provider.origin, process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } });
  const email = `deletion-entry-${crypto.randomUUID()}@example.test`;
  const created = await admin.auth.admin.createUser({ email, email_confirm: true });
  assert.equal(created.error, null);
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(native + "/account");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Send code", exact: true }).click();
    await expect(page.getByLabel("Verification code", { exact: true })).toBeVisible();
    const login = await admin.auth.admin.generateLink({ type: "magiclink", email });
    assert.equal(login.error, null);
    await page.getByLabel("Verification code", { exact: true }).fill(login.data.properties.email_otp);
    await page.getByRole("button", { name: "Verify code", exact: true }).click();
    await expect(page.getByRole("button", { name: "Create your business page", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Delete account", exact: true }).click();
    await expect(page.getByText("Delete your Suqpage account", { exact: true })).toBeVisible();
    await context.close();
  } finally {
    const deleted = await admin.auth.admin.deleteUser(created.data.user.id);
    assert.equal(deleted.error, null);
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${directory}/verification.json`, JSON.stringify({
    passed: true, screenshots,
    checks: ["anonymous web/native access", "five locales", "no horizontal overflow", "visible contact fallback", "privacy navigation", "native account before business setup"],
    limits: ["No real deletion request sent", "No account deletion performed", "Native email handoff needs a physical device"],
  }, null, 2));
  console.log(`PASS deletion-request entry: ${screenshots.length} layouts and local incomplete-setup navigation.`);
} finally {
  await browser.close();
}
