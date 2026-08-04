import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type AcceptanceProbe = "inquiryByCustomer";
const readAcceptanceRow = (probe: AcceptanceProbe, value: string) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [path.join(process.cwd(), "scripts/acceptance-db-probe.mjs"), process.env.MIRTPAGE_TEST_DB!, probe, value],
      { encoding: "utf8" },
    ),
  ) as Record<string, unknown> | null;

const credentials = fs.readFileSync(process.env.MIRTPAGE_TEST_CREDENTIALS!, "utf8");
const passwordFor = (email: string) => {
  const line = credentials.split("\n").find((entry) => entry.includes(`| ${email} |`));
  if (!line) throw new Error(`No seeded credential for ${email}`);
  return line.split("|").at(-1)!.trim();
};
const installControlledVideoFixture = (handle = "selam-weave") =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [path.join(process.cwd(), "scripts/acceptance-video-fixture.mjs"), process.env.MIRTPAGE_TEST_DB!, handle],
      { encoding: "utf8" },
    ),
  ) as { handle: string; updated: boolean };
function monitor(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  return errors;
}
async function expectVisibleControlsNamed(page: Page) {
  const unnamed = await page.locator("input:not([type=hidden]), select, textarea").evaluateAll((controls) =>
    controls.flatMap((control) => {
      const element = control as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (element.closest('[aria-hidden="true"]') || element.getClientRects().length === 0) return [];
      const hasName =
        Boolean(element.labels?.length) ||
        Boolean(element.getAttribute("aria-label")) ||
        Boolean(element.getAttribute("aria-labelledby"));
      return hasName ? [] : [`${element.tagName.toLowerCase()}[name="${element.getAttribute("name") || ""}"]`];
    }),
  );
  expect(unnamed).toEqual([]);
}
async function horizontalOverflowingElements(page: Page) {
  return page.locator("body *").evaluateAll((elements) => {
    const viewportWidth = document.documentElement.clientWidth;
    return elements.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.right <= viewportWidth + 0.5 && rect.left >= -0.5) return [];
      const style = getComputedStyle(element);
      const parentStyle = element.parentElement ? getComputedStyle(element.parentElement) : null;
      if (parentStyle?.overflowX === "auto" || parentStyle?.overflowX === "scroll") return [];
      return [{
        tag: element.tagName.toLowerCase(),
        className: element.className,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        overflowX: style.overflowX,
      }];
    }).slice(0, 12);
  });
}
async function loginAndChangePassword(page: Page, email: string, nextPassword: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(passwordFor(email));
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard\/account\?required=1/);
  await page.getByLabel("Current password").fill(passwordFor(email));
  await page.getByLabel("New password", { exact: true }).fill(nextPassword);
  await page.getByLabel("Confirm new password").fill(nextPassword);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password updated")).toBeVisible();
}
async function loginAndChangeKnownPassword(page: Page, email:string, temporaryPassword:string, nextPassword:string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(temporaryPassword);
  await page.getByRole("button",{name:"Sign in"}).click();
  await expect(page).toHaveURL(/\/dashboard\/account\?required=1/);
  await page.getByLabel("Current password").fill(temporaryPassword);
  await page.getByLabel("New password",{exact:true}).fill(nextPassword);
  await page.getByLabel("Confirm new password").fill(nextPassword);
  await page.getByRole("button",{name:"Change password"}).click();
  await expect(page.getByText("Password updated")).toBeVisible();
}
async function loginWithKnownPassword(page:Page,email:string,password:string){await page.goto("/login");await page.getByLabel("Email").fill(email);await page.getByLabel("Password").fill(password);await page.getByRole("button",{name:"Sign in"}).click();await expect(page).toHaveURL(/\/dashboard$/);}

test("business creates a private client workspace without public uploads", async ({ page }) => {
  const errors = monitor(page);
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Production is a bet on Ethiopia.");
  await expect(page.getByRole("heading", { name: "Good products cannot grow if buyers cannot find them." })).toBeVisible();
  await expect(page.getByText("MirtPage gives each participating producer a permanent showroom", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.goto("/request");
  await expectVisibleControlsNamed(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Put your production where buyers can find it.");
  await page.getByLabel("Your name").fill("Acceptance Prospect");
  await page.getByLabel("Email").fill("prospect@example.test");
  await page.getByLabel("Phone or WhatsApp").fill("+251911000111");
  await page.getByLabel("Business name").fill("Acceptance Self Signup");
  await page.getByLabel("Preferred Showroom address").fill("acceptance-self-signup");
  await page.getByLabel("Password", { exact: true }).fill("Acceptance-Workspace-2026!");
  await page.getByLabel("Confirm password").fill("Acceptance-Workspace-2026!");
  await page.getByLabel("What do you make, grow, or produce?").fill("We make durable household storage and woven market baskets for local retailers.");
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await page.getByLabel(/Create my private MirtPage workspace/).check();
  await page.getByRole("button", { name: "Create my workspace" }).click();
  await expect(page).toHaveURL(/\/dashboard\/requests\/\d+$/);
  await expect(page.getByText("Acceptance Self Signup", { exact: false }).first()).toBeVisible();
  const unpublished = await page.request.get("/@acceptance-self-signup");
  expect(unpublished.status()).toBe(404);
  const legacyLead = await page.request.post("/api/requests", { data: {
    contactName: "Acceptance Prospect",
    contactValue: "prospect@example.test",
    businessName: "Acceptance Market",
    requestText: "I am interested in a showroom for our handmade home products.",
    idempotencyKey: "acceptance-public-lead-0001",
    consent: true,
  } });
  expect(legacyLead.status()).toBe(201);
  const publicUpload = await page.request.post("/api/requests", { multipart: { contactName: "Upload Attempt", contactValue: "upload@example.test", requestText: "Trying a forbidden public upload", consent: "on", idempotencyKey: "public-upload-test-123", images: { name: "blocked.png", mimeType: "image/png", buffer: fs.readFileSync(path.join(process.cwd(), "public/uploads/seed/mirtpage/icon.png")) } } });
  expect(publicUpload.status()).toBe(415);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors.filter((error) => !error.includes("404"))).toEqual([]);
});

test("geographic discovery, weekly Expo, benchmark Showrooms, and copy-first inquiry", async ({ page }) => {
  const errors = monitor(page);
  await page.goto("/?expoDay=0");
  await expectVisibleControlsNamed(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Find what Ethiopia makes.");
  await expect(page.getByRole("heading", { name: "Search Ethiopia's production, not another product feed." })).toBeVisible();
  await expect(page.getByText("Search workshops, growers, processors, and growing factories", { exact: false })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Industries" }).getByRole("link")).toHaveCount(6);
  await expect(page.getByRole("tablist", { name: "Discovery view" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Map" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "List" })).toBeVisible();
  await expect(page.locator(".discovery-regions path")).toHaveCount(14);
  await expect(page.locator(".discovery-roads path")).toHaveCount(4);
  expect(await page.locator(".discovery-cluster, .discovery-point").count()).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "How MirtPage works" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /How it works/i })).toHaveCount(0);
  await expect(page.locator(".landing-hero-image")).toHaveCount(0);
  const sponsoredShortcuts = await page.locator(".discovery-sponsored-rail > a").count();
  expect(sponsoredShortcuts).toBeGreaterThanOrEqual(5);
  await expect(page.getByText("Paid placement", { exact: true })).toBeVisible();
  const sponsoredRail = page.locator(".discovery-sponsored-rail");
  const sponsoredStart = await sponsoredRail.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(5_200);
  expect(await sponsoredRail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(sponsoredStart);
  await page.getByRole("button", { name: "Pause sponsored showrooms" }).click();
  await expect(page.getByRole("button", { name: "Resume sponsored showrooms" })).toBeVisible();
  const desktopMap = await page.locator(".discovery-map-stage").boundingBox();
  expect(desktopMap?.y).toBeLessThan(720);
  const expoSchedule = page.getByRole("navigation", { name: "Weekly Expo schedule" });
  await expect(expoSchedule.getByRole("link")).toHaveCount(7);
  const todayLink = expoSchedule.locator("a.today");
  await expect(todayLink).toHaveCount(1);
  const todayHref = (await todayLink.getAttribute("href")) || "";
  const todayDay = todayHref.match(/expoDay=(\d)/)?.[1] || "";
  expect(todayDay).not.toBe("");
  const previewHref = (await expoSchedule.locator("a:not(.today)").first().getAttribute("href")) || "";
  expect(previewHref).not.toBe("");
  await page.goto(previewHref);
  await expect(page.locator(".expo-week a[aria-current='date']")).toHaveAttribute("href", previewHref);
  await expect(page.getByText("Preview only", { exact: true })).toBeVisible();
  const previewState = await page.locator(".daily-expo").evaluate((section) => ({
    boothCount: section.querySelectorAll(".expo-booth").length,
    outlineCount: section.querySelectorAll(".expo-booth-outline").length,
    revealedCount: section.querySelectorAll(".expo-booth[data-business-id], .expo-booth img").length,
    hallControlCount: section.querySelectorAll(".expo-hall-controls").length,
  }));
  expect(previewState.outlineCount).toBeGreaterThan(0);
  expect(previewState.boothCount).toBe(previewState.outlineCount);
  expect(previewState.revealedCount).toBe(0);
  expect(previewState.hallControlCount).toBe(0);
  await expect(page.locator(".expo-status-badge.open")).toContainText(/Open today|Featured today/, { timeout: 8_000 });
  await expect(page).toHaveURL(new RegExp(`expoDay=${todayDay}`));
  await page.goto("/?expoDay=1");
  await page.getByRole("navigation", { name: "Industries" }).getByRole("link", { name: /Beauty, hygiene & household care/ }).click();
  await expect(page).toHaveURL(/industry=beauty-wellness/);
  await expect(page).toHaveURL(/expoDay=1/);
  await page.getByRole("navigation", { name: "Weekly Expo schedule" }).getByRole("link", { name: /Tue/ }).click();
  await expect(page.getByRole("heading", { name: "Beauty, hygiene & household care Expo" })).toBeVisible();
  await page.getByRole("tab", { name: "List" }).click();
  expect(await page.locator(".discovery-list article").count()).toBe(5);
  await expect(page.getByRole("link", { name: "Open showroom" }).first()).toHaveAttribute("href", /\?ref=discovery$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?expoDay=1");
  const phoneMap = await page.locator(".discovery-map-stage").boundingBox();
  expect(phoneMap?.y).toBeLessThan(844);
  await page.getByLabel("Open public navigation").click();
  await expect(page.getByRole("navigation", { name: "Mobile public navigation" }).getByRole("link", { name: "Login" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
  const compositionSignatures = new Set<string>();
  const heroMediaIntegrations = new Set<string>();
  for (const handle of ["selam-weave", "afia-botanics", "warka-furniture", "addis-metalworks", "green-terrace-farm", "blue-nile-apiary", "rift-valley-mill", "entoto-ceramics", "koba-leather", "nova-assembly"]) {
    await page.goto(`/@${handle}`);
    await expect(page.locator(".showroom")).toBeVisible();
    await expect(page.locator('[data-bank-release="showroom-bank@1.2.0"]')).toBeVisible();
    await expect(page.locator(".sr-card").first()).toBeVisible();
    compositionSignatures.add(
      await page.locator("[data-token-pack]").getAttribute("data-token-pack") || "",
    );
    await expect(page.locator('nav[aria-label="Product categories"]')).toHaveCount(0);
    await expect(page.locator('[aria-label="Catalog filters"]')).toHaveCount(1);
    await expect(page.locator('[data-slot="header"] nav')).toHaveCount(0);
    await expect(page.locator('[data-slot="header"] button')).toHaveCount(0);
    await expect(page.locator('[data-slot="footer"] nav')).toHaveCount(0);
    await expect(page.locator('[data-slot="footer"]').getByText(`@${handle}`, { exact: true })).toBeVisible();
    await expect(page.locator(".floating-inquiry-trigger")).toHaveCount(1);
    await expect(page.locator('[data-slot="hero"] button')).toHaveCount(0);
    await expect(page.locator('a[href="#showroom-catalog"]').first()).toBeVisible();
    const heroSection = page.locator('[data-slot="hero"]');
    const mediaIntegration =
      (await heroSection.getAttribute("data-media-integration")) || "";
    expect([
      "natural",
      "surface_blend",
      "ambient_overlay",
      "edge_fade",
      "split_bleed",
      "editorial_overlap",
      "product_stage",
      "hidden",
    ]).toContain(mediaIntegration);
    heroMediaIntegrations.add(mediaIntegration);
    const heroMedia = page.locator('[data-slot="hero"] img').first();
    const heroGeometry = await heroMedia.evaluate((image) => {
      const bounds = image.parentElement!.getBoundingClientRect();
      const style = getComputedStyle(image.parentElement!);
      return {
        width: bounds.width,
        height: bounds.height,
        borderWidth:
          Number.parseFloat(style.borderLeftWidth) +
          Number.parseFloat(style.borderRightWidth),
      };
    });
    expect(heroGeometry.width).toBeGreaterThan(0);
    expect(heroGeometry.width).toBeLessThanOrEqual(1280);
    expect(heroGeometry.height).toBeGreaterThanOrEqual(240);
    expect(heroGeometry.height).toBeLessThanOrEqual(720);
    expect(heroGeometry.borderWidth).toBe(0);
    expect(
      await page.locator("[data-composition-schema] [data-slot]").evaluateAll(
        (sections) =>
          sections.map((section) => section.getAttribute("data-slot")).join(">"),
      ),
    ).toBe("header>hero>content>content>catalog>callToAction>footer");
    expect(
      await page.locator("[data-composition-schema] [data-slot]").evaluateAll(
        (sections) =>
          sections.map((section) => section.getAttribute("data-surface")).join(">"),
      ),
    ).toBe("surface>accent-soft>surface>secondary-soft>canvas>strong>inverse");
    const catalog = page.locator('[data-slot="catalog"]');
    const catalogVariant = await catalog.getAttribute("data-variant");
    if (catalogVariant === "minimal-list") {
      const thumbnail = await catalog.locator(".sr-card img").first().evaluate((image) => {
          const bounds = image.getBoundingClientRect();
          return {
            width: bounds.width,
            ratio: bounds.width / bounds.height,
          };
        });
      expect(thumbnail.width).toBeLessThanOrEqual(112);
      expect(thumbnail.ratio).toBeCloseTo(4 / 3, 2);
    } else {
      expect(
        await catalog.locator(".sr-card").evaluateAll((cards) =>
          cards.every((card) => card.getBoundingClientRect().width <= 420),
        ),
      ).toBe(true);
      expect(
        await catalog.locator(".sr-card img").evaluateAll((images) =>
          images.every((image) => {
            const bounds = image.getBoundingClientRect();
            const ratio = bounds.width / bounds.height;
            return ratio >= 1.32 && ratio <= 1.35;
          }),
        ),
      ).toBe(true);
    }
    expect(
      await page.locator("[data-slot]").evaluateAll((sections) => {
        const surfaces = new Set(
          sections.map((section) => getComputedStyle(section).backgroundColor),
        );
        return surfaces.size;
      }),
    ).toBeGreaterThanOrEqual(3);
    const categoryButtons = page.locator('[aria-label="Catalog filters"] button');
    await categoryButtons.nth(1).click();
    expect(
      await categoryButtons.nth(1).evaluate((button) => {
        const style = getComputedStyle(button);
        const rgb = (value: string) => {
          const values =
            value.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) ||
            [0, 0, 0];
          return value.startsWith("color(")
            ? values.map((channel) => channel * 255)
            : values;
        };
        const luminance = (value: string) => {
          const channels = rgb(value).map((channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        return (Math.max(foreground, background) + 0.05) /
          (Math.min(foreground, background) + 0.05);
      }),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      await page
        .locator('[data-slot] h2, [data-slot] h3, [data-slot] p, [data-slot] strong')
        .evaluateAll((elements) =>
          elements.every((element) => element.scrollWidth <= element.clientWidth + 1),
        ),
    ).toBe(true);
    await expectVisibleControlsNamed(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  expect(compositionSignatures.size).toBeGreaterThanOrEqual(6);
  expect(heroMediaIntegrations.size).toBeGreaterThanOrEqual(3);
  await page.goto("/@selam-weave");
  const productOpener = page.locator(".sr-card").first().getByRole("button", { name: /^View / });
  await productOpener.click();
  await expect(page.getByRole("dialog").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Close product" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await page.getByRole("dialog").first().evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(productOpener).toBeFocused();
  await productOpener.click();
  await page.getByRole("button", { name: "Add selected item" }).click();
  const drawerOpener = page.locator(".floating-inquiry-trigger");
  await expect(drawerOpener).toHaveAccessibleName("Inquiry, 1 selected item");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(drawerOpener).toBeInViewport();
  await expect(drawerOpener).toBeVisible();
  await drawerOpener.click();
  await expect(page.getByRole("button", { name: "Close inquiry" })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  const desktopDrawer = await page
    .getByRole("dialog", { name: "Product inquiry" })
    .evaluate((dialog) => {
      const bounds = dialog.getBoundingClientRect();
      return {
        top: bounds.top,
        right: window.innerWidth - bounds.right,
        bottom: window.innerHeight - bounds.bottom,
        width: bounds.width,
        scrollBehavior: getComputedStyle(dialog.querySelector(".drawer-scroll")!).overflowY,
      };
    });
  expect(desktopDrawer.top).toBeGreaterThanOrEqual(16);
  expect(desktopDrawer.right).toBeGreaterThanOrEqual(16);
  expect(desktopDrawer.bottom).toBeGreaterThanOrEqual(16);
  expect(desktopDrawer.width).toBeLessThanOrEqual(560);
  expect(desktopDrawer.scrollBehavior).toBe("auto");
  await page.keyboard.press("Shift+Tab");
  expect(await page.getByRole("dialog", { name: "Product inquiry" }).evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await expect(drawerOpener).toBeFocused();
  await expect(page.locator(".inquiry-drawer")).toHaveAttribute("aria-hidden", "true");
  await drawerOpener.click();
  await expect(page.getByPlaceholder("Your first name")).toHaveCount(0);
  const inquiryPhone = page.getByRole("textbox", { name: "Phone number" });
  await expect(inquiryPhone).toBeVisible();
  await expect(page.getByRole("button", { name: "TikTok" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share / copy" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "WhatsApp" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Telegram" })).toBeVisible();
  await page.getByRole("button", { name: "Copy inquiry" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  const copiedReference = page.locator(".copied-reference pre");
  await expect(copiedReference).toContainText("Showroom reference: @selam-weave");
  await expect(copiedReference).not.toContainText("Desired quantity:");
  expect(readAcceptanceRow("inquiryByCustomer", "Showroom visitor")).toBeNull();
  await inquiryPhone.fill("123");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.locator("#inquiry-send-status")).toContainText("7 to 15 digits");
  expect(readAcceptanceRow("inquiryByCustomer", "Showroom visitor")).toBeNull();
  await inquiryPhone.fill("+251 91 123 4567");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.locator("#inquiry-send-status")).toContainText("Sent to Selam Weave Studio");
  expect(readAcceptanceRow("inquiryByCustomer", "Showroom visitor")).toEqual({
    status: "new",
    contact: "+251911234567",
  });
  expect(errors).toEqual([]);
});

test("mobile search, persistent cart, quantity, and overflow", async ({ page }) => {
  const errors = monitor(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/@addis-metalworks");
  await page.getByLabel("Search products").fill("Powder-Coated");
  await expect(page.locator(".sr-card")).toHaveCount(1);
  await page.locator(".sr-card").first().getByRole("button", { name: /^View / }).click();
  await page.getByRole("button", { name: "Add selected item" }).click();
  await page.reload();
  const floatingInquiry = page.locator(".floating-inquiry-trigger");
  await expect(floatingInquiry).toHaveAccessibleName("Inquiry, 1 selected item");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(floatingInquiry).toBeInViewport();
  const floatingBounds = await floatingInquiry.evaluate((button) => {
    const bounds = button.getBoundingClientRect();
    return {
      right: window.innerWidth - bounds.right,
      bottom: window.innerHeight - bounds.bottom,
      width: bounds.width,
      height: bounds.height,
    };
  });
  expect(floatingBounds.right).toBeGreaterThanOrEqual(8);
  expect(floatingBounds.bottom).toBeGreaterThanOrEqual(8);
  expect(floatingBounds.width).toBeGreaterThanOrEqual(44);
  expect(floatingBounds.width).toBeLessThanOrEqual(56);
  expect(floatingBounds.height).toBeGreaterThanOrEqual(44);
  await floatingInquiry.click();
  const mobileDrawer = await page
    .getByRole("dialog", { name: "Product inquiry" })
    .evaluate((dialog) => {
      const bounds = dialog.getBoundingClientRect();
      const controls = Array.from(dialog.querySelectorAll("button"));
      return {
        left: bounds.left,
        right: window.innerWidth - bounds.right,
        bottom: window.innerHeight - bounds.bottom,
        height: bounds.height,
        controlsMeetTouchTarget: controls.every((control) => {
          const controlBounds = control.getBoundingClientRect();
          return controlBounds.width >= 44 && controlBounds.height >= 44;
        }),
      };
    });
  expect(mobileDrawer.left).toBeGreaterThanOrEqual(5);
  expect(mobileDrawer.right).toBeGreaterThanOrEqual(5);
  expect(mobileDrawer.bottom).toBeGreaterThanOrEqual(5);
  expect(mobileDrawer.height).toBeLessThanOrEqual(832);
  expect(mobileDrawer.controlsMeetTouchTarget).toBe(true);
  await expect(page.getByRole("textbox", { name: "Phone number" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send inquiry" })).toBeVisible();
  await expect(page.locator(".direct-handoffs")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "WhatsApp" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Telegram" })).toHaveCount(0);
  const firstQuantity = page.locator(".cart-item").first().getByRole("textbox", {
    name: /Desired quantity/,
  });
  await expect(firstQuantity).toHaveValue("");
  await firstQuantity.fill("1 ton");
  await expect(firstQuantity).toHaveValue("1 ton");
  await page.getByRole("button", { name: "Close inquiry" }).click();
  await page.getByLabel("Search products and capabilities").fill("Precision Bracket");
  await expect(page.locator(".sr-card")).toHaveCount(1);
  await page.locator(".sr-card").first().getByRole("button", { name: /^View / }).click();
  await page.getByRole("button", { name: "Add selected item" }).click();
  await floatingInquiry.click();
  const optionalQuantity = page.locator(".cart-item").last().getByRole("textbox", {
    name: /Desired quantity/,
  });
  await expect(optionalQuantity).toHaveValue("");
  await optionalQuantity.fill("250 kg");
  await expect(optionalQuantity).toHaveValue("250 kg");
  await page.getByRole("button", { name: "Copy inquiry" }).click();
  await expect(page.locator(".copied-reference pre")).toContainText("Desired quantity: 1 ton");
  await expect(page.locator(".copied-reference pre")).toContainText("Desired quantity: 250 kg");
  await page.getByRole("button", { name: "Close inquiry" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 700 });
  for (const handle of ["selam-weave", "afia-botanics", "warka-furniture", "addis-metalworks", "green-terrace-farm", "blue-nile-apiary", "rift-valley-mill", "entoto-ceramics", "koba-leather", "nova-assembly"]) {
    await page.goto(`/@${handle}`);
    await expect(page.locator(".showroom")).toBeVisible();
    await expect(page.locator(".sr-card").first()).toBeVisible();
    await expect(page.locator('nav[aria-label="Product categories"]')).toHaveCount(0);
    await expect(page.locator('[aria-label="Catalog filters"]')).toHaveCount(1);
    const mobileHeroMedia = await page
      .locator('[data-slot="hero"] img')
      .first()
      .evaluate((image) => {
        const bounds = image.getBoundingClientRect();
        return {
          width: bounds.width,
          height: bounds.height,
          objectFit: getComputedStyle(image).objectFit,
        };
      });
    expect(mobileHeroMedia.width).toBeGreaterThan(0);
    expect(mobileHeroMedia.height).toBeGreaterThan(0);
    expect(mobileHeroMedia.height).toBeLessThanOrEqual(520);
    expect(["cover", "contain"]).toContain(mobileHeroMedia.objectFit);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("mobile clustered map, continuous Expo floor, list parity, and legacy redirects", async ({ page }) => {
  const errors = monitor(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/expo");
  await expect(page).toHaveURL(/\/discover$/);
  await page.goto("/discover?industry=electronics&expoDay=1");
  await expect(page.getByRole("heading", { name: "Search Ethiopia's production, not another product feed." })).toBeVisible();
  await expect(page.locator(".discovery-regions path")).toHaveCount(14);
  await expect(page.locator(".discovery-roads path")).toHaveCount(4);
  const visibleMarkerIndex = (selector: string) => page.locator(selector).evaluateAll((markers) => {
    const stage = document.querySelector(".discovery-map-stage")?.getBoundingClientRect();
    if (!stage) return -1;
    return markers.findIndex((marker) => {
      const bounds = marker.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      return centerX >= stage.left && centerX <= stage.right && centerY >= stage.top && centerY <= stage.bottom;
    });
  });
  const isolatedPointIndex = await visibleMarkerIndex(".discovery-point");
  expect(isolatedPointIndex).toBeGreaterThanOrEqual(0);
  const isolatedPoint = page.locator(".discovery-point").nth(isolatedPointIndex);
  await expect(isolatedPoint).toHaveAttribute("data-latitude", /^-?\d+(\.\d+)?$/);
  await expect(isolatedPoint).toHaveAttribute("data-longitude", /^-?\d+(\.\d+)?$/);
  await isolatedPoint.click();
  await expect(page.locator(".discovery-preview").getByRole("link", { name: "Open showroom" })).toHaveAttribute("href", /\/@[^?]+\?ref=discovery$/);
  await page.getByRole("button", { name: "Close showroom preview" }).click();

  for (let attempt = 0; attempt < 7; attempt += 1) {
    if (await visibleMarkerIndex(".discovery-city-gateway") >= 0) break;
    const index = await visibleMarkerIndex(".discovery-cluster");
    if (index < 0) break;
    await page.locator(".discovery-cluster").nth(index).click();
    await page.waitForTimeout(450);
  }
  const visibleGatewayIndex = await visibleMarkerIndex(".discovery-city-gateway");
  expect(visibleGatewayIndex).toBeGreaterThanOrEqual(0);
  const gateway = page.locator(".discovery-city-gateway").nth(visibleGatewayIndex);
  const gatewayLabel = await gateway.getAttribute("aria-label") || "";
  const gatewayCount = Number(gatewayLabel.match(/(\d+) businesses/)?.[1]);
  expect(gatewayCount).toBeGreaterThan(1);
  const mapTransform = await page.locator(".discovery-map > g").getAttribute("transform");
  await gateway.click();
  const cityDialog = page.getByRole("dialog", { name: /^Made near / });
  await expect(cityDialog).toBeVisible();
  await expect(cityDialog.locator(".city-showroom-shop")).toHaveCount(gatewayCount);
  await expect(cityDialog.getByRole("link", { name: /Open showroom/ })).toHaveCount(gatewayCount);
  await expect(cityDialog.getByText(/Hall \d/)).toHaveCount(0);
  await expect(cityDialog.getByRole("navigation", { name: /pages/i })).toHaveCount(0);
  const cityControlSizes = await cityDialog.locator(".city-showroom-actions button").evaluateAll((controls) => controls.map((control) => ({ width: control.getBoundingClientRect().width, height: control.getBoundingClientRect().height })));
  expect(cityControlSizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
  const initialZoom = await cityDialog.locator(".city-showroom-actions > span").textContent();
  await cityDialog.getByRole("button", { name: "Zoom in to city marketplace" }).click();
  await expect.poll(() => cityDialog.locator(".city-showroom-actions > span").textContent()).not.toBe(initialZoom);
  await cityDialog.getByRole("button", { name: "Fit city marketplace to view" }).click();
  await cityDialog.getByRole("button", { name: "Close city marketplace" }).click();
  await expect(cityDialog).toHaveCount(0);
  await expect(page.locator(".discovery-map > g")).toHaveAttribute("transform", mapTransform || "");
  await expect(page.locator(".discovery-map").getByText(/Hall \d/)).toHaveCount(0);

  await page.goto("/discover?industry=electronics&expoDay=1");
  await page.locator(".expo-week a:not(.today)").filter({ hasNotText: "Sun" }).first().click();
  await expect(page.locator(".expo-booth-outline")).not.toHaveCount(0);
  await expect(page.locator(".expo-booth[data-business-id], .expo-booth img")).toHaveCount(0);
  await page.locator(".expo-week a.today").click();
  await expect(page.locator(".expo-status-badge.open")).toBeVisible();
  if (await page.locator(".expo-floor").count()) {
    const booths = page.locator(".expo-booth[data-business-id]");
    const visibleBoothIndex = await booths.evaluateAll((items) => {
      const stage = document.querySelector(".expo-floor-stage")?.getBoundingClientRect();
      const controls = document.querySelector(".expo-floor-actions")?.getBoundingClientRect();
      if (!stage) return -1;
      return items.findIndex((item) => {
        const bounds = item.getBoundingClientRect();
        const fullyInside = bounds.left >= stage.left && bounds.right <= stage.right
          && bounds.top >= stage.top && bounds.bottom <= stage.bottom;
        const overlapsControls = controls
          ? bounds.left < controls.right && bounds.right > controls.left
            && bounds.top < controls.bottom && bounds.bottom > controls.top
          : false;
        return fullyInside && !overlapsControls;
      });
    });
    expect(visibleBoothIndex).toBeGreaterThanOrEqual(0);
    const booth = booths.nth(visibleBoothIndex);
    await expect(booth).toBeVisible();
    const boothLabel = (await booth.getAttribute("aria-label")) || "";
    const boothMatch = boothLabel.match(/^([A-Z]+-(?:B)?\d{2}), (.+)$/);
    expect(boothMatch).not.toBeNull();
    const boothReference = boothMatch?.[1] || "";
    await booth.click();
    const preview = page.locator(".discovery-preview");
    await expect(preview).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(`^${boothReference},`) })).toHaveClass(/selected/);
    await expect(preview.getByRole("link", { name: "Open showroom" })).toHaveAttribute("href", /\/@[^?]+\?ref=expo$/);
    await preview.getByRole("button", { name: "Close showroom preview" }).click();
    const expoControls = page.locator(".expo-floor-actions button");
    await expect(expoControls).toHaveCount(3);
    const expoControlSizes = await expoControls.evaluateAll((controls) => controls.map((control) => control.getBoundingClientRect().height));
    expect(expoControlSizes.every((height) => height >= 44)).toBe(true);
    const initialExpoZoom = await page.locator(".expo-floor-actions > span").textContent();
    await page.getByRole("button", { name: "Zoom in to Expo floor" }).click();
    await expect.poll(() => page.locator(".expo-floor-actions > span").textContent()).not.toBe(initialExpoZoom);
    await page.getByRole("button", { name: "Fit Expo floor to view" }).click();
  } else {
    await expect(page.locator(".expo-live-businesses a")).not.toHaveCount(0);
  }
  await expect(page.locator(".expo-hall-controls")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("tab", { name: "List" }).click();
  const listCount = await page.locator(".discovery-list article").count();
  expect(listCount).toBe(5);
  await expect(page.locator(".discovery-list").getByRole("link", { name: "Open showroom" })).toHaveCount(listCount);
  const firstPageIds = await page.locator(".discovery-list article").evaluateAll((rows) => rows.map((row) => row.getAttribute("data-showroom-id")));
  await page.getByRole("navigation", { name: "Showroom list pages" }).getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page).toHaveURL(/view=list/);
  await expect(page.getByRole("navigation", { name: "Showroom list pages" })).toContainText("Page 2 of");
  const secondPageCount = await page.locator(".discovery-list article").count();
  expect(secondPageCount).toBeGreaterThan(0);
  expect(secondPageCount).toBeLessThanOrEqual(5);
  const secondPageIds = await page.locator(".discovery-list article").evaluateAll((rows) => rows.map((row) => row.getAttribute("data-showroom-id")));
  expect(secondPageIds.some((id) => firstPageIds.includes(id))).toBe(false);
  await page.getByRole("navigation", { name: "Weekly Expo schedule" }).getByRole("link", { name: /Sun/ }).click();
  await expect(page.getByRole("heading", { name: /^Featured Enterprises:/ })).toBeVisible();
  await expect(page.locator(".expo-floor")).toHaveCount(1);
  const sundayIsToday = await page.locator(".expo-week a[aria-current='date']").evaluate((link) => link.classList.contains("today"));
  if (sundayIsToday) expect(await page.locator(".expo-booth[data-business-id]").count()).toBeGreaterThan(0);
  else {
    expect(await page.locator(".expo-booth-outline").count()).toBeGreaterThan(0);
    await expect(page.locator(".expo-booth[data-business-id]")).toHaveCount(0);
    const todayHref = await page.locator(".expo-week a.today").getAttribute("href") || "";
    const todayDay = todayHref.match(/expoDay=(\d)/)?.[1] || "";
    await expect(page).toHaveURL(new RegExp(`expoDay=${todayDay}`), { timeout: 8_000 });
    await expect(page.locator(".expo-week a.today")).toHaveAttribute("aria-current", "date");
  }
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.goto("/bazaar");
  await expect(page).toHaveURL(/\/discover$/);
  const failurePage = await page.context().newPage();
  const failureErrors = monitor(failurePage);
  await failurePage.route("**/geo/ethiopia-admin1-2023.geojson", (route) => route.fulfill({ status: 503, body: "" }));
  await failurePage.goto("/discover?expoDay=1");
  await expect(failurePage.getByText("The map could not load, but every Showroom is still available.")).toBeVisible();
  await expect(failurePage.getByRole("heading", { name: /Expo$/ })).toBeVisible();
  await failurePage.getByRole("button", { name: "Open list" }).click();
  expect(await failurePage.locator(".discovery-list article").count()).toBe(5);
  await expect(failurePage.getByRole("link", { name: "Open showroom" }).first()).toBeVisible();
  expect(failureErrors.filter((error) => !error.includes("503 (Service Unavailable)"))).toEqual([]);
  await failurePage.close();
  expect(errors.filter((error) => !error.includes("503 (Service Unavailable)"))).toEqual([]);
});

test("platform surfaces share the MirtPage identity", async ({ page }) => {
  const errors = monitor(page);
  for (const pathName of ["/", "/about", "/expo", "/request", "/login", "/privacy", "/terms"]) {
    await page.goto(pathName);
    const brand = page.locator('.mirtpage-brand img[src="/brand/mirtpage-mark.svg"]').first();
    await expect(brand).toBeVisible();
    await expect(brand.locator("..")).toHaveAccessibleName("MirtPage home");
    if (["/", "/about", "/login"].includes(pathName)) {
      const signupLinks = page.locator('nav a[href="/request"]');
      expect(await signupLinks.count()).toBeGreaterThan(0);
      expect(await signupLinks.allTextContents()).toEqual(Array(await signupLinks.count()).fill("Sign up"));
      await expect(page.getByRole("link", { name: /For businesses?/i })).toHaveCount(0);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const pathName of ["/request", "/login"]) {
    await page.goto(pathName);
    await expect(page.locator(".platform-task-shell")).toBeVisible();
    const controlHeights = await page.locator(".platform-form-panel .field input:not([type=hidden]):not([type=checkbox]), .platform-form-panel .field textarea, .platform-form-panel button, .platform-form-panel .consent-field label").evaluateAll((controls) => controls.filter((control) => control.getClientRects().length > 0).map((control) => Math.round(control.getBoundingClientRect().height)));
    expect(controlHeights.length).toBeGreaterThan(0);
    expect(controlHeights.every((height) => height >= 44)).toBe(true);
    const firstField = page.locator(".platform-form-panel .field input:not([type=hidden]):not([type=checkbox])").first();
    await firstField.focus();
    expect(await firstField.evaluate((field) => getComputedStyle(field).boxShadow)).not.toBe("none");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("administrator onboards and previews a publicly hidden draft tenant", async ({ page }) => {
  const errors = monitor(page);
  await loginAndChangePassword(page, "admin@mirtpage.local", "AdminAcceptance123!");
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Private workspace" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "MirtPage home" })).toHaveAttribute("href", "/dashboard/admin");
  await expect(page.getByRole("link", { name: "Public site", exact: true })).toHaveAttribute("target", "_blank");
  await page.getByRole("link", { name: "MirtPage home" }).click();
  await expect(page).toHaveURL(/\/dashboard\/admin$/);
  await page.goto("/dashboard/admin?view=businesses&status=draft");
  await expect(page).toHaveURL(/\/dashboard\/admin\/businesses\?status=draft$/);
  await page.goto("/dashboard/admin");
  await page.getByRole("link", { name: "Discovery profiles", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Discovery profiles" })).toBeVisible();
  await page.getByLabel("Search").fill("Meda Furniture Studio");
  await page.getByRole("button", { name: "Apply" }).click();
  const profileRow = page.getByRole("row").filter({ hasText: "Meda Furniture Studio" }).first();
  await expect(profileRow.getByText("discoverable")).toBeVisible();
  await profileRow.getByRole("link", { name: "Edit profile" }).click();
  await page.getByLabel("Sponsored placement (paid)").check();
  await page.getByRole("button", { name: "Save discovery profile" }).click();
  await expect(page.getByText("Discovery profile saved")).toBeVisible();
  await page.goto("/discover?industry=home-living");
  await page.getByRole("tab", { name: "List" }).click();
  await expect(page.locator(".discovery-list article").filter({ hasText: "Meda Furniture Studio" }).getByText(/Sponsored/)).toBeVisible();
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Design library" }).click();
  await expect(page.getByRole("heading", { name: "Showroom design library" })).toBeVisible();
  await expect(page.getByText("67", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Heroes 13" }).click();
  await expect(page.locator("article").filter({ has: page.locator("code") })).toHaveCount(13);
  await page.getByLabel("Preview token system").selectOption("industrial-steel");
  await page.getByLabel("Motion intensity").selectOption("expressive");
  await page.getByLabel("Decorative depth").selectOption("signature");
  await page.getByRole("button", { name: "Mobile · 390 px" }).click();
  await page.getByRole("button", { name: "All 67" }).click();
  await expect(page.locator('[data-preview-device="mobile"]')).toHaveCount(67);
  await expect(page.locator('[data-motion="expressive"]')).toHaveCount(67);
  await expect(page.locator('[data-decoration="signature"]')).toHaveCount(67);
  const mobileCanvases = page.locator('[data-preview-device="mobile"] > div');
  await expect(mobileCanvases).toHaveCount(67);
  expect(
    await mobileCanvases.evaluateAll((canvases) =>
      canvases.every(
        (canvas) => canvas.scrollWidth <= canvas.clientWidth,
      ),
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const undersizedTargets = await page
    .locator('[data-preview-device="mobile"] button, [data-preview-device="mobile"] input')
    .evaluateAll((targets) =>
      targets.flatMap((target) => {
        const rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height) return [];
        return rect.height < 43.5
          ? [`${target.tagName.toLowerCase()}:${target.textContent?.trim() || target.getAttribute("aria-label")}`]
          : [];
      }),
    );
  expect(undersizedTargets).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.locator('[data-motion="expressive"]').first().evaluate(
      (section) => getComputedStyle(section).animationName,
    ),
  ).toBe("none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole("button", { name: "Responsive" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.goto("/dashboard/products?business=1");
  await expect(page.getByRole("heading",{name:"Products & capabilities"})).toBeVisible();
  await page.getByRole("link",{name:"Edit"}).first().click();
  await expect(page.getByLabel("Customer-service note")).toBeVisible();
  await expect(page.getByLabel("Sort order")).toHaveCount(0);
  await expect(page.getByLabel("Publish in showroom")).toHaveCount(0);
  await page.getByLabel("Description").fill("Administrator-verified browser upkeep description.");
  await page.getByLabel("Customer-service note").fill("Verified basic upkeep before the client demo.");
  await page.getByRole("button",{name:"Save and publish offering"}).click();
  await expect(page.getByText(/Offering published successfully as showroom version/)).toBeVisible();
  await page.goto("/dashboard/requests");
  await expect(page.getByText("Acceptance Market")).toBeVisible();
  await page.getByRole("row").filter({ hasText: "Acceptance Market" }).getByRole("link", { name: /REQ-/ }).click();
  await expect(page.getByText("prospect@example.test")).toBeVisible();
  await expect(page.locator(".request-image-grid img")).toHaveCount(0);
  await page.getByLabel("Status").selectOption("under_review");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText("Request status updated")).toBeVisible();
  await expect(page.locator(".dashboard-head .badge")).toHaveText("under review");
  await page.getByLabel("Client email").fill("acceptance-client@example.test");
  await page.getByLabel("Showroom handle").fill("acceptance-market");
  await page.getByRole("button", { name: "Accept lead and create invitation" }).click();
  await expect(page.getByText("Invitation created.")).toBeVisible();
  const invitationUrl = await page.getByLabel("Single-use invitation link").inputValue();
  expect(invitationUrl).toMatch(/^https:\/\/mirtpage\.test\/invite\/[A-Za-z0-9_-]{40,100}$/);
  await page.goto("/dashboard/admin/staff");
  await expectVisibleControlsNamed(page);
  await expect(page.getByRole("heading",{name:"Staff & access"})).toBeVisible();
  let staffPanel = page.getByRole("main");
  await staffPanel.locator("summary").filter({hasText:"Create staff account"}).click();
  await staffPanel.getByLabel("Name").fill("Acceptance Operations");
  await staffPanel.getByLabel("Email").fill("operations@example.test");
  await staffPanel.getByLabel("Access role").selectOption("operations_manager");
  await staffPanel.getByLabel("Temporary password").fill("OperationsTemp123!");
  await staffPanel.getByRole("button",{name:"Create staff account"}).click();
  await expect(page.getByText("Acceptance Operations")).toBeVisible();
  await page.goto("/dashboard/admin/staff");
  staffPanel = page.getByRole("main");
  await staffPanel.locator("summary").filter({hasText:"Create staff account"}).click();
  await staffPanel.getByLabel("Name").fill("Acceptance Team");
  await staffPanel.getByLabel("Email").fill("team@example.test");
  await staffPanel.getByLabel("Access role").selectOption("team_member");
  await staffPanel.getByLabel("Temporary password").fill("TeamMemberTemp123!");
  await staffPanel.getByRole("button",{name:"Create staff account"}).click();
  await expect(page.getByText("Staff account created.")).toBeVisible();
  await page.getByLabel("Search").fill("Acceptance Team");
  await page.getByRole("button",{name:"Apply"}).click();
  await expect(page.getByRole("main").getByText("Acceptance Team",{exact:true})).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator(".admin-data-surface thead")).toBeHidden();
  await expect(page.locator('.admin-data-surface td[data-label="Role"]').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const adminMenuButton = page.getByRole("button",{name:"Open workspace menu"});
  await adminMenuButton.click();
  const adminMenu = page.getByRole("dialog",{name:"Workspace menu"});
  await expect(adminMenu.getByRole("link",{name:"Support agents"})).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(adminMenuButton).toBeFocused();
  await page.setViewportSize({width:1280,height:720});
  await page.getByRole("link",{name:"Clients",exact:true}).click();
  await page.getByRole("link",{name:"Create client workspace"}).first().click();
  await expect(page.getByRole("heading",{name:"Create a client workspace"})).toBeVisible();
  await expectVisibleControlsNamed(page);
  await page.getByLabel("Business name").fill("Acceptance Flowers");
  await page.getByLabel("Showroom handle").fill("acceptanceflowers");
  await page.getByLabel("Client name").fill("Flower Client");
  await page.getByLabel("Client email").fill("flowers@example.test");
  await page.getByRole("button", { name: "Create client workspace and invitation" }).click();
  await expect(page.getByText("Client workspace created.")).toBeVisible();
  await expect(page.getByLabel("Single-use client workspace invitation")).toHaveValue(/^https:\/\/mirtpage\.test\/invite\//);
  expect((await page.request.get("/@acceptanceflowers")).status()).toBe(404);
  await page.goto("/preview/@acceptanceflowers");
  await expect(page.locator(".showroom")).toBeVisible();
  await page.goto("/dashboard/requests/on-behalf");
  const selamPicker = page.locator(".client-picker");
  await selamPicker.getByLabel("Search").fill("Selam Weave Studio");
  await selamPicker.getByRole("button", { name: "Apply" }).click();
  await page.getByRole("row").filter({ hasText: "Selam Weave Studio" }).getByRole("link", { name: "Select" }).click();
  await page.getByLabel("Client’s instruction").fill(
    "Please prepare a more expressive private showroom direction for administrator review.",
  );
  await page.getByRole("button", { name: "Record request for client" }).click();
  await expect(page.getByText("The client's request was created.")).toBeVisible();
  await page.getByRole("button", { name: "Prepare first revision" }).click();
  await expect(page.getByRole("heading", { name: "Showroom design workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Complete the image checklist" })).toBeVisible();
  await page.goto("/dashboard");
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.getByLabel("Email").fill("admin@mirtpage.local");
    await page.getByLabel("Password").fill("AdminAcceptance123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  }
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto(new URL(invitationUrl).pathname);
  await expect(page.getByRole("heading", { name: "Join Acceptance Market" })).toBeVisible();
  await page.getByLabel("Your name").fill("Acceptance Client");
  await page.getByLabel("Password", { exact:true }).fill("InvitedClient123!");
  await page.getByLabel("Confirm password").fill("InvitedClient123!");
  await page.getByRole("button", { name: "Create private workspace" }).click();
  await expect(page.getByText("Client workspace", { exact:true })).toBeVisible();
  await expect(page.getByRole("link", { name:"Collections & categories" })).toHaveCount(0);
  await expect(page.getByRole("link", { name:"Business settings" })).toHaveCount(0);
  await expect(page.getByRole("link", { name:"My offerings" })).toHaveCount(0);
  await page.goto("/dashboard/products");
  await expect(page).toHaveURL(/\/dashboard\/requests\/new/);
  await page.goto("/dashboard/design-bank");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Showroom design library" })).toHaveCount(0);
  await page.getByRole("link", { name:"Make a request" }).click();
  await expect(page.getByRole("heading", { name:"Request your first showroom" })).toBeVisible();
  await expect(page.getByText("New showroom request",{exact:true})).toBeVisible();
  await expect(page.getByLabel("Request type")).toHaveCount(0);
  await page.getByLabel("Products, capabilities, story, and requested outcome").fill("Please create a private showroom hero and clear product categories from this brief.");
  await expect(page.getByLabel(/reference images/i)).toHaveCount(0);
  await page.getByRole("button", { name:"Send request to MirtPage" }).click();
  await expect(page.getByRole("heading", { name:/REQ-/ })).toBeVisible();
  await expect(page.getByText("Private reference images")).toHaveCount(0);
  await page.goto("/dashboard/settings");
  await expect(page).toHaveURL(/\/dashboard$/);
  expect((await page.request.get("/api/malikt/requests")).status()).toBe(404);
  expect(errors.filter((error) => !error.includes("404"))).toEqual([]);
});

test("operations manager records on behalf and team member sees only assigned work", async ({page}) => {
  const errors=monitor(page);
  await loginAndChangeKnownPassword(page,"operations@example.test","OperationsTemp123!","OperationsReady123!");
  await page.goto("/dashboard/design-bank");
  await expect(page.getByRole("heading",{name:"Showroom design library"})).toBeVisible();
  await page.goto("/dashboard?business=5");
  await expect(page.getByRole("link",{name:"View showroom",exact:true})).toHaveCount(1);
  await page.getByRole("link",{name:"Create client request"}).click();
  await expect(page.getByRole("heading",{name:"Record a request for a client"})).toBeVisible();
  await page.goto("/dashboard/requests");
  await expect(page.getByRole("link",{name:"Create client request"}).first()).toBeVisible();
  await expect(page.getByRole("link",{name:"SaaS administration"})).toHaveCount(0);
  await page.getByRole("link",{name:"Create client request"}).first().click();
  await expect(page.getByRole("heading",{name:"Record a request for a client"})).toBeVisible();
  const clientPicker = page.locator(".client-picker");
  await clientPicker.getByLabel("Search").fill("Acceptance Market");
  await clientPicker.getByRole("button",{name:"Apply"}).click();
  await page.getByRole("row").filter({hasText:"Acceptance Market"}).getByRole("link",{name:"Select"}).click();
  await expect(page.getByText("New showroom request",{exact:true})).toBeVisible();
  await page.getByLabel("Client’s instruction").fill("The client asked us to prepare a revised private hero and product categories for review.");
  await expect(page.getByLabel(/reference images/i)).toHaveCount(0);
  await page.getByRole("button",{name:"Record request for client"}).click();
  await expect(page.getByText("The client's request was created.")).toBeVisible();
  await expect(page.getByText("MirtPage for client")).toBeVisible();
  const assignedRequestUrl=page.url();
  await page.getByLabel("Ask or answer a clarification").fill("Which hero message should the team prioritize?");
  await page.getByRole("button",{name:"Add clarification"}).click();
  await expect(page.getByText("Clarification message added.")).toBeVisible();
  await expect(page.getByText("Which hero message should the team prioritize?")).toBeVisible();
  await expect(page.locator(".dashboard-head .badge")).toHaveText("needs information");
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"acceptance-client@example.test","InvitedClient123!");
  await page.goto(assignedRequestUrl);
  await expect(page.getByText("MirtPage team",{exact:true})).toBeVisible();
  await page.getByLabel("Reply to MirtPage").fill("Please prioritize our handmade origin story.");
  await page.getByRole("button",{name:"Add clarification"}).click();
  await expect(page.locator(".dashboard-head .badge")).toHaveText("under review");
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"operations@example.test","OperationsReady123!");
  await page.goto(assignedRequestUrl);
  await page.getByLabel("Assigned team member").selectOption({label:"Acceptance Team · team@example.test"});
  await page.getByRole("button",{name:"Save assignment"}).click();
  await expect(page.getByText("Assignment updated.")).toBeVisible();
  await page.goto("/dashboard/catalog?business=5");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginAndChangeKnownPassword(page,"team@example.test","TeamMemberTemp123!","TeamMemberReady123!");
  await page.goto("/dashboard/design-bank");
  await expect(page.getByRole("heading",{name:"Showroom design library"})).toBeVisible();
  await page.goto("/dashboard/requests");
  await expect(page.getByRole("heading",{name:"Assigned requests"})).toBeVisible();
  await expect(page.getByRole("link",{name:"Create client request"})).toHaveCount(0);
  await page.goto(assignedRequestUrl);
  await expect(page.getByRole("main").getByText("Acceptance Team",{exact:true})).toBeVisible();
  await page.getByLabel("Status").selectOption("under_review");
  await page.getByRole("button",{name:"Update status"}).click();
  await expect(page.getByText("Request status updated.")).toBeVisible();
  await expect(page.getByText("Team assignment")).toHaveCount(0);
  await page.getByRole("button",{name:"Prepare first revision"}).click();
  await expect(page.getByRole("heading",{name:"Showroom design workspace"})).toBeVisible();
  const recipeStudioUrl=page.url();
  await expectVisibleControlsNamed(page);
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"acceptance-client@example.test","InvitedClient123!");
  await page.goto(assignedRequestUrl);
  await expect(page.getByText("MirtPage is preparing this revision.")).toBeVisible();
  await expect(page.getByRole("link",{name:"View preview"})).toHaveCount(0);
  await expect(page.getByText("Team assigned",{exact:true})).toBeVisible();
  await expect(page.getByText(/team_member:\d+/)).toHaveCount(0);
  await expect(page.getByText("Acceptance Team",{exact:true})).toHaveCount(0);
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"team@example.test","TeamMemberReady123!");
  await page.goto(recipeStudioUrl);
  await expect(page.getByRole("button", { name: "Copy AI brief" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy current design" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Complete the image checklist" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Offerings/ })).toBeVisible();
  await expect(page.getByText(/approved images|reference images/i)).toHaveCount(0);
  const [briefDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download brief" }).click(),
  ]);
  const briefPath = await briefDownload.path();
  expect(briefPath).toBeTruthy();
  const brief = JSON.parse(fs.readFileSync(briefPath!, "utf8"));
  await page.getByText("Complete design-file example").click();
  const recipe=JSON.parse(await page.locator(".recipe-code").textContent()||"{}");
  const {
    schemaVersion: _snapshotSchemaVersion,
    designManifest,
    ...currentContent
  } = brief.currentContent;
  recipe.baseContentVersion = brief.baseContentVersion;
  recipe.content = { schemaVersion: 1, ...currentContent };
  recipe.design = designManifest;
  recipe.design.customPalette = {
    canvas: "#F7F8FA",
    surface: "#FFFFFF",
    layer: "#E8EDF3",
    text: "#17212B",
    textMuted: "#4D5966",
    primary: "#006D77",
    primarySoft: "#D9F0F0",
    secondary: "#9B3A22",
    secondarySoft: "#F6DDD5",
    onSecondary: "#FFFFFF",
    strong: "#113F45",
    onStrong: "#FFFFFF",
    inverse: "#201A2B",
    onInverse: "#FFFFFF",
    border: "#AEB8C2",
  };
  recipe.mediaPlan = [];
  recipe.provenance = [];
  recipe.questions = [
    "Staff should verify the provisional production claims before publication.",
  ];
  recipe.summary="A freely drafted private showroom with a custom color direction.";
  recipe.content.business.heroTitle="Acceptance approved showroom";
  await page.getByRole("textbox", { name: "Showroom design JSON" }).fill(JSON.stringify(recipe));
  await page.getByRole("button",{name:"Check design and open preview"}).click();
  await expect(page.getByRole("heading",{name:"Revision 1 private preview"})).toBeVisible();
  await expect(page.locator('[data-custom-palette="true"]')).toBeVisible();
  await expect(page.getByRole("heading",{name:"Imported design changes"})).toBeVisible();
  const privatePreviewUrl = page.url();
  const recoveryEditorUrl = new URL(privatePreviewUrl);
  recoveryEditorUrl.pathname = recoveryEditorUrl.pathname.replace(/\/preview$/, "/edit");
  recoveryEditorUrl.search = "?area=design";
  await page.goto(recoveryEditorUrl.toString());
  await expect(page.getByRole("heading",{name:"Edit showroom"})).toBeVisible();
  await expect(page.getByRole("button", { name: "Layout and style" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Showroom settings" }).click();
  await expect(page.getByLabel("Use a custom showroom palette")).toBeChecked();
  await page.getByLabel("Primary accent hex value").fill("#14532D");
  const heroSection = recipe.design.sections.find(
    (section: { component: string }) => section.component.startsWith("hero."),
  );
  expect(heroSection).toBeTruthy();
  await page.getByRole("button", { name: "Layout and style" }).click();
  const heroSurface = page.getByLabel(`${recipe.content.business.heroTitle} surface`);
  const heroDisclosure = page.locator("details").filter({ has: heroSurface });
  await heroDisclosure.locator("summary").click();
  await heroSurface.selectOption("inverse");
  await page.getByRole("button", { name: "Offerings" }).click();
  await expect(page.getByRole("heading", { name: "Products & capabilities" })).toBeVisible();
  await page.getByRole("button", { name: "Add offering" }).click();
  await page.getByLabel("Product 1 name").fill("Staff-created showroom offering");
  await page.getByLabel("Product 1 slug").fill("staff-created-showroom-offering");
  await page.getByLabel("Product 1 description").fill("A staff-edited offering retained in the current showroom design.");
  await page.getByRole("button",{name:"Save private draft"}).click();
  await expect(page.getByText("Private draft saved.")).toBeVisible();
  await page.goto(recipeStudioUrl);
  const [currentDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download current design" }).click(),
  ]);
  const currentPath = await currentDownload.path();
  expect(currentPath).toBeTruthy();
  const currentDesign = JSON.parse(fs.readFileSync(currentPath!, "utf8"));
  expect(currentDesign.design.customPalette.primary).toBe("#14532D");
  expect(currentDesign.content.products[0].description).toBe(
    "A staff-edited offering retained in the current showroom design.",
  );
  await page.goto(privatePreviewUrl);
  const customShowroom = page.locator('[data-custom-palette="true"]');
  await expect(customShowroom).toBeVisible();
  await expect(customShowroom.locator(":scope > [data-surface]").nth(1)).toHaveAttribute(
    "data-surface",
    "inverse",
  );
  expect(
    await customShowroom.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--bank-accent").trim().toUpperCase(),
    ),
  ).toBe("#14532D");
  await page.getByRole("button",{name:"Send revision for client review"}).click();
  await expect(page.getByRole("heading",{name:"Revision 1 private preview"})).toBeVisible();
  await expect(page.getByText("Revision sent for client review.")).toBeVisible();
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"acceptance-client@example.test","InvitedClient123!");
  const deniedStudio=await page.goto(recipeStudioUrl);
  expect(deniedStudio?.status()).toBe(404);
  await page.goto(assignedRequestUrl);
  await page.getByRole("link",{name:"View preview"}).click();
  await expect(page.getByRole("button",{name:"Approve this revision"})).toBeVisible();
  await page.getByRole("button",{name:"Approve this revision"}).click();
  await expect(page.getByText("Your approve decision was recorded")).toBeVisible();
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"operations@example.test","OperationsReady123!");
  await page.goto(assignedRequestUrl);
  await page.getByRole("link",{name:"View preview"}).click();
  await page.getByRole("button",{name:"Publish approved revision"}).click();
  await expect(page.getByText("The approved revision is now live.")).toBeVisible();
  await page.goto("/@acceptance-market");
  await expect(page.getByRole("heading",{name:"Acceptance approved showroom"})).toBeVisible();
  await page.goto(assignedRequestUrl);
  await page.goto("/dashboard/requests/on-behalf");
  await expect(page.getByRole("heading",{name:"Record a request for a client"})).toBeVisible();
  await page.getByRole("button",{name:"Sign out"}).click();
  await loginWithKnownPassword(page,"team@example.test","TeamMemberReady123!");
  await page.goto("/dashboard/requests/on-behalf");
  await expect(page).toHaveURL(/\/dashboard\/requests$/);
  await page.goto("/dashboard/settings?business=5");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link").filter({hasText:"Acceptance Market"}).first().click();
  await page.getByRole("link",{name:"Offerings",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Products & capabilities"})).toBeVisible();
  await page.getByRole("link",{name:"Add offering"}).first().click();
  await page.getByLabel("Offering name").fill("Team assisted fabrication capability");
  await page.getByLabel("Description").fill("Created by assigned staff after the first showroom publication.");
  await page.getByLabel("Offering type").selectOption("manufacturing_capability");
  await expect(page.getByText("Desired quantity is optional")).toBeVisible();
  await page.getByLabel(/Production or supply capacity/).fill("Up to 800 assemblies per month");
  await page.getByLabel("Availability").selectOption("coming_soon");
  await page.getByLabel("Customer-service note").fill("The client asked the assigned team member to add this product.");
  await page.getByRole("button",{name:"Add and publish offering"}).click();
  await expect(page.getByText(/Offering published successfully as showroom version/)).toBeVisible();
  const teamProductUrl=page.url();
  await page.getByRole("button",{name:"Sign out"}).click();
  await loginWithKnownPassword(page,"operations@example.test","OperationsReady123!");
  await page.goto(teamProductUrl);
  await page.getByLabel("Availability").selectOption("available");
  await page.getByLabel("Customer-service note").fill("Operations confirmed availability with the client.");
  await page.getByRole("button",{name:"Save and publish offering"}).click();
  await expect(page.getByText(/Offering published successfully as showroom version/)).toBeVisible();
  expect(errors.filter((error)=>!error.includes("404"))).toEqual([]);
});

test("seeded client is restricted while operations manages customer activity", async ({ page }) => {
  const errors = monitor(page);
  await loginAndChangePassword(page, "selam-weave@mirtpage.local", "ClientAcceptance123!");
  await page.goto("/dashboard");
  await expect(page.getByText("Client workspace",{exact:true})).toBeVisible();
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/settings");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/catalog");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/products/new");
  await expect(page.getByRole("heading",{name:"Add a product or capability"})).toBeVisible();
  await expect(page.getByLabel("Customer-service note")).toHaveCount(0);
  await expect(page.getByLabel("Option group name")).toHaveCount(0);
  await expect(page.getByRole("button",{name:/Delete/})).toHaveCount(0);
  await page.getByLabel("Offering name").fill("Client browser product");
  await page.getByLabel("Description").fill("A client-managed product created in the simplified workflow.");
  await page.getByLabel("Availability").selectOption("limited");
  await expect(page.getByLabel("Collection")).toHaveCount(0);
  await page.getByLabel("Category").selectOption({index:1});
  await page.getByRole("button",{name:"Add and publish offering"}).click();
  await expect(page.getByText(/Offering published successfully as showroom version/)).toBeVisible();
  await page.goto("/dashboard/products");
  await expect(page.getByRole("heading",{name:"Products & capabilities"})).toBeVisible();
  await page.getByLabel("Search").fill("Client browser");
  await page.getByRole("button",{name:"Apply"}).click();
  await expect(page.getByText("Client browser product",{exact:true})).toBeVisible();
  await expect(page.getByText(/Showing 1-1 of 1/)).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  const overflowDiagnostics = await horizontalOverflowingElements(page);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    `Unexpected horizontal overflow: ${JSON.stringify(overflowDiagnostics)}`,
  ).toBe(true);
  const menuButton = page.getByRole("button",{name:"Open workspace menu"});
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  const workspaceMenu = page.getByRole("dialog",{name:"Workspace menu"});
  await expect(workspaceMenu).toBeVisible();
  await expect(page.getByRole("button",{name:"Close workspace menu"})).toBeFocused();
  await expect(workspaceMenu.getByRole("link",{name:"Requests",exact:true})).toBeVisible();
  await expect(workspaceMenu.getByRole("link",{name:"Customer inquiries"})).toBeVisible();
  await expect(workspaceMenu.getByRole("link",{name:"Delivery activity"})).toHaveCount(0);
  await expect(workspaceMenu.getByRole("link",{name:"Account security"})).toBeVisible();
  const smallWorkspaceTargets = await workspaceMenu.locator("a, button").evaluateAll((targets) => targets.flatMap((target) => {
    const rect=target.getBoundingClientRect();
    return rect.width&&rect.height<43.5?[`${target.tagName.toLowerCase()}:${target.textContent?.trim()||target.getAttribute("aria-label")}`]:[];
  }));
  expect(smallWorkspaceTargets).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(workspaceMenu).toHaveCount(0);
  await expect(menuButton).toBeFocused();
  await page.setViewportSize({width:1280,height:720});
  await page.goto("/dashboard/requests/new");
  await expect(page.getByText("Showroom change request",{exact:true})).toBeVisible();
  await expect(page.getByLabel("Request type")).toHaveCount(0);
  await page.goto("/dashboard/inquiries");
  await expectVisibleControlsNamed(page);
  await expect(page.getByRole("button",{name:"Update"})).toHaveCount(0);
  await expect(page.getByRole("link",{name:"Create delivery"})).toHaveCount(0);
  await page.getByLabel("Search").fill("Hana");
  await page.getByRole("button",{name:"Apply"}).click();
  const showroomInquiry = page.locator("section.panel").filter({hasText:"Hana"});
  await expect(showroomInquiry).toContainText("whatsapp: 251911000000");
  await expect(showroomInquiry).toContainText("Desired quantity: 1 unit");
  await page.goto("/dashboard/account-health");
  await expect(page.getByRole("heading",{name:"Selam Weave Studio"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Current period"})).toBeVisible();
  await expect(page.getByText("Unique visits",{exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Record payment and renew one month"})).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});
  await page.goto("/dashboard/support");
  await expect(page.getByRole("heading",{name:"How can we help?"})).toBeVisible();
  await page.getByLabel("Subject").fill("Acceptance support question");
  await page.getByLabel("Message").fill("Please help us verify the new support workflow.");
  await page.getByRole("button",{name:"Send to MirtPage support"}).click();
  await expect(page.getByRole("heading",{name:"Acceptance support question"})).toBeVisible();
  await expect(page.getByText("waiting",{exact:true})).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  ).toBe(true);
  await page.setViewportSize({width:1280,height:720});
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"operations@example.test","OperationsReady123!");
  await page.goto("/dashboard/account-health");
  await expect(page.getByRole("heading",{name:"Monthly accounts"})).toBeVisible();
  await expect(page.getByLabel("Renewal state")).toBeVisible();
  await expect(page.getByText(/Showing 1-10 of \d+/)).toBeVisible();
  await page.goto("/dashboard/support?status=waiting");
  await expect(page.getByRole("heading",{name:"Support inbox"})).toBeVisible();
  await page.getByRole("link",{name:"Manage support agents"}).click();
  await expect(page.getByRole("heading",{name:"Support agents"})).toBeVisible();
  await expect(page.getByText("Available agents",{exact:true})).toBeVisible();
  await expect(page.locator(".support-agent-list form").first()).toBeVisible();
  await page.getByRole("link",{name:"Open inbox"}).click();
  await expect(page.locator(".support-row").first()).toBeVisible();
  await expect(page.locator(".support-row").first().getByText("waiting",{exact:true})).toBeVisible();
  await page.goto("/dashboard/inquiries?business=1");
  await expectVisibleControlsNamed(page);
  await page.getByLabel("Search").fill("Hana");
  await page.getByRole("button",{name:"Apply"}).click();
  const row = page.locator("section.panel").filter({ hasText: "Hana" });
  await row.getByRole("combobox").selectOption("confirmed");
  await row.getByRole("button", { name: "Update" }).click();
  await expect(page.getByText("Inquiry status updated")).toBeVisible();
  await expect(row.getByRole("link", { name: /delivery/i })).toHaveCount(0);
  expect(readAcceptanceRow("inquiryByCustomer", "Hana")).toMatchObject({ status: "confirmed" });
  expect(errors).toEqual([]);
});

test("API authorization, validation, health, and security headers", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ status: "ok" });
  expect((await request.get("/api/malikt/companies")).status()).toBe(404);
  expect((await request.get("/api/malikt/requests")).status()).toBe(404);
  expect((await request.post("/api/inquiries", { data: { businessId: 1, customerName: "X", contact: "12345", items: [] } })).status()).toBe(400);
  const home = await request.get("/");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(home.headers()["content-security-policy"]).toContain("frame-src 'self' https://www.youtube-nocookie.com");
  expect(home.headers()["content-security-policy"]).not.toContain("youtube.com ");
});

test("controlled provider video uses narrow CSP and privacy-enhanced browser embed", async ({ page, request }) => {
  expect(installControlledVideoFixture()).toEqual({ handle: "selam-weave", updated: true });
  const response = await request.get("/@selam-weave");
  const csp = response.headers()["content-security-policy"];
  expect(csp).toContain("frame-src 'self' https://www.youtube-nocookie.com");
  expect(csp).not.toContain("https://www.youtube.com");
  await page.goto("/@selam-weave");
  const processSection = page.locator('[data-slot="content"]').filter({
    hasText: "Inside the process",
  });
  await expect(processSection).toBeVisible();
  await expect(page.locator('[data-slot="header"] iframe, [data-slot="header"] button[aria-label*="process video"]')).toHaveCount(0);
  await expect(processSection.locator("iframe")).toHaveCount(0);
  await processSection.getByRole("button", { name: "Play Selam Weave Studio process video" }).click();
  const frame = processSection.locator('iframe[title="Selam Weave Studio process video"]');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute("loading", "lazy");
  await expect(frame).toHaveAttribute("allow", /encrypted-media/);
  await expect(frame).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/wJV9EDe_sFc");
  expect(await page.locator('iframe[src*="youtube.com/embed"]').count()).toBe(0);
});
