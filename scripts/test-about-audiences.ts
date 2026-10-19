import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium,type Page} from 'playwright';
import {createUiText,type UiMessages} from '../lib/i18n/core';
import {ABOUT_STOREFRONT_SECTIONS} from '../lib/storefront-copy';

const require=createRequire(process.cwd()+'/package.json'),nativeRequire=createRequire(process.cwd()+'/apps/mobile/package.json');
type Dimensions={width:number;height:number;fontScale:number};
type Fixture={dimensions:Dimensions;messages:UiMessages;locale:string;routes:string[]};
type QA={mount:(kind:'about'|'market')=>void;unmount:()=>void};
// Actual About/Market components, actual React+RNWeb layout and authored locale
// catalogs. API/map/dock/global chrome are ports; Text scaling models OS font
// scale explicitly. No device, basemap, backend or live-navigation proof.
async function bundle(native:boolean){
 const resolver=native?nativeRequire:require;
 const contents=`import React from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';import About from '${native?'./apps/mobile/app/(tabs)/about':'./components/AboutAudience'}';${native?`import Market from'./apps/mobile/app/(tabs)/index';`:''}
  const root=createRoot(document.getElementById('root'));window.qa={mount:kind=>flushSync(()=>root.render(${native?`kind==='market'?<Market/>:`:''}<About/>)),unmount:()=>flushSync(()=>root.render(null))};`;
 return build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents},bundle:true,write:false,outfile:'about.js',platform:'browser',format:'iife',jsx:'automatic',define:native?{global:'globalThis','process.env.EXPO_PUBLIC_API_ORIGIN':'"https://mirtpage.com"'}:undefined,loader:{'.module.css':'local-css'},plugins:[{name:'about-audience-host-ports',setup(b){
  b.onResolve({filter:/^(?:react(?:\/jsx(?:-dev)?-runtime)?|react-dom(?:\/client)?)$/},a=>({path:resolver.resolve(a.path)}));
  b.onResolve({filter:/^(?:react-native|react-native-safe-area-context|expo-router|next\/link|@\/lib\/i18n\/ui)$/},a=>({path:a.path,namespace:'ports'}));
  if(native)b.onResolve({filter:/(?:^|\/)(runtime|ui|chrome|blocked-businesses|MarketMap|MapGroupPicker|use-market-feed|PublicActionDock|MarketSearchControls)$/},a=>({path:a.path.split('/').at(-1)!,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'tsx',resolveDir:process.cwd(),contents:
   a.path==='react-native'?`import React from'react';import *as N from ${JSON.stringify(require.resolve('react-native-web'))};export *from ${JSON.stringify(require.resolve('react-native-web'))};export const useWindowDimensions=()=>window.fixture.dimensions;export const Text=React.forwardRef(function Text({style,...props},ref){const value=N.StyleSheet.flatten(style)||{},scale=window.fixture.dimensions.fontScale;return <N.Text {...props} ref={ref} style={[style,{...(typeof value.fontSize==='number'?{fontSize:value.fontSize*scale}:{}),...(typeof value.lineHeight==='number'?{lineHeight:value.lineHeight*scale}:{})}]}/>;});`
   :a.path==='react-native-safe-area-context'?`export const useSafeAreaInsets=()=>({top:0,bottom:0,left:0,right:0});`
   :a.path==='expo-router'?`import{useEffect}from'react';const params={};export const useLocalSearchParams=()=>params,useIsFocused=()=>true,useFocusEffect=create=>useEffect(create,[create]),router={push:value=>window.fixture.routes.push(value),navigate:value=>window.fixture.routes.push(value)};`
   :a.path==='next/link'?`import React from'react';export default({href,children,...props})=><a {...props} href={href} onClick={event=>{event.preventDefault();window.fixture.routes.push(href);}}>{children}</a>;`
   :a.path==='@/lib/i18n/ui'?`import{createUiText}from'./lib/i18n/core';export const useUiText=()=>createUiText(window.fixture.messages);`
   :a.path==='runtime'?`import{createUiText}from'./lib/i18n/core';export const API='https://fixture.invalid',useApp=()=>({t:createUiText(window.fixture.messages),locale:window.fixture.locale}),request=async()=>{throw Error('Unexpected API request');};`
   :a.path==='ui'?`import React from'react';import{View,Text,Pressable}from'react-native';export const colors={ink:'#222',muted:'#666',line:'#ddd',brand:'#c43a00',soft:'#fff1e9'};export const Screen=({children})=><View style={{flex:1,minHeight:0}}>{children}</View>,Copy=Text,Photo=()=>null,Status=()=>null,Field=()=>null,Icon=({size=16})=><View style={{width:size,height:size}}/>,Button=({label,onPress})=><Pressable accessibilityRole='button' style={{minHeight:48,justifyContent:'center'}} onPress={onPress}><Text>{label}</Text></Pressable>,useOpenLink=()=>async url=>window.fixture.routes.push(url);`
   :a.path==='chrome'?`import React from'react';import{View,Pressable}from'react-native';export const Sheet=()=>null,IconButton=({label,touchSize,onPress})=><Pressable accessibilityRole='button' accessibilityLabel={label} style={{width:touchSize,height:touchSize}} onPress={onPress}><View/></Pressable>;`
   :a.path==='blocked-businesses'?`const list=[];export const useBlockedBusinesses=()=>({ready:true,list});`
   :a.path==='use-market-feed'?`const feed={batch:{data:{showrooms:[],nearbyGroups:[],items:[],total:0,categories:[],places:[],countries:[]},items:[]},loading:false,error:'',hasMore:false,loadingMore:false,moreError:'',retry(){},loadMore(){}};export const useMarketFeed=()=>feed;`
   :a.path==='MarketMap'?`import React from'react';import{View}from'react-native';export default React.forwardRef(({height},ref)=><View style={{height}}/>);`
   :a.path==='MarketSearchControls'?`import React from'react';import{View}from'react-native';export default()=> <View style={{height:96}}/>;`
   :`export default()=>null;`
  }));
 }}]});
}

async function mount(page:Page,kind:'about'|'market'){await page.evaluate(kind=>(window as unknown as{qa:QA}).qa.mount(kind),kind);}
async function assertAbout(page:Page,fixture:Fixture,native:boolean){
 const t=createUiText(fixture.messages),customers=page.getByRole('tab',{name:t('For customers'),exact:true}),businesses=page.getByRole('tab',{name:t('For businesses'),exact:true});
 await customers.waitFor();assert.equal(await page.getByRole('tab').count(),2);assert.equal(await customers.getAttribute('aria-selected'),'true');
 const customerTitle=page.getByRole('heading',{name:t(ABOUT_STOREFRONT_SECTIONS[0].title),exact:true}),businessTitle=page.getByRole('heading',{name:t(ABOUT_STOREFRONT_SECTIONS[1].title),exact:true});
 assert.equal(await customerTitle.isVisible(),true);assert.equal(await businessTitle.isVisible(),false);
 await customers.focus();await customers.press('ArrowRight');await page.getByRole('tab',{name:t('For businesses'),exact:true,selected:true}).waitFor();assert.equal(await businesses.evaluate(element=>document.activeElement===element),true);assert.equal(await businessTitle.isVisible(),true);assert.equal(await customerTitle.isVisible(),false);
 const businessAction=page.getByRole(native?'button':'link',{name:t(ABOUT_STOREFRONT_SECTIONS[1].action),exact:native});await businessAction.click();assert.equal((await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.routes)).at(-1),native?'/account':'/login');
 await businesses.press('Home');await page.getByRole('tab',{name:t('For customers'),exact:true,selected:true}).waitFor();await customers.press('End');await page.getByRole('tab',{name:t('For businesses'),exact:true,selected:true}).waitFor();await businesses.press('ArrowRight');await page.getByRole('tab',{name:t('For customers'),exact:true,selected:true}).waitFor();
 const geometry=await page.getByRole('tablist').evaluate(root=>{const r=root.getBoundingClientRect();return{left:r.left,right:r.right,controls:[...root.querySelectorAll('[role="tab"]')].map(element=>{const box=element.getBoundingClientRect();return{width:box.width,height:box.height,scroll:element.scrollWidth,client:element.clientWidth};})};});
 assert.ok(geometry.left>=0&&geometry.right<=fixture.dimensions.width+1,JSON.stringify(geometry));for(const control of geometry.controls)assert.ok(control.width>=48&&control.height>=48&&control.scroll<=control.client+1,JSON.stringify({fixture,geometry}));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'About has no horizontal overflow');
}

test('FE-052/065 S143 actual About tabs and RNWeb Market row stay compact, localized and keyboard accessible',{timeout:180000},async()=>{
 const [web,native]=await Promise.all([bundle(false),bundle(true)]),browser=await chromium.launch({channel:process.env.SUQPAGE_BROWSER_CHANNEL||undefined,headless:true,timeout:20000});
 try{for(const isNative of[false,true])for(const locale of['en','am','om'])for(const dimensions of[{width:320,height:480,fontScale:1},...(locale==='en'?[{width:isNative?844:1440,height:isNative?390:900,fontScale:1},{width:320,height:568,fontScale:2}]:[])]){
  const compiled=isNative?native:web,page=await browser.newPage({viewport:{width:dimensions.width,height:dimensions.height}}),errors:string[]=[];page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  try{
   await page.route('**/*',route=>route.request().url()==='http://localhost:41843/'?route.fulfill({contentType:'text/html',body:'<!doctype html><style>html,body,#root{margin:0;width:100%;height:100%}#root{display:flex;flex-direction:column}*{box-sizing:border-box}</style><div id="root"></div>'}):route.abort('blockedbyclient'));
   await page.goto('http://localhost:41843/');const fixture:Fixture={dimensions,locale,messages:locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')) as UiMessages,routes:[]};
   await page.evaluate(value=>{(window as unknown as{fixture:Fixture}).fixture=value;},fixture);
   const css=compiled.outputFiles.find(file=>file.path.endsWith('.css'));if(css)await page.addStyleTag({content:css.text});if(!isNative&&dimensions.fontScale>1)await page.addStyleTag({content:'html{font-size:24px}'});
   await page.addScriptTag({content:compiled.outputFiles.find(file=>file.path.endsWith('.js'))!.text});
   if(isNative){await mount(page,'market');const row=page.getByTestId('market-mode-row');await row.waitFor();const geometry=await row.evaluate(root=>{const r=root.getBoundingClientRect(),list=root.querySelector('[role="tablist"]')!,l=list.getBoundingClientRect();return{height:r.height,left:r.left,right:r.right,center:r.left+r.width/2,tabsCenter:l.left+l.width/2,width:l.width,buttons:[...root.querySelectorAll('[role="tab"]')].map(element=>{const b=element.getBoundingClientRect();return{width:b.width,height:b.height,scroll:element.scrollWidth,client:element.clientWidth};})};});
    const context=JSON.stringify({dimensions,locale,geometry});assert.equal(geometry.buttons.length,2);assert.ok(Math.abs(geometry.center-geometry.tabsCenter)<=1,context);if(dimensions.fontScale===1)assert.ok(geometry.height<=52,context);for(const button of geometry.buttons)assert.ok(button.width>=48&&button.height>=48&&button.scroll<=button.client+1,context);assert.equal(await page.getByRole('button',{name:createUiText(fixture.messages)('About MirtPage'),exact:true}).count(),0);assert.equal(await page.getByRole('dialog',{name:createUiText(fixture.messages)('About MirtPage'),exact:true}).count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),context);
   }
   await mount(page,'about');try{await assertAbout(page,fixture,isNative);}catch(error){fs.writeFileSync('.local/market-about-s143/focused/about-failure-'+Date.now()+'.json',JSON.stringify({isNative,locale,dimensions,errors,html:await page.locator('body').innerHTML(),geometry:await page.locator('[role="tab"],a').evaluateAll(elements=>elements.map(element=>{const box=element.getBoundingClientRect(),style=getComputedStyle(element);return{text:element.textContent,x:box.x,y:box.y,width:box.width,height:box.height,display:style.display,visibility:style.visibility};}))},null,2));throw error;}await page.evaluate(()=>(window as unknown as{qa:QA}).qa.unmount());assert.deepEqual(errors,[]);console.log('S143 fixture passed '+JSON.stringify({isNative,locale,dimensions}));
  }finally{await page.close();}
 }}finally{await browser.close();}
});
