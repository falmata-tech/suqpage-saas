import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "@playwright/test";
import pg from "pg";

process.loadEnvFile(".local/supabase-runtime.env");

const baseURL = "http://127.0.0.1:3000";
const credentialRows = fs
  .readFileSync(".local/seed-credentials.txt", "utf8")
  .split(/\r?\n/)
  .map((line) => line.split(" | "))
  .filter((parts) => parts.length === 4)
  .map((parts) => ({ email: parts[2], password: parts[3] }));
const passwordByEmail = new Map(credentialRows.map((row) => [row.email, row.password]));

const client = new pg.Client({ connectionString: process.env.MIRTPAGE_POSTGRES_URL });
await client.connect();
const identities = await client.query(`
  SELECT u.email, u.business_id, p.access_role
  FROM users u
  JOIN user_access_profiles p ON p.user_id=u.id
  WHERE u.must_change_password=0
    AND p.access_role IN ('platform_admin','client')
  ORDER BY CASE p.access_role WHEN 'platform_admin' THEN 0 ELSE 1 END
`);
const admin = identities.rows.find((row) => row.access_role === "platform_admin");
const owner = identities.rows.find((row) => row.access_role === "client");
assert.ok(admin && owner?.business_id, "Local smoke requires retained admin and client identities.");
assert.ok(passwordByEmail.has(admin.email) && passwordByEmail.has(owner.email), "Local smoke credentials are unavailable.");
const revision = await client.query(`
  SELECT cr.id revision_id, cr.request_id, cr.business_id
  FROM content_revisions cr
  ORDER BY cr.id DESC
  LIMIT 1
`);
await client.end();
assert.ok(revision.rows[0], "Local smoke requires a retained showroom revision.");

async function signIn(page, identity) {
  await page.goto(`${baseURL}/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(identity.email);
  await page.getByLabel("Password").fill(passwordByEmail.get(identity.email));
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard(?:\?|$)/);
}

const browser = await chromium.launch({ headless: true });
try {
  const clientContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const clientPage = await clientContext.newPage();
  await signIn(clientPage, owner);
  await clientPage.getByRole("main").getByText("Business workspace", { exact: true }).waitFor();
  await clientPage.getByText("Project history", { exact: true }).waitFor();
  await clientContext.close();

  const adminContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const adminPage = await adminContext.newPage();
  await signIn(adminPage, admin);
  await adminPage.goto(`${baseURL}/dashboard?business=${revision.rows[0].business_id}`, { waitUntil: "networkidle" });
  await adminPage.getByRole("main").getByText("Business workspace", { exact: true }).waitFor();
  await adminPage.goto(`${baseURL}/dashboard/requests?business=${revision.rows[0].business_id}`, { waitUntil: "networkidle" });
  await adminPage.getByRole("heading", { name: "Showroom project" }).waitFor();
  await adminPage.goto(
    `${baseURL}/dashboard/requests/${revision.rows[0].request_id}/revisions/${revision.rows[0].revision_id}/preview`,
    { waitUntil: "networkidle" },
  );
  await adminPage.getByRole("heading", { name: /Revision \d+ private preview/ }).waitFor();
  await adminContext.close();

  console.log("Local Supabase password login, client workspace, administrator business context, project history, and revision preview passed.");
} finally {
  await browser.close();
}
