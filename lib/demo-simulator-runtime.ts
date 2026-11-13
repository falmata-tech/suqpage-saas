import {createHash} from 'node:crypto';
import {runtimeAll,runtimeGet,runtimeRun,runtimeTransaction} from './runtime-sql';
import {runtimeCatalogByBusinessId,runtimeUserById} from './catalog-runtime';
import {currentBusinessAuthority} from './staff-business-authority';
import {ownerPagePort} from './owner-page-runtime';
import {pagePublicationPort} from './owner-page-publication-runtime';
import {saveOwnerPageAndPublication} from './owner-page-save-runtime';
import {ownerPageImageKey,parseShopPageContent,type ShopPageContent} from './owner-page-domain';
import {executeBasicProductUpkeep} from './product-upkeep';
import {postgresProductUpkeepPort} from './product-upkeep-postgres';
import {parseOfferingHighlightsJson} from './offering-presentation';
import {configuredReviewer} from './reviewer-access-runtime';
import {demoScenarioCommandKey,demoScenarioStage,nextDemoScenarioStage,parseDemoScenarioParameters,type DemoScenarioParameters,type DemoScenarioKey} from './demo-scenarios';
import type {SessionUser} from './types';

export type DemoEnrollmentInput={businessId:number;handle:string;ownerUserId:number;providerUserId:string;productId:number;
 scenarioKey:DemoScenarioKey;parameters:DemoScenarioParameters};
type Enrollment={business_id:number;handle:string;owner_user_id:number;provider_user_id:string;product_id:number;
 scenario_key:DemoScenarioKey;scenario_version:number;parameters_json:string;baseline_page_json:string;expected_hash:string;
 stage:number;cycle:number;due_at:number;status:'active'|'paused'};
type Control={enabled:number;last_slot:number;budget_day:number;used_today:number;daily_limit:number;database_limit_bytes:number};
class DemoDrift extends Error{constructor(readonly reason:'eligibility_changed'|'content_changed'){super(reason);}}
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

// Lock in the same order as ordinary page writers: current owner/profile/link,
// draft, business, product. No Auth session or owner login is created.
async function currentState(e:Pick<Enrollment,'business_id'|'handle'|'owner_user_id'|'provider_user_id'|'product_id'>){
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
    !catalog.products.some(p=>p.id!==e.product_id&&p.is_published&&p.offering_kind!=='service'&&['available','limited'].includes(p.availability)))throw new DemoDrift('eligibility_changed');
 const categories=(await runtimeAll<{industry_key:string}>('SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key',[e.business_id])).map(v=>v.industry_key);
 const location=await runtimeGet<{version:number;reviewed_version:number}>('SELECT * FROM owner_location_proposals WHERE business_id=? FOR SHARE',[e.business_id]);
 const discovery=await runtimeGet('SELECT * FROM business_discovery_profiles WHERE business_id=?',[e.business_id]);
 // Publication can normally apply a pending location. Demo automation must
 // never approve geography or do a Storage lookup while holding its transaction.
 if(location&&location.version!==location.reviewed_version||ownerPageImageKey(e.business_id,draft.content.heroImage))throw new DemoDrift('eligibility_changed');
 // Includes ordinary versions AND content, so direct SQL drift without a version
 // bump also pauses. Customer inquiries and other tenants are deliberately absent.
 return {actor,catalog,product,draft,publication,categories,hash:digest({catalog,draft,publication,categories,location,discovery})};
}

/** Explicit server/operator enrollment only. Calling it cannot enable the worker. */
export async function enrollDemoScenario(input:DemoEnrollmentInput,now=Date.now()){
 const parameters=parseDemoScenarioParameters(input.parameters);
 demoScenarioStage(input.scenarioKey,1,0,parameters);
 if(![input.businessId,input.ownerUserId,input.productId].every(v=>Number.isSafeInteger(v)&&v>0)||
    !/^[a-z0-9][a-z0-9-]{1,79}$/.test(input.handle)||!/^[0-9a-f-]{32,64}$/i.test(input.providerUserId))throw new Error('Invalid demo enrollment target.');
 return runtimeTransaction(async()=>{
  await runtimeRun('SELECT pg_advisory_xact_lock(6870619271382)');
  const control=await runtimeGet<Control>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||control.enabled)throw new Error('Pause the demo service before enrollment.');
  const count=await runtimeGet<{total:number}>("SELECT COUNT(*) total FROM demo_simulator_enrollments WHERE status='active'");
  if(Number(count?.total)>=6)throw new Error('The initial demo cohort is limited to six businesses.');
  const e={business_id:input.businessId,handle:input.handle,owner_user_id:input.ownerUserId,provider_user_id:input.providerUserId,product_id:input.productId};
  const state=await currentState(e);
  if(parameters.productName!==state.product.name||parameters.productKind!==state.product.offering_kind||
     parameters.basePriceMinor!==state.product.price_minor||parameters.unit!==state.product.quantity_unit||
     digest([...parameters.businessCategories].sort())!==digest(state.categories)||
     state.draft.version!==state.publication.draftVersion||digest(state.draft.content)!==digest(state.publication.content))throw new DemoDrift('content_changed');
  await runtimeRun(`INSERT INTO demo_simulator_enrollments(business_id,handle,owner_user_id,provider_user_id,product_id,scenario_key,scenario_version,
   parameters_json,baseline_page_json,expected_hash,due_at,enrolled_at) VALUES(?,?,?,?,?,?,1,?,?,?,?,?)`,
   [input.businessId,input.handle,input.ownerUserId,input.providerUserId,input.productId,input.scenarioKey,JSON.stringify(parameters),JSON.stringify(state.publication.content),state.hash,now,now]);
  await audit(state.actor,input.businessId,{kind:'enrolled',scenario:input.scenarioKey});
 });
}
async function audit(actor:SessionUser,businessId:number,detail:Record<string,unknown>){
 await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'demo.scenario',?,'')",[actor.id,businessId,JSON.stringify({automation:'demo-simulator',...detail})]);
}
async function advance(e:Enrollment,slot:number,now:number){
 const state=await currentState(e);
 if(state.hash!==e.expected_hash)throw new DemoDrift('content_changed');
 const next=nextDemoScenarioStage(e.scenario_key,e.scenario_version,e.stage,e.cycle),parameters=parseDemoScenarioParameters(JSON.parse(e.parameters_json));
 if(parameters.productName!==state.product.name||parameters.productKind!==state.product.offering_kind||digest([...parameters.businessCategories].sort())!==digest(state.categories))throw new DemoDrift('eligibility_changed');
 const plan=demoScenarioStage(e.scenario_key,e.scenario_version,next.stage,parameters),p=state.product,f=plan.product;
 const currentFacts={availability:p.availability,priceMinor:p.price_minor,quantityUnit:p.quantity_unit,minimumOrderSummary:p.minimum_order_summary,capacitySummary:p.capacity_summary,leadTimeSummary:p.lead_time_summary};
 if(digest(currentFacts)!==digest(f))await executeBasicProductUpkeep(postgresProductUpkeepPort,state.actor,{
  kind:'update',businessId:e.business_id,productId:p.id,expectedContentVersion:state.catalog.business.content_version,
  idempotencyKey:demoScenarioCommandKey(e.business_id,e.scenario_key,e.scenario_version,next.stage,next.cycle),
  name:p.name,description:p.description,...f,offeringKind:p.offering_kind,quantityMode:p.quantity_mode,
  orderScope:p.order_scope??'unspecified',highlights:parseOfferingHighlightsJson(p.highlights_json),videoRef:p.video_ref,
  categoryId:p.category_id,imageAction:'keep',preserveMetadata:true,updateSellingFacts:true,updateListingState:true,
 },null);
 const baseline=parseShopPageContent(JSON.parse(e.baseline_page_json));
 const content:ShopPageContent={...state.draft.content,introduction:`${plan.stage.title}. ${plan.businessUpdate}`,about:baseline.about};
 if(digest(content)!==digest(state.draft.content))await saveOwnerPageAndPublication(state.actor,e.business_id,{action:'save',version:state.draft.version,content});
 const after=await currentState(e);
 await runtimeRun(`UPDATE demo_simulator_enrollments SET stage=?,cycle=?,stage_started_at=?,due_at=?,expected_hash=? WHERE business_id=?`,
  [next.stage,next.cycle,now,now+plan.durationMs,after.hash,e.business_id]);
 await audit(state.actor,e.business_id,{kind:'advanced',scenario:e.scenario_key,version:e.scenario_version,stage:plan.stage.key,cycle:next.cycle,slot});
 return next;
}

export type DemoTickResult={status:'advanced'|'disabled'|'busy'|'duplicate'|'budget';advanced:number;paused:number;failed:number};
/** The scheduled adapter supplies no client input. The clock argument also lets
 * disposable PostgreSQL tests exercise complete timelines without sleeping. */
export async function runDemoSimulatorTick(now=Date.now()):Promise<DemoTickResult>{
 if(!Number.isSafeInteger(now)||now<0)throw new Error('Invalid demo tick clock.');
 const started=Date.now(),slot=Math.floor(now/60000),day=Math.floor(now/86400000);
 const result=(status:DemoTickResult['status']):DemoTickResult=>({status,advanced:0,paused:0,failed:0});
 return runtimeTransaction(async()=>{
  // PostgreSQL17 terminates an overlong transaction atomically. Leave time for
  // connection setup and sanitized handling within the hosted 30-second limit.
  await runtimeRun("SET LOCAL transaction_timeout='23s'");
  await runtimeRun("SET LOCAL lock_timeout='1500ms'");await runtimeRun("SET LOCAL statement_timeout='4000ms'");
  const lock=await runtimeGet<{locked:boolean}>('SELECT pg_try_advisory_xact_lock(6870619271382) locked');
  if(!lock?.locked)return result('busy');
  const control=await runtimeGet<Control>('SELECT * FROM demo_simulator_control WHERE id=1 FOR UPDATE');
  if(!control||!control.enabled)return result('disabled');
  if(Number(control.last_slot)>=slot)return result('duplicate');
  const size=await runtimeGet<{bytes:string}>('SELECT pg_database_size(current_database()) bytes');
  const used=Number(control.budget_day)===day?control.used_today:0;
  if(Number(size?.bytes)>=Number(control.database_limit_bytes)){
   await runtimeRun("UPDATE demo_simulator_control SET enabled=0,pause_reason='database_budget' WHERE id=1");return result('budget');
  }
  // Daily exhaustion defers until tomorrow. It does not silently raise a limit.
  if(used>=control.daily_limit){await runtimeRun("UPDATE demo_simulator_control SET pause_reason='daily_budget' WHERE id=1");return result('budget');}
  await runtimeRun("UPDATE demo_simulator_control SET last_slot=?,budget_day=?,used_today=?,pause_reason='' WHERE id=1",[slot,day,used]);
  const due=await runtimeAll<Enrollment>("SELECT * FROM demo_simulator_enrollments WHERE status='active' AND due_at<=? ORDER BY due_at,business_id LIMIT ? FOR UPDATE",[now,Math.min(2,control.daily_limit-used)]);
  const out=result('advanced');
  for(const e of due){
   if(Date.now()-started>=16000)break;
   await runtimeRun('SAVEPOINT demo_stage');
   let outcome='advanced',next={stage:e.stage,cycle:e.cycle};
   try{next=await advance(e,slot,now);out.advanced++;}
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
  }
  await runtimeRun('UPDATE demo_simulator_control SET used_today=used_today+? WHERE id=1',[out.advanced]);
  await runtimeRun('DELETE FROM demo_simulator_runs WHERE created_at<?',[now-7*86400000]);
  return out;
 });
}
