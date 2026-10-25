import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import sharp from 'sharp';
import {PLATFORM_BRAND} from '../lib/brand';
import {platformAssetRewrites} from '../lib/platform-assets';

const require=createRequire(import.meta.url);
const {africmadeDerivatives,generateAfricMadeAssets}=require('./generate-africmade-assets.mjs') as {
 africmadeDerivatives(root?:string):Promise<Map<string,Buffer>>;
 generateAfricMadeAssets(options?:{root?:string;check?:boolean}):Promise<string[]>;
};

async function pixels(file:string){return sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});}

// A saved owner source is the only input. Reproducibility catches accidental
// substitution of a prior mark, a changed hue or a platform-specific crop.
test('FE-070 supplied AfricMade artwork generates every canonical derivative',async()=>{
 assert.equal(PLATFORM_BRAND.name,'AfricMade');
 assert.equal(PLATFORM_BRAND.wordmark.leading+PLATFORM_BRAND.wordmark.trailing,'AfricMade');
 for(const [file,digest] of [
  ['brand-source/africmade-showroom-dark.png','f3f9a5b86697eac24c6b88e5ae61ec52be0bbcc19a086f6b311819bd16ae9a41'],
  ['brand-source/africmade-showroom-light.png','2c893bd581dfd6d4e88be780588017fc1250e5d0d5731a5aa16101f470326ec9'],
 ])assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),digest);
 await generateAfricMadeAssets({check:true});
 const derivatives=await africmadeDerivatives();
 for(const [file,bytes] of derivatives)assert.ok(fs.readFileSync(file).equals(bytes),`Artwork drift: ${file}`);
 for(const asset of Object.values(PLATFORM_BRAND.assets)){
  assert.ok(asset.startsWith('/')&&!asset.includes('..')&&fs.existsSync('public'+asset),asset);
  assert.ok(!platformAssetRewrites.some(rewrite=>rewrite.source===asset),`Canonical asset shadowed: ${asset}`);
  assert.ok(!fs.readFileSync('public/_redirects','utf8').split('\n').some(line=>line.trim().split(/\s+/)[0]===asset),`Netlify asset shadowed: ${asset}`);
 }
});

test('FE-070 saved icon and wordmark URLs cannot serve a former platform mark',async()=>{
 const pairs:[string,string][]=[
  ['public/brand/africmade-maker-mark-v2.png','public/brand/africmade-showroom-mark-v3.png'],
  ['public/brand/africmade-wordmark-v2.png','public/brand/africmade-wordmark-v3.png'],
  ['public/brand/africmade-wordmark-reverse-v2.png','public/brand/africmade-wordmark-reverse-v3.png'],
  ['public/pwa/africmade-favicon-v2-32.png','public/pwa/africmade-favicon-v3-32.png'],
  ['public/pwa/africmade-apple-touch-v2-180.png','public/pwa/africmade-apple-touch-v3-180.png'],
  ['public/pwa/africmade-icon-v2-192.png','public/pwa/africmade-icon-v3-192.png'],
  ['public/pwa/africmade-icon-v2-512.png','public/pwa/africmade-icon-v3-512.png'],
  ['public/pwa/africmade-maskable-v2-512.png','public/pwa/africmade-maskable-v3-512.png'],
  ['public/brand/africmade-afro-mark-v1.png','public/brand/africmade-showroom-mark-v3.png'],
  ['public/brand/africmade-wordmark-v1.png','public/brand/africmade-wordmark-v3.png'],
  ['public/brand/africmade-wordmark-reverse-v1.png','public/brand/africmade-wordmark-reverse-v3.png'],
  ['public/brand/africmade-wordmark-email-white-v1.png','public/brand/africmade-wordmark-email-white-v3.png'],
  ['public/pwa/africmade-favicon-32.png','public/pwa/africmade-favicon-v3-32.png'],
  ['public/pwa/africmade-apple-touch-icon-180.png','public/pwa/africmade-apple-touch-v3-180.png'],
  ['public/pwa/africmade-icon-192.png','public/pwa/africmade-icon-v3-192.png'],
  ['public/pwa/africmade-icon-512.png','public/pwa/africmade-icon-v3-512.png'],
  ['public/pwa/africmade-maskable-512.png','public/pwa/africmade-maskable-v3-512.png'],
  ['public/favicon.png','public/pwa/africmade-favicon-v3-512.png'],
  ['public/apple-touch-icon.png','public/pwa/africmade-apple-touch-v3-180.png'],
  ['public/pwa/icon-192.png','public/pwa/africmade-icon-v3-192.png'],
  ['public/pwa/icon-512.png','public/pwa/africmade-icon-v3-512.png'],
  ['public/pwa/icon-maskable-512.png','public/pwa/africmade-maskable-v3-512.png'],
  ['public/pwa/favicon-32.png','public/pwa/africmade-favicon-v3-32.png'],
  ['public/pwa/apple-touch-icon.png','public/pwa/africmade-apple-touch-v3-180.png'],
  ['public/uploads/seed/suqpage/icon.png','public/pwa/africmade-icon-v3-512.png'],
  ['public/uploads/seed/suqpage/logo.png','public/brand/africmade-wordmark-email-white-v3.png'],
  ['apps/mobile/assets/mirtpage-mark.png','apps/mobile/assets/africmade-mark.png'],
  ['apps/mobile/assets/mirtpage-wordmark.png','apps/mobile/assets/africmade-wordmark.png'],
  ['apps/mobile/assets/mirtpage-notification.png','apps/mobile/assets/africmade-notification.png'],
 ];
 for(const prefix of ['suqpage','mirtpage-panels']){
  for(const [suffix,current] of [
   ['favicon-32.png','africmade-favicon-v3-32.png'],
   ['apple-touch-icon.png','africmade-apple-touch-v3-180.png'],
   ['icon-192.png','africmade-icon-v3-192.png'],
   ['icon-512.png','africmade-icon-v3-512.png'],
   ['icon-maskable-512.png','africmade-maskable-v3-512.png'],
  ])pairs.push([`public/pwa/${prefix}-${suffix}`,`public/pwa/${current}`]);
 }
 pairs.push(['public/pwa/mirtpage-panels-badge-96.png','public/pwa/africmade-badge-96.png']);
 for(const suffix of ['wordmark-email.png','wordmark-email-white-v2.png'])pairs.push([`public/brand/mirtpage-panels-${suffix}`,'public/brand/africmade-wordmark-email-white-v2.png']);
 for(const [legacy,current] of pairs)assert.ok(fs.readFileSync(legacy).equals(fs.readFileSync(current)),`${legacy} shows old artwork`);
 const oldEmail=await pixels('public/brand/africmade-wordmark-email-white-v2.png');
 const newEmail=await pixels('public/brand/africmade-wordmark-email-white-v3.png');
 assert.equal(oldEmail.info.width,1094);assert.equal(oldEmail.info.height,300);
 assert.equal(newEmail.info.width,1094);assert.equal(newEmail.info.height,212);
 const centered=await sharp('public/brand/africmade-wordmark-email-white-v2.png').extract({left:0,top:44,width:1094,height:212}).png().toBuffer();
 assert.deepEqual((await sharp(centered).raw().toBuffer()),newEmail.data,'Hosted legacy email dimensions preserve the new artwork without stretching');
 const ico=fs.readFileSync('public/favicon.ico');
 assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),3);
 for(const [index,size] of [16,32,48].entries()){
  const entry=6+index*16,length=ico.readUInt32LE(entry+8),offset=ico.readUInt32LE(entry+12);
  assert.equal(ico[entry],size);assert.equal(ico[entry+1],size);
  assert.deepEqual([...ico.subarray(offset,offset+8)],[137,80,78,71,13,10,26,10]);
  if(size===32)assert.ok(ico.subarray(offset,offset+length).equals(fs.readFileSync('public/pwa/africmade-favicon-v3-32.png')));
 }
 const mark=fs.readFileSync('public/brand/africmade-showroom-mark-v3.png').toString('base64');
 const wordmark=fs.readFileSync('public/brand/africmade-wordmark-v3.png').toString('base64');
 const reverse=fs.readFileSync('public/brand/africmade-wordmark-reverse-v3.png').toString('base64');
 for(const file of ['suqpage-legacy-mark.svg','suqpage-mark.svg','suqpage-original-mark.svg','suqpage-original-mark-v2.svg','mirtpage-panels-mark.svg'])assert.ok(fs.readFileSync(`public/brand/${file}`,'utf8').includes(mark),file);
 assert.ok(fs.readFileSync('public/brand/mirtpage-panels-wordmark.svg','utf8').includes(wordmark));
 assert.ok(fs.readFileSync('public/brand/mirtpage-panels-wordmark-reverse.svg','utf8').includes(reverse));
});

test('FE-070 small, maskable and Android icons use the minimal showroom silhouette',async()=>{
 for(const [file,size] of [
  ['public'+PLATFORM_BRAND.assets.favicon,32],['public'+PLATFORM_BRAND.assets.apple,180],
  ['public'+PLATFORM_BRAND.assets.icon192,192],['public'+PLATFORM_BRAND.assets.icon512,512],
  ['public'+PLATFORM_BRAND.assets.maskable512,512],['apps/mobile/assets/icon.png',1024],
  ['apps/mobile/assets/africmade-adaptive-foreground.png',512],
  ['apps/mobile/assets/africmade-monochrome.png',512],
 ] as const){const meta=await sharp(file).metadata();assert.equal(meta.width,size,file);assert.equal(meta.height,size,file);assert.equal(meta.format,'png',file);}
 const mark=await pixels('public'+PLATFORM_BRAND.assets.mark);
 const foreground=await pixels('apps/mobile/assets/africmade-adaptive-foreground.png');
 assert.equal(mark.info.width,512);assert.equal(foreground.info.width,512);
 assert.equal(foreground.data[3],0,'Adaptive artwork keeps transparent corners');
 const themed=await pixels('apps/mobile/assets/africmade-monochrome.png');
 assert.equal(themed.data[3],0,'Themed artwork keeps transparent corners');
 let visible=0;for(let i=0;i<themed.data.length;i+=4)if(themed.data[i+3]){visible++;assert.deepEqual([...themed.data.subarray(i,i+3)],[255,255,255]);}
 assert.ok(visible>10000,'The themed icon contains the approved silhouette');
 for(const file of ['public'+PLATFORM_BRAND.assets.icon192,'apps/mobile/assets/icon.png']){
  const icon=await pixels(file);
  assert.deepEqual([...icon.data.subarray(0,3)],[32,36,40],`${file} needs the shared charcoal field`);
 }
 for(const file of ['public'+PLATFORM_BRAND.assets.favicon,'public/favicon.png']){
  const icon=await pixels(file);
  assert.equal(icon.data[3],0,`${file} needs transparent corners`);
  let orange=0;for(let i=0;i<icon.data.length;i+=4)if(icon.data[i+3]>128&&icon.data[i]>180&&icon.data[i+1]<140)orange++;
  assert.ok(orange>10,`${file} needs the visible orange showroom mark`);
 }
 const email=await pixels('public'+PLATFORM_BRAND.assets.emailWordmark);
 for(let i=3;i<email.data.length;i+=4)assert.equal(email.data[i],255,'Email art is readable on dark backgrounds');
});

test('FE-070 web, email, PWA and native configuration point to current artwork',()=>{
 const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8')) as {name:string;icons:Array<{src:string}>};
 assert.equal(manifest.name,'AfricMade');
 assert.deepEqual(manifest.icons.map(icon=>icon.src),[PLATFORM_BRAND.assets.icon192,PLATFORM_BRAND.assets.icon512,PLATFORM_BRAND.assets.maskable512]);
 const layout=fs.readFileSync('app/layout.tsx','utf8');for(const asset of [PLATFORM_BRAND.assets.mark,PLATFORM_BRAND.assets.favicon,PLATFORM_BRAND.assets.apple])assert.ok(layout.includes(asset),asset);
 const worker=fs.readFileSync('public/sw.js','utf8');assert.match(worker,/const CACHE_PREFIX = "africmade-pwa-"/);for(const asset of [PLATFORM_BRAND.assets.mark,PLATFORM_BRAND.assets.icon192])assert.ok(worker.includes(asset));
 const webBrand=fs.readFileSync('components/AfricMadeBrand.tsx','utf8');assert.match(webBrand,/AfricMade home/);assert.match(webBrand,/wordmarkReverse/);
 assert.match(fs.readFileSync('components/SuqpageBrand.tsx','utf8'),/AfricMadeBrand/,'Compatibility import uses the new renderer');
 const mobile=JSON.parse(fs.readFileSync('apps/mobile/app.json','utf8')).expo;
 assert.equal(mobile.name,'AfricMade');assert.equal(mobile.icon,'./assets/icon.png');
 assert.equal(mobile.android.adaptiveIcon.foregroundImage,'./assets/africmade-adaptive-foreground.png');
 assert.equal(mobile.android.adaptiveIcon.monochromeImage,'./assets/africmade-monochrome.png');
 const splash=mobile.plugins.find((entry:unknown)=>Array.isArray(entry)&&entry[0]==='expo-splash-screen');
 assert.deepEqual(splash,['expo-splash-screen',{image:'./assets/africmade-splash-wordmark.png',imageWidth:280,backgroundColor:'#202428'}]);
 assert.equal(mobile.android.adaptiveIcon.backgroundColor,'#202428');
 assert.match(fs.readFileSync('apps/mobile/src/ui.tsx','utf8'),/africmade-wordmark\.png/);
 for(const asset of ['africmade-mark.png','africmade-wordmark.png','africmade-splash-wordmark.png','africmade-notification.png'])assert.ok(fs.existsSync(`apps/mobile/assets/${asset}`));
 assert.ok(fs.existsSync('public/brand/suqpage-mark.svg'),'Old bookmarked asset URLs remain available');
});
