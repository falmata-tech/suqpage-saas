import fs from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const handle = process.env.PLAYWRIGHT_SHOWROOM_HANDLE || "demo-abay-machine-works";
const output = process.env.PLAYWRIGHT_OUTPUT || "/tmp/africmade-public-showroom-shell";

await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function capture(name, viewport, mobile, returnUrl = "") {
  const page = await browser.newPage({ viewport });
  if (returnUrl) {
    await page.addInitScript((value) => window.sessionStorage.setItem("mirtpage:last-marketplace-url:v1", value), returnUrl);
  }
  await page.goto(`${baseUrl}/@${handle}?ref=discovery`, { waitUntil: "domcontentloaded" });
  await page.locator(".runtime-root.is-public-shell").waitFor({ state: "visible", timeout: 30_000 });

  const mainCount = await page.locator("main").count();
  if (mainCount !== 1) throw new Error(`${name}: expected one main landmark, found ${mainCount}`);
  if (!(await page.locator(".runtime-root.is-public-shell").isVisible())) throw new Error(`${name}: tenant showroom did not render inside the public shell`);

  const railVisible = await page.locator(".public-app-rail").isVisible();
  const hostVisible = await page.locator(".showroom-host-bar-shell").isVisible();
  const tenantNavVisible = await page.locator(".showroom-mobile-nav").isVisible();
  const platformPhoneNavCount = await page.locator(".public-mobile-tabs").count();
  if (mobile) {
    if (railVisible) throw new Error(`${name}: desktop rail is visible on a phone`);
    if (!hostVisible) throw new Error(`${name}: hosted-showroom Back bar is not visible on a phone`);
    if (!tenantNavVisible) throw new Error(`${name}: tenant section navigation is not visible on a phone`);
    if (platformPhoneNavCount !== 0) throw new Error(`${name}: platform and tenant phone navigation rendered together`);
  } else {
    if (!railVisible) throw new Error(`${name}: AfricMade rail is not visible on desktop`);
    if (!hostVisible) throw new Error(`${name}: contextual Back to Market bar is not visible on desktop`);
    if (tenantNavVisible) throw new Error(`${name}: phone tenant navigation is visible on desktop`);
  }

  const overflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  if (overflow.documentWidth > overflow.viewportWidth + 1) throw new Error(`${name}: horizontal overflow ${overflow.documentWidth}px > ${overflow.viewportWidth}px`);

  await page.screenshot({ path: `${output}/${name}.png`, fullPage: false });
  if (mobile) {
    await page.getByRole("button", { name: "Back to Market" }).click();
    const expected = new URL(returnUrl || "/", baseUrl);
    await page.waitForURL((url) => url.pathname === expected.pathname && url.search === expected.search);
  }
  await page.close();
}

try {
  await capture("showroom-desktop-1440", { width: 1440, height: 1000 }, false);
  await capture("showroom-phone-390", { width: 390, height: 844 }, true, "/?industry=machinery-industrial&q=machine");
  await capture("showroom-phone-320", { width: 320, height: 760 }, true);
  console.log(`Public showroom shell captures written to ${output}`);
} finally {
  await browser.close();
}
