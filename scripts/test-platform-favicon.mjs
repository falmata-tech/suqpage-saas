import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { installMapTileFixture } from './testing/map-tile-fixture.mjs';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
const expected=['/brand/africmade-showroom-mark-v3.png','/pwa/africmade-favicon-v3-32.png'];
const browser=await chromium.launch({channel:process.env.SUQPAGE_BROWSER_CHANNEL||'chrome'});
try{
 const context=await browser.newContext({serviceWorkers:'block'});
 const tileFixture=await installMapTileFixture(context);
 let page=await context.newPage();
 async function check(){
  await expect.poll(async()=>page.locator('link[rel="icon"]').evaluateAll(nodes=>nodes.map(n=>new URL(n.href).pathname).sort()).catch(()=>[])).toEqual([...expected].sort());
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href','/pwa/africmade-apple-touch-v3-180.png');
 }
 for(const route of ['/','/featured','/login','/dashboard']){
  await page.goto(base+route,{waitUntil:'domcontentloaded'});await check();
  await page.close();page=await context.newPage();
 }
 await page.goto(base+'/@selam-weave',{waitUntil:'domcontentloaded'});await check();
 const firstProduct=page.getByRole('link',{name:/^View /}).first();
 await firstProduct.waitFor({state:'visible',timeout:30000});
 await firstProduct.click();await expect(page).toHaveURL(/product=/,{timeout:15000});await check();
 await page.reload();await check();
 const captureDir=process.env.SUQPAGE_BRAND_CAPTURE_DIR;
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:820});
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});await check();
  const logo=await page.locator('.public-app-header .suqpage-brand').boundingBox();
  const language=await page.locator('.public-app-header .language-selector').boundingBox();
  assert.ok(logo&&language,`Header controls visible at ${width}px`);
  assert.ok(logo.width>= (width<500?145:205),`AfricMade wordmark readable at ${width}px`);
  assert.ok(logo.x>=0&&logo.x+logo.width+4<=language.x,`Header controls do not overlap at ${width}px`);
  if(captureDir){fs.mkdirSync(captureDir,{recursive:true});await page.screenshot({path:`${captureDir}/africmade-header-${width}.png`});}
 }
 for(const icon of [...expected,'/pwa/africmade-apple-touch-v3-180.png'])assert.equal((await page.request.get(base+icon)).status(),200);
 assert.ok(!fs.readFileSync('app/dashboard/settings/page.tsx','utf8').includes('name="favicon"'));
 tileFixture.assertNoExternalRequests();
 console.log('PASS AfricMade favicon and Apple icon on home/Featured/login/dashboard entry/business/product, product navigation and reload; icon assets return 200.');
}finally{await browser.close();}
