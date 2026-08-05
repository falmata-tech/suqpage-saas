import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "mirtpage-platform-form-visuals");
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const evidence = [];

async function capture(name, pathname, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(`${baseURL}${pathname}`, { waitUntil: "networkidle" });
  await page.locator(".platform-task-shell").waitFor();
  const metrics = await page.evaluate(() => {
    const context = document.querySelector(".platform-task-context");
    const controls = [...document.querySelectorAll(".platform-form-panel .field input:not([type=hidden]):not([type=checkbox]), .platform-form-panel .field textarea, .platform-form-panel button, .platform-form-panel .consent-field label")]
      .filter((control) => control.getClientRects().length > 0)
      .map((control) => Math.round(control.getBoundingClientRect().height));
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      contextColor: context ? getComputedStyle(context).backgroundColor : "",
      contextImage: context ? getComputedStyle(context).backgroundImage : "",
      controls,
      formVisible: Boolean(document.querySelector("form")?.getClientRects().length),
    };
  });
  assert.equal(metrics.documentWidth, metrics.viewportWidth, `${name} has no document overflow`);
  assert.equal(metrics.contextColor, "rgb(11, 29, 58)", `${name} uses the solid MirtPage midnight context`);
  assert.equal(metrics.contextImage, "none", `${name} does not use a promotional gradient`);
  assert.equal(metrics.formVisible, true, `${name} keeps its form visible`);
  assert.ok(
    metrics.controls.length > 0 && metrics.controls.every((height) => height >= 44),
    `${name} controls are touch sized (${metrics.controls.join(", ")})`,
  );
  assert.deepEqual(errors, [], `${name} has no browser errors`);
  const screenshot = path.join(output, `${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  evidence.push({ name, screenshot, ...metrics });
  await page.close();
}

try {
  await capture("login-desktop", "/login", { width: 1440, height: 1000 });
  await capture("login-mobile-390", "/login", { width: 390, height: 844 });
  await capture("request-desktop", "/request", { width: 1440, height: 1000 });
  await capture("request-mobile-390", "/request", { width: 390, height: 844 });
  await capture("request-mobile-320", "/request", { width: 320, height: 700 });
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
