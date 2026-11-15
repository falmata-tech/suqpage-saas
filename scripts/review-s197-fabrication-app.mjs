// Real Chrome playback on disposable public demo pages and Expo web preview.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';

assert.equal(process.env.CI,'true');
assert.equal(process.env.AFRICMADE_NATIVE_QA,'1');
assert.equal(process.env.EXPO_PUBLIC_API_ORIGIN,'http://10.0.2.2:3000');
assert.equal(process.env.EXPO_PUBLIC_NATIVE_MAP_FIXTURE,'1');
const target=new URL(process.env.SUQPAGE_TEST_POSTGRES_URL||'');
assert.ok(['postgres:','postgresql:'].includes(target.protocol));
assert.ok(['localhost','127.0.0.1'].includes(target.hostname));
assert.equal(target.pathname,'/suqpage_native_qa');
if(process.argv[2]==='--preflight'){
  assert.equal(process.argv.length,3);
  console.log('PASS finite fabrication media review has a disposable local target.');
  process.exit(0);
}
assert.equal(process.argv.length,2);
const out='.local/s197-fabrication-app';
fs.mkdirSync(out,{recursive:true});
const fixture=JSON.parse(fs.readFileSync(out+'/fixture.json','utf8'));
const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.equal(fixture.source,source);
assert.equal(fixture.records.length,2);
const expected=new Map([[36,'tiktok:7381882221063425286'],[64,'tiktok:7696838608598076688']]);
for(const entry of fixture.records){
  assert.equal(entry.videoRef,expected.get(entry.businessId));
  assert.equal(entry.products.length,4);
  for(const product of entry.products){
    assert.equal(product.mediaIndex,1);
    assert.equal(product.mediaLength,2);
  }
}
const base='http://127.0.0.1:3000';
const browser=await chromium.launch({channel:'chrome'});
const result={source,browser:{name:'Google Chrome',version:browser.version(),mode:'headless-managed-runner'},dataTarget:'disposable-local-postgres',cases:[],visualVerdict:'pending-agent-review'};
const write=()=>fs.writeFileSync(out+'/review.json',JSON.stringify(result,null,2));
const state=async frame=>frame.locator('video').evaluateAll(nodes=>nodes.map(v=>({time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,ready:v.readyState,paused:v.paused})));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function probe(page,key,ref,stage){
  const record={key,ref,result:'failed'};
  result.cases.push(record);
  try{
    const id=ref.split(':')[1];
    let frame;
    const frameDeadline=Date.now()+30000;
    while(Date.now()<frameDeadline){
      frame=page.frames().find(f=>f.url().startsWith('https://www.tiktok.com/player/v1/'+id));
      if(frame)break;
      await pause(500);
    }
    assert.ok(frame,'Expected exact TikTok iframe was not mounted.');
    record.url=frame.url();
    record.referrer=await frame.evaluate(()=>document.referrer).catch(()=>null);
    const box=await (await frame.frameElement()).boundingBox();
    record.frameBox=box;
    assert.ok(box&&Math.abs(box.width/box.height-9/16)<.025,'Player must retain portrait ratio.');
    if(stage){
      const stageBox=await stage.boundingBox();
      record.stageBox=stageBox;
      assert.ok(stageBox&&box.x>=stageBox.x-1&&box.x+box.width<=stageBox.x+stageBox.width+1,'Product player must fit gallery width.');
      assert.ok(box.y>=stageBox.y-1&&box.y+box.height<=stageBox.y+stageBox.height+1,'Product player must fit gallery height.');
    }
    await page.screenshot({path:out+'/'+key+'-initial.png'});
    const play=frame.getByRole('button',{name:/Play video|Play/i}).first();
    if(await play.isVisible({timeout:5000}).catch(()=>false))await play.click({timeout:10000}).catch(()=>{});
    let samples=[];
    let fallbackClicked=false;
    const playDeadline=Date.now()+25000;
    while(Date.now()<playDeadline){
      samples=await state(frame);
      if(samples.some(v=>v.ready>=2&&v.width>0&&v.time>1))break;
      if(!fallbackClicked&&Date.now()>playDeadline-15000){
        fallbackClicked=true;
        if(box)await page.mouse.click(box.x+box.width/2,box.y+Math.min(box.height/2,320)).catch(()=>{});
      }
      await pause(900);
    }
    record.start=samples;
    if(!samples.some(v=>v.ready>=2&&v.width>0&&v.time>1))throw Error('No decoded advancing video element.');
    await page.screenshot({path:out+'/'+key+'-start.png'});
    const start=samples[0].time;
    const progressDeadline=Date.now()+12000;
    while(Date.now()<progressDeadline){
      samples=await state(frame);
      if(samples.some(v=>v.time>=start+2))break;
      await pause(700);
    }
    record.progress=samples;
    if(!samples.some(v=>v.time>=start+2))throw Error('Video did not continue after initial frame.');
    await page.screenshot({path:out+'/'+key+'-progress.png'});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow.');
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
    await pause(1000);
  }
  throw Error('Isolated Expo preview did not become ready.');
}
async function checkApi(entry){
  const response=await fetch(base+'/api/mobile/v1/shops/'+entry.handle,{signal:AbortSignal.timeout(10000)});
  assert.equal(response.status,200);
  const shop=await response.json();
  assert.equal(shop.id,entry.businessId);
  assert.ok(shop.isDemo&&shop.products.length===4);
  for(const entryProduct of entry.products){
    const product=shop.products.find(p=>p.id===entryProduct.productId);
    assert.ok(product&&product.media[entryProduct.mediaIndex]?.ref===entry.videoRef);
  }
  return shop;
}
async function webCase(entry,shop,width){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  const page=await context.newPage();
  const label=entry.businessId+'-web-'+width;
  try{
    for(const product of entry.products){
      const productLabel=label+'-product-'+product.productId;
      try{
        await page.goto(base+'/@'+entry.handle+'?product='+product.productId,{timeout:90000});
        const gallery=page.getByRole('region',{name:'Photos and videos',exact:true});
        await gallery.getByRole('button',{name:'Video '+(product.mediaIndex+1),exact:true}).click();
        await gallery.getByRole('button',{name:'Play video '+(product.mediaIndex+1),exact:true}).click();
        await gallery.scrollIntoViewIfNeeded();
        const stage=gallery.getByLabel('Media '+(product.mediaIndex+1)+' of '+product.mediaLength,{exact:true});
        await probe(page,productLabel,entry.videoRef,stage);
        await gallery.getByRole('button',{name:'Photo 1',exact:true}).click();
        assert.equal(await gallery.locator('iframe').count(),0,'Photo selection must unmount video.');
        assert.equal(context.pages().length,1,'Inline playback must not open a new tab.');
      }catch(error){
        result.cases.push({key:productLabel+'-navigation',result:'failed',error:String(error).slice(0,1000)});
        await page.screenshot({path:out+'/'+productLabel+'-navigation-failure.png'}).catch(()=>{});
        write();
      }
    }
    try{
      await page.goto(base+'/@'+entry.handle,{timeout:90000});
      await page.getByRole('button',{name:'Play business video about '+shop.name,exact:true}).click();
      await probe(page,label+'-cover',entry.videoRef);
    }catch(error){
      result.cases.push({key:label+'-cover-navigation',result:'failed',error:String(error).slice(0,1000)});
      await page.screenshot({path:out+'/'+label+'-cover-navigation-failure.png'}).catch(()=>{});
      write();
    }
  }finally{await context.close();}
}
async function expoCase(entry){
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const page=await context.newPage();
  const label=entry.businessId+'-expo-390';
  try{
    for(const product of entry.products){
      const productLabel=label+'-product-'+product.productId;
      try{
        await page.goto('http://localhost:8082/product?handle='+entry.handle+'&id='+product.productId,{timeout:120000});
        await page.getByRole('button',{name:'Video '+(product.mediaIndex+1),exact:true}).click({timeout:90000});
        await page.getByRole('button',{name:'Watch video',exact:true}).click();
        await probe(page,productLabel,entry.videoRef);
        await page.getByRole('button',{name:'Photo 1',exact:true}).click();
        assert.equal(await page.locator('iframe').count(),0,'Photo selection must unmount video.');
        assert.equal(context.pages().length,1,'Inline playback must not open a new tab.');
      }catch(error){
        result.cases.push({key:productLabel+'-navigation',result:'failed',error:String(error).slice(0,1000)});
        await page.screenshot({path:out+'/'+productLabel+'-navigation-failure.png'}).catch(()=>{});
        write();
      }
    }
    try{
      await page.goto('http://localhost:8082/shop/'+entry.handle,{timeout:90000});
      await page.getByRole('button',{name:'Watch video',exact:true}).first().click({timeout:60000});
      await probe(page,label+'-cover',entry.videoRef);
    }catch(error){
      result.cases.push({key:label+'-cover-navigation',result:'failed',error:String(error).slice(0,1000)});
      await page.screenshot({path:out+'/'+label+'-cover-navigation-failure.png'}).catch(()=>{});
      write();
    }
  }finally{await context.close();}
}

try{
  for(const entry of fixture.records){
    const shop=await checkApi(entry);
    for(const width of [1440,390])await webCase(entry,shop,width);
  }
  await waitServer('http://localhost:8082');
  for(const entry of fixture.records)await expoCase(entry);
  assert.equal(result.cases.length,30);
  assert.ok(result.cases.every(item=>item.result==='decoded-progress'),'Inspect retained actual-player app evidence.');
}finally{write();await browser.close();}
console.log(JSON.stringify({source,cases:result.cases.map(({key,result,error})=>({key,result,error}))}));
