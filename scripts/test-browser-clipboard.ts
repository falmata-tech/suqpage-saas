import assert from 'node:assert/strict';
import {test} from 'node:test';
import {copyBrowserText,openCopiedBrowserLink} from '../lib/browser-clipboard';

test('copy uses the browser clipboard and reports a real success', async()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'navigator');let copied='';
 try{Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async(text:string)=>{copied=text;}}}});assert.equal(await copyBrowserText('ሰላም & hello'),true);assert.equal(copied,'ሰላም & hello');}
 finally{if(original)Object.defineProperty(globalThis,'navigator',original);else Reflect.deleteProperty(globalThis,'navigator');}
});

async function withHandoffBrowser(userAgent:string,run:(trace:string[],destination:{opener:unknown;closed:boolean;location:{href:string}})=>Promise<void>,options:{denyCopy?:boolean;denyNavigation?:boolean;blockPopup?:boolean}={}){
 const names=['navigator','document','window'] as const;
 const originals=names.map(name=>Object.getOwnPropertyDescriptor(globalThis,name));
 const trace:string[]=[],location={get href(){return '';},set href(value:string){trace.push('destination:'+value);}};
 const destination={opener:{} as unknown,closed:false,location,close(){trace.push('close');}};
 try{
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userAgent,clipboard:{writeText:async()=>{trace.push('copy');if(options.denyCopy)throw Error('denied');}}}});
  Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(){throw Error('legacy copy denied');}}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{open(url:string){trace.push('popup:'+url);return options.blockPopup?null:destination;},location:{assign(url:string){trace.push('navigate:'+url);if(options.denyNavigation)throw Error('navigation denied');}}}});
  await run(trace,destination);
 }finally{names.forEach((name,index)=>{const original=originals[index];if(original)Object.defineProperty(globalThis,name,original);else Reflect.deleteProperty(globalThis,name);});}
}

test('FE-066 phone web copies before same-tab WhatsApp/Telegram navigation without a blank popup',async()=>{
 for(const userAgent of ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)','Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Mobile Safari/537.36']){
  for(const href of ['https://wa.me/19528552202?text=Hello%20%26%20thanks','https://t.me/+19528552202?text=Hello%20%26%20thanks']){
   await withHandoffBrowser(userAgent,async trace=>{
    assert.deepEqual(await openCopiedBrowserLink('Hello & thanks',href),{copied:true,opened:true});
    assert.deepEqual(trace,['copy','navigate:'+href]);
   });
  }
 }
});

test('FE-066 phone copy denial still opens the destination; navigation failure is reported for fallback',async()=>{
 const href='https://wa.me/19528552202?text=Hello';
 await withHandoffBrowser('iPhone',async trace=>{
  assert.deepEqual(await openCopiedBrowserLink('Hello',href),{copied:false,opened:true});
  assert.deepEqual(trace,['copy','navigate:'+href]);
 },{denyCopy:true});
 await withHandoffBrowser('iPhone',async trace=>{
  assert.deepEqual(await openCopiedBrowserLink('Hello',href),{copied:true,opened:false});
  assert.deepEqual(trace,['copy','navigate:'+href]);
 },{denyNavigation:true});
});

test('FE-066 desktop popup reservation, blocked-popup recovery and SMS navigation remain compatible',async()=>{
 const href='https://t.me/example_shop?text=Hello';
 await withHandoffBrowser('Desktop browser',async(trace,destination)=>{
  assert.deepEqual(await openCopiedBrowserLink('Hello',href),{copied:true,opened:true});
  assert.equal(destination.opener,null);
  assert.deepEqual(trace,['popup:about:blank','copy','destination:'+href]);
 });
 await withHandoffBrowser('Desktop browser',async trace=>{
  assert.deepEqual(await openCopiedBrowserLink('Hello',href),{copied:true,opened:false});
  assert.deepEqual(trace,['popup:about:blank','copy']);
 },{blockPopup:true});
 await withHandoffBrowser('Desktop browser',async trace=>{
  assert.deepEqual(await openCopiedBrowserLink('Hello','sms:+19528552202?body=Hello',false),{copied:true,opened:true});
  assert.deepEqual(trace,['copy','navigate:sms:+19528552202?body=Hello']);
 });
});
test('denied copying checks the legacy boolean and always removes its temporary field',async()=>{
 const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator'),doc=Object.getOwnPropertyDescriptor(globalThis,'document');let legacyResult=false,removed=0,selected=0;
 try{
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async()=>{throw Error('permission denied');}}}});
  Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({value:'',style:{},setAttribute(){},select(){selected++;},remove(){removed++;}}),body:{appendChild(){}},execCommand:()=>legacyResult}});
  assert.equal(await copyBrowserText('Selected product'),false);
  legacyResult=true;assert.equal(await copyBrowserText('Selected product'),true);
  Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({value:'',style:{},setAttribute(){},select(){selected++;},remove(){removed++;}}),body:{appendChild(){}},execCommand:()=>{throw Error('denied');}}});
  assert.equal(await copyBrowserText('Selected product'),false);
  assert.equal(removed,3);assert.equal(selected,3);
 }finally{
  if(nav)Object.defineProperty(globalThis,'navigator',nav);else Reflect.deleteProperty(globalThis,'navigator');
  if(doc)Object.defineProperty(globalThis,'document',doc);else Reflect.deleteProperty(globalThis,'document');
 }
});
