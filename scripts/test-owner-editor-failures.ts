import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import path from 'node:path';

type Element={type:string;props:Record<string,unknown>&{children?:unknown}};
const elements=(node:unknown):Element[]=>!node||typeof node!=='object'?[]:[node as Element,...[(node as Element).props.children].flat().flatMap(elements)];
const text=(node:unknown):string=>node===null||node===undefined?'':typeof node!=='object'?String(node):[(node as Element).props.children].flat().map(text).join('');
class EditorFormData extends FormData {constructor(input?:{values:Record<string,string>}){super();for(const [key,value]of Object.entries(input?.values||{}))this.set(key,value);}}

for(const component of ['OwnerBusinessForm','HandleSettingsForm','AccountProfileForm'])test(`FE-056 ${component} retains input, bounds duplicate submissions and recovers from a rejected save`,async()=>{
  const state={values:[] as unknown[],refs:[] as {current:unknown}[],cursor:0,refCursor:0};
  const built=await build({entryPoints:[`components/${component}.tsx`],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'editor-ports',setup(b){
    b.onResolve({filter:/^next\/navigation$/},()=>({path:path.resolve('node_modules/next/dist/client/components/unstable-rethrow.browser.js')}));
    b.onResolve({filter:/^(react(?:\/jsx-runtime)?|next\/link|@\/lib\/i18n\/ui|\.\/(CountrySelect|PlaceSearch|CategorySelect|HandleField|OwnerLocationPicker|LocationVisibilityChoices|LoadingBar|useFormExitGuard))$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:a.path==='react'?`export const useState=initial=>{const i=state.cursor++;if(!(i in state.values))state.values[i]=initial;return[state.values[i],value=>state.values[i]=value]},useRef=initial=>{const i=state.refCursor++;return state.refs[i]||(state.refs[i]={current:initial})};`
      :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
      :a.path==='@/lib/i18n/ui'?`export const useUiText=()=>s=>s;`
      :a.path==='./useFormExitGuard'?`export default ()=>({confirmation:null,markSaved(){},allowExit(){},requestExit(){}});`
      :`export default '${a.path.split('/').at(-1)}';`}));
  }}]});
  const module={exports:{} as {default:(props:Record<string,unknown>)=>Element}};vm.runInNewContext(built.outputFiles[0].text,{module,exports:module.exports,state,FormData:EditorFormData,Date,navigator:{}});
  let reject:(error:Error)=>void=()=>{},resolve:(result:unknown)=>void=()=>{},calls=0;
  const action=async(form:FormData)=>{calls++;assert.equal(form.get('name'),'Retained QA business');return new Promise((yes,no)=>{resolve=yes;reject=no;});};
  const place={id:'qa-city',name:'Nairobi',countryCode:'KE',region:'Nairobi',latitude:-1.2921,longitude:36.8219};
  const props=component==='OwnerBusinessForm'?{setup:{business:{name:'Retained QA business',logo_path:'',content_version:1},proposal:{version:1,country_code:'ET',city:'Addis Ababa',region:'Addis Ababa',location_mode:'area'},location:{country_code:'KE',city:place.name,region:place.region,place_id:place.id,location_mode:'area',latitude:null,longitude:null},existing:null,place,category:'home-living'},action}:{settings:{handle:'qa-business',contentVersion:1,nextChangeAt:0},businessId:1,action};
  if(component==='AccountProfileForm')Object.assign(props,{name:'Retained QA business',email:'qa@example.invalid',phone:'+12025550123',returnTo:'account'});
  const render=()=>{state.cursor=0;state.refCursor=0;return module.exports.default(props);};
  let root=render();if(component==='HandleSettingsForm'){(elements(root).find(n=>n.type==='HandleField')!.props.onReady as(value:boolean)=>void)(true);root=render();}
  if(component==='OwnerBusinessForm'){
    assert.equal(elements(root).find(n=>n.type==='CountrySelect')?.props.value,'KE','Applied country replaces the reviewed historical proposal');
    assert.equal(elements(root).find(n=>n.type==='PlaceSearch')?.props.value,'Nairobi','The editor shows the effective applied city');
    assert.equal(elements(root).find(n=>n.type==='input'&&n.props.name==='locationVersion')?.props.value,1,'Original proposal version remains the concurrency token');
  }
  const values={name:'Retained QA business'},form={values};
  const submit=(tree:Element)=>component==='AccountProfileForm'?(tree.props.action as(form:FormData)=>Promise<void>)(new EditorFormData(form)):(tree.props.onSubmit as(event:unknown)=>Promise<void>)({preventDefault(){},currentTarget:form});
  const pending=submit(root);let current=render();const saving=current;
  reject(new Error('private provider/token details'));await assert.doesNotReject(pending,'A rejected save must remain inside the editor as a recoverable localized error');current=render();
  assert.equal(saving.props['aria-busy'],true,'Saving must be announced while the action is pending');
  assert.equal(elements(saving).find(n=>n.type==='button'&&(text(n)==='Saving...'||text(n)==='Save business details'))?.props.disabled,true,'Pending saves must disable their primary action');
  assert.equal(current.props['aria-busy'],false);assert.equal(text(elements(current).find(n=>n.props.role==='alert')),'Unable to connect. Please try again.');
  assert.ok(!JSON.stringify(current).includes('private provider/token details'));assert.equal(values.name,'Retained QA business');
  const retry=submit(current);assert.equal(calls,2,'An explicit retry is available after the failure');await submit(current);assert.equal(calls,2,'An immediate repeated submit must not create a second command');resolve({error:'This page has newer saved changes. Reload before saving.'});await retry;
  assert.equal(text(elements(render()).find(n=>n.props.role==='alert')),'This page has newer saved changes. Reload before saving.');
  const redirect=Object.assign(new Error('NEXT_REDIRECT'),{digest:'NEXT_REDIRECT;replace;/dashboard/profile?saved=business;307;'});const navigation=submit(render());reject(redirect);await assert.rejects(navigation,error=>error===redirect,'Successful framework redirects must retain their control flow');
  assert.equal(render().props['aria-busy'],false,'Redirect cleanup releases the pending guard');
});
