import assert from 'node:assert/strict';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { getMarketplaceDiscoveryView } from '../lib/discovery';
import { discoveryCategoryKey, normalizeDiscoveryCategories } from '../lib/discovery-contract';

async function main() {
  assert.equal(discoveryCategoryKey(['beauty-wellness', 'electronics,electronics', 'all', 'unknown']), 'electronics,beauty-wellness');
  assert.deepEqual(normalizeDiscoveryCategories('all'), []);
  assert.equal(discoveryCategoryKey("electronics,'); DROP TABLE businesses;--"), 'electronics');
  assert.equal(discoveryCategoryKey('bad'), 'all');
  assert.equal(discoveryCategoryKey('x'.repeat(100000)), 'all');
  const db = await getDb();
  try {
    async function add(handle: string, industries: string[], city = 'Addis Ababa', state: 'public' | 'draft' | 'excluded' | 'unapproved' | 'unpublished' = 'public') {
      const id = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition',?)").run(handle, handle, state === 'draft' ? 'draft' : 'active')).insertedId);
      await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,is_excluded,updated_at) VALUES(?,?,'Central',?,9,38,?,?,1)").run(id, city, city, state === 'unapproved' ? 0 : 1, state === 'excluded' ? 1 : 0);
      for (const industry of industries) await db.prepare('INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)').run(id, industry);
      for (let n = 0; n < 3; n++) await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,'Lotion',?,'Gentle skin care',?)").run(id, `${handle}-${n}`, state === 'unpublished' ? 0 : 1);
      return id;
    }
    const a = await add('multi-a', ['beauty-wellness']);
    const b = await add('multi-b', ['electronics'], 'Hawassa');
    const cross = await add('multi-cross', ['electronics', 'beauty-wellness']);
    const outside = await add('multi-outside', ['food-farming'], 'Woldia');
    for (const state of ['draft', 'excluded', 'unapproved', 'unpublished'] as const) await add(`multi-${state}`, ['electronics', 'beauty-wellness'], 'Addis Ababa', state);
    const scope = 'electronics,beauty-wellness';
    const ids = (v: Awaited<ReturnType<typeof getMarketplaceDiscoveryView>>) => v.showrooms.map(b => b.id).sort((a,b) => a-b);
    for (const industry of [scope, 'beauty-wellness,electronics,electronics', ['electronics', 'beauty-wellness'], ['bad', scope]]) {
      const view = await getMarketplaceDiscoveryView({ industry });
      assert.equal(view.industry.key, scope);
      assert.deepEqual(ids(view), [a,b,cross]);
      assert.deepEqual(view.resultCounts, { products: 9, businesses: 3 });
      assert.equal(view.resultPage.totalItems, 12);
      const seen = new Set<string>();
      for (let page = 1; page <= view.resultPage.totalPages; page++) {
        const current = await getMarketplaceDiscoveryView({ industry, page });
        assert.deepEqual(ids(current), ids(view), 'Map scope is independent of result page');
        const keys = [...current.searchProducts.map(p => `p${p.id}`), ...current.searchBusinesses.map(b => `b${b.id}`)];
        assert.ok(keys.length <= 5);
        for (const key of keys) { assert.ok(!seen.has(key), 'No cross-list duplicates'); seen.add(key); }
      }
      assert.equal(seen.size, 12);
    }
    for (const q of ['lotion', 'lotoin']) {
      const view = await getMarketplaceDiscoveryView({ industry: scope, q, type: 'products' });
      assert.equal(view.resultCounts.products, 9, `Exact/fuzzy union: ${q}`);
      assert.deepEqual(ids(view), [a,b,cross], `Exact/fuzzy privacy and scope: ${q}`);
      const local = await getMarketplaceDiscoveryView({ industry: scope, q, place: 'city:Addis Ababa:Addis Ababa' });
      assert.deepEqual(ids(local), [a,cross], 'Category union AND location');
      assert.ok(local.searchProducts.every(product => product.businessId !== outside));
    }
    const empty = await getMarketplaceDiscoveryView({ industry: scope, place: 'city:Woldia:Woldia' });
    assert.equal(empty.place, 'city:Woldia:Woldia', 'Retain a selected location with no category matches');
    assert.equal(empty.resultPage.totalItems, 0);
    assert.deepEqual(empty.showrooms, []);
    const cleared = await getMarketplaceDiscoveryView({ industry: 'all', place: empty.place });
    assert.deepEqual(ids(cleared), [outside], 'Clearing categories keeps the location');
    const all = await getMarketplaceDiscoveryView();
    assert.deepEqual(ids(all), [a,b,cross,outside], 'Clearing all scopes never exposes private records');
    const single = await getMarketplaceDiscoveryView({ industry: 'electronics' });
    assert.deepEqual(ids(single), [b,cross], 'Legacy single-category URLs keep working');
    console.log('PASS real PostgreSQL: canonical category sets, exact/fuzzy union, privacy, deduplication, bounded paging, retained location and clearing.');
  } finally { await closeDbForTests(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
