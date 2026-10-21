import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {postgresRuntimeServices} from '../lib/postgres-runtime-services';
import {dispatchTrackingEmails} from '../lib/tracking-email-delivery';
import {trackingEmailHash,trackingCode,trackingCodeHash,requestTrackingCode,verifyTrackingCode,updateTrackingShipment,cleanupTrackingIdentity,type TrackingChallengeRow} from '../lib/tracking';
import {runtimeUserById} from '../lib/catalog-runtime';
import {trackingEmailContent,type TrackingEmail} from '../lib/tracking-email';
async function main(){
 process.env.SUQPAGE_POSTGRES_POOL_MAX='4';const db=await getDb(),now=1_800_000_000_000,env:Record<string,string|undefined>=process.env;
 const runner=postgresRuntimeServices().runner,transaction=runner.transaction.bind(runner);let depth=0;
 runner.transaction=async function<T>(operation:()=>Promise<T>):Promise<T>{return transaction(async()=>{depth++;try{return await operation();}finally{depth--;}});};
 try{
  const recipient=(await db.prepare("INSERT INTO tracking_recipients(email,email_hash,locale,verified_at) VALUES('outbox@example.test',?,'en',?)").run(trackingEmailHash('outbox@example.test'),now)).insertedId;
  const actorId=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('outbox-admin@example.test','unused','Outbox fixture','admin',0)").run()).insertedId;await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(actorId);const actor=(await runtimeUserById(actorId))!;
  let fixtureIndex=0;
  async function job(at=now){const id=++fixtureIndex,legs=[{id:crypto.randomUUID(),providerName:'Provider '+id,origin:'Origin',destination:'Destination',method:'truck'}],reference='SHP-'+id.toString(16).toUpperCase().padStart(20,'0');
   const shipment=(await db.prepare('INSERT INTO tracking_shipments(reference,recipient_id,label,legs,idempotency_key,created_at,updated_at) VALUES(?,?,?,?::jsonb,?,?,?)').run(reference,recipient,'Outbox '+id,JSON.stringify(legs),crypto.randomUUID(),at,at)).insertedId;
   await db.prepare("INSERT INTO tracking_events(shipment_id,event_type,detail,created_at) VALUES(?,'submitted',?::jsonb,?)").run(shipment,JSON.stringify({reference,label:'Outbox '+id,version:1,legs,recipientId:recipient,recipientLocale:'en'}),at);
   const delivery=(await db.prepare("INSERT INTO tracking_email_deliveries(kind,shipment_id,created_at,next_attempt_at,expires_at) VALUES('initial',?,?,?,?)").run(shipment,at,at,at+24*60*60_000)).insertedId;return{shipment,delivery,reference};}
  const first=await job();let sends=0,release:()=>void=()=>{},entered:()=>void=()=>{};let gate=new Promise<void>(r=>{release=r;}),started=new Promise<void>(r=>{entered=r;});
  const pending=dispatchTrackingEmails({now,limit:1,send:async()=>{assert.equal(depth,0,'Provider HTTP never runs inside a database transaction');sends++;entered();await gate;return{state:'accepted'};}});await started;
  const concurrent=await dispatchTrackingEmails({now,limit:1,send:async()=>{throw Error('Lease must prevent concurrent sends');}});assert.equal(concurrent.processed,0);release();assert.equal((await pending).accepted,1);assert.equal(sends,1);
  assert.equal((await db.prepare('SELECT attempts FROM tracking_email_deliveries WHERE id=?').get(first.delivery)).attempts,1);
  const second=await job();gate=new Promise<void>(r=>{release=r;});started=new Promise<void>(r=>{entered=r;});const deliveries:number[]=[];
  const stale=dispatchTrackingEmails({now,limit:1,send:async email=>{deliveries.push(email.deliveryId);entered();await gate;return{state:'accepted'};}});await started;
  const recovered=await dispatchTrackingEmails({now:now+31_000,limit:1,send:async email=>{deliveries.push(email.deliveryId);assert.equal(depth,0);return{state:'accepted'};}});assert.equal(recovered.accepted,1);release();assert.equal((await stale).superseded,1);assert.deepEqual(deliveries,[second.delivery,second.delivery]);
  const fenced=await db.prepare('SELECT state,attempts FROM tracking_email_deliveries WHERE id=?').get(second.delivery);assert.deepEqual(fenced,{state:'accepted',attempts:2});
  const ambiguous=await job(),originalPayloads:TrackingEmail[]=[];
  await dispatchTrackingEmails({now,limit:1,send:async email=>{originalPayloads.push(email);return{state:'failed',category:'provider_failure',retryable:true};}});
  const ambiguousJob=await db.prepare('SELECT next_attempt_at FROM tracking_email_deliveries WHERE id=?').get(ambiguous.delivery),originalShipment=await db.prepare('SELECT * FROM tracking_shipments WHERE id=?').get(ambiguous.shipment);
  await updateTrackingShipment(actor,{shipmentId:ambiguous.shipment,reference:ambiguous.reference,expectedVersion:1,label:'Later edit',legs:originalShipment.legs.map((l:Record<string,unknown>)=>({...l,providerName:'Changed provider'}))},now+1000);
  const reverify=await requestTrackingCode({email:'outbox@example.test',locale:'om',ipKey:'locale'},now+1000),challengeRow=await db.prepare('SELECT * FROM tracking_challenges WHERE id=?').get(reverify.challengeId) as TrackingChallengeRow;
  await verifyTrackingCode({challengeId:reverify.challengeId,code:trackingCode(challengeRow),ipKey:'locale'},now+1001);
  assert.equal((await db.prepare('SELECT locale FROM tracking_recipients WHERE id=?').get(recipient)).locale,'om');
  await dispatchTrackingEmails({now:ambiguousJob.next_attempt_at,limit:1,send:async email=>{originalPayloads.push(email);return{state:'accepted'};}});
  assert.equal(originalPayloads.length,2);assert.deepEqual(originalPayloads[1],originalPayloads[0],'Ambiguous retry keeps immutable initial fields, locale and provider idempotency identity');assert.deepEqual(trackingEmailContent(originalPayloads[1],'https://suqpage.example.test'),trackingEmailContent(originalPayloads[0],'https://suqpage.example.test'));
  const retry=await job(),initial=await dispatchTrackingEmails({now,limit:1,send:async()=>({state:'failed',category:'provider_failure',retryable:true})});assert.equal(initial.pending,1);
  const failed=await db.prepare('SELECT * FROM tracking_email_deliveries WHERE id=?').get(retry.delivery);assert.equal(failed.attempts,1);assert.ok(failed.next_attempt_at>=now+30_000);assert.equal((await dispatchTrackingEmails({now:now+29_999,limit:1,send:async()=>{throw Error('Backoff must hold');}})).processed,0);
  assert.equal((await dispatchTrackingEmails({now:failed.next_attempt_at,limit:1,send:async()=>({state:'accepted'})})).accepted,1);
  const permanent=await job();assert.equal((await dispatchTrackingEmails({now,limit:1,send:async()=>({state:'failed',category:'provider_rejected',retryable:false})})).failed,1);assert.equal((await db.prepare('SELECT state FROM tracking_email_deliveries WHERE id=?').get(permanent.delivery)).state,'failed');
  const terminal=await job();await db.prepare('UPDATE tracking_email_deliveries SET attempts=5 WHERE id=?').run(terminal.delivery);assert.equal((await dispatchTrackingEmails({now,limit:1,send:async()=>({state:'failed',category:'provider_failure',retryable:true})})).failed,1);assert.equal((await db.prepare('SELECT attempts FROM tracking_email_deliveries WHERE id=?').get(terminal.delivery)).attempts,6);
  const expired=await job();await db.prepare('UPDATE tracking_email_deliveries SET expires_at=? WHERE id=?').run(now,expired.delivery);const expiredRun=await dispatchTrackingEmails({now,send:async()=>{throw Error('Expired must not send');}});assert.equal(expiredRun.ignored,1);
  const deferred=await job(),interrupted=await job();await db.prepare("UPDATE tracking_email_deliveries SET state='sending',attempts=1,lease_until=? WHERE id=?").run(now-1,interrupted.delivery);
  const noConfig=await dispatchTrackingEmails({now});assert.equal(noConfig.configured,false);assert.equal(noConfig.pending,2);assert.deepEqual(await db.prepare('SELECT state,attempts,error_category FROM tracking_email_deliveries WHERE id=?').get(deferred.delivery),{state:'pending',attempts:0,error_category:'missing_configuration'});assert.deepEqual(await db.prepare('SELECT state,attempts,lease_until,error_category FROM tracking_email_deliveries WHERE id=?').get(interrupted.delivery),{state:'pending',attempts:1,lease_until:null,error_category:'missing_configuration'},'Configuration loss recovers expired leases honestly without consuming another attempt');
  await dispatchTrackingEmails({now:now+61_000,send:async()=>({state:'accepted'})});
  const beforeRevocation=await job(),revoked=await job();const outbound:TrackingEmail[]=[];
  const fresh=await dispatchTrackingEmails({now,limit:2,send:async email=>{outbound.push(email);assert.equal(depth,0);await db.prepare('UPDATE tracking_shipments SET revoked_at=? WHERE id=?').run(now,revoked.shipment);return{state:'accepted'};}});assert.equal(fresh.accepted,1);assert.equal(fresh.ignored,1);assert.deepEqual(outbound.map(e=>e.deliveryId),[beforeRevocation.delivery]);
  console.log('PASS S138 outbox leases: no HTTP transaction, concurrent exclusion, expired-lease recovery/fenced stale finalization, stable logical identity, retry backoff/permanent/max6/expiry, honest no-configuration deferral and fresh per-shipment revocation.');
  const challenge=await requestTrackingCode({email:'rotation@example.test',ipKey:'rotation'},now),row=await db.prepare('SELECT * FROM tracking_challenges WHERE id=?').get(challenge.challengeId) as TrackingChallengeRow;
  assert.equal(row.code_hash,trackingCodeHash(row.id,row.email,trackingCode(row)));
  const salt=env.PRIVACY_SALT;env.PRIVACY_SALT='isolated-rotated-salt-at-least24characters';
  try{const changed=await dispatchTrackingEmails({now,send:async()=>{throw Error('Rotated proof must not send an unverifiable code');}});assert.equal(changed.ignored,1);}finally{if(salt===undefined)delete env.PRIVACY_SALT;else env.PRIVACY_SALT=salt;}
  for(let i=0;i<2;i++){await db.prepare('INSERT INTO tracking_sessions(token_hash,recipient_id,created_at,expires_at) VALUES(?,?,?,?)').run(crypto.randomBytes(32).toString('hex'),recipient,1,2);await db.prepare("INSERT INTO tracking_challenges(id,email,email_hash,nonce,code_hash,locale,created_at,expires_at) VALUES(?,'old@example.test',?,?,?,'en',1,2)").run(crypto.randomBytes(16).toString('hex'),crypto.randomBytes(32).toString('hex'),crypto.randomBytes(32).toString('hex'),crypto.randomBytes(32).toString('hex'));}
  const activeToken=crypto.randomBytes(32).toString('hex');await db.prepare('INSERT INTO tracking_sessions(token_hash,recipient_id,created_at,expires_at) VALUES(?,?,?,?)').run(activeToken,recipient,now,now+100_000);
  assert.deepEqual(await cleanupTrackingIdentity(now,1),{sessions:1,challenges:1});assert.equal((await db.prepare('SELECT COUNT(*) n FROM tracking_sessions WHERE expires_at<=?').get(now)).n,1);assert.equal((await db.prepare('SELECT COUNT(*) n FROM tracking_sessions WHERE token_hash=?').get(activeToken)).n,1);
  console.log('PASS S138 salt-rotation proof suppression and bounded ephemeral credential cleanup preserve active sessions and independent recipient/shipment history.');
 }finally{runner.transaction=transaction;await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
