import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type AcceptanceProbe = "inquiryByCustomer" | "deliveryByAddress";
const readAcceptanceRow = (probe: AcceptanceProbe, value: string) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [path.join(process.cwd(), "scripts/acceptance-db-probe.mjs"), process.env.SUQPAGE_TEST_DB!, probe, value],
      { encoding: "utf8" },
    ),
  ) as Record<string, unknown> | null;

const credentials = fs.readFileSync(process.env.SUQPAGE_TEST_CREDENTIALS!, "utf8");
const passwordFor = (email: string) => {
  const line = credentials.split("\n").find((entry) => entry.includes(`| ${email} |`));
  if (!line) throw new Error(`No seeded credential for ${email}`);
  return line.split("|").at(-1)!.trim();
};
const installControlledVideoFixture = (handle = "selam-weave") =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [path.join(process.cwd(), "scripts/acceptance-video-fixture.mjs"), process.env.SUQPAGE_TEST_DB!, handle],
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

test("prospect submits an interest request without public uploads", async ({ page }) => {
  const errors = monitor(page);
  await page.goto("/request");
  await expectVisibleControlsNamed(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Introduce your business");
  await page.getByLabel("Your name").fill("Acceptance Prospect");
  await page.getByLabel("Email, phone, or WhatsApp").fill("prospect@example.test");
  await page.getByLabel(/Business name/).fill("Acceptance Market");
  await page.getByLabel("What are you interested in?").fill("I am interested in a showroom for our handmade home products.");
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await page.getByLabel(/SuqPage may use/).check();
  await page.getByRole("button", { name: "Tell SuqPage I’m interested" }).click();
  await expect(page.getByRole("status")).toContainText(/REQ-[A-F0-9]{12}/);
  await expect(page.getByRole("status")).toContainText("Nothing has been accepted, designed, or published yet");
  const publicUpload = await page.request.post("/api/requests", { multipart: { contactName: "Upload Attempt", contactValue: "upload@example.test", requestText: "Trying a forbidden public upload", consent: "on", idempotencyKey: "public-upload-test-123", images: { name: "blocked.png", mimeType: "image/png", buffer: fs.readFileSync(path.join(process.cwd(), "public/uploads/seed/suqpage/icon.png")) } } });
  expect(publicUpload.status()).toBe(415);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors.filter((error) => !error.includes("404"))).toEqual([]);
});

test("public discovery, Expo, benchmark showrooms, and copy-first inquiry", async ({ page }) => {
  const errors = monitor(page);
  await page.goto("/");
  await expectVisibleControlsNamed(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Virtual showrooms and daily Expos");
  await expect(page.getByRole("heading", { name: "This week's Expo calendar" })).toBeVisible();
  await expect(page.locator(".landing-schedule")).toHaveCount(0);
  await expect(page.locator(".landing-expo-section .landing-expo-calendar")).toBeVisible();
  expect(
    await page.evaluate(() => {
      const calendar = document.querySelector(".landing-expo-calendar");
      const explorer = document.querySelector(".landing-expo-section .expo-explorer");
      return Boolean(
        calendar &&
        explorer &&
        (calendar.compareDocumentPosition(explorer) & Node.DOCUMENT_POSITION_FOLLOWING),
      );
    }),
  ).toBe(true);
  await expect(page.getByRole("heading", { name: "Find a showroom." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Enterprise & Export Showcase" })).toBeVisible();
  await expect(page.getByRole("tablist", { name: "Expo view" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Map View" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "List View" })).toBeVisible();
  await expect(page.locator(".expo-regions path")).toHaveCount(14);
  await expect(page.locator(".expo-hub")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "Bring your business into the next Expo." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How SuqPage works" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /How it works/i })).toHaveCount(0);
  await expect(page.locator(".landing-hero-image")).toBeVisible();
  await expect(page.getByLabel("Category selector")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "All businesses" })).toHaveCount(0);
  await expect(page.locator(".market-showrooms .market-heading-link")).toHaveCount(0);
  await page.getByRole("link", { name: "All industries" }).click();
  await expect(page.locator(".market-showroom-card")).toHaveCount(5);
  expect(await page.locator(".market-showroom-card").count()).toBeLessThanOrEqual(5);
  await page.locator(".directory-filters a").nth(1).click();
  expect(await page.locator(".market-showroom-card").count()).toBeGreaterThan(0);
  expect(await page.locator(".market-showroom-card").count()).toBeLessThanOrEqual(5);
  expect(await page.locator(".market-showroom-card").first().evaluate((card) => card.getBoundingClientRect().width)).toBeLessThanOrEqual(280);
  await page.getByRole("link", { name: "All industries" }).click();
  await expect(page.locator(".market-featured-label")).toHaveCount(5);
  await expect(page.getByRole("link", { name: "Next page" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
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
  await expect(page.getByPlaceholder("How the business can contact you")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "TikTok" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share / copy" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "WhatsApp" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Telegram" })).toBeVisible();
  await page.getByRole("button", { name: "Copy inquiry" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  const copiedReference = page.locator(".copied-reference pre");
  await expect(copiedReference).toContainText("Showroom reference: @selam-weave");
  await expect(copiedReference).not.toContainText("Desired quantity:");
  expect(readAcceptanceRow("inquiryByCustomer", "Browser Tester")).toBeNull();
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
  await page.getByLabel("Search products and capabilities").fill("Short-Run");
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

test("mobile city Expo venue, booth preview, list parity, and overflow", async ({ page }) => {
  const errors = monitor(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/expo");
  await expect(page.getByRole("heading", { name: "Find today's Expo host cities." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Enterprise & Export Showcase" })).toBeVisible();
  await expect(page.locator(".expo-regions path")).toHaveCount(14);
  await expect(page.locator(".expo-hub")).toHaveCount(5);
  await expect(page.getByLabel("Jump to a host city").locator("option")).toHaveCount(6);
  await page.getByLabel("Jump to a host city").selectOption({ label: "Dire Dawa, Dire Dawa urban · 3 booths" });
  const contextualStage = page.locator(".expo-map-stage-venue");
  await expect(contextualStage).toBeVisible();
  await expect(contextualStage.locator(".expo-map")).toBeVisible();
  await expect(contextualStage.locator(".expo-regions path")).toHaveCount(14);
  await expect(contextualStage.getByText("Virtual Expo anchored in")).toBeVisible();
  await expect(contextualStage.locator(".expo-city-context strong")).toHaveText("Dire Dawa");
  await expect(page.locator(".expo-venue-booth")).toHaveCount(3);
  await expect(page.getByText("Entrance")).toBeVisible();
  await expect(page.getByText("Reception")).toBeVisible();
  const dawaBooth = page.getByRole("button", { name: /Select Dawa Water Solutions, H\d+\.1-B\d+/ });
  const dawaReference = (await dawaBooth.getAttribute("aria-label"))?.match(/(H\d+\.1-B\d+)/)?.[1] || "";
  expect(dawaReference).toMatch(/^H\d+\.1-B\d{2}$/);
  await dawaBooth.click();
  const preview = page.getByLabel("Dawa Water Solutions booth preview");
  await expect(preview).toBeVisible();
  await expect(preview.locator(".expo-preview-meta").getByText(dawaReference)).toBeVisible();
  await expect(preview.getByText(/From Dire Dawa, Dire Dawa urban, Dire Dawa/)).toBeVisible();
  await expect(preview.getByRole("link", { name: "Enter showroom" })).toHaveAttribute("href", "/@dawa-water-solutions");
  await page.getByRole("button", { name: "Close Dire Dawa Expo and return to Ethiopia" }).click();
  await expect(page.getByLabel("Jump to a host city")).toHaveValue("");
  await expect(page.locator(".expo-map-stage-venue")).toHaveCount(0);
  await expect(page.locator(".expo-map")).toBeVisible();
  await expect(page.locator(".expo-venue")).toHaveCount(0);
  await page.getByRole("button", { name: "Center today's Expos" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("tab", { name: "List View" }).click();
  await expect(page.locator(".expo-list-card")).toHaveCount(16);
  await expect(page.getByRole("link", { name: "Enter showroom" })).toHaveCount(16);
  await expect(page.locator(".expo-list-card").filter({ hasText: "Dawa Water Solutions" }).getByText(dawaReference)).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.goto("/bazaar");
  await expect(page).toHaveURL(/\/expo$/);
  expect(errors).toEqual([]);
});

test("platform surfaces share the SuqPage identity", async ({ page }) => {
  const errors = monitor(page);
  for (const pathName of ["/", "/expo", "/request", "/login", "/privacy", "/terms"]) {
    await page.goto(pathName);
    const brand = page.locator('.suqpage-brand img[src="/brand/suqpage-mark.svg"]').first();
    await expect(brand).toBeVisible();
    await expect(brand.locator("..")).toHaveAccessibleName("SuqPage home");
  }
  expect(errors).toEqual([]);
});

test("administrator onboards and previews a publicly hidden draft tenant", async ({ page }) => {
  const errors = monitor(page);
  await loginAndChangePassword(page, "admin@suqpage.local", "AdminAcceptance123!");
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Private workspace" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "SuqPage home" })).toHaveAttribute("href", "/dashboard");
  await expect(page.getByRole("link", { name: "Public site", exact: true })).toHaveAttribute("target", "_blank");
  await page.getByRole("link", { name: "SuqPage home" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link", { name: "Expo controls" }).click();
  await expect(page.getByRole("heading", { name: "Expo controls" })).toBeVisible();
  await page.getByLabel("Search").fill("Dawa Water Solutions");
  await page.getByRole("button", { name: "Apply" }).click();
  const dawaRow = page.getByRole("row").filter({ hasText: "Dawa Water Solutions" }).first();
  await expect(dawaRow.getByText("Expo eligible")).toBeVisible();
  await dawaRow.getByRole("link", { name: "Edit profile" }).click();
  await page.getByLabel("Featured showroom").check();
  await page.getByRole("button", { name: "Save Expo profile" }).click();
  await expect(page.getByText("Expo profile saved")).toBeVisible();
  await page.goto("/expo");
  await page.getByRole("tab", { name: "List View" }).click();
  await expect(
    page.locator(".expo-list-card").filter({ hasText: "Dawa Water Solutions" }).getByText("Featured"),
  ).toBeVisible();
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Component bank" }).click();
  await expect(page.getByRole("heading", { name: "Showroom component bank" })).toBeVisible();
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
  await page.getByRole("link", { name: /REQ-/ }).click();
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
  expect(invitationUrl).toMatch(/^https:\/\/suqpage\.test\/invite\/[A-Za-z0-9_-]{40,100}$/);
  await page.goto("/dashboard/admin?view=staff");
  await expectVisibleControlsNamed(page);
  let staffPanel = page.locator("section.panel").filter({has:page.getByRole("heading",{name:"Staff access"})});
  await staffPanel.locator("summary").filter({hasText:"Create staff account"}).click();
  await staffPanel.getByLabel("Name").fill("Acceptance Operations");
  await staffPanel.getByLabel("Email").fill("operations@example.test");
  await staffPanel.getByLabel("Access role").selectOption("operations_manager");
  await staffPanel.getByLabel("Temporary password").fill("OperationsTemp123!");
  await staffPanel.getByRole("button",{name:"Create staff account"}).click();
  await expect(page.getByText("Acceptance Operations")).toBeVisible();
  staffPanel = page.locator("section.panel").filter({has:page.getByRole("heading",{name:"Staff access"})});
  await staffPanel.locator("summary").filter({hasText:"Create staff account"}).click();
  await staffPanel.getByLabel("Name").fill("Acceptance Team");
  await staffPanel.getByLabel("Email").fill("team@example.test");
  await staffPanel.getByLabel("Access role").selectOption("team_member");
  await staffPanel.getByLabel("Temporary password").fill("TeamMemberTemp123!");
  await staffPanel.getByRole("button",{name:"Create staff account"}).click();
  await expect(page.getByRole("main").getByText("Acceptance Team",{exact:true})).toBeVisible();
  await page.getByRole("link",{name:"Create client workspace"}).first().click();
  await expect(page.getByRole("heading",{name:"Create a client workspace"})).toBeVisible();
  await expectVisibleControlsNamed(page);
  await page.getByLabel("Business name").fill("Acceptance Flowers");
  await page.getByLabel("Showroom handle").fill("acceptanceflowers");
  await page.getByLabel("Client name").fill("Flower Client");
  await page.getByLabel("Client email").fill("flowers@example.test");
  await page.getByRole("button", { name: "Create client workspace and invitation" }).click();
  await expect(page.getByText("Client workspace created.")).toBeVisible();
  await expect(page.getByLabel("Single-use client workspace invitation")).toHaveValue(/^https:\/\/suqpage\.test\/invite\//);
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
  await expect(page.getByText("The request was recorded on behalf of the client.")).toBeVisible();
  await page.getByRole("button", { name: "Prepare first recipe" }).click();
  await expect(page.getByRole("heading", { name: "Showroom recipe studio" })).toBeVisible();
  await expect(page.getByText("Advanced recovery")).toBeVisible();
  await page.goto("/dashboard");
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.getByLabel("Email").fill("admin@suqpage.local");
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
  await expect(page.getByRole("heading", { name: "Showroom component bank" })).toHaveCount(0);
  await page.getByRole("link", { name:"Make a request" }).click();
  await expect(page.getByRole("heading", { name:"Request your first showroom" })).toBeVisible();
  await expect(page.getByText("New showroom request",{exact:true})).toBeVisible();
  await expect(page.getByLabel("Request type")).toHaveCount(0);
  await page.getByLabel("Products, capabilities, story, and requested outcome").fill("Please use this reference to update the private showroom hero and product categories.");
  await page.getByLabel(/Available reference images/).setInputFiles(path.join(process.cwd(), "public/uploads/seed/suqpage/icon.png"));
  await page.getByRole("button", { name:"Send request to SuqPage" }).click();
  await expect(page.getByRole("heading", { name:/REQ-/ })).toBeVisible();
  await expect(page.locator(".request-image-grid img")).toHaveCount(1);
  await page.goto("/dashboard/settings");
  await expect(page).toHaveURL(/\/dashboard$/);
  const clientSession = (await page.context().cookies()).find((cookie) => cookie.name === "suqpage_session");
  const origin = await page.evaluate(() => location.origin);
  const deniedMutation = await page.request.post("/api/malikt/requests", { headers:{ Origin:origin, Cookie:`suqpage_session=${clientSession!.value}` }, data:{ businessId:5, customerName:"Denied", phone:"12345", pickupAddress:"A", deliveryAddress:"B", packageCount:1, companyIds:[1], idempotencyKey:"denied_client_123456" } });
  expect(deniedMutation.status()).toBe(403);
  expect(errors.filter((error) => !error.includes("404"))).toEqual([]);
});

test("operations manager records on behalf and team member sees only assigned work", async ({page}) => {
  const errors=monitor(page);
  await loginAndChangeKnownPassword(page,"operations@example.test","OperationsTemp123!","OperationsReady123!");
  await page.goto("/dashboard/design-bank");
  await expect(page.getByRole("heading",{name:"Showroom component bank"})).toBeVisible();
  await page.goto("/dashboard?business=5");
  await expect(page.getByRole("link",{name:"Showroom context",exact:true})).toHaveCount(1);
  await page.getByRole("link",{name:"Submit on behalf of client"}).click();
  await expect(page.getByRole("heading",{name:"Record a request for a client"})).toBeVisible();
  await page.goto("/dashboard/requests");
  await expect(page.getByRole("link",{name:"Record on behalf"}).first()).toBeVisible();
  await expect(page.getByRole("link",{name:"SaaS administration"})).toHaveCount(0);
  await page.getByRole("link",{name:"Record on behalf"}).first().click();
  await expect(page.getByRole("heading",{name:"Record a request for a client"})).toBeVisible();
  const clientPicker = page.locator(".client-picker");
  await clientPicker.getByLabel("Search").fill("Acceptance Market");
  await clientPicker.getByRole("button",{name:"Apply"}).click();
  await page.getByRole("row").filter({hasText:"Acceptance Market"}).getByRole("link",{name:"Select"}).click();
  await expect(page.getByText("New showroom request",{exact:true})).toBeVisible();
  await page.getByLabel("Client’s instruction").fill("The client asked us to prepare a revised private hero and featured collection for review.");
  await page.getByLabel(/Available reference images/).setInputFiles(path.join(process.cwd(),"public/uploads/seed/suqpage/icon.png"));
  await page.getByRole("button",{name:"Record request for client"}).click();
  await expect(page.getByText("The request was recorded on behalf of the client.")).toBeVisible();
  await expect(page.getByText("SuqPage for client")).toBeVisible();
  const assignedRequestUrl=page.url();
  await page.getByLabel("Ask or answer a clarification").fill("Which hero message should the team prioritize?");
  await page.getByRole("button",{name:"Add clarification"}).click();
  await expect(page.getByText("Clarification message added.")).toBeVisible();
  await expect(page.getByText("Which hero message should the team prioritize?")).toBeVisible();
  await expect(page.locator(".dashboard-head .badge")).toHaveText("needs information");
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"acceptance-client@example.test","InvitedClient123!");
  await page.goto(assignedRequestUrl);
  await expect(page.getByText("SuqPage team",{exact:true})).toBeVisible();
  await page.getByLabel("Reply to SuqPage").fill("Please prioritize our handmade origin story.");
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
  await expect(page.getByRole("heading",{name:"Showroom component bank"})).toBeVisible();
  await page.goto("/dashboard/requests");
  await expect(page.getByRole("heading",{name:"Assigned requests"})).toBeVisible();
  await expect(page.getByRole("link",{name:"Record on behalf"})).toHaveCount(0);
  await page.goto(assignedRequestUrl);
  await expect(page.getByRole("main").getByText("Acceptance Team",{exact:true})).toBeVisible();
  await page.getByLabel("Status").selectOption("under_review");
  await page.getByRole("button",{name:"Update status"}).click();
  await expect(page.getByText("Request status updated.")).toBeVisible();
  await expect(page.getByText("Team assignment")).toHaveCount(0);
  await page.getByRole("button",{name:"Prepare first recipe"}).click();
  await expect(page.getByRole("heading",{name:"Showroom recipe studio"})).toBeVisible();
  const recipeStudioUrl=page.url();
  await expectVisibleControlsNamed(page);
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"acceptance-client@example.test","InvitedClient123!");
  await page.goto(assignedRequestUrl);
  await expect(page.getByText("SuqPage is preparing this revision.")).toBeVisible();
  await expect(page.getByRole("link",{name:"View preview"})).toHaveCount(0);
  await expect(page.getByText("Team assigned",{exact:true})).toBeVisible();
  await expect(page.getByText(/team_member:\d+/)).toHaveCount(0);
  await expect(page.getByText("Acceptance Team",{exact:true})).toHaveCount(0);
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"team@example.test","TeamMemberReady123!");
  await page.goto(recipeStudioUrl);
  const [briefDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download brief" }).click(),
  ]);
  const briefPath = await briefDownload.path();
  expect(briefPath).toBeTruthy();
  const brief = JSON.parse(fs.readFileSync(briefPath!, "utf8"));
  await page.getByText("Complete valid recipe example").click();
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
  await page.getByRole("textbox", { name: "Recipe JSON" }).fill(JSON.stringify(recipe));
  await page.getByRole("button",{name:"Validate blueprint and open preview"}).click();
  await expect(page.getByRole("heading",{name:"Revision 1 private preview"})).toBeVisible();
  await expect(page.locator('[data-custom-palette="true"]')).toBeVisible();
  await expect(page.getByRole("heading",{name:"Validated recipe difference"})).toBeVisible();
  const privatePreviewUrl = page.url();
  const recoveryEditorUrl = new URL(privatePreviewUrl);
  recoveryEditorUrl.pathname = recoveryEditorUrl.pathname.replace(/\/preview$/, "/edit");
  recoveryEditorUrl.search = "";
  await page.goto(recoveryEditorUrl.toString());
  await expect(page.getByRole("heading",{name:"Manual revision editor"})).toBeVisible();
  await expect(page.getByLabel("Use a custom showroom palette")).toBeChecked();
  await page.getByLabel("Primary accent hex value").fill("#14532D");
  const heroSection = recipe.design.sections.find(
    (section: { component: string }) => section.component.startsWith("hero."),
  );
  expect(heroSection).toBeTruthy();
  await page.getByLabel(`${heroSection.key} surface`).selectOption("inverse");
  await page.getByRole("button",{name:"Save private draft"}).click();
  await expect(page.getByText("Private draft saved.")).toBeVisible();
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
  await expect(page.getByRole("button",{name:"Approve this exact revision"})).toBeVisible();
  await page.getByRole("button",{name:"Approve this exact revision"}).click();
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
  await page.getByRole("link",{name:"My offerings"}).click();
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
  await loginAndChangePassword(page, "selam-weave@suqpage.local", "ClientAcceptance123!");
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
  await expect(workspaceMenu.getByRole("link",{name:"Delivery activity"})).toBeVisible();
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
  await page.getByRole("button",{name:"Sign out"}).click();

  await loginWithKnownPassword(page,"operations@example.test","OperationsReady123!");
  await page.goto("/dashboard/inquiries?business=1");
  await expectVisibleControlsNamed(page);
  await page.getByLabel("Search").fill("Hana");
  await page.getByRole("button",{name:"Apply"}).click();
  const row = page.locator("section.panel").filter({ hasText: "Hana" });
  await row.getByRole("combobox").selectOption("confirmed");
  await row.getByRole("button", { name: "Update" }).click();
  await expect(page.getByText("Inquiry status updated")).toBeVisible();
  await row.getByRole("link", { name: "Create delivery request" }).click();
  await expectVisibleControlsNamed(page);
  const sessionCookie = (await page.context().cookies()).find((cookie) => cookie.name === "suqpage_session");
  expect(sessionCookie).toBeDefined();
  const oversized = await page.request.post("/api/malikt/requests", {
    headers: {
      Origin: "https://suqpage.test",
      "Content-Type": "application/json",
      Cookie: `suqpage_session=${sessionCookie!.value}`,
    },
    data: "x".repeat(65 * 1024),
  });
  expect(oversized.status()).toBe(413);
  await page.locator('input[name="pickupAddress"]').fill("Acceptance pickup");
  await page.locator('input[name="deliveryAddress"]').fill("Acceptance destination");
  await page.getByRole("button", { name: "Submit to Malikt Board" }).click();
  await expect(page.getByText(/submitted to the mock Malikt Board/)).toBeVisible();
  expect(readAcceptanceRow("inquiryByCustomer", "Hana")).toMatchObject({ status: "confirmed" });
  expect(readAcceptanceRow("deliveryByAddress", "Acceptance destination")).toEqual({ status: "submitted" });
  expect(errors).toEqual([]);
});

test("API authorization, validation, health, and security headers", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ status: "ok" });
  const companies = await request.get("/api/malikt/companies");
  expect(companies.status()).toBe(200);
  expect((await companies.json()).companies).toHaveLength(4);
  expect((await request.get("/api/malikt/requests")).status()).toBe(401);
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
  const frame = page.locator('iframe[title="Approved process film"]');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute("loading", "lazy");
  await expect(frame).toHaveAttribute("allow", /encrypted-media/);
  await expect(frame).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  expect(await page.locator('iframe[src*="youtube.com/embed"]').count()).toBe(0);
});
