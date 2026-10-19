import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

async function renderPage(entry:string,enabled:boolean,role='platform_admin'){
  const fixture={role,enabled};
  const result=await build({entryPoints:[entry],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'staff-business-ui-ports',setup(plugin){
    plugin.onResolve({filter:/^(next\/(?:link|navigation)|@\/|\.\/actions$)/},args=>({path:args.path,namespace:'ports'}));
    plugin.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',contents:
      args.path==='next/link'?`import React from 'react';export default ({children,...props})=><a {...props}>{children}</a>;`
      :args.path==='next/navigation'?`export const redirect=path=>{throw Object.assign(new Error('redirect'),{path});},notFound=()=>{throw Error('not found');};`
      :args.path==='@/lib/auth'?`export const requireUser=async()=>({id:1,access_role:fixture.role});`
      :args.path==='@/lib/capabilities'?`export const hasCapability=(actor,key)=>actor.access_role==='platform_admin'&&key==='platform:admin';`
      :args.path==='@/lib/staff-operations'?`export class StaffOperationError extends Error{};export const getStaffAccount=async()=>({id:7,name:'Test Agent',email:'staff@example.invalid',access_role:'team_member',queue_scope:'transport'}),getStaffBusinessGrant=async()=>({enabled:fixture.enabled,version:4});`
      :args.path==='@/lib/i18n/server'?`export const getUiText=async()=>(s,values={})=>s.replaceAll('{value1}',values.value1||'');`
      :args.path==='@/components/DashboardShell'?`import React from 'react';export default ({children})=><main>{children}</main>;`
      :args.path==='@/components/FocusedEditForm'?`import React from 'react';export default ({children,cancelHref,submitLabel})=><form>{children}<button>{submitLabel}</button><a href={cancelHref}>Cancel</a></form>;`
      :`export const updateStaffBusinessGrantAction=async()=>{};`}));
  }}]});
  const module={exports:{} as {default:(props:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string>>})=>Promise<React.ReactNode>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,require:createRequire(import.meta.url)});
  return renderToStaticMarkup(await module.exports.default({params:Promise.resolve({id:'7'}),searchParams:Promise.resolve({})}));
}

test('FE-072 staff account is read-first, with one focused business-permission task',async()=>{
  const detail=await renderPage('app/dashboard/admin/staff/[id]/page.tsx',true);
  assert.match(detail,/Test Agent/);
  assert.match(detail,/Business management is on/);
  assert.match(detail,/href="\/dashboard\/admin\/staff\/7\/manage-businesses"/);
  assert.doesNotMatch(detail,/<form|Staff assistance|Assign to business/);

  const edit=await renderPage('app/dashboard/admin/staff/[id]/manage-businesses/page.tsx',true);
  assert.match(edit,/name="enabled" value="0"/);
  assert.match(edit,/name="version" value="4"/);
  assert.match(edit,/name="confirmRevoke"/);
  assert.match(edit,/immediately stops Test Agent/);
  assert.match(edit,/>Stop business management<\/button>/);
  assert.match(edit,/href="\/dashboard\/admin\/staff\/7">Cancel/);

  const restore=await renderPage('app/dashboard/admin/staff/[id]/manage-businesses/page.tsx',false);
  assert.match(restore,/name="enabled" value="1"/);
  assert.match(restore,/>Restore business management<\/button>/);
  assert.doesNotMatch(restore,/name="confirmRevoke"/);
});

test('BE-060 staff cannot open the administrator grant editor',async()=>{
  await assert.rejects(renderPage('app/dashboard/admin/staff/[id]/manage-businesses/page.tsx',true,'team_member'),error=>(error as {path?:string}).path==='/dashboard');
});

test('FE-072 retired per-business assignment URL sends administrators to Staff',async()=>{
  const result=await build({entryPoints:['app/dashboard/admin/businesses/[businessId]/team/page.tsx'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{
    name:'retired-team-route',setup(plugin){plugin.onResolve({filter:/^next\/navigation$/},args=>({path:args.path,namespace:'ports'}));plugin.onLoad({filter:/.*/,namespace:'ports'},()=>({contents:`export const redirect=path=>{throw Object.assign(new Error('redirect'),{path});};`,loader:'js'}));},
  }]});
  const module={exports:{} as {default:()=>Promise<unknown>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:createRequire(import.meta.url)});
  await assert.rejects(module.exports.default(),error=>(error as {path?:string}).path==='/dashboard/admin/staff');
});
