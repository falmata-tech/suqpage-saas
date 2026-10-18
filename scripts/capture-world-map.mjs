import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect as baseExpect} from '@playwright/test';
import {installMapTileFixture, MAP_TILE_FIXTURE_ID} from './testing/map-tile-fixture.mjs';

assert.ok(!process.argv.some(value => value === '--actual-tiles' || value.startsWith('--actual-tiles=')), 'Automated map drivers require synthetic tiles; real-provider checks are separate and manual.');
const mapTileFixtures = [];
console.info(JSON.stringify({mapTileFixture: MAP_TILE_FIXTURE_ID, providerProof: false}));

const expect=baseExpect.configure({timeout:20000}),dir='.local/world-map-review';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch(),checks=[];
try{
 for(const [kind,base] of [['web','http://127.0.0.1:3102'],['expo','http://localhost:8082']]){
  for(const width of [1440,390,320]){
   const context=await browser.newContext({serviceWorkers: 'block',viewport:{width,height:900}}),page=await context.newPage();
  mapTileFixtures.push(await installMapTileFixture(page.context()));
  page.setDefaultNavigationTimeout(60000);
   await page.goto(base+'/?q=lotion&view=map');
   const map=page.locator('.leaflet-container');await expect(map).toHaveAttribute('data-map-zoom',/\d+/);
   const zoomOut=page.getByRole('button',{name:'Zoom out',exact:true}),zoomIn=page.getByRole('button',{name:'Zoom in',exact:true});
   const reset=page.getByRole('button',{name:'Center Ethiopia',exact:true});
   await expect(map).toHaveAttribute('data-map-marker-count',/^[1-9]\d*$/);
   const initialCenter=await map.getAttribute('data-map-center'),count=await map.getAttribute('data-map-marker-count');
   while(Number(await map.getAttribute('data-map-zoom'))>1){await zoomOut.click();await page.waitForTimeout(250);}
   await expect(map).toHaveAttribute('data-map-zoom','1');await zoomOut.click();await expect(map).toHaveAttribute('data-map-zoom','1');
   await zoomIn.click();await expect(map).toHaveAttribute('data-map-zoom','2');await map.focus();
   await page.keyboard.press('ArrowRight');await page.waitForTimeout(350);await page.keyboard.press('ArrowUp');await page.waitForTimeout(500);
   const center=(await map.getAttribute('data-map-center')).split(',').map(Number);
   assert.ok(center[1]>49||center[0]>15.5,'Map remains beyond Ethiopia pan bounds');
   assert.equal(new URL(page.url()).searchParams.get('q'),'lotion');assert.equal(new URL(page.url()).searchParams.get('view'),'map');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${dir}/${kind}-world-${width}.png`,style:'nextjs-portal {visibility:hidden}'});
   await reset.click();await page.waitForTimeout(500);if(kind==='expo'){const expected=initialCenter.split(',').map(Number),actual=(await map.getAttribute('data-map-center')).split(',').map(Number);assert.ok(Math.abs(expected[0]-actual[0])<.02&&Math.abs(expected[1]-actual[1])<.02,'Reset preserves initial view within Leaflet pixel rounding');}else{const resetCenter=(await map.getAttribute('data-map-center')).split(',').map(Number);assert.ok(resetCenter[0]>=2.5&&resetCenter[0]<=15.5&&resetCenter[1]>=31.5&&resetCenter[1]<=49.5,'Existing reset fits Ethiopia bounds');}await expect(map).toHaveAttribute('data-map-marker-count',count);
   await page.screenshot({path:`${dir}/${kind}-reset-${width}.png`,style:'nextjs-portal {visibility:hidden}'});checks.push({mapTileFixture: MAP_TILE_FIXTURE_ID, providerProof: false,kind,width,distantCenter:center,reset:true,filtersRetained:true});await context.close();
  }
 }
 fs.writeFileSync(dir+'/verified.json',JSON.stringify({checks,mapTileFixture:MAP_TILE_FIXTURE_ID,providerProof:false,databaseChanges:0},null,2));console.log('PASS free world-map pan, zoom 1 floor, Ethiopia reset and filter/result preservation in desktop/phone web and Expo.');
}finally{await browser.close();
  for (const fixture of mapTileFixtures) fixture.assertNoExternalRequests();}
