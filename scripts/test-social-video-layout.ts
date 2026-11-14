import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const require=createRequire(import.meta.url);
const bundle=build({
  stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {flushSync} from 'react-dom';
    import ProductMediaGallery from './components/showroom/ProductMediaGallery';
    import SocialVideoFrame from './components/SocialVideoFrame';
    const root=createRoot(document.getElementById('root'));
    const image='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E';
    window.mountGallery=ref=>flushSync(()=>root.render(<ProductMediaGallery name="Example product" items={[{kind:'image',ref:image},{kind:'video',ref}]}/>));
    window.mountDialog=ref=>flushSync(()=>root.render(<div className="product-dialog-video" data-portrait-active={/^(tiktok|instagram):/.test(ref)||undefined}><SocialVideoFrame video={ref} title="Process video" poster={image}/></div>));
    window.mountStory=ref=>flushSync(()=>root.render(<div style={{width:'100%',height:560}}><SocialVideoFrame video={ref} title="Process video" poster={image}/></div>));
  `},
  bundle:true,write:false,format:'iife',platform:'browser',outdir:'out',
  loader:{'.module.css':'local-css'},
  plugins:[{name:'social-layout-translation',setup(plugin){
    plugin.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},args=>({path:require.resolve(args.path)}));
    plugin.onResolve({filter:/^@\/lib\/i18n\/ui$/},args=>({path:args.path,namespace:'translation'}));
    plugin.onLoad({filter:/.*/,namespace:'translation'},()=>({loader:'js',contents:`export const useUiText=()=> (s,p={}) => s.replaceAll('{number}',String(p.number??'')).replaceAll('{total}',String(p.total??'')).replaceAll('{value1}',String(p.value1??''));`}));
  }}],
});
test('FE-057 portrait product frames fit both axes and photos restore their stage',{timeout:60_000},async()=>{
  const output=await bundle;
  const script=output.outputFiles.find(file=>file.path.endsWith('.js'))?.text;
  const css=output.outputFiles.find(file=>file.path.endsWith('.css'))?.text;
  assert.ok(script&&css);
  const browser=await chromium.launch({timeout:20_000});
  try{
    const page=await browser.newPage();
    for(const provider of ['tiktok.com','instagram.com','facebook.com'])
      await page.route(`https://www.${provider}/**`,route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0;height:100vh;display:flex;flex-direction:column;text-align:center;background:#e3e6e8;font:700 20px sans-serif"><header style="background:#bd3415;color:white;padding:12px">TOP OF FRAME</header><main style="flex:1;display:grid;place-items:center">Deterministic geometry fixture</main><footer style="background:#173d62;color:white;padding:12px">BOTTOM OF FRAME</footer></body>'}));
    await page.setContent('<main id="root" style="width:min(520px,calc(100vw - 32px));margin:16px"></main>');
    await page.addStyleTag({content:css});
    await page.addStyleTag({content:fs.readFileSync('components/showroom/showrooms.css','utf8')});
    await page.addScriptTag({content:script});
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:900});
      for(const ref of ['tiktok:7703762862484851981','instagram:DFs9ue4OJig']){
        await page.evaluate(value=>(window as unknown as{mountGallery:(ref:string)=>void}).mountGallery(value),ref);
        const slide=page.getByLabel('Media 2 of 2',{exact:true});
        await page.getByRole('button',{name:'Video 2',exact:true}).click();
        await page.getByRole('button',{name:'Play video 2',exact:true}).click();
        const stage=await slide.boundingBox(),frame=await slide.locator('iframe').boundingBox();
        assert.ok(stage&&frame);
        assert.ok(Math.abs(stage.height-Math.min(900*.7,680))<=1,`${ref} at ${width}: gallery uses bounded portrait height`);
        assert.ok(Math.abs(frame.width/frame.height-9/16)<.01,`${ref} at ${width}: portrait ratio`);
        assert.ok(frame.x>=stage.x-.5&&frame.x+frame.width<=stage.x+stage.width+.5,`${ref} at ${width}: horizontal containment`);
        assert.ok(frame.y>=stage.y-.5&&frame.y+frame.height<=stage.y+stage.height+.5,`${ref} at ${width}: vertical containment`);
        if(width===390&&ref.startsWith('tiktok:')&&process.env.AFRICMADE_LAYOUT_EVIDENCE){
          fs.mkdirSync(process.env.AFRICMADE_LAYOUT_EVIDENCE,{recursive:true});
          await page.screenshot({path:`${process.env.AFRICMADE_LAYOUT_EVIDENCE}/gallery-390.png`});
        }
        await page.getByRole('button',{name:'Photo 1',exact:true}).click();
        assert.equal(await page.locator('iframe').count(),0,'photo selection unmounts the player');
        const photo=await page.getByLabel('Media 1 of 2',{exact:true}).boundingBox();
        assert.ok(photo&&photo.height<stage.height,'photo selection restores the shorter stage');
      }
      await page.evaluate(value=>(window as unknown as{mountDialog:(ref:string)=>void}).mountDialog(value),'tiktok:7703762862484851981');
      const dialog=await page.locator('.product-dialog-video').boundingBox();
      const frame=await page.getByTitle('Process video').boundingBox();
      assert.ok(dialog&&frame);
      assert.ok(Math.abs(frame.width/frame.height-9/16)<.01,`dialog at ${width}: portrait ratio`);
      assert.ok(frame.y>=dialog.y-.5&&frame.y+frame.height<=dialog.y+dialog.height+.5,`dialog at ${width}: vertical containment`);
      if(width===390&&process.env.AFRICMADE_LAYOUT_EVIDENCE)
        await page.screenshot({path:`${process.env.AFRICMADE_LAYOUT_EVIDENCE}/dialog-390.png`});
      await page.evaluate(value=>(window as unknown as{mountStory:(ref:string)=>void}).mountStory(value),'tiktok:7703762862484851981');
      const story=await page.locator('#root > div').boundingBox();
      const storyFrame=await page.getByTitle('Process video').boundingBox();
      assert.ok(story&&storyFrame&&storyFrame.y>=story.y-.5&&storyFrame.y+storyFrame.height<=story.y+story.height+.5,`story at ${width}: vertical containment`);
      await page.evaluate(value=>(window as unknown as{mountDialog:(ref:string)=>void}).mountDialog(value),'facebook:123456789012345');
      const landscape=await page.locator('.product-dialog-video').boundingBox();
      const landscapeFrame=await page.getByTitle('Process video').boundingBox();
      assert.ok(landscape&&landscapeFrame&&Math.abs(landscapeFrame.width/landscapeFrame.height-landscape.width/landscape.height)<.01,`Facebook at ${width}: landscape stage preserved`);
    }
  }finally{await browser.close();}
});

test('FE-057 replay focus keeps the portrait player selected until explicit navigation',{timeout:45_000},async()=>{
  const output=await bundle;
  const script=output.outputFiles.find(file=>file.path.endsWith('.js'))?.text;
  const css=output.outputFiles.find(file=>file.path.endsWith('.css'))?.text;
  assert.ok(script&&css);
  const browser=await chromium.launch({timeout:20_000});
  try{
    const page=await browser.newPage({viewport:{width:390,height:900}});
    await page.route('https://www.tiktok.com/player/v1/**',route=>route.fulfill({contentType:'text/html',body:`<html><body style="margin:0;height:100vh;background:#f3e9e4;display:grid;place-items:center"><button type="button" aria-label="Replay" style="padding:20px">Replay</button></body></html>`}));
    await page.setContent('<main id="root" style="width:350px;margin:16px"></main>');
    await page.addStyleTag({content:css});
    await page.addScriptTag({content:script});
    await page.evaluate(()=>(window as unknown as{mountGallery:(ref:string)=>void}).mountGallery('tiktok:7703762862484851981'));
    await page.getByRole('button',{name:'Video 2',exact:true}).click();
    await page.getByRole('button',{name:'Play video 2',exact:true}).click();
    const track=page.locator('[class*="galleryTrack"]');
    const before=await track.evaluate(element=>({left:element.scrollLeft,width:element.clientWidth,snap:getComputedStyle(element).scrollSnapType}));
    assert.equal(before.left,before.width,'Video 2 is fully selected before Replay.');
    const replay=page.frameLocator('iframe').getByRole('button',{name:'Replay',exact:true});
    await replay.evaluate(element=>element.scrollIntoView({block:'center',inline:'center'}));
    await replay.click();
    const after=await track.evaluate(element=>({left:element.scrollLeft,width:element.clientWidth}));
    assert.equal(after.left,after.width,'Replay focus keeps Video 2 selected.');
    assert.equal(before.snap,'none','Active portrait playback disables scroll snapping.');
    assert.equal(await page.getByRole('button',{name:'Video 2',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('iframe').count(),1);
    const partial=await track.evaluate(element=>{element.scrollTo({left:element.clientWidth-70,behavior:'instant'});return element.scrollLeft;});
    assert.equal(partial,before.width-70,'A short horizontal gesture moves the active portrait slide.');
    await page.waitForFunction(()=>{const element=document.querySelector('[class*="galleryTrack"]');return element?.scrollLeft===element?.clientWidth;},null,{timeout:3000});
    assert.equal(await page.locator('iframe').count(),1,'The short gesture settles on the video without unmounting it.');
    await track.evaluate(element=>element.scrollTo({left:0,behavior:'instant'}));
    await page.waitForFunction(()=>document.querySelector('[aria-label="Photo 1"]')?.getAttribute('aria-pressed')==='true');
    assert.equal(await page.locator('iframe').count(),0,'A full horizontal return to Photo 1 unmounts the player.');
    assert.equal(await track.evaluate(element=>getComputedStyle(element).scrollSnapType),'x mandatory','Photo stage restores normal snapping.');
    await page.getByRole('button',{name:'Video 2',exact:true}).click();
    await page.getByRole('button',{name:'Play video 2',exact:true}).click();
    await page.getByRole('button',{name:'Photo 1',exact:true}).click();
    assert.equal(await page.locator('iframe').count(),0,'The photo thumbnail still stops playback.');
    await page.getByRole('button',{name:'Video 2',exact:true}).click();
    await page.getByRole('button',{name:'Play video 2',exact:true}).click();
    await page.getByRole('button',{name:'Previous media',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Photo 1',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('iframe').count(),0,'The gallery arrow still stops playback.');
  }finally{await browser.close();}
});
