import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {curatedManifestForLegacyDesign} from '../lib/showroom-manifests';
import {enrollDemoScenario,runDemoSimulatorTick,type DemoEnrollmentInput} from '../lib/demo-simulator-runtime';
import {createPostgresPublicClientWorkspace} from '../lib/signup-postgres';
import {findPlaceSuggestions} from '../lib/place-catalog';
import {runtimeCatalogByHandle,runtimeUserById} from '../lib/catalog-runtime';
import {runtimePublishedPage} from '../lib/owner-page-publication-runtime';
import {readPublicShopRevision} from '../lib/public-shop-revision';
import {ownerPagePort} from '../lib/owner-page-runtime';
import {saveOwnerPageAndPublication} from '../lib/owner-page-save-runtime';
import {runtimePublicShowroom} from '../lib/public-showroom-runtime';
import {demoScenarioStage} from '../lib/demo-scenarios';
import {DEMO_SIMULATOR_TABLES} from '../lib/demo-simulator-schema';

async function main(){
 const db=await getDb();
 try{
  const schema=String((await db.prepare('SELECT current_schema() name').get()).name);
  assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
  const make=async(handle:string,demo=1,status='active'):Promise<DemoEnrollmentInput>=>{
   const businessId=(await db.prepare("INSERT INTO businesses(handle,name,design_key,design_manifest_json,status,is_demo) VALUES(?,?,'composition',?,?,?)").run(handle,handle,JSON.stringify(curatedManifestForLegacyDesign('novatech')),status,demo)).insertedId;
   const ownerUserId=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused','Demo fixture','owner',?,0)").run(`${handle}@example.test`,businessId)).insertedId;
   await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(ownerUserId);
   const providerUserId=crypto.randomUUID();
   await db.prepare("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,?,1)").run(ownerUserId,providerUserId,`${handle}@example.test`);
   await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'agriculture-growers')").run(businessId);
   const productId=(await db.prepare(`INSERT INTO products(business_id,name,slug,description,availability,is_published,quantity_unit,price_minor)
    VALUES(?,'Example onions','example-onions','Example wholesale onions.','available',1,'kg',10000)`).run(businessId)).insertedId;
   await db.prepare("INSERT INTO products(business_id,name,slug,description,availability,is_published) VALUES(?,'Example carrots','example-carrots','Another available example product.','available',1)").run(businessId);
   const content=JSON.stringify({template:'profile-v1',coverStyle:'blended',introduction:'A demo growing business.',about:'Original demo business story.',heroImage:'',videoUrl:'',contacts:{whatsapp:'+19528552202',telegram:'+19528552202'}});
   await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,updated_by,updated_at) VALUES(?,1,?,?,1)').run(businessId,content,ownerUserId);
   await db.prepare("INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at) VALUES(?,1,1,?,'publish',?,1)").run(businessId,content,ownerUserId);
   return {businessId,handle,ownerUserId,providerUserId,productId,scenarioKey:'seasonal-harvest',parameters:{productName:'Example onions',productKind:'standard_product',businessCategories:['agriculture-growers'],unit:'kg',minimumOrder:10,normalCapacity:1000,limitedCapacity:200,basePriceMinor:10000}};
  };
  const get=(id:number)=>db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(id);
  const snapshot=async(id:number)=>JSON.stringify({
   business:await db.prepare('SELECT * FROM businesses WHERE id=?').get(id),
   products:await db.prepare('SELECT * FROM products WHERE business_id=? ORDER BY id').all(id),
   drafts:await db.prepare('SELECT * FROM owner_page_drafts WHERE business_id=?').all(id),
   publications:await db.prepare('SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision').all(id),
   catalogs:await db.prepare('SELECT * FROM published_catalog_versions WHERE business_id=? ORDER BY content_version').all(id),
  });
  const start=1800000000000,a=await make('demo-harvest'),real=await make('demo-looking-real',0),unregistered=await make('other-marked-example'),privateDemo=await make('private-example',1,'draft');
  const privateState=async()=>{
   const hashes:Record<string,unknown>={};
   for(const table of ['auth_identity_links','attention_notifications','attention_preferences','attention_subscriptions','attention_deliveries','attention_email_deliveries'])hashes[table]=await db.prepare(`SELECT COUNT(*)::integer total,md5(COALESCE(string_agg(h,'' ORDER BY h),'')) digest FROM (SELECT md5(to_jsonb(t)::text) h FROM ${table} t) rows`).get();
   return hashes;
  };
  const beforePrivate=await privateState();
  const rollback=Error('Restore fixture ledger');
  await assert.rejects(()=>db.runner.transaction(async()=>{
   await db.exec('DELETE FROM schema_migrations WHERE version=82');
   assert.equal((await runDemoSimulatorTick(start)).status,'schema');
   await assert.rejects(()=>enrollDemoScenario(a,start),/schema is not ready/);
   throw rollback;
  }),error=>error===rollback);
  const realBefore=await snapshot(real.businessId),otherBefore=await snapshot(unregistered.businessId),privateBefore=await snapshot(privateDemo.businessId);
  assert.equal((await runDemoSimulatorTick(start)).status,'disabled');
  await assert.rejects(()=>enrollDemoScenario(real,start),/eligibility_changed/);
  await assert.rejects(()=>enrollDemoScenario(privateDemo,start),/eligibility_changed/);
  await assert.rejects(()=>enrollDemoScenario({...a,productId:real.productId},start),/eligibility_changed/);
  await assert.rejects(()=>enrollDemoScenario({...a,providerUserId:crypto.randomUUID()},start),/eligibility_changed/);
  await assert.rejects(()=>enrollDemoScenario({...a,parameters:{...a.parameters,basePriceMinor:500}},start),/content_changed/);
  await enrollDemoScenario(a,start);
  await assert.rejects(()=>enrollDemoScenario(a,start),/duplicate key/);
  await db.exec('UPDATE demo_simulator_control SET enabled=1 WHERE id=1');
  await assert.rejects(()=>enrollDemoScenario(unregistered,start),/Pause the demo service/);
  let now=start;
  for(let index=0;index<6;index++){
   const result=await runDemoSimulatorTick(now);assert.deepEqual(result,{status:'advanced',advanced:1,paused:0,failed:0});
   const progress=await get(a.businessId);assert.equal(progress.stage,index);assert.equal(progress.cycle,0);
   const plan=demoScenarioStage(a.scenarioKey,1,index,a.parameters),catalog=await runtimeCatalogByHandle(a.handle),product=catalog!.products.find(p=>p.id===a.productId)!;
   assert.equal(product.availability,plan.product.availability);assert.equal(product.price_minor,plan.product.priceMinor);assert.equal(product.capacity_summary,plan.product.capacitySummary);
   assert.equal(product.description,plan.productUpdate+'\n\nExample wholesale onions.','Listing descriptions expose each coherent stage while preserving the original product story.');
   assert.match((await runtimePublishedPage(a.businessId))!.introduction,new RegExp(plan.stage.title));
   assert.deepEqual((await runtimePublishedPage(a.businessId))!.contacts,{whatsapp:'+19528552202',telegram:'+19528552202'});
   assert.equal((await runtimePublishedPage(a.businessId))!.about,plan.businessUpdate+'\n\nOriginal demo business story.');
   assert.equal((await runDemoSimulatorTick(now)).status,'duplicate');
   if(index===1)assert.equal(catalog!.business.content_version,3,'Distinct progress summaries publish even when the selling facts are unchanged.');
   now=Number(progress.due_at);
  }
  // Restart/late execution uses durable progress; a day of missed work becomes
  // one stage and the next due time is based on this successful tick.
  now+=86400000;
  assert.equal((await runDemoSimulatorTick(now)).advanced,1);
  assert.equal((await get(a.businessId)).cycle,1);assert.equal(Number((await get(a.businessId)).due_at),now+60000);
  assert.equal(await snapshot(real.businessId),realBefore);assert.equal(await snapshot(unregistered.businessId),otherBefore);assert.equal(await snapshot(privateDemo.businessId),privateBefore);
  // Both overlap outcomes are safe: a busy lock, or a committed duplicate slot.
  now+=60000;const overlap=await Promise.all([runDemoSimulatorTick(now),runDemoSimulatorTick(now)]);
  assert.equal(overlap.reduce((n,r)=>n+r.advanced,0),1);assert.ok(overlap.some(r=>r.status==='busy'||r.status==='duplicate'));
  await db.prepare("UPDATE products SET description='A human edit without a version bump' WHERE id=?").run(a.productId);
  const edited=await snapshot(a.businessId);now+=60000;
  assert.equal((await runDemoSimulatorTick(now)).paused,1);assert.equal((await get(a.businessId)).reason,'content_changed');assert.equal(await snapshot(a.businessId),edited);
  assert.deepEqual(await privateState(),beforePrivate,'The service creates no Auth identity, notification, preference, subscription or delivery.');
  // New public workspaces ignore forged demo fields and receive no enrollment.
  const signup=await createPostgresPublicClientWorkspace(db.runner,{name:'Real Merchant',phone:'+251911234567',businessName:'New Real Business',businessCategory:'agriculture-growers',placeId:findPlaceSuggestions('Hawassa')[0].id,idempotencyKey:'demo-exclusion-signup-0001',consent:true,is_demo:1,isDemo:true},{providerUserId:crypto.randomUUID(),email:'new-real@example.test'});
  assert.equal((await db.prepare('SELECT is_demo FROM businesses WHERE id=?').get(signup.businessId)).is_demo,0);assert.equal(await get(signup.businessId),undefined);
  // Recheck flag/identity/ownership on every stage, not just enrollment.
  for(const kind of ['flag','owner','link','status']){
   await db.exec('UPDATE demo_simulator_control SET enabled=0 WHERE id=1');const e=await make(`demo-drift-${kind}`);await enrollDemoScenario(e,now);
   if(kind==='flag')await db.prepare('UPDATE businesses SET is_demo=0 WHERE id=?').run(e.businessId);
   if(kind==='owner')await db.prepare('UPDATE users SET business_id=NULL WHERE id=?').run(e.ownerUserId);
   if(kind==='link')await db.prepare('DELETE FROM auth_identity_links WHERE user_id=?').run(e.ownerUserId);
   if(kind==='status')await db.prepare("UPDATE businesses SET status='suspended' WHERE id=?").run(e.businessId);
   const before=await snapshot(e.businessId);await db.exec('UPDATE demo_simulator_control SET enabled=1 WHERE id=1');now+=60000;
   assert.equal((await runDemoSimulatorTick(now)).paused,1);assert.equal((await get(e.businessId)).reason,'eligibility_changed');assert.equal(await snapshot(e.businessId),before);
  }
  // Fail after the normal product path has already written history and audit.
  // The savepoint rolls everything back; another due demo can still succeed.
  await db.exec('UPDATE demo_simulator_control SET enabled=0 WHERE id=1');const bad=await make('demo-rollback'),good=await make('demo-continues');
  await enrollDemoScenario(bad,now);await enrollDemoScenario(good,now);const beforeBad=await snapshot(bad.businessId);
  await db.exec(`CREATE FUNCTION fail_demo_publication() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'private simulated failure'; END; $$;
   CREATE TRIGGER fail_demo_publication BEFORE INSERT ON owner_page_publications FOR EACH ROW WHEN (NEW.business_id=${bad.businessId}) EXECUTE FUNCTION fail_demo_publication()`);
  await db.exec('UPDATE demo_simulator_control SET enabled=1 WHERE id=1');now+=60000;
  assert.deepEqual(await runDemoSimulatorTick(now),{status:'advanced',advanced:1,paused:0,failed:1});
  assert.equal(await snapshot(bad.businessId),beforeBad);assert.equal((await get(bad.businessId)).stage,-1);assert.equal((await get(bad.businessId)).reason,'stage_failed');assert.equal((await get(good.businessId)).stage,0);
  assert.equal((await db.prepare("SELECT COUNT(*) total FROM audit_logs WHERE business_id=? AND action='product.basic_upkeep_published'").get(bad.businessId)).total,0);
  await db.exec('DROP TRIGGER fail_demo_publication ON owner_page_publications; DROP FUNCTION fail_demo_publication()');
  // Commit an actual stage between a public reader's catalog queries. The
  // read-only repeatable snapshot must keep old products and old profile together.
  const beforeRead=(await runtimePublicShowroom(good.handle))!;
  let observed!:()=>void,continueRead!:()=>void,hold=true;
  const observedQuery=new Promise<void>(resolve=>{observed=resolve;}),resume=new Promise<void>(resolve=>{continueRead=resolve;});
  const originalQuery=db.runner.query.bind(db.runner);
  db.runner.query=async function<T extends Record<string,unknown>>(sql:string,values:readonly unknown[]=[]){
   const result=await originalQuery<T>(sql,values);
   if(hold&&sql.includes('business_handles WHERE handle=lower')&&values[0]===good.handle){hold=false;observed();await resume;}
   return result;
  };
  const reading=runtimePublicShowroom(good.handle);
  let writeFailure:unknown;
  let barrierTimer:ReturnType<typeof setTimeout>|undefined;
  try{await Promise.race([observedQuery,new Promise<never>((_,reject)=>{barrierTimer=setTimeout(()=>reject(Error('Public snapshot barrier was not reached.')),5000);})]);now+=60000;assert.equal((await runDemoSimulatorTick(now)).advanced,1);}
  catch(error){writeFailure=error;}
  finally{if(barrierTimer)clearTimeout(barrierTimer);continueRead();db.runner.query=originalQuery;}
  const retainedRead=(await reading)!;if(writeFailure)throw writeFailure;
  assert.equal(retainedRead.revision,beforeRead.revision);assert.deepEqual(retainedRead.catalog,beforeRead.catalog);assert.deepEqual(retainedRead.profile,beforeRead.profile);
  const afterRead=(await runtimePublicShowroom(good.handle))!;assert.notEqual(afterRead.revision,beforeRead.revision);assert.notEqual(afterRead.profile.about,beforeRead.profile.about);
  // Budgets stop demo work without deleting or editing merchant history.
  await db.exec('UPDATE demo_simulator_control SET daily_limit=1,used_today=1 WHERE id=1');now+=60000;
  const beforeBudget=await snapshot(good.businessId);assert.equal((await runDemoSimulatorTick(now)).status,'budget');assert.equal(await snapshot(good.businessId),beforeBudget);
  // Exercise the real database-size guard even on a small empty CI database.
  // This disposable-schema relation disables TOAST compression; it is not a
  // provider quota change or a production storage-pressure experiment.
  await db.exec("CREATE TABLE demo_storage_probe(payload TEXT); ALTER TABLE demo_storage_probe ALTER COLUMN payload SET STORAGE EXTERNAL; INSERT INTO demo_storage_probe SELECT repeat(md5(i::text),70) FROM generate_series(1,20000) i");
  assert.ok(Number((await db.prepare('SELECT pg_database_size(current_database()) bytes').get()).bytes)>=33554432);
  await db.exec('UPDATE demo_simulator_control SET used_today=0,database_limit_bytes=33554432 WHERE id=1');assert.equal((await runDemoSimulatorTick(now)).status,'budget');assert.equal((await db.prepare('SELECT enabled FROM demo_simulator_control').get()).enabled,0);
  assert.equal(await snapshot(good.businessId),beforeBudget);
  for(const table of DEMO_SIMULATOR_TABLES){
   assert.equal((await db.prepare('SELECT relrowsecurity FROM pg_class WHERE oid=?::regclass').get(table)).relrowsecurity,true);
   for(const role of ['anon','authenticated','service_role'])if(await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role)){
    for(const permission of ['SELECT','INSERT','UPDATE','DELETE'])assert.equal((await db.prepare('SELECT has_table_privilege(?,?,?) allowed').get(role,`${schema}.${table}`,permission)).allowed,false);
   }
  }
  assert.equal((await db.prepare('SELECT COUNT(*) total FROM inquiries').get()).total,0);
  assert.equal((await db.prepare('SELECT COUNT(*) total FROM demo_simulator_runs WHERE outcome=\'failed\'').get()).total,1);
  const revision=await readPublicShopRevision(unregistered.handle),draft=(await ownerPagePort.read(unregistered.businessId))!,actor=(await runtimeUserById(unregistered.ownerUserId))!;
  const privateDraft=(await ownerPagePort.commit(actor,draft,{kind:'content',content:{...draft.content,introduction:'An unpublished private edit.'}}))!;
  assert.equal(await readPublicShopRevision(unregistered.handle),revision,'Private draft versions are not public activity.');
  const businessVersion=(await runtimeCatalogByHandle(unregistered.handle))!.business.content_version;
  await saveOwnerPageAndPublication(actor,unregistered.businessId,{action:'save',version:privateDraft.version,content:{...privateDraft.content,introduction:'A new public business update.'}});
  assert.notEqual(await readPublicShopRevision(unregistered.handle),revision,'Page-only publication changes the public revision independently.');
  assert.equal((await runtimeCatalogByHandle(unregistered.handle))!.business.content_version,businessVersion);
  assert.equal(await readPublicShopRevision(privateDemo.handle),null);assert.equal(await readPublicShopRevision('missing-example'),null);
  console.log('PASS BE-067 PostgreSQL: coherent normal writes/public reads, real/new/private exclusion, drift, overlap/retry/restart, atomic failure isolation, budgets and private state.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
