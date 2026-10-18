import {isTransportPlanCapability,parseSavedTransportPlan,type TransportPlan} from './transport-plan-contract';

export type TransportPlanReadResult=
 |{kind:'plan';plan:TransportPlan;etag:string}
 |{kind:'not_modified';etag:string}
 |{kind:'missing'};
export type TransportPlanRead=(capability:string,etag:string|null,signal:AbortSignal)=>Promise<TransportPlanReadResult>;
export type TransportPlanLiveState={plan:TransportPlan|null;loading:boolean;missing:boolean;error:'Unable to connect. Please try again.'|null};
export type TransportPlanClock={after:(ms:number,work:()=>void)=>()=>void};
const clock:TransportPlanClock={after(ms,work){const timer=setTimeout(work,ms);return()=>clearTimeout(timer);}};
const empty=():TransportPlanLiveState=>({plan:null,loading:false,missing:false,error:null});

/** Read-only capability stays in its Authorization header, never in an HTTP URL. */
export function createTransportPlanReader(endpoint:string,options:{send?:typeof fetch}={}):TransportPlanRead{
 return async(capability,etag,signal)=>{
  if(!isTransportPlanCapability(capability))return{kind:'missing'};
  const response=await(options.send||fetch)(endpoint,{method:'GET',headers:{Authorization:`Bearer ${capability}`,...(etag?{'If-None-Match':etag}:{})},signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',redirect:'error'});
  if(response.status===404)return{kind:'missing'};
  const nextEtag=response.headers.get('etag')||etag;
  if(response.status===304){if(!nextEtag)throw Error('Invalid transport plan response');return{kind:'not_modified',etag:nextEtag};}
  if(!response.ok||!nextEtag||nextEtag.length>512)throw Error('Transport plan could not be refreshed');
  const value:unknown=await response.json();
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>key!=='version'&&key!=='legs'))throw Error('Invalid transport plan response');
  const body=value as Record<string,unknown>;
  return{kind:'plan',plan:parseSavedTransportPlan(body.version,body.legs),etag:nextEtag};
 };
}

function abortable<T>(work:Promise<T>,signal:AbortSignal):Promise<T>{
 return new Promise((resolve,reject)=>{
  const abort=()=>{cleanup();reject(Error('Transport plan request cancelled'));},cleanup=()=>signal.removeEventListener('abort',abort);
  if(signal.aborted){void work.catch(()=>{});abort();return;}
  signal.addEventListener('abort',abort,{once:true});
  void work.then(value=>{cleanup();resolve(value);},error=>{cleanup();reject(error);});
 });
}

/** One active public reader. React/navigation/AppState remain adapter concerns. */
export function createTransportPlanLive(options:{read:TransportPlanRead;onChange:(state:TransportPlanLiveState)=>void;clock?:TransportPlanClock}){
 const timing=options.clock||clock;
 let state=empty(),capability:string|null=null,etag:string|null=null,active=false,stopped=false,generation=0,failures=0;
 let running:AbortController|null=null,cancelPoll:(()=>void)|undefined;
 const publish=(next:TransportPlanLiveState)=>{if(state.plan===next.plan&&state.loading===next.loading&&state.missing===next.missing&&state.error===next.error)return;state=next;options.onChange(next);};
 const cancel=()=>{cancelPoll?.();cancelPoll=undefined;running?.abort();running=null;generation++;};
 const schedule=()=>{cancelPoll?.();if(active&&!stopped&&capability&&!state.missing)cancelPoll=timing.after(Math.min(30000,5000*2**Math.min(3,failures)),()=>{cancelPoll=undefined;void refresh();});};
 async function refresh():Promise<void>{
  if(stopped||!active||!capability||running||state.missing)return;
  cancelPoll?.();cancelPoll=undefined;
  const current=capability,version=generation,controller=new AbortController();running=controller;
  const currentRequest=()=>!stopped&&active&&generation===version&&capability===current;
  publish({...state,loading:state.plan===null,error:null});
  const cancelDeadline=timing.after(10000,()=>controller.abort());
  let result:TransportPlanReadResult;
  try{result=await abortable(options.read(current,etag,controller.signal),controller.signal);}
  catch{
   if(currentRequest()){failures++;publish({...state,loading:false,error:'Unable to connect. Please try again.'});schedule();}
   return;
  }finally{cancelDeadline();if(running===controller)running=null;}
  if(!currentRequest())return;
  if(result.kind==='missing'){etag=null;failures=0;publish({plan:null,loading:false,missing:true,error:null});return;}
  if(result.kind==='not_modified'){
   if(!state.plan){failures++;etag=null;publish({...state,loading:false,error:'Unable to connect. Please try again.'});schedule();return;}
   etag=result.etag;failures=0;publish({...state,loading:false,error:null});schedule();return;
  }
  if(state.plan&&result.plan.version<state.plan.version){publish({...state,loading:false});schedule();return;}
  if(state.plan&&result.plan.version===state.plan.version&&JSON.stringify(result.plan)!==JSON.stringify(state.plan)){failures++;publish({...state,loading:false,error:'Unable to connect. Please try again.'});schedule();return;}
  etag=result.etag;failures=0;
  publish({plan:state.plan?.version===result.plan.version?state.plan:result.plan,loading:false,missing:false,error:null});schedule();
 }
 return{
  setCapability(value:string){if(stopped||value===capability)return;cancel();capability=isTransportPlanCapability(value)?value:'';etag=null;failures=0;publish({...empty(),missing:!capability});if(active&&capability)void refresh();},
  setActive(value:boolean){if(stopped||value===active)return;active=value;if(!active){cancel();publish({...state,loading:false});}else void refresh();},
  refresh,
  snapshot:()=>state,
  stop(){if(stopped)return;stopped=true;active=false;cancel();},
 };
}
