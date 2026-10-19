import assert from 'node:assert/strict';import {test} from 'node:test';import vm from 'node:vm';import {build} from 'esbuild';
import {createUiText} from '../lib/i18n/core';import am from '../lib/i18n/messages/am.json';import om from '../lib/i18n/messages/om.json';import so from '../lib/i18n/messages/so.json';import ti from '../lib/i18n/messages/ti.json';
type Node={type:string|((props:Record<string,unknown>)=>unknown);props:Record<string,unknown>&{children?:unknown}};
const home={shop:{name:'Fixture Store',handle:'fixture-store',logo:'private/logo',status:'draft',products:[],contacts:{phone:'PUBLIC_PHONE'}},user:{name:'PRIVATE_NAME',email:'PRIVATE_EMAIL',phone:'PRIVATE_PHONE'},activity:{visitsTotal:137,visits30Days:19,products:7,newInquiries:999}};
const bundled=build({entryPoints:['apps/mobile/src/owner-profile.tsx','apps/mobile/src/owner-business.tsx','apps/mobile/src/main-navigation.tsx','apps/mobile/src/AttentionAlerts.tsx','apps/mobile/app/owner/[section].tsx'],bundle:true,write:false,outdir:'/tmp/suqpage-account-hub-test',platform:'node',format:'cjs',plugins:[{name:'account-hub-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|react-native-safe-area-context|(?:\.\/|\.\.\/\.\.\/src\/)(?:runtime|ui|owner-forms|owner-inbox|owner-handle|CountrySelector|CitySelector|AttentionAlerts|chrome|attention-platform|OwnerTransportHistory|OwnerEmailChange|owner-edit-navigation|OwnerEditConfirmation))$/},a=>({path:a.path.split('/').at(-1)!,namespace:'ports'}));
 b.onResolve({filter:/^\.\.\/buying$/},()=>({path:'BuyingScreen',namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:
  a.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],v=>fixture.states[i]=typeof v==='function'?v(fixture.states[i]):v];};export const useEffect=()=>{},useRef=initial=>({current:initial}),createContext=()=>({}),useContext=()=>fixture.attention;export default {};`
  :a.path==='jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
  :a.path==='react-native'?`export const View='View',Text='Text',Pressable='Pressable',Platform={OS:'android'},AppState={currentState:'active'};`
  :a.path==='expo-router'?`export const useLocalSearchParams=()=>fixture.params,useGlobalSearchParams=()=>fixture.params,usePathname=()=>fixture.path,router={push:route=>fixture.routes.push({kind:'push',route}),replace:route=>fixture.routes.push({kind:'replace',route}),navigate:route=>fixture.routes.push({kind:'navigate',route})};`
  :a.path==='react-native-safe-area-context'?`export const useSafeAreaInsets=()=>({bottom:0});`
  :a.path==='runtime'?`export const useApp=()=>fixture.app,useLoad=fn=>{fixture.loads.push(fn);return{data:fixture.app.session?fixture.home:null,loading:false,error:'',reload(){}};},request=async()=>{throw Error('Unexpected public request');},API='https://suqpage.com';`
  :a.path==='ui'?`export const Copy='Copy',Button='Button',Card='Card',Photo='Photo',Field='Field',Chip='Chip',Status='Status',Icon='Icon',Screen='Screen',colors={},s={},useOpenLink=()=>()=>{};`
  :a.path==='owner-forms'?`export const Setup='Setup',PageEditor='PageEditor',ProductEditor='ProductEditor',useAction=()=>({busy:false,isBusy:()=>false,run:async fn=>fn()}),ActionStatus='ActionStatus',pickImages=async()=>[],addAsset=async()=>{};`
  :a.path==='owner-edit-navigation'?`export const useOwnerNavigation=()=>leave=>leave(),useOwnerEditGuard=state=>({confirming:false,changed(){},checkpoint:()=>0,requestLeave:leave=>{if(!state.busy&&!state.isBusy?.())leave();},keepEditing(){},discard(){},complete:leave=>leave?.()});`
  :a.path==='owner-inbox'?`export const Inquiries='Inquiries',SupportList='SupportList',OwnerChat='OwnerChat';`
  :a.path==='owner-handle'?`export const HandleEditor='HandleEditor';`
  :a.path==='OwnerEmailChange'?`export const nativeOwnerEmailChangeEnabled=false;export default 'OwnerEmailChange';`
  :a.path==='AttentionAlerts'?`export const OwnerAlerts='OwnerAlerts',useOwnerAlertCount=()=>0;`
  :a.path==='chrome'?`export const Sheet='Sheet';`
  :a.path==='attention-platform'?`export const attentionRoute=()=>{},listenToAttentionTap=()=>{},notificationDevice=async()=>{fixture.devices++;return{platform:'expo',token:'fixture-device'};};`
  :`export default '${a.path}';`
 }));
}}]});
async function component(entry:string){const fixture={states:[] as unknown[],cursor:0,routes:[] as Array<{kind:string;route:unknown}>,loads:[] as Array<()=>Promise<unknown>>,home,params:{section:'showroom',returnTo:'profile'} as Record<string,string>,path:'/account',devices:0,attention:null as unknown,app:{t:createUiText({}),locale:'en',session:{user:{id:'owner'}},ownerRequest:async()=>{throw Error('Unexpected write');},signOut:async()=>{},logoutPending:false}};
 const output=(await bundled).outputFiles.find(file=>file.path.endsWith('/'+entry+'.js'))!;assert.ok(output,entry);
 const module={exports:{} as Record<string,(props:Record<string,unknown>)=>Node>};vm.runInNewContext(output.text,{module,exports:module.exports,fixture});
 const render=(name:string,props:Record<string,unknown>={})=>{fixture.cursor=0;return nodes(module.exports[name](props));};return{fixture,render};}
function nodes(value:unknown):Node[]{if(!value||typeof value!=='object')return[];const node=value as Node;return[node,...[node.props.children].flat(Infinity).flatMap(nodes)];}
const name=(node:Node)=>typeof node.type==='function'?node.type.name:node.type;
function text(value:unknown):string {if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Node).props.children);return typeof value==='string'||typeof value==='number'?String(value):'';}
const button=(tree:Node[],label:string)=>tree.find(n=>(name(n)==='Button'&&n.props.label===label)||(name(n)==='Pressable'&&n.props.accessibilityLabel===label));
const press=(node:Node)=>{assert.ok(node);(node.props.onPress as()=>void)();};

test('FE-056 actual native Account hub exposes six scoped destinations and only authoritative compact metrics',async()=>{
 for(const messages of [{},am,om,so,ti]){const{fixture,render}=await component('owner-profile');fixture.app.t=createUiText(messages);const t=fixture.app.t,tree=render('OwnerProfile',{home});
  const destinations=[['Your page','showroom'],['Products','products'],['Transport chat','transport'],['Business details','business'],['Account settings','settings'],['Support','support']];
  for(const[label,section]of destinations){const node=button(tree,t(label))!;assert.ok(node);assert.ok(Number((node.props.style as Record<string,unknown>).minHeight)>=48);press(node);assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{kind:'push',route:{pathname:'/owner/[section]',params:{section,returnTo:'profile'}}});}
  const rendered=JSON.stringify(tree),visible=tree.map(node=>text(node.props.children)).join('\n');assert.ok(visible.includes(home.shop.name)&&visible.includes('@'+home.shop.handle));for(const value of ['137','19','7'])assert.ok(visible.includes(value));for(const value of ['PRIVATE_NAME','PRIVATE_EMAIL','PRIVATE_PHONE','PUBLIC_PHONE','999'])assert.ok(!rendered.includes(value),'Hub must not dump private/public contact fields or retired inquiry metrics');
  assert.ok(!button(tree,t('Preview page'))&&!button(tree,t('Edit page'))&&!button(tree,t('Edit account details')));
 }
});
test('FE-056 actual showroom menu opens eight focused tasks with Your page return semantics',async()=>{
 const{fixture,render}=await component('owner-profile'),tree=render('ShowroomMenu');for(const[label,section,view]of [['Preview page','page','preview'],['About the business','page','about'],['Cover photo','cover',undefined],['Business video','page','video'],['Page color','page','color'],['Public contact details','page','contacts'],['Page address','handle',undefined]]){press(button(tree,label!)!);assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{kind:'push',route:{pathname:'/owner/[section]',params:{section,returnTo:'showroom',...(view?{view}:{})}}});}
 assert.ok(!button(tree,'Edit page')&&!button(tree,'Allow team editing'));for(const heading of ['Page content','Appearance','Sharing and access'])assert.ok(tree.some(node=>text(node.props.children)===heading));
});
test('FE-056 actual Settings is read-first and separates profile, notification controls and safe sign-out',async()=>{
 const{fixture,render}=await component('owner-business');let tree=render('Settings',{home});assert.equal(tree.some(n=>name(n)==='Field'),false);assert.ok(JSON.stringify(tree).includes('PRIVATE_EMAIL'));assert.ok(!button(tree,'Blocked businesses'),'Anonymous catalog preferences do not belong in business Account settings');press(button(tree,'Edit account details')!);assert.equal((fixture.routes.at(-1)!.route as {params:{view:string}}).params.view,'profile');press(button(tree,'Notifications')!);assert.equal((fixture.routes.at(-1)!.route as {params:{view:string}}).params.view,'notifications');
 tree=render('Settings',{home,view:'profile'});assert.equal(tree.filter(n=>name(n)==='Field').length,2);assert.ok(!button(tree,'Sign out')&&!button(tree,'Notifications'));press(button(tree,'Cancel')!);assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{kind:'replace',route:{pathname:'/owner/[section]',params:{section:'settings',returnTo:'profile'}}});
 tree=render('Settings',{home,view:'notifications'});assert.equal(tree.some(n=>name(n)==='Field'),false);const alerts=tree.find(n=>name(n)==='OwnerAlerts');assert.equal(alerts?.props.inline,true);assert.equal(alerts?.props.preferencesOnly,true);
 let signouts=0;fixture.app.signOut=async()=>{signouts++;throw Error('provider logout failed');};tree=render('Settings',{home});press(button(tree,'Sign out')!);await new Promise<void>(r=>setImmediate(r));assert.equal(signouts,1);assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{kind:'replace',route:'/account'});
});
test('FE-056 actual owner route dispatch preserves focused editor callbacks and denied-session privacy',async()=>{
 const{fixture,render}=await component('[section]');for(const section of ['showroom','business','settings','cover','handle','page']){fixture.params={section,returnTo:'profile',...(section==='page'?{view:'preview'}:{})};const tree=render('default');if(section!=='page')assert.ok(button(tree,'Back to account'));if(section==='showroom')assert.ok(tree.some(n=>name(n)==='ShowroomMenu'));if(section==='business')assert.ok(tree.some(n=>name(n)==='BusinessSummary'));if(section==='settings')assert.ok(tree.some(n=>name(n)==='Settings'));if(section==='page'){const editor=tree.find(n=>name(n)==='PageEditor');assert.equal(editor?.props.initialPreview,true);assert.equal(editor?.props.backLabel,'Back to account');(editor!.props.onSaved as()=>void)();assert.equal(fixture.routes.at(-1)!.route,'/account');}}
 fixture.params={section:'business',view:'edit',returnTo:'profile'};let tree=render('default');const business=tree.find(n=>name(n)==='BusinessForm');assert.ok(business);(business.props.onCancel as()=>void)();assert.equal(fixture.routes.at(-1)!.route,'/account','The business editor owns its Cancel control and receives the original Account destination');
 fixture.params={section:'product',id:'21',returnTo:'profile'};tree=render('default');const product=tree.find(n=>name(n)==='ProductEditor');assert.ok(product);press(button(tree,'Products')!);const parent={kind:'replace',route:{pathname:'/owner/[section]',params:{section:'products'}}};assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),parent);(product.props.onCancel as()=>void)();assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),parent);(product.props.onSaved as()=>void)();assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),parent,'Product parent, Cancel and Save consistently return to Products');
 fixture.app.session=null as never;tree=render('default');assert.ok(button(tree,'Sign in'));assert.ok(!JSON.stringify(tree).includes('PRIVATE_')&&!JSON.stringify(tree).includes('Fixture Store'));for(const load of fixture.loads.slice(-1))assert.equal(await load(),null);
});
test('FE-056 actual main navigation says Account for owners and Login for visitors, with no inquiries tab',async()=>{
 const{fixture,render}=await component('main-navigation');let tree=render('default');assert.ok(button(tree,'Account'));assert.ok(!button(tree,'Dashboard')&&!button(tree,'Inquiries'));fixture.app.session=null as never;tree=render('default');assert.ok(button(tree,'Login'));assert.ok(!button(tree,'Account'));
});
test('FE-067 native owner catalog keeps retired services private and distinguishes their status from products',async()=>{
 const{fixture,render}=await component('[section]');fixture.params={section:'products'};
 const previous=fixture.home.shop.products;
 try{Object.assign(fixture.home.shop,{products:[{id:21,name:'Retained service',kind:'service',availability:'available',published:true,media:[]},{id:22,name:'Custom table',kind:'made_to_order',availability:'limited',published:true,media:[]}]});
  const tree=render('default'),visible=tree.map(node=>text(node.props.children)).join('\n');assert.ok(visible.includes('Products')&&visible.includes('Retired listing'));assert.ok(button(tree,'Add product'));assert.ok(!button(tree,'Add product or service'));assert.equal(tree.filter(node=>text(node.props.children)==='Published').length,1,'Only the tangible product retains its publication label');
  const labels=tree.filter(node=>name(node)==='ProductSupply');assert.deepEqual(labels.map(node=>[node.props.kind,node.props.availability]),[['service','available'],['made_to_order','limited']]);
 }finally{fixture.home.shop.products=previous;}
});
test('FE-056 native notification preferences reuse explicit opt-in and leave the existing alert modal intact',async()=>{
 for(const enabled of [false,true]){const{fixture,render}=await component('AttentionAlerts'),commands:unknown[]=[];
  fixture.attention={feed:{unread:2,items:[],preferences:{soundEnabled:false},push:{web:{available:false,publicKey:''},expo:{available:true}},enabled:{expo:enabled}},reload:async()=>{},save:async(body:unknown)=>{commands.push(body);}};
  const renderControl=(props:Record<string,unknown>)=>{const root=render('OwnerAlerts',props)[0];assert.equal(typeof root.type,'function');return nodes((root.type as(props:Record<string,unknown>)=>unknown)(root.props));};
  let tree=renderControl({inline:true,preferencesOnly:true});assert.equal(fixture.devices,0);assert.equal(commands.length,0,'Opening preferences must not request notification permission or subscribe');assert.ok(!button(tree,'Alerts')&&!button(tree,'Mark all read')&&!tree.some(n=>name(n)==='Sheet'));
  press(button(tree,enabled?'Turn off notifications':'Turn on notifications')!);await new Promise<void>(r=>setImmediate(r));assert.equal(fixture.devices,enabled?0:1);assert.equal((commands[0] as{action:string}).action,enabled?'unsubscribe':'subscribe');
  fixture.states=[];tree=renderControl({});assert.ok(button(tree,'Alerts'));assert.ok(tree.some(n=>name(n)==='Sheet'&&n.props.visible===false));assert.ok(button(tree,'Mark all read'),'Ordinary alert-modal acknowledgement remains separate from preferences');
 }
});


test('FE-053 authenticated transport route has one screen root, no owner-home read and preserves setup/login guards',async()=>{
 const{fixture,render}=await component('[section]');fixture.params={section:'transport',returnTo:'profile'};let tree=render('default');assert.equal(tree.length,1);assert.equal(tree[0].type,'BuyingScreen');assert.equal(tree[0].props.owner,true);assert.equal(await fixture.loads.at(-1)!(),null,'Transport uses its scoped API, not a duplicate owner/home dependency');
 fixture.params={section:'transport',id:'71',returnTo:'profile'};tree=render('default');assert.equal(tree[0].props.conversationId,'71');fixture.params={section:'transport',view:'new',returnTo:'profile'};tree=render('default');assert.equal(tree[0].props.newIntake,true);
 fixture.params={section:'transport-history'};tree=render('default');assert.equal(tree[0].type,'OwnerTransportHistory');assert.equal(await fixture.loads.at(-1)!(),null);
 fixture.app.session=null as never;tree=render('default');assert.ok(button(tree,'Sign in'));assert.ok(!tree.some(node=>node.type==='BuyingScreen'||node.type==='OwnerTransportHistory'));assert.equal(await fixture.loads.at(-1)!(),null);
});
