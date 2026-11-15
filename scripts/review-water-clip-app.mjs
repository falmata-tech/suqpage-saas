// Finite public-screen review of the legacy bottled-water showroom fixture.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chromium,expect} from '@playwright/test';

const target=new URL(process.env.SUQPAGE_TEST_POSTGRES_URL||'');
assert.equal(process.env.CI,'true');
assert.equal(process.env.AFRICMADE_NATIVE_QA,'1');
assert.ok(['postgres:','postgresql:'].includes(target.protocol));
assert.ok(['127.0.0.1','localhost'].includes(target.hostname));
assert.equal(target.pathname,'/suqpage_native_qa');
assert.equal(process.env.EXPO_PUBLIC_API_ORIGIN,'http://10.0.2.2:3000');
assert.equal(process.env.EXPO_PUBLIC_NATIVE_MAP_FIXTURE,'1');
if(process.argv[2]==='--preflight'){
  assert.equal(process.argv.length,3);
  console.log('PASS water-clip review has a disposable local target.');
  process.exit(0);
}
assert.equal(process.argv.length,2);
const out='.local/water-clip-app-qa';
fs.mkdirSync(out,{recursive:true});
const fixture=JSON.parse(fs.readFileSync(out+'/fixture.json','utf8'));
const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.equal(fixture.source,source);
assert.equal(fixture.sourceBusinessId,62);
assert.deepEqual(fixture.products.map(item=>item.sourceProductId),[245,246,247,248]);
assert.equal(fixture.coverRef,'tiktok:7567766530918862135');
const base='http://127.0.0.1:3000';
const browser=await chromium.launch({channel:'chrome'});
const review={source,run:process.env.GITHUB_RUN_ID,browser:{name:'Google Chrome',version:browser.version()},
  target:'disposable-local-postgres',sourceBusinessId:62,syntheticBusinessId:fixture.businessId,
  visualVerdict:'source frames reviewed separately; app playback only',results:[]};
const save=()=>fs.writeFileSync(out+'/review.json',JSON.stringify(review,null,2)+'\n');
const state=frame=>frame.locator('video').evaluateAll(nodes=>nodes.map(video=>({
  time:video.currentTime,duration:video.duration,width:video.videoWidth,height:video.videoHeight,
  ready:video.readyState,paused:video.paused,
})));
async function waitServer(url){
  const deadline=Date.now()+120000;
  while(Date.now()<deadline){
    try{if((await fetch(url,{signal:AbortSignal.timeout(5000)})).ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  throw Error('The disposable Expo preview did not become ready.');
}
async function play(page,ref,label){
  const id=ref.split(':')[1];
  await expect.poll(()=>page.frames().filter(frame=>frame.url().startsWith(`https://www.tiktok.com/player/v1/${id}`)).length,{timeout:30000}).toBe(1);
  const frame=page.frames().find(value=>value.url().startsWith(`https://www.tiktok.com/player/v1/${id}`));
  assert.ok(frame);
  const button=frame.getByRole('button',{name:'Play video',exact:true});
  await button.click({timeout:30000});
  await expect.poll(async()=>(await state(frame)).some(value=>value.ready>=2&&value.width>0&&value.time>1),{timeout:45000}).toBe(true);
  const start=(await state(frame))[0];
  await page.screenshot({path:`${out}/${label}-start.png`});
  await expect.poll(async()=>(await state(frame))[0]?.time??0,{timeout:25000}).toBeGreaterThan(start.time+2);
  const progress=(await state(frame))[0];
  await page.screenshot({path:`${out}/${label}-progress.png`});
  const playerBox=await(await frame.frameElement()).boundingBox();
  assert.ok(playerBox&&Math.abs(playerBox.width/playerBox.height-9/16)<.03,'TikTok portrait ratio must hold.');
  assert.equal(page.context().pages().length,1,'Inline playback must not open another tab.');
  return {start,progress,playerBox};
}
async function surface(kind,width,shop){
  const context=await browser.newContext({viewport:{width,height:kind==='expo'?844:900},serviceWorkers:'block'});
  const page=await context.newPage();
  const result={surface:kind,width,cover:{result:'pending'},products:[]};
  const key=`${kind}-${width}`;
  try{
    const url=kind==='expo'?`http://localhost:8082/shop/${fixture.handle}`:`${base}/@${fixture.handle}`;
    try{
      await page.goto(url,{timeout:120000});
      if(kind==='expo')await page.getByRole('button',{name:'Watch video',exact:true}).first().click({timeout:60000});
      else await page.getByRole('button',{name:'Play business video about '+shop.name,exact:true}).click({timeout:60000});
      result.cover={result:'playback-observed',...(await play(page,fixture.coverRef,`${key}-cover`))};
      if(kind==='web')assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    }catch(error){result.cover={result:'failed',error:String(error).slice(0,1000)};
      await page.screenshot({path:`${out}/${key}-cover-failure.png`}).catch(()=>{});}
    save();
    for(const item of fixture.products){
      const row={sourceProductId:item.sourceProductId,syntheticProductId:item.productId,ref:item.ref,result:'failed'};
      result.products.push(row);
      try{
        const product=shop.products.find(value=>value.id===item.productId);
        assert.ok(product&&product.name===item.name);
        const index=product.media.findIndex(value=>value.kind==='video'&&value.ref===item.ref);
        assert.ok(index>=0);
        if(kind==='expo'){
          await page.goto(`http://localhost:8082/product?handle=${fixture.handle}&id=${item.productId}`,{timeout:120000});
          await page.getByRole('button',{name:'Video '+(index+1),exact:true}).click({timeout:60000});
          await page.getByRole('button',{name:'Watch video',exact:true}).click({timeout:60000});
        }else{
          await page.goto(`${base}/@${fixture.handle}?product=${item.productId}`,{timeout:120000});
          const gallery=page.getByRole('region',{name:'Photos and videos',exact:true});
          await gallery.getByRole('button',{name:'Video '+(index+1),exact:true}).click({timeout:60000});
          await gallery.getByRole('button',{name:'Play video '+(index+1),exact:true}).click({timeout:60000});
          await gallery.scrollIntoViewIfNeeded();
        }
        const receipt=await play(page,item.ref,`${key}-product-${item.sourceProductId}`);
        Object.assign(row,receipt,{result:'playback-observed'});
        if(kind==='expo')await page.getByRole('button',{name:'Photo 1',exact:true}).click({timeout:30000});
        else await page.getByRole('region',{name:'Photos and videos',exact:true}).getByRole('button',{name:'Photo 1',exact:true}).click({timeout:30000});
        await expect(page.locator('iframe')).toHaveCount(0);
      }catch(error){row.error=String(error).slice(0,1000);
        await page.screenshot({path:`${out}/${key}-product-${item.sourceProductId}-failure.png`}).catch(()=>{});}
      save();
    }
  }finally{await context.close();}
  return result;
}
try{
  await waitServer('http://localhost:8082');
  const response=await fetch(`${base}/api/mobile/v1/shops/${fixture.handle}`,{signal:AbortSignal.timeout(10000)});
  assert.equal(response.status,200);
  const shop=await response.json();
  assert.equal(shop.id,fixture.businessId);
  assert.ok(shop.isDemo&&shop.products.length===4);
  assert.equal(shop.videoUrl,`https://www.tiktok.com/player/v1/${fixture.coverRef.split(':')[1]}`);
  for(const [kind,width] of [['web',1440],['web',390],['expo',390]]){
    review.results.push(await surface(kind,width,shop));save();
  }
  assert.ok(review.results.every(item=>item.cover.result==='playback-observed'&&item.products.every(value=>value.result==='playback-observed')),
    'At least one public-screen playback failed; inspect retained screenshots and receipt.');
}finally{save();await browser.close();}
