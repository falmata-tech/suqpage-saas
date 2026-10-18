import {Platform} from 'react-native';
import {MAP_MAX_ZOOM,MAP_GROUP_MAX_MEMBERS} from '../../../lib/map/map-clustering';

export type MapReturnCamera={center:[number,number];zoom:number};
export type MapReturnContext={ids:number[];page:number;anchor:number|null;camera:MapReturnCamera};
const KEY='suqpage:mobile-map-return:v1',LIFETIME=2*60*60_000;
let snapshot:string|null=null;
const positive=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>0;

/** Public navigation references only. Fresh result rows remain the authority. */
export function parseMapReturnSession(raw:string|null,origin:string,scope:string,now=Date.now()):MapReturnContext|null{
 try{
  if(!raw||raw.length>16384||!origin||scope.length>8192)return null;
  const value:unknown=JSON.parse(raw);if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const row=value as Record<string,unknown>;
  if(row.version!==1||row.origin!==origin||row.scope!==scope||typeof row.savedAt!=='number'||!Number.isSafeInteger(row.savedAt)||row.savedAt>now+1000||row.savedAt<now-LIFETIME||!Array.isArray(row.ids)||row.ids.length>200||!row.ids.every(positive)||typeof row.page!=='number'||!Number.isSafeInteger(row.page)||row.page<0||row.page>199)return null;
  const camera=row.camera as Record<string,unknown>|null;
  if(!camera||!Array.isArray(camera.center)||camera.center.length!==2||!camera.center.every(value=>typeof value==='number'&&Number.isFinite(value))||Math.abs(camera.center[0])>180||Math.abs(camera.center[1])>85.051129||typeof camera.zoom!=='number'||!Number.isFinite(camera.zoom)||camera.zoom<1||camera.zoom>MAP_MAX_ZOOM)return null;
  const unique=[...new Set(row.ids as number[])],ids=unique.length<=MAP_GROUP_MAX_MEMBERS?unique:[];
  return {ids,page:0,anchor:positive(row.anchor)&&ids.includes(row.anchor)?row.anchor:null,camera:{center:[camera.center[0],camera.center[1]],zoom:camera.zoom}};
 }catch{return null;}
}
export function readMapReturnSession(origin:string,scope:string):MapReturnContext|null{
 const remembered=parseMapReturnSession(snapshot,origin,scope);if(remembered)return remembered;
 if(Platform.OS==='web')try{const stored=window.sessionStorage.getItem(KEY),restored=parseMapReturnSession(stored,origin,scope);if(restored){snapshot=stored;return restored;}}catch{/* Storage denial does not block ordinary public navigation. */}
 return null;
}
export function rememberMapReturnSession(origin:string,scope:string,value:MapReturnContext):void{
 const raw=JSON.stringify({version:1,origin,scope,savedAt:Date.now(),ids:value.ids,page:value.page,anchor:value.anchor,camera:{center:value.camera.center,zoom:value.camera.zoom}});
 if(!parseMapReturnSession(raw,origin,scope))return;
 snapshot=raw;if(Platform.OS==='web')try{window.sessionStorage.setItem(KEY,raw);}catch{/* The current app session still keeps the bounded references. */}
}
