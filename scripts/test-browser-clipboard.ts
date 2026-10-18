import assert from 'node:assert/strict';
import {test} from 'node:test';
import {copyBrowserText} from '../lib/browser-clipboard';

test('copy uses the browser clipboard and reports a real success', async()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'navigator');let copied='';
 try{Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async(text:string)=>{copied=text;}}}});assert.equal(await copyBrowserText('ሰላም & hello'),true);assert.equal(copied,'ሰላም & hello');}
 finally{if(original)Object.defineProperty(globalThis,'navigator',original);else Reflect.deleteProperty(globalThis,'navigator');}
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
