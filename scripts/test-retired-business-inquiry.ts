import assert from "node:assert/strict";
import {test} from "node:test";
import {POST} from "../app/api/inquiries/route";
import {handleMobileRequest} from "../lib/mobile/router";
import {RETIRED_BUSINESS_INQUIRY} from "../lib/business-inquiry-policy";

test("retired web adapter rejects without touching request or persistence", async () => {
  const response=await POST();
  assert.equal(response.status,410);
  assert.deepEqual(await response.json(),RETIRED_BUSINESS_INQUIRY);
  assert.match(response.headers.get("cache-control")!,/no-store/);
});
test("retired native adapter rejects every body before parsing, identity, rate or persistence", async () => {
  for(const body of ["{broken", "{}", JSON.stringify({businessId:1,items:[{productId:1}],contact:"+447700900001"}), "x".repeat(40000)]){
    const request=new Request("https://suqpage.com/api/mobile/v1/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body});
    const response=await handleMobileRequest(request,["inquiries"],{identity:{verify:async()=>{throw Error("Identity must not be called");},linked:async()=>{throw Error("Identity must not be called");},user:async()=>{throw Error("Identity must not be called");}}});
    assert.equal(response.status,410);
    assert.equal(request.bodyUsed,false);
    assert.deepEqual(await response.json(),RETIRED_BUSINESS_INQUIRY);
    assert.match(response.headers.get("cache-control")!,/no-store/);
  }
});
