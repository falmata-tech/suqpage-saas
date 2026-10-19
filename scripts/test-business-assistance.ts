import assert from 'node:assert/strict';
import { getDb,closeDbForTests } from './testing/postgres-fixture';
import { runtimeUserById } from '../lib/catalog-runtime';
import { listBusinessAssignmentCandidates,setBusinessAssignment } from '../lib/business-assistance';
import { currentBusinessAuthority,currentStaffBusinessGrant } from '../lib/staff-business-authority';
import { getStaffAccount,getStaffBusinessGrant,setStaffBusinessGrant,StaffOperationError } from '../lib/staff-operations';
import { readOwnerPage } from '../lib/owner-page-service';
import { ownerPagePort } from '../lib/owner-page-runtime';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { readOwnerBusiness,saveOwnerBusiness } from '../lib/owner-business-runtime';
import type { SessionUser } from '../lib/types';

async function main(){
 const db=await getDb();
 try{
  const businessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('grant-fixture','Grant fixture','composition')").run()).insertedId);
  const otherBusinessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('grant-other','Other fixture','composition')").run()).insertedId);
  async function account(name:string,role:SessionUser['access_role'],withGrant=false,scope?:'support'|'transport'){
   const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused',?,'admin',?)").run(name+'@example.test',name,role==='client'?businessId:null)).insertedId);
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(withGrant)await db.prepare('INSERT INTO staff_business_grants(user_id,enabled,version,updated_at) VALUES(?,1,1,1)').run(id);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,updated_by_user_id,updated_at,queue_scope) VALUES(?,1,?,1,?)').run(id,id,scope);
   return (await runtimeUserById(id))!;
  }
  const admin=await account('Admin','platform_admin');
  const owner=await account('Owner','client');
  const support=await account('Support','team_member',true,'support');
  const transport=await account('Transport','team_member',true,'transport');
  const operator=await account('Operator','operations_manager',true);
  const noGrant=await account('No grant','team_member');
  const content={template:'profile-v1' as const,coverStyle:'overlay' as const,introduction:'Initial',about:'Initial',heroImage:'',videoUrl:''};
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at) VALUES(?,1,?,0,?,1)').run(businessId,JSON.stringify(content),owner.id);
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at) VALUES(?,1,?,0,?,1)').run(otherBusinessId,JSON.stringify(content),admin.id);
  for(const staff of [support,transport,operator]){
   assert.equal(await currentBusinessAuthority(staff,businessId),'staff');
   assert.equal(await currentBusinessAuthority(staff,otherBusinessId),'staff');
   assert.equal(await currentStaffBusinessGrant(staff),true);
   assert.ok(await readOwnerPage(ownerPagePort,staff,businessId),'Owner consent and queue role do not block granted staff');
   assert.ok(await readOwnerPage(ownerPagePort,staff,otherBusinessId));
  }
  assert.equal(await currentBusinessAuthority(owner,businessId),'owner');
  assert.equal(await currentBusinessAuthority(owner,otherBusinessId),null);
  assert.equal(await currentBusinessAuthority(admin,otherBusinessId),'administrator');
  assert.equal(await currentBusinessAuthority(noGrant,businessId),null,'A missing persisted grant fails closed');
  assert.equal(await currentStaffBusinessGrant(noGrant),false);
  assert.equal((await readOwnerBusiness(support,businessId)).business.name,'Grant fixture');
  await saveOwnerBusiness(support,businessId,{name:'Staff-maintained fixture',expectedVersion:1,locationVersion:0});
  assert.equal((await readOwnerBusiness(owner,businessId)).business.name,'Staff-maintained fixture');
  await assert.rejects(()=>readOwnerBusiness(owner,otherBusinessId),/Business details are not available/);

  // Historical business assignments and owner consent are retained data, never
  // a source of current authority. The old per-business API is gone.
  await db.prepare('INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,1)').run(noGrant.id,businessId,admin.id);
  await db.prepare('UPDATE owner_page_drafts SET assistance_enabled=1 WHERE business_id=?').run(businessId);
  assert.equal(await currentBusinessAuthority(noGrant,businessId),null);
  await assert.rejects(()=>readOwnerPage(ownerPagePort,noGrant,businessId),/Page access/);
  await assert.rejects(()=>listBusinessAssignmentCandidates(admin,businessId),/retired/);
  await assert.rejects(()=>setBusinessAssignment(admin,businessId,noGrant.id,true),/retired/);

  const before=await getStaffBusinessGrant(admin,support.id);
  assert.equal((await getStaffAccount(admin,support.id)).queue_scope,'support');
  assert.deepEqual({enabled:before.enabled,version:before.version},{enabled:true,version:1});
  const revoked=await setStaffBusinessGrant(admin,support.id,false,before.version);
  assert.deepEqual({enabled:revoked.enabled,version:revoked.version},{enabled:false,version:2});
  assert.equal(await currentBusinessAuthority(support,businessId),null);
  assert.equal(await currentStaffBusinessGrant(support),false);
  await assert.rejects(()=>readOwnerPage(ownerPagePort,support,businessId),/Page access/);
  await assert.rejects(()=>saveOwnerBusiness(support,businessId,{name:'Revoked edit',expectedVersion:2,locationVersion:0}),/Business details are not available/);
  assert.equal(await currentBusinessAuthority(transport,businessId),'staff','Revoking one staff member does not affect peers');
  await assert.rejects(()=>setStaffBusinessGrant(admin,support.id,true,before.version),(error)=>error instanceof StaffOperationError&&error.code==='stale_version');
  const restored=await setStaffBusinessGrant(admin,support.id,true,revoked.version);
  assert.equal(restored.enabled,true);
  assert.equal(await currentBusinessAuthority(support,businessId),'staff');
  assert.equal((await setStaffBusinessGrant(admin,support.id,true,restored.version)).version,restored.version,'Idempotent save does not create audit churn');

  await db.exec(`CREATE FUNCTION reject_grant_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture grant audit unavailable'; END $$;
    CREATE TRIGGER reject_grant_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_grant_audit()`);
  await assert.rejects(()=>setStaffBusinessGrant(admin,transport.id,false,1),/fixture grant audit unavailable/);
  assert.deepEqual({enabled:(await getStaffBusinessGrant(admin,transport.id)).enabled,version:(await getStaffBusinessGrant(admin,transport.id)).version},
    {enabled:true,version:1},'Audit failure rolls back permission and version together');
  await db.exec('DROP TRIGGER reject_grant_audit ON audit_logs; DROP FUNCTION reject_grant_audit()');
  const race=await Promise.allSettled([
    setStaffBusinessGrant(admin,transport.id,false,1),
    setStaffBusinessGrant(admin,transport.id,false,1),
  ]);
  assert.equal(race.filter(result=>result.status==='fulfilled').length,1,'Only one versioned administrator write can win');
  assert.equal((await getStaffBusinessGrant(admin,transport.id)).version,2);

  for(const target of [owner,admin])await assert.rejects(()=>getStaffBusinessGrant(admin,target.id),(error)=>error instanceof StaffOperationError&&error.code==='not_found');
  for(const actor of [owner,support,{...support,access_role:'platform_admin' as const}]){
   await assert.rejects(()=>getStaffAccount(actor,transport.id),(error)=>error instanceof StaffOperationError&&error.code==='forbidden');
   await assert.rejects(()=>getStaffBusinessGrant(actor,transport.id),(error)=>error instanceof StaffOperationError&&error.code==='forbidden');
   await assert.rejects(()=>setStaffBusinessGrant(actor,transport.id,false,1),(error)=>error instanceof StaffOperationError&&error.code==='forbidden');
  }
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(support.id);
  assert.equal(await currentBusinessAuthority(support,businessId),null,'A stale staff session does not survive a role change');
  await assert.rejects(()=>setStaffBusinessGrant(admin,support.id,false,restored.version),(error)=>error instanceof StaffOperationError&&error.code==='not_found');

  // Replay only migration 76 in this disposable schema to prove that existing
  // staff are granted access by default when the hosted schema is upgraded.
  const schema=String((await db.prepare('SELECT current_schema() name').get()).name);
  assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
  await db.exec('DROP TABLE staff_business_grants');
  await db.prepare('DELETE FROM schema_migrations WHERE version=76').run();
  const replay=await migratePostgresDatabase(db.runner,schema);
  assert.deepEqual(replay.applied,[76]);
  const migrated=await db.prepare(`SELECT p.user_id,g.enabled,g.version FROM user_access_profiles p
    JOIN staff_business_grants g ON g.user_id=p.user_id
    WHERE p.access_role IN ('team_member','operations_manager') ORDER BY p.user_id`).all();
  assert.deepEqual(migrated.map(row=>[Number(row.user_id),Number(row.enabled),Number(row.version)]),
    [transport,operator,noGrant].sort((a,b)=>a.id-b.id).map(row=>[row.id,1,1]));
  assert.equal((await db.prepare("SELECT relrowsecurity enabled FROM pg_class WHERE oid='staff_business_grants'::regclass").get()).enabled,true);
  const runtimeRoles=await db.prepare("SELECT rolname FROM pg_roles WHERE rolname IN ('suqpage_runtime','mirtpage_runtime')").all();
  for(const {rolname} of runtimeRoles){
    const privilege=await db.prepare('SELECT has_table_privilege(?, ?, ?) allowed').get(rolname,`${schema}.staff_business_grants`,'SELECT,INSERT,UPDATE,DELETE');
    assert.equal(privilege.allowed,true,`${rolname} can use the new grant table`);
  }
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(admin.id);
  await assert.rejects(()=>setStaffBusinessGrant(admin,transport.id,false,1),
    (error)=>error instanceof StaffOperationError&&error.code==='forbidden');
  console.log('PASS versioned admin staff grants, global showroom authority, immediate revocation, historical data inertness, and migration-76 backfill/RLS.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
