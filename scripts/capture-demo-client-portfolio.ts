import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";

const benchmarkHandles = [
  "selam-weave",
  "afia-botanics",
  "warka-furniture",
  "addis-metalworks",
  "green-terrace-farm",
  "blue-nile-apiary",
  "rift-valley-mill",
  "entoto-ceramics",
  "koba-leather",
  "nova-assembly",
];
const allHandles = [
  ...benchmarkHandles,
  ...SCALE_DEMO_BUSINESSES.map((business) => business.handle),
];
const offset = Number.parseInt(process.env.MIRTPAGE_VISUAL_OFFSET || "0", 10);
const limit = Number.parseInt(process.env.MIRTPAGE_VISUAL_LIMIT || String(allHandles.length), 10);
const handles = allHandles.slice(offset, offset + limit);
const baseUrl = process.env.MIRTPAGE_VISUAL_BASE_URL || "http://127.0.0.1:3001";
const outputDir = process.env.MIRTPAGE_VISUAL_OUTPUT_DIR || path.join("/tmp", "mirtpage-demo-client-portfolio");
const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};
const selectedViewport = process.env.MIRTPAGE_VISUAL_VIEWPORT;
const selectedViewports = Object.fromEntries(
  Object.entries(viewports).filter(([name]) => !selectedViewport || name === selectedViewport),
);

fs.mkdirSync(outputDir, { recursive: true });
async function main() {
const browser = await chromium.launch({ headless: true });
const results: Array<Record<string, unknown>> = [];

try {
  for (const [viewportName, viewport] of Object.entries(selectedViewports)) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
    for (const handle of handles) {
      const page = await context.newPage();
      const browserErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error" && !message.text().includes("ExperimentalWarning: SQLite")) {
          browserErrors.push(message.text());
        }
      });
      page.on("pageerror", (error) => browserErrors.push(error.message));
      const response = await page.goto(`${baseUrl}/@${handle}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForSelector("[data-composition-schema]", { timeout: 15_000 });
      await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0));
      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const composition = document.querySelector("[data-composition-schema]");
        const sections = Array.from(composition?.querySelectorAll("[data-slot]") || []);
        const productCards = Array.from(document.querySelectorAll('[data-slot="catalog"] article'));
        const productImages = Array.from(document.querySelectorAll<HTMLImageElement>('[data-slot="catalog"] article img'));
        const headerLogo = document.querySelector<HTMLImageElement>('[data-slot="header"] img');
        const heroImages = Array.from(document.querySelectorAll<HTMLImageElement>('[data-slot="hero"] img'));
        const floatingInquiry = document.querySelector<HTMLElement>(".floating-inquiry-trigger");
        const floatingBounds = floatingInquiry?.getBoundingClientRect();
        const textOverflow = Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3,p,a,button"))
          .filter((element) => {
            const style = getComputedStyle(element);
            return !["auto", "scroll"].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2;
          })
          .map((element) => `${element.tagName.toLowerCase()}:${(element.textContent || "").trim().slice(0, 60)}`);
        return {
          title: document.title,
          schema: composition?.getAttribute("data-composition-schema") || "",
          viewportWidth: root.clientWidth,
          pageWidth: root.scrollWidth,
          pageHeight: root.scrollHeight,
          horizontalOverflow: root.scrollWidth > root.clientWidth + 1,
          browserImageCount: document.images.length,
          brokenImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth < 1).map((image) => image.src),
          textOverflow,
          sectionSlots: sections.map((section) => section.getAttribute("data-slot")),
          surfaces: sections.map((section) => section.getAttribute("data-surface")),
          components: sections.map((section) => section.getAttribute("data-variant")),
          mediaTreatments: sections.map((section) => section.getAttribute("data-media-integration")).filter(Boolean),
          productCount: productCards.length,
          productImageCount: productImages.filter((image) => image.complete && image.naturalWidth > 0).length,
          logoLoaded: Boolean(headerLogo?.complete && headerLogo.naturalWidth > 0),
          heroLoaded: heroImages.some((image) => image.complete && image.naturalWidth > 0),
          inquiry: floatingInquiry && floatingBounds ? {
            position: getComputedStyle(floatingInquiry).position,
            visible: floatingInquiry.getClientRects().length > 0,
            width: Math.round(floatingBounds.width),
            height: Math.round(floatingBounds.height),
            right: Math.round(root.clientWidth - floatingBounds.right),
            bottom: Math.round(innerHeight - floatingBounds.bottom),
          } : null,
        };
      });
      const screenshot = path.join(outputDir, `${handle}-${viewportName}.png`);
      await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled", caret: "initial" });
      results.push({ handle, viewport: viewportName, status: response?.status() || 0, browserErrors, screenshot, ...metrics });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = results.filter((entry) => {
  const result = entry as {
    status: number;
    browserErrors: string[];
    horizontalOverflow: boolean;
    brokenImages: string[];
    textOverflow: string[];
    sectionSlots: Array<string | null>;
    surfaces: Array<string | null>;
    productCount: number;
    productImageCount: number;
    logoLoaded: boolean;
    heroLoaded: boolean;
    inquiry: null | { position: string; visible: boolean; width: number; height: number; right: number; bottom: number };
    viewport: string;
  };
  return result.status !== 200 ||
    result.browserErrors.length > 0 ||
    result.horizontalOverflow ||
    result.brokenImages.length > 0 ||
    result.textOverflow.length > 0 ||
    result.sectionSlots.join(">") !== "header>hero>content>content>catalog>callToAction>footer" ||
    result.surfaces.join(">") !== "surface>accent-soft>surface>secondary-soft>canvas>strong>inverse" ||
    result.productCount !== 4 ||
    result.productImageCount !== 4 ||
    !result.logoLoaded ||
    !result.heroLoaded ||
    !result.inquiry ||
    result.inquiry.position !== "fixed" ||
    !result.inquiry.visible ||
    result.inquiry.right < 8 ||
    result.inquiry.bottom < 8 ||
    (result.viewport === "mobile" && (result.inquiry.width < 44 || result.inquiry.width > 56 || result.inquiry.height < 44));
});

async function createContactSheet(viewport: string, columns: number, tileWidth: number, tileHeight: number) {
  const captures = results.filter((result) => result.viewport === viewport) as Array<{ handle: string; screenshot: string }>;
  const rows = Math.ceil(captures.length / columns);
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  for (const [index, capture] of captures.entries()) {
    const left = (index % columns) * tileWidth;
    const top = Math.floor(index / columns) * tileHeight;
    const image = await sharp(capture.screenshot).resize({ width: tileWidth - 12, height: tileHeight - 34, fit: "contain", position: "top", background: "#ffffff" }).png().toBuffer();
    const label = Buffer.from(`<svg width="${tileWidth}" height="28" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#17131f"/><text x="8" y="19" fill="#fff" font-family="Arial" font-size="11" font-weight="700">${capture.handle}</text></svg>`);
    composites.push({ input: label, left, top });
    composites.push({ input: image, left: left + 6, top: top + 28 });
  }
  const output = path.join(outputDir, `contact-sheet-${viewport}.png`);
  await sharp({ create: { width: columns * tileWidth, height: rows * tileHeight, channels: 3, background: "#dfe3e8" } }).composite(composites).png().toFile(output);
  return output;
}

const contactSheets: Record<string, string> = {};
if (!selectedViewport || selectedViewport === "desktop") {
  contactSheets.desktop = await createContactSheet("desktop", 6, 250, 920);
}
if (!selectedViewport || selectedViewport === "mobile") {
  contactSheets.mobile = await createContactSheet("mobile", 6, 210, 1200);
}
const reportPath = path.join(outputDir, "report.json");
fs.writeFileSync(reportPath, `${JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), offset, limit, contactSheets, failures, results }, null, 2)}\n`);
console.log(`${results.length} portfolio captures written to ${outputDir}; ${failures.length} automated failures.`);
if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.handle}/${failure.viewport}: ${JSON.stringify(failure)}`);
  }
  process.exitCode = 1;
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
