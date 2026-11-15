export type DemoCategoryCorrectionMember = {
 businessId:number; handle:string; ownerUserId:number; providerUserId:string;
 productIds:number[]; expectedHash:string; expectedContentVersion:number;
 expectedDraftVersion:number; expectedPageRevision:number;
 stage:number; cycle:number; dueAt:number; proposalVersion:number; proposalUpdatedAt:number;
};
export type DemoCategoryCorrection = {
 kind:'category_correction_batch'; operationKey:string;
 members:DemoCategoryCorrectionMember[];
};

const invalid=():never=>{throw Error('Invalid reviewed demo category correction.');};
function object(value:unknown,keys:readonly string[]):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))return invalid();
 return value as Record<string,unknown>;
}
function integer(value:unknown,min:number){if(!Number.isSafeInteger(value)||Number(value)<min)return invalid();return Number(value);}
function checkedText(value:unknown,pattern:RegExp){if(typeof value!=='string'||!pattern.test(value))return invalid();return value;}

/** One request binds the entire reviewed cohort; no business identity is built into runtime code. */
export function parseDemoCategoryCorrection(raw:unknown):DemoCategoryCorrection{
 const v=object(raw,['kind','operationKey','members']);
 if(v.kind!=='category_correction_batch'||!Array.isArray(v.members)||v.members.length!==6)return invalid();
 const members=v.members.map(rawMember=>{
  const m=object(rawMember,['businessId','handle','ownerUserId','providerUserId','productIds','expectedHash',
   'expectedContentVersion','expectedDraftVersion','expectedPageRevision','stage','cycle','dueAt','proposalVersion','proposalUpdatedAt']);
  if(!Array.isArray(m.productIds)||m.productIds.length!==4)return invalid();
  const productIds=m.productIds.map(id=>integer(id,1));
  if(productIds.some((id,index)=>index>0&&id<=productIds[index-1]))return invalid();
  const stage=integer(m.stage,-1);
  if(stage>5)return invalid();
  if(m.proposalVersion!==1)return invalid();
  return {businessId:integer(m.businessId,1),handle:checkedText(m.handle,/^[a-z0-9][a-z0-9-]{1,79}$/),
   ownerUserId:integer(m.ownerUserId,1),providerUserId:checkedText(m.providerUserId,/^[0-9a-f-]{32,64}$/i),
   productIds,expectedHash:checkedText(m.expectedHash,/^[0-9a-f]{64}$/),
   expectedContentVersion:integer(m.expectedContentVersion,1),expectedDraftVersion:integer(m.expectedDraftVersion,1),
   expectedPageRevision:integer(m.expectedPageRevision,1),stage,cycle:integer(m.cycle,0),
   dueAt:integer(m.dueAt,0),proposalVersion:1,
   proposalUpdatedAt:integer(m.proposalUpdatedAt,0)};
 });
 if(members.some((member,index)=>index>0&&member.businessId<=members[index-1].businessId))return invalid();
 return {kind:'category_correction_batch',operationKey:checkedText(v.operationKey,/^[a-zA-Z0-9_-]{12,64}$/),members};
}
