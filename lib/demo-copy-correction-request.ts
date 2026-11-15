export type DemoCopyCorrection={
 kind:'copy_correction';direction:'apply'|'rollback';operationKey:string;
 businessId:number;handle:string;cohort:'enrolled'|'legacy';
 expectedContentVersion:number;expectedDraftVersion:number;expectedPageRevision:number;
 expectedHash?:string;expectedStage?:number;expectedCycle?:number;expectedDueAt?:number;
};
const targetIds=new Set(Array.from({length:66},(_,i)=>i+1).filter(id=>id!==10&&id!==41));
export function parseDemoCopyCorrection(raw:unknown):DemoCopyCorrection{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid demo copy request.');
 const v=raw as Record<string,unknown>;
 const keys=['kind','direction','operationKey','businessId','handle','cohort',
  'expectedContentVersion','expectedDraftVersion','expectedPageRevision',
  'expectedHash','expectedStage','expectedCycle','expectedDueAt'];
 if(Object.keys(v).some(key=>!keys.includes(key))||v.kind!=='copy_correction'||
  !['apply','rollback'].includes(String(v.direction))||
  typeof v.operationKey!=='string'||!/^s200_[a-z0-9_]{4,72}$/.test(v.operationKey)||
  !Number.isSafeInteger(v.businessId)||!targetIds.has(Number(v.businessId))||
  typeof v.handle!=='string'||!/^[a-z0-9][a-z0-9-]{1,79}$/.test(v.handle)||
  !['enrolled','legacy'].includes(String(v.cohort))||
  ![v.expectedContentVersion,v.expectedDraftVersion,v.expectedPageRevision]
   .every(x=>Number.isSafeInteger(x)&&Number(x)>0))throw Error('Invalid reviewed demo copy target.');
 const legacy=v.businessId===50||v.businessId===62;
 if(legacy!==(v.cohort==='legacy'))throw Error('Invalid demo copy cohort.');
 if(legacy){
  if(v.handle!==(v.businessId===50?'demo-dara-clay-works':'demo-wabi-bottled-water')||
   ['expectedHash','expectedStage','expectedCycle','expectedDueAt'].some(key=>Object.hasOwn(v,key)))
   throw Error('Invalid ownerless demo copy request.');
 }else if(typeof v.expectedHash!=='string'||!/^[0-9a-f]{64}$/.test(v.expectedHash)||
  ![v.expectedStage,v.expectedCycle,v.expectedDueAt].every(x=>Number.isSafeInteger(x)&&Number(x)>=0))
  throw Error('Invalid enrolled demo copy request.');
 return v as DemoCopyCorrection;
}
