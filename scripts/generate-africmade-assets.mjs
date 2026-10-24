import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Owner-supplied final artwork. Derivatives are crops/resizes of its pixels;
// no generative reconstruction, system font or historical MirtPage mark is used.
const SOURCE='brand-source/africmade-on-black.png';
const SOURCE_SHA256='c04a259d645e8c0b60eaf2b0e10c94b7a3336d93544bfe9ad50206457483590b';
const WORDMARK={left:56,top:132,width:1824,height:500};
const SYMBOL={left:50,top:111,width:550,height:550};
const TRANSPARENT={r:0,g:0,b:0,alpha:0};
const WHITE={r:255,g:255,b:255,alpha:255};

function rgba(buffer,width,height){return sharp(buffer,{raw:{width,height,channels:4}});}

/** Remove the source's black canvas while preserving its original orange edges. */
async function extractedArtwork(root){
 const source=await fs.readFile(path.join(root,SOURCE));
 assert.equal(createHash('sha256').update(source).digest('hex'),SOURCE_SHA256,'Approved logo source changed');
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,1916);assert.equal(info.height,821);
 const clear=Buffer.alloc(data.length);
 for(let i=0;i<data.length;i+=4){
  const alpha=Math.max(data[i],data[i+1],data[i+2]);
  if(alpha<=12)continue;
  clear[i]=Math.min(255,Math.round(data[i]*255/alpha));
  clear[i+1]=Math.min(255,Math.round(data[i+1]*255/alpha));
  clear[i+2]=Math.min(255,Math.round(data[i+2]*255/alpha));
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

export async function africmadeDerivatives(root=process.cwd()){
 const {clear,width,height}=await extractedArtwork(root);
 const mark=await rgba(clear,width,height).extract(SYMBOL).png().toBuffer();
 const fullWordmark=await rgba(clear,width,height).extract(WORDMARK).raw().toBuffer({resolveWithObject:true});
 const lightPixels=Buffer.from(fullWordmark.data);
 for(let y=0;y<fullWordmark.info.height;y++)for(let x=0;x<fullWordmark.info.width;x++){
  const sourceX=x+WORDMARK.left;
  if(sourceX<600||sourceX>=1195)continue;
  const i=(y*fullWordmark.info.width+x)*4;
  if(lightPixels[i+3]>0)lightPixels.fill(0,i,i+3);
 }
 const wordmark=await rgba(lightPixels,WORDMARK.width,WORDMARK.height).png().toBuffer();
 const reverse=await rgba(fullWordmark.data,WORDMARK.width,WORDMARK.height).png().toBuffer();
 const badgePixels=await sharp(mark).resize(96,96).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<badgePixels.data.length;i+=4){if(badgePixels.data[i+3]>0)badgePixels.data.fill(255,i,i+3);}
 const badge=await rgba(badgePixels.data,96,96).png().toBuffer();
 const monochromePixels=await sharp(mark).resize(512,512).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<monochromePixels.data.length;i+=4){if(monochromePixels.data[i+3]>0)monochromePixels.data.fill(255,i,i+3);}
 const monochrome=await rgba(monochromePixels.data,512,512).png().toBuffer();
 const output=new Map([
  ['public/brand/africmade-afro-mark-v1.png',await sharp(mark).resize(512,512).png().toBuffer()],
  ['public/brand/africmade-wordmark-v1.png',wordmark],
  ['public/brand/africmade-wordmark-reverse-v1.png',reverse],
  ['public/brand/africmade-wordmark-email-white-v1.png',await sharp(wordmark).flatten({background:'#ffffff'}).png().toBuffer()],
  ['public/pwa/africmade-favicon-32.png',await squareIcon(mark,32,.9,WHITE)],
  ['public/pwa/africmade-apple-touch-icon-180.png',await squareIcon(mark,180,.85,WHITE)],
  ['public/pwa/africmade-icon-192.png',await squareIcon(mark,192,.85,WHITE)],
  ['public/pwa/africmade-icon-512.png',await squareIcon(mark,512,.85,WHITE)],
  ['public/pwa/africmade-maskable-512.png',await squareIcon(mark,512,.64,WHITE)],
  ['public/pwa/africmade-badge-96.png',badge],
  ['apps/mobile/assets/icon.png',await squareIcon(mark,1024,.85,WHITE)],
  ['apps/mobile/assets/africmade-adaptive-foreground.png',await squareIcon(mark,512,.64,TRANSPARENT)],
  ['apps/mobile/assets/africmade-mark.png',await sharp(mark).resize(512,512).png().toBuffer()],
  ['apps/mobile/assets/africmade-wordmark.png',await sharp(wordmark).resize(1094,300).png().toBuffer()],
  ['apps/mobile/assets/africmade-notification.png',badge],
  ['apps/mobile/assets/africmade-monochrome.png',monochrome],
 ]);
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
