import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {createUiText,enabledLocales,messageKey,type UiMessages} from '../lib/i18n/core';
import {clientMessages} from '../lib/i18n/client-messages';
import {parsePublicInterestInput,RequestError} from '../lib/request-domain';

// Real channel parser, with the session/persistence adapter replaced by a port
// that throws on access. This review does not exercise a database or real chat.
type ChannelModule=Pick<typeof import('../lib/public-support-channel'),'supportChannel'|'matchesSupportChannel'|'PUBLIC_HELP_COOKIE'|'PUBLIC_TRANSPORT_COOKIE'|'PUBLIC_BUYING_COOKIE'>;
async function channelModule():Promise<ChannelModule>{
 const result=await build({entryPoints:['lib/public-support-channel.ts'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'channel-persistence-port',setup(b){
  b.onResolve({filter:/^\.\/support$/},()=>({path:'support',namespace:'port'}));
  b.onLoad({filter:/.*/,namespace:'port'},()=>({contents:`export const PUBLIC_SUPPORT_COOKIE='suqpage_public_support';export class SupportError extends Error{constructor(message,code){super(message);this.code=code;}}export async function getPublicSupportConversation(){throw Error('Unexpected persistence read');}` }));
 }}]});
 const module={exports:{} as ChannelModule};vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:createRequire(import.meta.url)});return module.exports;
}
const messages=[
 'Choose how MirtPage can help.',
 'This account already has a MirtPage workspace.',
 'Tell MirtPage what should change in at least 5 characters.',
 'Confirm that MirtPage may use this image for the client showroom.',
 'Confirm that MirtPage may use this video for the client showroom.',
 'Confirm that MirtPage may use this information to review your request.',
 'MirtPage help or report',
 'Ask how MirtPage works or report a concern about a listing.',
 'Write a message for the MirtPage team.',
 'MirtPage support',
 'MirtPage production requires verified email-code sign-in.',
] as const;

test('FE-070 invalid support channel keeps its code, valid categories and cookie identities',async()=>{
 const channel=await channelModule();
 for(const value of [null,'help','transport','buying'])assert.equal(channel.supportChannel(value),value);
 assert.throws(()=>channel.supportChannel('invalid'),(error:unknown)=>typeof error==='object'&&error!==null&&'code' in error&&error.code==='invalid_channel'&&'message' in error&&error.message===messages[0]);
 assert.equal(channel.matchesSupportChannel('shipment_observation','transport'),true);
 assert.equal(channel.matchesSupportChannel('general','transport'),false);
 assert.equal(channel.matchesSupportChannel('buying_assistance','buying'),true);
 assert.equal(channel.PUBLIC_HELP_COOKIE,'suqpage_public_help');
 assert.equal(channel.PUBLIC_TRANSPORT_COOKIE,'suqpage_public_transport');
 assert.equal(channel.PUBLIC_BUYING_COOKIE,'suqpage_public_buying');
});

test('FE-070 interest consent remains required with the same400 response and unchanged accepted data',()=>{
 const input={contactName:'Local fixture',contactValue:'fixture@example.test',businessName:'Fixture business',requestText:'Prepare a product showroom.',idempotencyKey:'fixture-brand-consent-0001',consent:true};
 assert.throws(()=>parsePublicInterestInput({...input,consent:false}),(error:unknown)=>error instanceof RequestError&&error.status===400&&error.retryAfter===0&&error.message==='Confirm that MirtPage may use this information to review your request.');
 assert.deepEqual(parsePublicInterestInput(input),input);
});

test('FE-070 backend errors reach active localized clients while server fallbacks stay in full catalogs',()=>{
 for(const locale of enabledLocales){
  const catalog:UiMessages=locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8'));
  // Discovery's SQL projection fallback is not a client error. Its existing
  // short label is localized in full catalogs; do not force server-only copy
  // into browser payloads or translate arbitrary merchant-supplied details.
  const fallback='MirtPage page';
  if(locale!=='en')assert.ok(catalog[messageKey(fallback)]);
  assert.doesNotMatch(createUiText(catalog)(fallback),/Suqpage|SuqPage/);
  const selected=clientMessages(catalog),t=createUiText(selected);
  for(const message of messages){
   if(locale!=='en'){assert.ok(selected[messageKey(message)],`${locale}: client error key ${message}`);assert.notEqual(t(message),message,`${locale}: authored error`);}
   assert.ok(t(message).includes('MirtPage'));assert.doesNotMatch(t(message),/Suqpage|SuqPage/);
  }
 }
});

test('FE-070 this display tranche leaves the persisted support requester label and notification channel IDs unchanged',()=>{
 const support=fs.readFileSync('lib/support.ts','utf8');
 assert.ok(support.includes("'general','Suqpage client'"));
 const native=fs.readFileSync('apps/mobile/src/attention-platform.native.ts','utf8'),sender=fs.readFileSync('lib/attention-push.ts','utf8');
 for(const id of ['suqpage-alerts','suqpage-alerts-quiet']){assert.ok(native.includes(id));assert.ok(sender.includes(id));}
});
