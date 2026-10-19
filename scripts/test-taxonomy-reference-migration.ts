import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getDb, getUserById, closeDbForTests } from './testing/postgres-fixture';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { DISCOVERY_INDUSTRIES } from '../lib/discovery-contract';
import { createPostgresPublicClientWorkspace } from '../lib/signup-postgres';
import { SignupError } from '../lib/signup';
import { findPlaceSuggestions } from '../lib/place-catalog';
import { readOwnerBusiness, saveOwnerBusiness } from '../lib/owner-business-runtime';

async function main() {
  const db = await getDb();
  try {
    const schema = String((await db.prepare('SELECT current_schema() name').get()).name);
    assert.match(schema, /^suqpage_test_[a-f0-9]{32}$/);
    const taxonomy = () => db.prepare('SELECT * FROM discovery_industries ORDER BY key').all();
    const tables = (await db.prepare("SELECT tablename FROM pg_tables WHERE schemaname=current_schema() AND tablename NOT IN ('schema_migrations','discovery_industries') ORDER BY tablename").all()).map(row => String(row.tablename));
    const snapshot = async () => {
      const out: Record<string, unknown> = {};
      for (const table of tables) {
        assert.match(table, /^[a-z_]+$/);
        out[table] = await db.prepare(`SELECT COUNT(*)::integer total,md5(COALESCE(string_agg(h,'' ORDER BY h),'')) digest FROM(SELECT md5(to_jsonb(t)::text) h FROM ${table} t) rows`).get();
      }
      return out;
    };
    const permissions = () => db.prepare('SELECT c.relname,c.relrowsecurity,c.relacl::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=current_schema() ORDER BY c.relname').all();
    const freshTaxonomy = await taxonomy(), freshData = await snapshot();
    assert.deepEqual(freshTaxonomy.map(row => row.key).sort(), DISCOVERY_INDUSTRIES.map(row => row.key).sort());
    await db.exec('DELETE FROM schema_migrations WHERE version=74');
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [74]);
    assert.deepEqual(await taxonomy(), freshTaxonomy, 'An already complete fresh target has no reference-data delta.');
    assert.deepEqual(await snapshot(), freshData);
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);

    const business = (await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('taxonomy-retained','Retained tenant','composition','active')").run()).insertedId;
    await db.prepare("INSERT INTO products(business_id,name,slug,description) VALUES(?,'Retained product','retained-product','Retained product description')").run(business);
    await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'food-farming')").run(business);
    await db.prepare('INSERT INTO discovery_sponsorships(business_id,position,active,updated_at) VALUES(?,1,1,1)').run(business);
    await db.exec("DELETE FROM schema_migrations WHERE version=74; DELETE FROM discovery_industries WHERE key='agriculture-growers'; UPDATE discovery_industries SET position=position-1 WHERE position>2; UPDATE discovery_industries SET label='Retained custom title',icon='retained-icon' WHERE key='food-farming'");
    await db.prepare("INSERT INTO discovery_industries(key,label,icon,position,active) VALUES('retained-custom','Retained unknown category','custom-icon',2,0)").run();
    const before = await snapshot(), beforeTaxonomy = await taxonomy(), beforePermissions = await permissions();
    assert.equal(beforeTaxonomy.filter(row => row.key !== 'retained-custom').length, 6);
    const sentinel = Error('Rollback taxonomy74 fixture');
    const expected = [...beforeTaxonomy.map(row => {
      const canonical = DISCOVERY_INDUSTRIES.findIndex(category => category.key === row.key);
      return canonical < 0 ? row : { ...row, position: canonical };
    }), { key: 'agriculture-growers', label: 'Farms, livestock & feed', icon: 'sprout', position: 2, active: 1 }].sort((a, b) => a.key.localeCompare(b.key));
    await assert.rejects(() => db.runner.transaction(async () => {
      assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [74]);
      assert.deepEqual(await taxonomy(), expected);
      assert.deepEqual(await snapshot(), before);
      throw sentinel;
    }), error => error === sentinel);
    assert.deepEqual(await taxonomy(), beforeTaxonomy);
    assert.equal(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=74').get(), undefined);
    assert.deepEqual(await snapshot(), before);
    assert.deepEqual(await permissions(), beforePermissions);

    await db.prepare("UPDATE discovery_industries SET active=0 WHERE key='electronics'").run();
    const inactive = await taxonomy();
    await assert.rejects(() => migratePostgresDatabase(db.runner, schema), /requires existing canonical business categories to be active/);
    assert.deepEqual(await taxonomy(), inactive, 'An intentionally inactive known key is not reactivated.');
    assert.equal(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=74').get(), undefined);
    await db.prepare("UPDATE discovery_industries SET active=1 WHERE key='electronics'").run();
    for (const mutation of [
      'ALTER TABLE discovery_industries ALTER COLUMN position TYPE INTEGER',
      'ALTER TABLE discovery_industries DROP CONSTRAINT ck_discovery_industries_1',
      'ALTER TABLE discovery_industries ALTER COLUMN label DROP NOT NULL',
    ]) {
      await assert.rejects(() => db.runner.transaction(async () => {
        await db.exec(mutation);
        await assert.rejects(() => migratePostgresDatabase(db.runner, schema), /requires the reviewed business-category reference schema/);
        assert.deepEqual(await taxonomy(), beforeTaxonomy);
        assert.equal(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=74').get(), undefined);
        throw sentinel;
      }), error => error === sentinel);
    }

    const place = findPlaceSuggestions('Addis Ababa')[0];
    const signup = { name: 'Farm fixture owner', phone: '+447700900999', businessName: 'Farm fixture', businessCategory: 'agriculture-growers', placeId: place.id, idempotencyKey: crypto.randomUUID(), consent: true };
    const identity = { providerUserId: crypto.randomUUID(), email: 'farm-taxonomy@example.test' };
    const originalQuery = db.runner.query.bind(db.runner);
    let missingReferenceForeignKey = false;
    try {
      db.runner.query = async function<T extends Record<string, unknown>>(sql: string, values: readonly unknown[] = []) {
        try { return await originalQuery<T>(sql, values); }
        catch (error) {
          if (sql.includes('INSERT INTO business_industries') && error instanceof Error && 'code' in error && error.code === '23503') missingReferenceForeignKey = true;
          throw error;
        }
      };
      await assert.rejects(() => createPostgresPublicClientWorkspace(db.runner, signup, identity), error => error instanceof SignupError && error.code === 'unexpected');
    } finally { db.runner.query = originalQuery; }
    assert.equal(missingReferenceForeignKey, true, 'The actual signup/starter path reaches the missing farm reference FK.');
    assert.deepEqual(await snapshot(), before, 'Failed signup rolls back all business/account/product/assignment writes.');
    assert.deepEqual(await taxonomy(), beforeTaxonomy);

    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [74]);
    assert.deepEqual(await taxonomy(), expected, 'Only the missing canonical key and four known positions change.');
    assert.deepEqual(await snapshot(), before, 'Every other existing table row, tenant/product assignment and sponsor is unchanged.');
    assert.deepEqual(await permissions(), beforePermissions, 'Reference correction does not alter RLS/ACLs.');
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    assert.deepEqual(await taxonomy(), expected);
    const created = await createPostgresPublicClientWorkspace(db.runner, signup, identity);
    assert.deepEqual(await db.prepare('SELECT industry_key FROM business_industries WHERE business_id=?').all(created.businessId), [{ industry_key: 'agriculture-growers' }]);
    assert.equal((await db.prepare('SELECT COUNT(*)::integer total FROM products WHERE business_id=?').get(created.businessId)).total, 3);
    assert.equal(await db.prepare('SELECT 1 FROM business_subscriptions WHERE business_id=?').get(created.businessId), undefined);
    const other = await createPostgresPublicClientWorkspace(db.runner, { ...signup, businessName: 'Other owner fixture', businessCategory: 'electronics', idempotencyKey: crypto.randomUUID() }, { providerUserId: crypto.randomUUID(), email: 'other-taxonomy@example.test' });
    const actor = (await getUserById(created.userId))!, otherActor = (await getUserById(other.userId))!;
    const state = await readOwnerBusiness(otherActor, other.businessId);
    const command = { name: state.business.name, expectedVersion: state.business.content_version, locationVersion: state.proposal?.version || 0, category: 'agriculture-growers', countryCode: place.countryCode, placeId: place.id, city: place.name, region: place.region, mode: 'area' };
    const beforeForeign = await snapshot();
    await assert.rejects(() => saveOwnerBusiness(actor, other.businessId, command), /Business details are not available/);
    assert.deepEqual(await snapshot(), beforeForeign);
    await saveOwnerBusiness(otherActor, other.businessId, command);
    assert.deepEqual(await db.prepare('SELECT industry_key FROM business_industries WHERE business_id=?').all(other.businessId), [{ industry_key: 'agriculture-growers' }]);
    const afterOwner = await snapshot();
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    assert.deepEqual(await snapshot(), afterOwner);
    assert.deepEqual(await taxonomy(), expected);
    console.log('PASS BE-059 taxonomy74: exact one-reference/four-position repair; all other data/unknown labels/icons/assignments/ACLs preserved; fresh no-op, rollback/replay, inactive/schema refusal, real farm FK-before/signup-after and owner tenant denial.');
  } finally { await closeDbForTests(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
