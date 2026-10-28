import assert from "node:assert/strict";
import { closePostgresRuntimeForTests } from "../lib/postgres-runtime-services";
import { countPublicSeoEntries, listPublicDirectoryBusinesses, listPublicSeoEntries, publicSeoBusinessEligible } from "../lib/public-seo-runtime";
import {
  publicDirectoryCursor, publicDirectoryPage, publicDirectorySummary,
  publicSeoEntryPath, publicSeoImageUrl, publicSeoUrl, safeJsonLd,
  showroomJsonLd, showroomSeoMetadata, showroomSeoPath, sitemapIndexXml,
  sitemapPageCount, sitemapPageWindow, sitemapUrlsetXml, SITEMAP_PAGE_SIZE,
  SITEMAP_STATIC_PATHS, DIRECTORY_PAGE_SIZE,
} from "../lib/public-seo";
import { runtimeAll, runtimeGet } from "../lib/runtime-sql";
import type { Business, Product } from "../lib/types";
import { publicSiteOrigin } from "../lib/public-site-origin";

const business = {
  id: 19, handle: "real-showroom", name: "Sample Weaving Studio",
  description: "Handwoven cotton cloth and home textiles.",
  hero_image_path: "/uploads/real/cover.jpg", logo_path: "/uploads/real/logo.png",
  is_demo: 0,
} as Business;
const product = {
  id: 74, business_id: 19, name: "Cotton Cloth",
  description: "Woven cotton in several colors.", image_path: "/uploads/real/cloth.jpg",
  is_published: 1, offering_kind: "product",
} as unknown as Product;

async function main() {
  assert.equal(publicSiteOrigin({ NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "https://mirtpage.com" }), "https://africmade.com");
  assert.equal(publicSiteOrigin({ NODE_ENV: "development", NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3102/" }), "http://127.0.0.1:3102");
  const previousOrigin = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://active.example";
  try {
  assert.equal(publicSeoUrl("/about"), "https://active.example/about");
  assert.throws(() => publicSeoUrl("https://other.example/"));
  assert.throws(() => publicSeoUrl("//other.example/"));
  assert.equal(showroomSeoPath(business.handle, product.id), "/@real-showroom?product=74");
  assert.equal(publicSeoEntryPath({ handle: business.handle, product_id: "74" }), showroomSeoPath(business.handle, product.id));
  assert.throws(() => publicSeoEntryPath({ handle: business.handle, product_id: "0" }));
  assert.equal(publicSeoImageUrl("javascript:alert(1)"), undefined);
  assert.equal(publicSeoImageUrl("/uploads/real/cloth.jpg"), "https://active.example/uploads/real/cloth.jpg");

  assert.equal(publicDirectoryCursor(undefined), 0);
  assert.equal(publicDirectoryCursor("34"), 34);
  for (const invalid of ["", "0", "-1", "01", "1.5", "1&x=2", "9007199254740992", ["1", "2"]]) {
    assert.equal(publicDirectoryCursor(invalid), null);
  }
  const directoryRows = Array.from({ length: DIRECTORY_PAGE_SIZE + 1 }, (_, index) => ({ id: index + 1 }));
  assert.deepEqual(publicDirectoryPage(directoryRows).items, directoryRows.slice(0, DIRECTORY_PAGE_SIZE));
  assert.equal(publicDirectoryPage(directoryRows).nextCursor, DIRECTORY_PAGE_SIZE);
  assert.equal(publicDirectoryPage(directoryRows.slice(0, DIRECTORY_PAGE_SIZE)).nextCursor, null);
  assert.throws(() => publicDirectoryPage([{ id: 2 }, { id: 2 }]));
  assert.throws(() => publicDirectoryPage([...directoryRows, { id: DIRECTORY_PAGE_SIZE + 2 }]));
  assert.equal(publicDirectorySummary("  Cotton   cloth  "), "Cotton cloth");
  assert.ok(publicDirectorySummary("A".repeat(200)).length <= 180);

  assert.equal(sitemapPageCount(0), 1);
  assert.equal(sitemapPageCount(SITEMAP_PAGE_SIZE - SITEMAP_STATIC_PATHS.length), 1);
  assert.equal(sitemapPageCount(SITEMAP_PAGE_SIZE - SITEMAP_STATIC_PATHS.length + 1), 2);
  assert.deepEqual(sitemapPageWindow(0), { limit: SITEMAP_PAGE_SIZE - SITEMAP_STATIC_PATHS.length, offset: 0,
    staticPaths: SITEMAP_STATIC_PATHS });
  assert.deepEqual(sitemapPageWindow(1), { limit: SITEMAP_PAGE_SIZE, offset: SITEMAP_PAGE_SIZE - SITEMAP_STATIC_PATHS.length, staticPaths: [] });
  const covered = new Set<number>();
  const syntheticCount = 20_003;
  for (let page = 0; page < sitemapPageCount(syntheticCount); page++) {
    const window = sitemapPageWindow(page);
    for (let id = window.offset; id < Math.min(syntheticCount, window.offset + window.limit); id++) {
      assert.ok(!covered.has(id), "A public URL must belong to exactly one sitemap page");
      covered.add(id);
    }
  }
  assert.equal(covered.size, syntheticCount);
  assert.throws(() => sitemapPageWindow(-1));
  assert.throws(() => sitemapUrlsetXml(Array(SITEMAP_PAGE_SIZE + 1).fill("/")));
  assert.match(sitemapIndexXml(2), /https:\/\/active\.example\/sitemaps\/1/);
  assert.match(sitemapUrlsetXml(["/@a&b"]), /\/\@a&amp;b/);

  const pageMeta = showroomSeoMetadata({ business, productRequested: false });
  assert.equal(pageMeta.alternates?.canonical, "https://active.example/@real-showroom");
  assert.equal(pageMeta.robots && typeof pageMeta.robots === "object" ? pageMeta.robots.index : null, true);
  const savedSharing = { ...business, site_title: "  A studio for every room  ", site_description: "  Explore our handwoven range.  " };
  const savedSharingMeta = showroomSeoMetadata({ business: savedSharing, productRequested: false });
  assert.equal(savedSharingMeta.title, "A studio for every room");
  assert.equal(savedSharingMeta.description, "Explore our handwoven range.");
  assert.equal(savedSharingMeta.openGraph?.title, "A studio for every room");
  assert.equal(savedSharingMeta.openGraph?.description, "Explore our handwoven range.");
  assert.equal(savedSharingMeta.twitter?.title, "A studio for every room");
  assert.equal(savedSharingMeta.twitter?.description, "Explore our handwoven range.");
  const blankSharingMeta = showroomSeoMetadata({ business: { ...savedSharing, site_title: "  ", site_description: "\n " }, productRequested: false });
  assert.equal(blankSharingMeta.title, business.name);
  assert.equal(blankSharingMeta.description, business.description);
  const productMeta = showroomSeoMetadata({ business, productRequested: true, product });
  assert.equal(productMeta.alternates?.canonical, "https://active.example/@real-showroom?product=74");
  assert.equal(productMeta.description, product.description);
  assert.equal(productMeta.openGraph?.url, "https://active.example/@real-showroom?product=74");
  const savedSharingProductMeta = showroomSeoMetadata({ business: savedSharing, productRequested: true, product });
  assert.equal(savedSharingProductMeta.title, `${product.name} · ${business.name}`);
  assert.equal(savedSharingProductMeta.description, product.description);
  const unavailableMeta = showroomSeoMetadata({ business, productRequested: true, product: null });
  assert.equal(unavailableMeta.robots && typeof unavailableMeta.robots === "object" ? unavailableMeta.robots.index : null, false);
  assert.equal(unavailableMeta.alternates, undefined);
  const demoMeta = showroomSeoMetadata({ business: { ...business, is_demo: 1 }, productRequested: false });
  assert.equal(demoMeta.robots && typeof demoMeta.robots === "object" ? demoMeta.robots.index : null, false);
  const hiddenMeta = showroomSeoMetadata({ business, productRequested: false, indexable: false });
  assert.equal(hiddenMeta.robots && typeof hiddenMeta.robots === "object" ? hiddenMeta.robots.index : null, false);

  const schema = showroomJsonLd({ business, product });
  assert.equal(schema["@type"], "WebPage");
  assert.equal(schema.url, "https://active.example/@real-showroom?product=74");
  assert.equal(schema.Offer, undefined);
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(schema.availability, undefined);
  const injected = safeJsonLd({ description: "</script><script>alert(1)</script>" });
  assert.ok(!injected.includes("</script>"));
  assert.ok(injected.includes("\\u003c/script>"));

  if (process.argv.includes("--db")) {
    assert.ok(process.env.SUQPAGE_POSTGRES_URL, "A local PostgreSQL connection is required for --db");
    const count = await countPublicSeoEntries();
    const window = sitemapPageWindow(0);
    const rows = await listPublicSeoEntries(window.limit, window.offset);
    assert.ok(rows.length <= window.limit && rows.length <= count);
    assert.ok(rows.every(row => !row.product_id || Number(row.product_id) > 0));
    const demoHandles = await runtimeAll<{ id: number; handle: string }>("SELECT id,handle FROM businesses WHERE is_demo=1");
    const demo = new Set(demoHandles.map(row => row.handle));
    assert.ok(rows.every(row => !demo.has(row.handle)), "Demo pages must be absent from the sitemap query");
    if (demoHandles.length) assert.equal(await publicSeoBusinessEligible(demoHandles[0].id), false);
    const independentCount = await runtimeGet<{ count: string | number }>(`
      SELECT COUNT(*) AS count FROM (
        SELECT b.id,NULL::bigint product_id FROM businesses b
        JOIN business_discovery_profiles d ON d.business_id=b.id
        WHERE b.status='active' AND b.is_demo=0 AND d.is_excluded=0 AND d.approved_at>0
          AND EXISTS(SELECT 1 FROM products visible WHERE visible.business_id=b.id
            AND visible.is_published=1 AND visible.offering_kind<>'service')
        UNION ALL
        SELECT b.id,p.id product_id FROM products p JOIN businesses b ON b.id=p.business_id
        JOIN business_discovery_profiles d ON d.business_id=b.id
        WHERE b.status='active' AND b.is_demo=0 AND d.is_excluded=0 AND d.approved_at>0
          AND p.is_published=1 AND p.offering_kind<>'service'
      ) entries
    `);
    assert.equal(count, Number(independentCount?.count));
    const directory = await listPublicDirectoryBusinesses(0, DIRECTORY_PAGE_SIZE + 1);
    const firstDirectoryPage = publicDirectoryPage(directory);
    assert.ok(firstDirectoryPage.items.length <= DIRECTORY_PAGE_SIZE);
    assert.ok(directory.every(row => !demo.has(row.handle)));
    assert.ok(directory.every(row => rows.some(entry => entry.handle === row.handle && entry.product_id === null)));
    assert.ok(directory.every(row => typeof row.city === "string" && typeof row.summary === "string"));
    assert.ok((await Promise.all(directory.map(row => publicSeoBusinessEligible(row.id)))).every(Boolean));
    assert.equal(await publicSeoBusinessEligible(0), false);
    if (firstDirectoryPage.nextCursor) {
      const second = await listPublicDirectoryBusinesses(firstDirectoryPage.nextCursor, DIRECTORY_PAGE_SIZE + 1);
      assert.ok(second.every(row => row.id > firstDirectoryPage.nextCursor!));
    }
    const xml = sitemapUrlsetXml([...window.staticPaths, ...rows.map(publicSeoEntryPath)]);
    assert.ok(!xml.includes("/dashboard/") && !xml.includes("/tracking/") && !xml.includes("/preview/"));
    console.log(`Public SEO focused tests passed; read-only catalog count ${count}.`);
  } else {
    console.log("Public SEO pure tests passed; database scope not run without local PostgreSQL config.");
  }
  } finally {
    await closePostgresRuntimeForTests();
    if (previousOrigin === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = previousOrigin;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
