import type {Shop,Offering} from '@africmade/contracts';
import {MAX_INQUIRY_SELECTIONS,selectionKey} from '../../../lib/product-inquiry';
import {inquiryCatalogProduct} from './catalog-products';

export type BusinessInquiryItem={product:Offering;quantity:string;options:Record<string,string>};
type SavedItem={productId:number;quantity:string;options:Record<string,string>};
export type InquiryBasketStorage={read:(businessId:number)=>Promise<string|null>;write:(businessId:number,value:string)=>Promise<void>};
type Entry={items:SavedItem[];ready:boolean;loaded:boolean;error:string;loading?:Promise<void>;writing?:Promise<void>;revision:number};
const MAX_BYTES=65_536;
export const INQUIRY_STORAGE_ERROR='Your inquiry list is available for this visit, but could not be saved on this device. Try again.';
function utf8Length(value:string):number {let bytes=0;for(const character of value){const code=character.codePointAt(0)!;bytes+=code<=0x7f?1:code<=0x7ff?2:code<=0xffff?3:4;}return bytes;}

function references(raw:unknown):SavedItem[] {
 if(!Array.isArray(raw))return [];
 const items:SavedItem[]=[],seen=new Set<string>();
 for(const candidate of raw.slice(0,MAX_INQUIRY_SELECTIONS)){
  if(!candidate||typeof candidate!=='object')continue;
  const value=candidate as Record<string,unknown>;
  if(!Number.isSafeInteger(value.productId)||Number(value.productId)<=0||!value.options||typeof value.options!=='object'||Array.isArray(value.options))continue;
  const entries=Object.entries(value.options);
  if(entries.length>20||entries.some(([key,item])=>key.length>200||typeof item!=='string'||item.length>500))continue;
  const options=Object.fromEntries(entries) as Record<string,string>,key=selectionKey(Number(value.productId),options);
  if(seen.has(key))continue;seen.add(key);
  items.push({productId:Number(value.productId),quantity:typeof value.quantity==='string'?value.quantity.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,80):'',options});
 }
 return items;
}
export function restoreBusinessInquiry(shop:Shop,raw:unknown):BusinessInquiryItem[] {
 return references(raw).flatMap(saved=>{
  const product=shop.products.find(item=>item.id===saved.productId&&inquiryCatalogProduct(item));
  if(!product||Object.keys(saved.options).length!==product.options.length||product.options.some(group=>!Object.hasOwn(saved.options,group.name)||!group.values.includes(saved.options[group.name])))return [];
  return [{product,quantity:saved.quantity,options:saved.options}];
 });
}
function stored(items:readonly BusinessInquiryItem[]):SavedItem[]{return references(items.map(item=>({productId:item.product.id,quantity:item.quantity,options:item.options})));}
function parse(raw:string|null,businessId:number):SavedItem[]{
 if(!raw||raw.length>MAX_BYTES)return [];
 try{const value=JSON.parse(raw);return value?.version===1&&value.businessId===businessId?references(value.items):[];}catch{return [];}
}

/** Per-business public references only; no catalog, contacts or account data. */
export function createInquiryBaskets(storage:InquiryBasketStorage) {
 const entries=new Map<number,Entry>(),listeners=new Map<number,Set<()=>void>>(),migrated=new Set<number>();
 const entry=(id:number)=>{let current=entries.get(id);if(!current){current={items:[],ready:false,loaded:false,error:'',revision:0};entries.set(id,current);}return current;};
 const notify=(id:number)=>listeners.get(id)?.forEach(listener=>listener());
 function persist(id:number):Promise<void>{
  const current=entry(id),revision=current.revision,value=JSON.stringify({version:1,businessId:id,items:current.items});
  if(!current.loaded)return Promise.resolve();
  if(utf8Length(value)>MAX_BYTES){current.error=INQUIRY_STORAGE_ERROR;notify(id);return Promise.resolve();}
  const task=(current.writing||Promise.resolve()).catch(()=>{}).then(()=>storage.write(id,value)).then(()=>{if(current.revision===revision){current.error='';notify(id);}}).catch(()=>{if(current.revision===revision){current.error=INQUIRY_STORAGE_ERROR;notify(id);}});
  current.writing=task;return task;
 }
 async function load(id:number){
  const current=entry(id);if(current.loaded)return;if(current.loading)return current.loading;
  current.loading=storage.read(id).then(raw=>{if(!current.loaded){const saved=parse(raw,id);current.items=current.revision>0?references([...current.items,...saved]):saved;current.loaded=true;current.error='';if(current.revision>0)void persist(id);}}).catch(()=>{if(!current.loaded)current.error=INQUIRY_STORAGE_ERROR;}).finally(()=>{current.ready=true;current.loading=undefined;notify(id);});
  return current.loading;
 }
 function update(shop:Shop,change:(items:BusinessInquiryItem[])=>BusinessInquiryItem[]){
  const current=entry(shop.id);current.items=stored(change(restoreBusinessInquiry(shop,current.items)));current.ready=true;current.revision++;notify(shop.id);void persist(shop.id);
 }
 return {
  load,
  read:(shop:Shop)=>{const current=entry(shop.id);return {items:restoreBusinessInquiry(shop,current.items),ready:current.ready&&current.loaded,error:current.error};},
  subscribe:(id:number,listener:()=>void)=>{const group=listeners.get(id)||new Set<()=>void>();group.add(listener);listeners.set(id,group);return()=>{group.delete(listener);};},
  update,
  seed:(shop:Shop,items:BusinessInquiryItem[])=>{if(!migrated.has(shop.id)){migrated.add(shop.id);update(shop,current=>[...current,...items]);}},
  clear:async(id:number)=>{const current=entry(id);current.items=[];current.ready=true;current.loaded=true;current.revision++;notify(id);await persist(id);},
  retry:async(id:number)=>{const current=entry(id);if(current.error){if(current.loaded)await persist(id);else{current.ready=false;await load(id);}}},
 };
}
