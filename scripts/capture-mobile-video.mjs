import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  // Provider fixture tests our lifecycle/error UI deterministically. It is not playback evidence.
  await context.route("https://www.youtube.com/iframe_api", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: `window.YT={Player:function(id,c){const el=document.getElementById(id);el.innerHTML='<button id="provider-error">Simulate embedding denied</button>';el.querySelector('button').onclick=()=>c.events.onError({data:101});c.events.onReady({target:{getIframe:()=>el}});}};window.onYouTubeIframeAPIReady();`,
    }),
  );
  await page.goto("http://localhost:8082/shop/demo-aloe-field-care");
  const watch = page.getByRole("button", { name: "Watch video", exact: true });
  await expect(watch).toBeVisible({ timeout: 30000 });
  assert.equal(await page.locator('iframe[title="YouTube video"]').count(), 0);
  await watch.click();
  await expect(page.locator('iframe[title="YouTube video"]')).toBeVisible();
  await expect(page.getByText("Loading video…", { exact: true })).toHaveCount(
    0,
  );
  assert.equal(context.pages().length, 1);
  assert.match(page.url(), /\/shop\//);
  await page
    .frameLocator('iframe[title="YouTube video"]')
    .locator("#provider-error")
    .click();
  await expect(
    page.getByText("Video unavailable", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator('iframe[title="YouTube video"]')).toBeVisible();
  await page
    .getByRole("button", { name: "Aloe Body Lotion", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Add to inquiry list" }),
  ).toBeVisible();
  const videoThumb = page.getByRole("button", { name: /^Video \d+$/ }).first();
  await videoThumb.click();
  await page.getByRole("button", { name: "Watch video", exact: true }).click();
  await expect(page.locator('iframe[title="YouTube video"]')).toBeVisible();
  await page
    .getByRole("button", { name: /^Photo \d+$/ })
    .first()
    .click();
  await expect(page.locator('iframe[title="YouTube video"]')).toHaveCount(0);
  await videoThumb.click();
  await page.getByRole("button", { name: "Watch video", exact: true }).click();
  await expect(page.locator('iframe[title="YouTube video"]')).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.locator('iframe[title="YouTube video"]')).toHaveCount(0);
  await expect(watch).toBeVisible();
  assert.equal(context.pages().length, 1);
  assert.deepEqual(errors, []);
  console.log(
    "Passed embedded player fixture checks: poster, cover, gallery, retry, media/route cleanup, no external window. Actual device playback pending.",
  );
} finally {
  await browser.close();
}
