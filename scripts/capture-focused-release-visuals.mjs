import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3100";
const output = process.env.MIRTPAGE_VISUAL_OUTPUT || "/tmp/mirtpage-focused-release";
const db = new DatabaseSync(path.resolve(process.env.MIRTPAGE_DB_PATH || "data/mirtpage.db"));
fs.mkdirSync(output, { recursive: true });

const admin = db.prepare(`
  SELECT u.id,u.must_change_password
  FROM users u JOIN user_access_profiles p ON p.user_id=u.id
  WHERE p.access_role='platform_admin' ORDER BY u.id LIMIT 1
`).get();
const workflow = db.prepare(`
  SELECT r.id request_id,cr.id revision_id,b.id business_id,b.handle
  FROM content_revisions cr
  JOIN service_requests r ON r.id=cr.request_id
  JOIN businesses b ON b.id=cr.business_id
  ORDER BY CASE cr.status WHEN 'draft' THEN 0 ELSE 1 END,cr.id DESC LIMIT 1
`).get();
const emptyBusiness = db.prepare(`
  SELECT b.id,b.name,
    EXISTS(SELECT 1 FROM published_catalog_versions v WHERE v.business_id=b.id) established
  FROM businesses b
  WHERE NOT EXISTS(SELECT 1 FROM service_requests r WHERE r.business_id=b.id)
  ORDER BY CASE WHEN lower(b.name) LIKE '%abay%' THEN 0 ELSE 1 END,b.id
  LIMIT 1
`).get();
assert.ok(admin && workflow && emptyBusiness, "focused visuals require seeded administrator, revision, and empty business data");
const admittedAttachmentIds = [];
let createdWorkflowRequestId = null;
const inlineYoutubeProvider = "jNQXAC9IVRw";
const inlineYoutubeExisted = Boolean(db.prepare("SELECT 1 FROM recipe_media_assets WHERE request_id=? AND provider_id=?").get(workflow.request_id, inlineYoutubeProvider));

const token = crypto.randomBytes(32).toString("base64url");
const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
const now = Date.now();
db.prepare("UPDATE users SET must_change_password=0 WHERE id=?").run(admin.id);
db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?)")
  .run(tokenHash, admin.id, now + 10 * 60 * 1000, now, now);

async function noOverflow(page, label) {
  const evidence = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    offenders: Array.from(document.querySelectorAll("body *")).flatMap((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.right <= window.innerWidth + 1 && rect.left >= -1) return [];
      return [{
        tag: element.tagName.toLowerCase(),
        className: element.className && typeof element.className === "string" ? element.className.slice(0, 120) : "",
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      }];
    }).slice(0, 8),
  }));
  assert.equal(
    evidence.scrollWidth <= evidence.clientWidth,
    true,
    `${label} has horizontal overflow: ${JSON.stringify(evidence)}`,
  );
}

async function waitForVisualAssets(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete));
}

async function openPage(browser, viewport, authenticated = false) {
  const context = await browser.newContext({ viewport });
  if (authenticated) {
    await context.addCookies([{
      name: "mirtpage_session",
      value: token,
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    }]);
  }
  return { context, page: await context.newPage() };
}

const browser = await chromium.launch({ headless: true });
try {
  for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["phone", { width: 390, height: 844 }]]) {
    const home = await openPage(browser, viewport);
    await home.page.goto(baseURL, { waitUntil: "networkidle" });
    await home.page.getByRole("heading", { name: "Find Ethiopian makers and producers." }).waitFor();
    await noOverflow(home.page, `${name} homepage`);
    await home.page.screenshot({ path: path.join(output, `homepage-${name}.png`) });
    await home.context.close();

    const showroom = await openPage(browser, viewport);
    await showroom.page.goto(`${baseURL}/@${workflow.handle}`, { waitUntil: "domcontentloaded" });
    await showroom.page.locator('[data-bank-release="showroom-bank@1.2.0"]').waitFor();
    await waitForVisualAssets(showroom.page);
    assert.equal(await showroom.page.locator("[data-slot]").count(), 6, `${name} showroom uses six sections`);
    assert.equal(await showroom.page.locator('[data-slot="content"]').count(), 1, `${name} showroom uses one combined chapter`);
    await noOverflow(showroom.page, `${name} showroom`);
    await showroom.page.locator('[data-slot="content"]').screenshot({ path: path.join(output, `showroom-chapter-${name}.png`) });
    await showroom.page.screenshot({ path: path.join(output, `showroom-${name}.png`), fullPage: true });
    await showroom.context.close();
  }

  const workflowDesktop = await openPage(browser, { width: 1440, height: 1000 }, true);
  await workflowDesktop.page.goto(`${baseURL}/dashboard/requests/${workflow.request_id}`, { waitUntil: "networkidle" });
  await workflowDesktop.page.locator(".client-workflow-nav").waitFor();
  await workflowDesktop.page.locator(".workspace-nav-label").filter({ hasText: /^Business workspace$/ }).waitFor();
  await workflowDesktop.page.getByRole("link", { name: "Edit current showroom", exact: true }).waitFor();
  await workflowDesktop.page.getByRole("link", { name: "AI-assisted redesign", exact: true }).waitFor();
  await noOverflow(workflowDesktop.page, "desktop client workflow");
  await workflowDesktop.page.screenshot({ path: path.join(output, "client-workflow-desktop.png"), fullPage: true });
  await workflowDesktop.context.close();

  const editor = await openPage(browser, { width: 1440, height: 1000 }, true);
  await editor.page.goto(`${baseURL}/dashboard/requests/${workflow.request_id}/revisions/${workflow.revision_id}/edit`, { waitUntil: "networkidle" });
  await editor.page.getByRole("heading", { name: "Edit current showroom" }).waitFor();
  assert.equal(await editor.page.getByLabel("Business name", { exact: true }).count(), 0);
  assert.equal(await editor.page.getByLabel("Logo image", { exact: true }).count(), 0);
  assert.equal(await editor.page.getByLabel("Browser icon", { exact: true }).count(), 0);
  await editor.page.getByRole("button", { name: "Page content" }).click();
  const contentPanel = editor.page.locator("section.panel").filter({ has: editor.page.getByRole("heading", { name: "Page content", exact: true }) });
  const heroDisclosure = contentPanel.getByText("hero", { exact: true }).locator("xpath=ancestor::details[1]");
  const heroMedia = heroDisclosure.locator(".editor-media-field").first();
  await heroMedia.locator('input[type="file"]').setInputFiles(path.resolve("public/landing/mirtpage-marketplace-hero-v6.webp"));
  await editor.page.waitForFunction(() => {
    const hero = Array.from(document.querySelectorAll("details")).find((entry) => entry.querySelector("summary small")?.textContent?.trim() === "hero");
    const field = hero?.querySelector(".editor-media-field");
    return field?.querySelector("select")?.value.startsWith("request-attachment:") || field?.querySelector('[role="alert"]')?.textContent;
  });
  const heroAdmissionError = await heroMedia.locator('[role="alert"]').textContent().catch(() => "");
  assert.equal(await heroMedia.locator('[role="alert"]').count(), 0, `hero image admission must not show an error: ${heroAdmissionError || "unknown"}`);
  const admittedImageRef = await heroMedia.locator("select").inputValue();
  admittedAttachmentIds.push(Number(admittedImageRef.split(":")[1]));
  const previewProof = `Unsaved preview ${Date.now()}`;
  await contentPanel.getByLabel(/heading$/).first().fill(previewProof);
  const processMedia = contentPanel.locator(".editor-media-field").filter({ hasText: "Process video" });
  const processDisclosure = processMedia.locator("xpath=ancestor::details[1]");
  const processDisclosureOpen = await processDisclosure.evaluate((element) => element.open);
  if (!processDisclosureOpen) await processDisclosure.locator("summary").click();
  await processMedia.getByLabel("Process video YouTube URL").fill(`https://www.youtube.com/watch?v=${inlineYoutubeProvider}`);
  await processMedia.getByRole("button", { name: "Add YouTube video" }).click();
  await editor.page.waitForFunction((provider) => {
    const field = Array.from(document.querySelectorAll(".editor-media-field")).find((entry) => entry.querySelector(":scope > label")?.textContent?.trim() === "Process video");
    return field?.querySelector("select")?.value === `youtube:${provider}`;
  }, inlineYoutubeProvider);
  assert.equal(await processMedia.locator('[role="alert"]').count(), 0, "process video admission must not show an error");
  await processMedia.screenshot({ path: path.join(output, "revision-editor-inline-media.png") });
  await editor.page.getByRole("button", { name: "Offerings", exact: true }).click();
  const offeringsPanel = editor.page.locator("section.panel").filter({ has: editor.page.getByRole("heading", { name: "Products & capabilities", exact: true }) });
  const productVideo = offeringsPanel.getByLabel("Product 1 video", { exact: true }).locator("..");
  await productVideo.getByLabel("Product 1 video YouTube URL").fill(`https://youtu.be/${inlineYoutubeProvider}`);
  await productVideo.getByRole("button", { name: "Add YouTube video" }).click();
  await editor.page.waitForFunction((provider) => {
    const field = Array.from(document.querySelectorAll(".editor-media-field")).find((entry) => entry.querySelector(":scope > label")?.textContent?.trim() === "Product 1 video");
    return field?.querySelector("select")?.value === `youtube:${provider}`;
  }, inlineYoutubeProvider);
  assert.equal(await productVideo.locator('[role="alert"]').count(), 0, "product video admission must not show an error");
  await productVideo.screenshot({ path: path.join(output, "revision-editor-product-video.png") });
  const livePreview = editor.page.locator("#revision-live-preview");
  await livePreview.getByText(previewProof, { exact: true }).waitFor();
  assert.match(await editor.page.locator('input[name="snapshot"]').inputValue(), new RegExp(`request-attachment:${admittedAttachmentIds[0]}`));
  await livePreview.getByRole("button", { name: "Phone" }).click();
  assert.equal(
    await livePreview.locator('[data-slot="hero"] img').first().evaluate((image) => image.complete && image.naturalWidth > 0),
    true,
    "uploaded hero media renders in the unsaved showroom preview",
  );
  await noOverflow(editor.page, "desktop revision editor with phone preview");
  await livePreview.screenshot({ path: path.join(output, "revision-editor-live-preview.png") });
  await editor.page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(editor.page, "phone revision editor media controls");
  await productVideo.screenshot({ path: path.join(output, "revision-editor-product-video-phone.png") });
  await editor.context.close();

  const workflowPhone = await openPage(browser, { width: 390, height: 844 }, true);
  await workflowPhone.page.goto(`${baseURL}/dashboard/requests/${workflow.request_id}`, { waitUntil: "networkidle" });
  await workflowPhone.page.locator(".client-workflow-nav").waitFor();
  await noOverflow(workflowPhone.page, "phone client workflow");
  await workflowPhone.page.screenshot({ path: path.join(output, "client-workflow-phone.png") });
  await workflowPhone.page.getByRole("button", { name: "Open all workspace navigation" }).click();
  const workflowMenu = workflowPhone.page.getByRole("dialog", { name: "Workspace menu" });
  await workflowMenu.waitFor();
  await workflowMenu.getByText("Leave business workspace", { exact: true }).waitFor();
  await workflowMenu.getByRole("link", { name: "Showroom project", exact: true }).waitFor();
  assert.equal(await workflowMenu.getByText("Showroom work", { exact: true }).count(), 0);
  await noOverflow(workflowPhone.page, "phone client workflow menu");
  await workflowPhone.page.screenshot({ path: path.join(output, "client-workflow-menu-phone.png") });
  await workflowPhone.context.close();

  const profile = await openPage(browser, { width: 1440, height: 1000 }, true);
  await profile.page.goto(`${baseURL}/dashboard/admin/discovery/${workflow.business_id}`, { waitUntil: "networkidle" });
  await profile.page.getByLabel("Marketplace booth image").waitFor();
  await profile.page.locator(".workspace-nav-label").filter({ hasText: /^Business workspace$/ }).waitFor();
  await noOverflow(profile.page, "desktop marketplace profile");
  await profile.page.screenshot({ path: path.join(output, "marketplace-profile-desktop.png"), fullPage: true });
  await profile.context.close();

  const adminOverview = await openPage(browser, { width: 1440, height: 1000 }, true);
  await adminOverview.page.goto(`${baseURL}/dashboard/admin`, { waitUntil: "networkidle" });
  await adminOverview.page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ }).waitFor();
  assert.equal(await adminOverview.page.getByRole("link", { name: "Clients", exact: true }).count(), 0);
  assert.equal(await adminOverview.page.getByRole("link", { name: "Discovery profiles", exact: true }).count(), 0);
  await noOverflow(adminOverview.page, "desktop administrator overview");
  await adminOverview.page.screenshot({ path: path.join(output, "admin-overview-desktop.png"), fullPage: true });
  await adminOverview.context.close();

  const directory = await openPage(browser, { width: 390, height: 844 }, true);
  await directory.page.goto(`${baseURL}/dashboard/admin/businesses`, { waitUntil: "networkidle" });
  await directory.page.getByRole("heading", { name: "Businesses" }).waitFor();
  await noOverflow(directory.page, "phone business directory");
  await directory.page.screenshot({ path: path.join(output, "business-directory-phone.png"), fullPage: true });
  await directory.page.getByRole("button", { name: "Open all workspace navigation" }).click();
  const directoryMenu = directory.page.getByRole("dialog", { name: "Workspace menu" });
  await directoryMenu.getByRole("link", { name: "Businesses", exact: true }).waitFor();
  assert.equal(await directoryMenu.getByRole("link", { name: "Clients", exact: true }).count(), 0);
  assert.equal(await directoryMenu.getByRole("link", { name: "Discovery profiles", exact: true }).count(), 0);
  await directory.page.screenshot({ path: path.join(output, "business-directory-menu-phone.png") });
  await directory.context.close();

  const access = await openPage(browser, { width: 1440, height: 1000 }, true);
  await access.page.goto(`${baseURL}/dashboard/admin/businesses/${workflow.business_id}/access`, { waitUntil: "networkidle" });
  await access.page.getByRole("heading", { name: "Business details", exact: true }).waitFor();
  await access.page.getByRole("heading", { name: "Owner sign-in", exact: true }).waitFor();
  await access.page.getByLabel("Replace logo", { exact: true }).waitFor();
  await access.page.getByLabel("Replace browser icon", { exact: true }).waitFor();
  assert.equal(await access.page.getByLabel("Hero image", { exact: true }).count(), 0);
  assert.equal(await access.page.getByLabel("Process YouTube video", { exact: true }).count(), 0);
  assert.equal(await access.page.getByLabel("Tagline", { exact: true }).count(), 0);
  assert.match(access.page.url(), /\/dashboard\/settings\?business=/);
  await access.page.locator(".workspace-nav-label").filter({ hasText: /^Business workspace$/ }).waitFor();
  await noOverflow(access.page, "desktop business details");
  await access.page.screenshot({ path: path.join(output, "business-details-desktop.png"), fullPage: true });
  await access.context.close();

  const emptyRequests = await openPage(browser, { width: 390, height: 844 }, true);
  await emptyRequests.page.goto(`${baseURL}/dashboard/requests?business=${emptyBusiness.id}`, { waitUntil: "networkidle" });
  await emptyRequests.page.getByRole("heading", { name: "Showroom project", exact: true }).waitFor();
  const emptyProjectKind = emptyBusiness.established ? "update" : "setup";
  const emptyProjectAction = emptyBusiness.established ? "Update showroom" : "Create showroom";
  await emptyRequests.page.getByRole("heading", { name: `No active showroom ${emptyProjectKind}`, exact: true }).waitFor();
  await emptyRequests.page.getByRole("link", { name: emptyProjectAction, exact: true }).first().waitFor();
  assert.equal(await emptyRequests.page.getByText("Showroom work", { exact: true }).count(), 0);
  await noOverflow(emptyRequests.page, "phone empty showroom project");
  await emptyRequests.page.screenshot({ path: path.join(output, "showroom-project-empty-phone.png"), fullPage: true });
  await emptyRequests.page.getByRole("link", { name: emptyProjectAction, exact: true }).first().click();
  await emptyRequests.page.getByRole("heading", { name: `${emptyBusiness.established ? "Update" : "Create"} showroom for ${emptyBusiness.name}`, exact: true }).waitFor();
  assert.equal(await emptyRequests.page.getByRole("heading", { name: "Who is this for?", exact: true }).count(), 0);
  assert.equal(await emptyRequests.page.locator(`input[name="businessId"][value="${emptyBusiness.id}"]`).count(), 1);
  if (emptyBusiness.established) {
    await emptyRequests.page.getByRole("heading", { name: "What should change?", exact: true }).waitFor();
    assert.equal(await emptyRequests.page.getByLabel("Business type", { exact: true }).count(), 0);
    assert.equal(await emptyRequests.page.getByLabel("Catalog stage", { exact: true }).count(), 0);
    assert.equal(await emptyRequests.page.getByLabel("Photography", { exact: true }).count(), 0);
    await emptyRequests.page.getByLabel("Requested changes", { exact: true }).waitFor();
  } else {
    await emptyRequests.page.getByLabel("Business type", { exact: true }).waitFor();
    await emptyRequests.page.getByLabel("Catalog stage", { exact: true }).waitFor();
    await emptyRequests.page.getByLabel("Photography", { exact: true }).waitFor();
  }
  await noOverflow(emptyRequests.page, "phone business-scoped showroom setup");
  await emptyRequests.page.screenshot({ path: path.join(output, `showroom-${emptyProjectKind}-form-phone.png`), fullPage: true });
  if (emptyBusiness.established) {
    await emptyRequests.page.getByLabel("Requested changes", { exact: true }).fill("Replace the hero image and refine the process copy while keeping the current showroom design.");
    await emptyRequests.page.getByRole("button", { name: "Start showroom update", exact: true }).click();
    await emptyRequests.page.getByRole("heading", { name: "Showroom update", exact: true }).waitFor();
    const requestMatch = new URL(emptyRequests.page.url()).pathname.match(/\/dashboard\/requests\/(\d+)$/);
    assert.ok(requestMatch, "the business-scoped update returns to its showroom project");
    createdWorkflowRequestId = Number(requestMatch[1]);
    await emptyRequests.page.getByRole("button", { name: "Start editing", exact: true }).waitFor();
    await emptyRequests.page.getByRole("button", { name: "Open AI design", exact: true }).waitFor();
    await noOverflow(emptyRequests.page, "phone showroom update authoring choices");
    await emptyRequests.page.screenshot({ path: path.join(output, "showroom-update-tools-phone.png"), fullPage: true });
    await emptyRequests.page.getByRole("button", { name: "Start editing", exact: true }).click();
    await emptyRequests.page.getByRole("heading", { name: "Edit current showroom", exact: true }).waitFor();
    const directMatch = new URL(emptyRequests.page.url()).pathname.match(/\/revisions\/(\d+)\/edit$/);
    assert.ok(directMatch, "the direct update opens a private revision editor");
    await emptyRequests.page.goto(`${baseURL}/dashboard/requests/${createdWorkflowRequestId}`, { waitUntil: "networkidle" });
    await emptyRequests.page.getByRole("link", { name: "AI-assisted redesign", exact: true }).click();
    await emptyRequests.page.getByRole("heading", { name: "Showroom design workspace", exact: true }).waitFor();
    const studioMatch = new URL(emptyRequests.page.url()).pathname.match(/\/revisions\/(\d+)\/studio$/);
    assert.equal(studioMatch?.[1], directMatch[1], "direct editing and AI redesign resume the same private revision");
  }
  await emptyRequests.context.close();

  const visits = await openPage(browser, { width: 390, height: 844 }, true);
  await visits.page.goto(`${baseURL}/dashboard/insights?business=${workflow.business_id}`, { waitUntil: "networkidle" });
  await visits.page.getByRole("heading", { name: "Showroom visits" }).waitFor();
  await noOverflow(visits.page, "phone showroom visits");
  await visits.page.screenshot({ path: path.join(output, "showroom-visits-phone.png"), fullPage: true });
  await visits.context.close();

  console.log(`Focused release visuals passed: ${output}`);
} finally {
  await browser.close();
  db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash);
  db.prepare("UPDATE users SET must_change_password=? WHERE id=?").run(admin.must_change_password, admin.id);
  for (const attachmentId of admittedAttachmentIds) {
    const attachment = db.prepare("SELECT storage_key FROM request_attachments WHERE id=?").get(attachmentId);
    db.prepare("DELETE FROM request_attachments WHERE id=?").run(attachmentId);
    if (attachment?.storage_key) fs.rmSync(path.resolve(process.env.MIRTPAGE_MEDIA_ROOT || "data/media", "requests", attachment.storage_key), { force: true });
  }
  if (!inlineYoutubeExisted) db.prepare("DELETE FROM recipe_media_assets WHERE request_id=? AND provider_id=?").run(workflow.request_id, inlineYoutubeProvider);
  if (createdWorkflowRequestId) db.prepare("DELETE FROM service_requests WHERE id=?").run(createdWorkflowRequestId);
  db.close();
}
