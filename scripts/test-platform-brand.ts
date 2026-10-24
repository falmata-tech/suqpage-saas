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
 assert.equal(createHash('sha256').update(fs.readFileSync('brand-source/africmade-on-black.png')).digest('hex'),'c04a259d645e8c0b60eaf2b0e10c94b7a3336d93544bfe9ad50206457483590b');
 await generateAfricMadeAssets({check:true});
 const derivatives=await africmadeDerivatives();
 for(const [file,bytes] of derivatives)assert.ok(fs.readFileSync(file).equals(bytes),`Artwork drift: ${file}`);
 for(const asset of Object.values(PLATFORM_BRAND.assets)){
  assert.ok(asset.startsWith('/')&&!asset.includes('..')&&fs.existsSync('public'+asset),asset);
  assert.ok(!platformAssetRewrites.some(rewrite=>rewrite.source===asset),`Canonical asset shadowed: ${asset}`);
  assert.ok(!fs.readFileSync('public/_redirects','utf8').split('\n').some(line=>line.trim().split(/\s+/)[0]===asset),`Netlify asset shadowed: ${asset}`);
 }
});

test('FE-070 small, maskable and Android icons use the same afro-pick silhouette',async()=>{
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
 assert.deepEqual(splash,['expo-splash-screen',{image:'./assets/africmade-mark.png',imageWidth:200,backgroundColor:'#ffffff'}]);
 assert.match(fs.readFileSync('apps/mobile/src/ui.tsx','utf8'),/africmade-wordmark\.png/);
 for(const asset of ['africmade-mark.png','africmade-wordmark.png','africmade-notification.png'])assert.ok(fs.existsSync(`apps/mobile/assets/${asset}`));
 assert.ok(fs.existsSync('public/brand/suqpage-mark.svg'),'Old bookmarked asset URLs remain available');
});
