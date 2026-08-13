import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-public-app-shell");
fs.mkdirSync(output, { recursive: true });

async function openPage(browser, route, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
  await page.locator("main").waitFor();
  return { context, page, errors };
}

async function assertNoOverflow(page, label) {
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    true,
    `${label} has horizontal overflow`,
  );
}

async function assertViewportBounded(page, label) {
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight + 2),
    true,
    `${label} must stay within the application viewport`,
  );
}

async function captureMarket(browser, viewport, suffix) {
  const state = await openPage(browser, "/", viewport);
  const { page } = state;
  await page.locator(".discovery-map-stage").waitFor();
  await page.locator("svg.discovery-map").waitFor();
  assert.equal(await page.locator(".daily-featured").count(), 0, "Market must not mount Daily Featured");
  assert.equal(await page.locator(".discovery-sponsored").count(), 0, "Market must not mount Sponsors");
  assert.equal(await page.locator("main").count(), 1, "Market has one main landmark");
  if (viewport.width > 680) {
    assert.deepEqual(await page.locator(".public-app-rail > nav a span").allTextContents(), ["Market", "Daily featured", "About"]);
    assert.equal(await page.locator(".public-app-rail-secondary > a").count(), 2);
  }
  await assertNoOverflow(page, `${suffix} Market`);
  await assertViewportBounded(page, `${suffix} Market`);
  const stageBox = await page.locator(".discovery-map-stage").boundingBox();
  assert.ok(stageBox && stageBox.height >= (viewport.width > 680 ? 620 : 430), `${suffix} Market map does not fill the remaining workspace`);
  if (viewport.width <= 680) {
    const toolbarBox = await page.locator(".discovery-mobile-map-toolbar").boundingBox();
    assert.ok(toolbarBox && stageBox && toolbarBox.y + toolbarBox.height <= stageBox.y + 1, `${suffix} map toolbar overlaps the map`);
  }
  await page.screenshot({ path: path.join(output, `market-${suffix}.png`), caret: "initial" });
  assert.deepEqual(state.errors, []);
  await state.context.close();
}

async function captureFeatured(browser, viewport, suffix) {
  const state = await openPage(browser, "/featured", viewport);
  const { page } = state;
  await page.locator(".daily-featured").waitFor();
  await page.locator("#featured-sponsors").waitFor();
  await page.locator(".featured-floor-stage").waitFor();
  assert.equal(await page.locator("main h1").count(), 1, `${suffix} Daily Featured needs one H1`);
  assert.equal(await page.locator(".public-experience-head").count(), 0, `${suffix} Daily Featured must not repeat its introduction`);
  assert.equal(await page.locator(".discovery-sponsored-rail > a").count(), 5);
  assert.equal(await page.locator(".discovery-map-stage").count(), 0);
  const floorBox = await page.locator(".featured-floor-stage").boundingBox();
  assert.ok(floorBox && floorBox.height >= (viewport.width > 680 ? 520 : 260), `${suffix} venue does not receive enough viewport space`);
  const floorToolbarOverlap = await page.evaluate(() => {
    const toolbar = document.querySelector(".featured-floor-actions")?.getBoundingClientRect();
    const stage = document.querySelector(".featured-floor-stage")?.getBoundingClientRect();
    return toolbar && stage ? toolbar.bottom - stage.top : Number.POSITIVE_INFINITY;
  });
  assert.ok(floorToolbarOverlap <= 2, `${suffix} Featured zoom toolbar overlaps the venue by ${floorToolbarOverlap}px`);
  if (viewport.width <= 680) {
    assert.equal(
      await page.locator(".discovery-sponsored-rail > a").evaluateAll((cards) => cards.filter((card) => getComputedStyle(card).display !== "none").length),
      2,
      `${suffix} must show exactly two sponsors`,
    );
  }
  await assertNoOverflow(page, `${suffix} Daily Featured`);
  await assertViewportBounded(page, `${suffix} Daily Featured`);
  await page.screenshot({ path: path.join(output, `featured-${suffix}.png`), caret: "initial" });

  if (viewport.width > 680) {
    await page.getByRole("button", { name: "Zoom in to featured showroom floor" }).click();
    await page.waitForTimeout(220);
    const boothBox = await page.locator(".featured-booth").first().boundingBox();
    assert.ok(boothBox, "Featured booth is required for pan evidence");
    const beforePan = await page.locator(".featured-floor").getAttribute("style");
    await page.mouse.move(boothBox.x + boothBox.width / 2, boothBox.y + boothBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(boothBox.x + boothBox.width / 2 + 90, boothBox.y + boothBox.height / 2 + 25, { steps: 6 });
    await page.mouse.up();
    const afterPan = await page.locator(".featured-floor").getAttribute("style");
    assert.notEqual(afterPan, beforePan, "A drag beginning on a Featured booth must pan the venue");
    assert.equal(await page.locator(".discovery-preview").count(), 0, "Panning from a booth must not open its inspector");
    await page.getByRole("button", { name: "Fit featured showroom floor to view" }).click();
  }

  const agenda = page.locator(".featured-agenda");
  if (await agenda.count()) {
    await agenda.locator("summary").click();
    assert.equal(await agenda.getAttribute("open"), "");
    const expandedFloorBox = await page.locator(".featured-floor-stage").boundingBox();
    assert.ok(expandedFloorBox && expandedFloorBox.height >= 170, `${suffix} expanded schedule hides the venue`);
    await assertViewportBounded(page, `${suffix} expanded Daily Featured`);
  }
  assert.deepEqual(state.errors, []);
  await state.context.close();
}

async function captureCityMarket(browser, viewport, suffix) {
  const state = await openPage(browser, "/", viewport);
  const { page } = state;
  await page.locator(".discovery-map-stage").waitFor();
  await page.locator("svg.discovery-map").waitFor();
  const zoomIn = viewport.width <= 680
    ? page.locator(".discovery-mobile-map-toolbar").getByRole("button", { name: "Zoom in" })
    : page.locator(".discovery-zoom").getByRole("button", { name: "Zoom in" });
  for (let attempt = 0; attempt < 8 && await page.locator(".discovery-city-gateway").count() === 0; attempt += 1) {
    await zoomIn.click();
    await page.waitForTimeout(240);
  }
  const gateway = page.locator(".discovery-city-gateway").first();
  await gateway.waitFor();
  await gateway.press("Enter");
  await page.locator(".city-showroom-stage").waitFor();
  await page.waitForTimeout(320);
  const stageBox = await page.locator(".city-showroom-stage").boundingBox();
  const toolbarBox = await page.locator(".venue-zoom-toolbar.city-showroom-actions").boundingBox();
  assert.ok(stageBox && stageBox.height >= (viewport.width > 680 ? 600 : 360), `${suffix} City Market does not fill the remaining workspace`);
  assert.ok(toolbarBox && stageBox && toolbarBox.y + toolbarBox.height <= stageBox.y + 1, `${suffix} City Market zoom toolbar overlaps the venue`);
  await assertNoOverflow(page, `${suffix} City Market`);
  await assertViewportBounded(page, `${suffix} City Market`);
  await page.screenshot({ path: path.join(output, `city-${suffix}.png`), caret: "initial" });
  const floorBox = await page.locator(".city-showroom-floor").boundingBox();
  const floorAspect = floorBox ? floorBox.width / floorBox.height : 0;
  assert.ok(floorAspect > 0, `${suffix} City Market floor must render`);
  assert.deepEqual(state.errors, []);
  await state.context.close();
  return floorAspect;
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.MIRTPAGE_PLAYWRIGHT_EXECUTABLE_PATH || undefined,
});

try {
  const legacy = await openPage(browser, "/discover?industry=electronics&view=list", { width: 960, height: 800 });
  await legacy.page.waitForURL((url) => url.pathname === "/" && url.searchParams.get("industry") === "electronics" && url.searchParams.get("view") === "list");
  assert.deepEqual(legacy.errors, []);
  await legacy.context.close();

  const legacySponsors = await openPage(browser, "/sponsors", { width: 960, height: 800 });
  await legacySponsors.page.waitForURL((url) => url.pathname === "/featured");
  assert.deepEqual(legacySponsors.errors, []);
  await legacySponsors.context.close();

  await captureMarket(browser, { width: 1440, height: 1000 }, "1440");
  await captureMarket(browser, { width: 390, height: 844 }, "390");
  await captureMarket(browser, { width: 320, height: 720 }, "320");

  const wideCityAspect = await captureCityMarket(browser, { width: 1440, height: 1000 }, "1440");
  const phoneCityAspect = await captureCityMarket(browser, { width: 390, height: 844 }, "390");
  assert.ok(phoneCityAspect < wideCityAspect, "City Market floor arrangement must respond to portrait and wide workspaces");

  await captureFeatured(browser, { width: 1440, height: 1000 }, "1440");
  await captureFeatured(browser, { width: 390, height: 844 }, "390");
  await captureFeatured(browser, { width: 320, height: 720 }, "320");

  const about = await openPage(browser, "/about", { width: 1440, height: 1000 });
  await about.page.locator(".about-hero").waitFor();
  assert.equal(await about.page.locator(".public-app-rail a[aria-current='page']").getAttribute("href"), "/about");
  assert.equal(await about.page.locator(".landing-header").count(), 0);
  await assertNoOverflow(about.page, "desktop About");
  await about.page.screenshot({ path: path.join(output, "about-1440.png"), caret: "initial" });
  assert.deepEqual(about.errors, []);
  await about.context.close();

  const mobile = await openPage(browser, "/", { width: 390, height: 844 });
  const navigation = mobile.page.getByRole("navigation", { name: "MirtPage application navigation" });
  await navigation.waitFor();
  assert.equal(await navigation.locator(":scope > a").count(), 3);
  assert.equal(await navigation.locator(":scope > button").count(), 1);
  assert.equal(await navigation.locator(":scope > a, :scope > button").evaluateAll((targets) => targets.every((target) => target.getBoundingClientRect().height >= 44)), true);
  await navigation.getByRole("button", { name: "More" }).click();
  const more = mobile.page.getByRole("dialog", { name: "More" });
  await more.waitFor();
  await mobile.page.screenshot({ path: path.join(output, "more-390.png"), caret: "initial" });
  await more.getByRole("button", { name: "Close navigation" }).click();
  assert.deepEqual(mobile.errors, []);
  await mobile.context.close();

  console.log(`Public application shell visuals passed: ${output}`);
} finally {
  await browser.close();
}
