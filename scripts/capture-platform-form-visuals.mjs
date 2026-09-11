import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const mailpitURL = process.env.MIRTPAGE_TEST_MAILPIT_URL || "http://127.0.0.1:54324";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || path.join("/tmp", "africmade-platform-form-visuals");
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const evidence = [];

async function capture(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.locator(".platform-task-shell").waitFor();
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.evaluate(() => {
    const context = document.querySelector(".platform-task-context");
    const controls = [...document.querySelectorAll(
      ".platform-form-panel input:not([type=hidden]):not([type=checkbox]), .platform-form-panel select, .platform-form-panel textarea, .platform-form-panel button, .platform-form-panel .consent-field label",
    )]
      .filter((control) => control.getClientRects().length > 0)
      .map((control) => Math.round(control.getBoundingClientRect().height));
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      contextColor: context ? getComputedStyle(context).backgroundColor : "",
      contextImage: context ? getComputedStyle(context).backgroundImage : "",
      controls,
      formVisible: Boolean(document.querySelector(".platform-form-panel form")?.getClientRects().length),
    };
  });
  assert.equal(metrics.documentWidth, metrics.viewportWidth, `${name} has no document overflow`);
  assert.equal(metrics.contextColor, "rgb(244, 244, 242)", `${name} uses the AfricMade neutral context`);
  assert.match(metrics.contextImage, /africmade-workspace-context-v1\.webp/, `${name} uses AfricMade artwork`);
  assert.equal(metrics.formVisible, true, `${name} keeps its form visible`);
  assert.ok(metrics.controls.length > 0 && metrics.controls.every((height) => height >= 44), `${name} controls are touch sized (${metrics.controls.join(", ")})`);
  const screenshot = path.join(output, `${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true, caret: "initial" });
  evidence.push({ name, screenshot, ...metrics });
}

async function latestCode(email) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await fetch(`${mailpitURL}/api/v1/messages`);
    if (response.ok) {
      const inbox = await response.json();
      const message = inbox.messages?.find((item) => item.To?.some((recipient) => recipient.Address === email));
      const code = /\b(\d{6})\b/.exec(message?.Snippet || "")?.[1];
      if (code) return code;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Local AfricMade OTP did not reach Mailpit.");
}

try {
  const loginContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const loginPage = await loginContext.newPage();
  const loginErrors = [];
  loginPage.on("pageerror", (error) => loginErrors.push(error.message));
  loginPage.on("console", (message) => { if (message.type() === "error") loginErrors.push(message.text()); });
  await loginPage.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  assert.equal(await loginPage.getByLabel("Email").count(), 1, "Login exposes email-code entry");
  assert.equal(await loginPage.getByRole("button", { name: "Continue with Google" }).count(), 1, "Login exposes Google entry");
  assert.equal(await loginPage.getByText(/being connected for launch/i).count(), 0, "Login exposes no rollout placeholder");
  await capture(loginPage, "login-desktop", { width: 1440, height: 1000 });
  await capture(loginPage, "login-mobile-390", { width: 390, height: 844 });
  assert.deepEqual(loginErrors, [], "Login has no browser errors");
  await loginContext.close();

  const onboardingContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const onboardingPage = await onboardingContext.newPage();
  const onboardingErrors = [];
  onboardingPage.on("pageerror", (error) => onboardingErrors.push(error.message));
  onboardingPage.on("console", (message) => { if (message.type() === "error") onboardingErrors.push(message.text()); });
  const email = `visual-${Date.now()}@africmade.local`;
  await onboardingPage.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  await onboardingPage.getByLabel("Email").fill(email);
  await onboardingPage.getByRole("button", { name: "Continue with email" }).click();
  await onboardingPage.getByLabel("Six-digit code").waitFor();
  await capture(onboardingPage, "login-code-mobile-390", { width: 390, height: 844 });
  await onboardingPage.getByLabel("Six-digit code").fill(await latestCode(email));
  await onboardingPage.getByRole("button", { name: "Continue", exact: true }).click();
  await onboardingPage.waitForURL(/\/request$/);
  await capture(onboardingPage, "onboarding-desktop", { width: 1440, height: 1000 });
  await capture(onboardingPage, "onboarding-mobile-390", { width: 390, height: 844 });
  await capture(onboardingPage, "onboarding-mobile-320", { width: 320, height: 700 });
  assert.deepEqual(onboardingErrors, [], "Passwordless onboarding has no browser errors");
  await onboardingContext.close();

  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
