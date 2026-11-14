import {parseProductMedia,type ProductMedia} from './product-media';
import {normalizeProductVideoUrl,productVideo,productVideoWatchUrl} from './video/product-video';

export type DemoMediaCorrection = {
 kind:'media_correction'; operationKey:string; businessId:number; handle:string;
 ownerUserId:number; providerUserId:string; expectedHash:string;
 expectedContentVersion:number; expectedDraftVersion:number; expectedPageRevision:number;
 coverBefore:string; coverVideoRef:string;
 products:Array<{productId:number;beforeMedia:ProductMedia[];afterMedia:ProductMedia[]}>;
};

const invalid=()=>{throw Error('Invalid reviewed demo media correction.');};
function object(value:unknown,keys:readonly string[]):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))return invalid();
 return value as Record<string,unknown>;
}
function integer(value:unknown,min:number){if(!Number.isSafeInteger(value)||Number(value)<min)return invalid();return Number(value);}
function text(value:unknown,pattern:RegExp){if(typeof value!=='string'||!pattern.test(value))return invalid();return value;}

/** A finite exact media plan, not permission to alter product facts or images. */
export function parseDemoMediaCorrection(raw:unknown):DemoMediaCorrection{
 const v=object(raw,['kind','operationKey','businessId','handle','ownerUserId','providerUserId','expectedHash',
  'expectedContentVersion','expectedDraftVersion','expectedPageRevision','coverBefore','coverVideoRef','products']);
 if(v.kind!=='media_correction'||typeof v.coverBefore!=='string'||v.coverBefore.length>500||
  !Array.isArray(v.products)||v.products.length<1||v.products.length>8)return invalid();
 if(v.coverBefore)normalizeProductVideoUrl(v.coverBefore);
 if(typeof v.coverVideoRef!=='string')return invalid();
 productVideo(v.coverVideoRef);
 const products=v.products.map(raw=>{
  const p=object(raw,['productId','beforeMedia','afterMedia']);
  const beforeMedia=parseProductMedia(p.beforeMedia),afterMedia=parseProductMedia(p.afterMedia);
  const oldVideos=beforeMedia.filter(x=>x.kind==='video');
  if(!afterMedia.some(x=>x.kind==='video')||
   (oldVideos.length ? afterMedia.length!==beforeMedia.length : afterMedia.length!==beforeMedia.length+1))return invalid();
  for(const [i,item] of beforeMedia.entries()){
   const after=afterMedia[i];
   if(!after||after.kind!==item.kind||(item.kind==='image'&&after.ref!==item.ref))return invalid();
  }
  if(!oldVideos.length&&afterMedia.at(-1)?.kind!=='video')return invalid();
  return {productId:integer(p.productId,1),beforeMedia,afterMedia};
 });
 if(new Set(products.map(p=>p.productId)).size!==products.length||products.some((p,i)=>i>0&&p.productId<=products[i-1].productId))return invalid();
 if(v.coverBefore===productVideoWatchUrl(v.coverVideoRef)&&products.every(p=>JSON.stringify(p.beforeMedia)===JSON.stringify(p.afterMedia)))return invalid();
 return {kind:'media_correction',operationKey:text(v.operationKey,/^[a-zA-Z0-9_-]{12,64}$/),businessId:integer(v.businessId,1),
  handle:text(v.handle,/^[a-z0-9][a-z0-9-]{1,79}$/),ownerUserId:integer(v.ownerUserId,1),
  providerUserId:text(v.providerUserId,/^[0-9a-f-]{32,64}$/i),expectedHash:text(v.expectedHash,/^[0-9a-f]{64}$/),
  expectedContentVersion:integer(v.expectedContentVersion,1),expectedDraftVersion:integer(v.expectedDraftVersion,1),
  expectedPageRevision:integer(v.expectedPageRevision,1),coverBefore:v.coverBefore,coverVideoRef:v.coverVideoRef,products};
}
