import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const handles = [
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
  "tekle-circuit-systems",
  "luna-cold-chain",
  "abyssinia-solar-devices",
  "nuru-naturals-lab",
  "bale-herb-care",
  "saba-soap-works",
  "geda-coffee-cooperative",
  "atlas-pump-works",
  "merkato-packaging-systems",
  "jimma-agro-machinery",
  "hadiya-woodcraft",
  "gurage-lighting-works",
  "sidama-workwear",
  "hawassa-loom-house",
  "dawa-water-solutions",
  "eastern-safety-gear",
  "gambela-recycled-paper",
  "baro-nursery-supplies",
];

const baseUrl = process.env.SUQPAGE_VISUAL_BASE_URL || "http://127.0.0.1:3001";
const outputDir =
  process.env.SUQPAGE_VISUAL_OUTPUT_DIR ||
  path.join("/tmp", "suqpage-showroom-benchmarks");
const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    for (const handle of handles) {
      const page = await context.newPage();
      const browserErrors = [];
      page.on("console", (message) => {
        const text = message.text();
        const isNodeSqliteWarning =
          text.includes("ExperimentalWarning: SQLite is an experimental feature");
        if (message.type() === "error" && !isNodeSqliteWarning) {
          browserErrors.push(text);
        }
      });
      page.on("pageerror", (error) => browserErrors.push(error.message));
      const response = await page.goto(`${baseUrl}/@${handle}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      await page.waitForSelector("[data-composition-schema]", { timeout: 15_000 });
      await page.waitForFunction(() =>
        Array.from(document.images).every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const sections = Array.from(
          document.querySelectorAll("[data-composition-schema] [data-variant]"),
        );
        const images = Array.from(document.images);
        const productCards = Array.from(
          document.querySelectorAll('[data-slot="catalog"] article'),
        );
        const floatingInquiry = document.querySelector(".floating-inquiry-trigger");
        const floatingInquiryBounds = floatingInquiry?.getBoundingClientRect();
        const textOverflow = Array.from(document.querySelectorAll("h1,h2,h3,p,a,button"))
          .filter((element) => {
            const style = getComputedStyle(element);
            if (style.overflowX === "auto" || style.overflowX === "scroll") {
              return false;
            }
            return element.scrollWidth > element.clientWidth + 2;
          })
          .map((element) => ({
            tag: element.tagName.toLowerCase(),
            text: (element.textContent || "").trim().slice(0, 80),
          }));
        return {
          title: document.title,
          pageWidth: root.scrollWidth,
          viewportWidth: root.clientWidth,
          pageHeight: root.scrollHeight,
          horizontalOverflow: root.scrollWidth > root.clientWidth + 1,
          brokenImages: images
            .filter((image) => !image.complete || image.naturalWidth < 1)
            .map((image) => image.getAttribute("src")),
          textOverflow,
          surfaceRoles: sections
            .map((section) => section.getAttribute("data-surface"))
            .filter(Boolean),
          mediaTreatments: sections
            .map((section) => section.getAttribute("data-media-integration"))
            .filter(Boolean),
          componentVariants: sections
            .map((section) => section.getAttribute("data-variant"))
            .filter(Boolean),
          sectionSlots: sections
            .map((section) => section.getAttribute("data-slot"))
            .filter(Boolean),
          sectionAlignments: sections
            .map((section) => section.getAttribute("data-alignment"))
            .filter(Boolean),
          contentBackgroundImages: sections
            .filter((section) => section.getAttribute("data-slot") === "content")
            .map((section) => getComputedStyle(section).backgroundImage),
          contentColumnCounts: sections
            .filter((section) => section.getAttribute("data-slot") === "content")
            .map((section) =>
              getComputedStyle(section).gridTemplateColumns.trim().split(/\s+/).length
            ),
          productCardWidths: productCards.map((card) =>
            Math.round(card.getBoundingClientRect().width),
          ),
          headerCommandCount: document.querySelectorAll(
            '[data-slot="header"] nav, [data-slot="header"] button',
          ).length,
          footerNavigationCount: document.querySelectorAll(
            '[data-slot="footer"] nav, [data-slot="footer"] button',
          ).length,
          floatingInquiry: floatingInquiry && floatingInquiryBounds
            ? {
                position: getComputedStyle(floatingInquiry).position,
                visible: floatingInquiry.getClientRects().length > 0,
                right: Math.round(root.clientWidth - floatingInquiryBounds.right),
                bottom: Math.round(window.innerHeight - floatingInquiryBounds.bottom),
                width: Math.round(floatingInquiryBounds.width),
                height: Math.round(floatingInquiryBounds.height),
              }
            : null,
        };
      });
      const screenshot = path.join(outputDir, `${handle}-${viewportName}.png`);
      await page.screenshot({
        path: screenshot,
        fullPage: true,
        animations: "disabled",
        caret: "initial",
      });
      results.push({
        handle,
        viewport: viewportName,
        status: response?.status() || 0,
        browserErrors,
        screenshot,
        ...metrics,
      });
      if (handle === "selam-weave") {
        await page
          .locator('[data-slot="catalog"] article')
          .first()
          .getByRole("button", { name: "Add to inquiry" })
          .click();
        const productDialog = page.locator(".product-dialog.open");
        if (await productDialog.isVisible()) {
          await productDialog
            .getByRole("button", { name: "Add selected item" })
            .click();
        }
        await page.locator(".floating-inquiry-trigger").click();
        await page.getByRole("dialog", { name: "Product inquiry" }).waitFor();
        await page.getByRole("button", { name: "Copy inquiry" }).click();
        await page.locator(".copied-reference").waitFor();
        await page.locator(".toast").waitFor({ state: "hidden" });
        await page.screenshot({
          path: path.join(outputDir, `inquiry-${viewportName}.png`),
          fullPage: false,
          animations: "disabled",
          caret: "initial",
        });
      }
      await page.close();
    }
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
    result.textOverflow.length > 0 ||
    result.headerCommandCount !== 0 ||
    result.footerNavigationCount !== 0 ||
    result.sectionSlots.join(">") !==
      "header>hero>content>content>catalog>callToAction>footer" ||
    result.surfaceRoles.join(">") !==
      "surface>accent-soft>surface>secondary-soft>canvas>strong>inverse" ||
    result.sectionAlignments.slice(0, 3).join(">") !== "start>start>end" ||
    !["start", "center"].includes(result.sectionAlignments.at(-1)) ||
    result.contentBackgroundImages.some((background) => background !== "none") ||
    !result.floatingInquiry ||
    result.floatingInquiry.position !== "fixed" ||
    !result.floatingInquiry.visible ||
    result.floatingInquiry.right < 8 ||
    result.floatingInquiry.bottom < 8 ||
    (result.viewport === "mobile" &&
      (result.floatingInquiry.width < 44 ||
        result.floatingInquiry.width > 56 ||
        result.floatingInquiry.height < 44)) ||
    (result.viewport === "mobile" &&
      result.contentColumnCounts.some((count) => count !== 1)),
);

const desktopResults = results.filter((result) => result.viewport === "desktop");
const headerVariants = new Set(
  desktopResults.map((result) => result.componentVariants[0]),
);
const footerVariants = new Set(
  desktopResults.map((result) => result.componentVariants.at(-1)),
);
if (headerVariants.size !== 7 || footerVariants.size !== 6) {
  failures.push({
    handle: "benchmark-coverage",
    viewport: "desktop",
    status: 200,
    browserErrors: [
      `Expected 7 header and 6 footer variants; received ${headerVariants.size} and ${footerVariants.size}.`,
    ],
    horizontalOverflow: false,
    brokenImages: [],
    textOverflow: [],
    surfaceRoles: [],
  });
}

async function createContactSheet(viewport, tileWidth, tileHeight) {
  const captures = results.filter((result) => result.viewport === viewport);
  const columns = 5;
  const rows = Math.ceil(captures.length / columns);
  const composites = [];
  for (const [index, capture] of captures.entries()) {
    const image = await sharp(capture.screenshot)
      .resize({
        width: tileWidth - 20,
        height: tileHeight - 44,
        fit: "contain",
        position: "top",
        background: "#ffffff",
      })
      .png()
      .toBuffer();
    const left = (index % columns) * tileWidth + 10;
    const top = Math.floor(index / columns) * tileHeight;
    const label = Buffer.from(
      `<svg width="${tileWidth}" height="34" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111827"/><text x="12" y="22" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="700">${capture.handle}</text></svg>`,
    );
    composites.push({ input: label, left: (index % columns) * tileWidth, top });
    composites.push({ input: image, left, top: top + 34 });
  }
  const output = path.join(outputDir, `contact-sheet-${viewport}.png`);
  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * tileHeight,
      channels: 3,
      background: "#e5e7eb",
    },
  })
    .composite(composites)
    .png()
    .toFile(output);
  return output;
}

const contactSheets = {
  desktop: await createContactSheet("desktop", 280, 980),
  mobile: await createContactSheet("mobile", 240, 1500),
};

const reportPath = path.join(outputDir, "report.json");
fs.writeFileSync(
  reportPath,
  `${JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), contactSheets, failures, results }, null, 2)}\n`,
);

console.log(
  `${results.length} benchmark captures written to ${outputDir}; ${failures.length} automated visual failures.`,
);
if (failures.length) {
  for (const failure of failures) {
    console.error(
      `${failure.handle}/${failure.viewport}: status=${failure.status} errors=${failure.browserErrors.length} overflow=${failure.horizontalOverflow} broken=${failure.brokenImages.length} textOverflow=${failure.textOverflow.length} surfaces=${new Set(failure.surfaceRoles).size}`,
    );
  }
  process.exitCode = 1;
}
