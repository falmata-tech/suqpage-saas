import assert from 'node:assert/strict';
const base=process.env.SUQPAGE_ATTENTION_TEST_ORIGIN||'http://127.0.0.1:3102';const url=new URL(base);assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'Attention HTTP checks require the local preview.');
for(const [path,status] of [['/api/attention',401],['/api/attention?channel=transport',404],['/api/attention?channel=buying',404],['/api/attention?channel=other',404],['/api/support/99999999/read',401],['/api/mobile/v1/owner/attention',401],['/api/mobile/v1/transport/attention',404]]){
 const r=await fetch(base+path,{method:path.endsWith('/read')?'POST':'GET',headers:{Origin:path.includes('/mobile/')?'http://localhost:8082':base,'content-type':'application/json'},body:path.endsWith('/read')?'{}':undefined});assert.equal(r.status,status,path);assert.ok(/no-store/.test(r.headers.get('cache-control')||''),path+' is private');
}
for(const [headers,body,status] of [[{Origin:'https://untrusted.example','content-type':'application/json'},'{}',403],[{Origin:base,'content-type':'text/plain'},'{}',415],[{Origin:base,'content-type':'application/json'},'{',400],[{Origin:base,'content-type':'application/json'},JSON.stringify({action:'subscribe',device:'x'.repeat(9000)}),413],[{Origin:base,'content-type':'application/json'},JSON.stringify({action:'preferences',userId:1}),400]]){
 const r=await fetch(base+'/api/attention',{method:'POST',headers,body});assert.equal(r.status,status);assert.doesNotMatch(await r.text(),/postgres|SELECT|stack|token_hash/i);
}
console.log('PASS local attention HTTP authentication/token/channel/origin/type/body-size/unknown-field/privacy boundaries. No data mutation or provider request.');
