import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {curatedManifestForLegacyDesign} from '../lib/showroom-manifests';
import {enrollDemoScenario,correctDemoPublicCopy,runDemoSimulatorTick,type DemoEnrollmentInput} from '../lib/demo-simulator-runtime';
import {parseDemoCopyCorrection,type DemoCopyCorrection} from '../lib/demo-copy-correction-request';
import {demoCatalogStage,parseStoredDemoCatalog} from '../lib/demo-catalog-scenarios';
import {preS200StageUpdates,preS200LeadTimes} from '../lib/demo-scenario-copy-v1-before';
import {runtimeCatalogByBusinessId} from '../lib/catalog-runtime';
import {ownerPagePort} from '../lib/owner-page-runtime';
import {pagePublicationPort} from '../lib/owner-page-publication-runtime';
import {runtimeAll,runtimeGet} from '../lib/runtime-sql';

const digest=(value:unknown)=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function currentHash(businessId:number){
 const catalog=await runtimeCatalogByBusinessId(businessId,true);
 const draft=await ownerPagePort.read(businessId),publication=await pagePublicationPort.latest(businessId);
 const categories=(await runtimeAll<{industry_key:string}>(
  'SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key',[businessId])).map(x=>x.industry_key);
 const location=await runtimeGet('SELECT * FROM owner_location_proposals WHERE business_id=?',[businessId]);
 const discovery=await runtimeGet('SELECT * FROM business_discovery_profiles WHERE business_id=?',[businessId]);
 return digest({catalog,draft,publication:{...publication,content:publication?.content},categories,location,discovery});
}
async function main(){
 const db=await getDb();
 try{
  const businessId=1,handle='selam-weave',businessName='Selam Weave';
  const oldStory='Woven home goods. This fictional Selam Weave showroom is designed for homes and shops.';
  await db.prepare(`INSERT INTO businesses(id,handle,name,description,design_key,design_manifest_json,status,is_demo)
   VALUES(?,?,?,?, 'composition',?,'active',1)`)
   .run(businessId,handle,businessName,oldStory,JSON.stringify(curatedManifestForLegacyDesign('novatech')));
  await db.prepare(`INSERT INTO businesses(id,handle,name,design_key,design_manifest_json,status,is_demo)
   VALUES(99,'real-shop','Real shop','composition',?,'active',0)`)
   .run(JSON.stringify(curatedManifestForLegacyDesign('novatech')));
  const ownerUserId=(await db.prepare(`INSERT INTO users(email,password_hash,name,role,business_id,must_change_password)
   VALUES('copy@example.test','unused','Copy owner','owner',?,0)`).run(businessId)).insertedId;
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(ownerUserId);
  const providerUserId=crypto.randomUUID();
  await db.prepare(`INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at)
   VALUES(?,'supabase',?,'copy@example.test',1)`).run(ownerUserId,providerUserId);
  await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'home-living')").run(businessId);
  const inputs:NonNullable<DemoEnrollmentInput['catalogProducts']>=[];
  for(let index=0;index<4;index++){
   const name=`Woven item ${4-index}`;
   const productId=(await db.prepare(`INSERT INTO products(business_id,name,slug,description,availability,is_published,
    quantity_unit,price_minor,offering_kind,image_path)
    VALUES(?,?,?,'Original item story.','available',1,'',10000,'standard_product',
    '/uploads/seed/benchmarks/green-terrace-farm/product-1.jpg')`)
    .run(businessId,name,`item-${index}`)).insertedId;
   inputs.push({productId,scenarioKey:'wholesale-replenishment',initializeUnit:true,parameters:{
    productName:name,productKind:'standard_product',businessCategories:['home-living'],unit:'items',
    minimumOrder:1,normalCapacity:100,limitedCapacity:20,basePriceMinor:10000}});
  }
  const content=JSON.stringify({template:'profile-v1',coverStyle:'blended',introduction:'Original introduction.',
   about:oldStory,heroImage:'',videoUrl:'',contacts:{email:'copy@example.com',website:'https://example.com/'}});
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,updated_by,updated_at) VALUES(?,1,?,?,1)')
   .run(businessId,content,ownerUserId);
  await db.prepare(`INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at)
   VALUES(?,1,1,?,'publish',?,1)`).run(businessId,content,ownerUserId);
  const now=1800000000000;
  await enrollDemoScenario({businessId,handle,ownerUserId,providerUserId,productId:inputs[0].productId,
   scenarioKey:'wholesale-replenishment',parameters:inputs[0].parameters,catalogProducts:inputs,
   expectedContentVersion:1,expectedDraftVersion:1,expectedPageRevision:1},now);
  await db.exec("UPDATE demo_simulator_control SET enabled=1,pause_reason='' WHERE id=1");
  assert.equal((await runDemoSimulatorTick(now)).advanced,1);
  await db.exec("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
  // A disposable fixture recreates the exact pre-S200 stage copy at the same
  // current versions. Production enrollment hashes are never rewritten this way.
  const enrolled=await db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(businessId);
  const bindings=parseStoredDemoCatalog(String(enrolled.catalog_products_json));
  const plans=demoCatalogStage(bindings,Number(enrolled.stage));
  for(const {binding,plan} of plans){
   const oldUpdate=preS200StageUpdates[binding.scenarioKey][
    (Number(enrolled.stage)+binding.phaseOffset)%6];
   await db.prepare('UPDATE products SET description=?,lead_time_summary=? WHERE id=?')
    .run(`${oldUpdate}\n\n${binding.baselineDescription}`,
     preS200LeadTimes[plan.product.leadTimeSummary]??plan.product.leadTimeSummary,binding.productId);
  }
  const primary=plans[0],oldStatus=`${primary.binding.parameters.productName}: ${preS200StageUpdates[
   primary.binding.scenarioKey][Number(enrolled.stage)]}`;
  const currentPage=JSON.parse(String((await db.prepare(
   'SELECT content_json FROM owner_page_drafts WHERE business_id=?').get(businessId)).content_json));
  const oldPage={...currentPage,introduction:`${primary.plan.stage.title}. ${oldStatus}`,
   about:`${oldStatus}\n\n${oldStory}`};
  await db.prepare('UPDATE owner_page_drafts SET content_json=? WHERE business_id=?')
   .run(JSON.stringify(oldPage),businessId);
  await db.prepare('UPDATE owner_page_publications SET content_json=? WHERE business_id=? AND revision=?')
   .run(JSON.stringify(oldPage),businessId,Number((await db.prepare(
    'SELECT max(revision) revision FROM owner_page_publications WHERE business_id=?').get(businessId)).revision));
  await db.prepare('UPDATE demo_simulator_enrollments SET expected_hash=? WHERE business_id=?')
   .run(await currentHash(businessId),businessId);
  const state=async()=>({
   business:await db.prepare('SELECT * FROM businesses WHERE id=?').get(businessId),
   products:await db.prepare('SELECT * FROM products WHERE business_id=? ORDER BY id').all(businessId),
   draft:await db.prepare('SELECT * FROM owner_page_drafts WHERE business_id=?').get(businessId),
   page:await db.prepare('SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision').all(businessId),
   enrollment:await db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(businessId),
   history:await db.prepare('SELECT * FROM published_catalog_versions WHERE business_id=? ORDER BY content_version').all(businessId),
  });
  const before=await state(),realBefore=await db.prepare('SELECT * FROM businesses WHERE id=99').get();
  const input:DemoCopyCorrection={kind:'copy_correction',direction:'apply',operationKey:'s200_copy_selam_1',
   businessId,handle,cohort:'enrolled',expectedHash:String(before.enrollment.expected_hash),
   expectedContentVersion:Number(before.business.content_version),
   expectedDraftVersion:Number(before.draft.version),
   expectedPageRevision:Number(before.page.at(-1).revision),
   expectedStage:Number(before.enrollment.stage),expectedCycle:Number(before.enrollment.cycle),
   expectedDueAt:Number(before.enrollment.due_at)};
  assert.deepEqual(parseDemoCopyCorrection(input),input);
  assert.throws(()=>parseDemoCopyCorrection({...input,businessId:99}),/Invalid reviewed/);
  await db.exec("UPDATE demo_simulator_control SET enabled=1,pause_reason='' WHERE id=1");
  await assert.rejects(()=>correctDemoPublicCopy(input),/Pause/);
  await db.exec("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
  await assert.rejects(()=>correctDemoPublicCopy({...input,expectedHash:'b'.repeat(64)}),/content_changed/);
  assert.deepEqual(await state(),before);
  await correctDemoPublicCopy(input);
  const after=await state();
  assert.equal(after.business.description,'Woven home goods. For homes and shops.');
  assert.ok(after.products.every((p:{description:string})=>!p.description.includes('example')));
  assert.ok(after.page.length===before.page.length+1);
  assert.ok(!String(after.page.at(-1).content_json).includes('fictional'));
  assert.ok(!String(after.page.at(-1).content_json).includes('example batch'));
  assert.equal(JSON.parse(String(after.enrollment.baseline_page_json)).about,
   'Woven home goods. For homes and shops.');
  const selectedAudit=JSON.parse(String((await db.prepare(`SELECT detail FROM audit_logs
   WHERE business_id=? AND action='demo.copy_corrected' ORDER BY id DESC LIMIT 1`).get(businessId)).detail));
  assert.deepEqual(selectedAudit.afterPublic,{
   businessDescription:after.business.description,
   page:{about:JSON.parse(String(after.page.at(-1).content_json)).about,
    introduction:JSON.parse(String(after.page.at(-1).content_json)).introduction},
   products:after.products.map((p:{id:number;description:string;lead_time_summary:string})=>({
    id:p.id,description:p.description,leadTimeSummary:p.lead_time_summary||''})).sort((a:{id:number},b:{id:number})=>a.id-b.id),
  });
  assert.notEqual(after.enrollment.expected_hash,before.enrollment.expected_hash);
  for(const key of ['stage','cycle','due_at','status','reason','catalog_products_json'])
   assert.deepEqual(after.enrollment[key],before.enrollment[key],key);
  assert.deepEqual(await db.prepare('SELECT * FROM businesses WHERE id=99').get(),realBefore);
  assert.deepEqual(await correctDemoPublicCopy(input),{duplicate:true});
  const inverse:DemoCopyCorrection={...input,direction:'rollback',
   operationKey:'s200_copy_selam_inverse_1',
   expectedHash:String(after.enrollment.expected_hash),
   expectedContentVersion:Number(after.business.content_version),
   expectedDraftVersion:Number(after.draft.version),
   expectedPageRevision:Number(after.page.at(-1).revision)};
  await correctDemoPublicCopy(inverse);
  const restored=await state();
  assert.equal(restored.business.description,before.business.description);
  assert.deepEqual(restored.products.map((p:{description:string;lead_time_summary:string})=>
   [p.description,p.lead_time_summary]),before.products.map((p:{description:string;lead_time_summary:string})=>
   [p.description,p.lead_time_summary]));
  assert.equal(JSON.parse(String(restored.page.at(-1).content_json)).about,oldPage.about);
  assert.equal(JSON.parse(String(restored.enrollment.baseline_page_json)).about,oldStory);
  for(const key of ['stage','cycle','due_at','status','reason'])
   assert.deepEqual(restored.enrollment[key],before.enrollment[key],key);
  const reapply:DemoCopyCorrection={...input,operationKey:'s200_copy_selam_reapply_1',
   expectedHash:String(restored.enrollment.expected_hash),
   expectedContentVersion:Number(restored.business.content_version),
   expectedDraftVersion:Number(restored.draft.version),
   expectedPageRevision:Number(restored.page.at(-1).revision)};
  await correctDemoPublicCopy(reapply);
  await db.exec("UPDATE demo_simulator_control SET enabled=1,pause_reason='' WHERE id=1");
  assert.equal((await runDemoSimulatorTick(now+60000)).advanced,1,
   'The simulator must advance after the copy correction.');
  const advanced=await state();
  assert.equal(advanced.enrollment.status,'active');
  await db.exec("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
  const legacyId=50,legacyHandle='demo-dara-clay-works';
  const legacyStory='Clay forms for home. This fictional Dara Clay Works showroom is designed for homes and cafes.';
  await db.prepare(`INSERT INTO businesses(id,handle,name,description,design_key,design_manifest_json,status,is_demo)
   VALUES(? ,?,'Dara Clay Works',?,'composition',?,'active',1)`)
   .run(legacyId,legacyHandle,legacyStory,JSON.stringify(curatedManifestForLegacyDesign('novatech')));
  const adminId=(await db.prepare(`INSERT INTO users(email,password_hash,name,role,must_change_password)
   VALUES('copy-admin@example.test','unused','Copy admin','admin',0)`).run()).insertedId;
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(adminId);
  for(let index=0;index<4;index++)await db.prepare(`INSERT INTO products
   (id,business_id,name,slug,description,availability,is_published,offering_kind,image_path)
   VALUES(?,?,?,?,?,'available',1,'standard_product',
   '/uploads/seed/benchmarks/green-terrace-farm/product-1.jpg')`)
   .run(197+index,legacyId,`Clay item ${index+1}`,`clay-item-${index+1}`,'Original clay item.');
  const legacyPage=JSON.stringify({template:'profile-v1',coverStyle:'blended',
   introduction:'Browse clay pieces.',about:legacyStory,heroImage:'',videoUrl:'',
   contacts:{email:'dara@example.com',website:'https://example.com/'}});
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,updated_by,updated_at) VALUES(?,1,?,?,1)')
   .run(legacyId,legacyPage,adminId);
  await db.prepare(`INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at)
   VALUES(?,1,1,?,'publish',?,1)`).run(legacyId,legacyPage,adminId);
  const legacyInput:DemoCopyCorrection={kind:'copy_correction',direction:'apply',
   operationKey:'s200_copy_dara_1',businessId:legacyId,handle:legacyHandle,cohort:'legacy',
   expectedContentVersion:1,expectedDraftVersion:1,expectedPageRevision:1};
  const legacyBefore=await db.prepare('SELECT * FROM products WHERE business_id=? ORDER BY id').all(legacyId);
  await correctDemoPublicCopy(legacyInput);
  const legacyBusiness=await db.prepare('SELECT * FROM businesses WHERE id=?').get(legacyId);
  const legacyDraft=await db.prepare('SELECT * FROM owner_page_drafts WHERE business_id=?').get(legacyId);
  const legacyPublication=await db.prepare('SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision DESC LIMIT 1').get(legacyId);
  assert.equal(legacyBusiness.description,'Clay forms for home. For homes and cafes.');
  assert.equal(JSON.parse(String(legacyPublication.content_json)).about,legacyBusiness.description);
  assert.equal(JSON.parse(String(legacyDraft.content_json)).about,legacyBusiness.description);
  assert.deepEqual(await db.prepare('SELECT * FROM products WHERE business_id=? ORDER BY id').all(legacyId),legacyBefore);
  assert.equal((await db.prepare('SELECT count(*) n FROM demo_simulator_enrollments WHERE business_id=?').get(legacyId)).n,0);
  assert.deepEqual(await correctDemoPublicCopy(legacyInput),{duplicate:true});
  const legacyInverse:DemoCopyCorrection={...legacyInput,direction:'rollback',
   operationKey:'s200_copy_dara_inverse_1',
   expectedContentVersion:Number(legacyBusiness.content_version),
   expectedDraftVersion:Number(legacyDraft.version),
   expectedPageRevision:Number(legacyPublication.revision)};
  await correctDemoPublicCopy(legacyInverse);
  assert.equal((await db.prepare('SELECT description FROM businesses WHERE id=?').get(legacyId)).description,legacyStory);
  const legacyNow={
   business:await db.prepare('SELECT * FROM businesses WHERE id=?').get(legacyId),
   draft:await db.prepare('SELECT * FROM owner_page_drafts WHERE business_id=?').get(legacyId),
   page:await db.prepare('SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision DESC LIMIT 1').get(legacyId),
  };
  const legacyReapply:DemoCopyCorrection={...legacyInput,operationKey:'s200_copy_dara_reapply_1',
   expectedContentVersion:Number(legacyNow.business.content_version),
   expectedDraftVersion:Number(legacyNow.draft.version),
   expectedPageRevision:Number(legacyNow.page.revision)};
  await db.exec(`CREATE FUNCTION fail_copy_audit() RETURNS trigger LANGUAGE plpgsql AS $$
   BEGIN RAISE EXCEPTION 'Synthetic copy audit failure'; END; $$;
   CREATE TRIGGER fail_copy_audit BEFORE INSERT ON audit_logs FOR EACH ROW
   WHEN (NEW.business_id=50 AND NEW.action='demo.copy_corrected') EXECUTE FUNCTION fail_copy_audit()`);
  await assert.rejects(()=>correctDemoPublicCopy(legacyReapply),/Synthetic copy audit failure/);
  assert.deepEqual(await db.prepare('SELECT * FROM businesses WHERE id=?').get(legacyId),legacyNow.business);
  assert.deepEqual(await db.prepare('SELECT * FROM owner_page_drafts WHERE business_id=?').get(legacyId),legacyNow.draft);
  assert.deepEqual(await db.prepare('SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision DESC LIMIT 1').get(legacyId),legacyNow.page);
  await db.exec('DROP TRIGGER fail_copy_audit ON audit_logs; DROP FUNCTION fail_copy_audit()');
  await db.prepare('INSERT INTO demo_simulator_requests(business_id,input_json,requested_at) VALUES(?,?,?)')
   .run(legacyId,JSON.stringify(legacyReapply),now+120000);
  assert.equal((await runDemoSimulatorTick(now+120000)).copyCorrected,1);
  assert.equal((await db.prepare('SELECT status FROM demo_simulator_requests WHERE business_id=?').get(legacyId)).status,'accepted');
  const accepted=await db.prepare('SELECT * FROM businesses WHERE id=?').get(legacyId);
  const stale={...legacyInput,operationKey:'s200_copy_dara_stale_1'};
  await db.prepare(`UPDATE demo_simulator_requests SET input_json=?,status='pending',reason='',processed_at=0
   WHERE business_id=?`).run(JSON.stringify(stale),legacyId);
  assert.equal((await runDemoSimulatorTick(now+180000)).enrollmentRejected,1);
  assert.equal((await db.prepare('SELECT status FROM demo_simulator_requests WHERE business_id=?').get(legacyId)).status,'rejected');
  assert.deepEqual(await db.prepare('SELECT * FROM businesses WHERE id=?').get(legacyId),accepted);
  const rejection=await db.prepare(`SELECT detail FROM audit_logs WHERE business_id=? AND action='demo.copy_rejected'
   ORDER BY id DESC LIMIT 1`).get(legacyId);
  assert.deepEqual(JSON.parse(String(rejection.detail)),{automation:'demo-copy-maintenance',
   operationKey:stale.operationKey,phase:'reviewed_before',code:'content_changed'});
  console.log('PASS S200 copy: enrolled/legacy exact text, retained writes, replay, inverse, late rollback, queue rejection and next-stage continuity.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
