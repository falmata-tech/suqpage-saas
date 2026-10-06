import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
const base='http://127.0.0.1:3102', mobile='http://localhost:8082', out='.local/offering-results';
fs.mkdirSync(out,{recursive:true});
async function market(query='') { const response=await fetch(base+'/api/mobile/v1/market?'+query); assert.equal(response.status,200);return response.json(); }
const first=await market();assert.ok(first.items.length>0);assert.ok(first.showrooms.length>0);assert.ok(first.items.every(i=>i.kind==='product'));
for(const type of ['all','businesses','products']) {
 const value=await market('type='+type);assert.equal(value.total,first.total);assert.deepEqual(value.items,first.items);assert.deepEqual(value.showrooms,first.showrooms);
}
const last=await market('type=businesses&page=99999');assert.equal(last.page,last.pages);assert.ok(last.items.length>0 && last.items.length<=5);assert.ok(last.items.every(i=>i.kind==='product'));assert.deepEqual(last.showrooms,first.showrooms);
const businessQuery=await market('q='+encodeURIComponent(first.items[0].businessName));assert.ok(businessQuery.showrooms.some(s=>s.handle===first.items[0].handle));assert.ok(businessQuery.items.every(i=>i.kind==='product'));
const browser=await chromium.launch(), errors=[], shots=[];
try {
 const context=await browser.newContext();
 await context.route('https://tile.openstreetmap.org/**',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=','base64')}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 async function capture(name) {
  await page.evaluate(()=>document.fonts.ready);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');
  await page.screenshot({path:out+'/'+name+'.png'});shots.push(name);
 }
 for(const width of [1440,390,320]) {
  await page.setViewportSize({width,height:width===1440?1000:844});
  await page.goto(base+'/?view=search&type=businesses');
  await expect(page.getByRole('heading',{name:'Products & services',exact:true})).toBeVisible();
  await expect(page.locator('.discovery-product-results a')).toHaveCount(first.items.length);
  await expect(page.locator('.discovery-business-results')).toHaveCount(0);
  await expect(page.getByRole('checkbox',{name:'Businesses',exact:true})).toHaveCount(0);
  await expect(page.getByRole('checkbox',{name:'Products & services',exact:true})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Next page',exact:true})).toBeInViewport();
  await expect(page.locator('.discovery-product-results a').first()).toBeInViewport();
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await capture('web-'+width);
 }
 await page.getByRole('link',{name:'Next page',exact:true}).click();await expect(page).toHaveURL(/page=2/);await expect(page.locator('.discovery-product-results a')).toHaveCount(5);
 await page.goto(base+'/?view=search&type=businesses&q='+encodeURIComponent(first.items[0].businessName));
 await expect(page.locator('.discovery-product-results a')).toHaveCount(businessQuery.items.length);
 await page.goto(base+'/?view=search&q=zzzzzzzzunmatched');await expect(page.getByRole('heading',{name:'No matches found'})).toBeVisible();await expect(page.locator('.leaflet-container')).toBeVisible();
 for(const width of [390,320]) {
  await page.setViewportSize({width,height:844});await page.goto(mobile);
  await page.getByRole('button',{name:'Search & results',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Products & services',exact:true})).toBeVisible();
  await expect(page.getByRole('checkbox',{name:'Businesses',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:first.items[0].name,exact:true})).toBeVisible();
  await expect(page.locator('.suqpage-map-marker').first()).toBeAttached();
  await capture('native-'+width);
 }
 const search=page.getByRole('textbox',{name:'Search',exact:true});await search.fill(first.items[0].businessName);await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page.getByRole('button',{name:businessQuery.items[0].name,exact:true})).toBeVisible();
 assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/verification.json',JSON.stringify({checks:['public API legacy types return only offerings','accurate totals and last page','map membership unaffected by page/type','business-name search retains map and offerings','web old URLs/next page/empty states','desktop/390/320 layouts','native offering heading/cards'],shots,mapTiles:'controlled blank tiles; actual marker data and handlers',native:'Expo browser, not physical-device evidence'},null,2));
 console.log('PASS: offering-only public API and web/native browser flows; '+shots.length+' screenshots.');
} finally {await browser.close();}
