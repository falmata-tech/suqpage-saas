import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import type { SessionUser } from '../lib/types';
import {
  createSupportConversation, createPublicSupportConversation, getSupportConversation,
  getPublicSupportConversation, postSupportMessage, postPublicSupportMessage,
  acknowledgeSupportRead, acknowledgePublicRead, reassignSupportConversation,
  updateSupportAgentSetting, closePublicSupportConversation, reopenSupportConversation, SupportError,
} from '../lib/support';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { confirmedMessageId } from '../lib/chat-read-contract';
import { joinAssignedSupportConversation } from './testing/support-join';

async function main() {
  delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN; delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
  const db = await getDb();
  try {
    const business = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('read-fixture','Read Fixture','composition','active')").run()).insertedId);
    async function user(name: string, role: SessionUser['access_role'], bid: number | null = null): Promise<SessionUser> {
      const email = name+'@example.test';
      const id = Number((await db.prepare('INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,?,?,?,?,0)').run(email,'x',name,role==='client'?'owner':'admin',bid)).insertedId);
      await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
      return {id,email,name,role:role==='client'?'owner':'admin',access_role:role,business_id:bid,must_change_password:0};
    }
    const owner = await user('owner-read','client',business), colleague=await user('colleague-read','client',business), other = await user('other-read','client'), manager = await user('manager-read','platform_admin'), agent = await user('agent-read','team_member'), alternate = await user('alternate-read','team_member');
    await updateSupportAgentSetting(manager,{userId:agent.id,enabled:true,queueScope:'all',maxOpenConversations:8});
    await updateSupportAgentSetting(manager,{userId:alternate.id,enabled:true,queueScope:'all',maxOpenConversations:8});
    const c = await createSupportConversation(owner,{subject:'Visible receipt fixture',message:'Owner opening message',idempotencyKey:crypto.randomUUID()});
    const opening = (await getSupportConversation(manager,c.id)).messages[0].id;
    const assigned = (await getSupportConversation(manager,c.id)).conversation.assignedUserId;
    const assignedAgent = assigned===agent.id?agent:alternate;
    const replacement = assigned===agent.id?alternate:agent;
    const before = await db.prepare('SELECT * FROM support_conversations WHERE id=?').get(c.id);
    await getSupportConversation(assignedAgent,c.id); await getSupportConversation(owner,c.id);
    const after = await db.prepare('SELECT * FROM support_conversations WHERE id=?').get(c.id);
    assert.equal(after.staff_confirmed_read_message_id,0); assert.equal(after.staff_last_read_message_id,before.staff_last_read_message_id); assert.equal(after.staff_joined_at,null);
    assert.equal((await getSupportConversation(owner,c.id)).messages[0].read,false);
    await assert.rejects(()=>acknowledgeSupportRead(manager,c.id,{messageId:opening}),SupportError);
    await assert.rejects(()=>acknowledgeSupportRead(other,c.id,{messageId:opening}),SupportError);
    for(const id of [0,-1,1.2,'1',true,null,Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>confirmedMessageId(id));
    const receipt = await acknowledgeSupportRead(assignedAgent,c.id,{messageId:opening}); assert.equal(receipt.joined,false);
    assert.equal((await getSupportConversation(owner,c.id)).messages[0].read,true);
    assert.equal((await getSupportConversation(owner,c.id)).conversation.agentJoined,false,'Read and explicit acceptance are separate');
    await joinAssignedSupportConversation(manager,c.id);
    assert.equal((await getSupportConversation(owner,c.id)).conversation.agentJoined,true);
    const participantReply=await postSupportMessage(colleague,c.id,{message:'Same-business colleague reply',idempotencyKey:crypto.randomUUID()});
    assert.equal((await db.prepare('SELECT sender_side FROM support_messages WHERE id=?').get(participantReply.id)).sender_side,'participant');
    assert.equal((await getSupportConversation(assignedAgent,c.id)).conversation.unread,true,'Colleague reply is incoming staff work');
    await assert.rejects(()=>acknowledgeSupportRead(colleague,c.id,{messageId:participantReply.id}),SupportError,'A colleague cannot read their own participant-side message');
    await acknowledgeSupportRead(assignedAgent,c.id,{messageId:participantReply.id});
    assert.equal((await getSupportConversation(owner,c.id)).messages.find(m=>m.id===participantReply.id)?.read,true);
    await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(colleague.id);
    const retainedParticipant=(await getSupportConversation(owner,c.id)).messages.find(m=>m.id===participantReply.id)!;
    assert.equal(retainedParticipant.senderRole,'client');assert.equal(retainedParticipant.read,true,'Role changes cannot reinterpret recorded participant authority');
    await assert.rejects(()=>postSupportMessage(colleague,c.id,{message:'Stale client sender',idempotencyKey:crypto.randomUUID()}),SupportError);
    await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(colleague.id);
    await acknowledgeSupportRead(assignedAgent,c.id,{messageId:opening});
    assert.equal((await db.prepare("SELECT COUNT(*) total FROM support_events WHERE conversation_id=? AND event_type='joined'").get(c.id)).total,1);
    const reply = await postSupportMessage(assignedAgent,c.id,{message:'A reply to the owner',idempotencyKey:crypto.randomUUID()});
    await getSupportConversation(owner,c.id);
    assert.equal((await getSupportConversation(assignedAgent,c.id)).messages.at(-1)?.read,false);
    await assert.rejects(()=>acknowledgeSupportRead(owner,c.id,{messageId:opening}),SupportError);
    await acknowledgeSupportRead(owner,c.id,{messageId:reply.id});
    assert.equal((await getSupportConversation(assignedAgent,c.id)).messages.at(-1)?.read,true);
    assert.equal((await db.prepare('SELECT sender_side FROM support_messages WHERE id=?').get(reply.id)).sender_side,'staff');
    await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(assignedAgent.id);
    const retainedStaff=(await getSupportConversation(owner,c.id)).messages.find(m=>m.id===reply.id)!;
    assert.notEqual(retainedStaff.senderRole,'client');assert.equal(retainedStaff.read,true,'A former staff reply stays staff-side');
    await assert.rejects(()=>postSupportMessage(assignedAgent,c.id,{message:'Stale staff sender',idempotencyKey:crypto.randomUUID()}),SupportError);
    await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(assignedAgent.id);
    const previousEpoch=(await getSupportConversation(owner,c.id)).conversation.readEpoch;
    await reassignSupportConversation(manager,c.id,replacement.id);
    assert.equal((await getSupportConversation(owner,c.id)).conversation.agentJoined,false);
    await assert.rejects(()=>acknowledgeSupportRead(assignedAgent,c.id,{messageId:opening}),SupportError);
    await acknowledgeSupportRead(replacement,c.id,{messageId:opening});
    assert.equal((await getSupportConversation(owner,c.id)).conversation.agentJoined,false);
    await joinAssignedSupportConversation(manager,c.id);
    assert.notEqual((await getSupportConversation(owner,c.id)).conversation.readEpoch,previousEpoch,'Assignment identity changes independently of message IDs');
    assert.equal((await db.prepare("SELECT COUNT(*) total FROM support_events WHERE conversation_id=? AND event_type='joined'").get(c.id)).total,2);
    // Guest receipts use the same explicit contract and cannot see private notes.
    const guest = await createPublicSupportConversation({category:'shipment_observation',origin:'Addis Ababa',destination:'Adama',name:'LOCAL QA receipt',phone:'+251911112233',idempotencyKey:crypto.randomUUID()},'receipt-fixture');
    const thread = await getSupportConversation(manager,guest.id), guestAgent = thread.conversation.assignedUserId===agent.id?agent:alternate;
    const guestInitial = thread.messages[0].id;
    await getPublicSupportConversation(guest.token); await getSupportConversation(guestAgent,guest.id);
    assert.equal((await getPublicSupportConversation(guest.token)).messages[0].read,false);
    await acknowledgeSupportRead(guestAgent,guest.id,{messageId:guestInitial});
    assert.equal((await getPublicSupportConversation(guest.token)).agentJoined,false);
    await joinAssignedSupportConversation(manager,guest.id);
    assert.equal((await getPublicSupportConversation(guest.token)).agentJoined,true);
    const privateNote = await postSupportMessage(guestAgent,guest.id,{audience:'note',message:'Private carrier details',idempotencyKey:crypto.randomUUID()});
    const publicReply = await postSupportMessage(guestAgent,guest.id,{audience:'reply',message:'Public reply',idempotencyKey:crypto.randomUUID()});
    await getPublicSupportConversation(guest.token);
    assert.equal((await getSupportConversation(guestAgent,guest.id)).messages.find(m=>m.id===publicReply.id)?.read,false);
    await assert.rejects(()=>acknowledgePublicRead(guest.token,{messageId:privateNote.id,publicRef:guest.publicRef}),SupportError);
    await assert.rejects(()=>acknowledgePublicRead(guest.token,{messageId:reply.id,publicRef:guest.publicRef}),SupportError);
    await assert.rejects(()=>acknowledgePublicRead(guest.token,{messageId:publicReply.id,publicRef:'wrong'}),SupportError);
    await assert.rejects(()=>acknowledgePublicRead(guest.token,{messageId:publicReply.id,publicRef:guest.publicRef},guest.expiresAt+1),SupportError);
    await acknowledgePublicRead(guest.token,{messageId:publicReply.id,publicRef:guest.publicRef});
    assert.equal((await getSupportConversation(guestAgent,guest.id)).messages.find(m=>m.id===publicReply.id)?.read,true);
    assert.equal((await getSupportConversation(guestAgent,guest.id)).messages.find(m=>m.id===privateNote.id)?.read,false);
    const guestMessage = await postPublicSupportMessage(guest.token,{message:'Unread guest reply',idempotencyKey:crypto.randomUUID()},'receipt-fixture');
    await getSupportConversation(guestAgent,guest.id);
    assert.equal((await getPublicSupportConversation(guest.token)).messages.at(-1)?.read,false);
    await acknowledgeSupportRead(guestAgent,guest.id,{messageId:guestMessage.id});
    await acknowledgeSupportRead(guestAgent,guest.id,{messageId:guestInitial});
    assert.equal((await db.prepare('SELECT staff_confirmed_read_message_id value FROM support_conversations WHERE id=?').get(guest.id)).value,guestMessage.id,'Stale ack cannot move the cursor back');
    await closePublicSupportConversation(guest.token); await reopenSupportConversation(manager,guest.id);
    assert.equal((await getPublicSupportConversation(guest.token)).agentJoined,false);
    const stable = await db.prepare('SELECT * FROM support_conversations WHERE id=?').get(guest.id);
    const schema = (await db.prepare('SELECT current_schema() name').get()).name as string;
    const historicalMessages=await db.prepare('SELECT id,conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,visitor_visible FROM support_messages ORDER BY id').all();
    // Reconstruct schema65 in this isolated fixture, then prove additive66 does
    // not infer mutable roles or rewrite any retained transcript bytes.
    await db.exec('ALTER TABLE support_messages DROP COLUMN sender_side; DELETE FROM schema_migrations WHERE version=66');
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[66]);
    assert.deepEqual(await db.prepare('SELECT id,conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,visitor_visible FROM support_messages ORDER BY id').all(),historicalMessages);
    assert.equal((await db.prepare('SELECT COUNT(*) total FROM support_messages WHERE sender_side IS NOT NULL').get()).total,0,'Migration leaves historical sides unknown');
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
    assert.deepEqual(await db.prepare('SELECT * FROM support_conversations WHERE id=?').get(guest.id),stable);
    assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version,80);
    console.log('PASS real PostgreSQL confirmed reads/joins, read-only GET, owner/guest privacy, stale/foreign/self/private/expired denial, reassignment/reopen, monotonic and migration preservation.');
  } finally { await closeDbForTests(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
