import {InquiryError, type InquiryInput} from "./inquiries";

export type NormalizedInquiryItem={productId:number;quantity:string;options:Record<string,string>};
export type NormalizedInquiry={businessId:number;customerName:string;contact:string;contactMethod:"phone";note:string;items:NormalizedInquiryItem[];idempotencyKey:string;website:string};
function text(value:unknown,max:number,label:string,required=false):string{
 if(typeof value!=="string")throw new InquiryError(`Enter ${label}.`);
 const result=value.normalize("NFC").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,"").trim();
 if((required&&!result)||Array.from(result).length>max)throw new InquiryError(`Check ${label}.`);
 return result;
}
function object(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==="object"&&!Array.isArray(value);}
function fields(value:Record<string,unknown>,allowed:readonly string[]){if(Object.keys(value).some(k=>!allowed.includes(k)))throw new InquiryError("Unexpected inquiry field.");}
function id(value:unknown){const n=typeof value==="number"?value:typeof value==="string"&&/^\d+$/.test(value)?Number(value):0;if(!Number.isSafeInteger(n)||n<1)throw new InquiryError("Invalid offering or business.");return n;}
export function normalizeInquiry(input:InquiryInput):NormalizedInquiry{
 if(!object(input))throw new InquiryError("Check the inquiry.");
 fields(input,["businessId","customerName","contact","contactMethod","note","items","idempotencyKey","website"]);
 const customerName=text(input.customerName,80,"your name",true).replace(/\s+/g," ");
 if(input.contactMethod!==undefined&&input.contactMethod!=="phone")throw new InquiryError("A phone number is required.");
 const rawPhone=text(input.contact,60,"a phone number",true);
 if(!/^\+?[\d\s().-]+$/.test(rawPhone))throw new InquiryError("Enter a valid phone number.");
 const digits=rawPhone.replace(/\D/g,"");if(digits.length<7||digits.length>15)throw new InquiryError("Enter a phone number with 7 to 15 digits.");
 const key=text(input.idempotencyKey,100,"an inquiry key",true);if(!/^[a-zA-Z0-9_-]{10,100}$/.test(key))throw new InquiryError("A valid inquiry key is required.");
 if(!Array.isArray(input.items)||input.items.length>20)throw new InquiryError("An inquiry can contain up to 20 products.");
 const seen=new Set<string>();const items=input.items.map((raw:unknown)=>{
  if(!object(raw))throw new InquiryError("Invalid selection.");fields(raw,["productId","quantity","options"]);
  const productId=id(raw.productId),quantity=raw.quantity===undefined||raw.quantity===null?"":text(typeof raw.quantity==="number"?String(raw.quantity):raw.quantity,80,"desired quantity").replace(/\s+/g," ");
  if(raw.options!==undefined&&!object(raw.options))throw new InquiryError("Invalid product options.");
  const entries=Object.entries(raw.options??{}).sort(([a],[b])=>a.localeCompare(b));
  if(entries.length>40)throw new InquiryError("Invalid product options.");
  for(const [k,v]of entries)if(["__proto__","prototype","constructor"].includes(k)||!k||k.length>100||typeof v!=="string"||!v||v.length>100)throw new InquiryError("Invalid product options.");
  const options=Object.fromEntries(entries.map(([k,v])=>[k,text(v,100,"a product option",true)]));
  const selection=JSON.stringify([productId,options]);if(seen.has(selection))throw new InquiryError("A product selection is repeated.");seen.add(selection);return {productId,quantity,options};
 });
 return {businessId:id(input.businessId),customerName,contact:`${rawPhone.startsWith("+")?"+":""}${digits}`,contactMethod:"phone",note:text(input.note,10000,"a message",true),items,idempotencyKey:key,website:input.website===undefined?"":text(input.website,200,"the website field")};
}
/** Stable normalized visitor action; key and honeypot are not business content. */
export function normalizedInquiryAction(input:NormalizedInquiry):string{
 return JSON.stringify([input.businessId,input.customerName,input.contact,input.contactMethod,input.note,[...input.items].sort((a,b)=>a.productId-b.productId||JSON.stringify(a.options).localeCompare(JSON.stringify(b.options)))]);
}
