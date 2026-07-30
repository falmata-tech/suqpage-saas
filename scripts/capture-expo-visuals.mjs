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
  {
    name: "expo-venue-desktop",
    path: "/expo",
    viewport: { width: 1440, height: 1000 },
    openVenue: true,
  },
  {
    name: "expo-venue-mobile",
    path: "/expo",
    viewport: { width: 390, height: 844 },
    openVenue: true,
    denseHall: 1,
  },
  {
    name: "expo-venue-compact-hall-2",
    path: "/expo",
    viewport: { width: 320, height: 700 },
    openVenue: true,
    denseHall: 2,
  },
  {
    name: "expo-list-compact",
    path: "/expo",
    viewport: { width: 320, height: 700 },
    listView: true,
    minimumListCount: 50,
  },
  {
    name: "expo-preview-mobile",
    path: "/expo",
    viewport: { width: 390, height: 844 },
    openVenue: true,
    openBooth: true,
  },
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
      const messageText = message.text();
      const isNodeSqliteWarning = messageText.includes(
        "ExperimentalWarning: SQLite is an experimental feature",
      );
      if (message.type() === "error" && !isNodeSqliteWarning) {
        browserErrors.push(messageText);
      }
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    const response = await page.goto(`${baseUrl}${scenario.path}`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    await page.locator(".expo-regions path").first().waitFor();
    if (scenario.openVenue) {
      const selector = page.getByLabel("Jump to a host city");
      const options = await selector.locator("option").evaluateAll((entries) =>
        entries.slice(1).map((entry) => ({
          value: entry.getAttribute("value") || "",
          text: entry.textContent || "",
        })),
      );
      const addisHub = options.find((option) => option.text.includes("Addis Ababa"));
      const selectedHub = addisHub?.value || options[0]?.value;
      if (selectedHub) await selector.selectOption(selectedHub);
      await page.locator(".expo-venue-booth").first().waitFor();
      if (scenario.denseHall === 2) {
        await page.getByRole("button", { name: "Hall 2", exact: true }).click();
      }
    }
    if (scenario.listView) {
      await page.getByRole("tab", { name: "List View" }).click();
      await page.locator(".expo-list-card").first().waitFor();
    }
    if (scenario.openBooth) {
      await page.locator(".expo-venue-booth").first().click();
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
      const aisle = document.querySelector(".expo-venue-aisle")?.getBoundingClientRect();
      const mapStage = document.querySelector(".expo-map-stage");
      const map = document.querySelector(".expo-map");
      const venue = document.querySelector(".expo-venue-context");
      const cityContext = document.querySelector(".expo-city-context");
      const venueBoothCenters = [...document.querySelectorAll(".expo-venue-booth")]
        .filter(visible)
        .map((booth) => {
          const bounds = booth.getBoundingClientRect();
          return bounds.left + bounds.width / 2;
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
        zonePaths: document.querySelectorAll(".expo-zones path").length,
        placeLabels: document.querySelectorAll(".expo-place-labels text").length,
        roadPaths: document.querySelectorAll(".expo-roads path").length,
        mapVisible: Boolean(map && visible(map)),
        mapOpacity: map ? Number(getComputedStyle(map).opacity) : 0,
        contextualVenue: Boolean(
          mapStage &&
          venue &&
          mapStage.classList.contains("expo-map-stage-venue") &&
          mapStage.contains(map) &&
          mapStage.contains(venue),
        ),
        cityContextVisible: Boolean(cityContext && visible(cityContext)),
        venueBooths: document.querySelectorAll(".expo-venue-booth").length,
        hallTabs: document.querySelectorAll(".expo-hall-tabs button").length,
        listCards: document.querySelectorAll(".expo-list-card").length,
        venueBoothsLeftOfAisle: aisle
          ? venueBoothCenters.filter((center) => center < aisle.left).length
          : 0,
        venueBoothsRightOfAisle: aisle
          ? venueBoothCenters.filter((center) => center > aisle.right).length
          : 0,
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
    (!result.listView && result.mapRegions !== 14) ||
    (!result.listView && result.hubs < 1) ||
    (!result.listView && result.zonePaths < 100) ||
    (!result.listView && result.placeLabels < 1) ||
    (!result.listView && result.roadPaths < 1) ||
    (!result.listView && !result.mapVisible) ||
    (result.openVenue &&
      (!result.contextualVenue ||
        !result.cityContextVisible ||
        result.mapOpacity < 0.25 ||
        result.venueBooths > 12)) ||
    (result.denseHall === 1 &&
      (result.hallTabs !== 2 || result.venueBooths < 1 || result.venueBooths > 12)) ||
    (result.denseHall === 2 &&
      (result.hallTabs !== 2 || result.venueBooths < 1 || result.venueBooths > 12)) ||
    (result.minimumListCount &&
      result.listCards < result.minimumListCount) ||
    (result.venueBooths > 1 &&
      (result.venueBoothsLeftOfAisle < 1 || result.venueBoothsRightOfAisle < 1)) ||
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
