import {createHash} from 'node:crypto';
import {COPY_MAINTENANCE_END,isCopyMaintenanceWindow} from './demo-copy-background';
import {runtimeAll,runtimeGet,runtimeRun,runtimeTransaction} from './runtime-sql';
import {runtimeCatalogByBusinessId,runtimeUserById} from './catalog-runtime';
import {currentBusinessAuthority} from './staff-business-authority';
import {ownerPagePort} from './owner-page-runtime';
import {pagePublicationPort} from './owner-page-publication-runtime';
import {saveOwnerPageAndPublication} from './owner-page-save-runtime';
import {OwnerPageError,ownerPageImageKey,parseShopPageContent,type ShopPageContent} from './owner-page-domain';
import {executeBasicProductUpkeep,executeProductUpkeepBatch} from './product-upkeep';
import {postgresProductUpkeepPort} from './product-upkeep-postgres';
import {parseOfferingHighlightsJson} from './offering-presentation';
import {configuredReviewer} from './reviewer-access-runtime';
import {demoScenarioCommandKey,demoScenarioStage,nextDemoScenarioStage,parseDemoScenarioParameters,type DemoScenarioParameters,type DemoScenarioKey} from './demo-scenarios';
import {parseDemoMediaCorrection,parseUnenrolledDemoMediaCorrection,parseQueuedDemoMediaCorrection,type UnenrolledDemoMediaCorrection} from './demo-media-correction';
import {parseDemoProcessMediaCorrection,type DemoProcessMediaCorrection} from './demo-process-media-correction';
import {AGRICULTURE_CORRECTION_TARGETS,parseDemoCategoryCorrection} from './demo-category-correction';
import {parseDemoCopyCorrection,type DemoCopyCorrection} from './demo-copy-correction-request';
import {planEnrolledDemoCopy,planLegacyDemoCopy,type PublicDemoCopy} from './demo-copy-correction';
import {productMedia} from './product-media';
import {ProductUpkeepError} from './product-upkeep-domain';
import {RevisionError} from './revision-domain';
import {catalogToRevisionSnapshotV4,processVideoPolicyForCatalog} from './revision-v4-defaults';
import {requireRevisionSnapshotV4} from './revision-v4-domain';
import {SHOWROOM_COMPONENT_BANK_LATEST} from './showroom-bank-release';
import {productVideoWatchUrl} from './video/product-video';
import type {SessionUser} from './types';
import {isSupportedPostgresMigrationLedger,LATEST_POSTGRES_MIGRATION_VERSION} from './postgres-schema-version';
import {parseDemoCatalogInputs,parseStoredDemoCatalog,demoCatalogPhaseOffsets,demoCatalogStage,MAX_DEMO_CATALOG_BUSINESSES,type DemoCatalogProductInput,type DemoCatalogProduct} from './demo-catalog-scenarios';

export type DemoEnrollmentInput={businessId:number;handle:string;ownerUserId:number;providerUserId:string;productId:number;
 scenarioKey:DemoScenarioKey;parameters:DemoScenarioParameters;initializeUnit?:boolean;
 expectedContentVersion?:number;expectedDraftVersion?:number;expectedPageRevision?:number;catalogProducts?:DemoCatalogProductInput[]};
type Enrollment={business_id:number;handle:string;owner_user_id:number;provider_user_id:string;product_id:number;
 scenario_key:DemoScenarioKey;scenario_version:number;parameters_json:string;baseline_page_json:string;baseline_description:string;expected_hash:string;
 stage:number;cycle:number;due_at:number;status:'active'|'paused';reason:string;catalog_products_json:string};
type Control={enabled:number;last_slot:number;budget_day:number;used_today:number;daily_limit:number;database_limit_bytes:number};
class DemoDrift extends Error{constructor(readonly reason:'eligibility_changed'|'content_changed'){super(reason);}}
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function schemaReady(){
 const versions=(await runtimeAll<{version:number}>('SELECT version FROM schema_migrations ORDER BY version')).map(row=>Number(row.version));
 return versions.at(-1)===LATEST_POSTGRES_MIGRATION_VERSION&&LATEST_POSTGRES_MIGRATION_VERSION>=83&&isSupportedPostgresMigrationLedger(versions);
}

// Lock in the same order as ordinary page writers: current owner/profile/link,
// draft, business, product. No Auth session or owner login is created.
async function currentState(e:Pick<Enrollment,'business_id'|'handle'|'owner_user_id'|'provider_user_id'|'product_id'>,fullCatalog=false,lockDiscovery=false){
 const actor=await runtimeUserById(e.owner_user_id),reviewer=configuredReviewer();
 if(!actor||actor.access_role!=='client'||actor.business_id!==e.business_id||
    await currentBusinessAuthority(actor,e.business_id,true)!=='owner')throw new DemoDrift('eligibility_changed');
 const link=await runtimeGet<{provider_user_id:string}>("SELECT provider_user_id FROM auth_identity_links WHERE user_id=? AND provider='supabase' FOR SHARE",[actor.id]);
 if(!link||link.provider_user_id!==e.provider_user_id||reviewer?.providerId===link.provider_user_id||reviewer?.email===actor.email.toLowerCase())throw new DemoDrift('eligibility_changed');
 await runtimeGet('SELECT business_id FROM owner_page_drafts WHERE business_id=? FOR UPDATE',[e.business_id]);
 const b=await runtimeGet<{is_demo:number;status:string;handle:string}>("SELECT is_demo,status,handle FROM businesses WHERE id=? FOR UPDATE",[e.business_id]);
 if(!b||b.is_demo!==1||b.status!=='active'||b.handle!==e.handle)throw new DemoDrift('eligibility_changed');
 if(!await runtimeGet('SELECT id FROM products WHERE id=? AND business_id=? FOR UPDATE',[e.product_id,e.business_id]))throw new DemoDrift('eligibility_changed');
 const catalog=await runtimeCatalogByBusinessId(e.business_id,true),draft=await ownerPagePort.read(e.business_id),publication=await pagePublicationPort.latest(e.business_id);
 const product=catalog?.products.find(p=>p.id===e.product_id);
 const owners=await runtimeGet<{total:number}>("SELECT COUNT(*) total FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.business_id=? AND p.access_role='client'",[e.business_id]);
 if(!catalog||!draft||!publication?.content||!product||!product.is_published||product.offering_kind==='service'||product.currency!=='ETB'||Number(owners?.total)!==1||
    !catalog.products.some(p=>(fullCatalog||p.id!==e.product_id)&&p.is_published&&p.offering_kind!=='service'&&['available','limited'].includes(p.availability)))throw new DemoDrift('eligibility_changed');
 const categories=(await runtimeAll<{industry_key:string}>('SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key',[e.business_id])).map(v=>v.industry_key);
 const location=await runtimeGet<{version:number;reviewed_version:number;category_key:string;updated_at:number}>('SELECT * FROM owner_location_proposals WHERE business_id=? FOR SHARE',[e.business_id]);
 const discovery=await runtimeGet<{updated_at:number;approved_at:number;is_excluded:number}>(`SELECT * FROM business_discovery_profiles WHERE business_id=? ${lockDiscovery?'FOR SHARE':''}`,[e.business_id]);
 // Publication can normally apply a pending location. Demo automation must
 // never approve geography or do a Storage lookup while holding its transaction.
 if(location&&location.version!==location.reviewed_version||ownerPageImageKey(e.business_id,draft.content.heroImage))throw new DemoDrift('eligibility_changed');
 // Includes ordinary versions AND content, so direct SQL drift without a version
 // bump also pauses. Customer inquiries and other tenants are deliberately absent.
 return {actor,catalog,product,draft,publication:{...publication,content:publication.content},categories,location,discovery,
  hash:digest({catalog,draft,publication,categories,location,discovery})};
}

/** Explicit server/operator enrollment only. Calling it cannot enable the worker. */
export async function enrollDemoScenario(input:DemoEnrollmentInput,now=Date.now()){
 if(input.catalogProducts!==undefined)return enrollDemoCatalog(input,now);
 const parameters=parseDemoScenarioParameters(input.parameters);
 demoScenarioStage(input.scenarioKey,1,0,parameters);
 if(![input.businessId,input.ownerUserId,input.productId].every(v=>Number.isSafeInteger(v)&&v>0)||
    !/^[a-z0-9][a-z0-9-]{1,79}$/.test(input.handle)||!/^[0-9a-f-]{32,64}$/i.test(input.providerUserId))throw new Error('Invalid demo enrollment target.');
 return runtimeTransaction(async()=>{
  await runtimeRun('SELECT pg_advisory_xact_lock(6870619271382)');
  if(!await schemaReady())throw new Error('The demo schema is not ready.');
  const control=await runtimeGet<Control>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||control.enabled)throw new Error('Pause the demo service before enrollment.');
  const count=await runtimeGet<{total:number}>("SELECT COUNT(*) total FROM demo_simulator_enrollments WHERE status='active'");
  if(Number(count?.total)>=6)throw new Error('The initial demo cohort is limited to six businesses.');
  const e={business_id:input.businessId,handle:input.handle,owner_user_id:input.ownerUserId,provider_user_id:input.providerUserId,product_id:input.productId};
  let state=await currentState(e);
  if(parameters.productName!==state.product.name||parameters.productKind!==state.product.offering_kind||
     parameters.basePriceMinor!==state.product.price_minor||!(parameters.unit===state.product.quantity_unit||input.initializeUnit===true&&!state.product.quantity_unit)||
     input.expectedContentVersion!==undefined&&input.expectedContentVersion!==state.catalog.business.content_version||
     input.expectedDraftVersion!==undefined&&input.expectedDraftVersion!==state.draft.version||
     input.expectedPageRevision!==undefined&&input.expectedPageRevision!==state.publication.revision||
     digest([...parameters.businessCategories].sort())!==digest(state.categories)||
     state.draft.version!==state.publication.draftVersion||digest(state.draft.content)!==digest(state.publication.content)||state.publication.content.about.length>2500||state.product.description.length>2500)throw new DemoDrift('content_changed');
  if(input.initializeUnit===true&&!state.product.quantity_unit){
   const size=await runtimeGet<{bytes:string}>('SELECT pg_database_size(current_database()) bytes');
   if(Number(size?.bytes)>=Number(control.database_limit_bytes))throw Error('Demo enrollment storage budget reached.');
   const p=state.product;
   await executeBasicProductUpkeep(postgresProductUpkeepPort,state.actor,{kind:'update',businessId:input.businessId,productId:p.id,
    expectedContentVersion:state.catalog.business.content_version,idempotencyKey:`demo_enrollment_unit_${input.businessId}_${state.catalog.business.content_version}`,
    name:p.name,description:p.description,availability:p.availability,offeringKind:p.offering_kind,quantityMode:p.quantity_mode,orderScope:p.order_scope??'unspecified',
    priceMinor:p.price_minor,quantityUnit:parameters.unit,highlights:parseOfferingHighlightsJson(p.highlights_json),capacitySummary:p.capacity_summary,
    minimumOrderSummary:p.minimum_order_summary,leadTimeSummary:p.lead_time_summary,videoRef:p.video_ref,categoryId:p.category_id,imageAction:'keep',preserveMetadata:true,updateSellingFacts:true},null);
   state=await currentState(e);
  }
  await runtimeRun(`INSERT INTO demo_simulator_enrollments(business_id,handle,owner_user_id,provider_user_id,product_id,scenario_key,scenario_version,
   parameters_json,baseline_page_json,baseline_description,expected_hash,due_at,enrolled_at) VALUES(?,?,?,?,?,?,1,?,?,?,?,?,?)`,
   [input.businessId,input.handle,input.ownerUserId,input.providerUserId,input.productId,input.scenarioKey,JSON.stringify(parameters),JSON.stringify(state.publication.content),state.product.description,state.hash,now,now]);
  await audit(state.actor,input.businessId,{kind:'enrolled',scenario:input.scenarioKey});
 });
}

async function enrollDemoCatalog(input:DemoEnrollmentInput,now:number){
 const inputs=parseDemoCatalogInputs(input.catalogProducts),primary=inputs[0];
 if(![input.businessId,input.ownerUserId,input.productId].every(v=>Number.isSafeInteger(v)&&v>0)||
   !/^[a-z0-9][a-z0-9-]{1,79}$/.test(input.handle)||!/^[0-9a-f-]{32,64}$/i.test(input.providerUserId)||
   ![input.expectedContentVersion,input.expectedDraftVersion,input.expectedPageRevision].every(v=>Number.isSafeInteger(v)&&Number(v)>=0)||
   primary.productId!==input.productId||primary.scenarioKey!==input.scenarioKey||digest(primary.parameters)!==digest(parseDemoScenarioParameters(input.parameters)))throw Error('Invalid reviewed demo catalog binding.');
 return runtimeTransaction(async()=>{
  await runtimeRun('SELECT pg_advisory_xact_lock(6870619271382)');
  if(!await schemaReady())throw Error('The demo schema is not ready.');
  const control=await runtimeGet<Control>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||control.enabled)throw Error('Pause the demo service before enrollment.');
  const existing=await runtimeGet<Enrollment>('SELECT * FROM demo_simulator_enrollments WHERE business_id=? FOR UPDATE',[input.businessId]);
  if(existing&&parseStoredDemoCatalog(existing.catalog_products_json).length)throw Error('This demo catalog is already enrolled.');
  const count=await runtimeGet<{total:number}>("SELECT COUNT(*) total FROM demo_simulator_enrollments WHERE status='active'");
  if(!existing&&Number(count?.total)>=MAX_DEMO_CATALOG_BUSINESSES)throw Error('The reviewed public-demo catalog limit is reached.');
  if(existing&&(existing.handle!==input.handle||existing.owner_user_id!==input.ownerUserId||existing.provider_user_id!==input.providerUserId||
    existing.product_id!==input.productId||existing.status!=='active'))throw new DemoDrift('eligibility_changed');
  const e={business_id:input.businessId,handle:input.handle,owner_user_id:input.ownerUserId,provider_user_id:input.providerUserId,product_id:input.productId};
  const state=await currentState(e,true);
  if(existing&&existing.expected_hash!==state.hash)throw new DemoDrift('content_changed');
  if(input.expectedContentVersion!==state.catalog.business.content_version||input.expectedDraftVersion!==state.draft.version||
    input.expectedPageRevision!==state.publication.revision||state.draft.version!==state.publication.draftVersion||
    digest(state.draft.content)!==digest(state.publication.content)||state.publication.content.about.length>2500||
    digest(inputs.map(p=>p.productId))!==digest(state.catalog.products.map(p=>p.id).sort((a,b)=>a-b)))throw new DemoDrift('content_changed');
  const offsets=demoCatalogPhaseOffsets(inputs),products:DemoCatalogProduct[]=inputs.map((binding,index)=>{
   const p=state.catalog.products.find(p=>p.id===binding.productId)!,parameters=binding.parameters;
   const old=existing&&p.id===existing.product_id?parseDemoScenarioParameters(JSON.parse(existing.parameters_json)):null;
   const description=old?existing!.baseline_description:p.description;
   if(!p.is_published||p.offering_kind==='service'||p.currency!=='ETB'||parameters.productName!==p.name||parameters.productKind!==p.offering_kind||
     parameters.basePriceMinor!==(old?old.basePriceMinor:p.price_minor)||
     !(parameters.unit===p.quantity_unit||binding.initializeUnit===true&&!p.quantity_unit)||
     digest([...parameters.businessCategories].sort())!==digest(state.categories)||description.length>2500)throw new DemoDrift('content_changed');
   return {productId:p.id,scenarioKey:binding.scenarioKey,scenarioVersion:1,parameters,baselineDescription:description,phaseOffset:offsets[index]};
  });
  const stored=JSON.stringify(products);parseStoredDemoCatalog(stored);
  if(existing){
   if(existing.scenario_key!==primary.scenarioKey||digest(JSON.parse(existing.parameters_json))!==digest(primary.parameters))throw new DemoDrift('content_changed');
   await runtimeRun('UPDATE demo_simulator_enrollments SET catalog_products_json=? WHERE business_id=?',[stored,input.businessId]);
  }else{
   await runtimeRun(`INSERT INTO demo_simulator_enrollments(business_id,handle,owner_user_id,provider_user_id,product_id,scenario_key,scenario_version,
    parameters_json,baseline_page_json,baseline_description,expected_hash,due_at,enrolled_at,catalog_products_json) VALUES(?,?,?,?,?,?,1,?,?,?,?,?,?,?)`,
    [input.businessId,input.handle,input.ownerUserId,input.providerUserId,primary.productId,primary.scenarioKey,JSON.stringify(primary.parameters),
     JSON.stringify(state.publication.content),products[0].baselineDescription,state.hash,now,now,stored]);
  }
  await audit(state.actor,input.businessId,{kind:'catalog_enrolled',products:products.map(p=>p.productId)});
 });
}
async function audit(actor:SessionUser,businessId:number,detail:Record<string,unknown>){
 await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'demo.scenario',?,'')",[actor.id,businessId,JSON.stringify({automation:'demo-simulator',...detail})]);
}

/** Explicit finite operator maintenance; cannot enroll, enable or reset progress. */
export async function correctDemoMedia(raw:unknown){
 const input=parseDemoMediaCorrection(raw),payloadHash=digest(input);
 return runtimeTransaction(async()=>{
  await runtimeRun('SELECT pg_advisory_xact_lock(6870619271382)');
  if(!await schemaReady())throw Error('The demo schema is not ready.');
  const control=await runtimeGet<Control & {pause_reason:string}>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||control.enabled||control.pause_reason!=='operator')throw Error('Pause the demo service explicitly before media maintenance.');
  const e=await runtimeGet<Enrollment>('SELECT * FROM demo_simulator_enrollments WHERE business_id=? FOR UPDATE',[input.businessId]);
  if(!e||e.status!=='active'||e.reason||e.handle!==input.handle||e.owner_user_id!==input.ownerUserId||e.provider_user_id!==input.providerUserId)throw new DemoDrift('eligibility_changed');
  const bindings=parseStoredDemoCatalog(e.catalog_products_json),state=await currentState(e,true);
  if(!bindings.length||digest(bindings.map(p=>p.productId))!==digest(input.products.map(p=>p.productId))||
   digest(bindings.map(p=>p.productId))!==digest(state.catalog.products.map(p=>p.id).sort((a,b)=>a-b)))throw new DemoDrift('eligibility_changed');
  if(state.hash!==e.expected_hash)throw new DemoDrift('content_changed');
  const receipt=await runtimeGet<{payload_hash:string}>("SELECT detail::jsonb->>'payloadHash' payload_hash FROM audit_logs WHERE business_id=? AND action='demo.media_corrected' AND CASE WHEN action='demo.media_corrected' THEN detail::jsonb->>'operationKey' END=? ORDER BY id DESC LIMIT 1",[input.businessId,input.operationKey]);
  if(receipt){if(receipt.payload_hash!==payloadHash)throw Error('This demo media operation has different reviewed content.');return {duplicate:true};}
  if(input.expectedHash!==e.expected_hash||input.expectedContentVersion!==state.catalog.business.content_version||
   input.expectedDraftVersion!==state.draft.version||input.expectedPageRevision!==state.publication.revision||
   state.draft.version!==state.publication.draftVersion||digest(state.draft.content)!==digest(state.publication.content)||
   input.coverBefore!==state.draft.content.videoUrl||input.products.some(item=>digest(item.beforeMedia)!==digest(productMedia(state.catalog.products.find(p=>p.id===item.productId)!))))throw new DemoDrift('content_changed');
  const size=await runtimeGet<{bytes:string}>('SELECT pg_database_size(current_database()) bytes');
  if(!size||!Number.isFinite(Number(size.bytes))||Number(size.bytes)>=Number(control.database_limit_bytes))throw Error('Demo media storage budget reached.');
  let version=state.catalog.business.content_version;
  for(const item of input.products){
   if(digest(item.beforeMedia)===digest(item.afterMedia))continue;
   const p=state.catalog.products.find(p=>p.id===item.productId)!;
   const result=await executeBasicProductUpkeep(postgresProductUpkeepPort,state.actor,{
    kind:'update',businessId:e.business_id,productId:p.id,expectedContentVersion:version,
    idempotencyKey:`demo_media_${input.operationKey}_${p.id}`,name:p.name,description:p.description,
    availability:p.availability,offeringKind:p.offering_kind,quantityMode:p.quantity_mode,
    orderScope:p.order_scope??'unspecified',priceMinor:p.price_minor,quantityUnit:p.quantity_unit,
    highlights:parseOfferingHighlightsJson(p.highlights_json),capacitySummary:p.capacity_summary,
    minimumOrderSummary:p.minimum_order_summary,leadTimeSummary:p.lead_time_summary,
    media:item.afterMedia,videoRef:item.afterMedia.find(m=>m.kind==='video')!.ref,
    categoryId:p.category_id,imageAction:'keep',preserveMetadata:true,
   },null);
   version=result.contentVersion;
  }
  const videoUrl=productVideoWatchUrl(input.coverVideoRef);
  if(state.draft.content.videoUrl!==videoUrl)await saveOwnerPageAndPublication(state.actor,e.business_id,
   {action:'save',version:state.draft.version,content:{...state.draft.content,videoUrl}});
  const after=await currentState(e,true),baseline=parseShopPageContent(JSON.parse(e.baseline_page_json));
  await runtimeRun('UPDATE demo_simulator_enrollments SET expected_hash=?,baseline_page_json=? WHERE business_id=?',
   [after.hash,JSON.stringify({...baseline,videoUrl}),e.business_id]);
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'demo.media_corrected',?,'')",
   [state.actor.id,e.business_id,JSON.stringify({automation:'demo-media-maintenance',operationKey:input.operationKey,payloadHash,products:input.products.map(p=>p.productId)})]);
  return {duplicate:false};
 });
}

/** Exact enrolled-example process-video repair. It publishes one ordinary
 * retained catalog version and never edits products, pages or scenario progress. */
type ProcessMediaPhase='admission'|'eligibility'|'receipt'|'reviewed_before'|'retained'|
 'business'|'postcondition'|'version'|'enrollment'|'audit';
const processMediaFailurePhases=new WeakMap<object,ProcessMediaPhase>();
export async function correctDemoProcessMedia(raw:unknown){
 const input=parseDemoProcessMediaCorrection(raw),payloadHash=digest(input);
 let phase:ProcessMediaPhase='admission';
 try{return await runtimeTransaction(async()=>{
  await runtimeRun('SELECT pg_advisory_xact_lock(6870619271382)');
  if(!await schemaReady())throw Error('The demo schema is not ready.');
  const control=await runtimeGet<Control & {pause_reason:string}>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||control.enabled||control.pause_reason!=='operator')throw Error('Pause the demo service explicitly before process media maintenance.');
  phase='eligibility';
  const e=await runtimeGet<Enrollment>('SELECT * FROM demo_simulator_enrollments WHERE business_id=? FOR UPDATE',[input.businessId]);
  if(!e||e.status!=='active'||e.reason||e.handle!==input.handle||e.owner_user_id!==input.ownerUserId||
   e.provider_user_id!==input.providerUserId)throw new DemoDrift('eligibility_changed');
  const state=await currentState(e,true);
  if(state.hash!==e.expected_hash)throw new DemoDrift('content_changed');
  phase='receipt';
  const receipt=await runtimeGet<{payload_hash:string}>(`SELECT detail::jsonb->>'payloadHash' payload_hash FROM audit_logs
   WHERE business_id=? AND action='demo.process_media_corrected'
   AND CASE WHEN action='demo.process_media_corrected' THEN detail::jsonb->>'operationKey' END=? ORDER BY id DESC LIMIT 1`,
   [input.businessId,input.operationKey]);
  if(receipt){
   if(receipt.payload_hash!==payloadHash)throw Error('This process media operation has different reviewed content.');
   if(state.catalog.business.process_video_ref!==input.processVideoAfter)throw new DemoDrift('content_changed');
   return {duplicate:true};
  }
  phase='reviewed_before';
  if(input.expectedHash!==e.expected_hash||input.expectedContentVersion!==state.catalog.business.content_version||
   input.expectedDraftVersion!==state.draft.version||input.expectedPageRevision!==state.publication.revision||
   input.expectedStage!==e.stage||input.expectedCycle!==e.cycle||input.expectedDueAt!==Number(e.due_at)||
   state.draft.version!==state.publication.draftVersion||digest(state.draft.content)!==digest(state.publication.content)||
   input.processVideoBefore!==state.catalog.business.process_video_ref)throw new DemoDrift('content_changed');
  if(input.direction==='rollback'){
   const applied=await runtimeGet<{before_ref_hash:string;after_ref_hash:string}>(`SELECT
    detail::jsonb->>'beforeRefHash' before_ref_hash,detail::jsonb->>'afterRefHash' after_ref_hash
    FROM audit_logs WHERE business_id=? AND action='demo.process_media_corrected'
    AND CASE WHEN action='demo.process_media_corrected' THEN detail::jsonb->>'direction' END='apply'
    ORDER BY id DESC LIMIT 1`,[input.businessId]);
   if(!applied||applied.before_ref_hash!==digest(input.processVideoAfter)||
    applied.after_ref_hash!==digest(input.processVideoBefore))throw new DemoDrift('content_changed');
  }
  const bindings=parseStoredDemoCatalog(e.catalog_products_json);
  if(!bindings.length||digest(bindings.map(p=>p.productId))!==digest(state.catalog.products.map(p=>p.id).sort((a,b)=>a-b)))
   throw new DemoDrift('eligibility_changed');
  const size=await runtimeGet<{bytes:string}>('SELECT pg_database_size(current_database()) bytes');
  if(!size||!Number.isFinite(Number(size.bytes))||Number(size.bytes)>=Number(control.database_limit_bytes))
   throw Error('Demo media storage budget reached.');
  const version=state.catalog.business.content_version;
  const beforeSnapshot=catalogToRevisionSnapshotV4(state.catalog);
  phase='retained';
  const retained=await runtimeGet<{snapshot_json:string}>(
   'SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=? FOR SHARE',
   [input.businessId,version]);
  let processVersion=version;
  if(retained){
   let exact=false;
   try{
    const checked=requireRevisionSnapshotV4(retained.snapshot_json,SHOWROOM_COMPONENT_BANK_LATEST,
     processVideoPolicyForCatalog(state.catalog));
    exact=digest(checked)===digest(beforeSnapshot);
   }catch(error){if(!(error instanceof RevisionError))throw error;}
   if(!exact){
    if(await runtimeGet('SELECT 1 FROM published_catalog_versions WHERE business_id=? AND content_version=? FOR SHARE',
     [input.businessId,version+1]))throw new DemoDrift('content_changed');
    const reserved=await runtimeRun(`UPDATE businesses SET content_version=?
     WHERE id=? AND handle=? AND is_demo=1 AND status='active' AND content_version=? AND process_video_ref=?`,
     [version+1,input.businessId,input.handle,version,input.processVideoBefore]);
    if(reserved.changes!==1)throw new DemoDrift('content_changed');
    await runtimeRun(`INSERT INTO published_catalog_versions
     (business_id,content_version,snapshot_json,change_kind,actor_user_id)
     VALUES(?,?,?,'baseline',?)`,[input.businessId,version+1,JSON.stringify(beforeSnapshot),state.actor.id]);
    processVersion=version+1;
   }
  }else await runtimeRun(`INSERT INTO published_catalog_versions
   (business_id,content_version,snapshot_json,change_kind,actor_user_id)
   VALUES(?,?,?,'baseline',?)`,[input.businessId,version,JSON.stringify(beforeSnapshot),state.actor.id]);
  phase='business';
  const updated=await runtimeRun(`UPDATE businesses SET process_video_ref=?,content_version=?
   WHERE id=? AND handle=? AND is_demo=1 AND status='active' AND content_version=? AND process_video_ref=?`,
   [input.processVideoAfter,processVersion+1,input.businessId,input.handle,processVersion,input.processVideoBefore]);
  if(updated.changes!==1)throw new DemoDrift('content_changed');
  phase='postcondition';
  const after=await currentState(e,true);
  const unchangedBusiness=(business:typeof state.catalog.business)=>({...business,process_video_ref:'',content_version:0});
  if(after.catalog.business.content_version!==processVersion+1||
   after.catalog.business.process_video_ref!==input.processVideoAfter||
   digest(unchangedBusiness(after.catalog.business))!==digest(unchangedBusiness(state.catalog.business))||
   digest(after.catalog.products)!==digest(state.catalog.products)||
   digest(after.draft)!==digest(state.draft)||digest(after.publication)!==digest(state.publication)||
   digest(after.categories)!==digest(state.categories)||digest(after.location??null)!==digest(state.location??null)||
   digest(after.discovery??null)!==digest(state.discovery??null))throw new DemoDrift('content_changed');
  phase='version';
  const afterSnapshot=catalogToRevisionSnapshotV4(after.catalog);
  await runtimeRun(`INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id)
   VALUES(?,?,?,'publication',?)`,[input.businessId,processVersion+1,JSON.stringify(afterSnapshot),state.actor.id]);
  phase='enrollment';
  const acknowledged=await runtimeRun(`UPDATE demo_simulator_enrollments SET expected_hash=?
   WHERE business_id=? AND status='active' AND reason='' AND expected_hash=? AND stage=? AND cycle=? AND due_at=?`,
   [after.hash,input.businessId,e.expected_hash,e.stage,e.cycle,e.due_at]);
  if(acknowledged.changes!==1)throw new DemoDrift('content_changed');
  phase='audit';
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'demo.process_media_corrected',?,'')",
   [state.actor.id,input.businessId,JSON.stringify({automation:'demo-media-maintenance',direction:input.direction,
    operationKey:input.operationKey,payloadHash,beforeStateHash:state.hash,afterStateHash:after.hash,
    beforeRefHash:digest(input.processVideoBefore),afterRefHash:digest(input.processVideoAfter),
    baseVersion:version,baselineVersion:processVersion,contentVersion:processVersion+1,
    baselineReconciled:processVersion!==version})]);
  return {duplicate:false};
 });}catch(error){
  if(error&&typeof error==='object')processMediaFailurePhases.set(error,phase);
  throw error;
 }
}

/** One finite reviewed cohort correction; the worker must already be operator-paused. */
export async function correctDemoCategoryBatch(raw:unknown){
 const input=parseDemoCategoryCorrection(raw),payloadHash=digest(input);
 return runtimeTransaction(async()=>{
  await runtimeRun("SET LOCAL transaction_timeout='23s'");
  await runtimeRun("SET LOCAL lock_timeout='1500ms'");
  await runtimeRun("SET LOCAL statement_timeout='4000ms'");
  await runtimeRun('SELECT pg_advisory_xact_lock(6870619271382)');
  if(!await schemaReady())throw Error('The demo schema is not ready.');
  const control=await runtimeGet<Control & {pause_reason:string}>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||control.enabled||control.pause_reason!=='operator')throw Error('Pause the demo service explicitly before category maintenance.');
  const receipt=await runtimeGet<{payload_hash:string}>("SELECT detail::jsonb->>'payloadHash' payload_hash FROM audit_logs WHERE action='demo.category_corrected' AND CASE WHEN action='demo.category_corrected' THEN detail::jsonb->>'operationKey' END=? ORDER BY id DESC LIMIT 1",[input.operationKey]);
  if(receipt){if(receipt.payload_hash!==payloadHash)throw Error('This demo category operation has different reviewed content.');return {duplicate:true};}
  const agriculture=await runtimeGet<{total:number}>("SELECT COUNT(*) total FROM business_industries WHERE industry_key='agriculture-growers'");
  if(Number(agriculture?.total)!==0)throw new DemoDrift('content_changed');
  const checked: Array<{enrollment:Enrollment;actor:SessionUser;catalogProductsJson:string;parametersJson:string}>=[];
  const categories=['agriculture-growers','food-farming'];
  for(const member of input.members){
   const target=AGRICULTURE_CORRECTION_TARGETS.find(item=>item.businessId===member.businessId);
   if(!target||target.handle!==member.handle)throw new DemoDrift('eligibility_changed');
   const e=await runtimeGet<Enrollment>('SELECT * FROM demo_simulator_enrollments WHERE business_id=? FOR UPDATE',[member.businessId]);
   if(!e||e.status!=='active'||e.reason||e.handle!==member.handle||e.owner_user_id!==member.ownerUserId||
      e.provider_user_id!==member.providerUserId||e.product_id!==member.productIds[0]||
      e.stage!==member.stage||e.cycle!==member.cycle||Number(e.due_at)!==member.dueAt)throw new DemoDrift('eligibility_changed');
   const state=await currentState(e,true,true),bindings=parseStoredDemoCatalog(e.catalog_products_json);
   if(state.hash!==e.expected_hash||state.hash!==member.expectedHash||
      state.catalog.business.content_version!==member.expectedContentVersion||
      state.draft.version!==member.expectedDraftVersion||state.publication.revision!==member.expectedPageRevision||
      state.draft.version!==state.publication.draftVersion||digest(state.draft.content)!==digest(state.publication.content))throw new DemoDrift('content_changed');
   if(digest(state.categories)!==digest(['food-farming'])||!state.location||!state.discovery||
      state.location.category_key!==target.reviewedPrimary||state.location.version!==state.location.reviewed_version||
      state.location.version!==member.proposalVersion||Number(state.location.updated_at)!==member.proposalUpdatedAt||
      Number(state.location.updated_at)!==Number(state.discovery.updated_at)||
      Number(state.discovery.approved_at)<=0||state.discovery.is_excluded!==0||
      bindings.length!==4||digest(bindings.map(p=>p.productId))!==digest(member.productIds)||
      digest(state.catalog.products.map(p=>p.id).sort((a,b)=>a-b))!==digest(member.productIds)||
      state.catalog.products.some(p=>!p.is_published||p.offering_kind==='service'||p.currency!=='ETB')||
      e.scenario_key!==bindings[0].scenarioKey)throw new DemoDrift('eligibility_changed');
   const parameters=parseDemoScenarioParameters(JSON.parse(e.parameters_json));
   if(digest(parameters.businessCategories)!==digest(['food-farming'])||
      bindings.some(binding=>digest(binding.parameters.businessCategories)!==digest(['food-farming'])))throw new DemoDrift('content_changed');
   const catalogProductsJson=JSON.stringify(bindings.map(binding=>({...binding,parameters:{...binding.parameters,businessCategories:categories}})));
   const parametersJson=JSON.stringify({...parameters,businessCategories:categories});
   if(catalogProductsJson.length>80000||parametersJson.length>4000)throw new DemoDrift('content_changed');
   checked.push({enrollment:e,actor:state.actor,catalogProductsJson,parametersJson});
  }
  for(const {enrollment} of checked)await runtimeRun("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'agriculture-growers')",[enrollment.business_id]);
  for(const {enrollment,parametersJson,catalogProductsJson} of checked){
   const after=await currentState(enrollment,true,true);
   if(digest(after.categories)!==digest(categories))throw new DemoDrift('content_changed');
   const updated=await runtimeRun('UPDATE demo_simulator_enrollments SET parameters_json=?,catalog_products_json=?,expected_hash=? WHERE business_id=? AND expected_hash=?',
    [parametersJson,catalogProductsJson,after.hash,enrollment.business_id,enrollment.expected_hash]);
   if(updated.changes!==1)throw new DemoDrift('content_changed');
  }
  const finalMemberships=await runtimeGet<{total:number}>("SELECT COUNT(*) total FROM business_industries WHERE industry_key='agriculture-growers'");
  if(Number(finalMemberships?.total)!==AGRICULTURE_CORRECTION_TARGETS.length)throw new DemoDrift('content_changed');
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'demo.category_corrected',?,'')",
   [checked[0].actor.id,checked[0].enrollment.business_id,JSON.stringify({automation:'demo-category-maintenance',operationKey:input.operationKey,payloadHash,
    businessIds:input.members.map(member=>member.businessId),categories})]);
  return {duplicate:false};
 });
}

const unenrolledMediaTargets={50:'demo-dara-clay-works',62:'demo-wabi-bottled-water'} as const;
type UnenrolledMediaPhase='admission'|'eligibility'|'receipt'|'reviewed_before'|'retained_baseline'|'process_cas'|
 'product_1'|'product_2'|'product_3'|'product_4'|'page'|'postcondition'|'audit';
const unenrolledMediaFailurePhases=new WeakMap<object,UnenrolledMediaPhase>();
function unenrolledMediaFailureCode(error:unknown){
 if(error instanceof DemoDrift)return error.reason;
 if(error instanceof ProductUpkeepError){
  const allowed=new Set(['invalid_command','invalid_product_kind','service_note_required','forbidden',
   'stale_version','idempotency_conflict','foreign_media','demo_video_forbidden','structure_not_found','write_conflict']);
  return allowed.has(error.code)?error.code:'product_upkeep';
 }
 if(error instanceof RevisionError)return 'revision_validation';
 if(error instanceof OwnerPageError)return 'page_validation';
 return 'unexpected';
}

async function unenrolledMediaState(businessId:50|62,actorUserId:number){
 const handle=unenrolledMediaTargets[businessId];
 const actor=await runtimeUserById(actorUserId),reviewer=configuredReviewer();
 if(!actor||actor.role!=='admin'||actor.access_role!=='platform_admin'||
   await currentBusinessAuthority(actor,businessId,true)!=='administrator'||
   reviewer?.email===actor.email.toLowerCase())throw new DemoDrift('eligibility_changed');
 const link=await runtimeGet<{provider_user_id:string}>(
  "SELECT provider_user_id FROM auth_identity_links WHERE user_id=? AND provider='supabase' FOR SHARE",[actor.id]);
 if(reviewer?.providerId&&reviewer.providerId===link?.provider_user_id)throw new DemoDrift('eligibility_changed');
 await runtimeGet('SELECT business_id FROM owner_page_drafts WHERE business_id=? FOR UPDATE',[businessId]);
 const business=await runtimeGet<{id:number;is_demo:number;status:string;handle:string}>(
  'SELECT id,is_demo,status,handle FROM businesses WHERE id=? FOR UPDATE',[businessId]);
 if(!business||business.is_demo!==1||business.status!=='active'||business.handle!==handle||
   await runtimeGet('SELECT 1 FROM demo_simulator_enrollments WHERE business_id=?',[businessId]))throw new DemoDrift('eligibility_changed');
 const linked=await runtimeGet<{total:number}>('SELECT COUNT(*) total FROM users WHERE business_id=?',[businessId]);
 if(Number(linked?.total)!==0)throw new DemoDrift('eligibility_changed');
 await runtimeAll('SELECT id FROM products WHERE business_id=? ORDER BY id FOR UPDATE',[businessId]);
 const catalog=await runtimeCatalogByBusinessId(businessId,true),draft=await ownerPagePort.read(businessId),publication=await pagePublicationPort.latest(businessId);
 if(!catalog||!draft||!publication?.content||
   draft.updatedBy!==actor.id||publication.publishedBy!==actor.id||
   digest(catalog.products.map(p=>p.id))!==digest(businessId===50?[197,198,199,200]:[245,246,247,248])||
   catalog.products.some(p=>!p.is_published||p.offering_kind==='service'||p.currency!=='ETB')||
   draft.version!==publication.draftVersion||digest(draft.content)!==digest(publication.content))throw new DemoDrift('eligibility_changed');
 const categories=(await runtimeAll<{industry_key:string}>('SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key',[businessId])).map(row=>row.industry_key);
 const location=await runtimeGet<{version:number;reviewed_version:number}>('SELECT version,reviewed_version FROM owner_location_proposals WHERE business_id=? FOR SHARE',[businessId]);
 const discovery=await runtimeGet('SELECT * FROM business_discovery_profiles WHERE business_id=?',[businessId]);
 if(location&&location.version!==location.reviewed_version||ownerPageImageKey(businessId,draft.content.heroImage))throw new DemoDrift('eligibility_changed');
 return {actor,catalog,draft,publication,categories,location,discovery,
  hash:digest({catalog,draft,publication,categories,location,discovery})};
}

/** One-time ordinary publication for two unenrolled legacy demos; inverse plans roll back. */
export async function correctUnenrolledDemoMedia(raw:unknown){
 const input=parseUnenrolledDemoMediaCorrection(raw),payloadHash=digest(input);
 let phase:UnenrolledMediaPhase='admission';
 try{return await runtimeTransaction(async()=>{
  await runtimeRun('SELECT pg_advisory_xact_lock(6870619271382)');
  if(!await schemaReady())throw Error('The demo schema is not ready.');
  const control=await runtimeGet<Control & {pause_reason:string}>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||control.enabled||control.pause_reason!=='operator')throw Error('Pause the demo service explicitly before media maintenance.');
  phase='eligibility';
  const state=await unenrolledMediaState(input.businessId,input.actorUserId);
  phase='receipt';
  const receipt=await runtimeGet<{payload_hash:string}>(`SELECT detail::jsonb->>'payloadHash' payload_hash FROM audit_logs
   WHERE business_id=? AND action='demo.unenrolled_media_corrected'
   AND CASE WHEN action='demo.unenrolled_media_corrected' THEN detail::jsonb->>'operationKey' END=? ORDER BY id DESC LIMIT 1`,[input.businessId,input.operationKey]);
  if(receipt){
   if(receipt.payload_hash!==payloadHash)throw Error('This demo media operation has different reviewed content.');
   if(state.catalog.business.process_video_ref!==input.processVideoAfter||
     state.draft.content.videoUrl!==productVideoWatchUrl(input.coverVideoRef)||
     input.products.some(item=>digest(item.afterMedia)!==digest(productMedia(state.catalog.products.find(p=>p.id===item.productId)!))))throw new DemoDrift('content_changed');
   return {duplicate:true};
  }
  phase='reviewed_before';
  if(input.expectedContentVersion!==state.catalog.business.content_version||
   input.expectedDraftVersion!==state.draft.version||input.expectedPageRevision!==state.publication.revision||
   input.coverBefore!==state.draft.content.videoUrl||
   input.processVideoBefore!==state.catalog.business.process_video_ref||
   input.products.some(item=>digest(item.beforeMedia)!==digest(productMedia(state.catalog.products.find(p=>p.id===item.productId)!))))throw new DemoDrift('content_changed');
  const size=await runtimeGet<{bytes:string}>('SELECT pg_database_size(current_database()) bytes');
  if(!size||!Number.isFinite(Number(size.bytes))||Number(size.bytes)>=Number(control.database_limit_bytes))throw Error('Demo media storage budget reached.');
  let version=state.catalog.business.content_version;
  const startVersion=version;
  phase='retained_baseline';
  // A prior immutable version may reflect older metadata from before this
  // maintenance. Preserve it unchanged and reserve a new, exact version of the
  // current TikTok catalog before replacing the process video.
  const baseline=catalogToRevisionSnapshotV4(state.catalog);
  const retained=await runtimeGet<{snapshot_json:string}>(
   'SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=? FOR SHARE',
   [input.businessId,version]);
  if(input.direction==='apply'){
   if(retained)requireRevisionSnapshotV4(retained.snapshot_json,SHOWROOM_COMPONENT_BANK_LATEST,
    processVideoPolicyForCatalog(state.catalog));
   else await runtimeRun(`INSERT INTO published_catalog_versions
    (business_id,content_version,snapshot_json,change_kind,actor_user_id)
    VALUES(?,?,?,'baseline',?)`,[input.businessId,version,JSON.stringify(baseline),state.actor.id]);
   if(await runtimeGet('SELECT 1 FROM published_catalog_versions WHERE business_id=? AND content_version=? FOR SHARE',
    [input.businessId,version+1]))throw new DemoDrift('content_changed');
   const reserved=await runtimeRun(`UPDATE businesses SET content_version=content_version+1
    WHERE id=? AND content_version=? AND process_video_ref=? AND is_demo=1 AND status='active'`,
    [input.businessId,version,input.processVideoBefore]);
   if(reserved.changes!==1)throw new DemoDrift('content_changed');
   version++;
   await runtimeRun(`INSERT INTO published_catalog_versions
    (business_id,content_version,snapshot_json,change_kind,actor_user_id)
    VALUES(?,?,?,'baseline',?)`,[input.businessId,version,JSON.stringify(baseline),state.actor.id]);
  }else if(retained){
   const checked=requireRevisionSnapshotV4(retained.snapshot_json,SHOWROOM_COMPONENT_BANK_LATEST,
    processVideoPolicyForCatalog(state.catalog));
   if(digest(checked)!==digest(baseline))throw new DemoDrift('content_changed');
  }else await runtimeRun(`INSERT INTO published_catalog_versions
   (business_id,content_version,snapshot_json,change_kind,actor_user_id)
   VALUES(?,?,?,'baseline',?)`,[input.businessId,version,JSON.stringify(baseline),state.actor.id]);
  phase='process_cas';
  const processChanged=await runtimeRun(`UPDATE businesses SET process_video_ref=?
   WHERE id=? AND content_version=? AND process_video_ref=? AND is_demo=1 AND status='active'`,
   [input.processVideoAfter,input.businessId,version,input.processVideoBefore]);
  if(processChanged.changes!==1)throw new DemoDrift('content_changed');
  for(const [index,item] of input.products.entries()){
   phase=(`product_${index+1}` as UnenrolledMediaPhase);
   const p=state.catalog.products.find(p=>p.id===item.productId)!;
   const result=await executeBasicProductUpkeep(postgresProductUpkeepPort,state.actor,{
    kind:'update',businessId:input.businessId,productId:p.id,expectedContentVersion:version,
    idempotencyKey:`demo_legacy_media_${input.operationKey}_${p.id}`,name:p.name,description:p.description,
    availability:p.availability,quantityMode:p.quantity_mode,
    orderScope:p.order_scope??'unspecified',priceMinor:p.price_minor,quantityUnit:p.quantity_unit,
    highlights:parseOfferingHighlightsJson(p.highlights_json),capacitySummary:p.capacity_summary,
    minimumOrderSummary:p.minimum_order_summary,leadTimeSummary:p.lead_time_summary,
    media:item.afterMedia,videoRef:item.afterMedia.find(m=>m.kind==='video')!.ref,
    categoryId:p.category_id,imageAction:'keep',preserveMetadata:true,
    serviceNote:'S197 reviewed fictional-demo video correction.',
   },null);
   version=result.contentVersion;
  }
  phase='page';
  const videoUrl=productVideoWatchUrl(input.coverVideoRef);
  await saveOwnerPageAndPublication(state.actor,input.businessId,
   {action:'save',version:state.draft.version,content:{...state.draft.content,videoUrl}});
  phase='postcondition';
  const after=await unenrolledMediaState(input.businessId,input.actorUserId);
  if(after.catalog.business.content_version!==version||after.catalog.business.process_video_ref!==input.processVideoAfter||
   after.draft.version!==state.draft.version+1||
   after.publication.revision!==state.publication.revision+1||after.draft.content.videoUrl!==videoUrl||
   input.products.some(item=>digest(item.afterMedia)!==digest(productMedia(after.catalog.products.find(p=>p.id===item.productId)!))))throw new DemoDrift('content_changed');
  phase='audit';
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'demo.unenrolled_process_video_corrected',?,'')",
   [state.actor.id,input.businessId,JSON.stringify({automation:'demo-media-maintenance',direction:input.direction,
    operationKey:input.operationKey,beforeRefHash:digest(input.processVideoBefore),afterRefHash:digest(input.processVideoAfter),
    baselineVersion:input.direction==='apply'?startVersion+1:startVersion,contentVersionDelta:version-startVersion})]);
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'demo.unenrolled_media_corrected',?,'')",
   [state.actor.id,input.businessId,JSON.stringify({automation:'demo-media-maintenance',direction:input.direction,
    actorRole:input.actorRole,operationKey:input.operationKey,payloadHash,beforeStateHash:state.hash,afterStateHash:after.hash,
    processBeforeHash:digest(input.processVideoBefore),processAfterHash:digest(input.processVideoAfter),
    products:input.products.map(p=>p.productId)})]);
  return {duplicate:false};
 });}catch(error){
  if(error&&typeof error==='object')unenrolledMediaFailurePhases.set(error,phase);
  throw error;
 }
}
async function advance(e:Enrollment,slot:number,now:number){
 const products=parseStoredDemoCatalog(e.catalog_products_json),state=await currentState(e,products.length>0);
 if(state.hash!==e.expected_hash)throw new DemoDrift('content_changed');
 const next=nextDemoScenarioStage(e.scenario_key,e.scenario_version,e.stage,e.cycle),parameters=parseDemoScenarioParameters(JSON.parse(e.parameters_json));
 if(parameters.productName!==state.product.name||parameters.productKind!==state.product.offering_kind||digest([...parameters.businessCategories].sort())!==digest(state.categories))throw new DemoDrift('eligibility_changed');
 const plan=demoScenarioStage(e.scenario_key,e.scenario_version,next.stage,parameters),p=state.product,f=plan.product;
 const currentFacts={availability:p.availability,priceMinor:p.price_minor,quantityUnit:p.quantity_unit,minimumOrderSummary:p.minimum_order_summary,capacitySummary:p.capacity_summary,leadTimeSummary:p.lead_time_summary,description:p.description};
 const nextFacts={...f,description:[plan.productUpdate,e.baseline_description].filter(Boolean).join('\n\n')};
 let publicPlan=plan;
 if(products.length){
  if(digest(products.map(p=>p.productId))!==digest(state.catalog.products.map(p=>p.id).sort((a,b)=>a-b)))throw new DemoDrift('content_changed');
  const plans=demoCatalogStage(products,next.stage),commands=plans.map(({binding,plan})=>{
   const p=state.catalog.products.find(p=>p.id===binding.productId)!;
   if(p.name!==binding.parameters.productName||p.offering_kind!==binding.parameters.productKind||
     digest([...binding.parameters.businessCategories].sort())!==digest(state.categories))throw new DemoDrift('eligibility_changed');
   return {kind:'update',businessId:e.business_id,productId:p.id,expectedContentVersion:state.catalog.business.content_version,
    idempotencyKey:`demo_catalog_${e.business_id}_${next.cycle}_${next.stage}_${p.id}`,
    name:p.name,...plan.product,description:[plan.productUpdate,binding.baselineDescription].filter(Boolean).join('\n\n'),
    offeringKind:p.offering_kind,quantityMode:p.quantity_mode,orderScope:p.order_scope??'unspecified',
    highlights:parseOfferingHighlightsJson(p.highlights_json),videoRef:p.video_ref,categoryId:p.category_id,
    imageAction:'keep',preserveMetadata:true,updateSellingFacts:true,updateListingState:true};
  });
  await executeProductUpkeepBatch(postgresProductUpkeepPort,state.actor,commands);
  publicPlan=plans[0].plan;
 }else if(digest(currentFacts)!==digest(nextFacts))await executeBasicProductUpkeep(postgresProductUpkeepPort,state.actor,{
  kind:'update',businessId:e.business_id,productId:p.id,expectedContentVersion:state.catalog.business.content_version,
  idempotencyKey:demoScenarioCommandKey(e.business_id,e.scenario_key,e.scenario_version,next.stage,next.cycle),
  name:p.name,...nextFacts,offeringKind:p.offering_kind,quantityMode:p.quantity_mode,
  orderScope:p.order_scope??'unspecified',highlights:parseOfferingHighlightsJson(p.highlights_json),videoRef:p.video_ref,
  categoryId:p.category_id,imageAction:'keep',preserveMetadata:true,updateSellingFacts:true,updateListingState:true,
 },null);
 const baseline=parseShopPageContent(JSON.parse(e.baseline_page_json));
 // Both current clients display About before the introductory fallback. Publish
 // the stage there as well, preserving the original story without accumulating
 // copies on later cycles. Enrollment reserves room within the ordinary limit.
 const content:ShopPageContent={...state.draft.content,introduction:`${publicPlan.stage.title}. ${publicPlan.businessUpdate}`,
  about:[publicPlan.businessUpdate,baseline.about||baseline.introduction].filter(Boolean).join('\n\n')};
 if(digest(content)!==digest(state.draft.content))await saveOwnerPageAndPublication(state.actor,e.business_id,{action:'save',version:state.draft.version,content});
 const after=await currentState(e,products.length>0);
 await runtimeRun(`UPDATE demo_simulator_enrollments SET stage=?,cycle=?,stage_started_at=?,due_at=?,expected_hash=? WHERE business_id=?`,
  [next.stage,next.cycle,now,now+plan.durationMs,after.hash,e.business_id]);
 await audit(state.actor,e.business_id,{kind:'advanced',scenario:e.scenario_key,version:e.scenario_version,stage:plan.stage.key,cycle:next.cycle,slot,
  ...(products.length?{products:products.map(p=>p.productId)}:{})});
 return next;
}

function parseEnrollmentRequest(raw:string,businessId:number):DemoEnrollmentInput{
 const value:unknown=JSON.parse(raw),keys=['businessId','handle','ownerUserId','providerUserId','productId','scenarioKey','parameters','initializeUnit','expectedContentVersion','expectedDraftVersion','expectedPageRevision','catalogProducts'];
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))throw Error('Invalid private enrollment request.');
 const v=value as Record<string,unknown>;
 if(v.businessId!==businessId||!['expectedContentVersion','expectedDraftVersion','expectedPageRevision'].every(k=>Number.isSafeInteger(v[k])&&Number(v[k])>=0)||
  v.initializeUnit!==undefined&&typeof v.initializeUnit!=='boolean')throw Error('Invalid private enrollment request.');
 return {...v,parameters:parseDemoScenarioParameters(v.parameters),...(v.catalogProducts!==undefined?{catalogProducts:parseDemoCatalogInputs(v.catalogProducts)}:{})} as DemoEnrollmentInput;
}
type CopyAuditFields={businessDescription:string;page:{about:string;introduction:string};
 products:Array<{id:number;description:string;leadTimeSummary:string}>};
const copyAuditFields=(copy:PublicDemoCopy):CopyAuditFields=>({
 businessDescription:copy.businessDescription,
 page:{about:copy.page.about,introduction:copy.page.introduction},
 products:copy.products.map(p=>({id:p.id,description:p.description,leadTimeSummary:p.leadTimeSummary})),
});
const publicCopyFromState=(state:Pick<Awaited<ReturnType<typeof currentState>>,'catalog'|'draft'>):PublicDemoCopy=>({
 businessDescription:state.catalog.business.description,
 page:state.draft.content,
 products:[...state.catalog.products].sort((a,b)=>a.id-b.id).map(p=>({id:p.id,description:p.description,
  leadTimeSummary:p.lead_time_summary||''})),
});
type CopyPhase='admission'|'eligibility'|'receipt'|'reviewed_before'|'retained'|
 'products'|'business'|'page'|'postcondition'|'enrollment'|'audit';
const copyFailurePhases=new WeakMap<object,CopyPhase>();

/** One selected-field correction for a reviewed public demo. It uses ordinary
 * catalog/page writes and updates the simulator hash without advancing stage.
 * The request is bound inside the database; no private row export is needed. */
export async function correctDemoPublicCopy(raw:unknown){
 const input=parseDemoCopyCorrection(raw),payloadHash=digest(input);
 let phase:CopyPhase='admission';
 try{return await runtimeTransaction(async()=>{
  await runtimeRun('SELECT pg_advisory_xact_lock(6870619271382)');
  if(!await schemaReady())throw Error('The demo schema is not ready.');
  const control=await runtimeGet<Control & {pause_reason:string}>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||control.enabled||control.pause_reason!=='operator')
   throw Error('Pause the demo service explicitly before copy maintenance.');
  phase='eligibility';
  const e=input.cohort==='enrolled'
   ?await runtimeGet<Enrollment>('SELECT * FROM demo_simulator_enrollments WHERE business_id=? FOR UPDATE',[input.businessId])
   :null;
  if(input.cohort==='enrolled'&&(!e||e.status!=='active'||e.reason||e.handle!==input.handle))
   throw new DemoDrift('eligibility_changed');
  const legacyActor=input.cohort==='legacy'
   ?await runtimeGet<{updated_by:number}>('SELECT updated_by FROM owner_page_drafts WHERE business_id=?',[input.businessId])
   :null;
  const state=e?await currentState(e,true):
   await unenrolledMediaState(input.businessId as 50|62,Number(legacyActor?.updated_by));
  if(e&&state.hash!==e.expected_hash)throw new DemoDrift('content_changed');
  if(state.catalog.business.handle!==input.handle||
   state.draft.version!==state.publication.draftVersion||
   digest(state.draft.content)!==digest(state.publication.content)||
   state.catalog.products.length!==4)throw new DemoDrift('content_changed');
  const copy=publicCopyFromState(state),beforeFields=copyAuditFields(copy);
  phase='receipt';
  const receipt=await runtimeGet<{detail:string}>(`SELECT detail FROM audit_logs WHERE business_id=?
   AND action='demo.copy_corrected' AND detail::jsonb->>'operationKey'=?
   ORDER BY id DESC LIMIT 1`,[input.businessId,input.operationKey]);
  if(receipt){
   const prior=JSON.parse(receipt.detail) as {payloadHash?:string;afterPublicHash?:string};
   if(prior.payloadHash!==payloadHash||prior.afterPublicHash!==digest(beforeFields))
    throw new DemoDrift('content_changed');
   return {duplicate:true};
  }
  phase='reviewed_before';
  if(state.catalog.business.content_version!==input.expectedContentVersion||
   state.draft.version!==input.expectedDraftVersion||
   state.publication.revision!==input.expectedPageRevision||
   (e&&(e.expected_hash!==input.expectedHash||e.stage!==input.expectedStage||
    e.cycle!==input.expectedCycle||Number(e.due_at)!==input.expectedDueAt)))
   throw new DemoDrift('content_changed');
  const baseline=e?parseShopPageContent(JSON.parse(e.baseline_page_json)):null;
  let desired:PublicDemoCopy,baselineAfter:ShopPageContent|null=null;
  if(input.direction==='apply'){
   if(e){
    const plan=planEnrolledDemoCopy({businessName:state.catalog.business.name,copy,
     baseline:baseline!,bindings:parseStoredDemoCatalog(e.catalog_products_json),stage:e.stage});
    desired=plan.after;baselineAfter=plan.baselineAfter;
   }else desired=planLegacyDemoCopy({businessId:input.businessId,
    businessName:state.catalog.business.name,copy}).after;
  }else{
   const applied=await runtimeGet<{detail:string}>(`SELECT detail FROM audit_logs WHERE business_id=?
    AND action='demo.copy_corrected' AND detail::jsonb->>'direction'='apply'
    ORDER BY id DESC LIMIT 1`,[input.businessId]);
   if(!applied)throw new DemoDrift('content_changed');
   const prior=JSON.parse(applied.detail) as {beforePublic?:CopyAuditFields;afterPublicHash?:string;
    baselineBefore?:{about:string;introduction:string};baselineAfterHash?:string};
   if(!prior.beforePublic||prior.afterPublicHash!==digest(beforeFields)||
    (e&&(!baseline||!prior.baselineBefore||prior.baselineAfterHash!==
     digest({about:baseline.about,introduction:baseline.introduction})))||
    prior.beforePublic.products.length!==copy.products.length||
    prior.beforePublic.products.some((p,i)=>p.id!==copy.products[i].id))
    throw new DemoDrift('content_changed');
   desired={businessDescription:prior.beforePublic.businessDescription,
    page:{...copy.page,...prior.beforePublic.page},
    products:prior.beforePublic.products};
   baselineAfter=e?{...baseline!,...prior.baselineBefore}:null;
  }
  if(desired.products.length!==4||desired.products.some((p,i)=>p.id!==copy.products[i].id))
   throw new DemoDrift('content_changed');
  const size=await runtimeGet<{bytes:string}>('SELECT pg_database_size(current_database()) bytes');
  if(!size||!Number.isFinite(Number(size.bytes))||Number(size.bytes)>=Number(control.database_limit_bytes))
   throw Error('Demo copy storage budget reached.');
  const changedProducts=desired.products.filter((p,i)=>p.description!==copy.products[i].description||
   p.leadTimeSummary!==copy.products[i].leadTimeSummary);
  const changedBusiness=desired.businessDescription!==copy.businessDescription;
  let version=state.catalog.business.content_version;
  if(changedProducts.length||changedBusiness){
   phase='retained';
   if(await runtimeGet('SELECT 1 FROM published_catalog_versions WHERE business_id=? AND content_version=? FOR SHARE',
    [input.businessId,version+1]))throw new DemoDrift('content_changed');
   const baselineSnapshot=catalogToRevisionSnapshotV4(state.catalog);
   const reserved=await runtimeRun(`UPDATE businesses SET content_version=?
    WHERE id=? AND handle=? AND is_demo=1 AND status='active' AND content_version=? AND description=?`,
    [version+1,input.businessId,input.handle,version,copy.businessDescription]);
   if(reserved.changes!==1)throw new DemoDrift('content_changed');
   version++;
   await runtimeRun(`INSERT INTO published_catalog_versions
    (business_id,content_version,snapshot_json,change_kind,actor_user_id)
    VALUES(?,?,?,'baseline',?)`,[input.businessId,version,JSON.stringify(baselineSnapshot),state.actor.id]);
  }
  phase='products';
  const commands=changedProducts.map(item=>{
   const p=state.catalog.products.find(p=>p.id===item.id)!;
   return {kind:'update',businessId:input.businessId,productId:p.id,
    expectedContentVersion:version,idempotencyKey:`demo_copy_${input.operationKey}_${p.id}`,
    name:p.name,description:item.description,availability:p.availability,
    offeringKind:p.offering_kind,quantityMode:p.quantity_mode,
    orderScope:p.order_scope??'unspecified',priceMinor:p.price_minor,
    quantityUnit:p.quantity_unit,minimumOrderSummary:p.minimum_order_summary,
    capacitySummary:p.capacity_summary,leadTimeSummary:item.leadTimeSummary,
    highlights:parseOfferingHighlightsJson(p.highlights_json),videoRef:p.video_ref,
    categoryId:p.category_id,imageAction:'keep',preserveMetadata:true,
    updateSellingFacts:true,updateListingState:true};
  });
  if(commands.length>=2){
   const result=await executeProductUpkeepBatch(postgresProductUpkeepPort,state.actor,commands);
   version=result[0].contentVersion;
  }else if(commands.length===1){
   const result=await executeBasicProductUpkeep(postgresProductUpkeepPort,state.actor,commands[0],null);
   version=result.contentVersion;
  }
  phase='business';
  if(changedBusiness){
   const updated=await runtimeRun(`UPDATE businesses SET description=?,content_version=?
    WHERE id=? AND handle=? AND is_demo=1 AND status='active' AND content_version=? AND description=?`,
    [desired.businessDescription,version+1,input.businessId,input.handle,version,copy.businessDescription]);
   if(updated.changes!==1)throw new DemoDrift('content_changed');
   version++;
   const catalog=await runtimeCatalogByBusinessId(input.businessId,true);
   if(!catalog)throw new DemoDrift('content_changed');
   await runtimeRun(`INSERT INTO published_catalog_versions
    (business_id,content_version,snapshot_json,change_kind,actor_user_id)
    VALUES(?,?,?,'publication',?)`,
    [input.businessId,version,JSON.stringify(catalogToRevisionSnapshotV4(catalog)),state.actor.id]);
  }
  phase='page';
  if(digest(desired.page)!==digest(copy.page))
   await saveOwnerPageAndPublication(state.actor,input.businessId,
    {action:'save',version:state.draft.version,content:desired.page});
  phase='postcondition';
  const after=e?await currentState(e,true):
   await unenrolledMediaState(input.businessId as 50|62,Number(legacyActor?.updated_by));
  const afterCopy=publicCopyFromState(after);
  const businessOther=(b:typeof state.catalog.business)=>({...b,description:'',content_version:0});
  const productOther=(p:typeof state.catalog.products[number])=>({...p,description:'',
   lead_time_summary:''});
  if(digest(copyAuditFields(afterCopy))!==digest(copyAuditFields(desired))||
   after.catalog.business.content_version!==version||
   digest(businessOther(after.catalog.business))!==digest(businessOther(state.catalog.business))||
   digest(after.catalog.products.map(productOther))!==digest(state.catalog.products.map(productOther))||
   digest({...after.draft.content,about:'',introduction:''})!==
    digest({...state.draft.content,about:'',introduction:''})||
   digest({...after.publication.content,about:'',introduction:''})!==
    digest({...state.publication.content,about:'',introduction:''})||
   after.draft.version!==state.draft.version+(digest(desired.page)!==digest(copy.page)?1:0)||
   after.publication.revision!==state.publication.revision+(digest(desired.page)!==digest(copy.page)?1:0)||
   digest(after.categories)!==digest(state.categories)||
   digest(after.location??null)!==digest(state.location??null)||
   digest(after.discovery??null)!==digest(state.discovery??null))
   throw new DemoDrift('content_changed');
  phase='enrollment';
  if(e){
   const currentBaseline=await runtimeGet<{baseline_page_json:string}>(
    'SELECT baseline_page_json FROM demo_simulator_enrollments WHERE business_id=? FOR UPDATE',[input.businessId]);
   if(!currentBaseline||digest(JSON.parse(currentBaseline.baseline_page_json))!==digest(baseline))
    throw new DemoDrift('content_changed');
   const acknowledged=await runtimeRun(`UPDATE demo_simulator_enrollments
    SET expected_hash=?,baseline_page_json=?
    WHERE business_id=? AND status='active' AND reason='' AND expected_hash=?
    AND stage=? AND cycle=? AND due_at=?`,
    [after.hash,JSON.stringify(baselineAfter),input.businessId,e.expected_hash,
     e.stage,e.cycle,e.due_at]);
   if(acknowledged.changes!==1)throw new DemoDrift('content_changed');
  }
  phase='audit';
  await runtimeRun(`INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash)
   VALUES(?,?,'demo.copy_corrected',?,'')`,
   [state.actor.id,input.businessId,JSON.stringify({automation:'demo-copy-maintenance',
    direction:input.direction,operationKey:input.operationKey,payloadHash,
    beforeStateHash:state.hash,afterStateHash:after.hash,
    beforePublic:beforeFields,afterPublic:copyAuditFields(afterCopy),
    afterPublicHash:digest(copyAuditFields(afterCopy)),
    baselineBefore:baseline?{about:baseline.about,introduction:baseline.introduction}:null,
    baselineAfterHash:baselineAfter?digest({about:baselineAfter.about,
     introduction:baselineAfter.introduction}):null,
    contentVersion:version,draftVersion:after.draft.version,pageRevision:after.publication.revision})]);
  return {duplicate:false};
 });}catch(error){
  if(error&&typeof error==='object')copyFailurePhases.set(error,phase);
  throw error;
 }
}

async function processEnrollmentRequests(now:number,copyOnly=false,background=false){
 const started=Date.now();
 const requests=await runtimeAll<{business_id:number;input_json:string}>(`SELECT business_id,input_json FROM demo_simulator_requests WHERE status='pending' ORDER BY requested_at,business_id LIMIT ${background?4:8} FOR UPDATE`);
 if(copyOnly)for(const request of requests){
  let raw:unknown;
  try{raw=JSON.parse(request.input_json);}catch{throw Error('Unexpected pending request during copy maintenance.');}
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||
   (raw as Record<string,unknown>).kind!=='copy_correction')
   throw Error('Unexpected pending request during copy maintenance.');
 }
 let enrolled=0,enrollmentRejected=0,mediaCorrected=0,categoryCorrected=0,copyCorrected=0;
 for(const request of requests){
  if(Date.now()-started>=(background?150000:12000)||
   background&&Date.now()>=COPY_MAINTENANCE_END-10000)break;
  await runtimeRun('SAVEPOINT demo_enrollment');
  let accepted=false;
  let unenrolledCorrection:UnenrolledDemoMediaCorrection|null=null;
  let processCorrection:DemoProcessMediaCorrection|null=null;
  let copyCorrection:DemoCopyCorrection|null=null;
  try{
   const raw:unknown=JSON.parse(request.input_json);
   if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&(raw as Record<string,unknown>).kind==='copy_correction'){
    const correction=parseDemoCopyCorrection(raw);
    if(correction.businessId!==request.business_id)throw Error('Invalid private copy correction target.');
    copyCorrection=correction;
    await correctDemoPublicCopy(correction);copyCorrected++;
   }else if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&(raw as Record<string,unknown>).kind==='category_correction_batch'){
    const correction=parseDemoCategoryCorrection(raw);
    if(correction.members[0].businessId!==request.business_id)throw Error('Invalid private category correction target.');
    await correctDemoCategoryBatch(correction);
    categoryCorrected++;
   }else if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&
    (raw as Record<string,unknown>).kind==='process_media_correction'){
    const correction=parseDemoProcessMediaCorrection(raw);
    if(correction.businessId!==request.business_id)throw Error('Invalid private process media target.');
    processCorrection=correction;
    await correctDemoProcessMedia(correction);mediaCorrected++;
   }else if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&
    ['media_correction','unenrolled_media_correction'].includes(String((raw as Record<string,unknown>).kind))){
    const correction=parseQueuedDemoMediaCorrection(raw,request.business_id);
    if(correction.kind==='media_correction')await correctDemoMedia(correction);
    else{unenrolledCorrection=correction;await correctUnenrolledDemoMedia(correction);}
    mediaCorrected++;
   }else{await enrollDemoScenario(parseEnrollmentRequest(request.input_json,request.business_id),now);enrolled++;}
   accepted=true;
  }
  catch(error){
   await runtimeRun('ROLLBACK TO SAVEPOINT demo_enrollment');enrollmentRejected++;
   if(unenrolledCorrection){
    const phase=error&&typeof error==='object'?unenrolledMediaFailurePhases.get(error)??'admission':'admission';
    await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(NULL,?,'demo.unenrolled_media_rejected',?,'')",
     [unenrolledCorrection.businessId,JSON.stringify({automation:'demo-media-maintenance',
      operationKey:unenrolledCorrection.operationKey,phase,code:unenrolledMediaFailureCode(error)})]);
   }
   if(processCorrection){
    const phase=error&&typeof error==='object'?processMediaFailurePhases.get(error)??'admission':'admission';
    await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(NULL,?,'demo.process_media_rejected',?,'')",
     [processCorrection.businessId,JSON.stringify({automation:'demo-media-maintenance',
      operationKey:processCorrection.operationKey,phase,code:unenrolledMediaFailureCode(error)})]);
   }
   if(copyCorrection){
    const phase=error&&typeof error==='object'?copyFailurePhases.get(error)??'admission':'admission';
    await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(NULL,?,'demo.copy_rejected',?,'')",
     [copyCorrection.businessId,JSON.stringify({automation:'demo-copy-maintenance',
      operationKey:copyCorrection.operationKey,phase,code:unenrolledMediaFailureCode(error)})]);
   }
  }
  await runtimeRun('RELEASE SAVEPOINT demo_enrollment');
  await runtimeRun('UPDATE demo_simulator_requests SET status=?,reason=?,processed_at=? WHERE business_id=?',
   [accepted?'accepted':'rejected',accepted?'':'enrollment_failed',now,request.business_id]);
 }
 return {enrolled,enrollmentRejected,...(mediaCorrected?{mediaCorrected}:{}),
  ...(categoryCorrected?{categoryCorrected}:{}),...(copyCorrected?{copyCorrected}:{})};
}

export type DemoTickResult={enrolled?:number;enrollmentRejected?:number;mediaCorrected?:number;categoryCorrected?:number;copyCorrected?:number;status:'advanced'|'disabled'|'busy'|'duplicate'|'budget'|'schema';advanced:number;paused:number;failed:number};
// The production schedule has three daily invocations. Retain the hosted
// control row's ability to lower this cap without requiring a schema change.
const MAX_DAILY_STAGES=12;
export function canStartDemoStage(elapsedMs:number,previousStageMs:number|null){
 // Reserve the last observed full-stage cost (at least eight seconds) plus
 // three seconds for the final control update, pruning and transaction commit.
 return elapsedMs<12000&&(previousStageMs===null||elapsedMs+Math.max(previousStageMs,8000)+3000<23000);
}
/** Normal calls use hourly slots. A finite minute maintenance call admits
 * copy requests only under an explicit operator pause and cannot run stages. */
export async function runDemoSimulatorTick(now=Date.now(),slotMinutes=1,
 mode:'scheduled'|'maintenance'|'copy_background'='scheduled',requestSlot?:number):Promise<DemoTickResult>{
 if(!Number.isSafeInteger(now)||now<0)throw new Error('Invalid demo tick clock.');
 if(!Number.isSafeInteger(slotMinutes)||slotMinutes<1||slotMinutes>60)throw new Error('Invalid demo tick slot.');
 if(mode!=='scheduled'&&mode!=='maintenance'&&mode!=='copy_background')throw new Error('Invalid demo tick mode.');
 if(mode==='copy_background'&&(!isCopyMaintenanceWindow(now)||
  !Number.isSafeInteger(requestSlot)||requestSlot===undefined||requestSlot<0||
  requestSlot>Math.floor(now/60000)||Math.floor(now/60000)-requestSlot>10))
  throw new Error('Invalid finite copy background slot.');
 const started=Date.now(),slot=mode==='copy_background'?requestSlot!:
  Math.floor(now/(slotMinutes*60000))*slotMinutes,day=Math.floor(now/86400000);
 const result=(status:DemoTickResult['status']):DemoTickResult=>({status,advanced:0,paused:0,failed:0});
 return runtimeTransaction(async()=>{
  // The finite background worker may need four copy operations, each with many
  // ordinary application round trips. PostgreSQL aborts the whole transaction
  // before either the 15-minute function limit or the finite cutoff.
  const timeout=mode==='copy_background'?Math.min(180000,COPY_MAINTENANCE_END-Date.now()-5000):23000;
  if(timeout<30000&&mode==='copy_background')return result('disabled');
  await runtimeRun(`SET LOCAL transaction_timeout='${timeout}ms'`);
  await runtimeRun("SET LOCAL lock_timeout='1500ms'");await runtimeRun("SET LOCAL statement_timeout='4000ms'");
  const lock=await runtimeGet<{locked:boolean}>('SELECT pg_try_advisory_xact_lock(6870619271382) locked');
  if(!lock?.locked)return result('busy');
  if(!await schemaReady())return result('schema');
  const control=await runtimeGet<Control & {pause_reason:string}>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control)return result('disabled');
  if(mode!=='scheduled'&&(control.enabled!==0||control.pause_reason!=='operator'))return result('disabled');
  if(mode==='copy_background'){
   // A committed receipt makes a Netlify retry or manual replay of this minute
   // inert even when fresh requests arrive before the next scheduled minute.
   const detail=JSON.stringify({slot});
   const previous=await runtimeGet<{detail:string}>(
    "SELECT detail FROM audit_logs WHERE action='demo.copy_background_slot' ORDER BY id DESC LIMIT 1");
   if(previous&&Number(JSON.parse(previous.detail).slot)>=slot)return result('duplicate');
   await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(NULL,NULL,'demo.copy_background_slot',?,'')",[detail]);
  }
  if(!control.enabled){const admission=await processEnrollmentRequests(now,mode!=='scheduled',mode==='copy_background');return admission.enrolled||admission.enrollmentRejected||admission.mediaCorrected||admission.categoryCorrected||admission.copyCorrected?{...result('disabled'),...admission}:result('disabled');}
  if(Number(control.last_slot)>=slot)return result('duplicate');
  const size=await runtimeGet<{bytes:string}>('SELECT pg_database_size(current_database()) bytes');
  const used=Number(control.budget_day)===day?control.used_today:0;
  const dailyLimit=Math.min(MAX_DAILY_STAGES,control.daily_limit);
  if(Number(size?.bytes)>=Number(control.database_limit_bytes)){
   await runtimeRun("UPDATE demo_simulator_control SET enabled=0,pause_reason='database_budget' WHERE id=1");return result('budget');
  }
  // Daily exhaustion defers until tomorrow. It does not silently raise a limit.
  if(used>=dailyLimit){await runtimeRun("UPDATE demo_simulator_control SET pause_reason='daily_budget' WHERE id=1");return result('budget');}
  await runtimeRun("UPDATE demo_simulator_control SET last_slot=?,budget_day=?,used_today=?,pause_reason='' WHERE id=1",[slot,day,used]);
  const due=await runtimeAll<Enrollment>("SELECT * FROM demo_simulator_enrollments WHERE status='active' AND due_at<=? ORDER BY due_at,business_id LIMIT ? FOR UPDATE",[now,Math.min(4,dailyLimit-used)]);
  const out=result('advanced');
  let previousStageMs:number|null=null;
  for(const e of due){
   // Each full-catalog stage can make several ordinary application writes.
   // Admit another only while there is room for it and the final commit before
   // PostgreSQL's 23-second transaction and Netlify's 30-second function limits.
   if(!canStartDemoStage(Date.now()-started,previousStageMs))break;
   const stageStarted=Date.now();
   await runtimeRun('SAVEPOINT demo_stage');
   let outcome='advanced',next={stage:e.stage,cycle:e.cycle};
   try{next=nextDemoScenarioStage(e.scenario_key,e.scenario_version,e.stage,e.cycle);await advance(e,slot,now);out.advanced++;}
   catch(error){
    // Nested application transactions reuse this connection. An explicit
    // savepoint is essential: partial product/publication writes must disappear.
    await runtimeRun('ROLLBACK TO SAVEPOINT demo_stage');
    const reason=error instanceof DemoDrift?error.reason:'stage_failed';
    outcome=error instanceof DemoDrift?'paused':'failed';
    await runtimeRun("UPDATE demo_simulator_enrollments SET status='paused',reason=? WHERE business_id=?",[reason,e.business_id]);
    if(outcome==='paused')out.paused++;else out.failed++;
   }
   await runtimeRun('RELEASE SAVEPOINT demo_stage');
   await runtimeRun('INSERT INTO demo_simulator_runs(slot,business_id,scenario_key,stage,cycle,outcome,created_at) VALUES(?,?,?,?,?,?,?)',[slot,e.business_id,e.scenario_key,next.stage,next.cycle,outcome,now]);
   previousStageMs=Date.now()-stageStarted;
  }
  await runtimeRun('UPDATE demo_simulator_control SET used_today=used_today+? WHERE id=1',[out.advanced]);
  await runtimeRun('DELETE FROM demo_simulator_runs WHERE created_at<?',[now-7*86400000]);
  return out;
 });
}
