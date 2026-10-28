import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Owner-supplied paired artwork. Derivatives are crops/resizes of its pixels;
// no generative reconstruction, system font or historical MirtPage mark is used.
const SOURCES=[
 {file:'brand-source/africmade-showroom-dark.png',sha256:'f3f9a5b86697eac24c6b88e5ae61ec52be0bbcc19a086f6b311819bd16ae9a41',background:'black',width:1942},
 {file:'brand-source/africmade-showroom-light.png',sha256:'2c893bd581dfd6d4e88be780588017fc1250e5d0d5731a5aa16101f470326ec9',background:'white',width:1942},
];
const WORDMARK={left:172,top:240,width:1608,height:312};
const WORDMARK_OUTPUT={width:1094,height:212};
const SYMBOL={left:174,top:240,width:312,height:312};
const TRANSPARENT={r:0,g:0,b:0,alpha:0};
const WHITE={r:255,g:255,b:255,alpha:255};

function rgba(buffer,width,height){return sharp(buffer,{raw:{width,height,channels:4}});}

/** Remove the approved canvas without redrawing the owner's mark. */
async function extractedArtwork(root,{file,sha256,background,width}){
 const source=await fs.readFile(path.join(root,file));
 assert.equal(createHash('sha256').update(source).digest('hex'),sha256,'Approved logo source changed');
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,width);assert.equal(info.height,809);
 const clear=Buffer.alloc(data.length);
 for(let i=0;i<data.length;i+=4){
  const alpha=background==='black'?Math.max(data[i],data[i+1],data[i+2]):255-Math.min(data[i],data[i+1],data[i+2]);
  if(alpha<=12)continue;
  for(let channel=0;channel<3;channel++)clear[i+channel]=Math.max(0,Math.min(255,Math.round(background==='black'?data[i+channel]*255/alpha:(data[i+channel]*255-255*(255-alpha))/alpha)));
  clear[i+3]=alpha;
 }
 return {clear,width:info.width,height:info.height};
}

async function squareIcon(mark,size,scale,background){
 const edge=Math.round(size*scale);
 const foreground=await sharp(mark).resize(edge,edge,{fit:'fill'}).png().toBuffer();
 return sharp({create:{width:size,height:size,channels:4,background}})
  .composite([{input:foreground,left:Math.floor((size-edge)/2),top:Math.floor((size-edge)/2)}]).png().toBuffer();
}

function icoFromPngs(entries){
 const headerBytes=6+entries.length*16;
 const ico=Buffer.alloc(headerBytes+entries.reduce((sum,{png})=>sum+png.length,0));
 ico.writeUInt16LE(1,2);ico.writeUInt16LE(entries.length,4);
 let offset=headerBytes;
 entries.forEach(({size,png},index)=>{
  const entry=6+index*16;
  ico[entry]=size;ico[entry+1]=size;
  ico.writeUInt16LE(1,entry+4);ico.writeUInt16LE(32,entry+6);
  ico.writeUInt32LE(png.length,entry+8);ico.writeUInt32LE(offset,entry+12);
  png.copy(ico,offset);offset+=png.length;
 });
 return ico;
}

export async function africmadeDerivatives(root=process.cwd()){
 const [dark,light]=await Promise.all(SOURCES.map(source=>extractedArtwork(root,source)));
 const mark=await rgba(dark.clear,dark.width,dark.height).extract(SYMBOL).png().toBuffer();
 const wordmark=await rgba(light.clear,light.width,light.height).extract(WORDMARK).resize(WORDMARK_OUTPUT.width,WORDMARK_OUTPUT.height).png().toBuffer();
 const reverse=await rgba(dark.clear,dark.width,dark.height).extract(WORDMARK).resize(WORDMARK_OUTPUT.width,WORDMARK_OUTPUT.height).png().toBuffer();
 const emailWordmark=await sharp(wordmark).flatten({background:'#ffffff'}).png().toBuffer();
 // Hosted Auth HTML still sizes its version-2 URL at 220×60. Keep that URL's
 // canvas at the old aspect ratio so the new lettering is not stretched.
 const legacyEmailWordmark=await sharp({create:{width:1094,height:300,channels:4,background:'#ffffff'}})
  .composite([{input:emailWordmark,left:0,top:44}]).png().toBuffer();
 const badgePixels=await sharp(mark).resize(96,96).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<badgePixels.data.length;i+=4){if(badgePixels.data[i+3]>0)badgePixels.data.fill(255,i,i+3);}
 const badge=await rgba(badgePixels.data,96,96).png().toBuffer();
 // The 108dp adaptive layer must retain all ink inside its 66dp safe circle.
 const adaptive=await squareIcon(mark,512,.48,TRANSPARENT);
 const monochromePixels=await sharp(adaptive).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<monochromePixels.data.length;i+=4){if(monochromePixels.data[i+3]>0)monochromePixels.data.fill(255,i,i+3);}
 const monochrome=await rgba(monochromePixels.data,512,512).png().toBuffer();
 const output=new Map([
  ['public/brand/africmade-showroom-mark-v3.png',await sharp(mark).resize(512,512).png().toBuffer()],
  ['public/brand/africmade-wordmark-v3.png',wordmark],
  ['public/brand/africmade-wordmark-reverse-v3.png',reverse],
  ['public/brand/africmade-wordmark-email-white-v3.png',emailWordmark],
  ['public/pwa/africmade-favicon-v3-32.png',await squareIcon(mark,32,.98,TRANSPARENT)],
  ['public/pwa/africmade-favicon-v3-512.png',await squareIcon(mark,512,.98,TRANSPARENT)],
  ['public/pwa/africmade-apple-touch-v4-180.png',await squareIcon(mark,180,.72,WHITE)],
  ['public/pwa/africmade-icon-v4-192.png',await squareIcon(mark,192,.72,WHITE)],
  ['public/pwa/africmade-icon-v4-512.png',await squareIcon(mark,512,.72,WHITE)],
  // Web maskable icons have their own 80%-diameter safe circle.
  ['public/pwa/africmade-maskable-v4-512.png',await squareIcon(mark,512,.64,WHITE)],
  ['public/pwa/africmade-badge-96.png',badge],
  ['apps/mobile/assets/icon.png',await squareIcon(mark,1024,.72,WHITE)],
  ['apps/mobile/assets/africmade-adaptive-foreground.png',adaptive],
  ['apps/mobile/assets/africmade-mark.png',await sharp(mark).resize(512,512).png().toBuffer()],
  ['apps/mobile/assets/africmade-wordmark.png',wordmark],
  ['apps/mobile/assets/africmade-splash-wordmark.png',reverse],
  ['apps/mobile/assets/africmade-splash-icon.png',adaptive],
  ['apps/mobile/assets/africmade-notification.png',badge],
  ['apps/mobile/assets/africmade-monochrome.png',monochrome],
 ]);
 output.set('public/favicon.ico',icoFromPngs([
  {size:16,png:await squareIcon(mark,16,1,TRANSPARENT)},
  {size:32,png:output.get('public/pwa/africmade-favicon-v3-32.png')},
  {size:48,png:await squareIcon(mark,48,.98,TRANSPARENT)},
 ]));
 // Saved shortcuts, installed PWAs and old email/asset URLs may still request
 // these paths. Keep their URLs valid, but never serve the former platform art.
 const aliases=[
  ['public/pwa/africmade-apple-touch-v3-180.png','public/pwa/africmade-apple-touch-v4-180.png'],
  ['public/pwa/africmade-icon-v3-192.png','public/pwa/africmade-icon-v4-192.png'],
  ['public/pwa/africmade-icon-v3-512.png','public/pwa/africmade-icon-v4-512.png'],
  ['public/pwa/africmade-maskable-v3-512.png','public/pwa/africmade-maskable-v4-512.png'],
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
  ['public/pwa/favicon-32.png','public/pwa/africmade-favicon-v3-32.png'],
  ['public/pwa/apple-touch-icon.png','public/pwa/africmade-apple-touch-v3-180.png'],
  ['public/pwa/icon-192.png','public/pwa/africmade-icon-v3-192.png'],
  ['public/pwa/icon-512.png','public/pwa/africmade-icon-v3-512.png'],
  ['public/pwa/icon-maskable-512.png','public/pwa/africmade-maskable-v3-512.png'],
  ['public/uploads/seed/suqpage/icon.png','public/pwa/africmade-icon-v3-512.png'],
  ['public/uploads/seed/suqpage/logo.png','public/brand/africmade-wordmark-email-white-v3.png'],
 ];
 for(const [legacy,current] of aliases)output.set(legacy,output.get(current));
 output.set('public/brand/africmade-wordmark-email-white-v2.png',legacyEmailWordmark);
 return output;
}

export async function generateAfricMadeAssets({root=process.cwd(),check=false}={}){
 const output=await africmadeDerivatives(root),stale=[];
 for(const[file,bytes]of output){
  const destination=path.join(root,file);
  if(check){const current=await fs.readFile(destination).catch(()=>null);if(!current?.equals(bytes))stale.push(file);}
  else{await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,bytes);}
 }
 assert.deepEqual(stale,[],'AfricMade asset derivatives are stale');
 return [...output.keys()];
}

if(process.argv[1]&&path.basename(process.argv[1])==='generate-africmade-assets.mjs'){
 const preflight=process.argv.includes('--preflight'),check=process.argv.includes('--check');
 (preflight?africmadeDerivatives().then(output=>[...output.keys()]):generateAfricMadeAssets({check}))
  .then(files=>console.log(JSON.stringify({preflight,checked:check,files})))
  .catch(error=>{console.error(error);process.exitCode=1;});
}
