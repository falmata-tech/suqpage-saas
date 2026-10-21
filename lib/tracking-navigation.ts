/** A return hint is presentation only and never grants account/chat authority. */
export function trackingReturnHref(value:unknown){
 return typeof value==='string'&&/^\/dashboard\/transport(?:\?(?:conversation=[1-9]\d{0,15}|new=1))?$/.test(value)?value:'/?chat=transport';
}
const drafts=new Map<string,{value:unknown;until:number}>();
/** Browser-memory-only, bounded, short-lived draft handoff. Never URL or storage. */
export function rememberTransportDraft<T>(key:string,value:T,now=Date.now()){
 for(const [id,row]of drafts)if(row.until<=now)drafts.delete(id);
 drafts.delete(key);drafts.set(key,{value,until:now+10*60_000});
 while(drafts.size>16)drafts.delete(drafts.keys().next().value!);
}
export function takeTransportDraft<T>(key:string,now=Date.now()):T|undefined{
 const row=drafts.get(key);if(row&&row.until<=now)drafts.delete(key);return row&&row.until>now?row.value as T:undefined;
}

export function clearTransportDraft(key:string){drafts.delete(key);}
