import { NextRequest, NextResponse } from 'next/server';
import { apiUser } from '@/lib/auth';
import { assertSameOrigin } from '@/lib/security';
import { publicSupportSession } from '@/lib/public-support-channel';
import { AttentionError, userAttentionFeed, visitorAttentionFeed, readUserAttention, readVisitorAttention, readAllUserAttention, readAllVisitorAttention, userAttentionPreferences, visitorAttentionPreferences,subscribeUserAttention,subscribeVisitorAttention,revokeUserAttention,revokeVisitorAttention,pushCapabilities,assertVisitorAttentionChannel } from '@/lib/attention-postgres';
import { SupportError } from '@/lib/support';

function json(value: unknown, status = 200) { return NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}}); }
async function scope(request:NextRequest) {
  const channel=request.nextUrl.searchParams.get('channel');
  if(channel!==null){
    if(!['transport','buying'].includes(channel))throw new AttentionError('This chat is unavailable.');
    const session=await publicSupportSession(request.cookies,channel);
    await assertVisitorAttentionChannel(session.token,channel as 'transport'|'buying');return {user:null,token:session.token};
  }
  const user=await apiUser();if(!user)throw new AttentionError('Sign in to continue.','unauthorized');return {user,token:''};
}
function error(error:unknown) {
  if(error instanceof AttentionError || error instanceof SupportError)return json({error:error.message,code:error.code},error.code==='unauthorized'?401:error.code==='not_found'?404:error.code==='forbidden'?403:400);
  return json({error:'Alerts are temporarily unavailable.'},500);
}
export async function GET(request:NextRequest){try{const s=await scope(request);return json({...(s.user?await userAttentionFeed(s.user):await visitorAttentionFeed(s.token)),push:pushCapabilities()});}catch(e){return error(e);}}
export async function POST(request:NextRequest){
  try{
    try{assertSameOrigin(request);}catch{return json({error:'Request could not be accepted.'},403);}
    if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return json({error:'Send a JSON request.'},415);
    const reader=request.body?.getReader(),parts:Uint8Array[]=[];let length=0;
    if(reader)try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;if(length>8192){await reader.cancel();return json({error:'Request is too large.'},413);}parts.push(part.value);}}finally{reader.releaseLock();}
    let raw:unknown;try{raw=JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{return json({error:'Request could not be accepted.'},400);}
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return json({error:'Request could not be accepted.'},400);
    const b=raw as Record<string,unknown>;if(Object.keys(b).some(k=>!['action','id','soundEnabled','language','device'].includes(k)))return json({error:'Request could not be accepted.'},400);
    const s=await scope(request);
    if(b.action==='read'){if(s.user)await readUserAttention(s.user,b.id);else await readVisitorAttention(s.token,b.id);}
    else if(b.action==='read_all'){if(s.user)await readAllUserAttention(s.user,b.id);else await readAllVisitorAttention(s.token,b.id);}
    else if(b.action==='preferences'){if(s.user)await userAttentionPreferences(s.user,b);else await visitorAttentionPreferences(s.token,b);}
    else if(b.action==='subscribe'){if(s.user)await subscribeUserAttention(s.user,b.device);else await subscribeVisitorAttention(s.token,b.device);}
    else if(b.action==='unsubscribe'){if(s.user)await revokeUserAttention(s.user);else await revokeVisitorAttention(s.token);}
    else return json({error:'Choose an alert action.'},400);
    return json({...(s.user?await userAttentionFeed(s.user):await visitorAttentionFeed(s.token)),push:pushCapabilities()});
  }catch(e){return error(e);}
}
