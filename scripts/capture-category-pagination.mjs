import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3101';if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Local browser origin required');
const out=process.env.SUQPAGE_TEST_SCREENSHOT_DIR||'/tmp/suqpage-category-review';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch();
try{const context=await browser.newContext();const page=await context.newPage();for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:width===1440?1000:844});await page.goto(`${base}/?view=search&industry=electronics`);
 await expect(page.locator('.discovery-search-workspace')).toBeVisible();await expect(page.locator('.discovery-product-results > a')).toHaveCount(5);
 const visibleBottom=await page.evaluate(()=>{const tabs=document.querySelector('.public-mobile-tabs');const box=tabs?.getBoundingClientRect();return box&&box.height>0?Math.min(innerHeight,box.top):innerHeight;});
 const pager=page.locator('.discovery-pagination');const pagerBox=await pager.boundingBox();assert.ok(pagerBox&&pagerBox.y>=0&&pagerBox.y+pagerBox.height<=visibleBottom+1,`Pagination is visible before scrolling ${width}`);
 const map=page.locator('.leaflet-container');await expect(map).toBeVisible();await map.evaluate(el=>el.dataset.paginationRetained='yes');
 const before=await page.locator('.discovery-product-results > a').first().getAttribute('href');
 await page.getByRole('link',{name:'Next page',exact:true}).click();await expect(page).toHaveURL(/page=2/);await expect(page.locator('.discovery-pagination')).toContainText('Page 2');
 assert.notEqual(await page.locator('.discovery-product-results > a').first().getAttribute('href'),before);await expect(map).toHaveAttribute('data-pagination-retained','yes');
 await page.getByRole('link',{name:'Previous page',exact:true}).click();await expect(page.locator('.discovery-pagination')).toContainText('Page 1');
 await expect(page.locator('.discovery-product-results > a').first()).toHaveAttribute('href',before);
 await expect(page.getByRole('checkbox',{name:'Businesses',exact:true})).toHaveCount(0);
 await expect(page.locator('.discovery-business-results')).toHaveCount(0);
 await page.reload();await expect(page.locator('.discovery-product-results > a')).toHaveCount(5);
 await page.goto(`${base}/?view=search&industry=electronics&type=businesses`);
 await expect(page.getByRole('heading',{name:'Products & services',exact:true})).toBeVisible();
 await expect(page.locator('.discovery-product-results > a')).toHaveCount(5);
 await expect(page.locator('.discovery-business-results')).toHaveCount(0);
 await expect(page.locator('.leaflet-container')).toBeVisible();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const audit=await new AxeBuilder({page}).include('.discovery-summary').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations,[]);
 await page.screenshot({path:`${out}/category-${width}.png`,style:'nextjs-portal {visibility:hidden}'});console.log(`PASS category without query, SQL page navigation, offering-only legacy URL/reload, retained map and accessibility ${width}px`);
 }}finally{await browser.close();}
