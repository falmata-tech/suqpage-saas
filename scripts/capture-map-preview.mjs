import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium, expect} from '@playwright/test';
const base = process.env.SUQPAGE_TEST_BASE_URL || 'http://127.0.0.1:3102';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));
const dir = '.local/map-preview-review';fs.mkdirSync(dir,{recursive:true});
const browser = await chromium.launch();const records=[];
async function assertModal(page) {
 const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();
 assert.ok(await dialog.evaluate(el=>el.matches(':modal')),'Browser top layer is active');
 const box=await dialog.boundingBox(),size=page.viewportSize();
 assert.ok(box.x>=0 && box.y>=0 && box.x+box.width<=size.width+1 && box.y+box.height<=size.height+1,'Preview stays inside viewport');
 assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'No horizontal preview overflow');
 const close=dialog.locator('.discovery-preview-close, .nearby-showroom-viewer > header > button:last-child');
 await expect(close).toBeVisible();
 assert.ok(await close.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Close is above the drawer');
 for(let n=0;n<5;n++){await page.keyboard.press('Tab');assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)),'Focus remains in preview');}
 return dialog;
}
try {
 for(const [width,height,locale] of [[1440,900,'en'],[390,844,'en'],[320,568,'en'],[844,390,'en'],...[ 'am','om','so','ti'].map(locale=>[320,568,locale])].filter(([w,,l])=>!process.argv.includes('--pointer-only')||(l==='en'&&[390,1440].includes(w)))) {
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  await context.addCookies([{name:'suqpage-language',value:locale,url:base}]);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?view=search&type=businesses&q=Aloe',{waitUntil:'domcontentloaded'});
  const result=page.locator('.discovery-business-results > button').first();await expect(result).toBeEnabled({timeout:30000});
  await expect(page.locator('#discovery-search')).toBeEnabled();
  await result.click();let dialog=await assertModal(page);
  await expect(page.locator('.discovery-workbench')).toHaveAttribute('data-panel-open','true');
  const originalUrl=page.url();const target=await dialog.locator('a').getAttribute('href');assert.match(target,/^\/@.+\?ref=discovery$/);
  await dialog.locator('a').scrollIntoViewIfNeeded();await expect(dialog.locator('a')).toBeInViewport();
  await page.screenshot({path:`${dir}/preview-${width}-${height}-${locale}.png`});
  await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(result).toBeFocused();
  await expect(page.locator('#discovery-search')).toHaveValue('Aloe');assert.equal(page.url(),originalUrl);
  await result.click();dialog=await assertModal(page);
  await page.mouse.click(2,2);await expect(page.locator('dialog[open]')).toHaveCount(0);
  await result.click();dialog=await assertModal(page);
  // Stress long merchant content without mutating stored data.
  await dialog.locator('.discovery-preview-copy p').evaluate(el=>el.textContent='Long business description '.repeat(150));
  await dialog.locator('.discovery-preview-copy h3').evaluate(el=>el.textContent='LongBusinessName'.repeat(12));
  await page.setViewportSize({width:320,height:320});await assertModal(page);
  await dialog.locator('a').scrollIntoViewIfNeeded();await expect(dialog.locator('a')).toBeInViewport();
  await dialog.locator('.discovery-preview-close').click();await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.setViewportSize({width,height});
  // Exercise the real Leaflet marker callback with the drawer still open.
  const marker=page.locator('.mp-map-showroom').first().locator('xpath=..');await expect(marker).toBeAttached({timeout:20000});
  await marker.focus();await marker.press('Enter');await assertModal(page);
  await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);
  assert.ok(await page.evaluate(()=>document.activeElement!==document.body),'Visible focus fallback after marker redraw');
  if(locale==='en' && [390,1440].includes(width)) {
   await page.locator('.discovery-panel-close').click();
   const pin=page.locator('.mp-map-showroom').first();const id=await pin.getAttribute('data-showroom-id');
   const hit=page.locator(`.mp-map-showroom[data-showroom-id="${id}"]`).locator('xpath=..');
   const pinBounds=await hit.boundingBox(),mapBounds=await page.locator('.discovery-map').boundingBox();
   const targetX=width===390?width-30:Math.max(pinBounds.x+pinBounds.width/2,650);
   const dx=targetX-(pinBounds.x+pinBounds.width/2);
   if(Math.abs(dx)>2){
    const x=mapBounds.x+mapBounds.width/2,y=mapBounds.y+mapBounds.height-110;
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y,{steps:20});await page.mouse.up();
   }
   await page.locator('.discovery-panel-opener').click();
   await expect.poll(async()=>{const pin=await hit.boundingBox(),panel=await page.locator('#discovery-search-panel').boundingBox();return pin.x+pin.width/2>panel.x+panel.width;}).toBe(true);
   await hit.click();await assertModal(page);await page.keyboard.press('Escape');
   await expect(page.locator('.discovery-workbench')).toHaveAttribute('data-panel-open','true');
  }
  assert.deepEqual(errors,[]);records.push({width,height,locale});await context.close();
 }
 fs.writeFileSync(`${dir}/${process.argv.includes("--pointer-only")?"pointer":"verified"}.json`,JSON.stringify(records,null,2));console.log(`PASS ${records.length} preview states: drawer overlap, results, markers, focus, dismissal, long content and resizing.`);
}finally{await browser.close();}
