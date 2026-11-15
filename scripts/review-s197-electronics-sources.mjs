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
  {key:'connectpro-wire-harness',provider:'tiktok',id:'7660000446525836566',creator:'https://www.tiktok.com/@connectpromfg/video/7660000446525836566'},
  {key:'sunfounder-water-display',provider:'tiktok',id:'7690902002590551327',creator:'https://www.tiktok.com/@sunfounder_official/video/7690902002590551327'},
  {key:'sunfounder-temperature',provider:'tiktok',id:'7676359233994050846',creator:'https://www.tiktok.com/@sunfounder_official/video/7676359233994050846'},
  {key:'xkc-water-alert',provider:'tiktok',id:'7356139583588912392',creator:'https://www.tiktok.com/@waterlevelsensorx/video/7356139583588912392'},
  {key:'saier-sensor-production',provider:'tiktok',id:'7520459875109899540',creator:'https://www.tiktok.com/@saier_sensor_factory/video/7520459875109899540'},
  {key:'jz-pressure-production',provider:'tiktok',id:'7314967881823948037',creator:'https://www.tiktok.com/@jzsensor/video/7314967881823948037'},
  {key:'nuoying-instrument-maker',provider:'tiktok',id:'7449702031918468382',creator:'https://www.tiktok.com/@nuoying1/video/7449702031918468382'},
  {key:'merry-speaker-assembly',provider:'tiktok',id:'7700891449390517522',creator:'https://www.tiktok.com/@speakerfactory888/video/7700891449390517522'},
  {key:'hezhonghui-solar-light',provider:'tiktok',id:'7700859530430795038',creator:'https://www.tiktok.com/@hezhonghui3/video/7700859530430795038'},
  {key:'imaloys-solar-maker',provider:'tiktok',id:'7188930405431561514',creator:'https://www.tiktok.com/@imaloys/video/7188930405431561514'},
  {key:'lampfactory-production',provider:'tiktok',id:'7579065245407169805',creator:'https://www.tiktok.com/@lampfactory0/video/7579065245407169805'},
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
