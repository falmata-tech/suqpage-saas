import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-discovery-visuals");
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const evidence = [];

async function capture(name, viewport, action) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const featuredExperience = name.includes("featured") || name.includes("showroom-preview");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("ExperimentalWarning: SQLite")) errors.push(message.text());
  });
  await page.goto(featuredExperience ? `${baseURL}/featured?featuredDay=1` : `${baseURL}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (featuredExperience) await page.locator(".featured-week a").first().waitFor();
  else {
    await page.locator(".discovery-regions path").first().waitFor();
    await page.locator(".discovery-roads path").nth(3).waitFor();
  }
  if (action) await action(page);
  const metrics = await page.evaluate(() => {
    const mapStage = document.querySelector(".discovery-map-stage")?.getBoundingClientRect();
    const featuredFloor = document.querySelector(".featured-floor-stage")?.getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: window.innerHeight,
      regions: document.querySelectorAll(".discovery-regions path").length,
      roadLayers: document.querySelectorAll(".discovery-roads path").length,
      clusters: document.querySelectorAll(".discovery-cluster").length,
      points: document.querySelectorAll(".discovery-point").length,
      cityGateways: document.querySelectorAll(".discovery-city-gateway").length,
      cityShops: document.querySelectorAll(".city-showroom-shop").length,
      featuredBooths: document.querySelectorAll(".featured-booth").length,
      featuredHalls: document.querySelectorAll(".featured-hall-controls button").length,
      featuredOutlines: document.querySelectorAll(".featured-booth-outline").length,
      featuredRevealed: document.querySelectorAll(".featured-booth[data-business-id]").length,
      sponsored: document.querySelectorAll(".discovery-sponsored-rail > a").length,
      listRows: document.querySelectorAll(".discovery-list article").length,
      industryTargets: [...document.querySelectorAll(".discovery-industry-picker > summary, .discovery-mobile-filter-trigger")].filter((node) => node.getClientRects().length).map((node) => Math.round(node.getBoundingClientRect().height)),
      mapTargets: [...document.querySelectorAll(".discovery-zoom button, .discovery-mobile-map-controls button")].filter((node) => node.getClientRects().length).map((node) => Math.round(node.getBoundingClientRect().height)),
      featuredTargets: [...document.querySelectorAll(".featured-floor-actions button")].map((node) => Math.round(node.getBoundingClientRect().height)),
      mapTop: mapStage ? Math.round(mapStage.top) : null,
      mapHeight: mapStage ? Math.round(mapStage.height) : null,
      featuredWidth: featuredFloor ? Math.round(featuredFloor.width) : null,
      featuredHeight: featuredFloor ? Math.round(featuredFloor.height) : null,
      visibleMap: Boolean(document.querySelector(".discovery-map")?.getClientRects().length),
      visibleFeatured: Boolean(document.querySelector(".featured-floor")?.getClientRects().length),
      weekDays: document.querySelectorAll(".featured-week a").length,
      weekLabels: [...document.querySelectorAll(".featured-week a > b")].map((node) => node.textContent?.trim()),
      weekTargets: [...document.querySelectorAll(".featured-week a")].map((node) => Math.round(node.getBoundingClientRect().height)),
      scaleControls: document.querySelectorAll('.discovery-scale, [aria-label="Production scale"]').length,
      searchInMapHeader: Boolean(document.querySelector('.discovery-summary [role="search"]')),
      cityTargets: [...document.querySelectorAll(".city-showroom-actions button")].map((node) => Math.round(node.getBoundingClientRect().height)),
      visibleCityShowroom: Boolean(document.querySelector(".city-showroom-panel")?.getClientRects().length),
      cityPanelInMapShell: Boolean(document.querySelector(".discovery-map-shell > .city-showroom-panel")),
      visibleShowroomPreview: Boolean(document.querySelector(".discovery-preview[role='dialog']")?.getClientRects().length),
      previewIsNonModal: document.querySelector(".discovery-preview")?.getAttribute("aria-modal") === "false",
      previewLayerPosition: getComputedStyle(document.querySelector(".discovery-preview-layer") || document.body).position,
      previewScrimColor: getComputedStyle(document.querySelector(".discovery-preview-scrim") || document.body).backgroundColor,
      previewActionHeight: Math.round(document.querySelector(".discovery-preview a")?.getBoundingClientRect().height || 0),
    };
  });
  assert.equal(metrics.documentWidth, metrics.viewportWidth, `${name} has no document overflow`);
  if (metrics.listRows) assert.equal(metrics.listRows, 5, `${name} keeps the list page bounded to five rows`);
  else if (!featuredExperience && !name.includes("city-showroom")) {
    assert.equal(metrics.regions, 14, `${name} renders all region paths`);
    assert.equal(metrics.roadLayers, 4, `${name} renders four local road classes`);
    assert.ok(metrics.clusters + metrics.points > 0, `${name} renders clustered or individual Showrooms`);
    assert.equal(metrics.visibleMap, true, `${name} keeps the map visible`);
  }
  if (featuredExperience) {
    assert.equal(metrics.featuredHalls, 0, `${name} renders no split Daily Featured halls`);
    assert.ok(metrics.featuredTargets.every((height) => height >= 44), `${name} Daily Featured floor controls are touch sized`);
    assert.equal(metrics.weekDays, 7, `${name} renders the full weekly schedule`);
    assert.deepEqual(metrics.weekLabels, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], `${name} keeps fixed weekday positions`);
    assert.ok(metrics.weekTargets.every((height) => height >= 40), `${name} weekly controls remain touchable in the compact venue ribbon`);
    assert.equal(metrics.visibleFeatured, true, `${name} renders the scheduled Daily Featured program`);
    assert.ok(metrics.featuredBooths > 0, `${name} keeps every Daily Featured slot on the continuous floor`);
    assert.ok(metrics.sponsored >= 5, `${name} renders the complete paid sponsor pool beside Daily Featured`);
  } else {
    assert.ok(metrics.industryTargets.every((height) => height >= 44), `${name} industry controls are touch sized`);
    assert.ok(metrics.mapTargets.every((height) => height >= 44), `${name} map controls are touch sized`);
    assert.equal(metrics.visibleFeatured, false, `${name} does not mount Daily Featured below the Market`);
    assert.equal(metrics.sponsored, 0, `${name} does not mount Sponsors below the Market`);
  }
  assert.ok(metrics.cityTargets.every((height) => height >= 44), `${name} City Showroom controls are touch sized`);
  if (name.includes("featured-preview")) {
    assert.equal(metrics.featuredOutlines, metrics.featuredBooths, `${name} exposes only anonymous booth outlines`);
    assert.equal(metrics.featuredRevealed, 0, `${name} does not expose future business booths`);
  }
  if (name.includes("featured-today")) assert.equal(metrics.featuredRevealed, metrics.featuredBooths, `${name} reveals every business-owned booth today`);
  if (name.includes("city-showroom")) {
    assert.equal(metrics.visibleCityShowroom, true, `${name} renders the City Showroom panel`);
    assert.equal(metrics.cityPanelInMapShell, true, `${name} replaces the map within its existing frame`);
    assert.equal(metrics.visibleMap, false, `${name} suspends the geographic renderer while the City Showroom is open`);
    assert.ok(metrics.cityShops > 1, `${name} renders every grouped city business on one floor`);
  }
  if (name.includes("showroom-preview")) {
    assert.equal(metrics.visibleShowroomPreview, true, `${name} renders the floating showroom inspector`);
    assert.equal(metrics.previewIsNonModal, true, `${name} keeps the active map or venue non-modal`);
    assert.equal(metrics.previewLayerPosition, "fixed", `${name} places the inspector above the existing application UI`);
    assert.match(metrics.previewScrimColor, /rgba\(.+, 0\.1(?:4)?\)/, `${name} keeps the marketplace visible through a low-opacity scrim`);
    assert.ok(metrics.previewActionHeight >= 44, `${name} keeps Open showroom visually and physically actionable`);
  }
  if (name.includes("home")) {
    assert.ok(metrics.mapTop !== null && metrics.mapTop < Math.min(metrics.viewportHeight, 620), `${name} brings the map into the first viewport`);
    assert.equal(metrics.scaleControls, 0, `${name} omits public production-scale controls`);
    assert.equal(metrics.searchInMapHeader, true, `${name} places live search in the map header`);
  }
  assert.deepEqual(errors, [], `${name} has no browser errors`);
  const screenshot = path.join(output, `${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  evidence.push({ name, screenshot, ...metrics });
  await page.close();
}

async function openVisibleCityShowroom(page) {
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
  const groupedLocation = await page.locator(".discovery-location-picker select option").evaluateAll((options) => {
    const option = options.find((item) => Number(item.textContent?.match(/\((\d+)\)/)?.[1] || 0) > 1);
    return option instanceof HTMLOptionElement ? option.value : "";
  });
  if (groupedLocation) {
    const desktopLocation = page.locator(".discovery-location-picker select");
    if (await desktopLocation.isVisible()) {
      await desktopLocation.selectOption(groupedLocation);
    } else {
      await page.locator(".discovery-mobile-filter-trigger").click();
      await page.locator(".discovery-filter-place select").selectOption(groupedLocation);
    }
    await page.waitForTimeout(520);
    const gatewayIndex = await visibleIndex(".discovery-city-gateway");
    if (gatewayIndex >= 0) {
      await page.locator(".discovery-city-gateway").nth(gatewayIndex).click();
      await page.locator(".city-showroom-panel").waitFor();
      return;
    }
  }
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const gatewayIndex = await visibleIndex(".discovery-city-gateway");
    if (gatewayIndex >= 0) {
      await page.locator(".discovery-city-gateway").nth(gatewayIndex).click();
      await page.locator(".city-showroom-panel").waitFor();
      return;
    }
    const clusterIndex = await visibleIndex(".discovery-cluster");
    if (clusterIndex < 0) break;
    await page.locator(".discovery-cluster").nth(clusterIndex).click();
    await page.waitForTimeout(420);
  }
  throw new Error("No visible multi-business city gateway was reachable");
}

async function openTodayFeatured(page) {
  await page.locator(".featured-week a.today").click();
  await page.locator(".featured-floor .featured-booth[data-business-id]").first().waitFor();
}

try {
  await capture("home-desktop", { width: 1440, height: 1000 });
  await capture("home-mobile-390", { width: 390, height: 844 });
  await capture("home-mobile-320", { width: 320, height: 700 });
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
  await capture("city-showroom-desktop", { width: 1440, height: 1000 }, openVisibleCityShowroom);
  await capture("city-showroom-mobile-390", { width: 390, height: 844 }, openVisibleCityShowroom);
  await capture("city-showroom-mobile-320", { width: 320, height: 700 }, openVisibleCityShowroom);
  await capture("featured-preview-mobile-390", { width: 390, height: 844 }, async (page) => {
    await page.locator(".featured-week a:not(.today)").filter({ hasNotText: "Sun" }).first().click();
    await page.locator(".featured-floor").waitFor();
    await page.locator(".daily-featured").scrollIntoViewIfNeeded();
  });
  await capture("featured-today-desktop", { width: 1440, height: 1000 }, async (page) => {
    await openTodayFeatured(page);
    await page.locator(".daily-featured").scrollIntoViewIfNeeded();
  });
  await capture("featured-today-mobile-390", { width: 390, height: 844 }, async (page) => {
    await openTodayFeatured(page);
    await page.locator(".daily-featured").scrollIntoViewIfNeeded();
  });
  await capture("showroom-preview-mobile-390", { width: 390, height: 844 }, async (page) => {
    await openTodayFeatured(page);
    await page.locator(".featured-booth[data-business-id]").first().evaluate((booth) => (booth instanceof HTMLElement ? booth.click() : undefined));
    await page.locator(".discovery-preview[role='dialog']").waitFor();
  });
  await capture("sunday-agriculture-featured-mobile-390", { width: 390, height: 844 }, async (page) => {
    await page.getByRole("navigation", { name: "Daily featured showroom schedule" }).getByRole("link", { name: /Sun/ }).click();
    await page.locator(".featured-floor").waitFor();
    await page.locator(".daily-featured").scrollIntoViewIfNeeded();
  });
  await capture("discovery-list-mobile-320", { width: 320, height: 700 }, async (page) => {
    await page.getByRole("tab", { name: "List" }).click();
    await page.locator(".discovery-list article").first().waitFor();
  });
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
