import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, expect } from "@playwright/test";

const base = process.env.SUQPAGE_TEST_BASE_URL || "http://127.0.0.1:3102";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname), "Local visual review only");
const output = process.env.SUQPAGE_VISUAL_OUTPUT || ".local/mobile-brand-review";
fs.mkdirSync(output, { recursive: true, mode: 0o700 });
const browser = await chromium.launch();
const results = [];
const shop = process.env.SUQPAGE_TEST_SHOP || "demo-aloe-field-care";
const publicRoutes = ["/", "/featured", "/about", "/login", `/@${shop}`];
const state = process.env.SUQPAGE_TEST_STORAGE_STATE;
const routes = state ? [...publicRoutes.filter(route => route !== "/login"), "/dashboard/products"] : publicRoutes;
try {
  for (const width of [320, 390, 1440]) {
    for (const locale of ["en", "am", "om", "so", "ti"]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: "reduce", ...(state ? { storageState: state } : {}) });
      await context.addCookies([{ name: "suqpage-language", value: locale, url: base }]);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      for (const route of locale === "en" ? routes : routes.filter(route => ["/", `/@${shop}`, "/dashboard/products"].includes(route))) {
        const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
        assert.equal(response.status(), 200);
        const shopPage = route.startsWith("/@");
        const dashboard = route.startsWith("/dashboard");
        const selector = route === "/login" ? ".landing-header" : dashboard ? (width <= 900 ? ".workspace-mobile-header" : ".sidebar") : (shopPage && width <= 680 ? ".showroom-host-bar-shell" : ".public-app-header");
        const header = page.locator(selector);
        const brand = header.locator(".suqpage-brand");
        await expect(brand).toBeVisible();
        await expect(brand.locator(".suqpage-wordmark")).toHaveText("suqpage");
        await expect(header.locator("select")).toBeVisible();
        await expect.poll(() => brand.locator("img").evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
        const geometry = await header.evaluate(element => {
          const brand = element.querySelector(".suqpage-brand").getBoundingClientRect();
          const language = element.querySelector("select").getBoundingClientRect();
          return { brandTop: brand.top, brandRight: brand.right, languageLeft: language.left,
            sameRow: Math.abs(brand.top - language.top) < 14,
            overflow: document.documentElement.scrollWidth > innerWidth + 1 };
        });
        assert.ok(!geometry.overflow, `${route} ${width} ${locale}: overflow`);
        assert.ok(geometry.brandTop >= 0 && geometry.brandTop < 80, "Brand visible immediately");
        if (width <= 680) {
          assert.ok(geometry.sameRow && geometry.brandRight <= geometry.languageLeft, "Brand and language fit in one row");
        }
        if (route === "/" && width <= 680) {
          const space = await page.evaluate(() => ({ content: document.querySelector(".public-market-experience").getBoundingClientRect().bottom, tabs: document.querySelector(".public-mobile-tabs").getBoundingClientRect().top }));
          assert.ok(space.content <= space.tabs + 1, "Market stays above bottom navigation");
        }
        const label = `${dashboard ? "workspace" : shopPage ? "shop" : route.slice(1) || "market"}-${width}-${locale}`;
        if (locale === "en" || width === 320) await page.screenshot({ path: `${output}/${label}.png` });
        if (shopPage && locale === "en") {
          const back = page.locator(".showroom-host-back");
          await page.waitForFunction(element => Object.keys(element).some(key => key.startsWith("__reactProps$")), await back.elementHandle());
          await back.click();
          await expect(page).toHaveURL(url => url.origin === base && url.pathname === "/", { timeout: 15000 });
        }
        results.push({ route, width, locale });
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
  }
  fs.writeFileSync(`${output}/verified.json`, JSON.stringify({ results, workspaceVerified: Boolean(state) }, null, 2));
  console.log(`${results.length} responsive brand checks passed; screenshots in ${output}. Workspace ${state ? "checked" : "requires authenticated storage state"}.`);
} finally {
  await browser.close();
}
