import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { localBrowserCookies, localBrowserQuery, closeLocalBrowserRuntime } from './local-browser-auth.mjs';
import {installMapTileFixture, MAP_TILE_FIXTURE_ID} from './testing/map-tile-fixture.mjs';

assert.ok(!process.argv.some(value => value === '--actual-tiles' || value.startsWith('--actual-tiles=')), 'Automated map drivers require synthetic tiles; real-provider checks are separate and manual.');
const mapTileFixtures = [];
console.info(JSON.stringify({mapTileFixture: MAP_TILE_FIXTURE_ID, providerProof: false}));

const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3101';
const out=process.env.SUQPAGE_ACCESSIBILITY_OUTPUT||'/tmp/suqpage-accessibility-audit.json';
const [business]=await localBrowserQuery("SELECT handle FROM businesses WHERE status='active' ORDER BY id LIMIT 1");
const routes={public:['/','/featured','/about','/login','/request','/privacy','/terms',`/@${business.handle}`],client:['/dashboard','/dashboard/account','/dashboard/products','/dashboard/business','/dashboard/page-editor','/dashboard/settings','/dashboard/inquiries','/dashboard/support'],platform_admin:['/dashboard/admin','/dashboard/admin/businesses','/dashboard/admin/staff','/dashboard/admin/page-reviews','/dashboard/admin/featured-schedule','/dashboard/admin/sponsors','/dashboard/support/agents','/dashboard/clients/new']};
const browser=await chromium.launch();const results=[];
try{
 for(const [role,paths]of Object.entries(routes)){
  const context=await browser.newContext({serviceWorkers: 'block'});if(role!=='public')await context.addCookies(await localBrowserCookies(role,base));const page=await context.newPage();
  mapTileFixtures.push(await installMapTileFixture(page.context()));
  for(const width of [1440,390,320]){await page.setViewportSize({width,height:width===1440?1000:844});
   for(const pathname of paths){const errors=[];const onError=error=>errors.push(error.message);page.on('pageerror',onError);const response=await page.goto(`${base}${pathname}`,{waitUntil:'domcontentloaded'});assert.ok(response.status()<400,`${role} ${width}px ${pathname}: HTTP ${response.status()}`);await page.locator('main').waitFor();await page.evaluate(()=>document.fonts.ready);const audit=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();const structure=await page.evaluate(()=>({mains:document.querySelectorAll('main').length,h1s:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+1}));results.push({mapTileFixture: MAP_TILE_FIXTURE_ID, providerProof: false,role,width,path:pathname,status:response.status(),structure,errors,violations:audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});page.off('pageerror',onError);}
  }await context.close();
 }
}finally{await browser.close();await closeLocalBrowserRuntime();
  fs.writeFileSync(out,JSON.stringify(results,null,2),{mode:0o600});
  for (const fixture of mapTileFixtures) fixture.assertNoExternalRequests();}
const failures=results.filter(r=>r.status>=400||r.structure.mains!==1||r.structure.h1s!==1||r.structure.overflow||r.errors.length||r.violations.length);
assert.deepEqual(failures,[],`Inspect ${out}`);console.log(`${results.length} current public/owner/admin desktop and phone accessibility states passed.`);
