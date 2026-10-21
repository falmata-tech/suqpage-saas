import assert from "node:assert/strict";
import { closePostgresRuntimeForTests } from "../lib/postgres-runtime-services";
import { listPublicSeoEntries } from "../lib/public-seo-runtime";
import { publicSeoEntryPath } from "../lib/public-seo";
import { runtimeGet } from "../lib/runtime-sql";

const base = "http://127.0.0.1:3102";

async function publicGet(path: string, stage: string, locale?: "am" | "om"): Promise<{ status: number; body: string; type: string; robots: string }> {
  try {
    const response = await fetch(new URL(path, base), {
      headers: locale ? { Cookie: `suqpage-language=${locale}` } : undefined,
      signal: AbortSignal.timeout(30_000),
    });
    return {
      status: response.status,
      body: await response.text(),
      type: response.headers.get("content-type") || "",
      robots: response.headers.get("x-robots-tag") || "",
    };
  } catch (error) {
    throw new Error(`Local SEO HTTP ${stage} failed: ${error instanceof Error ? error.name : "unknown error"}`);
  }
}

function canonical(html: string): string | undefined {
  const tag = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]).find(link => /\brel="canonical"/.test(link));
  return tag?.match(/\bhref="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&");
}

function escapedText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

function pageTitles(html: string): string[] {
  return [...html.matchAll(/<title>([^<]*)<\/title>/g)].map(match => match[1]);
}

function metaDescription(html: string): string | undefined {
  const tag = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]).find(value => /\bname="description"/.test(value));
  return tag?.match(/\bcontent="([^"]*)"/)?.[1];
}

async function main() {
  try {
    const robots = await publicGet("/robots.txt", "robots");
    const index = await publicGet("/sitemap.xml", "sitemap index");
    const urls = await publicGet("/sitemaps/0", "sitemap page");
    assert.equal(robots.status, 200);
    assert.match(robots.body, /Sitemap:\s+https?:\/\//);
    assert.match(robots.body, /Allow:\s+\/api\/page-media\//);
    assert.match(robots.body, /Disallow:\s+\/dashboard(?:\s|$)/m);
    assert.match(robots.body, /Disallow:\s+\/auth(?:\s|$)/m);
    assert.match(robots.body, /Disallow:\s+\/api\/(?:\s|$)/m);
    assert.doesNotMatch(robots.body, /Disallow:\s+\/(?:tracking|transport-plan)(?:\/|\s|$)/m,
      "Tracking HTML must remain crawlable so its noindex directive can be seen");
    assert.equal(index.status, 200);
    assert.match(index.type, /application\/xml/);
    assert.match(index.body, /<sitemapindex\b/);
    assert.equal(urls.status, 200);
    assert.match(urls.type, /application\/xml/);
    assert.match(urls.body, /<urlset\b/);
    assert.ok(!urls.body.includes("/dashboard/") && !urls.body.includes("/tracking/"));

    for (const path of ["/tracking", "/tracking/local-noindex-review", "/transport-plan"]) {
      const entry = await publicGet(path, `noindex HTML ${path}`);
      assert.equal(entry.status, 200, `Expected public tracking entry ${path}`);
      assert.match(entry.body, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/,
        `${path} must explicitly opt out of indexing`);
    }

    const market = await publicGet("/", "Market");
    const about = await publicGet("/about", "About");
    const featured = await publicGet("/featured", "Featured");
    const directory = await publicGet("/showrooms", "showroom directory");
    assert.equal(market.status, 200);
    assert.equal(about.status, 200);
    assert.equal(featured.status, 200);
    assert.equal(directory.status, 200);
    assert.equal(new URL(canonical(market.body) || "about:blank").pathname, "/");
    assert.ok(canonical(about.body)?.endsWith("/about"));
    assert.ok(canonical(featured.body)?.endsWith("/featured"));
    assert.ok(canonical(directory.body)?.endsWith("/showrooms"));
    assert.ok(urls.body.includes("/showrooms</loc>"));
    assert.ok(market.body.includes('href="/about"'), "Market must link to About in initial HTML");
    assert.ok(about.body.includes('href="/showrooms"'), "About must link to the public directory in initial HTML");
    assert.match(market.body, /application\/ld\+json/);

    const entries = await listPublicSeoEntries(200, 0);
    const business = entries.find(entry => entry.product_id === null);
    const product = entries.find(entry => entry.product_id !== null && entry.handle === business?.handle);
    assert.ok(business && product, "Expected a local real showroom and published product");
    const businessPath = publicSeoEntryPath(business);
    const productPath = publicSeoEntryPath(product);
    assert.ok(directory.body.includes(`href="${businessPath}"`),
      "The directory must link to an eligible showroom in initial HTML");
    assert.ok(!directory.body.includes("href=\"/@demo-"), "Demo showrooms must not enter the directory");
    const showroom = await publicGet(businessPath, "showroom");
    const detail = await publicGet(`${productPath}&ref=discovery`, "product detail");
    assert.equal(showroom.status, 200);
    assert.equal(detail.status, 200);
    const savedSharing = await runtimeGet<{ name: string; site_title: string; site_description: string }>(
      "SELECT name,site_title,site_description FROM businesses WHERE handle=?", [business.handle]);
    assert.ok(savedSharing);
    assert.ok(pageTitles(showroom.body).includes(`${escapedText(savedSharing.site_title.trim() || savedSharing.name)} · MirtPage`),
      "Showroom HTML must use the owner's saved title when set");
    if (savedSharing.site_description.trim()) {
      assert.equal(metaDescription(showroom.body), escapedText(savedSharing.site_description.trim()),
        "Showroom HTML must use the owner's saved search and sharing description");
    }
    assert.ok(canonical(showroom.body)?.endsWith(businessPath));
    assert.ok(canonical(detail.body)?.endsWith(productPath.replace(/&/g, "&amp;")) || canonical(detail.body)?.endsWith(productPath));
    assert.notEqual(canonical(showroom.body), canonical(detail.body));
    assert.ok(showroom.body.includes(`href="${productPath.replace(/&/g, "&amp;")}"`) || showroom.body.includes(`href="${productPath}"`),
      "Initial showroom HTML needs a real product href");
    const productName = await runtimeGet<{ name: string; description: string }>("SELECT name,description FROM products WHERE id=?", [Number(product.product_id)]);
    assert.ok(productName);
    assert.ok(pageTitles(detail.body).includes(`${escapedText(productName.name)} · ${escapedText(savedSharing.name)} · MirtPage`),
      "Product HTML must retain its product-specific title after owner sharing edits");
    assert.ok(detail.body.includes(escapedText(productName.name)) || detail.body.includes(productName.name),
      "Initial product HTML needs the product name");
    if (productName.description) assert.ok(detail.body.includes(escapedText(productName.description)) || detail.body.includes(productName.description),
      "Initial product HTML needs the product description");

    const missingShowroom = await publicGet("/@no-such-mirtpage-showroom-404-review", "missing showroom");
    assert.equal(missingShowroom.status, 404, "A missing showroom must not stream a soft 404");
    assert.match(missingShowroom.robots, /noindex/);
    assert.match(missingShowroom.type, /text\/html/);
    assert.match(missingShowroom.body, /<h1>Page not found\.<\/h1>/);
    assert.match(missingShowroom.body, /href="\/">Back to Market<\/a>/);
    assert.ok(!missingShowroom.body.includes("application/ld+json"), "A missing showroom must not expose business data");
    const encodedMissing = await publicGet("/%40no-such-mirtpage-showroom-404-review", "encoded missing showroom");
    assert.equal(encodedMissing.status, 404);
    assert.match(encodedMissing.robots, /noindex/);
    const amMissing = await publicGet("/@no-such-mirtpage-showroom-404-review", "Amharic missing showroom", "am");
    const omMissing = await publicGet("/@no-such-mirtpage-showroom-404-review", "Oromo missing showroom", "om");
    assert.equal(amMissing.status, 404);
    assert.equal(omMissing.status, 404);
    assert.match(amMissing.body, /ገጹ አልተገኘም።/);
    assert.match(omMissing.body, /Fuulli hin argamne\./);
    const draft = await runtimeGet<{ handle: string; description: string }>(`
      SELECT b.handle,b.description FROM businesses b
      WHERE b.status<>'active' AND b.status<>'suspended' ORDER BY b.id LIMIT 1
    `);
    if (draft) {
      const privatePage = await publicGet(`/@${encodeURIComponent(draft.handle)}`, "draft showroom");
      assert.equal(privatePage.status, 404, "A draft showroom must not stream a soft 404");
      assert.match(privatePage.robots, /noindex/);
      if (draft.description) assert.ok(!privatePage.body.includes(escapedText(draft.description)),
        "A draft description must never appear in the public response");
    }

    const stale = await publicGet(`${businessPath}?product=999999999999999`, "stale product");
    assert.equal(stale.status, 200);
    assert.match(stale.body, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
    const foreignProduct = await runtimeGet<{ id: number }>(`
      SELECT p.id FROM products p JOIN businesses b ON b.id=p.business_id
      WHERE b.handle<>? AND p.is_published=1 ORDER BY p.id LIMIT 1
    `, [business.handle]);
    if (foreignProduct) {
      const foreign = await publicGet(`${businessPath}?product=${foreignProduct.id}`, "foreign product");
      assert.equal(foreign.status, 200);
      assert.match(foreign.body, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
    }

    const demo = await runtimeGet<{ handle: string }>("SELECT handle FROM businesses WHERE status='active' AND is_demo=1 ORDER BY id LIMIT 1");
    if (demo) {
      const demoPage = await publicGet(`/@${encodeURIComponent(demo.handle)}`, "demo showroom");
      assert.equal(demoPage.status, 200);
      assert.match(demoPage.body, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
      assert.ok(!urls.body.includes(`/@${encodeURIComponent(demo.handle)}`));
      assert.ok(!directory.body.includes(`href="/@${encodeURIComponent(demo.handle)}"`));
    }
    const invalidCursor = await publicGet("/showrooms?after=-1", "invalid directory cursor");
    const staleCursor = await publicGet("/showrooms?after=999999999", "stale directory cursor");
    // Next.js may have streamed the shared app shell before notFound(); its
    // documented response is then HTTP 200 with a noindex 404 segment.
    for (const response of [invalidCursor, staleCursor]) {
      assert.ok(response.status === 200 || response.status === 404);
      assert.match(response.body, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
      assert.ok(!response.body.includes(`href="${businessPath}"`));
    }
    console.log("Public SEO HTTP checks passed: About→directory→showroom→product initial HTML, robots, sitemap, canonicals, and private/stale/foreign exclusion.");
  } finally {
    await closePostgresRuntimeForTests();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
