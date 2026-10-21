import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync} from 'node:fs';
import vm from 'node:vm';
import {build} from 'esbuild';

test('FE-072 only the business location detail bypasses the admin layout',()=>{
  assert.ok(existsSync('app/dashboard/(business)/admin/discovery/[businessId]/page.tsx'));
  assert.ok(!existsSync('app/dashboard/admin/discovery/[businessId]/page.tsx'));
  for(const sibling of [
    'app/dashboard/admin/page.tsx',
    'app/dashboard/admin/businesses/page.tsx',
    'app/dashboard/admin/staff/page.tsx',
    'app/dashboard/admin/sponsors/page.tsx',
    'app/dashboard/admin/featured-schedule/page.tsx',
    'app/dashboard/admin/discovery/page.tsx',
  ])assert.ok(existsSync(sibling),`${sibling} remains under the admin-only layout`);
});

test('FE-072 the admin layout still denies direct sibling requests from staff',async()=>{
  const fixture={role:'team_member'};
  const built=await build({
    entryPoints:['app/dashboard/admin/layout.tsx'],bundle:true,write:false,
    format:'cjs',platform:'node',external:['react','react/jsx-runtime'],
    plugins:[{name:'admin-layout-ports',setup(plugin){
      plugin.onResolve({filter:/^(next\/navigation|@\/lib\/auth|@\/lib\/capabilities)$/},arg=>({path:arg.path,namespace:'ports'}));
      plugin.onLoad({filter:/.*/,namespace:'ports'},arg=>({loader:'js',contents:
        arg.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url});};`
        :arg.path==='@/lib/auth'?`export const requireUser=async()=>({access_role:fixture.role});`
        :`export const hasCapability=actor=>actor.access_role==='platform_admin';`,
      }));
    }}],
  });
  const module={exports:{} as {default:(props:{children:string})=>Promise<string>}};
  vm.runInNewContext(built.outputFiles[0].text,{module,exports:module.exports,fixture,Error});
  const layout=module.exports.default;
  for(const role of ['team_member','operations_manager','client']){
    fixture.role=role;
    await assert.rejects(layout({children:'private admin route'}),error=>(error as {url?:string}).url==='/dashboard');
  }
  fixture.role='platform_admin';
  assert.equal(await layout({children:'private admin route'}),'private admin route');
});
