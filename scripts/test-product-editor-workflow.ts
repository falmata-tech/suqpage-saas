import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from 'playwright';

const require=createRequire(import.meta.url);
const bundle=build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
 import ProductForm from './components/ProductForm';import OwnerBusinessForm from './components/OwnerBusinessForm';
 const root=createRoot(document.getElementById('root'));let key=0;
 const product={id:21,business_id:7,name:'Wooden door',description:'A solid wooden door.',availability:'limited',offering_kind:'made_to_order',price_minor:12500,quantity_unit:'piece',highlights:[],image_path:'/uploads/seed/door-a.jpg',video_ref:'',media:[{kind:'image',ref:'/uploads/seed/door-a.jpg'},{kind:'image',ref:'/uploads/seed/door-b.jpg'}],is_published:0,option_groups:[]};
 const place={id:'qa-city',name:'Addis Ababa',localName:'Addis Ababa',kind:'city',countryCode:'ET',region:'Addis Ababa',latitude:9,longitude:38};
 const setup={business:{name:'Wooden Workshop',logo_path:'',content_version:3},proposal:{version:1,country_code:'ET',city:place.name,region:place.region,location_mode:'area'},existing:null,place,category:'home-living'};
 window.fixture.mount=(screen='product',staffMode=false)=>{window.fixture.routes=[];window.fixture.saves=[];flushSync(()=>root.render(<><a href='/dashboard/profile'>Account</a><a href='/dashboard/products?q=chairs&page=2'>Products</a>{screen==='business'?<OwnerBusinessForm key={++key} setup={setup} action={window.fixture.save} cancelHref='/dashboard/business'/>:<ProductForm key={++key} catalog={{categories:[]}} product={product} businessId={7} contentVersion={3} idempotencyKey='qa-editor-key' staffMode={staffMode} action={window.fixture.save} cancelHref='/dashboard/products?q=door&page=3' listOrigin={{q:'door',page:'3'}}/>}</>));};
`},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',plugins:[{name:'editor-workflow-ports',setup(b){
 b.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},a=>({path:require.resolve(a.path)}));
 b.onResolve({filter:/\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({loader:'js',contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
 b.onResolve({filter:/^(next\/navigation|@\/lib\/i18n\/ui|(?:@\/components\/|\.\/)(?:LoadingBar|CountrySelect|PlaceSearch|CategorySelect))$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',resolveDir:process.cwd(),contents:a.path==='next/navigation'?`export {unstable_rethrow} from ${JSON.stringify(require.resolve('next/dist/client/components/unstable-rethrow.browser.js'))};export const useRouter=()=>({push:href=>window.fixture.routes.push(href)});`
  :a.path==='@/lib/i18n/ui'?`export const useUiText=()=> (key,values={})=>key.replace(/\{([^}]+)\}/g,(_,name)=>values[name]??'{'+name+'}');`
  :a.path.endsWith('LoadingBar')?`export default ()=> <div role='progressbar'/>;`
  :a.path.endsWith('CountrySelect')?`export default ({value,onChange})=> <select id='business-country' name='countryCode' value={value} onChange={e=>onChange(e.target.value)}><option value='ET'>Ethiopia</option><option value='KE'>Kenya</option></select>;`
  :a.path.endsWith('PlaceSearch')?`export default ({value,onChange})=> <input id='owner-city' value={value} onChange={e=>onChange(e.target.value)}/>;`
  :`export default ({id,name,defaultValue})=><select id={id} name={name} defaultValue={defaultValue}><option value='home-living'>Home</option><option value='other-products'>Other products</option></select>;`}));
}}]});

type Harness={
 mount:(screen?:string,staff?:boolean)=>void;
 routes:string[];
 saves:Array<{fields:Record<string,string>;files:Array<{name:string;size:number}>}>;
 settle:(kind:'error'|'reject'|'success')=>void;
};
async function start(browser:Browser,screen='product',staff=false){
 const page=await browser.newPage();const errors:string[]=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Editor fixture runtime:',e.message);});
 await page.route('http://localhost:31999/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<main id="root"></main>'}));
 await page.goto('http://localhost:31999/dashboard/products/21/edit');
 await page.addScriptTag({content:`window.fixture={routes:[],saves:[],save:async data=>{window.fixture.saves.push({fields:Object.fromEntries(Array.from(data).filter(([,value])=>typeof value==='string')),files:data.getAll('mediaImages').filter(value=>value instanceof File).map(file=>({name:file.name,size:file.size}))});return new Promise((resolve,reject)=>{window.fixture.settle=kind=>kind==='reject'?reject(new Error('private provider credential')):resolve(kind==='error'?{error:'This page has newer saved changes. Reload before saving.'}:undefined);});}};`});
 await page.addScriptTag({content:(await bundle).outputFiles[0].text});
 await page.evaluate(({screen,staff})=>(window as unknown as{fixture:Harness}).fixture.mount(screen,staff),{screen,staff});
 await page.getByRole('button',{name:screen==='business'?'Save business details':'Save changes',exact:true}).waitFor({timeout:10000});
 await page.waitForFunction(()=>!(document.querySelector('button[type=submit]') as HTMLButtonElement|null)?.disabled);
 return {page,errors};
}
const routes=(page:Page)=>page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.routes);
const saves=(page:Page)=>page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.saves);
const settle=(page:Page,kind:'error'|'reject'|'success')=>page.evaluate(kind=>(window as unknown as{fixture:Harness}).fixture.settle(kind),kind);
const dirtyUnload=(page:Page)=>page.evaluate(()=>{const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;});
const remount=(page:Page,screen='product',staff=false)=>page.evaluate(({screen,staff})=>(window as unknown as{fixture:Harness}).fixture.mount(screen,staff),{screen,staff});

test('FE-047/BE-032 owner product controls submit explicit listing state and bounded list hints, with staff-only fields kept private',{timeout:45000},async()=>{
 const browser=await chromium.launch({timeout:20000});try{const{page,errors}=await start(browser);
  assert.equal(await page.getByLabel('Availability',{exact:true}).inputValue(),'limited');
  assert.equal(await page.getByLabel('Visibility',{exact:true}).inputValue(),'0');
  assert.equal(await page.getByLabel('Category',{exact:true}).count(),0);assert.equal(await page.getByText('Product choices',{exact:true}).count(),0);assert.equal(await page.getByLabel('Customer-service note',{exact:true}).count(),0);
  await page.getByLabel('Availability',{exact:true}).selectOption('unavailable');await page.getByLabel('Visibility',{exact:true}).selectOption('1');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();await page.waitForFunction(()=>(window as unknown as{fixture:Harness}).fixture.saves.length===1);
  const saved=(await saves(page))[0].fields;assert.equal(saved.availability,'unavailable');assert.equal(saved.isPublished,'1');assert.equal(saved.offeringKind,'made_to_order');assert.equal(saved.nav_q,'door');assert.equal(saved.nav_page,'3');
  assert.equal(saved.optionGroups,undefined);assert.equal(saved.categoryId,undefined);assert.equal(saved.serviceNote,undefined);
  await settle(page,'success');await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(await routes(page),['/dashboard/products?q=door&page=3']);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-026/BE-032 rejected product saves retain files, order and inputs, fence duplicate submits and offer an explicit retry',{timeout:45000},async()=>{
 const browser=await chromium.launch({timeout:20000});try{const{page,errors}=await start(browser);
  await page.getByLabel('Name',{exact:true}).fill('Measured wooden door');await page.getByLabel('Description',{exact:true}).fill('A retained product description.');
  await page.getByLabel('Add photos',{exact:true}).setInputFiles({name:'door-new.png',mimeType:'image/png',buffer:Buffer.from('qa-image')});
  await page.getByRole('button',{name:'Move media right',exact:true}).first().click();
  const order=await page.locator('input[name=mediaOrder]').inputValue();
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  assert.equal(await page.getByLabel('Name',{exact:true}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:'Cancel',exact:true}).isDisabled(),true);
  await page.getByRole('link',{name:'Account',exact:true}).click();assert.deepEqual(await routes(page),[],'Pending edits cannot disappear through workspace navigation');assert.equal(await page.getByRole('dialog').count(),0);
  await page.evaluate(()=>document.querySelector('form')!.requestSubmit());assert.equal((await saves(page)).length,1,'The immediate ref guard rejects a second submit');
  await settle(page,'error');await page.getByRole('alert').filter({hasText:'newer saved changes'}).waitFor();
  assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),'Measured wooden door');assert.equal(await page.getByLabel('Description',{exact:true}).inputValue(),'A retained product description.');assert.equal(await page.locator('input[name=mediaOrder]').inputValue(),order);
  assert.equal(await dirtyUnload(page),true,'A failed save leaves the draft protected');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();await settle(page,'reject');await page.getByRole('alert').filter({hasText:'Unable to connect. Please try again.'}).waitFor();
  assert.equal(await page.getByText('private provider credential').count(),0);assert.equal(await page.locator('input[name=mediaOrder]').inputValue(),order);assert.deepEqual((await saves(page)).map(save=>save.files),[[{name:'door-new.png',size:8}],[{name:'door-new.png',size:8}]]);
  await page.getByRole('button',{name:'Save changes',exact:true}).click();await settle(page,'success');await page.waitForFunction(()=>document.querySelector('form')!.getAttribute('aria-busy')==='false');assert.equal(await dirtyUnload(page),false,'Compatibility actions returning success clear the saved draft baseline');
  await page.getByLabel('Name',{exact:true}).fill('Another unsaved change');assert.equal(await dirtyUnload(page),true,'Editing after success creates a new protected draft');assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-056 Cancel and app navigation preserve dirty edits until Discard, while reverted controls leave without a false warning',{timeout:45000},async()=>{
 const browser=await chromium.launch({timeout:20000});try{const{page,errors}=await start(browser);
  await page.getByLabel('Name',{exact:true}).fill('Temporary name');await page.getByLabel('Name',{exact:true}).fill('Wooden door');assert.equal(await dirtyUnload(page),false);
  await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(await routes(page),['/dashboard/products?q=door&page=3']);assert.equal(await page.getByRole('dialog').count(),0);
  await remount(page);await page.getByLabel('Name',{exact:true}).fill('Keep this name');await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('dialog',{name:'Unsaved changes'}).waitFor();
  await page.getByRole('button',{name:'Keep editing',exact:true}).click();assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),'Keep this name');assert.deepEqual(await routes(page),[]);
  await page.getByRole('link',{name:'Account',exact:true}).click();await page.getByRole('dialog',{name:'Unsaved changes'}).waitFor();assert.equal(await page.url(),'http://localhost:31999/dashboard/products/21/edit');
  await page.getByRole('button',{name:'Discard changes',exact:true}).click();assert.deepEqual(await routes(page),['/dashboard/profile']);assert.equal((await saves(page)).length,0,'Discard never submits or auto-saves the draft');assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-047/056 media reorder/removal, unadded video drafts and option-only edits all participate in exit protection',{timeout:45000},async()=>{
 const browser=await chromium.launch({timeout:20000});try{const{page,errors}=await start(browser);
  const verify=async()=>{assert.equal(await dirtyUnload(page),true);await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('dialog',{name:'Unsaved changes'}).waitFor();await page.getByRole('button',{name:'Keep editing',exact:true}).click();assert.deepEqual(await routes(page),[]);};
  await page.getByRole('button',{name:'Move media right',exact:true}).first().click();await verify();
  await page.getByRole('button',{name:'Move media left',exact:true}).last().click();assert.equal(await dirtyUnload(page),false,'Returning media to the saved order is clean');
  await page.getByRole('button',{name:'Remove media 1',exact:true}).click();await verify();
  await remount(page);await page.getByLabel('Video link',{exact:true}).fill('https://www.youtube.com/watch?v=aqz-KE-bpKQ');await verify();
  await remount(page,'product',true);assert.equal(await page.getByLabel('Category',{exact:true}).count(),1);assert.equal(await page.getByLabel('Customer-service note',{exact:true}).count(),1);await page.getByRole('button',{name:'Add option',exact:true}).click();await verify();
  await page.getByRole('button',{name:'Remove option 1',exact:true}).click();assert.equal(await dirtyUnload(page),false,'Removing an untouched new option returns to the saved draft');assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-056 Business details places Cancel beside Save and protects name/logo/location drafts and rejects duplicate saves',{timeout:45000},async()=>{
 const browser=await chromium.launch({timeout:20000});try{const{page,errors}=await start(browser,'business');
  const save=page.getByRole('button',{name:'Save business details',exact:true}),cancel=page.getByRole('button',{name:'Cancel',exact:true});
  assert.equal(await save.evaluate(node=>node.parentElement===Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Cancel')?.parentElement),true);
  await page.getByLabel('Business name',{exact:true}).fill('Retained workshop');await page.getByLabel('Business logo',{exact:true}).setInputFiles({name:'logo.png',mimeType:'image/png',buffer:Buffer.from('qa-logo')});
  await page.getByLabel('Public location',{exact:true}).selectOption('storefront');await page.getByLabel('Storefront latitude',{exact:true}).fill('9.01');await page.getByLabel('Storefront longitude',{exact:true}).fill('38.76');
  await cancel.click();await page.getByRole('button',{name:'Keep editing',exact:true}).click();assert.equal(await page.getByLabel('Storefront latitude',{exact:true}).inputValue(),'9.01');
  await save.click();await page.evaluate(()=>document.querySelector('form')!.requestSubmit());assert.equal((await saves(page)).length,1);assert.equal(await page.getByLabel('Business name',{exact:true}).isDisabled(),true);
  await settle(page,'error');await page.getByRole('alert').waitFor();assert.equal(await page.getByLabel('Business name',{exact:true}).inputValue(),'Retained workshop');assert.equal(await page.getByLabel('Business logo',{exact:true}).evaluate((node:HTMLInputElement)=>node.files?.[0]?.name),'logo.png');
  await cancel.click();await page.getByRole('button',{name:'Discard changes',exact:true}).click();assert.deepEqual(await routes(page),['/dashboard/business']);assert.equal((await saves(page)).length,1);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
