import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {isQueueAgent} from '../lib/capabilities';

test('FE-019 S125 Join action forwards exact assignment fences and preserves the scoped reply-filter origin',async()=>{
 const fixture={actor:{id:8,access_role:'team_member',staff_queue_scope:'transport'},calls:[] as unknown[],revalidated:[] as string[],scheduled:0,failure:''};
 const bundle=await build({entryPoints:['app/support-actions.ts'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'join-action-ports',setup(b){
  b.onResolve({filter:/^(next\/|@\/lib\/)/},a=>a.path==='@/lib/support-navigation'?undefined:({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({contents:
   a.path==='next/navigation'?`export const RedirectType={replace:'replace'},redirect=(url,type)=>{throw Object.assign(Error('redirect'),{url,type});};`
   :a.path==='next/cache'?`export const revalidatePath=path=>fixture.revalidated.push(path);`
   :a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.actor;`
   :a.path==='@/lib/capabilities'?`export const isQueueAgent=queueAgent,hasCapability=()=>false;`
   :a.path==='@/lib/attention-after'?`export const scheduleAttentionDelivery=()=>fixture.scheduled++;`
   :a.path==='@/lib/support'?`export class SupportError extends Error{};export const joinSupportConversation=async(user,id,input)=>{fixture.calls.push({userId:user.id,id,input});if(fixture.failure==='known')throw new SupportError('This assignment changed. Reload before joining.');if(fixture.failure)throw Error('private database credential');return{duplicate:false};};export const claimSupportConversation=async()=>{},closeSupportConversation=async()=>{},createSupportConversation=async()=>{},postSupportMessage=async()=>{},reopenSupportConversation=async()=>{},reassignSupportConversation=async()=>{},saveTransportHandoff=async()=>{},updateSupportAgentSetting=async()=>{},routeWaitingSupportConversations=async()=>{};`
   :a.path==='@/lib/support-media'?`export class SupportAttachmentError extends Error{};export const stageSupportAttachment=async()=>null;`
   :a.path==='@/lib/support-video-requests'?`export const createVideoRequest=async()=>{},reviewVideoRequest=async()=>{};`
   :a.path==='@/lib/security'?`export const audit=async()=>{};`
   :`export const runtimeBusinessById=async()=>null;`}));
 }}]});
 const module={exports:{} as {joinSupportConversationAction:(form:FormData)=>Promise<void>}};
 vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,fixture,queueAgent:isQueueAgent,FormData,URLSearchParams,Date});
 const form=new FormData();for(const[key,value]of Object.entries({conversationId:'42',publicRef:'SUP-QA',assignmentEpoch:'29',nav_queue:'support',nav_status:'overdue',nav_q:'QA request',nav_page:'2',returnTo:'https://forbidden.invalid'}))form.set(key,value);
 const target='/dashboard/support/42?queue=transport&status=overdue&q=QA+request&page=2';
 await assert.rejects(module.exports.joinSupportConversationAction(form),error=>(error as {url?:string;type?:string}).url===target&&(error as {type?:string}).type==='replace');
 assert.deepEqual(JSON.parse(JSON.stringify(fixture.calls)),[{userId:8,id:42,input:{publicRef:'SUP-QA',assignmentEpoch:'29'}}]);assert.deepEqual(fixture.revalidated,['/dashboard/support','/dashboard/support/42']);assert.equal(fixture.scheduled,1);
 fixture.failure='known';await assert.rejects(module.exports.joinSupportConversationAction(form),error=>String((error as{url?:string}).url).startsWith(target+'&error=This%20assignment%20changed.'));assert.equal(fixture.scheduled,1);
 fixture.failure='unknown';await assert.rejects(module.exports.joinSupportConversationAction(form),error=>{const url=String((error as{url?:string}).url);assert.ok(!url.includes('credential'));return url===target+'&error=Support%20could%20not%20be%20updated.';});assert.equal(fixture.scheduled,1);
});

test('FE-019 S125 actual Join button reflects its parent server-action pending state',async()=>{
 const fixture={pending:false};
 const bundle=await build({entryPoints:['components/SupportJoinButton.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'join-button-ports',setup(b){
  b.onResolve({filter:/^(react-dom|@\/lib\/i18n\/ui)$/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({contents:a.path==='react-dom'?`export const useFormStatus=()=>({pending:fixture.pending});`:`export const useUiText=()=>key=>key;`}));
 }}]});
 const module={exports:{} as {default:()=>React.ReactNode}};vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,fixture,require:createRequire(import.meta.url)});
 let html=renderToStaticMarkup(module.exports.default());assert.match(html,/>Join chat<\/button>/);assert.doesNotMatch(html,/disabled=""/);
 fixture.pending=true;html=renderToStaticMarkup(module.exports.default());assert.match(html,/disabled=""/);assert.match(html,/aria-busy="true"/);
});
