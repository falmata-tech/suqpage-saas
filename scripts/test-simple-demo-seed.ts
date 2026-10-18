import { publicContactLinks } from '../lib/business-profile-contacts';
import { inquiryHandoffs } from '../lib/product-inquiry';
import assert from 'node:assert/strict';
import { getDb, seedFixture, closeDbForTests } from './testing/postgres-fixture';
import { SEEDED_MARKETPLACE_PROFILES } from '../lib/marketplace-seed';

async function main() {
  const db = await getDb();
  try {
    await seedFixture();
    const products = await db.prepare(`SELECT p.* FROM products p JOIN businesses b ON b.id=p.business_id
      WHERE b.handle=ANY(?::text[])`).all(Object.keys(SEEDED_MARKETPLACE_PROFILES));
    assert.ok(products.length >= 264);
    assert.ok(products.some(p => p.offering_kind === 'made_to_order'));
    assert.equal(products.filter(p=>p.offering_kind==='service').length,0);
    for (const product of products) {
      assert.ok(['standard_product', 'made_to_order'].includes(product.offering_kind));
      assert.ok(product.name && product.description && product.image_path && product.video_ref);
      assert.equal(product.highlights_json, '[]');
      assert.equal(product.quantity_unit, '');
      assert.equal(product.capacity_summary, '');
      assert.equal(product.minimum_order_summary, '');
      assert.equal(product.lead_time_summary, '');
    }
    assert.equal(Number((await db.prepare('SELECT COUNT(*) n FROM option_groups').get()).n), 0);
    const locations = await db.prepare(`SELECT p.location_mode, p.latitude, p.longitude
      FROM businesses b JOIN owner_location_proposals p ON p.business_id=b.id
      WHERE b.handle=ANY(?::text[])`).all(Object.keys(SEEDED_MARKETPLACE_PROFILES));
    assert.ok(locations.length >= 66);
    assert.ok(locations.every(p => p.location_mode === 'area' && p.latitude === null && p.longitude === null));
    const pages = await db.prepare('SELECT content_json FROM owner_page_publications').all();
    assert.equal(pages.length,66);
    for (const page of pages) {
      const contacts=JSON.parse(page.content_json).contacts;
      assert.deepEqual(publicContactLinks(contacts).map(link=>link.kind),['phone','email','website','whatsapp']);
      assert.match(contacts.email,/@example\.invalid$/);
      assert.match(contacts.phone,/^\+447700900\d{3}$/);
      assert.match(contacts.whatsapp,/^\+447700900\d{3}$/);
      assert.equal(contacts.website,'https://example.invalid/');
      for(const key of ['telegram','tiktok','instagram','facebook']) assert.equal(contacts[key],'','Fake demo handles must not point at real social accounts');
      assert.deepEqual(inquiryHandoffs(contacts,'Demo inquiry').map(link=>link.kind),['whatsapp','phone']);
    }
    const coverage = await db.prepare(`SELECT b.id,
      EXISTS(SELECT 1 FROM users u JOIN user_access_profiles a ON a.user_id=u.id WHERE u.business_id=b.id AND a.access_role='client') owner,
      EXISTS(SELECT 1 FROM inquiries i JOIN inquiry_items item ON item.inquiry_id=i.id WHERE i.business_id=b.id) inquiry,
      EXISTS(SELECT 1 FROM support_conversations c JOIN support_messages m ON m.conversation_id=c.id WHERE c.business_id=b.id) support,
      EXISTS(SELECT 1 FROM showroom_visits v WHERE v.business_id=b.id) insights
      FROM businesses b WHERE b.handle=ANY(?::text[])`).all(Object.keys(SEEDED_MARKETPLACE_PROFILES));
    assert.equal(coverage.length,66);
    assert.ok(coverage.every(row=>row.owner && row.inquiry && row.support && row.insights), 'Every demo demonstrates its owner dashboard');
    console.log('PASS 66 demos: simple offerings, area locations, owner accounts, inquiry items, support history and insights.');
  } finally { await closeDbForTests(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
