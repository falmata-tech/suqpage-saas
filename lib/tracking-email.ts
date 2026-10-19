import {platformEnvironment} from './platform-environment.mjs';
import {createUiText} from './i18n/core';
import am from './i18n/messages/am.json';
import om from './i18n/messages/om.json';
import {supportEscalationEmailOrigin,supportEscalationEmailReadiness,type SupportEscalationEmailMode,type SupportEscalationEmailResult} from './support-escalation-email';
import {isTrackingReference,parseTrackingShipment,type TrackingShipment,type TrackingLocale} from './tracking-contract';
export type TrackingEmailMode=SupportEscalationEmailMode;
export type TrackingEmail={deliveryId:number;recipientEmail:string;locale:TrackingLocale}&({kind:'code';code:string}|{kind:'initial';shipment:TrackingShipment});
export type TrackingEmailResult=SupportEscalationEmailResult;
export type TrackingEmailPort=(email:TrackingEmail)=>Promise<TrackingEmailResult>;
export const trackingEmailReadiness=supportEscalationEmailReadiness;
export const trackingEmailOrigin=supportEscalationEmailOrigin;
export function trackingEmailContent(email:TrackingEmail,origin:string){
 const t=createUiText({en:{},am,om}[email.locale]);
 if(email.kind==='code')return{subject:t('Your MirtPage shipment tracking code'),text:[t('Your verification code: {code}',{code:email.code}),t('This code expires in 10 minutes.'),t('If you did not request this code, you can ignore this email.')].join('\n\n')};
 const s=email.shipment;
 return{subject:t('Your MirtPage shipment tracking details'),text:[t('Your shipment tracking details are ready.'),`${t('Reference')}: ${s.reference}`,s.label,...s.legs.map((l,i)=>`${i+1}. ${l.providerName} · ${t({air:'Air',truck:'Truck',van:'Van',car:'Car',motorcycle:'Motorcycle'}[l.method])}\n${t('From')}: ${l.origin}\n${t('To')}: ${l.destination}`),'',t('Verify your email in Shipment tracking to view your shipments.'),origin+'/tracking/'+s.reference].filter(Boolean).join('\n\n')};
}
/** Reuses existing provider/loopback guards; never writes provider configuration. */
export async function sendTrackingEmail(email:TrackingEmail,options:{mode?:TrackingEmailMode;send?:typeof fetch;env?:Record<string,string|undefined>}={}):Promise<TrackingEmailResult>{
 const mode=options.mode??'resend',env=options.env??platformEnvironment(),origin=trackingEmailOrigin(mode,env);
 if(!origin||!trackingEmailReadiness(mode,env).ready)return{state:'deferred',category:'missing_configuration'};
 if(!Number.isSafeInteger(email.deliveryId)||email.deliveryId<1||typeof email.recipientEmail!=='string'||email.recipientEmail.length>254||!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email.recipientEmail)||!['en','am','om'].includes(email.locale))return{state:'failed',category:'invalid_message',retryable:false};
 try{
  if(email.kind==='code'){if(!/^\d{6}$/.test(email.code))throw Error();}
  else if(email.kind==='initial'){parseTrackingShipment(email.shipment);if(!isTrackingReference(email.shipment.reference))throw Error();}
  else throw Error();
 }catch{return{state:'failed',category:'invalid_message',retryable:false};}
 const raw=env.NOTIFICATION_FROM_EMAIL||'',from=mode==='local-mailpit'?'alerts@suqpage.test':raw.includes('<')?/^[^<>\r\n]*<([^<>\r\n]+)>$/.exec(raw)?.[1]:raw;
 if(!from)return{state:'deferred',category:'missing_configuration'};
 const key='suqpage-tracking-'+email.deliveryId,content=trackingEmailContent(email,origin),headers:Record<string,string>={'Content-Type':'application/json'};
 if(mode==='resend'){headers.Authorization='Bearer '+env.RESEND_API_KEY;headers['Idempotency-Key']=key;}
 const body=mode==='local-mailpit'?{From:{Email:from,Name:'MirtPage'},To:[{Email:email.recipientEmail}],Subject:content.subject,Text:content.text,Headers:{'Message-ID':`<${key}@suqpage.test>`}}:{from:`MirtPage <${from}>`,to:[email.recipientEmail],subject:content.subject,text:content.text};
 try{const response=await(options.send??fetch)(mode==='local-mailpit'?'http://127.0.0.1:54324/api/v1/send':'https://api.resend.com/emails',{method:'POST',headers,body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(4000)});await response.body?.cancel().catch(()=>{});return response.ok?{state:'accepted'}:{state:'failed',category:'provider_rejected',retryable:response.status===408||response.status===429||response.status>=500};}catch{return{state:'failed',category:'provider_failure',retryable:true};}
}
