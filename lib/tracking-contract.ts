import {parseTransportPlanLegs,TransportPlanError,type TransportPlanLeg,type TransportPlanLegInput} from './transport-plan-contract';
export type {TransportPlanLeg,TransportPlanLegInput};
export type TrackingLocale='en'|'am'|'om';
export type TrackingShipment={reference:string;label:string;version:number;legs:TransportPlanLeg[]};
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
export type TrackingSubmit={recipientEmail:string;label:string;legs:TransportPlanLegInput[];idempotencyKey:string};
export type TrackingUpdate={shipmentId:number;reference:string;expectedVersion:number;label:string;legs:TransportPlanLegInput[]};
export type TrackingRevoke=Pick<TrackingUpdate,'shipmentId'|'reference'|'expectedVersion'>;
export const TRACKING_CODE_MS=10*60_000,TRACKING_SESSION_MS=7*24*60*60_000,TRACKING_RESEND_SECONDS=60,TRACKING_LIST_LIMIT=24;
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
export function trackingLegs(v:unknown,existingOnly=false){try{return parseTransportPlanLegs(v,existingOnly);}catch(error){if(error instanceof TransportPlanError)throw new TrackingError(error.message,'invalid');throw error;}}
export function parseTrackingSubmit(v:unknown):TrackingSubmit{const r=trackingRecord(v,['recipientEmail','label','legs','idempotencyKey']);if(typeof r.idempotencyKey!=='string'||!/^[A-Za-z0-9_-]{16,100}$/.test(r.idempotencyKey))throw new TrackingError('Check the shipment details.','invalid');return{recipientEmail:trackingEmail(r.recipientEmail),label:trackingLabel(r.label),legs:trackingLegs(r.legs),idempotencyKey:r.idempotencyKey};}
export function parseTrackingRevoke(v:unknown):TrackingRevoke{const r=trackingRecord(v,['shipmentId','reference','expectedVersion']);if(!Number.isSafeInteger(r.shipmentId)||Number(r.shipmentId)<1||!isTrackingReference(r.reference))throw new TrackingError('Shipment was not found.','not_found');if(!Number.isSafeInteger(r.expectedVersion)||Number(r.expectedVersion)<1||Number(r.expectedVersion)>=2_147_483_647)throw new TrackingError('This shipment changed. Reload before saving.','conflict');return{shipmentId:Number(r.shipmentId),reference:r.reference,expectedVersion:Number(r.expectedVersion)};}
export function parseTrackingUpdate(v:unknown):TrackingUpdate{const r=trackingRecord(v,['shipmentId','reference','expectedVersion','label','legs']);return{...parseTrackingRevoke({shipmentId:r.shipmentId,reference:r.reference,expectedVersion:r.expectedVersion}),label:trackingLabel(r.label),legs:trackingLegs(r.legs)};}
export function parseTrackingShipment(v:unknown):TrackingShipment{const r=trackingRecord(v,['reference','label','version','legs']);if(!isTrackingReference(r.reference)||!Number.isSafeInteger(r.version)||Number(r.version)<1)throw new TrackingError('Shipment was not found.','not_found');return{reference:r.reference,label:trackingLabel(r.label),version:Number(r.version),legs:trackingLegs(r.legs,true).map(l=>({...l,id:l.id!}))};}
export function trackingEtag(shipment:Pick<TrackingShipment,'reference'|'version'>){return `"tracking-${shipment.reference}-${shipment.version}"`;}
