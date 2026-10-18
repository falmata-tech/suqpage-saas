import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {getDb,getCatalogByBusinessId,getUserById,closeDbForTests} from './testing/postgres-fixture';
import {parseProductMedia,productMedia,updateLegacyMedia} from '../lib/product-media';
import {executeBasicProductUpkeep} from '../lib/product-upkeep';
import {postgresProductUpkeepPort} from '../lib/product-upkeep-postgres';
import {stageTenantProductImage,readTenantProductImage} from '../lib/tenant-product-media';
import {curatedManifestForLegacyDesign} from '../lib/showroom-manifests';
import {catalogToRevisionSnapshotV4} from '../lib/revision-v4-defaults';
import {parseRevisionContent} from '../lib/revision-domain';
import {buildRuntimeMediaReferenceManifest} from '../lib/media-manifest';

async function main(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-gallery-'));process.env.SUQPAGE_MEDIA_DRIVER='filesystem';process.env.SUQPAGE_MEDIA_ROOT=root;process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED='1';
 const db=await getDb();
 try{
  const video={kind:'video' as const,ref:'youtube:M7lc1UVf-VE'};
  assert.deepEqual(productMedia({image_path:'/media/one.png',video_ref:video.ref}),[{kind:'image',ref:'/media/one.png'},video]);
  for(const invalid of [[{kind:'image',ref:'/media/../private.png'}],[{kind:'image',ref:'https://example.test/a.png'}],[{kind:'video',ref:'javascript:alert(1)'}],[video,video],Array.from({length:9},(_,i)=>({kind:'image',ref:`/media/${i}.png`}))])assert.throws(()=>parseProductMedia(invalid));
  const a=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,design_manifest_json,status) VALUES('gallery-a','Gallery A','composition',?,'active')").run(JSON.stringify(curatedManifestForLegacyDesign('novatech')))).insertedId);
  const b=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('gallery-b','Gallery B','composition','draft')").run()).insertedId);
  const uid=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES('gallery@example.test','unused','Owner','owner',?)").run(a)).insertedId);await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(uid);const user=(await getUserById(uid))!;
  const png=await sharp({create:{width:8,height:8,channels:3,background:'#c23806'}}).png().toBuffer();
  const stage=()=>stageTenantProductImage(user,a,new File([new Uint8Array(png)],'photo.png',{type:'image/png'}));
  const first=(await stage())!,second=(await stage())!;
  const media=[{kind:'image' as const,ref:first.imageRef},video,{kind:'image' as const,ref:second.imageRef},{kind:'video' as const,ref:'youtube:aqz-KE-bpKQ'}];
  const command={kind:'create',businessId:a,productId:null,expectedContentVersion:1,idempotencyKey:crypto.randomUUID(),name:'Gallery product',description:'Multiple photos and videos',availability:'available',offeringKind:'standard_product',quantityMode:'optional',categoryId:null,imageAction:'keep',videoRef:'',media:media.slice(0,-1)};
  const created=await executeBasicProductUpkeep(postgresProductUpkeepPort,user,command,null,[first,second]);
  // Retained imported gallery fixture exercises ordering and snapshot compatibility.
  // Owner video links are self-service under BE-048, with provider saves tested separately.
  await db.prepare('UPDATE products SET media_json=? WHERE id=?').run(JSON.stringify(media),created.productId);
  let catalog=(await getCatalogByBusinessId(a,true))!;let product=catalog.products.find(p=>p.id===created.productId)!;
  assert.deepEqual(product.media,media);assert.equal(product.image_path,first.imageRef);assert.equal(product.video_ref,video.ref);
  const snap=catalogToRevisionSnapshotV4(catalog);assert.deepEqual(snap.products[0].media,media);
  const parsed=parseRevisionContent({...snap},4);
  assert.deepEqual(parsed.products[0].media,media);
  assert.ok((await readTenantProductImage(second.imageRef.slice(7),null))?.isPublic,'Extra image is publicly readable for a listed active product');
  await db.prepare('UPDATE products SET is_published=0 WHERE id=?').run(product.id);
  assert.equal(await readTenantProductImage(second.imageRef.slice(7),null),null);
  assert.ok(await readTenantProductImage(second.imageRef.slice(7),user),'Owner may read hidden gallery images');
  await db.prepare('UPDATE products SET is_published=1 WHERE id=?').run(product.id);
  const changed=[media[2],media[3],media[0]];
  const update={...command,kind:'update',productId:product.id,expectedContentVersion:created.contentVersion,idempotencyKey:crypto.randomUUID(),media:changed};
  const saved=await executeBasicProductUpkeep(postgresProductUpkeepPort,user,update,null);
  product=(await getCatalogByBusinessId(a,true))!.products[0];assert.deepEqual(product.media,changed);assert.equal(product.image_path,second.imageRef);assert.equal(product.video_ref,media[3].ref);
  assert.deepEqual(updateLegacyMedia(product,product.image_path,product.video_ref),changed,'Unchanged legacy controls preserve order');
  let discarded=false;await assert.rejects(()=>executeBasicProductUpkeep(postgresProductUpkeepPort,user,{...update,expectedContentVersion:saved.contentVersion,idempotencyKey:crypto.randomUUID(),media:[{kind:'image',ref:'/media/foreign.png'}]},null,[{imageRef:'/media/new.png',digest:'test',discard:async()=>{discarded=true;}}]),/belonging/);assert.ok(discarded);
  assert.deepEqual((await getCatalogByBusinessId(a,true))!.products[0].media,changed);
  await assert.rejects(()=>executeBasicProductUpkeep(postgresProductUpkeepPort,user,{...update,businessId:b,idempotencyKey:crypto.randomUUID()},null),/cannot maintain/);
  await assert.rejects(()=>executeBasicProductUpkeep(postgresProductUpkeepPort,user,{...update,idempotencyKey:crypto.randomUUID()},null),/changed while/);
  const dupeA=(await stage())!,dupeB=(await stage())!;
  const duplicate=await executeBasicProductUpkeep(postgresProductUpkeepPort,user,{...command,media:command.media.map(item=>({...item,ref:item.ref===first.imageRef?dupeA.imageRef:item.ref===second.imageRef?dupeB.imageRef:item.ref}))},null,[dupeA,dupeB]);assert.equal(duplicate.duplicate,true);assert.equal(await readTenantProductImage(dupeA.imageRef.slice(7),user),null);
  const manifest=await buildRuntimeMediaReferenceManifest();assert.ok(manifest.references.some(ref=>ref.key===second.imageRef.slice(7)&&ref.sources.some(source=>source.includes('media_json'))));
  const cleared=await executeBasicProductUpkeep(postgresProductUpkeepPort,user,{...update,expectedContentVersion:saved.contentVersion,idempotencyKey:crypto.randomUUID(),media:[]},null);assert.ok(cleared.contentVersion>saved.contentVersion);const empty=(await getCatalogByBusinessId(a,true))!.products[0];assert.deepEqual(productMedia(empty),[]);assert.equal(empty.image_path,'');assert.equal(empty.video_ref,'');assert.equal(await readTenantProductImage(first.imageRef.slice(7),null),null,'Removed gallery image no longer publicly readable');const retained=await buildRuntimeMediaReferenceManifest();assert.ok(retained.references.some(ref=>ref.key===first.imageRef.slice(7)&&ref.sources.some(source=>source.includes('snapshot'))),'Retained snapshots protect removed photos');
  // Geography/chat64–69 and S137–S141 plan/recipient tracking70–72 preserve gallery behavior.
  assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version,72);
  console.log('PASS gallery validation, save/reorder/reload, legacy compatibility, snapshot retention, private access, tenant/stale/foreign denial, duplicate cleanup and current schema.');
 }finally{await closeDbForTests();fs.rmSync(root,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
