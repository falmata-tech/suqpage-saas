import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const databasePath = path.resolve(process.env.MIRTPAGE_DB_PATH || "data/mirtpage.db");
const output = path.resolve(process.env.MIRTPAGE_DEMO_VIDEO_OUTPUT || "artifacts/demo-videos");
const recordingDirectory = path.join(output, "recordings");
const viewport = { width: 1280, height: 720 };

fs.mkdirSync(recordingDirectory, { recursive: true });

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function titleCard(page, title, subtitle, duration = 3200) {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;width:100vw;height:100vh;display:grid;place-items:center;background:#201c25;color:#fff;font-family:Arial,Helvetica,sans-serif}
    main{width:min(980px,calc(100% - 96px));border-top:7px solid #7d5cff;padding:42px 0 0}span{display:block;color:#54d2b0;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:0}h1{max-width:900px;margin:16px 0 20px;font-size:70px;line-height:1;letter-spacing:0}p{max-width:760px;margin:0;color:#d6d1da;font-size:25px;line-height:1.45}
  </style></head><body><main><span>MirtPage</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></main></body></html>`);
  await sleep(duration);
}

async function openPage(page, pathname, pause = 2400) {
  await page.goto(`${baseURL}${pathname}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await sleep(pause);
}

async function focus(page, locator, pause = 2600) {
  if (!(await locator.count())) return false;
  const target = locator.first();
  await target.evaluate((element) => element.scrollIntoView({ behavior: "smooth", block: "center" }));
  await sleep(950);
  await target.hover().catch(() => undefined);
  await sleep(pause);
  return true;
}

async function clickAndSettle(locator, pause = 2400) {
  if (!(await locator.count())) return false;
  await locator.first().click();
  await sleep(pause);
  return true;
}

function createAdminSession() {
  const database = new DatabaseSync(databasePath);
  const admin = database.prepare(`
    SELECT u.id,u.must_change_password FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id
    WHERE p.access_role='platform_admin'
    ORDER BY u.id LIMIT 1
  `).get();
  assert.ok(admin, "a local platform administrator is required for the full walkthrough");
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = Date.now();
  database.prepare("UPDATE users SET must_change_password=0 WHERE id=?").run(admin.id);
  database.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?)")
    .run(tokenHash, admin.id, now + 30 * 60 * 1000, now, now);
  return {
    token,
    close() {
      database.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash);
      database.prepare("UPDATE users SET must_change_password=? WHERE id=?").run(admin.must_change_password, admin.id);
      database.close();
    },
  };
}

async function createRecordingContext(browser, name, token = "") {
  const directory = path.join(recordingDirectory, name);
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, recordVideo: { dir: directory, size: viewport } });
  if (token) {
    await context.addCookies([{ name: "mirtpage_session", value: token, url: baseURL, httpOnly: true, sameSite: "Lax" }]);
  }
  const page = await context.newPage();
  page.on("dialog", (dialog) => dialog.dismiss().catch(() => undefined));
  return { context, page };
}

async function finishRecording(context, page, destination) {
  const video = page.video();
  assert.ok(video, "Playwright video recording is available");
  await context.close();
  const source = await video.path();
  fs.copyFileSync(source, destination);
}

async function publicMarketplaceTour(page) {
  await titleCard(
    page,
    "Made in Ethiopia, easier to discover",
    "A concise tour of MirtPage's marketplace, permanent showrooms, and direct inquiry flow.",
  );
  await openPage(page, "/", 3400);
  await focus(page, page.locator("#discover"), 3000);

  await clickAndSettle(page.locator(".discovery-industries a").nth(2), 2600);
  const search = page.getByPlaceholder("Business, product, capability, or place");
  await search.fill("pasta");
  await sleep(2800);
  await search.fill("");
  await sleep(1900);

  await focus(page, page.locator(".discovery-sponsored"), 2800);
  await focus(page, page.locator("#daily-expo-title"), 3600);
  const booth = page.locator(".expo-booth:not(.expo-booth-outline)").first();
  if (await clickAndSettle(booth, 2500)) {
    await clickAndSettle(page.getByRole("button", { name: "Close showroom preview" }), 700);
  }

  await openPage(page, "/@nova-assembly?ref=demo", 3600);
  await focus(page, page.locator('[data-slot="catalog"]'), 2800);
  if (await clickAndSettle(page.locator('[data-slot="catalog"] button[aria-label^="View "]'), 2100)) {
    await clickAndSettle(page.getByRole("button", { name: "Add selected item" }), 900);
    await clickAndSettle(page.getByRole("button", { name: "Close product" }), 700);
  }
  await focus(page, page.getByText("Inside the process", { exact: true }), 3000);
  await clickAndSettle(page.getByRole("button", { name: /Play .* process video/ }), 2800);
  await clickAndSettle(page.locator(".floating-inquiry-trigger"), 3600);
  await titleCard(page, "One clear place for products and production capability", "MirtPage connects discovery, trust, and direct business inquiry.", 3000);
}

async function fullPlatformTour(page) {
  await titleCard(
    page,
    "The MirtPage platform",
    "From public discovery to showroom operations, client review, and support.",
    3600,
  );
  await openPage(page, "/", 3000);
  await focus(page, page.locator("#discover"), 2600);

  const locationPicker = page.locator(".discovery-location-picker select");
  if (await locationPicker.count()) {
    await locationPicker.selectOption({ index: 1 });
    await sleep(2500);
    await clickAndSettle(page.locator(".discovery-city-gateway"), 3900);
    await clickAndSettle(page.getByRole("button", { name: "Close city marketplace" }), 1100);
  }

  await clickAndSettle(page.getByRole("tab", { name: "List" }), 2500);
  const search = page.getByPlaceholder("Business, product, capability, or place");
  await search.fill("solar");
  await sleep(3000);
  await search.fill("");
  await sleep(1800);
  await clickAndSettle(page.getByRole("tab", { name: "Map" }), 1400);
  await focus(page, page.locator(".discovery-sponsored"), 2400);
  await focus(page, page.locator("#daily-expo-title"), 3400);

  await openPage(page, "/@nova-assembly?ref=demo", 3300);
  await focus(page, page.locator('[data-slot="catalog"]'), 2600);
  if (await clickAndSettle(page.locator('[data-slot="catalog"] button[aria-label^="View "]'), 2200)) {
    await clickAndSettle(page.getByRole("button", { name: "Add selected item" }), 800);
    await clickAndSettle(page.getByRole("button", { name: "Close product" }), 600);
  }
  await focus(page, page.getByText("Inside the process", { exact: true }), 2900);
  await clickAndSettle(page.getByRole("button", { name: /Play .* process video/ }), 2300);
  await clickAndSettle(page.locator(".floating-inquiry-trigger"), 3100);
  await clickAndSettle(page.getByRole("button", { name: "Close inquiry" }), 800);

  await openPage(page, "/request", 3200);
  await focus(page, page.locator(".platform-form-panel"), 3000);

  await openPage(page, "/dashboard", 3400);
  await focus(page, page.locator(".attention-grid"), 2600);
  await openPage(page, "/dashboard/requests", 3000);
  await focus(page, page.locator(".data-table"), 2600);
  await openPage(page, "/dashboard/requests/65", 2800);
  await focus(page, page.getByRole("heading", { name: "Private revisions" }), 2500);
  await openPage(page, "/dashboard/requests/65/revisions/19/studio", 3000);
  await focus(page, page.getByRole("heading", { name: "Showroom design workspace" }), 2200);
  await focus(page, page.getByRole("heading", { name: "Complete the image checklist" }), 3300);
  await openPage(page, "/dashboard/support", 3000);
  await focus(page, page.locator(".support-list"), 3000);
  await titleCard(page, "A practical operating system for Made in Ethiopia", "Public discovery outside. Clear production, review, and support workflows inside.", 3600);
}

function makeNarration(name, text) {
  const audioPath = path.join(output, `${name}.aiff`);
  const result = spawnSync("/usr/bin/say", ["-r", "174", "-o", audioPath, text], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Narration generation failed: ${result.stderr || result.stdout}`);
  return audioPath;
}

function encodeVideo(name, sourceVideo, narrationPath) {
  const destination = path.join(output, `${name}.mp4`);
  const result = spawnSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", sourceVideo,
    "-i", narrationPath,
    "-filter_complex", "[1:a]apad,volume=1.05[a]",
    "-map", "0:v:0", "-map", "[a]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "25", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart",
    destination,
  ], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Video encoding failed: ${result.stderr || result.stdout}`);
  return destination;
}

const shortNarration = `Across Ethiopia, capable growers, makers, workshops, processors, and growing factories are producing goods that deserve to be easier to find. MirtPage brings them into one searchable marketplace. Visitors can move between industries, search as they type, discover businesses by location, and explore paid sponsored placements without losing the main map experience. The daily Expo creates another path into participating enterprises, while every business keeps a permanent digital showroom. Inside a showroom, products and manufacturing capabilities are presented with clear images, practical details, and a visible production process. A customer can build an inquiry, enter an optional quantity in the terms that make sense for the product, and send it directly to the business with a required phone number. MirtPage gives Ethiopian production one clear place to be understood, trusted, and contacted.`;

const longNarration = `MirtPage is a practical marketplace and operating platform for Made in Ethiopia. The public experience begins with the product, not a marketing explanation. Visitors can browse industries, search for a business, product, capability, or place, and move between map and list views. Location clusters protect smaller screens from clutter. As the map moves closer, a city marketplace brings nearby showrooms together on one smooth, expandable floor. Sponsored showrooms remain clearly identified, and the daily industry Expo gives visitors a fresh way to discover enterprises from across the country. Every business also receives a permanent showroom. Products and production capabilities can include images, price when appropriate, output or lead-time information, product video, and practical highlights. The Process section can present an approved video without placing it in the site header. Visitors build a single inquiry, use their own quantity language, and contact the business directly through MirtPage. Business signup is intentionally straightforward. A client shares its goals, audience, products, capabilities, and approved reference material, while the MirtPage team prepares the design for review. Inside the platform, administrators see new accounts, showroom requests, and support demand immediately. Large work queues use server pagination and focused search. Each request preserves the original client instruction, assignment, clarification history, and numbered private revisions. The design workspace provides the AI brief, design import, quality checks, and a labeled image checklist. Images can be uploaded directly into the required section and product spaces before client review. Published content remains separate until approval. The first-party support inbox keeps customer conversations, assignment limits, unread status, and resolution history inside MirtPage. Together, these workflows give Ethiopian enterprises a professional public front door and give the MirtPage team a clear system for operating it.`;

const browser = await chromium.launch({ headless: true });
const session = createAdminSession();
try {
  const short = await createRecordingContext(browser, "short");
  await publicMarketplaceTour(short.page);
  const shortWebm = path.join(output, "mirtpage-marketplace-short.webm");
  await finishRecording(short.context, short.page, shortWebm);

  const full = await createRecordingContext(browser, "full", session.token);
  await fullPlatformTour(full.page);
  const fullWebm = path.join(output, "mirtpage-platform-walkthrough.webm");
  await finishRecording(full.context, full.page, fullWebm);

  const shortAudio = makeNarration("mirtpage-marketplace-short", shortNarration);
  const fullAudio = makeNarration("mirtpage-platform-walkthrough", longNarration);
  const shortMp4 = encodeVideo("mirtpage-marketplace-short", shortWebm, shortAudio);
  const fullMp4 = encodeVideo("mirtpage-platform-walkthrough", fullWebm, fullAudio);

  console.log(JSON.stringify({
    short: shortMp4,
    full: fullMp4,
    sourceRecordings: [shortWebm, fullWebm],
  }, null, 2));
} finally {
  session.close();
  await browser.close();
}
