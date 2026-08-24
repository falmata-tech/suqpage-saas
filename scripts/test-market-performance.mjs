import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3001";
const outputDir = process.env.MIRTPAGE_TEST_OUTPUT || "/tmp/mirtpage-market-performance";
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
const artifactPath = path.join(outputDir, "metrics.json");

function writeResults() {
  fs.writeFileSync(artifactPath, JSON.stringify(results, null, 2));
}

try {
  for (const target of [
    { name: "phone", viewport: { width: 390, height: 844 }, throttle: 6 },
    { name: "desktop", viewport: { width: 1440, height: 900 }, throttle: 4 },
  ]) {
    const context = await browser.newContext({ viewport: target.viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__mirtpageLongTasks = [];
      new PerformanceObserver((list) => {
        window.__mirtpageLongTasks.push(...list.getEntries().map((entry) => entry.duration));
      }).observe({ type: "longtask", buffered: true });
    });
    const session = await context.newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", { rate: target.throttle });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`${baseUrl}/?industry=all`, { waitUntil: "networkidle", timeout: 45_000 });
    await page.locator(".discovery-industry-picker a[data-industry='machinery-tools']").evaluate((link) => link.click());
    await page.waitForURL(/industry=machinery-tools/, { timeout: 20_000 });
    await page.waitForLoadState("networkidle");
    const map = page.locator(".discovery-map");
    await map.waitFor({ state: "visible", timeout: 20_000 });
    const zoomButton = page.locator(target.name === "phone"
      ? ".discovery-mobile-map-toolbar button[aria-label='Zoom in']"
      : ".discovery-zoom button[aria-label='Zoom in']");
    await page.evaluate(() => { window.__mirtpageLongTasks = []; });
    await session.send("Profiler.enable");
    await session.send("Profiler.start");
    const startedAt = performance.now();
    for (let index = 0; index < 12; index += 1) {
      const cluster = page.locator(".mp-map-cluster").first();
      if (await cluster.count()) await cluster.click();
      else if (Number(await map.getAttribute("data-map-zoom")) < 14) await zoomButton.click();
      else break;
      await page.waitForTimeout(120);
    }
    const mapBox = await map.boundingBox();
    if (mapBox) {
      await page.mouse.move(mapBox.x + mapBox.width * 0.62, mapBox.y + mapBox.height * 0.52);
      await page.mouse.down();
      await page.mouse.move(mapBox.x + mapBox.width * 0.42, mapBox.y + mapBox.height * 0.52, { steps: 5 });
      await page.mouse.up();
    }
    await page.waitForTimeout(300);
    const durationMs = performance.now() - startedAt;
    const { profile } = await session.send("Profiler.stop");
    const hottestFunctions = profile.nodes
      .filter((node) => node.hitCount)
      .sort((left, right) => (right.hitCount || 0) - (left.hitCount || 0))
      .slice(0, 8)
      .map((node) => ({ functionName: node.callFrame.functionName || "(anonymous)", url: node.callFrame.url.split("/").at(-1) || "", samples: node.hitCount }));
    const metrics = await map.evaluate((element) => ({
      zoom: Number(element.getAttribute("data-map-zoom") || 0),
      markerCount: Number(element.getAttribute("data-map-marker-count") || 0),
      renderedMarkers: element.querySelectorAll(".leaflet-marker-pane > .leaflet-marker-icon").length,
      loadedTiles: element.querySelectorAll("img.leaflet-tile-loaded").length,
      longTasks: window.__mirtpageLongTasks || [],
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));

    await page.screenshot({ path: path.join(outputDir, `${target.name}.png`), fullPage: false });
    const result = { target: target.name, durationMs: Math.round(durationMs), ...metrics, maxLongTaskMs: Math.round(Math.max(0, ...metrics.longTasks)), hottestFunctions };
    results.push(result);
    writeResults();

    assert.equal(errors.length, 0, `${target.name} map reports no page errors: ${errors.join("; ")}`);
    assert.ok(metrics.zoom >= 12, `${target.name} reaches detailed showroom zoom`);
    assert.ok(metrics.loadedTiles > 0, `${target.name} loads visible OSM tiles`);
    assert.equal(metrics.renderedMarkers, metrics.markerCount, `${target.name} exposes an accurate mounted marker count`);
    assert.ok(metrics.horizontalOverflow <= 1, `${target.name} map does not create page-level horizontal overflow`);
    assert.ok(durationMs < 15_000, `${target.name} completes repeated throttled zoom commits within 15 seconds`);
    assert.ok(result.maxLongTaskMs < 1_500, `${target.name} avoids a 1.5-second frozen task under CPU throttling`);
    await context.close();
  }
} finally {
  await browser.close();
}

writeResults();
console.log(JSON.stringify({ outputDir, results }, null, 2));
