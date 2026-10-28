import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
import type {Offering,Shop} from '@africmade/contracts';
import {createInquiryBaskets,INQUIRY_STORAGE_ERROR,type BusinessInquiryItem} from '../apps/mobile/src/inquiry-baskets';

type Element={type:string;props:Record<string,unknown>&{children?:unknown}};
// Actual showroom source and real canonical per-business basket/store. React,
// native presentation, router and device storage are explicit controlled ports;
// this is not browser, HTTP, database, installed Android or external-send proof.
const bundle=build({entryPoints:['apps/mobile/src/ShowroomContent.tsx'],bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'showroom-card-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|expo-clipboard|\.\/(?:runtime|ui|chrome|Gallery|YouTubeVideo|use-business-inquiry))$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:
  a.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],value=>fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value];};export const useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((value,j)=>value!==old[j]))fixture.pending.push(()=>{fixture.effects[i]=deps;create();});};export default {};`
  :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
  :a.path==='react-native'?`export const View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',Platform={OS:'android'},StyleSheet={create:value=>value,absoluteFill:{}},useWindowDimensions=()=>fixture.dimensions;`
  :a.path==='expo-router'?`export const router={push:value=>fixture.routes.push(value)};`
  :a.path==='expo-clipboard'?`export const setStringAsync=async()=>{throw Error('Unexpected clipboard write');};`
  :a.path==='./runtime'?`export const API='https://suqpage.fixture',useApp=()=>({t:(key,values={})=>Object.entries(values).reduce((s,[name,value])=>s.replace('{'+name+'}',String(value)),key)});`
  :a.path==='./ui'?`export const Photo='Photo',LinkedText='LinkedText',Button='Button',Chip='Chip',Status='Status',Copy='Copy',Icon='Icon',colors={ink:'#222',muted:'#667',brand:'#c43a00',line:'#ddd',soft:'#fff1e9'},useOpenLink=()=>async()=>{throw Error('Unexpected external navigation');};`
  :a.path==='./chrome'?`export const Sheet='Sheet';`
  :a.path==='./use-business-inquiry'?`export const useBusinessInquiry=shop=>shop?({...fixture.store.read(shop),setItems:change=>fixture.store.update(shop,change),retry:()=>fixture.store.retry(shop.id)}):({items:[],ready:true,error:'',retry(){},setItems(){throw Error('Preview mutation');}});`
  :`export default '${a.path.slice(2)}';`
 }));
}}]});
const product=(id:number,patch:Partial<Offering>={}):Offering=>({id,name:'Product '+id,description:'A complete merchant description that remains available on the detail page.',kind:'standard_product',availability:'available',published:true,priceMinor:2500,media:[],options:[],quantityMode:'optional',...patch});
const business=(id:number,products:Offering[]):Shop=>({id,handle:'fixture-business-'+id,name:'Business '+id,about:'About this business',cover:'',videoUrl:'',contacts:{},products,version:1,status:'active',isDemo:false,accentColor:'#176b45'});
const nodes=(value:unknown):Element[]=>Array.isArray(value)?value.flatMap(nodes):!value||typeof value!=='object'?[]:[value as Element,...nodes((value as Element).props.children)];
const renderedText=(value:unknown):string=>Array.isArray(value)?value.map(renderedText).join(''):value&&typeof value==='object'?renderedText((value as Element).props.children):typeof value==='string'||typeof value==='number'?String(value):'';
const style=(node:Element)=>Object.assign({},...[node.props.style].flat(Infinity).filter(v=>v&&typeof v==='object')) as Record<string,unknown>;
const find=(tree:Element[],id:string)=>{const node=id==='showroom-product-options'?tree.find(n=>n.type==='Sheet'&&nodes(n).some(child=>child.props.testID===id)):tree.find(n=>n.props.testID===id);assert.ok(node,id);if(id==='showroom-product-options-add'){const button=nodes(node).find(n=>n.type==='Button');assert.ok(button,id+' button');return button;}return node;};
const press=(node:Element)=>(node.props.onPress as()=>void)();
const item=(p:Offering,options:Record<string,string>={}):BusinessInquiryItem=>({product:p,quantity:'',options});
const plain=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
async function setup(shop:Shop,loaded=true){
 const saved=new Map<number,string>(),reads:number[]=[],writes:number[]=[];
 let failRead=false;
 const storage={read:async(id:number)=>{reads.push(id);if(failRead)throw Error('Device storage unavailable');return saved.get(id)||null;},write:async(id:number,value:string)=>{writes.push(id);saved.set(id,value);}};
 const store=createInquiryBaskets(storage);if(loaded)await store.load(shop.id);
 const fixture={dimensions:{width:390,height:844,fontScale:1},store,states:[] as unknown[],cursor:0,routes:[] as unknown[],effectCursor:0,effects:[] as unknown[][],pending:[] as Array<()=>void>};
 const module={exports:{} as {ShowroomContent:(props:{shop:Shop;preview?:boolean;catalogReady?:boolean})=>Element}};
 vm.runInNewContext((await bundle).outputFiles[0].text,{module,exports:module.exports,fixture,URL,URLSearchParams});
 return{store,saved,reads,writes,storage,fixture,failRead:(value:boolean)=>{failRead=value;},render:(current=shop,preview=false,catalogReady=true)=>{fixture.cursor=fixture.effectCursor=0;const tree=nodes(module.exports.ShowroomContent({shop:current,preview,catalogReady}));for(const effect of fixture.pending.splice(0))effect();return tree;}};
}

test('FE-041 S129 native cards clamp merchant description and add separately without opening details',async()=>{
 const p=product(1),shop=business(7,[p]),f=await setup(shop);let tree=f.render();
 const card=find(tree,'showroom-product-1');assert.equal(card.type,'View','Card cannot nest Add inside a navigation button');
 const description=find(tree,'showroom-product-description-1');assert.equal(description.props.numberOfLines,2);assert.equal(description.props.children,p.description);
 const details=tree.find(n=>n.props.accessibilityLabel===p.name)!;assert.equal(details.type,'Pressable');assert.ok(Number(style(details).minHeight)>=48);
 const add=find(tree,'showroom-product-add-1');assert.ok(Number(style(add).minHeight)>=48);assert.equal(add.props.disabled,false);
 press(add);assert.deepEqual(f.fixture.routes,[]);assert.deepEqual(f.store.read(shop).items.map(i=>i.product.id),[1]);
 tree=f.render();const added=find(tree,'showroom-product-add-1');assert.equal(added.props.disabled,true);assert.ok(nodes(added).some(n=>n.type==='Text'&&n.props.children==='Added to inquiry list'));
 press(add);assert.equal(f.store.read(shop).items.length,1,'Retained activation deduplicates inside the current-store update');
 press(tree.find(n=>n.props.accessibilityLabel===p.name)!);assert.deepEqual(plain(f.fixture.routes),[{pathname:'/product',params:{handle:shop.handle,id:p.id}}]);
});

test('FE-041 S129 card additions retain per-business persistence and reject max20 even through a retained action',async()=>{
 const products=Array.from({length:21},(_,i)=>product(i+1)),a=business(7,products),b=business(8,[product(30)]),f=await setup(a);await f.store.load(b.id);
 f.store.update(b,()=>[item(b.products[0])]);let tree=f.render();const staleAdd=find(tree,'showroom-product-add-21');
 f.store.update(a,()=>products.slice(0,20).map(p=>item(p)));press(staleAdd);assert.equal(f.store.read(a).items.length,20);assert.deepEqual(f.store.read(b).items.map(i=>i.product.id),[30]);
 tree=f.render();assert.ok(tree.some(n=>n.props.children==='Use up to 20 items per inquiry.'));
 await new Promise<void>(resolve=>setImmediate(resolve));await new Promise<void>(resolve=>setImmediate(resolve));
 const restored=createInquiryBaskets(f.storage);await restored.load(a.id);await restored.load(b.id);assert.equal(restored.read(a).items.length,20);assert.deepEqual(restored.read(b).items.map(i=>i.product.id),[30]);
 assert.ok(f.writes.every(id=>id===a.id||id===b.id));
});

test('FE-041 S129 canonical option Sheet requires explicit variants, supports sole values and cancels safely',async()=>{
 const p=product(4,{options:[{name:'Material',values:['Wood']},{name:'Color',values:['Red','Blue']}]}),shop=business(7,[p]),f=await setup(shop);let tree=f.render();
 press(find(tree,'showroom-product-add-4'));tree=f.render();const sheet=find(tree,'showroom-product-options');assert.equal(sheet.props.visible,true);assert.deepEqual(f.fixture.routes,[]);assert.equal(f.store.read(shop).items.length,0);
 const choices=nodes(sheet).filter(n=>n.type==='Chip');assert.ok(choices.every(n=>n.props.minHeight===48));assert.equal(choices.find(n=>n.props.label==='Wood')!.props.selected,true);assert.equal(choices.find(n=>n.props.label==='Red')!.props.selected,false);assert.equal(choices.find(n=>n.props.label==='Blue')!.props.selected,false);
 assert.equal(find(tree,'showroom-product-options-add').props.disabled,true);
 press(nodes(sheet).find(n=>n.type==='Button'&&n.props.label==='Cancel')!);tree=f.render();assert.equal(find(tree,'showroom-product-options').props.visible,false);assert.equal(f.store.read(shop).items.length,0);
 press(find(tree,'showroom-product-add-4'));tree=f.render();press(nodes(find(tree,'showroom-product-options')).find(n=>n.type==='Chip'&&n.props.label==='Blue')!);tree=f.render();assert.equal(find(tree,'showroom-product-options-add').props.disabled,false);press(find(tree,'showroom-product-options-add'));
 assert.deepEqual(plain(f.store.read(shop).items.map(i=>({id:i.product.id,options:i.options}))),[{id:4,options:{Material:'Wood',Color:'Blue'}}]);assert.deepEqual(f.fixture.routes,[]);assert.equal(find(f.render(),'showroom-product-options').props.visible,false);
 const sole=product(5,{options:[{name:'Size',values:['One size']}]}),single=business(9,[sole]);await f.store.load(single.id);tree=f.render(single);press(find(tree,'showroom-product-add-5'));assert.deepEqual(plain(f.store.read(single).items[0].options),{Size:'One size'});
});

test('FE-041 S129 current stock/options, malformed options, preview and loading cannot create selections',async()=>{
 const available=product(1),unavailable=product(2,{availability:'unavailable'}),coming=product(3,{availability:'coming_soon'}),empty=product(4,{options:[{name:'Size',values:[]}]}),retired=product(5,{kind:'service'}),draft=product(6,{published:false});
 const shop=business(7,[available,unavailable,coming,empty,retired,draft]),f=await setup(shop,false);let tree=f.render();
 assert.equal(find(tree,'showroom-product-add-1').props.disabled,true);press(find(tree,'showroom-product-add-1'));assert.equal(f.store.read(shop).items.length,0);
 await f.store.load(shop.id);tree=f.render();for(const id of [2,3,4]){assert.equal(find(tree,'showroom-product-add-'+id).props.disabled,true);press(find(tree,'showroom-product-add-'+id));}assert.ok(!tree.some(n=>n.props.testID==='showroom-product-5'||n.props.testID==='showroom-product-6'));
 tree=f.render(shop,true);press(find(tree,'showroom-product-add-1'));assert.equal(f.store.read(shop).items.length,0);press(tree.find(n=>n.props.accessibilityLabel===available.name)!);assert.ok(f.render(shop,true).some(n=>n.type==='Gallery'));assert.deepEqual(f.fixture.routes,[]);
 const p=product(7,{options:[{name:'Color',values:['Red','Blue']}]}),current=business(8,[p]),fresh=await setup(current);tree=fresh.render();press(find(tree,'showroom-product-add-7'));tree=fresh.render();press(nodes(find(tree,'showroom-product-options')).find(n=>n.type==='Chip'&&n.props.label==='Blue')!);
 const changed={...current,products:[{...p,options:[{name:'Color',values:['Red']}]}]};tree=fresh.render(changed);assert.equal(find(tree,'showroom-product-options-add').props.disabled,true,'An old selected variant cannot survive current catalog validation');press(find(tree,'showroom-product-options-add'));assert.equal(fresh.store.read(changed).items.length,0);
 const outOfStock={...current,products:[{...p,availability:'unavailable'}]};tree=fresh.render(outOfStock);assert.equal(find(tree,'showroom-product-options-add').props.disabled,true);press(find(tree,'showroom-product-options-add'));assert.equal(fresh.store.read(outOfStock).items.length,0);
});

test('FE-041 S129 storage failure keeps card Add blocked and exposes the existing retry recovery',async()=>{
 const shop=business(7,[product(1)]),f=await setup(shop,false);f.failRead(true);await f.store.load(shop.id);let tree=f.render();
 const failure=tree.find(n=>n.type==='Status'&&n.props.error===INQUIRY_STORAGE_ERROR);assert.ok(failure);assert.equal(find(tree,'showroom-product-add-1').props.disabled,true);assert.equal(f.writes.length,0);
 f.failRead(false);await (failure.props.retry as()=>Promise<void>)();tree=f.render();assert.equal(find(tree,'showroom-product-add-1').props.disabled,false);press(find(tree,'showroom-product-add-1'));assert.equal(f.store.read(shop).items.length,1);
});

test('FE-041 S129 a list reaching capacity while options are open reports the limit inside that active Sheet',async()=>{
 const products=Array.from({length:20},(_,index)=>product(index+1)),variant=product(21,{options:[{name:'Color',values:['Red','Blue']}]}),shop=business(7,[...products,variant]),f=await setup(shop);
 let tree=f.render();press(find(tree,'showroom-product-add-21'));tree=f.render();press(nodes(find(tree,'showroom-product-options')).find(n=>n.type==='Chip'&&n.props.label==='Blue')!);tree=f.render();
 const retainedAdd=find(tree,'showroom-product-options-add');assert.equal(retainedAdd.props.disabled,false);
 f.store.update(shop,()=>products.map(p=>item(p)));const before=plain(f.store.read(shop).items);press(retainedAdd);tree=f.render();
 assert.deepEqual(plain(f.store.read(shop).items),before,'The action-boundary capacity guard cannot add a21st item');
 const activeSheet=find(tree,'showroom-product-options');assert.equal(activeSheet.props.visible,true);assert.ok(nodes(activeSheet).some(n=>n.type==='Text'&&n.props.children==='Use up to 20 items per inquiry.'&&n.props.accessibilityLiveRegion==='polite'),'The open options picker contains the visible announced limit');
 assert.ok(!tree.some(n=>n.props.testID==='showroom-inquiry-notice'),'No hidden grid-only status substitutes for picker feedback');
});


test('FE-041 S131 native canonical category chips wrap, count visible members and intersect search without disturbing Add/details',async()=>{
 const p=product(1,{name:'Red woven chair',categoryId:10,categoryName:'UNTRUSTED NAME'}),q=product(2,{name:'Blue woven chair',categoryId:10}),r=product(3,{name:'Red ceramic cup',categoryId:20}),orphan=product(4,{name:'Red basket',categoryId:99,categoryName:'Foreign label'}),hidden=product(5,{categoryId:30,published:false}),retired=product(6,{categoryId:40,kind:'service'});
 const shop={...business(7,[p,q,r,orphan,hidden,retired]),categories:[{id:10,name:'የእጅ ሥራ · Handwoven'},{id:20,name:'Clay collection'},{id:30,name:'Hidden only'},{id:40,name:'Retired only'},{id:50,name:'Empty'}]},f=await setup(shop);let tree=f.render();tree=f.render();
 const chips=tree.filter(n=>String(n.props.testID||'').startsWith('showroom-category-'));assert.equal(chips.length,3);assert.ok(chips.every(n=>Number(style(n).minHeight)>=48&&Number(style(n).minWidth)>=48));assert.equal(style(find(tree,'showroom-category-10')).maxWidth,'100%');assert.ok(nodes(find(tree,'showroom-categories')).some(n=>style(n).flexWrap==='wrap'));
 assert.ok(renderedText(find(tree,'showroom-category-10'))==='የእጅ ሥራ · Handwoven (2)');assert.ok(renderedText(find(tree,'showroom-category-all'))==='All (4)');
 assert.equal(find(tree,'showroom-product-category-1').props.children,'የእጅ ሥራ · Handwoven');assert.ok(!tree.some(n=>n.props.testID==='showroom-product-category-4'));
 press(find(tree,'showroom-category-10'));tree=f.render();assert.equal((find(tree,'showroom-category-10').props.accessibilityState as{selected:boolean}).selected,true);assert.equal(find(tree,'showroom-category-10').props['aria-pressed'],true);assert.ok(tree.some(n=>n.props.testID==='showroom-product-1'));assert.ok(tree.some(n=>n.props.testID==='showroom-product-2'));assert.ok(!tree.some(n=>n.props.testID==='showroom-product-3'));
 const search=tree.find(n=>n.type==='TextInput'&&n.props.accessibilityLabel==='Search this business')!;(search.props.onChangeText as(value:string)=>void)('Red');tree=f.render();assert.ok(tree.some(n=>n.props.testID==='showroom-product-1'));assert.ok(!tree.some(n=>n.props.testID==='showroom-product-2'));assert.ok(renderedText(find(tree,'showroom-category-10'))==='የእጅ ሥራ · Handwoven (2)','Counts are catalog members, not current search results');
 press(find(tree,'showroom-product-add-1'));tree=f.render();assert.equal(f.store.read(shop).items.length,1);assert.equal(find(tree,'showroom-category-10').props['aria-pressed'],true);press(tree.find(n=>n.props.accessibilityLabel===p.name)!);assert.equal(f.fixture.routes.length,1);tree=f.render();assert.equal(find(tree,'showroom-category-10').props['aria-pressed'],true);
 press(find(tree,'showroom-category-all'));tree=f.render();assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'Red');assert.ok(tree.some(n=>n.props.testID==='showroom-product-3'));press(find(tree,'showroom-category-20'));tree=f.render();press(tree.find(n=>n.props.accessibilityLabel==='Clear')!);tree=f.render();assert.equal(find(tree,'showroom-category-20').props['aria-pressed'],true);assert.ok(tree.some(n=>n.props.testID==='showroom-product-3'));
});

test('FE-041 S131 removed categories fall back to All permanently and absent canonical choices remain a flat grid',async()=>{
 const p=product(1,{categoryId:10,categoryName:'Do not infer a category'}),q=product(2),shop={...business(7,[p,q]),categories:[{id:10,name:'Merchant collection'}]},f=await setup(shop);let tree=f.render();press(find(tree,'showroom-category-10'));tree=f.render();assert.ok(!tree.some(n=>n.props.testID==='showroom-product-2'));
 tree=f.render({...shop,categories:[]});tree=f.render({...shop,categories:[]});assert.ok(!tree.some(n=>n.props.testID==='showroom-categories'));assert.ok(tree.some(n=>n.props.testID==='showroom-product-2'));assert.ok(!tree.some(n=>n.props.testID==='showroom-product-category-1'));
 tree=f.render(shop);assert.equal(find(tree,'showroom-category-all').props['aria-pressed'],true,'A returning old category must not resurrect stale selection');
 const plain=await setup(business(8,[p,q]));tree=plain.render();assert.ok(!tree.some(n=>n.props.testID==='showroom-categories'));assert.ok(tree.some(n=>n.props.testID==='showroom-product-1'));assert.ok(!tree.some(n=>n.props.testID==='showroom-product-category-1'),'Hydrated product name alone establishes no affiliation');
});


test('FE-041 S131 ordinary product Back/remount restores scoped public category/query and never preview filters',async()=>{
 const p=product(1,{name:'Red chair',categoryId:10}),q=product(2,{name:'Blue chair',categoryId:20}),shop={...business(7,[p,q]),categories:[{id:10,name:'Woven collection'},{id:20,name:'Wood collection'}]},f=await setup(shop);
 const remount=()=>{f.fixture.states=[];f.fixture.effects=[];f.fixture.pending=[];f.fixture.cursor=f.fixture.effectCursor=0;};
 let tree=f.render();press(find(tree,'showroom-category-10'));tree=f.render();(tree.find(n=>n.type==='TextInput')!.props.onChangeText as(value:string)=>void)('Red');tree=f.render();press(tree.find(n=>n.props.accessibilityLabel===p.name)!);assert.equal(f.fixture.routes.length,1);
 remount();tree=f.render();tree=f.render();assert.equal(find(tree,'showroom-category-10').props['aria-pressed'],true,'Public product Back can remount the showroom');assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'Red');assert.equal(tree.find(n=>n.type==='TextInput')!.props.maxLength,80);assert.ok(!tree.some(n=>n.props.testID==='showroom-product-2'));
 remount();tree=f.render(shop,true);tree=f.render(shop,true);assert.equal(find(tree,'showroom-category-all').props['aria-pressed'],true);assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'');press(find(tree,'showroom-category-20'));tree=f.render(shop,true);(tree.find(n=>n.type==='TextInput')!.props.onChangeText as(value:string)=>void)('Private preview draft');tree=f.render(shop,true);
 remount();tree=f.render(shop);tree=f.render(shop);assert.equal(find(tree,'showroom-category-10').props['aria-pressed'],true);assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'Red','Preview never reads or overwrites public filter return state');
 tree=f.render(shop,true);tree=f.render(shop,true);assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'','Changing an existing component to preview also isolates public filters');(tree.find(n=>n.type==='TextInput')!.props.onChangeText as(value:string)=>void)('Preview only');tree=f.render(shop,true);tree=f.render(shop);tree=f.render(shop);assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'Red');
 const b={...business(8,[product(3,{name:'B product',categoryId:30})]),categories:[{id:30,name:'B collection'}]};await f.store.load(b.id);tree=f.render(b);tree=f.render(b);assert.equal(find(tree,'showroom-category-all').props['aria-pressed'],true);assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'');press(find(tree,'showroom-category-30'));tree=f.render(b);(tree.find(n=>n.type==='TextInput')!.props.onChangeText as(value:string)=>void)('B');tree=f.render(b);tree=f.render(shop);tree=f.render(shop);assert.equal(find(tree,'showroom-category-10').props['aria-pressed'],true);assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'Red','An in-place business switch cannot overwrite either scope with another business state');
 remount();tree=f.render({...shop,categories:[{id:20,name:'Wood collection'}]});tree=f.render({...shop,categories:[{id:20,name:'Wood collection'}]});assert.equal(find(tree,'showroom-category-all').props['aria-pressed'],true);remount();tree=f.render(shop);tree=f.render(shop);assert.equal(find(tree,'showroom-category-all').props['aria-pressed'],true,'Removed canonical IDs do not return after another remount');assert.equal(tree.find(n=>n.type==='TextInput')!.props.value,'Red');
});


test('FE-041 S151 measured public/private grids delegate two-column sizing to Yoga and retain narrow fallbacks',async()=>{
 const shop=business(7,[product(1),product(2),product(3)]);
 for(const sample of[
  {viewport:320,width:252,preview:true,fontScale:1,columns:1},
  {viewport:320,width:284,preview:false,fontScale:1,columns:1},
  {viewport:390,width:354,preview:false,fontScale:1,columns:2},
  {viewport:844,width:724,preview:true,fontScale:1,columns:2},
  {viewport:390,width:311,preview:false,fontScale:1,columns:1},
  {viewport:390,width:312,preview:false,fontScale:1,columns:2},
  {viewport:412,width:375.619049,preview:false,fontScale:1,columns:2},
  {viewport:390,width:354,preview:false,fontScale:1.3,columns:2},
  {viewport:390,width:354,preview:true,fontScale:2,columns:1},
 ]){
  const f=await setup(shop);f.fixture.dimensions={width:sample.viewport,height:844,fontScale:sample.fontScale};let tree=f.render(shop,sample.preview);
  assert.equal(style(find(tree,'showroom-product-1')).width,'100%','Unmeasured cards cannot occupy half a wrapped row');
  const grid=find(tree,'showroom-product-grid'),layout=grid.props.onLayout as(event:{nativeEvent:{layout:{width:number}}})=>void;
  layout({nativeEvent:{layout:{width:sample.width}}});tree=f.render(shop,sample.preview);
  const cards=[find(tree,'showroom-product-1'),find(tree,'showroom-product-2'),find(tree,'showroom-product-3')],gap=Number(style(grid).gap);assert.equal(gap,12);
  for(const card of cards){const current=style(card);if(sample.columns===1){assert.equal(current.width,'100%',JSON.stringify(sample));assert.equal(current.flexBasis,undefined);}else{assert.equal(current.width,undefined,'Never feed the rounded measured width back as an exact card width');assert.equal(current.flexBasis,'47%');assert.equal(current.flexGrow,1);assert.equal(current.minWidth,0);}assert.equal(find(tree,'showroom-product-description-1').props.numberOfLines,2);assert.ok(Number(style(find(tree,'showroom-product-add-1')).minHeight)>=48);}
  const measured=style(cards[0]);
  for(const invalid of[0,-1,NaN,Infinity]){layout({nativeEvent:{layout:{width:invalid}}});tree=f.render(shop,sample.preview);assert.deepEqual(style(find(tree,'showroom-product-1')),measured,'Hidden/invalid measurements do not replace known geometry');}
  layout({nativeEvent:{layout:{width:sample.width}}});tree=f.render(shop,sample.preview);assert.deepEqual(style(find(tree,'showroom-product-1')),measured,'Unchanged layout is stable');
  if(sample.fontScale<=1.3){layout({nativeEvent:{layout:{width:284}}});tree=f.render(shop,sample.preview);assert.equal(style(find(tree,'showroom-product-1')).width,'100%','A retained wide grid responds to a narrower actual container');}
  assert.equal(f.store.read(shop).items.length,0);assert.deepEqual(f.fixture.routes,[]);
 }
});


test('FE-074 retained showroom remains readable while canonical Add waits for refreshed catalog authority',async()=>{
 const shop=business(7,[product(1)]),f=await setup(shop);let tree=f.render(shop,false,false);
 assert.ok(tree.some(node=>node.props.testID==='showroom-product-1'));assert.equal(find(tree,'showroom-product-add-1').props.disabled,true);press(find(tree,'showroom-product-add-1'));assert.equal(f.store.read(shop).items.length,0);
 press(tree.find(node=>node.props.accessibilityLabel===shop.products[0].name)!);assert.equal(f.fixture.routes.length,1,'Canonical details navigation can requalify its own resource');
 tree=f.render(shop,false,true);assert.equal(find(tree,'showroom-product-add-1').props.disabled,false);press(find(tree,'showroom-product-add-1'));assert.equal(f.store.read(shop).items.length,1);
});
