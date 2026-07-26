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
const installControlledVideoFixture = (handle = "alhayabrand") =>
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

test("public discovery, four showrooms, cart, and persisted inquiry", async ({ page }) => {
  const errors = monitor(page);
  await page.goto("/");
  await expectVisibleControlsNamed(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your products");
  await expect(page.getByText("This week's Bazaar schedule")).toBeVisible();
  await expect(page.getByRole("heading", { name: "All Showrooms" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Today's Bazaar:/ })).toBeVisible();
  await expect(page.getByRole("tablist", { name: "Bazaar view" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Map View" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "List View" })).toBeVisible();
  await expect(page.locator(".bazaar-booth-number")).toHaveCount(4);
  await expect(page.getByLabel(/Map Directory/).getByText(/R1-01/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Featured showrooms" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ready to give your business a showroom of its own?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How SuqPage works" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /How it works/i })).toHaveCount(0);
  await expect(page.locator(".market-hero-image")).toBeVisible();
  await expect(page.getByLabel("Category selector")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "All businesses" })).toHaveCount(0);
  await expect(page.locator(".market-showrooms .market-heading-link")).toHaveCount(0);
  await page.getByRole("button", { name: "All industries" }).click();
  await expect(page.locator(".market-showroom-card")).toHaveCount(4);
  expect(await page.locator(".market-showroom-card").count()).toBeLessThanOrEqual(5);
  await page.locator(".directory-filters button").nth(1).click();
  expect(await page.locator(".market-showroom-card").count()).toBeGreaterThan(0);
  expect(await page.locator(".market-showroom-card").count()).toBeLessThanOrEqual(5);
  expect(await page.locator(".market-showroom-card").evaluate((card) => card.getBoundingClientRect().width)).toBeLessThanOrEqual(280);
  await page.getByRole("button", { name: "All industries" }).click();
  await expect(page.locator('.featured-card:not([data-carousel-clone="true"])')).toHaveCount(4);
  const featuredRail = page.locator(".featured-rail");
  expect(await featuredRail.evaluate((rail) => rail.scrollWidth > rail.clientWidth)).toBe(true);
  await expect.poll(() => featuredRail.evaluate((rail) => rail.scrollLeft), { timeout: 7_000 }).toBeGreaterThan(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("Open public navigation").click();
  await expect(page.getByRole("navigation", { name: "Mobile public navigation" }).getByRole("link", { name: "Login" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
  const compositionSignatures = new Set<string>();
  for (const handle of ["alhayabrand", "usashopet", "novatech", "homevibe"]) {
    await page.goto(`/@${handle}`);
    await expect(page.locator(".showroom")).toBeVisible();
    await expect(page.locator('[data-bank-release="showroom-bank@1.2.0"]')).toBeVisible();
    await expect(page.locator(".sr-card").first()).toBeVisible();
    compositionSignatures.add(
      await page.locator("[data-token-pack]").getAttribute("data-token-pack") || "",
    );
    await expectVisibleControlsNamed(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  expect(compositionSignatures.size).toBe(4);
  await page.goto("/@alhayabrand");
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
  const drawerOpener = page.getByRole("button", { name: /Inquiry.*1/ }).first();
  await drawerOpener.click();
  await expect(page.getByRole("button", { name: "Close inquiry" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await page.getByRole("dialog", { name: "Product inquiry" }).evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(drawerOpener).toBeFocused();
  await expect(page.locator(".inquiry-drawer")).toHaveAttribute("aria-hidden", "true");
  await drawerOpener.click();
  await page.getByPlaceholder("Your first name").fill("Browser Tester");
  await page.getByPlaceholder("How the business can contact you").fill("251900123456");
  await page.getByPlaceholder("Delivery area or another question").fill("Acceptance test inquiry");
  await page.getByRole("button", { name: "Share / copy" }).click();
  await expect(page.getByText("Message", { exact: true })).toBeVisible();
  const saved = readAcceptanceRow("inquiryByCustomer", "Browser Tester");
  expect(saved).toEqual({ status: "new", contact: "251900123456" });
  expect(errors).toEqual([]);
});

test("mobile search, persistent cart, quantity, and overflow", async ({ page }) => {
  const errors = monitor(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/@usashopet");
  await page.getByLabel("Search products").fill("CeraVe");
  await expect(page.locator(".sr-card")).toHaveCount(1);
  await page.locator(".sr-card").first().getByRole("button", { name: /^View / }).click();
  await page.getByRole("button", { name: "Add selected item" }).click();
  await page.reload();
  await page.getByRole("button", { name: /Inquiry.*1/ }).first().click();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator(".qty strong")).toHaveText("2");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 700 });
  for (const handle of ["alhayabrand", "usashopet", "novatech", "homevibe"]) {
    await page.goto(`/@${handle}`);
    await expect(page.locator(".showroom")).toBeVisible();
    await expect(page.locator(".sr-card").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("mobile Bazaar map, booth preview, list fallback, and overflow", async ({ page }) => {
  const errors = monitor(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/bazaar");
  await expect(page.getByRole("heading", { name: "Move through today's Bazaar." })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Today's Bazaar:/ })).toContainText("Community Market");
  await expect(page.getByText("4 booths on the floor")).toBeVisible();
  await expect(page.getByRole("button", { name: /Select .* booth/ })).toHaveCount(4);
  await expect(page.locator(".bazaar-booth-grounded")).toHaveCount(4);
  await expect(page.locator(".bazaar-booth-number")).toHaveCount(4);
  await expect(page.locator(".bazaar-corridor")).toHaveCount(2);
  await expect(page.locator(".bazaar-floor-visual")).toHaveCount(0);
  const storefrontsMeetCorridor = await page.locator(".bazaar-map-viewport").evaluate((viewport) => {
    const corridors = [...viewport.querySelectorAll<HTMLElement>(".bazaar-corridor")];
    const storefronts = [...viewport.querySelectorAll<HTMLElement>(".bazaar-booth-grounded")];
    if (corridors.length === 0 || storefronts.length === 0) return false;
    const corridorTops = corridors.map((corridor) => corridor.getBoundingClientRect().top);
    return storefronts.every((storefront) => corridorTops.some((top) => Math.abs(storefront.getBoundingClientRect().bottom - top) < 2));
  });
  expect(storefrontsMeetCorridor).toBe(true);
  const balancedFloorFitsMobile = await page.locator(".bazaar-map-viewport").evaluate((viewport) => {
    const floor = viewport.querySelector<HTMLElement>(".bazaar-floor");
    const storefronts = [...viewport.querySelectorAll<HTMLElement>(".bazaar-booth-grounded")];
    if (!floor) return false;
    const floorRect = floor.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const rowTops = new Set(storefronts.map((storefront) => Math.round(storefront.getBoundingClientRect().top)));
    return floorRect.width <= viewportRect.width && floorRect.left >= viewportRect.left && rowTops.size === 2;
  });
  expect(balancedFloorFitsMobile).toBe(true);
  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.getByRole("button", { name: "Zoom out" }).click();
  await page.getByRole("button", { name: "Reset Bazaar view" }).click();
  const novaBooth = page.getByRole("button", { name: "Select NovaTech booth" });
  const novaReference = await novaBooth.locator(".bazaar-booth-number").textContent();
  expect(novaReference).toMatch(/^R\d+-\d{2}$/);
  await novaBooth.click();
  await expect(page.getByLabel("NovaTech booth preview")).toBeVisible();
  await expect(page.getByLabel("NovaTech booth preview").locator(".bazaar-reference")).toHaveText(novaReference || "");
  await expect(page.getByRole("link", { name: "Enter showroom" })).toHaveAttribute("href", "/@novatech");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("tab", { name: "List View" }).click();
  await expect(page.locator(".bazaar-list-card")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Enter showroom" })).toHaveCount(4);
  await expect(page.locator(".bazaar-list-card").filter({ hasText: "NovaTech" }).locator(".bazaar-reference")).toHaveText(novaReference || "");
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("platform surfaces share the SuqPage identity", async ({ page }) => {
  const errors = monitor(page);
  for (const pathName of ["/", "/bazaar", "/request", "/login", "/privacy", "/terms"]) {
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
  await page.getByRole("link", { name: "Bazaar controls" }).click();
  await expect(page.getByRole("heading", { name: "Bazaar controls" })).toBeVisible();
  const novaRow = page.getByRole("row").filter({ hasText: "NovaTech" }).first();
  await novaRow.getByLabel("Featured").check();
  await novaRow.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Bazaar controls saved.")).toBeVisible();
  await page.goto("/bazaar");
  await page.getByRole("button", { name: "Select NovaTech booth" }).click();
  await expect(page.getByLabel("NovaTech booth preview").getByText("Featured")).toBeVisible();
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
  await expect(page.getByRole("heading",{name:"My products"})).toBeVisible();
  await page.getByRole("link",{name:"Edit basic details"}).first().click();
  await expect(page.getByLabel("Customer-service note")).toBeVisible();
  await expect(page.getByLabel("Sort order")).toHaveCount(0);
  await expect(page.getByLabel("Publish in showroom")).toHaveCount(0);
  await page.getByLabel("Description").fill("Administrator-verified browser upkeep description.");
  await page.getByLabel("Customer-service note").fill("Verified basic upkeep before the client demo.");
  await page.getByRole("button",{name:"Save and publish product"}).click();
  await expect(page.getByText(/Product published successfully as showroom version/)).toBeVisible();
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
  await page.goto("/dashboard/admin");
  await expectVisibleControlsNamed(page);
  let staffPanel = page.locator("section.panel").filter({has:page.getByRole("heading",{name:"Staff access"})});
  await staffPanel.getByLabel("Name").fill("Acceptance Operations");
  await staffPanel.getByLabel("Email").fill("operations@example.test");
  await staffPanel.getByLabel("Access role").selectOption("operations_manager");
  await staffPanel.getByLabel("Temporary password").fill("OperationsTemp123!");
  await staffPanel.getByRole("button",{name:"Create staff account"}).click();
  await expect(page.getByText("Acceptance Operations")).toBeVisible();
  staffPanel = page.locator("section.panel").filter({has:page.getByRole("heading",{name:"Staff access"})});
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
  await page.getByLabel(/Existing managed client/).selectOption({
    label: "Al Haya Brand · Al Haya Client · alhaya@suqpage.local",
  });
  await page.getByLabel("Client’s instruction").fill(
    "Please prepare a more expressive private showroom direction for administrator review.",
  );
  await page.getByRole("button", { name: "Record request for client" }).click();
  await expect(page.getByText("The request was recorded on behalf of the client.")).toBeVisible();
  await page.getByRole("button", { name: "Prepare first recipe" }).click();
  await expect(page.getByRole("heading", { name: "Showroom recipe studio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Administrative recovery editor" })).toBeVisible();
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
  await expect(page.getByRole("link", { name:"My products" })).toHaveCount(0);
  await page.goto("/dashboard/products");
  await expect(page).toHaveURL(/\/dashboard\/requests\/new/);
  await page.goto("/dashboard/design-bank");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Showroom component bank" })).toHaveCount(0);
  await page.getByRole("link", { name:"Make a request" }).click();
  await expect(page.getByRole("heading", { name:"Request your first showroom" })).toBeVisible();
  await expect(page.getByText("New showroom request",{exact:true})).toBeVisible();
  await expect(page.getByLabel("Request type")).toHaveCount(0);
  await page.getByLabel("Your request").fill("Please use this reference to update the private showroom hero and featured collection.");
  await page.getByLabel(/Reference images/).setInputFiles(path.join(process.cwd(), "public/uploads/seed/suqpage/icon.png"));
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
  await page.getByLabel(/Existing managed client/).selectOption({label:"Acceptance Market · Acceptance Client · acceptance-client@example.test"});
  await expect(page.getByText("New showroom request",{exact:true})).toBeVisible();
  await page.getByLabel("Client’s instruction").fill("The client asked us to prepare a revised private hero and featured collection for review.");
  await page.getByLabel(/Private reference images/).setInputFiles(path.join(process.cwd(),"public/uploads/seed/suqpage/icon.png"));
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
  await page.getByText("Show complete valid recipe example").click();
  const recipe=JSON.parse(await page.locator(".recipe-code").textContent()||"{}");
  recipe.summary="A revised hero prepared from the client’s private reference.";
  recipe.content.business.heroTitle="Acceptance approved showroom";
  await page.getByLabel("Showroom recipe JSON").fill(JSON.stringify(recipe));
  await page.getByRole("button",{name:"Validate and open private preview"}).click();
  await expect(page.getByRole("heading",{name:"Revision 1 private preview"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Validated recipe difference"})).toBeVisible();
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
  await page.goto("/dashboard/products?business=5");
  await expect(page.getByRole("heading",{name:"My products"})).toBeVisible();
  await page.getByRole("link",{name:"Add product"}).first().click();
  await page.getByLabel("Product name").fill("Team assisted product");
  await page.getByLabel("Description").fill("Created by assigned staff after the first showroom publication.");
  await page.getByLabel("Availability").selectOption("coming_soon");
  await page.getByLabel("Customer-service note").fill("The client asked the assigned team member to add this product.");
  await page.getByRole("button",{name:"Add and publish product"}).click();
  await expect(page.getByText(/Product published successfully as showroom version/)).toBeVisible();
  const teamProductUrl=page.url();
  await page.getByRole("button",{name:"Sign out"}).click();
  await loginWithKnownPassword(page,"operations@example.test","OperationsReady123!");
  await page.goto(teamProductUrl);
  await page.getByLabel("Availability").selectOption("available");
  await page.getByLabel("Customer-service note").fill("Operations confirmed availability with the client.");
  await page.getByRole("button",{name:"Save and publish product"}).click();
  await expect(page.getByText(/Product published successfully as showroom version/)).toBeVisible();
  expect(errors.filter((error)=>!error.includes("404"))).toEqual([]);
});

test("seeded client is restricted while operations manages customer activity", async ({ page }) => {
  const errors = monitor(page);
  await loginAndChangePassword(page, "alhaya@suqpage.local", "ClientAcceptance123!");
  await page.goto("/dashboard");
  await expect(page.getByText("Client workspace",{exact:true})).toBeVisible();
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/settings");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/catalog");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/products/new");
  await expect(page.getByRole("heading",{name:"Add a product"})).toBeVisible();
  await expect(page.getByLabel("Customer-service note")).toHaveCount(0);
  await expect(page.getByLabel("Option group name")).toHaveCount(0);
  await expect(page.getByRole("button",{name:/Delete/})).toHaveCount(0);
  await page.getByLabel("Product name").fill("Client browser product");
  await page.getByLabel("Description").fill("A client-managed product created in the simplified workflow.");
  await page.getByLabel("Availability").selectOption("limited");
  await page.getByLabel("Collection").selectOption({index:1});
  await page.getByLabel("Category").selectOption({index:1});
  await page.getByRole("button",{name:"Add and publish product"}).click();
  await expect(page.getByText(/Product published successfully as showroom version/)).toBeVisible();
  await page.goto("/dashboard/products");
  await expect(page.getByRole("heading",{name:"My products"})).toBeVisible();
  await page.getByLabel("Find a product").fill("Client browser");
  await expect(page.getByRole("heading",{name:"Client browser product"})).toBeVisible();
  await expect(page.getByText(/Showing 1 of/)).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
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
  const row = page.locator("section.panel").filter({ hasText: "Browser Tester" });
  await row.getByRole("combobox").selectOption("confirmed");
  await row.getByRole("button", { name: "Update" }).click();
  await expect(page.getByText("Inquiry status updated")).toBeVisible();
  await page.getByRole("link", { name: "Create delivery" }).first().click();
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
  expect(readAcceptanceRow("inquiryByCustomer", "Browser Tester")).toMatchObject({ status: "confirmed" });
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
  expect(installControlledVideoFixture()).toEqual({ handle: "alhayabrand", updated: true });
  const response = await request.get("/@alhayabrand");
  const csp = response.headers()["content-security-policy"];
  expect(csp).toContain("frame-src 'self' https://www.youtube-nocookie.com");
  expect(csp).not.toContain("https://www.youtube.com");
  await page.goto("/@alhayabrand");
  const frame = page.locator('iframe[title="Approved process film"]');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute("loading", "lazy");
  await expect(frame).toHaveAttribute("allow", /encrypted-media/);
  await expect(frame).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  expect(await page.locator('iframe[src*="youtube.com/embed"]').count()).toBe(0);
});
