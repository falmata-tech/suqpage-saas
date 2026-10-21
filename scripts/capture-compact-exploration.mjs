import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {createUiText} from '../lib/i18n/core.ts';
const base='http://127.0.0.1:3102',out='.local/workspace-design-s109/web';
fs.mkdirSync(out,{recursive:true,mode:0o700});
const browser=await chromium.launch(),context=await browser.newContext(),page=await context.newPage();
const errors=[],states=[];
page.on('pageerror',error=>errors.push(error.message));
page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(60000);
try {
  for(const locale of ['en','am','om','so','ti']){
    const t=locale==='en'?text=>text:createUiText(JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
    await context.addCookies([{name:'suqpage-language',value:locale,url:base}]);
    for(const width of [320,390,1440]){
      await page.setViewportSize({width,height:width===1440?1000:844});
      await page.goto(base);await expect(page.getByRole('button',{name:t('Businesses'),exact:true})).toBeEnabled();
      for(const panel of ['businesses','products']){
        await page.getByRole('button',{name:t(panel==='businesses'?'Businesses':'Products'),exact:true}).click();
        const scope=page.locator('[data-search-scope='+panel+']');await expect(scope).toBeVisible();
        await expect(page.locator('[data-search-scope]')).toHaveCount(1);
        await page.waitForTimeout(350);
        const metrics=await page.evaluate(()=>{
          const rect=selector=>{const b=document.querySelector(selector).getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};
          return {overflow:document.documentElement.scrollWidth>innerWidth+1,viewport:innerHeight,stage:rect('[class*=viewport]'),handle:rect('[class*=peek]'),controls:rect('[data-search-scope]'),chips:[...document.querySelectorAll('[data-search-scope] [class*=filters] button')].map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}))};
        });
        assert.equal(metrics.overflow,false);assert.ok(metrics.handle.width>=48&&metrics.handle.height>=48);
        assert.ok(metrics.chips.every(chip=>chip.width>=48&&chip.height>=48));
        if(width<761)assert.ok(metrics.stage.height>=380,'Compact exploration has a substantial content viewport.');
        await page.screenshot({path:`${out}/${locale}-${width}-${panel}.png`,fullPage:true,style:'nextjs-portal{visibility:hidden}'});
        states.push({locale,width,panel,...metrics});
      }
      if(width===390){
        await page.getByRole('button',{name:t('About Suqpage'),exact:true}).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('dialog').getByRole('button',{name:t('Close'),exact:true}).click();
        await expect(page.getByRole('button',{name:t('About Suqpage'),exact:true})).toBeFocused();
      }
    }
  }
  for(const locale of ['en','am','om','so','ti']){
    const t=locale==='en'?text=>text:createUiText(JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
    await context.addCookies([{name:'suqpage-language',value:locale,url:base}]);await page.setViewportSize({width:320,height:568});await page.goto(base);
    await expect(page.getByRole('button',{name:t('Businesses'),exact:true})).toBeEnabled();
    for(const panel of ['businesses','products']){
      await page.getByRole('button',{name:t(panel==='businesses'?'Businesses':'Products'),exact:true}).click();await page.waitForTimeout(350);
      const handle=await page.locator('[class*=peek]').boundingBox(),launcher=await page.locator('.public-support-launcher button').boundingBox();
      assert.ok(handle&&launcher);assert.ok(launcher.width>=48&&launcher.height>=48);
      assert.ok(handle.x+handle.width<=launcher.x||launcher.x+launcher.width<=handle.x||handle.y+handle.height<=launcher.y||launcher.y+launcher.height<=handle.y,'Short-screen transport must not cover the pane handle.');
      if(panel==='businesses'){
        const map=await page.locator('.discovery-map-stage').boundingBox();
        for(const button of await page.locator('.discovery-floating-buttons button').all()){
          const box=await button.boundingBox();assert.ok(box.y>=map.y&&box.y+box.height<=map.y+map.height+1,'Map controls stay inside the short map viewport.');
          assert.ok(box.x+box.width<=launcher.x||launcher.x+launcher.width<=box.x||box.y+box.height<=launcher.y||launcher.y+launcher.height<=box.y,'Short-screen transport must not cover map controls.');
        }
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      await page.screenshot({path:`${out}/${locale}-320-short-${panel}.png`,fullPage:true,style:'nextjs-portal{visibility:hidden}'});states.push({locale,width:320,height:568,panel,handle,launcher});
    }
  }
  await context.addCookies([{name:'suqpage-language',value:'en',url:base}]);
  await page.setViewportSize({width:390,height:844});await page.goto(base);
  await expect(page.getByRole('button',{name:'Businesses',exact:true})).toBeEnabled();
  const handle=page.getByRole('button',{name:'View products',exact:true});
  const point=await handle.boundingBox();await page.mouse.move(point.x+24,point.y+24);await page.mouse.down();await page.mouse.move(point.x-76,point.y+24,{steps:5});
  await expect(page.locator('[data-dragging=true]')).toHaveCount(1);await page.mouse.up();
  await expect(page.getByRole('button',{name:'Products',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-dragging=true]')).toHaveCount(0);
  await page.getByRole('button',{name:'Map only',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:'Businesses',exact:true})).toHaveAttribute('aria-pressed','true');
  const mapNode=await page.locator('.leaflet-container').elementHandle();
  await page.getByRole('button',{name:'Products',exact:true}).click();
  await page.locator('.discovery-search-results').evaluate(list=>list.scrollTop=140);
  const scroll=await page.locator('.discovery-search-results').evaluate(list=>list.scrollTop);
  await page.getByRole('button',{name:'Businesses',exact:true}).click();await page.getByRole('button',{name:'Products',exact:true}).click();
  assert.equal(await page.locator('.discovery-search-results').evaluate(list=>list.scrollTop),scroll,'Switching preserves loaded product scroll.');
  await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('aloe');
  await page.getByRole('button',{name:'Businesses',exact:true}).click();await page.getByRole('searchbox',{name:'Search businesses',exact:true}).fill('sensor');
  await page.getByRole('button',{name:'Products',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('aloe');
  assert.ok(await mapNode.evaluate(node=>node===document.querySelector('.leaflet-container')),'The mounted map survives switches.');
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Products',exact:true}).click();
  assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/verified.json',JSON.stringify({states,gestures:['pointer follows handle then settles','keyboard toggle','reduced motion','intro close restores focus'],browserErrors:errors,realLocalReads:true,writes:0},null,2),{mode:0o600});
  console.log(`PASS ${states.length} compact exploration layouts, pointer/keyboard/reduced-motion and introduction focus.`);
}finally{fs.writeFileSync(out+'/browser-errors.json',JSON.stringify(errors,null,2),{mode:0o600});await browser.close();}
