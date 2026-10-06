import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '@playwright/test';
const output='showroom-projects/accent-personalization-preview/reviews';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1280}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765');
await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
const evidence=[];
try{
 const logo=await page.locator('#variant-0 .brand').evaluate(el=>getComputedStyle(el).color);
 const photos=await page.locator('#variant-0 .product-photo').evaluateAll(els=>els.map(el=>({src:el.src,filter:getComputedStyle(el).filter,opacity:getComputedStyle(el).opacity})));
 for(const name of ['Deep teal','Hot pink','Acid lime','Electric violet','Bright yellow','White','Black']){
  await page.getByRole('button',{name,exact:true}).click();
  const metrics=await page.evaluate(()=>{const el=document.querySelector('#variant-0');const p=palette(el.dataset.color);return{color:el.dataset.color,button:contrast(p.accent,p.on),text:contrast(p.ink,'#FFFFFF'),softText:contrast(p.ink,p.soft),border:contrast(p.edge,'#FFFFFF')};});
  assert.ok(metrics.button>=4.5,JSON.stringify(metrics));assert.ok(metrics.text>=4.5);assert.ok(metrics.softText>=4.5);assert.ok(metrics.border>=3);
  assert.equal(await page.locator('#variant-0 .brand').evaluate(el=>getComputedStyle(el).color),logo);
  assert.deepEqual(await page.locator('#variant-0 .product-photo').evaluateAll(els=>els.map(el=>({src:el.src,filter:getComputedStyle(el).filter,opacity:getComputedStyle(el).opacity}))),photos);
  evidence.push(metrics);
 }
 // Check the derivation beyond the presets, including very pale/saturated colors.
 const sampled=await page.evaluate(()=>{let checked=0;for(let r=0;r<=255;r+=17)for(let g=0;g<=255;g+=17)for(let b=0;b<=255;b+=17){const p=palette(hex([r,g,b]));if(contrast(p.accent,p.on)<4.5||contrast(p.ink,p.soft)<4.5||contrast(p.edge,'#FFFFFF')<3)return{failure:p};checked++;}return{checked};});
 assert.equal(sampled.checked,4096,JSON.stringify(sampled));
 await page.locator('#hex').fill('#123ABC');await page.getByRole('button',{name:'Preview',exact:true}).click();assert.equal(await page.locator('#variant-0').getAttribute('data-color'),'#123ABC');
 await page.locator('#hex').fill('bad');await page.getByRole('button',{name:'Preview',exact:true}).click();assert.equal(await page.locator('#hex').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#variant-0').getAttribute('data-color'),'#123ABC');
 await page.getByRole('button',{name:'Deep teal',exact:true}).click();
 for(const tint of ['0','14','8']){await page.locator('#tint').fill(tint);assert.equal(await page.locator('#variant-0 .wash').evaluate(el=>getComputedStyle(el).opacity),String(Number(tint)/100));}
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:width===1440?1280:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const control of await page.locator('button,input').all()){const box=await control.boundingBox();assert.ok(box.width>=44&&box.height>=44,JSON.stringify(box));}
  await page.screenshot({path:output+'/comparison-'+width+'.png',fullPage:true});
  if(width===390){await page.locator('#variant-0 .phone').screenshot({path:output+'/phone-teal.png'});await page.locator('#variant-1 .phone').screenshot({path:output+'/phone-pink.png'});await page.locator('#variant-2 .phone').screenshot({path:output+'/phone-lime.png'});}
 }
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Electric violet',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await page.getByRole('button',{name:'Electric violet',exact:true}).getAttribute('aria-pressed'),'true');
 await page.locator('#variant-0 .phone').screenshot({path:output+'/phone-violet.png'});
 assert.deepEqual(errors,[]);
 fs.writeFileSync(output+'/verification.json',JSON.stringify({presets:evidence,sampledColors:sampled.checked,viewports:[1440,390,320],checks:['contrast','untinted product images','unchanged platform color','valid/invalid hex','cover tint 0/8/14%','44px controls','no overflow','keyboard selection','no browser errors'],scope:'Static design prototype only; no accounts or APIs'},null,2));
 console.log('PASS: 7 presets, 4096 contrast samples, 3 viewports, tint/custom/keyboard controls.');
}finally{await browser.close();}
