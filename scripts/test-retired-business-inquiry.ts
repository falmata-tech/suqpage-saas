// FE-075/BE-062 supersedes the retired410 contract; keep the existing gate name.
import "./test-restored-inquiry";
import assert from "node:assert/strict";
import {test} from "node:test";
import {POST} from "../app/api/inquiries/route";
import {handleMobileRequest} from "../lib/mobile/router";

test("web rejects foreign origin before public persistence",async()=>{
 const response=await POST(new Request("https://mirtpage.com/api/inquiries",{method:"POST",headers:{Origin:"https://foreign.invalid"}}));assert.equal(response.status,403);
});
test("native public adapter submits through shared application port without identity",async()=>{
 let calls=0;const inquiry={limit:async()=>({allowed:true,retryAfterSeconds:0}),create:async()=>{calls++;return {inquiryId:18,duplicate:false,trapped:false};}};
 const response=await handleMobileRequest(new Request("https://mirtpage.com/api/mobile/v1/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),["inquiries"],{inquiry,identity:{verify:async()=>{throw Error("Identity must not be called");},linked:async()=>{throw Error("Identity must not be called");},user:async()=>{throw Error("Identity must not be called");}}});
 assert.equal(response.status,201);assert.equal(calls,1);assert.equal((await response.json()).inquiryId,18);
 const rejected=await handleMobileRequest(new Request("https://mirtpage.com/api/mobile/v1/inquiries",{method:"POST",headers:{Origin:"https://foreign.invalid","Content-Type":"application/json"},body:"{}"}),["inquiries"],{inquiry});assert.equal(rejected.status,403);assert.equal(calls,1);
});
