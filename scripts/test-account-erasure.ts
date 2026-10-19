import assert from 'node:assert/strict';import crypto from 'node:crypto';import fs from 'node:fs';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {planOwnerErasure,replanOwnerErasureAfterIdentityRemoval,eraseOwnerRows} from './operations/account-erasure';
import {createPublicClientWorkspace} from '../lib/signup';import {findPlaceSuggestions} from '../lib/place-catalog';
import {createSuqpageSupabaseAdminClient} from '../lib/supabase-auth';import {supabaseAuthConfig,supabaseMediaStorageConfig} from '../lib/config';
import {runtimeUserById} from '../lib/catalog-runtime';import {getMediaObjectStore,type MediaNamespace} from '../lib/media-storage';
import {buildRuntimeMediaReferenceManifest} from '../lib/media-manifest';import {handleMobileRequest} from '../lib/mobile/router';
import {createSupportConversation} from '../lib/support';

async function main(){
 const db=await getDb();process.env.SUQPAGE_AUTH_DRIVER='supabase';process.env.SUQPAGE_MEDIA_DRIVER='supabase';
 assert.equal(new URL(supabaseAuthConfig().url).origin,'http://127.0.0.1:54321');assert.equal(new URL(supabaseMediaStorageConfig().url).origin,'http://127.0.0.1:54321');
 const admin=createSuqpageSupabaseAdminClient(),store=getMediaObjectStore(),providerIds:string[]=[],media:Array<{namespace:MediaNamespace;key:string}>=[];
 try{
  const email='qa-erasure-'+crypto.randomUUID()+'@example.test',password=crypto.randomBytes(32).toString('base64url');
  const p=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.equal(p.error,null);assert.ok(p.data.user);providerIds.push(p.data.user.id);
  const input=(name:string)=>({name,businessName:name+' Store',businessCategory:'home-living',placeId:findPlaceSuggestions('Addis Ababa')[0].id,phone:'+447700900125',consent:true,idempotencyKey:crypto.randomUUID()});
  const a=await createPublicClientWorkspace(input('LOCAL QA Erasure'),{providerUserId:p.data.user.id,email});
  const b=await createPublicClientWorkspace(input('LOCAL QA Preserve'),{providerUserId:crypto.randomUUID(),email:'qa-preserve@example.test'});
  const target={userId:a.userId,email,providerId:p.data.user.id};
  const identity={
   current:async(id:string)=>{const result=await admin.auth.admin.getUserById(id);const user=result.data.user;return user?.email ? {providerId:user.id,email:user.email,confirmed:Boolean(user.email_confirmed_at)} : null;},
   isAbsent:async(id:string)=>{const result=await admin.auth.admin.getUserById(id);return result.data.user===null && result.error?.status===404;},
  };
  // This snapshot is intentionally older than the current, provider-verified email.
  await db.prepare('UPDATE auth_identity_links SET email_at_link=? WHERE user_id=?').run('historical-link@example.test',a.userId);
  const actor=(await runtimeUserById(a.userId))!;
  await createSupportConversation(actor,{subject:'LOCAL QA erasure',message:'Owner conversation to erase',idempotencyKey:crypto.randomUUID()});
  await db.prepare("INSERT INTO attention_preferences(recipient_key,sound_enabled,language,updated_at) VALUES(?,true,'en',0)").run('user:'+a.userId);
  await db.prepare("INSERT INTO attention_subscriptions(recipient_key,kind,endpoint_hash,subscription_json,created_at) VALUES(?,'expo',?,'{}',0)").run('user:'+a.userId,crypto.randomUUID());
  const owned='page-'+a.businessId+'-'+crypto.randomUUID()+'.png',shared=crypto.randomUUID()+'.png',orphan='product-private-'+a.businessId+'-'+crypto.randomUUID()+'.png';
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
  for(const [namespace,key] of [['pages',owned],['public',shared],['pages',orphan]] as const){await store.put(namespace,key,png,'image/png');media.push({namespace,key});}
  const draft=await db.prepare('SELECT content_json FROM owner_page_drafts WHERE business_id=?').get(a.businessId),content=JSON.parse(draft.content_json);
  content.heroImage=`/api/page-drafts/${a.businessId}/media/${owned}`;await db.prepare('UPDATE owner_page_drafts SET content_json=? WHERE business_id=?').run(JSON.stringify(content),a.businessId);
  for(const bid of [a.businessId,b.businessId])await db.prepare('UPDATE products SET image_path=? WHERE business_id=?').run('/media/'+shared,bid);
  const before=await buildRuntimeMediaReferenceManifest();assert.ok(before.references.some(v=>v.key===owned));assert.ok(before.references.some(v=>v.key===shared));
  const otherBefore=await db.prepare('SELECT row_to_json(b)::text value FROM businesses b WHERE id=?').get(b.businessId),otherProducts=await db.prepare('SELECT row_to_json(p)::text value FROM products p WHERE business_id=? ORDER BY id').all(b.businessId);
  for(const forged of [{...target,providerId:crypto.randomUUID()},{...target,email:'wrong@example.test'}])await assert.rejects(()=>planOwnerErasure(db.runner,forged,identity));
  await assert.rejects(()=>planOwnerErasure(db.runner,target,{...identity,current:async()=>({providerId:target.providerId,email:target.email,confirmed:false})}));
  await assert.rejects(()=>planOwnerErasure(db.runner,target,{...identity,current:async()=>({providerId:crypto.randomUUID(),email:target.email,confirmed:true})}));
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(a.userId);await assert.rejects(()=>planOwnerErasure(db.runner,target,identity));await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(a.userId);
  const sharedUser=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES('qa-shared@example.test','fixture','Shared','owner',?,0)").run(a.businessId)).insertedId);
  await assert.rejects(()=>planOwnerErasure(db.runner,target,identity));await db.prepare('DELETE FROM users WHERE id=?').run(sharedUser);
  const initial=await planOwnerErasure(db.runner,target,identity);assert.ok(initial.counts.products>0);assert.ok(initial.counts.support_messages>0);assert.ok(initial.counts.owner_page_events>0);assert.equal(initial.counts.attention_subscriptions,1);
  await assert.rejects(()=>replanOwnerErasureAfterIdentityRemoval(db.runner,initial,identity));
  assert.equal((await db.prepare('SELECT email_at_link FROM auth_identity_links WHERE user_id=?').get(a.userId)).email_at_link,'historical-link@example.test');
  const approval={approvedDigest:initial.digest,verifiedRequestReference:'LOCAL_QA_VERIFIED_REQUEST',backupSha256:'a'.repeat(64)};
  await assert.rejects(()=>eraseOwnerRows(db.runner,initial,{...approval,approvedDigest:'b'.repeat(64)},identity));
  await assert.rejects(()=>eraseOwnerRows(db.runner,initial,{...approval,backupSha256:''},identity));
  await assert.rejects(()=>eraseOwnerRows(db.runner,initial,approval,identity),'Must keep the binding while the managed identity still exists');
  await db.prepare('UPDATE users SET name=? WHERE id=?').run('LOCAL QA changed owner',a.userId);
  // A genuinely issued local Auth session must lose app authority after erasure.
  const {createClient}=await import('@supabase/supabase-js');const c=supabaseAuthConfig(),client=createClient(c.url,c.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const login=await client.auth.signInWithPassword({email,password});assert.equal(login.error,null);assert.ok(login.data.session);const oldToken=login.data.session.access_token;
  const removed=await admin.auth.admin.deleteUser(target.providerId);assert.equal(removed.error,null);const absent=await admin.auth.admin.getUserById(target.providerId);assert.equal(absent.data.user,null);assert.ok(absent.error);assert.equal((await client.auth.getUser(oldToken)).data.user,null);
  assert.equal((await handleMobileRequest(new Request('http://127.0.0.1/api/mobile/v1/session',{headers:{authorization:'Bearer '+oldToken}}),['session'])).status,401,'Removed Auth identity must not be offered fresh setup');
  await assert.rejects(()=>eraseOwnerRows(db.runner,initial,approval,identity));assert.ok(await runtimeUserById(a.userId));
  const current=await replanOwnerErasureAfterIdentityRemoval(db.runner,initial,identity);
  await db.exec('CREATE TABLE qa_erasure_blocker (owner_id bigint REFERENCES users(id) ON DELETE RESTRICT)');await db.prepare('INSERT INTO qa_erasure_blocker(owner_id) VALUES(?)').run(a.userId);
  await assert.rejects(()=>eraseOwnerRows(db.runner,current,{...approval,approvedDigest:current.digest},identity));assert.ok(await runtimeUserById(a.userId));assert.equal((await db.prepare('SELECT count(*) n FROM support_conversations WHERE business_id=?').get(a.businessId)).n,1,'Foreign-key failure must roll back all app deletion');
  await db.exec('DROP TABLE qa_erasure_blocker');
  await eraseOwnerRows(db.runner,current,{...approval,approvedDigest:current.digest},identity);
  for(const table of ['businesses','users'])assert.equal((await db.prepare(`SELECT count(*) n FROM ${table} WHERE id=?`).get(table==='users'?a.userId:a.businessId)).n,0);
  for(const table of ['attention_preferences','attention_subscriptions'])assert.equal((await db.prepare(`SELECT count(*) n FROM ${table} WHERE recipient_key=?`).get('user:'+a.userId)).n,0);
  const denied=await handleMobileRequest(new Request('http://127.0.0.1/api/mobile/v1/owner/home',{headers:{authorization:'Bearer '+oldToken}}),['owner','home']);assert.ok([401,409].includes(denied.status));
  const after=await buildRuntimeMediaReferenceManifest(),stillUsed=new Set(after.references.map(v=>v.namespace+':'+v.key));
  for(const candidate of before.references)if(!stillUsed.has(candidate.namespace+':'+candidate.key))await store.remove(candidate.namespace,[candidate.key]);
  // The operator inventories the owned prefixes, including unreferenced uploads.
  const bucket=supabaseMediaStorageConfig().bucket;
  const listed=await admin.storage.from(bucket).list('pages',{search:'product-private-'+a.businessId+'-',limit:1000});assert.equal(listed.error,null);assert.ok(listed.data.some(v=>v.name===orphan));
  const ownedOrphans=listed.data.filter(v=>v.name.startsWith('product-private-'+a.businessId+'-')&&!stillUsed.has('pages:'+v.name));await store.remove('pages',ownedOrphans.map(v=>v.name));
  assert.equal(await store.read('pages',owned,'image/png'),null);assert.equal(await store.read('pages',orphan,'image/png'),null);assert.ok(await store.read('public',shared,'image/png'),'Shared upload remains for the other owner');
  assert.deepEqual(await db.prepare('SELECT row_to_json(b)::text value FROM businesses b WHERE id=?').get(b.businessId),otherBefore);assert.deepEqual(await db.prepare('SELECT row_to_json(p)::text value FROM products p WHERE business_id=? ORDER BY id').all(b.businessId),otherProducts);
  await assert.rejects(()=>planOwnerErasure(db.runner,target,identity));
  console.log('PASS account erasure: isolated PostgreSQL exact-target/shared-owner/staff/drift/approval/backup guards; tenant rows/chat/push deletion; actual local Supabase Auth/session and referenced/orphan media erasure; shared image and other tenant unchanged.');
 }finally{for(const m of media)await store.remove(m.namespace,[m.key]);for(const id of providerIds){const check=await admin.auth.admin.getUserById(id);if(check.data.user)assert.equal((await admin.auth.admin.deleteUser(id)).error,null);}await closeDbForTests();}
}
main().catch(e=>{fs.mkdirSync('.local/play-s99',{recursive:true,mode:0o700});fs.writeFileSync('.local/play-s99/erasure-test-failure.json',JSON.stringify({name:e.name,message:e.message,stack:e.stack},null,2),{mode:0o600});console.error('Account erasure regression stopped; protected diagnostic saved. '+String(e.stack).split('\n').filter(s=>/^\s+at /.test(s)).slice(0,2).join('\n'));process.exitCode=1;});
