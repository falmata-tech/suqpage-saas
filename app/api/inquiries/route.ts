import {assertSameOrigin,hashPrivateValue,requestIpFromHeaders} from "@/lib/security";
import {handlePublicInquiry,publicInquiryHttpPort} from "@/lib/inquiry-http";
import {scheduleAttentionDelivery} from "@/lib/attention-after";
export const runtime="nodejs";
export async function POST(request:Request){
 try{assertSameOrigin(request);}catch{return Response.json({error:"Request could not be accepted."},{status:403,headers:{"Cache-Control":"private, no-store"}});}
 const result=await handlePublicInquiry(request,hashPrivateValue(requestIpFromHeaders(request.headers)),publicInquiryHttpPort);
 if(result.status===201)try{scheduleAttentionDelivery();}catch{/* Attention is already durable. */}
 return result;
}
