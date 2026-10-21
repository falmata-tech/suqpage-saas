import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import type {SessionUser} from '../lib/types';
import * as support from '../lib/support';
import {joinAssignedSupportConversation} from './testing/support-join';
import {SUPPORT_IDLE_WINDOWS} from '../lib/support-idle-contract';

async function main(){
 const db=await getDb(),t=Date.now()-2*60*60_000,key=()=>crypto.randomUUID();
 delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 try{
  const business=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('idle-evidence-owner','Evidence owner','composition','active')").run()).insertedId;
  async function user(name:string,role:SessionUser['access_role'],bid:number|null=null){const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused',?,'admin',?,0)").run(`${name}@example.test`,name,bid)).insertedId;await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);return (await runtimeUserById(id))!;}
  const admin=await user('idle-evidence-admin','platform_admin'),agent=await user('idle-evidence-agent','team_member'),wrong=await user('idle-evidence-other','team_member'),owner=await user('idle-evidence-owner','client',business);
  await db.prepare("INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,'all',0)").run(agent.id);
  let ordinal=0;const guest=()=>support.createPublicSupportConversation({category:'shipment_observation',name:'Evidence fixture',phone:'+447700900999',origin:'Town A',destination:'Town B',idempotencyKey:key()},`idle-evidence-${++ordinal}`,t);
  async function publicReply(id:number,at:number){const staff=await joinAssignedSupportConversation(admin,id,at);return support.postSupportMessage(staff,id,{audience:'reply',message:'Public reply whose actual wait is retained',idempotencyKey:key()},at);}
  const facts=async(id:number)=>({case:await db.prepare('SELECT * FROM support_conversations WHERE id=?').get(id),messages:await db.prepare('SELECT * FROM support_messages WHERE conversation_id=? ORDER BY id').all(id),events:await db.prepare('SELECT * FROM support_events WHERE conversation_id=? ORDER BY id').all(id),assignments:await db.prepare('SELECT * FROM support_assignments WHERE conversation_id=? ORDER BY id').all(id),alerts:await db.prepare('SELECT * FROM attention_notifications WHERE conversation_id=? ORDER BY id').all(id)});
  const first=await guest(),initial=(await support.getSupportConversation(admin,first.id)).messages[0],reply=await publicReply(first.id,t+10),window=SUPPORT_IDLE_WINDOWS.guest.endMs;
  await support.postSupportMessage(admin,first.id,{audience:'note',message:'Private note is not the public source',idempotencyKey:key()},t+20);
  assert.equal(await support.getSupportIdleEndEvidence(admin,first.id),null);
  const sweeps=await Promise.all([support.sweepSupportInactivity(t+10+window),support.sweepSupportInactivity(t+10+window)]);
  assert.equal(sweeps.reduce((sum,result)=>sum+result.ended,0),1);
  const evidence=await support.getSupportIdleEndEvidence(admin,first.id);
  assert.deepEqual(evidence,{version:1,reason:'participant_no_reply',endedAt:t+10+window,waitingSince:t+10,windowMs:window,lastPublicStaffReply:{id:reply.id,sentAt:t+10},latestParticipantMessage:{id:initial.id,sentAt:t},lastReplyConfirmedReadAtEnding:false});
  assert.equal((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND event_type='idle_ended'").get(first.id)).n,1);
  const beforeRead=JSON.stringify(evidence);await support.getSupportIdleEndEvidence(agent,first.id);assert.equal(JSON.stringify(await support.getSupportIdleEndEvidence(admin,first.id)),beforeRead,'GET is immutable');
  await assert.rejects(()=>support.getSupportIdleEndEvidence(owner,first.id),support.SupportError);
  await assert.rejects(()=>support.getSupportIdleEndEvidence(wrong,first.id),support.SupportError);
  const publicView=await support.getPublicSupportConversation(first.token,t+10+window);
  assert.doesNotMatch(JSON.stringify(publicView),/participant_no_reply|lastPublicStaffReply|waitingSince|lastReplyConfirmedReadAtEnding|Private note/);
  await support.reopenSupportConversation(admin,first.id,t+10+window+1);assert.deepEqual(await support.getSupportIdleEndEvidence(admin,first.id),evidence);
  await support.closeSupportConversation(admin,first.id,t+10+window+2);assert.deepEqual(await support.getSupportIdleEndEvidence(admin,first.id),evidence,'Resolving never replaces or removes proof');

  const readCase=await guest(),readReply=await publicReply(readCase.id,t+30);
  await support.acknowledgePublicRead(readCase.token,{messageId:readReply.id,publicRef:readCase.publicRef},t+31);
  await support.sweepSupportInactivity(t+30+window);
  assert.equal((await support.getSupportIdleEndEvidence(admin,readCase.id))?.lastReplyConfirmedReadAtEnding,true,'Only canonical transcript read is evidence of read');
  const own=await support.createSupportConversation(owner,{subject:'Owner evidence',message:'Owner initial question',idempotencyKey:key()},t);
  const ownReply=await publicReply(own.id,t+40);await support.acknowledgeSupportRead(owner,own.id,{messageId:ownReply.id,publicRef:own.publicRef},t+41);
  await support.sweepSupportInactivity(t+40+SUPPORT_IDLE_WINDOWS.owner.endMs);
  const ownEvidence=await support.getSupportIdleEndEvidence(admin,own.id);assert.equal(ownEvidence?.windowMs,SUPPORT_IDLE_WINDOWS.owner.endMs);assert.equal(ownEvidence?.lastReplyConfirmedReadAtEnding,true);
  assert.doesNotMatch(JSON.stringify(await support.getSupportConversation(owner,own.id)),/participant_no_reply|lastPublicStaffReply|lastReplyConfirmedReadAtEnding/);

  const legacy=await guest(),legacyReply=await publicReply(legacy.id,t+50);
  await db.prepare('UPDATE support_messages SET sender_side=NULL WHERE id=?').run(legacyReply.id);
  await support.sweepSupportInactivity(t+50+window);assert.equal((await support.getSupportIdleEndEvidence(admin,legacy.id))?.lastPublicStaffReply.id,legacyReply.id,'Exact saved-clock/original-author fallback does not inspect current role');
  const unknown=await guest();await publicReply(unknown.id,t+60);
  await db.prepare('UPDATE support_conversations SET awaiting_participant_since=? WHERE id=?').run(t+59,unknown.id);
  assert.equal((await support.sweepSupportInactivity(t+60+window)).ended,1);assert.equal(await support.getSupportIdleEndEvidence(admin,unknown.id),null,'An inconsistent source ends under the existing policy without fabricated proof');

  const rollback=await guest();await publicReply(rollback.id,t+70);const before=await facts(rollback.id);
  await db.exec(`CREATE FUNCTION fail_idle_evidence() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.event_type='idle_ended' THEN RAISE EXCEPTION 'fixture idle evidence unavailable'; END IF; RETURN NEW; END $$;CREATE TRIGGER fail_idle_evidence BEFORE INSERT ON support_events FOR EACH ROW EXECUTE FUNCTION fail_idle_evidence()`);
  await assert.rejects(()=>support.sweepSupportInactivity(t+70+window),/fixture idle evidence unavailable/);assert.deepEqual(await facts(rollback.id),before,'The ending, release, both events and alert roll back together');
  await db.exec('DROP TRIGGER fail_idle_evidence ON support_events;DROP FUNCTION fail_idle_evidence()');
  await support.sweepSupportInactivity(t+70+window);assert.ok(await support.getSupportIdleEndEvidence(admin,rollback.id));
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(admin.id);
  await assert.rejects(()=>support.getSupportIdleEndEvidence(admin,first.id),support.SupportError,'Stale staff identities cannot read private facts');
  console.log('PASS S125 real PostgreSQL immutable idle-ending facts: accurate reply/participant/confirmed-read snapshots, no private-note or customer exposure, fresh-role/assignee scope, legacy exact-clock fallback versus unknown, concurrency/exact-once, retained resume/resolve history and atomic failure rollback.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
