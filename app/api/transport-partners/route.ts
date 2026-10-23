import {assertSameOrigin,hashPrivateValue,requestIpFromHeaders} from '@/lib/security';
import {handlePartnerInterest} from '@/lib/transport-partner-http';
export const runtime='nodejs';
export async function POST(request:Request){
 try{assertSameOrigin(request);}catch{return Response.json({error:'Request could not be accepted.'},{status:403,headers:{'Cache-Control':'private, no-store'}});}
 return handlePartnerInterest(request,hashPrivateValue(requestIpFromHeaders(request.headers)));
}
