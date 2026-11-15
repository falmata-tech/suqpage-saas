import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {curatedManifestForLegacyDesign} from '../lib/showroom-manifests';
import {enrollDemoScenario,correctDemoProcessMedia,runDemoSimulatorTick,type DemoEnrollmentInput} from '../lib/demo-simulator-runtime';
import {parseDemoProcessMediaCorrection,PROCESS_MEDIA_TARGETS,type DemoProcessMediaCorrection} from '../lib/demo-process-media-correction';
import {runtimeCatalogByBusinessId} from '../lib/catalog-runtime';
import {catalogToRevisionSnapshotV4} from '../lib/revision-v4-defaults';

async function main(){
 const db=await getDb();
 try{
  assert.match(String((await db.prepare('SELECT current_schema() name').get()).name),/^suqpage_test_[a-f0-9]{32}$/);
  assert.equal(PROCESS_MEDIA_TARGETS.length,53);
  const businessId=1,handle='selam-weave',oldRef='youtube:wJV9EDe_sFc',newRef='demo:business-1';
  assert.ok(PROCESS_MEDIA_TARGETS.some(([id,name])=>id===businessId&&name===handle));
  await db.prepare(`INSERT INTO businesses(id,handle,name,design_key,design_manifest_json,status,is_demo,process_video_ref)
   VALUES(?,?,'Synthetic weave example','composition',?,'active',1,?)`).run(businessId,handle,JSON.stringify(curatedManifestForLegacyDesign('novatech')),oldRef);
  await db.prepare(`INSERT INTO businesses(id,handle,name,design_key,design_manifest_json,status,is_demo)
   VALUES(99,'real-workshop','Real workshop','composition',?,'active',0)`).run(JSON.stringify(curatedManifestForLegacyDesign('novatech')));
  const ownerUserId=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES('process@example.test','unused','Process owner','owner',?,0)").run(businessId)).insertedId;
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(ownerUserId);
  const providerUserId=crypto.randomUUID();
  await db.prepare("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,'process@example.test',1)").run(ownerUserId,providerUserId);
  await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'food-farming')").run(businessId);
  const catalogProducts:NonNullable<DemoEnrollmentInput['catalogProducts']>=[];
  for(let index=0;index<4;index++){
   const name=`Example woven item ${index+1}`,kind=index===1?'made_to_order':'standard_product';
   const scenarioKey=index===1?'production-cycle':index===2?'seasonal-harvest':'wholesale-replenishment';
   const productId=(await db.prepare(`INSERT INTO products(business_id,name,slug,description,availability,is_published,
    quantity_unit,price_minor,offering_kind,image_path,video_ref)
    VALUES(?,?,?,'Original product story.','available',1,'',10000,?,'/uploads/seed/benchmarks/green-terrace-farm/product-1.jpg',?)`)
    .run(businessId,name,`product-${index}`,kind,oldRef)).insertedId;
   catalogProducts.push({productId,scenarioKey,initializeUnit:true,parameters:{
    productName:name,productKind:kind,businessCategories:['food-farming'],unit:'items',minimumOrder:1,
    normalCapacity:100,limitedCapacity:20,basePriceMinor:10000}});
  }
  const content=JSON.stringify({template:'profile-v1',coverStyle:'blended',introduction:'Original introduction.',
   about:'Original story.',heroImage:'',videoUrl:'',contacts:{whatsapp:'+19528552202',telegram:'+19528552202'}});
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,updated_by,updated_at) VALUES(?,1,?,?,1)')
   .run(businessId,content,ownerUserId);
  await db.prepare("INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at) VALUES(?,1,1,?,'publish',?,1)")
   .run(businessId,content,ownerUserId);
  const now=1800000000000;
  await enrollDemoScenario({businessId,handle,ownerUserId,providerUserId,productId:catalogProducts[0].productId,
   scenarioKey:'wholesale-replenishment',parameters:catalogProducts[0].parameters,
   expectedContentVersion:1,expectedDraftVersion:1,expectedPageRevision:1,catalogProducts},now);
  const state=async()=>({
   business:await db.prepare('SELECT * FROM businesses WHERE id=?').get(businessId),
   products:await db.prepare('SELECT * FROM products WHERE business_id=? ORDER BY id').all(businessId),
   draft:await db.prepare('SELECT * FROM owner_page_drafts WHERE business_id=?').get(businessId),
   page:await db.prepare('SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision').all(businessId),
   enrollment:await db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(businessId),
   versions:await db.prepare('SELECT * FROM published_catalog_versions WHERE business_id=? ORDER BY content_version').all(businessId),
   audit:await db.prepare('SELECT * FROM audit_logs WHERE business_id=? ORDER BY id').all(businessId),
  });
  const before=await state(),realBefore=await db.prepare('SELECT * FROM businesses WHERE id=99').get();
  const input:DemoProcessMediaCorrection={kind:'process_media_correction',direction:'apply',operationKey:'reviewed_process_0001',
   businessId,handle,ownerUserId,providerUserId,expectedHash:String(before.enrollment.expected_hash),
   expectedContentVersion:Number(before.business.content_version),expectedDraftVersion:Number(before.draft.version),
   expectedPageRevision:Number(before.page.at(-1).revision),expectedStage:Number(before.enrollment.stage),
   expectedCycle:Number(before.enrollment.cycle),expectedDueAt:Number(before.enrollment.due_at),
   processVideoBefore:oldRef,processVideoAfter:newRef};
  assert.deepEqual(parseDemoProcessMediaCorrection(input),input);
  for(const bad of [{...input,businessId:99,handle:'real-workshop'},{...input,handle:'other-showroom'},
   {...input,processVideoAfter:'demo:business-2'},{...input,processVideoBefore:'tiktok:7703762862484851981'},
   {...input,actorUserId:ownerUserId},{...input,direction:'rollback'},{...input,processVideoAfter:'youtube:NJMPGgcDylY'}])
   assert.throws(()=>parseDemoProcessMediaCorrection(bad));
  await db.exec("UPDATE demo_simulator_control SET enabled=1,pause_reason='' WHERE id=1");
  await assert.rejects(()=>correctDemoProcessMedia(input),/Pause/);
  assert.deepEqual(await state(),before);
  await db.exec("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
  await assert.rejects(()=>correctDemoProcessMedia({...input,providerUserId:crypto.randomUUID()}),/eligibility_changed/);
  await assert.rejects(()=>correctDemoProcessMedia({...input,ownerUserId:ownerUserId+1}),/eligibility_changed/);
  await assert.rejects(()=>correctDemoProcessMedia({...input,expectedStage:0}),/content_changed/);
  await assert.rejects(()=>correctDemoProcessMedia({...input,expectedHash:'b'.repeat(64)}),/content_changed/);
  assert.deepEqual(await state(),before);
  const forged=catalogToRevisionSnapshotV4((await runtimeCatalogByBusinessId(businessId,true))!);
  forged.business.processVideoRef='youtube:NJMPGgcDylY';
  await db.prepare("INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,1,?,'baseline',?)")
   .run(businessId,JSON.stringify(forged),ownerUserId);
  const forgedState=await state();
  await assert.rejects(()=>correctDemoProcessMedia(input),/content_changed/);
  assert.deepEqual(await state(),forgedState,'A stale retained baseline must not be silently accepted.');
  await db.prepare('DELETE FROM published_catalog_versions WHERE business_id=? AND content_version=1').run(businessId);
  assert.deepEqual(await state(),before);
  await db.exec(`CREATE FUNCTION fail_process_version() RETURNS trigger LANGUAGE plpgsql AS $$
   BEGIN RAISE EXCEPTION 'Synthetic process version failure'; END; $$;
   CREATE TRIGGER fail_process_version BEFORE INSERT ON published_catalog_versions FOR EACH ROW
   WHEN (NEW.business_id=1 AND NEW.content_version=2) EXECUTE FUNCTION fail_process_version()`);
  await assert.rejects(()=>correctDemoProcessMedia(input),/Synthetic process version failure/);
  assert.deepEqual(await state(),before,'A late history error must roll back the process ref, version, enrollment and audit.');
  await db.exec('DROP TRIGGER fail_process_version ON published_catalog_versions; DROP FUNCTION fail_process_version()');
  await db.prepare('INSERT INTO demo_simulator_requests(business_id,input_json,requested_at) VALUES(?,?,?)').run(businessId,JSON.stringify(input),now);
  assert.equal((await runDemoSimulatorTick(now,1,'maintenance')).mediaCorrected,1);
  assert.equal((await db.prepare('SELECT status FROM demo_simulator_requests WHERE business_id=?').get(businessId)).status,'accepted');
  const after=await state();
  assert.equal(after.business.process_video_ref,newRef);assert.equal(Number(after.business.content_version),2);
  assert.equal(after.versions.length,2);assert.equal(after.versions[0].change_kind,'baseline');
  assert.equal(after.versions[1].change_kind,'publication');
  assert.equal(JSON.parse(String(after.versions[0].snapshot_json)).business.processVideoRef,oldRef);
  assert.equal(JSON.parse(String(after.versions[1].snapshot_json)).business.processVideoRef,newRef);
  assert.deepEqual(after.products,before.products);assert.deepEqual(after.draft,before.draft);assert.deepEqual(after.page,before.page);
  for(const [key,value] of Object.entries(before.enrollment))if(key!=='expected_hash')assert.deepEqual(after.enrollment[key],value,key);
  assert.notEqual(after.enrollment.expected_hash,before.enrollment.expected_hash);
  assert.equal(after.audit.filter((row:{action:string})=>row.action==='demo.process_media_corrected').length,1);
  assert.deepEqual(await db.prepare('SELECT * FROM businesses WHERE id=99').get(),realBefore);
  assert.deepEqual(await correctDemoProcessMedia(input),{duplicate:true});assert.deepEqual(await state(),after);
  await assert.rejects(()=>correctDemoProcessMedia({...input,processVideoBefore:'youtube:NJMPGgcDylY'}),/different reviewed content/);
  await db.exec("UPDATE demo_simulator_control SET enabled=1,pause_reason='' WHERE id=1");
  assert.equal((await runDemoSimulatorTick(now+60000)).advanced,1,'The next ordinary stage must remain available.');
  const advanced=await state();assert.equal(advanced.business.process_video_ref,newRef);
  await db.exec("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
  const rollback:DemoProcessMediaCorrection={...input,direction:'rollback',operationKey:'reviewed_process_inverse_0001',
   expectedHash:String(advanced.enrollment.expected_hash),expectedContentVersion:Number(advanced.business.content_version),
   expectedDraftVersion:Number(advanced.draft.version),expectedPageRevision:Number(advanced.page.at(-1).revision),
   expectedStage:Number(advanced.enrollment.stage),expectedCycle:Number(advanced.enrollment.cycle),
   expectedDueAt:Number(advanced.enrollment.due_at),processVideoBefore:newRef,processVideoAfter:oldRef};
  assert.deepEqual(parseDemoProcessMediaCorrection(rollback),rollback);
  await assert.rejects(()=>correctDemoProcessMedia({...rollback,processVideoAfter:'youtube:NJMPGgcDylY'}),/content_changed/);
  assert.deepEqual(await state(),advanced,'An inverse cannot substitute a different external clip.');
  await correctDemoProcessMedia(rollback);
  const restored=await state();
  assert.equal(restored.business.process_video_ref,oldRef);
  assert.equal(Number(restored.business.content_version),Number(advanced.business.content_version)+1);
  assert.deepEqual(restored.products,advanced.products);assert.deepEqual(restored.draft,advanced.draft);
  assert.deepEqual(restored.page,advanced.page);
  for(const [key,value] of Object.entries(advanced.enrollment))if(key!=='expected_hash')assert.deepEqual(restored.enrollment[key],value,key);
  assert.notEqual(restored.enrollment.expected_hash,advanced.enrollment.expected_hash);
  assert.equal(JSON.parse(String(restored.versions.at(-1).snapshot_json)).business.processVideoRef,oldRef);
  console.log('PASS BE-049 enrolled process media: exact tenant, atomic history, replay, inverse and next-stage continuity.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
