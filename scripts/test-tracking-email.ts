import assert from 'node:assert/strict';
import {test} from 'node:test';
import {sendTrackingEmail,trackingEmailContent,type TrackingEmail} from '../lib/tracking-email';
const local={NODE_ENV:'development',SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:'postgresql://fixture:unused@127.0.0.1:54322/postgres',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321'};
const production={NODE_ENV:'production',SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:'postgresql://fixture:unused@db.example.test:5432/postgres',NEXT_PUBLIC_SUPABASE_URL:'https://auth.example.test',NEXT_PUBLIC_APP_URL:'https://suqpage.example.test',RESEND_API_KEY:'fictional-provider-key',NOTIFICATION_FROM_EMAIL:'Suqpage <tracking@example.test>'};
const message:TrackingEmail={deliveryId:7,recipientEmail:'recipient+tracking@example.test',locale:'en',kind:'code',code:'123456'};
test('BE-058 tracking mail uses strict local/provider target guards and never falls through to external delivery',async()=>{
 let sent=0;const send:typeof fetch=async()=>{sent++;return new Response(null,{status:200});};
 for(const env of[{...local}, {...production,RESEND_API_KEY:''},{...production,NEXT_PUBLIC_APP_URL:'http://127.0.0.1:3102'},{...production,SUQPAGE_POSTGRES_URL:local.SUQPAGE_POSTGRES_URL}])assert.deepEqual(await sendTrackingEmail(message,{env,send}),{state:'deferred',category:'missing_configuration'});
 for(const env of[{...local,NODE_ENV:'production'},{...local,NETLIFY:'true'},{...local,SUQPAGE_POSTGRES_URL:local.SUQPAGE_POSTGRES_URL+'?host=remote.example.test'}])assert.equal((await sendTrackingEmail(message,{mode:'local-mailpit',env,send})).state,'deferred');
 assert.equal(sent,0);
});
test('BE-058 tracking adapter sends literal safe text with stable idempotency and bounded acceptance semantics',async()=>{
 const requests:Array<{url:string;init:RequestInit;body:Record<string,unknown>}>=[];
 const send:typeof fetch=async(url,init={})=>{requests.push({url:String(url),init,body:JSON.parse(String(init.body))});return new Response(null,{status:202});};
 assert.deepEqual(await sendTrackingEmail(message,{mode:'local-mailpit',env:local,send}),{state:'accepted'});assert.equal(requests[0].url,'http://127.0.0.1:54324/api/v1/send');assert.ok(requests[0].init.signal);assert.equal(requests[0].init.redirect,'error');assert.deepEqual(requests[0].body.To,[{Email:message.recipientEmail}]);assert.equal((requests[0].body.Headers as Record<string,string>)['Message-ID'],'<suqpage-tracking-7@suqpage.test>');
 for(let i=0;i<2;i++)assert.equal((await sendTrackingEmail(message,{env:production,send})).state,'accepted');
 assert.equal(requests[1].url,'https://api.resend.com/emails');assert.equal((requests[1].init.headers as Record<string,string>)['Idempotency-Key'],(requests[2].init.headers as Record<string,string>)['Idempotency-Key']);
 assert.equal((await sendTrackingEmail({...message,recipientEmail:'bad\r\n@e.test'},{env:production,send})).state,'failed');assert.equal(requests.length,3);
 assert.deepEqual(await sendTrackingEmail(message,{env:production,send:async()=>new Response(null,{status:429})}),{state:'failed',category:'provider_rejected',retryable:true});assert.deepEqual(await sendTrackingEmail(message,{env:production,send:async()=>new Response(null,{status:401})}),{state:'failed',category:'provider_rejected',retryable:false});
 assert.deepEqual(await sendTrackingEmail(message,{env:production,send:async()=>{throw Error('fixture network failure');}}),{state:'failed',category:'provider_failure',retryable:true});
});
test('FE-069 initial mail contains only safe ordered shipment details and an authenticated locator',()=>{
 const shipment={reference:'SHP-ABCDEF0123456789ABCD',label:'Literal shipment',version:1,legs:[{id:'e05646d4-2707-4a21-90ab-476f4605ffca',providerName:'<b>Literal provider</b>',origin:'አዲስ አበባ',destination:'Nairobi',method:'truck'as const}]};
 for(const locale of['en','am','om']as const){const content=trackingEmailContent({...message,locale,kind:'initial',shipment},'https://suqpage.example.test');assert.ok(content.text.includes(shipment.legs[0].providerName));assert.ok(content.text.includes('https://suqpage.example.test/tracking/'+shipment.reference));assert.ok(content.text.includes(shipment.legs[0].origin));assert.ok(!content.text.includes(message.recipientEmail));assert.doesNotMatch(content.text,/publicRef|conversationId|SUP-|estimated|delivered|completed/i);}
});
