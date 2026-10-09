import {normalizeSearch} from './pagination';

export type SupportQueue = 'support'|'transport';
export type SupportViewState = {queue?:SupportQueue;status?:string;q?:string;page?:string};
const statuses=['active','waiting','open','closed','history','resolved'];

/** Navigation is a bounded origin hint, never an access grant or arbitrary URL. */
export function supportViewState(raw:Record<string,unknown>,options:{forcedQueue?:SupportQueue;fallbackQueue?:SupportQueue;fallbackStatus?:string}={}):SupportViewState{
  const queue=options.forcedQueue??(typeof raw.queue==='string'&&['support','transport'].includes(raw.queue)?raw.queue as SupportQueue:options.fallbackQueue);
  const status=typeof raw.status==='string'&&statuses.includes(raw.status)?raw.status:options.fallbackStatus;
  const q=typeof raw.q==='string'?normalizeSearch(raw.q):'';
  const page=typeof raw.page==='string'&&/^[1-9]\d{0,5}$/.test(raw.page)&&raw.page!=='1'?raw.page:undefined;
  return {...(queue?{queue}:{}),...(status&&statuses.includes(status)?{status}:{}),...(q?{q}:{}),...(page?{page}:{})};
}
function query(state:SupportViewState){const params=new URLSearchParams();for(const [key,value]of Object.entries(state))if(value)params.set(key,value);return params;}
export function supportInboxHref(state:SupportViewState){const params=query(supportViewState(state));return '/dashboard/support'+(params.size?'?'+params:'');}
export function supportThreadHref(id:number,state:SupportViewState={},notice:Partial<Record<'error'|'sent'|'claimed'|'closed'|'reopened'|'routed'|'assigned',string>>={}){
  if(!Number.isSafeInteger(id)||id<1)throw Error('Invalid conversation link.');
  const params=query(supportViewState(state));for(const [key,value]of Object.entries(notice))if(value)params.set(key,value.slice(0,500));
  return '/dashboard/support/'+id+(params.size?'?'+params:'');
}
export function supportFormState(form:Pick<FormData,'get'>,forcedQueue?:SupportQueue){return supportViewState({queue:form.get('nav_queue'),status:form.get('nav_status'),q:form.get('nav_q'),page:form.get('nav_page')},{forcedQueue});}

export function workloadViewState(raw:Record<string,unknown>){
  const {q,page}=supportViewState(raw);
  const status=typeof raw.status==='string'&&['available','full','enabled','disabled'].includes(raw.status)?raw.status:undefined;
  return {...(q?{q}:{}),...(page?{page}:{}),...(status?{status}:{})};
}
export function workloadHref(state:ReturnType<typeof workloadViewState>,saved=false){
  const params=new URLSearchParams(workloadViewState(state));if(saved)params.set('saved','agent');
  return '/dashboard/support/agents'+(params.size?'?'+params:'');
}

export function workspaceActiveHref(items:Array<{href:string;external?:boolean;activePaths?:string[]}>,pathname:string,search:Pick<URLSearchParams,'get'>,queueHint?:SupportQueue){
  const queue=(pathname==='/dashboard/support'||/^\/dashboard\/support\/\d+$/.test(pathname))?queueHint??search.get('queue')??'support':search.get('queue')??'support';
  const candidates=items.filter(item=>!item.external).map(item=>{
    const [path,raw='']=item.href.split('?'),expected=new URLSearchParams(raw);
    const paths=[path,...item.activePaths||[]];const matched=paths.filter(p=>pathname===p||pathname.startsWith(p+'/')).sort((a,b)=>b.length-a.length)[0];
    if(!matched)return null;
    if(path==='/dashboard'&&pathname===path&&expected.get('business')!==search.get('business'))return null;
    if(expected.has('queue')&&expected.get('queue')!==queue)return null;
    return {href:item.href,score:matched.length+(expected.has('queue')?1:0)};
  }).filter((item):item is {href:string;score:number}=>item!==null);
  return candidates.sort((a,b)=>b.score-a.score)[0]?.href;
}
