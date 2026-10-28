import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import type {Offering,Shop} from '@africmade/contracts';
import {createInquiryBaskets,INQUIRY_STORAGE_ERROR,restoreBusinessInquiry,type InquiryBasketStorage} from '../apps/mobile/src/inquiry-baskets';
const product=(id:number,extra:Partial<Offering>={}):Offering=>({id,name:'Product '+id,description:'Public product',kind:'standard_product',availability:'available',priceMinor:null,media:[],published:true,quantityMode:'optional',options:[],...extra});
const shop=(id:number,products=[product(id)]):Shop=>({id,handle:'business-'+id,name:'Business '+id,about:'',cover:'',videoUrl:'',contacts:{},products,version:1,status:'active',isDemo:false});
const item=(product:Offering,quantity='',options:Record<string,string>={})=>({product,quantity,options});
const settle=()=>new Promise<void>(resolve=>setImmediate(resolve));
function memory(){const records=new Map<number,string>();const storage:InquiryBasketStorage={read:async id=>records.get(id)||null,write:async(id,value)=>{records.set(id,value);}};return{records,storage};}

test('FE-041 S118 A and B lists persist independently as public references and restore against current catalog authority',async()=>{
 const {storage,records}=memory(),a=shop(1),b=shop(2),store=createInquiryBaskets(storage);
 await store.load(a.id);await store.load(b.id);store.update(a,()=>[item(a.products[0],'2')]);store.update(b,()=>[item(b.products[0],'5')]);await settle();
 assert.equal(store.read(a).items[0].quantity,'2');assert.equal(store.read(b).items[0].quantity,'5');
 for(const raw of records.values()){assert.ok(!raw.includes('Public product'));assert.ok(!raw.includes('contacts'));assert.ok(!raw.includes('handle'));assert.ok(!raw.includes('Business'));}
 const restarted=createInquiryBaskets(storage);await restarted.load(a.id);await restarted.load(b.id);
 assert.equal(restarted.read(a).items[0].product,a.products[0]);assert.equal(restarted.read(b).items[0].product,b.products[0]);
 restarted.update(a,()=>[]);await settle();assert.equal(restarted.read(a).items.length,0);assert.equal(restarted.read(b).items.length,1);
 await restarted.clear(b.id);const final=createInquiryBaskets(storage);await final.load(b.id);assert.equal(final.read(b).items.length,0);
});

test('FE-041 S118 stale products, options, quantities, duplicate variants and foreign stored authority are rejected',async()=>{
 const p=product(1,{options:[{name:'Color',values:['Blue','Red']}]}),a=shop(1,[p,product(2,{published:false}),product(3,{availability:'unavailable'}),product(4,{kind:'service'})]);
 const restored=restoreBusinessInquiry(a,[{productId:1,quantity:' 2\u0000boxes ',options:{Color:'Blue'}},{productId:1,quantity:'9',options:{Color:'Blue'}},{productId:1,quantity:'3',options:{Color:'Red'}},{productId:1,quantity:'',options:{Color:'Green'}},{productId:2,options:{}},{productId:3,options:{}},{productId:4,options:{}},{productId:99,options:{}}]);
 assert.equal(restored.length,2);assert.equal(restored[0].quantity,'2 boxes');assert.equal(restored[0].product,p);
 const {storage,records}=memory();records.set(a.id,JSON.stringify({version:1,businessId:99,items:[{productId:1,options:{Color:'Blue'}}]}));const store=createInquiryBaskets(storage);await store.load(a.id);assert.equal(store.read(a).items.length,0);
 records.set(2,'malformed');await store.load(2);assert.equal(store.read(shop(2)).items.length,0);
 assert.equal(restoreBusinessInquiry(shop(5),Array.from({length:100},()=>({productId:5,options:{}}))).length,1);
});

test('FE-041 S118 slow initial reads merge in-flight additions without dropping stored selections or a migrated basket',async()=>{
 let resolveRead!:(value:string)=>void;const writes:string[]=[];
 const storage:InquiryBasketStorage={read:()=>new Promise(resolve=>{resolveRead=resolve;}),write:async(_id,value)=>{writes.push(value);}};
 const a=shop(1,[product(1),product(2)]),store=createInquiryBaskets(storage),pending=store.load(a.id);
 store.update(a,()=>[item(a.products[1],'new')]);assert.equal(writes.length,0,'Never overwrite unknown existing data before read completes');
 resolveRead(JSON.stringify({version:1,businessId:1,items:[{productId:1,quantity:'saved',options:{}}]}));await pending;await settle();
 assert.deepEqual(store.read(a).items.map(value=>value.product.id),[2,1]);assert.equal(JSON.parse(writes.at(-1)!).items.length,2);
 const migrated=createInquiryBaskets({read:async()=>JSON.stringify({version:1,businessId:1,items:[{productId:1,quantity:'saved',options:{}}]}),write:async()=>{}});
 migrated.seed(a,[item(a.products[1])]);await migrated.load(a.id);assert.deepEqual(migrated.read(a).items.map(value=>value.product.id),[2,1]);
});

test('FE-041 S118 failed reads never overwrite unknown saved data and retry merges retained in-memory additions',async()=>{
 let denied=true;const records=new Map<number,string>([[1,JSON.stringify({version:1,businessId:1,items:[{productId:1,quantity:'old',options:{}}]})]]),writes:string[]=[];
 const storage:InquiryBasketStorage={read:async id=>{if(denied)throw Error('denied');return records.get(id)||null;},write:async(id,value)=>{writes.push(value);records.set(id,value);}};
 const a=shop(1,[product(1),product(2)]),store=createInquiryBaskets(storage);await store.load(a.id);assert.equal(store.read(a).error,INQUIRY_STORAGE_ERROR);
 store.update(a,()=>[item(a.products[1])]);await settle();assert.equal(writes.length,0);assert.equal(JSON.parse(records.get(1)!).items[0].productId,1);
 denied=false;await store.retry(a.id);await settle();assert.deepEqual(store.read(a).items.map(value=>value.product.id),[2,1]);assert.equal(store.read(a).error,'');
});

test('FE-041 S118 serialized writes retain the latest edit; failed writes keep memory and retry without affecting other businesses',async()=>{
 const records=new Map<number,string>(),pending:Array<{value:string;resolve:()=>void}>=[];let fail=false;
 const storage:InquiryBasketStorage={read:async()=>null,write:async(id,value)=>{if(fail)throw Error('write denied');await new Promise<void>(resolve=>pending.push({value,resolve}));records.set(id,value);}};
 const a=shop(1),store=createInquiryBaskets(storage);await store.load(a.id);store.update(a,()=>[item(a.products[0],'first')]);await settle();store.update(a,()=>[item(a.products[0],'last')]);await settle();assert.equal(pending.length,1);
 pending[0].resolve();await settle();assert.equal(pending.length,2);pending[1].resolve();await settle();assert.equal(JSON.parse(records.get(1)!).items[0].quantity,'last');
 fail=true;store.update(a,()=>[item(a.products[0],'retained')]);await settle();assert.equal(store.read(a).items[0].quantity,'retained');assert.equal(store.read(a).error,INQUIRY_STORAGE_ERROR);
 fail=false;const retry=store.retry(a.id);await settle();pending.at(-1)!.resolve();await retry;assert.equal(store.read(a).error,'');assert.equal(JSON.parse(records.get(1)!).items[0].quantity,'retained');
});

test('FE-041 S118 byte bounds preserve existing files and in-memory selections for large non-Latin option sets',async()=>{
 const groups=Array.from({length:20},(_,i)=>({name:'Choice '+i,values:['ሀ'.repeat(500)]})),products=Array.from({length:20},(_,i)=>product(i+1,{options:groups})),a=shop(1,products),{storage,records}=memory(),store=createInquiryBaskets(storage);
 await store.load(a.id);store.update(a,()=>[item(products[0],'initial',Object.fromEntries(groups.map(group=>[group.name,group.values[0]])))]);await settle();const original=records.get(1);
 store.update(a,()=>products.map(p=>item(p,'',Object.fromEntries(groups.map(group=>[group.name,group.values[0]])))));await settle();assert.equal(store.read(a).items.length,20);assert.equal(store.read(a).error,INQUIRY_STORAGE_ERROR);assert.equal(records.get(1),original,'Oversized UTF-8 must never replace the last durable file with an unreadable snapshot');
});

test('FE-041 S118 native document adapter stores separate files through real temporary filesystem ports and browser storage safely',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-inquiry-test-'));
 try{
  const result=await build({entryPoints:['apps/mobile/src/inquiry-basket-storage.ts'],bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'native-document-test-ports',setup(b){b.onResolve({filter:/^(react-native|expo-file-system)$/},args=>({path:args.path,namespace:'ports'}));b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:args.path==='react-native'?`export const Platform={get OS(){return fixture.platform;}};`:`export class Directory{constructor(...parts){this.uri=path.join(...parts.map(p=>p.uri||p));}create(){fs.mkdirSync(this.uri,{recursive:true});}}export class File{constructor(...parts){this.uri=path.join(...parts.map(p=>p.uri||p));}get exists(){return fs.existsSync(this.uri);}get size(){return fs.statSync(this.uri).size;}async text(){return fs.readFileSync(this.uri,'utf8');}write(value){fs.writeFileSync(this.uri,value);}async move(target){fs.renameSync(this.uri,target.uri);}}export const Paths={document:fixture.root};`}));}}]});
  const fixture={platform:'android',root},module={exports:{} as {createInquiryBasketStorage:(origin:string)=>InquiryBasketStorage}},browser=new Map<string,string>();
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:createRequire(import.meta.url),fixture,fs,path,URL,localStorage:{getItem:(key:string)=>browser.get(key)||null,setItem:(key:string,value:string)=>browser.set(key,value)}});
  const storage=module.exports.createInquiryBasketStorage('https://suqpage.com'),local=module.exports.createInquiryBasketStorage('http://127.0.0.1:3102');assert.equal(await storage.read(1),null);await storage.write(1,'{"one":1}');await storage.write(2,'{"two":2}');await local.write(1,'{"local":1}');assert.equal(await storage.read(1),'{"one":1}');assert.equal(await storage.read(2),'{"two":2}');assert.equal(await local.read(1),'{"local":1}');assert.deepEqual(fs.readdirSync(path.join(root,'suqpage-inquiries',encodeURIComponent('https://suqpage.com'))).sort(),['1.json','2.json']);
  const unusual=module.exports.createInquiryBasketStorage('https://example.test/../../escape?query=1');await unusual.write(1,'safe');assert.equal(await unusual.read(1),'safe');assert.ok(fs.existsSync(path.join(root,'suqpage-inquiries',encodeURIComponent('https://example.test'),'1.json')));assert.throws(()=>module.exports.createInquiryBasketStorage('file:///private/escape'));
  fixture.platform='web';await storage.write(1,'browser');await local.write(1,'local browser');assert.equal(await storage.read(1),'browser');assert.equal(await local.read(1),'local browser');assert.equal(browser.size,2);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('FE-041 S118 actual hook changes current business without exposing the previous list and migrates the old session basket once',async()=>{
 const a=shop(1),b=shop(2),records=new Map<number,string>(),state={values:[] as unknown[],effects:[] as Array<{deps:unknown[];cleanup?:()=>void}>,pending:[] as Array<()=>void>,cursor:0,effectCursor:0,basket:{shop:a,items:[item(a.products[0],'legacy')]} as {shop:Shop;items:ReturnType<typeof item>[]} |null};
  const bundled=await build({entryPoints:['apps/mobile/src/use-business-inquiry.ts'],bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'business-hook-ports',setup(builder){builder.onResolve({filter:/^(react|\.\/runtime|\.\/inquiry-basket-storage)$/},args=>({path:args.path,namespace:'ports'}));builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:args.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.values))fixture.values[i]=initial;return[fixture.values[i],value=>{fixture.values[i]=typeof value==='function'?value(fixture.values[i]):value;}];};export const useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))fixture.pending.push(()=>{old?.cleanup?.();fixture.effects[i]={deps,cleanup:create()};});};`:args.path==='./runtime'?`export const API='https://suqpage.com',useApp=()=>({basket:fixture.basket,setBasket:value=>{fixture.basket=value;}});`:`export const createInquiryBasketStorage=()=>({read:async id=>records.get(id)||null,write:async(id,value)=>{records.set(id,value);}});`}));}}]});
 type HookValue={items:ReturnType<typeof item>[];ready:boolean;setItems:(change:(items:ReturnType<typeof item>[])=>ReturnType<typeof item>[])=>void};
 const module={exports:{} as {useBusinessInquiry:(shop:Shop|null)=>HookValue}};
 vm.runInNewContext(bundled.outputFiles[0].text,{module,exports:module.exports,fixture:state,records});
 const render=(business:Shop|null)=>{state.cursor=state.effectCursor=0;const value=module.exports.useBusinessInquiry(business);for(const effect of state.pending.splice(0))effect();return value;};
 render(a);await settle();let value=render(a);assert.equal(value.items[0].quantity,'legacy');assert.equal(state.basket,null,'Migration clears the compatibility field after seeding only A');
 value=render(b);assert.equal(value.items.length,0,'A cannot appear during B restoration');await settle();value=render(b);value.setItems(()=>[item(b.products[0],'B quantity')]);await settle();
 value=render(a);assert.equal(value.items[0].product,a.products[0]);assert.equal(value.items[0].quantity,'legacy');assert.equal(JSON.parse(records.get(2)!).items[0].quantity,'B quantity');
 value=render(null);assert.equal(value.items.length,0,'Public nonbusiness contexts have no current list');
 for(const effect of state.effects)effect.cleanup?.();
});
