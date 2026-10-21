import {NextResponse} from 'next/server';
import {assertSameOrigin} from '@/lib/security';
import {jsonBody,MobileError} from '@/lib/mobile/http';
import {CatalogSafetyError,excludedBusinessIds} from '@/lib/catalog-safety';
import {BLOCKED_BUSINESS_COOKIE} from '@/lib/blocked-businesses-server';
export async function POST(request:Request){
  try{assertSameOrigin(request);}catch{return NextResponse.json({error:'Origin not allowed.'},{status:403});}
  try{
    const body=await jsonBody(request);
    if(Object.keys(body).some(k=>k!=='blockedIds'))throw new CatalogSafetyError('Invalid blocked business.');
    const ids=excludedBusinessIds(body.blockedIds);
    const response=NextResponse.json({saved:true},{headers:{'Cache-Control':'no-store'}});
    response.cookies.set(BLOCKED_BUSINESS_COOKIE,ids.join(','),{path:'/',httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:ids.length?365*86400:0});
    return response;
  }catch(e){return NextResponse.json({error:e instanceof CatalogSafetyError||e instanceof MobileError?e.message:'Please try again.'},{status:e instanceof CatalogSafetyError||e instanceof MobileError?e.status:500,headers:{'Cache-Control':'no-store'}});}
}
