import assert from 'node:assert/strict';
import {test} from 'node:test';
import {appendPickedImage} from '../apps/mobile/src/image-upload';
import {readPrivateImage,preparePrivateImage} from '../apps/mobile/src/private-image';

test('FE-056/FE-053: picked images are serialized as binary multipart with MIME and filename',async()=>{
 const bytes=new Uint8Array([137,80,78,71,13,10,26,10]);
 for(const field of ['file','images','logo']){
  const form=new FormData();form.append('details','{"name":"Unchanged"}');let reads=0;
  await appendPickedImage(form,field,{uri:'file:///picked/photo.png',fileName:'photo.png'},async uri=>{assert.equal(uri,'file:///picked/photo.png');reads++;return new Blob([bytes],{type:'image/png'});});
  const parsed=await new Request('http://localhost/upload',{method:'POST',body:form}).formData(),file=parsed.get(field);
  assert.ok(file instanceof File);assert.equal(file.name,'photo.png');assert.equal(file.type,'image/png');assert.deepEqual(new Uint8Array(await file.arrayBuffer()),bytes);assert.equal(parsed.get('details'),'{"name":"Unchanged"}');assert.equal(reads,1);
 }
});
test('FE-056: private image bytes reject unauthorized, non-image and oversized responses',async()=>{
 const bytes=new Uint8Array([137,80,78,71]);
 const image=await readPrivateImage(new Response(bytes,{headers:{'content-type':'image/png'}}));
 assert.equal(image.extension,'png');assert.deepEqual(image.bytes,bytes);
 for(const response of [new Response('No',{status:401}),new Response('text',{headers:{'content-type':'text/plain'}}),new Response(bytes,{headers:{'content-type':'image/png','content-length':String(5*1024*1024+1)}}),new Response(new Uint8Array(5*1024*1024+1),{headers:{'content-type':'image/png'}})])await assert.rejects(()=>readPrivateImage(response));
});
test('FE-056: unreadable, wrong-type, empty or oversized selections fail before appending',async()=>{
 const form=new FormData(),image={uri:'file:///bad.png'};
 for(const file of [new Blob([],{type:'image/png'}),new Blob(['bad'],{type:'text/plain'}),new Blob([new Uint8Array(5*1024*1024+1)],{type:'image/png'})])await assert.rejects(()=>appendPickedImage(form,'file',image,async()=>file));
 await assert.rejects(()=>appendPickedImage(form,'file',image,async()=>{throw Error('Unreadable file');}));assert.equal(form.has('file'),false);
});
test('FE-056: obsolete private image loads do not create cache files and disposed resources release bytes',async()=>{
 const response=()=>new Response(new Uint8Array([137,80,78,71]),{headers:{'content-type':'image/png'}});
 let creates=0,disposes=0,current=false;
 const create=()=>{creates++;return {uri:'file:///app/cache/private.png',dispose:()=>{disposes++;}};};
 assert.equal(await preparePrivateImage(response(),create,()=>current),null);assert.equal(creates,0);
 current=true;const resource=await preparePrivateImage(response(),create,()=>current);assert.equal(resource?.uri,'file:///app/cache/private.png');resource?.dispose();assert.equal(disposes,1);
 assert.equal(await preparePrivateImage(response(),()=>{current=false;return create();},()=>current),null);assert.equal(disposes,2);
});
