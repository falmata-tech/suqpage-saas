import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {getDb, closeDbForTests} from './testing/postgres-fixture';
import {reviewerBinding, reviewerEmail, reviewerSignInMode, authenticateReviewer, ReviewerAccessError, type ReviewerAccount, type ReviewerIdentityPort} from '../lib/reviewer-access';
import {reviewerAccounts, reviewerProvider} from '../lib/reviewer-access-runtime';
import {createPublicClientWorkspace} from '../lib/signup';
import {findPlaceSuggestions} from '../lib/place-catalog';
import {createSuqpageSupabaseAdminClient, linkedSuqpageUserId} from '../lib/supabase-auth';
import {supabaseAuthConfig} from '../lib/config';
import {runtimeUserById} from '../lib/catalog-runtime';
import {nativeIdentityPort} from '../lib/mobile/http';
import {handleMobileRequest} from '../lib/mobile/router';
import {POST as startEmail} from '../app/api/auth/email/start/route';
import {POST as webReview} from '../app/api/auth/review/route';
import {publicationReadiness} from '../lib/publication-readiness';

async function main() {
  assert.equal(reviewerBinding(undefined,undefined),null);
  assert.equal(reviewerEmail(' A@EXAMPLE.TEST '),'a@example.test');
  for(const [email,id] of [['bad','invalid'],['a@example.test',undefined],[undefined,crypto.randomUUID()],['bad',crypto.randomUUID()]])
    assert.throws(()=>reviewerBinding(email,id),e=>e instanceof ReviewerAccessError && e.status===503);
  const binding={email:'qa-review@example.test',providerId:crypto.randomUUID()};
  const account:ReviewerAccount={...binding,linkedEmail:binding.email,userId:1,businessId:2,role:'client',demo:true,businessStatus:'draft'};
  let providerCalls=0,revoked=0,reads=0;
  const identity:ReviewerIdentityPort={authenticate:async()=>{providerCalls++;return {...binding,verifiedEmail:true,accessToken:'policy-test-access',refreshToken:'policy-test-refresh'};},revoke:async()=>{revoked++;}};
  assert.equal(await reviewerSignInMode(null,{read:async()=>{throw Error('must not read');}},binding.email),'otp');
  assert.equal(await reviewerSignInMode(binding,{read:async()=>{throw Error('must not read');}},'ordinary@example.test'),'otp');
  assert.equal(await reviewerSignInMode(binding,{read:async()=>account},binding.email),'password');
  for(const changes of [{role:'platform_admin'},{role:'team_member'},{role:'platform_ops'},{demo:false},{businessStatus:'suspended'},{providerId:crypto.randomUUID()},{email:'other@example.test'},{linkedEmail:'other@example.test'},{businessId:0},{userId:0}]) {
    const port={read:async()=>({...account,...changes})};
    await assert.rejects(()=>authenticateReviewer(binding,port,identity,{email:binding.email,password:'policy-test-password'}),ReviewerAccessError);
    await assert.rejects(()=>reviewerSignInMode(binding,port,binding.email),e=>e instanceof ReviewerAccessError&&e.status===503);
  }
  for(const input of [{email:'ordinary@example.test',password:'policy-test-password'},{email:binding.email,password:42},{email:binding.email,password:'short'},{email:binding.email,password:'a'.repeat(129)}])
    await assert.rejects(()=>authenticateReviewer(binding,{read:async()=>account},identity,input),ReviewerAccessError);
  assert.equal(providerCalls,0);
  for(const changes of [{role:'platform_admin'},{demo:false},{businessId:9},{userId:10},{businessStatus:'suspended'}]) {
    reads=0;
    await assert.rejects(()=>authenticateReviewer(binding,{read:async()=>++reads===1?account:{...account,...changes}},identity,{email:binding.email,password:'policy-test-password'}),ReviewerAccessError);
  }
  assert.equal(revoked,5);
  await assert.rejects(()=>authenticateReviewer(binding,{read:async()=>account},{...identity,authenticate:async()=>{throw Error('private provider diagnostic');}},{email:binding.email,password:'policy-test-password'}),e=>e instanceof ReviewerAccessError&&e.status===503&&!e.message.includes('private'));
  for(const changes of [{providerId:crypto.randomUUID()},{email:'other@example.test'},{verifiedEmail:false},{accessToken:''}])
    await assert.rejects(()=>authenticateReviewer(binding,{read:async()=>account},{...identity,authenticate:async()=>({...binding,verifiedEmail:true,accessToken:'policy-test-access',refreshToken:'policy-test-refresh',...changes})},{email:binding.email,password:'policy-test-password'}),ReviewerAccessError);
  assert.equal(revoked,9);

  const db=await getDb(),providerIds:string[]=[];
  const previous={driver:process.env.SUQPAGE_AUTH_DRIVER,email:process.env.SUQPAGE_REVIEW_EMAIL,id:process.env.SUQPAGE_REVIEW_PROVIDER_ID};
  process.env.SUQPAGE_AUTH_DRIVER='supabase';
  assert.equal(new URL(supabaseAuthConfig().url).origin,'http://127.0.0.1:54321','Real provider tests must be local only');
  const admin=createSuqpageSupabaseAdminClient();
  try {
    const email=`qa-review-${crypto.randomUUID()}@example.test`,password=crypto.randomBytes(32).toString('base64url');
    const created=await admin.auth.admin.createUser({email,password,email_confirm:true});
    assert.equal(created.error,null,'Local reviewer provider fixture creation');assert.ok(created.data.user);const id=created.data.user.id;providerIds.push(id);
    const a=await createPublicClientWorkspace({name:'LOCAL QA reviewer',businessName:'LOCAL QA Reviewer Studio',businessCategory:'home-living',placeId:findPlaceSuggestions('Addis Ababa')[0].id,phone:'+447700900123',consent:true,idempotencyKey:crypto.randomUUID()}, {providerUserId:id,email});
    const b=await createPublicClientWorkspace({name:'LOCAL QA other owner',businessName:'LOCAL QA Other Studio',businessCategory:'home-living',placeId:findPlaceSuggestions('Addis Ababa')[0].id,phone:'+447700900124',consent:true,idempotencyKey:crypto.randomUUID()}, {providerUserId:crypto.randomUUID(),email:'qa-other@example.test'});
    assert.equal(await linkedSuqpageUserId(id),a.userId);
    process.env.SUQPAGE_REVIEW_EMAIL=email;process.env.SUQPAGE_REVIEW_PROVIDER_ID=id;
    const localBinding=reviewerBinding(email,id)!;
    await assert.rejects(()=>authenticateReviewer(localBinding,reviewerAccounts,reviewerProvider(),{email,password}),ReviewerAccessError,'Non-demo account denied despite correct password');
    await db.prepare('UPDATE businesses SET is_demo=1 WHERE id=?').run(a.businessId);
    assert.equal(await reviewerSignInMode(localBinding,reviewerAccounts,email),'password');
    await assert.rejects(()=>authenticateReviewer(localBinding,reviewerAccounts,reviewerProvider(),{email,password:crypto.randomBytes(32).toString('base64url')}),ReviewerAccessError,'Real provider rejects wrong password');
    const signed=await authenticateReviewer(localBinding,reviewerAccounts,reviewerProvider(),{email,password});
    assert.equal(signed.providerId,id);assert.equal(signed.verifiedEmail,true);assert.notEqual(signed.accessToken,'');
    const post=(path:string,body:unknown,origin?:string)=>new Request('http://127.0.0.1:3102/api/mobile/v1/'+path,{method:'POST',headers:{'content-type':'application/json',...(origin?{origin}:{})},body:JSON.stringify(body)});
    let r=await handleMobileRequest(post('auth/mode',{email}),['auth','mode']);assert.equal(r.status,200);assert.deepEqual(await r.json(),{mode:'password'});assert.match(r.headers.get('cache-control')||'',/no-store/);
    r=await handleMobileRequest(post('auth/mode',{email:'ordinary@example.test'}),['auth','mode']);assert.deepEqual(await r.json(),{mode:'otp'});
    const webRequest=(body:unknown)=>new Request('http://127.0.0.1:3102/api/auth/email/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    r=await startEmail(webRequest({email}));assert.equal(r.status,200);assert.deepEqual(await r.json(),{accepted:true,mode:'password'});
    assert.equal((await startEmail(webRequest(null))).status,400);
    assert.equal((await startEmail(webRequest({email,extra:true}))).status,400);
    assert.equal((await startEmail(webRequest({email,pad:'a'.repeat(3000)}))).status,413);
    assert.equal((await startEmail(new Request('http://127.0.0.1:3102/api/auth/email/start',{method:'POST',body:'{}'}))).status,415);
    for(const body of [null,[],{email,role:'admin'},{email,password:'a'.repeat(25000)}]){r=await handleMobileRequest(post('auth/review',body),['auth','review']);assert.ok([400,413].includes(r.status));}
    assert.equal((await handleMobileRequest(post('auth/review',{email,password},'https://foreign.example'),['auth','review'])).status,403);
    assert.equal((await webReview(new Request('http://127.0.0.1:3102/api/auth/review',{method:'POST',headers:{origin:'https://foreign.example','content-type':'application/json'},body:JSON.stringify({email,password})}))).status,403);
    r=await handleMobileRequest(post('auth/review',{email,password}),['auth','review']);assert.equal(r.status,200);const nativeSession=await r.json();assert.deepEqual(Object.keys(nativeSession).sort(),['access_token','refresh_token']);
    assert.match(r.headers.get('cache-control')||'',/no-store/);
    const get=(path:string)=>new Request('http://127.0.0.1:3102/api/mobile/v1/'+path,{headers:{authorization:'Bearer '+nativeSession.access_token}});
    assert.equal((await nativeIdentityPort.verify(nativeSession.access_token))?.id,id);
    r=await handleMobileRequest(get('session'),['session']);assert.equal(r.status,200);assert.equal((await r.json()).setupRequired,false);
    r=await handleMobileRequest(get('owner/home'),['owner','home']);assert.equal(r.status,200);const home=await r.json();assert.equal(home.shop.id,a.businessId);assert.equal(home.user.email,email);
    const ownerPost=(path:string,body:unknown)=>handleMobileRequest(new Request('http://127.0.0.1:3102/api/mobile/v1/'+path,{method:'POST',headers:{authorization:'Bearer '+nativeSession.access_token,'content-type':'application/json'},body:JSON.stringify(body)}),path.split('/'),{invalidate(){}});
    // The randomized Auth email is private; public publication uses a reserved NANP fixture, never a delivery destination.
    const publicPhone='+12025550123';
    const contacts=Object.fromEntries(Object.keys(home.draft.content.contacts).map(key=>[key,key==='phone'?publicPhone:'']));
    assert.equal(publicationReadiness({...home.draft.content,contacts:{...contacts,email}},[],true).find(check=>check.key==='contacts')?.ready,false,'Private example login email remains ineligible as a public contact');
    assert.equal(publicationReadiness({...home.draft.content,contacts},[],true).find(check=>check.key==='contacts')?.ready,true,'Reserved public SMS fixture satisfies the ordinary contact check');
    r=await ownerPost('owner/page',{action:'save',version:home.draft.version,content:{...home.draft.content,contacts,about:'LOCAL QA reviewer edited this ordinary demo page.'}});assert.equal(r.status,200);const saved=await r.json();assert.equal(saved.content.about,'LOCAL QA reviewer edited this ordinary demo page.');
    assert.deepEqual(saved.content.contacts,contacts,'The saved public page keeps only the selected fixture contact');
    assert.equal(JSON.stringify(saved.content).includes(email),false,'The private login email is absent from saved public page content');
    for(const item of home.shop.products){
      const latest=await (await handleMobileRequest(get('owner/home'),['owner','home'])).json();
      const form=new FormData();form.set('details',JSON.stringify({name:'LOCAL QA offering '+item.id,description:'A reviewed local test offering.',offeringKind:item.kind,priceMinor:item.priceMinor,availability:item.availability,expectedContentVersion:latest.shop.version,idempotencyKey:crypto.randomUUID(),isPublished:true}));
      r=await handleMobileRequest(new Request('http://127.0.0.1:3102/api/mobile/v1/owner/products/'+item.id,{method:'POST',headers:{authorization:'Bearer '+nativeSession.access_token},body:form}),['owner','products',String(item.id)],{invalidate(){}});assert.equal(r.status,200,'Ordinary reviewer product editing works');
    }
    r=await ownerPost('owner/publish',{version:saved.version,revision:home.publicationRevision});const published=await r.json();assert.equal(r.status,200,'The restricted reviewer uses actual normal owner publishing: '+JSON.stringify(published));
    assert.equal((await db.prepare('SELECT status FROM businesses WHERE id=?').get(a.businessId)).status,'active');
    r=await handleMobileRequest(new Request('http://127.0.0.1:3102/api/mobile/v1/shops/'+home.shop.handle),['shops',home.shop.handle]);assert.equal(r.status,200);const publicShop=await r.json();assert.equal(publicShop.about,'LOCAL QA reviewer edited this ordinary demo page.');
    assert.deepEqual(publicShop.contacts,contacts,'Ordinary publication exposes the public fixture contacts');
    assert.equal(JSON.stringify(publicShop).includes(email),false,'The public shop projection never exposes the private reviewer login email');
    assert.equal((await runtimeUserById(a.userId))?.email,email,'Editing public contacts preserves the private account email');
    r=await handleMobileRequest(new Request('http://127.0.0.1:3102/api/mobile/v1/owner/business',{method:'POST',headers:{authorization:'Bearer '+nativeSession.access_token,'content-type':'application/json'},body:JSON.stringify({businessId:b.businessId,name:'Forged cross-tenant edit'})}),['owner','business']);assert.equal(r.status,400);
    assert.equal((await handleMobileRequest(get('owner/products/999999'),['owner','products','999999'])).status,405,'A guessed owner-product GET cannot bypass the owner-home contract');
    await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(a.userId);
    assert.equal((await handleMobileRequest(get('session'),['session'])).status,403,'Fresh staff role cannot use native even with genuine reviewer JWT');
    await assert.rejects(()=>authenticateReviewer(localBinding,reviewerAccounts,reviewerProvider(),{email,password}),ReviewerAccessError);
    await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(a.userId);
    await db.prepare("UPDATE businesses SET status='suspended' WHERE id=?").run(a.businessId);
    await assert.rejects(()=>authenticateReviewer(localBinding,reviewerAccounts,reviewerProvider(),{email,password}),ReviewerAccessError);
    await db.prepare("UPDATE businesses SET status='draft' WHERE id=?").run(a.businessId);
    for(let i=0;i<8;i++){r=await handleMobileRequest(post('auth/review',{email,password:'wrong-local-password'}),['auth','review']);assert.equal(r.status,401);}
    assert.equal((await handleMobileRequest(post('auth/review',{email,password}),['auth','review'])).status,429,'Password throttle does not reset for a denied correct attempt');
    await db.prepare("DELETE FROM rate_limits WHERE key LIKE 'review:mode:%'").run();
    for(let i=0;i<120;i++){
      if(i%20===0)await db.prepare("DELETE FROM rate_limits WHERE key LIKE 'mobile:write:%'").run();
      assert.equal((await handleMobileRequest(post('auth/mode',{email}),['auth','mode'])).status,200);
    }
    assert.equal((await handleMobileRequest(post('auth/mode',{email}),['auth','mode'])).status,429);
    assert.equal((await runtimeUserById(a.userId))?.business_id,a.businessId);
    console.log('PASS reviewer access: pure identity/role/tenant race denial and revocation; real isolated PostgreSQL and local Supabase password/JWT; web mode and native owner/cross-tenant/staff/body/origin/rate/no-store checks.');
  } finally {
    for(const id of providerIds){const removed=await admin.auth.admin.deleteUser(id);assert.equal(removed.error,null,'Local provider fixture cleanup');}
    await closeDbForTests();
    for(const [key,value] of Object.entries({SUQPAGE_AUTH_DRIVER:previous.driver,SUQPAGE_REVIEW_EMAIL:previous.email,SUQPAGE_REVIEW_PROVIDER_ID:previous.id}))if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
}
main().catch(e=>{
  fs.mkdirSync('.local/play-s99',{recursive:true,mode:0o700});
  fs.writeFileSync('.local/play-s99/reviewer-test-failure.json',JSON.stringify({name:e.name,message:e.message,stack:e.stack},null,2),{mode:0o600});
  console.error('Reviewer access regression failed; protected diagnostic saved. '+String(e.stack).split('\n').filter(line=>/^\s+at /.test(line)).slice(0,2).join('\n'));
  process.exitCode=1;
});
