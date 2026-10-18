import type {Map as LeafletMap} from 'leaflet';

type ResizeMap=Pick<LeafletMap,'getContainer'|'getCenter'|'getZoom'|'project'|'invalidateSize'|'panBy'>;
type CameraMap=Pick<LeafletMap,'getCenter'|'getZoom'>;
export type LeafletCameraView={center:{lat:number;lng:number};zoom:number};
type ResizeIntent=LeafletCameraView&{observed:{lat:number;lng:number}};
const resizeIntents=new WeakMap<CameraMap,ResizeIntent>();

/** Save geographical intent, not each resize's half-pixel SDK quantization. */
export function leafletViewForPersistence(map:CameraMap):LeafletCameraView{
 const center=map.getCenter(),zoom=map.getZoom(),intent=resizeIntents.get(map);
 if(intent&&intent.zoom===zoom&&intent.observed.lat===center.lat&&intent.observed.lng===center.lng){
  return{center:{...intent.center},zoom};
 }
 // A genuine camera move replaces the resize intent; no tolerance can hide it.
 resizeIntents.delete(map);
 return{center:{lat:center.lat,lng:center.lng},zoom};
}

/** Leaflet rounds both resize half-sizes; compensate through its public API. */
export function resizeLeafletPreservingCenter(map:ResizeMap):boolean{
 const container=map.getContainer();
 // Retained routes can be laid out at zero size. Invalidating then corrupts
 // Leaflet's cached pixel origin before the visible route is restored.
 if(container.clientWidth<=0||container.clientHeight<=0)return false;
 const{center,zoom}=leafletViewForPersistence(map);
 map.invalidateSize({animate:false});
 const correction=map.project(center,zoom).subtract(map.project(map.getCenter(),zoom)).round();
 if(correction.x||correction.y)map.panBy(correction,{animate:false});
 const observed=map.getCenter();
 resizeIntents.set(map,{center,zoom,observed:{lat:observed.lat,lng:observed.lng}});
 return true;
}
