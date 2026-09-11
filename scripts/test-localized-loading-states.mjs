import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "africmade-loading-states");
fs.mkdirSync(output, { recursive: true });

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function intersects(first, second) {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}

async function captureTransition(browser, viewport, suffix) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const requestStarted = deferred();

  const isFeaturedRscRequest = (request) => {
    const url = new URL(request.url());
    return url.pathname === "/featured" && request.headers().rsc === "1";
  };

  page.on("request", (request) => {
    if (isFeaturedRscRequest(request)) requestStarted.resolve();
  });

  await page.route("**/*", async (route) => {
    const request = route.request();
    if (isFeaturedRscRequest(request)) {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
    await route.continue();
  });

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.locator(".public-app-main").waitFor();
  await page.getByRole("link", { name: /Daily featured|Featured/ }).first().click({ noWaitAfter: true });
  await Promise.race([
    requestStarted.promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${suffix} navigation request did not start`)), 5_000)),
  ]);

  await page.waitForTimeout(180);
  assert.equal(await page.locator(".public-app-main").count(), 1, `${suffix} retains the public content region`);
  if (viewport.width > 680) {
    assert.equal(await page.locator(".public-app-header").isVisible(), true, `${suffix} retains the public header`);
    assert.equal(await page.locator(".public-app-rail").isVisible(), true, `${suffix} retains the public rail`);
  } else {
    assert.equal(await page.locator(".public-mobile-tabs").isVisible(), true, `${suffix} retains phone navigation`);
    const statusBox = await page.locator(".navigation-workspace-status").boundingBox();
    const headingBox = await page.locator(".public-experience-head").boundingBox();
    const navigationBox = await page.locator(".public-mobile-tabs").boundingBox();
    const supportBox = await page.locator(".public-support-launcher").boundingBox();
    assert.ok(statusBox && headingBox && navigationBox && supportBox, `${suffix} exposes measurable phone controls`);
    assert.equal(intersects(statusBox, headingBox), false, `${suffix} pending feedback does not cover the page heading`);
    assert.equal(intersects(statusBox, navigationBox), false, `${suffix} pending feedback does not cover phone navigation`);
    assert.equal(intersects(statusBox, supportBox), false, `${suffix} pending feedback does not cover support`);
  }
  assert.equal(await page.locator(".navigation-pending-main[data-navigation-pending='true']").count(), 1, `${suffix} marks only the content region busy`);
  assert.equal(await page.locator(".navigation-workspace-status").isVisible(), true, `${suffix} exposes local pending feedback`);
  assert.equal(await page.locator(".navigation-pending-indicator.is-pending").count() > 0, true, `${suffix} identifies the selected navigation action`);
  assert.equal(await page.locator("body > .public-route-loading").count(), 0, `${suffix} does not replace the application with a root loader`);
  await page.screenshot({ path: path.join(output, `public-navigation-loading-${suffix}.png`) });

  await page.waitForURL((url) => url.pathname === "/featured", { timeout: 10_000 });
  await page.locator(".daily-featured").waitFor({ timeout: 10_000 });
  await context.close();
}

for (const [viewport, suffix] of [
  [{ width: 1440, height: 1000 }, "1440"],
  [{ width: 390, height: 844 }, "390"],
]) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.MIRTPAGE_PLAYWRIGHT_EXECUTABLE_PATH || undefined,
  });
  try {
    await captureTransition(browser, viewport, suffix);
  } finally {
    await browser.close();
  }
}
console.log(`Localized loading states passed: ${output}`);
