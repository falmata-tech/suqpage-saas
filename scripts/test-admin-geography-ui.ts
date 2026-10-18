import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

type Element={type:string;props:Record<string,unknown>&{children?:unknown}};
const nodes=(node:unknown):Element[]=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(nodes):[node as Element,...nodes((node as Element).props.children)];
const place={id:'nairobi',name:'Nairobi',region:'Nairobi County',countryCode:'KE',kind:'city',localName:'',latitude:-1.28,longitude:36.81};

test('BE-054 actual admin geography component clears stale country/city authority without touching coordinates',async()=>{
  const state={values:[] as unknown[],cursor:0};
  const built=await build({entryPoints:['components/DiscoveryGeographyFields.tsx'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'geography-field-ports',setup(b){
    b.onResolve({filter:/^(react(?:\/jsx-runtime)?|@\/lib\/i18n\/ui|\.\/CountrySelect|\.\/PlaceSearch)$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:a.path==='react'?`export const useState=initial=>{const i=state.cursor++;if(!(i in state.values))state.values[i]=initial;return[state.values[i],value=>state.values[i]=value]};`:a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`:a.path==='@/lib/i18n/ui'?`export const useUiText=()=>s=>s;`:`export default '${a.path.slice(2)}';`}));
  }}]});
  const module={exports:{} as {default:(p:Record<string,unknown>)=>Element}};vm.runInNewContext(built.outputFiles[0].text,{module,exports:module.exports,state});
  const render=(props:Record<string,unknown>={countryCode:'KE',city:'Nairobi',place})=>{state.cursor=0;return nodes(module.exports.default(props));};
  const select=(tree:Element[],name:string)=>tree.find(node=>node.type===name)!;
  let tree=render();assert.equal(select(tree,'PlaceSearch').props.selected,place);
  assert.equal(select(tree,'PlaceSearch').props.selectionRequired,true);
  (select(tree,'CountrySelect').props.onChange as (v:string)=>void)('ZA');tree=render();
  assert.equal(select(tree,'PlaceSearch').props.selected,null);assert.equal(select(tree,'PlaceSearch').props.value,'');assert.equal(select(tree,'PlaceSearch').props.countryCode,'ZA');
  const cape={...place,id:'cape',countryCode:'ZA',name:'Cape Town'};
  (select(tree,'PlaceSearch').props.onSelect as(v:unknown)=>void)(cape);tree=render();assert.equal(select(tree,'PlaceSearch').props.selected,cape);
  (select(tree,'PlaceSearch').props.onChange as(v:string)=>void)('Cape elsewhere');tree=render();assert.equal(select(tree,'PlaceSearch').props.selected,null);assert.equal(select(tree,'PlaceSearch').props.value,'Cape elsewhere');
  assert.ok(!tree.some(node=>['latitude','longitude','city','region','zone'].includes(String(node.props.name))),'The city selector cannot rewrite the separate pin or post forged labels');
  state.values=[];tree=render({countryCode:'',city:'Unknown legacy town',place:null});assert.ok(!tree.some(node=>node.type==='CountrySelect'||node.type==='PlaceSearch'),'Unrelated saves retain unknown legacy geography without forcing an invented city');
  (tree.find(node=>node.type==='button')!.props.onClick as()=>void)();tree=render({countryCode:'',city:'Unknown legacy town',place:null});assert.equal(select(tree,'CountrySelect').props.value,'');assert.equal(select(tree,'PlaceSearch').props.selected,null);
});

test('FE-026 actual admin location page puts the editor first and prefills pending versus reviewed canonical places',async()=>{
  const fixture={role:'platform_admin',pending:false,place:null as typeof place|null};
  const built=await build({entryPoints:['app/dashboard/admin/discovery/[businessId]/page.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'geography-page-ports',setup(b){
    b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default {facts:"facts"};'}));
    b.onResolve({filter:/^(next\/|next-intl\/|@\/)/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
      a.path==='next/link'?`import React from 'react';export default ({children,...props})=><a {...props}>{children}</a>;`
      :a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url})},notFound=()=>{throw Error('not found')};`
      :a.path==='next-intl/server'?`export const getLocale=async()=> 'en';`
      :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>s=>s;`
      :a.path==='@/lib/auth'?`export const requireUser=async()=>({access_role:fixture.role});`
      :a.path==='@/lib/capabilities'?`export const hasCapability=actor=>actor.access_role==='platform_admin';`
      :a.path==='@/lib/countries'?`export const countryName=code=>code==='KE'?'Kenya':'South Africa';`
      :a.path==='@/lib/place-catalog'?`export const findKnownPlace=id=>id==='nairobi'?place:id==='cape'?({...place,id:'cape',name:'Cape Town',countryCode:'ZA'}):null;`
      :a.path==='@/lib/owner-business-runtime'?`export const readLocationProposal=async()=>({version:3,reviewed_version:fixture.pending?2:3,country_code:'ZA',city:'Cape Town',region:'Western Cape',place_id:'cape',location_mode:'storefront',latitude:-33.92,longitude:18.42});`
      :a.path==='@/lib/discovery-admin'?`export const getDiscoveryProfileAdminView=async()=>({businessId:18,businessName:'QA shop',handle:'qa-shop',city:'Nairobi',region:'Nairobi County',zone:'',countryCode:'KE',cityId:'nairobi',industryKeys:['fashion'],latitude:-1.2,longitude:36.8,fallbackStyle:'workshop',productionScale:'workshop'});`
      :a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async()=>({id:18});`
      :a.path==='@/lib/discovery'?`export const DISCOVERY_INDUSTRIES=[{key:'fashion',label:'Fashion'}];`
      :a.path==='@/app/staff-actions'?`export const updateDiscoveryProfileAction=async()=>{};`
      :a.path==='@/components/DashboardShell'?`import React from 'react';export default ({children})=><main>{children}</main>;`
      :a.path==='@/components/FocusedEditForm'?`import React from 'react';export default ({children,cancelHref})=><form>{children}<a href={cancelHref}>Cancel</a></form>;`
      :a.path==='@/components/DiscoveryGeographyFields'?`import React from 'react';export default p=><div data-geography={JSON.stringify(p)}/>;`
      :`export default ()=>null;`}));
  }}]});
  const module={exports:{} as {default:(p:Record<string,unknown>)=>Promise<React.ReactNode>}};vm.runInNewContext(built.outputFiles[0].text,{module,exports:module.exports,fixture,place,Number,require:createRequire(import.meta.url)});
  const render=async(edit='profile')=>renderToStaticMarkup(await module.exports.default({params:Promise.resolve({businessId:'18'}),searchParams:Promise.resolve({edit})}));
  let html=await render();assert.ok(html.indexOf('Edit discovery profile')<html.indexOf('Visibility summary'));assert.match(html,/&quot;countryCode&quot;:&quot;KE&quot;/);assert.match(html,/&quot;id&quot;:&quot;nairobi&quot;/);
  assert.doesNotMatch(html,/Owner location:/,'Reviewed historical proposal must not be presented as the current owner location');
  assert.doesNotMatch(html,/name="(?:city|zone|region|existingBoothImagePath)"/);assert.match(html,/href="\/dashboard\/admin\/discovery\/18">Cancel/);assert.match(html,/<dt>Country<\/dt><dd>Kenya/);
  fixture.pending=true;html=await render();assert.match(html,/&quot;countryCode&quot;:&quot;ZA&quot;/);assert.match(html,/&quot;id&quot;:&quot;cape&quot;/);assert.match(html,/name="latitude"[^>]*value="-33.92"/);assert.match(html,/Owner location:/,'An unreviewed owner draft keeps its context');
  html=await render('');assert.doesNotMatch(html,/<form|data-geography/);
  fixture.role='team_member';await assert.rejects(render(),error=>(error as {url?:string}).url==='/dashboard');
});
