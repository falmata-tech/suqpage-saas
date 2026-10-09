import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import type {SessionUser} from '../lib/types';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import {createStaffAccount,listTeamMembers} from '../lib/staff-operations';
import {hasCapability,canViewBusiness,canMaintainBasicProducts} from '../lib/capabilities';
import {listStaffPage,listTeamMemberChoices} from '../lib/scalable-queries';
import {handleMobileRequest} from '../lib/mobile/router';
import {canEditOwnerPage} from '../lib/owner-page-domain';
import {readOwnerPage} from '../lib/owner-page-service';
import {ownerPagePort} from '../lib/owner-page-runtime';
import {updateSupportAgentSetting} from '../lib/support';

async function main() {
const db=await getDb();
try {
 const inserted=await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('main-admin@example.test','unused','Test admin','admin')").run();
 await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(inserted.insertedId);
 const admin=(await runtimeUserById(inserted.insertedId))!;
 const created:SessionUser[]=[];
 for (const role of ['support_agent','transport_agent']) {
  const staff=await createStaffAccount({name:role,email:role+'@example.test',password:'StaffFixture123',accessRole:role},admin);
  const settings=await db.prepare('SELECT * FROM support_agent_settings WHERE user_id=?').get(staff.userId);
  assert.equal(settings.enabled,1);assert.equal(settings.max_open_conversations,3);
  assert.equal(settings.queue_scope,role==='support_agent'?'support':'transport');
  const principal=(await runtimeUserById(staff.userId))!;
  assert.equal(principal.staff_queue_scope,settings.queue_scope);
  for(const capability of ['platform:admin','operations:manage','basic-product:maintain','design-bank:view','client:workspace'] as const) assert.equal(hasCapability(principal,capability),false);
  assert.equal(canViewBusiness(principal,1,true),false);
  assert.equal(canMaintainBasicProducts(principal,1,true),false);
  assert.ok(!(await listTeamMembers()).some(u=>u.id===staff.userId));
  assert.ok(!(await listTeamMemberChoices('',staff.userId)).some(u=>u.id===staff.userId));
  const page=await listStaffPage({role});assert.equal(page.items.length,1);assert.equal(page.items[0].id,staff.userId);
  await assert.rejects(()=>updateSupportAgentSetting(admin,{userId:staff.userId,enabled:true,maxOpenConversations:3,queueScope:'all'}),/Choose Support agent or Transport agent/);
  created.push(principal);
 }
 const content={template:'profile-v1' as const,coverStyle:'overlay' as const,introduction:'Initial',about:'Initial',heroImage:'',videoUrl:''};
 const business=await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('staff-scope-page','Staff scope page','composition')").run();
 await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at) VALUES(?,1,?,1,?,?)').run(business.insertedId,JSON.stringify(content),admin.id,Date.now());
 const draft=(await ownerPagePort.read(business.insertedId))!;
 for(const staff of created){
  await db.prepare('INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,1)').run(staff.id,business.insertedId,admin.id);
  assert.equal(canEditOwnerPage(staff,business.insertedId,true,true),false);
  await assert.rejects(()=>readOwnerPage(ownerPagePort,staff,business.insertedId),/Page access/);
  assert.equal(await ownerPagePort.commit({...staff,staff_queue_scope:null},draft,{kind:'content',content:{...content,about:'Must not save'}}),null,'A stale generic-team principal cannot bypass current queue scope at commit');
  assert.deepEqual(await ownerPagePort.read(business.insertedId),draft);
 }
 const before=await db.prepare('SELECT COUNT(*) n FROM users').get();
 for(const role of ['team_member','operations_manager','platform_admin','client','garbage']) await assert.rejects(()=>createStaffAccount({name:'Denied',email:'denied@example.test',password:'StaffFixture123',accessRole:role},admin));
 await assert.rejects(()=>createStaffAccount({name:'Denied',email:'denied@example.test',password:'StaffFixture123',accessRole:'support_agent'},{...created[0],access_role:'platform_admin'}),/administrator access/);
 assert.deepEqual(await db.prepare('SELECT COUNT(*) n FROM users').get(),before);
 const identity=crypto.randomUUID(),token='verified_staff_bearer_1234567890';
 const legacyOp=(await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('legacy-operator@example.test','unused','Legacy operator','admin')").run()).insertedId;
 await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'operations_manager')").run(legacyOp);
 for(const staff of [admin,...created,(await runtimeUserById(legacyOp))!]) {
  const port={verify:async(t:string)=>t===token?{id:identity,email:staff.email}:null,linked:async()=>staff.id,user:runtimeUserById};
  for(const [path,body] of [['session',undefined],['owner/home',undefined],['signup',{}],['owner/business',{}],['owner/page',{}],['owner/support',{}],['owner/products',{}]] as const) {
   const response=await handleMobileRequest(new Request('http://localhost/api/mobile/v1/'+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,...(body===undefined?{}:{'content-type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)}),path.split('/'),{identity:port,invalidate(){}});
   assert.equal(response.status,403,`${staff.access_role} ${path}`);assert.equal((await response.json()).code,'staff_web_only');
  }
 }
 // A role change invalidates an old owner token immediately, without refreshing JWT claims.
 const owner=(await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('changed-owner@example.test','unused','Changed owner','owner')").run()).insertedId;
 await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(owner);
 const port={verify:async()=>({id:identity,email:'changed-owner@example.test'}),linked:async()=>owner,user:runtimeUserById};
 const call=()=>handleMobileRequest(new Request('http://localhost/api/mobile/v1/session',{headers:{Authorization:'Bearer '+token}}),['session'],{identity:port,invalidate(){}});
 assert.equal((await call()).status,200);
 await db.prepare("UPDATE user_access_profiles SET access_role='platform_admin' WHERE user_id=?").run(owner);
 assert.equal((await call()).status,403);
 await db.prepare('DELETE FROM user_access_profiles WHERE user_id=?').run(owner);
 assert.equal(await runtimeUserById(owner),undefined,'A missing access profile must never inherit legacy administrator authority');
 assert.equal((await call()).status,401);
 console.log('PASS admin-created support/transport roles, current principal scope, legacy-business exclusion, forged actor denial and all private mobile boundaries.');
} finally {await closeDbForTests();}

}
main().catch(error=>{console.error(error);process.exitCode=1;});
