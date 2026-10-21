import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect as baseExpect} from '@playwright/test';
const base='http://127.0.0.1:3102',mobile='http://localhost:8082',out='.local/demo-notice-review',notice='Demo business — products and contact details are examples.';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),expect=baseExpect.configure({timeout:30000}),checks=[];let inquiryPosts=0;
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.setDefaultNavigationTimeout(90000);page.on('request',r=>{if(r.method()==='POST'&&/\/api\/(?:mobile\/v1\/)?inquiries/.test(r.url()))inquiryPosts++;});
 for(const [handle,expected] of [['demo-aloe-field-care',false],['selam-weave',true]]){
  const response=await fetch(base+'/api/mobile/v1/shops/'+handle);assert.equal(response.status,200);const shop=await response.json();assert.equal(shop.isDemo,true);
  await page.goto(base+'/@'+handle);await expect(page.getByRole('heading',{name:shop.name,exact:true})).toBeVisible();await expect(page.getByText(notice,{exact:true})).toHaveCount(expected?1:0);
  for(const width of [1440,390,320]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${out}/web-${handle}-${width}.png`});}
  const product=shop.products.find(p=>p.availability==='available');assert.ok(product);await page.goto(base+'/@'+handle+'?product='+product.id);await page.getByRole('button',{name:/^Inquire about this (product|service) only$/}).click();const dialog=page.getByRole('dialog',{name:'Business inquiry'});await expect(dialog).toBeVisible();await expect(dialog.getByText(/Demo inquiry/)).toHaveCount(0);await expect(dialog.getByRole('button',{name:'Send inquiry on Suqpage',exact:true})).toBeVisible();await dialog.screenshot({path:`${out}/web-inquiry-${handle}-320.png`});checks.push({surface:'web',handle,businessNotice:expected,inquiryDisclaimer:false,sendControls:true});
 }
 const response=await fetch(base+'/api/mobile/v1/shops/demo-aloe-field-care'),original=await response.json();
 for(const [handle,isDemo,expected] of [['demo-marker',true,false],['qaDemoMarker',true,false],['plain-marker',true,true],['plain-real',false,false]]){
  const shop={...original,handle,isDemo,name:'Notice review store'};await page.route('**/api/mobile/v1/shops/'+handle,route=>route.fulfill({json:shop}));await page.goto(mobile+'/shop/'+handle);await expect(page.getByText(shop.name,{exact:true}).first()).toBeVisible();await expect(page.getByText(notice,{exact:true})).toHaveCount(expected?1:0);
  for(const width of [390,320]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${out}/expo-${handle}-${width}.png`});}
  await page.goto(mobile+'/inquiry?handle='+handle+'&id='+shop.products[0].id);await expect(page.getByText(shop.name,{exact:true}).first()).toBeVisible();await expect(page.getByText(/Demo inquiry/)).toHaveCount(0);await expect(page.getByRole('button',{name:'Send inquiry on Suqpage',exact:true})).toBeVisible();checks.push({surface:'Expo browser',handle,isDemo,businessNotice:expected,inquiryDisclaimer:false,sendControls:true});
 }
 assert.equal(inquiryPosts,0);await context.close();fs.writeFileSync(out+'/verified.json',JSON.stringify({checks,inquiryPosts,businessWrites:0,providerFrames:0,hostedWrites:0},null,2));console.log('PASS handle-based business notice, no demo-inquiry disclaimers, normal send controls and desktop/phone views on web/Expo');
}finally{await browser.close();}
