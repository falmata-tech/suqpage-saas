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
    test('word matching crosses description and location, preserves Unicode and literal punctuation', async () => {
        for (const q of ['PRODUCT Addis signal', 'signal product ADDIS', 'ｓｉｇｎａｌ Addis']) {
            const result = await getMarketplaceDiscoveryView({q,type:'products'});
            assert.equal(result.resultCounts.products,14,q);
            assert.equal(result.searchProducts.length,5);
            assert.equal(result.showrooms.length,2);
        }
        await db.prepare("UPDATE products SET description=? WHERE slug='signal-1-0'").run('ለቤት ጥገና café 50%_off');
        for (const q of ['ጥገና Addis','cafe\u0301 Addis','50%_off']) {
            const result=await getMarketplaceDiscoveryView({q});
            assert.equal(result.resultCounts.products,1,q);
            assert.equal(result.searchProducts[0].name,'Signal 1-0');
        }
        await db.prepare("UPDATE products SET description='Secret hidden description' WHERE is_published=0 OR business_id=3").run();
        assert.equal((await getMarketplaceDiscoveryView({q:'Secret hidden'})).resultPage.totalItems,0);
        await db.prepare("UPDATE products SET description='AlphaOnly' WHERE slug='signal-1-1'").run();
        await db.prepare("UPDATE products SET description='BetaOnly' WHERE slug='signal-1-2'").run();
        assert.equal((await getMarketplaceDiscoveryView({q:'AlphaOnly BetaOnly'})).resultPage.totalItems,0,'No cross-product term mixing');
    });
    test('lotion case variants match inside Personal & home care without crossing visibility or category', async () => {
        const id=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('aloe-case-fixture','Aloe Field Care','composition','active')").run()).insertedId);
        await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at) VALUES(?,'Addis Ababa','Central','Addis Ababa',9,38,1,1)").run(id);
        await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'beauty-wellness')").run(id);
        await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,'Aloe Body Lotion','body-lotion','A fluid moisturizer. Café care ጥገና. Αθήνα чай.',1),(?,'Hidden Lotion','hidden-lotion','Private draft.',0)").run(id,id);
        for(const q of ['lotion','Lotion','LOTION','  aloe   lotion  ','aloe\tbody\nlotion','body-lotion','body/lotion','"body lotion"','lotion!','lotions','body lotions','show me body lotion','find lotions in addis ababa','ALOE LOTIONS ADDIS','lotion cafe','lotion café','lotion ጥገና','lotion Αθήνα','lotion чай']) {
            const result=await getMarketplaceDiscoveryView({q,industry:'beauty-wellness'});
            assert.deepEqual(result.resultCounts,{products:1,businesses:1});
            assert.equal(result.searchProducts[0].name,'Aloe Body Lotion');
            assert.equal(result.searchBusinesses[0].id,id);
            assert.equal((await getMarketplaceDiscoveryView({q,industry:'electronics'})).resultPage.totalItems,0);
        }
        for(const q of ['Hidden Lotion','unknownbrand lotion','.*','%','_', '[]','!!!',"' OR 1=1--"]) {
            assert.equal((await getMarketplaceDiscoveryView({q,industry:'beauty-wellness'})).resultPage.totalItems,0,q);
        }
    });
    test('business names, handles, services and everyday catalog searches are discoverable', async () => {
        const id=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('prairie-meadows','Prairie Meadows','composition','active')").run()).insertedId);
        await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at) VALUES(?,'Hawassa','Central','Sidama',7,38,1,1)").run(id);
        await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'electronics')").run(id);
        const items = [
            ['Coffee beans', 'Freshly roasted Arabica'], ['Phone repair', 'Screen replacement service Αθήνα чай'],
            ['Cotton dresses', 'Comfortable handmade clothing'], ['Hair brush', 'Soft bristles'],
            ['Gift box', 'Reusable packaging'], ['Solar battery', 'Backup power'],
        ];
        for (const [name,description] of items) {
            await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,?,?,?,1)").run(id,name,name.toLowerCase().replaceAll(' ','-'),description);
            for (const q of [name,name.toUpperCase(),name.toLowerCase().split(' ').reverse().join(' '),`find ${name} in Hawassa`,`${description.split(' ')[0]} Sidama`]) {
                const result=await getMarketplaceDiscoveryView({q,type:'products'});
                assert.equal(result.searchProducts[0]?.name,name,q);
                assert.equal(result.resultCounts.products,1,q);
            }
        }
        for (const q of ['Prairie Meadows','PRAIRIE MEADOWS','prairie-meadows','Meadows Prairie','prairie']) {
            const result=await getMarketplaceDiscoveryView({q,type:'businesses'});
            assert.equal(result.searchBusinesses[0]?.id,id,q);
            assert.equal(result.resultCounts.products,6,q);
            assert.deepEqual(result.showrooms.map(b=>b.id),[id]);
        }
        for (const q of ['Αθήνα','чай']) assert.equal((await getMarketplaceDiscoveryView({q,type:'products'})).searchProducts.some(p=>p.name==='Phone repair'),true,q);
        const all = await getMarketplaceDiscoveryView({industry:'all'});
        const hawassa = all.places.find(p=>p.kind==='city' && p.city==='Hawassa')!;
        const filtered = await getMarketplaceDiscoveryView({q:'lotion',place:hawassa.key});
        assert.equal(filtered.place,hawassa.key,'Keep the valid city when no offering matches there');
        assert.equal(filtered.resultPage.totalItems,0,'Do not broaden a zero-result city to Addis');
        assert.equal((await getMarketplaceDiscoveryView({q:'grass'})).industry.key,'all','Query-only links open results');
        for (const q of ['dresses','brushes','boxes','batteries']) {
            const result=await getMarketplaceDiscoveryView({q,place:'Hawassa',type:'products'});
            assert.equal(result.resultCounts.products,1,q);
        }
    });
    after(closeDbForTests);
}
runPostgresFixture().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
