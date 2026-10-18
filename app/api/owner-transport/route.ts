import {NextRequest,NextResponse} from 'next/server';
import {apiUser} from '@/lib/auth';
import {assertSameOrigin} from '@/lib/security';
import {readOwnerTransport,commandOwnerTransport} from '@/lib/owner-transport';
import {SupportError} from '@/lib/support';
import {scheduleAttentionDelivery} from '@/lib/attention-after';

function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});}
function failure(error:unknown){const known=error instanceof SupportError;return json({error:known?error.message:'Support is temporarily unavailable.',code:known?error.code:'internal'},!known?500:error.code==='forbidden'?403:error.code==='not_found'?404:error.code==='rate_limited'?429:400);}
export async function GET(request:NextRequest){
  try{
    const actor=await apiUser();if(!actor)return json({error:'Sign in to continue.'},401);
    const query:Record<string,unknown>={};for(const[key,value]of request.nextUrl.searchParams){if(key in query)throw new SupportError('Request could not be accepted.','invalid_request');query[key]=value;}
    return json(await readOwnerTransport(actor,query));
  }catch(error){return failure(error);}
}
export async function POST(request:NextRequest){
  try{
    try{assertSameOrigin(request);}catch{return json({error:'Request could not be accepted.'},403);}
    const actor=await apiUser();if(!actor)return json({error:'Sign in to continue.'},401);
    if(request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()!=='application/json')return json({error:'Send a JSON request.'},415);
    if(Number(request.headers.get('content-length')||0)>16000)return json({error:'Request is too large.'},413);
    const reader=request.body?.getReader(),chunks:Uint8Array[]=[];let bytes=0;
    if(reader)try{while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>16000){await reader.cancel();return json({error:'Request is too large.'},413);}chunks.push(part.value);}}finally{reader.releaseLock();}
    let body:unknown;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new SupportError('Request could not be accepted.','invalid_request');}
    if(!body||typeof body!=='object'||Array.isArray(body))throw new SupportError('Request could not be accepted.','invalid_request');
    const result=await commandOwnerTransport(actor,body as Record<string,unknown>);scheduleAttentionDelivery();return json(result);
  }catch(error){return failure(error);}
}
