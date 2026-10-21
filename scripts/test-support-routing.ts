import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import {createStaffAccount} from '../lib/staff-operations';
import type {SessionUser} from '../lib/types';
import {joinAssignedSupportConversation} from './testing/support-join';
import {userAttentionFeed} from '../lib/attention-postgres';
import {
  claimSupportConversation,closeSupportConversation,createPublicSupportConversation,createSupportConversation,
  getPublicSupportConversation,getSupportConversation,listSupportAgentWorkloads,listSupportConversations,
  joinSupportConversation,postSupportMessage,reassignSupportConversation,reopenSupportConversation,
  routeWaitingSupportConversations,updateSupportAgentSetting,
} from '../lib/support';

async function main() {
  const db=await getDb();
  delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;
  delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
  try {
    const businessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('routing-fixture','Routing Fixture','composition','active')").run()).insertedId);
    async function user(name:string,role:SessionUser['access_role'],tenant:number|null=role==='client'?businessId:null) {
      const id=Number((await db.prepare('INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,?,?,?,?,0)').run(
        name+'@example.test','unused',name,role==='client'?'owner':'admin',tenant,
      )).insertedId);
      await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
      return (await runtimeUserById(id))!;
    }
    const admin=await user('routing-admin','platform_admin'),owner=await user('routing-owner','client');
    const a=await user('routing-a','team_member'),b=await user('routing-b','team_member');
    const transport=await user('routing-transport','team_member'),paused=await user('routing-paused','team_member');
    const impostor=await user('routing-impostor','client',null);
    for(const agent of [a,b])await updateSupportAgentSetting(admin,{userId:agent.id,enabled:true,queueScope:'support',maxOpenConversations:1});
    await updateSupportAgentSetting(admin,{userId:transport.id,enabled:true,queueScope:'transport'});
    await updateSupportAgentSetting(admin,{userId:paused.id,enabled:false,queueScope:'support'});
    // A stale/forged settings row must not make a nonstaff identity eligible.
    await db.prepare("INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,'support',0)").run(impostor.id);
    let ordinal=0;
    const sameTime=Date.now();
    const create=()=>createSupportConversation(owner,{subject:'Routing '+(++ordinal),message:'Disposable routing fixture',idempotencyKey:crypto.randomUUID()},sameTime);
    const initial=[];
    for(let index=0;index<4;index++)initial.push(await create());
    assert.deepEqual(await Promise.all(initial.map(async item=>(await getSupportConversation(admin,item.id)).conversation.assignedUserId)),[a.id,b.id,a.id,b.id],
      'Equal workloads rotate by saved assignment order even when timestamps are identical');
    for(const item of initial)await closeSupportConversation(admin,item.id);
    const afterClose=await create();
    assert.equal((await getSupportConversation(admin,afterClose.id)).conversation.assignedUserId,a.id,'Closed work stops contributing; least-recent assignment breaks the tie');
    await closeSupportConversation(admin,afterClose.id);
    for(const agent of [a,b]) {
      // Bulk fixtures represent existing real workload, without 202 notification side effects.
      await db.exec(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,assistance_category,requester_label,subject,status,assigned_user_id,created_at,updated_at,last_message_at)
        SELECT 'BULK-${agent.id}-'||n,'client',${businessId},${owner.id},'general','Fixture','Existing workload','open',${agent.id},${sameTime},${sameTime},${sameTime}
        FROM generate_series(1,101) n`);
    }
    const over100=await create();
    assert.equal((await getSupportConversation(admin,over100.id)).conversation.assignedUserId,b.id,'The least loaded receiving agent can receive chat 102');
    await db.exec(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,assistance_category,requester_label,subject,status,assigned_user_id,created_at,updated_at,last_message_at)
      SELECT 'TRANSPORT-BULK-'||n,'client',${businessId},${owner.id},'shipment_observation','Fixture','Existing transport','open',${transport.id},${sameTime},${sameTime},${sameTime}
      FROM generate_series(1,101) n`);
    const visitor=await createPublicSupportConversation({category:'shipment_observation',origin:'Addis Ababa',destination:'Hawassa',name:'Disposable routing visitor',phone:'+447700900999',idempotencyKey:crypto.randomUUID()},'routing-visitor');
    const visitorView=await getPublicSupportConversation(visitor.token);
    const staffView=(await getSupportConversation(admin,visitor.id)).conversation;
    assert.equal(visitorView.status,'open');assert.equal(staffView.assignedUserId,transport.id);
    assert.equal(visitorView.publicRef,staffView.publicRef);assert.equal(visitorView.assignedUserName,null,'Internal assignment above 100 is not announced before Join');
    await joinAssignedSupportConversation(admin,visitor.id);
    assert.equal((await getPublicSupportConversation(visitor.token)).assignedUserName,staffView.assignedUserName,'After explicit Join the visitor sees the same saved agent as staff');
    await reassignSupportConversation(admin,over100.id,a.id);
    assert.equal((await getSupportConversation(admin,over100.id)).conversation.assignedUserId,a.id,'Manual assignment above 100 has no cap');
    await reassignSupportConversation(admin,over100.id,null);
    await claimSupportConversation(a,over100.id);
    assert.equal((await claimSupportConversation(a,over100.id)).duplicate,true,'Repeated claim records no duplicate assignment');
    await closeSupportConversation(a,over100.id);
    await reopenSupportConversation(a,over100.id);
    assert.equal((await getSupportConversation(admin,over100.id)).conversation.assignedUserId,a.id,'Assigned staff can reopen above 100');
    const assignmentsBefore=Number((await db.prepare('SELECT COUNT(*) count FROM support_assignments WHERE conversation_id=?').get(over100.id)).count);
    await reopenSupportConversation(a,over100.id);
    assert.equal(Number((await db.prepare('SELECT COUNT(*) count FROM support_assignments WHERE conversation_id=?').get(over100.id)).count),assignmentsBefore);
    await assert.rejects(()=>reassignSupportConversation(admin,over100.id,transport.id),/unavailable/);
    await assert.rejects(()=>reassignSupportConversation(admin,over100.id,paused.id),/unavailable/);
    await assert.rejects(()=>reassignSupportConversation(admin,over100.id,impostor.id),/unavailable/);
    await assert.rejects(()=>reassignSupportConversation(owner,over100.id,b.id),/Operations access/);
    await assert.rejects(()=>updateSupportAgentSetting(admin,{userId:a.id,enabled:true,queueScope:'transport'}),/Reassign open conversations/);
    await updateSupportAgentSetting(admin,{userId:a.id,enabled:false,queueScope:'support'});
    await joinAssignedSupportConversation(admin,over100.id);
    await postSupportMessage(a,over100.id,{message:'Paused agents retain replies to owned cases',idempotencyKey:crypto.randomUUID()});
    assert.equal((await getSupportConversation(a,over100.id)).messages.at(-1)?.body,'Paused agents retain replies to owned cases');
    const whilePaused=await create();
    assert.equal((await getSupportConversation(admin,whilePaused.id)).conversation.assignedUserId,b.id);
    await reassignSupportConversation(admin,whilePaused.id,null);
    await assert.rejects(()=>claimSupportConversation(a,whilePaused.id),/Support conversation was not found/, 'A paused agent cannot discover or claim an unassigned case');
    await assert.rejects(()=>routeWaitingSupportConversations(owner),/Operations access/);
    const resumed=await updateSupportAgentSetting(admin,{userId:a.id,enabled:true,queueScope:'support',maxOpenConversations:-100});
    assert.equal(resumed.routed,1,'Availability save routes existing waiting work');
    assert.equal(resumed.remaining,0);
    const beforeConcurrent=await listSupportAgentWorkloads(admin);
    const beforeA=beforeConcurrent.find(agent=>agent.userId===a.id)!.openConversations;
    const beforeB=beforeConcurrent.find(agent=>agent.userId===b.id)!.openConversations;
    const concurrent=await Promise.all(Array.from({length:12},()=>create()));
    const afterConcurrent=await listSupportAgentWorkloads(admin);
    const afterA=afterConcurrent.find(agent=>agent.userId===a.id)!.openConversations;
    const afterB=afterConcurrent.find(agent=>agent.userId===b.id)!.openConversations;
    assert.equal(afterA+afterB-beforeA-beforeB,12);
    assert.ok(Math.abs(afterA-afterB)<=1,'Concurrent routing observes saved workloads under the assignment lock');
    for(const item of concurrent)assert.equal(Number((await db.prepare('SELECT COUNT(*) count FROM support_assignments WHERE conversation_id=? AND released_at IS NULL').get(item.id)).count),1);
    const retryInput={subject:'Retry routing',message:'Exactly once',idempotencyKey:crypto.randomUUID()};
    const replay=await Promise.all([createSupportConversation(owner,retryInput),createSupportConversation(owner,retryInput)]);
    assert.equal(replay[0].id,replay[1].id);assert.equal(replay.filter(item=>item.duplicate).length,1);
    assert.equal(Number((await db.prepare("SELECT COUNT(*) count FROM support_events WHERE conversation_id=? AND event_type='assigned'").get(replay[0].id)).count),1);
    const assignmentEvent=(await db.prepare("SELECT id FROM support_events WHERE conversation_id=? AND event_type='assigned'").get(replay[0].id)).id;
    const replayId=replay[0].id;
    const activeAssignment=await db.prepare('SELECT id,assigned_user_id FROM support_assignments WHERE conversation_id=? AND released_at IS NULL').get(replayId);
    const replayConversation=(await getSupportConversation(admin,replayId)).conversation;
    assert.equal(activeAssignment.assigned_user_id,replayConversation.assignedUserId);
    assert.equal(String(activeAssignment.id),replayConversation.readEpoch,'Join must use the actual current assignment epoch');
    const replayAgent=(await runtimeUserById(activeAssignment.assigned_user_id))!;
    assert.ok([a.id,b.id].includes(replayAgent.id),'Recipient is the saved eligible support assignee, not a manager or participant');
    const notices=()=>db.prepare('SELECT source_key,kind,recipient_key,user_id,visitor_conversation_id FROM attention_notifications WHERE conversation_id=? ORDER BY id').all(replayId);
    const assignmentNotice={source_key:'support-assignment:'+assignmentEvent,kind:'assigned',recipient_key:'user:'+replayAgent.id,user_id:replayAgent.id,visitor_conversation_id:null};
    assert.deepEqual(await notices(),[assignmentNotice],'Idempotent creation notifies exactly the current agent; no participant or unrelated recipient is announced');
    await getSupportConversation(replayAgent,replayId);
    const ownerBeforeJoin=(await getSupportConversation(owner,replayId)).conversation;
    assert.equal(ownerBeforeJoin.agentJoined,false,'Opening the internally assigned case never joins the agent');
    assert.equal(ownerBeforeJoin.assignedUserName,null,'The owner cannot identify an agent before explicit Join');
    assert.deepEqual((await userAttentionFeed(owner)).items.filter(item=>item.destination.id===replayId),[],'Assignment and staff reads produce no owner attention');
    const joinInput={publicRef:replayConversation.publicRef,assignmentEpoch:replayConversation.readEpoch};
    const joins=await Promise.all([joinSupportConversation(replayAgent,replayId,joinInput),joinSupportConversation(replayAgent,replayId,joinInput)]);
    assert.equal(joins.filter(result=>!result.duplicate).length,1,'Only one concurrent Join accepts the current assignment');
    assert.equal(joins.filter(result=>result.duplicate).length,1);
    const joinedNotice={source_key:'support-manual-joined:'+activeAssignment.id,kind:'joined',recipient_key:'user:'+owner.id,user_id:owner.id,visitor_conversation_id:null};
    assert.deepEqual(await notices(),[assignmentNotice,joinedNotice],'Only explicit Join creates one correctly sourced notification for the tenant participant');
    const joinEvents=()=>db.prepare("SELECT actor_user_id,event_type FROM support_events WHERE conversation_id=? AND event_type='joined'").all(replayId);
    assert.deepEqual(await joinEvents(),[{actor_user_id:replayAgent.id,event_type:'joined'}]);
    const ownerAfterJoin=(await getSupportConversation(owner,replayId)).conversation;
    assert.equal(ownerAfterJoin.agentJoined,true);
    assert.equal(ownerAfterJoin.assignedUserName,replayAgent.name);
    assert.deepEqual((await userAttentionFeed(owner)).items.filter(item=>item.destination.id===replayId).map(item=>({kind:item.kind,screen:item.destination.screen})),
      [{kind:'joined',screen:'owner-chat'}],'The owner feed announces exactly one deliberate Join, never internal assignment');
    assert.equal((await joinSupportConversation(replayAgent,replayId,joinInput)).duplicate,true);
    assert.equal((await createSupportConversation(owner,retryInput)).duplicate,true);
    assert.deepEqual(await notices(),[assignmentNotice,joinedNotice],'Join and creation retries cannot duplicate either attention event');
    assert.deepEqual(await joinEvents(),[{actor_user_id:replayAgent.id,event_type:'joined'}]);
    assert.equal(Number((await db.prepare('SELECT COUNT(*) count FROM support_assignments WHERE conversation_id=?').get(replayId)).count),1,'Retries retain the saved assignment');
    await updateSupportAgentSetting(admin,{userId:a.id,enabled:false,queueScope:'support'});
    await updateSupportAgentSetting(admin,{userId:b.id,enabled:false,queueScope:'support'});
    // Deliberately scrambled IDs/timestamps prove FIFO uses creation order, not query/ID coincidence.
    const fifo=[];
    for(const offset of [30,10,20])fifo.push(await createSupportConversation(owner,{subject:'FIFO '+offset,message:'Waiting fixture',idempotencyKey:crypto.randomUUID()},sameTime+offset));
    assert.ok((await listSupportConversations(admin,{status:'waiting',queue:'support'})).totalItems>=3);
    const pending=(await getSupportConversation(admin,fifo[0].id)).conversation;
    assert.equal(pending.status,'waiting');assert.equal(pending.assignedUserId,null);
    const enabled=await updateSupportAgentSetting(admin,{userId:a.id,enabled:true,queueScope:'support'});
    assert.equal(enabled.routed,3);assert.equal(enabled.remaining,0);
    const fifoRows=await db.prepare('SELECT conversation_id FROM support_assignments WHERE conversation_id IN (?,?,?) ORDER BY id').all(...fifo.map(item=>item.id));
    assert.deepEqual(fifoRows.map(row=>row.conversation_id),[fifo[1].id,fifo[2].id,fifo[0].id]);
    await updateSupportAgentSetting(admin,{userId:a.id,enabled:false,queueScope:'support'});
    await db.exec(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,assistance_category,requester_label,subject,status,created_at,updated_at,last_message_at)
      SELECT 'WAITING-BATCH-'||n,'client',${businessId},${owner.id},'general','Fixture','Waiting batch','waiting',${sameTime}+n,${sameTime}+n,${sameTime}+n
      FROM generate_series(1,101) n`);
    const batch=await updateSupportAgentSetting(admin,{userId:a.id,enabled:true,queueScope:'support'});
    assert.deepEqual(batch,{routed:100,remaining:1},'The recovery command is bounded, without limiting any agent');
    const nextBatch=await updateSupportAgentSetting(admin,{userId:a.id,enabled:true,queueScope:'support'});
    assert.deepEqual(nextBatch,{routed:1,remaining:0});
    await updateSupportAgentSetting(admin,{userId:a.id,enabled:false,queueScope:'support'});
    const awaitingStaff=await create();
    const newStaff=await createStaffAccount({name:'New routing staff',email:'new-routing-staff@example.test',password:'RoutingStaff123',accessRole:'support_agent'},admin);
    assert.deepEqual(newStaff.routing,{routed:1,remaining:0});
    assert.equal((await getSupportConversation(admin,awaitingStaff.id)).conversation.assignedUserId,newStaff.userId,'New staff creation shares FIFO availability recovery');
    const neverAssigned=await user('routing-never','team_member');
    await updateSupportAgentSetting(admin,{userId:neverAssigned.id,enabled:true,queueScope:'support'});
    await closeSupportConversation(admin,awaitingStaff.id);
    const neverFirst=await create();
    assert.equal((await getSupportConversation(admin,neverFirst.id)).conversation.assignedUserId,neverAssigned.id,'Never-assigned eligible agents win equal-workload ties ahead of lower user IDs');
    assert.equal((await db.prepare('SELECT max_open_conversations FROM support_agent_settings WHERE user_id=?').get(a.id)).max_open_conversations,3,'Legacy limit storage stays unchanged and inert');
    console.log('PASS isolated PostgreSQL unlimited >100 auto/manual/claim/reopen, same-time fair ties, concurrent balanced assignments, role/queue/paused isolation, retained replies, idempotent alerts, FIFO bounded recovery and new-staff recovery.');
  } finally {await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
