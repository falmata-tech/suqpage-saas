import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base='http://127.0.0.1:3102',dir='.local/buying-chat-entry-review';
fs.mkdirSync(dir,{recursive:true});const browser=await chromium.launch();const results=[];
try{
 for(const width of [320,1440])for(const locale of ['en','am','om','so','ti']){
  const context=await browser.newContext({viewport:{width,height:width===320?700:900}});
  await context.addCookies([{name:'suqpage-language',value:locale,url:base}]);
  const page=await context.newPage();await page.goto(base+'/about');
  const launcher=page.locator('button[data-channel=buying]');await expect(launcher.locator('.lucide-message-circle')).toBeVisible();
  const primary=await launcher.locator('strong').boundingBox(),secondary=await launcher.locator('small').boundingBox();
  assert.ok(primary&&secondary&&secondary.y>=primary.y+primary.height-1,'Live chat sublabel appears below the service name');
  if(locale==='en')await expect(launcher).toHaveAccessibleName('Buying assistance Live chat');
  await page.screenshot({path:`${dir}/launcher-${width}-${locale}.png`,style:'nextjs-portal {visibility:hidden}'});
  await launcher.click();
  const dialog=page.getByRole('dialog');await expect(dialog.locator('#public-buying-message')).toBeVisible();
  assert.equal(await dialog.locator('input').count(),2);
  const message=await dialog.locator('#public-buying-message').boundingBox(),name=await dialog.locator('#public-buying-name').boundingBox();assert.ok(message&&name&&message.y<name.y,'Message precedes contact fields');
  await dialog.locator('#public-buying-message').fill('Please help me check a product.');await dialog.locator('#public-buying-name').fill('Example');await dialog.locator('#public-buying-phone').fill('+447700900999');
  const submit=dialog.locator('button[type=submit]');await expect(submit).toBeEnabled();await submit.scrollIntoViewIfNeeded();
  const box=await submit.boundingBox();assert.ok(box&&box.height>=44&&box.y>=0&&box.y+box.height<=page.viewportSize().height);
  assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  if(locale==='en'){const axe=await new AxeBuilder({page}).include('.public-support-dialog').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.length})),[]);}
  await page.screenshot({path:`${dir}/entry-${width}-${locale}.png`,style:'nextjs-portal {visibility:hidden}'});
  await dialog.locator('header button').click();await expect(launcher).toBeFocused();
  results.push({width,locale,passed:true});await context.close();
 }
 fs.writeFileSync(dir+'/verified.json',JSON.stringify(results,null,2));console.log('PASS chat-first entry in five languages at 320/1440, reachable controls, focus restoration and English accessibility checks. No requests submitted.');
}finally{await browser.close();}
