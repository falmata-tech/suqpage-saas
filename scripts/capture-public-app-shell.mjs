import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "africmade-public-app-shell");
const scope = process.env.MIRTPAGE_CAPTURE_SCOPE || "all";
fs.mkdirSync(output, { recursive: true });

async function openPage(browser, route, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
  await page.locator("main").waitFor();
  return { context, page, errors };
}

async function assertNoHorizontalOverflow(page, label) {
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    true,
    `${label} has horizontal overflow`,
  );
}

async function waitForHydration(locator) {
  await locator.waitFor();
  await locator.page().waitForFunction((element) => (
    element instanceof HTMLElement
    && Object.keys(element).some((key) => key.startsWith("__reactProps$"))
  ), await locator.elementHandle());
}

async function renderedMediaPath(imageLocator, label) {
  await imageLocator.waitFor();
  await imageLocator.evaluate(async (image) => {
    if (!(image instanceof HTMLImageElement)) throw new Error("Expected an image element");
    if (!image.complete || image.naturalWidth === 0) await image.decode();
    if (image.naturalWidth === 0) throw new Error("Image decoded without pixels");
  });
  const source = await imageLocator.getAttribute("src");
  assert.ok(source, `${label} has a rendered image source`);
  const parsed = new URL(source, baseURL);
  const mediaPath = parsed.pathname === "/_next/image" ? parsed.searchParams.get("url") : parsed.pathname;
  assert.ok(mediaPath, `${label} resolves its underlying media path`);
  const expectedHeroPath = await imageLocator.locator("xpath=ancestor::*[@data-hero-image][1]").getAttribute("data-hero-image");
  assert.ok(expectedHeroPath, `${label} declares its published page hero`);
  assert.equal(mediaPath, expectedHeroPath, `${label} uses the published page hero`);
  assert.doesNotMatch(mediaPath, /showroom-booths|(?:^|\/)booths(?:\/|$)/i, `${label} does not use legacy booth artwork`);
  return mediaPath;
}

async function captureMapPreview(browser, viewport, suffix) {
  const state = await openPage(browser, "/?industry=electronics", viewport);
  const { page } = state;
  const mapStage = page.locator(".discovery-map-stage");
  await mapStage.waitFor();
  const zoomIn = page.getByRole("button", { name: "Zoom in", exact: true });
  for (let attempt = 0; attempt < 10 && await page.locator(".mp-map-showroom").count() === 0; attempt += 1) {
    await zoomIn.click();
    await page.waitForTimeout(240);
  }
  const markerIndex = await page.locator(".mp-map-showroom").evaluateAll((markers) => {
    const stage = document.querySelector(".discovery-map-stage")?.getBoundingClientRect();
    if (!stage) return -1;
    return markers.findIndex((marker) => {
      const bounds = marker.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      return centerX >= stage.left && centerX <= stage.right && centerY >= stage.top && centerY <= stage.bottom;
    });
  });
  assert.ok(markerIndex >= 0, `${suffix} exposes a visible individual page marker`);
  const point = page.locator(".mp-map-showroom").nth(markerIndex);
  const marker = point.locator("xpath=..");
  const markerBounds = await marker.boundingBox();
  assert.ok(markerBounds && markerBounds.width >= 44 && markerBounds.width <= 46, `${suffix} keeps the page marker target no wider than a cluster`);
  await marker.hover();
  assert.doesNotMatch(await point.locator(".mp-map-storefront").evaluate((element) => getComputedStyle(element).boxShadow), /0px 0px 0px/, `${suffix} page marker has no decorative hover halo`);
  const showroomId = await point.getAttribute("data-showroom-id");
  await marker.click();
  const preview = page.locator(".discovery-preview-layer-map .discovery-preview");
  if (!await preview.isVisible().catch(() => false)) {
    await page.waitForFunction(() => Number(document.querySelector(".discovery-map")?.getAttribute("data-map-zoom") || 0) >= 12);
    await page.locator(`.mp-map-showroom[data-showroom-id="${showroomId}"]`).locator("xpath=..").click();
  }
  await preview.waitFor();
  await renderedMediaPath(preview.locator("article > img"), `${suffix} map preview`);
  const bounds = await preview.boundingBox();
  const mapBounds = await mapStage.boundingBox();
  assert.ok(bounds && mapBounds, `${suffix} provides measurable preview and map bounds`);
  assert.ok(bounds.x >= mapBounds.x - 1 && bounds.x + bounds.width <= mapBounds.x + mapBounds.width + 1, `${suffix} preview stays within the map horizontally`);
  assert.ok(bounds.y >= mapBounds.y - 1 && bounds.y + bounds.height <= mapBounds.y + mapBounds.height + 1, `${suffix} preview stays within the map vertically`);
  assert.ok(Math.abs(bounds.x + bounds.width / 2 - (mapBounds.x + mapBounds.width / 2)) <= 2, `${suffix} preview is centered on the map`);
  await assertNoHorizontalOverflow(page, `${suffix} map preview`);
  await page.screenshot({ path: path.join(output, `market-preview-${suffix}.png`), caret: "initial" });
  assert.deepEqual(state.errors, []);
  await state.context.close();
}

async function captureAbout(browser, viewport, suffix) {
  const state = await openPage(browser, "/about", viewport);
  const { page } = state;
  await page.getByRole("heading", { name: "A stronger market starts closer to home." }).waitFor();
  assert.equal(await page.locator(".about-principles article").count(), 3, `${suffix} About presents three vision principles`);
  assert.equal(await page.getByText(/transport arrangements|report a concern|commercial terms/i).count(), 0, `${suffix} About contains no support or transaction policy copy`);
  if (viewport.width <= 680) {
    const launcher = page.getByRole("button", { name: "Get help" });
    const launcherBounds = await launcher.boundingBox();
    assert.ok(launcherBounds && launcherBounds.width <= 48 && launcherBounds.height >= 44, `${suffix} keeps mobile help compact and touch accessible`);
    assert.equal(await launcher.evaluate((button) => getComputedStyle(button).position), "absolute", `${suffix} About help scrolls with the opening visual`);
  }
  await assertNoHorizontalOverflow(page, `${suffix} About`);
  await page.screenshot({ path: path.join(output, `about-${suffix}.png`), caret: "initial", fullPage: true });
  assert.deepEqual(state.errors, []);
  await state.context.close();
}

async function captureMarket(browser, viewport, suffix) {
  const state = await openPage(browser, "/", viewport);
  const { page } = state;
  await page.locator(".discovery-map-stage").waitFor();
  const chooser = page.locator(".discovery-industry-start");
  await chooser.waitFor();
  assert.equal(await chooser.getByRole("link").count(), 8, `${suffix} exposes seven categories plus All categories`);
  assert.match(await chooser.getByRole("link").last().textContent(), /All categories/, `${suffix} keeps All categories last`);
  await page.locator(".mp-map-cluster,.mp-map-showroom").first().waitFor();
  assert.ok(await page.locator(".mp-map-cluster,.mp-map-showroom").count() > 0, `${suffix} renders combined results behind the reminder`);
  await assertNoHorizontalOverflow(page, `${suffix} orientation reminder`);
  await page.screenshot({ path: path.join(output, `market-orientation-${suffix}.png`), caret: "initial" });

  await chooser.getByRole("link", { name: /All categories/ }).click();
  await page.waitForURL((url) => url.searchParams.get("industry") === "all");
  await page.locator(".discovery-map-stage").waitFor();
  assert.equal(await page.locator(".discovery-industry-start").count(), 0, `${suffix} closes the reminder after an explicit choice`);
  assert.equal(await page.locator(".daily-featured").count(), 0, "Market does not mount Daily Featured");
  assert.equal(await page.locator(".discovery-sponsored").count(), 0, "Market does not mount Sponsors");
  await assertNoHorizontalOverflow(page, `${suffix} Market`);
  await page.screenshot({ path: path.join(output, `market-${suffix}.png`), caret: "initial" });

  const visibleSearch = page.locator('.discovery-summary .discovery-search:visible input[name="q"]');
  await visibleSearch.fill("soap");
  await visibleSearch.press("Enter");
  await page.waitForURL((url) => url.searchParams.get("view") === "search" && url.searchParams.get("q") === "soap");
  const searchWorkspace = page.locator(".discovery-search-workspace");
  await searchWorkspace.waitFor();
  assert.equal(await page.locator(".discovery-map.leaflet-container").count(), 0, `${suffix} Search replaces the map canvas`);
  assert.equal(await searchWorkspace.getByRole("navigation", { name: "Search result type" }).getByRole("link").count(), 3, `${suffix} Search offers All, Products, and Businesses`);
  assert.ok(await page.locator(".discovery-product-results > button,.discovery-business-results > button").count() > 0, `${suffix} Search renders matching cards`);
  await assertNoHorizontalOverflow(page, `${suffix} Search`);
  await page.screenshot({ path: path.join(output, `market-search-${suffix}.png`), caret: "initial" });
  await searchWorkspace.getByRole("link", { name: /Products 4/ }).click();
  await page.waitForURL((url) => url.searchParams.get("type") === "products");
  assert.ok(await page.locator(".discovery-product-results > button").count() > 0, `${suffix} Products keeps product matches`);
  assert.equal(await page.locator(".discovery-business-results").count(), 0, `${suffix} Products hides business matches`);
  await page.getByRole("navigation", { name: "Search result type" }).getByRole("link", { name: /Businesses 1/ }).click();
  await page.waitForURL((url) => url.searchParams.get("type") === "businesses");
  assert.ok(await page.locator(".discovery-business-results > button").count() > 0, `${suffix} Businesses keeps business matches`);
  assert.equal(await page.locator(".discovery-product-results").count(), 0, `${suffix} Businesses hides product matches`);
  await page.getByRole("navigation", { name: "Search result type" }).getByRole("link", { name: /All 5/ }).click();
  await page.waitForURL((url) => url.searchParams.get("type") === "all");
  await page.locator(".discovery-product-results > button").first().click();
  const searchPreview = page.locator(".discovery-preview-layer-map .discovery-preview");
  await searchPreview.waitFor();
  assert.equal(new URL(page.url()).pathname, "/", `${suffix} result selection opens the inspector before navigation`);
  await searchPreview.getByRole("button", { name: "Close page preview" }).click();
  await searchWorkspace.getByRole("link", { name: "Map", exact: true }).click();
  await page.waitForURL((url) => url.searchParams.get("view") === "map" && url.searchParams.get("q") === "soap");
  await page.locator(".discovery-map.leaflet-container").waitFor();
  await page.locator('.discovery-summary .discovery-search:visible').getByRole("button", { name: "Clear marketplace search" }).click();
  await page.waitForURL((url) => !url.searchParams.has("q") && url.searchParams.get("view") === "map");
  await page.locator(".mp-map-cluster,.mp-map-showroom").first().waitFor();

  const zoomIn = page.getByRole("button", { name: "Zoom in", exact: true });
  for (let attempt = 0; attempt < 10 && await page.locator(".mp-map-nearby").count() === 0; attempt += 1) {
    const clusters = page.locator(".mp-map-cluster");
    const clusterIndex = await clusters.evaluateAll((items) => items.reduce((largest, item, index) => {
      const marker = item.closest(".leaflet-marker-icon");
      const bounds = marker?.getBoundingClientRect();
      if (!marker || !bounds) return largest;
      const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      if (hit?.closest(".leaflet-marker-icon") !== marker) return largest;
      const count = Number(item.querySelector("b")?.textContent || 0);
      return count > largest.count ? { count, index } : largest;
    }, { count: -1, index: -1 }).index);
    if (clusterIndex >= 0) await clusters.nth(clusterIndex).locator("xpath=..").click();
    else await zoomIn.click();
    await page.waitForTimeout(420);
  }
  const nearbyMarker = page.locator(".mp-map-nearby").first();
  await nearbyMarker.waitFor({ state: "attached" });
  await nearbyMarker.dispatchEvent("click");
  const nearbyViewer = page.locator(".nearby-showroom-viewer");
  await nearbyViewer.waitFor();
  const nearbyMetrics = await nearbyViewer.evaluate((viewer) => {
    const cards = [...viewer.querySelectorAll(".nearby-showroom-grid > button")].map((card) => card.getBoundingClientRect());
    const bounds = viewer.getBoundingClientRect();
    return {
      count: cards.length,
      outside: cards.filter((card) => card.left < bounds.left - 1 || card.right > bounds.right + 1 || card.top < bounds.top - 1 || card.bottom > bounds.bottom + 1).length,
      internalScroll: viewer.scrollHeight - viewer.clientHeight,
      width: bounds.width,
    };
  });
  assert.ok(nearbyMetrics.count >= 2 && nearbyMetrics.count <= 6, `${suffix} nearby viewer contains two to six cards`);
  assert.equal(nearbyMetrics.outside, 0, `${suffix} nearby cards stay inside the viewer`);
  assert.ok(nearbyMetrics.internalScroll <= 1, `${suffix} nearby viewer has no internal scroll`);
  assert.ok(nearbyMetrics.width <= viewport.width - 8, `${suffix} nearby viewer fits the viewport`);
  await assertNoHorizontalOverflow(page, `${suffix} nearby viewer`);
  await page.screenshot({ path: path.join(output, `market-nearby-${suffix}.png`), caret: "initial" });
  await nearbyViewer.locator(".nearby-showroom-grid > button").first().click();
  const nearbyDetail = nearbyViewer.locator(".nearby-showroom-detail");
  await nearbyDetail.waitFor();
  assert.equal(await page.locator(".nearby-showroom-viewer").count(), 1, `${suffix} retains one nearby inspector`);
  assert.equal(await page.locator(".discovery-preview-layer").count(), 0, `${suffix} does not stack a portal preview over nearby results`);
  assert.equal(await nearbyViewer.locator(".nearby-showroom-grid").count(), 0, `${suffix} replaces the nearby list with showroom detail`);
  assert.equal(await page.locator(".public-support-launcher").evaluate((button) => getComputedStyle(button).visibility), "hidden", `${suffix} support launcher yields to the map inspector`);
  const detailBounds = await nearbyViewer.boundingBox();
  assert.ok(detailBounds && detailBounds.x >= 0 && detailBounds.x + detailBounds.width <= viewport.width, `${suffix} detail inspector fits the viewport`);
  await page.screenshot({ path: path.join(output, `market-nearby-detail-${suffix}.png`), caret: "initial" });
  await nearbyViewer.getByRole("button", { name: "Back to results" }).click();
  await nearbyViewer.locator(".nearby-showroom-grid").waitFor();
  assert.equal(await nearbyViewer.locator(".nearby-showroom-detail").count(), 0, `${suffix} Back restores the nearby list`);
  assert.deepEqual(state.errors, []);
  await state.context.close();
}

async function captureFeatured(browser, viewport, suffix) {
  const state = await openPage(browser, "/featured", viewport);
  const { page } = state;
  await page.locator(".daily-featured").waitFor();
  await page.locator(".featured-gallery").waitFor();
  await page.locator(".featured-card").first().waitFor();
  assert.equal(await page.locator("main h1").count(), 1, `${suffix} Daily Featured has one H1`);
  assert.equal(await page.locator(".featured-floor,.featured-booth").count(), 0, `${suffix} contains no retired venue UI`);
  assert.equal(await page.locator(".discovery-sponsored-rail > a").count(), 5, `${suffix} discloses the complete sponsor pool`);
  const gallery = await page.locator(".featured-gallery").evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const cards = [...element.querySelectorAll(".featured-card")].map((card) => card.getBoundingClientRect());
    return {
      horizontalOverflow: element.scrollWidth - element.clientWidth,
      cards: cards.length,
      minimumWidth: Math.min(...cards.map((card) => card.width)),
      outside: cards.filter((card) => card.left < bounds.left - 1 || card.right > bounds.right + 1).length,
    };
  });
  assert.ok(gallery.cards > 0 && gallery.cards <= 40, `${suffix} renders the bounded Featured program`);
  assert.ok(gallery.minimumWidth >= (viewport.width <= 350 ? 130 : 150), `${suffix} cards remain readable`);
  assert.ok(gallery.horizontalOverflow <= 1 && gallery.outside === 0, `${suffix} gallery does not pan sideways`);
  if (viewport.width <= 680) {
    assert.equal(
      await page.locator(".discovery-sponsored-rail > a").evaluateAll((cards) => cards.filter((card) => getComputedStyle(card).display !== "none").length),
      2,
      `${suffix} shows two mobile sponsors`,
    );
  }
  await assertNoHorizontalOverflow(page, `${suffix} Daily Featured`);
  await page.screenshot({ path: path.join(output, `featured-${suffix}.png`), caret: "initial", fullPage: viewport.width > 680 });
  const firstFeaturedCard = page.locator(".featured-card[data-business-id]").first();
  await waitForHydration(firstFeaturedCard);
  const cardHeroPath = await renderedMediaPath(firstFeaturedCard.locator(".featured-card-media > img"), `${suffix} Featured card`);
  await firstFeaturedCard.click();
  await page.locator(".discovery-preview[role='dialog']").waitFor();
  const previewHeroPath = await renderedMediaPath(page.locator(".discovery-preview[role='dialog'] article > img"), `${suffix} Featured preview`);
  assert.equal(previewHeroPath, cardHeroPath, `${suffix} Featured card and preview use the same page hero`);
  await page.screenshot({ path: path.join(output, `featured-preview-${suffix}.png`), caret: "initial" });
  assert.deepEqual(state.errors, []);
  await state.context.close();
}

async function captureSupport(browser, viewport, suffix) {
  const state = await openPage(browser, "/", viewport);
  const { page } = state;
  const launcher = page.getByRole("button", { name: "Get help" });
  await waitForHydration(launcher);
  await launcher.click();
  const dialog = page.getByRole("dialog", { name: "AfricMade help" });
  await dialog.waitFor();
  const category = dialog.getByLabel("What do you need?");
  await category.waitFor();
  assert.equal(await category.locator("option").count(), 2, `${suffix} support exposes only platform help and transport arrangements`);
  assert.equal(await dialog.getByLabel("Email").count(), 1, `${suffix} support requests a reconnect email`);
  assert.equal(await dialog.getByLabel("Phone").count(), 1, `${suffix} support requests a reconnect phone number`);
  assert.equal(await dialog.getByLabel("Email").getAttribute("required"), "", `${suffix} reconnect email is required`);
  assert.equal(await dialog.getByLabel("Phone").getAttribute("required"), "", `${suffix} reconnect phone is required`);
  assert.match(await dialog.textContent(), /continue by email or phone if this chat disconnects/i, `${suffix} explains why reconnect details are required`);
  assert.match(await dialog.textContent(), /buying, payment, product details, and commercial terms stay between you and the listed operation/i);
  const box = await dialog.boundingBox();
  assert.ok(box && box.x >= -1 && box.x + box.width <= viewport.width + 1, `${suffix} support drawer fits the viewport`);
  await assertNoHorizontalOverflow(page, `${suffix} support drawer`);
  await page.screenshot({ path: path.join(output, `support-${suffix}.png`), caret: "initial" });
  if (suffix === "390") {
    await dialog.getByLabel("Email").fill("visitor@example.test");
    await dialog.getByLabel("Phone").fill("+251911223344");
    await dialog.getByLabel("Your message").fill("Please help me arrange transport for this purchase.");
    await dialog.locator("input[type=file]").setInputFiles({
      name: "purchase-details.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
    });
    await dialog.getByRole("button", { name: "Send" }).click();
    await dialog.getByRole("button", { name: "End chat" }).waitFor();
    const attachment = dialog.getByRole("link", { name: /purchase-details\.pdf/i });
    await attachment.waitFor();
    const attachmentResponse = await page.request.get(new URL(await attachment.getAttribute("href"), baseURL).toString());
    assert.equal(attachmentResponse.status(), 200, "the token-owned visitor can read the private attachment");
    assert.match(attachmentResponse.headers()["content-type"] || "", /application\/pdf/);
    assert.match(attachmentResponse.headers()["cache-control"] || "", /private, no-store/);
    await page.screenshot({ path: path.join(output, "support-active-390.png"), caret: "initial" });
    page.once("dialog", (confirmation) => confirmation.accept());
    await dialog.getByRole("button", { name: "End chat" }).click();
    await dialog.getByText("Conversation closed").waitFor();
    await dialog.getByRole("button", { name: "Start another chat" }).waitFor();
    await page.screenshot({ path: path.join(output, "support-closed-390.png"), caret: "initial" });
    await dialog.getByRole("button", { name: "Start another chat" }).click();
    await dialog.getByLabel("Email").waitFor();
  }
  assert.deepEqual(state.errors, []);
  await state.context.close();
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.MIRTPAGE_PLAYWRIGHT_EXECUTABLE_PATH || undefined,
});

try {
  if (scope === "preview") {
    await captureMapPreview(browser, { width: 1440, height: 1000 }, "1440");
    await captureMapPreview(browser, { width: 390, height: 844 }, "390");
    await captureMapPreview(browser, { width: 320, height: 720 }, "320");
  }
  if (scope === "about") {
    await captureAbout(browser, { width: 1440, height: 1000 }, "1440");
    await captureAbout(browser, { width: 390, height: 844 }, "390");
    await captureAbout(browser, { width: 320, height: 720 }, "320");
  }
  if (scope === "all" || scope === "market") {
    await captureMarket(browser, { width: 1440, height: 1000 }, "1440");
    await captureMapPreview(browser, { width: 1440, height: 1000 }, "1440");
    await captureMarket(browser, { width: 390, height: 844 }, "390");
    await captureMapPreview(browser, { width: 390, height: 844 }, "390");
    await captureMarket(browser, { width: 320, height: 720 }, "320");
    await captureMapPreview(browser, { width: 320, height: 720 }, "320");
  }
  if (scope === "all" || scope === "featured") {
    await captureFeatured(browser, { width: 1440, height: 1000 }, "1440");
    await captureFeatured(browser, { width: 390, height: 844 }, "390");
    await captureFeatured(browser, { width: 320, height: 720 }, "320");
  }
  if (scope === "all" || scope === "support") {
    await captureSupport(browser, { width: 1440, height: 1000 }, "1440");
    await captureSupport(browser, { width: 390, height: 844 }, "390");
    await captureSupport(browser, { width: 320, height: 720 }, "320");
  }
  console.log(`Focused public application visuals passed: ${output}`);
} finally {
  await browser.close();
}
