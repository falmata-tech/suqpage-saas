import assert from 'node:assert/strict';
import {test} from 'node:test';
import {gmailSmtpConfiguration,sendGmailSmtpEmail,type GmailSmtpFactory,type GmailSmtpMessage} from '../lib/gmail-smtp-email';
import {selectedHostedEmailMode,sendSupportEscalationEmail,supportEscalationEmailReadiness,type SupportEscalationEmail} from '../lib/support-escalation-email';
import {sendTrackingEmail,type TrackingEmail} from '../lib/tracking-email';
import {platformEnvironment} from '../lib/platform-environment.mjs';

const hosted={
  NODE_ENV:'production',SUQPAGE_DATABASE_DRIVER:'postgres',
  SUQPAGE_POSTGRES_URL:'postgresql://fixture:unused@db.example.test:5432/postgres',
  NEXT_PUBLIC_SUPABASE_URL:'https://auth.example.test',NEXT_PUBLIC_APP_URL:'https://mirtpage.com',
  SUQPAGE_CANONICAL_URL:'https://mirtpage.com',MIRTPAGE_TRANSACTIONAL_EMAIL_PROVIDER:'gmail-smtp',
  MIRTPAGE_SMTP_USER:'owner@gmail.com',MIRTPAGE_SMTP_APP_PASSWORD:'abcd efgh ijkl mnop',
  RESEND_API_KEY:'fixture-resend-key',NOTIFICATION_FROM_EMAIL:'Other <elsewhere@example.test>',
};
const code:TrackingEmail={deliveryId:7,recipientEmail:'recipient@example.test',locale:'en',kind:'code',code:'123456'};
const alert:SupportEscalationEmail={notificationId:81,recipientEmail:'admin@example.test',publicRef:'SUP-QA126',queue:'transport',assignedStaffName:'Current agent',dashboardUrl:'https://mirtpage.com/dashboard/support/42?queue=transport&status=overdue',language:'en'};
const message:GmailSmtpMessage={recipientEmail:'recipient@example.test',subject:'Your MirtPage code',text:'Code: 123456',deliveryKey:'suqpage-tracking-7'};

test('ADR-0031 selects Gmail explicitly and refuses unknown selections without a Resend fallback',async()=>{
  const actualBoundary=platformEnvironment({MIRTPAGE_TRANSACTIONAL_EMAIL_PROVIDER:'gmail-smtp',MIRTPAGE_SMTP_USER:'owner@gmail.com',MIRTPAGE_SMTP_APP_PASSWORD:'abcdefghijklmnop'});
  assert.equal(actualBoundary.MIRTPAGE_TRANSACTIONAL_EMAIL_PROVIDER,'gmail-smtp');
  assert.equal(actualBoundary.MIRTPAGE_SMTP_USER,'owner@gmail.com');
  assert.equal(actualBoundary.MIRTPAGE_SMTP_APP_PASSWORD,'abcdefghijklmnop');
  assert.equal(selectedHostedEmailMode({}),'resend');
  assert.equal(selectedHostedEmailMode(hosted),'gmail-smtp');
  assert.equal(selectedHostedEmailMode({...hosted,MIRTPAGE_TRANSACTIONAL_EMAIL_PROVIDER:'gmail'}),'disabled');
  assert.deepEqual(supportEscalationEmailReadiness('gmail-smtp',hosted),{ready:true});
  for(const env of [
    {...hosted,MIRTPAGE_SMTP_USER:''},
    {...hosted,MIRTPAGE_SMTP_APP_PASSWORD:''},
    {...hosted,MIRTPAGE_SMTP_USER:'bad\r\nBcc: victim@example.test'},
    {...hosted,MIRTPAGE_SMTP_APP_PASSWORD:'abcd\nefghijklmnop'},
    {...hosted,SUQPAGE_POSTGRES_URL:'postgresql://unused@127.0.0.1:54322/postgres'},
    {...hosted,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321'},
    {...hosted,SUQPAGE_POSTGRES_URL:'postgresql://unused@db.example.test/postgres?host=127.0.0.1'},
  ])assert.deepEqual(supportEscalationEmailReadiness('gmail-smtp',env),{ready:false});
  assert.equal(gmailSmtpConfiguration(hosted)?.user,'owner@gmail.com');
  assert.equal(gmailSmtpConfiguration(hosted)?.password,'abcdefghijklmnop');
  let fetches=0,transports=0;
  const env={...hosted,MIRTPAGE_TRANSACTIONAL_EMAIL_PROVIDER:'gmail'};
  assert.deepEqual(await sendTrackingEmail(code,{env,send:async()=>{fetches++;throw Error('Resend must not be used');},smtpCreateTransport:()=>{transports++;throw Error('Gmail must not be used');}}),{state:'deferred',category:'missing_configuration'});
  assert.deepEqual(await sendSupportEscalationEmail(alert,{env,send:async()=>{fetches++;throw Error('Resend must not be used');},smtpCreateTransport:()=>{transports++;throw Error('Gmail must not be used');}}),{state:'deferred',category:'missing_configuration'});
  assert.equal(fetches,0);assert.equal(transports,0);
});

test('ADR-0031 Gmail adapter pins TLS, sender and stable Message-ID without provider response disclosure',async()=>{
  const settings:Parameters<GmailSmtpFactory>[0][]=[],messages:Parameters<ReturnType<GmailSmtpFactory>['sendMail']>[0][]= [];
  let closes=0;
  const createTransport:GmailSmtpFactory=options=>{
    settings.push(options);
    return{sendMail:async outbound=>{messages.push(outbound);return{accepted:[message.recipientEmail],rejected:[]};},close:()=>{closes++;}};
  };
  assert.deepEqual(await sendGmailSmtpEmail(message,{env:hosted,createTransport}),{state:'accepted'});
  assert.deepEqual(await sendGmailSmtpEmail(message,{env:hosted,createTransport}),{state:'accepted'});
  assert.equal(settings.length,2);assert.equal(closes,2);
  assert.equal(settings[0].host,'smtp.gmail.com');assert.equal(settings[0].port,465);assert.equal(settings[0].secure,true);assert.equal(settings[0].pool,false);
  assert.equal(settings[0].tls.rejectUnauthorized,true);assert.equal(settings[0].tls.minVersion,'TLSv1.2');
  assert.equal(settings[0].logger,false);assert.equal(settings[0].debug,false);
  assert.equal(settings[0].disableFileAccess,true);assert.equal(settings[0].disableUrlAccess,true);
  assert.equal(settings[0].connectionTimeout,4000);assert.equal(settings[0].socketTimeout,4000);
  assert.deepEqual(messages[0].from,{name:'MirtPage',address:'owner@gmail.com'});
  assert.deepEqual(messages[0].to,{address:message.recipientEmail});
  assert.equal(messages[0].messageId,'<suqpage-tracking-7@mirtpage.com>');
  assert.deepEqual(messages[0],messages[1]);
  assert.ok(!JSON.stringify(messages).includes('abcdefghijklmnop'));
  assert.ok(!JSON.stringify(messages).includes('fixture-resend-key'));
});

test('ADR-0031 Gmail adapter rejects header injection and malformed jobs before opening a socket',async()=>{
  let opens=0;const createTransport:GmailSmtpFactory=()=>{opens++;throw Error('must not connect');};
  for(const patch of [
    {recipientEmail:'name@example.test\r\nBcc: victim@example.test'},
    {subject:'Code\nBcc: victim@example.test'},
    {subject:''},
    {deliveryKey:'suqpage-tracking-7\r\nBcc: victim@example.test'},
    {deliveryKey:'arbitrary-7'},
    {text:'hello\u0000world'},
  ])assert.deepEqual(await sendGmailSmtpEmail({...message,...patch},{env:hosted,createTransport}),{state:'failed',category:'invalid_message',retryable:false});
  assert.equal(opens,0);
  assert.deepEqual(await sendGmailSmtpEmail(message,{env:{...hosted,MIRTPAGE_SMTP_APP_PASSWORD:''},createTransport}),{state:'deferred',category:'missing_configuration'});
  assert.equal(opens,0);
});

test('ADR-0031 SMTP temporary/auth/rejected/ambiguous outcomes remain generic and close transport',async()=>{
  const run=async(outcome:'rejected'|'temporary'|'temporary-envelope'|'temporary-auth'|'permanent-envelope'|'unknown-envelope'|'auth'|'timeout'|'ambiguous')=>{
    let closes=0;
    const createTransport:GmailSmtpFactory=()=>({sendMail:async()=>{
      if(outcome==='rejected')return{accepted:[],rejected:[message.recipientEmail]};
      if(outcome==='temporary')throw Object.assign(Error('private SMTP response'),{responseCode:421});
      if(outcome==='temporary-envelope')throw Object.assign(Error('private SMTP response'),{code:'EENVELOPE',responseCode:450});
      if(outcome==='temporary-auth')throw Object.assign(Error('private SMTP response'),{code:'EAUTH',responseCode:454});
      if(outcome==='permanent-envelope')throw Object.assign(Error('private SMTP response'),{code:'EENVELOPE',responseCode:550});
      if(outcome==='unknown-envelope')throw Object.assign(Error('private SMTP response'),{code:'EENVELOPE'});
      if(outcome==='auth')throw Object.assign(Error('private auth response'),{code:'EAUTH',responseCode:535});
      if(outcome==='timeout')throw Object.assign(Error('private timeout'),{code:'ETIMEDOUT'});
      return{accepted:['different@example.test'],rejected:[]};
    },close:()=>{closes++;}});
    const result=await sendGmailSmtpEmail(message,{env:hosted,createTransport});assert.equal(closes,1);assert.ok(!JSON.stringify(result).includes('private'));return result;
  };
  assert.deepEqual(await run('rejected'),{state:'failed',category:'provider_rejected',retryable:false});
  assert.deepEqual(await run('temporary'),{state:'failed',category:'provider_failure',retryable:true});
  assert.deepEqual(await run('temporary-envelope'),{state:'failed',category:'provider_failure',retryable:true});
  assert.deepEqual(await run('temporary-auth'),{state:'failed',category:'provider_failure',retryable:true});
  assert.deepEqual(await run('permanent-envelope'),{state:'failed',category:'provider_failure',retryable:false});
  assert.deepEqual(await run('unknown-envelope'),{state:'failed',category:'provider_failure',retryable:false});
  assert.deepEqual(await run('auth'),{state:'failed',category:'provider_failure',retryable:false});
  assert.deepEqual(await run('timeout'),{state:'failed',category:'provider_failure',retryable:true});
  assert.deepEqual(await run('ambiguous'),{state:'failed',category:'provider_rejected',retryable:false});
});

test('BE-058/BE-050 Gmail route preserves scoped Tracking and manager mail without invoking Resend',async()=>{
  const sent:Array<{to:string;subject:string;text:string;messageId:string}>=[];
  const createTransport:GmailSmtpFactory=()=>({sendMail:async mail=>{sent.push({to:mail.to.address,subject:mail.subject,text:mail.text,messageId:mail.messageId});return{accepted:[mail.to.address],rejected:[]};},close:()=>{}});
  const noFetch:typeof fetch=async()=>{throw Error('Resend must not be invoked');};
  assert.deepEqual(await sendTrackingEmail(code,{env:hosted,send:noFetch,smtpCreateTransport:createTransport}),{state:'accepted'});
  assert.deepEqual(await sendSupportEscalationEmail(alert,{env:hosted,send:noFetch,smtpCreateTransport:createTransport}),{state:'accepted'});
  assert.deepEqual(await sendTrackingEmail(code,{env:{...hosted,NOTIFICATION_FROM_EMAIL:'',RESEND_API_KEY:''},send:noFetch,smtpCreateTransport:createTransport}),{state:'accepted'},'Gmail uses its verified SMTP user, not Resend sender configuration');
  assert.deepEqual(sent.map(row=>row.to),[code.recipientEmail,alert.recipientEmail,code.recipientEmail]);
  assert.equal(sent[0].messageId,'<suqpage-tracking-7@mirtpage.com>');
  assert.equal(sent[1].messageId,'<suqpage-support-overdue-81@mirtpage.com>');
  assert.ok(sent[0].text.includes('123456'));assert.ok(sent[1].text.includes('SUP-QA126'));
  assert.ok(!sent[1].text.includes('customer'));assert.ok(!sent[1].text.includes('route'));
  assert.ok(!sent[0].text.includes('fixture-resend-key'));
  assert.deepEqual(await sendTrackingEmail(code,{env:{...hosted,MIRTPAGE_SMTP_APP_PASSWORD:''},send:noFetch,smtpCreateTransport:createTransport}),{state:'deferred',category:'missing_configuration'});
});
