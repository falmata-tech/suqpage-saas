import assert from 'node:assert/strict';
import { test } from 'node:test';
import { descriptionLinks, followLink, planLink, type LinkPorts } from '../apps/mobile/src/link-policy';

test('FE-053 link policy rejects executable, malformed and credential-bearing URLs', () => {
  for(const url of ['javascript:alert(1)','data:text/html,Hi','file:///a','intent://a','tg://resolve?domain=x','whatsapp://send?phone=1','http://example.com','https://u:p@example.com','https://','https://example.com\\@evil.test','https://example.com\nX','tel:','mailto:','tel:%0a123']) assert.throws(()=>planLink(url),url);
  assert.equal(planLink('http://127.0.0.1:3102/privacy','http://127.0.0.1:3102').kind,'website');
  assert.throws(()=>planLink('http://127.0.0.1:54321','http://127.0.0.1:3102'));
  assert.throws(()=>planLink('http://127.0.0.1:3102','https://suqpage.com'));
  for(const url of ['mailto:owner@example.com?subject=Hi','tel:+251911111111','sms:+251911111111?body=First%0ASecond'])assert.equal(planLink(url).url,url);
});
test('FE-053 exact social hosts preserve phone, username and Unicode draft text only',()=>{
 const text='እባክዎ + & tea\nSecond line';
 const wa=planLink('https://wa.me/251911111111?text='+encodeURIComponent(text)+'&redirect=evil');
 const app=new URL(wa.appUrl!);assert.equal(app.protocol,'whatsapp:');assert.equal(app.searchParams.get('phone'),'251911111111');assert.equal(app.searchParams.get('text'),text);assert.equal(app.searchParams.has('redirect'),false);
 const tg=planLink('https://t.me/alhayabrand?text='+encodeURIComponent(text));
 assert.equal(new URL(tg.appUrl!).searchParams.get('domain'),'alhayabrand');assert.equal(new URL(tg.appUrl!).searchParams.get('text'),text);
 const phone=planLink('https://t.me/+447700900123?text='+encodeURIComponent(text));
 assert.equal(new URL(phone.appUrl!).searchParams.get('phone'),'447700900123');assert.equal(new URL(phone.appUrl!).searchParams.get('text'),text);assert.equal(new URL(phone.appUrl!).searchParams.has('domain'),false);
 for(const url of ['https://t.me/+invite_hash','https://t.me/+0123456789','https://t.me/+123','https://t.me/+447700900123?start=campaign','https://t.me/+447700900123/extra','https://t.me:444/+447700900123'])assert.equal(planLink(url).appUrl,undefined,url);
 for(const url of ['https://wa.me.evil.test/251911111111','https://t.me.evil.test/alhayabrand','https://wa.me/invalid','https://t.me/share/url?url=https://example.com','https://t.me/joinchat/abcdef','https://t.me/proxy?server=bad','https://t.me/alhayabrand/123','https://t.me:444/alhayabrand','https://t.me/myhelperbot?start=campaign','https://t.me/auction?slug=123'])assert.equal(planLink(url).appUrl,undefined,url);
});
function ports(native=true,failApp=false,failBrowser=false){
 const calls:string[]=[];
 const value:LinkPorts={native,openHandler:async url=>{calls.push('app:'+url);if(failApp)throw Error('unavailable');},openWebsite:async url=>{calls.push('web:'+url);if(failBrowser)throw Error('provider secret');return {type:'cancel'};}};
 return {calls,value};
}
test('FE-053 website opens browser; installed social app avoids browser; missing app falls back once',async()=>{
 const website=ports();await followLink('https://example.com/store',website.value);assert.deepEqual(website.calls,['web:https://example.com/store']);
 const app=ports();await followLink('https://wa.me/251911111111',app.value);assert.equal(app.calls.length,1);assert.match(app.calls[0],/^app:whatsapp:/);
 const fallback=ports(true,true);await followLink('https://t.me/alhayabrand',fallback.value);assert.equal(fallback.calls.length,2);assert.equal(fallback.calls[1],'web:https://t.me/alhayabrand');
 const web=ports(false);await followLink('https://wa.me/251911111111',web.value);assert.deepEqual(web.calls,['web:https://wa.me/251911111111']);
});
test('FE-053 failure is bounded, sanitized, retryable and never reported as delivery',async()=>{
 const broken=ports(true,true,true);await assert.rejects(()=>followLink('https://t.me/alhayabrand',broken.value),/^Error: Could not open link$/);assert.equal(broken.calls.length,2);
 const invalid=ports();await assert.rejects(()=>followLink('javascript:alert(1)',invalid.value));assert.deepEqual(invalid.calls,[]);
 const cancelled=ports();assert.equal(await followLink('https://example.com',cancelled.value),undefined);
 const phone=ports(true,true);await assert.rejects(()=>followLink('tel:+251911111111',phone.value));assert.equal(phone.calls.length,1);
});
test('FE-053 merchant description links preserve literal text and keep unsafe content inert',()=>{
 const text='See (https://example.com/style(red)), www.example.com/shop. አበበ\nhttps://example.com/?q=a&b=2';
 const parts=descriptionLinks(text);assert.equal(parts.map(p=>p.text).join(''),text);assert.equal(parts.filter(p=>p.url).length,3);assert.equal(parts.find(p=>p.url)?.url,'https://example.com/style(red)');
 for(const raw of ['javascript:https://evil.test','https://name:password@example.com','http://insecure.test','<script>alert(1)</script>','No URL here']){const parsed=descriptionLinks(raw);assert.equal(parsed.map(p=>p.text).join(''),raw);assert.equal(parsed.some(p=>p.url),false);}
 assert.deepEqual(descriptionLinks(''),[]);
});

test('FE-053 actual Expo adapter uses an in-app native browser and isolated web window', async()=>{
 const { build } = await import('esbuild');
 const vm = await import('node:vm');
 for(const platform of ['android','ios','web']) {
  const result=await build({entryPoints:['apps/mobile/src/open-link.ts'],bundle:true,platform:'node',format:'cjs',write:false,define:{'process.env.EXPO_PUBLIC_API_ORIGIN':'"https://suqpage.com"'},plugins:[{name:'controlled-native-ports',setup(b){
   b.onResolve({filter:/^(react-native|expo-web-browser)$/},args=>({path:args.path,namespace:'fixture'}));
   b.onLoad({filter:/.*/,namespace:'fixture'},args=>({loader:'js',contents:args.path==='react-native'
    ? `export const Platform={OS:${JSON.stringify(platform)}};export const Linking={openURL:async url=>globalThis.calls.push({kind:'handler',url})};`
    : `export async function openBrowserAsync(url,options){globalThis.calls.push({kind:'browser',url,options});return {type:'dismiss'};}`}));
  }}]});
  const calls:Array<{kind:string;url:string;options?:Record<string,unknown>}>=[];
  const mod={exports:{} as {openLink:(url:string)=>Promise<void>}};
  vm.runInNewContext(result.outputFiles[0].text,{module:mod,exports:mod.exports,URL,URLSearchParams,calls});
  await mod.exports.openLink('https://example.org');
  assert.equal(calls[0].kind,'browser');assert.equal(calls[0].options?.dismissButtonStyle,'close');assert.equal(calls[0].options?.createTask,false);assert.equal(calls[0].options?.showInRecents,false);assert.deepEqual(JSON.parse(JSON.stringify(calls[0].options?.windowFeatures)),{noopener:true,noreferrer:true});
  calls.length=0;await mod.exports.openLink('https://wa.me/251911111111');assert.equal(calls[0].kind,platform==='web'?'browser':'handler');
 }
});

test('FE-070 native legal links follow the validated AfricMade, local or staging origin',async()=>{
 const {build}=await import('esbuild'),vm=await import('node:vm');
 for(const [raw,expected] of [[undefined,'https://mirtpage.com'],['http://127.0.0.1:3102','http://127.0.0.1:3102'],['https://preview.mirtpage.com','https://preview.mirtpage.com']] as const){
  const calls:string[]=[];
  const result=await build({entryPoints:['apps/mobile/app/(tabs)/about.tsx'],bundle:true,platform:'node',format:'cjs',write:false,define:{'process.env.EXPO_PUBLIC_API_ORIGIN':raw===undefined?'undefined':JSON.stringify(raw)},plugins:[{name:'about-native-ports',setup(b){
   b.onResolve({filter:/^(react(?:\/jsx-runtime)?|react-native|expo-router)$|(?:^|\/)(?:ui|runtime|incoming-link)$/},args=>({path:args.path,namespace:'ports'}));
   b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:args.path==='react'?`export const useRef=initial=>({current:initial}),useState=initial=>[initial,()=>{}];export default {};`
    :args.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
    :args.path==='react-native'?`export const View='View',Text='Text',Pressable='Pressable',ScrollView='ScrollView',StyleSheet={create:value=>value},Platform={OS:'android'};`
    :args.path==='expo-router'?`export const router={navigate:()=>{}};`
    :args.path.endsWith('/runtime')?`export const useApp=()=>({t:value=>value});`
    :args.path.endsWith('/incoming-link')?`export const createMarketNavigationIntent=()=>1;`
    :`export const Screen='Screen',Button='Button',Icon='Icon',colors={brand:'#c43a00',ink:'#202428',muted:'#63737a',line:'#dbe2e3',soft:'#fff1e9'},useOpenLink=()=>async url=>calls.push(url);`}));
  }}]});
  const module={exports:{} as {default:()=>{type:string;props:{children?:unknown}}}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,calls,URL,URLSearchParams});
  const nodes:(node:unknown)=>Array<{type:string;props:Record<string,unknown>}>=node=>node&&typeof node==='object'&&'props'in node?
   [node as {type:string;props:Record<string,unknown>},...[((node as {props:{children?:unknown}}).props.children)].flat(Infinity).flatMap(nodes)]:[];
  const buttons=nodes(module.exports.default()).filter(node=>node.type==='Button');
  for(const [label,path] of [['Privacy','privacy'],['Terms','terms']] as const){
   const button=buttons.find(node=>node.props.label===label);assert.ok(button,`${label} button exists`);
   (button.props.onPress as ()=>void)();assert.equal(calls.at(-1),`${expected}/${path}`);
  }
 }
 for(const raw of ['javascript:alert(1)','https://user:pass@mirtpage.com','https://mirtpage.com/private','http://evil.test']){
  const result=await build({entryPoints:['apps/mobile/src/public-origin.ts'],bundle:true,platform:'node',format:'cjs',write:false,define:{'process.env.EXPO_PUBLIC_API_ORIGIN':JSON.stringify(raw)}});
  const module={exports:{}};assert.throws(()=>vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,URL}),/Use (?:HTTPS|an API origin)/,raw);
 }
});

test('FE-070 native social-video WebView uses the same qualified referrer without opening arbitrary destinations',async()=>{
 const {build}=await import('esbuild'),vm=await import('node:vm');
 const id='6718335390845095173';
 for(const [raw,expected] of [[undefined,'https://mirtpage.com'],['http://127.0.0.1:3102','http://127.0.0.1:3102'],['https://preview.mirtpage.com','https://preview.mirtpage.com']] as const){
  const result=await build({entryPoints:['apps/mobile/src/SocialVideoFrame.tsx'],bundle:true,platform:'node',format:'cjs',write:false,define:{'process.env.EXPO_PUBLIC_API_ORIGIN':raw===undefined?'undefined':JSON.stringify(raw)},plugins:[{name:'video-native-ports',setup(b){
   b.onResolve({filter:/^(react(?:\/jsx-runtime)?|react-native|react-native-webview)$/},args=>({path:args.path,namespace:'ports'}));
   b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:args.path==='react'?`export const useMemo=fn=>fn();export default {};`
    :args.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx;`
    :args.path==='react-native'?`export const View='View';`
    :`export const WebView='WebView';`}));
  }}]});
  const module={exports:{} as {default:(props:{id:string;height:number;onEvent:()=>void})=>{props:{children:{props:Record<string,unknown>}}}}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,URL,URLSearchParams});
  const webView=module.exports.default({id,height:260,onEvent:()=>{}}).props.children.props;
  const source=webView.source as {baseUrl:string;html:string};
  assert.equal(source.baseUrl,`${expected}/`);
  assert.ok(source.html.includes(`"origin":"${expected}"`),'Embedded parent/referrer is the configured AfricMade origin');
  const permits=webView.onShouldStartLoadWithRequest as (request:{url:string})=>boolean;
  assert.equal(permits({url:`${expected}/`}),true);
  assert.equal(permits({url:`https://www.tiktok.com/player/v1/${id}`}),true);
  for(const url of [`${expected}/account`,`https://suqpage.com/`,`https://evil.test/`,`tiktok://video/${id}`])assert.equal(permits({url}),false,url);
  assert.equal(webView.sharedCookiesEnabled,false);assert.equal(webView.thirdPartyCookiesEnabled,false);
 }
});
