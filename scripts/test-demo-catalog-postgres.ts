import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {curatedManifestForLegacyDesign} from '../lib/showroom-manifests';
import {enrollDemoScenario,runDemoSimulatorTick,correctDemoMedia,type DemoEnrollmentInput} from '../lib/demo-simulator-runtime';
import {runtimeCatalogByHandle,runtimeUserById} from '../lib/catalog-runtime';
import {executeProductUpkeepBatch,executeBasicProductUpkeep} from '../lib/product-upkeep';
import {postgresProductUpkeepPort} from '../lib/product-upkeep-postgres';
import {parseOfferingHighlightsJson} from '../lib/offering-presentation';
import {parseStoredDemoCatalog,demoCatalogStage,type DemoCatalogProductInput} from '../lib/demo-catalog-scenarios';
import {productMedia} from '../lib/product-media';
import type {DemoMediaCorrection} from '../lib/demo-media-correction';

async function main(){
 const started=Date.now(),db=await getDb();
 try{
  assert.match(String((await db.prepare('SELECT current_schema() name').get()).name),/^suqpage_test_[a-f0-9]{32}$/);
  const make=async(handle:string,demo=1,status='active'):Promise<DemoEnrollmentInput>=>{
   const businessId=(await db.prepare("INSERT INTO businesses(handle,name,design_key,design_manifest_json,status,is_demo) VALUES(?,?,'composition',?,?,?)").run(handle,handle,JSON.stringify(curatedManifestForLegacyDesign('novatech')),status,demo)).insertedId;
   const ownerUserId=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused','Demo catalog fixture','owner',?,0)").run(`${handle}@example.test`,businessId)).insertedId;
   await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(ownerUserId);
   const providerUserId=crypto.randomUUID();await db.prepare("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,?,1)").run(ownerUserId,providerUserId,`${handle}@example.test`);
   await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'food-farming')").run(businessId);
   const catalogProducts:DemoCatalogProductInput[]=[];
   for(let index=0;index<4;index++){
    const kind=index===1?'made_to_order':'standard_product',scenarioKey=index===1?'production-cycle':index===2?'seasonal-harvest':'wholesale-replenishment';
    const name=['Example pantry batch','Example custom mixer','Example field harvest','Example packaged blend'][index],unit=['boxes','mixers','crates','packs'][index];
    const productId=(await db.prepare(`INSERT INTO products(business_id,name,slug,description,availability,is_published,quantity_unit,price_minor,offering_kind,image_path,video_ref)
     VALUES(?,?,?,?,'available',1,'',10000,?,'/uploads/seed/benchmarks/green-terrace-farm/product-1.jpg','youtube:wJV9EDe_sFc')`).run(businessId,name,`product-${index}`,`Original product story ${index}.`,kind)).insertedId;
    catalogProducts.push({productId,scenarioKey,initializeUnit:true,parameters:{productName:name,productKind:kind,businessCategories:['food-farming'],unit,minimumOrder:1,normalCapacity:100,limitedCapacity:20,basePriceMinor:10000}});
   }
   const content=JSON.stringify({template:'profile-v1',coverStyle:'blended',introduction:'Original demo introduction.',about:'Original demo business story.',heroImage:'',videoUrl:'',contacts:{whatsapp:'+19528552202',telegram:'+19528552202'}});
   await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,updated_by,updated_at) VALUES(?,1,?,?,1)').run(businessId,content,ownerUserId);
   await db.prepare("INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at) VALUES(?,1,1,?,'publish',?,1)").run(businessId,content,ownerUserId);
   return {businessId,handle,ownerUserId,providerUserId,productId:catalogProducts[0].productId,scenarioKey:catalogProducts[0].scenarioKey,parameters:catalogProducts[0].parameters,
    expectedContentVersion:1,expectedDraftVersion:1,expectedPageRevision:1,catalogProducts};
  };
  const snapshot=async(id:number)=>JSON.stringify({business:await db.prepare('SELECT * FROM businesses WHERE id=?').get(id),
   products:await db.prepare('SELECT * FROM products WHERE business_id=? ORDER BY id').all(id),drafts:await db.prepare('SELECT * FROM owner_page_drafts WHERE business_id=?').all(id),
   publications:await db.prepare('SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision').all(id),
   catalogs:await db.prepare('SELECT * FROM published_catalog_versions WHERE business_id=? ORDER BY content_version').all(id),
   commands:await db.prepare('SELECT * FROM product_upkeep_commands WHERE business_id=? ORDER BY idempotency_key').all(id),
   audit:await db.prepare('SELECT * FROM audit_logs WHERE business_id=? ORDER BY id').all(id)});
  const privateHash=async()=>{const rows=[];for(const table of ['auth_identity_links','attention_notifications','attention_preferences','attention_subscriptions','attention_deliveries','attention_email_deliveries'])rows.push(await db.prepare(`SELECT md5(COALESCE(string_agg(h,'' ORDER BY h),'')) digest FROM (SELECT md5(to_jsonb(t)::text) h FROM ${table} t) x`).get());return JSON.stringify(rows);};
  const batch=await make('catalog-batch-proof'),real=await make('catalog-real-proof',0),privateDemo=await make('catalog-private-proof',1,'draft');
  const actor=(await runtimeUserById(batch.ownerUserId))!;
  const catalog=(await runtimeCatalogByHandle(batch.handle))!;
  const commands=catalog.products.map(p=>({kind:'update',businessId:batch.businessId,productId:p.id,expectedContentVersion:catalog.business.content_version,
   idempotencyKey:`batch_proof_product_${p.id}`,name:p.name,description:p.description+' Updated.',availability:'limited',offeringKind:p.offering_kind,
   quantityMode:p.quantity_mode,orderScope:p.order_scope??'unspecified',priceMinor:p.price_minor,quantityUnit:'items',highlights:parseOfferingHighlightsJson(p.highlights_json),
   capacitySummary:'Up to 20 items per week',minimumOrderSummary:'1 items',leadTimeSummary:'New orders: 10–14 working days',videoRef:p.video_ref,categoryId:p.category_id,
   imageAction:'keep',preserveMetadata:true,updateSellingFacts:true,updateListingState:true}));
  const beforeBad=await snapshot(batch.businessId),beforeReal=await snapshot(real.businessId);
  await assert.rejects(()=>executeProductUpkeepBatch(postgresProductUpkeepPort,actor,[...commands.slice(0,3),{...commands[3],productId:real.productId}]),/Product not found/);
  assert.equal(await snapshot(batch.businessId),beforeBad,'A late foreign member rolls back previous product/history/audit writes.');assert.equal(await snapshot(real.businessId),beforeReal);
  await assert.rejects(()=>executeProductUpkeepBatch(postgresProductUpkeepPort,actor,[commands[0],commands[0]]),/distinct/);
  const results=await executeProductUpkeepBatch(postgresProductUpkeepPort,actor,commands);
  assert.equal(results.length,4);assert.ok(results.every(r=>r.contentVersion===2&&!r.duplicate));
  assert.equal((await db.prepare("SELECT count(*) total FROM published_catalog_versions WHERE business_id=? AND change_kind='product_upkeep'").get(batch.businessId)).total,1);
  const completed=await snapshot(batch.businessId),replay=await executeProductUpkeepBatch(postgresProductUpkeepPort,actor,commands);
  assert.ok(replay.every(r=>r.duplicate));assert.equal(await snapshot(batch.businessId),completed);
  await assert.rejects(()=>executeProductUpkeepBatch(postgresProductUpkeepPort,actor,[{...commands[0],description:'Conflicting replay'},...commands.slice(1)]),/different or partial/);
  await assert.rejects(()=>executeProductUpkeepBatch(postgresProductUpkeepPort,actor,commands.map(c=>({...c,idempotencyKey:c.idempotencyKey+'_stale'}))),/changed while/);
  const partial=await make('catalog-partial-proof'),partialActor=(await runtimeUserById(partial.ownerUserId))!;
  const partialCatalog=(await runtimeCatalogByHandle(partial.handle))!,partialCommands=partialCatalog.products.map((p,i)=>({...commands[i],businessId:partial.businessId,productId:p.id,name:p.name,description:p.description,idempotencyKey:`partial_product_${p.id}`}));
  await executeBasicProductUpkeep(postgresProductUpkeepPort,partialActor,partialCommands[0],null);
  const partialBefore=await snapshot(partial.businessId);await assert.rejects(()=>executeProductUpkeepBatch(postgresProductUpkeepPort,partialActor,partialCommands),/different or partial/);assert.equal(await snapshot(partial.businessId),partialBefore);
  const nowStart=1800000000000,fixtures:DemoEnrollmentInput[]=[];
  for(let i=0;i<64;i++)fixtures.push(await make(`catalog-full-${String(i).padStart(2,'0')}`));
  // Promote a running legacy canary without resetting progress or retaining its
  // generated prefix as the original story for future full-catalog stages.
  await enrollDemoScenario({...fixtures[0],catalogProducts:undefined,initializeUnit:true},nowStart);
  await db.exec('UPDATE demo_simulator_control SET enabled=1 WHERE id=1');assert.equal((await runDemoSimulatorTick(nowStart)).advanced,1);
  await db.exec('UPDATE demo_simulator_control SET enabled=0 WHERE id=1');
  const promotedCatalog=(await runtimeCatalogByHandle(fixtures[0].handle))!;
  const promotedVersions=await db.prepare('SELECT d.version,(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=d.business_id) revision FROM owner_page_drafts d WHERE business_id=?').get(fixtures[0].businessId);
  fixtures[0]={...fixtures[0],expectedContentVersion:promotedCatalog.business.content_version,expectedDraftVersion:Number(promotedVersions.version),expectedPageRevision:Number(promotedVersions.revision)};
  const realBefore=await snapshot(real.businessId),privateBefore=await snapshot(privateDemo.businessId),privateState=await privateHash();
  await assert.rejects(()=>enrollDemoScenario(real,nowStart),/eligibility_changed/);await assert.rejects(()=>enrollDemoScenario(privateDemo,nowStart),/eligibility_changed/);
  const wrong={...fixtures[0],catalogProducts:[...fixtures[0].catalogProducts!.slice(0,3),{...fixtures[0].catalogProducts![3],productId:real.productId}]};
  await assert.rejects(()=>enrollDemoScenario(wrong,nowStart));
  for(const input of fixtures)await enrollDemoScenario(input,nowStart);
  const extra=await make('catalog-over-limit');await assert.rejects(()=>enrollDemoScenario(extra,nowStart),/limit/);
  // The extra fixture adds a legitimate synthetic link; freeze private rows now.
  const privateAfterExtra=await privateHash();assert.notEqual(privateAfterExtra,privateState);
  assert.equal((await db.prepare('SELECT count(*) total FROM demo_simulator_enrollments').get()).total,64);
  const galleries=new Map<number,ReturnType<typeof productMedia>>();for(const input of fixtures)for(const p of (await runtimeCatalogByHandle(input.handle))!.products)galleries.set(p.id,productMedia(p));
  await db.exec('UPDATE demo_simulator_control SET enabled=1 WHERE id=1');let now=nowStart+60000,ticks=0,stages=0;
  while(true){
   const result=await runDemoSimulatorTick(now);assert.ok(result.advanced>=1&&result.advanced<=2);assert.equal(result.failed,0);assert.equal(result.paused,0);stages+=result.advanced;ticks++;
   const remaining=await db.prepare('SELECT count(*) total FROM demo_simulator_enrollments WHERE cycle=0 AND stage<5').get();
   if(!remaining.total)break;
   assert.ok(ticks<400,'Oldest-due rotation covers every reviewed business without starvation.');now+=60000;
  }
  const covered=new Set<number>();
  for(const input of fixtures){
   const state=await db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(input.businessId),bindings=parseStoredDemoCatalog(String(state.catalog_products_json));
   assert.equal(bindings.length,4);assert.ok(Number(state.cycle)>=0&&Number(state.stage)>=0);
   const plans=demoCatalogStage(bindings,Number(state.stage)),actual=(await runtimeCatalogByHandle(input.handle))!;
   for(const {binding,plan} of plans){const product=actual.products.find(p=>p.id===binding.productId)!;covered.add(product.id);
    assert.equal(product.availability,plan.product.availability);assert.equal(product.price_minor,plan.product.priceMinor);assert.equal(product.quantity_unit,plan.product.quantityUnit);
    assert.equal(product.description,plan.productUpdate+'\n\n'+binding.baselineDescription);assert.equal(product.capacity_summary,plan.product.capacitySummary);assert.equal(product.lead_time_summary,plan.product.leadTimeSummary);
    assert.deepEqual(productMedia(product),galleries.get(product.id));
   }
   const advances=Number(state.cycle)*6+Number(state.stage)+1;
   const promoted=input.businessId===fixtures[0].businessId;
   assert.ok(advances>=6);assert.equal(actual.business.content_version,1+advances+Number(promoted));
   assert.equal((await db.prepare("SELECT count(*) total FROM published_catalog_versions WHERE business_id=? AND change_kind='product_upkeep'").get(input.businessId)).total,advances+Number(promoted),'One catalog publication per whole-catalog stage, plus only the legacy unit preparation.');
   assert.equal((await db.prepare('SELECT count(*) total FROM owner_page_publications WHERE business_id=?').get(input.businessId)).total,advances+1);
   assert.equal((await db.prepare("SELECT count(*) total FROM audit_logs WHERE business_id=? AND action='product.basic_upkeep_published'").get(input.businessId)).total,promoted?2+(advances-1)*4:advances*4);
  }
  assert.equal(covered.size,256);assert.equal(await snapshot(real.businessId),realBefore);assert.equal(await snapshot(privateDemo.businessId),privateBefore);assert.equal(await privateHash(),privateAfterExtra);
  // Finite operator media repair uses ordinary publications without re-enrollment
  // or resetting any live scenario progress. Provider IDs here are fixtures;
  // external playback is separately qualified in FE-061.
  const mediaTarget=fixtures[0],mediaCatalog=(await runtimeCatalogByHandle(mediaTarget.handle))!;
  const mediaEnrollment=await db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(mediaTarget.businessId);
  const mediaVersions=await db.prepare('SELECT d.version,(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=d.business_id) revision FROM owner_page_drafts d WHERE business_id=?').get(mediaTarget.businessId);
  const correction:DemoMediaCorrection={kind:'media_correction',operationKey:'catalog_media_test_01',businessId:mediaTarget.businessId,handle:mediaTarget.handle,
   ownerUserId:mediaTarget.ownerUserId,providerUserId:mediaTarget.providerUserId,expectedHash:String(mediaEnrollment.expected_hash),
   expectedContentVersion:mediaCatalog.business.content_version,expectedDraftVersion:Number(mediaVersions.version),expectedPageRevision:Number(mediaVersions.revision),
   coverBefore:'',coverVideoRef:'youtube:EBrvynBWYzY',products:mediaCatalog.products.map(p=>({productId:p.id,beforeMedia:productMedia(p),
    afterMedia:productMedia(p).map(m=>m.kind==='video'?{kind:'video' as const,ref:'youtube:EBrvynBWYzY'}:m)})).sort((a,b)=>a.productId-b.productId)};
  await assert.rejects(()=>correctDemoMedia(correction),/Pause/);
  await db.exec("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
  const mediaBefore=await snapshot(mediaTarget.businessId);
  for(const invalid of [
   {...correction,providerUserId:crypto.randomUUID()},
   {...correction,businessId:real.businessId},
   {...correction,expectedContentVersion:correction.expectedContentVersion-1},
   {...correction,expectedHash:'0'.repeat(64)},
   {...correction,products:[...correction.products.slice(0,3),{...correction.products[3],productId:real.productId}]},
   {...correction,products:correction.products.map(p=>({...p,beforeMedia:p.beforeMedia.map(m=>m.kind==='video'?{kind:'video' as const,ref:'youtube:NJMPGgcDylY'}:m)}))},
  ]){await assert.rejects(()=>correctDemoMedia(invalid));assert.equal(await snapshot(mediaTarget.businessId),mediaBefore);}
  await db.exec(`CREATE FUNCTION fail_demo_media_page() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic late media failure'; END; $$;
   CREATE TRIGGER fail_demo_media_page BEFORE INSERT ON owner_page_publications FOR EACH ROW WHEN (NEW.business_id=${mediaTarget.businessId}) EXECUTE FUNCTION fail_demo_media_page()`);
  await assert.rejects(()=>correctDemoMedia(correction),/Synthetic late media failure/);
  assert.equal(await snapshot(mediaTarget.businessId),mediaBefore);assert.deepEqual(await db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(mediaTarget.businessId),mediaEnrollment);
  await db.exec('DROP TRIGGER fail_demo_media_page ON owner_page_publications; DROP FUNCTION fail_demo_media_page()');
  await db.prepare('INSERT INTO demo_simulator_requests(business_id,input_json,requested_at) VALUES(?,?,?)').run(mediaTarget.businessId,JSON.stringify(correction),now);
  assert.equal((await runDemoSimulatorTick(now)).mediaCorrected,1);
  assert.equal((await db.prepare('SELECT status FROM demo_simulator_requests WHERE business_id=?').get(mediaTarget.businessId)).status,'accepted');
  const mediaAfter=await snapshot(mediaTarget.businessId),ack=await db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(mediaTarget.businessId);
  assert.notEqual(ack.expected_hash,mediaEnrollment.expected_hash);
  for(const [key,value] of Object.entries(mediaEnrollment))if(!['expected_hash','baseline_page_json'].includes(key))assert.deepEqual(ack[key],value,key);
  const oldPage=JSON.parse(String(mediaEnrollment.baseline_page_json)),newPage=JSON.parse(String(ack.baseline_page_json));
  assert.deepEqual(newPage,{...oldPage,videoUrl:'https://www.youtube.com/watch?v=EBrvynBWYzY'});
  const corrected=(await runtimeCatalogByHandle(mediaTarget.handle))!;
  for(const p of corrected.products){const before=mediaCatalog.products.find(x=>x.id===p.id)!;
   assert.deepEqual(productMedia(p),correction.products.find(x=>x.productId===p.id)!.afterMedia);
   for(const [key,value] of Object.entries(before))if(!['video_ref','media_json','media'].includes(key))assert.deepEqual(p[key as keyof typeof p],value,key);
  }
  assert.deepEqual(await correctDemoMedia(correction),{duplicate:true});assert.equal(await snapshot(mediaTarget.businessId),mediaAfter);
  await assert.rejects(()=>correctDemoMedia({...correction,coverVideoRef:'youtube:NJMPGgcDylY'}),/different reviewed/);
  assert.equal(await snapshot(real.businessId),realBefore);assert.equal(await snapshot(privateDemo.businessId),privateBefore);assert.equal(await privateHash(),privateAfterExtra);
  // Replays after subsequent scenario work stay inert and the acknowledged media
  // survives ordinary scheduled stages without a content_changed pause.
  await db.prepare("UPDATE demo_simulator_enrollments SET status='paused',reason='operator' WHERE business_id<>?").run(mediaTarget.businessId);
  await db.exec("UPDATE demo_simulator_control SET enabled=1,pause_reason='' WHERE id=1");now+=600000;
  assert.equal((await runDemoSimulatorTick(now)).advanced,1);assert.equal((await db.prepare('SELECT status FROM demo_simulator_enrollments WHERE business_id=?').get(mediaTarget.businessId)).status,'active');
  assert.deepEqual((await runtimeCatalogByHandle(mediaTarget.handle))!.products.map(p=>productMedia(p)),corrected.products.map(p=>productMedia(p)));
  await db.exec("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
  const afterMediaStage=await snapshot(mediaTarget.businessId);assert.deepEqual(await correctDemoMedia(correction),{duplicate:true});assert.equal(await snapshot(mediaTarget.businessId),afterMediaStage);
  await db.exec("UPDATE demo_simulator_control SET enabled=1,pause_reason='' WHERE id=1; UPDATE demo_simulator_enrollments SET status='active',reason=''");
  const fault=fixtures.at(-1)!,faultProduct=fault.catalogProducts![3].productId;
  await db.prepare("UPDATE demo_simulator_enrollments SET status='paused',reason='operator' WHERE business_id<>?").run(fault.businessId);
  const faultBefore=await snapshot(fault.businessId);
  await db.exec(`CREATE FUNCTION fail_catalog_member() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic late member failure'; END; $$;
   CREATE TRIGGER fail_catalog_member BEFORE UPDATE ON products FOR EACH ROW WHEN (OLD.id=${faultProduct}) EXECUTE FUNCTION fail_catalog_member()`);
  now+=600000;const failed=await runDemoSimulatorTick(now);assert.equal(failed.failed,1);assert.equal(failed.advanced,0);assert.equal(await snapshot(fault.businessId),faultBefore);
  assert.equal((await db.prepare('SELECT reason FROM demo_simulator_enrollments WHERE business_id=?').get(fault.businessId)).reason,'stage_failed');
  await db.exec('DROP TRIGGER fail_catalog_member ON products; DROP FUNCTION fail_catalog_member()');
  const drift=fixtures[0];await db.prepare("UPDATE demo_simulator_enrollments SET status='active',reason='' WHERE business_id=?").run(drift.businessId);
  await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,'New manual product','new-manual-product','Keep this human addition.',1)").run(drift.businessId);
  const driftBefore=await snapshot(drift.businessId);now+=600000;assert.equal((await runDemoSimulatorTick(now)).paused,1);assert.equal(await snapshot(drift.businessId),driftBefore);
  assert.equal((await db.prepare('SELECT reason FROM demo_simulator_enrollments WHERE business_id=?').get(drift.businessId)).reason,'content_changed');
  console.log('PASS BE-009/BE-067 full catalog: 64 businesses/256 products, six-stage coherent mixed timelines, one catalog version per stage, complete fair coverage, preserved galleries/real/private data, whole-batch replay/conflict/rollback and membership drift.',JSON.stringify({ticks,stages,seconds:Math.round((Date.now()-started)/1000)}));
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
