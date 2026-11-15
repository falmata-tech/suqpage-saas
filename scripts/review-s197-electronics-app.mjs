// Evidence-only public-page player review against a disposable local database.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';

assert.equal(process.env.CI, 'true');
assert.equal(process.env.AFRICMADE_NATIVE_QA, '1');
assert.equal(process.env.EXPO_PUBLIC_API_ORIGIN, 'http://10.0.2.2:3000');
assert.equal(process.env.EXPO_PUBLIC_NATIVE_MAP_FIXTURE, '1');
const target = new URL(process.env.SUQPAGE_TEST_POSTGRES_URL || '');
assert.ok(['postgres:', 'postgresql:'].includes(target.protocol));
assert.ok(['localhost', '127.0.0.1'].includes(target.hostname));
assert.equal(target.pathname, '/suqpage_native_qa');
const out = '.local/s197-electronics-app';
fs.mkdirSync(out, {recursive:true});
const fixture = JSON.parse(fs.readFileSync(out+'/fixture.json','utf8'));
const source = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.equal(source,fixture.source);
assert.equal(fixture.handle,'demo-liya-soap-kitchen');
assert.equal(fixture.videoRef,'youtube:J8hBvC1bXtQ');
assert.equal(fixture.coverRef,'tiktok:7352781700881026347');
const base='http://127.0.0.1:3000';
const api=await fetch(base+'/api/mobile/v1/shops/'+fixture.handle,{signal:AbortSignal.timeout(10000)});
assert.equal(api.status,200);
const shop=await api.json();
assert.equal(shop.id,fixture.businessId);
assert.ok(shop.isDemo && shop.products.length===4);
const product=shop.products.find(p=>p.id===fixture.productId);
assert.ok(product);
const mediaIndex=product.media.findIndex(m=>m.kind==='video'&&m.ref===fixture.videoRef);
assert.ok(mediaIndex>=0);
const browser=await chromium.launch({channel:'chrome'});
const result={source,browser:{name:'Google Chrome',version:browser.version(),mode:'headless-managed-runner'},dataTarget:'disposable-local-postgres',cases:[],visualVerdict:'pending-agent-review'};
const write=()=>fs.writeFileSync(out+'/review.json',JSON.stringify(result,null,2));
const state=async frame=>frame.locator('video').evaluateAll(nodes=>nodes.map(v=>({time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,ready:v.readyState,paused:v.paused})));
async function probe(page,key,provider,id){
  const record={key,provider,id,result:'failed'};
  result.cases.push(record);
  try{
    const deadline=Date.now()+40000;
    let frame;
    while(Date.now()<deadline){
      frame=page.frames().find(f=>f.url().includes(id)&&(provider==='tiktok'?f.url().includes('tiktok.com/player/'):f.url().includes('youtube')));
      if(frame)break;
      await new Promise(resolve=>setTimeout(resolve,500));
    }
    assert.ok(frame,'Expected provider iframe was not mounted.');
    record.url=frame.url();
    record.referrer=await frame.evaluate(()=>document.referrer).catch(()=>null);
    const box=await (await frame.frameElement()).boundingBox();
    record.frameBox=box;
    await page.screenshot({path:out+'/'+key+'-initial.png'});
    const play=frame.getByRole('button',{name:/Play video|Play/i}).first();
    if(await play.isVisible({timeout:5000}).catch(()=>false))await play.click({timeout:10000}).catch(()=>{});
    let samples=[];
    const playDeadline=Date.now()+25000;
    let fallbackClicked=false;
    while(Date.now()<playDeadline){
      samples=await state(frame);
      if(samples.some(v=>v.ready>=2&&v.width>0&&v.time>1))break;
      if(!fallbackClicked && Date.now()>playDeadline-15000){
        fallbackClicked=true;
        if(box)await page.mouse.click(box.x+box.width/2,box.y+Math.min(box.height/2,320)).catch(()=>{});
      }
      await new Promise(resolve=>setTimeout(resolve,1000));
    }
    record.start=samples;
    if(!samples.some(v=>v.ready>=2&&v.width>0&&v.time>1))throw Error('No decoded advancing video element.');
    await page.screenshot({path:out+'/'+key+'-start.png'});
    const start=samples[0].time;
    const progressDeadline=Date.now()+12000;
    while(Date.now()<progressDeadline){
      samples=await state(frame);
      if(samples.some(v=>v.time>=start+2))break;
      await new Promise(resolve=>setTimeout(resolve,700));
    }
    record.progress=samples;
    if(!samples.some(v=>v.time>=start+2))throw Error('Video did not continue after initial frame.');
    await page.screenshot({path:out+'/'+key+'-progress.png'});
    record.result='decoded-progress';
  }catch(error){
    record.error=String(error).slice(0,1000);
    await page.screenshot({path:out+'/'+key+'-failure.png'}).catch(()=>{});
  }finally{write();}
}
async function waitServer(url){
  const deadline=Date.now()+120000;
  while(Date.now()<deadline){
    try{if((await fetch(url,{signal:AbortSignal.timeout(5000)})).ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  throw Error('Isolated Expo preview did not become ready.');
}
try{
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
    const page=await context.newPage();
    try{
      await page.goto(base+'/@'+fixture.handle+'?product='+fixture.productId,{timeout:90000});
      const gallery=page.getByRole('region',{name:'Photos and videos',exact:true});
      await gallery.getByRole('button',{name:'Video '+(mediaIndex+1),exact:true}).click();
      await gallery.getByRole('button',{name:'Play video '+(mediaIndex+1),exact:true}).click();
      await probe(page,'web-product-'+width,'youtube','J8hBvC1bXtQ');
      await page.goto(base+'/@'+fixture.handle,{timeout:90000});
      await page.getByRole('button',{name:'Play business video about '+shop.name,exact:true}).click();
      await probe(page,'web-cover-'+width,'tiktok','7352781700881026347');
    }catch(error){
      result.cases.push({key:'web-navigation-'+width,result:'failed',error:String(error).slice(0,1000)});
      await page.screenshot({path:out+'/web-navigation-'+width+'-failure.png'}).catch(()=>{});
      write();
    }finally{await context.close();}
  }
  await waitServer('http://localhost:8082');
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const page=await context.newPage();
  try{
    await page.goto('http://localhost:8082/product?handle='+fixture.handle+'&id='+fixture.productId,{timeout:120000});
    await page.getByRole('button',{name:'Video '+(mediaIndex+1),exact:true}).click({timeout:90000});
    await page.getByRole('button',{name:'Watch video',exact:true}).click();
    await probe(page,'expo-product-390','youtube','J8hBvC1bXtQ');
    await page.goto('http://localhost:8082/shop/'+fixture.handle,{timeout:90000});
    await page.getByRole('button',{name:'Watch video',exact:true}).first().click({timeout:60000});
    await probe(page,'expo-cover-390','tiktok','7352781700881026347');
  }catch(error){
    result.cases.push({key:'expo-navigation-390',result:'failed',error:String(error).slice(0,1000)});
    await page.screenshot({path:out+'/expo-navigation-390-failure.png'}).catch(()=>{});
    write();
  }finally{await context.close();}
}finally{write();await browser.close();}
console.log(JSON.stringify(result));
