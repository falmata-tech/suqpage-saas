import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, expect } from "@playwright/test";
const out = ".local/mobile-alignment";
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
const browser = await chromium.launch();
const errors = [];
const checks = [];
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
  const button = (name) => page.getByRole("button", { name, exact: true });
  async function capture(name) {
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${out}/${name}.png` });
  }
  async function noOverflow() {
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "No horizontal overflow",
    );
  }
  await page.goto("http://localhost:8082");
  await expect(button("View products")).toBeVisible({ timeout: 60000 });
  await expect(page.locator(".suqpage-map-marker").first()).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByRole("link", {name: "© OpenStreetMap contributors"})).toBeInViewport();
  await capture("native-market");
  await button("View products").click();
  await expect(
    page.getByRole("textbox", { name: "Search", exact: true }),
  ).toBeVisible();
  const category = button("Category: All categories"),
    place = button("Region or city: All Ethiopia");
  const [cb, pb] = await Promise.all([
    category.boundingBox(),
    place.boundingBox(),
  ]);
  assert.ok(Math.abs(cb.y - pb.y) < 2, "Filters stay side by side");
  await expect(button("Aloe Body Lotion")).toBeVisible();
  await expect(page.getByRole("link", {name: "© OpenStreetMap contributors"})).toBeInViewport();
  await capture("native-market-open");
  checks.push("Map workspace and compact visible filters");
  await page.getByRole("textbox", { name: "Search", exact: true }).fill("gras");
  await button("Search").click();
  await expect(button("Farm Grass with Dirt")).toBeVisible({ timeout: 15000 });
  await button("Hide products").click();
  await expect(button("View products")).toBeVisible();
  await button("View products").click();
  await expect(
    page.getByRole("textbox", { name: "Search", exact: true }),
  ).toHaveValue("gras");
  await button("Farm Grass with Dirt").click();
  await expect(button("Add to inquiry list")).toBeVisible();
  await button("Back").click();
  await expect(
    page.getByRole("textbox", { name: "Search", exact: true }),
  ).toHaveValue("gras");
  checks.push("Hide/reopen and product back preserve search");
  await button("Clear search").click();
  await expect(button("Aloe Body Lotion")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Businesses", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Products & services", exact: true })).toBeVisible();
  await category.click();
  const cats = page
    .getByRole("checkbox")
    .filter({ hasNot: page.locator("input") });
  // The modal removes the underlying screen from the accessibility tree.
  const choices = page
    .getByRole("checkbox")
    .filter({ hasNotText: /Products & services|Businesses/ });
  await choices.nth(0).click();
  await choices.nth(1).click();
  await button("Done").click();
  await expect(button("Category: Categories (2)")).toBeVisible();
  await button("Clear categories").click();
  await expect(category).toBeVisible();
  await place.click();
  await page.getByRole("radio").first().click();
  await button("Done").click();
  await expect(button("Clear location")).toBeVisible();
  await button("Clear location").click();
  await expect(place).toBeVisible();
  checks.push(
    "Multi-category and location selection/clear; offering-only list",
  );
  await expect(button("Aloe Body Lotion")).toBeVisible();
  await button("Next").scrollIntoViewIfNeeded();
  await button("Next").click();
  await expect(page.getByText(/^2 \/ \d+$/, { exact: true })).toBeVisible();
  await button("Hide products").click();
  await button("View products").click();
  await expect(page.getByText(/^2 \/ \d+$/, { exact: true })).toBeVisible();
  checks.push("Backend pagination survives panel toggle");
  // Open a map preview with the search drawer still open: it must sit above it.
  // Cluster controls expand; an individual storefront opens the business preview.
  for (let i = 0; i < 8 && await page.getByRole("button", {name: /Open page preview/}).count() === 0; i++) {
    await page.locator(".suqpage-map-marker").getByRole("button").first().dispatchEvent("click");
    await page.waitForTimeout(400);
  }
  await page.getByRole("button", {name: /Open page preview/}).first().dispatchEvent("click");
  await expect(button("Explore this business")).toBeVisible();
  await capture("native-map-preview");
  await button("Close").last().click();
  checks.push("Map preview appears above open drawer");
  await button("Hide products").click();
  await page.getByRole("tab", { name: "More", exact: true }).click();
  await expect(button("Sign in")).toBeVisible();
  await page.getByRole("radio", { name: "አማርኛ", exact: true }).click();
  await capture("native-market-amharic");
  await noOverflow();
  await page.getByRole("button", { name: "ቋንቋ", exact: true }).click();
  await page.getByRole("radio", { name: "English", exact: true }).click();
  if (await button("Close").last().isVisible()) await button("Close").last().click();
  checks.push("More account/language menu and Amharic shell");
  for (const [width, height] of [
    [320, 640],
    [844, 390],
    [1024, 900],
  ]) {
    await page.setViewportSize({ width, height });
    await button("View products").click();
    await expect(
      page.getByRole("textbox", { name: "Search", exact: true }),
    ).toBeVisible();
    await button("Next").scrollIntoViewIfNeeded();
    await noOverflow();
    await capture(`native-market-${width}`);
    await button("Hide products").click();
  }
  checks.push("320px, landscape and tablet panel scrolling");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:8082/featured");
  await expect(page.getByText("Daily Featured", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Explore this business", { exact: false }).first(),
  ).toBeVisible({ timeout: 20000 });
  await capture("native-featured");
  await noOverflow();
  await page.goto("http://localhost:8082/shop/demo-aloe-field-care");
  await expect(
    page.getByRole("textbox", { name: "Search this business" }),
  ).toBeVisible({ timeout: 20000 });
  await capture("native-shop");
  await page
    .getByRole("textbox", { name: "Search this business" })
    .fill("lotion");
  await expect(button("Aloe Body Lotion")).toBeVisible();
  await expect(button("Aloe Scalp Mist")).toHaveCount(0);
  await button("Clear").click();
  await page
    .getByText("Stay in touch", { exact: true })
    .scrollIntoViewIfNeeded();
  await capture("native-shop-contact");
  await noOverflow();
  checks.push("Featured, searchable showroom grid and separate contact area");
  await page.goto("http://localhost:8082/about");
  await expect(
    page.getByText("Local businesses. Easier to find.", { exact: true }),
  ).toBeVisible();
  await capture("native-about");
  checks.push("Approved About narrative and hero");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify({ passed: true, checks, errors }, null, 2),
  );
  console.log(`Passed ${checks.length} mobile alignment checks.`);
} finally {
  await browser.close();
}
