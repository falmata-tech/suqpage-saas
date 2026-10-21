import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {renderToStaticMarkup} from 'react-dom/server';
import type {ReactElement} from 'react';
import type {SessionUser} from '../lib/types';

const require=createRequire(import.meta.url);
type State={pathname:string;search:string;grant:boolean};
let fixturePromise:Promise<{state:State;render:(actor:SessionUser,queue?:'support'|'transport')=>Promise<string>}>|undefined;
async function fixture(){
 return fixturePromise??=(async()=>{
  const state:State={pathname:'/dashboard/account',search:'',grant:true};
  const result=await build({entryPoints:['components/DashboardShell.tsx'],bundle:true,write:false,format:'cjs',platform:'node',jsx:'automatic',external:['react','react/jsx-runtime','lucide-react'],plugins:[{name:'workspace-selection-ports',setup(b){
   b.onResolve({filter:/^@\/components\/WorkspaceNavigation$/},()=>({path:process.cwd()+'/components/WorkspaceNavigation.tsx'}));
   b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default {};'}));
   b.onResolve({filter:/^(?:next\/(?:link|navigation)$|@\/app\/actions$|@\/lib\/(?:i18n\/(?:ui|server)|config|owner-page-runtime|owner-page-service|owner-page-domain|staff-business-authority)$|@\/components\/|\.\/(?:AttentionAlerts|BusinessWorkspaceNavigation)$)/},a=>({path:a.path,namespace:'ports'}));
   b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:a.path==='next/link'?`import React from'react';export default props=><a {...props}/>;`:a.path==='next/navigation'?`export const usePathname=()=>state.pathname,useSearchParams=()=>new URLSearchParams(state.search);`:a.path==='@/app/actions'?`export const logoutAction=async()=>{};`:a.path==='@/lib/i18n/ui'?`export const useUiText=()=>key=>key;`:a.path==='@/lib/i18n/server'?`export const getUiText=async()=>key=>key;`:a.path==='@/lib/config'?`export const authDriver=()=> 'supabase';`:a.path==='@/lib/staff-business-authority'?`export const currentStaffBusinessGrant=async()=>state.grant,currentBusinessAuthority=async()=>null;`:a.path==='@/lib/owner-page-runtime'?`export const ownerPageEditorEnabled=()=>false,ownerPagePort={};`:a.path==='@/lib/owner-page-service'?`export const readOwnerPage=async()=>{};`:a.path==='@/lib/owner-page-domain'?`export class OwnerPageError extends Error{}`:a.path.endsWith('NavigationPendingIndicator')?`import React from'react';export default()=>null;export const NavigationPendingProvider=props=><>{props.children}</>,NavigationPendingMain=props=><main>{props.children}</main>;`:`export default()=>null;`}));
  }}]});
  const module={exports:{}as{default:(props:{user:SessionUser;business:null;children:null;supportQueue?:'support'|'transport'})=>Promise<ReactElement>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require,state,URLSearchParams});
  return{state,render:async(actor:SessionUser,queue?:'support'|'transport')=>renderToStaticMarkup(await module.exports.default({user:actor,business:null,children:null,supportQueue:queue}))};
 })();
}
const actor=(access_role:SessionUser['access_role'],staff_queue_scope:SessionUser['staff_queue_scope']='all'):SessionUser=>({id:9,email:'fixture@example.test',name:'Fixture',role:'admin',access_role,staff_queue_scope,business_id:access_role==='client'?18:null,must_change_password:0});
function nav(html:string,kind='workspace-nav') {return html.match(new RegExp('<nav class="'+kind+'"[^>]*>([\\s\\S]*?)<\\/nav>'))?.[1]||'';}
function currentLinks(html:string){return [...html.matchAll(/<a\b([^>]*)>/g)].filter(m=>m[1].includes('aria-current="page"')).map(m=>m[1].match(/href="([^"]+)"/)?.[1].replaceAll('&amp;','&'));}

test('FE-026 Account and nested security tasks select one complete-menu destination for every authorized role',async()=>{
 const f=await fixture();
 for(const user of[actor('team_member'),actor('team_member','transport'),actor('team_member','support'),actor('operations_manager'),actor('platform_admin'),actor('client')]){
  for(const pathname of['/dashboard/account','/dashboard/account/email']){
   f.state.pathname=pathname;f.state.search='';const html=await f.render(user);
   assert.deepEqual(currentLinks(nav(html)),['/dashboard/account'],user.access_role+'/'+user.staff_queue_scope+pathname);
   const phone=nav(html,'workspace-mobile-tabs');if(user.access_role==='client'){assert.equal(phone,'','Owners retain their separate existing public phone navigation');continue;}
   const current=currentLinks(phone);
   if(phone.includes('href="/dashboard/account"'))assert.deepEqual(current,['/dashboard/account']);
   else{assert.deepEqual(current,[],'A hidden Account task must not select the generic Business workspaces or Overview tab');assert.match(phone,/<button[^>]*class="workspace-menu-button"[^>]*data-active="true"/,'More locates the current destination outside the primary tabs');}
  }
 }
});

test('FE-026 complete-menu selection preserves authorized queues and specific workspace ancestors on desktop and phone',async()=>{
 const f=await fixture();
 const cases:Array<{user:SessionUser;path:string;query?:string;queue?:'support'|'transport';href:string}>=[
  {user:actor('team_member'),path:'/dashboard',href:'/dashboard'},
  {user:actor('team_member'),path:'/dashboard/products',query:'business=18',href:'/dashboard'},
  {user:actor('team_member'),path:'/dashboard/tracking/21',href:'/dashboard/tracking'},
  {user:actor('team_member','transport'),path:'/dashboard/support/71/assignments',query:'queue=support',queue:'transport',href:'/dashboard/support?queue=transport'},
  {user:actor('team_member','support'),path:'/dashboard/support/71',queue:'support',href:'/dashboard/support?queue=support'},
  {user:actor('platform_admin'),path:'/dashboard/admin/staff/9',href:'/dashboard/admin/staff'},
  {user:actor('platform_admin'),path:'/dashboard/admin/businesses/18',href:'/dashboard/admin/businesses'},
  {user:actor('operations_manager'),path:'/dashboard/support/agents',href:'/dashboard/support/agents'},
  {user:actor('client'),path:'/dashboard/profile/showroom',href:'/dashboard/profile/showroom'},
  {user:actor('client'),path:'/dashboard/products/21',href:'/dashboard/products'},
 ];
 for(const c of cases){f.state.pathname=c.path;f.state.search=c.query||'';const html=await f.render(c.user,c.queue);assert.deepEqual(currentLinks(nav(html)),[c.href],c.user.access_role+c.path);const phone=nav(html,'workspace-mobile-tabs');if(!phone)continue;const escaped=c.href.replaceAll('&','&amp;');if(phone.includes('href="'+escaped+'"'))assert.deepEqual(currentLinks(phone),[c.href]);else{assert.deepEqual(currentLinks(phone),[]);assert.match(phone,/data-active="true"/);}}
 f.state.pathname='/dashboard/account';f.state.grant=false;const revoked=await f.render(actor('team_member','transport'));assert.deepEqual(currentLinks(nav(revoked)),['/dashboard/account']);assert.doesNotMatch(nav(revoked),/href="\/dashboard"/,'Selection cannot invent revoked Business workspaces access');f.state.grant=true;
});
