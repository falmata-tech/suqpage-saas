import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {assertNativeDemoTarget,nativeQaSchema} from './native-qa-target';
import {runtimeAll,runtimeGet,runtimeRun,runtimeTransaction} from '../lib/runtime-sql';
import {runtimeCatalogByBusinessId,runtimeUserById} from '../lib/catalog-runtime';
import {runDemoSimulatorTick} from '../lib/demo-simulator-runtime';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';
import {runtimePublicShowroom} from '../lib/public-showroom-runtime';

const root='.local/native-qa';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function preserved(businessId:number){
 const data=[];
 for(const table of ['businesses','products','owner_page_drafts','owner_page_publications','published_catalog_versions']){
  const field=table==='businesses'?'id':'business_id';
  data.push(await runtimeGet(`SELECT md5(COALESCE(string_agg(h,'' ORDER BY h),'')) digest FROM (SELECT md5(to_jsonb(t)::text) h FROM ${table} t WHERE ${field}<>?) rows`,[businessId]));
 }
 return hash(data);
}
async function main(){
 const target=assertNativeDemoTarget(),action=process.argv[2];
 if(!['--prepare','--limited','--preflight'].includes(action))throw Error('Choose a native demo QA action.');
 if(action==='--preflight')return;
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'fixture.json'),'utf8'));
 const schema=nativeQaSchema(fixture.schema);
 if(fixture.source!==execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()||fixture.handle!=='selam-weave'||fixture.productName!=='Indigo Kuta Shawl'||!Number.isSafeInteger(fixture.businessId)||!Number.isSafeInteger(fixture.productId))throw Error('Native demo fixture source or reviewed target differs.');
 target.searchParams.set('options',`-csearch_path=${schema}`);
 Object.assign(process.env,{SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:target.toString(),SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem'});
 const current=await runtimeGet<{is_demo:number;status:string;handle:string}>('SELECT is_demo,status,handle FROM businesses WHERE id=?',[fixture.businessId]);
 assert.deepEqual(current,{is_demo:1,status:'active',handle:fixture.handle});
 if(action==='--prepare')await runtimeTransaction(async()=>{
  assert.equal((await runtimeAll('SELECT 1 FROM demo_simulator_enrollments')).length,0);
  const owner=await runtimeGet<{id:number;email:string;provider_user_id:string|null}>(`SELECT u.id,u.email,l.provider_user_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
   LEFT JOIN auth_identity_links l ON l.user_id=u.id AND l.provider='supabase' WHERE u.business_id=? AND p.access_role='client'`,[fixture.businessId]);
  const actor=owner?await runtimeUserById(owner.id):null,catalog=await runtimeCatalogByBusinessId(fixture.businessId,true),product=catalog?.products.find(p=>p.id===fixture.productId);
  if(!owner||!actor||!catalog||!product||product.offering_kind!=='standard_product'||product.option_groups?.length)throw Error('The native scenario owner/product is missing.');
  // This fake identity exists only in the random local QA schema. It neither
  // configures hosted Auth nor creates a session or provider account.
  const provider=owner.provider_user_id||randomUUID();
  if(!owner.provider_user_id)await runtimeRun("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,?,?)",[owner.id,provider,owner.email,Date.now()]);
  const categories=(await runtimeAll<{industry_key:string}>('SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key',[fixture.businessId])).map(v=>v.industry_key);
  const versions=await runtimeGet<{draft_version:number;page_revision:number}>('SELECT d.version draft_version,(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=d.business_id) page_revision FROM owner_page_drafts d WHERE d.business_id=?',[fixture.businessId]);
  if(!versions)throw Error('Native scenario publication is missing.');
  const request={businessId:fixture.businessId,handle:fixture.handle,ownerUserId:owner.id,providerUserId:provider,productId:product.id,scenarioKey:'wholesale-replenishment',
   parameters:{productName:product.name,productKind:'standard_product',businessCategories:categories,unit:product.quantity_unit||'shawls',minimumOrder:10,normalCapacity:120,limitedCapacity:20,basePriceMinor:product.price_minor},
   initializeUnit:true,expectedContentVersion:catalog.business.content_version,expectedDraftVersion:versions.draft_version,expectedPageRevision:versions.page_revision};
  await runtimeRun('INSERT INTO demo_simulator_requests(business_id,input_json,requested_at) VALUES(?,?,?)',[fixture.businessId,JSON.stringify(request),Date.now()]);
  const admission=await runDemoSimulatorTick();assert.equal(admission.enrolled,1);assert.equal(admission.enrollmentRejected,0);assert.equal(admission.status,'disabled');
  await runtimeRun('UPDATE demo_simulator_control SET enabled=1 WHERE id=1');
 });
 const before=await preserved(fixture.businessId);
 for(let i=0;i<(action==='--prepare'?1:2);i++){
  const state=await runtimeGet<{due_at:number;last_slot:number}>('SELECT e.due_at,c.last_slot FROM demo_simulator_enrollments e CROSS JOIN demo_simulator_control c WHERE e.business_id=? AND c.id=1',[fixture.businessId]);
  if(!state)throw Error('Native scenario is not prepared.');
  const tick=await runDemoSimulatorTick(Math.max(Date.now(),Number(state.due_at),(Number(state.last_slot)+1)*60000));
  assert.equal(tick.advanced,1);assert.equal(tick.failed,0);assert.equal(tick.paused,0);
 }
 assert.equal(await preserved(fixture.businessId),before,'Other demo and real businesses must remain unchanged.');
 const state=await runtimeGet<{stage:number}>('SELECT stage FROM demo_simulator_enrollments WHERE business_id=?',[fixture.businessId]);
 assert.equal(state?.stage,action==='--prepare'?0:2);
 const snapshot=await runtimePublicShowroom(fixture.handle),product=snapshot?.catalog.products.find(p=>p.id===fixture.productId);
 assert.equal(product?.availability,action==='--prepare'?'available':'limited');
 await runtimeRun("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
 // Enable only inside the next explicitly requested disposable QA action.
 if(action==='--prepare')await runtimeRun('UPDATE demo_simulator_control SET enabled=1 WHERE id=1');
 fs.writeFileSync(path.join(root,'evidence',action==='--prepare'?'demo-before.json':'demo-after.json'),JSON.stringify({source:fixture.source,result:'passed',stage:state?.stage,
  availability:product?.availability,publicRevision:snapshot?.revision,otherBusinessesUnchanged:true})+'\n');
 console.log('PASS native demo scenario persisted through ordinary application writes.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(()=>{console.error('Native demo scenario QA failed.');process.exitCode=1;}).finally(closePostgresRuntimeForTests);
