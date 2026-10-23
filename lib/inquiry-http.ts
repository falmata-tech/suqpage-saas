import {InquiryError,type InquiryInput} from "./inquiries";

export type InquiryReceipt={inquiryId:number|null;duplicate:boolean;trapped:boolean};
export interface PublicInquiryHttpPort{
 limit(ipHash:string):Promise<{allowed:boolean;retryAfterSeconds:number}>;
 create(input:InquiryInput,ipHash:string):Promise<InquiryReceipt>;
}
function response(value:unknown,status:number,extra:Record<string,string>={}){return Response.json(value,{status,headers:{"Cache-Control":"private, no-store",...extra}});}
export async function handlePublicInquiry(request:Request,ipHash:string,port:PublicInquiryHttpPort):Promise<Response>{
 try{
  const rate=await port.limit(ipHash);if(!rate.allowed)return response({code:"rate_limited",error:"Too many inquiries. Please try again later."},429,{"Retry-After":String(rate.retryAfterSeconds)});
  if(request.headers.get("content-type")?.split(";")[0].trim()!=="application/json")return response({code:"invalid",error:"Send JSON."},415);
  const max=128*1024,declared=request.headers.get("content-length");
  if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>max))throw new InquiryError("Request is too large.",413);
  const reader=request.body?.getReader(),chunks:Uint8Array[]=[];let size=0;
  if(reader)try{for(;;){const p=await reader.read();if(p.done)break;size+=p.value.byteLength;if(size>max){await reader.cancel();throw new InquiryError("Request is too large.",413);}chunks.push(p.value);}}finally{reader.releaseLock();}
  let input:unknown;try{input=JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw new InquiryError("Check the inquiry.");}
  if(!input||typeof input!=="object"||Array.isArray(input))throw new InquiryError("Check the inquiry.");
  const receipt=await port.create(input as InquiryInput,ipHash);
  if(receipt.trapped)return response({accepted:true},202);
  if(!Number.isSafeInteger(receipt.inquiryId)||!receipt.inquiryId)throw new Error("Missing durable inquiry receipt.");
  return response({inquiryId:receipt.inquiryId,duplicate:receipt.duplicate,status:"received"},receipt.duplicate?200:201);
 }catch(error){
  if(error instanceof InquiryError)return response({code:error.status===409?"idempotency_conflict":"invalid",error:error.message},error.status,error.retryAfter?{"Retry-After":String(error.retryAfter)}:{});
  return response({code:"unavailable",error:"Your inquiry could not be sent. Please try again."},503);
 }
}
export const publicInquiryHttpPort:PublicInquiryHttpPort={
 async limit(ipHash){const [{postgresRuntimeServices},{consumePostgresRateLimit}]=await Promise.all([import("./postgres-runtime-services"),import("./rate-limit-postgres")]);return consumePostgresRateLimit(postgresRuntimeServices().runner,`inquiry-global:${ipHash}`,30,10*60*1000);},
 async create(input,ipHash){const{createPublicInquiry}=await import("./inquiries");return createPublicInquiry(input,ipHash);},
};
