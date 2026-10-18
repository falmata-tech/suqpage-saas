import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Actual local product route; no catalog, provider, Auth or media projections mocked.
const output=process.env.SUQPAGE_MOBILE_GALLERY_REVIEW_DIR||'.local/mobile-gallery-keyboard';
assert.ok(path.resolve(output).startsWith(path.resolve('.local')+path.sep));
fs.mkdirSync(output,{recursive:true,mode:0o700});
const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 await page.goto('http://localhost:8082/product?handle=demo-aloe-field-care&id=74',{waitUntil:'domcontentloaded',timeout:60000});
 const gallery=page.getByTestId('offering-gallery');
 await expect(gallery).toBeVisible({timeout:30000});
 await gallery.focus();await expect(gallery).toBeFocused();
 const before=await gallery.evaluate(element=>({left:element.scrollLeft,width:element.clientWidth,content:element.scrollWidth}));
 if(before.content>before.width+1){
  await gallery.press('ArrowRight');
  await expect.poll(()=>gallery.evaluate(element=>element.scrollLeft),{timeout:5000}).toBeGreaterThan(before.left);
 }
 const after=await gallery.evaluate(element=>element.scrollLeft);
 const axe=await new AxeBuilder({page}).withRules(['scrollable-region-focusable']).analyze();
 assert.deepEqual(axe.violations,[],'Offering media must be reachable using a keyboard');
 await page.screenshot({path:path.join(output,'product-gallery-390.png')});
 fs.writeFileSync(path.join(output,'verified.json'),JSON.stringify({passed:true,platform:'React Native Web',focus:true,before,after,accessibilityViolations:axe.violations,limits:'Real local demo offering, keyboard and focus only; native touch/TalkBack and third-party video playback remain separate checks.'},null,2),{mode:0o600});
 console.log('PASS FE_BASE: actual offering gallery accepts keyboard focus/scroll and has no scrollable-region-focusable violation.');
}finally{await browser.close();}
