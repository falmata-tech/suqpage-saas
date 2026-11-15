// Finite S197 containing-page playback check for three source-reviewed TikToks.
// Runs only against a disposable local PostgreSQL QA schema in GitHub Actions.
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
  console.log('PASS maker-clip app QA has a disposable local target.');
  process.exit(0);
}
assert.equal(process.argv.length,2);
const out='.local/maker-clip-app-qa';
fs.mkdirSync(out,{recursive:true});
const fixture=JSON.parse(fs.readFileSync(out+'/fixture.json','utf8'));
const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.equal(fixture.source,source);
assert.equal(fixture.cases.length,3);
assert.deepEqual(fixture.cases.map(item=>item.videoRef),[
  'tiktok:7685918227163057438','tiktok:7217517593786141995','tiktok:7067689673266744623']);
const base='http://127.0.0.1:3000';
const browser=await chromium.launch({channel:'chrome'});
const review={source,run:process.env.GITHUB_RUN_ID,browser:{name:'Google Chrome',version:browser.version()},
  target:'disposable-local-postgres',cases:[],visualVerdict:'pending agent frame review'};
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
async function play(page,id,label){
  await expect.poll(()=>page.frames().filter(frame=>frame.url().startsWith(`https://www.tiktok.com/player/v1/${id}`)).length,{timeout:30000}).toBe(1);
  const frame=page.frames().find(value=>value.url().startsWith(`https://www.tiktok.com/player/v1/${id}`));
  assert.ok(frame);
  const button=frame.getByRole('button',{name:'Play video',exact:true});
  if(await button.isVisible().catch(()=>false))await button.click({timeout:30000});
  await expect.poll(async()=>(await state(frame)).some(value=>value.ready>=2&&value.width>0&&value.time>1),{timeout:45000}).toBe(true);
  const start=(await state(frame))[0];
  await page.screenshot({path:`${out}/${label}-start.png`});
  await expect.poll(async()=>(await state(frame))[0]?.time??0,{timeout:25000}).toBeGreaterThan(start.time+2);
  const progress=(await state(frame))[0];
  await page.screenshot({path:`${out}/${label}-progress.png`});
  const playerBox=await(await frame.frameElement()).boundingBox();
  assert.ok(playerBox&&Math.abs(playerBox.width/playerBox.height-9/16)<.03,'TikTok portrait ratio must hold.');
  assert.equal(page.context().pages().length,1,'Inline playback must not open an external tab.');
  return {start,progress,playerBox};
}
async function checkWeb(item,shop,width,product,mediaIndex){
  const label=`${item.businessId}-web-${width}`;
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  const page=await context.newPage();
  const result={surface:'web',width,result:'failed'};
  try{
    await page.goto(`${base}/@${item.handle}`,{timeout:90000});
    await page.getByRole('button',{name:'Play business video about '+shop.name,exact:true}).click({timeout:30000});
    result.cover=await play(page,item.videoRef.split(':')[1],`${label}-cover`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(product){
      await page.goto(`${base}/@${item.handle}?product=${item.productId}`,{timeout:90000});
      const gallery=page.getByRole('region',{name:'Photos and videos',exact:true});
      await gallery.getByRole('button',{name:'Video '+(mediaIndex+1),exact:true}).click();
      await gallery.getByRole('button',{name:'Play video '+(mediaIndex+1),exact:true}).click();
      await gallery.scrollIntoViewIfNeeded();
      result.product=await play(page,item.videoRef.split(':')[1],`${label}-product`);
      await gallery.getByRole('button',{name:'Photo 1',exact:true}).click();
      await expect(gallery.locator('iframe')).toHaveCount(0);
    }
    result.result='playback-observed';
  }catch(error){
    result.error=String(error).slice(0,1000);
    await page.screenshot({path:`${out}/${label}-failure.png`}).catch(()=>{});
  }finally{await context.close();}
  return result;
}
async function checkExpo(item,product,mediaIndex){
  const label=`${item.businessId}-expo-390`;
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const page=await context.newPage();
  const result={surface:'Expo web',width:390,result:'failed'};
  try{
    await page.goto(`http://localhost:8082/shop/${item.handle}`,{timeout:120000});
    await page.getByRole('button',{name:'Watch video',exact:true}).first().click({timeout:60000});
    result.cover=await play(page,item.videoRef.split(':')[1],`${label}-cover`);
    if(product){
      await page.goto(`http://localhost:8082/product?handle=${item.handle}&id=${item.productId}`,{timeout:90000});
      await page.getByRole('button',{name:'Video '+(mediaIndex+1),exact:true}).click({timeout:90000});
      await page.getByRole('button',{name:'Watch video',exact:true}).click();
      result.product=await play(page,item.videoRef.split(':')[1],`${label}-product`);
      await page.getByRole('button',{name:'Photo 1',exact:true}).click();
      await expect(page.locator('iframe')).toHaveCount(0);
    }
    result.result='playback-observed';
  }catch(error){
    result.error=String(error).slice(0,1000);
    await page.screenshot({path:`${out}/${label}-failure.png`}).catch(()=>{});
  }finally{await context.close();}
  return result;
}
try{
  await waitServer('http://localhost:8082');
  for(const item of fixture.cases){
    const response=await fetch(`${base}/api/mobile/v1/shops/${item.handle}`,{signal:AbortSignal.timeout(10000)});
    assert.equal(response.status,200);
    const shop=await response.json();
    assert.equal(shop.id,item.businessId);
    assert.ok(shop.isDemo&&shop.products.length===4);
    const product=item.productId?shop.products.find(value=>value.id===item.productId):null;
    if(item.productId)assert.ok(product);
    const mediaIndex=product?.media.findIndex(value=>value.kind==='video'&&value.ref===item.videoRef)??-1;
    if(product)assert.ok(mediaIndex>=0);
    const receipt={businessId:item.businessId,handle:item.handle,videoRef:item.videoRef,
      productId:item.productId,results:[]};
    review.cases.push(receipt);save();
    for(const width of [1440,390]){receipt.results.push(await checkWeb(item,shop,width,product,mediaIndex));save();}
    receipt.results.push(await checkExpo(item,product,mediaIndex));save();
  }
  assert.ok(review.cases.every(item=>item.results.length===3&&item.results.every(value=>value.result==='playback-observed')),
    'At least one containing-page playback failed; inspect retained screenshots and receipt.');
}finally{save();await browser.close();}
