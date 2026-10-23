import assert from 'node:assert/strict';
import {test} from 'node:test';
import {supportEscalationEmailContent,supportEscalationEmailKey,supportEscalationEmailOrigin,supportEscalationEmailReadiness,sendSupportEscalationEmail,type SupportEscalationEmail} from '../lib/support-escalation-email';
import {dispatchSupportEscalationEmails,supportEscalationEmailPayload} from '../lib/support-escalation-email-delivery';
import {SUPPORT_STAFF_REPLY_TARGET_MS} from '../lib/support-assignment-response';
import {createUiText,parseLocale,type Locale} from '../lib/i18n/core';
import {parse as parsePgConnection} from 'pg-connection-string';
import {notifySupportQueue} from '../lib/support-notifications';
import am from '../lib/i18n/messages/am.json';import om from '../lib/i18n/messages/om.json';import so from '../lib/i18n/messages/so.json';import ti from '../lib/i18n/messages/ti.json';

const local={NODE_ENV:'development',SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:'postgresql://local:unused@127.0.0.1:54322/postgres',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321'};
const hosted={NODE_ENV:'production',SUQPAGE_CANONICAL_URL:'https://suqpage.example',RESEND_API_KEY:'fixture-key-not-a-secret',NOTIFICATION_FROM_EMAIL:'Suqpage <alerts@suqpage.example>'};
const email:SupportEscalationEmail={notificationId:81,recipientEmail:'admin@example.test',publicRef:'SUP-QA126',queue:'transport',assignedStaffName:'Test transport agent',dashboardUrl:'https://suqpage.example/dashboard/support/42?queue=transport&status=overdue',language:'en'};

test('BE-059 optional Telegram presentation changes only its authored brand prefix',async()=>{
 const keys=['SUQPAGE_TELEGRAM_BOT_TOKEN','SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID','NEXT_PUBLIC_APP_URL'] as const;
 const previous=keys.map(key=>[key,process.env[key]] as const);let sends=0;
 try{
  process.env.SUQPAGE_TELEGRAM_BOT_TOKEN='local-fixture-no-secret';process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID='fixture-target';process.env.NEXT_PUBLIC_APP_URL='https://suqpage.example';
  const result=await notifySupportQueue({id:42,publicRef:'SUP-QA126',businessName:'Fixture business',assignedUserName:'Fixture agent'},{send:async(url,init)=>{
   sends++;assert.equal(String(url),'https://api.telegram.org/botlocal-fixture-no-secret/sendMessage');assert.equal(init?.method,'POST');assert.ok(init?.signal);assert.deepEqual(JSON.parse(String(init?.body)),{chat_id:'fixture-target',text:'New MirtPage support request SUP-QA126 from Fixture business. Assigned to Fixture agent.\nhttps://suqpage.example/dashboard/support/42',disable_web_page_preview:true});return new Response('{}');
  }});assert.equal(result,'sent');assert.equal(sends,1);
 }finally{for(const[key,value]of previous){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});

test('DEP-043 S126 email configuration is observable without values and local mode never falls through to Resend',async()=>{
 assert.deepEqual(supportEscalationEmailReadiness('resend',{}),{ready:false});assert.deepEqual(supportEscalationEmailReadiness('resend',hosted),{ready:true});
 assert.deepEqual(supportEscalationEmailReadiness('local-mailpit',local),{ready:true});assert.equal(supportEscalationEmailOrigin('local-mailpit',local),'http://127.0.0.1:3102');
 for(const invalid of [{...local,NODE_ENV:'production'},{...local,NETLIFY:'true'},{...local,SUQPAGE_POSTGRES_URL:'postgresql://remote.example:54322/postgres'},{...local,NEXT_PUBLIC_SUPABASE_URL:'https://remote.example'},{...local,SUQPAGE_DATABASE_DRIVER:'other'}])assert.deepEqual(supportEscalationEmailReadiness('local-mailpit',invalid),{ready:false});
 assert.deepEqual(supportEscalationEmailReadiness('resend',{...hosted,...local}),{ready:false},'Even configured local preview values cannot select an external provider');
 for(const host of ['127.0.0.1','127.0.0.2','localhost','[::1]','127.1','2130706433','[::ffff:127.0.0.1]']){
  assert.deepEqual(supportEscalationEmailReadiness('resend',{...hosted,SUQPAGE_POSTGRES_URL:`postgresql://unused@${host}:56322/postgres`,NEXT_PUBLIC_SUPABASE_URL:'https://hosted-auth.example'}),{ready:false},`Local DB host ${host} must block external email independent of port or Auth host`);
  assert.deepEqual(supportEscalationEmailReadiness('resend',{...hosted,SUQPAGE_POSTGRES_URL:'postgresql://hosted-db.example/postgres',NEXT_PUBLIC_SUPABASE_URL:`http://${host}:56321`}),{ready:false},`Local Auth host ${host} must block external email independent of port or DB host`);
 }
 for(const invalid of [{...hosted,RESEND_API_KEY:''},{...hosted,NOTIFICATION_FROM_EMAIL:'bad\r\nBcc: wrong@example.test'},{...hosted,SUQPAGE_CANONICAL_URL:'http://suqpage.example'},{...hosted,SUQPAGE_CANONICAL_URL:'https://name:password@suqpage.example'}])assert.deepEqual(supportEscalationEmailReadiness('resend',invalid),{ready:false});
 let calls=0;const result=await sendSupportEscalationEmail(email,{env:{},send:async()=>{calls++;throw Error('must not send');}});
 assert.deepEqual(result,{state:'deferred',category:'missing_configuration'});assert.equal(calls,0);
});

test('BE-050/DEP-043 S126 Resend uses only generic localized facts and a stable notification idempotency key',async()=>{
 const requests:Array<{url:string;init:RequestInit}>=[];
 const send:typeof fetch=async(url,init)=>{requests.push({url:String(url),init:init!});return new Response('{}',{status:200});};
 for(let attempt=0;attempt<2;attempt++)assert.deepEqual(await sendSupportEscalationEmail(email,{env:hosted,send}),{state:'accepted'});
 assert.equal(requests.length,2);for(const request of requests){
  assert.equal(request.url,'https://api.resend.com/emails');assert.equal(request.init.redirect,'error');assert.equal(request.init.method,'POST');
  const headers=request.init.headers as Record<string,string>;assert.equal(headers['Idempotency-Key'],supportEscalationEmailKey(81));assert.equal(headers.Authorization,'Bearer fixture-key-not-a-secret');
  assert.ok(request.init.signal instanceof AbortSignal);const body=JSON.parse(String(request.init.body));assert.deepEqual(Object.keys(body).sort(),['from','subject','text','to']);
  assert.deepEqual(body.to,['admin@example.test']);assert.equal(body.from,'MirtPage <alerts@suqpage.example>');assert.match(body.subject,/^MirtPage ·/);assert.match(body.text,/SUP-QA126/);assert.match(body.text,/Test transport agent/);assert.match(body.text,/https:\/\/suqpage\.example\/dashboard\/support\/42/);
  assert.doesNotMatch(JSON.stringify(body),/route|phone|customer|cookie|token|fixture-key/);
 }
 assert.equal(requests[0].init.body,requests[1].init.body);assert.throws(()=>supportEscalationEmailKey(0));
});

test('DEP-043 S126 installed PostgreSQL DSN endpoint overrides cannot disguise the email target',async()=>{
 const remoteDisguisedAsLocal='postgresql://unused@127.0.0.1:54322/postgres?host=remote.example&port=5432';
 const localDisguisedAsRemote='postgresql://unused@remote.example:5432/postgres?host=127.0.0.1&port=54322';
 assert.equal(parsePgConnection(remoteDisguisedAsLocal).host,'remote.example');assert.equal(parsePgConnection(remoteDisguisedAsLocal).port,'5432');
 assert.equal(parsePgConnection(localDisguisedAsRemote).host,'127.0.0.1');assert.equal(parsePgConnection(localDisguisedAsRemote).port,'54322');
 for(const dsn of [remoteDisguisedAsLocal,localDisguisedAsRemote,
  `${local.SUQPAGE_POSTGRES_URL}?host=`,`${local.SUQPAGE_POSTGRES_URL}?port=54322`,`${local.SUQPAGE_POSTGRES_URL}?connectionString=postgresql%3A%2F%2Fremote.example%2Fdb`,
  `${local.SUQPAGE_POSTGRES_URL}?hos%74=remote.example`,`${local.SUQPAGE_POSTGRES_URL}?PORT=54322`,`${local.SUQPAGE_POSTGRES_URL}?connection%53tring=postgresql%3A%2F%2Fremote.example%2Fdb`]){
  assert.deepEqual(supportEscalationEmailReadiness('local-mailpit',{...local,SUQPAGE_POSTGRES_URL:dsn}),{ready:false});
  const env={...hosted,SUQPAGE_POSTGRES_URL:dsn,NEXT_PUBLIC_SUPABASE_URL:'https://hosted-auth.example'};
  assert.deepEqual(supportEscalationEmailReadiness('resend',env),{ready:false});
  let sends=0;assert.deepEqual(await sendSupportEscalationEmail(email,{env,send:async()=>{sends++;throw Error('No disguised target may send');}}),{state:'deferred',category:'missing_configuration'});assert.equal(sends,0);
 }
 assert.deepEqual(supportEscalationEmailReadiness('local-mailpit',{...local,SUQPAGE_POSTGRES_URL:`${local.SUQPAGE_POSTGRES_URL}?sslmode=disable&application_name=fixture&options=-csearch_path%3Dpublic`}),{ready:true});
 assert.deepEqual(supportEscalationEmailReadiness('resend',{...hosted,SUQPAGE_POSTGRES_URL:'postgresql://unused@remote.example/db?sslmode=verify-full&application_name=fixture'}),{ready:true},'Ordinary TLS/application options do not change the endpoint');
});

test('DEP-043 S126 explicit local email targets only the installed Mailpit send endpoint without provider credentials',async()=>{
 let calls=0;
 const result=await sendSupportEscalationEmail({...email,dashboardUrl:email.dashboardUrl.replace('https://suqpage.example','http://127.0.0.1:3102')},{mode:'local-mailpit',env:{...local,RESEND_API_KEY:'unused-hosted-key'},send:async(url,init)=>{
  calls++;assert.equal(String(url),'http://127.0.0.1:54324/api/v1/send');assert.equal(init?.redirect,'error');assert.deepEqual(init?.headers,{'Content-Type':'application/json'});
  const body=JSON.parse(String(init?.body));assert.deepEqual(body.From,{Email:'alerts@suqpage.test',Name:'MirtPage'});assert.deepEqual(body.To,[{Email:'admin@example.test'}]);assert.equal(body.Headers['Message-ID'],'<suqpage-support-overdue-81@suqpage.test>');assert.doesNotMatch(String(init?.body),/unused-hosted-key/);return new Response('{}');
 }});assert.deepEqual(result,{state:'accepted'});assert.equal(calls,1);
});

test('BE-050/FE-049 S132 escalation email uses active languages and English for retained inactive preferences',()=>{
 const catalogs={en:{},am,om,so,ti};
 for(const language of Object.keys(catalogs) as Locale[]){
  const t=createUiText(catalogs[parseLocale(language)]),content=supportEscalationEmailContent({...email,language});
  assert.equal(content.subject,`MirtPage · ${t('A chat is overdue for a reply.')} · SUP-QA126`);
  assert.ok(content.text.includes(t('Assigned to {value1}',{value1:'Test transport agent'})));assert.ok(content.text.includes(t('Transport')));assert.ok(content.text.includes(email.dashboardUrl));
  if(parseLocale(language)!=='en'){
   assert.ok(!content.subject.includes('A chat is overdue for a reply.'),'Non-English subjects must use the existing native catalog');
   assert.doesNotMatch(content.text,/Reference:|Open conversation:/,'Reference and action labels must also use the recipient language');
  }
 }
});

test('DEP-043 S126 email rejects unsafe recipient/reference/actor/link input without sending',async()=>{
 const cases=[{recipientEmail:'a@example.test\r\nBcc: wrong@example.test'},{publicRef:'SUP-../../customer'},{assignedStaffName:'Agent\ncustomer content'},{dashboardUrl:'https://foreign.example/dashboard/support/42'},{dashboardUrl:'https://suqpage.example/dashboard/business'},{dashboardUrl:'https://suqpage.example/dashboard/support/42#secret'},{notificationId:NaN}];
 for(const patch of cases){let sends=0;const result=await sendSupportEscalationEmail({...email,...patch},{env:hosted,send:async()=>{sends++;throw Error('must not send');}});assert.deepEqual(result,{state:'failed',category:'invalid_message',retryable:false});assert.equal(sends,0);}
});

test('DEP-043 S126 provider errors remain generic and only bounded transient failures retry',async()=>{
 for(const status of [400,401,403,409,422,429,500,503]){
  const result=await sendSupportEscalationEmail(email,{env:hosted,send:async()=>new Response('private provider detail',{status})});assert.deepEqual(result,{state:'failed',category:'provider_rejected',retryable:status===429||status>=500});assert.ok(!JSON.stringify(result).includes('private'));
 }
 assert.deepEqual(await sendSupportEscalationEmail(email,{env:hosted,send:async()=>{throw Error('private credential detail');}}),{state:'failed',category:'provider_failure',retryable:true});
});

test('DEP-043 S126 actual fetch signal aborts an unsettled provider request after four seconds',{timeout:7000},async()=>{
 const started=performance.now();
 const result=await sendSupportEscalationEmail(email,{env:hosted,send:async(_url,init)=>new Promise((_resolve,reject)=>{init!.signal!.addEventListener('abort',()=>reject(init!.signal!.reason),{once:true});})});
 assert.deepEqual(result,{state:'failed',category:'provider_failure',retryable:true});assert.ok(performance.now()-started>=3900);assert.ok(performance.now()-started<6000);
});

test('BE-050 S126 fresh private projection requires admin role, current assignment and assignment-aware unanswered cycle',()=>{
 const start=Date.UTC(2026,9,17),row={id:81,source_key:'support-reply-overdue:42:99:7',kind:'reply_overdue',user_id:1,recipient_key:'user:1',conversation_id:42,email:'current-admin@example.test',access_role:'platform_admin',language:'so',public_ref:'SUP-QA126',case_status:'open',resolved_at:null,assigned_user_id:8,assistance_category:'shipment_observation',awaiting_staff_since:start,awaiting_staff_message_id:99,assignment_id:7,assignment_user_id:8,assigned_at:start+5*60_000,released_at:null,assigned_staff_name:'Current agent',assigned_staff_role:'team_member',assigned_staff_scope:'transport'};
 const dueAt=row.assigned_at+SUPPORT_STAFF_REPLY_TARGET_MS;
 assert.equal(supportEscalationEmailPayload(row,dueAt-1,'https://suqpage.example'),null);
 const message=supportEscalationEmailPayload(row,dueAt,'https://suqpage.example');assert.equal(message?.recipientEmail,'current-admin@example.test');assert.equal(message?.language,'en','Inactive saved language falls back only in presentation');assert.equal(row.language,'so','Saved preference stays untouched');assert.equal(message?.assignedStaffName,'Current agent');assert.match(message!.dashboardUrl,/queue=transport&status=overdue/);
 for(const patch of [{access_role:'client'},{access_role:'team_member'},{recipient_key:'user:7'},{kind:'message'},{case_status:'closed'},{resolved_at:start},{assigned_user_id:null},{assignment_id:8},{assignment_user_id:9},{released_at:start},{awaiting_staff_message_id:100},{awaiting_staff_since:null},{assigned_at:null},{assigned_staff_role:'client'},{assigned_staff_scope:'support'},{source_key:'support-reply-overdue:42:99:0'}])assert.equal(supportEscalationEmailPayload({...row,...patch},start+20*60_000,'https://suqpage.example'),null);
 assert.equal(supportEscalationEmailPayload({...row,access_role:'operations_manager',assigned_staff_role:'operations_manager',assigned_staff_scope:null,language:'invalid'},start+20*60_000,'https://suqpage.example')?.language,'en');
});

test('DEP-043 S126 substitute rendering context cannot bypass default provider configuration',async()=>{
 await assert.rejects(()=>dispatchSupportEscalationEmails({context:{origin:'https://suqpage.example'}}),/requires a substitute send port/);
 for(const origin of ['file:///tmp','https://name:password@suqpage.example','https://suqpage.example/path','https://suqpage.example?customer=data','https://suqpage.example#fragment'])await assert.rejects(()=>dispatchSupportEscalationEmails({send:async()=>({state:'accepted'}),context:{origin}}),/Invalid email dispatch context/);
});
