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
  await page.goto(`${baseURL}/?expoDay=1`, { waitUntil: "networkidle" });
  await page.locator(".discovery-regions path").first().waitFor();
  if (action) await action(page);
  const metrics = await page.evaluate(() => {
    const mapStage = document.querySelector(".discovery-map-stage")?.getBoundingClientRect();
    const expoFloor = document.querySelector(".expo-floor-stage")?.getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: window.innerHeight,
      regions: document.querySelectorAll(".discovery-regions path").length,
      roadLayers: document.querySelectorAll(".discovery-roads path").length,
      clusters: document.querySelectorAll(".discovery-cluster").length,
      points: document.querySelectorAll(".discovery-point").length,
      cityGateways: document.querySelectorAll(".discovery-city-gateway").length,
      cityShops: document.querySelectorAll(".city-suq-shop").length,
      expoBooths: document.querySelectorAll(".expo-booth").length,
      expoHalls: document.querySelectorAll(".expo-hall-controls button").length,
      expoOutlines: document.querySelectorAll(".expo-booth-outline").length,
      expoRevealed: document.querySelectorAll(".expo-booth[data-business-id]").length,
      featured: document.querySelectorAll(".discovery-featured-rail > a").length,
      listRows: document.querySelectorAll(".discovery-list article").length,
      industryTargets: [...document.querySelectorAll(".discovery-industries a")].map((node) => Math.round(node.getBoundingClientRect().height)),
      mapTargets: [...document.querySelectorAll(".discovery-zoom button")].map((node) => Math.round(node.getBoundingClientRect().height)),
      expoTargets: [...document.querySelectorAll(".expo-floor-actions button")].map((node) => Math.round(node.getBoundingClientRect().height)),
      mapTop: mapStage ? Math.round(mapStage.top) : null,
      mapHeight: mapStage ? Math.round(mapStage.height) : null,
      expoWidth: expoFloor ? Math.round(expoFloor.width) : null,
      expoHeight: expoFloor ? Math.round(expoFloor.height) : null,
      visibleMap: Boolean(document.querySelector(".discovery-map")?.getClientRects().length),
      visibleExpo: Boolean(document.querySelector(".expo-floor")?.getClientRects().length),
      visibleLive: Boolean(document.querySelector(".expo-live")?.getClientRects().length),
      weekDays: document.querySelectorAll(".expo-week a").length,
      weekTargets: [...document.querySelectorAll(".expo-week a")].map((node) => Math.round(node.getBoundingClientRect().height)),
      cityTargets: [...document.querySelectorAll(".city-suq-actions button")].map((node) => Math.round(node.getBoundingClientRect().height)),
      visibleCitySuq: Boolean(document.querySelector(".city-suq-dialog[open]")?.getClientRects().length),
    };
  });
  assert.equal(metrics.documentWidth, metrics.viewportWidth, `${name} has no document overflow`);
  if (metrics.listRows) assert.equal(metrics.listRows, 5, `${name} keeps the list page bounded to five rows`);
  else {
    assert.equal(metrics.regions, 14, `${name} renders all region paths`);
    assert.equal(metrics.roadLayers, 4, `${name} renders four local road classes`);
    assert.ok(metrics.clusters + metrics.points > 0, `${name} renders clustered or individual Suqs`);
    assert.equal(metrics.visibleMap, true, `${name} keeps the map visible`);
  }
  assert.ok(metrics.industryTargets.every((height) => height >= 44), `${name} industry controls are touch sized`);
  assert.ok(metrics.mapTargets.every((height) => height >= 44), `${name} map controls are touch sized`);
  assert.equal(metrics.expoHalls, 0, `${name} renders no Expo halls`);
  assert.ok(metrics.expoTargets.every((height) => height >= 44), `${name} Expo floor controls are touch sized`);
  assert.equal(metrics.weekDays, 7, `${name} renders the full weekly schedule`);
  assert.ok(metrics.weekTargets.every((height) => height >= 44), `${name} weekly controls are touch sized`);
  assert.ok(metrics.cityTargets.every((height) => height >= 44), `${name} City Suq controls are touch sized`);
  assert.equal(metrics.visibleExpo || metrics.visibleLive, true, `${name} renders the scheduled Expo or Sunday live program`);
  if (metrics.visibleExpo) assert.ok(metrics.expoBooths > 0, `${name} keeps every Expo slot on the continuous floor`);
  if (name.includes("expo-preview")) {
    assert.equal(metrics.expoOutlines, metrics.expoBooths, `${name} exposes only anonymous booth outlines`);
    assert.equal(metrics.expoRevealed, 0, `${name} does not expose future business booths`);
  }
  if (name.includes("expo-today")) assert.equal(metrics.expoRevealed, metrics.expoBooths, `${name} reveals every business-owned booth today`);
  if (name.includes("city-suq")) {
    assert.equal(metrics.visibleCitySuq, true, `${name} renders the City Suq dialog`);
    assert.ok(metrics.cityShops > 1, `${name} renders every grouped city business on one floor`);
  }
  if (name.includes("home")) {
    assert.ok(metrics.featured > 0 && metrics.featured <= 5, `${name} renders the bounded featured rail`);
    assert.ok(metrics.mapTop !== null && metrics.mapTop < metrics.viewportHeight, `${name} brings the map into the first viewport`);
  }
  assert.deepEqual(errors, [], `${name} has no browser errors`);
  const screenshot = path.join(output, `${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: name.includes("home") || name.includes("expo") });
  evidence.push({ name, screenshot, ...metrics });
  await page.close();
}

async function openVisibleCitySuq(page) {
  const visibleIndex = (selector) => page.locator(selector).evaluateAll((markers) => {
    const stage = document.querySelector(".discovery-map-stage")?.getBoundingClientRect();
    if (!stage) return -1;
    return markers.findIndex((marker) => {
      const bounds = marker.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      return centerX >= stage.left && centerX <= stage.right && centerY >= stage.top && centerY <= stage.bottom;
    });
  });
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const gatewayIndex = await visibleIndex(".discovery-city-gateway");
    if (gatewayIndex >= 0) {
      await page.locator(".discovery-city-gateway").nth(gatewayIndex).click();
      await page.locator(".city-suq-dialog[open]").waitFor();
      return;
    }
    const clusterIndex = await visibleIndex(".discovery-cluster");
    if (clusterIndex < 0) break;
    await page.locator(".discovery-cluster").nth(clusterIndex).click();
    await page.waitForTimeout(420);
  }
  throw new Error("No visible multi-business city gateway was reachable");
}

try {
  await capture("home-desktop", { width: 1440, height: 1000 });
  await capture("home-mobile-390", { width: 390, height: 844 });
  await capture("cluster-expanded-desktop", { width: 1440, height: 1000 }, async (page) => {
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const index = await page.locator(".discovery-cluster").evaluateAll((clusters) => {
        const stage = document.querySelector(".discovery-map-stage")?.getBoundingClientRect();
        if (!stage) return -1;
        return clusters.findIndex((cluster) => {
          const bounds = cluster.getBoundingClientRect();
          const centerX = bounds.left + bounds.width / 2;
          const centerY = bounds.top + bounds.height / 2;
          return centerX >= stage.left && centerX <= stage.right && centerY >= stage.top && centerY <= stage.bottom;
        });
      });
      if (index < 0) break;
      await page.locator(".discovery-cluster").nth(index).click();
      await page.waitForTimeout(420);
    }
    await page.locator(".discovery-map-stage").scrollIntoViewIfNeeded();
  });
  await capture("city-suq-desktop", { width: 1440, height: 1000 }, openVisibleCitySuq);
  await capture("city-suq-mobile-390", { width: 390, height: 844 }, openVisibleCitySuq);
  await capture("city-suq-mobile-320", { width: 320, height: 700 }, openVisibleCitySuq);
  await capture("expo-preview-mobile-390", { width: 390, height: 844 }, async (page) => {
    await page.locator(".expo-week a:not(.today)").filter({ hasNotText: "Sun" }).first().click();
    await page.locator(".expo-floor").waitFor();
    await page.locator(".daily-expo").scrollIntoViewIfNeeded();
  });
  await capture("expo-today-desktop", { width: 1440, height: 1000 }, async (page) => {
    await page.locator(".expo-week a.today").click();
    await page.locator(".expo-floor").waitFor();
    await page.locator(".daily-expo").scrollIntoViewIfNeeded();
  });
  await capture("expo-today-mobile-390", { width: 390, height: 844 }, async (page) => {
    await page.locator(".expo-week a.today").click();
    await page.locator(".expo-floor").waitFor();
    await page.locator(".daily-expo").scrollIntoViewIfNeeded();
  });
  await capture("sunday-live-mobile-390", { width: 390, height: 844 }, async (page) => {
    await page.getByRole("navigation", { name: "Weekly Expo schedule" }).getByRole("link", { name: /Sun/ }).click();
    await page.locator(".expo-live").waitFor();
    await page.locator(".daily-expo").scrollIntoViewIfNeeded();
  });
  await capture("discovery-list-mobile-320", { width: 320, height: 700 }, async (page) => {
    await page.getByRole("tab", { name: "List" }).click();
    await page.locator(".discovery-list article").first().waitFor();
  });
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
