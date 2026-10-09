import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
const out='.local/floating-discovery-controls',base='http://127.0.0.1:3102';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),errors=[],shots=[];
try {
 const context=await browser.newContext();context.setDefaultTimeout(20000);
 await context.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=','base64')}));
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 const button=name=>p.getByRole('button',{name,exact:true});
 async function shot(name) {await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name);await p.screenshot({path:out+'/'+name+'.png'});shots.push(name);}
 async function closed() {await expect(p.getByRole('heading',{name:'Products & services',exact:true})).toBeHidden();await expect(button('View products')).toBeVisible();await expect(p.locator('#discovery-search')).toHaveCount(1);await expect(p.locator('#discovery-place')).toBeVisible();}
 for(const width of [1440,390,320]) {
  await p.setViewportSize({width,height:width===1440?1000:844});await p.goto(base+'/?view=map');await closed();await expect(p.locator('.leaflet-container')).toBeVisible();
  await p.locator('.leaflet-container').evaluate(el=>el.dataset.persistProbe='same');
  await shot('web-closed-'+width);
  await p.locator('#discovery-search').fill('Aloe Field Care');await p.getByRole('button',{name:'Show search results',exact:true}).click();await expect(p).toHaveURL(/q=Aloe/);await closed();await expect(p.locator('.mp-map-showroom')).toHaveCount(1,{timeout:30000});
  await button('View products').click();await expect(p.getByRole('heading',{name:'Products & services',exact:true})).toBeVisible();await expect(p.locator('#discovery-search')).toHaveValue('Aloe Field Care');await expect(p.locator('.discovery-product-results a').first()).toBeVisible();await expect(p.locator('.leaflet-container')).toHaveAttribute('data-persist-probe','same');
  await shot('web-open-'+width);
  await button('Hide products').click();await closed();await p.reload();await closed();await expect(p.locator('#discovery-search')).toHaveValue('Aloe Field Care');
  await button('Clear marketplace search').click();await expect(p.locator('#discovery-search')).toHaveValue('');await expect(p).not.toHaveURL(/q=/);
 }
 // Filters work while closed, remain selected when open, and clear independently.
 await p.getByLabel('Filter by category',{exact:true}).click();await p.getByRole('group',{name:'Categories',exact:true}).getByRole('button').first().click();await expect(button('Clear categories')).toBeVisible();await closed();
 await p.getByLabel('Filter by category',{exact:true}).click();await button('Clear categories').click();await expect(button('Clear categories')).toHaveCount(0);
 const place=p.locator('#discovery-place');const option=await place.locator('optgroup option').first().getAttribute('value');await place.selectOption(option);await expect(button('Clear location')).toBeVisible();await closed();await button('View products').click();await expect(place).toHaveValue(option);await button('Clear location').click();await expect(place).toHaveValue('');
 for(const width of [390,320]) {
  await p.setViewportSize({width,height:844});await p.goto('http://localhost:8082');
  const input=p.getByRole('textbox',{name:'Search',exact:true});await expect(input).toBeVisible();await expect(input).toHaveCount(1);await expect(button('Category: All categories')).toBeVisible();await expect(button('Region or city: All Ethiopia')).toBeVisible();
  await expect(p.getByRole('heading',{name:'Products & services',exact:true})).toBeHidden();await expect(p.locator('.suqpage-map-marker').first()).toBeAttached();await shot('native-closed-'+width);
  await input.fill('Aloe Field Care');await button('Search').click();await expect(button('View products')).toBeVisible();await expect(p.getByRole('heading',{name:'Products & services',exact:true})).toBeHidden();
  await button('View products').click();await expect(p.getByRole('heading',{name:'Products & services',exact:true})).toBeVisible();await expect(input).toHaveCount(1);await expect(input).toHaveValue('Aloe Field Care');await expect(button('Aloe Body Lotion')).toBeVisible();await shot('native-open-'+width);
  await button('Hide products').click();await expect(input).toBeVisible();await expect(input).toHaveValue('Aloe Field Care');await button('Clear search').click();
  await button('Category: All categories').click();await p.getByRole('checkbox').first().click();await button('Done').click();await expect(button('Clear categories')).toBeVisible();await expect(button('View products')).toBeVisible();await button('Clear categories').click();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verification.json',JSON.stringify({shots,checks:['one active control set','closed search updates map without opening results','open list uses same query','web view reload','category/place clearing and persistence','map DOM survives panel movement','desktop/390/320 and native browser'],tiles:'controlled blank fixture; actual marker data',native:'Expo browser only'},null,2));console.log('PASS: shared discovery controls, '+shots.length+' captures.');
}finally{await browser.close();}
