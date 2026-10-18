import {getIndependentPublicMarketplace} from '@/lib/public-discovery-cache';
import {readMarketSearch,validMarketLocationParams,validMarketFilterParams} from '@/lib/market-search';
import {consumeRuntimeRateLimit} from '@/lib/rate-limit-runtime';
import {hashPrivateValue,requestIpFromHeaders} from '@/lib/security';
export const runtime='nodejs';
export async function GET(request:Request) {
 const url=new URL(request.url),scope=url.searchParams.get('scope');
 const headers={'Cache-Control':'private, no-store'};
 if(url.search.length>4000||!['businesses','products'].includes(scope||'')||!validMarketLocationParams(url.searchParams)||!validMarketFilterParams(url.searchParams))return Response.json({error:'Check your search filters.'},{status:400,headers});
 const rate=await consumeRuntimeRateLimit('discovery:'+hashPrivateValue(requestIpFromHeaders(request.headers)),240,60000);
 if(!rate.allowed)return Response.json({error:'Please try again shortly.'},{status:429,headers:{...headers,'Retry-After':'60'}});
 try{return Response.json(await getIndependentPublicMarketplace(scope as 'businesses'|'products',readMarketSearch(url.searchParams)),{headers});}
 catch{return Response.json({error:'Search is unavailable. Try again.'},{status:503,headers});}
}
