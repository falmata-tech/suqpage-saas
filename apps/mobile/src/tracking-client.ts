import {boundedAuthFetch,type AuthFetchPort} from './auth-fetch';
import {isTrackingReference,isTrackingToken,parseTrackingShipment,type TrackingSession,type TrackingChallenge,type TrackingShipmentSummary,type TrackingShipmentDetail,type TrackingShipmentList} from '../../../lib/tracking-contract';
export type {TrackingSession,TrackingChallenge,TrackingShipmentSummary,TrackingShipmentDetail,TrackingShipmentList};

// Tracking credentials are deliberately unrelated to account Auth and chat sessions.
export type TrackingStorage={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>;removeItem:(key:string)=>Promise<void>};
export const trackingReference=(value:unknown):string=>isTrackingReference(value)?value:'';
const validSession=(value:unknown):value is TrackingSession=>{
 const candidate=value as Partial<TrackingSession>|null;
 return Boolean(candidate&&isTrackingToken(candidate.token)&&typeof candidate.expiresAt==='number'&&Number.isFinite(candidate.expiresAt));
};
export function createTrackingStore(storage:TrackingStorage,origin:string){
 // Canonical URL origins are ASCII; lossless hex preserves scheme, host and port.
 const encodedOrigin=Array.from(new URL(origin).origin,character=>character.charCodeAt(0).toString(16).padStart(2,'0')).join('');
 const key='suqpage-tracking-session.'+encodedOrigin;
 let pending:Promise<void>=Promise.resolve();
 const write=(operation:()=>Promise<void>)=>{const result=pending.then(operation);pending=result.catch(()=>{});return result;};
 async function read():Promise<TrackingSession|null>{
  while(true){const observed=pending;await observed;const raw=await storage.getItem(key);if(observed!==pending)continue;if(!raw)return null;let value:unknown;try{value=JSON.parse(raw);}catch{/* Corrupt local tracking state is never authority. */}
   if(!validSession(value)||value.expiresAt<=Date.now()){await write(()=>storage.removeItem(key));return null;}return value;}
 }
 return{
  read,
  async save(value:TrackingSession){if(!validSession(value)||value.expiresAt<=Date.now())throw new Error('Please try again.');await write(()=>storage.setItem(key,JSON.stringify(value)));},
  clear:()=>write(()=>storage.removeItem(key)),
 };
}
export class TrackingFailure extends Error{constructor(message:string,readonly status:number){super(message);}}
type HttpOptions={token?:string;body?:unknown;signal?:AbortSignal;etag?:string};
export function createTrackingClient(origin:string,send:AuthFetchPort=fetch){
 const bounded=boundedAuthFetch(send,10_000);
 return async<T>(path:string,options:HttpOptions={}):Promise<{value:T|null;etag:string|null;notModified:boolean}>=>{
  if(!/^(?:request-code|verify|session|logout|shipments(?:\?cursor=[0-9]{1,20}|\/SHP-[A-F0-9]{20})?)$/.test(path))throw new TrackingFailure('Please try again.',0);
  const publicPath=path==='request-code'||path==='verify';
  if(!publicPath&&!isTrackingToken(options.token))throw new TrackingFailure('Verify your email to continue.',401);
  const headers:Record<string,string>={Accept:'application/json'};
  if(!publicPath)headers.Authorization='Bearer '+options.token;
  if(options.etag)headers['If-None-Match']=options.etag;
  if(options.body!==undefined)headers['Content-Type']='application/json';
  try{
   const response=await bounded(`${origin}/api/mobile/v1/tracking/${path}`,{method:options.body===undefined?'GET':'POST',headers,body:options.body===undefined?undefined:JSON.stringify(options.body),signal:options.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',redirect:'error'});
   if(response.status===304)return{value:null,etag:response.headers.get('etag'),notModified:true};
   const value=await response.json();
   if(!response.ok)throw new TrackingFailure(typeof value?.error==='string'?value.error:'Please try again.',response.status);
   return{value:value as T,etag:response.headers.get('etag'),notModified:false};
  }catch(error){if(error instanceof TrackingFailure)throw error;throw new TrackingFailure('Unable to connect. Please try again.',0);}
 };
}

export type TrackingDetailState={shipment:TrackingShipmentDetail|null;loading:boolean;error:string;missing:boolean;unauthenticated:boolean};
type Clock={setTimeout:(callback:()=>void,delay:number)=>ReturnType<typeof setTimeout>;clearTimeout:(id:ReturnType<typeof setTimeout>)=>void};
type DetailRead=(token:string,reference:string,etag:string|null,signal:AbortSignal)=>Promise<{value:TrackingShipmentDetail|null;etag:string|null;notModified:boolean}>;
/** One active recipient/detail read; no message/read-receipt or account side effects. */
export function createTrackingDetailLive(options:{read:DetailRead;onChange:(state:TrackingDetailState)=>void;clock?:Clock}){
 const clock:Clock=options.clock||{setTimeout:(work,delay)=>setTimeout(work,delay),clearTimeout:id=>clearTimeout(id)};let state:TrackingDetailState={shipment:null,loading:false,error:'',missing:false,unauthenticated:false};
 let token='',reference='',etag:string|null=null,active=false,stopped=false,generation=0,failures=0,controller:AbortController|null=null,timer:ReturnType<typeof setTimeout>|undefined;
 const publish=()=>options.onChange({...state});
 function cancel(){generation++;if(timer!==undefined)clock.clearTimeout(timer);timer=undefined;controller?.abort();controller=null;}
 function schedule(delay:number){if(active&&!stopped&&!state.missing&&!state.unauthenticated)timer=clock.setTimeout(()=>{timer=undefined;void refresh();},delay);}
 async function refresh(){
  if(stopped||!active||!token||!reference||controller||state.missing||state.unauthenticated)return;
  if(timer!==undefined)clock.clearTimeout(timer);timer=undefined;
  const current=generation,request=new AbortController();controller=request;state={...state,loading:!state.shipment,error:''};publish();
  try{const response=await options.read(token,reference,etag,request.signal);if(stopped||generation!==current||request.signal.aborted)return;
   if(response.notModified){if(!state.shipment)throw new Error('No cached shipment');}
   else{const shipment=parseTrackingShipment(response.value);if(shipment.reference!==reference)throw new Error('Invalid shipment');
    if(!state.shipment||shipment.version>state.shipment.version)state={...state,shipment};
    else if(shipment.version===state.shipment.version&&JSON.stringify(shipment)!==JSON.stringify(state.shipment))throw new Error('Conflicting shipment revision');}
   etag=response.etag||etag;failures=0;state={...state,loading:false,error:''};publish();
  }catch(error){if(stopped||generation!==current||request.signal.aborted)return;failures++;
   const status=error instanceof TrackingFailure?error.status:0;
   state={...state,loading:false,error:status===401||status===404?'':'Unable to connect. Please try again.',shipment:status===401||status===404?null:state.shipment,missing:status===404,unauthenticated:status===401};publish();
  }finally{if(generation===current&&controller===request){controller=null;schedule(failures?Math.min(30_000,failures*10_000):5000);}}
 }
 return{setScope(nextToken:string,nextReference:string){cancel();token=nextToken;reference=trackingReference(nextReference);etag=null;failures=0;state={shipment:null,loading:false,error:'',missing:false,unauthenticated:false};publish();void refresh();},setActive(next:boolean){if(stopped||active===next)return;active=next;if(!next){cancel();if(state.loading){state={...state,loading:false};publish();}}else void refresh();},refresh,stop(){stopped=true;active=false;cancel();}};
}
