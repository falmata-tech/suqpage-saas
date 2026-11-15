// Source-only S197 review; public examples, no database or app mutation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';

assert.equal(process.env.CI, 'true');
assert.equal(process.env.ALLOW_S197_ELECTRONICS_SOURCE_QA, '1');
const out = '.local/s197-electronics-source';
fs.mkdirSync(out, {recursive: true});
const source = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
const candidates = [
  {key:'nextpcb-assembly',provider:'tiktok',id:'7352781700881026347',creator:'https://www.tiktok.com/@nextpcbofficial/video/7352781700881026347'},
  {key:'bsw-solar-production',provider:'tiktok',id:'7494550342244240683',creator:'https://www.tiktok.com/@bswsolarstreetlight/video/7494550342244240683'},
  {key:'galaxy-harness',provider:'youtube',id:'J8hBvC1bXtQ',creator:'https://www.youtube.com/watch?v=J8hBvC1bXtQ'},
  {key:'judn-solar-light',provider:'youtube',id:'fTb3r6RFNBQ',creator:'https://www.youtube.com/watch?v=fTb3r6RFNBQ'},
  {key:'merry-speaker-factory',provider:'tiktok',id:'7580286785029213454',creator:'https://www.tiktok.com/@merryaudio888/video/7580286785029213454'},
  {key:'electric-panel-factory',provider:'tiktok',id:'7522117073733012750',creator:'https://www.tiktok.com/@electric.control/video/7522117073733012750'},
  {key:'kabo-lighting-factory',provider:'tiktok',id:'7388823271690521874',creator:'https://www.tiktok.com/@kabolightingricky/video/7388823271690521874'},
  {key:'cvr-pro-audio-production',provider:'tiktok',id:'7494829805028822280',creator:'https://www.tiktok.com/@cvraudio_china/video/7494829805028822280'},
  {key:'merry-speaker-workshop',provider:'tiktok',id:'7657534434601700615',creator:'https://www.tiktok.com/@speakerfactory888/video/7657534434601700615'},
  {key:'nhf-cable-production',provider:'tiktok',id:'7200198008225484033',creator:'https://www.tiktok.com/@nhf.frances/video/7200198008225484033'},
  {key:'rattan-cafe-pendant',provider:'tiktok',id:'7625153258092350740',creator:'https://www.tiktok.com/@rattanstudio/video/7625153258092350740'},
  {key:'jf-courtyard-solar',provider:'tiktok',id:'7705381006890503425',creator:'https://www.tiktok.com/@jd_solarlight/video/7705381006890503425'},
  {key:'kinee-pv-combiner',provider:'tiktok',id:'7706559803509755144',creator:'https://www.tiktok.com/@kineeelectricals/video/7706559803509755144'},
];
const browser = await chromium.launch({channel:'chrome'});
const result = {source,browser:{name:'Google Chrome',version:browser.version(),mode:'headless-managed-runner'},candidates:[],visualVerdict:'pending-agent-review'};
const write = () => fs.writeFileSync(out+'/review.json',JSON.stringify(result,null,2));
const state = async page => page.locator('video').evaluateAll(nodes => nodes.map(v=>({time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,ready:v.readyState,paused:v.paused})));
try {
  for(const candidate of candidates){
    const context = await browser.newContext({viewport:{width:1000,height:800},serviceWorkers:'block'});
    const page = await context.newPage();
    const record = {...candidate,result:'failed'};
    result.candidates.push(record);
    try {
      const url=candidate.provider==='tiktok'?`https://www.tiktok.com/player/v1/${candidate.id}`:`https://www.youtube.com/embed/${candidate.id}?autoplay=1`;
      record.url=url;
      const response=await page.goto(url,{timeout:30000,waitUntil:'domcontentloaded'});
      record.httpStatus=response?.status()??null;
      await page.screenshot({path:`${out}/${candidate.key}-initial.png`});
      const play=page.getByRole('button',{name:/Play video|Play/i}).first();
      if(await play.isVisible({timeout:10000}).catch(()=>false))await play.click({timeout:10000}).catch(()=>{});
      const deadline=Date.now()+25000;
      let fallbackClicked=false;
      let samples=[];
      while(Date.now()<deadline){
        samples=await state(page);
        if(samples.some(v=>v.ready>=2&&v.width>0&&v.time>1))break;
        if(candidate.provider==='tiktok'&&!fallbackClicked&&Date.now()>deadline-17000){
          fallbackClicked=true;
          await page.mouse.click(500,370).catch(()=>{});
        }
        await new Promise(resolve=>setTimeout(resolve,1000));
      }
      record.start=samples;
      if(!samples.some(v=>v.ready>=2&&v.width>0&&v.time>1))throw Error('No decoded advancing video element.');
      await page.screenshot({path:`${out}/${candidate.key}-start.png`});
      const start=samples[0].time;
      const progressDeadline=Date.now()+12000;
      while(Date.now()<progressDeadline){
        samples=await state(page);
        if(samples.some(v=>v.time>=start+2))break;
        await new Promise(resolve=>setTimeout(resolve,700));
      }
      record.progress=samples;
      if(!samples.some(v=>v.time>=start+2))throw Error('Video did not continue beyond first decoded frame.');
      await page.screenshot({path:`${out}/${candidate.key}-progress.png`});
      record.result='decoded-progress';
    } catch(error){
      record.error=String(error).slice(0,1000);
      await page.screenshot({path:`${out}/${candidate.key}-failure.png`}).catch(()=>{});
    } finally {write();await context.close();}
  }
} finally {write();await browser.close();}
console.log(JSON.stringify(result));
