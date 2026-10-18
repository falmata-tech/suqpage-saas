import {parseSavedTransportPlan,TransportPlanError,type SharedTransportPlan} from './transport-plan-contract';

export type TransportPlanHttpRead=(capability:unknown,ifNoneMatch?:unknown)=>Promise<SharedTransportPlan>;
export type TransportPlanHttpAllow=(request:Request)=>Promise<boolean>;
export type TransportPlanHttpPorts={read:TransportPlanHttpRead;allow?:TransportPlanHttpAllow};

const privateHeaders={
 'Cache-Control':'private, no-store',
 'Referrer-Policy':'no-referrer',
 'X-Robots-Tag':'noindex, nofollow, noarchive',
 'Vary':'Authorization',
};

/** Web-standard adapter; it knows no cookies, sessions, SQL or provider APIs. */
export function createTransportPlanHttpHandler({read,allow}:TransportPlanHttpPorts):(request:Request)=>Promise<Response>{
 return async request=>{
  const head=request.method==='HEAD';
  const respond=(status:number,body?:unknown,extra:Record<string,string>={})=>{
   const headers=new Headers({...privateHeaders,...extra});
   if(body!==undefined)headers.set('Content-Type','application/json; charset=utf-8');
   return new Response(head||body===undefined?null:JSON.stringify(body),{status,headers});
  };
  const missing=()=>respond(404,{error:'Transport plan was not found.',code:'not_found'});
  if(request.method!=='GET'&&!head)return respond(405,{error:'Method not allowed.',code:'method_not_allowed'},{Allow:'GET, HEAD'});
  try{
   // Rate by private caller identity, independently of whether a capability is valid.
   if(allow&&!await allow(request))return respond(429,{error:'Please try again shortly.',code:'rate_limited'},{'Retry-After':'60'});
   const url=new URL(request.url),authorization=request.headers.get('authorization')||'';
   if(url.search||url.hash||!/^Bearer [a-f0-9]{64}$/.test(authorization))return missing();
   const result=await read(authorization.slice(7),request.headers.get('if-none-match')||undefined);
   if(result.kind==='not_modified')return respond(304,undefined,{ETag:result.etag});
   // Reconstruct the public allowlist even if an internal adapter adds metadata.
   const plan=parseSavedTransportPlan(result.plan.version,result.plan.legs);
   return respond(200,plan,{ETag:result.etag});
  }catch(error){
   if(error instanceof TransportPlanError){
    if(error.code==='not_found')return missing();
    return respond(error.status,{error:error.message,code:error.code});
   }
   return respond(503,{error:'Unable to connect. Please try again.',code:'unavailable'});
  }
 };
}
