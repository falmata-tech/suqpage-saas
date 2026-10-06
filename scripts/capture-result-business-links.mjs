import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createUiText, languageNames } from '../lib/i18n/core.ts';
import { chromium, expect as baseExpect } from '@playwright/test';
const expect=baseExpect.configure({timeout:20000});
const out='.local/result-business-links';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const shots=[],errors=[];
try {
 const context=await browser.newContext();context.setDefaultTimeout(20000);
 await context.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=','base64')}));
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 async function shot(name){await p.evaluate(()=>document.fonts.ready);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');await p.screenshot({path:out+'/'+name+'.png'});shots.push(name);}
 if(!process.argv.includes('--native') && !process.argv.includes('--locales'))for(const width of [1440,390,320]) {
  await p.setViewportSize({width,height:width===1440?1000:844});
  await p.goto('http://127.0.0.1:3102/?q=Aloe+Field+Care&view=search',{waitUntil:'domcontentloaded'});
  const card=p.locator('.discovery-product-card').first(), product=card.locator('.discovery-product-link'), store=card.locator('.discovery-product-business');
  await expect(product).toBeVisible();await expect(store).toHaveText('From Aloe Field Care');
  assert.equal(await card.locator('a a').count(),0,'no nested links');
  assert.ok((await store.boundingBox()).height>=44,'store touch target');
  await product.focus();await expect(product).toBeFocused();await p.keyboard.press('Tab');await expect(store).toBeFocused();
  await shot('web-'+width);
  const shopHref=await store.getAttribute('href'), productHref=await product.getAttribute('href');
  assert.match(productHref,/product=/);assert.ok(!shopHref.includes('product='));
  await store.click();await expect(p).toHaveURL('http://127.0.0.1:3102'+shopHref);await expect(p.locator('[data-product-page]')).toHaveCount(0);
  await p.goBack();await expect(store).toBeVisible();await product.click();await expect(p).toHaveURL('http://127.0.0.1:3102'+productHref);await expect(p.locator('[data-product-page]')).toBeVisible();
  await p.goBack();await expect(p.locator('#discovery-search')).toHaveValue('Aloe Field Care');
  if(width===320){await store.evaluate(el=>el.textContent='From Abeba Handmade Home Furnishings and Traditional Crafts Studio');await shot('web-long-business-320');}
 }
 if(!process.argv.includes('--web') && !process.argv.includes('--locales'))for(const width of [390,320]) {
  await p.setViewportSize({width,height:844});await p.goto('http://localhost:8082',{waitUntil:'domcontentloaded'});
  await p.getByRole('textbox',{name:'Search',exact:true}).fill('Aloe Field Care');await p.getByRole('button',{name:'Search',exact:true}).click();await p.getByRole('button',{name:'Search & results',exact:true}).click();
  const product=p.getByRole('button',{name:'Aloe Body Lotion',exact:true}),store=p.getByRole('link',{name:'From Aloe Field Care',exact:true}).first();
  await expect(product).toBeVisible();await expect(store).toBeVisible();assert.ok((await store.boundingBox()).height>=44);
  await shot('native-browser-'+width);
  await store.click();await expect(p).toHaveURL(/\/shop\//);await p.getByRole('button',{name:'Back',exact:true}).click();await expect(product).toBeVisible();await product.click();await expect(p).toHaveURL(/\/product\?/);await p.getByRole('button',{name:'Back',exact:true}).click();await expect(store).toBeVisible();
  if(width===320){await store.locator('div').first().evaluate(el=>el.textContent='From Abeba Handmade Home Furnishings and Traditional Crafts Studio');await shot('native-long-business-320');}
 }
 if(process.argv.includes('--locales'))for(const locale of ['am','om','so','ti']) {
  const t=createUiText(JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
  await p.setViewportSize({width:320,height:844});
  await context.addCookies([{name:'suqpage-language',value:locale,url:'http://127.0.0.1:3102'}]);
  await p.goto('http://127.0.0.1:3102/?q=Aloe+Field+Care&view=search');
  await expect(p.locator('.discovery-product-business').first()).toHaveText(t('From {business}',{business:'Aloe Field Care'}));
  await shot('web-'+locale+'-320');
  await p.goto('http://localhost:8082');
  await p.getByRole('button',{name:'Language',exact:true}).click();
  await p.getByRole('radio',{name:languageNames[locale],exact:true}).click();
  await p.getByRole('button',{name:t('Close'),exact:true}).last().click();
  await p.getByRole('textbox',{name:t('Search'),exact:true}).fill('Aloe Field Care');
  await p.getByRole('button',{name:t('Search'),exact:true}).click();
  await p.getByRole('button',{name:t('Search & results'),exact:true}).click();
  await expect(p.getByRole('link',{name:t('From {business}',{business:'Aloe Field Care'}),exact:true}).first()).toBeVisible();
  await shot('native-'+locale+'-320');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verification'+(process.argv.includes('--web')?'-web':process.argv.includes('--native')?'-native':process.argv.includes('--locales')?'-locales':'')+'.json',JSON.stringify({shots,checks:['separate product and store destinations','44px store targets','return retains search','web keyboard order','long names wrap'],tiles:'controlled fixtures',native:'Expo browser, not device validation'},null,2));console.log('PASS result business links: '+shots.length+' captures');
} finally { await browser.close(); }
