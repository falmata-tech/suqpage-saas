import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-public-app-shell");
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

async function captureMarket(browser, viewport, suffix) {
  const state = await openPage(browser, "/", viewport);
  const { page } = state;
  await page.locator(".discovery-map-stage").waitFor();
  const chooser = page.locator(".discovery-industry-start");
  await chooser.waitFor();
  assert.equal(await chooser.getByRole("link").count(), 8, `${suffix} exposes seven industries plus All industries`);
  assert.match(await chooser.getByRole("link").last().textContent(), /All industries/, `${suffix} keeps All industries last`);
  await page.locator(".mp-map-cluster,.mp-map-showroom").first().waitFor();
  assert.ok(await page.locator(".mp-map-cluster,.mp-map-showroom").count() > 0, `${suffix} renders combined results behind the reminder`);
  await assertNoHorizontalOverflow(page, `${suffix} orientation reminder`);
  await page.screenshot({ path: path.join(output, `market-orientation-${suffix}.png`), caret: "initial" });

  await chooser.getByRole("link", { name: /All industries/ }).click();
  await page.waitForURL((url) => url.searchParams.get("industry") === "all");
  await page.locator(".discovery-map-stage").waitFor();
  assert.equal(await page.locator(".discovery-industry-start").count(), 0, `${suffix} closes the reminder after an explicit choice`);
  assert.equal(await page.locator(".daily-featured").count(), 0, "Market does not mount Daily Featured");
  assert.equal(await page.locator(".discovery-sponsored").count(), 0, "Market does not mount Sponsors");
  await assertNoHorizontalOverflow(page, `${suffix} Market`);
  await page.screenshot({ path: path.join(output, `market-${suffix}.png`), caret: "initial" });

  await page.locator(".discovery-map").hover();
  await page.mouse.wheel(0, -6_000);
  await page.waitForTimeout(300);
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
  await nearbyViewer.getByRole("button", { name: "Back to nearby" }).click();
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
  await page.locator(".featured-card").first().click();
  await page.locator(".discovery-preview[role='dialog']").waitFor();
  await page.screenshot({ path: path.join(output, `featured-preview-${suffix}.png`), caret: "initial" });
  assert.deepEqual(state.errors, []);
  await state.context.close();
}

async function captureSupport(browser, viewport, suffix) {
  const state = await openPage(browser, "/", viewport);
  const { page } = state;
  await page.getByRole("button", { name: "Ask MirtPage" }).click();
  const dialog = page.getByRole("dialog", { name: "Ask MirtPage" });
  await dialog.waitFor();
  const category = dialog.getByLabel("How can we help?");
  await category.waitFor();
  assert.equal(await category.locator("option").count(), 5, `${suffix} support exposes the bounded assistance categories`);
  assert.equal(await dialog.getByLabel("Email").count(), 1, `${suffix} support requests a reconnect email`);
  assert.equal(await dialog.getByLabel("Phone").count(), 1, `${suffix} support requests a reconnect phone number`);
  assert.equal(await dialog.getByLabel("Email").getAttribute("required"), "", `${suffix} reconnect email is required`);
  assert.equal(await dialog.getByLabel("Phone").getAttribute("required"), "", `${suffix} reconnect phone is required`);
  assert.match(await dialog.textContent(), /continue by email or phone if this chat disconnects/i, `${suffix} explains why reconnect details are required`);
  assert.match(await dialog.textContent(), /not certification, a guarantee, or an endorsement/i);
  const box = await dialog.boundingBox();
  assert.ok(box && box.x >= -1 && box.x + box.width <= viewport.width + 1, `${suffix} support drawer fits the viewport`);
  await assertNoHorizontalOverflow(page, `${suffix} support drawer`);
  await page.screenshot({ path: path.join(output, `support-${suffix}.png`), caret: "initial" });
  if (suffix === "390") {
    await dialog.getByLabel("Email").fill("visitor@example.test");
    await dialog.getByLabel("Phone").fill("+251911223344");
    await dialog.getByLabel("Your message").fill("Please review the attached production requirements.");
    await dialog.locator("input[type=file]").setInputFiles({
      name: "production-requirements.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
    });
    await dialog.getByRole("button", { name: "Send" }).click();
    await dialog.getByRole("button", { name: "End chat" }).waitFor();
    const attachment = dialog.getByRole("link", { name: /production-requirements\.pdf/i });
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
  if (scope === "all" || scope === "market") {
    await captureMarket(browser, { width: 1440, height: 1000 }, "1440");
    await captureMarket(browser, { width: 390, height: 844 }, "390");
    await captureMarket(browser, { width: 320, height: 720 }, "320");
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
