import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import type {Map as LeafletMap,LatLng,Point} from 'leaflet';
import {resizeLeafletPreservingCenter,leafletViewForPersistence} from '../apps/mobile/src/leaflet-resize';
import {resizeLeafletPreservingCenter as sharedResize,leafletViewForPersistence as sharedView} from '../lib/map/leaflet-resize';

// Installed Leaflet methods/CRS/point arithmetic are real. Only DOM element
// position storage and size measurement are ports; no browser or map API claim.
const require=createRequire(import.meta.url),L={}as typeof import('leaflet');
const document={documentElement:{style:{}},createElement:()=>({style:{},getContext:()=>null}),addEventListener(){},removeEventListener(){}};
const window={document,screen:{deviceXDPI:1,logicalXDPI:1},devicePixelRatio:1,addEventListener(){},removeEventListener(){},setTimeout,clearTimeout};
vm.runInNewContext(fs.readFileSync(require.resolve('leaflet/dist/leaflet-src.js'),'utf8'),{exports:L,module:{exports:L},window,document,navigator:{userAgent:'',platform:'',maxTouchPoints:0},setTimeout,clearTimeout});
type InternalMap=LeafletMap&{_loaded:boolean;_zoom:number;_lastCenter:LatLng;_pixelOrigin:Point;_sizeChanged:boolean;_panAnim:object;_getMapPanePos:()=>Point;_rawPanBy:(offset:Point)=>void;_getNewPixelOrigin:(center:LatLng,zoom:number)=>Point;resizeTo:(size:Point)=>void;cameraTo:(center:Point,zoom:number)=>void};
function mapAt(center:Point,oldSize:Point,newSize:Point,zoom=6){
 let size=oldSize,requested=newSize,pane=L.point(0,0);const map=Object.create(L.Map.prototype)as InternalMap;
 Object.assign(map,{options:{crs:L.CRS.EPSG3857},_loaded:true,_zoom:zoom,_lastCenter:L.CRS.EPSG3857.pointToLatLng(center,zoom),_panAnim:{},getContainer(){return{clientWidth:requested.x,clientHeight:requested.y};},getSize(){if(map._sizeChanged){size=requested;map._sizeChanged=false;}return size.clone();},getPixelOrigin(){return map._pixelOrigin;},_getMapPanePos(){return pane;},_rawPanBy(offset:Point){pane=pane.subtract(offset);},fire(){return map;},resizeTo(next:Point){requested=next;},cameraTo(next:Point,nextZoom:number){pane=L.point(0,0);map._zoom=nextZoom;map._lastCenter=L.CRS.EPSG3857.pointToLatLng(next,nextZoom);map._pixelOrigin=map._getNewPixelOrigin(map._lastCenter,nextZoom);}});
 map._pixelOrigin=map._getNewPixelOrigin(map._lastCenter,zoom);return map;
}
test('FE-053 installed Leaflet resize parity stays within half a pixel using public correction',()=>{
 assert.equal(resizeLeafletPreservingCenter,sharedResize,'The native compatibility path forwards the unchanged shared correction');
 assert.equal(leafletViewForPersistence,sharedView,'Both adapters share geographical persistence semantics');
 assert.equal(L.version,'1.9.4');let cases=0,rawMaximum=0;
 for(const axis of ['x','y']as const)for(const old of [0,373,374,375])for(const next of [373,374,375])for(const fraction of [0,.25,.5,.75]){
  const center=L.point(9998+fraction,7800+fraction),oldSize=axis==='x'?L.point(old,400):L.point(400,old),newSize=axis==='x'?L.point(next,400):L.point(400,next);
  const raw=mapAt(center,oldSize,newSize);raw.invalidateSize();const rawPoint=raw.project(raw.getCenter(),6);rawMaximum=Math.max(rawMaximum,Math.abs(rawPoint.x-center.x),Math.abs(rawPoint.y-center.y));
  const corrected=mapAt(center,oldSize,newSize);resizeLeafletPreservingCenter(corrected);const result=corrected.project(corrected.getCenter(),6);assert.ok(Math.abs(result.x-center.x)<=.500000001);assert.ok(Math.abs(result.y-center.y)<=.500000001);assert.equal(corrected.getZoom(),6);cases++;
 }
 assert.equal(cases,96);assert.ok(rawMaximum>.999999,'The actual uncorrected SDK must reproduce the one-pixel failure');
});

const fractionalTarget=()=>L.point(41363957.584632345,31755378.063858584);
function assertHalfPixel(actual:Point,expected:Point,message:string){
 assert.ok(Math.abs(actual.x-expected.x)<=.5&&Math.abs(actual.y-expected.y)<=.5,message+JSON.stringify({dx:actual.x-expected.x,dy:actual.y-expected.y}));
}
test('FE-065 S136 fractional odd/even resizes retain original intent and independent SDK precision',()=>{
 const original=fractionalTarget(),map=mapAt(original,L.point(372,300),L.point(373,301),18);
 const intended=leafletViewForPersistence(map);
 // Reproduce the former per-event strategy with the installed SDK first.
 const legacy=mapAt(original,L.point(372,300),L.point(373,301),18);
 for(const size of[L.point(373,301),L.point(373,302)]){
  legacy.resizeTo(size);const center=legacy.getCenter();legacy.invalidateSize({animate:false});
  const correction=legacy.project(center,18).subtract(legacy.project(legacy.getCenter(),18)).round();if(correction.x||correction.y)legacy.panBy(correction,{animate:false});
 }
 assert.ok(Math.abs(legacy.project(legacy.getCenter(),18).y-original.y)>.9,'The installed fractional sequence must reproduce the original regression');
 for(let cycle=0;cycle<20;cycle++)for(const size of[L.point(373,301),L.point(373,302),L.point(372,300)]){
  map.resizeTo(size);assert.equal(resizeLeafletPreservingCenter(map),true);
  assertHalfPixel(map.project(map.getCenter(),18),original,'Raw SDK center stays within the unchanged half-pixel bound ');
  assert.deepEqual(leafletViewForPersistence(map),intended,'Size-only observations never replace exact geographical intent');
 }
 const exposed=leafletViewForPersistence(map);exposed.center.lat=0;
 assert.deepEqual(leafletViewForPersistence(map),intended,'Callers cannot mutate the map-owned intent through the returned view');
});
test('FE-065 S136 twenty fractional remounts persist intent instead of compounded quantization',()=>{
 const original=fractionalTarget();let saved=original.clone();
 for(let cycle=0;cycle<20;cycle++){
  const map=mapAt(saved,L.point(372,300),L.point(373,301),18);
  for(const size of[L.point(373,301),L.point(373,302),L.point(372+(cycle%2),300+(cycle%2))]){
   map.resizeTo(size);resizeLeafletPreservingCenter(map);
   assertHalfPixel(map.project(map.getCenter(),18),original,'The actual remounted SDK remains within half a pixel ');
  }
  const view=leafletViewForPersistence(map);saved=map.project(view.center,view.zoom);
  assert.ok(Math.abs(saved.x-original.x)<1e-7&&Math.abs(saved.y-original.y)<1e-7,'Persisted geographical target remains unchanged across remounts');
 }
});
test('FE-065 S136 genuine pan/zoom replaces intent while hidden layouts mutate neither SDK nor intent',()=>{
 const map=mapAt(fractionalTarget(),L.point(372,300),L.point(373,301),18);resizeLeafletPreservingCenter(map);
 map.panBy([17,-9],{animate:false});const panned=map.getCenter();
 assert.deepEqual(leafletViewForPersistence(map).center,{lat:panned.lat,lng:panned.lng},'A real pan publishes its actual new camera');
 const panTarget=map.project(panned,18);map.resizeTo(L.point(373,302));resizeLeafletPreservingCenter(map);
 assertHalfPixel(map.project(map.getCenter(),18),panTarget,'A later resize preserves the new pan ');
 const zoomTarget=L.point(20681981.584632345,15877690.063858584);map.cameraTo(zoomTarget,17);
 const zoomed=leafletViewForPersistence(map);assert.equal(zoomed.zoom,17);
 map.resizeTo(L.point(374,303));resizeLeafletPreservingCenter(map);
 assertHalfPixel(map.project(map.getCenter(),17),zoomTarget,'Changed zoom must not snap back to the old camera ');
 const prior=leafletViewForPersistence(map),actual=map.getCenter();map.resizeTo(L.point(0,0));
 assert.equal(resizeLeafletPreservingCenter(map),false);assert.deepEqual(map.getCenter(),actual);assert.deepEqual(leafletViewForPersistence(map),prior);
 map.resizeTo(L.point(375,304));resizeLeafletPreservingCenter(map);
 assertHalfPixel(map.project(map.getCenter(),17),zoomTarget,'Visible recovery retains the same zoom intent ');
});
test('FE-065 S136 returning to an earlier observed coordinate never resurrects a discarded intent',()=>{
 const map=mapAt(fractionalTarget(),L.point(372,300),L.point(373,301),18);resizeLeafletPreservingCenter(map);
 const oldObserved=map.getCenter(),originalIntent=leafletViewForPersistence(map);
 assert.notDeepEqual(originalIntent.center,{lat:oldObserved.lat,lng:oldObserved.lng});
 map.panBy([17,-9],{animate:false});leafletViewForPersistence(map);
 map.panBy([-17,9],{animate:false});
 assert.deepEqual(map.getCenter(),oldObserved,'The installed public pan sequence really returns to the previous observed camera');
 assert.deepEqual(leafletViewForPersistence(map).center,{lat:oldObserved.lat,lng:oldObserved.lng},'A real intervening move permanently discards the old fractional resize intent');
});
test('FE-053 twenty repeated remount/resize cycles do not accumulate cached camera drift',()=>{
 let raw=L.point(9998,7800),corrected=raw.clone();const original=raw.clone();
 for(let i=0;i<20;i++){
  const oldSize=L.point(373,373),newSize=L.point(374,374),a=mapAt(raw,oldSize,newSize),b=mapAt(corrected,oldSize,newSize);a.invalidateSize();resizeLeafletPreservingCenter(b);raw=a.project(a.getCenter(),6);corrected=b.project(b.getCenter(),6);
 }
 assert.ok(raw.x-original.x>19.999,'Uncorrected persisted centers demonstrate cumulative drift');assert.ok(Math.abs(corrected.x-original.x)<1e-8);assert.ok(Math.abs(corrected.y-original.y)<1e-8);
});
test('FE-053 hidden zero-size containers do not enter Leaflet resize or mutate its camera',()=>{
 for(const size of [L.point(0,0),L.point(0,400),L.point(400,0)]){
  const center=L.point(9998,7800),map=mapAt(center,L.point(373,373),size);let invalidates=0;
  map.invalidateSize=function(){invalidates++;return this;};
  const resized=resizeLeafletPreservingCenter(map);
  assert.equal(invalidates,0,'A hidden retained map must not enter SDK invalidation');
  assert.equal(resized,false);
  const result=map.project(map.getCenter(),6);assert.ok(Math.abs(result.x-center.x)<1e-8);assert.ok(Math.abs(result.y-center.y)<1e-8);
 }
});
