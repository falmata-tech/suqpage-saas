import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {mapGroupCapacity,mapGroupPickerLayout} from '../lib/map/map-clustering';
import type {MapShop,Shop} from '@suqpage/contracts';

// Actual MapGroupPicker/ShowroomContent and installed RNWeb/React renderer.
// Device dimensions/insets, translation, photos, inquiry store and router are
// explicit ports; scale2 also scales Text typography through the device port.
// No app/API/database/persistence/physical Android or network workflow claim.
type PreviewFixture={dimensions:{width:number;height:number;fontScale:number};shops:MapShop[];shop:Shop;messages:Record<string,string>;preview?:boolean;containerPadding?:number;initialAnchor?:number;selectedId?:number;closeCalls?:number};
const root=process.cwd(),nativeWeb=path.join(root,'node_modules/react-native-web/dist/index.js');
const bundle=build({stdin:{resolveDir:root,loader:'tsx',contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';
 import Picker from './apps/mobile/src/MapGroupPicker';import {ShowroomContent} from './apps/mobile/src/ShowroomContent';
 const root=createRoot(document.getElementById('root'));let key=0;
 window.renderPreview=(kind)=>{const f=window.previewFixture;root.render(kind==='group'?<Picker key={++key} visible shops={f.shops} initialAnchor={f.initialAnchor??null} onSelect={shop=>{f.selectedId=shop.id;}} onClose={()=>{f.closeCalls=(f.closeCalls||0)+1;}}/>:<div style={{boxSizing:'border-box',width:'100%',padding:f.containerPadding||0}}><ShowroomContent key={++key} shop={f.shop} preview={f.preview}/></div>);};
`},bundle:true,write:false,format:'iife',outfile:'native-preview.js',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'native-preview-device-ports',setup(b){
 // The standalone renderer and mobile source otherwise resolve two installed
 // React copies; bind their actual SDK boundary to one renderer instance.
 b.onResolve({filter:/^(?:react|react\/jsx-runtime|react\/jsx-dev-runtime|react-dom|react-dom\/client)$/},a=>({path:path.join(root,'node_modules',a.path==='react'?'react/index.js':a.path==='react-dom'?'react-dom/index.js':a.path+'.js')}));
 b.onResolve({filter:/^(?:react-native|react-native-safe-area-context|expo-router|expo-clipboard|\.\/(?:runtime|ui|chrome|Gallery|YouTubeVideo|use-business-inquiry|overlay-visibility))$/},a=>({path:a.path,namespace:'preview-port'}));
 b.onLoad({filter:/.*/,namespace:'preview-port'},a=>({loader:'tsx',resolveDir:root,contents:
 a.path==='react-native'?`import React from 'react';import * as N from ${JSON.stringify(nativeWeb)};export const {View,Pressable,ScrollView,Modal,TextInput,Platform,StyleSheet}=N;export const useWindowDimensions=()=>window.previewFixture.dimensions;export function Text({style,...props}){const value=N.StyleSheet.flatten(style)||{},scale=window.previewFixture.dimensions.fontScale;return <N.Text {...props} style={[style,{...(value.fontSize?{fontSize:value.fontSize*scale}:{}),...(value.lineHeight?{lineHeight:value.lineHeight*scale}:{})}]}/>;}`
 :a.path==='react-native-safe-area-context'?`export const useSafeAreaInsets=()=>({top:24,bottom:20,left:0,right:0});`
 :a.path==='expo-router'?`export const router={push(){throw Error('Unexpected route in a layout-only test');}};`
 :a.path==='expo-clipboard'?`export const setStringAsync=async()=>{throw Error('Unexpected clipboard');};`
 :a.path==='./runtime'?`import {createUiText} from './lib/i18n/core';export const API='http://fixture.invalid',useApp=()=>({t:createUiText(window.previewFixture.messages)});`
 :a.path==='./ui'?`import React from 'react';import {View,Text,Pressable} from 'react-native';export const colors={ink:'#222',muted:'#666',line:'#ddd',brand:'#c43a00',soft:'#fff1e9'};export const Photo=({height})=><View style={{height,width:'100%'}}/>;export const Icon=()=>null;export const LinkedText=Text;export const Chip=()=>null;export const Status=()=>null;export const Button=({label,onPress})=><Pressable onPress={onPress}><Text>{label}</Text></Pressable>;export const useOpenLink=()=>async()=>{throw Error('Unexpected external link');};`
 :a.path==='./use-business-inquiry'?`export const useBusinessInquiry=()=>({ready:true,error:'',items:[],retry(){},setItems(){throw Error('Unexpected inquiry mutation');}});`
 :a.path==='./overlay-visibility'?`export const registerOverlay=()=>()=>{};`
 :a.path==='./chrome'?`export const Sheet=()=>null;`
 :`export default ()=>null;`
 }));
}}]});
const merchantName='Hojii harkaa fi meeshaalee manaaf · የእጅ ሥራ';
const description='Literal merchant description: furniture, finishes and styles. '.repeat(4);
const shop=(id:number):MapShop=>({id,handle:'fixture-'+id,name:merchantName+' '+id,description,city:'Finfinnee · Addis Ababa',region:'',heroImagePath:'',latitude:9.03,longitude:38.75,locationMode:'storefront'});
const showroom:Shop={id:1,handle:'fixture',name:'Fixture showroom',about:'',cover:'',videoUrl:'',contacts:{},version:1,status:'active',isDemo:false,accentColor:'#176b45',categories:[{id:11,name:merchantName.repeat(2)},{id:12,name:'Clay collection'}],products:[1,2].map(id=>({id,name:'Product '+id,description,kind:'standard_product',availability:'available',published:true,priceMinor:null,media:[],options:[],quantityMode:'optional',categoryId:id===1?11:12,categoryName:'UNTRUSTED'}))};

test('FE-065/041 S130/S131/S181 installed RNWeb retains all-fit rows, a bounded two-card fallback and wrapping48px category controls',{timeout:60000},async()=>{
 const javascript=(await bundle).outputFiles[0].text,browser=await chromium.launch({headless:true});
 try{
  for(const dimensions of[{width:390,height:844,fontScale:1},{width:320,height:480,fontScale:1},{width:844,height:390,fontScale:1},{width:320,height:480,fontScale:2},{width:320,height:364,fontScale:2}]){
   const page=await browser.newPage({viewport:{width:dimensions.width,height:dimensions.height}}),errors:string[]=[];page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
   const availableWidth=Math.min(700,dimensions.width-24),availableHeight=dimensions.height-68,capacity=mapGroupCapacity(availableWidth,availableHeight,dimensions.fontScale),layout=mapGroupPickerLayout(availableWidth,availableHeight,dimensions.fontScale,capacity),fixture:PreviewFixture={dimensions,shops:Array.from({length:capacity},(_,i)=>shop(i+1)),shop:showroom,messages:{}};
   await page.setContent('<style>html,body,#root{margin:0;width:100%;height:100%}</style><div id="root"></div>');await page.evaluate(value=>{(window as unknown as{previewFixture:PreviewFixture}).previewFixture=value;},fixture);await page.addScriptTag({content:javascript});await page.evaluate(()=>{(window as unknown as{renderPreview:(kind:string)=>void}).renderPreview('group');});
   const picker=page.getByTestId('map-group-picker');try{await picker.waitFor();}catch(error){throw new Error(JSON.stringify({dimensions,capacity,errors,body:await page.locator('body').innerHTML()}),{cause:error});}const rows=page.locator('[data-testid^="map-group-business-"]');assert.equal(await rows.count(),capacity);
   const geometry=await picker.evaluate(element=>{const picker=element.getBoundingClientRect();return{picker:{top:picker.top,bottom:picker.bottom,left:picker.left,right:picker.right},rows:Array.from(element.querySelectorAll('[data-testid^="map-group-business-"]')).map(card=>{const box=card.getBoundingClientRect();return{height:box.height,top:box.top,bottom:box.bottom,scroll:card.scrollHeight,client:card.clientHeight,children:Array.from(card.querySelectorAll('[data-testid^="map-group-description-"],[data-testid^="map-group-location-"]')).map(text=>{const r=text.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,clamp:getComputedStyle(text).webkitLineClamp};})};})};});
   const context=JSON.stringify({dimensions,capacity,layout,geometry});assert.ok(geometry.picker.top>=24&&geometry.picker.bottom<=dimensions.height-20,context);assert.ok(geometry.picker.left>=12&&geometry.picker.right<=dimensions.width-12,context);
   for(const row of geometry.rows){assert.ok(row.height>=48,context);if(!layout.needsScroll)assert.ok(row.top>=geometry.picker.top&&row.bottom<=geometry.picker.bottom,'Normal groups still show every row together '+context);assert.ok(row.scroll<=row.client+1,'No card text overflow '+context);assert.ok(row.children.every(text=>text.top>=row.top&&text.bottom<=row.bottom),'Visible description/location remain inside the row '+context);}
   const scroll=page.getByTestId('map-group-scroll');assert.equal(await scroll.count(),layout.needsScroll?1:0,'Only the bounded fallback adds a scroll body '+context);
   if(layout.needsScroll){
    assert.equal(capacity,2,context);const bounds=await scroll.boundingBox();assert.ok(bounds&&bounds.height>=48&&bounds.height<=availableHeight-layout.chromeHeight+1&&bounds.y>=geometry.picker.top&&bounds.y+bounds.height<=geometry.picker.bottom,context);
    const scrollRegions=await scroll.evaluate(element=>[element,...element.querySelectorAll('*')].filter(node=>{const style=getComputedStyle(node);return ['auto','scroll'].includes(style.overflowY)&&node.scrollHeight>node.clientHeight+1;}).length);assert.equal(scrollRegions,1,'The fallback has exactly one scrolling region '+context);
   }
   for(let i=1;i<=capacity;i++){
    const row=rows.nth(i-1);await row.getByTestId('map-group-location-'+i).waitFor();const label=await row.getAttribute('aria-label');assert.ok(label?.includes(description.trim()));assert.ok(label?.includes(fixture.shops[i-1].name),'The complete merchant name remains accessible');
    if(layout.needsScroll){await row.scrollIntoViewIfNeeded();const card=await row.boundingBox(),body=await scroll.boundingBox();assert.ok(card&&body&&Math.min(card.y+card.height,body.y+body.height)-Math.max(card.y,body.y)>=48,'Every fallback card has a reachable48px area '+context);}
   }
   if(layout.needsScroll){
    await rows.nth(1).click();assert.equal(await page.evaluate(()=>(window as unknown as{previewFixture:PreviewFixture}).previewFixture.selectedId),2);
    const previous=await picker.elementHandle();assert.ok(previous);await page.evaluate(()=>{const f=(window as unknown as{previewFixture:PreviewFixture;renderPreview:(kind:string)=>void});f.previewFixture.initialAnchor=f.previewFixture.selectedId;f.renderPreview('group');});await page.waitForFunction(element=>!element.isConnected,previous);await previous.dispose();await picker.waitFor();
    await page.waitForFunction(()=>document.activeElement?.getAttribute('data-testid')==='map-group-business-2');assert.ok(await scroll.evaluate(element=>element.scrollTop>0),'The selected second card is scrolled into view on reopening');
    const selected=await rows.nth(1).boundingBox(),body=await scroll.boundingBox();assert.ok(selected&&body&&Math.min(selected.y+selected.height,body.y+body.height)-Math.max(selected.y,body.y)>=48,'Restored focus stays reachable inside the one body');
   }
   const close=page.getByRole('button',{name:'Close business list',exact:true}),closeBounds=await close.boundingBox();assert.ok(closeBounds&&closeBounds.width>=48&&closeBounds.height>=48&&closeBounds.y>=geometry.picker.top&&closeBounds.y+closeBounds.height<=geometry.picker.bottom,'Close remains outside the scrolling body '+context);await close.click();assert.equal(await page.evaluate(()=>(window as unknown as{previewFixture:PreviewFixture}).previewFixture.closeCalls),1);
   assert.equal(await page.getByRole('button',{name:'Next',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Previous',exact:true}).count(),0);assert.deepEqual(errors,[]);await page.close();
  }
  for(const locale of['en','am','om']){
   const page=await browser.newPage({viewport:{width:320,height:640}}),errors:string[]=[];page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.message));
   const messages=locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')) as Record<string,string>;
   const fixture:PreviewFixture={dimensions:{width:320,height:640,fontScale:1},shops:[],shop:showroom,messages};
   await page.setContent('<style>html,body,#root{margin:0;width:100%;min-height:100%}</style><div id="root"></div>');await page.evaluate(value=>{(window as unknown as{previewFixture:PreviewFixture}).previewFixture=value;},fixture);await page.addScriptTag({content:javascript});await page.evaluate(()=>{(window as unknown as{renderPreview:(kind:string)=>void}).renderPreview('showroom');});await page.getByTestId('showroom-categories').waitFor();
   const chips=page.locator('[data-testid^="showroom-category-"]');assert.equal(await chips.count(),3);
   for(let i=0;i<3;i++){const rect=await chips.nth(i).boundingBox();assert.ok(rect&&rect.width>=48&&rect.height>=48&&rect.x>=0&&rect.x+rect.width<=320,JSON.stringify({locale,rect}));}
   await page.getByTestId('showroom-category-11').click();assert.equal(await page.getByTestId('showroom-category-11').getAttribute('aria-pressed'),'true');assert.equal(await page.getByTestId('showroom-product-1').count(),1);assert.equal(await page.getByTestId('showroom-product-2').count(),0);assert.equal(await page.getByTestId('showroom-product-category-1').textContent(),merchantName.repeat(2));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await page.close();
  }
 }finally{await browser.close();}
});


test('FE-041 S129 installed RNWeb measured public/private product cards fill each narrow row and retain two fitting columns',{timeout:60000},async()=>{
 const javascript=(await bundle).outputFiles[0].text,browser=await chromium.launch({headless:true});
 try{
  for(const sample of[
   {width:320,preview:false,padding:0,fontScale:1,columns:1},
   {width:320,preview:true,padding:16,fontScale:1,columns:1},
   {width:390,preview:false,padding:0,fontScale:1,columns:2},
   {width:390,preview:true,padding:16,fontScale:1,columns:2},
   {width:844,preview:true,padding:16,fontScale:1,columns:2},
   {width:390,preview:false,padding:0,fontScale:2,columns:1},
  ]){
   const page=await browser.newPage({viewport:{width:sample.width,height:844}}),errors:string[]=[];page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
   const fixture:PreviewFixture={dimensions:{width:sample.width,height:844,fontScale:sample.fontScale},shops:[],shop:showroom,messages:{},preview:sample.preview,containerPadding:sample.padding};
   await page.setContent('<style>html,body,#root{margin:0;width:100%;min-height:100%}</style><div id="root"></div>');await page.evaluate(value=>{(window as unknown as{previewFixture:PreviewFixture}).previewFixture=value;},fixture);await page.addScriptTag({content:javascript});await page.evaluate(()=>{(window as unknown as{renderPreview:(kind:string)=>void}).renderPreview('showroom');});
   await page.getByTestId('showroom-product-grid').waitFor();await page.waitForFunction(({columns})=>{const a=document.querySelector('[data-testid="showroom-product-1"]')?.getBoundingClientRect(),b=document.querySelector('[data-testid="showroom-product-2"]')?.getBoundingClientRect();return a&&b&&(columns===2?Math.abs(a.y-b.y)<1:b.y>=a.bottom+11);},{columns:sample.columns});
   const geometry=await page.getByTestId('showroom-product-grid').evaluate(grid=>{const box=grid.getBoundingClientRect();return{width:box.width,left:box.left,right:box.right,gap:parseFloat(getComputedStyle(grid).columnGap),cards:Array.from(grid.querySelectorAll('[data-testid^="showroom-product-"]')).filter(node=>/^showroom-product-\d+$/.test(node.getAttribute('data-testid')||'')).map(card=>{const r=card.getBoundingClientRect();return{width:r.width,left:r.left,right:r.right,top:r.top,bottom:r.bottom};})};});
   const details=JSON.stringify({sample,geometry});assert.equal(geometry.cards.length,2,details);assert.equal(geometry.gap,12,details);assert.ok(geometry.left>=0&&geometry.right<=sample.width,details);
   for(const card of geometry.cards){assert.ok(card.left>=geometry.left-.5&&card.right<=geometry.right+.5,details);if(sample.columns===1)assert.ok(Math.abs(card.width-geometry.width)<=.5,'No half-width card stranded on its own row '+details);else{assert.ok(card.width>=150,details);assert.ok(Math.abs(card.width*2+geometry.gap-geometry.width)<=.5,details);}}
   if(sample.columns===2)assert.ok(Math.abs(geometry.cards[0].top-geometry.cards[1].top)<=.5,details);else assert.ok(geometry.cards[1].top>=geometry.cards[0].bottom+11.5,details);
   for(const id of[1,2]){const button=page.getByTestId('showroom-product-add-'+id),r=await button.boundingBox();assert.ok(r&&r.height>=48,details);assert.equal(await button.isDisabled(),sample.preview,'Private preview still cannot mutate saved inquiry lists');assert.equal(await page.getByTestId('showroom-product-description-'+id).evaluate(el=>getComputedStyle(el).webkitLineClamp),'2');}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),details);assert.deepEqual(errors,[]);await page.close();
  }
 }finally{await browser.close();}
});
