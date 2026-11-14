import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {runtimeAll,runtimeGet,runtimeRun} from '../../lib/runtime-sql';
import {runtimeCatalogByBusinessId,runtimeUserById} from '../../lib/catalog-runtime';
import {closePostgresRuntimeForTests} from '../../lib/postgres-runtime-services';
import {executeBasicProductUpkeep} from '../../lib/product-upkeep';
import {postgresProductUpkeepPort} from '../../lib/product-upkeep-postgres';
import {parseOfferingHighlightsJson} from '../../lib/offering-presentation';
import {enrollDemoScenario,runDemoSimulatorTick} from '../../lib/demo-simulator-runtime';
import {runtimePublishedPage} from '../../lib/owner-page-publication-runtime';
import {readPublicShopRevision} from '../../lib/public-shop-revision';
import {demoScenarioStage,type DemoScenarioParameters} from '../../lib/demo-scenarios';

const services=createRequire(path.resolve('package.json'))('./scripts/acceptance-supabase-readiness.mjs') as {
 browserSupabasePorts:()=>{api:number;db:number};inspectBrowserServices:(id:string)=>unknown;browserServicesReady:(id:string,value:unknown)=>boolean};

/** Same exact disposable runner boundary used by the existing admin acceptance.
 * This test fixture is not an operator command and cannot adopt a dev/hosted DB. */
export function assertScenarioAcceptanceTarget(e:Readonly<Record<string,string|undefined>>=process.env){
 const credentials=e.SUQPAGE_TEST_CREDENTIALS||'',root=path.dirname(credentials),ports=services.browserSupabasePorts();
 if(e.SUQPAGE_RUNTIME_PROFILE!=='browser-test'||e.SUQPAGE_LOCAL_SUPABASE_PROFILE!=='browser-test'||e.SUQPAGE_DATABASE_DRIVER!=='postgres'||credentials!==e.SUQPAGE_CREDENTIAL_PATH||path.basename(credentials)!=='credentials.txt'||path.dirname(root)!==os.tmpdir()||!/^suqpage-acceptance-[A-Za-z0-9]+$/.test(path.basename(root)))throw Error('Scenario acceptance requires its disposable runner target.');
 let origin:URL,provider:URL,database:URL;
 try{origin=new URL(e.SUQPAGE_TEST_BASE_URL||'');provider=new URL(e.SUQPAGE_SUPABASE_URL||'');database=new URL(e.SUQPAGE_POSTGRES_URL||'');}catch{throw Error('Invalid scenario fixture bindings.');}
 if(origin.protocol!=='http:'||origin.hostname!=='127.0.0.1'||!origin.port||provider.protocol!=='http:'||!['127.0.0.1','localhost'].includes(provider.hostname)||Number(provider.port)!==ports.api||e.NEXT_PUBLIC_SUPABASE_URL!==e.SUQPAGE_SUPABASE_URL||!['postgres:','postgresql:'].includes(database.protocol)||!['127.0.0.1','localhost'].includes(database.hostname)||Number(database.port)!==ports.db||e.SUQPAGE_POSTGRES_URL!==e.SUQPAGE_POSTGRES_DIRECT_URL||e.SUQPAGE_POSTGRES_URL!==e.SUQPAGE_LOCAL_POSTGRES_URL)throw Error('Scenario fixture does not match the disposable app/API/database.');
 const config=fs.readFileSync(path.join(root,'supabase-browser-project/supabase/config.toml'),'utf8'),id=/^project_id = "([^"]+)"$/m.exec(config)?.[1]||'';
 if(!/^suqpage-browser-[0-9]+$/.test(id)||Number(/^\[api\]\r?\n[\s\S]*?^port = (\d+)$/m.exec(config)?.[1])!==ports.api||Number(/^\[db\]\r?\n[\s\S]*?^port = (\d+)$/m.exec(config)?.[1])!==ports.db||!services.browserServicesReady(id,services.inspectBrowserServices(id)))throw Error('Scenario fixture project is not verified and ready.');
}

let phase='target';
async function main(){
 const action=process.argv[2];if(!['prepare','advance','pause','--preflight'].includes(action))throw Error('Choose a scenario fixture action.');
 assertScenarioAcceptanceTarget();if(action==='--preflight')return;
 if(action==='pause'){await runtimeRun("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");process.stdout.write(JSON.stringify({paused:true}));return;}
 phase='business';
 const business=await runtimeGet<{id:number;is_demo:number;status:string}>("SELECT id,is_demo,status FROM businesses WHERE handle='afia-botanics'");
 if(!business||business.is_demo!==1||business.status!=='active')throw Error('The selected synthetic showroom is not available.');
 if(action==='prepare'){
  phase='bindings';
  if(await runtimeGet('SELECT 1 FROM demo_simulator_enrollments LIMIT 1'))throw Error('Scenario acceptance requires an unenrolled fixture.');
  const owner=await runtimeGet<{id:number;provider_user_id:string}>(`SELECT u.id,l.provider_user_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
   JOIN auth_identity_links l ON l.user_id=u.id AND l.provider='supabase' WHERE u.business_id=? AND p.access_role='client'`,[business.id]);
  const actor=owner?await runtimeUserById(owner.id):null,catalog=await runtimeCatalogByBusinessId(business.id,true);
  const product=catalog?.products.find(p=>p.is_published&&p.offering_kind==='standard_product'&&p.name==='Garden Cleansing Bars'&&!p.option_groups?.length);
  if(!actor||!owner||!catalog||!product)throw Error('The reviewed synthetic owner/product is missing.');
  // Give this existing synthetic cleansing bar an explicit unit through normal upkeep;
  // no production product or unmarked merchant is selectable by this helper.
  phase='unit';
  if(!product.quantity_unit)await executeBasicProductUpkeep(postgresProductUpkeepPort,actor,{kind:'update',businessId:business.id,productId:product.id,
   expectedContentVersion:catalog.business.content_version,idempotencyKey:'scenario_acceptance_unit_0001',name:product.name,description:product.description,
   availability:product.availability,offeringKind:product.offering_kind,quantityMode:product.quantity_mode,orderScope:product.order_scope??'unspecified',
   priceMinor:product.price_minor,quantityUnit:'bars',highlights:parseOfferingHighlightsJson(product.highlights_json),capacitySummary:product.capacity_summary,
   minimumOrderSummary:product.minimum_order_summary,leadTimeSummary:product.lead_time_summary,videoRef:product.video_ref,categoryId:product.category_id,
   imageAction:'keep',preserveMetadata:true,updateSellingFacts:true},null);
  const categories=(await runtimeAll<{industry_key:string}>('SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key',[business.id])).map(v=>v.industry_key);
  const parameters:DemoScenarioParameters={productName:product.name,productKind:'standard_product',businessCategories:categories,unit:product.quantity_unit||'bars',minimumOrder:10,normalCapacity:120,limitedCapacity:20,basePriceMinor:product.price_minor};
  phase='enrollment';
  await enrollDemoScenario({businessId:business.id,handle:'afia-botanics',ownerUserId:owner.id,providerUserId:owner.provider_user_id,productId:product.id,scenarioKey:'wholesale-replenishment',parameters});
  await runtimeRun('UPDATE demo_simulator_control SET enabled=1 WHERE id=1');
 }else{
  phase='advance';
  const state=await runtimeGet<{due_at:number;last_slot:number}>('SELECT e.due_at,c.last_slot FROM demo_simulator_enrollments e CROSS JOIN demo_simulator_control c WHERE e.business_id=? AND c.id=1',[business.id]);
  if(!state)throw Error('The scenario fixture is not prepared.');
  // An explicitly accelerated local clock tests stages without sleeping minutes.
  // The hosted scheduled adapter accepts no supplied clock or test action.
  const now=Math.max(Date.now(),Number(state.due_at),(Number(state.last_slot)+1)*60000);
  const result=await runDemoSimulatorTick(now);if(result.advanced!==1||result.failed||result.paused)throw Error('The local scenario did not advance.');
 }
 const state=await runtimeGet<{stage:number;parameters_json:string;product_id:number}>('SELECT stage,parameters_json,product_id FROM demo_simulator_enrollments WHERE business_id=?',[business.id]);
 if(!state)throw Error('Scenario progress is missing.');
 const plan=state.stage>=0?demoScenarioStage('wholesale-replenishment',1,state.stage,JSON.parse(state.parameters_json)):null;
 process.stdout.write(JSON.stringify({handle:'afia-botanics',businessId:business.id,productId:state.product_id,stage:state.stage,
  update:plan?.businessUpdate??'',product:plan?.product??null,about:(await runtimePublishedPage(business.id))?.about,revision:await readPublicShopRevision('afia-botanics')}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(()=>{console.error('Disposable scenario acceptance failed.',{phase});process.exitCode=1;}).finally(closePostgresRuntimeForTests);
