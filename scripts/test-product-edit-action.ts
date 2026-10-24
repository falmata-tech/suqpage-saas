import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {ProductUpkeepError} from '../lib/product-upkeep-domain';
import {readOrderScope} from '../lib/order-scope';
import {parseOfferingHighlightsJson} from '../lib/offering-presentation';
import {productListView,productListHref} from '../lib/product-workspace-navigation';
import type {OwnerEditResult} from '../lib/owner-edit-contract';

async function actionFixture(){
  const state={actor:{id:2,business_id:18,access_role:'client'},writes:[] as Array<{actor:unknown;command:Record<string,unknown>}>,failure:null as Error|null,staged:false,discarded:0,events:[] as unknown[][],revalidated:[] as string[]};
  const ports:Record<string,unknown>={
    'next/navigation':{redirect:(url:string)=>{throw Object.assign(new Error('redirect'),{url});}},
    'next/cache':{revalidatePath:(path:string)=>state.revalidated.push(path)},
    '@/lib/auth':{requireUser:async()=>state.actor},
    '@/lib/security':{cleanText:(value:unknown,max:number)=>String(value??'').trim().slice(0,max)},
    '@/lib/product-upkeep-domain':{ProductUpkeepError},
    '@/lib/order-scope':{readOrderScope},
    '@/lib/offering-presentation':{parseOfferingHighlightsJson},
    '@/lib/product-workspace-navigation':{productListView,productListHref},
    '@/lib/product-media':{MAX_PRODUCT_UPLOAD_BYTES:5*1024*1024},
    '@/lib/tenant-product-media':{stageTenantProductImage:async()=>state.staged?{imageRef:'/media/test-private-18.png',digest:'fixture',discard:async()=>{state.discarded++;}}:null},
    '@/lib/catalog-runtime':{runtimeBusinessById:async()=>({id:18,handle:'test-business'})},
    '@/lib/runtime-sql':{runtimeGet:async()=>({capacity_summary:'saved capacity',minimum_order_summary:'saved minimum',lead_time_summary:'saved lead time',order_scope:'both',quantity_unit:'bag',highlights_json:'["Made locally"]'})},
    '@/lib/product-upkeep-runtime':{runtimeProductUpkeepPort:()=>({})},
    '@/lib/product-upkeep':{executeBasicProductUpkeep:async(_port:unknown,actor:unknown,command:Record<string,unknown>)=>{state.writes.push({actor,command});if(state.failure)throw state.failure;return {productId:74,contentVersion:8};}},
  };
  const bundle=await build({entryPoints:['app/actions.ts'],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',plugins:[{name:'product-action-ports',setup(b){b.onResolve({filter:/^@\//},a=>({path:a.path,external:true}));}}]});
  const module={exports:{} as Record<'basicProductUpkeepEditAction'|'basicProductUpkeepAction',(form:FormData)=>Promise<OwnerEditResult>>};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:(path:string)=>ports[path]||{},FormData,File,Set,URLSearchParams,Date,Number,Promise,Error,console:{error:(...items:unknown[])=>state.events.push(items)}});
  const form=()=>{const fd=new FormData();for(const[key,value]of Object.entries({businessId:'18',productId:'74',kind:'update',expectedContentVersion:'7',idempotencyKey:'product-editor-qa',name:'Retained name',description:'Retained description',offeringKind:'standard_product',priceEtb:'12.50',availability:'unavailable',isPublished:'0',nav_q:'  የቤት\u0000  እቃ % ',nav_page:'2'}))fd.set(key,value);return fd;};
  return {state,actions:module.exports,form};
}

test('FE-026/FE-047 S122 focused actual product action returns to a bounded product list and admits explicit owner listing state',async()=>{
  const {state,actions,form}=await actionFixture();
  const enriched=form();enriched.set('orderScope','both');enriched.set('quantityUnit','box');enriched.set('highlights','Locally made');enriched.set('minimumOrderSummary','One box');
  await assert.rejects(()=>actions.basicProductUpkeepEditAction(enriched),error=>{
    const url=new URL((error as {url:string}).url,'https://suqpage.test');
    assert.equal(url.pathname,'/dashboard/products');assert.equal(url.searchParams.get('business'),'18');assert.equal(url.searchParams.get('q'),'የቤት  እቃ %');assert.equal(url.searchParams.get('page'),'2');assert.equal(url.searchParams.get('saved'),'1');return true;
  });
  assert.equal(state.writes.length,1);const command=state.writes[0].command;
  assert.equal(command.businessId,18);assert.equal(command.productId,74);assert.equal(command.expectedContentVersion,7);assert.equal(command.idempotencyKey,'product-editor-qa');assert.equal(command.priceMinor,1250);assert.equal(command.preserveMetadata,true);assert.equal(command.updateListingState,true);assert.equal(command.availability,'unavailable');assert.equal(command.isPublished,false);
  assert.equal(command.updateSellingFacts,true);assert.equal(command.orderScope,'both');assert.equal(command.quantityUnit,'box');assert.deepEqual(JSON.parse(JSON.stringify(command.highlights)),['Locally made']);assert.equal(command.minimumOrderSummary,'One box');
  assert.ok(!('nav_q'in command)&&!('nav_page'in command));assert.ok(state.revalidated.includes('/dashboard/products'));
  const legacy=form();legacy.delete('availability');legacy.delete('isPublished');
  await assert.rejects(()=>actions.basicProductUpkeepEditAction(legacy));assert.ok(!('updateListingState'in state.writes[1].command));assert.ok(!('isPublished'in state.writes[1].command));assert.equal(state.writes[1].command.updateSellingFacts,false);
  state.actor.access_role='staff';
  const olderStaff=form();olderStaff.set('quantityUnit','carton');
  await assert.rejects(()=>actions.basicProductUpkeepEditAction(olderStaff));
  assert.equal(state.writes[2].command.updateSellingFacts,true);
  assert.equal(state.writes[2].command.orderScope,'both');
  assert.equal(state.writes[2].command.quantityUnit,'carton');
  assert.deepEqual(JSON.parse(JSON.stringify(state.writes[2].command.highlights)),['Made locally']);
});

test('BE-032 S122 focused action keeps expected failures inline, redacts unknown errors, cleans media and rejects forged return fields',async()=>{
  const {state,actions,form}=await actionFixture();const data=form(),unchanged=[...data.entries()];state.staged=true;
  state.failure=new ProductUpkeepError('The showroom changed while this form was open. Refresh and review the latest version.',409,'stale_version');
  assert.deepEqual(JSON.parse(JSON.stringify(await actions.basicProductUpkeepEditAction(data))),{error:state.failure.message});assert.equal(state.discarded,1);assert.deepEqual([...data.entries()],unchanged);assert.deepEqual(state.revalidated,[]);
  state.failure=new Error('private database host and credentials');assert.deepEqual(JSON.parse(JSON.stringify(await actions.basicProductUpkeepEditAction(data))),{error:'Unable to connect. Please try again.'});assert.equal(state.discarded,2);assert.deepEqual(JSON.parse(JSON.stringify(state.events)),[['Product upkeep failed',{category:'unexpected_save_failure'}]]);
  for(const error of ['Images must be 5 MB or smaller.','Only valid JPEG, PNG, and WebP images are accepted.']){state.failure=new Error(error);assert.deepEqual(JSON.parse(JSON.stringify(await actions.basicProductUpkeepEditAction(data))),{error:'Choose a JPG, PNG or WebP photo under 5 MB.'});}
  state.failure=new Error('Use a supported video link.');assert.deepEqual(JSON.parse(JSON.stringify(await actions.basicProductUpkeepEditAction(data))),{error:'Use a supported video link.'});
  state.failure=null;const forged=form();forged.set('returnTo','https://foreign.invalid');const writes=state.writes.length;assert.deepEqual(JSON.parse(JSON.stringify(await actions.basicProductUpkeepEditAction(forged))),{error:'The product form contains unsupported fields.'});assert.equal(state.writes.length,writes);
  const empty=form();empty.set('nav_page','9999999');empty.set('nav_q','');await assert.rejects(()=>actions.basicProductUpkeepEditAction(empty),error=>(error as {url?:string}).url==='/dashboard/products?business=18&saved=1');
});
