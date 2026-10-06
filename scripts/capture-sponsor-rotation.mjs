import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
import { chromium, expect } from '@playwright/test';
const out = '.local/sponsor-storefront-review';
fs.mkdirSync(out, { recursive: true });
// Controlled sponsor data exercises timing and pool edges without modifying the database.
const bundle = await build({ stdin: { contents: `import React,{useState} from 'react';import{createRoot}from'react-dom/client';import Carousel from './components/SponsorCarousel';
const sponsors=[1,2,3].map(id=>({id:'s'+id,kind:'external',name:'Sponsor '+id,details:'Products and services in Addis Ababa',href:'https://example.com/'+id,imagePath:'',actionLabel:'Visit website'}));
function Fixture(){const[count,setCount]=useState(3);return <><button id="outside" onClick={()=>setCount(c=>(c+1)%4)}>Change pool</button><div style={{width:'100%',maxWidth:400}}><Carousel placements={sponsors.slice(0,count)} onOpenShowroom={()=>{}}/></div><div style={{height:1800}}/></>};createRoot(document.getElementById('root')).render(<Fixture/>);`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, outdir: '/tmp/suqpage-s51-bundle', plugins: [{ name: 'localization-fixture', setup(b) { b.onResolve({ filter: /^@\/lib\/i18n\/ui$/ }, () => ({ path: 'ui', namespace: 'fixture' })); b.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const useUiText=()=>text=>text' })); } }] });
const js = bundle.outputFiles.find(f => f.path.endsWith('.js')).text;
const css = bundle.outputFiles.find(f => f.path.endsWith('.css')).text;
const browser = await chromium.launch();
async function tick(page, ms = 6100) { await page.clock.runFor(ms); }
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.clock.install();
  await page.setContent('<html><body><div id="root"></div></body></html>');
  await page.addStyleTag({ content: css }); await page.addScriptTag({ content: js });
  const card = page.locator('[data-sponsor-id]');
  await expect(card).toHaveAttribute('data-sponsor-id', 's1');
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  for (const id of ['s2', 's3', 's1']) { await tick(page); await expect(card).toHaveAttribute('data-sponsor-id', id); }
  await card.hover(); await tick(page, 18000); await expect(card).toHaveAttribute('data-sponsor-id', 's1');
  await page.mouse.move(380, 820); await tick(page); await expect(card).toHaveAttribute('data-sponsor-id', 's2');
  await card.focus(); await tick(page, 18000); await expect(card).toHaveAttribute('data-sponsor-id', 's2');
  await page.locator('#outside').focus();
  await page.getByRole('button', { name: 'Pause sponsors', exact: true }).click();
  await page.locator('#outside').focus(); await page.mouse.move(380, 820);
  await tick(page, 18000); await expect(card).toHaveAttribute('data-sponsor-id', 's2');
  await page.getByRole('button', { name: 'Next sponsor', exact: true }).click(); await expect(card).toHaveAttribute('data-sponsor-id', 's3');
  await page.getByRole('button', { name: 'Previous sponsor', exact: true }).click(); await expect(card).toHaveAttribute('data-sponsor-id', 's2');
  await page.getByRole('button', { name: 'Resume sponsors', exact: true }).click();
  await page.locator('#outside').focus(); await page.mouse.move(380, 820);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await tick(page, 18000); await expect(card).toHaveAttribute('data-sponsor-id', 's2');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
  await tick(page); await expect(card).toHaveAttribute('data-sponsor-id', 's3');
  await page.evaluate(() => window.scrollTo(0, 1400)); await page.waitForTimeout(100);
  await tick(page, 18000); await expect(card).toHaveAttribute('data-sponsor-id', 's3');
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100);
  await tick(page); await expect(card).toHaveAttribute('data-sponsor-id', 's1');
  await page.locator('#outside').click(); await expect(card).toHaveCount(0);
  await page.locator('#outside').click(); await expect(card).toHaveCount(1); await expect(page.getByRole('button', { name: 'Next sponsor' })).toHaveCount(0);
  await tick(page, 18000); await expect(card).toHaveAttribute('data-sponsor-id', 's1');
  await page.locator('#outside').click(); await expect(page.getByRole('button', { name: 'Next sponsor' })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(page.getByRole('button', { name: 'Resume sponsors' })).toBeVisible();
  await tick(page, 18000); await expect(card).toHaveAttribute('data-sponsor-id', 's1');
  await page.getByRole('button', { name: 'Next sponsor' }).click(); await expect(card).toHaveAttribute('data-sponsor-id', 's2');
  assert.equal(await card.evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.deepEqual(errors, []); await page.close();
  console.log('PASS web sponsor cycle, equal turns, hover/focus/pause, next/previous, background/offscreen, zero/one/changed pool and reduced motion.');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const mobileErrors=[]; mobile.on('pageerror',e=>mobileErrors.push(e.message));
  await mobile.route('**/api/mobile/v1/featured?**', async route => {
    const response = await route.fetch(); const data = await response.json();
    data.sponsors = [1,2,3].map(id => ({ id:'s'+id,name:'Sponsor '+id,details:'Products and services in Addis Ababa',href:'https://example.com/'+id,imagePath:'' }));
    await route.fulfill({ json: data });
  });
  await mobile.clock.install();
  await mobile.goto('http://localhost:8082/featured');
  await expect(mobile.getByTestId('sponsor-s1')).toBeVisible({ timeout: 60000 });
  await expect(mobile.getByRole('button', {name:'Pause sponsors'})).toBeVisible();
  await mobile.clock.pauseAt(await mobile.evaluate(() => Date.now() + 1000));
  for (const id of ['s2','s3','s1']) { await tick(mobile); await expect(mobile.getByTestId('sponsor-'+id)).toBeVisible(); }
  await mobile.getByRole('button',{name:'Pause sponsors'}).click();
  await tick(mobile, 18000); await expect(mobile.getByTestId('sponsor-s1')).toBeVisible();
  await mobile.getByRole('button',{name:'Next sponsor'}).click(); await expect(mobile.getByTestId('sponsor-s2')).toBeVisible();
  await mobile.getByRole('button',{name:'Previous sponsor'}).click(); await expect(mobile.getByTestId('sponsor-s1')).toBeVisible();
  await mobile.screenshot({path:out+'/mobile-sponsors.png'});
  assert.deepEqual(mobileErrors,[]);
  await mobile.close(); console.log('PASS actual Expo browser carousel cycles and manual controls; native AppState/device behavior remains a separate device check.');
} finally { await browser.close(); }
