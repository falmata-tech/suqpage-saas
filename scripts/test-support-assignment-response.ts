import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import type {SessionUser} from '../lib/types';
import * as support from '../lib/support';
import {SUPPORT_STAFF_REPLY_TARGET_MS as target,SUPPORT_UNASSIGNED_QUEUE_TARGET_MS as queueTarget,supportReplyOverdueSource} from '../lib/support-assignment-response';
import {joinAssignedSupportConversation} from './testing/support-join';
import {userAttentionFeed} from '../lib/attention-postgres';

async function main(){
 const db=await getDb(),t=Date.now()-60*60_000,key=()=>crypto.randomUUID();
 delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 try{
  async function user(name:string,role:SessionUser['access_role'],scope?:'transport'){
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES(?,'unused',?,'admin',0)").run(`${name}@example.test`,name)).insertedId;
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,?,0)').run(id,scope);
   return (await runtimeUserById(id))!;
  }
  const admin=await user('assignment-admin','platform_admin'),manager=await user('assignment-manager','operations_manager'),a=await user('assignment-a','team_member','transport'),b=await user('assignment-b','team_member','transport');
  let ordinal=0;const guest=(at=t)=>support.createPublicSupportConversation({category:'shipment_observation',name:'Private customer name',phone:'+447700900999',origin:'Private pickup',destination:'Private destination',message:'Private goods description',idempotencyKey:key()},`assignment-response-${++ordinal}`,at);
  const view=async(id:number)=>(await support.getSupportConversation(admin,id)).conversation;
  const state=(id:number)=>db.prepare('SELECT awaiting_staff_since,awaiting_staff_message_id,overdue_notified_message_id,overdue_notified_assignment_id,status,assigned_user_id FROM support_conversations WHERE id=?').get(id);
  const active=(id:number)=>db.prepare('SELECT id,assigned_at FROM support_assignments WHERE conversation_id=? AND released_at IS NULL ORDER BY id DESC LIMIT 1').get(id);
  const attention=(id:number)=>db.prepare("SELECT * FROM attention_notifications WHERE conversation_id=? AND kind='reply_overdue' ORDER BY id").all(id);
  const emails=(id:number)=>db.prepare('SELECT e.*,n.user_id,n.source_key FROM attention_email_deliveries e JOIN attention_notifications n ON n.id=e.notification_id WHERE n.conversation_id=? ORDER BY e.id').all(id);
  const alternate=async(id:number)=>(await view(id)).assignedUserId===a.id?b:a;
  const c=await guest(),initial=await state(c.id),second=await alternate(c.id),assignedAt=t+20*60_000;
  await support.reassignSupportConversation(admin,c.id,second.id,assignedAt);
  const epoch=await active(c.id),due=assignedAt+target;
  assert.equal((await state(c.id)).awaiting_staff_since,t,'Assignment never rewrites original customer waiting time');
  assert.equal((await view(c.id)).staffReplyDueAt,due);
  assert.equal((await support.sweepSupportReplyOverdue(due-1)).notified,0,'Old customer work grants the new agent a full window');
  assert.equal((await support.sweepSupportReplyOverdue(due)).notified,1);
  assert.equal((await state(c.id)).overdue_notified_assignment_id,epoch.id);
  assert.equal((await attention(c.id)).length,3);
  const firstEmails=await emails(c.id);assert.equal(firstEmails.length,2);assert.deepEqual(firstEmails.map(row=>row.user_id).sort((x,y)=>x-y),[admin.id,manager.id].sort((x,y)=>x-y));
  assert.ok(firstEmails.every(row=>row.source_key===supportReplyOverdueSource(c.id,initial.awaiting_staff_message_id,epoch.id)&&row.expires_at-row.created_at===24*60*60_000));
  assert.ok(firstEmails.every(row=>!('email' in row)&&!('body' in row)),'No address or customer content is snapshotted');
  const stable=await state(c.id);await support.reassignSupportConversation(admin,c.id,second.id,due+1);assert.deepEqual(await state(c.id),stable,'Same-assignee no-op does not clear the notified marker');
  assert.equal((await support.sweepSupportReplyOverdue(due+1)).notified,0);
  const third=await alternate(c.id),reassignedAt=due+2;
  await support.reassignSupportConversation(admin,c.id,third.id,reassignedAt);
  const nextEpoch=await active(c.id),reset=await state(c.id);
  assert.equal(reset.awaiting_staff_message_id,initial.awaiting_staff_message_id);assert.equal(reset.awaiting_staff_since,t);
  assert.equal(reset.overdue_notified_message_id,null);assert.equal(reset.overdue_notified_assignment_id,null);
  assert.equal((await userAttentionFeed(admin)).items.filter(row=>row.kind==='reply_overdue'&&row.destination.id===c.id).length,0,'Old-epoch alerts are stale immediately');
  assert.equal((await support.sweepSupportReplyOverdue(reassignedAt+target-1)).notified,0);
  const parallel=await Promise.all([support.sweepSupportReplyOverdue(reassignedAt+target),support.sweepSupportReplyOverdue(reassignedAt+target)]);
  assert.equal(parallel.reduce((sum,result)=>sum+result.notified,0),1);assert.equal((await emails(c.id)).length,4);
  assert.ok((await attention(c.id)).some(row=>row.source_key===supportReplyOverdueSource(c.id,initial.awaiting_staff_message_id,nextEpoch.id)));
  // The old case is already beyond the 3:30 callback deadline. Exercise the
  // next-message clock on a fresh case that the agent can still explicitly join.
  const replyStart=Date.now(),answered=await guest(replyStart);
  const agent=await joinAssignedSupportConversation(admin,answered.id,replyStart+target+1);
  await support.postSupportMessage(agent,answered.id,{audience:'reply',message:'A public answer',idempotencyKey:key()},replyStart+target+1);
  const nextMessage=await support.postPublicSupportMessage(answered.token,{message:'The next question',idempotencyKey:key()},'assignment-next',replyStart+target+2);
  await support.postPublicSupportMessage(answered.token,{message:'More detail in the same unanswered cycle',idempotencyKey:key()},'assignment-more',replyStart+target+3);
  await support.postSupportMessage(admin,answered.id,{audience:'note',message:'Private coordination',idempotencyKey:key()},replyStart+target+4);
  assert.equal((await state(answered.id)).awaiting_staff_message_id,nextMessage.id);
  assert.equal((await view(answered.id)).staffReplyDueAt,replyStart+2*target+2,'Next-reply clock starts after the current assignment');
  assert.equal((await support.sweepSupportReplyOverdue(replyStart+2*target+2)).notified,1);assert.equal((await emails(answered.id)).length,2);
  await support.closeSupportConversation(admin,answered.id,replyStart+2*target+3);
  await support.closeSupportConversation(admin,c.id,reassignedAt+2*target+3);

  const waiting=await guest();await support.reassignSupportConversation(admin,waiting.id,null,t+1);
  assert.equal((await view(waiting.id)).staffReplyDueAt,t+queueTarget,'Unassigned queue keeps its separate manager target');
  assert.equal((await support.sweepSupportReplyOverdue(t+target)).notified,0);
  assert.equal((await support.sweepSupportReplyOverdue(t+queueTarget)).notified,1);assert.equal((await emails(waiting.id)).length,0,'Unassigned queue escalation never blames/emails about a staff member');
  const waitingAnchor=(await state(waiting.id)).awaiting_staff_message_id;
  assert.ok((await attention(waiting.id)).every(row=>row.source_key===supportReplyOverdueSource(waiting.id,waitingAnchor,0)));
  await support.reassignSupportConversation(admin,waiting.id,a.id,t+40*60_000);
  assert.equal((await support.sweepSupportReplyOverdue(t+40*60_000+target-1)).notified,0);
  assert.equal((await support.sweepSupportReplyOverdue(t+40*60_000+target)).notified,1);assert.equal((await emails(waiting.id)).length,2);
  await support.closeSupportConversation(admin,waiting.id,t+50*60_000+1);

  const released=await guest();await db.prepare('UPDATE support_assignments SET released_at=? WHERE conversation_id=? AND released_at IS NULL').run(t+1,released.id);
  assert.equal((await view(released.id)).staffReplyDueAt,t+queueTarget,'Released history grants no active-assignment staff target');
  assert.equal((await support.sweepSupportReplyOverdue(t+target)).notified,0);
  assert.equal((await support.sweepSupportReplyOverdue(t+queueTarget)).notified,1);assert.equal((await emails(released.id)).length,0,'Missing active assignment is not attributable staff work for email');
  await support.closeSupportConversation(admin,released.id,t+queueTarget+1);

  const roleCase=await guest(),roleAgent=(await view(roleCase.id)).assignedUserId!;
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(roleAgent);
  assert.equal((await support.sweepSupportReplyOverdue(t+target)).notified,1);assert.equal((await emails(roleCase.id)).length,0,'A former staff identity cannot be named as overdue staff');
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(roleAgent);await support.closeSupportConversation(admin,roleCase.id,t+target+1);

  const rollback=await guest(),before=await state(rollback.id);
  await db.exec(`CREATE FUNCTION fail_escalation_email() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture email outbox unavailable'; END $$;CREATE TRIGGER fail_escalation_email BEFORE INSERT ON attention_email_deliveries FOR EACH ROW EXECUTE FUNCTION fail_escalation_email()`);
  await assert.rejects(()=>support.sweepSupportReplyOverdue(t+target),/fixture email outbox unavailable/);
  assert.deepEqual(await state(rollback.id),before);assert.equal((await attention(rollback.id)).length,0);assert.equal((await emails(rollback.id)).length,0,'Markers, attention and email persist in one transaction');
  await db.exec('DROP TRIGGER fail_escalation_email ON attention_email_deliveries;DROP FUNCTION fail_escalation_email()');await support.closeSupportConversation(admin,rollback.id,t+target+1);

  const mixed=await guest(),mixedState=await state(mixed.id),mixedEpoch=await active(mixed.id);
  await db.prepare('UPDATE support_conversations SET overdue_notified_message_id=?,overdue_notified_assignment_id=NULL WHERE id=?').run(mixedState.awaiting_staff_message_id,mixed.id);
  await db.prepare("INSERT INTO attention_notifications(source_key,recipient_key,user_id,conversation_id,kind,created_at) VALUES(?,?,?,?,'reply_overdue',?)").run(`support-reply-overdue:${mixed.id}:${mixedState.awaiting_staff_message_id}`,`user:${admin.id}`,admin.id,mixed.id,t+target);
  assert.equal((await support.sweepSupportReplyOverdue(t+target)).notified,1,'An old overlapping worker cannot suppress the assignment-scoped escalation');
  assert.equal((await emails(mixed.id)).length,2);assert.equal((await state(mixed.id)).overdue_notified_assignment_id,mixedEpoch.id);
  assert.equal((await support.sweepSupportReplyOverdue(t+target)).notified,0);
  await support.closeSupportConversation(admin,mixed.id,t+target+1);

  const prefixes=[];
  for(let i=0;i<30;i++){const item=await guest();await support.reassignSupportConversation(admin,item.id,(await alternate(item.id)).id,t+30*60_000);prefixes.push(item.id);}
  const actuallyDue=await guest();assert.equal((await support.sweepSupportReplyOverdue(t+target)).notified,1,'Grace filtering happens before LIMIT so fresh assignments cannot starve actually due work');
  assert.equal((await emails(actuallyDue.id)).length,2);for(const id of prefixes)assert.equal((await state(id)).overdue_notified_message_id,null);
  const current=await guest();await support.reassignSupportConversation(admin,current.id,(await alternate(current.id)).id,Date.now());
  assert.ok((await support.listSupportConversations(admin,{status:'needs_reply',queue:'transport'})).items.some(row=>row.id===current.id));
  assert.equal((await support.listSupportConversations(admin,{status:'overdue',queue:'transport'})).items.some(row=>row.id===current.id),false);
  console.log('PASS S162 isolated PostgreSQL assignment fairness, 2-minute assigned/10-minute unassigned targets, original-anchor preservation, per-assignment exact-once alerts/email jobs, marker/no-op semantics, next-message target, queue/released/role privacy, atomic outbox rollback and grace-before-LIMIT anti-starvation.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
