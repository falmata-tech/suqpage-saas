import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Coords,DoneCallback,TileLayer} from 'leaflet';
import {createMapTileLoader,type MapTileClock,type MapTileSend,type MapTileDone,type MapTileFailure} from '../lib/map/map-tile-loader';

const coordinates={x:3,y:5,z:4},url='https://tile.openstreetmap.org/4/3/5.png';
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
async function settle(){for(let index=0;index<3;index++)await new Promise<void>(resolve=>setImmediate(resolve));}
// Only the image/fetch/timer host ports are controlled. No DOM, public provider,
// application API, network server, browser automation or real tile is involved.
class TestImage{
 alt='not-set';referrerPolicy='not-set';src='';
 onload:((event?:Event)=>unknown)|null=null;
 onerror:((event?:Event)=>unknown)|null=null;
 removeAttribute(name:string){assert.equal(name,'src');this.src='';}
}
function fixture(send:MapTileSend){
 const images:TestImage[]=[],created:Blob[]=[],revoked:string[]=[],calls:Array<{url:string;options:RequestInit}>=[],done:Array<{error:Error|undefined;image:HTMLImageElement}>=[],failureReasons:MapTileFailure[]=[];
 let failures=0,now=0,serial=0;
 const timers=new Map<number,{due:number;work:()=>void}>();
 const clock:MapTileClock={after:(work,delay)=>{const id=++serial;timers.set(id,{due:now+delay,work});return id;},cancel:id=>{timers.delete(id as number);}};
 const ports={getTileUrl:(_coords:typeof coordinates)=>url,send:((target,options)=>{calls.push({url:target,options});return send(target,options);}) as MapTileSend,createImage:()=>{const image=new TestImage();images.push(image);return image as unknown as HTMLImageElement;},createObjectURL:(blob:Blob)=>{created.push(blob);return'blob:fixture-'+created.length;},revokeObjectURL:(value:string)=>{revoked.push(value);},clock,onFailure:(failure:MapTileFailure)=>{failures++;failureReasons.push(failure);}};
 const loader=createMapTileLoader(ports),complete:MapTileDone=(error,image)=>done.push({error,image});
 return{loader,ports,images,created,revoked,calls,done,timers,complete,failureReasons,failures:()=>failures,tick:(ms:number)=>{now+=ms;for(const[id,timer]of[...timers])if(timer.due<=now){timers.delete(id);timer.work();}}};
}

test('FE-021403 PNG is rejected by status before any blob/image display; failure latches without further requests',async()=>{
 let blobs=0;
 const h=fixture(async()=>Object.assign(new Response(new Uint8Array([137,80,78,71]),{status:403,headers:{'content-type':'image/png'}}),{blob:async()=>{blobs++;return new Blob();}}));
 const first=h.loader.createTile(coordinates,h.complete);assert.equal(h.calls.length,0,'createTile returns before work/completion');assert.equal(h.failures(),0);await settle();
 assert.equal(h.calls.length,1);assert.equal(blobs,0);assert.equal(h.images[0].src,'');assert.equal(h.created.length,0);assert.equal(h.done.length,1);assert.ok(h.done[0].error);assert.equal(h.done[0].image,first);assert.equal(h.failures(),1);assert.equal(h.timers.size,0);
 assert.deepEqual(h.failureReasons,[{kind:'http',status:403}],'Diagnostics disclose only the status/category, never provider URL/body');
 h.loader.createTile(coordinates,h.complete);await settle();assert.equal(h.calls.length,1,'A failed loader cannot restart because the viewport changes');assert.equal(h.failures(),1);assert.equal(h.done.length,2);h.loader.dispose();
});

test('FE-021 successful visible tile uses the exact URL/default cache/origin referrer and completes only after decode',async()=>{
 const h=fixture(async()=>new Response(new Uint8Array([137,80,78,71]),{headers:{'content-type':'image/png'}}));
 const tile=h.loader.createTile(coordinates,h.complete);await settle();assert.equal(h.calls.length,1);assert.equal(h.calls[0].url,url);const options=h.calls[0].options;
 assert.equal(options.method,'GET');assert.equal(options.mode,'cors');assert.equal(options.cache,'default');assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'strict-origin-when-cross-origin');assert.equal(options.redirect,'error');assert.equal(options.headers,undefined,'No default no-cache, generic UA override or extra identification headers');
 assert.equal(h.images[0].alt,'');assert.equal(h.images[0].referrerPolicy,'strict-origin-when-cross-origin');assert.equal(h.images[0].src,'blob:fixture-1');assert.equal(h.done.length,0);assert.equal(h.revoked.length,0);
 h.images[0].onload?.();assert.equal(h.done.length,1);assert.equal(h.done[0].error,undefined);assert.equal(h.done[0].image,tile);assert.equal(h.images[0].src,'blob:fixture-1','Successful decoded pixels remain in the tile');assert.deepEqual(h.revoked,['blob:fixture-1']);assert.equal(h.timers.size,0);assert.equal(options.signal?.aborted,false);
 h.loader.unload(tile);h.loader.dispose();h.loader.dispose();assert.deepEqual(h.revoked,['blob:fixture-1'],'Object URLs are revoked exactly once');assert.equal(h.failures(),0);
});

test('FE-021 decode and CORS failures never display alternate/probe tiles and abort other pending visible work',async()=>{
 const pending=deferred<Response>();let request=0;
 const h=fixture(async()=>++request===1?new Response('not an image',{headers:{'content-type':'image/png'}}):pending.promise);
 h.loader.createTile(coordinates,h.complete);h.loader.createTile(coordinates,h.complete);await settle();const oldError=h.images[0].onerror;assert.ok(oldError);oldError();
 assert.equal(h.failures(),1);assert.equal(h.done.length,1);assert.equal(h.images[0].src,'');assert.deepEqual(h.revoked,['blob:fixture-1']);assert.ok(h.calls.every(call=>call.options.signal?.aborted));assert.equal(h.timers.size,0);
 assert.deepEqual(h.failureReasons,[{kind:'decode'}]);
 pending.resolve(new Response('late image'));await settle();oldError();assert.equal(h.created.length,1);assert.equal(h.failures(),1);assert.equal(h.done.length,1);h.loader.dispose();
 const cors=fixture(async()=>{throw new TypeError('CORS request failed');});cors.loader.createTile(coordinates,cors.complete);await settle();assert.equal(cors.failures(),1);assert.equal(cors.done.length,1);assert.equal(cors.created.length,0);assert.deepEqual(cors.failureReasons,[{kind:'network'}]);cors.loader.dispose();
 const opaque=fixture(async()=>Object.defineProperty(new Response('opaque body'), 'type',{value:'opaque'}));opaque.loader.createTile(coordinates,opaque.complete);await settle();assert.equal(opaque.failures(),1);assert.equal(opaque.created.length,0,'An unreadable opaque response never becomes an image bypass');assert.deepEqual(opaque.failureReasons,[{kind:'network'}]);opaque.loader.dispose();
});

test('FE-021 tile unload cancels only that tile, and a late response cannot create an object URL or callback',async()=>{
 const pending=deferred<Response>();let request=0;
 const h=fixture(async()=>++request===1?pending.promise:new Response('next image'));
 const first=h.loader.createTile(coordinates,h.complete);await settle();h.loader.unload(first);assert.equal(h.calls[0].options.signal?.aborted,true);assert.equal(h.timers.size,0);
 const second=h.loader.createTile(coordinates,h.complete);await settle();h.images[1].onload?.();pending.resolve(new Response('cancelled late body'));await settle();
 assert.equal(h.failures(),0);assert.equal(h.done.length,1);assert.equal(h.done[0].image,second);assert.equal(h.created.length,1);assert.deepEqual(h.revoked,['blob:fixture-1']);h.loader.dispose();
 const before=fixture(async()=>{throw Error('A tile unloaded synchronously must not request anything');});const tile=before.loader.createTile(coordinates,before.complete);before.loader.unload(tile);await settle();assert.equal(before.calls.length,0);assert.equal(before.failures(),0);assert.equal(before.done.length,0);before.loader.dispose();
});

test('FE-021 dispose before fetch/blob/decode completion prevents callbacks/failure reentry and releases URLs',async t=>{
 for(const stage of['before-fetch','fetch','blob','decode']as const)await t.test(stage,async()=>{
  const response=deferred<Response>(),body=deferred<Blob>();
  const h=fixture(async()=>stage==='fetch'?response.promise:stage==='blob'?Object.assign(new Response('body'),{blob:()=>body.promise}):new Response('body'));
  const tile=h.loader.createTile(coordinates,h.complete);if(stage!=='before-fetch')await settle();
  const oldLoad=h.images[0].onload,oldError=h.images[0].onerror;
  h.loader.dispose();h.loader.dispose();response.resolve(new Response('late'));body.resolve(new Blob(['late']));await settle();oldLoad?.();oldError?.();h.loader.unload(tile);
  assert.equal(h.done.length,0);assert.equal(h.failures(),0);assert.equal(h.timers.size,0);assert.equal(h.images[0].src,'');assert.equal(h.created.length,stage==='decode'?1:0);assert.deepEqual(h.revoked,stage==='decode'?['blob:fixture-1']:[]);
  const calls=h.calls.length;h.loader.createTile(coordinates,h.complete);await settle();assert.equal(h.calls.length,calls);assert.equal(h.done.length,0);
 });
});

test('FE-02110second bound includes a stalled fetch, response body and image decode',async t=>{
 for(const stage of['fetch','body','decode']as const)await t.test(stage,async()=>{
  const response=deferred<Response>(),body=deferred<Blob>();
  const h=fixture(async()=>stage==='fetch'?response.promise:stage==='body'?Object.assign(new Response('body'),{blob:()=>body.promise}):new Response('body'));
  h.loader.createTile(coordinates,h.complete);await settle();h.tick(9999);assert.equal(h.failures(),0);h.tick(1);assert.equal(h.failures(),1);assert.equal(h.done.length,1);assert.ok(h.done[0].error);assert.equal(h.calls[0].options.signal?.aborted,true);assert.equal(h.timers.size,0);
  assert.deepEqual(h.failureReasons,[{kind:'timeout'}]);
  response.resolve(new Response('late'));body.resolve(new Blob(['late']));await settle();h.images[0].onload?.();h.images[0].onerror?.();assert.equal(h.done.length,1);assert.equal(h.failures(),1);assert.equal(h.created.length,stage==='decode'?1:0);h.loader.dispose();
 });
});

test('FE-021 first failure callback is asynchronous and may synchronously dispose the owned raster',async()=>{
 const h=fixture(async()=>new Response('denied',{status:403}));let returned:HTMLImageElement|undefined,notifications=0;
 const loader=createMapTileLoader({...h.ports,onFailure(){notifications++;assert.ok(returned);loader.dispose();}});
 returned=loader.createTile(coordinates,h.complete);assert.equal(notifications,0);await settle();assert.equal(notifications,1);assert.equal(h.done.length,1);assert.equal(h.timers.size,0);loader.dispose();
 const invalid=createMapTileLoader({...h.ports,getTileUrl(){throw Error('Invalid provider configuration');},onFailure(){notifications++;invalid.dispose();}});invalid.createTile(coordinates,h.complete);assert.equal(notifications,1);await settle();assert.equal(notifications,2);
});

test('FE-021 owner teardown during done prevents a later failure state update; manual retry is a fresh identical-cache request',async()=>{
 const h=fixture(async()=>new Response('denied',{status:403}));h.loader.createTile(coordinates,()=>h.loader.dispose());await settle();assert.equal(h.failures(),0,'An owner teardown before onFailure must not receive a stale state update');
 const failures=fixture(async()=>new Response('denied',{status:403}));failures.loader.createTile(coordinates,failures.complete);await settle();failures.loader.dispose();const retried=createMapTileLoader(failures.ports);retried.createTile(coordinates,failures.complete);await settle();assert.equal(failures.calls.length,2);assert.deepEqual(failures.calls.map(call=>call.url),[url,url]);assert.ok(failures.calls.every(call=>call.options.cache==='default'&&!new URL(call.url).search));retried.dispose();
});

// This compile-time bridge matches the installed Leaflet async callback and
// public getTileUrl/on/off signatures without a Leaflet runtime dependency.
function leafletContract(layer:Pick<TileLayer,'getTileUrl'|'on'|'off'>){
 const loader=createMapTileLoader<Coords>({getTileUrl:coords=>layer.getTileUrl(coords),onFailure(){}});
 const createTile:(coords:Coords,done:DoneCallback)=>HTMLElement=loader.createTile;
 const unload=(event:{tile:HTMLElement})=>loader.unload(event.tile);
 layer.on('tileunload',unload);layer.off('tileunload',unload);return createTile;
}
void leafletContract;
