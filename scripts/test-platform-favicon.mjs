import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
const expected=['/brand/africmade-afro-mark-v1.png','/pwa/africmade-favicon-32.png'];
const browser=await chromium.launch({channel:process.env.SUQPAGE_BROWSER_CHANNEL||'chrome'});
try{
 const page=await browser.newPage();
 async function check(){
  await expect.poll(async()=>page.locator('link[rel="icon"]').evaluateAll(nodes=>nodes.map(n=>new URL(n.href).pathname).sort()).catch(()=>[])).toEqual([...expected].sort());
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href','/pwa/africmade-apple-touch-icon-180.png');
 }
 for(const route of ['/','/featured','/login','/dashboard','/@selam-weave']){await page.goto(base+route);await check();}
 await page.getByRole('link',{name:/^View /}).first().click();await expect(page).toHaveURL(/product=/);await check();
 await page.reload();await check();
 await page.getByRole('link',{name:'Back to products',exact:true}).click();await expect(page).not.toHaveURL(/product=/);await check();
 for(const icon of [...expected,'/pwa/africmade-apple-touch-icon-180.png'])assert.equal((await page.request.get(base+icon)).status(),200);
 assert.ok(!fs.readFileSync('app/dashboard/settings/page.tsx','utf8').includes('name="favicon"'));
 console.log('PASS AfricMade favicon and Apple icon on home/Featured/login/dashboard entry/business/product, client navigation and reload; icon assets return 200.');
}finally{await browser.close();}
