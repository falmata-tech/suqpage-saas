import assert from "node:assert/strict";
import {test} from "node:test";
import {randomUUID} from "node:crypto";
import {getDb,closeDbForTests} from "./testing/postgres-fixture";
import {createPostgresPublicInquiry} from "../lib/inquiries-postgres";
import {markInquiryRead,updateInquiryStatus} from "../lib/inquiry-status-runtime";
import {listInquiriesPage} from "../lib/scalable-queries";
import type {SessionUser} from "../lib/types";

test("isolated real inquiry transaction, concurrency, tenant/read authority and preservation",async()=>{
 const db=await getDb();try{
  const bid=Number((await db.prepare("INSERT INTO businesses(handle,name,status,design_key) VALUES('inquiry-owner','Inquiry owner','active','novatech')").run()).insertedId);
  const foreign=Number((await db.prepare("INSERT INTO businesses(handle,name,status,design_key) VALUES('inquiry-other','Other','active','novatech')").run()).insertedId);
  const pid=Number((await db.prepare("INSERT INTO products(business_id,name,slug,is_published,availability) VALUES(?,'Canonical product','canonical',1,'available')").run(bid)).insertedId);
  const otherPid=Number((await db.prepare("INSERT INTO products(business_id,name,slug,is_published,availability) VALUES(?,'Foreign product','foreign',1,'available')").run(foreign)).insertedId);
  const ownerId=Number((await db.prepare("INSERT INTO users(name,email,password_hash,role,business_id) VALUES('Owner','inquiry-owner@example.test','unused','owner',?)").run(bid)).insertedId);
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client') ON CONFLICT(user_id) DO UPDATE SET access_role='client'").run(ownerId);
  const owner:SessionUser={id:ownerId,name:"Owner",email:"inquiry-owner@example.test",role:"owner",access_role:"client",business_id:bid,must_change_password:0};
  const input={businessId:bid,customerName:"LOCAL Inquiry visitor",contact:"+251911123456",note:"Please contact me about these products.",items:[{productId:pid}],idempotencyKey:randomUUID()};
  const first=await createPostgresPublicInquiry(db.runner,input,"inquiry-tx");assert.ok(first.inquiryId);assert.equal(first.duplicate,false);
  const item=await db.prepare("SELECT product_name_snapshot FROM inquiry_items WHERE inquiry_id=?").get(first.inquiryId);assert.equal(item.product_name_snapshot,"Canonical product");
  const row=await db.prepare("SELECT read_at,request_fingerprint FROM inquiries WHERE id=?").get(first.inquiryId);assert.equal(row.read_at,null);assert.match(row.request_fingerprint,/^[a-f0-9]{64}$/);
  assert.equal((await db.prepare("SELECT COUNT(*) total FROM attention_notifications WHERE source_key=?").get(`inquiry:${first.inquiryId}`)).total,1);
  const concurrent={...input,idempotencyKey:randomUUID()};const pair=await Promise.all([createPostgresPublicInquiry(db.runner,concurrent,"concurrent-a"),createPostgresPublicInquiry(db.runner,concurrent,"concurrent-b")]);assert.equal(pair[0].inquiryId,pair[1].inquiryId);assert.equal(pair.filter(p=>!p.duplicate).length,1);
  await assert.rejects(()=>createPostgresPublicInquiry(db.runner,{...input,note:"Changed request"},"changed"),e=>e instanceof Error&&"status"in e&&e.status===409);
  const count=Number((await db.prepare("SELECT COUNT(*) total FROM inquiries").get()).total);
  for(const patch of [{items:[{productId:otherPid}]},{items:[{productId:pid,options:{Color:"Forged"}}]}])await assert.rejects(()=>createPostgresPublicInquiry(db.runner,{...input,...patch,idempotencyKey:randomUUID()},"invalid"));
  assert.equal(Number((await db.prepare("SELECT COUNT(*) total FROM inquiries").get()).total),count);
  const general=await createPostgresPublicInquiry(db.runner,{...input,items:[],idempotencyKey:randomUUID()},"general");assert.ok(general.inquiryId);
  await db.prepare("UPDATE products SET is_published=0 WHERE id=?").run(pid);
  assert.equal((await createPostgresPublicInquiry(db.runner,input,"retry-after-unpublish")).inquiryId,first.inquiryId);
  await assert.rejects(()=>createPostgresPublicInquiry(db.runner,{...input,idempotencyKey:randomUUID()},"unpublished"));
  assert.equal((await listInquiriesPage(foreign,{inquiryId:first.inquiryId})).items.length,0);
  const listed=await listInquiriesPage(bid,{inquiryId:first.inquiryId});assert.equal(listed.items[0].read_at,null,"List/detail projection does not mark read");
  await assert.rejects(()=>markInquiryRead({...owner,business_id:foreign},{businessId:bid,inquiryId:first.inquiryId!}));
  await assert.rejects(()=>markInquiryRead(owner,{businessId:bid,inquiryId:999999}));
  const read=await markInquiryRead(owner,{businessId:bid,inquiryId:first.inquiryId!});assert.ok(read.readAt);assert.deepEqual(await markInquiryRead(owner,{businessId:bid,inquiryId:first.inquiryId!}),read);
  assert.equal((await db.prepare("SELECT status FROM inquiries WHERE id=?").get(first.inquiryId)).status,"new");
  await updateInquiryStatus(owner,{businessId:bid,inquiryId:first.inquiryId!,status:"contacted"});
  assert.equal((await db.prepare("SELECT note FROM inquiries WHERE id=?").get(first.inquiryId)).note,input.note);
  assert.equal((await db.prepare("SELECT read_at FROM inquiries WHERE id=?").get(first.inquiryId)).read_at,read.readAt);
  const staffId=Number((await db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES('Staff','inquiry-staff@example.test','unused','admin')").run()).insertedId);
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'team_member') ON CONFLICT(user_id) DO UPDATE SET access_role='team_member'").run(staffId);
  const staff:SessionUser={...owner,id:staffId,email:"inquiry-staff@example.test",role:"admin",access_role:"team_member",business_id:null};
  await assert.rejects(()=>markInquiryRead(staff,{businessId:bid,inquiryId:general.inquiryId!}),"Queue membership alone grants no inquiry access");
  await db.prepare("INSERT INTO staff_business_grants(user_id,enabled,version,updated_at) VALUES(?,1,1,?)").run(staffId,Date.now());
  assert.ok((await markInquiryRead(staff,{businessId:bid,inquiryId:general.inquiryId!})).readAt);
  await updateInquiryStatus(staff,{businessId:bid,inquiryId:general.inquiryId!,status:"contacted"});
  await db.prepare("UPDATE staff_business_grants SET enabled=0,version=version+1 WHERE user_id=?").run(staffId);
  await assert.rejects(()=>markInquiryRead(staff,{businessId:bid,inquiryId:first.inquiryId!}));
  await assert.rejects(()=>updateInquiryStatus(staff,{businessId:bid,inquiryId:general.inquiryId!,status:"closed"}));
  assert.equal((await db.prepare("SELECT status FROM inquiries WHERE id=?").get(general.inquiryId)).status,"contacted");

 }finally{await closeDbForTests();}
});
