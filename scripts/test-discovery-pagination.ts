import assert from 'node:assert/strict';
import { getDb, closeDbForTests } from "./testing/postgres-fixture";
import { test, after } from 'node:test';
import { getMarketplaceDiscoveryView } from '../lib/discovery';
async function runPostgresFixture() {
    const db = await getDb();
    await db.prepare("INSERT INTO discovery_industries(key,label,icon,position,active) VALUES('electronics','Electronics','cpu',1,1) ON CONFLICT(key) DO NOTHING").run();
    for (let i = 1; i <= 3; i++) {
        const id = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition',?)").run(`pagination-${i}`, `Shop ${i}`, i === 3 ? 'draft' : 'active')).insertedId);
        await db.prepare("INSERT INTO business_discovery_profiles(business_id,booth_image_path,city,zone,region,latitude,longitude,fallback_style,is_featured,is_excluded,approved_at,updated_at) VALUES(?,'','Addis Ababa','Central','Addis Ababa',9,38,'technical',0,0,1,1)").run(id);
        await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'electronics')").run(id);
        for (let n = 0; n < 8; n++)
            await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,?,?,'Signal product',?)").run(id, `Signal ${i}-${n}`, `signal-${i}-${n}`, n === 7 ? 0 : 1);
    }
    await db.prepare("INSERT INTO discovery_sponsorships(business_id,position,active,updated_at) VALUES(2,1,1,1)").run();
    const keys = (v: Awaited<ReturnType<typeof getMarketplaceDiscoveryView>>) => [...v.searchProducts.map(p => `p${p.id}`), ...v.searchBusinesses.map(b => `b${b.id}`)];
    test('category results use bounded database pages with stable totals and complete traversal', async () => {
        const first = await getMarketplaceDiscoveryView({ industry: 'electronics' });
        assert.deepEqual(first.resultCounts, { products: 14, businesses: 2 });
        assert.equal(keys(first).length, 5);
        assert.equal(first.resultPage.totalPages, 4);
        const seen = new Set<string>();
        for (let page = 1; page <= 4; page++) {
            const v = await getMarketplaceDiscoveryView({ industry: 'electronics', page });
            assert.ok(keys(v).length <= 5);
            for (const k of keys(v)) {
                assert.ok(!seen.has(k));
                seen.add(k);
            }
            assert.deepEqual(v.showrooms.map(b => b.id), first.showrooms.map(b => b.id));
        }
        assert.equal(seen.size, 16);
    });
    test('type tabs, filters and invalid/out-of-range pages have accurate backend windows', async () => {
        const businesses = await getMarketplaceDiscoveryView({ industry: 'electronics', type: 'businesses', page: '99999' });
        assert.equal(businesses.searchBusinesses[0].name, 'Shop 1', 'Sponsorship does not rank the result list');
        assert.equal(businesses.resultPage.page, 1);
        assert.equal(businesses.resultPage.totalItems, 2);
        assert.equal(businesses.searchProducts.length, 0);
        const products = await getMarketplaceDiscoveryView({ industry: 'electronics', type: 'products', page: 3 });
        assert.equal(products.searchProducts.length, 4);
        assert.equal(products.searchBusinesses.length, 0);
        const invalid = await getMarketplaceDiscoveryView({ industry: 'electronics', page: 'invalid' });
        assert.equal(invalid.resultPage.page, 1);
        const empty = await getMarketplaceDiscoveryView({ industry: 'electronics', q: 'no such product' });
        assert.equal(empty.resultPage.totalItems, 0);
        assert.equal(keys(empty).length, 0);
        const literal = await getMarketplaceDiscoveryView({ industry: 'electronics', q: '%_' });
        assert.equal(literal.resultPage.totalItems, 0);
        const query = await getMarketplaceDiscoveryView({ industry: 'electronics', q: 'Signal 1-0' });
        assert.equal(query.searchProducts.length, 1);
        assert.equal(query.resultCounts.products, 1);
    });
    after(closeDbForTests);
}
runPostgresFixture().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
