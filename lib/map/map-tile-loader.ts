/** Minimal host ports matching Leaflet's asynchronous createTile convention. */
export type MapTileDone=(error:Error|undefined,tile:HTMLImageElement)=>void;
export type MapTileSend=(url:string,options:RequestInit)=>Promise<Response>;
export type MapTileClock={after:(work:()=>void,delay:number)=>unknown;cancel:(id:unknown)=>void};
export type MapTileFailure={kind:'http'|'network'|'decode'|'timeout';status?:number};
export type MapTileLoaderOptions<Coordinates>={
 getTileUrl:(coordinates:Coordinates)=>string;
 onFailure:(failure:MapTileFailure)=>void;
 send?:MapTileSend;
 createImage?:()=>HTMLImageElement;
 createObjectURL?:(blob:Blob)=>string;
 revokeObjectURL?:(url:string)=>void;
 timeoutMs?:number;
 clock?:MapTileClock;
};
type PendingTile={image:HTMLImageElement;done:MapTileDone;controller:AbortController;timer:unknown;objectURL:string|null;released:boolean};
const defaultClock:MapTileClock={after:(work,delay)=>setTimeout(work,delay),cancel:id=>clearTimeout(id as ReturnType<typeof setTimeout>)};
const tileError=()=>new Error('Map background is unavailable.');

/**
 * One ordinary browser-cache request per visible tile. The provider registry owns
 * URL selection; this adapter never probes, rewrites or retries a provider URL.
 * A failed loader remains stopped. An explicit UI retry creates a new loader.
 */
export function createMapTileLoader<Coordinates>(options:MapTileLoaderOptions<Coordinates>){
 const send=options.send||((url,init)=>fetch(url,init));
 const image=options.createImage||(()=>document.createElement('img'));
 const createURL=options.createObjectURL||((blob:Blob)=>URL.createObjectURL(blob));
 const revokeURL=options.revokeObjectURL||((url:string)=>URL.revokeObjectURL(url));
 const clock=options.clock||defaultClock;
 const timeout=options.timeoutMs??10_000;
 if(!Number.isFinite(timeout)||timeout<=0)throw new Error('A positive tile timeout is required.');
 const pending=new Map<HTMLImageElement,PendingTile>();
 let disposed=false,failed=false;
 const current=(entry:PendingTile)=>!disposed&&!entry.released&&pending.get(entry.image)===entry;
 const revoke=(entry:PendingTile)=>{if(entry.objectURL!==null){const url=entry.objectURL;entry.objectURL=null;revokeURL(url);}};
 function release(entry:PendingTile,clearImage=true,abort=true){
  if(entry.released)return;
  entry.released=true;pending.delete(entry.image);clock.cancel(entry.timer);
  entry.image.onload=null;entry.image.onerror=null;
  if(abort)entry.controller.abort();revoke(entry);
  if(clearImage)entry.image.removeAttribute('src');
 }
 function fail(entry:PendingTile,failure:MapTileFailure){
  if(!current(entry)||failed)return;
  failed=true;
  for(const item of [...pending.values()])release(item);
  // done() can synchronously unload the layer. A subsequent owner teardown must
  // prevent a state update through onFailure, just like late network completion.
  if(!disposed){entry.done(tileError(),entry.image);if(!disposed)options.onFailure(failure);}
 }
 function createTile(coordinates:Coordinates,done:MapTileDone):HTMLImageElement{
  const tile=image();tile.alt='';tile.referrerPolicy='strict-origin-when-cross-origin';
  if(disposed)return tile;
  const entry:PendingTile={image:tile,done,controller:new AbortController(),timer:undefined,objectURL:null,released:false};
  pending.set(tile,entry);
  // The tile must be returned/registered by Leaflet before any completion or
  // synchronous getTileUrl/fetch error can call done() or the owner's callback.
  void Promise.resolve().then(async()=>{
   if(!current(entry))return;
   if(failed){release(entry);if(!disposed)done(tileError(),tile);return;}
   entry.timer=clock.after(()=>fail(entry,{kind:'timeout'}),timeout);
   let failure:MapTileFailure={kind:'network'};
   try{
    const url=options.getTileUrl(coordinates);
    const response=await send(url,{method:'GET',mode:'cors',credentials:'omit',cache:'default',referrerPolicy:'strict-origin-when-cross-origin',redirect:'error',signal:entry.controller.signal});
    if(!current(entry))return;
    // A denied PNG is still an image. Never assign it to src or rely on img's
    // error event to tell a policy block from a legitimate map tile.
    if(response.type==='opaque'||response.type==='opaqueredirect')throw tileError();
    if(!response.ok){failure={kind:'http',status:response.status};throw tileError();}
    const blob=await response.blob();
    if(!current(entry))return;
    entry.objectURL=createURL(blob);
    tile.onload=()=>{
     if(!current(entry))return;
     release(entry,false,false); // Decoded pixels remain displayable after revocation.
     if(!disposed)done(undefined,tile);
    };
    tile.onerror=()=>fail(entry,{kind:'decode'});
    tile.src=entry.objectURL;
   }catch{if(current(entry))fail(entry,failure);}
  });
  return tile;
 }
 return{
  createTile,
  unload(tile:HTMLElement){const entry=pending.get(tile as HTMLImageElement);if(entry)release(entry);},
  dispose(){if(disposed)return;disposed=true;for(const entry of [...pending.values()])release(entry);},
 };
}
