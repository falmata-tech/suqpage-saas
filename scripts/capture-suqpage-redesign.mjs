import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = "http://127.0.0.1:3101";
const output = "/tmp/suqpage-redesign-review";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  // Third-party playback is outside this local layout/accessibility check.
  await page.route("https://www.youtube-nocookie.com/embed/**", (route) => route.fulfill({ body: '<html><body style="margin:0;display:grid;place-items:center;height:100vh;background:#202428;color:white;font:16px sans-serif">Video player · test fixture</body></html>', contentType: "text/html" }));
  const routes = [["market", "/?industry=all"], ["featured", "/featured"], ["about", "/about"],
    ["login", "/login"], ["textiles", "/@selam-weave"], ["electronics", "/@demo-abay-electrical-assembly"], ["home", "/@entoto-ceramics"], ["sensor", "/@demo-nile-sensor-studio?ref=discovery"]];
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const [name, route] of routes) {
      const response = await page.goto(`${base}${route}`);
      assert.equal(response.status(), 200, `${name} loads`);
      assert.equal(new URL(page.url()).pathname, new URL(route, base).pathname, `${name} is not a redirected stale fixture`);
      await expect(page.locator("h1").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (route.startsWith("/@")) {
        await expect(page.locator("[data-business-profile]")).toHaveCount(1);
        await page.getByRole("searchbox", { name: "Search products", exact: true }).fill("no-match-review-fixture");
        await expect(page.getByText("No matching products.", { exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Show all products", exact: true }).click();
        await expect(page.getByRole("link", { name: /^View / }).first()).toBeVisible();
        await expect(page.getByLabel("Back to Market", { exact: true })).toBeVisible();
        await expect(page.getByRole("navigation", { name: "Business profile sections" })).toBeVisible();
        const profile = page.locator("[data-business-profile]");
        const measure = () => profile.getByRole("region", { name: "Products", exact: true }).evaluate((element) => ({ top: element.offsetTop, height: element.closest("[data-business-profile]").scrollHeight }));
        const baseline = await measure();
        const contactSection = profile.getByRole("region", { name: "Connect with this business" });
        await expect(contactSection).toBeVisible();
        if (name === "sensor") {
          await expect(contactSection.locator('a[href^="mailto:"]')).toHaveCount(1);
          await expect(contactSection.locator('a[href^="tel:"]')).toHaveCount(1);
          const product = profile.locator("article").first();
          const productName = await product.locator("h3").innerText();
          await product.getByRole("link", { name: `View ${productName}`, exact: true }).click();
          await page.locator("[data-product-page]").getByRole("button", { name: "Inquire about this product", exact: true }).click();
          await expect(page.getByRole("dialog", { name: "Product inquiry", exact: true })).toContainText(productName);
          await page.keyboard.press("Escape");
          await page.getByRole("link", { name: "Back to products", exact: true }).click();
        }
        if (await contactSection.count()) {
          await contactSection.scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/${name}-contacts-${width}.png`, caret: "initial" });
        }
        const accessibility = await new AxeBuilder({ page }).include("[data-business-profile]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        assert.deepEqual(accessibility.violations, [], `${name} ${width}: profile accessibility`);
        const video = profile.getByRole("button", { name: /^Play business video/ });
        await expect(profile.locator("iframe")).toHaveCount(0);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `${output}/${name}-poster-${width}.png`, caret: "initial" });
        if (await video.count()) {
          await video.click();
          await expect(profile.locator("iframe")).toBeVisible();
          assert.deepEqual(await measure(), baseline, `${name} ${width}: video preserves catalog position`);
          await page.screenshot({ path: `${output}/${name}-video-${width}.png`, caret: "initial" });
        }
        assert.ok(await profile.evaluate((element) => {
          const products = element.querySelector(':scope > [aria-label="Products"]');
          const contacts = element.querySelector(':scope > [aria-label="Connect with this business"]');
          return Boolean(contacts) && products?.nextElementSibling === contacts && element.lastElementChild === contacts;
        }), "Contact section always follows products");
      } else if (name === "market") {
        await expect(page.locator(".leaflet-container")).toBeVisible();
        await expect(page.getByRole("combobox", { name: /Search/ })).toBeVisible();
        await expect(page.locator(".leaflet-container")).toHaveAttribute("data-tile-status", "ready", { timeout: 20000 });
      } else if (name === "featured") {
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".featured-card").first()).toBeVisible();
        await page.locator(".featured-card").first().click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.getByRole("button", { name: "Close page preview", exact: true }).click();
      } else if (name === "login") {
        await expect(page.getByRole("button", { name: "Continue with email", exact: true })).toBeVisible();
        await expect(page.locator('input[type="password"]')).toHaveCount(0);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${output}/${name}-${width}.png`, caret: "initial" });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        retired: /Suqpage|Suqpage/.test(document.body.innerText),
        broken: [...document.images].filter((img) => img.getBoundingClientRect().top < innerHeight && img.complete && !img.naturalWidth).map((img) => img.getAttribute("src")),
      }));
      assert.equal(metrics.overflow, false, `${name} ${width}: no horizontal overflow`);
      assert.equal(metrics.retired, false, `${name} ${width}: current visible branding`);
      assert.deepEqual(metrics.broken, [], `${name} ${width}: visible images load`);
      console.log(`PASS ${name} ${width}px`);
    }
  }
  assert.deepEqual(errors, [], "No browser application errors");
  console.log(`Suqpage desktop/390/320 screenshots: ${output}`);
} finally { await browser.close(); }
