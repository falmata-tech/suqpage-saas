import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));
const browser=await chromium.launch();
try{
 const context=await browser.newContext();
 const page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`${base}/@demo-nile-sensor-studio`);
 const link=await page.locator('[data-business-profile] article a').first().getAttribute('href');
 assert.ok(link?.startsWith('/@demo-nile-sensor-studio?product='));
 for(let iteration=0;iteration<12;iteration++){
  await page.evaluate(()=>localStorage.removeItem('suqpage-cart:demo-nile-sensor-studio'));
  await page.goto(base+link);
  await page.getByRole('button',{name:'Add to inquiry list',exact:true}).click();
  await expect(page.getByRole('button',{name:'Added to inquiry list',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Added to inquiry list',exact:true})).toBeVisible();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS twelve immediate direct-product selections persist after reload; no inquiry sent.');
}finally{await browser.close();}
