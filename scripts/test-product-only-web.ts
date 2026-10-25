import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium,type Page} from 'playwright';

const require=createRequire(import.meta.url);
const bundle=build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
 import ProductForm from './components/ProductForm';import Controls from './components/MarketSearchControls';
 const root=createRoot(document.getElementById('root'));let mountId=0;
 function Search(){const[value,setValue]=useState(window.fixture.search);return <Controls ready={true} scope={window.fixture.scope} value={value} onChange={next=>{window.fixture.changes.push(next);setValue(next);}} metadata={{industries:[],countries:[],places:[]}}/>;}
 window.fixture.mount=(screen,product)=>flushSync(()=>root.render(screen==='search'?<Search key={++mountId}/>:<ProductForm key={++mountId} product={product} catalog={{categories:[]}} businessId={7} contentVersion={3} idempotencyKey='local-product-only-key' staffMode={false} action={async data=>{window.fixture.saves.push(Object.fromEntries(data));}}/>));
`},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'product-ui-ports',setup(builder){
 builder.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},args=>({path:require.resolve(args.path)}));
 builder.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:'css'}));builder.onLoad({filter:/.*/,namespace:'css'},()=>({loader:'js',contents:'export default {};'}));
 builder.onResolve({filter:/^(?:@\/lib\/i18n\/ui|next\/navigation|next-intl|@\/components\/(?:ProductMediaFields|ProductOptionsFields|LoadingBar))$/},args=>({path:args.path,namespace:'ports'}));
 builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',resolveDir:process.cwd(),contents:args.path==='@/lib/i18n/ui'?`export const useUiText=()=>s=>s;`:args.path==='next/navigation'?`export {unstable_rethrow} from ${JSON.stringify(require.resolve('next/dist/client/components/unstable-rethrow.browser.js'))};export const useRouter=()=>({push(){}});`:args.path==='next-intl'?`export const useLocale=()=> 'en';`:`export default ()=>null;`}));
}}]});
type Fixture={scope:string;saves:Array<Record<string,string>>;changes:Array<{madeToOrder:boolean;categories:string[];countries:string[];cities:string[];page:number;query:string}>;mount:(screen:string,product?:Record<string,unknown>)=>void};
async function boot(page:Page,screen:string,kind='made_to_order'){
 await page.setContent('<main id="root"></main>');
 await page.addScriptTag({content:`window.fixture={saves:[],changes:[],scope:'products',search:{query:'door',categories:['furniture'],countries:['ET'],cities:['ET:Addis Ababa'],madeToOrder:false,page:4}};`});
 await page.addScriptTag({content:(await bundle).outputFiles[0].text});
 await page.evaluate(({screen,kind})=>(window as unknown as{fixture:Fixture}).fixture.mount(screen,{id:21,name:'QA wooden door',description:'A measured solid wooden door.',availability:'available',offering_kind:kind,price_minor:null,quantity_unit:'',highlights:[],image_path:'',option_groups:[]}),{screen,kind});
}

test('FE-067 web product editor preserves Made to order and requires explicit conversion of retained service records',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000});const errors:string[]=[];
 try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const kind of ['made_to_order','standard_product']){
   await boot(page,'editor',kind);const choice=page.getByLabel('How is this product supplied?',{exact:true});
   assert.equal(await choice.inputValue(),kind);assert.deepEqual(await choice.locator('option:not([disabled])').evaluateAll(nodes=>nodes.map(n=>(n as HTMLOptionElement).value)),['standard_product','made_to_order']);
   await page.getByLabel('Name',{exact:true}).fill('Updated wooden door');await page.getByRole('button',{name:'Save changes',exact:true}).click();
   await page.waitForFunction(()=>(window as unknown as{fixture:Fixture}).fixture.saves.length===1);
   assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.saves[0].offeringKind),kind,'A content-only save cannot flatten a custom product');
  }
  await boot(page,'editor','service');const choice=page.getByLabel('How is this product supplied?',{exact:true});assert.equal(await choice.inputValue(),'');
  await page.getByLabel('Name',{exact:true}).fill('Retained draft name');await page.getByRole('button',{name:'Save changes',exact:true}).click();
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.saves.length),0,'Required explicit supply choice prevents accidental service conversion');
  assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),'Retained draft name');
  await choice.selectOption('made_to_order');await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await page.waitForFunction(()=>(window as unknown as{fixture:Fixture}).fixture.saves.length===1);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.saves[0].offeringKind),'made_to_order');
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-067 made-to-order control toggles product scope, preserves other criteria and clears through the existing reset',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000});const errors:string[]=[];
 try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await boot(page,'search');
  const toggle=page.getByRole('button',{name:'Made to order',exact:true});assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  assert.equal(await page.getByRole('button',{name:'Type',exact:true}).count(),0);assert.equal(await page.getByText('Services',{exact:true}).count(),0);
  await toggle.click();assert.equal(await toggle.getAttribute('aria-pressed'),'true');
  let last=await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.changes.at(-1)!);
  assert.deepEqual(last,{query:'door',categories:['furniture'],countries:['ET'],cities:['ET:Addis Ababa'],madeToOrder:true,page:1});
  await toggle.press('Space');assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  await toggle.click();await page.getByRole('button',{name:'Clear all',exact:true}).click();
  last=await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.changes.at(-1)!);
  assert.deepEqual(last,{query:'',categories:[],countries:[],cities:[],madeToOrder:false,page:1});
  await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.scope='businesses';f.mount('search');});
  assert.equal(await page.getByRole('button',{name:'Made to order',exact:true}).count(),0,'Product supply filter is absent from business map controls');
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});
