import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import type {ReactElement} from 'react';

async function ownerScreen(entry:string){
 const fixture={
  user:{id:7,name:'PRIVATE OWNER NAME',email:'private-owner@example.invalid',business_id:18 as number|null,access_role:'client',staff_queue_scope:null as string|null},
  home:{user:{name:'PRIVATE OWNER NAME',email:'private-owner@example.invalid',phone:'+12025550199'},shop:{name:'Merchant <Studio>',handle:'merchant-studio',logo:'/seed/merchant-logo.svg',cover:'/seed/merchant-cover.jpg',status:'active',accentColor:'#B6FF00',contacts:{email:'private-contact@example.invalid'},products:[{name:'PRIVATE UNUSED PRODUCT'}]},activity:{visitsTotal:111,visits30Days:22,products:3} as {visitsTotal:number;visits30Days:number;products:number}|undefined},
  homeReads:[] as number[],businessReads:[] as number[],
 };
 const result=await build({entryPoints:[entry],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime','lucide-react'],plugins:[{name:'owner-account-ports',setup(b){
  b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
  b.onResolve({filter:/^(next\/link|next\/navigation|@\/lib\/(?:auth|catalog-runtime|mobile\/owner|i18n\/server)|@\/components\/DashboardShell)$/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
   a.path==='next/link'?`import React from 'react';export default props=><a {...props}/>;`
   :a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url});};`
   :a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.user;`
   :a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async id=>{fixture.businessReads.push(id);return {id,name:fixture.home.shop.name};};`
   :a.path==='@/lib/mobile/owner'?`export const ownerHome=async actor=>{fixture.homeReads.push(actor.business_id);return fixture.home;};`
   :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>s=>s;`
   :`import React from 'react';export default props=><main>{props.children}</main>;`}));
 }}]});
 const module={exports:{} as {default:(props:{searchParams:Promise<Record<string,string>>})=>Promise<ReactElement>}};
 vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,require:createRequire(import.meta.url)});
 return {fixture,render:async(query:Record<string,string>={})=>renderToStaticMarkup(await module.exports.default({searchParams:Promise.resolve(query)}))};
}

test('FE-056 Account hub is a compact linked-owner identity with real activity and six saved destinations',async()=>{
 const {fixture,render}=await ownerScreen('app/dashboard/profile/page.tsx');
 let html=await render({business:'99'});
 assert.match(html,/<h1>Account<\/h1>/);assert.doesNotMatch(html,/<h1>Dashboard<\/h1>/);
 assert.match(html,/Merchant &lt;Studio&gt;/);assert.match(html,/@merchant-studio/);assert.match(html,/merchant-logo\.svg/);assert.match(html,/Your page is live/);assert.match(html,/--store-accent:#B6FF00/);
 assert.deepEqual(Array.from(fixture.homeReads),[18]);assert.deepEqual(Array.from(fixture.businessReads),[18],'Caller query cannot choose another tenant');
 assert.deepEqual(Array.from(html.matchAll(/<dd>(\d+)<\/dd>/g),match=>Number(match[1])),[111,22,3],'Only authoritative owner activity values are shown');
 const links=Array.from(html.matchAll(/<a\b[^>]*href="([^"]+)"/g),match=>match[1]);
 assert.deepEqual(links,['/dashboard/profile/showroom','/dashboard/products','/dashboard/transport','/dashboard/business','/dashboard/account','/dashboard/support']);
 assert.doesNotMatch(html,/PRIVATE OWNER NAME|private-owner@|12025550199|private-contact@|PRIVATE UNUSED PRODUCT|merchant-cover\.jpg/);
 assert.doesNotMatch(html,/<form|<input|<details|Sign out|Public contact details|href="\/(?:privacy|terms)"/);
 html=await render({saved:'cover'});assert.match(html,/role="status">Changes saved\./);
 fixture.home.activity=undefined;html=await render();assert.doesNotMatch(html,/<dl/,'Missing activity is not replaced by invented counts');
 for(const [status,label]of [['draft','Private until you publish'],['suspended','Suspended']]){fixture.home.shop.status=status;assert.ok((await render()).includes(label));}
});

test('FE-056 Your page menu opens existing focused workflows with a clear Account return',async()=>{
 const {fixture,render}=await ownerScreen('app/dashboard/profile/showroom/page.tsx');
 const html=await render();
 assert.match(html,/<h1>Your page<\/h1>/);assert.match(html,/Back to account/);assert.match(html,/@merchant-studio/);
 const links=Array.from(html.matchAll(/<a\b[^>]*href="([^"]+)"/g),match=>match[1].replaceAll('&amp;','&'));
 assert.deepEqual(links,['/dashboard/profile','/dashboard/page-editor?view=preview&returnTo=showroom','/dashboard/page-editor?view=edit&task=about&returnTo=showroom','/dashboard/profile/cover?returnTo=showroom','/dashboard/page-editor?view=edit&task=video&returnTo=showroom','/dashboard/page-editor?view=preview&task=color&returnTo=showroom','/dashboard/page-editor?view=edit&task=contacts&returnTo=showroom','/dashboard/profile/handle?returnTo=showroom','/dashboard/page-editor?view=edit&task=team&returnTo=showroom']);
 for(const label of ['Preview page','About the business','Cover photo','Business video','Page color','Public contact details','Page address','Allow team editing','Page content','Appearance','Sharing and access'])assert.ok(html.includes(label));
 assert.doesNotMatch(html,/>Edit page</,'Owner navigation must name the actual task rather than open the old omnibus editor');
 assert.deepEqual(Array.from(fixture.homeReads),[18]);assert.deepEqual(Array.from(fixture.businessReads),[18]);
 assert.doesNotMatch(html,/PRIVATE OWNER NAME|private-owner@|12025550199|private-contact@|PRIVATE UNUSED PRODUCT|<form|<input|<details/);
});

for(const entry of ['app/dashboard/profile/page.tsx','app/dashboard/profile/showroom/page.tsx'])test(`FE-056 ${entry} refuses unlinked owners and every staff role before private data reads`,async()=>{
 const {fixture,render}=await ownerScreen(entry);
 for(const role of ['platform_admin','operations_manager','team_member'])for(const scope of [null,'support','transport']){
  fixture.user.access_role=role;fixture.user.staff_queue_scope=scope;
  await assert.rejects(render(),error=>(error as {url?:string}).url==='/dashboard');
 }
 fixture.user.access_role='client';fixture.user.staff_queue_scope=null;fixture.user.business_id=null;
 await assert.rejects(render(),error=>(error as {url?:string}).url==='/dashboard');
 assert.deepEqual(Array.from(fixture.homeReads),[]);assert.deepEqual(Array.from(fixture.businessReads),[]);
});
