import {parseTransportPlanLegs,TransportPlanError,type TransportPlanLeg,type TransportPlanLegInput} from './transport-plan-contract';
export type {TransportPlanLeg,TransportPlanLegInput};
export type TrackingLeg=TransportPlanLeg&{trackingUrl:string;trackingCode:string};
export type TrackingLegInput=Omit<TrackingLeg,'id'>&{id:string|null};
export type TrackingLocale='en'|'am'|'om';
export type TrackingShipment={reference:string;label:string;version:number;legs:TrackingLeg[]};
export type TrackingShipmentSummary=Omit<TrackingShipment,'legs'>&{firstOrigin:string;lastDestination:string;legCount:number};
export type TrackingList={shipments:TrackingShipmentSummary[];nextCursor:string|null};
export type TrackingSession={token:string;expiresAt:number};
export type TrackingChallenge={challengeId:string;resendAfter:number};
export type TrackingShipmentDetail=TrackingShipment;
export type TrackingShipmentList=TrackingList;
export type TrackingDeliveryState='queued'|'sending'|'accepted'|'failed'|'deferred'|'cancelled';
export type StaffTrackingShipment=TrackingShipment&{id:number;recipientEmail:string;revokedAt:number|null;deliveryState:TrackingDeliveryState;sharePath:string;createdAt:number;updatedAt:number};
export type StaffTrackingSummary=Omit<StaffTrackingShipment,'legs'>&{firstOrigin:string;lastDestination:string;legCount:number};
export type StaffTrackingList={shipments:StaffTrackingSummary[];nextCursor:string|null};
export type TrackingRead={kind:'not_modified';etag:string}|{kind:'shipment';etag:string;shipment:TrackingShipment};
export type TrackingSubmit={recipientEmail:string;label:string;legs:TrackingLegInput[];idempotencyKey:string};
export type TrackingUpdate={shipmentId:number;reference:string;expectedVersion:number;label:string;legs:TrackingLegInput[]};
export type TrackingRevoke=Pick<TrackingUpdate,'shipmentId'|'reference'|'expectedVersion'>;
export const TRACKING_CODE_MS=10*60_000,TRACKING_SESSION_MS=7*24*60*60_000,TRACKING_RESEND_SECONDS=60,TRACKING_LIST_LIMIT=24;
export const TRACKING_PROVIDER_URL_MAX_LENGTH=2048,TRACKING_PROVIDER_CODE_MAX_LENGTH=120,TRACKING_LEGS_MAX_BYTES=60_000;
export class TrackingError extends Error{
 constructor(message:string,readonly code:'invalid'|'unauthenticated'|'forbidden'|'not_found'|'conflict'|'rate_limited'|'recipient_unverified',readonly retryAfter?:number){super(message);this.name='TrackingError';}
 get status(){return this.code==='unauthenticated'?401:this.code==='forbidden'?403:this.code==='not_found'?404:this.code==='conflict'?409:this.code==='rate_limited'?429:this.code==='recipient_unverified'?409:400;}
}
export const isTrackingReference=(v:unknown):v is string=>typeof v==='string'&&/^SHP-[A-F0-9]{20}$/.test(v);
export const isTrackingToken=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export const isTrackingChallengeId=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{32}$/.test(v);
export function trackingEmail(value:unknown){if(typeof value!=='string')throw new TrackingError('Enter a valid email address.','invalid');const email=value.trim().toLowerCase();if(email.length>254||!email||/[\u0000-\u0020\u007f-\u009f<>]/u.test(email)||!/^([^@]+)@([^@]+\.[^@]+)$/.test(email))throw new TrackingError('Enter a valid email address.','invalid');return email;}
export function trackingLabel(value:unknown){if(value===undefined)return'';if(typeof value!=='string'||/[\u0000-\u001f\u007f-\u009f]/u.test(value))throw new TrackingError('Check the shipment details.','invalid');const label=value.replace(/\s+/gu,' ').trim();if([...label].length>120)throw new TrackingError('Use 120 characters or fewer for each transport field.','invalid');return label;}
export function trackingRecord(v:unknown,keys:readonly string[]):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k)))throw new TrackingError('Check the shipment details.','invalid');return v as Record<string,unknown>;}
const unsafeProviderText=/[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u;
const invalidProviderUrl=()=>new TrackingError('Enter a valid HTTPS tracking link.','invalid');
/** Author-supplied navigation only: never fetch or append credentials/codes. */
export function trackingProviderUrl(value:unknown):string{
 if(value===undefined||value===null)return'';
 if(typeof value!=='string'||value.length>TRACKING_PROVIDER_URL_MAX_LENGTH||unsafeProviderText.test(value)||value.includes('\\'))throw invalidProviderUrl();
 const input=value.trim();if(!input)return'';
 try{
  const decoded=decodeURIComponent(input),authority=/^https:\/\/([^/?#]+)/i.exec(input)?.[1];
  if(!authority||authority.includes(':')||authority.includes('@')||/\s/u.test(input)||unsafeProviderText.test(decoded)||decoded.includes('\\'))throw invalidProviderUrl();
  const url=new URL(input),host=url.hostname.toLowerCase(),labels=host.split('.');
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.href.length>TRACKING_PROVIDER_URL_MAX_LENGTH||host.length>253||labels.length<2||
   /^(?:\d+\.\d+\.\d+\.\d+|\[.*\])$/.test(host)||/(?:^|\.)(?:localhost|localdomain|local|internal|lan|home|corp)$/.test(host)||host==='home.arpa'||host.endsWith('.home.arpa')||
   !labels.every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)))throw invalidProviderUrl();
  return url.href;
 }catch{throw invalidProviderUrl();}
}
export function trackingProviderCode(value:unknown):string{
 if(value===undefined||value===null)return'';
 if(typeof value!=='string'||value.length>2000||unsafeProviderText.test(value))throw new TrackingError('Use a provider tracking code of 120 characters or fewer.','invalid');
 const code=value.trim();if([...code].length>TRACKING_PROVIDER_CODE_MAX_LENGTH)throw new TrackingError('Use a provider tracking code of 120 characters or fewer.','invalid');return code;
}
/** Browser/native-safe UTF-8 count without a Node or TextEncoder dependency. */
function utf8Bytes(value:string){let count=0;for(const character of value){const point=character.codePointAt(0)!;count+=point<=0x7f?1:point<=0x7ff?2:point<=0xffff?3:4;}return count;}
export function trackingLegs(v:unknown,existingOnly=false):TrackingLegInput[]{
 try{
  if(!Array.isArray(v)||v.length<1||v.length>12)throw new TransportPlanError('Add between 1 and 12 transport legs.','invalid_legs');
  const records=v.map(leg=>trackingRecord(leg,['id','providerName','origin','destination','method','trackingUrl','trackingCode']));
  const base=parseTransportPlanLegs(records.map(({id,providerName,origin,destination,method})=>({id,providerName,origin,destination,method})),existingOnly);
  const legs=base.map((leg,index)=>({...leg,trackingUrl:trackingProviderUrl(records[index].trackingUrl),trackingCode:trackingProviderCode(records[index].trackingCode)}));
  if(utf8Bytes(JSON.stringify(legs))>TRACKING_LEGS_MAX_BYTES)throw new TrackingError('Check the shipment details.','invalid');
  return legs;
 }catch(error){if(error instanceof TransportPlanError)throw new TrackingError(error.message==='Check the transport plan.'?'Check the shipment details.':error.message,'invalid');throw error;}
}
export function parseTrackingLegsJson(value:unknown):TrackingLegInput[]{
 if(typeof value!=='string'||utf8Bytes(value)>TRACKING_LEGS_MAX_BYTES)throw new TrackingError('Check the shipment details.','invalid');
 let parsed:unknown;try{parsed=JSON.parse(value);}catch{throw new TrackingError('Check the shipment details.','invalid');}return trackingLegs(parsed);
}
export function parseTrackingSubmit(v:unknown):TrackingSubmit{const r=trackingRecord(v,['recipientEmail','label','legs','idempotencyKey']);if(typeof r.idempotencyKey!=='string'||!/^[A-Za-z0-9_-]{16,100}$/.test(r.idempotencyKey))throw new TrackingError('Check the shipment details.','invalid');return{recipientEmail:trackingEmail(r.recipientEmail),label:trackingLabel(r.label),legs:trackingLegs(r.legs),idempotencyKey:r.idempotencyKey};}
export function parseTrackingRevoke(v:unknown):TrackingRevoke{const r=trackingRecord(v,['shipmentId','reference','expectedVersion']);if(!Number.isSafeInteger(r.shipmentId)||Number(r.shipmentId)<1||!isTrackingReference(r.reference))throw new TrackingError('Shipment was not found.','not_found');if(!Number.isSafeInteger(r.expectedVersion)||Number(r.expectedVersion)<1||Number(r.expectedVersion)>=2_147_483_647)throw new TrackingError('This shipment changed. Reload before saving.','conflict');return{shipmentId:Number(r.shipmentId),reference:r.reference,expectedVersion:Number(r.expectedVersion)};}
export function parseTrackingUpdate(v:unknown):TrackingUpdate{const r=trackingRecord(v,['shipmentId','reference','expectedVersion','label','legs']);return{...parseTrackingRevoke({shipmentId:r.shipmentId,reference:r.reference,expectedVersion:r.expectedVersion}),label:trackingLabel(r.label),legs:trackingLegs(r.legs)};}
export function parseTrackingShipment(v:unknown):TrackingShipment{const r=trackingRecord(v,['reference','label','version','legs']);if(!isTrackingReference(r.reference)||!Number.isSafeInteger(r.version)||Number(r.version)<1)throw new TrackingError('Shipment was not found.','not_found');return{reference:r.reference,label:trackingLabel(r.label),version:Number(r.version),legs:trackingLegs(r.legs,true).map(l=>({...l,id:l.id!}))};}
export function trackingEtag(shipment:Pick<TrackingShipment,'reference'|'version'>){return `"tracking-${shipment.reference}-${shipment.version}"`;}
