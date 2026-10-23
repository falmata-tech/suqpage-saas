import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {submitPartnerInterest} from '../lib/transport-partner-interest';
import {dispatchPartnerInterestEmails} from '../lib/transport-partner-email-delivery';
import {sendPartnerInterestEmail,type PartnerInterestEmail} from '../lib/transport-partner-email';

async function main(){
 const db=await getDb(),now=Date.now();
 const admin=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('admin-old@example.test','unused','Admin','admin',0)").run()).insertedId;
 await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(admin);
 let i=0;const job=async()=>{const raw={companyName:'Example Transport',contactName:'Test Name',email:`applicant${++i}@example.test`,phone:null,message:'Partner request',locale:'en',idempotencyKey:crypto.randomUUID()};const receipt=await submitPartnerInterest(raw,'fixture-'+i,now);return await db.prepare('SELECT d.id FROM transport_partner_interest_deliveries d JOIN transport_partner_interests i ON i.id=d.interest_id WHERE i.reference=?').get(receipt.reference);};
 const first=await job();await db.prepare("UPDATE users SET email='admin-current@example.test' WHERE id=?").run(admin);
 const emails:PartnerInterestEmail[]=[];await dispatchPartnerInterestEmails({now,limit:999,send:async email=>{emails.push(email);return{state:'accepted'};}});
 assert.equal(emails.length,1);assert.equal(emails[0].recipientEmail,'admin-current@example.test');assert.equal(emails[0].deliveryId,first.id);assert.notEqual(emails[0].recipientEmail,emails[0].interest.email);
 await dispatchPartnerInterestEmails({now,send:async()=>{throw Error('Accepted must not resend');}});
 await job();await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(admin);
 assert.equal((await dispatchPartnerInterestEmails({now,send:async()=>{throw Error('Revoked admin must not send');}})).ignored,1);
 await db.prepare("UPDATE user_access_profiles SET access_role='platform_admin' WHERE user_id=?").run(admin);
 const retry=await job();assert.equal((await dispatchPartnerInterestEmails({now,send:async()=>({state:'failed',category:'provider_failure',retryable:true})})).pending,1);
 const pending=await db.prepare('SELECT * FROM transport_partner_interest_deliveries WHERE id=?').get(retry.id);assert.equal(pending.attempts,1);assert.ok(pending.next_attempt_at>=now+30000);
 assert.equal((await dispatchPartnerInterestEmails({now:now+1000,send:async()=>{throw Error('Backoff');}})).processed,0);
 assert.equal((await dispatchPartnerInterestEmails({now:pending.next_attempt_at,send:async()=>({state:'accepted'})})).accepted,1);
 const expired=await job();await db.prepare('UPDATE transport_partner_interest_deliveries SET expires_at=? WHERE id=?').run(now,expired.id);assert.equal((await dispatchPartnerInterestEmails({now,send:async()=>{throw Error('Expired');}})).ignored,1);
 const final=await job();await db.prepare('UPDATE transport_partner_interest_deliveries SET attempts=5 WHERE id=?').run(final.id);assert.equal((await dispatchPartnerInterestEmails({now,send:async()=>({state:'failed',category:'provider_failure',retryable:true})})).failed,1);
 const config=await job();assert.equal((await dispatchPartnerInterestEmails({now,mode:'disabled'})).configured,false);const deferred=await db.prepare('SELECT state,attempts,error_category FROM transport_partner_interest_deliveries WHERE id=?').get(config.id);assert.deepEqual(deferred,{state:'pending',attempts:0,error_category:'missing_configuration'});
 // A stale worker must not begin its second send after another worker reclaimed its lease.
 await db.prepare("UPDATE transport_partner_interest_deliveries SET state='accepted' WHERE id=?").run(config.id);
 const overlapA=await job(),overlapB=await job();let release:()=>void=()=>{},started:()=>void=()=>{};
 const start=new Promise<void>(resolve=>{started=resolve;}),hold=new Promise<void>(resolve=>{release=resolve;}),calls:number[]=[];
 const stale=dispatchPartnerInterestEmails({now,limit:2,send:async email=>{calls.push(email.deliveryId);started();await hold;return{state:'accepted'};}});
 await start;const current=await dispatchPartnerInterestEmails({now:now+31000,limit:2,send:async email=>{calls.push(email.deliveryId);return{state:'accepted'};}});
 assert.equal(current.accepted,2);release();assert.equal((await stale).superseded,2);
 assert.deepEqual(calls,[overlapA.id,overlapA.id,overlapB.id],'Only an already-started uncertain send repeats; stale worker cannot start the second item');
 const localEnv={SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:'postgresql://fixture:unused@127.0.0.1:54322/postgres',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321'};
 let externalCalls=0;
 assert.deepEqual(await sendPartnerInterestEmail(emails[0],{mode:'resend',env:{...localEnv,RESEND_API_KEY:'fixture-only',NOTIFICATION_FROM_EMAIL:'team@example.test',SUQPAGE_CANONICAL_URL:'https://mirtpage.example'},send:async()=>{externalCalls++;throw Error('External forbidden');}}),{state:'deferred',category:'missing_configuration'});assert.equal(externalCalls,0);
 let requests=0;const localResult=await sendPartnerInterestEmail(emails[0],{mode:'local-mailpit',env:localEnv,send:async(url,options)=>{requests++;assert.equal(url,'http://127.0.0.1:54324/api/v1/send');assert.equal(options?.redirect,'error');const body=JSON.parse(String(options?.body));assert.deepEqual(body.To,[{Email:'admin-current@example.test'}]);assert.ok(body.Text.includes('Partner request'));assert.ok(!body.Subject.includes(emails[0].interest.email));return new Response('',{status:200});}});assert.deepEqual(localResult,{state:'accepted'});assert.equal(requests,1);
 const invalid={...emails[0],recipientEmail:'a@example.test\r\nBcc: x@example.test'};assert.deepEqual(await sendPartnerInterestEmail(invalid,{mode:'local-mailpit',env:localEnv,send:async()=>{throw Error('Injection');}}),{state:'failed',category:'invalid_message',retryable:false});
 for(const table of ['transport_partner_interests','transport_partner_interest_deliveries']){
  const state=await db.prepare('SELECT relrowsecurity rls FROM pg_class WHERE oid=to_regclass(?)').get(table);assert.equal(state.rls,true);
  const roles=await db.prepare("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role')").all();
  for(const role of roles){const permission=await db.prepare("SELECT has_table_privilege(?,?,'SELECT') allowed").get(role.rolname,table);assert.equal(permission.allowed,false);}
 }
 console.log('PASS BE-063 private recipient recheck, dedup, retries/expiry, missing config, local-only mail isolation, injection rejection and table privacy.');
}
main().finally(closeDbForTests).catch(error=>{console.error(error);process.exitCode=1;});
