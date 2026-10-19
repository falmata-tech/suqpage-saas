import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {hasCapability} from '../lib/capabilities';

async function page(entry:string){
  const fixture={actor:{id:1,access_role:'platform_admin',business_id:null},managed:true,business:{id:18,name:'QA Business',handle:'qa-business',content_version:9,status:'active',logo_path:'/seed/logo.svg',contact_email:'notice@example.invalid',live_platform:'youtube',live_url:'https://youtube.com/@qa/live',is_live:1,site_title:'Saved sharing title',site_description:'Saved sharing description'},profile:{businessId:18,businessName:'QA Business',handle:'qa-business',sponsored:true,sponsorPosition:2,approved:true,excluded:false,industryKeys:[],city:'Addis Ababa',productionScale:'workshop'},resolved:[] as unknown[]};
  const result=await build({entryPoints:[entry],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'business-task-ports',setup(b){
    b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
    b.onResolve({filter:/^(next\/(?:link|navigation)|next-intl\/server|@\/)/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
      a.path==='next-intl/server'?`export const getLocale=async()=> 'en';`
      :a.path==='@/lib/countries'?`export const countryName=()=> 'Ethiopia';`
      :a.path==='@/lib/place-catalog'?`export const findKnownPlace=()=>null;`
      :a.path==='next/link'?`import React from 'react';export default ({children,...props})=><a {...props}>{children}</a>;`
      :a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url});},notFound=()=>{throw Error('not found');};`
      :a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.actor;`
      :a.path==='@/lib/config'?`export const authDriver=()=>fixture.managed?'supabase':'local';`
      :a.path==='@/lib/owner-business-runtime'?`export const readLocationProposal=async()=>null;`
      :a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async()=>fixture.business;`
      :a.path==='@/lib/capabilities'?`export const hasCapability=(...args)=>capability(...args);`
      :a.path==='@/lib/staff-business-authority'?`export const currentBusinessAuthority=async actor=>actor.access_role==='platform_admin'?'administrator':null;`
      :a.path==='@/lib/dashboard'?`export const resolveManagedBusiness=async(actor,id)=>{fixture.resolved.push(id);if(actor.access_role!=='platform_admin')throw Object.assign(Error('redirect'),{url:'/dashboard'});return fixture.business;};`
      :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>s=>s;`
      :a.path==='@/lib/business-handle-runtime'?`export const readHandleSettings=async()=>({handle:fixture.business.handle});`
      :a.path==='@/lib/scalable-queries'?`export const listBusinessClientAccess=async()=>[{id:7,name:'QA Owner',email:'private-owner@example.invalid',must_change_password:0}];`
      :a.path==='@/lib/live-showroom'?`export const LIVE_PLATFORMS=['youtube'],LIVE_PLATFORM_LABELS={youtube:'YouTube'};`
      :a.path==='@/lib/discovery-admin'?`export const getDiscoveryProfileAdminView=async()=>fixture.profile,listDiscoveryProfilesPage=async()=>({items:[],totalPages:1});`
      :a.path==='@/lib/discovery'?`export const getSponsoredShowrooms=async()=>[],DISCOVERY_INDUSTRIES=[];`
      :a.path==='@/lib/sponsor-admin'?`export const getExternalSponsorAd=async()=>undefined,listExternalSponsorAdsPage=async()=>({items:[],totalPages:1});`
      :a.path==='@/components/DashboardShell'?`import React from 'react';export default ({business,children})=><main data-business={business?.id??'global'}>{children}</main>;`
      :a.path==='@/components/FocusedEditForm'?`import React from 'react';export default ({children,cancelHref,submitLabel})=><form>{children}<button>{submitLabel}</button><a href={cancelHref}>Cancel</a></form>;`
      :a.path==='@/components/SponsorPlacementEditor'?`import React from 'react';export default ({business,origin,cancelHref})=><form data-sponsor={business?.businessId}><input name="return_business" value={origin.business||''} readOnly/><a href={cancelHref}>Cancel</a></form>;`
      :a.path.startsWith('@/components/')?`import React from 'react';export default ()=>null;`
      :`export const updateBusinessAction=()=>{},saveBusinessHandleAction=()=>{},adminResetClientPasswordAction=()=>{},adminUpdateBusinessAction=()=>{},updateDiscoveryProfileAction=()=>{};`}));
  }}]});
  const module={exports:{} as {default:(p:{searchParams:Promise<Record<string,string>>;params:Promise<{businessId:string}>})=>Promise<React.ReactNode>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,capability:hasCapability,URLSearchParams,require:createRequire(import.meta.url)});
  return {fixture,render:async(query:Record<string,string>={})=>renderToStaticMarkup(await module.exports.default({searchParams:Promise.resolve(query),params:Promise.resolve({businessId:'18'})}))};
}

test('FE-026 location task heading matches its business section without a duplicate return hierarchy',async()=>{
  const {render,fixture}=await page('app/dashboard/(business)/admin/discovery/[businessId]/page.tsx');
  let html=await render();assert.match(html,/<h1>Location &amp; visibility<\/h1>/);assert.doesNotMatch(html,/navigation-trail|<h1>Marketplace|<form|<details/);assert.match(html,/href="\/dashboard\/admin\/discovery\/18\?edit=profile"/);
  html=await render({edit:'profile'});assert.equal((html.match(/<form/g)||[]).length,1);assert.match(html,/href="\/dashboard\/admin\/discovery\/18">Cancel/);
  for(const access_role of ['client','team_member','operations_manager']){fixture.actor.access_role=access_role;await assert.rejects(render(),error=>(error as {url?:string}).url==='/dashboard');}
});

test('FE-026 privileged details show exactly one selected saved task and one focused editor',async()=>{
  const {render}=await page('app/dashboard/settings/page.tsx');
  for(const section of ['identity','live','sharing']){
    let html=await render({business:'18',section});
    assert.doesNotMatch(html,/<form|<input|<details|Owner sign-in|Staff assistance|Public contacts/);
    assert.equal((html.match(/<section/g)||[]).length,1);assert.match(html,new RegExp(`section=${section}[^" ]*" aria-current="page"`));
    html=await render({business:'18',section,edit:'details'});
    assert.equal((html.match(/<form/g)||[]).length,1);assert.match(html,new RegExp(`name="section" value="${section}"`));assert.match(html,/name="expectedVersion" value="9"/);
    assert.match(html,new RegExp(`href="/dashboard/settings\\?business=18&amp;section=${section}">Cancel`));
    if(section==='identity'){assert.match(html,/name="name"/);assert.match(html,/name="logo"/);assert.doesNotMatch(html,/name="liveUrl"|name="siteTitle"/);}
    if(section==='live'){assert.match(html,/name="liveUrl"/);assert.doesNotMatch(html,/name="name"|name="contactEmail"|name="logo"|name="siteTitle"/);}
    if(section==='sharing'){assert.match(html,/name="siteDescription"/);assert.doesNotMatch(html,/name="name"|name="contactEmail"|name="logo"|name="liveUrl"/);}
  }
  await assert.rejects(render({business:'18',edit:'recovery',user:'7'}),error=>(error as {url?:string}).url==='/dashboard/access?business=18&edit=recovery&user=7');
  const fallback=await render({business:'18',section:'https://untrusted.test'});assert.match(fallback,/section=identity[^" ]*" aria-current="page"/);
});

test('FE-026/FE-072 Access separates sign-in from public status and retires business-level staff assistance',async()=>{
  const {render,fixture}=await page('app/dashboard/access/page.tsx');
  let html=await render({business:'18'});assert.match(html,/private-owner@example.invalid/);assert.doesNotMatch(html,/\/dashboard\/admin\/businesses\/18\/team|Staff assistance/);assert.doesNotMatch(html,/<form|<input|<details/);
  html=await render({business:'18',edit:'status'});assert.equal((html.match(/<form/g)||[]).length,1);assert.match(html,/name="returnTo" value="access"/);assert.doesNotMatch(html,/private-owner@example.invalid|Staff assistance/);
  fixture.managed=false;html=await render({business:'18',edit:'recovery',user:'7'});assert.equal((html.match(/<form/g)||[]).length,1);assert.match(html,/name="userId" value="7"/);assert.match(html,/href="\/dashboard\/access\?business=18">Cancel/);
  html=await render({business:'18',edit:'recovery',user:'99'});assert.doesNotMatch(html,/<form|name="temporaryPassword"/);
  fixture.actor.access_role='client';fixture.resolved.length=0;await assert.rejects(render({business:'18'}),error=>(error as {url?:string}).url==='/dashboard');assert.equal(fixture.resolved.length,0,'Unauthorized Access must stop before tenant resolution');
});

test('FE-026 sponsor editing keeps the exact selected business while global sponsor management remains separate',async()=>{
  const {render,fixture}=await page('app/dashboard/admin/sponsors/page.tsx');
  let html=await render({business:'18'});assert.match(html,/data-business="18"/);assert.match(html,/href="\/dashboard\/admin\/discovery\/18"/);assert.doesNotMatch(html,/<form|Manage advertiser cards/);
  html=await render({business:'18',edit:'business-18'});assert.match(html,/data-business="18"/);assert.match(html,/data-sponsor="18"/);assert.match(html,/name="return_business"[^>]*value="18"/);
  await assert.rejects(render({business:'18',edit:'business-99'}),error=>(error as {url?:string}).url==='/dashboard/admin/sponsors?business=18');
  html=await render();assert.match(html,/data-business="global"/);assert.match(html,/Manage advertiser cards/);
  fixture.actor.access_role='team_member';fixture.resolved.length=0;await assert.rejects(render({business:'18'}),error=>(error as {url?:string}).url==='/dashboard');assert.equal(fixture.resolved.length,0);
});
