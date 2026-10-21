import assert from 'node:assert/strict';
import source from '../lib/place-catalog.json';
import { findKnownPlace, findPlaceSuggestions } from '../lib/place-catalog';
import { parseOwnerBusinessChange } from '../lib/owner-business-domain';
import { getDb, closeDbForTests, getUserById } from './testing/postgres-fixture';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { readOwnerBusiness, saveOwnerBusiness } from '../lib/owner-business-runtime';

async function main() {
  assert.equal(source.length, 781);
  assert.equal(new Set(source.map(place => place.id)).size, source.length);
  for (const place of source) {
    assert.ok(place.name && place.region && place.name.length <= 100 && place.region.length <= 100);
    assert.ok(place.latitude >= 3 && place.latitude <= 15 && place.longitude >= 32 && place.longitude <= 49);
  }
  const place = findPlaceSuggestions('Addis Ababa')[0];
  assert.equal(place.name, 'Addis Ababa');
  assert.equal(findPlaceSuggestions('አዲስ አበባ')[0].id, place.id);
  assert.equal(findKnownPlace(place.id)?.longitude, place.longitude);
  assert.equal(findKnownPlace('forged'), null);
  assert.ok(findPlaceSuggestions('Oromia').length <= 8);
  for (const query of ['', 'a', 'x'.repeat(81), '\u0000Addis', 'nonexistent place fixture']) assert.deepEqual(findPlaceSuggestions(query), []);
  const raw = { name: 'Place fixture', expectedVersion: 1, locationVersion: 0, category: 'electronics', city: 'Forged city', region: 'Forged region', mode: 'area', latitude: 8.123, longitude: 38.123, placeId: place.id };
  const parsed = parseOwnerBusinessChange(raw, findKnownPlace).location!;
  assert.equal(parsed.city, place.name); assert.equal(parsed.region, place.region);
  assert.equal(parsed.latitude, null); assert.equal(parsed.longitude, null);
  assert.equal(parsed.placeLatitude, place.latitude); assert.equal(parsed.placeLongitude, place.longitude);
  assert.throws(() => parseOwnerBusinessChange({ ...raw, placeId: 'forged' }, findKnownPlace), /Choose a city or town/);
  assert.equal(parseOwnerBusinessChange({ ...raw, placeId: '', city: 'Manual town', region: 'Manual region' }, findKnownPlace).location?.placeLatitude, null);
  const db = await getDb();
  try {
    const schema = (await db.prepare('SELECT current_schema() name').get()).name as string;
    assert.match(schema, /^suqpage_test_/);
    const businessId = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('place-fixture','Place fixture','composition','draft')").run()).insertedId);
    const userId = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES('place-owner@example.test','unused','Place owner','owner',?)").run(businessId)).insertedId);
    await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(userId);
    const owner = (await getUserById(userId))!;
    await db.prepare("INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,location_mode,updated_at) VALUES(?,1,'electronics','Retained town','Retained region','area',0)").run(businessId);
    const before = await db.prepare('SELECT * FROM owner_location_proposals').all();
    await db.runner.query('ALTER TABLE owner_location_proposals DROP CONSTRAINT owner_location_place_anchor_check, DROP COLUMN place_id, DROP COLUMN place_latitude, DROP COLUMN place_longitude; DELETE FROM schema_migrations WHERE version=47;');
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [47]);
    assert.deepEqual(await db.prepare('SELECT * FROM owner_location_proposals').all(), before);
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    await saveOwnerBusiness(owner, businessId, { ...raw, locationVersion: 1 });
    const after = await readOwnerBusiness(owner, businessId);
    assert.equal(after.proposal?.place_id, place.id);
    assert.equal(after.proposal?.place_latitude, place.latitude);
    assert.equal(after.proposal?.place_longitude, place.longitude);
    assert.equal(after.proposal?.latitude, null); assert.equal(after.proposal?.longitude, null);
    assert.equal(after.proposal?.city, place.name); assert.equal(after.proposal?.reviewed_version, after.proposal?.version);
    await assert.rejects(() => saveOwnerBusiness(owner, businessId, { ...raw, locationVersion: 1 }), /changed/);
    await assert.rejects(() => saveOwnerBusiness({ ...owner, business_id: businessId + 1 }, businessId, { ...raw, expectedVersion: 2, locationVersion: 2 }), /Business details are not available/);
    await assert.rejects(() => saveOwnerBusiness(owner, businessId, { ...raw, expectedVersion: 2, locationVersion: 2, placeId: 'forged' }), /Choose a city or town/);
    assert.deepEqual((await readOwnerBusiness(owner, businessId)).proposal, after.proposal);
    await assert.rejects(() => db.prepare('UPDATE owner_location_proposals SET place_latitude=NULL WHERE business_id=?').run(businessId), /owner_location_place_anchor_check/);
    console.log('PASS 781-place lookup, local names, bounded results, canonical anchors, preserved migration data, save/reload, stale/foreign/forged denial and general-area privacy.');
  } finally { await closeDbForTests(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
