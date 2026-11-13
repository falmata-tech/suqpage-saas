import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import path from 'node:path';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';

test('FE-079 actual native public resource refresh preserves drafts, fences scope and stops in background',async()=>{
 const mobileRequire=createRequire(path.resolve('apps/mobile/package.json'));
 const bundle=await build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React,{useState}from'react';import{createRoot}from'react-dom/client';import{usePublicShop}from'./apps/mobile/src/use-public-shop';
 const jobs=[],listeners=new Set();window.shopPort={focused:true,appState:'active',jobs:()=>jobs.map((j,id)=>({id,path:j.path,aborted:j.signal?.aborted||false})),
 answer:(id,value)=>jobs[id].resolve(value),background:value=>{shopPort.appState=value;for(const fn of listeners)fn(value);},subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
 function Probe(){const[handle,setHandle]=useState('first'),[draft,setDraft]=useState('');const load=usePublicShop(handle);
 shopPort.change=setHandle;shopPort.reload=load.reload;
 return <main><output id='shop'>{load.data?.publicRevision||''}</output><output id='error'>{load.error}</output><input aria-label='Preserved draft' value={draft} onChange={e=>setDraft(e.target.value)}/></main>}
 shopPort.request=(path,options={})=>new Promise((resolve,reject)=>jobs.push({path,signal:options.signal,resolve,reject}));createRoot(document.getElementById('root')).render(<Probe/>);
 `},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'native-refresh-ports',setup(b){
  b.onResolve({filter:/^(react(?:\/.*)?|react-dom(?:\/.*)?)$/},a=>({path:mobileRequire.resolve(a.path)}));
  b.onResolve({filter:/^(react-native|expo-router|@react-navigation\/native)$/},a=>({path:a.path,namespace:'port'}));
  b.onResolve({filter:/^\.\/runtime$/},a=>a.importer.endsWith('/use-public-shop.ts')?{path:'runtime',namespace:'port'}:undefined);
  b.onLoad({filter:/.*/,namespace:'port'},a=>({loader:'tsx',resolveDir:process.cwd(),contents:
   a.path==='react-native'?`export const AppState={get currentState(){return shopPort.appState},addEventListener:(_,fn)=>({remove:shopPort.subscribe(fn)})};`:
   a.path==='@react-navigation/native'?`export const useIsFocused=()=>shopPort.focused;`:
   a.path==='expo-router'?`import{useEffect}from'react';export function useFocusEffect(fn){useEffect(fn,[fn]);}`:
   `import{useResourceLoad}from'./apps/mobile/src/use-resource-load';export const request=(...args)=>shopPort.request(...args);export const useLoad=(loader,identity)=>useResourceLoad(loader,identity);`}));
 }}]});
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage();
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const jobs=()=>page.evaluate(()=>(window as unknown as {shopPort:{jobs:()=>Array<{id:number;path:string;aborted:boolean}>}}).shopPort.jobs());
 const answer=(id:number,value:unknown)=>page.evaluate(({id,value})=>(window as unknown as {shopPort:{answer:(id:number,value:unknown)=>void}}).shopPort.answer(id,value),{id,value});
 try{
  await page.clock.install();await page.setContent('<div id="root"></div>');await page.addScriptTag({content:bundle.outputFiles[0].text});
  await expect.poll(async()=>(await jobs()).length).toBe(1);await answer(0,{handle:'first',publicRevision:'first:1'});await expect(page.locator('#shop')).toHaveText('first:1');
  await page.getByLabel('Preserved draft').fill('Keep this edited inquiry');
  await page.clock.runFor(15000);await expect.poll(async()=>(await jobs()).length).toBe(2);assert.equal((await jobs())[1].path,'shops/first/revision');
  await answer(1,{revision:'first:2'});await expect.poll(async()=>(await jobs()).length).toBe(3);await answer(2,{handle:'first',publicRevision:'first:2'});await expect(page.locator('#shop')).toHaveText('first:2');await expect(page.getByLabel('Preserved draft')).toHaveValue('Keep this edited inquiry');
  await page.clock.runFor(15000);await expect.poll(async()=>(await jobs()).length).toBe(4);
  await page.evaluate(()=>(window as unknown as {shopPort:{background:(state:string)=>void}}).shopPort.background('background'));
  assert.equal((await jobs())[3].aborted,true);await answer(3,{revision:'first:3'});await page.clock.runFor(60000);assert.equal((await jobs()).length,4);
  await page.evaluate(()=>(window as unknown as {shopPort:{background:(state:string)=>void}}).shopPort.background('active'));await expect.poll(async()=>(await jobs()).length).toBe(5);
  await page.evaluate(()=>(window as unknown as {shopPort:{change:(handle:string)=>void}}).shopPort.change('second'));
  await expect(page.locator('#shop')).toHaveText('');await expect.poll(async()=>(await jobs()).length).toBe(6);
  await answer(4,{revision:'first:999'});await answer(5,{handle:'second',publicRevision:'second:1'});await expect(page.locator('#shop')).toHaveText('second:1');assert.equal((await jobs()).length,6);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
