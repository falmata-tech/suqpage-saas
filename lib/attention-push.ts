import webpush from 'web-push';
import {createECDH,timingSafeEqual} from 'node:crypto';
import type {AttentionDestination} from './attention-contract';

export type PushSubscriptionInput = {kind:'web';subscription:{endpoint:string;keys:{p256dh:string;auth:string}}} | {kind:'expo';token:string};
export type PushPayload = {notificationId:number;title:string;body:string;destination:AttentionDestination;scope:'user'|'visitor';silent:boolean};
export type PushResult = {state:'accepted';receipt?:string}|{state:'unconfigured'|'expired'|'failed';category:string;retryable:boolean};
export type AttentionPushPort = (subscription:PushSubscriptionInput,payload:PushPayload)=>Promise<PushResult>;

export function validatedPushSubscription(raw:unknown):PushSubscriptionInput {
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Choose a notification device.');
  const value=raw as Record<string,unknown>;
  if(value.kind==='expo'){
    if(typeof value.token!=='string'||!/^Expo(nent)?PushToken\[[A-Za-z0-9_-]{10,200}\]$/.test(value.token))throw new Error('Choose a notification device.');
    return {kind:'expo',token:value.token};
  }
  if(value.kind!=='web'||!value.subscription||typeof value.subscription!=='object')throw new Error('Choose a notification device.');
  const s=value.subscription as Record<string,unknown>;const url=new URL(String(s.endpoint));
  // Capability URLs come from browser push providers, never arbitrary caller hosts.
  const allowed=['fcm.googleapis.com','updates.push.services.mozilla.com','push.services.mozilla.com'].includes(url.hostname)||/^[a-z0-9-]+\.push\.apple\.com$/.test(url.hostname);
  if(!allowed||url.protocol!=='https:'||url.port||url.username||url.password||url.hash||url.search||url.pathname==='/'||url.href.length>2048)throw new Error('Choose a supported notification device.');
  if(!s.keys||typeof s.keys!=='object')throw new Error('Choose a notification device.');
  const k=s.keys as Record<string,unknown>;
  if(typeof k.p256dh!=='string'||typeof k.auth!=='string'||!/^[A-Za-z0-9_-]+=*$/.test(k.p256dh)||!/^[A-Za-z0-9_-]+=*$/.test(k.auth)||Buffer.from(k.p256dh,'base64url').length!==65||Buffer.from(k.p256dh,'base64url')[0]!==4||Buffer.from(k.auth,'base64url').length!==16)throw new Error('Choose a notification device.');
  return {kind:'web',subscription:{endpoint:url.href,keys:{p256dh:k.p256dh,auth:k.auth}}};
}
export function pushCapabilities(){
  const publicKey=process.env.SUQPAGE_WEB_PUSH_PUBLIC_KEY||'',privateKey=process.env.SUQPAGE_WEB_PUSH_PRIVATE_KEY||'',subject=process.env.SUQPAGE_WEB_PUSH_SUBJECT||'';
  let pair=false;try{const ecdh=createECDH('prime256v1');ecdh.setPrivateKey(Buffer.from(privateKey,'base64url'));const derived=ecdh.getPublicKey(),supplied=Buffer.from(publicKey,'base64url');pair=derived.length===supplied.length&&timingSafeEqual(derived,supplied);}catch{/* Missing or mismatched keys are not ready. */}
  const web=Boolean(pair&&/^[A-Za-z0-9_-]+$/.test(publicKey)&&Buffer.from(publicKey,'base64url').length===65&&/^[A-Za-z0-9_-]+$/.test(privateKey)&&Buffer.from(privateKey,'base64url').length===32&&(/^[^\r\n]+$/.test(subject))&&/^(mailto:[^\s@]+@[^\s@]+\.[^\s@]+|https:\/\/)/.test(subject));
  return {web:{available:web,publicKey:web?process.env.SUQPAGE_WEB_PUSH_PUBLIC_KEY:''},expo:{available:process.env.SUQPAGE_NATIVE_PUSH_ENABLED==='1'&&process.env.SUQPAGE_NATIVE_PUSH_MODE==='standard'}};
}
export const sendAttentionPush:AttentionPushPort=async(subscription,payload)=>{
  const cap=pushCapabilities();
  if(subscription.kind==='web'){
    if(!cap.web.available)return {state:'unconfigured',category:'configuration_missing',retryable:true};
    try{
      await webpush.sendNotification(subscription.subscription,JSON.stringify(payload),{vapidDetails:{subject:process.env.SUQPAGE_WEB_PUSH_SUBJECT!,publicKey:process.env.SUQPAGE_WEB_PUSH_PUBLIC_KEY!,privateKey:process.env.SUQPAGE_WEB_PUSH_PRIVATE_KEY!},TTL:1800,timeout:4000,urgency:'normal'});
      return {state:'accepted'};
    }catch(e){const status=typeof e==='object'&&e!==null&&'statusCode' in e?Number(e.statusCode):0;
      if(status===404||status===410)return {state:'expired',category:'subscription_expired',retryable:false};
      return {state:'failed',category:status===429?'provider_rate_limit':'provider_failure',retryable:status===0||status===429||status>=500};
    }
  }
  if(!cap.expo.available)return {state:'unconfigured',category:'configuration_missing',retryable:true};
  try{
    const r=await fetch('https://exp.host/--/api/v2/push/send',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({to:subscription.token,title:payload.title,body:payload.body,data:{notificationId:payload.notificationId,destination:payload.destination,scope:payload.scope,silent:payload.silent},sound:payload.silent?null:'default',channelId:payload.silent?'suqpage-alerts-quiet':'suqpage-alerts',ttl:1800,priority:'high'}),signal:AbortSignal.timeout(4000)});
    if(!r.ok)return {state:'failed',category:r.status===429?'provider_rate_limit':'provider_failure',retryable:r.status===429||r.status>=500};
    const b=await r.json() as {data?:{status?:string;id?:string;details?:{error?:string}}};
    if(b.data?.status==='ok'&&b.data.id)return {state:'accepted',receipt:b.data.id};
    if(b.data?.details?.error==='DeviceNotRegistered')return {state:'expired',category:'subscription_expired',retryable:false};
    return {state:'failed',category:'provider_rejected',retryable:false};
  }catch{return {state:'failed',category:'provider_unavailable',retryable:true};}
};
