import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import {postgresRuntimeServices} from '../lib/postgres-runtime-services';
import {createPostgresPool,PostgresTransactionRunner,postgresRuntimeConfig,type PostgresQueryResult} from '../lib/postgres-runtime';
import {TransportPlanError,parseTransportPlanSave,parseTransportPlanLegs,isTransportPlanCapability,transportPlanEtagMatches,type TransportPlanLegInput} from '../lib/transport-plan-contract';
import {readStaffTransportPlan,saveTransportPlan,replaceTransportPlanLink,readSharedTransportPlan} from '../lib/transport-plan';
import {hashPrivateValue} from '../lib/security';
import {getPublicSupportConversation,getSupportConversation,SupportError} from '../lib/support';
import {readOwnerTransport} from '../lib/owner-transport';
import type {SessionUser} from '../lib/types';

const leg=(method:TransportPlanLegInput['method']='truck'):TransportPlanLegInput=>({id:null,providerName:'Example provider',origin:'Origin',destination:'Destination',method});
const denied=(run:()=>Promise<unknown>,code:TransportPlanError['code'])=>assert.rejects(run,error=>error instanceof TransportPlanError&&error.code===code);
function pure(){
 const command={conversationId:1,publicRef:'SUP-S137',expectedVersion:0,legs:[{...leg(),providerName:'  አበባ   መጓጓዣ  ',origin:' Nairobi ',destination:'Addis Ababa'}]};
 assert.equal(parseTransportPlanSave(command).legs[0].providerName,'አበባ መጓጓዣ');
 for(const method of['air','truck','van','car','motorcycle']as const)assert.equal(parseTransportPlanLegs([leg(method)])[0].method,method);
 assert.equal(parseTransportPlanLegs(Array.from({length:12},()=>leg())).length,12);
 for(const invalid of[[],Array.from({length:13},()=>leg()),null,{}])assert.throws(()=>parseTransportPlanLegs(invalid),TransportPlanError);
 for(const invalid of[{...leg(),providerName:''},{...leg(),origin:'x\u0000'},{...leg(),origin:'x\u009b'},{...leg(),destination:'x'.repeat(121)},{...leg(),destination:' '.repeat(2001)},{...leg(),method:'ship'},{...leg(),contact:'private'},{...leg(),id:'not-a-uuid'}])assert.throws(()=>parseTransportPlanLegs([invalid]),TransportPlanError);
 const id=crypto.randomUUID();assert.throws(()=>parseTransportPlanLegs([{...leg(),id},{...leg(),id:id.toUpperCase()}]),TransportPlanError);
 assert.throws(()=>parseTransportPlanSave({...command,expectedVersion:'0'}),TransportPlanError);assert.throws(()=>parseTransportPlanSave({...command,privateNote:'not permitted'}),TransportPlanError);
 assert.equal(parseTransportPlanLegs([{...leg(),providerName:'<b>Literal & name</b>'}])[0].providerName,'<b>Literal & name</b>','Merchant/provider text is literal, never interpreted as markup');
 assert.ok(isTransportPlanCapability('a'.repeat(64)));for(const value of['A'.repeat(64),'a'.repeat(63),'a'.repeat(65),null,'SUP-S137'])assert.equal(isTransportPlanCapability(value),false);
 assert.equal(transportPlanEtagMatches('W/"transport-plan-1", "other"','"transport-plan-1"'),true);assert.equal(transportPlanEtagMatches('*','"transport-plan-1"'),true);
 console.log('PASS S137 pure fields/count/method/UUID/Unicode/unknown-key/capability and conditional contracts.');
}
async function main(){
 pure();if(process.argv.includes('--pure'))return;
 process.env.SUQPAGE_POSTGRES_POOL_MAX='2';
 const db=await getDb(),now=1_800_000_000_000;
 try{
  assert.match((await db.prepare('SELECT current_schema() value').get()).value,/^suqpage_test_[a-f0-9]{32}$/);
  const business=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('plan-a','Plan fixture','composition','active')").run()).insertedId;
  const otherBusiness=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('plan-b','Other fixture','composition','active')").run()).insertedId;
  async function actor(label:string,role:SessionUser['access_role'],scope?:string,businessId:number|null=null){
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused',?,'admin',?,0)").run(label+'@example.test',label,businessId)).insertedId;
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,0,?,?)').run(id,scope,now);
   return(await runtimeUserById(id))!;
  }
  const staff=await actor('plan-staff','team_member','transport'),other=await actor('plan-other','team_member','transport'),supportOnly=await actor('plan-support','team_member','support');
  const admin=await actor('plan-admin','platform_admin'),ops=await actor('plan-ops','operations_manager'),owner=await actor('plan-owner','client',undefined,business),foreign=await actor('plan-foreign','client',undefined,otherBusiness);
  async function request(ref:string,kind:'visitor'|'client'='visitor',category='shipment_observation',assigned=staff.id){
   const token=crypto.randomBytes(32).toString('hex');
   const id=(await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,visitor_token_hash,visitor_session_expires_at,
    assistance_category,requester_label,visitor_phone,subject,status,assigned_user_id,created_at,updated_at,last_message_at,closed_at,resolved_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,'closed',?,?,?,?,?,?)`).run(ref,kind,kind==='client'?business:null,kind==='client'?owner.id:null,kind==='visitor'?hashPrivateValue('public-support:'+token):null,kind==='visitor'?now+100000:null,
     category,'PRIVATE_REQUESTER','+447700900999','PRIVATE_GOODS',assigned,now-1000,now-900,now-800,now-700,now-600)).insertedId;
   await db.prepare("INSERT INTO support_assignments(conversation_id,assigned_user_id,reason,assigned_at,released_at) VALUES(?,?,'automatic',?,?)").run(id,assigned,now-1000,now-700);
   await db.prepare("INSERT INTO support_messages(conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,visitor_visible,sender_side) VALUES(?,?,'user',?,'PRIVATE_NOTE',?,?,FALSE,'staff')").run(id,staff.id,'user:'+staff.id,crypto.randomUUID(),now-800);
   await db.prepare("INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,'transport_handoff',?,?)").run(id,staff.id,JSON.stringify({company:'PRIVATE_COMPANY',contact:'PRIVATE_CONTACT'}),now-800);
   return{id,publicRef:ref,token};
  }
  const first=await request('SUP-S137-FIRST'),second=await request('SUP-S137-SECOND','client'),technical=await request('SUP-S137-TECHNICAL','client','general');
  const unchanged=async()=>({cases:await db.prepare('SELECT * FROM support_conversations ORDER BY id').all(),messages:await db.prepare('SELECT * FROM support_messages ORDER BY id').all(),assignments:await db.prepare('SELECT * FROM support_assignments ORDER BY id').all(),events:await db.prepare("SELECT * FROM support_events WHERE event_type NOT IN ('transport_plan_updated','transport_plan_link_replaced') ORDER BY id").all(),attention:await db.prepare('SELECT * FROM attention_notifications ORDER BY id').all()});
  const protectedBefore=await unchanged();
  assert.deepEqual(await readStaffTransportPlan(staff,first.id),{plan:null,sharePath:null});assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_transport_plans').get()).n,0,'GET never creates a plan/link');
  assert.equal(Object.hasOwn(await getPublicSupportConversation(first.token,now),'transportPlan'),false,'Old guest DTOs omit plan fields before an explicit save');
  assert.equal(Object.hasOwn((await getSupportConversation(owner,second.id)).conversation,'transportPlan'),false,'Old owner DTOs omit plan fields before an explicit save');
  const input={conversationId:first.id,publicRef:first.publicRef,expectedVersion:0,legs:[leg('air'),leg('van'),leg('motorcycle')]};
  const created=await saveTransportPlan(staff,input,now);assert.equal(created.plan.version,1);assert.equal(created.plan.legs.length,3);assert.match(created.sharePath,/^\/transport-plan#[a-f0-9]{64}$/);
  assert.equal(new Set(created.plan.legs.map(value=>value.id)).size,3);assert.deepEqual(await saveTransportPlan(staff,input,now+1),created,'Semantic retry creates no additional identities/link/version');
  assert.deepEqual(await readStaffTransportPlan(ops,first.id),created);assert.deepEqual(await saveTransportPlan(admin,{...input,expectedVersion:1,legs:created.plan.legs},now+2),created,'No-op save is stable');
  assert.equal((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE event_type='transport_plan_updated'").get()).n,1);
  for(const deniedActor of[owner,foreign,other,supportOnly]){
   await denied(()=>readStaffTransportPlan(deniedActor,first.id),'forbidden');await denied(()=>saveTransportPlan(deniedActor,{...input,expectedVersion:1,legs:created.plan.legs}),'forbidden');
   await denied(()=>replaceTransportPlanLink(deniedActor,{conversationId:first.id,publicRef:first.publicRef,expectedVersion:1}),'forbidden');
  }
  await denied(()=>saveTransportPlan(admin,{...input,conversationId:technical.id,publicRef:technical.publicRef}),'not_found');await denied(()=>saveTransportPlan(staff,{...input,publicRef:'SUP-WRONG'}),'not_found');
  await db.prepare("UPDATE support_agent_settings SET queue_scope='support' WHERE user_id=?").run(staff.id);
  await denied(()=>readStaffTransportPlan(staff,first.id),'forbidden');await denied(()=>saveTransportPlan(staff,{...input,expectedVersion:1,legs:created.plan.legs}),'forbidden');
  await denied(()=>replaceTransportPlanLink(staff,{conversationId:first.id,publicRef:first.publicRef,expectedVersion:1}),'forbidden');
  await db.prepare("UPDATE support_agent_settings SET queue_scope='transport' WHERE user_id=?").run(staff.id);
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(staff.id);await denied(()=>saveTransportPlan(staff,{...input,expectedVersion:1,legs:created.plan.legs}),'forbidden');await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(staff.id);
  const secondPlan=await saveTransportPlan(admin,{conversationId:second.id,publicRef:second.publicRef,expectedVersion:0,legs:[leg('car')]},now);
  await denied(()=>saveTransportPlan(staff,{...input,expectedVersion:1,legs:[{...leg(),id:secondPlan.plan.legs[0].id}]}),'invalid_request');
  const changed=await saveTransportPlan(staff,{...input,expectedVersion:1,legs:[{...created.plan.legs[2],providerName:'Renamed provider'},leg('truck'),created.plan.legs[0]]},now+3);
  assert.equal(changed.plan.version,2);assert.equal(changed.plan.legs[0].id,created.plan.legs[2].id);assert.equal(changed.plan.legs[2].id,created.plan.legs[0].id);assert.equal(changed.sharePath,created.sharePath,'Edits are live without link churn');
  const writes=await Promise.allSettled(['Concurrent A','Concurrent B'].map(providerName=>saveTransportPlan(staff,{...input,expectedVersion:2,legs:changed.plan.legs.map((value,index)=>index?value:{...value,providerName})},now+4)));
  assert.equal(writes.filter(value=>value.status==='fulfilled').length,1);const lost=writes.find(value=>value.status==='rejected')as PromiseRejectedResult;assert.ok(lost.reason instanceof TransportPlanError&&lost.reason.code==='conflict');
  const winner=(await readStaffTransportPlan(staff,first.id)).plan!;assert.equal(winner.version,3);assert.equal((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND event_type='transport_plan_updated'").get(first.id)).n,3);
  console.log('PASS S137 real PostgreSQL ended/resolved edit, stable identities/order, semantic retry/no-op, fresh roles/queues/tenants and concurrent stale-writer fencing.');

  // Prove fresh assignment authority after an independently committed row lock.
  const config=postgresRuntimeConfig(process.env)!;const pool=createPostgresPool({...config,poolMax:1}),independent=new PostgresTransactionRunner(pool);
  let unlock!:()=>void,locked!:()=>void;const gate=new Promise<void>(resolve=>unlock=resolve),held=new Promise<void>(resolve=>locked=resolve);
  const reassign=independent.transaction(async()=>{await independent.query('SELECT id FROM support_conversations WHERE id=? FOR UPDATE',[first.id]);await independent.query('UPDATE support_conversations SET assigned_user_id=? WHERE id=?',[other.id,first.id]);locked();await gate;});
  await held;const stale=saveTransportPlan(staff,{...input,expectedVersion:3,legs:winner.legs.map((value,index)=>index?value:{...value,providerName:'Rejected stale actor'})},now+5);
  await new Promise(resolve=>setTimeout(resolve,30));unlock();await reassign;await denied(()=>stale,'forbidden');await pool.end();
  await db.prepare('UPDATE support_conversations SET assigned_user_id=? WHERE id=?').run(staff.id,first.id);
  assert.deepEqual((await readStaffTransportPlan(staff,first.id)).plan,winner,'A reassignment race preserves the last saved plan');
  await db.exec(`CREATE FUNCTION fixture_reject_plan_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.event_type='transport_plan_updated' THEN RAISE EXCEPTION 'fixture plan audit rejected'; END IF; RETURN NEW; END $$;
   CREATE TRIGGER fixture_reject_plan_audit BEFORE INSERT ON support_events FOR EACH ROW EXECUTE FUNCTION fixture_reject_plan_audit()`);
  await assert.rejects(()=>saveTransportPlan(staff,{...input,expectedVersion:3,legs:[{...winner.legs[0],providerName:'Must roll back'}]},now+6),/fixture plan audit rejected/);
  assert.deepEqual((await readStaffTransportPlan(staff,first.id)).plan,winner);await db.exec('DROP TRIGGER fixture_reject_plan_audit ON support_events;DROP FUNCTION fixture_reject_plan_audit()');

  const token=created.sharePath.split('#')[1],shared=await readSharedTransportPlan(token);assert.equal(shared.kind,'plan');assert.deepEqual(shared.kind==='plan'?shared.plan:null,winner);
  // BE-058 retires anonymous/participant publication; retained schema70 plans stay private.
  const guestView=await getPublicSupportConversation(first.token,now);for(const key of['transportPlan','transportPlanLink'])assert.equal(Object.hasOwn(guestView,key),false);assert.ok(!JSON.stringify(guestView).includes('PRIVATE_NOTE'));
  const ownerView=await getSupportConversation(owner,second.id);for(const key of['transportPlan','transportPlanLink'])assert.equal(Object.hasOwn(ownerView.conversation,key),false);
  const ownerReceipt=await readOwnerTransport(owner,{conversation:second.id});assert.ok('conversation'in ownerReceipt);for(const key of['transportPlan','transportPlanLink'])assert.equal(Object.hasOwn(ownerReceipt.conversation||{},key),false);
  await assert.rejects(()=>getSupportConversation(foreign,second.id),error=>error instanceof SupportError&&error.code==='not_found');
  await denied(()=>readSharedTransportPlan(first.token),'not_found');await assert.rejects(()=>getPublicSupportConversation(token,now),error=>error instanceof SupportError&&error.code==='not_found');
  assert.ok(!JSON.stringify(shared).includes('PRIVATE_'));assert.deepEqual(Object.keys(shared).sort(),['etag','kind','plan']);if(shared.kind==='plan')assert.deepEqual(Object.keys(shared.plan).sort(),['legs','version']);
  const runner=postgresRuntimeServices().runner,originalQuery=runner.query,queries:string[]=[];
  runner.query=function<T extends Record<string,unknown>>(sql:string,values:readonly unknown[]=[]):Promise<PostgresQueryResult<T>>{queries.push(sql);return originalQuery.call(this,sql,values)as Promise<PostgresQueryResult<T>>;};
  try{assert.deepEqual(await readSharedTransportPlan(token,shared.etag),{kind:'not_modified',etag:shared.etag});}finally{runner.query=originalQuery;}
  assert.equal(queries.length,1,'304 uses only the validated capability/header read');assert.ok(!queries[0].includes('legs'),'An unchanged conditional read never fetches plan JSON');
  const privateRow=await db.prepare('SELECT share_nonce,share_token_hash FROM support_transport_plans WHERE conversation_id=?').get(first.id);assert.notEqual(privateRow.share_nonce,token);assert.notEqual(privateRow.share_token_hash,token);await denied(()=>readSharedTransportPlan(privateRow.share_nonce),'not_found');
  const replaced=await replaceTransportPlanLink(staff,{conversationId:first.id,publicRef:first.publicRef,expectedVersion:3},now+7);assert.equal(replaced.plan.version,4);assert.deepEqual(replaced.plan.legs,winner.legs);assert.notEqual(replaced.sharePath,created.sharePath);
  await denied(()=>readSharedTransportPlan(token,shared.etag),'not_found');await denied(()=>readSharedTransportPlan(token,'*'),'not_found');await denied(()=>replaceTransportPlanLink(staff,{conversationId:first.id,publicRef:first.publicRef,expectedVersion:3}),'conflict');
  const replacementToken=replaced.sharePath.split('#')[1];assert.equal((await readSharedTransportPlan(replacementToken)).kind,'plan');assert.deepEqual(await readStaffTransportPlan(staff,first.id),replaced,'Re-copy returns the existing capability without replacement');
  for(const value of[null,'SUP-S137-FIRST','a'.repeat(63),'0'.repeat(64)])await denied(()=>readSharedTransportPlan(value),'not_found');
  const audit=await db.prepare("SELECT actor_user_id,event_type,detail FROM support_events WHERE event_type IN ('transport_plan_updated','transport_plan_link_replaced') ORDER BY id").all();
  assert.equal(audit.length,5);for(const event of audit){assert.ok(event.actor_user_id);const detail=JSON.parse(event.detail);assert.deepEqual(Object.keys(detail).sort(),['legs','version']);for(const secret of[token,replacementToken,privateRow.share_nonce,privateRow.share_token_hash,'PRIVATE_'])assert.ok(!event.detail.includes(secret));}
  assert.deepEqual(await unchanged(),protectedBefore,'Plan edits, copies, conflict/rollback, sharing and ending-independent access change no chat/history/assignment/attention state');
  console.log('PASS S137 retained private compatibility: assignment-race fencing, audit rollback, internal minimal read/hash/304/rotation, no active guest/owner plan publication after S138, and unchanged private chat/history/attention.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
