import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import type {SessionUser} from '../lib/types';
import {createSupportConversation,createPublicSupportConversation,getSupportConversation,postSupportMessage,reassignSupportConversation,routeWaitingSupportConversations,updateSupportAgentSetting} from '../lib/support';

async function main(){
 const db=await getDb();delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 try{
  const business=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('recovery-fixture','Recovery fixture','composition','active')").run()).insertedId);
  async function actor(name:string,accessRole:SessionUser['access_role'],businessId:number|null=null){const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused',?,'admin',?,0)").run(name+'@example.test',name,businessId)).insertedId);await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,accessRole);return (await runtimeUserById(id))!;}
  const admin=await actor('Recovery manager','platform_admin'),owner=await actor('Recovery owner','client',business),agent=await actor('Recovery support agent','team_member'),dispatcher=await actor('Recovery transport agent','team_member');
  await updateSupportAgentSetting(admin,{userId:agent.id,enabled:true,queueScope:'support'});await updateSupportAgentSetting(admin,{userId:dispatcher.id,enabled:false,queueScope:'transport'});
  const held=await createSupportConversation(owner,{subject:'Manual hold',message:'Keep waiting deliberately',idempotencyKey:crypto.randomUUID()});await reassignSupportConversation(admin,held.id,null);
  await postSupportMessage(owner,held.id,{message:'Participant follow-up does not clear a manager hold',idempotencyKey:crypto.randomUUID()});
  await updateSupportAgentSetting(admin,{userId:agent.id,enabled:false,queueScope:'support'});
  const createdAt=Date.now();const waiting=[];for(const offset of [30,10,20])waiting.push(await createSupportConversation(owner,{subject:'Waiting '+offset,message:'Recover this unassigned case',idempotencyKey:crypto.randomUUID()},createdAt+offset));
  const transport=await createPublicSupportConversation({category:'shipment_observation',name:'Recovery visitor',phone:'+447700900119',origin:'Local pickup',destination:'Local destination',idempotencyKey:crypto.randomUUID()},'recovery-fixture');
  assert.equal((await getSupportConversation(admin,transport.id)).conversation.assignedUserId,null);
  await db.prepare('UPDATE support_agent_settings SET enabled=1 WHERE user_id IN (?,?)').run(agent.id,dispatcher.id);
  const decision={queue:'support' as const};
  const recovered=await Promise.all([routeWaitingSupportConversations(admin,Date.now(),decision),routeWaitingSupportConversations(admin,Date.now(),decision)]);
  assert.equal(recovered.reduce((sum,value)=>sum+value.routed,0),4);assert.ok(recovered.every(value=>value.remaining===0));
  assert.equal((await getSupportConversation(admin,held.id)).conversation.status,'open');assert.equal((await getSupportConversation(admin,held.id)).conversation.assignedUserId,agent.id,'S121 manual unassignment rejoins the ordinary automatic queue');assert.equal((await getSupportConversation(admin,transport.id)).conversation.status,'waiting','Support recovery never routes transport work');
  const order=await db.prepare('SELECT conversation_id FROM support_assignments WHERE conversation_id IN (?,?,?) ORDER BY id').all(...waiting.map(value=>value.id));assert.deepEqual(order.map(row=>row.conversation_id),[waiting[1].id,waiting[2].id,waiting[0].id]);
  for(const item of waiting){
   assert.equal((await db.prepare("SELECT COUNT(*)::int count FROM support_events WHERE conversation_id=? AND event_type='assigned'").get(item.id)).count,1);
   const current=(await getSupportConversation(admin,item.id)).conversation;
   assert.equal(current.assignedUserId,agent.id,'Queue-scoped recovery uses the saved eligible support assignee');
   const event=await db.prepare("SELECT id FROM support_events WHERE conversation_id=? AND event_type='assigned'").get(item.id);
   assert.deepEqual(await db.prepare("SELECT source_key,kind,recipient_key,user_id,visitor_conversation_id FROM attention_notifications WHERE conversation_id=? AND kind='assigned' ORDER BY id").all(item.id),
    [{source_key:'support-assignment:'+event.id,kind:'assigned',recipient_key:'user:'+agent.id,user_id:agent.id,visitor_conversation_id:null}],
    'Recovery creates exactly one event-sourced internal assignment alert, without announcing a participant Join');
   assert.deepEqual(await db.prepare('SELECT id FROM attention_notifications WHERE conversation_id=? AND (user_id=? OR visitor_conversation_id IS NOT NULL)').all(item.id,owner.id),[],
    'Recovery must not notify the participant about an internal assignment');
   const participant=(await getSupportConversation(owner,item.id)).conversation;
   assert.equal(participant.agentJoined,false);assert.equal(participant.assignedUserName,null);
  }
  const recoveredIds=waiting.map(item=>item.id);
  const recoveredAlerts=()=>db.prepare('SELECT * FROM attention_notifications WHERE conversation_id=ANY(?::bigint[]) ORDER BY id').all(recoveredIds);
  const beforeRepeatedRecovery=await recoveredAlerts();
  assert.deepEqual(await routeWaitingSupportConversations(admin,Date.now(),decision),{routed:0,remaining:0},'Repeat cannot duplicate assignments');
  assert.deepEqual(await recoveredAlerts(),beforeRepeatedRecovery,'Repeat recovery preserves every existing alert without duplication or participant disclosure');
  assert.deepEqual(await routeWaitingSupportConversations(admin,Date.now(),{queue:'transport'}),{routed:1,remaining:0});
  await assert.rejects(()=>routeWaitingSupportConversations(owner,Date.now(),decision),/Operations access/);await assert.rejects(()=>routeWaitingSupportConversations(agent,Date.now(),decision),/Operations access/);await assert.rejects(()=>routeWaitingSupportConversations(admin,Date.now(),{queue:'foreign' as never}),/Choose a support queue/);
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(admin.id);await assert.rejects(()=>routeWaitingSupportConversations(admin,Date.now(),decision),/Operations access/);await db.prepare("UPDATE user_access_profiles SET access_role='platform_admin' WHERE user_id=?").run(admin.id);
  // Availability save remains an immediate command; recovered work is already assigned.
  assert.deepEqual(await updateSupportAgentSetting(admin,{userId:agent.id,enabled:true,queueScope:'support'}),{routed:0,remaining:0});
  await db.exec(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,assistance_category,requester_label,subject,status,created_at,updated_at,last_message_at)
   SELECT 'S119-BATCH-'||n,'client',${business},${owner.id},'general','Fixture','Waiting batch','waiting',${Date.now()}+n,${Date.now()}+n,${Date.now()}+n FROM generate_series(1,101)n`);
  assert.deepEqual(await routeWaitingSupportConversations(admin,Date.now(),decision),{routed:100,remaining:1});assert.deepEqual(await routeWaitingSupportConversations(admin,Date.now(),decision),{routed:1,remaining:0});
  console.log('PASS S121 isolated PostgreSQL scoped routing compatibility: FIFO, automatic requeue after unassignment, concurrency/exact-once alerts, current manager authority, queue/role denial, repeat/batch bounds and unchanged availability-save behavior.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
