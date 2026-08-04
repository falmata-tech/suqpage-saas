import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-showroom-host-visuals");
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile-390", { width: 390, height: 844 }],
    ["mobile-320", { width: 320, height: 700 }],
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseURL}/@addis-metalworks`, { waitUntil: "domcontentloaded" });
    const host = page.getByRole("navigation", { name: "MirtPage showroom host navigation" });
    await host.waitFor();
    assert.equal(await host.getByRole("link", { name: "Back to MirtPage marketplace" }).getAttribute("href"), "/");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    await page.screenshot({ path: path.join(output, `${name}-entry.png`), fullPage: false });

    await page.locator(".floating-inquiry-trigger").evaluate((button) => {
      if (button instanceof HTMLButtonElement) button.click();
    });
    const drawer = page.locator(".inquiry-drawer.open");
    await drawer.waitFor();
    const geometry = await drawer.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        position: getComputedStyle(element).position,
        top: bounds.top,
        left: bounds.left,
        right: window.innerWidth - bounds.right,
        bottom: window.innerHeight - bounds.bottom,
      };
    });
    assert.equal(geometry.position, "fixed");
    assert.ok(geometry.top >= 0 && geometry.left >= 0 && geometry.right >= 0 && geometry.bottom >= 0);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: path.join(output, `${name}-inquiry.png`), fullPage: false });
    console.log(JSON.stringify({ name, geometry }));
    await context.close();
  }
} finally {
  await browser.close();
}
