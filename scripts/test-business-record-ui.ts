import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {hasCapability,isQueueAgent} from '../lib/capabilities';
import {supportThreadHref,supportViewState} from '../lib/support-navigation';

async function page(entry:string) {
  class ScopeError extends Error {code='forbidden';status=403;}
  const fixture={actor:{id:1,access_role:'platform_admin',business_id:null,staff_queue_scope:'all'},business:{id:18,name:'QA Shop',handle:'qa-shop',status:'active'},categories:[{id:8,name:'Doors',slug:'doors',sort_order:1,is_active:1},{id:9,name:'Windows',slug:'windows',sort_order:2,is_active:0}],products:[{id:1,category_id:8}],productPage:1,denied:false,history:[] as unknown[],historyCalls:0};
  const result=await build({entryPoints:[entry],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'record-screen-ports',setup(b){
    b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
    b.onResolve({filter:/^(next\/(link|navigation)|@\/)/},a=>['@/lib/business-workspace-navigation','@/lib/product-workspace-navigation','@/lib/support-navigation','@/components/StaffWorkspaceNavigation'].includes(a.path)?undefined:({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
      a.path==='next/link'?`import React from 'react';export default ({children,...props})=><a {...props}>{children}</a>;`
      :a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url});},notFound=()=>{throw Error('not found');};`
      :a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.actor;`
      :a.path==='@/lib/config'?`export const authDriver=()=> 'supabase';`
      :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>s=>s;`
      :a.path==='@/lib/capabilities'?`export const hasCapability=capability,isQueueAgent=queueAgent;`
      :a.path==='@/lib/dashboard'?`export const resolveBusiness=async()=>fixture.business,resolveProductBusiness=async()=>fixture.business;`
      :a.path==='@/lib/catalog-runtime'?`export const runtimeCatalogByBusinessId=async()=>({business:fixture.business,categories:fixture.categories,products:fixture.products});`
      :a.path==='@/lib/account-health'?`export const getShowroomInsights=async()=>({totalVisitors:12,last30Days:8});`
      :a.path==='@/lib/scalable-queries'?`export const getBusinessActivityCounts=async()=>({products:1}),listBusinessClientAccess=async()=>[{name:'QA Owner'}],listBusinessesPage=async()=>({items:[{id:18,name:'QA Shop',handle:'qa-shop',status:'active'}]}),listAssignedBusinessesPage=async()=>({items:[]}),listProductsPage=async()=>({items:[],page:fixture.productPage,pages:fixture.productPage,pageSize:12,total:0,firstItem:0,lastItem:0}),listStaffPage=async()=>({items:[{id:8,name:'QA agent',email:'qa@example.invalid',access_role:'team_member',queue_scope:'transport',open_conversations:137}]});`
      :a.path==='@/lib/discovery-admin'?`export const getDiscoveryProfileAdminView=async()=>({city:'Addis Ababa'});`
      :a.path==='@/lib/owner-page-runtime'?`export const ownerPagePort={};`
      :a.path==='@/lib/owner-page-domain'?`export const OwnerPageError=ScopeError;`
      :a.path==='@/lib/owner-page-service'?`export const readOwnerPage=async()=>({version:3});`
      :a.path==='@/lib/support-navigation'?`export const supportThreadHref=threadHref,supportViewState=viewState;`
      :a.path==='@/lib/support'?`export const SupportError=ScopeError,getSupportConversation=async()=>{if(fixture.denied)throw new ScopeError();return{conversation:{publicRef:'SUP-QA',subject:'From → To',assistanceCategory:'shipment_observation'}};},getSupportAssignmentHistory=async()=>{fixture.historyCalls++;return fixture.history;};`
      :a.path==='@/components/DashboardShell'?`import React from 'react';export default ({children,business})=><main data-business={business?.id}>{children}</main>;`
      :a.path==='@/components/FocusedEditForm'?`import React from 'react';export default ({children,cancelHref,submitLabel})=><form>{children}<button>{submitLabel}</button><a href={cancelHref}>Cancel</a></form>;`
      :a.path.startsWith('@/components/')?`export default ()=>null;`
      :`export const createCategoryAction=()=>{},updateCategoryAction=()=>{},deleteCategoryAction=()=>{};`}));
  }}]});
  const module={exports:{} as {default:(p:Record<string,unknown>)=>Promise<React.ReactNode>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,ScopeError,capability:hasCapability,queueAgent:isQueueAgent,threadHref:supportThreadHref,viewState:supportViewState,require:createRequire(import.meta.url),Intl,Date,Number,URLSearchParams});
  return {fixture,render:async(query:Record<string,string>={})=>renderToStaticMarkup(await module.exports.default({searchParams:Promise.resolve(query),params:Promise.resolve({id:'42'})}))};
}

test('FE-026 categories are read-first with one selected Add/Edit or explicit removal confirmation',async()=>{
  const {render}=await page('app/dashboard/catalog/page.tsx');
  const list=await render();assert.doesNotMatch(list,/<form|<input|<details/);assert.match(list,/Doors/);assert.match(list,/Windows/);assert.match(list,/Products: 1/);assert.match(list,/href="\/dashboard\/catalog\?business=18&amp;edit=8"/);
  const add=await render({view:'new'});assert.equal((add.match(/<form/g)||[]).length,1);assert.doesNotMatch(add,/name="categoryId"|Windows/);
  const edit=await render({edit:'8'});assert.equal((edit.match(/<form/g)||[]).length,1);assert.match(edit,/name="categoryId" value="8"/);assert.doesNotMatch(edit,/Windows/);assert.match(edit,/href="\/dashboard\/catalog\?business=18">Cancel/);
  const remove=await render({edit:'8',view:'delete'});assert.equal((remove.match(/<form/g)||[]).length,1);assert.match(remove,/Remove this category/);assert.doesNotMatch(remove,/name="name"|name="slug"/);
  await assert.rejects(render({edit:'99'}),/not found/);
});

test('FE-026 selected business overview shows saved status/activity without a duplicate full menu or editor',async()=>{
  const {render,fixture}=await page('app/dashboard/page.tsx');let html=await render({business:'18'});
  assert.match(html,/<h1>Overview/);assert.match(html,/Preview page/);assert.match(html,/Page visits/);assert.match(html,/QA Owner/);assert.doesNotMatch(html,/<form|<details|client-workspace-actions|Edit page|Owner sign-in.*<input/);
  for(const href of ['/dashboard/products?business=18','/dashboard/settings?business=18','/dashboard/admin/discovery/18','/dashboard/access?business=18'])assert.ok(html.includes(`href="${href}"`),href);
  fixture.actor.access_role='team_member';html=await render({business:'18'});assert.doesNotMatch(html,/href="\/dashboard\/(?:settings|access)|href="\/dashboard\/admin\/discovery/,'Staff cannot gain privileged business administration through contextual links');
});

test('FE-026 business directory uses one entity name and preserves bounded workspace origins',async()=>{
  const {render,fixture}=await page('app/dashboard/admin/businesses/page.tsx');
  const html=await render({q:'QA',page:'2',status:'active'});
  assert.match(html,/<h1>Businesses<\/h1>/);assert.match(html,/>Add business<\/a>/);assert.match(html,/<th>Business<\/th>/);assert.doesNotMatch(html,/<h1>Accounts|>Add account<|<details/);
  assert.match(html,/href="\/dashboard\?business=18&amp;nav_q=QA&amp;nav_page=2&amp;nav_status=active"/);
  for(const access_role of ['team_member','client']){fixture.actor.access_role=access_role;await assert.rejects(render(),error=>(error as {url?:string}).url==='/dashboard');}
});

test('FE-026 Staff accounts and workload are peer tasks and records open the focused editor directly',async()=>{
  const {render,fixture}=await page('app/dashboard/admin/staff/page.tsx');
  const html=await render({q:'QA',page:'2',role:'transport_agent'});
  assert.match(html,/href="\/dashboard\/admin\/staff" aria-current="page">Accounts/);
  assert.match(html,/href="\/dashboard\/support\/agents">Workload &amp; availability/);
  const target=html.match(/href="([^"]*edit=8[^"]*)"/)?.[1].replaceAll('&amp;','&');assert.ok(target);
  const url=new URL(target,'https://suqpage.invalid');assert.equal(url.pathname,'/dashboard/support/agents');
  for(const[key,value]of Object.entries({edit:'8',q:'qa@example.invalid',back_origin:'staff',back_q:'QA',back_page:'2',back_role:'transport_agent'}))assert.equal(url.searchParams.get(key),value);
  assert.doesNotMatch(html,/<details|name="queueScope"|name="enabled"/);
  for(const access_role of ['operations_manager','team_member','client']){fixture.actor.access_role=access_role;await assert.rejects(render(),error=>(error as {url?:string}).url==='/dashboard');}
});

test('FE-026 products keep the owner Account parent and contextual category administration',async()=>{
  const {render,fixture}=await page('app/dashboard/products/page.tsx');
  let html=await render();assert.match(html,/href="\/dashboard\/catalog\?business=18"/);assert.match(html,/href="\/dashboard\?business=18">Overview/);
  assert.match(html,/href="\/dashboard\/products\/new\?business=18"/);
  fixture.productPage=3;html=await render({q:'  Door  ',page:'3'});assert.match(html,/href="\/dashboard\/products\/new\?business=18&amp;nav_q=Door&amp;nav_page=3"/,'The actual bounded helper preserves the current product list origin');
  fixture.productPage=99999999;html=await render({q:'Door',page:'https://evil.test'});assert.doesNotMatch(html,/nav_page=|evil\.test/,'An invalid page never becomes an editor return URL');
  fixture.actor.access_role='client';html=await render();assert.match(html,/href="\/dashboard\/profile">Account/);assert.doesNotMatch(html,/href="\/dashboard\/catalog/);
});

test('FE-019 assignment history is a protected read-only screen with a bounded conversation return',async()=>{
  const {render,fixture}=await page('app/dashboard/support/[id]/assignments/page.tsx');
  const html=await render({queue:'transport',status:'history',q:'chairs',page:'2'});assert.match(html,/SUP-QA/);assert.match(html,/No assignment history yet/);assert.match(html,/href="\/dashboard\/support\/42\?queue=transport&amp;status=history&amp;q=chairs&amp;page=2"/);assert.doesNotMatch(html,/<form|<details|<input/);
  fixture.actor.access_role='client';const before=fixture.historyCalls;await assert.rejects(render(),error=>(error as {url?:string}).url==='/dashboard/support');assert.equal(fixture.historyCalls,before);
  fixture.actor.access_role='team_member';fixture.denied=true;await assert.rejects(render(),/not found/);assert.equal(fixture.historyCalls,before);
});
