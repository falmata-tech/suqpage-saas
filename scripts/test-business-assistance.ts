import assert from 'node:assert/strict';
import { getDb,closeDbForTests } from './testing/postgres-fixture';
import { runtimeUserById } from '../lib/catalog-runtime';
import { listBusinessAssignmentCandidates,setBusinessAssignment } from '../lib/business-assistance';
import { canEditOwnerPage } from '../lib/owner-page-domain';
import { readOwnerPage } from '../lib/owner-page-service';
import { ownerPagePort } from '../lib/owner-page-runtime';
import type { SessionUser } from '../lib/types';

async function main(){
 const db=await getDb();
 try{
  const businessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('assistance-fixture','Assistance fixture','composition')").run()).insertedId);
  const otherBusinessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('assistance-other','Other assistance fixture','composition')").run()).insertedId);
  async function account(name:string,role:SessionUser['access_role'],scope?:'all'|'support'|'transport'){
   const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused',?,'admin',?)").run(name+'@example.test',name,role==='client'?businessId:null)).insertedId);
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,updated_by_user_id,updated_at,queue_scope) VALUES(?,1,?,1,?)').run(id,id,scope);
   return (await runtimeUserById(id))!;
  }
  const admin=await account('Admin','platform_admin'),legacy=await account('Legacy','team_member'),legacyAll=await account('Legacy all','team_member','all'),support=await account('Support','team_member','support'),transport=await account('Transport','team_member','transport'),owner=await account('Owner','client'),operator=await account('Operator','operations_manager');
  const initial=await listBusinessAssignmentCandidates(admin,businessId);
  assert.deepEqual(initial.items.map(row=>row.id).sort((a,b)=>a-b),[legacy.id,legacyAll.id].sort((a,b)=>a-b));
  assert.ok(initial.items.every(row=>row.canAssign&&!row.active));
  const assignments=()=>db.prepare('SELECT user_id,business_id,active FROM staff_business_assignments ORDER BY user_id,business_id').all();
  const audits=()=>db.prepare("SELECT COUNT(*) count FROM audit_logs WHERE action IN ('business.staff_assigned','business.staff_revoked')").get();
  const before=await assignments(),auditBefore=await audits();
  for(const agent of [support,transport,owner,operator])await assert.rejects(()=>setBusinessAssignment(admin,businessId,agent.id,true),/page-editing access/);
  for(const actor of [legacy,owner,operator,{...support,access_role:'platform_admin' as const}]){
   await assert.rejects(()=>setBusinessAssignment(actor,businessId,legacy.id,true),/Administrator access/);
   await assert.rejects(()=>listBusinessAssignmentCandidates(actor,businessId),/Administrator access/);
  }
  await assert.rejects(()=>setBusinessAssignment(admin,businessId,legacy.id,false),/assignment not found/);
  await assert.rejects(()=>setBusinessAssignment(admin,0,legacy.id,true));
  await assert.rejects(()=>setBusinessAssignment(admin,businessId,999999999,true),/not found/);
  await assert.rejects(()=>setBusinessAssignment(admin,999999999,legacy.id,true),/not found/);
  assert.deepEqual(await assignments(),before,'Rejected role, scope and identifier grants do not fabricate associations');
  assert.deepEqual(await audits(),auditBefore,'Rejected grants do not claim an audit success');

  await setBusinessAssignment(admin,businessId,legacy.id,true);
  assert.equal((await listBusinessAssignmentCandidates(admin,businessId,{q:'Legacy'})).totalItems,2);
  assert.equal((await listBusinessAssignmentCandidates(admin,businessId,{q:'Legacy all'})).items[0].id,legacyAll.id);
  const content={template:'profile-v1' as const,coverStyle:'overlay' as const,introduction:'Initial',about:'Initial',heroImage:'',videoUrl:''};
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at) VALUES(?,1,?,0,?,1)').run(businessId,JSON.stringify(content),owner.id);
  assert.equal(canEditOwnerPage(legacy,businessId,false,true),false);
  await assert.rejects(()=>readOwnerPage(ownerPagePort,legacy,businessId),/Page access/);
  await db.prepare('UPDATE owner_page_drafts SET assistance_enabled=1 WHERE business_id=?').run(businessId);
  assert.ok(await readOwnerPage(ownerPagePort,legacy,businessId),'An eligible assignment still requires independent owner consent');

  // Only this disposable fixture has legacy scoped associations. The listing
  // preserves them as history, without offering a new grant or changing access.
  await db.prepare('INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,1),(?,?,?,1)').run(support.id,businessId,admin.id,transport.id,otherBusinessId,admin.id);
  const historical=await listBusinessAssignmentCandidates(admin,businessId,{q:'Support'});
  assert.equal(historical.totalItems,1);assert.equal(historical.items[0].active,1);assert.equal(historical.items[0].canAssign,false);
  assert.equal((await listBusinessAssignmentCandidates(admin,businessId,{q:'Transport'})).totalItems,0,'A scoped association for another business does not appear here');
  assert.equal((await assignments()).find(row=>row.user_id===support.id)?.active,1,'Reading history never silently revokes it');
  assert.equal(canEditOwnerPage(support,businessId,true,true),false);
  await assert.rejects(()=>readOwnerPage(ownerPagePort,support,businessId),/Page access/);
  await setBusinessAssignment(admin,businessId,support.id,false);
  const revoked=await listBusinessAssignmentCandidates(admin,businessId,{q:'Support'});
  assert.equal(revoked.items[0].active,0);assert.equal(revoked.items[0].canAssign,false);
  await assert.rejects(()=>setBusinessAssignment(admin,businessId,support.id,true),/page-editing access/);
  assert.equal((await assignments()).find(row=>row.user_id===support.id)?.active,0,'Reactivation stays denied; retained history is not deleted');

  // An earlier candidate snapshot cannot grant access after its saved role or
  // scope changes. Explicit revocation still works for the historical record.
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(legacy.id);
  await assert.rejects(()=>setBusinessAssignment(admin,businessId,legacy.id,true),/page-editing access/);
  assert.equal((await listBusinessAssignmentCandidates(admin,businessId,{q:'Legacy'})).items.find(row=>row.id===legacy.id)?.canAssign,false);
  await setBusinessAssignment(admin,businessId,legacy.id,false);
  await db.prepare("UPDATE support_agent_settings SET queue_scope='transport' WHERE user_id=?").run(legacyAll.id);
  await assert.rejects(()=>setBusinessAssignment(admin,businessId,legacyAll.id,true),/page-editing access/);
  assert.equal((await listBusinessAssignmentCandidates(admin,businessId,{q:'Legacy all'})).totalItems,0);

  await db.prepare("UPDATE support_agent_settings SET queue_scope='all' WHERE user_id=?").run(legacyAll.id);
  const stable=await assignments(),stableAudits=await audits();
  await db.exec(`CREATE FUNCTION reject_assignment_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture assignment audit unavailable'; END $$; CREATE TRIGGER reject_assignment_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_assignment_audit()`);
  await assert.rejects(()=>setBusinessAssignment(admin,businessId,legacyAll.id,true),/fixture assignment audit unavailable/);
  assert.deepEqual(await assignments(),stable,'Failed audit rolls back the corresponding access grant');assert.deepEqual(await audits(),stableAudits);
  await db.exec('DROP TRIGGER reject_assignment_audit ON audit_logs; DROP FUNCTION reject_assignment_audit()');
  await setBusinessAssignment(admin,businessId,legacyAll.id,true);await setBusinessAssignment(admin,businessId,legacyAll.id,false);
  assert.equal((await assignments()).find(row=>row.user_id===legacyAll.id)?.active,0);
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(admin.id);
  await assert.rejects(()=>setBusinessAssignment(admin,businessId,legacyAll.id,true),/Administrator access/);
  await assert.rejects(()=>listBusinessAssignmentCandidates(admin,businessId),/Administrator access/);
  console.log('PASS isolated PostgreSQL business-assistance eligible candidates, scope/role/tenant denial, fresh authority, historical association/revoke, owner consent and atomic audit rollback.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
