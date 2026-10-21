import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import type {ReactElement} from 'react';

test('FE-026 focused account save binds the actor and only permits account/profile return destinations',async()=>{
  const fixture={fail:false,writes:[] as Array<{id:number;name:string;phone:string}>,auth:0};
  const result=await build({entryPoints:['app/dashboard/account/actions.ts'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'account-ports',setup(b){
    b.onResolve({filter:/^(next\/(navigation|cache)|@\/lib\/(auth|account-contact-runtime))$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({contents:a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(new Error('redirect'),{url});};`
      :a.path==='next/cache'?`export const revalidatePath=()=>{};`
      :a.path==='@/lib/auth'?`export const requireUser=async()=>{fixture.auth++;return{id:7}};`
      :`export const accountContactPort={saveProfile:async(id,name,phone)=>{if(fixture.fail)throw Error('private postgres credential');fixture.writes.push({id,name,phone});return true;}};`}));
  }}]});
  const module={exports:{} as {saveProfileAccountAction:(form:FormData)=>Promise<void|{error:string}>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,FormData});
  const form=(returnTo?:string)=>{const f=new FormData();f.set('name','QA Owner');f.set('accountPhone','+12025550123');if(returnTo)f.set('returnTo',returnTo);return f;};
  for(const [returnTo,url] of [['account','/dashboard/account?contact=saved'],['profile','/dashboard/profile?saved=account'],['','/dashboard/profile?saved=account']])await assert.rejects(module.exports.saveProfileAccountAction(form(returnTo)),error=>(error as {url?:string}).url===url);
  assert.ok(fixture.writes.every(write=>write.id===7));
  const before=fixture.writes.length;
  assert.equal((await module.exports.saveProfileAccountAction(form('https://evil.test')))?.error,'Unsupported fields.');
  const forged=form('account');forged.set('userId','99');assert.equal((await module.exports.saveProfileAccountAction(forged))?.error,'Unsupported fields.');
  assert.equal(fixture.writes.length,before);
  fixture.fail=true;assert.equal((await module.exports.saveProfileAccountAction(form('account')))?.error,'Unable to connect. Please try again.');
  const invalid=form('account');invalid.set('accountPhone','invalid');assert.equal((await module.exports.saveProfileAccountAction(invalid))?.error,'Enter your account phone with + and its country code.');
});

for(const screen of ['business','account'])test(`FE-026 owner ${screen} opens saved details before one deliberate editor`,async()=>{
  const fixture={user:{id:7,name:'QA Owner',email:'qa@example.invalid',business_id:18,access_role:'client'},business:{id:18,name:'QA Store',handle:'qa-store',logo_path:'',content_version:4},setup:{business:{name:'QA Store',logo_path:'',content_version:4},category:'electronics',proposal:{country_code:'ET',city:'Addis Ababa'},existing:null}};
  const result=await build({entryPoints:[`app/dashboard/${screen}/page.tsx`],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'owner-page-ports',setup(b){
    b.onResolve({filter:/^(next\/link|next\/navigation|@\/lib\/(?:i18n\/server|auth|config|catalog-runtime|account-contact-runtime|owner-business-runtime|business-handle-runtime|owner-email-runtime)|@\/components\/|\.\/(actions|handle-actions)$)/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
      a.path==='next/link'?`import React from 'react';export default props=><a {...props}/>;`
      :a.path==='next/navigation'?`export const redirect=url=>{throw Error(url);};`
      :a.path.endsWith('i18n/server')?`export const getUiText=async()=>s=>s;`
      :a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.user;`
      :a.path==='@/lib/config'?`export const authDriver=()=> 'supabase';`
      :a.path.endsWith('catalog-runtime')?`export const runtimeBusinessById=async()=>fixture.business;`
      :a.path.endsWith('owner-business-runtime')?`export const readOwnerBusiness=async()=>fixture.setup;`
      :a.path.endsWith('business-handle-runtime')?`export const readHandleSettings=async()=>({handle:'qa-store'});`
      :a.path.endsWith('account-contact-runtime')?`export const accountContactPort={read:async()=>({account_phone:'+12025550123'})};`
      :a.path.endsWith('owner-email-runtime')?`export const ownerEmailChangeEnabled=()=>false;`
      :a.path.endsWith('DashboardShell')?`import React from 'react';export default p=><main>{p.children}</main>;`
      :a.path.endsWith('OwnerBusinessForm')?`import React from 'react';export default p=><div data-editor="OwnerBusinessForm" data-return={p.returnTo} data-cancel={p.cancelHref}><a href={p.cancelHref}>Cancel</a></div>;`
      :a.path.includes('/components/')?`import React from 'react';export default p=><div data-editor="${a.path.split('/').at(-1)}" data-return={p.returnTo}/>;`
      :`export const saveBusinessHandleAction=()=>{},saveOwnerBusinessAction=()=>{},saveProfileAccountAction=()=>{},changePasswordAction=()=>{},logoutAction=()=>{};`}));
    b.onResolve({filter:/^@\/app\/actions$/},a=>({path:a.path,namespace:'ports'}));
  }}]});
  const module={exports:{} as {default:(props:{searchParams:Promise<Record<string,string>>})=>Promise<ReactElement>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture,require:createRequire(import.meta.url)});
  const render=async(query:Record<string,string>={})=>renderToStaticMarkup(await module.exports.default({searchParams:Promise.resolve(query)}));
  let html=await render();assert.doesNotMatch(html,/data-editor=/);assert.match(html,/QA Owner|QA Store/);assert.match(html,/edit=details/);assert.doesNotMatch(html,/<details/);
  html=await render({edit:'details'});assert.match(html,/data-editor=/);assert.match(html,/Cancel/);
  assert.ok(html.includes(`href="/dashboard/${screen}">Cancel`),'The one focused editor receives its saved-record Cancel destination');
  assert.equal((html.match(/data-editor=/g)||[]).length,1);
  html=await render({returnTo:'profile'});assert.match(html,/data-return="profile"/);assert.match(html,/href="\/dashboard\/profile"/);
  if(screen==='business')assert.match(html,/data-cancel="\/dashboard\/profile"/,'The form owns Cancel and receives the bounded Account return');
  html=await render({edit:'details',returnTo:'https://evil.test'});assert.doesNotMatch(html,/evil\.test/);assert.ok(html.includes(`href="/dashboard/${screen}">Cancel`),'An unrecognized origin cannot replace the saved-record Cancel destination');
});
