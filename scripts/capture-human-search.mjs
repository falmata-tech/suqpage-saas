import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
const out=process.env.SUQPAGE_SEARCH_CAPTURE_DIR||'.local/human-search-review';
fs.mkdirSync(out,{recursive:true,mode:0o700});
const browser=await chromium.launch();const evidence=[];
try {
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?q=lotion',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.discovery-product-results a').filter({hasText:'Aloe Body Lotion'})).toBeVisible();
  await page.goto(base+'/?industry=beauty-wellness',{waitUntil:'domcontentloaded'});
  const input=page.locator('#discovery-search');
  for(const query of ['lotion','LOTION','body-lotion','lotions','find lotions in Addis Ababa']){
   await input.fill(query);
   await expect(page).toHaveURL(url=>url.searchParams.get('q')===query,{timeout:15000});
   await expect(page.locator('.discovery-product-results a').filter({hasText:'Aloe Body Lotion'})).toBeVisible({timeout:15000});
   assert.equal(new URL(page.url()).searchParams.get('industry'),'beauty-wellness');
  }
  let releaseDelayed;let requestSeen;
  const seen=new Promise(resolve=>{requestSeen=resolve;});
  const delayed=new Promise(resolve=>{releaseDelayed=resolve;});
  const routePattern=url=>url.searchParams.get('q')==='aloe' && url.searchParams.has('_rsc');
  await page.route(routePattern,async route=>{requestSeen();await delayed;await route.continue();});
  await input.fill('aloe');await Promise.race([seen,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Delayed search not requested')),15000))]);
  await input.fill('lotion');releaseDelayed();
  await page.waitForTimeout(1800);
  await expect(input).toHaveValue('lotion');
  await expect(page).toHaveURL(url=>url.searchParams.get('q')==='lotion',{timeout:15000});
  await page.unroute(routePattern);
  for(const query of ['unknownbrand','body soap','lotion']){await input.fill(query);await page.waitForTimeout(60);}
  await expect(page).toHaveURL(url=>url.searchParams.get('q')==='lotion',{timeout:15000});
  await expect(page.locator('.discovery-product-results a').filter({hasText:'Aloe Body Lotion'})).toBeVisible();
  await page.getByRole('checkbox',{name:'Businesses',exact:true}).click();
  await expect(page).toHaveURL(url=>url.searchParams.get('type')==='products');
  await expect(page.locator('.discovery-product-results a').filter({hasText:'Aloe Body Lotion'})).toBeVisible();
  await page.screenshot({path:`${out}/lotion-${width}.png`,fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
  await page.locator('.discovery-product-results a').filter({hasText:'Aloe Body Lotion'}).click();
  await expect(page.locator('[data-product-page]')).toBeVisible();
  await page.goBack();await page.waitForLoadState('domcontentloaded');await expect(input).toHaveValue('lotion');
  await input.fill('%');await input.press('Enter');
  await expect(page).toHaveURL(url=>url.searchParams.get('q')==='%');
  await expect(page.getByText('No matches found',{exact:true})).toBeVisible();
  await input.fill('lotion');await input.press('Enter');
  await expect(page.locator('.discovery-product-results a').filter({hasText:'Aloe Body Lotion'})).toBeVisible();
  assert.deepEqual(errors,[]);evidence.push({width,passed:true});await context.close();
 }
 fs.writeFileSync(`${out}/evidence.json`,JSON.stringify({base,evidence,typing:true,categoryPreserved:true,typeTab:true,detailBack:true,literalNoMatch:true}));
 console.log('PASS desktop/390/320 human searches, fast typing, category/type preservation, product navigation/back, literal no-match and overflow.');
}finally{await browser.close();}
