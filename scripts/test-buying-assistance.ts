import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {NextRequest} from 'next/server';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {GET,POST,DELETE} from '../app/api/public-support/route';
import * as support from '../lib/support';
import {joinAssignedSupportConversation} from './testing/support-join';
import type {SessionUser} from '../lib/types';
const base='http://127.0.0.1:3102';
async function main(){
 const db=await getDb();process.env.NEXT_PUBLIC_APP_URL=base;
 try{
  async function actor(name:string,role:SessionUser['access_role']){
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES(?,'unused',?,'admin',0)").run(name+'@example.test',name)).insertedId;
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);return {id,email:name+'@example.test',name,role:'admin',access_role:role,business_id:null,must_change_password:0} as SessionUser;
  }
  const admin=await actor('history-manager','operations_manager'),buyer=await actor('history-transport','team_member'),helper=await actor('history-support','team_member');
  await support.updateSupportAgentSetting(admin,{userId:buyer.id,enabled:true,queueScope:'transport'});
  await support.updateSupportAgentSetting(admin,{userId:helper.id,enabled:true,queueScope:'support'});
  // Internal fixture/history compatibility only; no public API admits new buying chats.
  const legacy=await support.createPublicSupportConversation({category:'buying_assistance',name:'Historical buyer',phone:'+447700900999',message:'Historical buying request',idempotencyKey:crypto.randomUUID()},'historical-fixture');
  const snapshot=async()=>JSON.stringify({case:await db.prepare('SELECT * FROM support_conversations WHERE id=?').get(legacy.id),messages:await db.prepare('SELECT * FROM support_messages WHERE conversation_id=? ORDER BY id').all(legacy.id)});
  const before=await snapshot();
  for(const method of ['GET','POST','DELETE'])for(const body of ['', 'null', '[',JSON.stringify({action:'start',category:'buying_assistance',name:'New guest',phone:'+447700900999',message:'Need transport',idempotencyKey:crypto.randomUUID()})]){
   const request=new NextRequest(base+'/api/public-support?channel=buying',{method,headers:{cookie:'suqpage_public_buying='+legacy.token,origin:base,'content-type':'application/json'},...(method==='POST'?{body}:{})});
   const response=await(method==='GET'?GET(request):method==='POST'?POST(request):DELETE(request));assert.equal(response.status,410);assert.equal(response.headers.get('set-cookie'),null);
  }
  assert.equal(await snapshot(),before,'Retirement preserves historical rows and accepts no new request');
  await assert.rejects(()=>support.getSupportConversation(helper,legacy.id));
  assert.equal((await support.getSupportConversation(buyer,legacy.id)).conversation.visitorPhone,'+447700900999');
  await support.postSupportMessage(buyer,legacy.id,{audience:'note',message:'Private historical follow-up',idempotencyKey:crypto.randomUUID()});
  await joinAssignedSupportConversation(admin,legacy.id);
  await support.closeSupportConversation(buyer,legacy.id);
  assert.ok((await support.getSupportConversation(buyer,legacy.id)).conversation.resolvedAt);
  await support.reopenSupportConversation(admin,legacy.id);assert.equal((await support.getSupportConversation(buyer,legacy.id)).conversation.resolvedAt,null);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_conversations').get()).n,1);
  console.log('PASS retired buying alias, no cookie/body bypass or new case, unchanged historical contacts, scoped staff notes and resolution/reopen. Product inquiries remain independent.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
