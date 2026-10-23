import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
import {installMapTileFixture, MAP_TILE_FIXTURE_ID} from './testing/map-tile-fixture.mjs';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Local browser origin required');
assert.ok(!process.argv.some(value=>value==='--actual-tiles'||value.startsWith('--actual-tiles=')),'Automated reviews require synthetic map tiles.');
const out=process.env.SUQPAGE_SEARCH_CAPTURE_DIR||'.local/human-search-review';
fs.mkdirSync(out,{recursive:true,mode:0o700});
const browser=await chromium.launch();const evidence=[],tiles=[];
const market=page=>page.getByRole('main').getByRole('region',{name:'MirtPage Market',exact:true});
const results=page=>market(page).getByRole('region',{name:'Products',exact:true});
const visibleIds=page=>results(page).locator('.discovery-product-link').evaluateAll(links=>links.map(link=>Number(new URL(link.href).searchParams.get('product'))));
async function search(context,query,category='beauty-wellness'){
 const params=new URLSearchParams({scope:'products',q:query});if(category)params.set('category',category);
 const response=await context.request.get(`${base}/api/discovery?${params}`);assert.equal(response.status(),200,'Real search API succeeds');
 const result=await response.json();return result.searchProducts;
}
try {
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});
  const tileFixture=await installMapTileFixture(context);tiles.push(tileFixture);
  const page=await context.newPage();const errors=[],controlledDelayedOutcomes=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?view=search&q=lotion',{waitUntil:'domcontentloaded'});
  const targets=(await search(context,'lotion','')).filter(item=>item.name==='Aloe Body Lotion');
  assert.equal(targets.length,1,'Real search identifies exactly one seeded Aloe Body Lotion entity');
  const target=targets[0],targetHref=`/@${encodeURIComponent(target.businessHandle)}?product=${target.id}&ref=discovery`;
  const targetCard=results(page).locator('.discovery-product-card').filter({has:page.locator(`.discovery-product-link[href=${JSON.stringify(targetHref)}]`)});
  await expect(targetCard).toBeVisible();
  await page.goto(base+'/?view=search&industry=beauty-wellness',{waitUntil:'domcontentloaded'});
  const input=page.getByRole('searchbox',{name:'Search products',exact:true});
  for(const query of ['lotion','LOTION','body-lotion','lotions','find lotions in Addis Ababa']){
   const current=await search(context,query);
   assert.ok(current.some(item=>item.name==='Aloe Body Lotion'),'Human query retains the seeded matching product');
   await input.fill(query);
   await expect(page).toHaveURL(url=>url.searchParams.get('p.q')===query,{timeout:15000});
   await expect.poll(()=>visibleIds(page),{timeout:15000}).toEqual(current.map(item=>item.id));
   assert.deepEqual(new URL(page.url()).searchParams.getAll('p.category'),['beauty-wellness']);
   await expect(page.getByRole('button',{name:'Category 1',exact:true})).toBeVisible();
  }
  let releaseDelayed,held=0;
  const delayed=new Promise(resolve=>{releaseDelayed=resolve;});
  // Delay one genuine JSON response, not an obsolete RSC-query endpoint. The
  // current response must settle before the older response is released.
  const routePattern=url=>url.pathname==='/api/discovery'&&url.searchParams.get('scope')==='products'&&url.searchParams.get('q')==='aloe';
  await page.route(routePattern,async route=>{
   const response=await route.fetch();assert.equal(response.status(),200);held++;
   await delayed;
   try{await route.fulfill({response});controlledDelayedOutcomes.push({outcome:'fulfilled'});}
   catch(error){controlledDelayedOutcomes.push({outcome:'not fulfilled',error:String(error).slice(0,300),requestFailure:route.request().failure()?.errorText||null});}
  });
  await input.fill('aloe');await expect.poll(()=>held,{timeout:15000}).toBe(1);
  const lotionIds=(await search(context,'lotion')).map(item=>item.id);
  await input.fill('lotion');
  await expect.poll(()=>visibleIds(page),{timeout:15000}).toEqual(lotionIds);
  releaseDelayed();
  await expect.poll(()=>controlledDelayedOutcomes.length).toBe(1);
  await expect(input).toHaveValue('lotion');
  await expect(page).toHaveURL(url=>url.searchParams.get('p.q')==='lotion',{timeout:15000});
  await expect.poll(()=>visibleIds(page)).toEqual(lotionIds);
  await page.unroute(routePattern);
  for(const query of ['unknownbrand','body soap','lotion']){await input.fill(query);await page.waitForTimeout(60);}
  await expect(page).toHaveURL(url=>url.searchParams.get('p.q')==='lotion',{timeout:15000});
  await expect.poll(()=>visibleIds(page)).toEqual(lotionIds);
  await expect(page.getByRole('checkbox',{name:'Businesses',exact:true})).toHaveCount(0);
  await expect(market(page).locator('.discovery-business-results')).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Products',exact:true,level:2})).toBeVisible();
  await page.getByRole('button',{name:'Business locations',exact:true}).click();
  await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('');
  await expect(page.getByRole('button',{name:'Category',exact:true})).toBeVisible();
  await expect(market(page).locator('.leaflet-container')).toBeVisible();
  await expect.poll(()=>tileFixture.servedCount()).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Product listings',exact:true}).click();
  await expect(input).toHaveValue('lotion');
  await expect(page.getByRole('button',{name:'Category 1',exact:true})).toBeVisible();
  await page.screenshot({path:`${out}/lotion-${width}.png`,fullPage:true,caret:'initial'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
  await targetCard.locator('.discovery-product-link').click();
  await expect(page.locator('[data-product-page]')).toBeVisible();
  await page.goBack();await page.waitForLoadState('domcontentloaded');await expect(input).toHaveValue('lotion');
  await expect(page.getByRole('button',{name:'Category 1',exact:true})).toBeVisible();
  assert.equal((await search(context,'%')).length,0,'Literal punctuation cannot broaden the SQL search');
  await input.fill('%');await input.press('Enter');
  await expect(page).toHaveURL(url=>url.searchParams.get('p.q')==='%');
  await expect(results(page).getByText('No matches found',{exact:true})).toBeVisible();
  await input.fill('lotion');await input.press('Enter');
  await expect.poll(()=>visibleIds(page)).toEqual(lotionIds);
  assert.deepEqual(errors,[]);evidence.push({width,passed:true,controlledDelayedOutcomes,tileFixture:{id:MAP_TILE_FIXTURE_ID,fulfilled:tileFixture.servedCount(),uncontrolledRequests:tileFixture.externalCount(),providerAvailabilityTested:false}});await context.close();
 }
 fs.writeFileSync(`${out}/evidence.json`,JSON.stringify({base,evidence,typing:true,categoryPreserved:true,offeringOnly:true,detailBack:true,literalNoMatch:true}),{mode:0o600});
 console.log('PASS desktop/390/320 human searches, fast typing, category preservation and offering-only results, product navigation/back, literal no-match and overflow.');
}finally{await browser.close();for(const fixture of tiles)fixture.assertNoExternalRequests();}
