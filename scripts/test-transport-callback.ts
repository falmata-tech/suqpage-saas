import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {NextRequest} from 'next/server';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {DELETE,GET,POST} from '../app/api/public-support/route';
import {runtimeUserById} from '../lib/catalog-runtime';
import {TRANSPORT_COORDINATOR} from '../lib/transport-coordinator';
import {commandOwnerTransport} from '../lib/owner-transport';
import * as support from '../lib/support';
import type {SessionUser} from '../lib/types';

const key=()=>crypto.randomUUID();
async function main(){
 const db=await getDb(),realNow=Date.now;
 process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3102';
 delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 let clock=realNow();
 Date.now=()=>clock;
 try{
  async function actor(name:string,role:SessionUser['access_role'],businessId:number|null=null,scope?:'support'|'transport'){
   const email='s162-'+name+'-'+crypto.randomBytes(4).toString('hex')+'@example.test';
   const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,account_phone) VALUES(?,'unused',?,'admin',?,0,'+251911223344')").run(email,name,businessId)).insertedId);
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,?,?)').run(id,scope,clock);
   return (await runtimeUserById(id))!;
  }
  const admin=await actor('admin','platform_admin'),agent=await actor('agent','team_member',null,'transport');
  await support.updateSupportAgentSetting(admin,{userId:agent.id,enabled:true,maxOpenConversations:5,queueScope:'transport'});
  const start=realNow()-300_000;clock=start;
  await assert.rejects(()=>support.createPublicSupportConversation({category:'shipment_observation',name:'Visitor',phone:'+251911111111',origin:'A',destination:'B',idempotencyKey:key()},'retired'),error=>error instanceof support.SupportError&&error.code==='public_chat_retired');
  const business=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status,public_phone) VALUES(?,?,'composition','active','+251911444555')").run('s162-owner-'+crypto.randomBytes(3).toString('hex'),'S162 callback owner')).insertedId);
  const otherBusiness=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition','active')").run('s162-other-'+crypto.randomBytes(3).toString('hex'),'S162 other owner')).insertedId);
  const owner=await actor('owner','client',business),foreign=await actor('foreign-owner','client',otherBusiness);
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at) VALUES(?,1,?,0,?,?)').run(business,JSON.stringify({contacts:{phone:'+251911444666'}}),owner.id,clock);
  const ownerStart=start+10;
  const ownerCreated=await support.createOwnerTransportConversation(owner,{name:'Owner contact',phone:'+251911222333',origin:'Hawassa',destination:'Addis Ababa',message:'Incoming stock',idempotencyKey:key(),coordinatorId:TRANSPORT_COORDINATOR.id},ownerStart);
  const ownerDue=ownerStart+210_000;clock=ownerDue;
  const ownerResult=await commandOwnerTransport(owner,{action:'callback',conversationId:ownerCreated.id,publicRef:ownerCreated.publicRef,phone:'+251911222444',email:'owner@example.test',idempotencyKey:key()});
  assert.equal(ownerResult.conversation?.transportCallback?.submitted,true);
  assert.equal(ownerResult.conversation?.messages.length,0);
  await assert.rejects(()=>commandOwnerTransport(foreign,{action:'callback',conversationId:ownerCreated.id,publicRef:ownerCreated.publicRef,phone:'+251911222555',email:'foreign@example.test',idempotencyKey:key()}),error=>error instanceof support.SupportError&&error.code==='not_found');
  const ownerRow=await db.prepare('SELECT visitor_phone,visitor_email,status,resolved_at FROM support_conversations WHERE id=?').get(ownerCreated.id);
  assert.deepEqual(ownerRow,{visitor_phone:'+251911222444',visitor_email:'owner@example.test',status:'open',resolved_at:null});
  console.log("PASS S162 owner callback uses the owner's same case and denies cross-business callback access.");
 }finally{Date.now=realNow;await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
