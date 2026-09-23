import assert from 'node:assert/strict';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { getMarketplaceDiscoveryView } from '../lib/discovery';

async function main() {
  const db = await getDb();
  try {
    const business = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('ranking-farm','Prairie Meadows','composition','active')").run()).insertedId);
    await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at) VALUES(?,'Addis Ababa','Central','Addis Ababa',9,38,1,1)").run(business);
    await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'food-farming')").run(business);
    let serial = 0;
    const add = async (name: string, description: string, published = 1) => Number((await db.prepare('INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,?,?,?,?)').run(business, name, `rank-${++serial}`, description, published)).insertedId);
    const target = await add('Farm Grass with Dirt', 'Fresh rolls for a garden.');
    const description = await add('A Pasture Roll', 'Fresh grass for a garden.');
    const variants: number[] = [];
    for (let i = 0; i < 8; i++) variants.push(await add(`Bakery Grain ${i}`, 'Grain supply.'));
    const hidden = await add('Gras', 'Private draft grass.', 0);

    for (const q of ['gras', 'GRAS', 'find gras', '[gras]', 'grás']) {
      for (const type of ['all', 'products']) {
        const first = await getMarketplaceDiscoveryView({ q, type });
        assert.equal(first.searchProducts[0].id, target, `${q}/${type}: original words inside a title must beat variant-only titles`);
        assert.equal(first.searchProducts[1].id, description, 'Original description matches precede variant-only matches');
        assert.equal(first.resultCounts.products, 10, 'Ranking preserves plural-alternative recall');
        assert.equal(first.searchOrder?.[0].id, target);
        assert.equal(first.suggestions.filter(row => row.kind === 'offering')[0]?.label, 'Farm Grass with Dirt', 'Suggestions retain the stronger title match');
      }
    }
    const seen: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const view = await getMarketplaceDiscoveryView({ q: 'gras', page });
      assert.equal(view.resultPage.totalItems, 11);
      assert.ok(view.searchOrder!.length <= 5);
      assert.ok(!view.searchProducts.some(item => item.id === hidden));
      seen.push(...view.searchOrder!.map(ref => `${ref.kind}:${ref.id}`));
    }
    assert.deepEqual(seen, [target, description, ...variants].map(id => `product:${id}`).concat(`business:${business}`), 'Ranking precedes SQL pagination, with complete stable traversal');
    assert.equal(new Set(seen).size, seen.length);
    const exact = await add('Grass', 'Fresh rolls.');
    const prefix = await add('Grass Seed', 'For planting.');
    const ranked = await getMarketplaceDiscoveryView({ q: 'grass', type: 'products' });
    assert.deepEqual(ranked.searchProducts.slice(0, 4).map(item => item.id), [exact, prefix, target, description], 'Exact and title-prefix matches retain their priority');
    assert.equal((await getMarketplaceDiscoveryView({ q: 'gras', industry: 'electronics' })).resultPage.totalItems, 0);
    const browse = await getMarketplaceDiscoveryView({ type: 'products' });
    assert.equal(browse.searchProducts[0].id, description, 'Empty browsing retains alphabetical order');
    console.log('PASS original-title/description priority, gras/grass, case, accents, request words, suggestions, stable pages, hidden/category boundaries and empty browsing.');
  } finally { await closeDbForTests(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
