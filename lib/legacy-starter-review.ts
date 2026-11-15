import {createHash} from 'node:crypto';

export const LEGACY_STARTER_LABEL_CORRECTION_ACTION = 'owner.legacy_starter_labels_removed';

type FieldProduct = {id:number;name:string;description:string};
type ProductHashes = {id:number;nameSha256:string;descriptionSha256:string};
type Receipt = {version:1;aboutSha256:string;products:ProductHashes[]};
export type LegacyStarterReviewHold = {about:boolean;productIds:number[]};

const SHA256 = /^[0-9a-f]{64}$/;
const hash = (value:string) => createHash('sha256').update(value,'utf8').digest('hex');

// The exact private correction writes this receipt in the same transaction as
// its text changes. No owner text or template content is retained in the audit.
export function legacyStarterReviewReceipt(about:string,products:readonly FieldProduct[]):string {
  if(typeof about!=='string'||!about.trim()||products.length<1||products.length>64||
    products.some(p=>!Number.isSafeInteger(p.id)||p.id<1||typeof p.name!=='string'||typeof p.description!=='string')||
    new Set(products.map(p=>p.id)).size!==products.length)throw new Error('Invalid legacy starter review fields.');
  const receipt:Receipt={version:1,aboutSha256:hash(about),products:products.map(p=>({
    id:p.id,nameSha256:hash(p.name),descriptionSha256:hash(p.description),
  })).sort((a,b)=>a.id-b.id)};
  return JSON.stringify(receipt);
}

// A malformed receipt holds all current fields; it can never make a private
// starter ready. Only listed products are considered by publicationReadiness.
export function legacyStarterReviewHold(detail:string,about:string,products:readonly FieldProduct[]):LegacyStarterReviewHold {
  let receipt:unknown;
  try{receipt=JSON.parse(detail);}catch{return {about:true,productIds:products.map(p=>p.id)};}
  if(!receipt||typeof receipt!=='object'||Array.isArray(receipt))return {about:true,productIds:products.map(p=>p.id)};
  const value=receipt as Partial<Receipt>;
  if(value.version!==1||typeof value.aboutSha256!=='string'||!SHA256.test(value.aboutSha256)||
    !Array.isArray(value.products)||value.products.length<1||value.products.length>64||
    value.products.some(p=>!p||!Number.isSafeInteger(p.id)||p.id<1||typeof p.nameSha256!=='string'||!SHA256.test(p.nameSha256)||
      typeof p.descriptionSha256!=='string'||!SHA256.test(p.descriptionSha256))||
    new Set(value.products.map(p=>p.id)).size!==value.products.length)
    return {about:true,productIds:products.map(p=>p.id)};
  const byId=new Map(value.products.map(p=>[p.id,p]));
  return {about:hash(about)===value.aboutSha256,productIds:products.filter(p=>{
    const before=byId.get(p.id);
    return before&&(hash(p.name)===before.nameSha256||hash(p.description)===before.descriptionSha256);
  }).map(p=>p.id)};
}
