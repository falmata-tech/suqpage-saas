import assert from 'node:assert/strict';
import { getDb, closeDbForTests, getBusinessByHandle, getCatalogByBusinessId, getUserById } from './testing/postgres-fixture';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { executeBasicProductUpkeep } from '../lib/product-upkeep';
import { postgresProductUpkeepPort } from '../lib/product-upkeep-postgres';
import { createPublicInquiry } from '../lib/inquiries';
import { catalogOfferingLabel, normalizeOfferingKind, availabilityLabel } from '../lib/offerings';
import { productSellingUnit, productHref } from '../lib/product-inquiry';

async function main() {
  process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED = '1';
  process.env.PRIVACY_SALT = 'isolated-service-fixture-privacy-salt';
  const db = await getDb();
  try {
    const schema = (await db.prepare('SELECT current_schema() name').get()).name as string;
    assert.match(schema, /^suqpage_test_/);
    const businessId = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('service-fixture','Service fixture','composition','active')").run()).insertedId);
    const productId = Number((await db.prepare("INSERT INTO products(business_id,name,slug,offering_kind,is_published) VALUES(?,'Retained product','retained','standard_product',1)").run(businessId)).insertedId);
    const fresh = await db.prepare("INSERT INTO products(business_id,name,slug,offering_kind) VALUES(?,'Fresh service','fresh-service','service')").run(businessId);
    await db.prepare('DELETE FROM products WHERE id=?').run(fresh.insertedId);
    const before = await db.prepare('SELECT * FROM products ORDER BY id').all();
    // Simulate the preceding constraint contract only in this disposable schema.
    const priorKinds = "'standard_product','made_to_order','manufacturing_capability','production_supply'";
    await db.runner.query(`ALTER TABLE products DROP CONSTRAINT ck_products_6; ALTER TABLE products ADD CONSTRAINT ck_products_6 CHECK(offering_kind IN (${priorKinds})); ALTER TABLE inquiry_items DROP CONSTRAINT ck_inquiry_items_3; ALTER TABLE inquiry_items ADD CONSTRAINT ck_inquiry_items_3 CHECK(offering_kind_snapshot IN (${priorKinds})); DELETE FROM schema_migrations WHERE version=46;`);
    await assert.rejects(() => db.prepare("UPDATE products SET offering_kind='service' WHERE id=?").run(productId), /ck_products_6/);
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [46]);
    assert.deepEqual(await db.prepare('SELECT * FROM products ORDER BY id').all(), before);
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    await assert.rejects(() => db.prepare("UPDATE products SET offering_kind='unknown' WHERE id=?").run(productId), /ck_products_6/);
    const userId = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES('service-owner@example.test','unused','Fixture owner','owner',?)").run(businessId)).insertedId);
    await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(userId);
    const owner = (await getUserById(userId))!;
    const business = (await getBusinessByHandle('service-fixture'))!;
    const command = { kind: 'create', businessId, productId: null, expectedContentVersion: business.content_version, idempotencyKey: 'service_fixture_create_001', name: 'Equipment inspection', description: 'Inspection of a customer-provided device.', availability: 'available', offeringKind: 'service', quantityMode: 'optional', capacitySummary: '', minimumOrderSummary: '', leadTimeSummary: '', priceMinor: null, quantityUnit: 'session', highlights: ['Written findings'], videoRef: '', categoryId: null, imageAction: 'keep', serviceNote: '', optionGroups: [], isPublished: true };
    await executeBasicProductUpkeep(postgresProductUpkeepPort, owner, command, null);
    const catalog = (await getCatalogByBusinessId(businessId, true))!;
    const service = catalog.products.find(item => item.name === command.name)!;
    assert.equal(service.offering_kind, 'service');
    assert.equal(service.quantity_unit, 'session');
    assert.deepEqual(service.highlights, ['Written findings']);
    assert.equal(catalogOfferingLabel(catalog.products), 'Products & services');
    assert.equal(catalogOfferingLabel([service]), 'Services');
    assert.equal(catalogOfferingLabel(catalog.products.filter(item => item.id === productId)), 'Products');
    assert.equal(normalizeOfferingKind('service'), 'service');
    assert.equal(productSellingUnit(service), 'Per session');
    assert.equal(productSellingUnit({ quantity_unit: '', offering_kind: 'service' }), '');
    assert.equal(availabilityLabel('service', 'limited'), 'Limited availability');
    assert.equal(productHref(business.handle, productId), `/@service-fixture?product=${productId}`);
    const input = { businessId, customerName: 'Fixture visitor', contact: '+447700900123', contactMethod: 'phone', idempotencyKey: 'service_inquiry_001', items: [{ productId: service.id, quantity: null, options: {} }] };
    const inquiry = await createPublicInquiry(input, 'service-test-ip');
    const line = await db.prepare('SELECT offering_kind_snapshot,quantity,quantity_intent FROM inquiry_items WHERE inquiry_id=?').get(inquiry.inquiryId);
    assert.equal(line.offering_kind_snapshot, 'service');
    assert.equal(line.quantity, null);
    assert.equal(line.quantity_intent, ''); // Existing canonical representation of omitted intent.
    await assert.rejects(() => executeBasicProductUpkeep(postgresProductUpkeepPort, { ...owner, business_id: businessId + 1 }, { ...command, idempotencyKey: 'service_foreign_001' }, null));
    await db.prepare("UPDATE products SET availability='unavailable' WHERE id=?").run(service.id);
    await assert.rejects(async () => createPublicInquiry({ ...input, idempotencyKey: 'service_unavailable_001' }, 'service-test-ip2'));
    await db.prepare("UPDATE products SET availability='available',is_published=0 WHERE id=?").run(service.id);
    await assert.rejects(async () => createPublicInquiry({ ...input, idempotencyKey: 'service_hidden_001' }, 'service-test-ip3'));
    assert.equal((await db.prepare('SELECT COUNT(*) total FROM inquiries').get()).total, 1);
    console.log('PASS service fresh/upgrade constraints, unchanged IDs, owner upkeep, catalog labels, optional canonical inquiry snapshots and foreign/hidden/unavailable denial.');
  } finally { await closeDbForTests(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
