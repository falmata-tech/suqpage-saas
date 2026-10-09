import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect as baseExpect} from '@playwright/test';
import {categoryStarter} from '../lib/category-starter.ts';
import {normalizeProductVideoUrl} from '../lib/video/product-video.ts';
const out='.local/category-video-review',base='http://127.0.0.1:3102',mobile='http://localhost:8082';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),expect=baseExpect.configure({timeout:30000}),checks=[];
const providerFixture='<html><body style="margin:0;background:#202428;color:white;font:16px sans-serif;display:grid;place-items:center;height:100vh">Provider player fixture</body></html>';
const demoCases=[['tiktok','demo-tena-food-kitchen'],['facebook','demo-meriem-hair-care'],['instagram','koba-leather'],['youtube','selam-weave']];
async function capture(page,name,width){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${out}/${name}-${width}.png`});}
function testShop(sample){return {id:1,handle:'category-player',name:'Category video preview',about:sample.page.about,cover:sample.page.heroImage,logo:'',videoUrl:sample.page.videoUrl,status:'active',contacts:{},products:sample.offerings.map((p,i)=>({id:i+1,name:p.name,description:p.description,priceMinor:p.priceMinor,kind:p.kind,availability:'available',version:1,published:true,media:[{kind:'image',ref:p.image},{kind:'image',ref:p.galleryImage},{kind:'video',ref:sample.videoRef}],options:[]})),version:1};}
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 for(const pattern of ['https://www.tiktok.com/player/v1/**','https://www.facebook.com/plugins/video.php**','https://www.instagram.com/reel/**/embed/**','https://www.youtube-nocookie.com/**'])await context.route(pattern,route=>route.fulfill({contentType:'text/html',body:providerFixture}));
 await context.route('https://www.youtube.com/iframe_api',route=>route.abort());
 const page=await context.newPage();page.setDefaultNavigationTimeout(90000);
 for(const [provider,handle] of demoCases){
  const response=await fetch(base+'/api/mobile/v1/shops/'+handle);assert.equal(response.status,200);const shop=await response.json();assert.equal(normalizeProductVideoUrl(shop.videoUrl).provider,provider);assert.ok(shop.products.some(p=>p.media.some(m=>m.kind==='video'&&m.ref.startsWith(provider+':'))));
  await page.goto(mobile+'/shop/'+handle);await page.getByRole('button',{name:'Watch video',exact:true}).first().click();await expect(page.locator('iframe').first()).toBeVisible();await expect(page.getByText('Loading video…',{exact:true})).toHaveCount(0);for(const width of [390,1440])await capture(page,'expo-demo-cover-'+provider,width);assert.equal(context.pages().length,1);
  const product=shop.products.find(p=>p.media.some(m=>m.kind==='video'&&m.ref.startsWith(provider+':'))),index=product.media.findIndex(m=>m.kind==='video'&&m.ref.startsWith(provider+':'));
  await page.goto(mobile+'/product?handle='+handle+'&id='+product.id);await page.getByRole('button',{name:'Video '+(index+1),exact:true}).click();await page.getByRole('button',{name:'Watch video',exact:true}).and(page.locator(':enabled')).click();await expect(page.locator('iframe').first()).toBeVisible();await capture(page,'expo-demo-product-'+provider,390);await page.getByRole('button',{name:'Photo 1',exact:true}).click();await expect(page.locator('iframe')).toHaveCount(0);
  await page.goto(base+'/@'+handle);await page.getByRole('button',{name:'Play business video about '+shop.name,exact:true}).click();await expect(page.locator('iframe').first()).toBeVisible();for(const width of [390,1440])await capture(page,'web-demo-cover-'+provider,width);
  checks.push({provider,handle,realLocalCatalog:true,coverAndProductInline:true,providerFrames:'controlled fixtures; public playback smoke separate'});
 }
 const sample=categoryStarter('fashion-textiles','Hawassa'),shop=testShop(sample);await context.route('**/api/mobile/v1/shops/category-player',route=>route.fulfill({json:shop}));
 await page.goto(mobile+'/shop/category-player');await page.getByRole('button',{name:'Watch video',exact:true}).and(page.locator(':enabled')).click();await expect(page.getByText('Loading video…',{exact:true})).toHaveCount(0);
 await page.waitForTimeout(22000);await expect(page.getByText('Video unavailable',{exact:true})).toHaveCount(0);await expect(page.locator('iframe').first()).toBeVisible();checks.push({youtubeApiBlocked:true,iframeDocumentLoaded:true,noFalseUnavailableAfter22Seconds:true});
 const bridge=page.frames().find(frame=>frame.url()==='about:srcdoc');assert.ok(bridge);await bridge.evaluate(origin=>window.parent.postMessage(JSON.stringify({source:'suqpage-youtube',event:'error'}),origin),mobile);await expect(page.getByText('Video unavailable',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(page.locator('iframe').first()).toBeVisible();await expect(page.getByText('Video unavailable',{exact:true})).toHaveCount(0);checks.push({genuinePlayerErrorRetained:true,explicitRetryRecreatesPlayer:true});
 await context.close();fs.writeFileSync(out+'/ui-verified.json',JSON.stringify({checks,customerWrites:0,hostedWrites:0},null,2));console.log('PASS four-provider local demo covers/products on web/Expo, lifecycle and iframe-load fallback without API callback');
}finally{await browser.close();}
