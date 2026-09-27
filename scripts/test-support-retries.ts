import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {NextRequest} from 'next/server';
import {GET} from '../app/api/public-support/route';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {createPublicSupportConversation,getPublicSupportConversation,postPublicSupportMessage,publicSupportSessionIsUsable,PUBLIC_SUPPORT_SESSION_MS} from '../lib/support';
async function main(){
 const db=await getDb();
 process.env.SUQPAGE_TELEGRAM_BOT_TOKEN='';process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID='';
 try {
  const token=crypto.randomBytes(32).toString('base64url');const now=Date.now();
  const opening=await GET(new NextRequest('http://localhost:3102/api/public-support?channel=buying'));
  assert.match(opening.headers.get('set-cookie')||'',/suqpage_public_buying=.*HttpOnly/i);
  const prepared=await GET(new NextRequest('http://localhost:3102/api/public-support?channel=buying',{headers:{cookie:`suqpage_public_buying=${token}`}}));
  assert.equal(prepared.headers.get('set-cookie'),null,'GET must retain an unused prepared cookie');
  assert.deepEqual(await prepared.json(),{conversation:null});
  const draft={category:'buying_assistance',name:'Example buyer',phone:'+447700900999',message:'Fictional support retry test.',idempotencyKey:crypto.randomUUID()};
  assert.equal(await publicSupportSessionIsUsable(token),true);assert.equal(await publicSupportSessionIsUsable('invalid'),false);
  const results=await Promise.all([createPublicSupportConversation(draft,'retry-ip',now,token),createPublicSupportConversation(draft,'retry-ip',now,token)]);
  assert.equal(results[0].id,results[1].id);assert.equal(results.filter(row=>row.duplicate).length,1);
  assert.equal(await publicSupportSessionIsUsable(token),true);
  assert.equal(await publicSupportSessionIsUsable(token,now+PUBLIC_SUPPORT_SESSION_MS+1),false);
  for(let n=0;n<6;n++)assert.equal((await createPublicSupportConversation(draft,'retry-ip',now,token)).id,results[0].id,'Replay must not consume new-chat quota');
  await assert.rejects(()=>createPublicSupportConversation({...draft,message:'Changed content'},'retry-ip',now,token),/already open/);
  await assert.rejects(()=>createPublicSupportConversation({...draft,idempotencyKey:crypto.randomUUID()},'retry-ip',now,token),/already open/);
  const otherToken=crypto.randomBytes(32).toString('base64url');const other=await createPublicSupportConversation(draft,'retry-ip',now,otherToken);assert.notEqual(other.id,results[0].id,'Keys and contact details cannot recover a foreign chat');
  const reply={message:'Buying follow-up',idempotencyKey:crypto.randomUUID()};
  await postPublicSupportMessage(token,reply,'retry-ip',now+1);
  assert.equal((await postPublicSupportMessage(token,reply,'retry-ip',now+2)).duplicate,true);
  assert.deepEqual((await getPublicSupportConversation(token,now+3)).messages.map(row=>row.body),[draft.message,reply.message]);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_conversations').get()).n,2);assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_messages').get()).n,3);
  await assert.rejects(()=>createPublicSupportConversation(draft,'retry-ip',now+PUBLIC_SUPPORT_SESSION_MS+1,token),/expired/);
  await db.prepare('UPDATE support_conversations SET visitor_session_expires_at=? WHERE id=?').run(now-1,results[0].id);
  const expired=await GET(new NextRequest('http://localhost:3102/api/public-support?channel=buying',{headers:{cookie:`suqpage_public_buying=${token}`}}));
  assert.deepEqual(await expired.json(),{conversation:null});
  assert.match(expired.headers.get('set-cookie')||'',/suqpage_public_buying=/);
  assert.ok(!expired.headers.get('set-cookie')?.includes(token),'Expired token must rotate');
  console.log('PASS prepared-session concurrent/serial replay, unchanged counts/quota, altered-payload denial, token isolation, buying message replay and expiry.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
