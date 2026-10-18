import assert from 'node:assert/strict';import {test} from 'node:test';import {build} from 'esbuild';import vm from 'node:vm';import type {SessionUser} from '../lib/types';
test('FE-026 missing workspace context redirects to the authorized role home and never chooses a tenant',async()=>{
 const fixture={reads:0,assigned:false,business:null as {id:number}|null};
 const result=await build({entryPoints:['lib/dashboard.ts'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'context-adapters',setup(b){b.onResolve({filter:/^(next\/navigation|\.\/catalog-runtime|\.\/runtime-sql)$/},a=>({path:a.path,namespace:'ports'}));b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(new Error('redirect'),{url})};`:a.path==='./catalog-runtime'?`export const runtimeBusinessById=async()=>{fixture.reads++;return fixture.business;};`:`export const runtimeGet=async()=>fixture.assigned?{}:null;`}));}}]});
 type Context=(user:SessionUser,requested?:number)=>Promise<unknown>;
 const module={exports:{} as {resolveBusiness:Context;resolveManagedBusiness:Context;resolveProductBusiness:Context}};vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture});
 for(const [role,queue,url] of [['platform_admin',null,'/dashboard/admin'],['team_member','support','/dashboard/support?queue=support'],['team_member','transport','/dashboard/support?queue=transport']] as const){const user={id:3,access_role:role,staff_queue_scope:queue,business_id:null} as SessionUser;
   assert.equal(await module.exports.resolveBusiness(user),null,'The general workspace chooser still supports no selection');
   for(const fn of [module.exports.resolveManagedBusiness,module.exports.resolveProductBusiness])await assert.rejects(fn(user),(e:unknown)=>Boolean(e&&typeof e==='object'&&'url' in e&&e.url===url));
 }
 assert.equal(fixture.reads,0,'No tenant lookup occurs when context is absent');
 const agent={id:3,access_role:'team_member',staff_queue_scope:'support',business_id:null} as SessionUser;fixture.assigned=true;
 await assert.rejects(module.exports.resolveProductBusiness(agent,999),(e:unknown)=>Boolean(e&&typeof e==='object'&&'url' in e&&e.url==='/dashboard'));assert.equal(fixture.reads,0,'A stale legacy assignment does not reveal a foreign business');
 fixture.business={id:7};const owner={id:4,access_role:'client',business_id:7} as SessionUser;assert.deepEqual(await module.exports.resolveProductBusiness(owner,999),fixture.business,'Owner uses canonical tenant rather than caller-supplied ID');
});
