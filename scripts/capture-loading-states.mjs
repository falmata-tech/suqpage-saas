import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
const out='.local/owner-profile-review/loading';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
try{
 for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage();let release;
  const pending=new Promise(resolve=>release=resolve);
  await context.route('**/api/auth/email/start',async route=>{await pending;await route.fulfill({status:503,json:{error:'Please try again.'}});});
  await page.goto('http://127.0.0.1:3102/login');await page.getByLabel('Email',{exact:true}).fill('loading-review@example.test');await page.getByRole('button',{name:'Continue with email',exact:true}).click();
  await expect(page.locator('.suqpage-loading')).toBeVisible();assert.equal(await page.locator('.suqpage-loading-track i').evaluate(e=>getComputedStyle(e).animationName),reduced?'none':'suqpage-loading-slide');
  await page.screenshot({path:`${out}/web-pending-${reduced?'reduced':'animated'}.png`});release();await expect(page.locator('.platform-login-form').getByRole('alert')).toHaveText('Please try again.');await expect(page.locator('.suqpage-loading')).toHaveCount(0);await page.screenshot({path:`${out}/web-error-${reduced?'reduced':'animated'}.png`});await context.close();
 }
 for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage();let release;let fail=true;
  const pending=new Promise(resolve=>release=resolve);
  await context.route('**/api/mobile/v1/market**',async route=>{if(!fail)return route.continue();await pending;await route.fulfill({status:503,json:{error:'Please try again.'}});});
  await page.goto('http://localhost:8082/?view=search');await expect(page.getByRole('progressbar').first()).toBeVisible();const moving=page.getByRole('progressbar').first().locator('div[style*="transform"]').first();await expect(moving).toBeVisible();await page.waitForTimeout(150);const before=await moving.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(250);const after=await moving.evaluate(e=>getComputedStyle(e).transform);if(reduced)assert.equal(after,before,'Native reduced-motion track is static');else assert.notEqual(after,before,'Native track loops while pending');await page.screenshot({path:`${out}/expo-pending-${reduced?'reduced':'animated'}.png`});release();await expect(page.getByText('Please try again.',{exact:true})).toBeVisible();await expect(page.getByRole('progressbar')).toHaveCount(0);await page.screenshot({path:`${out}/expo-error-${reduced?'reduced':'animated'}.png`});fail=false;await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(page.getByText(/\d+ results/)).toBeVisible({timeout:25000});await expect(page.getByRole('progressbar')).toHaveCount(0);await context.close();
 }
 fs.writeFileSync(out+'/verified.json',JSON.stringify({webAuth:'pending/error; no email sent',expoMarket:'pending/error/retry/settled',reducedMotion:true,mocks:'delayed failures only; market retry uses real local API'},null,2));console.log('PASS themed loading pending/error/retry/settled and reduced-motion phone captures');
}finally{await browser.close();}
