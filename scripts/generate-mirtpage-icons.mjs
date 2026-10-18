import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {PLATFORM_BRAND} from '../lib/brand.ts';

// The approved 440×96 SVG is primary wordmark artwork. Its fixed outlines were
// extracted once from its existing Arial Bold composition, at the original
// 64px size, -2 spacing and 71 baseline. Generation never requires a system font.
// Historical Suqpage generators/URLs deliberately remain separate.
export async function mirtpageDerivatives(root=process.cwd()) {
 const read=asset=>fs.readFile(path.join(root,'public'+asset),'utf8');
 const [mark,wordmark]=await Promise.all([read(PLATFORM_BRAND.assets.mark),read(PLATFORM_BRAND.assets.wordmark)]);
 assert.ok(!/<(?:text|image)\b|font-family|https?:\/\/(?!www\.w3\.org)/i.test(wordmark),'Wordmark must be self-contained outlined artwork');
 const symbol=mark.match(/<path\b[^>]*\bd="([^"]+)"/)?.[1];assert.ok(symbol&&wordmark.includes(`d="${symbol}"`),'Same canonical two-panel M');
 for(const color of wordmark.match(/#[a-f\d]{6}/ig)||[])assert.ok([PLATFORM_BRAND.colors.logo,PLATFORM_BRAND.colors.white,PLATFORM_BRAND.colors.ink].includes(color.toLowerCase()));
 const fullBleed=mark.replace(' rx="112"',''),badge=mark.replace(/  <rect[^\n]*\n/,'');
 const output=new Map();
 for(const[asset,size]of[[PLATFORM_BRAND.assets.favicon,32],[PLATFORM_BRAND.assets.apple,180],[PLATFORM_BRAND.assets.icon192,192],[PLATFORM_BRAND.assets.icon512,512]])output.set('public'+asset,await sharp(Buffer.from(mark)).resize(size,size).png().toBuffer());
 const maskable=await sharp(Buffer.from(fullBleed)).resize(512,512).png().toBuffer();output.set('public'+PLATFORM_BRAND.assets.maskable512,maskable);output.set('apps/mobile/assets/icon.png',maskable);output.set('apps/mobile/assets/mirtpage-mark.png',output.get('public'+PLATFORM_BRAND.assets.icon512));
 output.set('public'+PLATFORM_BRAND.assets.notificationBadge,await sharp(Buffer.from(badge)).resize(96,96).png().toBuffer());
 output.set('public'+PLATFORM_BRAND.assets.wordmarkReverse,Buffer.from(wordmark.replaceAll(PLATFORM_BRAND.colors.ink,PLATFORM_BRAND.colors.white)));
 output.set('apps/mobile/assets/mirtpage-wordmark.png',await sharp(Buffer.from(wordmark)).resize(PLATFORM_BRAND.wordmark.width*3,PLATFORM_BRAND.wordmark.height*3).png().toBuffer());
 return output;
}
export async function generateMirtpageIcons({root=process.cwd(),check=false}={}) {
 const output=await mirtpageDerivatives(root),stale=[];
 for(const[file,bytes]of output){const destination=path.join(root,file);if(check){const current=await fs.readFile(destination).catch(()=>null);if(!current?.equals(bytes))stale.push(file);}else{await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,bytes);}}
 assert.deepEqual(stale,[],'Canonical MirtPage artwork derivatives are stale');return [...output.keys()];
}
if(process.argv[1]&&path.basename(process.argv[1])==='generate-mirtpage-icons.mjs')generateMirtpageIcons({check:process.argv.includes('--check')}).then(files=>console.log(JSON.stringify({checked:process.argv.includes('--check'),files}))).catch(error=>{console.error(error);process.exitCode=1;});
