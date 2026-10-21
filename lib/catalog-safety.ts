/** Pure public catalog preferences and report inputs. Not tenant authority. */
export const REPORT_REASONS = ['Misleading listing', 'Prohibited goods', 'Abusive content', 'Other'] as const;
export type ReportReason = typeof REPORT_REASONS[number];
export type BlockedBusiness = {id:number;handle:string;name:string};
export const MAX_BLOCKED_BUSINESSES=100;
export class CatalogSafetyError extends Error {
  readonly code='catalog_safety';
  constructor(message:string,readonly status=400){super(message);}
}
export function excludedBusinessIds(value:unknown):number[]{
  const values=typeof value==='string'?(value?value.split(','):[]):value??[];
  if(!Array.isArray(values)||values.length>MAX_BLOCKED_BUSINESSES)throw new CatalogSafetyError('Use up to 100 blocked businesses.');
  const ids=values.map(v=>{
    if(typeof v!=='number'&&!(typeof v==='string'&&/^[1-9]\d{0,15}$/.test(v)))throw new CatalogSafetyError('Invalid blocked business.');
    const id=Number(v);if(!Number.isSafeInteger(id)||id<1)throw new CatalogSafetyError('Invalid blocked business.');return id;
  });
  return [...new Set(ids)].sort((a,b)=>a-b);
}
export function blockedBusinesses(value:unknown):BlockedBusiness[]{
  if(!Array.isArray(value)||value.length>MAX_BLOCKED_BUSINESSES)throw new CatalogSafetyError('Use up to 100 blocked businesses.');
  const unique=new Map<number,BlockedBusiness>();
  for(const item of value){
    if(!item||typeof item!=='object')throw new CatalogSafetyError('Invalid blocked business.');
    const v=item as Record<string,unknown>,id=excludedBusinessIds([v.id])[0];
    if(typeof v.handle!=='string'||!/^@?[a-z0-9-]{3,80}$/.test(v.handle)||typeof v.name!=='string'||!v.name.trim()||v.name.length>150)throw new CatalogSafetyError('Invalid blocked business.');
    unique.set(id,{id,handle:v.handle.replace(/^@/,''),name:v.name.trim()});
  }
  return [...unique.values()];
}
export type ListingReportCommand={businessId:number;productId:number|null;reason:ReportReason;details:string;idempotencyKey:string};
export function listingReportCommand(value:unknown):ListingReportCommand{
  if(!value||typeof value!=='object'||Array.isArray(value))throw new CatalogSafetyError('Check the report details.');
  const v=value as Record<string,unknown>;
  if(Object.keys(v).some(k=>!['businessId','productId','reason','details','idempotencyKey'].includes(k)))throw new CatalogSafetyError('Check the report details.');
  const businessId=excludedBusinessIds([v.businessId])[0];
  const productId=v.productId===undefined||v.productId===null?null:excludedBusinessIds([v.productId])[0];
  if(!REPORT_REASONS.includes(v.reason as ReportReason))throw new CatalogSafetyError('Choose a report reason.');
  if(v.details!==undefined&&typeof v.details!=='string')throw new CatalogSafetyError('Check the report details.');
  const details=String(v.details??'').trim();
  if(details.length>1500||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(details))throw new CatalogSafetyError('Use up to 1500 characters.');
  if(typeof v.idempotencyKey!=='string'||! /^[a-zA-Z0-9_-]{16,100}$/.test(v.idempotencyKey))throw new CatalogSafetyError('Refresh and try again.');
  return {businessId,productId,reason:v.reason as ReportReason,details,idempotencyKey:v.idempotencyKey};
}
