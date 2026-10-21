import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseTransportPlanLegs} from '../lib/transport-plan-contract';
import {TrackingError,trackingProviderUrl,trackingProviderCode,trackingLegs,parseTrackingLegsJson,parseTrackingShipment,parseTrackingSubmit,TRACKING_LEGS_MAX_BYTES} from '../lib/tracking-contract';

const leg=()=>({id:null,providerName:'Carrier',origin:'Addis Ababa',destination:'Nairobi',method:'truck'});
const id='4937c162-78f8-48ee-b321-b8a0634e09c1';
test('BE-058 provider URL accepts optional canonical HTTPS navigation without altering query/code meaning',()=>{
 for(const value of[undefined,null,'','   '])assert.equal(trackingProviderUrl(value),'');
 assert.equal(trackingProviderUrl(' HTTPS://CARRIER.EXAMPLE.COM/track?id=AbC%2F12&view=full#updates '),'https://carrier.example.com/track?id=AbC%2F12&view=full#updates');
 assert.equal(trackingProviderUrl('https://carrier.example.com'),'https://carrier.example.com/');
 assert.equal(trackingProviderUrl('https://carrier.example.com/%E1%8A%A0?code=a%20b'),'https://carrier.example.com/%E1%8A%A0?code=a%20b');
 assert.match(trackingProviderUrl('https://bücher.example/track'),/^https:\/\/xn--bcher-kva\.example\/track$/);
});
test('BE-058 provider URL rejects unsafe schemes, credentials, all ports/IP literals and local host syntax',()=>{
 const cases:unknown[]=[false,42,{},[],
  'http://carrier.example.com','javascript:alert(1)','data:text/html,x','file:///etc/passwd','intent://carrier','//carrier.example.com','https:carrier.example.com','https:////carrier.example.com',
  'https://user@carrier.example.com','https://@carrier.example.com','https://user:pass@carrier.example.com','https://carrier.example.com:443','https://carrier.example.com:444/x','https://carrier.example.com:00443/x',
  'https://localhost','https://carrier','https://a.localhost/x','https://localhost.localdomain/x','https://a.local/x','https://a.internal/x','https://a.lan/x','https://a.home/x','https://home.arpa/x','https://a.home.arpa/x','https://a.corp/x',
  'https://127.0.0.1','https://8.8.8.8','https://10.0.0.1','https://169.254.169.254','https://2130706433','https://0x7f000001','https://0177.0.0.1','https://[::1]','https://[2001:4860:4860::8888]',
  'https://carrier.example.com./x','https://bad-.example.com/x','https://a..example.com/x',
  '\nhttps://carrier.example.com','https://carrier.example.com/\tcode','https://carrier.example.com\\@evil.example/x','https://carrier.example.com/%5cfoo','https://carrier.example.com/%0d%0afoo','https://carrier.example.com/%00','https://carrier.example.com/%C2%80','https://carrier.example.com/%',
  'https://carrier.example.com/'+ 'x'.repeat(2048),'https://carrier.example.com/'+ 'አ'.repeat(300),
 ];
 for(const value of cases)assert.throws(()=>trackingProviderUrl(value),TrackingError,String(value));
});
test('BE-058 provider codes are optional literal Unicode, distinct from email OTP and never URL templates',()=>{
 for(const value of[undefined,null,'','   '])assert.equal(trackingProviderCode(value),'');
 assert.equal(trackingProviderCode(' AbC  12-3 / x '),'AbC  12-3 / x');
 assert.equal(trackingProviderCode('<b>literal</b>'),'<b>literal</b>');
 assert.equal(trackingProviderCode('😀'.repeat(120)),'😀'.repeat(120));
 for(const value of[true,42,{},[], 'x'.repeat(121),'😀'.repeat(121),'a\nb','a\tb','a\u0080b','\ud800','\udfff'])assert.throws(()=>trackingProviderCode(value),TrackingError);
 const parsed=trackingLegs([{...leg(),trackingUrl:'https://carrier.example.com/track',trackingCode:'ABC 123'}]);
 assert.equal(parsed[0].trackingUrl,'https://carrier.example.com/track');assert.equal(parsed[0].trackingCode,'ABC 123');
 assert.equal(trackingLegs([{...leg(),trackingCode:'Code only'}])[0].trackingUrl,'');
 assert.equal(trackingLegs([{...leg(),trackingUrl:'https://carrier.example.com'}])[0].trackingCode,'');
});
test('BE-058 legacy Tracking projection normalizes absent fields without changing shared retired contracts or input',()=>{
 const old={reference:'SHP-ABCDEF0123456789ABCD',label:'Old shipment',version:1,legs:[{...leg(),id}]};
 const raw=JSON.stringify(old),parsed=parseTrackingShipment(old);
 assert.equal(parsed.legs[0].trackingUrl,'');assert.equal(parsed.legs[0].trackingCode,'');assert.equal(JSON.stringify(old),raw);
 assert.deepEqual(parseTransportPlanLegs(old.legs,true),old.legs);
 assert.throws(()=>parseTransportPlanLegs([{...old.legs[0],trackingCode:'not a retired field'}],true));
 for(const legs of[[{...leg(),currentStatus:'delivered'}],[{...leg(),trackingUrl:false}],[{...leg(),trackingCode:123}],[{...leg(),id},{...leg(),id}]])assert.throws(()=>trackingLegs(legs),TrackingError);
 assert.throws(()=>trackingLegs([leg()],true),TrackingError);
 assert.throws(()=>trackingLegs([{...leg(),id:'invalid'}]),{name:'TrackingError',message:'Check the shipment details.'});
 const submit=parseTrackingSubmit({recipientEmail:' TEST+Alias@Example.com ',legs:[leg()],idempotencyKey:'unchanged_old_command_key'});
 assert.equal(submit.recipientEmail,'test+alias@example.com');assert.equal(submit.idempotencyKey,'unchanged_old_command_key');assert.equal(submit.legs[0].trackingCode,'');
});
test('BE-058 bounded raw leg JSON counts UTF-8 bytes and admits twelve rich legs above the retired24k bound',()=>{
 const prefix='https://carrier.example.com/';
 const rich=Array.from({length:12},()=>({...leg(),providerName:'😀'.repeat(120),origin:'አ'.repeat(120),destination:'😀'.repeat(120),trackingCode:'😀'.repeat(120),trackingUrl:prefix+'x'.repeat(2048-prefix.length)}));
 const raw=JSON.stringify(rich);assert.ok(Buffer.byteLength(raw)>24000);assert.ok(Buffer.byteLength(raw)<TRACKING_LEGS_MAX_BYTES);assert.equal(parseTrackingLegsJson(raw).length,12);
 const padded=raw+' '.repeat(TRACKING_LEGS_MAX_BYTES-raw.length);assert.equal(padded.length,TRACKING_LEGS_MAX_BYTES);assert.ok(Buffer.byteLength(padded)>TRACKING_LEGS_MAX_BYTES);assert.throws(()=>parseTrackingLegsJson(padded),TrackingError);
 for(const value of[null,{},'not JSON',' '.repeat(TRACKING_LEGS_MAX_BYTES+1),JSON.stringify(Array.from({length:13},leg))])assert.throws(()=>parseTrackingLegsJson(value),TrackingError);
});
