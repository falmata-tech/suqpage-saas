import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn,spawnSync} from 'node:child_process';
import {CATALOG_CARD_GAP,catalogCardStyle} from '../apps/mobile/src/catalog-card-layout';

// Focused native-engine gate: requires the full mobile install and a C++20
// compiler. It neither builds an app nor starts an emulator or network request.
const localRequire=createRequire(path.join(process.cwd(),'package.json'));
const reactNative=path.dirname(localRequire.resolve('react-native/package.json'));
const yoga=path.join(reactNative,'ReactCommon/yoga');
const source=path.resolve('scripts/testing/native-catalog-grid-yoga.cpp');
const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'mirtpage-yoga-grid-'));
const compiler=process.env.CXX||'c++';
type Geometry={reportedWidth:number;cards:Array<{x:number;y:number;width:number}>};
type Case={width:number;density:number;count:number;fontScale:number};
async function compile(args:string[]) {
  await new Promise<void>((resolve,reject)=>{
    const child=spawn(compiler,args,{stdio:['ignore','pipe','pipe']});
    let detail='';child.stdout.on('data',value=>detail+=value);child.stderr.on('data',value=>detail+=value);
    const timer=setTimeout(()=>child.kill('SIGTERM'),90_000);
    child.once('error',error=>{clearTimeout(timer);reject(error);});
    child.once('exit',code=>{clearTimeout(timer);code===0?resolve():reject(Error('Yoga fixture compilation failed: '+detail.slice(0,2000)));});
  });
}
function cppFiles(dir:string):string[]{return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?cppFiles(path.join(dir,entry.name)):entry.name.endsWith('.cpp')?[path.join(dir,entry.name)]:[]);}
async function main(){try {
  const files=cppFiles(path.join(yoga,'yoga')).sort();assert.ok(files.length>0,'Installed React Native Yoga sources are required');
  let cursor=0;const objects=files.map((_,i)=>path.join(workspace,i+'.o'));
  async function worker(){while(cursor<files.length){const i=cursor++;await compile(['-std=c++20','-O0','-I'+yoga,'-c',files[i],'-o',objects[i]]);}}
  await Promise.all([worker(),worker()]);
  const binary=path.join(workspace,'native-catalog-grid');await compile(['-std=c++20','-O0','-I'+yoga,source,...objects,'-o',binary]);
  function run(inputs:Array<{sample:Case;mode:number;basis?:number;grow?:number}>):Geometry[]{
    const input=inputs.map(({sample,mode,basis=0,grow=0})=>[mode,sample.width,sample.density,sample.count,basis,CATALOG_CARD_GAP,grow].join(' ')).join('\n')+'\n';
    const result=spawnSync(binary,[],{input,encoding:'utf8',timeout:30_000,maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr);
    const rows=result.stdout.trim().split('\n').map(line=>JSON.parse(line) as Geometry);assert.equal(rows.length,inputs.length);return rows;
  }
  const pixel={width:1080/2.625-36,density:2.625,count:2,fontScale:1};
  const oldPixel=run([{sample:pixel,mode:0}])[0];assert.ok(oldPixel.cards[1].y>oldPixel.cards[0].y,'Fixture must reproduce the former physical Pixel showroom wrap');
  const compact={width:284,density:2.625,count:2,fontScale:1};
  const oldFeatured=run([{sample:compact,mode:3}])[0];assert.ok(oldFeatured.cards[1].y>oldFeatured.cards[0].y,'Fixture must reproduce former320dp Featured wrapping');
  const cases:Case[]=[];
  for(const width of[252,284,300,311,312,312.5,pixel.width,390.17,724])for(const density of[1,1.5,2,2.625,3,3.5])for(const count of[1,2,3,5])for(const fontScale of[1,1.3,1.31,2])cases.push({width,density,count,fontScale});
  const measured=run(cases.map(sample=>({sample,mode:2})));
  const styles=measured.map((geometry,index)=>catalogCardStyle(geometry.reportedWidth,cases[index].fontScale));
  const layouts=run(cases.map((sample,index)=>({sample,mode:styles[index].flexBasis?1:2,basis:styles[index].flexBasis?Number.parseFloat(String(styles[index].flexBasis)):0,grow:styles[index].flexGrow||0})));
  layouts.forEach((layout,index)=>{
    const sample=cases[index],two=Boolean(styles[index].flexBasis),tolerance=1/sample.density+.001;
    assert.equal(layout.cards.length,sample.count);
    for(const [i,card]of layout.cards.entries()){
      assert.ok(card.x>=-.001&&card.x+card.width<=layout.reportedWidth+.001,'Cards remain inside the measured row');
      if(!two||i===sample.count-1&&sample.count%2===1){assert.ok(Math.abs(card.width-layout.reportedWidth)<=tolerance,'Single and final unpaired cards fill the row');}
      if(i>0){const previous=layout.cards[i-1];if(two&&i%2===1){assert.ok(Math.abs(card.y-previous.y)<=.001,'Paired cards never wrap because of pixel-rounded measurements');assert.ok(card.x>=previous.x+previous.width+CATALOG_CARD_GAP-tolerance,'Gap and card edges do not overlap');assert.ok(Math.abs(card.width-previous.width)<=tolerance,'Yoga shares available width equally');}else assert.ok(card.y>previous.y,'Full-width/new rows follow the previous row');}
    }
  });
  console.log(JSON.stringify({passed:true,engine:'installed React Native '+localRequire('react-native/package.json').version+' Yoga',cases:cases.length,oldPixelWrapReproduced:true,oldFeaturedWrapReproduced:true,sourceSizingContract:true,physicalDevice:false,appBuild:false,networkRequests:0}));
} finally {fs.rmSync(workspace,{recursive:true,force:true});}}
main().catch(error=>{console.error(error);process.exitCode=1;});
