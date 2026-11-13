import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getDb, closeDbForTests, seedFixture } from './testing/postgres-fixture';
import { migratePostgresDatabase } from '../lib/postgres-migrations';

const names=[
  'deny_public_request_attachment','deny_attached_request_becoming_public',
  'enforce_category_collection_business','enforce_product_collection_business',
  'enforce_product_category_business','enforce_inquiry_item_business',
  'enforce_delivery_inquiry_business','enforce_submitted_revision_immutable',
  'enforce_support_visitor_contact',
];

async function main(){
  // getDb admits only isolated loopback/CI targets and owns its random schema.
  const db=await getDb();
  const createdRoles:string[]=[];
  const retainedRole=`security_test_${crypto.randomBytes(8).toString('hex')}`;
  try{
    const schema=String((await db.prepare('SELECT current_schema() name').get()).name);
    assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
    await seedFixture();
    for(const role of ['anon','authenticated',retainedRole]){
      if(!(await db.runner.query('SELECT 1 FROM pg_roles WHERE rolname=?',[role])).rows.length){
        await db.runner.query(`CREATE ROLE "${role}" NOLOGIN`);
        createdRoles.push(role);
      }
    }
    const routines=()=>db.runner.query<{oid:number;proname:string;prosrc:string;proowner:number;prosecdef:boolean;proconfig:string[]|null}>(
      'SELECT oid,proname,prosrc,proowner,prosecdef,proconfig FROM pg_proc WHERE pronamespace=current_schema()::regnamespace AND proname=ANY(?::text[]) ORDER BY proname',[names],
    ).then(result=>result.rows);
    const fingerprints=async()=>crypto.createHash('sha256').update(JSON.stringify([
      await db.prepare('SELECT * FROM businesses ORDER BY id').all(),
      await db.prepare('SELECT * FROM products ORDER BY id').all(),
    ])).digest('hex');
    const retainedAcl=()=>db.prepare(`SELECT c.oid,a.grantee,a.grantor,a.privilege_type,a.is_grantable
      FROM pg_class c CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl,acldefault(CASE WHEN c.relkind='S' THEN 'S'::"char" ELSE 'r'::"char" END,c.relowner))) a
      WHERE c.relnamespace=current_schema()::regnamespace AND c.relkind IN ('r','p','S','v','m','f')
        AND a.grantee<>0 AND a.grantee NOT IN (SELECT oid FROM pg_roles WHERE rolname IN ('anon','authenticated'))
      ORDER BY c.oid,a.grantee,a.grantor,a.privilege_type,a.is_grantable`).all();
    // Recreate the retained schema80 problem, including sequence and PUBLIC grants.
    await db.runner.query('DELETE FROM schema_migrations WHERE version=81');
    for(const name of names)await db.runner.query(`ALTER FUNCTION "${schema}"."${name}"() RESET search_path`);
    await db.runner.query(`ALTER FUNCTION "${schema}"."${names[0]}"() SET work_mem='64kB'`);
    await db.runner.query(`GRANT SELECT,INSERT,UPDATE ON "${schema}".businesses TO "${retainedRole}"`);
    await db.runner.query(`GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA "${schema}" TO "${retainedRole}"`);
    for(const role of ['PUBLIC','"anon"','"authenticated"']){
      await db.runner.query(`GRANT ALL ON "${schema}".businesses TO ${role}`);
      await db.runner.query(`GRANT ALL ON ALL SEQUENCES IN SCHEMA "${schema}" TO ${role}`);
    }
    const before=await routines(), data=await fingerprints(),acl=await retainedAcl();
    assert.equal(before.length,9);
    assert.ok(before.every(row=>!row.proconfig?.some(setting=>setting.startsWith('search_path='))));
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[81]);
    const after=await routines();
    assert.deepEqual(after.map(({proconfig,...row})=>row),before.map(({proconfig,...row})=>row),'Function identity, owner, body and invoker mode are preserved.');
    for(const [index,row] of after.entries()){
      assert.ok(row.proconfig?.includes('search_path=""'),'Each target has an empty fixed path.');
      assert.deepEqual(row.proconfig?.filter(value=>!value.startsWith('search_path=')),before[index].proconfig||[],'Other function settings are preserved.');
    }
    assert.deepEqual(await retainedAcl(),acl,'Every non-target table/sequence grant is retained.');
    const apiGrants=await db.prepare(`SELECT c.relname,a.privilege_type FROM pg_class c
      CROSS JOIN LATERAL aclexplode(c.relacl) a
      WHERE c.relnamespace=current_schema()::regnamespace AND c.relkind IN ('r','p','S','v','m','f')
        AND (a.grantee=0 OR a.grantee IN (SELECT oid FROM pg_roles WHERE rolname IN ('anon','authenticated')))` ).all();
    assert.deepEqual(apiGrants,[],'API roles and PUBLIC retain no direct table or sequence grants.');
    for(const role of ['anon','authenticated']){
      assert.equal((await db.runner.query<{allowed:boolean}>(`SELECT has_table_privilege(?,?,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES') allowed`,[role,`${schema}.businesses`])).rows[0].allowed,false);
    }
    assert.equal(await fingerprints(),data,'Seeded business and product data is unchanged.');
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[],'Repeat application is inert.');
    assert.deepEqual(await routines(),after);
    assert.deepEqual(await retainedAcl(),acl);
    // Unexpected function security must abort the transaction before correction.
    await db.runner.query('DELETE FROM schema_migrations WHERE version=81');
    await db.runner.query(`ALTER FUNCTION "${schema}"."${names[0]}"() SECURITY DEFINER`);
    const unexpected=await routines();
    await assert.rejects(()=>migratePostgresDatabase(db.runner,schema),/reviewed nine invoker trigger functions/);
    assert.deepEqual(await routines(),unexpected);
    assert.equal((await db.prepare('SELECT COUNT(*) total FROM schema_migrations WHERE version=81').get()).total,0);
    assert.equal(await fingerprints(),data);
    console.log('PASS migration81: fixed paths, API grant denial, retained identities/settings/runtime ACLs/data, idempotence and atomic rejection.');
  }finally{
    // Revoke fixture grants and remove only the disposable roles created here.
    const runner=db.runner;
    for(const role of createdRoles)await runner.query(`DROP OWNED BY "${role}"`);
    for(const role of createdRoles)await runner.query(`DROP ROLE "${role}"`);
    await closeDbForTests();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
