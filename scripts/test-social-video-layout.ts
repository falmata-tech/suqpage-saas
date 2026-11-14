import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const require=createRequire(import.meta.url);
const bundle=build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
 import SocialVideoFrame from './components/SocialVideoFrame';
 const root=createRoot(document.getElementById('root'));
 window.mount=video=>flushSync(()=>root.render(<div className="product-dialog-video"><SocialVideoFrame video={video} title="Process video"/></div>));
`},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'social-layout-ports',setup(b){
 b.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},a=>({path:require.resolve(a.path)}));
 b.onResolve({filter:/^@\/lib\/i18n\/ui$/},a=>({path:a.path,namespace:'translation'}));
 b.onLoad({filter:/.*/,namespace:'translation'},()=>({loader:'js',contents:'export const useUiText=()=>s=>s;'}));
}}]});

test('FE-057 retained dialog CSS cannot stretch a portrait provider frame',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000});
 try{
  const page=await browser.newPage();
  // Deterministic geometry only; real creator playback is qualified separately.
  await page.route('https://www.tiktok.com/**',r=>r.fulfill({contentType:'text/html',body:'<p>Provider layout fixture</p>'}));
  await page.route('https://www.instagram.com/**',r=>r.fulfill({contentType:'text/html',body:'<p>Provider layout fixture</p>'}));
  await page.route('https://www.facebook.com/**',r=>r.fulfill({contentType:'text/html',body:'<p>Provider layout fixture</p>'}));
  await page.setContent('<main id="root"></main>');
  await page.addStyleTag({content:fs.readFileSync('components/showroom/showrooms.css','utf8')});
  await page.addScriptTag({content:(await bundle).outputFiles[0].text});
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});
   for(const ref of ['tiktok:7703762862484851981','instagram:DFs9ue4OJig','facebook:123456789012345']){
    await page.evaluate(ref=>(window as unknown as{mount:(ref:string)=>void}).mount(ref),ref);
    const frame=page.getByTitle('Process video',{exact:true});await frame.waitFor();
    const box=await frame.boundingBox(),stage=await page.locator('.product-dialog-video').boundingBox();assert.ok(box&&stage);
    const portrait=!ref.startsWith('facebook:');
    assert.ok(Math.abs(box.width/box.height-(portrait?9/16:stage.width/stage.height))<.02,`${ref} at${width}: full intended frame ratio`);
    assert.ok(Math.abs((box.x+box.width/2)-(stage.x+stage.width/2))<1,'The provider stays centered.');
    assert.ok(box.x>=stage.x-.5&&box.x+box.width<=stage.x+stage.width+.5,'The player remains inside the stage.');
   }
  }
 }finally{await browser.close();}
});
