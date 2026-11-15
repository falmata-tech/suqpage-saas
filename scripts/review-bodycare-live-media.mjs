// Actual product-page Chrome and Expo web playback against disposable Postgres.
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
  console.log('PASS body-care player review has isolated local target.');
  process.exit(0);
}
assert.equal(process.argv.length,2);
const out='.local/bodycare-live-media-review';
fs.mkdirSync(out,{recursive:true});
const fixture=JSON.parse(fs.readFileSync(`${out}/fixture.json`,'utf8'));
const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.equal(fixture.source,source);
assert.deepEqual(fixture.products.map(p=>[p.handle,p.videoRef]),[
  ['afia-botanics','tiktok:7407311566867025170'],
  ['demo-liya-soap-kitchen','tiktok:7157563218557160705'],
]);
const base='http://127.0.0.1:3000';
const cases=[];
for(const item of fixture.products){
  const response=await fetch(`${base}/api/mobile/v1/shops/${item.handle}`,{signal:AbortSignal.timeout(10000)});
  assert.equal(response.status,200);
  const shop=await response.json();
  assert.equal(shop.id,item.businessId);
  assert.ok(shop.isDemo&&shop.products.length===4);
  const product=shop.products.find(p=>p.id===item.productId);
  assert.ok(product&&product.name===item.productName);
  const mediaIndex=product.media.findIndex(m=>m.kind==='video'&&m.ref===item.videoRef);
  assert.ok(mediaIndex>=0);
  cases.push({...item,mediaIndex,mediaCount:product.media.length});
}
const browser=await chromium.launch({channel:'chrome'});
const results={source,browser:{name:'Google Chrome',version:browser.version()},dataTarget:'disposable-local-postgres',app:[]};
const write=()=>fs.writeFileSync(`${out}/review.json`,JSON.stringify(results,null,2));
const videoState=frame=>frame.locator('video').evaluateAll(nodes=>nodes.map(v=>({
  time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,
  ready:v.readyState,paused:v.paused,error:v.error?.code??null,
})));
async function capture(page,label,stage){
  const file=`${out}/${label}-${stage}.jpg`;
  await page.screenshot({path:file,type:'jpeg',quality:48,timeout:10000});
  console.log(`S197_APP_FRAME ${label} ${stage} ${fs.readFileSync(file).toString('base64')}`);
  return file;
}
async function waitServer(url){
  const deadline=Date.now()+120000;
  while(Date.now()<deadline){
    try{if((await fetch(url,{signal:AbortSignal.timeout(5000)})).ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  throw Error('Isolated Expo preview did not become ready.');
}
async function actualTikTok(page,item,label,stage){
  const expected=`https://www.tiktok.com/player/v1/${item.videoRef.slice(7)}`;
  await expect.poll(()=>page.frames().filter(f=>f.url().startsWith(expected)).length,{timeout:30000}).toBe(1);
  const frame=page.frames().find(f=>f.url().startsWith(expected));
  await frame.getByRole('button',{name:'Play video',exact:true}).click({timeout:30000});
  await expect.poll(async()=>(await videoState(frame)).some(v=>v.ready>=2&&v.width>0&&v.time>1),{timeout:40000}).toBe(true);
  const start=await videoState(frame);
  await expect.poll(async()=>(await videoState(frame))[0]?.time??0,{timeout:20000}).toBeGreaterThan(start[0].time+2);
  const progress=await videoState(frame);
  const frameBox=await(await frame.frameElement()).boundingBox();
  assert.ok(frameBox&&Math.abs(frameBox.width/frameBox.height-9/16)<.02,'TikTok player must keep portrait ratio.');
  let stageBox=null;
  if(stage){
    stageBox=await stage.boundingBox();
    assert.ok(stageBox,'Product stage remains visible.');
    assert.ok(frameBox.x>=stageBox.x-.5&&frameBox.x+frameBox.width<=stageBox.x+stageBox.width+.5,'Player fits stage width.');
    assert.ok(frameBox.y>=stageBox.y-.5&&frameBox.y+frameBox.height<=stageBox.y+stageBox.height+.5,'Player fits stage height.');
  }
  await capture(page,label,'playing');
  return {start,progress,frameBox,stageBox};
}
try{
  for(const item of cases){
    for(const width of [1440,390]){
      const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
      const page=await context.newPage();
      const label=`web-${item.productId}-${width}`;
      try{
        await page.goto(`${base}/@${item.handle}?product=${item.productId}`,{timeout:90000});
        const gallery=page.getByRole('region',{name:'Photos and videos',exact:true});
        await gallery.getByRole('button',{name:`Video ${item.mediaIndex+1}`,exact:true}).click();
        await gallery.getByRole('button',{name:`Play video ${item.mediaIndex+1}`,exact:true}).click();
        await gallery.scrollIntoViewIfNeeded();
        const stage=gallery.getByLabel(`Media ${item.mediaIndex+1} of ${item.mediaCount}`,{exact:true});
        const playback=await actualTikTok(page,item,label,stage);
        assert.equal(context.pages().length,1);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        await gallery.getByRole('button',{name:'Photo 1',exact:true}).click();
        await expect(gallery.locator('iframe')).toHaveCount(0);
        results.app.push({surface:'web',productId:item.productId,width,result:'playback-and-unmount-observed',...playback});
      }catch(error){
        await capture(page,label,'failure').catch(()=>{});
        results.app.push({surface:'web',productId:item.productId,width,result:'failed',error:String(error).slice(0,1000)});
      }finally{write();await context.close();}
    }
  }
  await waitServer('http://localhost:8082');
  for(const item of cases){
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    const page=await context.newPage();
    const label=`expo-${item.productId}-390`;
    try{
      await page.goto(`http://localhost:8082/product?handle=${item.handle}&id=${item.productId}`,{timeout:120000});
      await page.getByRole('button',{name:`Video ${item.mediaIndex+1}`,exact:true}).click({timeout:90000});
      await page.getByRole('button',{name:'Watch video',exact:true}).click();
      const playback=await actualTikTok(page,item,label);
      await page.getByRole('button',{name:'Photo 1',exact:true}).click();
      await expect(page.locator('iframe')).toHaveCount(0);
      assert.equal(context.pages().length,1);
      results.app.push({surface:'Expo web',productId:item.productId,width:390,result:'playback-and-unmount-observed',...playback});
    }catch(error){
      await capture(page,label,'failure').catch(()=>{});
      results.app.push({surface:'Expo web',productId:item.productId,width:390,result:'failed',error:String(error).slice(0,1000)});
    }finally{write();await context.close();}
  }
  assert.equal(results.app.length,6);
  assert.ok(results.app.every(r=>r.result==='playback-and-unmount-observed'),'Inspect actual-player evidence.');
}finally{write();await browser.close();}
