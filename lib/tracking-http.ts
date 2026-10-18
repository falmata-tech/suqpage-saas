import type {TrackingList as RecipientShipmentPage,TrackingRead as RecipientShipmentRead} from './tracking-contract';

export type TrackingHttpPorts={
 requestCode:(input:{email:unknown;locale?:unknown;ipKey:string})=>Promise<{challengeId:string;resendAfter:number}>;
 verifyCode:(input:{challengeId:unknown;code:unknown;ipKey:string})=>Promise<{token:string;expiresAt:number}>;
 session:(token:unknown)=>Promise<{expiresAt:number}>;
 list:(token:unknown,cursor?:unknown)=>Promise<RecipientShipmentPage>;
 read:(token:unknown,reference:unknown,etag?:unknown)=>Promise<RecipientShipmentRead>;
 logout:(token:unknown)=>Promise<unknown>;
 ipKey:(request:Request)=>string;
 allow?:(request:Request)=>Promise<boolean>;
 sameOrigin?:(request:Request)=>void;
 secureCookie?:boolean;
};
export const TRACKING_COOKIE='suqpage-tracking';
const cookiePath='/api/tracking';
const tokenPattern=/^[a-f0-9]{64}$/;
const privacy={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow, noarchive','Vary':'Cookie, Authorization'};

/** No account/chat credentials are accepted. Native and browser credentials never fall back. */
export function createTrackingHttpHandler(ports:TrackingHttpPorts,kind:'web'|'native'){
 return async(request:Request,path:readonly string[]):Promise<Response>=>{
  const head=request.method==='HEAD';
  const respond=(status:number,body?:unknown,extra:Record<string,string>={})=>new Response(head||body===undefined?null:JSON.stringify(body),{status,headers:{...privacy,...(body===undefined?{}:{'Content-Type':'application/json; charset=utf-8'}),...extra}});
  const failure=(status:number,code:string,error:string)=>respond(status,{code,error});
  const cookie=(value:string,maxAge:number)=>`${TRACKING_COOKIE}=${value}; Path=${cookiePath}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${ports.secureCookie||new URL(request.url).protocol==='https:'?'; Secure':''}`;
  try{
   const url=new URL(request.url),action=path.join('/');
   if(url.search.length>300||[...url.searchParams.keys()].some(key=>key!=='cursor'))return failure(400,'invalid_request','Check your tracking request.');
   if(ports.allow&&!await ports.allow(request))return failure(429,'rate_limited','Please wait a moment and try again.');
   const authorization=request.headers.get('authorization')||'';
   const raw=kind==='native'?(/^Bearer [a-f0-9]{64}$/.test(authorization)?authorization.slice(7):''):
    (request.headers.get('cookie')||'').split(';').map(part=>part.trim()).find(part=>part.startsWith(TRACKING_COOKIE+'='))?.slice(TRACKING_COOKIE.length+1)||'';
   const token=tokenPattern.test(raw)?raw:'';
   if(request.method==='POST'){
    if(kind==='web')ports.sameOrigin?.(request);
    if(action==='logout'){
     await ports.logout(token);return respond(200,{saved:true},kind==='web'?{'Set-Cookie':cookie('',0)}:{});
    }
    if(!['request-code','verify'].includes(action))return failure(405,'method_not_allowed','Method not allowed.');
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return failure(400,'invalid_request','Check your tracking request.');
    const reader=request.body?.getReader();let text='',size=0;
    if(reader){const decoder=new TextDecoder();try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>4096){await reader.cancel();return failure(413,'too_large','Check your tracking request.');}text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}}
    let body:Record<string,unknown>;try{const parsed:unknown=JSON.parse(text);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error();body=parsed as Record<string,unknown>;}catch{return failure(400,'invalid_request','Check your tracking request.');}
    const keys=action==='request-code'?['email','locale']:['challengeId','code'];
    if(Object.keys(body).some(key=>!keys.includes(key)))return failure(400,'invalid_request','Check your tracking request.');
    const ipKey=ports.ipKey(request);
    if(action==='request-code')return respond(200,await ports.requestCode({email:body.email,locale:body.locale,ipKey}));
    const result=await ports.verifyCode({challengeId:body.challengeId,code:body.code,ipKey});
    return kind==='native'?respond(200,result):respond(200,{expiresAt:result.expiresAt},{'Set-Cookie':cookie(result.token,Math.max(0,Math.floor((result.expiresAt-Date.now())/1000)))});
   }
   if(request.method!=='GET'&&!head)return failure(405,'method_not_allowed','Method not allowed.');
   if(action==='session')return respond(200,await ports.session(token));
   if(action==='shipments')return respond(200,await ports.list(token,url.searchParams.get('cursor')??undefined));
   if(path.length===2&&path[0]==='shipments'){
    const result=await ports.read(token,path[1],request.headers.get('if-none-match')??undefined);
    return result.kind==='not_modified'?respond(304,undefined,{ETag:result.etag}):respond(200,result.shipment,{ETag:result.etag});
   }
   return failure(404,'not_found','Shipment was not found.');
  }catch(error){
   // Application errors expose a bounded public code only; never SQL/provider details.
   const code=error&&typeof error==='object'&&'code'in error?String(error.code):'';
   const known:Record<string,[number,string]>={invalid_email:[400,'Enter a valid email address.'],invalid_request:[400,'Check your tracking request.'],invalid_code:[400,'That code is incorrect or has expired.'],rate_limited:[429,'Please wait a moment and try again.'],unauthenticated:[401,'Verify your email to open your shipments.'],not_found:[404,'Shipment was not found.'],forbidden:[403,'This tracking request is not allowed.']};
   if(code==='invalid'){const message=error instanceof Error&&['Enter a valid email address.','That code is incorrect or has expired.'].includes(error.message)?error.message:'Check your tracking request.';return failure(400,code,message);}
   const entry=known[code];if(entry){if(code==='rate_limited'){const retry=error&&typeof error==='object'&&'retryAfter'in error?Number(error.retryAfter):60;return respond(429,{code,error:entry[1]},{'Retry-After':String(Number.isSafeInteger(retry)?Math.max(1,Math.min(3600,retry)):60)});}return failure(entry[0],code,entry[1]);}
   if(error instanceof Error&&error.message==='Invalid request origin.')return failure(403,'forbidden','This tracking request is not allowed.');
   return failure(503,'unavailable','Unable to connect. Please try again.');
  }
 };
}
