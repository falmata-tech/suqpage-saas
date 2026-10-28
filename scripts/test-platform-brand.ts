import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

async function assertInkWithinCircle(file:string,radiusRatio:number,transparent:boolean){
 const {data,info}=await pixels(file),center=(info.width-1)/2,radius=info.width*radiusRatio;
 assert.equal(info.width,info.height,`${file}: square platform canvas`);
 let ink=0,outside=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const offset=(y*info.width+x)*4;
  // Opaque app/touch fields are white; measure the orange symbol, not its field.
  if(data[offset+3]<128||(!transparent&&!(data[offset]>180&&data[offset+1]<180&&data[offset+2]<100)))continue;
  ink++;if(Math.hypot(x-center,y-center)>radius)outside++;
 }
 assert.ok(ink>info.width*info.height*.02,`${file}: recognizable nonempty mark`);
 assert.equal(outside,0,`${file}: significant mark pixels must remain inside the platform mask circle`);
}

test('FE-070 S183 full launcher/adaptive/themed marks fit their actual mask circles',async()=>{
 for(const file of ['apps/mobile/assets/africmade-adaptive-foreground.png','apps/mobile/assets/africmade-monochrome.png'])await assertInkWithinCircle(file,33/108,true);
 for(const file of ['apps/mobile/assets/icon.png','public'+PLATFORM_BRAND.assets.apple,'public'+PLATFORM_BRAND.assets.icon192,'public'+PLATFORM_BRAND.assets.icon512]){
  await assertInkWithinCircle(file,.48,false);
  const {data}=await pixels(file);assert.deepEqual([...data.subarray(0,4)],[255,255,255,255],`${file}: white field`);
 }
 await assertInkWithinCircle('public'+PLATFORM_BRAND.assets.maskable512,.4,false);
 const foreground=await pixels('apps/mobile/assets/africmade-adaptive-foreground.png'),themed=await pixels('apps/mobile/assets/africmade-monochrome.png');
 for(let i=3;i<foreground.data.length;i+=4)assert.equal(themed.data[i],foreground.data[i],'Adaptive and themed masks share placement and alpha');
});

test('FE-070 S183 installed Expo plugin keeps every splash density inside the system mask',async t=>{
 let packageFile:string;
 try{packageFile=require.resolve('expo-splash-screen/package.json');}catch(error){
  if((error as NodeJS.ErrnoException).code==='MODULE_NOT_FOUND'){t.skip('Expo splash plugin omitted by the web-only install; permanent asset/mask tests still run.');return;}throw error;
 }
 const {setSplashImageDrawablesAsync}=require(path.join(path.dirname(packageFile),'plugin/build/withAndroidSplashImages.js')) as {setSplashImageDrawablesAsync:(config:Record<string,unknown>,projectRoot:string)=>Promise<void>};
 const mobile=JSON.parse(fs.readFileSync('apps/mobile/app.json','utf8')).expo;
 const options=mobile.plugins.find((entry:unknown)=>Array.isArray(entry)&&entry[0]==='expo-splash-screen')[1];
 const source=path.resolve('apps/mobile',options.image),directory=fs.mkdtempSync(path.join(os.tmpdir(),'africmade-splash-mask-'));
 try{
  const images=Object.fromEntries(['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'].map(density=>[density,source]));
  await setSplashImageDrawablesAsync({...images,imageWidth:options.imageWidth},directory);
  for(const [density,multiplier]of Object.entries({mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4})){
   const file=path.join(directory,`android/app/src/main/res/drawable-${density}/splashscreen_logo.png`),meta=await sharp(file).metadata();
   assert.equal(meta.width,288*multiplier);assert.equal(meta.height,288*multiplier);
   await assertInkWithinCircle(file,96/288,true);
  }
  assert.equal(options.image,'./assets/africmade-splash-icon.png');assert.equal(options.imageWidth,288);assert.equal(options.resizeMode,'contain');assert.equal(options.backgroundColor,'#ffffff');
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});

test('FE-070 S183 favicon, supplied mark, lettering and email bytes remain unchanged',()=>{
 for(const [file,digest]of [
  ['public/brand/africmade-showroom-mark-v3.png','fad6102e67707f8fa847d95c788a2cc71dbff52e092b7ca5dcf4447b04bcdbe2'],
  ['public/pwa/africmade-favicon-v3-32.png','88e94ef7e96620e692dc5bec8d191fafe30a5f3119e0e5260007c593e2f5293a'],
  ['public/favicon.png','90da68679845b49d93b01bc7e2bec04fb5d3da69146f6728a3a40a0670085524'],
  ['public/favicon.ico','d840c8bef06a2bd82cc15c49586657501dd6062b19477da7fb6d84c1f102e7a9'],
  ['public/brand/africmade-wordmark-v3.png','c686aa88afee3c747661b2c5b83aab0fcc8742230ed0d7552238b4fc297f9017'],
  ['public/brand/africmade-wordmark-reverse-v3.png','e5ca139309dc24679b6e70f51ba179ea9b31f3ade6c98de3d0169c8923c69a5f'],
  ['public/brand/africmade-wordmark-email-white-v3.png','6de02c62110cbcc762b6a37242f5beaf34f7fde23e40be5dbb2f32ce8b3ec716'],
 ])assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),digest,file);
});

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
  ['public/pwa/africmade-apple-touch-v3-180.png','public/pwa/africmade-apple-touch-v4-180.png'],
  ['public/pwa/africmade-icon-v3-192.png','public/pwa/africmade-icon-v4-192.png'],
  ['public/pwa/africmade-icon-v3-512.png','public/pwa/africmade-icon-v4-512.png'],
  ['public/pwa/africmade-maskable-v3-512.png','public/pwa/africmade-maskable-v4-512.png'],
  ['public/brand/africmade-maker-mark-v2.png','public/brand/africmade-showroom-mark-v3.png'],
  ['public/brand/africmade-wordmark-v2.png','public/brand/africmade-wordmark-v3.png'],
  ['public/brand/africmade-wordmark-reverse-v2.png','public/brand/africmade-wordmark-reverse-v3.png'],
  ['public/pwa/africmade-favicon-v2-32.png','public/pwa/africmade-favicon-v3-32.png'],
  ['public/pwa/africmade-apple-touch-v2-180.png','public/pwa/africmade-apple-touch-v4-180.png'],
  ['public/pwa/africmade-icon-v2-192.png','public/pwa/africmade-icon-v4-192.png'],
  ['public/pwa/africmade-icon-v2-512.png','public/pwa/africmade-icon-v4-512.png'],
  ['public/pwa/africmade-maskable-v2-512.png','public/pwa/africmade-maskable-v4-512.png'],
  ['public/brand/africmade-afro-mark-v1.png','public/brand/africmade-showroom-mark-v3.png'],
  ['public/brand/africmade-wordmark-v1.png','public/brand/africmade-wordmark-v3.png'],
  ['public/brand/africmade-wordmark-reverse-v1.png','public/brand/africmade-wordmark-reverse-v3.png'],
  ['public/brand/africmade-wordmark-email-white-v1.png','public/brand/africmade-wordmark-email-white-v3.png'],
  ['public/pwa/africmade-favicon-32.png','public/pwa/africmade-favicon-v3-32.png'],
  ['public/pwa/africmade-apple-touch-icon-180.png','public/pwa/africmade-apple-touch-v4-180.png'],
  ['public/pwa/africmade-icon-192.png','public/pwa/africmade-icon-v4-192.png'],
  ['public/pwa/africmade-icon-512.png','public/pwa/africmade-icon-v4-512.png'],
  ['public/pwa/africmade-maskable-512.png','public/pwa/africmade-maskable-v4-512.png'],
  ['public/favicon.png','public/pwa/africmade-favicon-v3-512.png'],
  ['public/apple-touch-icon.png','public/pwa/africmade-apple-touch-v4-180.png'],
  ['public/pwa/icon-192.png','public/pwa/africmade-icon-v4-192.png'],
  ['public/pwa/icon-512.png','public/pwa/africmade-icon-v4-512.png'],
  ['public/pwa/icon-maskable-512.png','public/pwa/africmade-maskable-v4-512.png'],
  ['public/pwa/favicon-32.png','public/pwa/africmade-favicon-v3-32.png'],
  ['public/pwa/apple-touch-icon.png','public/pwa/africmade-apple-touch-v4-180.png'],
  ['public/uploads/seed/suqpage/icon.png','public/pwa/africmade-icon-v4-512.png'],
  ['public/uploads/seed/suqpage/logo.png','public/brand/africmade-wordmark-email-white-v3.png'],
 ];
 for(const [legacy,current] of pairs)assert.ok(fs.readFileSync(legacy).equals(fs.readFileSync(current)),`${legacy} shows old artwork`);
 for(const name of ['mark','wordmark','notification'])assert.ok(!fs.existsSync(`apps/mobile/assets/mirtpage-${name}.png`),'Retired duplicate native asset must not be shipped');
 const retiredAssetRoutes=platformAssetRewrites.filter(route=>/^\/(?:brand|pwa)\/(?:suqpage|mirtpage)/.test(route.source));
 assert.equal(retiredAssetRoutes.length,22,'All saved former-brand asset URLs have exact rewrites');
 for(const route of retiredAssetRoutes){
  assert.ok(!fs.existsSync(`public${route.source}`),`Duplicate former-name asset should not be shipped: ${route.source}`);
  assert.ok(fs.existsSync(`public${route.destination}`),`Former-name asset rewrite lacks current art: ${route.source}`);
  assert.ok(fs.readFileSync('public/_redirects','utf8').includes(`${route.source} ${route.destination} 200`),`Netlify former-name rewrite is missing: ${route.source}`);
 }
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
  assert.deepEqual([...icon.data.subarray(0,4)],[255,255,255,255],`${file} needs the white field`);
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
 assert.equal(fs.existsSync('components/SuqpageBrand.tsx'),false,'Retired component shim is removed');
 assert.match(fs.readFileSync('components/PublicAppFrame.tsx','utf8'),/components\/AfricMadeBrand/);
 const mobile=JSON.parse(fs.readFileSync('apps/mobile/app.json','utf8')).expo;
 assert.equal(mobile.name,'AfricMade');assert.equal(mobile.icon,'./assets/icon.png');
 assert.equal(mobile.android.adaptiveIcon.foregroundImage,'./assets/africmade-adaptive-foreground.png');
 assert.equal(mobile.android.adaptiveIcon.monochromeImage,'./assets/africmade-monochrome.png');
 const splash=mobile.plugins.find((entry:unknown)=>Array.isArray(entry)&&entry[0]==='expo-splash-screen');
 assert.deepEqual(splash,['expo-splash-screen',{image:'./assets/africmade-splash-icon.png',imageWidth:288,resizeMode:'contain',backgroundColor:'#ffffff'}]);
 assert.equal(mobile.android.adaptiveIcon.backgroundColor,'#ffffff');
 assert.match(fs.readFileSync('apps/mobile/src/ui.tsx','utf8'),/africmade-wordmark\.png/);
 for(const asset of ['africmade-mark.png','africmade-wordmark.png','africmade-splash-wordmark.png','africmade-notification.png'])assert.ok(fs.existsSync(`apps/mobile/assets/${asset}`));
 assert.ok(platformAssetRewrites.some(route=>route.source==='/brand/suqpage-mark.svg'&&route.destination===PLATFORM_BRAND.assets.mark),'Old bookmarked asset URL resolves to the current mark');
});

test('DEP-044 S188 Play icon and package match the next AfricMade build',async()=>{
 const listing=JSON.parse(fs.readFileSync('docs/play-store/africmade/listing-draft.json','utf8')) as {
  targetPackage:string;currentLocalBuildPackage:string;expectedNextVersionCode:number;media:{icon:string};
 };
 assert.equal(listing.targetPackage,'com.africmade.app');
 assert.equal(listing.currentLocalBuildPackage,listing.targetPackage);
 assert.equal(listing.expectedNextVersionCode,4);
 const store=fs.readFileSync('docs/play-store/africmade/icon.png');
 assert.ok(store.equals(fs.readFileSync('public/pwa/africmade-icon-v4-512.png')),'Play icon must use the current white-background app artwork');
 const hash=createHash('sha256').update(store).digest('hex');
 assert.ok(listing.media.icon.includes(hash),'Listing must record the exact uploaded icon digest');
 const dimensions=await sharp(store).metadata();
 assert.equal(dimensions.width,512);assert.equal(dimensions.height,512);
 await assertInkWithinCircle('docs/play-store/africmade/icon.png',.48,false);
});
