import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import path from 'node:path';

type Element={type:string;props:Record<string,unknown>&{children?:unknown}};
const nodes=(node:unknown):Element[]=>!node||typeof node!=='object'?[]:[node as Element,...[(node as Element).props.children].flat().flatMap(nodes)];
const text=(node:unknown):string=>node===null||node===undefined?'':typeof node!=='object'?String(node):[(node as Element).props.children].flat().map(text).join('');
class FormValues extends FormData{constructor(input?:{values:Record<string,string>}){super();for(const [key,value]of Object.entries(input?.values||{}))this.set(key,value);}}

test('FE-026/FE-072 focused edits support early native save, fence duplicates, and preserve recovery',async()=>{
  const state={values:[] as unknown[],refs:[] as {current:unknown}[],cursor:0,refCursor:0};
  const result=await build({entryPoints:['components/FocusedEditForm.tsx'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'form-ports',setup(b){
    b.onResolve({filter:/^next\/navigation$/},()=>({path:path.resolve('node_modules/next/dist/client/components/unstable-rethrow.browser.js')}));
    b.onResolve({filter:/^(react(?:\/jsx-runtime)?|next\/link|@\/lib\/i18n\/ui|\.\/LoadingBar)$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:a.path==='react'?`export const useState=initial=>{const i=state.cursor++;if(!(i in state.values))state.values[i]=initial;return[state.values[i],value=>state.values[i]=value]},useRef=initial=>{const i=state.refCursor++;return state.refs[i]||(state.refs[i]={current:initial})};`:a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`:a.path==='@/lib/i18n/ui'?`export const useUiText=()=>s=>s;`:`export default '${a.path.split('/').at(-1)}';`}));
  }}]});
  const module={exports:{} as {default:(props:Record<string,unknown>)=>Element}};vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,state,FormData:FormValues,Date});
  let resolve:(result:unknown)=>void=()=>{},reject:(error:Error)=>void=()=>{},calls=0;
  const action=async(form:FormData)=>{calls++;assert.equal(form.get('name'),'Retained user name');return new Promise((yes,no)=>{resolve=yes;reject=no;});};
  const render=()=>{state.cursor=0;state.refCursor=0;return module.exports.default({action,cancelHref:'/dashboard/settings?business=7',children:{type:'input',props:{name:'name',defaultValue:'Retained user name'}}});};
  // A save made before hydration must have the same server action as its native
  // form target. Calling that target here bypasses the client onSubmit handler.
  let earlyCalls=0;
  state.cursor=0;state.refCursor=0;
  const earlyAction=async(form:FormData)=>{earlyCalls++;assert.equal(form.get('name'),'Retained user name');return {error:'Retry after loading.'};};
  const earlyForm=module.exports.default({action:earlyAction,cancelHref:'/dashboard/settings?business=7',children:{type:'input',props:{name:'name',defaultValue:'Retained user name'}}});
  assert.equal(earlyForm.props.action,earlyAction,'native form submit must target the authenticated server action');
  await (earlyForm.props.action as (form:FormData)=>Promise<unknown>)(new FormValues({values:{name:'Retained user name'}}));
  assert.equal(earlyCalls,1);
  const form={values:{name:'Retained user name'}};
  const submit=(root:Element)=>(root.props.onSubmit as(event:unknown)=>Promise<void>)({preventDefault(){},currentTarget:form});
  const pending=submit(render());assert.equal(render().props['aria-busy'],true);assert.equal(nodes(render()).find(node=>node.type==='button')!.props.disabled,true);
  await submit(render());assert.equal(calls,1);resolve({error:'Business details changed. Reload before saving.'});await pending;
  assert.equal(text(nodes(render()).find(node=>node.props.role==='alert')),'Business details changed. Reload before saving.');
  assert.equal(form.values.name,'Retained user name');assert.equal(nodes(render()).find(node=>node.type==='link')!.props.href,'/dashboard/settings?business=7');
  const retry=submit(render());reject(new Error('private provider credential'));await assert.doesNotReject(retry);
  assert.equal(text(nodes(render()).find(node=>node.props.role==='alert')),'Unable to connect. Please try again.');assert.ok(!JSON.stringify(render()).includes('private provider credential'));
  const redirect=Object.assign(new Error('NEXT_REDIRECT'),{digest:'NEXT_REDIRECT;replace;/dashboard/settings?business=7;307;'});
  const success=submit(render());reject(redirect);await assert.rejects(success,error=>error===redirect);assert.equal(render().props['aria-busy'],false);
});
