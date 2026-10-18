import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {createUiText} from '../lib/i18n/core';
import {approvedDemoContactMethods,DEMO_PROFILE_CONTACT_EXAMPLES} from '../lib/demo-inquiry-policy';
import type {Shop} from '@suqpage/contracts';

type Element={type:string;props:Record<string,unknown>&{children?:unknown}};
const bundle=build({entryPoints:['apps/mobile/app/inquiry.tsx','apps/mobile/src/ShowroomContent.tsx'],outdir:'/tmp/suqpage-inbox-ui',bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'inbox-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|expo-clipboard|.*\/(?:runtime|ui|chrome|use-business-inquiry|blocked-businesses|CatalogSafety|Gallery|YouTubeVideo)|.*lib\/browser-clipboard)$/},args=>({path:args.path.split('/').at(-1)==='jsx-runtime'?'react/jsx-runtime':args.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:
  args.path==='react'?`export const useState=value=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof value==='function'?value():value;return[fixture.states[i],value=>fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value]};export const useMemo=fn=>fn(),useEffect=()=>{};export default {};`
  :args.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
  :args.path==='react-native'?`export const View='View',Text='Text',TextInput='TextInput',Pressable='Pressable',Platform={get OS(){return fixture.platform}},StyleSheet={create:value=>value},useWindowDimensions=()=>({fontScale:1,width:390,height:844});`
  :args.path==='expo-router'?`export const useLocalSearchParams=()=>({handle:fixture.shop.handle}),router={push(){throw Error('Unexpected navigation')}};`
  :args.path==='expo-clipboard'?`export async function setStringAsync(value){fixture.trace.push({kind:'copy',value});return fixture.copyAllowed}`
  :args.path.endsWith('/browser-clipboard')?`export async function copyBrowserText(value){fixture.trace.push({kind:'copy',value});return fixture.copyAllowed}export async function openCopiedBrowserLink(value,href){fixture.trace.push({kind:'copy',value},{kind:'open',value:href});return {copied:fixture.copyAllowed,opened:fixture.openAllowed}}`
  :args.path.endsWith('/runtime')?`export const API='https://suqpage.fixture',useApp=()=>({t:fixture.t}),useLoad=()=>({data:fixture.shop,loading:false,error:'',reload(){}}),request=async()=>{throw Error('Unexpected API write')};`
  :args.path.endsWith('/use-business-inquiry')?`export const useBusinessInquiry=()=>({items:fixture.items,error:'',setItems(){throw Error('Unexpected selection mutation')},retry(){}});`
  :args.path.endsWith('/blocked-businesses')?`export const useBlockedBusinesses=()=>({list:[]});`
  :args.path.endsWith('/ui')?`export const Screen='Screen',Copy='Copy',Field='Field',Card='Card',Button='Button',Chip='Chip',Status='Status',Photo='Photo',LinkedText='LinkedText',Icon='Icon',s={wrap:{}},colors={ink:'#222',muted:'#667',brand:'#c43a00',line:'#ddd'};export async function openLink(value){fixture.trace.push({kind:'open',value});if(!fixture.openAllowed)throw Error('Unavailable')}export const useOpenLink=()=>async value=>{try{await openLink(value);return true}catch{return false}};`
  :args.path.endsWith('/chrome')?`export const Sheet='Sheet';`
  :`export const CatalogSafety='CatalogSafety';export default 'Presentation';`
 }));
}}]});
function nodes(value:unknown):Element[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return[];const n=value as Element;return[n,...nodes(n.props.children)];}
function text(value:unknown):string{if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Element).props.children);return typeof value==='string'?value:'';}
const shop:Shop={id:1,handle:'demo-fixture',name:'Literal shop',about:'',cover:'',videoUrl:'',contacts:{phone:'+447700900123',whatsapp:'+447700900123',telegram:'+447700900123',tiktok:'fixture_shop',instagram:'fixture_shop',facebook:'fixture_shop'},products:[{id:1,name:'Literal product',description:'Physical product',kind:'standard_product',priceMinor:null,media:[],published:true,availability:'available',quantityMode:'optional',options:[]}],version:1,status:'active',isDemo:false};
async function fixture(platform:'android'|'web',locale='en'){
 const state={shop:{...shop},items:[{product:shop.products[0],quantity:'3 boxes',options:{}}],platform,t:createUiText(locale==='en'?{}:JSON.parse(readFileSync(`lib/i18n/messages/${locale}.json`,'utf8'))),states:[] as unknown[],cursor:0,copyAllowed:true,openAllowed:true,trace:[] as Array<{kind:string;value:string}>};
 const outputs=(await bundle).outputFiles;
 function render(entry='inquiry'){
  const mod={exports:{} as Record<string,(props?:unknown)=>unknown>};vm.runInNewContext(outputs.find(o=>o.path.endsWith('/'+entry+'.js'))!.text,{module:mod,exports:mod.exports,fixture:state,URL,URLSearchParams});state.cursor=0;
  return nodes(entry==='inquiry'?mod.exports.default():mod.exports.ShowroomContent({shop:state.shop}));
 }
 return{state,render};
}
function button(tree:Element[],label:string){const node=tree.find(n=>n.type==='Button'&&n.props.label===label);assert.ok(node,label);return node;}
const settle=()=>new Promise<void>(resolve=>setImmediate(resolve));

test('FE-066 actual Expo inquiry copies before each supported inbox; real and approved demos retain native-language drafts',async()=>{
 for(const platform of ['android','web'] as const)for(const locale of ['en','am','om','so','ti'])for(const demo of [false,true]){
  const f=await fixture(platform,locale);f.state.shop={...shop,isDemo:demo,approvedDemoContactMethods:demo?['phone','whatsapp','telegram']:undefined};
  const tree=f.render();assert.ok(tree.some(n=>text(n)===f.state.t('Message the business')));
  for(const provider of ['TikTok','Instagram','Facebook'])assert.ok(!tree.some(n=>n.type==='Button'&&n.props.label===provider));
  for(const provider of ['WhatsApp','Telegram','SMS']){
   const target=button(tree,provider);assert.equal(target.props.disabled,false);(target.props.onPress as()=>void)();await settle();
   const trace=f.state.trace.slice(-2);assert.deepEqual(trace.map(x=>x.kind),['copy','open']);assert.match(trace[0].value,/Literal product[\s\S]*3 boxes/);assert.ok(trace[0].value.startsWith(f.state.t('Hello {value1},',{value1:'Literal shop'})));
   const url=new URL(trace[1].value);assert.equal(url.searchParams.get(provider==='SMS'?'body':'text'),trace[0].value);
  }
 }
});

test('FE-066 Expo denied clipboard/open keeps selectable draft and residual fake demo contacts never launch',async()=>{
 for(const platform of ['android','web'] as const){
  const f=await fixture(platform);f.state.copyAllowed=false;f.state.openAllowed=false;let tree=f.render();(button(tree,'WhatsApp').props.onPress as()=>void)();await settle();tree=f.render();
  assert.ok(tree.some(n=>text(n)==='Select and copy your message'));assert.ok(tree.some(n=>text(n)==='Could not open the social app. Use the link below.'));assert.ok(tree.some(n=>n.props.selectable&&text(n).includes('Literal product')));assert.ok(button(tree,'WhatsApp ↗'));
  f.state.shop={...shop,isDemo:true,approvedDemoContactMethods:['phone']};f.state.trace=[];tree=f.render();assert.equal(button(tree,'WhatsApp').props.disabled,true);assert.equal(button(tree,'Telegram').props.disabled,true);assert.equal(button(tree,'SMS').props.disabled,false);
  (button(tree,'WhatsApp').props.onPress as()=>void)();await settle();assert.deepEqual(f.state.trace,[],'Handler also refuses a stale or bypassed disabled contact');
 }
});

test('FE-066 Expo profile links open without copying, while approved demo inbox footer links retain selection copy',async()=>{
 const f=await fixture('android');let tree=f.render('ShowroomContent');
 const profile=tree.find(n=>n.type==='Pressable'&&n.props.accessibilityLabel==='TikTok')!;assert.ok(profile);(profile.props.onPress as()=>void)();await settle();assert.deepEqual(f.state.trace.map(x=>x.kind),['open']);
 f.state.shop={...shop,isDemo:true,approvedDemoContactMethods:['whatsapp','telegram','phone']};f.state.trace=[];tree=f.render('ShowroomContent');
 const whatsapp=tree.find(n=>n.type==='Pressable'&&n.props.accessibilityLabel==='WhatsApp')!;assert.equal(whatsapp.props.disabled,false);(whatsapp.props.onPress as()=>void)();await settle();assert.deepEqual(f.state.trace.map(x=>x.kind),['copy','open']);
 const tiktok=tree.find(n=>n.type==='Pressable'&&n.props.accessibilityLabel==='TikTok')!;assert.equal(tiktok.props.disabled,true);
 const examples={...shop.contacts,...DEMO_PROFILE_CONTACT_EXAMPLES};f.state.shop={...shop,isDemo:true,contacts:examples,approvedDemoContactMethods:approvedDemoContactMethods(true,examples,'+447700900123')};f.state.trace=[];tree=f.render('ShowroomContent');
 for(const label of ['TikTok','Instagram','Facebook','Website']){const link=tree.find(n=>n.type==='Pressable'&&n.props.accessibilityLabel===label)!;assert.ok(link,label);assert.equal(link.props.disabled,false);(link.props.onPress as()=>void)();await settle();}
 assert.deepEqual(f.state.trace.map(x=>x.kind),['open','open','open','open'],'Approved official demo profiles stay ordinary links without inquiry copy');
});
