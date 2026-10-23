import assert from "node:assert/strict";
import {test} from "node:test";
import {normalizeInquiry, normalizedInquiryAction} from "../lib/inquiry-contract";
import {handlePublicInquiry, type PublicInquiryHttpPort} from "../lib/inquiry-http";
import {publicContactIsPhone,publicContactDisplay} from "../lib/public-contact-device";

const valid = () => ({businessId:7,customerName:"  Aster  Wako  ",contact:"+251 (985) 199-993",note:"Please tell me more.\nThank you.",items:[],idempotencyKey:"inquiry_example_123"});
test("general inquiry normalizes a Unicode name/phone without truncating the message",()=>{
 const v=normalizeInquiry(valid()); assert.equal(v.customerName,"Aster Wako");assert.equal(v.contact,"+251985199993");assert.equal(v.note,"Please tell me more.\nThank you.");assert.deepEqual(v.items,[]);
 assert.equal(normalizeInquiry({...valid(),customerName:"ሰላም",note:"x".repeat(10000)}).note.length,10000);
});
test("strict bounds/types reject rather than silently truncate or coerce",()=>{
 for(const patch of [{customerName:"x".repeat(81)},{note:"x".repeat(10001)},{note:" "},{contact:"123"},{businessId:true},{items:{}},{contactMethod:"email"},{unknown:"field"},{customerName:77},{items:[{productId:1,quantity:"q".repeat(81)}]},{items:Array.from({length:21},(_,i)=>({productId:i+1}))}])assert.throws(()=>normalizeInquiry({...valid(),...patch}));
});
test("canonical action is order independent but binds message/contact/options/quantity",()=>{
 const first=normalizeInquiry({...valid(),items:[{productId:2,quantity:"  two  boxes ",options:{Size:"Large",Color:"Red"}},{productId:1}]});
 const second=normalizeInquiry({...valid(),items:[{productId:1},{productId:2,quantity:"two boxes",options:{Color:"Red",Size:"Large"}}]});
 assert.equal(normalizedInquiryAction(first),normalizedInquiryAction(second));
 for(const patch of [{note:"Another question"},{contact:"+251985199994"}])assert.notEqual(normalizedInquiryAction(first),normalizedInquiryAction(normalizeInquiry({...valid(),...patch})));
 assert.throws(()=>normalizeInquiry({...valid(),items:[{productId:1},{productId:1}]}));
 assert.throws(()=>normalizeInquiry({...valid(),items:[{productId:1,options:JSON.parse('{"__proto__":"bad"}')}]}));
});
function port(){const calls={rate:0,create:0};const p:PublicInquiryHttpPort={limit:async()=>{calls.rate++;return {allowed:true,retryAfterSeconds:0};},create:async(input)=>{calls.create++;normalizeInquiry(input);return {inquiryId:42,duplicate:false,trapped:false};}};return {p,calls};}
const request=(body:string,headers:Record<string,string>={})=>new Request("https://mirtpage.com/api/inquiries",{method:"POST",headers:{"Content-Type":"application/json",...headers},body});
test("HTTP uses real durable receipt/no-store, rate before malformed or oversized requests",async()=>{
 const {p,calls}=port();let r=await handlePublicInquiry(request(JSON.stringify(valid())),"private-hash",p);assert.equal(r.status,201);assert.equal((await r.json()).inquiryId,42);assert.match(r.headers.get("cache-control")!,/no-store/);
 for(const body of ["{bad", "x".repeat(131073)]){r=await handlePublicInquiry(request(body),"private-hash",p);assert.ok([400,413].includes(r.status));}assert.equal(calls.rate,3);assert.equal(calls.create,1);
 r=await handlePublicInquiry(request("{}",{"Content-Length":"131073"}),"private-hash",p);assert.equal(r.status,413);assert.equal(calls.create,1);
});
test("rate refusal, trap and duplicate never masquerade as a new inquiry",async()=>{
 const {p,calls}=port();p.limit=async()=>({allowed:false,retryAfterSeconds:60});let r=await handlePublicInquiry(request(JSON.stringify(valid())),"hash",p);assert.equal(r.status,429);assert.equal(r.headers.get("retry-after"),"60");assert.equal(calls.create,0);
 p.limit=async()=>({allowed:true,retryAfterSeconds:0});p.create=async()=>({inquiryId:null,duplicate:false,trapped:true});r=await handlePublicInquiry(request(JSON.stringify(valid())),"hash",p);assert.equal(r.status,202);assert.equal((await r.json()).inquiryId,undefined);
 p.create=async()=>({inquiryId:42,duplicate:true,trapped:false});r=await handlePublicInquiry(request(JSON.stringify(valid())),"hash",p);assert.equal(r.status,200);assert.equal((await r.json()).duplicate,true);
});
test("external contact policy recognizes phones without inferring apps from desktop width",()=>{
 for(const platform of ["android","ios"])assert.equal(publicContactIsPhone(platform),true);
 for(const ua of ["Mozilla/5.0 (iPhone)","Mozilla/5.0 (Linux; Android 16) Mobile"])assert.equal(publicContactIsPhone("web",ua),true);
 for(const ua of ["","Mozilla/5.0 (Macintosh)","Mozilla/5.0 (Linux; Android 16)"])assert.equal(publicContactIsPhone("web",ua),false);
 assert.equal(publicContactDisplay("phone",{phone:"+251911123456"}),"+251911123456");assert.equal(publicContactDisplay("telegram",{telegram:"store_name"}),"store_name");
});
