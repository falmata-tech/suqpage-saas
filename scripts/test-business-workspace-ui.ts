import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

test('FE-026 business context keeps one global menu and permission-filtered local sections',async()=>{
  const fixture={pathname:'/dashboard/products',pageAccess:true,staffGrant:true,groups:[] as Array<{items:Array<{href:string}>}>,OwnerPageError:class extends Error{status=403;}};
  const result=await build({entryPoints:['components/DashboardShell.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'workspace-ports',setup(b){
    b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
    b.onResolve({filter:/^(next\/link|next\/navigation|@\/lib\/i18n\/server|@\/lib\/config|@\/lib\/owner-page-runtime|@\/lib\/owner-page-service|@\/lib\/owner-page-domain|@\/lib\/staff-business-authority|@\/components\/(PublicMobileNavigation|NavigationPendingIndicator)|\.\/AttentionAlerts|@\/components\/WorkspaceNavigation)$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
      a.path==='next/link'?`import React from 'react';export default p=><a {...p}/>;`
      :a.path==='next/navigation'?`export const usePathname=()=>fixture.pathname;`
      :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>s=>s;`
      :a.path==='@/lib/config'?`export const authDriver=()=> 'supabase';`
      :a.path==='@/lib/owner-page-runtime'?`export const ownerPageEditorEnabled=()=>true,ownerPagePort={};`
      :a.path==='@/lib/owner-page-domain'?`export const OwnerPageError=fixture.OwnerPageError;`
      :a.path==='@/lib/owner-page-service'?`export const readOwnerPage=async()=>{if(!fixture.pageAccess)throw new fixture.OwnerPageError();};`
      :a.path==='@/lib/staff-business-authority'?`export const currentStaffBusinessGrant=async actor=>fixture.staffGrant&&(actor.access_role==='team_member'||actor.access_role==='operations_manager'),currentBusinessAuthority=async(actor,id)=>actor.access_role==='platform_admin'?'administrator':actor.access_role==='client'&&actor.business_id===id?'owner':fixture.staffGrant&&(actor.access_role==='team_member'||actor.access_role==='operations_manager')?'staff':null;`
      :a.path==='@/components/NavigationPendingIndicator'?`import React from 'react';export const NavigationPendingProvider=p=><>{p.children}</>,NavigationPendingMain=p=><main>{p.children}</main>;`
      :a.path==='@/components/WorkspaceNavigation'?`export default p=>{fixture.groups=p.groups;return null;};`
      :`export default ()=>null;`}));
  }}]});
  const module={exports:{} as {default:(p:Record<string,unknown>)=>Promise<React.ReactNode>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,require:createRequire(import.meta.url)});
  const business={id:18,name:'QA Showroom',handle:'qa-showroom'},principal={id:1,name:'QA Admin',access_role:'platform_admin',role:'admin',business_id:null,staff_queue_scope:'all'};
  let html=renderToStaticMarkup(await module.exports.default({user:principal,business,children:'Record'}));
  const hrefs=fixture.groups.flatMap(group=>group.items.map(item=>item.href));
  assert.equal(hrefs.filter(href=>href==='/dashboard/admin/businesses').length,1);
  assert.ok(!hrefs.includes('/dashboard/admin/discovery'),'Business location is contextual, not a duplicate global Businesses destination.');
  assert.ok(!hrefs.some(href=>href.includes('business=18')),'Local business sections do not expand the global sidebar.');
  assert.match(html,/href="\/dashboard\/admin\/businesses"[^>]*>Switch business/);
  assert.match(html,/href="\/dashboard\/products\?business=18" aria-current="page"/);
  assert.match(html,/@qa-showroom/);assert.match(html,/Location &amp; visibility/);
  const localLinks=Array.from(html.matchAll(/<nav[^>]*aria-label="Business workspace"[^>]*>(.*?)<\/nav>/g))[0]?.[1]||'';
  assert.deepEqual(Array.from(localLinks.matchAll(/<a[^>]*>([^<]+)<\/a>/g),item=>item[1]),['Overview','Your page','Products','Business details','Location &amp; visibility','Access']);
  fixture.pathname='/dashboard/catalog';html=renderToStaticMarkup(await module.exports.default({user:principal,business,children:'Categories'}));assert.match(html,/href="\/dashboard\/products\?business=18" aria-current="page"/);
  fixture.pathname='/dashboard/access';html=renderToStaticMarkup(await module.exports.default({user:principal,business,children:'Access'}));assert.match(html,/href="\/dashboard\/access\?business=18" aria-current="page"/);
  fixture.pathname='/dashboard/admin/sponsors';html=renderToStaticMarkup(await module.exports.default({user:principal,business,children:'Sponsors'}));assert.match(html,/href="\/dashboard\/admin\/discovery\/18" aria-current="page"/);
  fixture.pageAccess=false;
  const transportAgent={...principal,access_role:'team_member',staff_queue_scope:'transport'};
  html=renderToStaticMarkup(await module.exports.default({user:transportAgent,business:null,children:'Queue'}));
  assert.ok(!html.includes('Business details')&&!html.includes('qa-showroom'),'Queue agents have no business context/editor sections.');
  assert.deepEqual(Array.from(fixture.groups).flatMap(group=>Array.from(group.items,item=>item.href)),['/dashboard/support?queue=transport','/dashboard','/dashboard/tracking'],'Granted Transport staff have a separate Businesses destination alongside chat and Tracking');
  html=renderToStaticMarkup(await module.exports.default({user:{...principal,access_role:'team_member',staff_queue_scope:'support'},business:null,children:'Queue'}));
  assert.deepEqual(Array.from(fixture.groups).flatMap(group=>Array.from(group.items,item=>item.href)),['/dashboard/support?queue=support','/dashboard/reports','/dashboard'],'Granted Support staff gain Businesses but neither Transport nor Tracking');
  assert.ok(!html.includes('Business details')&&!html.includes('qa-showroom'),'Support-only staff also have no business editor context');
  fixture.pageAccess=true;
  html=renderToStaticMarkup(await module.exports.default({user:transportAgent,business,children:'Record'}));
  assert.match(html,/Location &amp; visibility/);
  assert.doesNotMatch(html,/href="\/dashboard\/access\?business=18"/,'Staff business authority does not grant owner account access');
  fixture.staffGrant=false;fixture.pageAccess=false;
  html=renderToStaticMarkup(await module.exports.default({user:transportAgent,business:null,children:'Queue'}));
  assert.deepEqual(Array.from(fixture.groups).flatMap(group=>Array.from(group.items,item=>item.href)),['/dashboard/support?queue=transport','/dashboard/tracking'],'Revoking business management removes Businesses without changing Transport or Tracking');
  html=renderToStaticMarkup(await module.exports.default({user:transportAgent,business,children:'Record'}));
  assert.doesNotMatch(html,/Location &amp; visibility|href="\/dashboard\/products\?business=18"/,'Revoked staff see no business task navigation');
});

import {businessListOrigin,businessListOriginParams} from '../lib/business-workspace-navigation';
test('FE-026 business list origins preserve bounded filters without arbitrary return URLs',()=>{
  const hints=businessListOriginParams({q:' studio & color ',page:'2',status:'active'});
  assert.equal(businessListOrigin(new URLSearchParams(hints)),'/dashboard/admin/businesses?q=studio+%26+color&page=2&status=active');
  assert.equal(businessListOrigin(new URLSearchParams('nav_page=1e9&nav_status=delete&returnTo=https://evil.test')),'/dashboard/admin/businesses');
  assert.ok(businessListOrigin(new URLSearchParams('nav_q='+'x'.repeat(500))).length<200);
});

test('FE-026 actual business navigation restores only the current actor/business origin across prop changes',async()=>{
  type Effect={deps:unknown[];cleanup?:()=>void};
  const nav={scrollLeft:0,getBoundingClientRect:()=>({left:10,right:300}),querySelector:(_selector:string)=>({getBoundingClientRect:()=>({left:350,right:430})})};
  const fixture={pathname:'/dashboard/products',states:[] as unknown[],cursor:0,effectCursor:0,effects:[] as Effect[],pending:[] as Array<()=>void>,nav};
  const saved=new Map<string,string>(),location={search:'?business=18&nav_q=Studio&nav_page=2'},sessionStorage={getItem:(key:string)=>saved.get(key)??null,setItem:(key:string,value:string)=>{saved.set(key,value);}};
  const result=await build({entryPoints:['components/BusinessWorkspaceNavigation.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react/jsx-runtime'],plugins:[{name:'business-origin-hooks',setup(b){
    b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
    b.onResolve({filter:/^(react|next\/link|next\/navigation)$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:a.path==='react'?`
      export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return [fixture.states[i],value=>{fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value;}];};
      export const useRef=()=>({current:fixture.nav});
      export const useEffect=(create,deps)=>{const i=fixture.effectCursor++,prior=fixture.effects[i];if(!prior||deps.some((value,j)=>!Object.is(value,prior.deps[j])))fixture.pending.push(()=>{prior?.cleanup?.();fixture.effects[i]={deps:[...deps],cleanup:create()};});};`
      :a.path==='next/link'?`export default 'a';`:`export const usePathname=()=>fixture.pathname;`}));
  }}]});
  type Props={name:string;handle:string;parentHref:string;parentLabel:string;label:string;links:Array<{href:string;label:string}>;actorId:number;businessId:number};
  const module={exports:{} as {default:(props:Props)=>React.ReactNode}};
  const observers:Array<{callback:()=>void;disconnected:boolean;target:unknown}>=[];
  class LocalResizeObserver{entry:{callback:()=>void;disconnected:boolean;target:unknown};constructor(callback:()=>void){this.entry={callback,disconnected:false,target:null};observers.push(this.entry);}observe(target:unknown){this.entry.target=target;}disconnect(){this.entry.disconnected=true;}}
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,window:{location,sessionStorage},ResizeObserver:LocalResizeObserver,URLSearchParams,require:createRequire(import.meta.url)});
  const canonical='/dashboard/admin/businesses';
  const props:Props={name:'Business eighteen',handle:'business-eighteen',parentHref:canonical,parentLabel:'Switch business',label:'Business workspace',links:[{href:'/dashboard/products?business=18',label:'Products'}],actorId:1,businessId:18};
  function render(){
    fixture.cursor=0;fixture.effectCursor=0;let element=module.exports.default(props);
    for(let cycle=0;fixture.pending.length;cycle++){
      assert.ok(cycle<5,'Effects must settle without a render loop');
      fixture.pending.splice(0).forEach(effect=>effect());fixture.cursor=0;fixture.effectCursor=0;element=module.exports.default(props);
    }
    return renderToStaticMarkup(element);
  }
  const href=(html:string)=>Array.from(html.matchAll(/<a href="([^"]+)"[^>]*>Switch business<\/a>/g))[0]?.[1].replaceAll('&amp;','&');
  assert.equal(href(render()),canonical+'?q=Studio&page=2');assert.equal(saved.get('suqpage:business-list-origin:1:18'),canonical+'?q=Studio&page=2');
  assert.equal(nav.scrollLeft,130,'The active section is revealed inside its own horizontal nav; no document scroll or focus API exists in this fixture');
  location.search='?business=19';props.businessId=19;props.name='Business nineteen';
  assert.equal(href(render()),canonical,'A different business without stored origin must not inherit the previous filtered list');
  saved.set('suqpage:business-list-origin:1:19',canonical+'?q=Furniture&status=active');fixture.pathname='/dashboard/settings';
  assert.equal(href(render()),canonical+'?q=Furniture&status=active');
  props.actorId=2;
  assert.equal(href(render()),canonical,'A different actor without stored origin must not inherit the prior actor filter');
  saved.set('suqpage:business-list-origin:2:19',canonical+'?q=New+actor&page=3');fixture.pathname='/dashboard/access';
  assert.equal(href(render()),canonical+'?q=New+actor&page=3','Only the current actor/business storage key supplies the restored origin');
  props.actorId=1;props.businessId=18;location.search='?business=18';
  assert.equal(href(render()),canonical+'?q=Studio&page=2','Returning to the original actor and business restores its own bounded origin');
  props.parentHref='/dashboard';
  assert.equal(href(render()),'/dashboard','Leaving privileged list navigation restores the role parent without cached admin filters');
  nav.scrollLeft=130;nav.querySelector=()=>({getBoundingClientRect:()=>({left:-30,right:50})});
  props.businessId=19;render();assert.equal(nav.scrollLeft,90,'A clipped leading destination scrolls only the local navigation left');
  nav.querySelector=()=>({getBoundingClientRect:()=>({left:100,right:200})});
  props.businessId=20;render();assert.equal(nav.scrollLeft,90,'An already visible destination causes no movement');
  nav.scrollLeft=0;nav.querySelector=()=>({getBoundingClientRect:()=>({left:350,right:430})});observers.at(-1)!.callback();
  assert.equal(nav.scrollLeft,130,'A viewport resize reveals the active item without changing the selected task');assert.equal(observers.at(-1)!.target,nav);assert.ok(observers.slice(0,-1).every(observer=>observer.disconnected),'Replaced context observers release their old navigation instance');
});
