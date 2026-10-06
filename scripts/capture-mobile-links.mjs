import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect as baseExpect} from '@playwright/test';
const expect=baseExpect.configure({timeout:20000});
const out='.local/mobile-links';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch(), shots=[],errors=[];
try {
 const context=await browser.newContext();
 const market=await context.request.get('http://127.0.0.1:3102/api/mobile/v1/market?q=Aloe%20Field%20Care');assert.equal(market.ok(),true);
 const item=(await market.json()).items.find(i=>i.name==='Aloe Body Lotion');assert.ok(item);
 const url='http://127.0.0.1:3102/api/mobile/v1/shops/'+item.handle;
 const response=await context.request.get(url);assert.equal(response.ok(),true);const shop=await response.json();
 // Read actual catalog data; only the browser response gets example links. No DB writes.
 shop.about='Browse our styles at https://example.org/shop. Contact us for details.';
 shop.products.find(p=>p.id===item.id).description='See our size guide (https://example.org/guide), or visit www.example.org. javascript:alert(1) stays plain text.';
 shop.contacts.website='https://example.org/shop';
 await context.route(url,r=>r.fulfill({json:shop}));
 await context.route('https://example.org/**',r=>r.fulfill({contentType:'text/html',body:'<title>Controlled external site</title><h1>Example website</h1>'}));
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 async function shot(name){await p.evaluate(()=>document.fonts.ready);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:out+'/'+name+'.png'});shots.push(name);}
 for(const width of [390,320]) {
  await p.setViewportSize({width,height:844});await p.goto(`http://localhost:8082/product?handle=${item.handle}&id=${item.id}`);
  const link=p.getByRole('link',{name:'https://example.org/guide',exact:true});await expect(link).toBeVisible();
  await expect(p.getByRole('link',{name:/javascript:/})).toHaveCount(0);await shot('description-'+width);
  const popupWait=context.waitForEvent('page');await link.click();const popup=await popupWait;
  await popup.waitForLoadState();await expect(popup).toHaveURL('https://example.org/guide');assert.equal(await popup.evaluate(()=>window.opener===null),true);
  await popup.close();await expect(link).toBeVisible();assert.match(p.url(),/\/product\?/);
  await p.goto(`http://localhost:8082/shop/${item.handle}`);
  const story=p.getByRole('link',{name:'https://example.org/shop',exact:true});await expect(story).toBeVisible();await story.scrollIntoViewIfNeeded();await shot('story-'+width);
  const more=context.waitForEvent('page');await story.click();const second=await more;await second.waitForLoadState();await expect(second).toHaveURL('https://example.org/shop');await second.close();await expect(story).toBeVisible();
  const website=p.getByRole('link',{name:'Website',exact:true});await website.scrollIntoViewIfNeeded();
  const contactWait=context.waitForEvent('page');await website.click();const contact=await contactWait;await contact.waitForLoadState();await expect(contact).toHaveURL('https://example.org/shop');await contact.close();
  // Simulate a platform launch failure; no provider error details should escape.
  await p.evaluate(()=>{window.open=()=>{throw Error('private-provider-detail');};});
  const dialogWait=p.waitForEvent('dialog').then(async dialog=>{assert.equal(dialog.message(),'Could not open link');await dialog.dismiss();});await Promise.all([website.click(),dialogWait]);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verification.json',JSON.stringify({shots,checks:['literal unsafe text inert','description and story links open controlled site','web opener isolated','Suqpage remains on same screen'],fixtures:'public catalog read; response-only descriptions and external website fixture',limit:'Expo browser only, native browser sheet/app handoffs covered by port tests pending device'},null,2));console.log('PASS mobile links: '+shots.length+' browser captures');
} finally {await browser.close();}
