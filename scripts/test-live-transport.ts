import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {NextRequest} from 'next/server';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {GET,POST} from '../app/api/public-support/route';
import {handleMobileRequest} from '../lib/mobile/router';
import {runtimeUserById} from '../lib/catalog-runtime';
import type {NativeIdentityPort} from '../lib/mobile/http';
import type {SessionUser} from '../lib/types';
async function main(){
 const db=await getDb();process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3102';
 try{
  for(const channel of ['transport','buying'])for(const method of ['GET','POST']){
   const request=new NextRequest('http://127.0.0.1:3102/api/public-support?channel='+channel,{method,...(method==='POST'?{body:JSON.stringify({action:'start',category:channel==='transport'?'shipment_observation':'buying_assistance',name:'Guest',phone:'+251911223344',origin:'A',destination:'B',message:'Need transport',idempotencyKey:crypto.randomUUID()})}:{})});
   const response=await(method==='GET'?GET(request):POST(request));assert.equal(response.status,410);assert.equal(response.headers.get('set-cookie'),null);
  }
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_conversations').get()).n,0,'Neither legacy public channel can create a transport-queue case');
  async function client(handle:string){
   const businessId=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition','active')").run(handle,handle)).insertedId;
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused',?,'owner',?,0)").run(handle+'@example.test',handle,businessId)).insertedId;
   await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(id);return (await runtimeUserById(id))!;
  }
  const owner=await client('live-business-a'),foreign=await client('live-business-b');let actor:SessionUser=owner;
  const identity:NativeIdentityPort={verify:async()=>({id:'fixture-owner',email:actor.email}),linked:async()=>actor.id,user:runtimeUserById};
  const mobile=(route:string,body?:unknown,signedIn=true)=>handleMobileRequest(new Request('https://africmade.com/api/mobile/v1/'+route,{method:body?'POST':'GET',headers:{...(signedIn?{authorization:'Bearer '+'t'.repeat(24)}:{}),'content-type':'application/json','X-Suqpage-Buying-Session':'g'.repeat(64)},...(body?{body:JSON.stringify(body)}:{})}),route.split('?')[0].split('/'),{identity});
  assert.equal((await mobile('owner/transport',undefined,false)).status,401,'A guest token never becomes a business session');
  const first=await mobile('owner/transport',{action:'start',name:'Business contact',phone:'+251911223344',origin:'Addis Ababa',destination:'Adama',message:'Two chairs',idempotencyKey:crypto.randomUUID()});assert.equal(first.status,200);
  const {conversation}=await first.json();assert.ok(conversation);
  const stored=await db.prepare('SELECT participant_kind,business_id,visitor_token_hash FROM support_conversations WHERE id=?').get(conversation.id);assert.deepEqual(stored,{participant_kind:'client',business_id:owner.business_id,visitor_token_hash:null});
  assert.equal((await mobile('owner/transport?conversation='+conversation.id)).status,200);
  actor=foreign;assert.equal((await mobile('owner/transport?conversation='+conversation.id)).status,404);actor=owner;
  const reply=await mobile('owner/transport',{action:'message',conversationId:conversation.id,publicRef:conversation.publicRef,message:'Business follow-up',idempotencyKey:crypto.randomUUID()});assert.equal(reply.status,200);assert.equal((await reply.json()).conversation.messages.length,2);
  console.log('PASS actual native adapter: both public aliases retired, no guest-session promotion, business intake/read/reply preserved and foreign business denied. Full staff/privacy/lifecycle: test-owner-transport.ts.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
