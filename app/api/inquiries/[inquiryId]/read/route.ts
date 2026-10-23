import {apiUser} from "@/lib/auth";
import {assertSameOrigin} from "@/lib/security";
import {markInquiryRead} from "@/lib/inquiry-status-runtime";
import {InquiryError} from "@/lib/inquiries";
import {boundedBody} from "@/lib/mobile/http";
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{"Cache-Control":"private, no-store"}});
export async function POST(request:Request,{params}:{params:Promise<{inquiryId:string}>}){
 try{
  try{assertSameOrigin(request);}catch{return json({error:"Request could not be accepted."},403);}
  const actor=await apiUser();if(!actor)return json({error:"Sign in to continue."},401);
  if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return json({error:"Send JSON."},415);
  let body:unknown;try{body=JSON.parse((await boundedBody(request,1024)).toString());}catch{return json({error:"Invalid request."},400);}
  if(!body||typeof body!=="object"||Array.isArray(body)||Object.keys(body).some(k=>k!=="businessId"))return json({error:"Invalid request."},400);
  const target=body as {businessId?:unknown};
  // Client tenant always derives from the current session. Operations still requires exact current capability.
  if(actor.access_role==="client"&&target.businessId!==undefined&&Number(target.businessId)!==actor.business_id)return json({error:"Inquiry access required."},403);
  const businessId=actor.access_role==="client"?Number(actor.business_id):Number(target.businessId),inquiryId=Number((await params).inquiryId);
  return json(await markInquiryRead(actor,{businessId,inquiryId}));
 }catch(error){return error instanceof InquiryError?json({error:error.message},error.status):json({error:"The inquiry could not be opened. Please try again."},503);}
}
