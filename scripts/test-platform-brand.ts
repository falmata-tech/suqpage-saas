import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {PLATFORM_BRAND} from '../lib/brand';
import {platformAssetRewrites} from '../lib/platform-assets';

const require=createRequire(process.cwd()+'/package.json'),nativeRequire=createRequire(process.cwd()+'/apps/mobile/package.json');
const {mirtpageDerivatives,generateMirtpageIcons}=require('./scripts/generate-mirtpage-icons.mjs') as {mirtpageDerivatives(root?:string):Promise<Map<string,Buffer>>;generateMirtpageIcons(options?:{root?:string;check?:boolean}):Promise<string[]>};

test('FE-070 presentation identity has original unshadowed assets and mask-safe small icons',async()=>{
 assert.equal(PLATFORM_BRAND.name,'MirtPage');assert.equal(PLATFORM_BRAND.wordmark.leading+PLATFORM_BRAND.wordmark.trailing,PLATFORM_BRAND.name);
 assert.deepEqual(PLATFORM_BRAND.colors,{logo:'#ff4b00',action:'#c93600',ink:'#202428',cream:'#f4f4f2',white:'#ffffff'});
 for(const asset of Object.values(PLATFORM_BRAND.assets)){
  assert.ok(asset.startsWith('/')&&!asset.startsWith('//')&&!asset.includes('..'));assert.ok(fs.existsSync('public'+asset));
  assert.ok(!platformAssetRewrites.some(alias=>alias.source===asset),'New canonical art cannot be an old rewrite source');
  assert.ok(!fs.readFileSync('public/_redirects','utf8').split('\n').some(line=>line.trim().split(/\s+/)[0]===asset),'Netlify cannot shadow the new canonical art');
 }
 const mark=fs.readFileSync('public'+PLATFORM_BRAND.assets.mark,'utf8');assert.match(mark,/<title id="title">MirtPage<\/title>/);assert.match(mark,/viewBox="0 0 512 512"/);
 for(const color of mark.match(/#[a-f0-9]{6}/ig)||[])assert.ok(['#ff4b00','#ffffff'].includes(color));
 const notification=await sharp('apps/mobile/assets/mirtpage-notification.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(notification.info.width,96);assert.equal(notification.info.height,96);
 let opaque=0,transparent=0;for(let i=0;i<notification.data.length;i+=4){if(notification.data[i+3]){opaque++;assert.equal(notification.data[i],255);assert.equal(notification.data[i+1],255);assert.equal(notification.data[i+2],255);}else transparent++;}assert.ok(opaque>0&&transparent>0,'Canonical Android notification M is white with transparent surrounding pixels');
 for(const [asset,size]of[[PLATFORM_BRAND.assets.favicon,32],[PLATFORM_BRAND.assets.apple,180],[PLATFORM_BRAND.assets.icon192,192],[PLATFORM_BRAND.assets.icon512,512],[PLATFORM_BRAND.assets.maskable512,512]]as const){const m=await sharp('public'+asset).metadata();assert.equal(m.width,size);assert.equal(m.height,size);assert.equal(m.format,'png');}
 const image=await sharp('public'+PLATFORM_BRAND.assets.maskable512).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const pixel=(x:number,y:number)=>[...image.data.subarray((y*image.info.width+x)*4,(y*image.info.width+x)*4+4)];
 assert.deepEqual(pixel(256,256),[255,75,0,255],'The page gutter remains orange');assert.deepEqual(pixel(140,240),[255,255,255,255]);assert.deepEqual(pixel(370,240),[255,255,255,255]);assert.deepEqual(pixel(0,0),[255,75,0,255],'Maskable art has a full-bleed background');
 const vertices=[[120,144],[172,144],[248,224],[248,312],[172,234],[172,368],[120,368],[264,224],[340,144],[392,144],[392,368],[340,368],[340,234],[264,312]];
 assert.ok(vertices.every(([x,y])=>Math.hypot(x-256,y-256)<512*.4),'White identity fits inside the maskable safe circle');
 assert.ok(fs.existsSync('public/brand/suqpage-mark.svg'),'Legacy asset is retained for existing bookmarks');
});

test('FE-070 full wordmark and icon derivatives preserve canonical outlines and exact colors without platform fonts',async()=>{
 const source=fs.readFileSync('public'+PLATFORM_BRAND.assets.wordmark,'utf8');assert.doesNotMatch(source,/<(?:text|image)\b|font-family/);assert.match(source,/viewBox="0 0 440 96"/);
 const expected=await mirtpageDerivatives();for(const[file,bytes]of expected)assert.ok(fs.readFileSync(file).equals(bytes),`${file} must be reproduced from canonical SVG geometry`);
 assert.ok(fs.readFileSync('apps/mobile/assets/mirtpage-wordmark.png').equals(await sharp(Buffer.from(source)).resize(1320,288).png().toBuffer()));
 assert.ok(fs.readFileSync('public/brand/mirtpage-panels-wordmark-email.png').equals(fs.readFileSync('apps/mobile/assets/mirtpage-wordmark.png')),'The previous transparent email raster and mobile artwork remain unchanged');
 assert.equal(fs.readFileSync('public'+PLATFORM_BRAND.assets.wordmarkReverse,'utf8'),source.replaceAll(PLATFORM_BRAND.colors.ink,PLATFORM_BRAND.colors.white));
 const badge=await sharp('public'+PLATFORM_BRAND.assets.notificationBadge).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(badge.info.width,96);let visible=0,transparent=0;
 for(let i=0;i<badge.data.length;i+=4){if(badge.data[i+3]>0){visible++;assert.deepEqual([...badge.data.subarray(i,i+3)],[255,255,255]);}else transparent++;}assert.ok(visible>500&&transparent>500,'Badge is the white M silhouette, not an opaque colored square');
 const isolated=fs.mkdtempSync(path.join(os.tmpdir(),'mirtpage-art-'));
 try{for(const asset of[PLATFORM_BRAND.assets.mark,PLATFORM_BRAND.assets.wordmark]){fs.mkdirSync(path.dirname(path.join(isolated,'public'+asset)),{recursive:true});fs.copyFileSync('public'+asset,path.join(isolated,'public'+asset));}await generateMirtpageIcons({root:isolated});await generateMirtpageIcons({root:isolated,check:true});
  // The checker must reject a correct-size file carrying another mark or shade.
  fs.copyFileSync('public/pwa/suqpage-icon-192.png',path.join(isolated,'public'+PLATFORM_BRAND.assets.icon192));await assert.rejects(()=>generateMirtpageIcons({root:isolated,check:true}),/stale/);await generateMirtpageIcons({root:isolated});
  const image=await sharp(path.join(isolated,'public'+PLATFORM_BRAND.assets.icon192)).ensureAlpha().raw().toBuffer({resolveWithObject:true});const orange=image.data.findIndex((_,i)=>i%4===0&&image.data[i]===255&&image.data[i+1]===75&&image.data[i+2]===0&&image.data[i+3]===255);assert.ok(orange>=0);image.data.set([201,54,0,255],orange);await sharp(image.data,{raw:image.info}).png().toFile(path.join(isolated,'public'+PLATFORM_BRAND.assets.icon192));await assert.rejects(()=>generateMirtpageIcons({root:isolated,check:true}),/stale/);
 }finally{fs.rmSync(isolated,{recursive:true,force:true});}
});

test('FE-070 email-only raster keeps canonical pixels on an opaque white canvas for dark inboxes',async()=>{
 assert.equal(PLATFORM_BRAND.assets.emailWordmark,'/brand/mirtpage-panels-wordmark-email-white-v2.png','A new filename avoids reusing the cached transparent email logo');
 const canonical=await sharp('apps/mobile/assets/mirtpage-wordmark.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const email=await sharp('public'+PLATFORM_BRAND.assets.emailWordmark).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(email.info.width,1320);assert.equal(email.info.height,288);
 assert.equal(email.info.width,canonical.info.width);assert.equal(email.info.height,canonical.info.height);
 let background=0,ink=0,orange=0;
 for(let offset=0;offset<email.data.length;offset+=4){
  assert.equal(email.data[offset+3],255,'Every email logo pixel must remain opaque on dark surfaces');
  const alpha=canonical.data[offset+3];
  for(let channel=0;channel<3;channel++){
   const expected=Math.round((canonical.data[offset+channel]*alpha+255*(255-alpha))/255);
   assert.ok(Math.abs(email.data[offset+channel]-expected)<=1,'Foreground geometry and white alpha composition must match canonical artwork');
   if(alpha===255)assert.equal(email.data[offset+channel],canonical.data[offset+channel],'Opaque canonical foreground RGB is exact');
  }
  if(alpha===0){background++;assert.deepEqual([...email.data.subarray(offset,offset+4)],[255,255,255,255]);}
  if(alpha===255&&canonical.data[offset]===32&&canonical.data[offset+1]===36&&canonical.data[offset+2]===40)ink++;
  if(alpha===255&&canonical.data[offset]===255&&canonical.data[offset+1]===75&&canonical.data[offset+2]===0)orange++;
 }
 assert.ok(background>1000&&ink>1000&&orange>1000,'White canvas and both exact canonical foreground colors are exercised');
 const onBlack=await sharp('public'+PLATFORM_BRAND.assets.emailWordmark).flatten({background:'#000000'}).removeAlpha().raw().toBuffer();
 const onWhite=await sharp('public'+PLATFORM_BRAND.assets.emailWordmark).flatten({background:'#ffffff'}).removeAlpha().raw().toBuffer();
 assert.ok(onBlack.equals(onWhite),'Light/dark backing cannot change any opaque logo pixel');
});

test('FE-070 manifest, metadata and shell preloads use the same new art without changing storage identity',()=>{
 const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'))as{icons:Array<{src:string}>;shortcuts:Array<{icons:Array<{src:string}>}>};
 assert.deepEqual(manifest.icons.map(icon=>icon.src),[PLATFORM_BRAND.assets.icon192,PLATFORM_BRAND.assets.icon512,PLATFORM_BRAND.assets.maskable512]);for(const shortcut of manifest.shortcuts)assert.ok(shortcut.icons.every(icon=>icon.src===PLATFORM_BRAND.assets.icon192));
 const layout=fs.readFileSync('app/layout.tsx','utf8');for(const icon of[PLATFORM_BRAND.assets.mark,PLATFORM_BRAND.assets.favicon,PLATFORM_BRAND.assets.apple])assert.ok(layout.includes(icon));
 const sw=fs.readFileSync('public/sw.js','utf8');for(const icon of[PLATFORM_BRAND.assets.mark,PLATFORM_BRAND.assets.icon192,PLATFORM_BRAND.assets.icon512,PLATFORM_BRAND.assets.maskable512])assert.ok(sw.includes(icon));assert.match(sw,/const CACHE_PREFIX = "suqpage-pwa-"/);assert.match(fs.readFileSync('apps/mobile/src/runtime.tsx','utf8'),/storageKey: "suqpage-owner-session"/);
 assert.doesNotMatch(fs.readFileSync('lib/brand.ts','utf8'),/process\.env|https?:\/\/|SecureStore|cookie|packageName/);
});

async function bundle(native:boolean){
 const resolver=native?nativeRequire:require;
 return build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:native?`import React from'react';import{createRoot}from'react-dom/client';import{Brand}from'./apps/mobile/src/ui';createRoot(document.getElementById('root')).render(<section data-native-brand style={{display:'flex',alignItems:'center',minHeight:48}}><Brand/></section>);`:`import React from'react';import{createRoot}from'react-dom/client';import Brand from'./components/MirtPageBrand';import LegacyBrand from'./components/SuqpageBrand';window.sameBrand=Brand===LegacyBrand;createRoot(document.getElementById('root')).render(<><div className="public-app-shell" style={{display:'block',minHeight:0}}><header className="public-app-header"><Brand/><select aria-label="Language" style={{minHeight:48}}><option>English</option></select></header></div><section className="landing-footer" style={{display:'block',background:'#202428',padding:20}}><LegacyBrand href="/dashboard" className="workspace-brand"/></section></>);`},outdir:'/tmp/mirtpage-brand-fixture',bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.png':'dataurl'},define:{global:'globalThis'},plugins:[{name:'brand-renderer-ports',setup(b){
  b.onResolve({filter:/^(?:react(?:\/jsx(?:-dev)?-runtime)?|react-dom(?:\/client)?)$/},a=>({path:resolver.resolve(a.path)}));
  b.onResolve({filter:/^@\//},a=>a.path==='@/lib/i18n/ui'?{path:'translation',namespace:'ports'}:{path:process.cwd()+'/'+a.path.slice(2)+'.ts'});
  b.onResolve({filter:/^(?:next\/link|react-native|react-native-svg|expo-file-system|expo-crypto)$/},a=>({path:a.path,namespace:'ports'}));
  if(native)b.onResolve({filter:/^\.\/(?:LoadingBar|runtime|private-image|open-link)$/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'tsx',resolveDir:process.cwd(),contents:a.path==='translation'?`export const useUiText=()=>value=>value;`:a.path==='next/link'?`import React from'react';export default({href,children,...props})=><a href={href} {...props}>{children}</a>;`:a.path==='react-native'?`export *from ${JSON.stringify(require.resolve('react-native-web'))};`:a.path==='react-native-svg'?`export default()=>null;export const Path=()=>null,SvgUri=()=>null;`:a.path==='expo-file-system'?`export class File{}export const Paths={};`:a.path==='expo-crypto'?`export const randomUUID=()=>{throw Error('Unexpected UUID');};`:a.path==='./LoadingBar'?`export default()=>null;`:a.path==='./runtime'?`export const useApp=()=>({t:value=>value}),mediaUrl=value=>value,API='https://fixture.invalid',auth={};`:a.path==='./private-image'?`export const preparePrivateImage=()=>{throw Error('Unexpected private-image work');};`:`export const openLink=()=>{throw Error('Unexpected external navigation');};`}));
 }}]});
}

// Actual brand components, actual React/RNWeb and existing platform CSS. HTTP,
// router and unrelated UI module dependencies are ports, not app workflow proof.
test('FE-070 canonical and compatibility web renderers plus native Brand keep proper-case identity and readable geometry',{timeout:120000},async()=>{
 const web=await bundle(false),native=await bundle(true),browser=await chromium.launch({channel:process.env.SUQPAGE_BROWSER_CHANNEL||undefined,headless:true});
 try{for(const width of[320,390,1440])for(const isNative of[false,true]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!=='http://brand.fixture')return route.abort('blockedbyclient');if(Object.values(PLATFORM_BRAND.assets).some(asset=>asset===u.pathname&&asset.endsWith('.svg')))return route.fulfill({contentType:'image/svg+xml',body:fs.readFileSync('public'+u.pathname)});return route.fulfill({contentType:'text/html',body:'<!doctype html><style>html,body{margin:0}#root{width:100%}</style><div id="root"></div>'});});await page.goto('http://brand.fixture');
   if(!isNative){await page.addStyleTag({content:fs.readFileSync('app/globals.css','utf8')+'\n'+fs.readFileSync('app/landing.css','utf8')});const css=web.outputFiles.find(file=>file.path.endsWith('.css'));assert.ok(css);await page.addStyleTag({content:css.text});}await page.addScriptTag({content:(isNative?native:web).outputFiles.find(file=>file.path.endsWith('.js'))!.text});
   if(isNative){const brand=page.locator('[data-native-brand]');await brand.getByRole('img',{name:'MirtPage',exact:true}).waitFor();const box=await brand.locator('img').evaluate(n=>{const r=n.getBoundingClientRect();return{width:r.width,height:r.height};});assert.ok(Math.abs(box.width-28*440/96)<.01);assert.equal(box.height,28);await page.waitForFunction(()=>document.querySelector('img')?.naturalWidth===1320);}
   else{assert.equal(await page.evaluate(()=>(window as unknown as{sameBrand:boolean}).sameBrand),true);const links=page.getByRole('link',{name:'MirtPage home',exact:true});assert.equal(await links.count(),2);assert.deepEqual(await links.evaluateAll(nodes=>nodes.map(n=>n.textContent)),['MirtPage','MirtPage']);assert.equal(await links.nth(1).getAttribute('href'),'/dashboard');
    for(const[index,link]of(await links.all()).entries()){const image=link.locator('img').filter({visible:true});assert.equal(await image.count(),1);assert.equal(await image.getAttribute('src'),index===0?PLATFORM_BRAND.assets.wordmark:PLATFORM_BRAND.assets.wordmarkReverse);await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(n=>n.complete&&n.naturalWidth>0));const b=await link.boundingBox(),i=await image.boundingBox();assert.ok(b&&i&&b.height>=48);assert.ok(Math.abs(i.width/i.height-440/96)<.01);assert.ok(Math.abs(i.y+i.height/2-b.y-b.height/2)<1);}
   }const artwork=page.locator('img').filter({visible:true}).first(),beforeBox=await artwork.boundingBox(),beforeSource=await artwork.getAttribute('src'),before=await artwork.screenshot({caret:'initial'});await page.addStyleTag({content:'.suqpage-brand *,[data-native-brand] *{font-family:monospace!important;font-weight:100!important;letter-spacing:9px!important}'});const afterBox=await artwork.boundingBox(),after=await artwork.screenshot({caret:'initial'}),beforePixels=await sharp(before).ensureAlpha().raw().toBuffer(),afterPixels=await sharp(after).ensureAlpha().raw().toBuffer();if(process.env.SUQPAGE_BRAND_OUTPUT){const prefix=path.join(process.env.SUQPAGE_BRAND_OUTPUT,`${isNative?'native':'web'}-${width}`);fs.mkdirSync(path.dirname(prefix),{recursive:true});fs.writeFileSync(prefix+'-before.png',before);fs.writeFileSync(prefix+'-after.png',after);fs.writeFileSync(prefix+'-geometry.json',JSON.stringify({beforeBox,afterBox,pixelsEqual:beforePixels.equals(afterPixels)}));}assert.deepEqual(afterBox,beforeBox,'Fonts cannot alter artwork geometry');assert.equal(await artwork.getAttribute('src'),beforeSource,'Fonts cannot replace canonical artwork');const imageInfo=await sharp(before).metadata();assert.equal(beforePixels.length,afterPixels.length);let interior=0;for(let y=1;y<imageInfo.height!-1;y++)for(let x=1;x<imageInfo.width!-1;x++){const offset=(y*imageInfo.width!+x)*4;let solid=true;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const near=((y+dy)*imageInfo.width!+x+dx)*4;for(let channel=0;channel<4;channel++)if(beforePixels[near+channel]!==beforePixels[offset+channel])solid=false;}if(solid){interior++;assert.ok(beforePixels.subarray(offset,offset+4).equals(afterPixels.subarray(offset,offset+4)),`Solid artwork color changed at ${width}/${isNative?'native':'web'}/${x},${y}`);}}assert.ok(interior>100,'Enough solid pixels to verify exact fills'); /* FE-070 permits antialiasing at outline edges; canonical asset bytes are checked above. */assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  }finally{await page.close();}
 }}finally{await browser.close();}
});
