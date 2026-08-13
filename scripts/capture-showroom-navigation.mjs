import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3001";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-showroom-navigation");
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const evidence = [];

async function showroomCapture(name, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseURL}/@addis-metalworks`, { waitUntil: "domcontentloaded", timeout: 60_000 });

  const host = page.getByRole("navigation", { name: "MirtPage showroom host navigation" });
  const tenantNavigation = page.locator('[data-slot="header"] nav[aria-label="Showroom sections"]');
  const mobileNavigation = page.locator(".showroom-mobile-nav");
  await host.waitFor();

  if (viewport.width > 620) {
    await tenantNavigation.waitFor();
    assert.equal(await tenantNavigation.getByRole("link").count(), 4);
    assert.equal(await tenantNavigation.isVisible(), true);
    assert.equal(await mobileNavigation.isVisible(), false);
    assert.equal(await page.locator(".floating-inquiry-trigger").isVisible(), true);
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false });
    await tenantNavigation.getByRole("link", { name: "Story" }).click();
    assert.equal(new URL(page.url()).hash, "#showroom-story");
  } else {
    assert.equal(await tenantNavigation.isVisible(), false);
    assert.equal(await mobileNavigation.isVisible(), true);
    assert.equal(await mobileNavigation.locator("a, button").count(), 5);
    assert.equal(await page.locator(".floating-inquiry-trigger").isVisible(), false);
    const targets = await mobileNavigation.locator("a, button").evaluateAll((items) =>
      items.map((item) => {
        const bounds = item.getBoundingClientRect();
        return { width: bounds.width, height: bounds.height };
      }),
    );
    assert.ok(targets.every((target) => target.width >= 44 && target.height >= 44));
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false });
    await mobileNavigation.getByRole("button", { name: /Inquiry/ }).click();
    await page.locator(".inquiry-drawer.open").waitFor();
  }

  const metrics = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    hostTop: Math.round(document.querySelector(".showroom-host-bar")?.getBoundingClientRect().top || 0),
    headerTop: Math.round(document.querySelector('[data-slot="header"]')?.getBoundingClientRect().top || 0),
    mobileNavigationBottom: Math.round(window.innerHeight - (document.querySelector(".showroom-mobile-nav")?.getBoundingClientRect().bottom || window.innerHeight)),
  }));
  assert.equal(metrics.documentWidth, metrics.viewportWidth);
  assert.ok(metrics.headerTop >= metrics.hostTop);
  assert.deepEqual(errors, []);
  evidence.push({ name, metrics });
  await page.close();
}

async function discoveryCapture() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  await page.goto(`${baseURL}/?industry=electronics`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.locator(".discovery-map-stage").waitFor();
  for (let attempt = 0; attempt < 7 && !(await page.locator(".discovery-point").count()); attempt += 1) {
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.waitForTimeout(240);
  }
  const point = page.locator(".discovery-point").first();
  await point.waitFor();
  const label = point.locator(".point-showroom-label");
  const lines = await label.locator("tspan").allTextContents();
  assert.ok(lines.length >= 1 && lines.length <= 3);
  assert.ok(lines.every((line) => line.length <= 13));
  assert.notEqual(lines.join(" "), "SHOWROOM");
  const labelWidth = await label.evaluate((element) => element.getBoundingClientRect().width);
  assert.ok(labelWidth < 110);
  await page.screenshot({ path: path.join(output, "named-map-pin.png"), fullPage: false });
  evidence.push({ name: "named-map-pin", lines, labelWidth: Math.round(labelWidth) });
  await page.close();
}

async function featuredCapture() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${baseURL}/featured`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const today = page.locator(".featured-week a.today");
  await today.waitFor();
  if ((await today.getAttribute("aria-current")) !== "date") {
    await today.click();
    await page.locator(".featured-floor-stage").waitFor();
  }
  const booth = page.locator(".featured-booth[data-business-id]").first();
  await booth.waitFor();
  const before = page.url();
  await booth.click();
  const preview = page.locator(".discovery-preview");
  await preview.waitFor();
  assert.equal(page.url(), before);
  assert.match(await preview.getByRole("link", { name: "Open showroom" }).getAttribute("href"), /\/@[^?]+\?ref=featured$/);
  await page.screenshot({ path: path.join(output, "featured-booth-preview.png"), fullPage: false });
  await preview.getByRole("button", { name: "Close showroom preview" }).click();
  const boothBounds = await booth.boundingBox();
  assert.ok(boothBounds);
  await page.mouse.move(boothBounds.x + boothBounds.width / 2, boothBounds.y + boothBounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(boothBounds.x + boothBounds.width / 2 + 80, boothBounds.y + boothBounds.height / 2 + 40, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  assert.equal(await preview.isVisible(), false);
  evidence.push({ name: "featured-booth-preview", routePreserved: true, boothDragPreserved: true });
  await page.close();
}

try {
  await showroomCapture("showroom-desktop", { width: 1440, height: 980 });
  await showroomCapture("showroom-phone-390", { width: 390, height: 844 });
  await showroomCapture("showroom-phone-320", { width: 320, height: 700 });
  await discoveryCapture();
  await featuredCapture();
  console.log(JSON.stringify({ output, evidence }, null, 2));
} finally {
  await browser.close();
}
