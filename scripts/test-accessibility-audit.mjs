import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const baseURL = process.env.MIRTPAGE_TEST_BASE_URL || "http://127.0.0.1:3000";
const databasePath = path.resolve(process.env.MIRTPAGE_DB_PATH || "data/mirtpage.db");
const outputPath = path.resolve(process.env.MIRTPAGE_ACCESSIBILITY_OUTPUT || "/tmp/mirtpage-accessibility-audit.json");
const db = new DatabaseSync(databasePath);

const first = (sql, ...params) => db.prepare(sql).get(...params);
const roleUser = (role) => first(`
  SELECT u.id,u.must_change_password
  FROM users u JOIN user_access_profiles p ON p.user_id=u.id
  WHERE p.access_role=? ORDER BY u.id LIMIT 1
`, role);
const admin = roleUser("platform_admin");
const manager = roleUser("operations_manager");
const client = first(`
  SELECT u.id,u.must_change_password,u.business_id
  FROM users u
  JOIN user_access_profiles p ON p.user_id=u.id AND p.access_role='client'
  WHERE u.business_id IS NOT NULL
    AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=u.business_id)
  ORDER BY u.id LIMIT 1
`);
const business = first("SELECT id,handle FROM businesses WHERE status='active' ORDER BY id LIMIT 1");
const product = client ? first("SELECT id FROM products WHERE business_id=? ORDER BY id LIMIT 1", client.business_id) : null;
const request = first("SELECT r.id FROM service_requests r WHERE EXISTS(SELECT 1 FROM content_revisions revision WHERE revision.request_id=r.id) ORDER BY r.id LIMIT 1");
const revision = request ? first("SELECT id FROM content_revisions WHERE request_id=? ORDER BY id LIMIT 1", request.id) : null;
const support = first("SELECT id FROM support_conversations ORDER BY id LIMIT 1");

assert.ok(admin && manager && client && business && product && request && revision && support, "accessibility audit requires complete canonical fixtures");

const actors = new Map([
  ["admin", admin],
  ["manager", manager],
  ["client", client],
]);
const sessions = new Map();
const now = Date.now();
for (const [role, actor] of actors) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  db.prepare("UPDATE users SET must_change_password=0 WHERE id=?").run(actor.id);
  db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?)")
    .run(tokenHash, actor.id, now + 30 * 60 * 1000, now, now);
  sessions.set(role, { token, tokenHash, actor });
}

const allCases = [
  { role: "public", path: "/" },
  { role: "public", path: "/discover" },
  { role: "public", path: "/about" },
  { role: "public", path: "/login" },
  { role: "public", path: "/request" },
  { role: "public", path: "/privacy" },
  { role: "public", path: "/terms" },
  { role: "public", path: "/offline" },
  { role: "public", path: `/@${business.handle}` },
  { role: "admin", path: "/dashboard/admin" },
  { role: "admin", path: "/dashboard/admin/businesses" },
  { role: "admin", path: `/dashboard/admin/businesses/${business.id}/access` },
  { role: "admin", path: "/dashboard/admin/discovery" },
  { role: "admin", path: `/dashboard/admin/discovery/${business.id}` },
  { role: "admin", path: "/dashboard/admin/featured-schedule" },
  { role: "admin", path: "/dashboard/admin/staff" },
  { role: "admin", path: "/dashboard/requests" },
  { role: "admin", path: `/dashboard/requests/${request.id}` },
  { role: "admin", path: `/dashboard/requests/${request.id}/revisions/${revision.id}/edit` },
  { role: "admin", path: `/dashboard/requests/${request.id}/revisions/${revision.id}/preview` },
  { role: "admin", path: `/dashboard/requests/${request.id}/revisions/${revision.id}/studio` },
  { role: "admin", path: "/dashboard/support" },
  { role: "admin", path: `/dashboard/support/${support.id}` },
  { role: "admin", path: "/dashboard/support/agents" },
  { role: "admin", path: "/dashboard/account-health" },
  { role: "admin", path: "/dashboard/design-bank" },
  { role: "admin", path: "/dashboard/design-sdk" },
  { role: "manager", path: "/dashboard/requests" },
  { role: "manager", path: "/dashboard/requests/on-behalf" },
  { role: "manager", path: "/dashboard/support" },
  { role: "client", path: "/dashboard" },
  { role: "client", path: "/dashboard/catalog" },
  { role: "client", path: "/dashboard/products" },
  { role: "client", path: `/dashboard/products/${product.id}` },
  { role: "client", path: "/dashboard/products/new" },
  { role: "client", path: "/dashboard/inquiries" },
  { role: "client", path: "/dashboard/insights" },
  { role: "client", path: "/dashboard/settings" },
  { role: "client", path: "/dashboard/account" },
  { role: "client", path: "/dashboard/requests" },
  { role: "public", path: "/", state: "discovery-filters", viewports: ["phone"] },
  { role: "public", path: "/featured", state: "showroom-preview", viewports: ["phone"] },
  { role: "public", path: `/@${business.handle}`, state: "product-dialog" },
  { role: "public", path: `/@${business.handle}`, state: "inquiry-drawer" },
  { role: "admin", path: "/dashboard/admin", state: "workspace-menu", viewports: ["phone"] },
  { role: "client", path: "/dashboard", state: "workspace-menu", viewports: ["phone"] },
];
const cases = process.env.MIRTPAGE_ACCESSIBILITY_CASE
  ? allCases.filter((auditCase) => `${auditCase.role}:${auditCase.path}:${auditCase.state || "default"}`.includes(process.env.MIRTPAGE_ACCESSIBILITY_CASE))
  : allCases;
const allViewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "phone", width: 390, height: 844 },
];
const viewports = process.env.MIRTPAGE_ACCESSIBILITY_VIEWPORT
  ? allViewports.filter((viewport) => viewport.name === process.env.MIRTPAGE_ACCESSIBILITY_VIEWPORT)
  : allViewports;
assert.ok(cases.length && viewports.length, "accessibility audit filters must match at least one route and viewport");

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.MIRTPAGE_PLAYWRIGHT_EXECUTABLE_PATH || undefined,
});
const results = [];

try {
  for (const viewport of viewports) {
    for (const auditCase of cases) {
      if (auditCase.viewports && !auditCase.viewports.includes(viewport.name)) continue;
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
        colorScheme: "light",
      });
      const session = sessions.get(auditCase.role);
      if (session) {
        await context.addCookies([{ name: "mirtpage_session", value: session.token, url: baseURL, httpOnly: true, sameSite: "Lax" }]);
      }
      const page = await context.newPage();
      const browserErrors = [];
      page.on("pageerror", (error) => browserErrors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
      let responseStatus = 0;
      let loadError = "";
      try {
        const response = await page.goto(`${baseURL}${auditCase.path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
        responseStatus = response?.status() || 0;
        await page.locator("body").waitFor();
        await page.waitForTimeout(250);
        if (auditCase.state === "discovery-filters") {
          await page.getByRole("button", { name: "Open industry and location filters" }).click();
          await page.getByRole("dialog", { name: "Filters" }).waitFor();
        } else if (auditCase.state === "showroom-preview") {
          const booth = page.locator(".featured-booth[data-business-id]").first();
          await booth.waitFor();
          await booth.evaluate((element) => element.click());
          await page.locator(".discovery-preview[role='dialog']").waitFor();
        } else if (auditCase.state === "product-dialog") {
          await page.getByRole("button", { name: /^View / }).first().click();
          await page.locator(".product-dialog[role='dialog']").waitFor();
        } else if (auditCase.state === "inquiry-drawer") {
          await page.getByRole("button", { name: /^Inquiry,/ }).click();
          await page.getByRole("dialog", { name: "Product inquiry" }).waitFor();
        } else if (auditCase.state === "workspace-menu") {
          await page.getByRole("button", { name: "Open all workspace navigation" }).click();
          await page.getByRole("dialog", { name: "Workspace menu" }).waitFor();
        }
        if (auditCase.state) await page.waitForTimeout(150);
      } catch (error) {
        loadError = error instanceof Error ? error.message : String(error);
      }

      const structure = loadError ? null : await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const isContainedHorizontalOverflow = (element) => {
          let ancestor = element.parentElement;
          while (ancestor && ancestor !== document.body && ancestor !== document.documentElement) {
            const style = getComputedStyle(ancestor);
            const rect = ancestor.getBoundingClientRect();
            if (
              ["auto", "scroll", "hidden", "clip"].includes(style.overflowX)
              && rect.left >= -1
              && rect.right <= viewportWidth + 1
            ) return true;
            ancestor = ancestor.parentElement;
          }
          return false;
        };
        const overflowElements = [...document.querySelectorAll("body *")]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              element,
              details: {
                element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${typeof element.className === "string" && element.className ? `.${element.className.trim().replace(/\s+/g, ".")}` : ""}`,
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
              },
            };
          })
          .filter(({ element, details }) => (details.left < -1 || details.right > viewportWidth + 1) && !isContainedHorizontalOverflow(element))
          .map(({ details }) => details)
          .sort((left, right) => right.width - left.width)
          .slice(0, 20);
        return {
          title: document.title.trim(),
          language: document.documentElement.lang,
          mains: document.querySelectorAll("main").length,
          h1s: document.querySelectorAll("h1").length,
          duplicateIds: [...document.querySelectorAll("[id]")]
            .map((element) => element.id)
            .filter((id, index, ids) => id && ids.indexOf(id) !== index),
          overflow: overflowElements.length > 0,
          overflowElements,
          layoutContainers: [".dashboard", ".main", ".client-picker", ".client-picker .table-wrap"]
            .map((selector) => {
              const element = document.querySelector(selector);
              if (!element) return null;
              const rect = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              return {
                selector,
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
                minWidth: style.minWidth,
                overflowX: style.overflowX,
              };
            })
            .filter(Boolean),
        };
      });
      const axe = loadError ? null : await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      results.push({
        ...auditCase,
        viewport: viewport.name,
        url: page.url(),
        responseStatus,
        loadError,
        browserErrors,
        structure,
        violations: (axe?.violations || []).map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.map((node) => ({ target: node.target, failureSummary: node.failureSummary })),
        })),
      });
      await context.close();
    }
  }
} finally {
  await browser.close();
  for (const session of sessions.values()) {
    db.prepare("DELETE FROM sessions WHERE token_hash=?").run(session.tokenHash);
    db.prepare("UPDATE users SET must_change_password=? WHERE id=?").run(session.actor.must_change_password, session.actor.id);
  }
  db.close();
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), baseURL, results }, null, 2)}\n`);

const failures = results.filter((result) =>
  result.loadError
  || result.responseStatus >= 400
  || result.browserErrors.length
  || !result.structure?.title
  || result.structure.language !== "en"
  || result.structure.mains !== 1
  || result.structure.h1s !== 1
  || result.structure.duplicateIds.length
  || result.structure.overflow
  || result.violations.length
);

if (failures.length) {
  for (const failure of failures) {
    const reasons = [
      failure.loadError,
      failure.responseStatus >= 400 ? `HTTP ${failure.responseStatus}` : "",
      failure.browserErrors.length ? `${failure.browserErrors.length} browser errors` : "",
      failure.structure && failure.structure.mains !== 1 ? `${failure.structure.mains} main landmarks` : "",
      failure.structure && failure.structure.h1s !== 1 ? `${failure.structure.h1s} h1 elements` : "",
      failure.structure?.overflow ? "horizontal overflow" : "",
      failure.violations.length ? failure.violations.map((violation) => `${violation.id} (${violation.nodes.length})`).join(", ") : "",
    ].filter(Boolean).join("; ");
    console.error(`${failure.viewport} ${failure.role} ${failure.path}${failure.state ? ` [${failure.state}]` : ""}: ${reasons}`);
  }
}
assert.equal(failures.length, 0, `${failures.length} accessibility route states failed; inspect ${outputPath}`);
console.log(`${results.length} cross-role desktop and phone accessibility states passed: ${outputPath}`);
