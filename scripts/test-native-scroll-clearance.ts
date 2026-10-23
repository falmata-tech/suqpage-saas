import assert from 'node:assert/strict';
import {test} from 'node:test';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';

// Actual Screen, inset context and public route scroll containers. Native DOM,
// resource content and route/data ports are controlled; device proof is separate.
test('FE-053/FE-041 measured public dock clearance pads content without shrinking default or custom scroll viewports',async()=>{
 const require=createRequire(path.resolve('apps/mobile/package.json'));
 const code=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React from'react';import{createRoot}from'react-dom/client';import{PublicScrollInsetProvider}from'./apps/mobile/src/public-scroll-inset';import{Screen}from'./apps/mobile/src/ui';import Featured from'./apps/mobile/app/(tabs)/featured';import About from'./apps/mobile/app/(tabs)/about';import Shop from'./apps/mobile/app/shop/[handle]';
 const root=createRoot(document.getElementById('root'));window.qa={render:(route,inset)=>root.render(<PublicScrollInsetProvider value={inset}><div style={{height:'100dvh',display:'flex',flexDirection:'column'}}><header style={{height:52,flexShrink:0}}>Header</header><div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column'}}>{route==='featured'?<Featured/>:route==='about'?<About/>:route==='shop'?<Shop/>:<Screen><div style={{height:1400,flexShrink:0}}>Long content</div><button data-last-content style={{minHeight:48}}>Last action</button></Screen>}</div><nav style={{height:60,flexShrink:0}}>Navigation</nav>{inset>0&&<aside style={{position:'absolute',right:12,bottom:72,width:200,height:inset-24,background:'#c43a00'}}/>}</div></PublicScrollInsetProvider>)};
 `},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.EXPO_PUBLIC_API_ORIGIN':'"http://127.0.0.1:3102"'},loader:{'.png':'dataurl'},plugins:[{name:'public-scroll-native-ports',setup(b){
  b.onResolve({filter:/^(react(?:\/.*)?|react-dom(?:\/.*)?)$/},a=>({path:require.resolve(a.path)}));
  b.onResolve({filter:/^(react-native|react-native-svg|expo-router|expo-file-system|expo-crypto)$/},a=>({path:a.path,namespace:'port'}));
  b.onResolve({filter:/(?:^|\/)(runtime|ResourceLoading|SponsorCarousel|blocked-businesses|open-link|CatalogSafety|ShowroomContent|LoadingBar|chrome)$/},a=>({path:a.path.split('/').at(-1)!,namespace:'port'}));
  b.onLoad({filter:/.*/,namespace:'port'},a=>({loader:'jsx',resolveDir:process.cwd(),contents:
   a.path==='react-native'?`import React,{forwardRef,useRef,useImperativeHandle}from'react';const style=x=>Object.assign({},...[x].flat(Infinity).filter(Boolean));export const View=forwardRef(({children,style:s,...props},ref)=><div ref={ref} style={{display:'flex',flexDirection:'column',flexShrink:0,minHeight:0,minWidth:0,...style(s)}}>{children}</div>),KeyboardAvoidingView=View,Text=({children,style:s})=><span style={style(s)}>{children}</span>,Pressable=({children,style:s,accessibilityLabel,onPress})=><button aria-label={accessibilityLabel} onClick={onPress} style={style(typeof s==='function'?s({pressed:false}):s)}>{children}</button>,ScrollView=forwardRef(({children,contentContainerStyle,horizontal},ref)=>{const node=useRef(null);useImperativeHandle(ref,()=>({scrollTo:({y=0})=>node.current.scrollTop=y}));return <div ref={node} data-scroll-view style={{flex:1,minHeight:0,overflowY:'auto'}}><div data-scroll-content style={{display:'flex',flexDirection:'column',...style(contentContainerStyle)}}>{children}</div></div>}),Image=()=>null,TextInput=()=>null,ActivityIndicator=()=>null,StyleSheet={create:x=>x},Platform={OS:'web'},Alert={alert(){}},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`
   :a.path==='runtime'?`export const useApp=()=>({t:s=>s,locale:'en'}),useLoad=()=>({data:null,loading:true,error:'',reload(){}}),request=async()=>{throw Error('Unexpected network');},API='http://127.0.0.1:3102',auth=null,mediaUrl=()=>'';`
   :a.path==='expo-router'?`export const useLocalSearchParams=()=>({handle:'fixture-shop'}),useFocusEffect=()=>{},router={navigate(){throw Error('Unexpected navigation');},push(){throw Error('Unexpected navigation');}};`
   :a.path==='expo-file-system'?`export class File{};export const Paths={};`
   :a.path==='expo-crypto'?`export const randomUUID=()=> 'fixture';`
   :a.path==='react-native-svg'?`export default()=>null;export const Path=()=>null,SvgUri=()=>null;`
   :a.path==='ResourceLoading'?`import React from'react';export default()=> <><div style={{height:1400,flexShrink:0}}>Controlled resource content</div><button data-last-content style={{minHeight:48}}>Last action</button></>;`
   :a.path==='blocked-businesses'?`export const useBlockedBusinesses=()=>({ready:true,list:[]});`
   :a.path==='open-link'?`export const openLink=async()=>{throw Error('Unexpected external link');};`
   :a.path==='CatalogSafety'?`export const CatalogSafety=({children})=>children;`
   :a.path==='ShowroomContent'?`export const ShowroomContent=()=>null;`
   :a.path==='SponsorCarousel'?`export const SponsorCarousel=()=>null;`
   :a.path==='chrome'?`export const CategoryArt=()=>null;`
   :`export default()=>null;`
  }));
 }}]});
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{await page.setContent('<style>html,body{margin:0}*{box-sizing:border-box}button{flex-shrink:0}</style><div id="root"></div>');await page.addScriptTag({content:code.outputFiles[0].text});assert.deepEqual(errors,[],'Controlled module initialization must succeed before geometry');
  for(const route of['default','featured','about','shop'])for(const inset of[0,99,155])for(const viewport of[{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.evaluate(({route,inset})=>(window as unknown as{qa:{render:(route:string,inset:number)=>void}}).qa.render(route,inset),{route,inset});const scroll=page.locator('[data-scroll-view]').first();await expect(scroll).toBeVisible();
   const box=await scroll.boundingBox();assert.ok(box);assert.equal(box.y,52);assert.equal(box.y+box.height,viewport.height-60,'Dock inset must not remove viewport space');const content=scroll.locator(':scope > [data-scroll-content]');assert.ok(Number(await content.evaluate(n=>parseFloat(getComputedStyle(n).paddingBottom)))>=inset);
   await scroll.evaluate(n=>n.scrollTop=n.scrollHeight);const last=route==='about'?page.getByRole('button',{name:'Terms',exact:true}):page.locator('[data-last-content]');await expect(last).toBeVisible();const target=await last.boundingBox();assert.ok(target);assert.ok(target.y+target.height<=viewport.height-60-inset+1,'Final action can scroll fully above measured dock');
  }assert.deepEqual(errors,[]);
 }finally{await page.close();await browser.close();}
});
