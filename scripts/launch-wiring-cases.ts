import { listBusinessesPage } from "../lib/scalable-queries";
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { executeBasicProductUpkeep, type BasicProductUpkeepPort } from '../lib/product-upkeep';
import { parseProductOptions } from '../lib/product-upkeep-domain';
import { parseOwnerBusinessChange } from '../lib/owner-business-domain';
import { readOwnerBusiness,saveOwnerBusiness,readLocationProposal } from '../lib/owner-business-runtime';
import { updateDiscoveryProfile } from '../lib/discovery-admin';
import { runtimeCatalogByBusinessId } from '../lib/catalog-runtime';
import { runtimeGet,runtimeRun } from '../lib/runtime-sql';
import { createPublicInquiry } from '../lib/inquiries';
import type { SessionUser } from '../lib/types';

export async function launchWiringCases(port:BasicProductUpkeepPort,owner:SessionUser,foreign:SessionUser,command:Record<string,unknown>,productId:number){
 const bid=owner.business_id!;
 for(const raw of [[{name:'Color',values:[]}],[{name:'Color',values:['Blue','blue']}],[{name:'Color',values:['Blue']},{name:'color',values:['Red']}],Array.from({length:5},(_,i)=>({name:String(i),values:['A']})),[{name:'X',values:['a'],unknown:true}]])assert.throws(()=>parseProductOptions(raw));
 const options=[{name:'Color',values:['Blue','Black']},{name:'Size',values:['Small','Large']}];
 const current=async()=>(await runtimeCatalogByBusinessId(bid,true))!;
 const save=async(extra:Record<string,unknown>)=>executeBasicProductUpkeep(port,owner,{...command,kind:'update',productId,imageAction:'keep',expectedContentVersion:(await current()).business.content_version,idempotencyKey:randomUUID(),...extra},null);
 await save({optionGroups:options,isPublished:false});
 let product=(await current()).products.find(p=>p.id===productId)!;assert.equal(product.is_published,0);assert.deepEqual(product.option_groups!.map(g=>({name:g.name,values:g.values.map(v=>v.value)})),options);
 const ids=product.option_groups!.map(g=>g.id);
 await save({name:'Renamed fixture product'});product=(await current()).products.find(p=>p.id===productId)!;assert.deepEqual(product.option_groups!.map(g=>g.id),ids);assert.equal(product.is_published,0,'omitted visibility preserves hidden state');
 await save({optionGroups:options,isPublished:true});assert.deepEqual((await current()).products.find(p=>p.id===productId)!.option_groups!.map(g=>g.id),ids,'unchanged options retain identities');
 await assert.rejects(()=>executeBasicProductUpkeep(port,foreign,{...command,kind:'update',productId,imageAction:'keep',idempotencyKey:randomUUID(),optionGroups:options},null),/cannot maintain/);

 const setup=await readOwnerBusiness(owner,bid);
 const proposed={name:'Launch fixture shop',expectedVersion:setup.business.content_version,locationVersion:0,category:'electronics',city:'Addis Ababa',region:'Addis Ababa',mode:'storefront',latitude:9.01234,longitude:38.76543};
 await assert.rejects(()=>saveOwnerBusiness(foreign,bid,proposed),/Only the owner/);
 await saveOwnerBusiness(owner,bid,proposed);
 await assert.rejects(()=>saveOwnerBusiness(owner,bid,proposed),/changed/);
 assert.equal((await readLocationProposal(bid))?.version,1);
 assert.ok((await listBusinessesPage({location:'pending',q:'Launch fixture shop'})).items.some(row=>row.id===bid));
 const approval={businessId:bid,proposalVersion:1,industryKeys:['electronics'],boothImagePath:'',city:'Addis Ababa',zone:'Addis Ababa',region:'Addis Ababa',latitude:9.01234,longitude:38.76543,fallbackStyle:'technical',productionScale:'workshop',sponsored:false,sponsorPosition:100,excluded:false};
 await updateDiscoveryProfile(approval);
 assert.ok((await runtimeGet<{approved_at:number}>('SELECT approved_at FROM business_discovery_profiles WHERE business_id=?',[bid]))!.approved_at>0);
 const area={...proposed,mode:'area',expectedVersion:(await current()).business.content_version,locationVersion:1};
 assert.equal(parseOwnerBusinessChange(area).location?.latitude,null,'area mode discards submitted precise coordinates');
 await saveOwnerBusiness(owner,bid,area);
 assert.equal((await readLocationProposal(bid))?.latitude,null);assert.equal((await readLocationProposal(bid))?.longitude,null);
 assert.equal((await runtimeGet<{approved_at:number}>('SELECT approved_at FROM business_discovery_profiles WHERE business_id=?',[bid]))!.approved_at,0);
 await assert.rejects(()=>updateDiscoveryProfile(approval),/owner changed/);
 await updateDiscoveryProfile({...approval,proposalVersion:2});
 const location=await runtimeGet<{latitude:number;longitude:number}>('SELECT latitude,longitude FROM business_discovery_profiles WHERE business_id=?',[bid]);assert.equal(location?.latitude,9);assert.equal(location?.longitude,38.8);
 assert.equal((await readLocationProposal(bid))?.reviewed_version,2);
 assert.ok(!(await listBusinessesPage({location:'pending',q:'Launch fixture shop'})).items.some(row=>row.id===bid));

 // A local fixture has no notification destination, so valid inbox writes cannot send email.
 const before=await runtimeGet<{status:string;contact_email:string}>('SELECT status,contact_email FROM businesses WHERE id=?',[bid]);
 await runtimeRun("UPDATE businesses SET status='active',contact_email='' WHERE id=?",[bid]);
 const input={businessId:bid,customerName:'Fixture buyer',contact:'+447700900999',contactMethod:'phone',items:[{productId,options:{Color:'Blue',Size:'Small'}}],idempotencyKey:randomUUID()};
 const inquiry=await createPublicInquiry(input,randomUUID());assert.ok(inquiry.inquiryId);
 await assert.rejects(()=>createPublicInquiry({...input,idempotencyKey:randomUUID(),items:[{productId,options:{Color:'Invalid',Size:'Small'}}]},randomUUID()),/option|Choose|selection/i);
 await save({isPublished:false});
 await assert.rejects(()=>createPublicInquiry({...input,idempotencyKey:randomUUID()},randomUUID()),/not found|unavailable|available/i);
 assert.ok(!(await runtimeCatalogByBusinessId(bid))!.products.some(p=>p.id===productId));
 await save({isPublished:true});
 await runtimeRun('UPDATE businesses SET status=?,contact_email=? WHERE id=?',[before!.status,before!.contact_email,bid]);
 console.log('PASS product option/visibility persistence, stable option IDs, canonical inquiry validation, owner identity/location scope, stale proposal denial, immediate privacy removal and coarse area approval.');
}
