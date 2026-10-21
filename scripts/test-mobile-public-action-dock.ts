import {TRANSPORT_COPY} from '../lib/i18n/transport-copy';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
import type {Offering,Shop} from '@suqpage/contracts';
import {createUiText} from '../lib/i18n/core';
import am from '../lib/i18n/messages/am.json';
import om from '../lib/i18n/messages/om.json';
import so from '../lib/i18n/messages/so.json';
import ti from '../lib/i18n/messages/ti.json';

type Element={type:string|((props:Record<string,unknown>)=>unknown);props:Record<string,unknown>&{children?:unknown}};
type Basket={shop:Shop;items:Array<{product:Offering;quantity:string;options:Record<string,string>}>};
// Bundle the real dock, launcher, product and showroom with controlled platform,
// router and data ports. This proves component intent, not HTTP/DB/Android output.
const bundled=build({entryPoints:['apps/mobile/src/PublicActionDock.tsx','apps/mobile/app/product.tsx','apps/mobile/src/ShowroomContent.tsx'],outdir:'/tmp/suqpage-public-action-components',bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'public-action-ports',setup(b){
  b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|react-native-safe-area-context|react-native-svg|expo-router|expo-clipboard|(?:\.\/|\.\.\/src\/)(?:runtime|ui|CatalogSafety|Gallery|YouTubeVideo|use-transport-unread|overlay-visibility|use-business-inquiry|blocked-businesses|owner-edit-navigation))$/},a=>({path:a.path.startsWith('../src/')?'./'+a.path.split('/').at(-1):a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',resolveDir:process.cwd(),contents:
    a.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],value=>fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value];},useRef=initial=>{const i=fixture.refCursor++;return fixture.refs[i]||(fixture.refs[i]={current:initial});},useEffect=()=>{};export default {};`
    :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
    :a.path==='react-native'?`export const View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',ScrollView='ScrollView',Modal='Modal',Platform={OS:'android'},StyleSheet={create:value=>value,absoluteFill:{}},useWindowDimensions=()=>({width:fixture.width,height:568,fontScale:1});`
    :a.path==='react-native-safe-area-context'?`export const useSafeAreaInsets=()=>({bottom:0});`
    :a.path==='react-native-svg'?`export const SvgXml='SvgXml';`
    :a.path==='expo-router'?`export const router={push:value=>fixture.routes.push(value)},usePathname=()=>fixture.path,useLocalSearchParams=()=>fixture.params,useGlobalSearchParams=()=>fixture.params;`
    :a.path==='expo-clipboard'?`export const setStringAsync=async value=>{fixture.copied.push(value);return true;};`
    :a.path==='./runtime'?`export const useApp=()=>({t:fixture.t,basket:fixture.basket,setBasket:value=>{fixture.basket=typeof value==='function'?value(fixture.basket):value;fixture.basketWrites++;}}),useLoad=()=>({data:fixture.shop,loading:false,error:'',reload(){}}),request=async()=>{throw Error('Unexpected API call');},languageNames={en:'English'},locales=['en'],enabledLocales=['en'],API='https://suqpage.com';`
    :a.path==='./use-business-inquiry'?`import {restoreBusinessInquiry} from ${JSON.stringify(process.cwd()+'/apps/mobile/src/inquiry-baskets.ts')};const restored=(shop,items)=>restoreBusinessInquiry(shop,items.map(item=>({productId:item.product.id,quantity:item.quantity,options:item.options})));export const useBusinessInquiry=shop=>({items:shop?restored(shop,fixture.baskets.get(shop.id)|| (fixture.basket?.shop.id===shop.id?fixture.basket.items:[])):[],ready:fixture.inquiryReady,error:'',retry(){},setItems:change=>{const current=fixture.baskets.get(shop.id)||(fixture.basket?.shop.id===shop.id?fixture.basket.items:[]);const next=change(restored(shop,current));fixture.baskets.set(shop.id,next);fixture.basket={shop,items:next};fixture.basketWrites++;}});`
    :a.path==='./ui'?`export const Icon='Icon',Screen='Screen',Copy='Copy',LinkedText='LinkedText',Card='Card',Button='Button',Chip='Chip',Status='Status',Photo='Photo',Brand='Brand',s={wrap:{}},colors={brand:'#c43a00',line:'#ddd',ink:'#222',soft:'#fff1e9'},useOpenLink=()=>async()=>{throw Error('Unexpected external navigation');};`
    :a.path==='./use-transport-unread'?`export const useTransportUnread=()=>fixture.unread;`
    :a.path==='./blocked-businesses'?`export const useBlockedBusinesses=()=>({ready:true,list:fixture.blocked});`
    :a.path==='./overlay-visibility'?`export const overlayIsOpen=()=>fixture.modal,registerOverlay=()=>()=>{};`
    :a.path==='./owner-edit-navigation'?`export const useOwnerNavigation=()=>navigate=>navigate();`
    :a.path==='./CatalogSafety'?`export const CatalogSafety=props=>props.children;`
    :`export default '${a.path.split('/').at(-1)}';`
  }));
}}]});
function product(id:number,patch:Partial<Offering>={}):Offering{return{id,name:'Product '+id,description:'Catalog details',kind:'standard_product',availability:'available',priceMinor:null,media:[],published:true,quantityMode:'optional',options:[],...patch};}
function shop(products:Offering[]):Shop{return{id:7,handle:'demo-test-shop',name:'Test shop',about:'Example catalog',cover:'',videoUrl:'',contacts:{},products,version:8,status:'active',isDemo:true};}
const item=(product:Offering,options:Record<string,string>={})=>({product,quantity:'',options});
function nodes(value:unknown):Element[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return[];const node=value as Element;if(typeof node.type==='function')return nodes(node.type(node.props));return[node,...nodes(node.props.children)];}
function style(node:Element){return Object.assign({},...[node.props.style].flat().filter(value=>value&&typeof value==='object')) as Record<string,unknown>;}
function text(value:unknown):string{if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Element).props.children);return typeof value==='string'||typeof value==='number'?String(value):'';}
function press(node:Element){assert.ok(node);(node.props.onPress as()=>void)();}
async function component(entry:'PublicActionDock'|'product'|'ShowroomContent'){
  const fixture={path:'/',params:{} as Record<string,string>,width:390,unread:0,modal:false,inquiryReady:true,basket:null as Basket|null,baskets:new Map<number,Basket['items']>(),blocked:[] as Array<{id:number}>,shop:null as Shop|null,routes:[] as unknown[],states:[] as unknown[],refs:[] as Array<{current:unknown}>,cursor:0,refCursor:0,basketWrites:0,copied:[] as string[],t:createUiText({})};
  const output=(await bundled).outputFiles.find(file=>file.path.endsWith('/'+entry+'.js'))!;
  const module={exports:{} as Record<string,(props:Record<string,unknown>)=>unknown>};vm.runInNewContext(output.text,{module,exports:module.exports,fixture});
  return{fixture,render:(props:Record<string,unknown>={},name='default')=>{fixture.cursor=fixture.refCursor=0;return nodes(module.exports[name](props));}};
}
const find=(tree:Element[],id:string)=>tree.find(node=>node.props.testID===id)!;

test('FE-074 actual native Product scopes choices/notices to handle+ID and revalidates option membership before any inquiry',async()=>{
 const f=await component('product'),a=product(1,{options:[{name:'Color',values:['Blue','Red']}]}),b=product(2,{options:[{name:'Color',values:['Blue','Green']}]}),current=shop([a,b]);f.fixture.shop=current;f.fixture.params={handle:current.handle,id:'1'};
 const byLabel=(tree:Element[],label:string)=>tree.find(node=>node.type==='Button'&&node.props.label===label)!;
 let tree=f.render();assert.equal(byLabel(tree,'Inquire about this item only').props.disabled,true);press(tree.find(node=>node.type==='Chip'&&node.props.label==='Blue')!);tree=f.render();const oldA=byLabel(tree,'Inquire about this item only');assert.equal(oldA.props.disabled,false);press(byLabel(tree,'Add to inquiry list'));tree=f.render();assert.ok(tree.some(node=>node.type==='Copy'&&node.props.children==='Added to inquiry list'));
 f.fixture.params={handle:current.handle,id:'2'};tree=f.render();assert.equal(byLabel(tree,'Inquire about this item only').props.disabled,true,'A choice valid on both products still requires a new deliberate selection');assert.ok(!tree.some(node=>node.type==='Copy'&&node.props.children==='Added to inquiry list'));assert.ok(!tree.some(node=>node.type==='Chip'&&node.props.selected===true));press(oldA);assert.deepEqual(f.fixture.routes,[],'An old product callback cannot act after route identity changes');
 press(tree.find(node=>node.type==='Chip'&&node.props.label==='Green')!);tree=f.render();const oldB=byLabel(tree,'Inquire about this item only');assert.equal(oldB.props.disabled,false);
 f.fixture.shop={...current,products:[a,{...b,options:[{name:'Color',values:['Blue']}]}]};tree=f.render();assert.equal(byLabel(tree,'Inquire about this item only').props.disabled,true,'Removed values are not canonical choices');const writes=f.fixture.basketWrites;press(oldB);press(byLabel(tree,'Add to inquiry list'));assert.equal(f.fixture.basketWrites,writes);assert.deepEqual(f.fixture.routes,[]);
 press(tree.find(node=>node.type==='Chip'&&node.props.label==='Blue')!);tree=f.render();press(byLabel(tree,'Inquire about this item only'));assert.deepEqual(JSON.parse(JSON.stringify(f.fixture.routes.at(-1))),{pathname:'/inquiry',params:{handle:current.handle,id:'2',options:'{"Color":"Blue"}'}});
 f.fixture.shop={...f.fixture.shop,id:8,handle:'another-showroom'};f.fixture.params={handle:'another-showroom',id:'2'};tree=f.render();assert.equal(byLabel(tree,'Inquire about this item only').props.disabled,true,'A different business cannot inherit same-ID options');
});

test('FE-041 native dock counts only distinct eligible saved selections and follows removal without a write',async()=>{
  const{fixture,render}=await component('PublicActionDock');let tree=render();assert.ok(!find(tree,'public-inquiry-list'));assert.equal(find(tree,'public-transport-launcher').props.accessibilityLabel,`${TRANSPORT_COPY.launcherTitle} · ${TRANSPORT_COPY.launcherSubtitle}`);
  const ready=product(1),custom=product(2,{kind:'made_to_order',availability:'limited',options:[{name:'Color',values:['Blue','Red']}]}),retired=product(3,{kind:'service'}),unavailable=product(4,{availability:'unavailable'}),draft=product(5,{published:false});
  fixture.basket={shop:shop([ready,custom,retired,unavailable,draft]),items:[item(ready),item(ready),item(custom,{Color:'Blue'}),item(custom,{Color:'Purple'}),item(retired),item(unavailable),item(draft)]};
  fixture.shop=fixture.basket.shop;fixture.path='/shop/'+fixture.shop.handle;
  tree=render();assert.equal(text(find(tree,'inquiry-list-count')), '2');assert.equal(find(tree,'public-inquiry-list').props.accessibilityLabel,'View inquiry list (2)');
  assert.ok(tree.indexOf(find(tree,'public-inquiry-list'))<tree.indexOf(find(tree,'public-transport-launcher')),'Saved-list access precedes transport');assert.equal(tree.filter(node=>node.props.testID==='public-inquiry-list').length,1);
  fixture.basket.items=[item(ready)];tree=render();assert.equal(text(find(tree,'inquiry-list-count')),'1');fixture.basket.items=[];tree=render();assert.ok(!find(tree,'public-inquiry-list'));assert.equal(fixture.basketWrites,0,'Navigation never mutates or persists the basket');
  fixture.basket.items=[item(ready)];fixture.blocked=[{id:fixture.shop.id}];tree=render();assert.ok(!find(tree,'public-inquiry-list'),'Blocking a business removes its action without exposing any other business list');
});

test('FE-036 native floating inquiry appears only for its current business while transport remains public',async()=>{
  const{fixture,render}=await component('PublicActionDock'),ready=product(1);fixture.basket={shop:shop([ready]),items:[item(ready)]};
  fixture.path='/shop/another-business';fixture.shop={...shop([ready]),id:99,handle:'another-business'};let tree=render();assert.ok(!find(tree,'public-inquiry-list'),'Another business never displays the old business list');
  fixture.shop=fixture.basket.shop;fixture.path='/shop/'+fixture.shop.handle;tree=render();press(find(tree,'public-inquiry-list'));assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{pathname:'/inquiry',params:{handle:fixture.shop.handle}});
  fixture.path='/inquiry';fixture.params={id:'99',handle:'another-business'};tree=render();assert.ok(!find(tree,'public-inquiry-list'));assert.ok(find(tree,'public-transport-launcher'));
  for(const path of ['/','/featured','/about']){fixture.path=path;tree=render();assert.ok(!find(tree,'public-inquiry-list'),path);assert.ok(find(tree,'public-transport-launcher'),path);}
  fixture.path='/shop/'+fixture.shop.handle;tree=render();fixture.modal=true;const before=fixture.routes.length;press(find(tree,'public-inquiry-list'));press(find(tree,'public-transport-launcher'));assert.equal(fixture.routes.length,before,'Retained background handlers cannot navigate during composition');fixture.modal=false;
  assert.deepEqual(render({placement:'market'}),[],'A retained hidden Market cannot duplicate the public root dock');fixture.path='/';assert.deepEqual(render({placement:'shell'}),[],'The public root leaves Market placement to its mounted stage');
  for(const path of ['/account','/owner/page','/owner/setup','/owner/support','/login','/request','/buying','/dashboard/admin/staff','/blocked-businesses']){fixture.path=path;assert.deepEqual(render(),[],path);}
});

test('FE-053 compact dock keeps both translated labels and actual48px controls; transport opens intake directly',async()=>{
  const{fixture,render}=await component('PublicActionDock'),ready=product(1);fixture.basket={shop:shop([ready]),items:[item(ready)]};fixture.shop=fixture.basket.shop;fixture.path='/shop/'+fixture.shop.handle;fixture.unread=3;
  for(const messages of [{},am,om,so,ti])for(const width of [320,390]){fixture.t=createUiText(messages);fixture.width=width;const tree=render({compact:true}),list=find(tree,'public-inquiry-list'),transport=find(tree,'public-transport-launcher'),dock=find(tree,'public-action-dock');
    assert.equal(style(dock).width,168);for(const control of [list,transport]){assert.equal(style(control).minWidth,48);assert.equal(style(control).minHeight,48);assert.ok(nodes(control).filter(node=>node.type==='Text').every(node=>!node.props.numberOfLines),'Labels wrap instead of truncating');}
    assert.ok(text(list).includes(fixture.t('Inquiry list')));assert.ok(text(transport).includes(fixture.t(TRANSPORT_COPY.launcherTitle)));assert.ok(text(transport).includes(fixture.t(TRANSPORT_COPY.launcherSubtitle)));assert.equal(style(transport).paddingRight,26,'Unread badge has its own room');assert.ok(text(transport).includes('3'));
    const before=fixture.routes.length;press(transport);assert.equal(fixture.routes.length,before+1);assert.equal(fixture.routes.at(-1),'/buying','A single tap navigates to existing intake, without a confirmation or send');
  }
});

test('FE-053 short Market dock shows transport only in every locale despite saved business lists',async()=>{
  const{fixture,render}=await component('PublicActionDock'),ready=product(1);fixture.basket={shop:shop([ready]),items:[item(ready)]};
  for(const messages of [{},am,om,so,ti])for(const width of [320,390]){fixture.t=createUiText(messages);fixture.width=width;const tree=render({compact:true,horizontal:true,placement:'market'}),dock=find(tree,'public-action-dock'),list=find(tree,'public-inquiry-list'),transport=find(tree,'public-transport-launcher');
    assert.equal(style(dock).width,244);assert.equal(style(dock).flexDirection,'row');assert.equal(list,undefined);assert.equal(style(transport).minHeight,48);
    assert.equal(text(transport),fixture.t(TRANSPORT_COPY.launcherTitle)+fixture.t(TRANSPORT_COPY.launcherSubtitle));assert.ok(nodes(transport).every(node=>!node.props.numberOfLines),'Transport still wraps without truncation');assert.equal(tree.filter(node=>node.type==='Pressable').length,1,'Global Market never advertises a business list');
  }
  fixture.basket=null;const tree=render({compact:true,horizontal:true,placement:'market'});assert.equal(tree.filter(node=>node.type==='Pressable').length,1);assert.ok(!find(tree,'public-inquiry-list'));assert.ok(find(tree,'public-transport-launcher'));
});

test('FE-041 direct product inquiry does not alter saved items; A and B Add retain independent lists',async()=>{
  const{fixture,render}=await component('product'),ready=product(1);fixture.shop=shop([ready]);fixture.params={handle:fixture.shop.handle,id:'1'};fixture.basket={shop:fixture.shop,items:[item(ready)]};const original=JSON.stringify(fixture.basket);
  let tree=render();assert.ok(!tree.some(node=>String(node.props.label).startsWith('View inquiry list')),'Only the shared dock provides saved-list access');
  fixture.inquiryReady=false;tree=render();assert.equal(tree.find(node=>node.props.label==='Add to inquiry list')!.props.disabled,true);press(tree.find(node=>node.props.label==='Add to inquiry list')!);assert.equal(fixture.basketWrites,0,'An unread existing list is never replaced by an early Add');
  press(tree.find(node=>node.props.label==='Inquire about this item only')!);assert.equal(JSON.stringify(fixture.basket),original);assert.equal(fixture.basketWrites,0);assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{pathname:'/inquiry',params:{handle:fixture.shop.handle,id:'1',options:'{}'}});
  fixture.inquiryReady=true;tree=render();
  press(tree.find(node=>node.props.label==='Add to inquiry list')!);assert.equal(fixture.basket.items.length,1);assert.equal(fixture.basketWrites,1,'Adding the same selection replaces it without incrementing the count');
  fixture.shop={...fixture.shop,id:99,handle:'other-shop',products:[product(9)]};fixture.params={handle:'other-shop',id:'9'};tree=render();press(tree.find(node=>node.props.label==='Add to inquiry list')!);tree=render();assert.equal(fixture.basketWrites,2);assert.equal(fixture.basket.shop.id,99);assert.equal(fixture.baskets.get(7)?.[0].product.id,1);assert.equal(fixture.baskets.get(99)?.[0].product.id,9);
});

test('FE-041 native showroom removes only redundant inline list access and retains configured contact links',async()=>{
  const{fixture,render}=await component('ShowroomContent'),ready=product(1),business={...shop([ready]),isDemo:false,contacts:{whatsapp:'+12025550123',telegram:'test_business'}};fixture.basket={shop:business,items:[item(ready)]};
  const tree=render({shop:business},'ShowroomContent');assert.ok(!tree.some(node=>String(node.props.label).startsWith('View inquiry list')));assert.ok(tree.some(node=>node.props.accessibilityLabel==='Product 1'));assert.ok(tree.some(node=>node.props.accessibilityLabel==='WhatsApp'),'Configured social contact is preserved');
  const preview=render({shop:business,preview:true},'ShowroomContent');assert.ok(!preview.some(node=>node.props.testID==='public-action-dock'||String(node.props.label).startsWith('View inquiry list')));
});
