import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import {build} from 'esbuild';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createUiText,enabledLocales,parseLocale,type Locale} from '../lib/i18n/core';
import type {AttentionPushPort,PushPayload} from '../lib/attention-push';

type Element={type:string;props:Record<string,unknown>&{children?:unknown}};
type App={locale:Locale;setLocale:(value:Locale)=>void;t:(source:string)=>string;basket:unknown;setBasket:(value:unknown)=>void};
type Fixture={states:unknown[];refs:{current:unknown}[];effects:{deps:unknown[];cleanup?:()=>void}[];pending:(()=>void)[];cursor:number;refCursor:number;effectCursor:number;stored:string|null;writes:[string,string][];locale:Locale;refreshes:number;t:(source:string)=>string};
const bundle=build({entryPoints:['apps/mobile/src/runtime.tsx','components/LanguageSelector.tsx'],outdir:'/tmp/suqpage-enabled-languages',write:false,bundle:true,platform:'node',format:'cjs',define:{'process.env.EXPO_PUBLIC_SUPABASE_URL':'""','process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY':'""','process.env.EXPO_PUBLIC_API_ORIGIN':'"https://suqpage.com"'},plugins:[{name:'language-platform-ports',setup(builder){
  builder.onResolve({filter:/^(react(?:\/jsx-runtime)?|react-native|expo-router|expo-secure-store|@supabase\/supabase-js|next-intl|next\/navigation|lucide-react|@\/lib\/i18n\/ui)$/},args=>({path:args.path,namespace:'ports'}));
  builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:
    args.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],value=>{fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value;}];};export const useRef=initial=>{const i=fixture.refCursor++;return fixture.refs[i]||(fixture.refs[i]={current:initial});};export const useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))fixture.pending.push(()=>{old?.cleanup?.();fixture.effects[i]={deps,cleanup:create()};});};export const useCallback=fn=>fn,createContext=()=>({Provider:'Provider'}),useContext=()=>null,useTransition=()=>[false,fn=>fn()];export default {};`
    :args.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
    :args.path==='react-native'?`export const Platform={OS:'android'},AppState={addEventListener:()=>({remove(){}})};`
    :args.path==='expo-router'?`export const useFocusEffect=()=>{};`
    :args.path==='expo-secure-store'?`export const getItemAsync=async key=>key==='suqpage-language'?fixture.stored:null,setItemAsync=async(key,value)=>fixture.writes.push([key,value]),deleteItemAsync=async()=>{throw Error('Unexpected deletion');};`
    :args.path==='@supabase/supabase-js'?`export const createClient=()=>{throw Error('Unexpected Auth construction');};`
    :args.path==='next-intl'?`export const useLocale=()=>fixture.locale;`
    :args.path==='next/navigation'?`export const useRouter=()=>({refresh:()=>fixture.refreshes++});`
    :args.path==='lucide-react'?`export const Languages='Languages';`
    :`export const useUiText=()=>fixture.t;`
  }));
}}]});
function fixture(stored:string|null):Fixture{return{states:[],refs:[],effects:[],pending:[],cursor:0,refCursor:0,effectCursor:0,stored,writes:[],locale:'en',refreshes:0,t:createUiText({})};}
async function component(name:'runtime'|'LanguageSelector',state:Fixture){
  const output=(await bundle).outputFiles.find(file=>file.path.endsWith('/'+name+'.js'))!;
  const module={exports:{} as {RuntimeProvider:(props:{children:string})=>Element;default:()=>Element}};
  const document={cookie:''},location={protocol:'http:'};
  vm.runInNewContext(output.text,{module,exports:module.exports,fixture:state,URL,URLSearchParams,Request,Response,AbortController,setTimeout,clearTimeout,document,location,fetch:()=>{throw Error('Unexpected network call');}});
  const commit=()=>state.pending.splice(0).forEach(run=>run());
  const render=(commitEffects=true)=>{state.cursor=0;state.refCursor=0;state.effectCursor=0;const tree=name==='runtime'?module.exports.RuntimeProvider({children:'screen'}):module.exports.default();if(commitEffects)commit();return tree;};
  return{render,commit,document,unmount:()=>state.effects.forEach(effect=>effect.cleanup?.())};
}
function nodes(value:unknown):Element[]{if(!value||typeof value!=='object')return[];const node=value as Element;return[node,...[node.props.children].flat(Infinity).flatMap(nodes)];}
const settle=()=>new Promise<void>(resolve=>setImmediate(resolve));

test('FE-049 S132 actual native Runtime restores only enabled languages without rewriting inactive records',async()=>{
  for(const stored of ['en','am','om','so','ti','aa','../am',null]){
    const state=fixture(stored),mounted=await component('runtime',state);mounted.render();await settle();const app=mounted.render().props.value as App;
    assert.equal(app.locale,parseLocale(stored));assert.deepEqual(state.writes,[],'Restoration never rewrites stored language or Auth');
    mounted.unmount();
  }
});
test('FE-049 S132 actual native Runtime normalizes changes while preserving inquiry state',async()=>{
  const state=fixture('am'),mounted=await component('runtime',state);mounted.render();await settle();let app=mounted.render().props.value as App;
  const selection={businessId:7,items:[{productId:1,name:'Merchant {value1}'}]};app.setBasket(selection);
  for(const requested of ['om','so','ti','en','am'] as Locale[]){app.setLocale(requested);app=mounted.render().props.value as App;assert.equal(app.locale,parseLocale(requested));assert.equal(app.basket,selection);assert.deepEqual(Array.from(state.writes.at(-1)!),['suqpage-language',parseLocale(requested)]);}
  mounted.unmount();
});
test('FE-049 S132 actual web selector offers only active languages and keeps the refresh-only preference flow',async()=>{
  const state=fixture(null),mounted=await component('LanguageSelector',state);let tree=nodes(mounted.render(false));
  const initial=tree.find(node=>node.type==='select')!;assert.equal(initial.props.disabled,true,'Initial SSR/hydration render cannot accept a premature selection');
  assert.equal(mounted.document.cookie,'');assert.equal(state.refreshes,0);
  mounted.commit();tree=nodes(mounted.render());const select=tree.find(node=>node.type==='select')!;
  assert.equal(select.props.disabled,false,'Only the mounted effect commit enables the actual source control');
  assert.deepEqual(tree.filter(node=>node.type==='option').map(node=>node.props.value),[...enabledLocales]);
  for(const requested of ['am','om','so','ti']){
    (select.props.onChange as (event:{target:{value:string}})=>void)({target:{value:requested}});
    assert.equal(mounted.document.cookie,`suqpage-language=${parseLocale(requested)}; Path=/; Max-Age=31536000; SameSite=Lax`);
  }
  assert.equal(state.refreshes,4);assert.deepEqual(state.writes,[]);mounted.unmount();
});

test('FE-049 S132 actual React SSR keeps the language control disabled before any client effect',async()=>{
  const output=await build({entryPoints:['components/LanguageSelector.tsx'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'selector-navigation-context-ports',setup(builder){
    builder.onResolve({filter:/^(next-intl|next\/navigation|lucide-react|@\/lib\/i18n\/ui)$/},args=>({path:args.path,namespace:'ports'}));
    builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:args.path==='next-intl'?`export const useLocale=()=> 'en';`:args.path==='next/navigation'?`export const useRouter=()=>({refresh(){throw Error('SSR cannot refresh');}});`:args.path==='lucide-react'?`export const Languages=()=>null;`:`export const useUiText=()=>source=>source;`}));
  }}]});
  const module={exports:{} as {default:()=>import('react').ReactElement}};
  vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,require:createRequire(import.meta.url)});
  const html=renderToStaticMarkup(createElement(module.exports.default));
  assert.match(html,/<select\b[^>]*disabled=""/,'The installed React server renderer emits a disabled select');
  assert.deepEqual([...html.matchAll(/<option value="([^"]+)"/g)].map(match=>match[1]),[...enabledLocales]);
});

test('FE-049 S132 actual alert dispatch normalizes only presentation and leaves saved preferences untouched',async()=>{
  const output=await build({entryPoints:['lib/attention-delivery.ts'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'attention-database-port',setup(builder){builder.onResolve({filter:/^\.\/postgres-runtime-services$/},()=>({path:'runtime',namespace:'port'}));builder.onLoad({filter:/.*/,namespace:'port'},()=>({loader:'js',contents:'export const postgresRuntimeServices=()=>({runner:fixture.runner});'}));}}]});
  const now=Date.UTC(2026,9,18),preferenceWrites:string[]=[],sent:PushPayload[]=[];
  const row={id:31,kind:'message',source_key:'message:2',created_at:now,read_at:null,recipient_key:'user:7',user_id:7,visitor_conversation_id:null,conversation_id:42,inquiry_id:null,revoked_at:null,expires_at:null,access_role:'client',business_id:11,case_business_id:11,case_status:'open',assistance_category:'technical',subscription_kind:'expo',subscription_json:JSON.stringify({kind:'expo',token:'ExpoPushToken[controlled_fixture_token]'}),language:'so',sound_enabled:false};
  const fixture={runner:{query:async(sql:string)=>{if(/(?:UPDATE|INSERT INTO) attention_preferences/.test(sql))preferenceWrites.push(sql);return{rows:sql.includes('WITH due AS')?[{id:19,notification_id:31,subscription_id:41,attempts:1}]:sql.includes('SELECT n.*')?[row]:[]};}}};
  const module={exports:{} as {dispatchAttention:(options:{now:number;limit:number;send:AttentionPushPort})=>Promise<{accepted:number}>}};
  vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,fixture,require:createRequire(import.meta.url),URL,Buffer,process,setTimeout,clearTimeout,fetch:()=>{throw Error('No provider call allowed');}});
  const send:AttentionPushPort=async(_subscription,payload)=>{sent.push(payload);return{state:'accepted'};};
  for(const language of['so','ti','am','om','en']){
    row.language=language;const result=await module.exports.dispatchAttention({now,limit:1,send});assert.equal(result.accepted,1);assert.equal(row.language,language,'Saved preference remains unchanged');
    const selected=parseLocale(language),messages=selected==='en'?{}:(await import('../lib/i18n/messages/'+selected+'.json',{with:{type:'json'}})).default;
    assert.equal(sent.at(-1)?.body,createUiText(messages)('New chat message'));
  }
  assert.deepEqual(preferenceWrites,[]);
});
