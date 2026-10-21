import {assertSameOrigin,hashPrivateValue,requestIpFromHeaders} from '@/lib/security';
import {jsonBody,MobileError} from '@/lib/mobile/http';
import {CatalogSafetyError} from '@/lib/catalog-safety';
import {submitListingReport} from '@/lib/listing-reports';
import {listingReportPort} from '@/lib/listing-reports-postgres';
export const runtime='nodejs';
export async function POST(request:Request){
  try{assertSameOrigin(request);}catch{return Response.json({error:'Origin not allowed.'},{status:403});}
  try{return Response.json(await submitListingReport(listingReportPort,await jsonBody(request),hashPrivateValue(requestIpFromHeaders(request.headers))),{headers:{'Cache-Control':'no-store'}});}
  catch(e){return Response.json({error:e instanceof CatalogSafetyError||e instanceof MobileError?e.message:'Report could not be saved.'},{status:e instanceof CatalogSafetyError||e instanceof MobileError?e.status:500,headers:{'Cache-Control':'no-store'}});}
}
