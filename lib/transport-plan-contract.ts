import type {TransportMethod,TransportPlan,TransportPlanLeg} from '@africmade/contracts';
export type {TransportMethod,TransportPlan,TransportPlanLeg} from '@africmade/contracts';

export const TRANSPORT_METHODS:readonly TransportMethod[]=['air','truck','van','car','motorcycle'];
export const TRANSPORT_PLAN_MAX_LEGS=12;
export type TransportPlanLegInput=Omit<TransportPlanLeg,'id'>&{id:string|null};
export type TransportPlanSaveInput={conversationId:number;publicRef:string;expectedVersion:number;legs:TransportPlanLegInput[]};
export type TransportPlanLinkInput=Omit<TransportPlanSaveInput,'legs'>;
export type StaffTransportPlan={plan:TransportPlan|null;sharePath:string|null};
export type SavedTransportPlan={plan:TransportPlan;sharePath:string};
export type SharedTransportPlan={kind:'not_modified';etag:string}|{kind:'plan';etag:string;plan:TransportPlan};
export class TransportPlanError extends Error{
 constructor(message:string,readonly code:'invalid_request'|'invalid_legs'|'invalid_text'|'field_too_long'|'invalid_method'|'conflict'|'not_found'|'forbidden'){
  super(message);this.name='TransportPlanError';
 }
 get status(){return this.code==='forbidden'?403:this.code==='not_found'?404:this.code==='conflict'?409:400;}
}

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function record(value:unknown,keys:readonly string[]):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!keys.includes(key)))throw new TransportPlanError('Check the transport plan.','invalid_request');
 return value as Record<string,unknown>;
}
function text(value:unknown):string{
 if(typeof value!=='string'||/[\u0000-\u001f\u007f-\u009f]/u.test(value))throw new TransportPlanError('Enter a provider name, origin and destination for every leg.','invalid_text');
 if(value.length>2000)throw new TransportPlanError('Use 120 characters or fewer for each transport field.','field_too_long');
 const normalized=value.replace(/\s+/gu,' ').trim();
 if(!normalized)throw new TransportPlanError('Enter a provider name, origin and destination for every leg.','invalid_text');
 if([...normalized].length>120)throw new TransportPlanError('Use 120 characters or fewer for each transport field.','field_too_long');
 return normalized;
}
export function parseTransportPlanLegs(value:unknown,existingOnly=false):TransportPlanLegInput[]{
 if(!Array.isArray(value)||value.length<1||value.length>TRANSPORT_PLAN_MAX_LEGS)throw new TransportPlanError('Add between 1 and 12 transport legs.','invalid_legs');
 const ids=new Set<string>();
 return value.map(raw=>{
  const leg=record(raw,['id','providerName','origin','destination','method']);
  if(leg.id!==null&&(typeof leg.id!=='string'||!uuid.test(leg.id)))throw new TransportPlanError('Check the transport plan.','invalid_request');
  if(existingOnly&&leg.id===null)throw new TransportPlanError('Check the transport plan.','invalid_request');
  const id=typeof leg.id==='string'?leg.id.toLowerCase():null;
  if(id&&ids.has(id))throw new TransportPlanError('Check the transport plan.','invalid_request');if(id)ids.add(id);
  if(typeof leg.method!=='string'||!TRANSPORT_METHODS.includes(leg.method as TransportMethod))throw new TransportPlanError('Choose a valid transport method.','invalid_method');
  return{id,providerName:text(leg.providerName),origin:text(leg.origin),destination:text(leg.destination),method:leg.method as TransportMethod};
 });
}
function identity(value:Record<string,unknown>):TransportPlanLinkInput{
 if(!Number.isSafeInteger(value.conversationId)||Number(value.conversationId)<1||typeof value.publicRef!=='string'||!/^SUP-[A-Za-z0-9-]{1,80}$/.test(value.publicRef))throw new TransportPlanError('Transport plan was not found.','not_found');
 if(!Number.isSafeInteger(value.expectedVersion)||Number(value.expectedVersion)<0||Number(value.expectedVersion)>=2_147_483_647)throw new TransportPlanError('This transport plan changed. Reload before saving.','conflict');
 return{conversationId:Number(value.conversationId),publicRef:value.publicRef,expectedVersion:Number(value.expectedVersion)};
}
export function parseTransportPlanSave(value:unknown):TransportPlanSaveInput{
 const raw=record(value,['conversationId','publicRef','expectedVersion','legs']);return{...identity(raw),legs:parseTransportPlanLegs(raw.legs)};
}
export function parseTransportPlanLink(value:unknown):TransportPlanLinkInput{return identity(record(value,['conversationId','publicRef','expectedVersion']));}
export function parseSavedTransportPlan(version:unknown,legs:unknown):TransportPlan{
 if(!Number.isSafeInteger(version)||Number(version)<1)throw new TransportPlanError('Transport plan was not found.','not_found');
 const parsed=parseTransportPlanLegs(legs,true);
 return{version:Number(version),legs:parsed.map(leg=>({...leg,id:leg.id!}))};
}
export function isTransportPlanCapability(value:unknown):value is string{return typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);}
export function transportPlanEtag(version:number){return `"transport-plan-${version}"`;}
export function transportPlanEtagMatches(value:unknown,etag:string):boolean{
 return typeof value==='string'&&value.length<=512&&value.split(',').some(part=>{const candidate=part.trim();return candidate==='*'||candidate===etag||candidate===`W/${etag}`;});
}
