import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import {createPostgresPool,postgresRuntimeConfig} from '../lib/postgres-runtime';
import type {SessionUser} from '../lib/types';
import {createSupportConversation,closeSupportConversation,reassignSupportConversation,getSupportConversation,sweepWaitingSupportAssignments,SUPPORT_WAITING_CANDIDATES_QUERY,SUPPORT_WAITING_CANDIDATE_LIMIT,SUPPORT_WAITING_TRANSITION_LIMIT} from '../lib/support';

async function main(){
 const db=await getDb();delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 try{
  assert.equal(SUPPORT_WAITING_CANDIDATE_LIMIT,100);assert.equal(SUPPORT_WAITING_TRANSITION_LIMIT,25);
  const schema=(await db.prepare('SELECT current_schema() name').get()).name;assert.match(schema,/^suqpage_test_[a-f0-9]+$/);
  const business=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('automatic-routing-fixture','Automatic routing fixture','composition','active')").run()).insertedId);
  async function actor(name:string,accessRole:SessionUser['access_role'],businessId:number|null=null){const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused',?,'admin',?,0)").run(name+'@example.test',name,businessId)).insertedId);await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,accessRole);return (await runtimeUserById(id))!;}
  const admin=await actor('Automatic manager','platform_admin'),owner=await actor('Automatic owner','client',business),a=await actor('Automatic agent A','team_member'),b=await actor('Automatic agent B','team_member'),transport=await actor('Automatic transport','team_member'),paused=await actor('Automatic paused','team_member'),impostor=await actor('Automatic nonstaff','client');
  for(const agent of [a,b])await db.prepare("INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,'support',0)").run(agent.id);
  await db.prepare("INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,'transport',0)").run(transport.id);
  await db.prepare("INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,0,'all',0)").run(paused.id);await db.prepare("INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,'all',0)").run(impostor.id);
  let ordinal=0;const clock=Date.now();
  async function waiting(count:number,category='general',createdAt=clock){const prefix='WAIT-'+(++ordinal)+'-';return (await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,assistance_category,requester_label,subject,status,created_at,updated_at,last_message_at)
   SELECT ?||n,'client',?,?,?,'Fixture','Queued request','waiting',?::bigint+n,?::bigint+n,?::bigint+n FROM generate_series(1,?)n RETURNING id`).all(prefix,business,owner.id,category,createdAt,createdAt,createdAt,count)).map(row=>Number(row.id));}
  const state=(id:number)=>db.prepare('SELECT * FROM support_conversations WHERE id=?').get(id);
  const assignments=(id:number)=>db.prepare('SELECT * FROM support_assignments WHERE conversation_id=? ORDER BY id').all(id);
  const messages=()=>db.prepare('SELECT * FROM support_messages ORDER BY id').all();
  const first=await createSupportConversation(owner,{subject:'Preserve the transcript',message:'Existing conversation body',idempotencyKey:crypto.randomUUID()});
  const closed=await createSupportConversation(owner,{subject:'Closed request remains closed',message:'Saved closed history',idempotencyKey:crypto.randomUUID()});await closeSupportConversation(admin,closed.id);
  const closedBefore=await state(closed.id),messagesBefore=await messages();await reassignSupportConversation(admin,first.id,null);assert.equal((await state(first.id)).status,'waiting');
  assert.deepEqual(await sweepWaitingSupportAssignments(clock,()=>0),{routed:1,skippedBusy:false});assert.equal((await state(first.id)).status,'open','Manual unassignment rejoins automatic routing without a manager command');
  const requeueAssignments=await assignments(first.id);assert.equal(requeueAssignments.length,2);assert.equal(requeueAssignments[1].assigned_by_user_id,null,'Scheduled work does not manufacture an administrator');assert.equal(requeueAssignments[1].reason,'automatic');
  const firstBefore=await state(first.id),historyBefore=await assignments(first.id);assert.deepEqual(await sweepWaitingSupportAssignments(clock,()=>0),{routed:0,skippedBusy:false});assert.deepEqual(await state(first.id),firstBefore);assert.deepEqual(await assignments(first.id),historyBefore);assert.deepEqual(await state(closed.id),closedBefore);assert.deepEqual(await messages(),messagesBefore);

  // More than100 older requests from an unavailable queue cannot hide eligible transport work.
  await db.prepare('UPDATE support_agent_settings SET enabled=0 WHERE user_id IN (?,?)').run(a.id,b.id);
  const older=await waiting(105,'general',clock-10000),eligible=await waiting(3,'shipment_observation',clock);
  const actualCandidates=await db.prepare(SUPPORT_WAITING_CANDIDATES_QUERY).all(0);assert.deepEqual(actualCandidates.map(row=>row.id),eligible);
  assert.deepEqual(await sweepWaitingSupportAssignments(clock,()=>0),{routed:3,skippedBusy:false});for(const id of eligible)assert.equal((await state(id)).assigned_user_id,transport.id);for(const id of older)assert.equal((await state(id)).status,'waiting');
  await db.prepare('UPDATE support_agent_settings SET enabled=0 WHERE user_id=?').run(transport.id);assert.deepEqual(await sweepWaitingSupportAssignments(clock,()=>0),{routed:0,skippedBusy:false},'Wrong-role and paused settings cannot admit waiting work');

  await db.prepare('UPDATE support_agent_settings SET enabled=1 WHERE user_id IN (?,?)').run(a.id,b.id);
  assert.equal((await db.prepare(SUPPORT_WAITING_CANDIDATES_QUERY).all(0)).length,100,'Candidate discovery is bounded before transitions');
  const firstBatch=await sweepWaitingSupportAssignments(clock,()=>0);assert.deepEqual(firstBatch,{routed:25,skippedBusy:false});
  const routedOrder=await db.prepare('SELECT conversation_id FROM support_assignments WHERE conversation_id=ANY(?::bigint[]) ORDER BY id').all(older);assert.deepEqual(routedOrder.map(row=>row.conversation_id),older.slice(0,25),'Oldest eligible requests route first');
  const concurrent=await Promise.all([sweepWaitingSupportAssignments(clock,()=>0),sweepWaitingSupportAssignments(clock,()=>0)]);assert.ok(concurrent.every(result=>result.routed<=25));assert.ok(concurrent.reduce((sum,result)=>sum+result.routed,0)>=25);
  for(let tick=0;tick<5;tick++){const result=await sweepWaitingSupportAssignments(clock,()=>0);if(result.routed===0)break;assert.ok(result.routed<=25);}
  for(const id of [...older,...eligible]){
   const history=await assignments(id);assert.equal(history.length,1);assert.equal(history[0].assigned_by_user_id,null);
   assert.equal((await db.prepare("SELECT COUNT(*)::int count FROM support_events WHERE conversation_id=? AND event_type='assigned'").get(id)).count,1);
   const current=await state(id),assignedUserId=history[0].assigned_user_id;
   assert.equal(current.assigned_user_id,assignedUserId);assert.equal(history[0].released_at,null);
   assert.ok((eligible.includes(id)?[transport.id]:[a.id,b.id]).includes(assignedUserId),'Only the saved eligible agent in this queue receives internal assignment attention');
   const event=await db.prepare("SELECT id FROM support_events WHERE conversation_id=? AND event_type='assigned'").get(id);
   assert.deepEqual(await db.prepare("SELECT source_key,kind,recipient_key,user_id,visitor_conversation_id FROM attention_notifications WHERE conversation_id=? AND kind='assigned' ORDER BY id").all(id),
    [{source_key:'support-assignment:'+event.id,kind:'assigned',recipient_key:'user:'+assignedUserId,user_id:assignedUserId,visitor_conversation_id:null}],
    'Automatic routing sends exactly one event-sourced assignment alert to the current assignee');
   assert.deepEqual(await db.prepare('SELECT id FROM attention_notifications WHERE conversation_id=? AND (user_id=? OR visitor_conversation_id IS NOT NULL)').all(id,owner.id),[],
    'Automatic assignment creates no participant attention before explicit Join');
   const participant=(await getSupportConversation(owner,id)).conversation;
   assert.equal(participant.agentJoined,false);assert.equal(participant.assignedUserName,null,'Internal routing never announces an agent to the owner');
  }
  const workloads=await db.prepare("SELECT assigned_user_id,COUNT(*)::int count FROM support_conversations WHERE status='open' AND assigned_user_id IN (?,?) GROUP BY assigned_user_id ORDER BY assigned_user_id").all(a.id,b.id);assert.equal(workloads.length,2);assert.ok(Math.abs(workloads[0].count-workloads[1].count)<=1);assert.ok(![paused.id,impostor.id].includes((await state(older[0])).assigned_user_id));
  assert.deepEqual(await state(first.id),firstBefore);assert.deepEqual(await state(closed.id),closedBefore);assert.deepEqual(await messages(),messagesBefore,'Routing never edits an existing transcript/contact');

  const budgetCases=await waiting(3);let tick=-1000;assert.deepEqual(await sweepWaitingSupportAssignments(clock,()=>tick+=1000),{routed:1,skippedBusy:false});assert.equal((await db.prepare("SELECT COUNT(*)::int count FROM support_conversations WHERE id=ANY(?::bigint[]) AND status='waiting'").get(budgetCases)).count,2);await sweepWaitingSupportAssignments(clock,()=>0);
  const timeoutSettings=()=>db.prepare("SELECT pg_backend_pid() pid,current_setting('statement_timeout') statement_timeout,current_setting('lock_timeout') lock_timeout,current_setting('idle_in_transaction_session_timeout') idle_timeout").get();
  const settingsBefore=await timeoutSettings();await db.runner.transaction(async()=>{await sweepWaitingSupportAssignments(clock,()=>0);const local=await timeoutSettings();assert.equal(local.pid,settingsBefore.pid);assert.equal(local.statement_timeout,'1s');assert.equal(local.lock_timeout,'50ms');assert.equal(local.idle_timeout,'5s');});assert.deepEqual(await timeoutSettings(),settingsBefore,'LOCAL limits reset on commit');
  const rollback=Error('Fixture outer rollback');await assert.rejects(()=>db.runner.transaction(async()=>{await sweepWaitingSupportAssignments(clock,()=>0);throw rollback;}),error=>error===rollback);assert.deepEqual(await timeoutSettings(),settingsBefore,'LOCAL limits reset on rollback');
  const config=postgresRuntimeConfig(process.env)!;const pool=createPostgresPool({...config,poolMax:1}),blocker=await pool.connect();try{await blocker.query('BEGIN');await blocker.query("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");const before=performance.now();assert.deepEqual(await sweepWaitingSupportAssignments(clock),{routed:0,skippedBusy:true});assert.ok(performance.now()-before<1500);}finally{await blocker.query('ROLLBACK');blocker.release();await pool.end();}

  const failing=(await waiting(1))[0],failingBefore=await state(failing);
  await db.exec(`CREATE FUNCTION fail_automatic_assignment_alert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.source_key LIKE 'support-assignment:%' THEN RAISE EXCEPTION 'fixture assignment alert unavailable'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_automatic_assignment_alert BEFORE INSERT ON attention_notifications FOR EACH ROW EXECUTE FUNCTION fail_automatic_assignment_alert()`);
  await assert.rejects(()=>sweepWaitingSupportAssignments(clock,()=>0),/fixture assignment alert unavailable/);assert.deepEqual(await state(failing),failingBefore);assert.deepEqual(await assignments(failing),[]);assert.deepEqual(await timeoutSettings(),settingsBefore);await db.exec('DROP TRIGGER fail_automatic_assignment_alert ON attention_notifications; DROP FUNCTION fail_automatic_assignment_alert()');
  await db.exec(`CREATE FUNCTION delay_automatic_assignment() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.status='waiting' AND NEW.status='open' THEN PERFORM pg_sleep(2); END IF; RETURN NEW; END $$; CREATE TRIGGER delay_automatic_assignment BEFORE UPDATE ON support_conversations FOR EACH ROW EXECUTE FUNCTION delay_automatic_assignment()`);
  await assert.rejects(()=>sweepWaitingSupportAssignments(clock),/statement timeout/);assert.deepEqual(await state(failing),failingBefore);assert.deepEqual(await assignments(failing),[]);assert.deepEqual(await timeoutSettings(),settingsBefore);await db.exec('DROP TRIGGER delay_automatic_assignment ON support_conversations; DROP FUNCTION delay_automatic_assignment()');assert.equal((await sweepWaitingSupportAssignments(clock,()=>0)).routed,1);
  for(const invalid of [-1,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])await assert.rejects(()=>sweepWaitingSupportAssignments(invalid),/Request could not be accepted/);
  console.log('PASS S121 isolated PostgreSQL automatic waiting pickup/requeue, no fake actor, fair FIFO,100-candidate/25-transition/time budgets, unavailable-prefix/role/queue isolation, exact-once concurrency/alerts, busy-lock skip, transcript/closed/assigned preservation and atomic rollback/LOCAL timeout restoration.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
