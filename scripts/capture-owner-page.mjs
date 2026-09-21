import assert from "node:assert/strict";
import fs from "node:fs";
import pg from "pg";
import { chromium, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const base = new URL(process.env.SUQPAGE_TEST_BASE_URL || "http://127.0.0.1:3101");
const database = new URL(process.env.SUQPAGE_POSTGRES_URL || "");
const provider = new URL(process.env.SUQPAGE_SUPABASE_URL || "");
for (const [url, port] of [[database, "54322"], [provider, "54321"], [base, "3101"]]) {
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname) && url.port === port, "This capture uses only the isolated local Shop checkpoint.");
}
const output = "/tmp/suqpage-shop-review";
fs.mkdirSync(output, { recursive: true });
const pool = new pg.Pool({ connectionString: database.href });
const browser = await chromium.launch();
const errors = [];
const inquiryRequests = [];
let businessId;
let created = false;
const uploadedKeys = [];
try {
  const fixture = (await pool.query(`SELECT u.email,b.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    JOIN businesses b ON b.id=u.business_id LEFT JOIN owner_page_drafts d ON d.business_id=b.id
    WHERE p.access_role='client' AND d.business_id IS NULL AND b.status='active'
    AND b.handle IN ('alhaya','selam-weave','usashopet','novatech','homevibe','entoto-ceramics')
    AND ($1::text IS NULL OR b.handle=$1) ORDER BY u.id LIMIT 1`, [process.env.SUQPAGE_TEST_PROFILE_HANDLE || null])).rows[0];
  assert.ok(fixture, "An unchanged local demo owner without an existing Shop draft is required.");
  businessId = fixture.id;
  const before = (await pool.query("SELECT row_to_json(b) AS data FROM businesses b WHERE id=$1", [businessId])).rows[0].data;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    const expected = /Failed to load resource:.*status of (400|409)/.test(message.text()) && message.location().url.startsWith(`${base.origin}/api/page-drafts/`);
    if (message.type() === "error" && !expected) errors.push(message.text());
  });
  page.on("request", (request) => { if (new URL(request.url()).pathname === "/api/inquiries") inquiryRequests.push(request.method()); });
  if (process.env.SUQPAGE_TEST_SESSION_BOOTSTRAP === "1") {
    // Repeated UI captures use real local provider sessions without consuming OTP quotas.
    const admin = createClient(provider.origin, process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const link = await admin.auth.admin.generateLink({ type: "magiclink", email: fixture.email });
    assert.ok(!link.error && link.data.properties?.email_otp, "Local provider issues the fixture code");
    const cookieValues = [];
    const auth = createServerClient(provider.origin, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
      cookies: { getAll: () => [], setAll: (values) => cookieValues.push(...values) },
    });
    const verified = await auth.auth.verifyOtp({ email: fixture.email, token: link.data.properties.email_otp, type: "email" });
    assert.ok(!verified.error && verified.data.user, "Supabase verifies the local fixture identity");
    await context.addCookies(cookieValues.map(({ name, value }) => ({ name, value, url: base.origin, sameSite: "Lax" })));
  } else {
  await page.goto(`${base.origin}/login`);
  await page.getByLabel("Email", { exact: true }).fill(fixture.email);
  const otpResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/email/start"));
  await page.getByRole("button", { name: "Continue with email", exact: true }).click();
  assert.equal((await otpResponse).status(), 200, "Local email-code request succeeds");
  await page.getByLabel("Six-digit code").waitFor();
  let code;
  for (let attempt = 0; attempt < 30; attempt++) {
    const inbox = await (await fetch("http://127.0.0.1:54324/api/v1/messages")).json();
    const message = inbox.messages?.find((item) => item.To?.some((recipient) => recipient.Address === fixture.email));
    code = /\b(\d{6})\b/.exec(message?.Snippet || "")?.[1];
    if (code) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(code, "A local Supabase email code must arrive in Mailpit.");
  await page.getByLabel("Six-digit code").fill(code);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:[/?#]|$)/, { timeout: 20000 });
  }
  await page.goto(`${base.origin}/dashboard/page-editor`);
  const sourceImage = await context.request.get(new URL(before.hero_image_path, base).href);
  assert.ok(sourceImage.ok(), "Existing demo cover is available for a real upload");
  const coverFile = { name: "replacement-cover.webp", mimeType: sourceImage.headers()["content-type"].split(";")[0], buffer: await sourceImage.body() };
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await expect(page.getByRole("region", { name: "Business profile editor" })).toHaveAttribute("aria-busy", "false");
    const chooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Upload image", exact: true }).click();
    const chooser = await chooserPromise;
    assert.equal(chooser.isMultiple(), false);
    const uploadResponse = page.waitForResponse((response) => response.url().endsWith(`/api/page-drafts/${businessId}/media`) && response.request().method() === "POST");
    await chooser.setFiles(coverFile);
    const uploaded = await uploadResponse;
    assert.equal(uploaded.status(), 201, "Native picker sends the image to private storage");
    const { ref } = await uploaded.json();
    uploadedKeys.push(ref.split("/").at(-1));
    await expect(page.getByRole("button", { name: "Upload image", exact: true })).toBeEnabled();
    const privateImage = await context.request.get(new URL(ref, base).href);
    assert.equal(privateImage.status(), 200);
    assert.match(privateImage.headers()["cache-control"], /private.*no-store/);
    assert.equal((await fetch(new URL(ref, base))).status, 401, "Anonymous visitors cannot read a draft cover");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    created = true;
    await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Cover image", { exact: true }).locator('button[aria-pressed="true"] img')).toHaveAttribute("src", ref);
    await page.screenshot({ caret: "initial", path: `${output}/profile-upload-${width}.png`, fullPage: true });
  }
  // A spoofed image fails without losing the selected cover; reselecting the
  // same valid file in the second chooser above also exercises input reset.
  const invalidUpload = page.waitForResponse((response) => response.url().endsWith(`/api/page-drafts/${businessId}/media`));
  await page.getByLabel("Choose cover image file").setInputFiles({ name: "invalid.png", mimeType: "image/png", buffer: Buffer.from("not an image") });
  assert.equal((await invalidUpload).status(), 400);
  await expect(page.getByRole("region", { name: "Business profile editor" }).getByRole("alert")).toContainText("valid JPEG");
  await expect(page.getByLabel("Cover image", { exact: true }).locator('button[aria-pressed="true"] img')).toHaveAttribute("src", `/api/page-drafts/${businessId}/media/${uploadedKeys.at(-1)}`);
  await page.reload();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByLabel("About the business", { exact: true })).toBeEnabled();
  await page.getByLabel("About the business", { exact: true }).fill("Textiles for your home and wardrobe.");
  await expect(page.getByLabel("Introduction", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page.getByText("Public contact details", { exact: false }).click();
  await page.getByLabel("Public email", { exact: true }).fill("hello@example.com");
  await page.getByLabel("Public phone", { exact: true }).fill("+251911234567");
  await page.getByLabel("Website", { exact: true }).fill("https://example.com/");
  await page.getByLabel("Instagram username", { exact: true }).fill("@example_shop");

  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  created = true;
  await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();
  const publicCover = `${base.origin}/api/page-media/${businessId}/${uploadedKeys.at(-1)}`;
  const publicCoverPath = new URL(publicCover).pathname;
  const marketHtml = async () => (await context.request.get(`${base.origin}/?industry=all`)).text();
  assert.ok(!(await marketHtml()).includes(publicCoverPath), "Warm public cache excludes private cover");
  assert.equal((await fetch(publicCover)).status, 404, "Draft uploads do not expose public images");
  assert.equal((await fetch(`${base.origin}/api/page-drafts/${businessId}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: base.origin }, body: JSON.stringify({ action: "publish", version: 1, revision: 0 }) })).status, 401);
  const draftVersion = (await pool.query("SELECT version FROM owner_page_drafts WHERE business_id=$1", [businessId])).rows[0].version;
  const forged = await context.request.post(`${base.origin}/api/page-drafts/${businessId}`, { headers: { Origin: base.origin }, data: { action: "publish", version: draftVersion, revision: 0, content: { about: "Not saved" } } });
  assert.equal(forged.status(), 400, "Publish cannot inject a client snapshot");
  const publishButton = page.getByRole("button", { name: "Publish", exact: true });
  await publishButton.click();
  const confirmation = page.getByRole("dialog", { name: `Publish ${before.name}?`, exact: true });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.screenshot({ caret: "initial", path: `${output}/publish-confirmation-1440.png` });
  await page.keyboard.press("Escape");
  await expect(confirmation).not.toBeVisible();
  await expect(publishButton).toBeFocused();
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM owner_page_publications WHERE business_id=$1", [businessId])).rows[0].count, 0);
  await publishButton.click();
  await confirmation.getByRole("button", { name: "Publish page", exact: true }).click();
  await expect(page.getByLabel("Page publication").getByRole("status")).toHaveText("Profile published");
  await expect(publishButton).toBeDisabled();
  assert.equal((await fetch(publicCover)).status, 200, "Only the owner-published cover is publicly readable");
  assert.ok((await marketHtml()).includes(publicCoverPath), "Publish immediately refreshes the discovery cover cache");
  assert.equal((await fetch(`${base.origin}/api/page-media/${businessId}/${uploadedKeys[0]}`)).status, 404, "An older draft cover is not made public");
  const visitorContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const visitor = await visitorContext.newPage();
  visitor.on("pageerror", (error) => errors.push(error.message));
  visitor.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await visitor.goto(`${base.origin}/@${before.handle}`);
  await expect(visitor.locator("[data-business-profile]")).toBeVisible();
  const contactArea = visitor.getByRole("region", { name: "Connect with this business" });
  await expect(contactArea.getByRole("link", { name: "+251911234567", exact: true })).toHaveAttribute("href", "tel:+251911234567");
  await expect(contactArea.getByRole("link", { name: "hello@example.com", exact: true })).toHaveAttribute("href", "mailto:hello%40example.com");
  await expect(contactArea.getByRole("link", { name: "Website (new tab)", exact: true })).toHaveAttribute("href", "https://example.com/");
  await expect(contactArea.getByRole("link", { name: "Instagram (new tab)", exact: true })).toHaveAttribute("rel", "noopener noreferrer");

  await expect(visitor.getByRole("region", { name: "Business introduction" })).toContainText("Textiles for your home and wardrobe.");
  // Exercise a hydrated control before screenshot() temporarily changes DOM
  // cursor styles; visibility of the server-rendered input alone is not enough.
  await visitor.getByRole("link", { name: /^View / }).first().click();
  await visitor.getByRole("button", { name: "Inquire about this product only", exact: true }).click();
  await expect(visitor.getByRole("dialog", { name: "Product inquiry", exact: true })).toBeVisible();
  await visitor.keyboard.press("Escape");
  await visitor.getByRole("button", { name: "Add to inquiry list", exact: true }).click();
  await visitor.getByRole("link", { name: "Back to products", exact: true }).click();
  for (const width of [1440, 390, 320]) {
    await visitor.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await visitor.screenshot({ path: `${output}/published-profile-${width}.png`, caret: "initial" });
    assert.ok(await visitor.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px public profile overflow`);
  }
  await expect(visitor.locator(".floating-inquiry-trigger")).toHaveCount(0);
  await visitor.getByRole("region", { name: "Products", exact: true }).locator("article").last().scrollIntoViewIfNeeded();
  const publicCart = visitor.getByRole("button", { name: "Inquiry cart, 1 item", exact: true });
  await expect(publicCart).toBeInViewport();
  await publicCart.click();
  await expect(visitor.getByRole("dialog", { name: "Product inquiry", exact: true })).toBeVisible();
  await visitor.keyboard.press("Escape");
  await visitor.screenshot({ path: `${output}/published-profile-scrolled-320.png` });
  await page.getByLabel("About the business", { exact: true }).fill("Draft changes must remain private.");
  await expect(publishButton).toBeDisabled();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();
  await visitor.reload();
  await expect(visitor.getByRole("region", { name: "Business introduction" })).toContainText("Textiles for your home and wardrobe.");
  const stale = await context.request.post(`${base.origin}/api/page-drafts/${businessId}`, { headers: { Origin: base.origin }, data: { action: "publish", version: draftVersion, revision: 1 } });
  assert.equal(stale.status(), 409);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Restore previous", exact: true }).click();
  const restoreDialog = page.getByRole("dialog", { name: "Restore the previous page?", exact: true });
  await page.screenshot({ caret: "initial", path: `${output}/restore-confirmation-390.png` });
  await restoreDialog.getByRole("button", { name: "Restore previous", exact: true }).click();
  await expect(page.getByLabel("Page publication").getByRole("status")).toHaveText("Page live");
  assert.equal((await fetch(publicCover)).status, 404, "Restoring the original page revokes public draft-media access");
  assert.ok(!(await marketHtml()).includes(publicCoverPath), "Restore immediately removes the superseded discovery cover");
  await visitor.reload();
  await expect(visitor.locator("[data-business-profile]")).toHaveCount(1);
  await visitorContext.close();
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM owner_page_publications WHERE business_id=$1", [businessId])).rows[0].count, 2, "Restore appends history");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel("About the business", { exact: true }).fill("");
  await page.getByRole("textbox", { name: "Business video (optional)", exact: true }).fill("");
  await page.getByRole("button", { name: "No image", exact: true }).click();
  await expect(page.getByRole("button", { name: "No image", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Use shop image 1", exact: true }).click();
  await page.getByLabel("About the business", { exact: true }).fill("Visit our shop to explore the collection, or send us an inquiry about an item.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();

  const preview = page.getByLabel("Page preview");
  await expect(preview.getByRole("region", { name: "Connect with this business" }).getByRole("link")).toHaveCount(0);

  await preview.getByRole("searchbox", { name: "Search products" }).fill("zz-no-match-zz");
  await expect(preview.getByText("No matching products.")).toBeVisible();
  await preview.getByRole("button", { name: "Show all products" }).click();
  const firstProduct = preview.locator("article").first();
  const productName = await firstProduct.locator("h3").innerText();
  await firstProduct.getByRole("link", { name: `View ${productName}`, exact: true }).click();
  const detail = preview.locator("[data-product-page]");
  await expect(detail).toBeVisible();
  await detail.getByRole("button", { name: "Add to inquiry list", exact: true }).click();
  await preview.getByRole("button", { name: "Inquiry cart, 1 item", exact: true }).click();
  const cart = page.getByRole("dialog", { name: "Product inquiry" });
  await expect(cart).toContainText(productName);
  await expect(cart.getByRole("button", { name: "Send inquiry", exact: true })).toHaveCount(0);
  await expect(cart.getByRole("link")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(cart).not.toBeVisible();
  assert.equal(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("suqpage-cart:")).length), 0, "Profile preview does not persist carts");

  await preview.getByRole("link", { name: "Back to products", exact: true }).click();

  // Controlled iframe contract only; the third-party player response is stubbed.
  await page.route("https://www.youtube-nocookie.com/embed/**", (route) => route.fulfill({ body: '<html><body style="margin:0;display:grid;place-items:center;height:100vh;background:#202428;color:white;font:16px sans-serif">Video player · test fixture</body></html>', contentType: "text/html" }));
  await page.getByRole("textbox", { name: "Business video (optional)", exact: true }).fill("https://youtu.be/abcdefghijk");
  await preview.getByRole("button", { name: /^Play business video/ }).click();
  await expect(preview.locator("iframe")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1");
  await page.getByRole("textbox", { name: "Business video (optional)", exact: true }).fill("https://untrusted.example/video");
  await expect(page.getByRole("button", { name: "Save draft", exact: true })).toBeDisabled();
  await expect(preview.getByRole("button", { name: "Inquiry cart, 1 item", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Business video (optional)", exact: true }).fill("");
  await expect(page.getByRole("button", { name: "Save draft", exact: true })).toBeDisabled();
  await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();
  await expect(page.getByLabel("Page preview")).not.toContainText("Understand the requirement");
  await expect(page.getByLabel("Page preview")).not.toContainText("temporarily unavailable");
  await page.reload();
  await expect(page.getByLabel("About the business", { exact: true })).toHaveValue("Visit our shop to explore the collection, or send us an inquiry about an item.");

  // Changing permission must not discard unsaved text or allow a stale write.
  await page.getByLabel("About the business", { exact: true }).fill("A fresh collection for your home.");
  await page.getByLabel("Allow team editing").click();
  await expect(page.getByLabel("Allow team editing")).toBeChecked();
  await expect(page.getByRole("button", { name: "Save draft", exact: true })).toBeEnabled();
  await expect(page.getByLabel("About the business", { exact: true })).toHaveValue("A fresh collection for your home.");
  await page.getByLabel("Allow team editing").click();
  await expect(page.getByLabel("Allow team editing")).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Save draft", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();

  // A simulated stale response must retain the form and the last usable preview.
  await page.route(`**/api/page-drafts/${businessId}`, (route) => route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: "Reload the latest saved page before continuing." }) }), { times: 1 });
  await page.getByLabel("About the business", { exact: true }).fill("A fresh collection for your home, available by inquiry.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("region", { name: "Business profile editor" }).getByRole("alert")).toContainText("Reload the latest saved page");
  await expect(page.getByLabel("About the business", { exact: true })).toHaveValue("A fresh collection for your home, available by inquiry.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();

  const savedAbout = await page.getByLabel("About the business", { exact: true }).inputValue();
  const longAbout = "Explore the collection and contact our shop about any item. ".repeat(60).slice(0, 3000);
  await page.getByLabel("About the business", { exact: true }).fill(longAbout);
  await page.getByRole("textbox", { name: "Business video (optional)", exact: true }).fill("https://youtu.be/abcdefghijk");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    const profile = preview.locator("[data-business-profile]");
    const measure = () => profile.getByRole("region", { name: "Products", exact: true }).evaluate((element) => element.offsetTop);
    const beforeVideo = await measure();
    await expect(profile.locator("iframe")).toHaveCount(0);
    await page.screenshot({ path: `${output}/profile-poster-${width}.png`, caret: "initial" });
    await profile.getByRole("button", { name: /^Play business video/ }).click();
    await expect(profile.locator("iframe")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1");
    assert.equal(await measure(), beforeVideo, "Video uses the same cover space");
    await page.screenshot({ path: `${output}/profile-video-${width}.png`, caret: "initial" });
    await profile.getByRole("button", { name: "Read more", exact: true }).click();
    const description = profile.locator('p[tabindex="0"]');
    await expect(description).toHaveText(longAbout.trim());
    await description.focus();
    await page.keyboard.press("End");
    await expect.poll(() => description.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await profile.getByRole("button", { name: "Read less", exact: true }).click();
    assert.equal(await measure(), beforeVideo, "Collapsing restores the compact profile");
    assert.ok(await profile.evaluate((element) => {
          const products = element.querySelector(':scope > [aria-label="Products"]');
          const contacts = element.querySelector(':scope > [aria-label="Connect with this business"]');
          return Boolean(contacts) && products?.nextElementSibling === contacts && element.lastElementChild === contacts;
        }), "Contact section always follows products");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px overflow`);
    // Changing the video URL deliberately resets only the media player.
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByRole("textbox", { name: "Business video (optional)", exact: true }).fill("");
    await expect(preview.locator("iframe")).toHaveCount(0);
    await page.getByRole("textbox", { name: "Business video (optional)", exact: true }).fill("https://youtu.be/abcdefghijk");
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "No image", exact: true }).click();
  await preview.getByRole("button", { name: /^Play business video/ }).click();
  await expect(preview.locator("iframe")).toBeVisible();
  await page.getByRole("textbox", { name: "Business video (optional)", exact: true }).fill("");
  await expect(preview.locator("iframe")).toHaveCount(0);
  await expect(preview.getByRole("button", { name: /^Play business video/ })).toHaveCount(0);
  await page.getByLabel("About the business", { exact: true }).fill("");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("About the business", { exact: true })).toHaveValue("");
  await page.getByLabel("About the business", { exact: true }).fill(savedAbout);
  await page.getByRole("button", { name: "Use shop image 1", exact: true }).click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Private draft saved" })).toBeVisible();
  assert.deepEqual(inquiryRequests, [], "Preview never sends an inquiry request");
  assert.deepEqual(errors, []);
  assert.deepEqual((await pool.query("SELECT row_to_json(b) AS data FROM businesses b WHERE id=$1", [businessId])).rows[0].data, before);
  console.log(`PASS: ${process.env.SUQPAGE_TEST_SESSION_BOOTSTRAP === "1" ? "provider-issued local test session (email-entry UI not exercised)" : "managed local email-code login"}, private upload/save/reload, owner publication/restore, anonymous image scope, draft isolation, unchanged catalog, desktop/390/320 public and preview states. Screenshots: /tmp/suqpage-shop-review`);
} finally {
  await browser.close();
  if (created && businessId) {
    // This demo had no draft/publication before the test. Remove only its test
    // draft and cascading publication history before cleaning its private bytes.
    await pool.query("DELETE FROM owner_page_drafts WHERE business_id=$1", [businessId]);
  }
  if (uploadedKeys.length) {
    const storage = createClient(provider.origin, process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const cleanup = await storage.storage.from(process.env.SUQPAGE_SUPABASE_STORAGE_BUCKET || "mirtpage-media").remove(uploadedKeys.map((key) => `pages/${key}`));
    assert.ok(!cleanup.error, "Only the test-created private images are cleaned up");
  }
  await pool.end();
}
