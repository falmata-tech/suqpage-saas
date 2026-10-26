import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
import type {Offering,Shop} from '@suqpage/contracts';
import {visibleCatalogProduct,restoreCatalogSelections} from '../apps/mobile/src/catalog-products';

type Element={type:string|((props:Record<string,unknown>)=>Element|null);props:Record<string,unknown>&{children?:unknown}};
type Details={name:string;description:string;priceMinor:number|null;offeringKind?:string;availability:string;isPublished:boolean;expectedContentVersion:number;idempotencyKey:string;media:Array<{kind:string;ref:string}>};
const originalProduct={id:21,name:'QA wooden door',description:'Solid wood, made to your measurements.',priceMinor:120050,kind:'made_to_order',availability:'limited',published:false,media:[{kind:'image',ref:'private/door.webp'},{kind:'video',ref:'youtube:fixture'}]};
const originalSearch={query:'door',categories:['furniture'],countries:['ET'],cities:['ET:Addis Ababa'],madeToOrder:false,page:4};

// Actual components and the shared supply/search domain helpers are bundled.
// Controlled native, navigation and I/O ports prove state/save intent, not API,
// PostgreSQL, Android rendering, image upload or remote persistence behavior.
const bundled=build({entryPoints:['apps/mobile/src/owner-forms.tsx','apps/mobile/src/ProductSupply.tsx','apps/mobile/src/MarketSearchControls.tsx','apps/mobile/app/inquiry.tsx','apps/mobile/src/ShowroomContent.tsx','apps/mobile/app/product.tsx'],outdir:'/tmp/suqpage-product-only-native-ui',bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'native-product-ui-ports',setup(builder){
  builder.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|expo-file-system|expo-crypto|expo-image-picker|expo-clipboard|(?:\.\/|\.\.\/src\/)(?:runtime|ui|chrome|image-upload|CitySelector|CountrySelector|OwnerLocationPicker|LocationVisibilityChoices|owner-handle|StorefrontAccentPicker|ShowroomContent|blocked-businesses|CatalogSafety|Gallery|YouTubeVideo|use-business-inquiry|owner-edit-navigation|OwnerEditConfirmation))$/},args=>({path:args.path.startsWith('../src/')?'./'+args.path.split('/').at(-1):args.path,namespace:'ports'}));
  builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',resolveDir:process.cwd(),contents:
    args.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],value=>fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value];};export const useMemo=fn=>fn(),useEffect=()=>{},useRef=initial=>({current:initial});export default {};`
    :args.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
    :args.path==='react-native'?`export const View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',ScrollView='ScrollView',Platform={get OS(){return fixture.platform;}},Alert={alert(){throw Error('Unexpected alert');}},StyleSheet={create:styles=>styles,absoluteFill:{}},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`
    :args.path==='expo-router'?`export const useLocalSearchParams=()=>fixture.params,router={push(){throw Error('Unexpected navigation');}};`
    :args.path==='expo-crypto'?`export const randomUUID=()=> 'fixture-idempotency-'+fixture.keys++;`
    :args.path==='expo-file-system'?`export class File {constructor(){throw Error('Unexpected file access');}}`
    :args.path==='expo-image-picker'?`export const launchImageLibraryAsync=async()=>{throw Error('Unexpected image picker');};`
    :args.path==='expo-clipboard'?`export const setStringAsync=async message=>{fixture.copied.push(message);return true;};`
    :args.path==='./runtime'?`export const useApp=()=>({t:value=>value,locale:'en',ownerRequest:async(path,body,form)=>{if(!form)throw Error('Unexpected non-product request');fixture.writes.push({path,details:JSON.parse(form.get('details')),fields:[...form.keys()]});if(fixture.failSave)throw Error('This page changed. Reload before saving.');},basket:fixture.basket,setBasket:value=>{fixture.basket=typeof value==='function'?value(fixture.basket):value;}}),useLoad=fn=>{fixture.loads.push(fn);return {data:fixture.shop,loading:fixture.loading,error:fixture.loadError,reload(){}};},request=async path=>{fixture.reads.push(path);return fixture.shop;},auth={},API='http://127.0.0.1:3102';`
    :args.path==='./use-business-inquiry'?`import {restoreBusinessInquiry} from ${JSON.stringify(process.cwd()+'/apps/mobile/src/inquiry-baskets.ts')};const restored=shop=>shop&&fixture.basket?.shop.id===shop.id?restoreBusinessInquiry(shop,fixture.basket.items.map(item=>({productId:item.product.id,quantity:item.quantity,options:item.options}))):[];export const useBusinessInquiry=shop=>({items:restored(shop),ready:true,error:'',retry(){},setItems:change=>{fixture.basket={shop,items:change(restored(shop))};}});`
    :args.path==='./ui'?`export const Screen='Screen',LinkedText='LinkedText',Copy='Copy',Card='Card',Field='Field',Button='Button',Chip='Chip',Photo='Photo',Status='Status',Icon='Icon',s={wrap:{flexDirection:'row'}},useOpenLink=()=>()=>{},openLink=async()=>{throw Error('Unexpected external navigation');},colors={ink:'#222',muted:'#667',line:'#ddd',brand:'#c43a00',soft:'#fff1e9'};`
    :args.path==='./chrome'?`export const Sheet='Sheet',CategoryArt='CategoryArt';`
    :args.path==='./image-upload'?`export const appendPickedImage=async()=>{throw Error('Unexpected upload');};`
    :args.path==='./blocked-businesses'?`export const useBlockedBusinesses=()=>({ready:true,list:[]});`
    :args.path==='./CatalogSafety'?`export const CatalogSafety='CatalogSafety';`
    :args.path==='./owner-handle'?`export const HandleInput='HandleInput',HandleEditor='HandleEditor';`
    // Navigation lifecycle is exercised by test-mobile-owner-edit-navigation.ts.
    :args.path==='./owner-edit-navigation'?`export const useOwnerEditGuard=state=>({confirming:false,changed(){},checkpoint:()=>0,requestLeave:leave=>{if(!state.busy&&!state.isBusy?.())leave();},keepEditing(){},discard(){},complete:leave=>leave?.()});`
    :args.path==='./ShowroomContent'?`export const ShowroomContent='ShowroomContent';`
    :`export default '${args.path.slice(2)}';`
  }));
}}]});
function nodes(value:unknown):Element[]{if(!value||typeof value!=='object')return[];const node=value as Element;return[node,...[node.props.children].flat(Infinity).flatMap(nodes)];}
function name(node:Element){return typeof node.type==='function'?node.type.name:node.type;}
function button(tree:Element[],label:string){const result=tree.find(node=>name(node)==='Button'&&node.props.label===label);assert.ok(result,label);return result;}
function chip(tree:Element[],label:string){const result=tree.find(node=>name(node)==='Chip'&&node.props.label===label);assert.ok(result,label);return result;}
function field(tree:Element[],label:string){const result=tree.find(node=>name(node)==='Field'&&node.props.label===label);assert.ok(result,label);return result;}
function press(node:Element){(node.props.onPress as()=>void)();}
function text(value:unknown):string {if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Element).props.children);return typeof value==='string'?value:'';}
async function fixture(entry:'owner-forms'|'ProductSupply'|'MarketSearchControls'|'inquiry'|'ShowroomContent'|'product'){
  const state={loading:false,loadError:'',platform:'android' as 'android'|'web',params:{} as Record<string,string>,shop:null as Shop|null,basket:null as {shop:Shop;items:Array<{product:Offering;quantity:string;options:Record<string,string>}>}|null,loads:[] as Array<()=>Promise<unknown>>,reads:[] as string[],copied:[] as string[],states:[] as unknown[],cursor:0,keys:0,writes:[] as Array<{path:string;details:Details;fields:string[]}>,saved:0,failSave:false};
  const output=(await bundled).outputFiles.find(file=>file.path.endsWith('/'+entry+'.js'))!;assert.ok(output);
  const module={exports:{} as Record<string,(props:Record<string,unknown>)=>Element|null>};
  vm.runInNewContext(output.text,{module,exports:module.exports,fixture:state,FormData,Error,URLSearchParams,URL});
  return{state,render:(exportName:string,props:Record<string,unknown>)=>{state.cursor=0;return nodes(module.exports[exportName](props));}};
}
function productProps(kind:string|undefined){const product={...originalProduct,...(kind?{kind}:{})};return{home:{shop:{version:8,products:kind?[product]:[]}},id:kind?'21':undefined,onSaved:()=>{},onCancel:()=>{}};}
async function flush(){await new Promise<void>(resolve=>setImmediate(resolve));}

test('FE-067 native product choices retain supply, availability, media and guarded save metadata',async()=>{
  for(const kind of ['standard_product','made_to_order']){
    const {state,render}=await fixture('owner-forms'),props=productProps(kind);props.onSaved=()=>state.saved++;
    let tree=render('ProductEditor',props);
    assert.equal(chip(tree,kind==='made_to_order'?'Made to order':'Ready to ship').props.selected,true);
    assert.ok(!tree.some(node=>name(node)==='Chip'&&['Product','Service','Manufacturing','Production supply'].includes(String(node.props.label))));
    for(const label of ['Ready to ship','Made to order'])assert.equal(chip(tree,label).props.minHeight,48);
    (field(tree,'Description').props.onChangeText as(value:string)=>void)('Updated details without changing supply');
    tree=render('ProductEditor',props);press(button(tree,'Save changes'));await flush();
    assert.equal(state.writes.length,1);assert.equal(state.writes[0].path,'owner/products/21');
    assert.deepEqual(JSON.parse(JSON.stringify(state.writes[0].details)),{name:originalProduct.name,description:'Updated details without changing supply',priceMinor:originalProduct.priceMinor,offeringKind:kind,availability:'limited',orderScope:'unspecified',quantityUnit:'',highlights:[''],minimumOrderSummary:'',leadTimeSummary:'',capacitySummary:'',isPublished:false,expectedContentVersion:8,idempotencyKey:'fixture-idempotency-0',media:originalProduct.media});
    assert.deepEqual(Array.from(state.writes[0].fields),['details']);assert.equal(state.saved,1);
    const reloaded=await fixture('owner-forms');assert.equal(chip(reloaded.render('ProductEditor',productProps(state.writes[0].details.offeringKind)),kind==='made_to_order'?'Made to order':'Ready to ship').props.selected,true,'Fresh component honors returned saved kind');
  }
  const {state,render}=await fixture('owner-forms'),props=productProps(undefined);let tree=render('ProductEditor',props);
  assert.equal(chip(tree,'Ready to ship').props.selected,true,'New product starts in the standard product mode');
  (field(tree,'Name').props.onChangeText as(value:string)=>void)('New custom table');press(chip(tree,'Made to order'));
  tree=render('ProductEditor',props);press(button(tree,'Save changes'));await flush();
  assert.equal(state.writes[0].path,'owner/products');assert.equal(state.writes[0].details.offeringKind,'made_to_order');
});

test('FE-067 retained services require explicit conversion without losing input or media on validation/failure',async()=>{
  const {state,render}=await fixture('owner-forms'),props=productProps('service');let tree=render('ProductEditor',props);
  assert.equal(chip(tree,'Ready to ship').props.selected,false);assert.equal(chip(tree,'Made to order').props.selected,false);
  (field(tree,'Name').props.onChangeText as(value:string)=>void)('Converted wooden door');
  tree=render('ProductEditor',props);press(button(tree,'Save changes'));await flush();tree=render('ProductEditor',props);
  assert.equal(state.writes.length,0,'No product write is attempted before an explicit active choice');
  const status=tree.find(node=>name(node)==='ActionStatus')!.props.state as {error:string;busy:boolean};
  assert.equal(status.error,'Choose Ready to ship or Made to order before saving.');assert.equal(status.busy,false);
  assert.equal(field(tree,'Name').props.value,'Converted wooden door');assert.equal(tree.find(node=>name(node)==='Photo')!.props.refPath,originalProduct.media[0].ref);
  press(chip(tree,'Made to order'));state.failSave=true;tree=render('ProductEditor',props);press(button(tree,'Save changes'));await flush();tree=render('ProductEditor',props);
  assert.equal((tree.find(node=>name(node)==='ActionStatus')!.props.state as {error:string}).error,'This page changed. Reload before saving.');
  assert.equal(chip(tree,'Made to order').props.selected,true);assert.equal(field(tree,'Name').props.value,'Converted wooden door');
  state.failSave=false;press(button(tree,'Save changes'));await flush();
  assert.equal(state.writes.length,2);const converted=state.writes.at(-1)!;
  assert.equal(converted.path,'owner/products/21');assert.equal(converted.details.offeringKind,'made_to_order');
  assert.equal(converted.details.idempotencyKey,state.writes[0].details.idempotencyKey,'Retry retains the same logical save key');
  assert.deepEqual(JSON.parse(JSON.stringify(converted.details.media)),originalProduct.media);assert.equal(converted.details.availability,'limited');
});

test('FE-067 retained production products stay neutral until an explicit owner supply choice',async()=>{
  for(const kind of ['manufacturing_capability','production_supply']){
    const {state,render}=await fixture('owner-forms'),props=productProps(kind);let tree=render('ProductEditor',props);
    assert.equal(chip(tree,'Ready to ship').props.selected,false);assert.equal(chip(tree,'Made to order').props.selected,false);
    assert.ok(tree.some(node=>text(node)==='The current supply type is kept unless you choose an option.'));
    press(button(tree,'Save changes'));await flush();assert.ok(!('offeringKind'in state.writes[0].details),'An ordinary edit preserves the retained kind through omission');
    assert.deepEqual(JSON.parse(JSON.stringify(state.writes[0].details.media)),originalProduct.media);
    press(chip(tree,'Ready to ship'));tree=render('ProductEditor',props);press(button(tree,'Save changes'));await flush();
    assert.equal(state.writes.at(-1)!.details.offeringKind,'standard_product');
  }
});

test('FE-067 native Made to order toggle combines criteria, exposes state and clears without map controls',async()=>{
  const {state,render}=await fixture('MarketSearchControls');state.platform='web';let value={...originalSearch},changes=0;
  const props={scope:'products',value,onChange:(next:typeof value)=>{value=JSON.parse(JSON.stringify(next));props.value=value;changes++;},metadata:{categories:[],countries:[],places:[]}};
  let tree=render('default',props);
  const overview=()=>tree.find(node=>node.type==='Sheet'&&node.props.visible===true&&node.props.title==='Filters');
  const toggle=()=>overview()&&nodes(overview()).find(node=>node.type==='Pressable'&&node.props.accessibilityRole==='checkbox'&&node.props.accessibilityLabel==='Made to order');
  const openFilters=(scope:string)=>{const trigger=tree.find(node=>node.type==='Pressable'&&node.props.testID===`${scope}-filter-trigger`)!;assert.ok(trigger);assert.equal(trigger.props.accessibilityRole,'button');press(trigger);tree=render('default',props);assert.ok(overview(),'The real Filters trigger opens its visible overview before choices are used');};
  assert.equal(overview(),undefined);assert.equal(toggle(),undefined,'Phone product filters are opened through the labelled overview');
  assert.ok(!tree.some(node=>node.props.accessibilityLabel==='Type'||text(node)==='Services'));
  assert.equal(tree.find(node=>node.type==='TextInput')!.props.accessibilityLabel,'Search products');
  openFilters('products');assert.ok(toggle());assert.ok(nodes(toggle()).some(node=>node.type==='Icon'&&node.props.name==='package'&&node.props.size===18),'The overview gives the unchecked choice its visible package icon');assert.equal(toggle()!.props['aria-checked'],false);assert.equal((toggle()!.props.accessibilityState as {checked:boolean}).checked,false);
  let prevented=0;const keyboard=toggle()!.props.onKeyDown as(event:{key:string;repeat?:boolean;preventDefault:()=>void})=>void;keyboard({key:' ',preventDefault:()=>prevented++});assert.equal(prevented,1);tree=render('default',props);assert.deepEqual(value,{...originalSearch,madeToOrder:true,page:1});assert.equal(toggle()!.props['aria-checked'],true);assert.ok(nodes(toggle()).some(node=>node.type==='Icon'&&node.props.name==='check'&&node.props.size===18),'Checked overview filter has a visible non-color indicator');
  const currentKeyboard=toggle()!.props.onKeyDown as typeof keyboard;currentKeyboard({key:' ',repeat:true,preventDefault:()=>prevented++});assert.equal(value.madeToOrder,true,'Holding Space must not repeatedly toggle');currentKeyboard({key:'Enter',preventDefault:()=>prevented++});assert.equal(value.madeToOrder,true,'RN Web owns Enter to avoid double activation');press(toggle()!);tree=render('default',props);assert.equal(value.madeToOrder,false);press(toggle()!);tree=render('default',props);
  press(button(nodes(overview()),'Clear all'));tree=render('default',props);
  assert.deepEqual(value,{query:'',categories:[],countries:[],cities:[],madeToOrder:false,page:1});assert.equal(toggle()!.props['aria-checked'],false);assert.equal(button(nodes(overview()),'Clear all').props.disabled,true);
  press(button(nodes(overview()),'Done'));tree=render('default',props);assert.equal(overview(),undefined);assert.equal(toggle(),undefined);
  const priorChanges=changes;props.scope='businesses';tree=render('default',props);openFilters('businesses');assert.ok(!toggle());assert.equal(changes,priorChanges);
  assert.equal(tree.find(node=>node.type==='TextInput')!.props.accessibilityLabel,'Search businesses');
});

test('FE-067 actual native supply label does not promise unavailable or retained products are ready',async()=>{
  const {render}=await fixture('ProductSupply');
  for(const [kind,availability,label]of [['standard_product','available','Ready to ship'],['made_to_order','available','Made to order'],['standard_product','limited','Limited availability'],['made_to_order','limited','Limited capacity'],['standard_product','unavailable','Unavailable'],['made_to_order','unavailable','Not accepting orders'],['standard_product','coming_soon','Coming soon'],['made_to_order','coming_soon','Coming soon'],['manufacturing_capability','available','Available'],['production_supply','available','Available']]){
    const tree=render('default',{kind,availability});assert.equal(tree.length,1);assert.equal(text(tree[0]),label);assert.equal(tree[0].props.accessibilityLabel,`Availability: ${label}`);
  }
  for(const props of [{},{kind:'standard_product'},{availability:'available'},{kind:'service',availability:'available'}])assert.deepEqual(render('default',props),[],'Absent DTO context or retired service must not fabricate a ready label');
});

function catalogProduct(id:number,kind:string,patch:Partial<Offering>={}):Offering {
  return {id,name:'Product '+id,description:'Fixture catalog details',kind,availability:'available',priceMinor:null,media:[],published:true,quantityMode:'optional',options:[],...patch};
}
function catalog(products:Offering[]):Shop {
  return {id:7,handle:'demo-fixture-shop',name:'Fixture shop',about:'An example catalog',cover:'',videoUrl:'',contacts:{},products,version:8,status:'active',isDemo:true};
}
test('FE-067 native public projections and preview retain goods while excluding retired services and drafts',async()=>{
  const shop=catalog([catalogProduct(1,'standard_product'),catalogProduct(2,'service',{name:'Retired service'}),catalogProduct(3,'manufacturing_capability'),catalogProduct(4,'made_to_order',{published:false,name:'Private draft'})]);
  assert.deepEqual(shop.products.filter(visibleCatalogProduct).map(product=>product.id),[1,3]);
  const showroom=await fixture('ShowroomContent');let tree=showroom.render('ShowroomContent',{shop,preview:true}),visible=tree.map(node=>text(node.props.children)).join('\n');
  assert.ok(visible.includes('Product 1')&&visible.includes('Product 3'));assert.ok(!visible.includes('Retired service')&&!visible.includes('Private draft'));
  press(tree.find(node=>node.props.accessibilityLabel==='Product 1')!);tree=showroom.render('ShowroomContent',{shop,preview:true});assert.ok(tree.some(node=>name(node)==='Gallery'));
  tree=showroom.render('ShowroomContent',{shop:{...shop,products:shop.products.map(product=>product.id===1?{...product,kind:'service'}:product)},preview:true});assert.ok(!tree.some(node=>name(node)==='Gallery'),'Selected preview detail must use the current eligible product, not its old selection snapshot');
  const editor=await fixture('owner-forms');tree=editor.render('PageEditor',{home:{shop,draft:null},initialPreview:true,reload(){}});
  const preview=tree.find(node=>name(node)==='ShowroomContent')!;assert.deepEqual(Array.from((preview.props.shop as Shop).products,product=>product.id),[1,3],'Private page preview passes only public-eligible products into its renderer');
  const detail=await fixture('product');detail.state.shop=shop;detail.state.params={handle:shop.handle,id:'2'};tree=detail.render('default',{});
  assert.ok(!tree.some(node=>name(node)==='CatalogSafety'||name(node)==='Gallery'||node.props.label==='Add to inquiry list'),'Older server snapshots cannot expose a retained service as a product');
});

test('FE-067 native inquiry rehydrates stale selections from current public goods before copy and quantity editing',async()=>{
  const ready=catalogProduct(1,'standard_product',{name:'Current door'}),retired=catalogProduct(2,'service',{name:'Retired repair'}),custom=catalogProduct(3,'made_to_order',{name:'Current custom table',availability:'limited',options:[{name:'Color',values:['Blue','Red']}]}),unavailable=catalogProduct(4,'standard_product',{availability:'unavailable'}),draft=catalogProduct(5,'standard_product',{published:false});
  const shop=catalog([ready,retired,custom,unavailable,draft]);
  const selections:Array<{product:Offering;quantity:string;options:Record<string,string>}>=[{product:retired,quantity:'',options:{}},{product:{...custom,name:'Outdated table name'},quantity:'2',options:{Color:'Blue'}},{product:unavailable,quantity:'',options:{}},{product:draft,quantity:'',options:{}},{product:custom,quantity:'',options:{Color:'Purple'}}];
  const restored=restoreCatalogSelections(shop,selections);assert.equal(restored.length,1);assert.equal(restored[0].product,custom);assert.equal(restored[0].quantity,'2');
  const inquiry=await fixture('inquiry');inquiry.state.shop=shop;inquiry.state.params={handle:shop.handle};inquiry.state.basket={shop:{...shop,products:selections.map(item=>item.product)},items:selections};
  let tree=inquiry.render('default',{});await inquiry.state.loads.at(-1)!();assert.deepEqual(inquiry.state.reads,['shops/demo-fixture-shop'],'An explicitly scoped list fetches the latest public shop rather than trusting its stored references');
  let visible=tree.map(node=>text(node.props.children)).join('\n');assert.ok(visible.includes('Current custom table'));assert.ok(!visible.includes('Retired repair')&&!visible.includes('Outdated table name'));
  (field(tree,'Add quantity (optional)').props.onChangeText as(value:string)=>void)('7');
  assert.equal(inquiry.state.basket.items.length,1);assert.equal(inquiry.state.basket.items[0].product.id,custom.id);assert.equal(inquiry.state.basket.items[0].quantity,'7','Filtering retired rows cannot shift quantity edits onto another product; saved updates retain only canonical eligible references');
  tree=inquiry.render('default',{});press(button(tree,'Copy message'));await flush();assert.equal(inquiry.state.copied.length,1);assert.ok(inquiry.state.copied[0].includes('Current custom table'));assert.ok(!inquiry.state.copied[0].includes('Retired repair')&&!inquiry.state.copied[0].includes('Outdated table name'));
  press(button(tree,'Remove'));tree=inquiry.render('default',{});assert.equal(inquiry.state.basket.items.length,0);assert.equal(button(tree,'Copy message').props.disabled,false,'A general business inquiry remains available without selected products');
  press(button(tree,'Copy message'));await flush();assert.ok(!inquiry.state.copied.at(-1)?.includes('Current custom table')&&!inquiry.state.copied.at(-1)?.includes('Retired repair'),'Empty selections cannot copy an old product');
  inquiry.state.loadError='Unable to connect. Please try again.';tree=inquiry.render('default',{});assert.equal(button(tree,'Copy message').props.disabled,true);assert.ok(!tree.some(node=>text(node)==='Your inquiry list is empty.'),'A failed public refresh is not an empty saved selection');
  inquiry.state.loadError='';inquiry.state.loading=true;tree=inquiry.render('default',{});assert.equal(button(tree,'Copy message').props.disabled,true);inquiry.state.loading=false;
  inquiry.state.params={handle:shop.handle,id:'2'};tree=inquiry.render('default',{});assert.ok(!tree.some(node=>node.props.label==='Copy message'));
  inquiry.state.params={handle:shop.handle,id:'3',options:JSON.stringify({Color:'Purple'})};tree=inquiry.render('default',{});assert.ok(!tree.some(node=>node.props.label==='Copy message'),'A forged product-option link cannot create a handoff');
});
