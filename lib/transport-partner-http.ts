import {PartnerInterestError,submitPartnerInterest} from './transport-partner-interest';
export interface PartnerInterestHttpPort {submit(raw:unknown,ipKey:string):Promise<{reference:string}>}
export const partnerInterestHttpPort:PartnerInterestHttpPort={submit:submitPartnerInterest};
const json=(body:unknown,status:number,extra:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...extra}});
export async function handlePartnerInterest(request:Request,ipKey:string,port:PartnerInterestHttpPort=partnerInterestHttpPort):Promise<Response>{
 if(request.method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
 if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json({error:'Send JSON.'},415);
 const max=24*1024,declared=request.headers.get('content-length');
 if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>max))return json({error:'Request is too large.'},413);
 const reader=request.body?.getReader(),chunks:Uint8Array[]=[];let bytes=0;
 try{
  if(reader)try{for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>max){await reader.cancel();return json({error:'Request is too large.'},413);}chunks.push(part.value);}}finally{reader.releaseLock();}
  let raw:unknown;try{raw=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return json({error:'Check the information you entered.'},400);}
  const receipt=await port.submit(raw,ipKey);
  if(!/^PI-[A-F0-9]{12}$/.test(receipt.reference))throw Error('Invalid durable reference');
  return json({reference:receipt.reference,status:'received'},202);
 }catch(error){
  if(error instanceof PartnerInterestError)return json({error:error.message,code:error.code},error.code==='invalid'?400:error.code==='conflict'?409:error.code==='rate_limited'?429:503,error.retryAfterSeconds?{'Retry-After':String(error.retryAfterSeconds)}:{});
  return json({error:'We could not receive your request. Please try again later.'},503);
 }
}
