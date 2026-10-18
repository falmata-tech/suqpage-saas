import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

test('FE-026 business team renders eligible grants and historical revoke without a scoped-agent Assign',async()=>{
 const fixture={businessId:18,rows:[
  {id:1,name:'Legacy page editor',email:'legacy@example.test',active:0,canAssign:true},
  {id:2,name:'Historical support agent',email:'support@example.test',active:1,canAssign:false},
  {id:3,name:'Revoked transport agent',email:'transport@example.test',active:0,canAssign:false},
 ]};
 const result=await build({entryPoints:['app/dashboard/admin/businesses/[businessId]/team/page.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'business-team-ports',setup(b){
  b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default {row:"row"};'}));
  b.onResolve({filter:/^(next\/link|next\/navigation|@\/|\.\/actions)/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
   a.path==='next/link'?`import React from 'react';export default p=><a {...p}/>;`
   :a.path==='next/navigation'?`export const notFound=()=>{throw new Error('not found')};`
   :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>(s,values={})=>s.replaceAll('{value1}',values.value1||'');`
   :a.path==='@/lib/auth'?`export const requireUser=async()=>({id:7,access_role:'platform_admin'});`
   :a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async id=>id===fixture.businessId?({id,name:'QA Business'}):null;`
   :a.path==='@/lib/business-assistance'?`export const listBusinessAssignmentCandidates=async(actor,id)=>{if(id!==fixture.businessId)throw Error('wrong business');return {items:fixture.rows,totalItems:3};};`
   :a.path==='@/components/DashboardShell'?`import React from 'react';export default p=><main>{p.children}</main>;`
   :a.path==='./actions'?`export const businessAssignmentAction=async()=>{};`
   :`export default ()=>null;`}));
 }}]});
 const module={exports:{} as {default:(p:Record<string,unknown>)=>Promise<React.ReactNode>}};
 vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,require:createRequire(import.meta.url)});
 const html=renderToStaticMarkup(await module.exports.default({params:Promise.resolve({businessId:'18'}),searchParams:Promise.resolve({})}));
 const rows=html.split(/<div class="compact-business-row[^"]*"/).slice(1);
 assert.equal(rows.length,3);assert.match(rows[0],/>Assign<\/button>/);assert.match(rows[0],/name="businessId" value="18"/);
 assert.match(rows[1],/Previous assignment/);assert.match(rows[1],/>Revoke access<\/button>/);assert.ok(!rows[1].includes('>Assign</button>'));
 assert.match(rows[2],/Previous assignment/);assert.ok(!rows[2].includes('<form'),'Revoked scoped history has no reactivation form');
 assert.match(html,/Support and transport agents work from their chat queues/);
 assert.match(html,/href="\/dashboard\/access\?business=18">Back to Access<\/a>/);
 assert.doesNotMatch(html,/href="\/dashboard\?business=18">Back/);
});
