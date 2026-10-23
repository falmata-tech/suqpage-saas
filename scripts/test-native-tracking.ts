import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createTrackingClient,createTrackingStore,createTrackingDetailLive,TrackingFailure,type TrackingDetailState,type TrackingShipmentDetail} from '../apps/mobile/src/tracking-client';
const token='a'.repeat(64),reference='SHP-'+'A'.repeat(20),other='SHP-'+'B'.repeat(20);
const shipment=(version=1,ref=reference):TrackingShipmentDetail=>({reference:ref,label:'Literal shipment',version,legs:[{id:'00000000-0000-4000-8000-000000000001',providerName:'Literal provider',origin:'Literal A',destination:'Literal B',method:'truck',trackingUrl:'',trackingCode:''}]});
const session=()=>({token,expiresAt:Date.now()+60_000});
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
const settle=async()=>{for(let i=0;i<3;i++)await new Promise<void>(resolve=>setImmediate(resolve));};
const storageKey=(origin:string)=>'suqpage-tracking-session.'+Buffer.from(new URL(origin).origin,'ascii').toString('hex');
// Expo SecureStore validates this alphabet on get, set and delete, including an empty restore.
function validStorageKey(key:string){assert.match(key,/^[\w.-]+$/,'SecureStore rejects this storage key');}
test('FE-069 native tracking storage is origin-scoped and never accesses account/chat keys',async()=>{
 const values=new Map<string,string>([['suqpage-owner-session','OWNER_UNCHANGED'],['suqpage-transport','CHAT_UNCHANGED']]),calls:string[]=[];
 const storage={async getItem(key:string){validStorageKey(key);calls.push(key);return values.get(key)||null;},async setItem(key:string,value:string){validStorageKey(key);calls.push(key);values.set(key,value);},async removeItem(key:string){validStorageKey(key);calls.push(key);values.delete(key);}};
 const a=createTrackingStore(storage,'https://one.example'),b=createTrackingStore(storage,'https://two.example');
 assert.equal(await a.read(),null);await a.save(session());assert.equal((await a.read())?.token,token);assert.equal(await b.read(),null);await b.save({...session(),token:'b'.repeat(64)});await a.clear();assert.equal(await a.read(),null);assert.equal((await b.read())?.token,'b'.repeat(64));
 assert.ok(calls.every(key=>/^suqpage-tracking-session\.[a-f0-9]+$/.test(key)));assert.ok(!calls.includes('suqpage-owner-session')&&!calls.includes('suqpage-transport'));
 for(const raw of ['broken','null','[]',JSON.stringify({token:'owner-jwt',expiresAt:Date.now()+60000}),JSON.stringify({token,expiresAt:1}),JSON.stringify({token,expiresAt:'tomorrow'})]){values.set(storageKey('https://one.example'),raw);assert.equal(await a.read(),null);assert.equal(values.has(storageKey('https://one.example')),false);}
 const count=calls.length;await assert.rejects(()=>a.save({token:'owner-jwt',expiresAt:Date.now()+60000}));await assert.rejects(()=>a.save({token,expiresAt:1}));assert.equal(calls.length,count);
 assert.equal(values.get('suqpage-owner-session'),'OWNER_UNCHANGED');assert.equal(values.get('suqpage-transport'),'CHAT_UNCHANGED');
 const failed=async(key:string)=>{validStorageKey(key);throw Error('storage');};
 const broken=createTrackingStore({getItem:failed,setItem:failed,removeItem:failed},'https://one.example');await assert.rejects(()=>broken.read(),/storage/);await assert.rejects(()=>broken.save(session()),/storage/);await assert.rejects(()=>broken.clear(),/storage/);
});
test('BE-058 SecureStore keys encode the entire canonical origin without punctuation collisions',async()=>{
 const origins=['https://api.example','http://api.example','https://api.example:8443','https://api-example','https://a-b.example','https://a_b.example','http://[::1]:3102','http://[::1]:3103','http://[::2]:3102'];
 const values=new Map<string,string>(),seen=new Set<string>();
 const storage={async getItem(key:string){validStorageKey(key);seen.add(key);return values.get(key)||null;},async setItem(key:string,value:string){validStorageKey(key);seen.add(key);values.set(key,value);},async removeItem(key:string){validStorageKey(key);seen.add(key);values.delete(key);}};
 for(const origin of origins){const store=createTrackingStore(storage,origin);assert.equal(await store.read(),null);await store.save(session());assert.equal((await store.read())?.token,token);assert.ok(values.has(storageKey(origin)));}
 assert.equal(seen.size,origins.length);
 for(const key of seen)assert.ok(origins.some(origin=>Buffer.from(key.slice('suqpage-tracking-session.'.length),'hex').toString('ascii')===new URL(origin).origin));
 for(const [original,equivalent] of [['https://api.example','HTTPS://API.EXAMPLE:443/path?ignored=1'],['http://[::1]:3102','http://[0:0:0:0:0:0:0:1]:3102/other']]){assert.equal((await createTrackingStore(storage,equivalent).read())?.token,token);await createTrackingStore(storage,equivalent).clear();assert.equal(await createTrackingStore(storage,original).read(),null);}
 assert.equal((await createTrackingStore(storage,'http://[::1]:3103').read())?.token,token);
});
test('BE-058 native HTTP uses only tracking bearer, no cookies/query secrets/owner or visitor headers',async()=>{
 const calls:Array<{url:string;init:RequestInit}>=[];
 const client=createTrackingClient('https://api.example',async(input,init={})=>{calls.push({url:String(input),init});return new Response(JSON.stringify({expiresAt:123}),{headers:{etag:'"one"'}});});
 await client('request-code',{token,body:{email:'person@example.test',locale:'en'}});assert.equal(new Headers(calls[0].init.headers).get('Authorization'),null);
 await client('session',{token});await client('shipments/'+reference,{token,etag:'"one"'});
 for(const call of calls){assert.equal(call.init.credentials,'omit');assert.equal(call.init.cache,'no-store');assert.equal(call.init.referrerPolicy,'no-referrer');assert.equal(call.init.redirect,'error');assert.ok(!call.url.includes(token));assert.equal(new Headers(call.init.headers).get('X-Suqpage-Buying-Session'),null);}
 assert.equal(new Headers(calls[1].init.headers).get('Authorization'),'Bearer '+token);assert.equal(new Headers(calls[2].init.headers).get('If-None-Match'),'"one"');
 const count=calls.length;await assert.rejects(()=>client('session',{token:'owner-jwt'}),error=>error instanceof TrackingFailure&&error.status===401);await assert.rejects(()=>client('shipments?token='+token,{token}));await assert.rejects(()=>client('../owner/home',{token}));assert.equal(calls.length,count);
});
test('BE-058 native tracking writes serialize so delayed save cannot resurrect a logged-out credential',async()=>{
 let stored:string|null=null;const gate=deferred<void>(),calls:string[]=[];
 const store=createTrackingStore({getItem:async key=>{validStorageKey(key);return stored;},setItem:async(key,value)=>{validStorageKey(key);calls.push('save');await gate.promise;stored=value;},removeItem:async key=>{validStorageKey(key);calls.push('clear');stored=null;}},'https://api.example');
 const saving=store.save(session());await settle();const clearing=store.clear(),reading=store.read();assert.deepEqual(calls,['save']);gate.resolve();await Promise.all([saving,clearing]);assert.deepEqual(calls,['save','clear']);assert.equal(await reading,null);assert.equal(await store.read(),null);
});
test('BE-058 a delayed credential read cannot resurrect tracking after logout',async()=>{
 const first=deferred<string|null>();let stored:string|null=JSON.stringify(session()),reads=0;
 const store=createTrackingStore({getItem:async key=>{validStorageKey(key);return ++reads===1?first.promise:stored;},setItem:async(key,value)=>{validStorageKey(key);stored=value;},removeItem:async key=>{validStorageKey(key);stored=null;}},'https://api.example');
 const reading=store.read();await settle();await store.clear();first.resolve(JSON.stringify(session()));assert.equal(await reading,null);assert.equal(reads,2);assert.equal(stored,null);
});
test('FE-069 native HTTP preserves304/401 and bounds stalled bodies with caller cancellation',async()=>{
 const noBody=createTrackingClient('https://api.example',async()=>new Response(null,{status:304,headers:{etag:'"same"'}}));assert.deepEqual(await noBody('shipments/'+reference,{token}),{value:null,etag:'"same"',notModified:true});
 const denied=createTrackingClient('https://api.example',async()=>new Response(JSON.stringify({error:'Verify your email to continue.'}),{status:401}));await assert.rejects(()=>denied('session',{token}),error=>error instanceof TrackingFailure&&error.status===401);
 const caller=new AbortController();let seen:AbortSignal|undefined;
 const stalled=createTrackingClient('https://api.example',async(_input,init)=>{seen=init?.signal||undefined;return new Response(new ReadableStream({start(){}}));});
 const task=stalled('session',{token,signal:caller.signal});await settle();caller.abort();await assert.rejects(()=>task,error=>error instanceof TrackingFailure&&error.status===0);assert.equal(seen?.aborted,true);
});
function harness(){
 let now=0,nextId=0;const timers=new Map<number,{at:number;run:()=>void}>(),states:TrackingDetailState[]=[],requests:Array<{token:string;reference:string;etag:string|null;signal:AbortSignal}>=[],responses:Array<Promise<{value:TrackingShipmentDetail|null;etag:string|null;notModified:boolean}>>=[];
 const clock={setTimeout:(run:()=>void,delay:number)=>{const id=++nextId;timers.set(id,{at:now+delay,run});return id as unknown as ReturnType<typeof setTimeout>;},clearTimeout:(id:ReturnType<typeof setTimeout>)=>{timers.delete(id as unknown as number);}};
 const live=createTrackingDetailLive({clock,onChange:value=>states.push(value),read:(auth,ref,etag,signal)=>{requests.push({token:auth,reference:ref,etag,signal});const response=responses.shift();assert.ok(response);return response;}});
 return{live,states,requests,responses,timers,nextDelay:()=>Math.min(...[...timers.values()].map(item=>item.at-now)),tick:(ms:number)=>{now+=ms;for(const[id,item]of [...timers])if(item.at<=now){timers.delete(id);item.run();}},last:()=>states.at(-1)!};
}
test('FE-069 detail single-flight conditional five-second updates and focus pause preserve the good body',async()=>{
 const h=harness();h.responses.push(Promise.resolve({value:shipment(),etag:'"v1"',notModified:false}));h.live.setScope(token,reference);assert.equal(h.requests.length,0);h.live.setActive(true);await settle();assert.equal(h.last().shipment?.version,1);
 const pending=deferred<{value:TrackingShipmentDetail|null;etag:string|null;notModified:boolean}>();h.responses.push(pending.promise);h.tick(5000);void h.live.refresh();assert.equal(h.requests.length,2);assert.equal(h.requests[1].etag,'"v1"');pending.resolve({value:null,etag:'"v1"',notModified:true});await settle();assert.equal(h.last().shipment?.version,1);
 h.responses.push(Promise.resolve({value:shipment(2),etag:'"v2"',notModified:false}));h.tick(5000);await settle();assert.equal(h.last().shipment?.version,2);h.live.setActive(false);assert.equal(h.timers.size,0);h.tick(60000);assert.equal(h.requests.length,3);h.live.stop();
});
test('BE-058 detail token/reference switch fences late bodies, wrong reference,401 and revoked404 clear data',async()=>{
 const h=harness(),first=deferred<{value:TrackingShipmentDetail|null;etag:string|null;notModified:boolean}>();h.responses.push(first.promise);h.live.setScope(token,reference);h.live.setActive(true);
 h.responses.push(Promise.resolve({value:shipment(1,other),etag:'"other"',notModified:false}));h.live.setScope('b'.repeat(64),other);await settle();assert.equal(h.requests[0].signal.aborted,true);first.resolve({value:shipment(99),etag:'"old"',notModified:false});await settle();assert.equal(h.last().shipment?.reference,other);
 h.responses.push(Promise.resolve({value:shipment(3),etag:'"wrong"',notModified:false}));h.tick(5000);await settle();assert.equal(h.last().shipment?.reference,other);assert.ok(h.last().error);
 h.responses.push(Promise.reject(new TrackingFailure('expired',401)));h.tick(10000);await settle();assert.equal(h.last().shipment,null);assert.equal(h.last().unauthenticated,true);assert.equal(h.timers.size,0);
 h.responses.push(Promise.resolve({value:shipment(),etag:'"v1"',notModified:false}));h.live.setScope(token,reference);await settle();h.responses.push(Promise.reject(new TrackingFailure('missing',404)));h.tick(5000);await settle();assert.equal(h.last().shipment,null);assert.equal(h.last().missing,true);assert.equal(h.timers.size,0);h.live.stop();
});
test('FE-069 detail failures back off to30s and stop aborts late pending work',async()=>{
 const h=harness();h.responses.push(Promise.resolve({value:shipment(),etag:'"v1"',notModified:false}));h.live.setScope(token,reference);h.live.setActive(true);await settle();
 for(const[delay,nextDelay]of[[5000,10000],[10000,20000],[20000,30000],[30000,30000]]){h.responses.push(Promise.reject(Error('network')));h.tick(delay);await settle();assert.equal(h.last().shipment?.version,1);assert.equal(h.timers.size,1);assert.equal(h.nextDelay(),nextDelay);}
 const pending=deferred<{value:TrackingShipmentDetail|null;etag:string|null;notModified:boolean}>();h.responses.push(pending.promise);h.tick(30000);const last=h.requests.at(-1)!;h.live.stop();assert.equal(last.signal.aborted,true);assert.equal(h.timers.size,0);const states=h.states.length;pending.resolve({value:shipment(99),etag:'"late"',notModified:false});await settle();assert.equal(h.states.length,states);
});
