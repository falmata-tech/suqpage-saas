import type {SessionUser} from './types';
import type {OwnerTransportConversation,OwnerTransportDefaults,OwnerTransportRead,OwnerTransportState} from './owner-transport-contract';
import {runtimeGet} from './runtime-sql';
import {assertOwnerTransport,createOwnerTransportConversation,getSupportConversation,listSupportConversations,postSupportMessage,acknowledgeSupportRead,closeSupportConversation,reopenSupportConversation,submitOwnerTransportCallback,SupportError} from './support';

function fields(raw:Record<string,unknown>,allowed:readonly string[]){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(key=>!allowed.includes(key)))throw new SupportError('Request could not be accepted.','invalid_request');
}
function id(value:unknown){
  const parsed=typeof value==='number'?value:typeof value==='string'&&/^[1-9]\d{0,14}$/.test(value)?Number(value):NaN;
  if(!Number.isSafeInteger(parsed)||parsed<1)throw new SupportError('Transport request was not found.','not_found');
  return parsed;
}
function flag(value:unknown){
  if(value===undefined||value===null)return false;
  if(value==='1'||value===1||value===true)return true;
  throw new SupportError('Request could not be accepted.','invalid_request');
}
async function defaults(actor:SessionUser):Promise<OwnerTransportDefaults>{
  await assertOwnerTransport(actor);
  const row=await runtimeGet<{name:string;account_phone:string|null;public_phone:string|null}>(`SELECT u.name,u.account_phone,b.public_phone FROM users u JOIN businesses b ON b.id=u.business_id WHERE u.id=? AND u.business_id=?`,[actor.id,actor.business_id]);
  if(!row)throw new SupportError('A client account is required.','forbidden');
  const phone=[row.public_phone,row.account_phone].filter((value):value is string=>typeof value==='string').map(value=>value.replace(/[\s().-]/g,'')).find(value=>/^\+?[0-9]{7,15}$/.test(value))||'';
  return {name:row.name,phone};
}
async function receipt(actor:SessionUser,conversationId:number):Promise<OwnerTransportConversation>{
  await assertOwnerTransport(actor,conversationId);
  const {conversation:c,messages}=await getSupportConversation(actor,conversationId);
  return {id:c.id,publicRef:c.publicRef,subject:c.subject,category:c.assistanceCategory,status:c.status,createdAt:c.createdAt,serverNow:Date.now(),transportWaitStartedAt:c.transportWaitStartedAt,agentJoinedAt:c.agentJoinedAt,firstStaffReplyAt:c.firstStaffReplyAt,resolvedAt:c.resolvedAt,assignedUserName:c.assignedUserName,agentJoined:c.agentJoined,
    idleWarningAt:c.idleWarningAt??null,idleEndsAt:c.idleEndsAt??null,idleEndedAt:c.idleEndedAt??null,
    replyState:c.replyState??null,staffReplyDueAt:c.staffReplyDueAt??null,
    ...(c.transportCallback?{transportCallback:c.transportCallback}:{}),
    ...(c.transportPlan?{transportPlan:c.transportPlan,transportPlanLink:c.transportPlanLink}:{}),
    messages:messages.map(message=>{const participant=message.senderRole==='client'||message.senderRole==='visitor';return{id:message.id,sender:participant?'visitor':'staff',senderName:participant&&message.senderUserId===actor.id?'You':message.senderName,body:message.body,createdAt:message.createdAt,read:message.read};})};
}
export async function readOwnerTransport(actor:SessionUser,query:Record<string,unknown>={}):Promise<OwnerTransportRead>{
  fields(query,['conversation','new','history','page','status']);await assertOwnerTransport(actor);
  const fresh=flag(query.new),history=flag(query.history),explicit=query.conversation!==undefined&&query.conversation!==null;
  if(Number(fresh)+Number(history)+Number(explicit)>1)throw new SupportError('Request could not be accepted.','invalid_request');
  if(history){
    if(query.status!=null&&!['active','waiting','open','closed','history','resolved','needs_reply','overdue','waiting_customer'].includes(String(query.status)))throw new SupportError('Request could not be accepted.','invalid_request');
    const result=await listSupportConversations(actor,{queue:'transport',page:query.page,status:query.status});
    return {items:result.items.map(c=>({id:c.id,publicRef:c.publicRef,subject:c.subject,status:c.status,assignedUserName:c.assignedUserName,lastMessageAt:c.lastMessageAt,resolvedAt:c.resolvedAt,unread:c.unread,agentJoined:c.agentJoined,replyState:c.replyState??null,staffReplyDueAt:c.staffReplyDueAt??null})),page:result.page,pages:result.totalPages,total:result.totalItems,pageSize:result.pageSize,firstItem:result.firstItem,lastItem:result.lastItem};
  }
  const contact=await defaults(actor);
  if(fresh)return {conversation:null,defaults:contact};
  const selected=explicit?id(query.conversation):(await runtimeGet<{id:number}>("SELECT id FROM support_conversations WHERE business_id=? AND participant_kind='client' AND assistance_category='shipment_observation' AND status IN ('waiting','open') ORDER BY last_message_at DESC,id DESC LIMIT 1",[actor.business_id]))?.id;
  return {conversation:selected?await receipt(actor,selected):null,defaults:contact};
}

export async function commandOwnerTransport(actor:SessionUser,body:Record<string,unknown>):Promise<OwnerTransportState>{
  await assertOwnerTransport(actor);
  if(!body||typeof body!=='object'||Array.isArray(body))throw new SupportError('Request could not be accepted.','invalid_request');
  let conversationId:number;
  if(body.action==='start'){
    fields(body,['action','name','phone','origin','destination','message','idempotencyKey','coordinatorId']);
    conversationId=(await createOwnerTransportConversation(actor,{name:body.name,phone:body.phone,origin:body.origin,destination:body.destination,message:body.message,idempotencyKey:body.idempotencyKey,coordinatorId:body.coordinatorId})).id;
  }else{
    const allowed=body.action==='message'?['action','conversationId','publicRef','message','idempotencyKey']:body.action==='callback'?['action','conversationId','publicRef','phone','email','idempotencyKey']:body.action==='read'?['action','conversationId','publicRef','messageId']:['action','conversationId','publicRef'];
    fields(body,allowed);conversationId=id(body.conversationId);
    if(typeof body.publicRef!=='string'||!body.publicRef)throw new SupportError('Request could not be accepted.','conversation_changed');
    await assertOwnerTransport(actor,conversationId,body.publicRef);
    if(body.action==='message')await postSupportMessage(actor,conversationId,{audience:'reply',message:body.message,idempotencyKey:body.idempotencyKey});
    else if(body.action==='callback')await submitOwnerTransportCallback(actor,conversationId,{publicRef:body.publicRef,phone:body.phone,email:body.email,idempotencyKey:body.idempotencyKey});
    else if(body.action==='read')await acknowledgeSupportRead(actor,conversationId,{messageId:body.messageId,publicRef:body.publicRef});
    else if(body.action==='close')await closeSupportConversation(actor,conversationId);
    else if(body.action==='resume')await reopenSupportConversation(actor,conversationId);
    else throw new SupportError('Request could not be accepted.','invalid_request');
  }
  return {conversation:await receipt(actor,conversationId),defaults:await defaults(actor)};
}
