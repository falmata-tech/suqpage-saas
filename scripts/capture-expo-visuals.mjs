import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = process.env.SUQPAGE_VISUAL_BASE_URL || "http://127.0.0.1:3001";
const outputDir =
  process.env.SUQPAGE_VISUAL_OUTPUT_DIR ||
  path.join("/tmp", "suqpage-expo-visuals");
const scenarios = [
  { name: "home-desktop", path: "/", viewport: { width: 1440, height: 1000 } },
  { name: "home-mobile", path: "/", viewport: { width: 390, height: 844 } },
  { name: "home-compact", path: "/", viewport: { width: 320, height: 700 } },
  { name: "expo-desktop", path: "/expo", viewport: { width: 1440, height: 1000 } },
  { name: "expo-mobile", path: "/expo", viewport: { width: 390, height: 844 } },
];

fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: scenario.viewport,
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const browserErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    const response = await page.goto(`${baseUrl}${scenario.path}`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    await page.locator(".expo-regions path").first().waitFor();
    if (scenario.name === "expo-mobile") {
      const selector = page.getByLabel("Jump to regional Expo");
      const firstHub = await selector.locator("option").nth(1).getAttribute("value");
      if (firstHub) await selector.selectOption(firstHub);
      await page.locator(".expo-booth-marker").first().waitFor();
      await page.locator(".expo-booth-marker").first().click();
    }

    const metrics = await page.evaluate(() => {
      const root = document.documentElement;
      const visible = (element) => element.getClientRects().length > 0;
      const textOverflow = [...document.querySelectorAll("h1,h2,h3,p,a,button,label")]
        .filter(visible)
        .filter((element) => {
          const style = getComputedStyle(element);
          return !["auto", "scroll"].includes(style.overflowX) &&
            element.scrollWidth > element.clientWidth + 2;
        })
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          text: (element.textContent || "").trim().slice(0, 80),
        }));
      const undersizedControls = [...document.querySelectorAll("button,select")]
        .filter(visible)
        .flatMap((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.height > 0 && bounds.height < 40
            ? [`${element.tagName.toLowerCase()}:${(element.textContent || element.getAttribute("aria-label") || "").trim()}`]
            : [];
        });
      return {
        pageWidth: root.scrollWidth,
        viewportWidth: root.clientWidth,
        horizontalOverflow: root.scrollWidth > root.clientWidth + 1,
        brokenImages: [...document.images]
          .filter((image) => image.complete && image.naturalWidth < 1)
          .map((image) => image.getAttribute("src")),
        mapRegions: document.querySelectorAll(".expo-regions path").length,
        hubs: document.querySelectorAll(".expo-hub").length,
        textOverflow,
        undersizedControls,
      };
    });
    const screenshot = path.join(outputDir, `${scenario.name}.png`);
    await page.screenshot({
      path: screenshot,
      fullPage: true,
      animations: "disabled",
    });
    results.push({
      ...scenario,
      status: response?.status() || 0,
      screenshot,
      browserErrors,
      ...metrics,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = results.filter(
  (result) =>
    result.status !== 200 ||
    result.browserErrors.length > 0 ||
    result.horizontalOverflow ||
    result.brokenImages.length > 0 ||
    result.mapRegions !== 14 ||
    result.hubs < 1 ||
    result.textOverflow.length > 0 ||
    (result.viewport.width <= 390 && result.undersizedControls.length > 0),
);
const reportPath = path.join(outputDir, "report.json");
fs.writeFileSync(
  reportPath,
  `${JSON.stringify({ baseUrl, failures, results }, null, 2)}\n`,
);
console.log(JSON.stringify({ outputDir, reportPath, failures }, null, 2));
if (failures.length) process.exitCode = 1;
