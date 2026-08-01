import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.SUQPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.SUQPAGE_VISUAL_OUTPUT || path.join("/tmp", "suqpage-discovery-visuals");
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const evidence = [];

async function capture(name, viewport, action) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("ExperimentalWarning: SQLite")) errors.push(message.text());
  });
  await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
  await page.locator(".discovery-regions path").first().waitFor();
  if (action) await action(page);
  const metrics = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    regions: document.querySelectorAll(".discovery-regions path").length,
    hubs: document.querySelectorAll(".discovery-hubs > g").length,
    booths: document.querySelectorAll(".city-booth").length,
    listRows: document.querySelectorAll(".discovery-list article").length,
    industryTargets: [...document.querySelectorAll(".discovery-industries a")].map((node) => Math.round(node.getBoundingClientRect().height)),
    visibleMap: Boolean(document.querySelector(".discovery-map")?.getClientRects().length),
    visibleVenue: Boolean(document.querySelector(".city-venue")?.getClientRects().length),
  }));
  assert.equal(metrics.documentWidth, metrics.viewportWidth, `${name} has no document overflow`);
  if (metrics.listRows) {
    assert.ok(metrics.listRows >= 3, `${name} renders the complete selected-industry list`);
  } else {
    assert.equal(metrics.regions, 14, `${name} renders all region paths`);
    assert.ok(metrics.hubs > 0, `${name} renders at least one City Suq`);
    assert.equal(metrics.visibleMap, true, `${name} keeps the map visible`);
  }
  assert.ok(metrics.industryTargets.every((height) => height >= 44), `${name} industry controls are touch sized`);
  assert.ok(metrics.booths <= 12, `${name} renders at most twelve booths`);
  assert.deepEqual(errors, [], `${name} has no browser errors`);
  const screenshot = path.join(output, `${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: name.includes("home") });
  evidence.push({ name, screenshot, ...metrics });
  await page.close();
}

try {
  await capture("home-desktop", { width: 1440, height: 1000 });
  await capture("home-mobile-390", { width: 390, height: 844 });
  await capture("city-suq-mobile-390", { width: 390, height: 844 }, async (page) => {
    const selector = page.getByLabel("Jump to a City Suq");
    const value = await selector.locator("option").nth(1).getAttribute("value");
    assert.ok(value);
    await selector.selectOption(value);
    await page.locator(".city-venue").waitFor();
    await page.locator(".city-venue").scrollIntoViewIfNeeded();
  });
  await capture("discovery-list-mobile-320", { width: 320, height: 700 }, async (page) => {
    await page.getByRole("tab", { name: "List" }).click();
    await page.locator(".discovery-list article").first().waitFor();
  });
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
