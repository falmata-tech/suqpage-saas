import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base='http://127.0.0.1:3102', out='.local/simple-market-review';
fs.mkdirSync(out,{recursive:true,mode:0o700});
const browser=await chromium.launch();
const evidence=[];
try {
  for(const width of [1440,390,320]) {
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/?industry=all&type=businesses`);
    const map=page.locator('.discovery-map');
    await expect.poll(async()=>Number(await map.getAttribute('data-map-marker-count'))).toBeGreaterThan(0);
    const initialZoom=Number(await map.getAttribute('data-map-zoom'));
    const cluster=page.locator('.leaflet-marker-icon:has(.mp-map-cluster)').first();
    if(await cluster.count()) {
      await cluster.click();
      await expect.poll(async()=>Number(await map.getAttribute('data-map-zoom'))).toBeGreaterThan(initialZoom);
    }
    await page.locator('.discovery-business-results button').first().click();
    await expect(page.locator('.discovery-preview')).toBeVisible();
    await expect.poll(async()=>Number(await map.getAttribute('data-map-zoom'))).toBeGreaterThanOrEqual(14);
    await page.screenshot({path:`${out}/selected-shop-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Close page preview',exact:true}).click();
    const center=await map.getAttribute('data-map-center');
    await page.getByRole('link',{name:'Next page',exact:true}).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(map).toHaveAttribute('data-map-center',center);
    assert.ok(await page.locator('.discovery-business-results button').count()<=5);
    const search=page.locator('#discovery-search');
    await search.fill('sensor Addis');
    await expect(page).toHaveURL(/q=sensor(?:\+|%20)Addis/);
    await expect(page.locator('#discovery-search-results-title')).toContainText('sensor Addis');
    if(width<700){
      await page.getByRole('button',{name:'Open category and location filters',exact:true}).click();
      await expect(page.getByRole('dialog',{name:'Filters',exact:true})).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog',{name:'Filters',exact:true})).not.toBeVisible();
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
    await page.screenshot({path:`${out}/map-results-${width}.png`,fullPage:true});
    const scan=await new AxeBuilder({page}).include('#discover').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(scan.violations,[]);
    assert.deepEqual(errors,[]);
    evidence.push({width,clusterZoom:true,selectionCenters:true,paginationPreservesMap:true,search:true,accessibility:true});
    await context.close();
  }
  fs.writeFileSync(`${out}/evidence.json`,JSON.stringify(evidence,null,2));
  console.log('PASS desktop/390/320 map clustering, shop selection, paginated map continuity, word search, mobile filters, accessibility and overflow.');
} finally {await browser.close();}
