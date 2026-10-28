import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {createUiText} from '../lib/i18n/core';
import {approvedDemoContactMethods,DEMO_PROFILE_CONTACT_EXAMPLES} from '../lib/demo-inquiry-policy';
import type {Shop} from '@africmade/contracts';

type Element={type:string;props:Record<string,unknown>&{children?:unknown}};
const bundle=build({entryPoints:['apps/mobile/app/inquiry.tsx','apps/mobile/src/ShowroomContent.tsx'],outdir:'/tmp/suqpage-inbox-ui',bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'inbox-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|expo-clipboard|expo-crypto|.*\/(?:runtime|ui|chrome|use-business-inquiry|blocked-businesses|CatalogSafety|Gallery|YouTubeVideo)|.*lib\/browser-clipboard)$/},args=>({path:args.path.split('/').at(-1)==='jsx-runtime'?'react/jsx-runtime':args.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:
  args.path==='react'?`export const useState=value=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof value==='function'?value():value;return[fixture.states[i],value=>fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value]};export const useMemo=fn=>fn(),useEffect=()=>{},useRef=value=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]={current:value};return fixture.states[i]};export default {};`
  :args.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
  :args.path==='react-native'?`export const View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',Platform={get OS(){return fixture.platform}},StyleSheet={create:value=>value},useWindowDimensions=()=>({fontScale:1,width:390,height:844});`
  :args.path==='expo-router'?`export const useLocalSearchParams=()=>({handle:fixture.shop.handle}),router={push(value){fixture.navigation.push(value)}};`
  :args.path==='expo-crypto'?`export const randomUUID=()=> 'inquiry_fixture_'+(++fixture.uuid);`
  :args.path==='expo-clipboard'?`export async function setStringAsync(value){fixture.trace.push({kind:'copy',value});return fixture.copyAllowed}`
  :args.path.endsWith('/browser-clipboard')?`export async function copyBrowserText(value){fixture.trace.push({kind:'copy',value});return fixture.copyAllowed}export async function openCopiedBrowserLink(value,href){fixture.trace.push({kind:'copy',value},{kind:'open',value:href});return {copied:fixture.copyAllowed,opened:fixture.openAllowed}}`
  :args.path.endsWith('/runtime')?`export const API='https://suqpage.fixture',useApp=()=>({t:fixture.t}),useLoad=()=>({data:fixture.shop,loading:fixture.loadPending,error:fixture.loadError,reload(){}}),request=async(path,options)=>{fixture.requests.push({path,body:options?.body});if(fixture.submitError)throw Error(fixture.submitError);return {inquiryId:77,duplicate:false,status:'received'}};`
  :args.path.endsWith('/use-business-inquiry')?`export const useBusinessInquiry=()=>({items:fixture.items,ready:true,error:'',setItems(change){fixture.items=change(fixture.items)},retry(){}});`
  :args.path.endsWith('/blocked-businesses')?`export const useBlockedBusinesses=()=>({list:[]});`
  :args.path.endsWith('/ui')?`export const Screen='Screen',Copy='Copy',Field='Field',Card='Card',Button='Button',Chip='Chip',Status='Status',Photo='Photo',LinkedText='LinkedText',Icon='Icon',s={wrap:{}},colors={ink:'#222',muted:'#667',brand:'#c43a00',line:'#ddd'};export async function openLink(value){fixture.trace.push({kind:'open',value});if(!fixture.openAllowed)throw Error('Unavailable')}export const useOpenLink=()=>async value=>{try{await openLink(value);return true}catch{return false}};`
  :args.path.endsWith('/chrome')?`export const Sheet='Sheet';`
  :`export const CatalogSafety='CatalogSafety';export default 'Presentation';`
 }));
}}]});
function nodes(value:unknown):Element[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return[];const n=value as Element;return[n,...nodes(n.props.children)];}
function text(value:unknown):string{if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Element).props.children);return typeof value==='string'?value:'';}
const shop:Shop={id:1,handle:'demo-fixture',name:'Literal shop',about:'',cover:'',videoUrl:'',contacts:{phone:'+447700900123',whatsapp:'+447700900123',telegram:'+447700900123',tiktok:'fixture_shop',instagram:'fixture_shop',facebook:'fixture_shop'},products:[{id:1,name:'Literal product',description:'Physical product',kind:'standard_product',priceMinor:null,media:[],published:true,availability:'available',quantityMode:'optional',options:[]}],version:1,status:'active',isDemo:false};
async function fixture(platform:'android'|'web',locale='en',userAgent?:string){
 const state={loadPending:false,loadError:'',shop:{...shop},items:[{product:shop.products[0],quantity:'3 boxes',options:{}}],platform,t:createUiText(locale==='en'?{}:JSON.parse(readFileSync(`lib/i18n/messages/${locale}.json`,'utf8'))),states:[] as unknown[],cursor:0,copyAllowed:true,openAllowed:true,uuid:0,navigation:[] as unknown[],requests:[] as Array<{path:string;body:Record<string,unknown>}>,submitError:'',trace:[] as Array<{kind:string;value:string}>};
 const outputs=(await bundle).outputFiles;
 function render(entry='inquiry'){
  const mod={exports:{} as Record<string,(props?:unknown)=>unknown>};vm.runInNewContext(outputs.find(o=>o.path.endsWith('/'+entry+'.js'))!.text,{module:mod,exports:mod.exports,fixture:state,URL,URLSearchParams,navigator:{userAgent:userAgent??(platform==='web'?'Mozilla/5.0 (iPhone)':'')}});state.cursor=0;
  return nodes(entry==='inquiry'?mod.exports.default():mod.exports.ShowroomContent({shop:state.shop}));
 }
 return{state,render};
}
function button(tree:Element[],label:string){const node=tree.find(n=>n.type==='Button'&&n.props.label===label);assert.ok(node,label);return node;}
function channel(tree:Element[],label:string){const node=tree.find(n=>n.type==='Pressable'&&String(n.props.accessibilityLabel||'').startsWith(label));assert.ok(node,label);return node;}
const settle=()=>new Promise<void>(resolve=>setImmediate(resolve));

test('FE-075 actual native form offers equal phone choices and requires personal fields only for Inbox',async()=>{
 for(const platform of ['android','web'] as const)for(const locale of ['en','am','om']){
  const f=await fixture(platform,locale),tree=f.render();assert.ok(!tree.some(n=>n.type==='Field'&&n.props.label===f.state.t('Your name')));assert.ok(!tree.some(n=>n.type==='Field'&&n.props.label===f.state.t('Your message')),'The channel chooser has no custom-message editor');assert.ok(button(tree,f.state.t('Send to AfricMade Inbox')));assert.deepEqual(f.state.requests,[]);
  for(const provider of ['TikTok','Instagram','Facebook'])assert.ok(!tree.some(n=>n.type==='Button'&&n.props.label===provider));
  for(const provider of ['WhatsApp','Telegram']){const label=f.state.t('Send on '+provider);const target=channel(tree,label);assert.equal(String(target.props.accessibilityLabel).includes('+447700900123'),true,'The channel exposes its approved public identity');assert.equal(text(target).includes('+447700900123'),true,'The identity is visible in the card');const identity=nodes([target]).find(n=>n.type==='Text'&&n.props.children==='+447700900123');assert.equal(identity?.props.numberOfLines,1,'Phone layout keeps a long contact number on one line');const phoneStyle=(target.props.style as (state:{pressed:boolean})=>Record<string,unknown>)({pressed:false});assert.equal(phoneStyle.flexBasis,'100%','Phone actions use the full row so the complete number is visible');assert.equal(target.props.disabled,false);(target.props.onPress as()=>void)();await settle();const trace=f.state.trace.slice(-2);assert.deepEqual(trace.map(x=>x.kind),['copy','open']);assert.match(trace[0].value,/Literal product[\s\S]*3 boxes/);}
  {const target=button(tree,'SMS');assert.equal(target.props.disabled,false);(target.props.onPress as()=>void)();await settle();const trace=f.state.trace.slice(-2);assert.deepEqual(trace.map(x=>x.kind),['copy','open']);}
 }
});
test('FE-075 desktop Expo web shows approved messaging identities and copy contact without opening social apps',async()=>{
 const f=await fixture('web','en','Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36');const tree=f.render();
 assert.ok(button(tree,'Send to AfricMade Inbox'));
 assert.equal(tree.filter(n=>n.type==='Button'&&n.props.label==='Copy contact').length,2,'Each approved messaging identity has its own copy action');
 assert.equal(tree.filter(n=>n.type==='Pressable'&&String(n.props.accessibilityLabel||'').startsWith('Send on ')).length,0,'Desktop does not launch app-specific links');
 const identity=tree.find(n=>n.type==='Text'&&n.props.selectable&&text(n)==='+447700900123');
 assert.ok(identity,'Desktop Expo web shows the public number as selectable text');
 assert.equal(identity.props.numberOfLines,1,'The contact number stays on one line on narrow devices');
 (button(tree,'Copy contact').props.onPress as()=>void)();await settle();assert.deepEqual(JSON.parse(JSON.stringify(f.state.trace)),[{kind:'copy',value:'+447700900123'}]);
});
function enter(tree:Element[],label:string,value:string){const field=tree.find(n=>n.type==='Field'&&n.props.label===label);assert.ok(field,label);(field.props.onChangeText as(value:string)=>void)(value);}
test('FE-075 real inquiry component edits only inside Inbox and retains the custom draft on failure',async()=>{
 const f=await fixture('android');let tree=f.render();assert.ok(!tree.some(n=>n.type==='Field'&&n.props.label==='Your message'));(button(tree,'Send to AfricMade Inbox').props.onPress as()=>void)();tree=f.render();const prepared=tree.find(n=>n.type==='Field'&&n.props.label==='Your message')?.props.value;assert.match(String(prepared),/Literal product/);enter(tree,'Your name','Aster Wako');enter(tree,'Phone number','+251911123456');enter(tree,'Your message','Please tell me whether this product is available.');tree=f.render();
 assert.equal(button(tree,'Send inquiry').props.disabled,false);f.state.submitError='Temporary network failure';(button(tree,'Send inquiry').props.onPress as()=>void)();await settle();tree=f.render();assert.equal(f.state.items.length,1);assert.ok(tree.some(n=>n.type==='Field'&&n.props.value==='Aster Wako'));assert.ok(tree.some(n=>n.type==='Field'&&n.props.value==='Please tell me whether this product is available.'));
 const first=f.state.requests[0];assert.equal(first.path,'inquiries');assert.equal(first.body.businessId,1);assert.equal(first.body.note,'Please tell me whether this product is available.');assert.equal((first.body.items as Array<{productId:number}>)[0].productId,1);
 f.state.submitError='';(button(tree,'Send inquiry').props.onPress as()=>void)();await settle();tree=f.render();assert.equal(f.state.requests[1].body.idempotencyKey,first.body.idempotencyKey);assert.equal(f.state.items.length,0);assert.ok(tree.some(n=>text(n)==='Inquiry sent to the business.'));assert.deepEqual(f.state.trace,[],'Primary send never opens an external app');
});
test('FE-075 general inquiry without products accepts a custom question only after Inbox is selected',async()=>{
 const f=await fixture('android');f.state.items=[];let tree=f.render();assert.ok(!tree.some(n=>n.type==='Field'&&n.props.label==='Your message'));(button(tree,'Send to AfricMade Inbox').props.onPress as()=>void)();tree=f.render();assert.match(String(tree.find(n=>n.type==='Field'&&n.props.label==='Your message')?.props.value),/Hello Literal shop[\s\S]*I'd like to ask about your products\./);enter(tree,'Your name','General visitor');enter(tree,'Phone number','+251911123456');enter(tree,'Your message','Do you make custom orders?');tree=f.render();assert.equal(button(tree,'Send inquiry').props.disabled,false);(button(tree,'Send inquiry').props.onPress as()=>void)();await settle();assert.deepEqual(JSON.parse(JSON.stringify(f.state.requests[0].body.items)),[]);assert.equal(f.state.requests[0].body.note,'Do you make custom orders?');
});
test('FE-075 footer retains profile links and primary inquiry but no duplicate messaging buttons',async()=>{
 const f=await fixture('android');f.state.shop={...shop,isDemo:true,contacts:{...shop.contacts,...DEMO_PROFILE_CONTACT_EXAMPLES},approvedDemoContactMethods:approvedDemoContactMethods(true,{...shop.contacts,...DEMO_PROFILE_CONTACT_EXAMPLES},'+447700900123')};const tree=f.render('ShowroomContent');assert.ok(button(tree,'Contact this business'));
 for(const provider of ['WhatsApp','Telegram','SMS'])assert.ok(!tree.some(n=>n.type==='Pressable'&&n.props.accessibilityLabel===provider));
 for(const label of ['TikTok','Instagram','Facebook','Website']){const link=tree.find(n=>n.type==='Pressable'&&n.props.accessibilityLabel===label);assert.ok(link,label);assert.equal(link.props.disabled,false);(link.props.onPress as()=>void)();await settle();}assert.deepEqual(f.state.trace.map(x=>x.kind),['open','open','open','open']);
});
test('FE-074 stale catalog blocks all actual external handoffs and primary send without discarding selections',async()=>{
 const f=await fixture('android');for(const condition of[{pending:true,error:''},{pending:false,error:'Unable to connect. Please try again.'}]){
  f.state.loadPending=condition.pending;f.state.loadError=condition.error;f.state.trace=[];const tree=f.render();assert.ok(tree.some(n=>text(n)==='Literal product'));
  for(const label of ['WhatsApp','Telegram']){const target=channel(tree,f.state.t('Send on '+label));assert.equal(target.props.disabled,true);(target.props.onPress as()=>void)();await settle();}const sms=tree.find(n=>n.type==='Button'&&n.props.label==='SMS');if(sms){assert.equal(sms.props.disabled,true);(sms.props.onPress as()=>void)();await settle();}assert.deepEqual(f.state.trace,[]);assert.equal(button(tree,'Send to AfricMade Inbox').props.disabled,true);
 }
});
