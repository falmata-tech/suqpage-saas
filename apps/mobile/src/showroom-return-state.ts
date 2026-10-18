/** Public filter navigation only. No catalog, account or persistent storage. */
export type ShowroomBrowseState={businessId:number;query:string;categoryId:number|null};
export const SHOWROOM_RETURN_LIMIT=32;
export const SHOWROOM_RETURN_TTL=2*60*60_000;
export const emptyShowroomBrowseState=(businessId:number):ShowroomBrowseState=>({businessId,query:'',categoryId:null});
export function createShowroomReturnMemory(now:()=>number=Date.now){
 const entries=new Map<string,{savedAt:number;state:ShowroomBrowseState}>();
 function scope(api:string,id:number):string|null{
  if(!Number.isSafeInteger(id)||id<1)return null;
  try{const url=new URL(api);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.origin+':'+id:null;}catch{return null;}
 }
 function read(api:string,businessId:number):ShowroomBrowseState{
  const key=scope(api,businessId),entry=key?entries.get(key):undefined,time=now();
  if(!key||!entry)return emptyShowroomBrowseState(businessId);
  if(!Number.isFinite(time)||time<entry.savedAt||time-entry.savedAt>=SHOWROOM_RETURN_TTL){entries.delete(key);return emptyShowroomBrowseState(businessId);}
  entries.delete(key);entries.set(key,entry);
  return {...entry.state};
 }
 function remember(api:string,state:ShowroomBrowseState):void{
  const key=scope(api,state.businessId),time=now();
  if(!key||!Number.isFinite(time)||typeof state.query!=='string'||state.query.length>80||!(state.categoryId===null||Number.isSafeInteger(state.categoryId)&&state.categoryId>0))return;
  entries.delete(key);entries.set(key,{savedAt:time,state:{businessId:state.businessId,query:state.query,categoryId:state.categoryId}});
  while(entries.size>SHOWROOM_RETURN_LIMIT)entries.delete(entries.keys().next().value!);
 }
 return{read,remember};
}
export const showroomReturnMemory=createShowroomReturnMemory();
