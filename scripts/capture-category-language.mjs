import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base='http://127.0.0.1:3102',out='.local/category-language-review';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
try{
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${base}/?view=search`);
  const panel=page.locator('#discovery-search-panel');await expect(panel).toBeVisible();
  await panel.getByRole('button',{name:'Filters',exact:true}).click();
  const chooser=page.getByLabel('Filter by category',{exact:true});
  await expect(chooser).toContainText('All categories');await chooser.focus();await page.keyboard.press('Enter');
  const categories=page.getByRole('group',{name:'Categories',exact:true});await expect(categories).toBeVisible();
  await expect(categories.locator('[data-category-illustration]')).toHaveCount(8);
  await expect(categories.getByRole('button',{name:'All categories',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.screenshot({path:`${out}/categories-${width}.png`,style:'nextjs-portal {visibility:hidden}'});
  const bounds=await panel.boundingBox(),options=await categories.boundingBox();assert.ok(options.x>=bounds.x&&options.x+options.width<=bounds.x+bounds.width+1);
  await page.keyboard.press('Escape');await expect(categories).toBeHidden();await expect(panel).toBeVisible();await expect(chooser).toBeFocused();
  await chooser.click();await categories.getByRole('button',{name:'Personal & home care',exact:true}).click();await expect(page).toHaveURL(/industry=beauty-wellness/);await expect(chooser).toContainText('Personal & home care');await expect(categories).toBeHidden();
  const audit=await new AxeBuilder({page}).include('#discovery-search-panel').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations,[]);
  await chooser.click();await categories.getByRole('button',{name:'All categories',exact:true}).click();await expect(page).toHaveURL(/industry=all/);
  await page.goto(`${base}/featured`);await expect(page.locator('.featured-week [data-category-illustration]')).toHaveCount(7);await expect(page.locator('.featured-week')).toBeVisible();await page.locator('.featured-week').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/featured-${width}.png`});
  await page.goto(`${base}/about`);const links=page.locator('section[aria-labelledby=about-categories-title]');await expect(links.getByRole('link')).toHaveCount(8);await expect(links.locator('[data-category-illustration]')).toHaveCount(8);await links.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/about-categories-${width}.png`});
  for(const link of await links.getByRole('link').all()){const href=await link.getAttribute('href');assert.ok(href.startsWith('/?industry=')&&href.endsWith('#discover'));}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await links.getByRole('link',{name:'Food & drink',exact:true}).click();await expect(page).toHaveURL(/industry=food-farming/);await expect(page.getByLabel('Filter by category')).toContainText('Food & drink');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS category illustrations on Market/Featured/About, keyboard/Escape, selected labels, filter/all reset, working About links, accessibility and desktop/390/320 captures.');
}finally{await browser.close();}
