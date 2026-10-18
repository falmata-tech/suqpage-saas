import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';
import {hasCapability,isQueueAgent} from '../lib/capabilities';
import {supportStaffState,supportStaffWorkState} from '../lib/support-staff-state';
import type {SupportIdleEndEvidence} from '../lib/support-idle-evidence';

test('FE-019 staff assignment labels distinguish waiting, assigned, joined, manual/automatic ending and resolution',()=>{
 const active={status:'open' as const,assignedUserName:'Agent A',agentJoined:false};
 assert.deepEqual(supportStaffState({...active,status:'waiting',assignedUserName:null}),{key:'Waiting for a team member'});
 assert.deepEqual(supportStaffState(active),{key:'Assigned to {value1}',values:{value1:'Agent A'}});
 assert.deepEqual(supportStaffState({...active,agentJoined:true}),{key:'{value1} joined the chat',values:{value1:'Agent A'}});
 for(const assignedUserName of [null,'Agent A']){
  assert.equal(supportStaffState({...active,status:'closed',assignedUserName}).key,'Chat ended');
  assert.equal(supportStaffState({...active,status:'closed',assignedUserName,idleEndedAt:10}).key,'Automatically ended after no reply.');
  assert.equal(supportStaffState({...active,status:'closed',assignedUserName,idleEndedAt:10,resolvedAt:11}).key,'Resolved');
 }
});

async function screen(entry:string){
 const fixture={actor:{id:1,access_role:'platform_admin',business_id:null,staff_queue_scope:null as string|null},query:{} as Record<string,unknown>,reads:0,handoffReads:0,evidenceReads:0,evidence:null as SupportIdleEndEvidence|null,videoRequest:null as {target_kind:string;target_label:string;status:string;source_url:string}|null,handoff:null as {id:number;company:string;contact:string;createdAt:number}|null,conversation:{id:42,publicRef:'SUP-QA',businessName:'Fixture business',subject:'Pickup → Destination',participantKind:'visitor',assistanceCategory:'shipment_observation',status:'open',assignedUserId:8,assignedUserName:'Agent A' as string|null,agentJoined:false,resolvedAt:null as number|null,idleEndedAt:null as number|null,requestSummary:'Two sample items',transportCompany:null,requesterLabel:'Fixture requester',visitorPhone:'+447700900119',readEpoch:'29',replyState:'needs_reply' as 'needs_reply'|'overdue'|'waiting_customer'|null,staffReplyDueAt:600000 as number|null},messages:[] as Array<{id:number;senderRole:string;senderName:string;senderUserId:number|null;createdAt:number;body:string;visitorVisible:boolean;read:boolean}>};
 const bundle=await build({entryPoints:[entry],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'staff-screen-ports',setup(b){
  b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
  b.onResolve({filter:/^(next\/(link|navigation)|@\/)/},a=>['@/lib/support-navigation','@/lib/support-staff-state','@/lib/support-client-state','@/components/CollectionToolbar','@/lib/support-idle-contract','@/lib/buying-assistance','@/components/SupportNavigationFields','@/components/SupportAssignmentPicker','@/components/TransportHandoffForm'].includes(a.path)?undefined:({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
   a.path==='next/link'?`import React from 'react';export default ({children,...props})=><a {...props}>{children}</a>;`
   :a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url});},unstable_rethrow=error=>{if(error?.digest?.startsWith('NEXT_REDIRECT'))throw error;};`
   :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>((key,values={})=>key.replace(/\{([^}]+)\}/g,(_,name)=>String(values[name]??'')));`
   :a.path==='@/lib/i18n/ui'?`export const useUiText=()=>key=>key;`
   :a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.actor;`
   :a.path==='@/lib/capabilities'?`export const hasCapability=capability,isQueueAgent=queueAgent;`
   :a.path==='@/lib/config'?`export const supportWhatsAppUrl=()=>'';`
   :a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async()=>null,runtimeCatalogByBusinessId=async()=>null;`
   :a.path==='@/lib/support-video-requests'?`export const getVideoRequest=async()=>fixture.videoRequest;`
   :a.path==='@/lib/support'?`export class SupportError extends Error{};export const listSupportConversations=async(_,query)=>{fixture.query=query;fixture.reads++;return {page:1,totalPages:1,totalItems:1,items:[fixture.conversation]};},getSupportConversation=async()=>({conversation:fixture.conversation,messages:fixture.messages}),getSupportIdleEndEvidence=async()=>{fixture.evidenceReads++;return fixture.evidence;},getTransportHandoff=async()=>{fixture.handoffReads++;return fixture.handoff;},getSupportAssignmentHistory=async()=>[],listSupportAgentWorkloads=async()=>[];`
   :a.path==='@/app/support-actions'?`export const saveTransportHandoffAction=()=>{},createSupportConversationAction=()=>{},createVideoRequestAction=()=>{},assignWaitingSupportConversationsAction=()=>{},reviewVideoRequestAction=()=>{},claimSupportConversationAction=()=>{},closeSupportConversationAction=()=>{},postSupportMessageAction=()=>{},reassignSupportConversationAction=()=>{},reopenSupportConversationAction=()=>{},joinSupportConversationAction=()=>{};`
   :a.path==='@/components/SupportJoinButton'?`import React from 'react';export default ()=> <button>Join chat</button>;`
   :a.path==='@/components/ChatReadObserver'?`import React from 'react';export default props=><span data-receipt-epoch={props.receiptEpoch} data-can-read={props.canRead}/>;`
   :a.path==='@/components/DashboardShell'?`import React from 'react';export default ({children})=><main>{children}</main>;`
   :`export default ()=>null;` }));
 }}]});
 const module={exports:{} as {default:(props:Record<string,unknown>)=>Promise<React.ReactNode>}};
 vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,fixture,capability:hasCapability,queueAgent:isQueueAgent,require:createRequire(import.meta.url),Date,Intl,URLSearchParams});
 return {fixture,render:async(query:Record<string,string>={})=>renderToStaticMarkup(await module.exports.default({params:Promise.resolve({id:'42'}),searchParams:Promise.resolve(query)}))};
}

test('FE-019/FE-026 actual staff queue exposes Waiting and accurate lifecycle without requiring manual queue recovery',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/page.tsx');
 Object.assign(fixture.conversation,{transportCompany:'Retired private carrier'});
 let html=await render({queue:'transport',status:'waiting',q:'chairs',page:'2'});assert.doesNotMatch(html,/Retired private carrier|Transport company/,'S142 removes the legacy company summary from queue results');
 assert.equal(fixture.query.status,'waiting');assert.match(html,/status=waiting[^\"]*\" aria-current=\"page\">Unassigned/);assert.doesNotMatch(html,/Assign waiting chats|manually stay|name=\"nav_queue\"/);assert.match(html,/Workload &amp; availability/);assert.doesNotMatch(html,/No company selected/);assert.match(html,/Assigned to Agent A/);
 fixture.conversation.agentJoined=true;html=await render({queue:'transport'});assert.match(html,/Agent A joined the chat/);
 fixture.conversation.status='closed';fixture.conversation.assignedUserName=null;html=await render({queue:'transport',status:'history'});assert.doesNotMatch(html,/Waiting for a team member|Assign waiting chats/);assert.match(html,/data-assignment-state=\"true\">Chat ended/);
 fixture.conversation.idleEndedAt=10;html=await render({queue:'transport',status:'history'});assert.match(html,/Automatically ended after no reply/);
 fixture.conversation.resolvedAt=11;html=await render({queue:'transport',status:'resolved'});assert.match(html,/data-assignment-state=\"true\">Resolved/);
 html=await render({queue:'transport',routed:'3',remaining:'1'});assert.match(html,/Assigned 3 waiting conversations\. Still waiting: 1\./);
 for(const routed of ['-1','NaN','1e2','9007199254740992']){html=await render({queue:'transport',routed,remaining:'1'});assert.doesNotMatch(html,/Still waiting:/);}
 fixture.actor.access_role='team_member';fixture.actor.staff_queue_scope='transport';html=await render({queue:'support',status:'waiting'});assert.equal(fixture.query.queue,'transport');assert.doesNotMatch(html,/Assign waiting chats/);
 fixture.actor.access_role='client';fixture.actor.staff_queue_scope=null;html=await render({queue:'transport'});assert.doesNotMatch(html,/Assign waiting chats/);
 assert.ok(fixture.reads>0,'Actual route performs list reads rather than hidden routing commands');
});

test('FE-019 actual detail uses canonical joined/end labels without reintroducing history accordion',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/[id]/page.tsx');
 let html=await render({queue:'transport',status:'active',q:'chairs',page:'2'});assert.match(html,/Assigned to Agent A/);assert.match(html,/Assignment history/);assert.doesNotMatch(html,/<details/);
 fixture.conversation.agentJoined=true;html=await render({queue:'transport'});assert.match(html,/Agent A joined the chat/);
 fixture.conversation.status='closed';fixture.conversation.assignedUserName=null;html=await render({queue:'transport',status:'history'});assert.doesNotMatch(html,/Waiting for a team member/);assert.match(html,/data-assignment-state=\"true\">Chat ended/);
});

test('FE-069 S141 current transport conversation has no shipment creation or legacy plan tab',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/[id]/page.tsx');
 for(const access_role of ['platform_admin','team_member']){
  fixture.actor={...fixture.actor,id:8,access_role,staff_queue_scope:'transport'};
  for(const status of ['open','closed']){
   fixture.conversation.status=status;fixture.conversation.agentJoined=true;
   const html=await render({queue:'transport',status:status==='closed'?'history':'active'});
   assert.doesNotMatch(html,/href="\/dashboard\/support\/42\/plan|href="\/dashboard\/tracking\/new|>New shipment<|>Transport plan<|name="conversationId"[^>]*tracking/);
   assert.match(html,/SUP-QA/,'Normal conversation workspace remains available');
  }
 }
});

test('FE-019 S125 staff work priority is independent of assignment and never calls an unanswered chat expired',()=>{
 const active={status:'open',resolvedAt:null,replyState:'overdue' as const,staffReplyDueAt:600000};
 assert.deepEqual(supportStaffWorkState(active),{replyKey:'Needs staff reply',overdue:true,dueAt:600000,terminalKey:null});
 assert.equal(supportStaffWorkState({...active,replyState:'needs_reply'}).overdue,false);
 assert.equal(supportStaffWorkState({...active,replyState:'waiting_customer'}).replyKey,'Waiting for customer');
 assert.equal(supportStaffWorkState({...active,replyState:'waiting_customer'}).dueAt,null);
 assert.deepEqual(supportStaffWorkState({...active,status:'closed'}),{replyKey:'Needs follow-up',overdue:false,dueAt:null,terminalKey:'Chat ended'});
 assert.deepEqual(supportStaffWorkState({...active,status:'closed',resolvedAt:1}),{replyKey:null,overdue:false,dueAt:null,terminalKey:'Resolved'});
 for(const staffReplyDueAt of [Number.NaN,Infinity,-1,0,1e30])assert.equal(supportStaffWorkState({...active,staffReplyDueAt}).dueAt,null);
 assert.equal(supportStaffWorkState({status:'open'}).replyKey,null,'Legacy missing fields do not invent a response state');
});

test('FE-019 S125 actual staff queue keeps compact authoritative reply filtering and safe return origins',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/page.tsx');fixture.conversation.replyState='overdue';
 let html=await render({queue:'transport',status:'overdue',q:'QA request',page:'2'});
 assert.equal(fixture.query.status,'overdue');assert.match(html,/aria-current="page">All active/);assert.match(html,/Reply status/);
 assert.equal((html.match(/name="status"/g)||[]).length,1,'A select and hidden status must not compete');assert.match(html,/<option value="overdue" selected="">Overdue/);
 assert.match(html,/Needs staff reply/);assert.match(html,/Assigned to Agent A/);assert.ok(html.indexOf('data-support-work')<html.indexOf('data-assignment-state'));
 assert.match(html,/href="\/dashboard\/support\/42\?queue=transport&amp;status=overdue&amp;q=QA\+request/);
 assert.match(html,/href="\/dashboard\/support\?queue=transport&amp;status=overdue">Clear/);
 for(const queue of ['support','transport']){html=await render({queue,status:'resolved'});assert.match(html,/aria-current="page">Resolved/);assert.match(html,/>Chat history<\/a>/);assert.doesNotMatch(html,/<select name="status"/);}
 fixture.actor.access_role='team_member';fixture.actor.staff_queue_scope='support';html=await render({queue:'transport',status:'needs_reply'});assert.equal(fixture.query.queue,'support');assert.equal(fixture.query.status,'needs_reply');
 fixture.actor.access_role='client';fixture.actor.staff_queue_scope=null;fixture.conversation.agentJoined=false;html=await render({queue:'transport',status:'overdue'});assert.equal(fixture.query.status,undefined,'A customer URL cannot activate an internal staff response filter');assert.match(html,/Waiting for our team/);assert.doesNotMatch(html,/Reply status|Needs staff reply|Overdue|Assigned to Agent A|Reply due/);
});

test('FE-019 S125 actual staff detail requires deliberate current-assignee Join before public reply while notes and manager tasks remain',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/[id]/page.tsx');fixture.actor={...fixture.actor,id:8,access_role:'team_member',staff_queue_scope:'transport'};fixture.conversation.replyState='overdue';
 let html=await render({queue:'transport',status:'overdue',q:'QA request',page:'2'});
 assert.match(html,/Needs staff reply/);assert.match(html,/Overdue/);assert.match(html,/Join chat/);assert.match(html,/name="publicRef" value="SUP-QA"/);assert.match(html,/name="assignmentEpoch" value="29"/);
 assert.match(html,/name="nav_status" value="overdue"/);assert.match(html,/name="nav_q" value="QA request"/);assert.match(html,/name="nav_page" value="2"/);
 assert.match(html,/name="audience" value="note"/);assert.doesNotMatch(html,/<option value="reply"/,'Before Join the only permitted composer is a private note');
 fixture.conversation.agentJoined=true;html=await render({queue:'transport',status:'needs_reply'});assert.doesNotMatch(html,/>Join chat<|Join this chat/);assert.match(html,/<option value="reply"/);
 fixture.actor={...fixture.actor,id:1,access_role:'platform_admin',staff_queue_scope:null};fixture.conversation.agentJoined=false;html=await render({queue:'transport'});assert.doesNotMatch(html,/>Join chat<|<option value="reply"/);assert.match(html,/Assign support agent/);assert.match(html,/name="audience" value="note"/);
 fixture.actor={...fixture.actor,id:8,access_role:'team_member',staff_queue_scope:'support'};fixture.conversation.assistanceCategory='general';fixture.conversation.participantKind='client';
 html=await render({queue:'support'});assert.match(html,/Join chat/);assert.doesNotMatch(html,/class="panel support-reply"/,'Public owner-support reply is unavailable before joining');assert.match(html,/>Mark resolved<\/button>/);
 fixture.conversation.status='closed';html=await render({queue:'support',status:'history'});assert.match(html,/Needs follow-up/);assert.match(html,/>Chat ended<\/span>/);assert.match(html,/>Mark resolved<\/button>/);assert.doesNotMatch(html,/>Join chat<|Reply due/);
 fixture.conversation.resolvedAt=1;html=await render({queue:'support',status:'resolved'});assert.match(html,/>Resolved<\/span>/);assert.doesNotMatch(html,/Needs follow-up|>Mark resolved<\/button>/);
 fixture.conversation.status='waiting';fixture.conversation.resolvedAt=null;fixture.conversation.assignedUserId=null as unknown as number;fixture.conversation.assignedUserName=null;fixture.actor={...fixture.actor,id:1,access_role:'platform_admin',staff_queue_scope:null};html=await render({queue:'support'});assert.match(html,/>Claim conversation<\/button>/);assert.doesNotMatch(html,/>Join chat</);
});

test('FE-019 S125 actual owner detail hides assignment and deadlines, distinguishes explicit join and retains unresolved End chat',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/[id]/page.tsx');fixture.actor={...fixture.actor,id:7,access_role:'client',business_id:null,staff_queue_scope:null};fixture.conversation.assistanceCategory='general';fixture.conversation.participantKind='client';fixture.conversation.replyState='overdue';fixture.conversation.agentJoined=false;
 let html=await render();assert.match(html,/Waiting for our team/);assert.match(html,/>End chat<\/button>/);assert.doesNotMatch(html,/Assigned to Agent A|Needs staff reply|Overdue|Reply due|Join chat|Mark resolved|Assignment history/);
 fixture.conversation.agentJoined=true;fixture.conversation.replyState='waiting_customer';html=await render();assert.match(html,/Agent A joined your chat/);assert.match(html,/Waiting for your reply/);assert.doesNotMatch(html,/Reply due|Needs staff reply/);
 fixture.conversation.status='closed';html=await render();assert.match(html,/Chat ended/);assert.doesNotMatch(html,/Agent A joined your chat|>End chat<|Mark resolved/);
});

test('FE-019 S125 retained video review follows the same joined current-assignee public-reply gate',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/[id]/page.tsx');
 fixture.conversation.assistanceCategory='video_request';fixture.conversation.participantKind='client';
 fixture.videoRequest={target_kind:'header',target_label:'Header video',status:'pending',source_url:'https://www.youtube.com/watch?v=example'};
 let html=await render({queue:'support'});assert.match(html,/Open submitted video/);assert.doesNotMatch(html,/Approve video|Decline video|video-review-reply|>Join chat</,'A manager inspecting another assignee has no approval path that would fail its reply requirement');
 fixture.actor={...fixture.actor,id:8,access_role:'team_member',staff_queue_scope:'support'};
 html=await render({queue:'support'});assert.match(html,/>Join chat</);assert.doesNotMatch(html,/Approve video|Decline video|video-review-reply/);
 fixture.conversation.agentJoined=true;html=await render({queue:'support'});assert.match(html,/Approve video/);assert.match(html,/value="declined" name="decision">Decline<\/button>/);assert.match(html,/name="nav_queue" value="support"/);
 fixture.conversation.status='closed';html=await render({queue:'support',status:'history'});assert.doesNotMatch(html,/Approve video|Decline video|video-review-reply/);
 fixture.conversation.status='open';fixture.actor={...fixture.actor,id:7,access_role:'client',business_id:null,staff_queue_scope:null};html=await render();assert.doesNotMatch(html,/Approve video|Decline video|video-review-reply/);
});

test('FE-019 S125 staff idle-ending explanation uses immutable proof, preserves later history and never fabricates a customer read',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/[id]/page.tsx');
 fixture.conversation.status='closed';fixture.conversation.idleEndedAt=Date.UTC(2026,9,17,12,30);
 let html=await render({queue:'transport',status:'history'});
 assert.doesNotMatch(html,/data-idle-end-evidence|Ended after no customer reply|Read status at ending/,'A historical ending alone is not evidence');
 const sentAt=Date.UTC(2026,9,17,12),endedAt=sentAt+30*60_000;
 fixture.evidence={version:1,reason:'participant_no_reply',endedAt,waitingSince:sentAt,windowMs:30*60_000,lastPublicStaffReply:{id:81,sentAt},latestParticipantMessage:{id:80,sentAt:sentAt-60_000},lastReplyConfirmedReadAtEnding:false};
 fixture.messages=[{id:81,senderRole:'staff',senderName:'Agent A',senderUserId:8,createdAt:sentAt,body:'Team reply',visitorVisible:true,read:true}];
 html=await render({queue:'transport',status:'history'});
 assert.match(html,/data-idle-end-evidence/);assert.match(html,/>Ended after no customer reply<\/h2>/);assert.match(html,/>Last team reply<\/dt>/);assert.match(html,/>Read status at ending<\/dt><dd>Not marked read<\/dd>/);
 assert.match(html,/dateTime="2026-10-17T12:00:00\.000Z"/);assert.match(html,/dateTime="2026-10-17T12:30:00\.000Z"/);
 assert.doesNotMatch(html,/Confirmed read|Customer did not read|Customer saw|participant_no_reply|waitingSince/,'Current read receipts and implementation facts cannot replace the saved ending evidence');
 assert.ok(html.indexOf('class="support-thread"')<html.indexOf('data-idle-end-evidence'),'Evidence remains secondary to the conversation');
 fixture.evidence.lastReplyConfirmedReadAtEnding=true;fixture.messages[0].read=false;
 for(const status of ['open','closed']){
  fixture.conversation.status=status;fixture.conversation.resolvedAt=status==='closed'?endedAt+60_000:null;fixture.conversation.idleEndedAt=null;
  html=await render({queue:'transport',status:status==='closed'?'resolved':'active'});assert.match(html,/>Read status at ending<\/dt><dd>Confirmed read<\/dd>/);assert.doesNotMatch(html,/Not marked read/,'Reopening or resolution never rewrites the immutable read fact');
 }
 fixture.actor={...fixture.actor,id:8,access_role:'team_member',staff_queue_scope:'transport'};
 html=await render({queue:'transport'});assert.match(html,/data-idle-end-evidence/,'An authorized queue staff detail has the same explanation');
 fixture.actor={...fixture.actor,id:7,access_role:'client',business_id:null,staff_queue_scope:null};fixture.conversation.assistanceCategory='general';fixture.conversation.participantKind='client';
 const staffReads=fixture.evidenceReads;html=await render();assert.equal(fixture.evidenceReads,staffReads,'Customer rendering must not invoke the staff-only proof reader');assert.doesNotMatch(html,/data-idle-end-evidence|Ended after no customer reply|Read status at ending|Confirmed read|Last team reply/);
});


test('FE-019 S142 actual conversation keeps transcript/reply first without reading retired company records',async()=>{
 const {fixture,render}=await screen('app/dashboard/support/[id]/page.tsx');
 fixture.handoff={id:29,company:'Private carrier',contact:'Private dispatcher contact',createdAt:1};
 fixture.conversation.agentJoined=true;
 for(const actor of [{...fixture.actor,id:1,access_role:'platform_admin'},{...fixture.actor,id:8,access_role:'team_member',staff_queue_scope:'transport'}]){
  fixture.actor=actor;const html=await render({queue:'transport',status:'active',q:'chairs',page:'2'});
  const transcript=html.indexOf('class="support-thread"'),aside=html.indexOf('<aside');assert.ok(transcript>=0&&transcript<aside);
  assert.doesNotMatch(html,/Private carrier|Private dispatcher contact|Transport company|name="company"|name="contact"|<details/);assert.equal(fixture.handoffReads,0);
  assert.match(html,/href="[^"]*panel=details"/);assert.match(html,/name="nav_queue" value="transport"/);assert.match(html,/name="nav_q" value="chairs"/);assert.match(html,/data-receipt-epoch="29"/);
  const details=await render({queue:'transport',panel:'details'});assert.match(details,/data-details-view="true"/);assert.match(details,/data-can-read="false"/);assert.match(details,/name="nav_panel" value="details"/);assert.match(details,/Back to conversation/);
 }
 fixture.conversation.status='closed';let html=await render({queue:'transport',status:'history'});assert.match(html,/name="audience" value="note"/);assert.equal(fixture.handoffReads,0);
 fixture.actor={...fixture.actor,id:7,access_role:'client',business_id:null,staff_queue_scope:null};fixture.conversation.assistanceCategory='general';fixture.conversation.participantKind='client';fixture.conversation.status='open';html=await render({panel:'details'});assert.match(html,/support-reply-attachment/);assert.doesNotMatch(html,/data-details-view="true"|Transport company|Private carrier/);
});

test('FE-019 retained queue recovery action enforces role and queue without a hidden hold policy',async()=>{
 const fixture={actor:{id:1,access_role:'platform_admin',staff_queue_scope:null as string|null},calls:[] as Array<{options:{queue:string}}>,failure:false,revalidated:[] as string[],scheduled:0};
 const bundle=await build({entryPoints:['app/support-actions.ts'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'recovery-action-ports',setup(b){
  b.onResolve({filter:/^(next\/(cache|navigation)|@\/lib\/(auth|capabilities|attention-after|support-video-requests|catalog-runtime|support|security|support-media))$/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({contents:
   a.path==='next/navigation'?`export const RedirectType={replace:'replace'},redirect=(url,type)=>{throw Object.assign(Error('redirect'),{url,type});};`
   :a.path==='next/cache'?`export const revalidatePath=path=>fixture.revalidated.push(path);`
   :a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.actor;`
   :a.path==='@/lib/capabilities'?`export const hasCapability=capability,isQueueAgent=queueAgent;`
   :a.path==='@/lib/attention-after'?`export const scheduleAttentionDelivery=()=>fixture.scheduled++;`
   :a.path==='@/lib/security'?`export const audit=async()=>{};`
   :a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async()=>null;`
   :a.path==='@/lib/support-video-requests'?`export const createVideoRequest=async()=>{},reviewVideoRequest=async()=>{};`
   :a.path==='@/lib/support-media'?`export class SupportAttachmentError extends Error{};export const stageSupportAttachment=async()=>null;`
   :`export class SupportError extends Error{};export const routeWaitingSupportConversations=async(user,now,options)=>{fixture.calls.push({options});if(fixture.failure)throw Error('private database detail');return {routed:3,remaining:1};};export const updateSupportAgentSetting=async()=>{},joinSupportConversation=async()=>{},claimSupportConversation=async()=>{},closeSupportConversation=async()=>{},createSupportConversation=async()=>{},postSupportMessage=async()=>{},reopenSupportConversation=async()=>{},reassignSupportConversation=async()=>{},saveTransportHandoff=async()=>{};`}));
 }}]});
 const module={exports:{} as {assignWaitingSupportConversationsAction:(form:FormData)=>Promise<void>}};
 vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,fixture,capability:hasCapability,queueAgent:isQueueAgent,FormData,URLSearchParams,Date});
 const form=()=>{const value=new FormData();for(const[key,text]of Object.entries({nav_queue:'transport',nav_status:'waiting',nav_q:'chairs',nav_page:'2',returnTo:'https://foreign.invalid'}))value.set(key,text);return value;};
 await assert.rejects(()=>module.exports.assignWaitingSupportConversationsAction(form()),error=>(error as {url?:string}).url==='/dashboard/support?queue=transport&status=waiting&q=chairs&page=2&routed=3&remaining=1');assert.deepEqual(JSON.parse(JSON.stringify(fixture.calls)),[{options:{queue:'transport'}}]);assert.equal(fixture.scheduled,1);assert.deepEqual(fixture.revalidated,['/dashboard/support','/dashboard/support/agents']);
 for(const access_role of ['client','team_member']){fixture.actor.access_role=access_role;const count=fixture.calls.length;await assert.rejects(()=>module.exports.assignWaitingSupportConversationsAction(form()),error=>String((error as {url?:string}).url).includes('Operations%20access%20is%20required.'));assert.equal(fixture.calls.length,count);}
 fixture.actor.access_role='platform_admin';const invalid=form();invalid.set('nav_queue','foreign');await assert.rejects(()=>module.exports.assignWaitingSupportConversationsAction(invalid),error=>String((error as {url?:string}).url).includes('Choose%20a%20support%20queue.'));
 fixture.failure=true;await assert.rejects(()=>module.exports.assignWaitingSupportConversationsAction(form()),error=>{const url=String((error as {url?:string}).url);assert.ok(!url.includes('private'));return url.includes('Support%20could%20not%20be%20updated.');});
});

// S142 retires the company editor. Its denial and compact workspace DOM are covered by test-support-compact-ui.ts.
