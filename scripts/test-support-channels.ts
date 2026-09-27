import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {NextRequest} from 'next/server';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {GET,POST,DELETE} from '../app/api/public-support/route';
import {GET as attachmentGET} from '../app/api/public-support/attachments/[attachmentId]/route';
import {createPublicSupportConversation} from '../lib/support';
const base='http://127.0.0.1:3102';
async function main(){
 const db=await getDb();process.env.NEXT_PUBLIC_APP_URL=base;delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 try{
  // Retained data remains in staff history, but old cookies cannot revive public chat.
  const old=await createPublicSupportConversation({category:'general',email:'old@example.test',phone:'+447700900999',message:'Historical guest chat',idempotencyKey:crypto.randomUUID()},'legacy-fixture');
  const counts=async()=>JSON.stringify(await db.prepare('SELECT (SELECT COUNT(*) FROM support_conversations) cases,(SELECT COUNT(*) FROM support_messages) messages,(SELECT COUNT(*) FROM support_assignments) assignments').get());
  const before=await counts();
  for(const channel of [null,'help','transport','wrong'])for(const method of ['GET','POST','DELETE']){
   const request=new NextRequest(base+'/api/public-support'+(channel===null?'':'?channel='+channel),{method,headers:{origin:base,'content-type':'application/json',cookie:`suqpage_public_support=${old.token}; suqpage_public_help=${old.token}`},...(method==='POST'?{body:JSON.stringify({action:'start',category:'general',email:'guest@example.test',phone:'+447700900999',message:'Disallowed',idempotencyKey:crypto.randomUUID()})}:{})});
   const response=await(method==='GET'?GET(request):method==='POST'?POST(request):DELETE(request));
   assert.equal(response.status,410);assert.equal(response.headers.get('set-cookie'),null);assert.equal((await response.json()).code,'public_chat_retired');
  }
  const send=async(body:Record<string,unknown>,token=old.token)=>POST(new NextRequest(base+'/api/public-support?channel=buying',{method:'POST',headers:{origin:base,'content-type':'application/json',cookie:`suqpage_public_buying=${token}`},body:JSON.stringify(body)}));
  assert.equal((await send({action:'start',category:'general'})).status,400);
  assert.equal((await send({action:'message',message:'Wrong-channel attempt',idempotencyKey:crypto.randomUUID()})).status,404);
  assert.equal((await send({action:'close',publicRef:old.publicRef})).status,404);
  assert.equal((await send({action:'start',category:'buying_assistance',attachment:'file'})).status,400);
  const crossed=await GET(new NextRequest(base+'/api/public-support?channel=buying',{headers:{cookie:`suqpage_public_buying=${old.token}`}}));assert.equal(crossed.status,404);
  const attachment=await attachmentGET();assert.equal(attachment.status,404);assert.match(attachment.headers.get('Cache-Control')||'',/no-store/);
  assert.equal(await counts(),before,'Denied guest chat creates no cases, messages or assignments');
  console.log('PASS retired/missing public channels, old-cookie bypass, forged buying category, reply/close/upload denial, private file retirement and unchanged historical records. Owner workflow covered in test-support.ts.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1});
