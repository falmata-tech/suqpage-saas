import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
const out=process.env.SUQPAGE_SEARCH_CAPTURE_DIR||'.local/spelling-search-review';
fs.mkdirSync(out,{recursive:true,mode:0o700});
const browser=await chromium.launch();
try {
 for(const width of [1440,390,320]) {
  const page=await browser.newPage({viewport:{width,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const q of ['lotoin','lotiom','body loton']) {
   await page.goto(`${base}/?industry=beauty-wellness&q=${encodeURIComponent(q)}`,{waitUntil:'networkidle'});
   await expect(page.locator('.discovery-product-results a').filter({hasText:'Aloe Body Lotion'})).toBeVisible();
   await expect(page.locator('.discovery-search-results')).not.toContainText('Possible matches');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.screenshot({path:`${out}/spelling-${width}.png`,fullPage:true});
  await page.getByRole('checkbox',{name:'Products & services',exact:true}).click();
  await expect(page).toHaveURL(/type=businesses/);
  await expect(page.locator('.discovery-business-results button').filter({hasText:'Aloe Field Care'})).toBeVisible();
  await page.getByRole('checkbox',{name:'Products & services',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Businesses',exact:true})).toBeEnabled();
  await page.getByRole('checkbox',{name:'Businesses',exact:true}).click();
  await expect(page).toHaveURL(/type=products/);
  await expect(page.locator('.discovery-product-results a').filter({hasText:'Aloe Body Lotion'})).toBeVisible();
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS ranked-list typo searches and result filters on desktop/390/320, without additional match sections or overflow.');
} finally {await browser.close();}
