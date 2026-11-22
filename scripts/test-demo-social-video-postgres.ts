import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {getDb, closeDbForTests} from './testing/postgres-fixture';
import {runtimeCatalogByHandle} from '../lib/catalog-runtime';
import {correctEnrolledDemoSocialVideo, correctUnenrolledDemoMedia, publishReviewedDemoStory, enrollDemoScenario} from '../lib/demo-simulator-runtime';
import {PUBLISHED_DEMO_VIDEO_TARGETS} from '../lib/published-demo-video-targets';
import {curatedManifestForLegacyDesign} from '../lib/showroom-manifests';
import {demoShowroomAbout} from '../lib/demo-showroom-stories';
import {productMedia} from '../lib/product-media';
import {productVideoWatchUrl} from '../lib/video/product-video';
import type {DemoCatalogProductInput} from '../lib/demo-catalog-scenarios';

async function main() {
 const db=await getDb();
 try {
  await db.exec("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
  for(const targetId of [1,5,21,50,62]) {
   const [businessId,handle,selected,products]=PUBLISHED_DEMO_VIDEO_TARGETS.find(([id])=>id===targetId)!;
   const legacy=businessId===50||businessId===62;
   const beforeRef=`demo:business-${businessId}`;
   const photo='/uploads/seed/benchmarks/green-terrace-farm/product-1.jpg';
   const gallery=(ref:string)=>[{kind:'image' as const,ref:photo},{kind:'video' as const,ref}];
   await db.prepare(`INSERT INTO businesses(id,handle,name,design_key,design_manifest_json,status,is_demo,process_video_ref)
    VALUES(?,?,?,'composition',?,'active',1,?)`).run(businessId,handle,handle,JSON.stringify(curatedManifestForLegacyDesign('novatech')),beforeRef);
   const actor=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused','QA','owner',?,0)")
    .run(handle+'@example.test',legacy?null:businessId)).insertedId;
   if(legacy)await db.prepare("UPDATE users SET role='admin' WHERE id=?").run(actor);
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(actor,legacy?'platform_admin':'client');
   const provider=randomUUID();
   if(!legacy)await db.prepare("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,?,1)")
    .run(actor,provider,handle+'@example.test');
   await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'food-farming')").run(businessId);
   const bindings:DemoCatalogProductInput[]=[];
   for(const [id,name] of products) {
    await db.prepare(`INSERT INTO products(id,business_id,name,slug,description,availability,is_published,quantity_unit,price_minor,offering_kind,image_path,video_ref,media_json)
      VALUES(?,?,?,?,?,'available',1,'boxes',10000,'standard_product',?,?,?)`)
      .run(id,businessId,name,'test-product-'+id,'Original product description',photo,beforeRef,JSON.stringify(gallery(beforeRef)));
    bindings.push({productId:id,scenarioKey:'wholesale-replenishment',parameters:{productName:name,productKind:'standard_product',
      businessCategories:['food-farming'],unit:'boxes',minimumOrder:1,normalCapacity:100,limitedCapacity:20,basePriceMinor:10000}});
   }
   const profile=JSON.stringify({template:'profile-v1',coverStyle:'blended',introduction:'Original intro',
    about:'Original story',heroImage:'',videoUrl:productVideoWatchUrl(beforeRef),contacts:{}});
   await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,updated_by,updated_at) VALUES(?,1,?,?,1)').run(businessId,profile,actor);
   await db.prepare("INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at) VALUES(?,1,1,?,'publish',?,1)").run(businessId,profile,actor);
   if(!legacy)await enrollDemoScenario({businessId,handle,ownerUserId:actor,providerUserId:provider,productId:bindings[0].productId,
    scenarioKey:bindings[0].scenarioKey,parameters:bindings[0].parameters,expectedContentVersion:1,expectedDraftVersion:1,expectedPageRevision:1,catalogProducts:bindings});
   const enrollment=()=>db.prepare('SELECT * FROM demo_simulator_enrollments WHERE business_id=?').get(businessId);
   const state=async()=>({
    business:await db.prepare('SELECT * FROM businesses WHERE id=?').get(businessId),
    products:await db.prepare('SELECT * FROM products WHERE business_id=? ORDER BY id').all(businessId),
    drafts:await db.prepare('SELECT * FROM owner_page_drafts WHERE business_id=?').all(businessId),
    published:await db.prepare('SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision').all(businessId),
    catalogs:await db.prepare('SELECT * FROM published_catalog_versions WHERE business_id=? ORDER BY content_version').all(businessId),
    audit:await db.prepare('SELECT * FROM audit_logs WHERE business_id=? ORDER BY id').all(businessId),
    enrollment:await enrollment(),
   });
   async function request(direction: 'apply'|'rollback') {
    const e=await enrollment(),current=await runtimeCatalogByHandle(handle),draft=(await state()).drafts[0];
    assert.ok(current);
    const isApply=direction==='apply';
    const operationKey=`social_${direction}_demo_${businessId}`;
    const expected={operationKey,businessId,handle,expectedContentVersion:current.business.content_version,
     expectedDraftVersion:Number(draft.version),expectedPageRevision:Number(draft.version),
     coverBefore:JSON.parse(String(draft.content_json)).videoUrl,coverVideoRef:isApply?selected:beforeRef,
     products:[...current.products].sort((a,b)=>a.id-b.id).map(item=>({productId:item.id,beforeMedia:productMedia(item),afterMedia:gallery(isApply?selected:beforeRef)}))};
    if(legacy) {
     const input={...expected,kind:'unenrolled_social_video_correction',direction,actorRole:'platform_admin',actorUserId:actor,
      processVideoBefore:isApply?beforeRef:selected,processVideoAfter:isApply?selected:beforeRef};
     return ()=>correctUnenrolledDemoMedia(input);
    }
    const input={
     media:{...expected,kind:'media_correction',ownerUserId:actor,providerUserId:provider,expectedHash:String(e.expected_hash)},
     expectedProcess:isApply?beforeRef:selected,expectedStage:Number(e.stage),expectedCycle:Number(e.cycle),expectedDueAt:Number(e.due_at),
     ...(isApply?{}:{rollbackOf:`social_apply_demo_${businessId}`}),
    };
    return ()=>correctEnrolledDemoSocialVideo(input);
   }
   if(businessId===5)await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'agriculture-growers')").run(businessId);
   const initial=await state();
   const apply=await request('apply');
   await db.exec("UPDATE demo_simulator_control SET enabled=1 WHERE id=1");
   await assert.rejects(apply,/pause/i);
   assert.deepEqual(await state(),initial);
   await db.exec("UPDATE demo_simulator_control SET enabled=0 WHERE id=1");
   await db.prepare("UPDATE businesses SET is_demo=0 WHERE id=?").run(businessId);
   await assert.rejects(apply,/eligibility/);
   await db.prepare("UPDATE businesses SET is_demo=1 WHERE id=?").run(businessId);
   if (businessId===1) {
    await db.exec(`CREATE FUNCTION fail_demo_process_write() RETURNS trigger AS $$
      BEGIN RAISE EXCEPTION 'controlled process write failure'; END $$ LANGUAGE plpgsql;
      CREATE TRIGGER fail_demo_process_write BEFORE UPDATE OF process_video_ref ON businesses
      FOR EACH ROW WHEN (OLD.id=1) EXECUTE FUNCTION fail_demo_process_write()`);
    await assert.rejects(apply,/controlled process write failure/);
    assert.deepEqual(await state(),initial,'A late process failure rolls back the story, photos, versions, products and receipt');
    await db.exec('DROP TRIGGER fail_demo_process_write ON businesses');
   }
   if(businessId===5){
    await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'home-living')").run(businessId);
    await assert.rejects(apply,/content_changed/);
    await db.prepare("DELETE FROM business_industries WHERE business_id=? AND industry_key='home-living'").run(businessId);
    assert.deepEqual(await state(),initial,'Unreviewed category drift cannot be silently repaired with the media update');
   }
   assert.deepEqual(await apply(),{duplicate:false});
   const applied=await state();
   const catalog=(await runtimeCatalogByHandle(handle))!;
   assert.equal(catalog.business.process_video_ref,selected);
   assert.equal(JSON.parse(String(applied.drafts[0].content_json)).videoUrl,productVideoWatchUrl(selected));
   for(const item of catalog.products)assert.deepEqual(productMedia(item),gallery(selected));
   for(const key of ['stage','cycle','due_at'])assert.equal(applied.enrollment?.[key],initial.enrollment?.[key]);
   if(businessId===5){
    const parameters=JSON.parse(String(applied.enrollment?.parameters_json));
    const bindings=JSON.parse(String(applied.enrollment?.catalog_products_json));
    assert.deepEqual(parameters.businessCategories,['agriculture-growers','food-farming']);
    assert.ok(bindings.every((binding:{parameters:{businessCategories:string[]}})=>JSON.stringify(binding.parameters.businessCategories)===JSON.stringify(parameters.businessCategories)));
   }else assert.equal(applied.enrollment?.catalog_products_json,initial.enrollment?.catalog_products_json);
   assert.deepEqual(await apply(),{duplicate:true});
   assert.deepEqual(await state(),applied);
   const rehearsal = new Error('story rehearsal complete');
   await assert.rejects(db.runner.transaction(async () => {
    const storyRequest = {businessId,handle,expectedAbout:JSON.parse(applied.drafts[0].content_json).about,
     draftVersion:applied.drafts[0].version,revision:applied.published.at(-1).revision,direction:'apply' as const};
    await assert.rejects(publishReviewedDemoStory({...storyRequest,expectedAbout:'Unreviewed story'}),/content_changed/);
    assert.equal((await publishReviewedDemoStory(storyRequest)).duplicate,false);
    assert.equal((await publishReviewedDemoStory(storyRequest)).duplicate,true);
    const storyState=await state();
    const authored=demoShowroomAbout(handle,'published');
    assert.equal(JSON.parse(storyState.published.at(-1).content_json).about,authored);
    assert.deepEqual(storyState.products,applied.products);
    if (!legacy) {
     assert.equal(JSON.parse(storyState.enrollment.baseline_page_json).about,authored);
     for(const key of ['stage','cycle','due_at'])assert.equal(storyState.enrollment[key],applied.enrollment[key]);
    }
    const storyRollback={...storyRequest,direction:'rollback' as const};
    assert.equal((await publishReviewedDemoStory(storyRollback)).duplicate,false);
    assert.equal((await publishReviewedDemoStory(storyRollback)).duplicate,true);
    const storyRestored=await state();
    assert.equal(JSON.parse(storyRestored.drafts[0].content_json).about,storyRequest.expectedAbout);
    assert.equal(storyRestored.enrollment?.baseline_page_json,applied.enrollment?.baseline_page_json);
    throw rehearsal;
   }), error => error === rehearsal);
   const undo=await request('rollback');
   assert.deepEqual(await undo(),{duplicate:false});
   const restored=await state(),restoredCatalog=(await runtimeCatalogByHandle(handle))!;
   assert.equal(restoredCatalog.business.process_video_ref,beforeRef);
   assert.equal(JSON.parse(String(restored.drafts[0].content_json)).videoUrl,productVideoWatchUrl(beforeRef));
   for(const item of restoredCatalog.products)assert.deepEqual(productMedia(item),gallery(beforeRef));
   assert.deepEqual(await undo(),{duplicate:true});
  }
  console.log('PASS BE-049 social video publication, YouTube/TikTok, two legacy demos, exact replay and rollback.');
 } finally {await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1});
