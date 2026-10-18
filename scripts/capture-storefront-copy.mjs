import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { MARKET_STOREFRONT_COPY, ABOUT_STOREFRONT_SECTIONS } from '../lib/storefront-copy.ts';
import { createUiText, languageNames } from '../lib/i18n/core.ts';
const copyOnly=process.argv.includes('--copy-only');
const marketOnly=process.argv.includes('--market-only');
const out=process.env.SUQPAGE_COPY_CAPTURE_DIR || (copyOnly?'.local/copy-s63/screens':'.local/sponsor-storefront-review'); fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const records=[];
const blank=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=','base64');
function watchErrors(page, errors){
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',message=>{if(message.type()==='error'&&/hydration|hydrated|Unexpected text node/i.test(message.text()))errors.push(message.text());});
}
async function readyMap(page){
 // FE-065/S103: initial discovery is a bounded server browse, not a zero-state.
 // Wait for the actual map renderer and its reported marker count.
 await page.waitForFunction(()=>document.querySelector('.leaflet-pane')&&Array.from(document.querySelectorAll('[data-map-marker-count]')).some(node=>Number(node.getAttribute('data-map-marker-count'))>=0),{},{timeout:30000});
}
async function capture(page,name){
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>Array.from(document.images).filter(i=>i.loading!=='lazy').every(i=>i.complete),{},{timeout:15000});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' no horizontal overflow');
 // Hiding carets injects inline styles into inputs and can race streamed React
 // hydration. No input is focused in these review states; preserve its style.
 await page.screenshot({path:out+'/'+name+'.png',caret:'initial'});records.push(name);
}
try{
 for(const locale of (process.env.SUQPAGE_CAPTURE_LOCALES || 'en,am,om,so,ti').split(',')){
  const t=createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync('lib/i18n/messages/'+locale+'.json','utf8')));
  for(const width of (locale==='en'?[1440,390,320]:[390,320])){
   const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
   await context.addCookies([{name:'suqpage-language',value:locale,url:'http://127.0.0.1:3102'}]);
   await context.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:blank}));
   const page=await context.newPage(); const errors=[];watchErrors(page,errors);
   // Use explicit visible-content/font/image/map checks instead of coupling the
   // copy review to the page's unrelated resource load event.
   await page.goto('http://127.0.0.1:3102/',{waitUntil:'domcontentloaded'});
   await expect(page.getByRole('heading',{name:t(MARKET_STOREFRONT_COPY.title),exact:true})).toBeVisible();
   await expect(page.getByText(t(MARKET_STOREFRONT_COPY.description),{exact:true})).toBeVisible();
   await expect(page.getByRole('button',{name:t('View products'),exact:true})).toBeVisible();
   await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',`${t(MARKET_STOREFRONT_COPY.title)} ${t(MARKET_STOREFRONT_COPY.description)}`);
   await readyMap(page);
   await capture(page,`web-market-${locale}-${width}`);
   if(marketOnly){assert.deepEqual(errors,[]);await context.close();continue;}
   await page.goto('http://127.0.0.1:3102/about',{waitUntil:'domcontentloaded'});
   await expect(page.getByRole('heading',{name:t(ABOUT_STOREFRONT_SECTIONS[0].title),exact:true})).toBeVisible();
   await capture(page,`web-about-${locale}-${width}`);
   await page.getByRole('heading',{name:t(ABOUT_STOREFRONT_SECTIONS[1].title),exact:true}).scrollIntoViewIfNeeded();
   await capture(page,`web-businesses-${locale}-${width}`);
   await expect(page.locator('#for-customers').getByRole('link',{name:t(ABOUT_STOREFRONT_SECTIONS[0].action),exact:true})).toHaveAttribute('href','/');
   await expect(page.locator('#for-businesses').getByRole('link',{name:t(ABOUT_STOREFRONT_SECTIONS[1].action),exact:true})).toHaveAttribute('href','/login');
   if(!copyOnly){
   await page.goto('http://127.0.0.1:3102/featured',{waitUntil:'domcontentloaded'});
   const sponsor=page.locator('#featured-sponsors');await expect(sponsor).toBeVisible();await expect(sponsor.locator('[data-sponsor-id]')).toHaveCount(1);
   for(const btn of await sponsor.getByRole('button').all()){const bounds=await btn.boundingBox();assert.ok(bounds.height>=44&&bounds.width>=44);await expect(btn).toBeInViewport();}
   await capture(page,`web-sponsors-${locale}-${width}`);
   }else{
    await page.goto('http://127.0.0.1:3102/login',{waitUntil:'domcontentloaded'});
    await expect(page.getByText(t("Create a showroom for what you sell, make or offer. Already have one? Sign in to manage your page."),{exact:true})).toBeVisible();
    await capture(page,`web-account-${locale}-${width}`);
   }
   assert.deepEqual(errors,[]);await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:blank}));
  const page=await context.newPage();const errors=[];watchErrors(page,errors);
  await page.goto('http://localhost:8082',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:'Language',exact:true})).toBeVisible({timeout:30000});
  if(locale!=='en'){
   await page.getByRole('button',{name:'Language',exact:true}).click();
   await page.getByRole('radio',{name:languageNames[locale],exact:true}).click();
   await page.getByRole('button',{name:t('Close'),exact:true}).last().click();
  }
  await expect(page.getByText(t(MARKET_STOREFRONT_COPY.title),{exact:true})).toBeVisible();
  await expect(page.getByText(t(MARKET_STOREFRONT_COPY.description),{exact:true})).toBeVisible();
  await readyMap(page);
  await capture(page,`mobile-market-${locale}`);
  await page.setViewportSize({width:320,height:700});
  await capture(page,`mobile-market-small-${locale}`);
  await page.setViewportSize({width:390,height:844});
  if(marketOnly){assert.deepEqual(errors,[]);await context.close();continue;}
  // About lives in Account; use the app's navigation so the browser preview's
  // memory-only language preference is retained, as it is during normal use.
  await page.getByRole('tab',{name:t('About'),exact:true}).click();
  await expect(page.getByText(t(ABOUT_STOREFRONT_SECTIONS[0].title),{exact:true})).toBeVisible();
  await capture(page,`mobile-about-${locale}`);
  await page.getByRole('button',{name:t('For businesses'),exact:true}).click();
  await expect(page.getByTestId('about-businesses').getByRole('button',{name:t('Create your business page'),exact:true})).toBeInViewport();
  await capture(page,`mobile-businesses-${locale}`);
  if(!copyOnly){
  await page.getByRole('tab',{name:t('Featured'),exact:true}).click();
  const sponsor=page.getByTestId('sponsor-carousel');await expect(sponsor).toBeVisible();
  await expect(sponsor.getByRole('button',{name:t('Resume sponsors'),exact:true})).toBeVisible();
  await capture(page,`mobile-sponsors-${locale}`);
  await page.setViewportSize({width:320,height:700});await capture(page,`mobile-sponsors-small-${locale}`);
  }else{
   await page.getByTestId('about-businesses').getByRole('button',{name:t('Create your business page'),exact:true}).click();
   await expect(page.getByText(t("Create a showroom for what you sell, make or offer. Already have one? Sign in to manage your page."),{exact:true})).toBeVisible();
   await capture(page,`mobile-account-${locale}`);
   await page.setViewportSize({width:320,height:700});await capture(page,`mobile-account-small-${locale}`);
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 fs.writeFileSync(out+'/copy-verification-'+(process.env.SUQPAGE_CAPTURE_LOCALES || 'all')+'.json',JSON.stringify({states:records,tiles:'stubbed to avoid automated traffic to OSM',data:'actual local catalog; no writes',native:'Expo browser preview, not device evidence'},null,2));
 console.log(`PASS ${records.length} web/mobile viewport and language states.`);
}finally{await browser.close();}
