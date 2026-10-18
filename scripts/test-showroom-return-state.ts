import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createShowroomReturnMemory,SHOWROOM_RETURN_LIMIT,SHOWROOM_RETURN_TTL} from '../apps/mobile/src/showroom-return-state';
const a='https://a.example/api/mobile/v1',b='https://b.example/api/mobile/v1';

test('FE-041 S131 public return memory scopes exact literal filters by API origin/business and contains no snapshots',()=>{
 const memory=createShowroomReturnMemory(()=>100),state={businessId:7,query:'  ቀይ / Red chair  ',categoryId:117};memory.remember(a,Object.assign({},state,{account:'PRIVATE',products:['SNAPSHOT'],phone:'PRIVATE'}));assert.deepEqual(memory.read(a,7),state);assert.deepEqual(memory.read('https://a.example/another-path',7),state);assert.deepEqual(memory.read(a,8),{businessId:8,query:'',categoryId:null});assert.deepEqual(memory.read(b,7),{businessId:7,query:'',categoryId:null});assert.deepEqual(Object.keys(memory.read(a,7)).sort(),['businessId','categoryId','query']);const copy=memory.read(a,7);copy.query='Changed returned copy';assert.deepEqual(memory.read(a,7),state);
 for(const origin of['not a URL','file:///private/tmp/x','https://user:password@a.example']){memory.remember(origin,state);assert.equal(memory.read(origin,7).query,'');}
 for(const id of[0,-1,1.5,Number.MAX_SAFE_INTEGER+1]){memory.remember(a,{...state,businessId:id});assert.equal(memory.read(a,id).query,'');}
 memory.remember(a,{...state,query:'x'.repeat(81)});assert.deepEqual(memory.read(a,7),state,'Reject oversized state rather than change a literal cached query');memory.remember(a,{...state,categoryId:-1});assert.deepEqual(memory.read(a,7),state);memory.remember(a,{...state,query:'x'.repeat(80)});assert.equal(memory.read(a,7).query.length,80);
});

test('FE-041 S131 public return memory expires after2hours and evicts the least recently read of32business scopes',()=>{
 let now=100;const memory=createShowroomReturnMemory(()=>now);memory.remember(a,{businessId:7,query:'red',categoryId:117});now+=SHOWROOM_RETURN_TTL-1;assert.equal(memory.read(a,7).query,'red');now++;assert.equal(memory.read(a,7).query,'');now=100;for(let id=1;id<=SHOWROOM_RETURN_LIMIT;id++)memory.remember(a,{businessId:id,query:'Product '+id,categoryId:id});assert.equal(memory.read(a,1).query,'Product 1');memory.remember(a,{businessId:33,query:'Product 33',categoryId:33});assert.equal(memory.read(a,2).query,'');assert.equal(memory.read(a,1).query,'Product 1');assert.equal(memory.read(a,33).query,'Product 33');now=99;assert.equal(memory.read(a,1).query,'','A backwards clock cannot retain an unverifiable entry');
});
