import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url);
const bundle=build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React,{Suspense,useState} from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';import Refresh from './components/SupportThreadRefresh';
 const root=createRoot(document.getElementById('root'));let advance,serial=0,resolved=0;const waiting=new Map();
 window.fixture={calls:0,hidden:false,resolve:()=>{resolved=serial;waiting.get(serial)?.resolve();},mount:(active=true,closed=false)=>flushSync(()=>root.render(<Stage active={active} closed={closed}/>))};
 window.fixture.refresh=()=>{window.fixture.calls++;serial++;let resolve;const promise=new Promise(r=>resolve=r);waiting.set(serial,{promise,resolve});advance(serial);};
 function Gate({value}){if(value>resolved)throw waiting.get(value).promise;return <p>Ready {value}</p>;}
 function Stage({active,closed}){const[value,setValue]=useState(0);advance=setValue;return <><Refresh active={active} closed={closed}/><Suspense fallback={<p>Loading</p>}><Gate value={value}/></Suspense></>;}
 Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.fixture.hidden});window.fixture.mount();
`},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'router-transition-port',setup(builder){
 builder.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},args=>({path:require.resolve(args.path)}));
 builder.onResolve({filter:/^next\/navigation$/},args=>({path:args.path,namespace:'port'}));builder.onLoad({filter:/.*/,namespace:'port'},()=>({loader:'js',contents:`const router={refresh:()=>window.fixture.refresh()};export const useRouter=()=>router;`}));
}}]});
type Fixture={calls:number;hidden:boolean;resolve:()=>void;mount:(active?:boolean,closed?:boolean)=>void};
test('FE-019 thread refresh guards an unsettled React transition, pauses hidden routes and preserves 5/30-second cadence', {timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000});const errors:string[]=[];
 try{const page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));const fixed=Date.now();await page.clock.install({time:fixed});await page.clock.pauseAt(fixed+1000);await page.setContent('<div id="root"></div>');await page.addScriptTag({content:(await bundle).outputFiles[0].text});
  const calls=()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.calls);
  await page.clock.fastForward(5000);await page.waitForFunction(()=>(window as unknown as{fixture:Fixture}).fixture.calls===1);await page.clock.runFor(32);await page.clock.fastForward(50000);assert.equal(await calls(),1,'Unsettled route transition blocks overlapping refresh dispatch');
  await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.hidden=true;f.resolve();});await page.getByText('Ready 1',{exact:true}).waitFor();await page.clock.fastForward(60000);assert.equal(await calls(),1,'Hidden thread does not dispatch refresh');
  await page.evaluate(()=>{(window as unknown as{fixture:Fixture}).fixture.hidden=false;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>(window as unknown as{fixture:Fixture}).fixture.calls===2);await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.resolve());await page.getByText('Ready 2',{exact:true}).waitFor();
  await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.mount(true,true));await page.clock.fastForward(29999);assert.equal(await calls(),2);await page.clock.fastForward(1);await page.waitForFunction(()=>(window as unknown as{fixture:Fixture}).fixture.calls===3);await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.resolve());await page.getByText('Ready 3',{exact:true}).waitFor();
  await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.mount(false,true));await page.clock.fastForward(60000);assert.equal(await calls(),3,'Inactive thread removes timers');await page.close();
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});
