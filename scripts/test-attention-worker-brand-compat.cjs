const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const vm=require('node:vm');
const {test}=require('node:test');

const workers=[
 {file:'public/attention-push.js',routes:[
  [{screen:'transport-chat'},'/?chat=transport'],
  [{screen:'support-queue'},'/dashboard/support'],
  [{screen:'support-chat',id:17},'/dashboard/support/17'],
  [{screen:'owner-chat',id:18},'/dashboard/support/18'],
  [{screen:'inquiries',id:19,businessId:23},'/dashboard/inquiries?inquiry=19&business=23'],
 ]},
 {file:'apps/mobile/public/attention-sw.js',routes:[
  [{screen:'transport-chat'},'/buying'],
  [{screen:'owner-chat',id:18},'/owner/chat?id=18'],
  [{screen:'inquiries',id:19},'/owner/inquiries?id=19'],
 ]},
];
function fixture(file,origin='https://mirtpage.com'){
 const handlers={},shown=[],opened=[],navigated=[],focused=[],waits=[];
 let clients=[],closed=0,installed=0,claimed=0;
 const self={
  location:{origin},
  addEventListener:(kind,handler)=>{assert.equal(handlers[kind],undefined);handlers[kind]=handler;},
  skipWaiting:()=>{installed++;},
  registration:{showNotification:async(title,options)=>{shown.push({title,options});}},
  clients:{
   claim:async()=>{claimed++;},
   matchAll:async options=>{assert.equal(options.type,'window');assert.equal(options.includeUncontrolled,true);return clients;},
   openWindow:async url=>{opened.push(url);},
  },
 };
 vm.runInNewContext(fs.readFileSync(file,'utf8'),{self,URL,console,fetch:()=>{throw Error('Worker compatibility must not contact a provider.');}},{filename:file});
 const waitUntil=promise=>waits.push(Promise.resolve(promise));
 async function settle(){while(waits.length)await waits.shift();}
 return{
  shown,opened,navigated,focused,handlers,
  push:async value=>{handlers.push({data:{json:()=>value},waitUntil});await settle();},
  malformed:async()=>{handlers.push({data:{json:()=>{throw Error('Malformed fixture JSON');}},waitUntil});await settle();},
  click:async destination=>{handlers.notificationclick({notification:{data:{destination},close:()=>{closed++;}},waitUntil});await settle();},
  setExisting:()=>{clients=[{url:'https://other.invalid/private',navigate:async()=>{throw Error('Foreign-origin window selected.');},focus:async()=>{throw Error('Foreign-origin window focused.');}},{url:origin+'/current',navigate:async path=>{navigated.push(path);},focus:async()=>{focused.push(true);}}];},
  lifecycle:async()=>{if(handlers.install){handlers.install({waitUntil});await settle();}if(handlers.activate){handlers.activate({waitUntil});await settle();}return{installed,claimed};},
  closed:()=>closed,
 };
}
const payload=(title='Suqpage',silent=false)=>({title,body:'A new chat message.',notificationId:41,destination:{screen:'transport-chat'},silent});

test('published S9910 browser worker still accepts the retained web wire title',async()=>{
 const file='scripts/fixtures/attention-push-s9910.js';
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),'eeabe5c6274b46a9a33a58424292b7154c1b8f025b81654d44dbfcee995b20e5');
 const f=fixture(file,'https://suqpage.com');
 await f.push(payload());assert.equal(f.shown.length,1);assert.equal(f.shown[0].title,'Suqpage');
 await f.click(f.shown[0].options.data.destination);assert.deepEqual(f.opened,['/?chat=transport']);
 await f.push(payload('MirtPage'));assert.equal(f.shown.length,1,'An unconditional wire rename would silently drop this installed worker alert');
});

for(const worker of workers){
 test(`${worker.file}: both exact brands display with unchanged audible/quiet and deduplication options`,async()=>{
  const f=fixture(worker.file);
  for(const title of ['Suqpage','MirtPage'])for(const silent of [false,true]){
   await f.push(payload(title,silent));
   const shown=f.shown.at(-1);assert.equal(shown.title,'AfricMade');assert.equal(shown.options.body,'A new chat message.');
   assert.equal(shown.options.silent,silent);assert.equal(shown.options.tag,'suqpage-alert-41');assert.equal(shown.options.renotify,false);
   assert.deepEqual(JSON.parse(JSON.stringify(shown.options.data.destination)),{screen:'transport-chat'});
   if(worker.file==='public/attention-push.js'){
    assert.equal(shown.options.icon,'/pwa/africmade-icon-v3-192.png');assert.equal(shown.options.badge,'/pwa/africmade-badge-96.png');assert.equal(shown.options.data.notificationId,41);
   }
  }
  assert.equal(f.shown.length,4);
  await f.push({...payload('MirtPage'),body:'x'.repeat(300)});assert.equal(f.shown.at(-1).options.body.length,300);
 });

 test(`${worker.file}: foreign, spoofed and malformed payloads remain rejected`,async()=>{
  const f=fixture(worker.file);
  for(const title of ['Other brand','suqpage','SUQPAGE','Mirtpage','MirtPage ',' Suqpage','MirtPage\n','MirtPаge','https://mirtpage.com',null,42,{},['MirtPage']])await f.push({...payload(),title});
  for(const value of [null,undefined,false,42,'MirtPage',[],{},
   {...payload(),body:undefined},{...payload(),body:null},{...payload(),body:42},{...payload(),body:{}},{...payload(),body:'x'.repeat(301)},
   {...payload(),notificationId:undefined},{...payload(),notificationId:'41'},{...payload(),notificationId:1.5},
   {...payload(),notificationId:NaN},{...payload(),notificationId:Infinity},{...payload(),notificationId:Number.MAX_SAFE_INTEGER+1},
  ])await f.push(value);
  await f.malformed();assert.equal(f.shown.length,0);assert.deepEqual(f.opened,[]);assert.deepEqual(f.navigated,[]);
 });

 test(`${worker.file}: each brand opens only established internal routes on both origins`,async()=>{
  for(const origin of ['https://suqpage.com','https://mirtpage.com'])for(const title of ['Suqpage','MirtPage']){
   const f=fixture(worker.file,origin);
   for(const [destination,path]of worker.routes){
    await f.push({...payload(title),destination});await f.click(f.shown.at(-1).options.data.destination);
    assert.equal(f.opened.at(-1),path);assert.equal(new URL(path,origin).origin,origin);
   }
   assert.equal(f.opened.length,worker.routes.length);assert.equal(f.closed(),worker.routes.length);
  }
 });

 test(`${worker.file}: safe tap reuses same-origin window and ignores hostile destinations`,async()=>{
  const f=fixture(worker.file);f.setExisting();
  const [destination,path]=worker.routes[0];await f.click(destination);
  assert.deepEqual(f.navigated,[path]);assert.equal(f.focused.length,1);assert.deepEqual(f.opened,[]);
  const attacks=[null,undefined,{},'https://evil.invalid',
   {screen:'https://evil.invalid',id:1},{screen:'//evil.invalid',id:1},{screen:'javascript:alert(1)',id:1},
   {screen:'owner-chat',id:'18'},{screen:'owner-chat',id:0},{screen:'owner-chat',id:-1},{screen:'owner-chat',id:1.5},
   {screen:'owner-chat',id:Number.MAX_SAFE_INTEGER+1},{screen:'owner-chat',id:'../../private'},
   {screen:'inquiries',id:19,businessId:0},{screen:'inquiries',id:'19',businessId:23},
  ];
  // The Expo worker needs only the inquiry ID; its existing route intentionally
  // ignores businessId. Assert this boundary without tightening its contract.
  for(const attack of attacks){
   if(worker.file==='apps/mobile/public/attention-sw.js'&&attack?.screen==='inquiries'&&attack.id===19)continue;
   await f.click(attack);
  }
  assert.deepEqual(f.navigated,[path]);assert.equal(f.focused.length,1);assert.deepEqual(f.opened,[]);
  if(worker.file==='public/attention-push.js')for(const invalid of [{screen:'inquiries',id:19},{screen:'inquiries',id:19,businessId:'23'},{screen:'inquiries',id:19,businessId:-1}])await f.click(invalid);
  assert.deepEqual(f.navigated,[path]);
 });

 test(`${worker.file}: lifecycle behavior is retained without network or cache operations`,async()=>{
  const f=fixture(worker.file),result=await f.lifecycle();
  assert.deepEqual(result,worker.file==='apps/mobile/public/attention-sw.js'?{installed:1,claimed:1}:{installed:0,claimed:0});
  assert.deepEqual(f.opened,[]);assert.equal(f.shown.length,0);
 });
}
