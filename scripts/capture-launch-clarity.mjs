import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {installMapTileFixture, MAP_TILE_FIXTURE_ID} from './testing/map-tile-fixture.mjs';

assert.ok(!process.argv.some(value => value === '--actual-tiles' || value.startsWith('--actual-tiles=')), 'Automated map drivers require synthetic tiles; real-provider checks are separate and manual.');
const mapTileFixtures = [];
console.info(JSON.stringify({mapTileFixture: MAP_TILE_FIXTURE_ID, providerProof: false}));

const base=process.env.SUQPAGE_TEST_BASE_URL || 'http://127.0.0.1:3102',dir='.local/launch-clarity-review';
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Local browser evidence only');
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch();const records=[];
try {
 for(const width of [390,320,1440])for(const locale of ['en','am','om','so','ti']) {
  const context=await browser.newContext({serviceWorkers: 'block',viewport:{width,height:844},reducedMotion:'reduce'});
  await context.addCookies([{name:'suqpage-language',value:locale,url:base}]);
  const page=await context.newPage();
  mapTileFixtures.push(await installMapTileFixture(page.context())); const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base,{waitUntil:"domcontentloaded"});
  const opener=page.locator('button.discovery-panel-opener');await expect(opener).toBeVisible();
  await expect(opener.locator('.lucide-arrow-right')).toBeVisible();
  await expect(opener.locator('strong')).not.toBeEmpty();
  await expect(opener.locator('small')).not.toBeEmpty();
  assert.equal(await page.locator('input[type=search]:visible').count(),0);
  assert.equal(await page.locator('.discovery-workbench > form').count(),0);
  assert.ok(await opener.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.getBoundingClientRect().height>=44));
  await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({timeout:20000});
  await page.screenshot({path:`${dir}/market-${width}-${locale}.png`});
  await opener.click();await expect(opener).toBeHidden();
  assert.equal(new URL(page.url()).searchParams.get('q'),null,'Opening the drawer never performs a search');
  const search=page.locator('#discovery-search-panel .discovery-search');
  await expect(search).toBeVisible();
  await expect(page.locator('#discovery-filter-fields')).toBeVisible();
  await search.locator('input').fill('lotion');await search.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/q=lotion/, {timeout:20000});
  await expect(page.locator('.discovery-product-results a').first()).toBeVisible();
  await expect(page.locator('.discovery-product-results a').first()).toContainText('Aloe Body Lotion');
  await expect(page.locator('.discovery-product-results a').first().locator('[class*="example"]')).toBeVisible();
  const space=await page.locator('.discovery-search-results').evaluate(el=>el.clientHeight);assert.ok(space>250,`Results too short: ${space}`);
  await page.screenshot({path:`${dir}/results-${width}-${locale}.png`});
  await page.locator('.discovery-panel-close').click();await expect(opener).toBeVisible();
  await expect(opener).toBeFocused();await expect(search).toBeHidden();
  await opener.press('Enter');await expect(search.locator('input')).toHaveValue('lotion');
  await expect(page.locator('.discovery-product-results a').first()).toContainText('Aloe Body Lotion');
  for(const route of process.argv.includes('--panel-only') ? [] : ['/featured','/about','/login','/@demo-aloe-field-care']) {
   await page.goto(base+route,{waitUntil:"domcontentloaded"});await expect(page.locator('.africmade-wordmark').first()).toHaveText('AfricMade');
   if(route==='/featured') {
    await expect(page.locator('#daily-featured-title')).toBeVisible({timeout:20000});
    await expect(page.locator('.featured-card').first()).toBeVisible();
    await expect(page.locator('button.featured-card').first()).toBeEnabled({timeout:20000});
    assert.equal(await page.locator('.featured-program').count(),0);
    await expect(page.locator('.featured-card [class*="example"]').first()).toBeVisible();
    await page.locator('button.featured-card').first().click();
    await expect(page.locator('.discovery-preview [class*="example"]')).toBeVisible();
    await page.locator('.discovery-preview-close').click();
    await expect(page.locator('.discovery-preview')).toHaveCount(0);
   } else await expect(page.locator('main h1').first()).toBeVisible();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${route} ${width} ${locale}`);
   if(route.startsWith('/@')) await expect(page.locator('[class*="LaunchClarity"][class*="notice"]')).toHaveCount(0);
   await page.screenshot({path:`${dir}/${route.startsWith('/@')?'shop':route.slice(1)}-${width}-${locale}.png`});
  }
  assert.deepEqual(errors,[]);records.push({mapTileFixture: MAP_TILE_FIXTURE_ID, providerProof: false,width,locale,resultsHeight:space});await context.close();
 }
 fs.writeFileSync(`${dir}/${process.argv.includes('--panel-only') ? 'panel' : 'public'}-verified.json`,JSON.stringify(records,null,2));console.log(`PASS 15 viewport/locale combinations: ${process.argv.includes('--panel-only') ? 'panel opener, filters, search, results, collapse, focus and retained query' : 'panel search and public routes'}.`);
} finally {await browser.close();
  for (const fixture of mapTileFixtures) fixture.assertNoExternalRequests();}
