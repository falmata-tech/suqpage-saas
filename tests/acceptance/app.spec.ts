import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type AcceptanceProbe = "inquiryByCustomer" | "productStockByName" | "deliveryByAddress";
const readAcceptanceRow = (probe: AcceptanceProbe, value: string) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [path.join(process.cwd(), "scripts/acceptance-db-probe.mjs"), process.env.SUQPAGE_TEST_DB!, probe, value],
      { encoding: "utf8" },
    ),
  ) as Record<string, unknown> | null;

const credentials = fs.readFileSync(process.env.SUQPAGE_TEST_CREDENTIALS!, "utf8");
const passwordFor = (email: string) => {
  const line = credentials.split("\n").find((entry) => entry.includes(`| ${email} |`));
  if (!line) throw new Error(`No seeded credential for ${email}`);
  return line.split("|").at(-1)!.trim();
};
function monitor(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  return errors;
}
async function expectVisibleControlsNamed(page: Page) {
  const unnamed = await page.locator("input:not([type=hidden]), select, textarea").evaluateAll((controls) =>
    controls.flatMap((control) => {
      const element = control as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (element.closest('[aria-hidden="true"]') || element.getClientRects().length === 0) return [];
      const hasName =
        Boolean(element.labels?.length) ||
        Boolean(element.getAttribute("aria-label")) ||
        Boolean(element.getAttribute("aria-labelledby"));
      return hasName ? [] : [`${element.tagName.toLowerCase()}[name="${element.getAttribute("name") || ""}"]`];
    }),
  );
  expect(unnamed).toEqual([]);
}
async function loginAndChangePassword(page: Page, email: string, nextPassword: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(passwordFor(email));
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard\/account\?required=1/);
  await page.getByLabel("Current password").fill(passwordFor(email));
  await page.getByLabel("New password", { exact: true }).fill(nextPassword);
  await page.getByLabel("Confirm new password").fill(nextPassword);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password updated")).toBeVisible();
}

test("public discovery, four showrooms, cart, and persisted inquiry", async ({ page }) => {
  const errors = monitor(page);
  await page.goto("/");
  await expectVisibleControlsNamed(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your products");
  await expect(page.getByText("Search by name or select a category")).toBeVisible();
  await page.getByRole("button", { name: "All businesses" }).click();
  await expect(page.locator(".showroom-card")).toHaveCount(4);
  for (const handle of ["alhayabrand", "usashopet", "novatech", "homevibe"]) {
    await page.goto(`/@${handle}`);
    await expect(page.locator(".showroom")).toBeVisible();
    await expect(page.locator(".sr-card").first()).toBeVisible();
    await expectVisibleControlsNamed(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  await page.goto("/@alhayabrand");
  const productOpener = page.locator(".sr-card").first().getByRole("button", { name: "View piece" });
  await productOpener.click();
  await expect(page.getByRole("dialog").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Close product" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await page.getByRole("dialog").first().evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(productOpener).toBeFocused();
  await productOpener.click();
  await page.getByRole("button", { name: "Add selected item" }).click();
  const drawerOpener = page.getByRole("button", { name: /Inquiry · 1/ });
  await drawerOpener.click();
  await expect(page.getByRole("button", { name: "Close inquiry" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await page.getByRole("dialog", { name: "Product inquiry" }).evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(drawerOpener).toBeFocused();
  await expect(page.locator(".inquiry-drawer")).toHaveAttribute("aria-hidden", "true");
  await drawerOpener.click();
  await page.getByPlaceholder("Your first name").fill("Browser Tester");
  await page.getByPlaceholder("How the business can contact you").fill("251900123456");
  await page.getByPlaceholder("Delivery area or another question").fill("Acceptance test inquiry");
  await page.getByRole("button", { name: "Share / copy" }).click();
  await expect(page.getByText("Message", { exact: true })).toBeVisible();
  const saved = readAcceptanceRow("inquiryByCustomer", "Browser Tester");
  expect(saved).toEqual({ status: "new", contact: "251900123456" });
  expect(errors).toEqual([]);
});

test("mobile search, persistent cart, quantity, and overflow", async ({ page }) => {
  const errors = monitor(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/@usashopet");
  await page.getByPlaceholder("Search products").fill("CeraVe");
  await expect(page.locator(".sr-card")).toHaveCount(1);
  await page.locator(".sr-card").first().getByRole("button", { name: "Details" }).click();
  await page.getByRole("button", { name: "Add selected item" }).click();
  await page.reload();
  await page.getByRole("button", { name: /Bag 1/ }).click();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator(".qty strong")).toHaveText("2");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("administrator onboards and previews a publicly hidden draft tenant", async ({ page }) => {
  const errors = monitor(page);
  await loginAndChangePassword(page, "admin@suqpage.local", "AdminAcceptance123!");
  await page.goto("/dashboard/admin");
  await expectVisibleControlsNamed(page);
  await page.locator('input[name="name"]').fill("Acceptance Flowers");
  await page.locator('input[name="handle"]').fill("acceptanceflowers");
  await page.locator('input[name="ownerName"]').fill("Flower Owner");
  await page.locator('input[name="email"]').fill("flowers@example.test");
  await page.locator('input[name="temporaryPassword"]').first().fill("FlowerOwner123!");
  await page.getByRole("button", { name: "Create tenant" }).click();
  await expect(page.getByRole("heading", { name: "Acceptance Flowers" })).toBeVisible();
  expect((await page.request.get("/@acceptanceflowers")).status()).toBe(404);
  await page.goto("/preview/@acceptanceflowers");
  await expect(page.locator(".showroom")).toBeVisible();
  await page.goto("/dashboard");
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.getByLabel("Email").fill("admin@suqpage.local");
    await page.getByLabel("Password").fill("AdminAcceptance123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  }
  expect(errors.filter((error) => !error.includes("404"))).toEqual([]);
});

test("owner catalog, inquiry, delivery, and role isolation workflows persist", async ({ page }) => {
  const errors = monitor(page);
  await loginAndChangePassword(page, "alhaya@suqpage.local", "OwnerAcceptance123!");
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/settings");
  await expectVisibleControlsNamed(page);
  await page.goto("/dashboard/catalog");
  await expectVisibleControlsNamed(page);
  await page.goto("/dashboard/products/new");
  await expectVisibleControlsNamed(page);
  await page.locator('input[name="name"]').fill("Acceptance Scarf");
  await page.locator('textarea[name="description"]').fill("Created through the browser acceptance suite.");
  await page.locator('input[name="stockCount"]').fill("3");
  await page.getByPlaceholder("Color").fill("Finish");
  await page.getByPlaceholder("Black, White, Blue").first().fill("Ivory, Onyx");
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page.getByText("Acceptance Scarf")).toBeVisible();
  await page.goto("/@alhayabrand");
  await page.getByPlaceholder("Search products").fill("Acceptance Scarf");
  await expect(page.getByRole("heading", { name: "Acceptance Scarf" })).toBeVisible();
  await page.goto("/dashboard/inquiries");
  await expectVisibleControlsNamed(page);
  const row = page.locator("section.panel").filter({ hasText: "Browser Tester" });
  await row.getByRole("combobox").selectOption("confirmed");
  await row.getByRole("button", { name: "Update" }).click();
  await expect(page.getByText("Inquiry status updated")).toBeVisible();
  await page.getByRole("link", { name: "Create delivery" }).first().click();
  await expectVisibleControlsNamed(page);
  const sessionCookie = (await page.context().cookies()).find((cookie) => cookie.name === "suqpage_session");
  expect(sessionCookie).toBeDefined();
  const oversized = await page.request.post("/api/malikt/requests", {
    headers: {
      Origin: "https://suqpage.test",
      "Content-Type": "application/json",
      Cookie: `suqpage_session=${sessionCookie!.value}`,
    },
    data: "x".repeat(65 * 1024),
  });
  expect(oversized.status()).toBe(413);
  await page.locator('input[name="pickupAddress"]').fill("Acceptance pickup");
  await page.locator('input[name="deliveryAddress"]').fill("Acceptance destination");
  await page.getByRole("button", { name: "Submit to Malikt Board" }).click();
  await expect(page.getByText(/submitted to the mock Malikt Board/)).toBeVisible();
  expect(readAcceptanceRow("productStockByName", "Acceptance Scarf")).toEqual({ stock_count: 3 });
  expect(readAcceptanceRow("inquiryByCustomer", "Browser Tester")).toMatchObject({ status: "confirmed" });
  expect(readAcceptanceRow("deliveryByAddress", "Acceptance destination")).toEqual({ status: "submitted" });
  expect(errors).toEqual([]);
});

test("API authorization, validation, health, and security headers", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ status: "ok" });
  const companies = await request.get("/api/malikt/companies");
  expect(companies.status()).toBe(200);
  expect((await companies.json()).companies).toHaveLength(4);
  expect((await request.get("/api/malikt/requests")).status()).toBe(401);
  expect((await request.post("/api/inquiries", { data: { businessId: 1, customerName: "X", contact: "12345", items: [] } })).status()).toBe(400);
  const home = await request.get("/");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
});
