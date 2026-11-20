import {parseProductMedia,type ProductMedia} from './product-media';
import {normalizeProductVideoUrl,productVideo,productVideoWatchUrl} from './video/product-video';
import {approvedDemoVideo} from './video/demo-video-catalog';
import {PUBLISHED_DEMO_VIDEO_TARGETS} from './published-demo-video-targets';

export type DemoMediaCorrection = {
 kind:'media_correction'; operationKey:string; businessId:number; handle:string;
 ownerUserId:number; providerUserId:string; expectedHash:string;
 expectedContentVersion:number; expectedDraftVersion:number; expectedPageRevision:number;
 coverBefore:string; coverVideoRef:string;
 products:Array<{productId:number;beforeMedia:ProductMedia[];afterMedia:ProductMedia[]}>;
};

/** Finite media maintenance for the two legacy public demos outside the simulator. */
export type UnenrolledDemoMediaCorrection = {
 kind:'unenrolled_media_correction'|'unenrolled_social_video_correction'; direction:'apply'|'rollback'; operationKey:string;
 businessId:50|62; handle:string; actorUserId:number; actorRole:'platform_admin';
 expectedContentVersion:number; expectedDraftVersion:number; expectedPageRevision:number;
 coverBefore:string; coverVideoRef:string; processVideoBefore:string; processVideoAfter:string;
 products:Array<{productId:number;beforeMedia:ProductMedia[];afterMedia:ProductMedia[]}>;
};

const legacyTargets={
 50:{handle:'demo-dara-clay-works',productIds:[197,198,199,200]},
 62:{handle:'demo-wabi-bottled-water',productIds:[245,246,247,248]},
} as const;

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
 if(v.coverVideoRef.startsWith('demo:')&&!approvedDemoVideo(v.coverVideoRef,Number(v.businessId)))return invalid();
 const products=v.products.map(raw=>{
  const p=object(raw,['productId','beforeMedia','afterMedia']);
  const beforeMedia=parseProductMedia(p.beforeMedia),afterMedia=parseProductMedia(p.afterMedia);
  if(afterMedia.some(item=>item.kind==='video'&&item.ref.startsWith('demo:')&&!approvedDemoVideo(item.ref,Number(v.businessId))))return invalid();
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

/** No tenant, product, or media expansion is admitted by this one-time path. */
export function parseUnenrolledDemoMediaCorrection(raw:unknown):UnenrolledDemoMediaCorrection{
 const v=object(raw,['kind','direction','operationKey','businessId','handle','actorUserId','actorRole',
  'expectedContentVersion','expectedDraftVersion','expectedPageRevision','coverBefore','coverVideoRef',
  'processVideoBefore','processVideoAfter','products']);
 const businessId=integer(v.businessId,1);
 const social=v.kind==='unenrolled_social_video_correction';
 if((!social&&v.kind!=='unenrolled_media_correction')||(v.direction!=='apply'&&v.direction!=='rollback')||
  v.actorRole!=='platform_admin'||
  (businessId!==50&&businessId!==62)||v.handle!==legacyTargets[businessId].handle||
  typeof v.coverBefore!=='string'||v.coverBefore.length>500||!Array.isArray(v.products)||v.products.length!==4)return invalid();
 if(v.coverBefore)normalizeProductVideoUrl(v.coverBefore);
 if(typeof v.coverVideoRef!=='string')return invalid();
 productVideo(v.coverVideoRef);
 if(typeof v.processVideoBefore!=='string'||typeof v.processVideoAfter!=='string'||
  v.processVideoBefore===v.processVideoAfter)return invalid();
 const processBefore=productVideo(v.processVideoBefore),processAfter=productVideo(v.processVideoAfter);
 const direction=v.direction;
 if(social) {
  const reviewed=PUBLISHED_DEMO_VIDEO_TARGETS.find(([id])=>id===businessId)?.[2];
  const packaged=`demo:business-${businessId}`;
  if(direction==='apply'&&(v.coverVideoRef!==reviewed||v.processVideoAfter!==reviewed||
    v.processVideoBefore!==packaged||normalizeProductVideoUrl(v.coverBefore).managedRef!==packaged))return invalid();
  if(direction==='rollback'&&(v.coverVideoRef!==packaged||v.processVideoAfter!==packaged||
    v.processVideoBefore!==reviewed||normalizeProductVideoUrl(v.coverBefore).managedRef!==reviewed))return invalid();
 } else {
 if(direction==='apply'&&(!v.coverVideoRef.startsWith('demo:')||!approvedDemoVideo(v.coverVideoRef,businessId)))return invalid();
 if(direction==='apply'&&(processBefore.provider!=='tiktok'||v.processVideoAfter!==v.coverVideoRef||
  !approvedDemoVideo(v.processVideoAfter,businessId)))return invalid();
 if(direction==='rollback'&&(!v.coverBefore.startsWith('/videos/demo/')||v.coverVideoRef.startsWith('demo:')||
  !approvedDemoVideo(normalizeProductVideoUrl(v.coverBefore).managedRef,businessId)))return invalid();
 if(direction==='rollback'&&(v.processVideoBefore!==normalizeProductVideoUrl(v.coverBefore).managedRef||
  !approvedDemoVideo(v.processVideoBefore,businessId)||processAfter.provider!=='tiktok'))return invalid();
 }
 const products=v.products.map((raw,index)=>{
  const p=object(raw,['productId','beforeMedia','afterMedia']);
  const productId=integer(p.productId,1);
  if(productId!==legacyTargets[businessId].productIds[index])return invalid();
  const beforeMedia=parseProductMedia(p.beforeMedia),afterMedia=parseProductMedia(p.afterMedia);
  if(beforeMedia.length!==afterMedia.length||beforeMedia.filter(m=>m.kind==='video').length!==1||
   afterMedia.filter(m=>m.kind==='video').length!==1)return invalid();
  for(let i=0;i<beforeMedia.length;i++){
   const before=beforeMedia[i],after=afterMedia[i];
   if(before.kind!==after.kind||(before.kind==='image'&&before.ref!==after.ref))return invalid();
   if(before.kind==='video'&&before.ref===after.ref)return invalid();
   if(after.kind==='video'&&social&&(direction==='apply'?after.ref!==v.coverVideoRef||!approvedDemoVideo(before.ref,businessId):before.ref!==v.processVideoBefore||!approvedDemoVideo(after.ref,businessId)))return invalid();
   if(after.kind==='video'&&!social&&direction==='apply'&&(!after.ref.startsWith('demo:')||!approvedDemoVideo(after.ref,businessId)))return invalid();
   if(!social&&before.kind==='video'&&direction==='rollback'&&(!before.ref.startsWith('demo:')||!approvedDemoVideo(before.ref,businessId)))return invalid();
  }
  return {productId,beforeMedia,afterMedia};
 });
 if(v.coverBefore===productVideoWatchUrl(v.coverVideoRef))return invalid();
 return {kind:social?'unenrolled_social_video_correction':'unenrolled_media_correction',direction,operationKey:text(v.operationKey,/^[a-zA-Z0-9_-]{12,64}$/),
  businessId,handle:legacyTargets[businessId].handle,actorUserId:integer(v.actorUserId,1),actorRole:'platform_admin',
  expectedContentVersion:integer(v.expectedContentVersion,1),expectedDraftVersion:integer(v.expectedDraftVersion,1),
  expectedPageRevision:integer(v.expectedPageRevision,1),coverBefore:v.coverBefore,coverVideoRef:v.coverVideoRef,
  processVideoBefore:v.processVideoBefore,processVideoAfter:v.processVideoAfter,products};
}

/** Bind a private queue row to its parsed media target before dispatch. */
export function parseQueuedDemoMediaCorrection(raw:unknown,businessId:number):DemoMediaCorrection|UnenrolledDemoMediaCorrection{
 if(!Number.isSafeInteger(businessId)||businessId<1||!raw||typeof raw!=='object'||Array.isArray(raw))return invalid();
 const kind=(raw as Record<string,unknown>).kind;
 const correction=kind==='media_correction'?parseDemoMediaCorrection(raw):
  (kind==='unenrolled_media_correction'||kind==='unenrolled_social_video_correction')?parseUnenrolledDemoMediaCorrection(raw):invalid();
 if(correction.businessId!==businessId)return invalid();
 return correction;
}
