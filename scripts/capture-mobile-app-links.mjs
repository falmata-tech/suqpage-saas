import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect as baseExpect}from'@playwright/test';
const expect=baseExpect.configure({timeout:20000});
const out='.local/app-links';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),checks=[],errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await context.route('https://tile.openstreetmap.org/**',r=>r.abort());
 const res=await context.request.get('http://127.0.0.1:3102/.well-known/assetlinks.json');assert.equal(res.status(),200);assert.match(res.headers()['content-type'],/application\/json/);assert.deepEqual(await res.json(),JSON.parse(fs.readFileSync('public/.well-known/assetlinks.json','utf8')));checks.push('public JSON association serves without Auth');
 await page.goto('http://localhost:8082/?q=Aloe+Field+Care&category=beauty-wellness&view=search');
 const search=page.getByRole('textbox',{name:'Search',exact:true});await expect(search).toHaveValue('Aloe Field Care');await expect(page.getByRole('button',{name:'Aloe Body Lotion',exact:true})).toBeVisible();await expect(page.getByTestId('category-count')).toHaveText('1');checks.push('cold Market scope restored');
 await search.fill('lotion');await page.getByRole('button',{name:'Search',exact:true}).click();await expect(search).toHaveValue('lotion');await expect(page.getByRole('button',{name:'Aloe Body Lotion',exact:true})).toBeVisible();checks.push('interactive edits are retained');await page.evaluate(()=>{history.pushState({},'', '/?q=Aloe+Field+Care&category=beauty-wellness&view=search&_intent=2');dispatchEvent(new PopStateEvent('popstate'));});await expect(search).toHaveValue('Aloe Field Care');checks.push('repeated incoming Market link restores its query after manual edits');
 await page.evaluate(()=>{history.pushState({},'', '/?q=grass&view=search');dispatchEvent(new PopStateEvent('popstate'));});
 await expect(search).toHaveValue('grass');await expect(page.getByRole('button',{name:'Category: All categories',exact:true})).toBeVisible();checks.push('warm Market link restores new query and clears old category');
 await page.screenshot({path:out+'/market-deep-link-390.png'});
 const market=await context.request.get('http://127.0.0.1:3102/api/mobile/v1/market?q=Aloe%20Field%20Care');const item=(await market.json()).items.find(i=>i.name==='Aloe Body Lotion');assert.ok(item);
 await page.goto(`http://localhost:8082/product?handle=${item.handle}&id=${item.id}`);await expect(page.getByText('Aloe Body Lotion',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Inquire about this item only',exact:true})).toBeVisible();checks.push('mapped product destination loads real catalog');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser-verification.json',JSON.stringify({checks,scope:'Expo browser route effects plus public local association; OS routing tested separately',fixtures:'OSM aborted, actual local API reads'},null,2));console.log('PASS Suqpage app link browser checks:',checks.length);
}finally{await browser.close();}
