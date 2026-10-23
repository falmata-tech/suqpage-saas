import {createHash} from "node:crypto";
import {InquiryError,type InquiryInput} from "./inquiries";
import {normalizeInquiry,normalizedInquiryAction} from "./inquiry-contract";
import {enqueueInquiryAttention} from "./attention-postgres";
import {normalizeOfferingKind,normalizeQuantityMode} from "./offerings";
import type {PostgresTransactionRunner} from "./postgres-runtime";
import {consumePostgresRateLimit} from "./rate-limit-postgres";
import type {Business} from "./types";

type InquiryNotifier=(business:Business,inquiryId:number,customerName:string)=>Promise<unknown>;
/** Canonical intake. Optional notifier is an explicit test/integration port, never dormant email. */
export async function createPostgresPublicInquiry(runner:PostgresTransactionRunner,input:InquiryInput,ipHash:string,notify?:InquiryNotifier){
 const value=normalizeInquiry(input);
 if(value.website)return {inquiryId:null,duplicate:false,trapped:true};
 const rate=await consumePostgresRateLimit(runner,`inquiry:${value.businessId}:${ipHash}`,10,10*60*1000,30*60*1000);
 if(!rate.allowed)throw new InquiryError("Too many inquiry attempts. Please try again later.",429,rate.retryAfterSeconds);
 const fingerprint=createHash("sha256").update(normalizedInquiryAction(value)).digest("hex");
 let target:Business|undefined;
 const created=await runner.transaction(async()=>{
  // Serializes concurrent same-key submissions without catching errors in an aborted transaction.
  await runner.query("SELECT pg_advisory_xact_lock(hashtextextended(?,0))",[`inquiry:${value.businessId}:${value.idempotencyKey}`]);
  const existing=(await runner.query<{id:number;request_fingerprint:string|null}>("SELECT id,request_fingerprint FROM inquiries WHERE business_id=? AND idempotency_key=? FOR UPDATE",[value.businessId,value.idempotencyKey])).rows[0];
  if(existing){if(existing.request_fingerprint!==fingerprint)throw new InquiryError("This inquiry key was already used for a different request.",409);return {inquiryId:existing.id,duplicate:true};}
  target=(await runner.query<Business>("SELECT b.* FROM businesses b WHERE b.id=? AND b.status='active' AND EXISTS(SELECT 1 FROM business_handles h WHERE h.business_id=b.id) FOR SHARE",[value.businessId])).rows[0];
  if(!target)throw new InquiryError("Business not found.",404);
  await runner.query("SELECT business_id FROM business_handles WHERE business_id=? FOR SHARE",[value.businessId]);
  // Option editors may add/remove rows: lock the set as well as existing rows until snapshots commit.
  if(value.items.length)await runner.query("LOCK TABLE option_groups,option_values IN SHARE MODE");
  const validated=[] as Array<{productId:number;quantityIntent:string;name:string;offeringKind:string;quantityMode:string;options:Record<string,string>}>;
  for(const item of value.items){
   const product=(await runner.query<{name:string;availability:string;offering_kind:string;quantity_mode:string}>("SELECT name,availability,offering_kind,quantity_mode FROM products WHERE id=? AND business_id=? AND is_published=1 AND offering_kind<>'service' FOR SHARE",[item.productId,value.businessId])).rows[0];
   if(!product||!["available","limited"].includes(product.availability))throw new InquiryError("A selected product is not available.");
   const groups=(await runner.query<{id:number;name:string}>("SELECT id,name FROM option_groups WHERE product_id=? ORDER BY position,id",[item.productId])).rows;
   const names=new Set(groups.map(g=>g.name));
   if(Object.keys(item.options).some(k=>!names.has(k)))throw new InquiryError("A selected product option is not available.");
   const pairs:Array<[string,string]>=[];
   for(const group of groups){
    const selected=Object.hasOwn(item.options,group.name)?item.options[group.name]:"";
    const values=(await runner.query<{value:string}>("SELECT value FROM option_values WHERE option_group_id=?",[group.id])).rows;
    if(!selected||!values.some(v=>v.value===selected))throw new InquiryError("Choose all available product options.");
    pairs.push([group.name,selected]);
   }
   validated.push({productId:item.productId,quantityIntent:item.quantity,name:product.name,offeringKind:normalizeOfferingKind(product.offering_kind),quantityMode:normalizeQuantityMode(product.quantity_mode),options:Object.fromEntries(pairs)});
  }
  const inserted=await runner.query<{id:number}>("INSERT INTO inquiries(business_id,customer_name,contact,contact_method,note,status,source,idempotency_key,ip_hash,request_fingerprint,updated_at) VALUES(?,?,?,?,?,'new','showroom',?,?,?,CURRENT_TIMESTAMP) RETURNING id",[value.businessId,value.customerName,value.contact,"phone",value.note,value.idempotencyKey,ipHash,fingerprint]);
  const inquiryId=inserted.rows[0]?.id;if(!inquiryId)throw new Error("Missing inquiry identifier.");
  for(const item of validated)await runner.query("INSERT INTO inquiry_items(inquiry_id,product_id,product_name_snapshot,quantity,quantity_intent,offering_kind_snapshot,quantity_mode_snapshot,options_json) VALUES(?,?,?,?,?,?,?,?)",[inquiryId,item.productId,item.name,null,item.quantityIntent,item.offeringKind,item.quantityMode,JSON.stringify(item.options)]);
  await enqueueInquiryAttention(runner,value.businessId,inquiryId);
  return {inquiryId,duplicate:false};
 });
 if(!created.duplicate&&notify&&target)try{await notify(target,created.inquiryId,value.customerName);}catch{/* Delivery cannot undo a durable inquiry. */}
 return {...created,trapped:false};
}
