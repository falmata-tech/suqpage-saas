import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests,getUserById,getCatalogByBusinessId} from './testing/postgres-fixture';
import {activeProductKinds,isActiveProductKind,isPublicProduct,productSupplyLabel,catalogOfferingLabel} from '../lib/offerings';
import {parseBasicProductCommand,ProductUpkeepError} from '../lib/product-upkeep-domain';
import {executeBasicProductUpkeep} from '../lib/product-upkeep';
import {postgresProductUpkeepPort} from '../lib/product-upkeep-postgres';
import {getMarketplaceDiscoveryView} from '../lib/discovery';
import {normalizeMarketSearch,readMarketSearch,marketSearchParams,validMarketFilterParams,MarketSearchError} from '../lib/market-search';
import {shopDto} from '../lib/mobile/projections';
import {initialBusinessProfile} from '../lib/business-profile';
import {ownerHome} from '../lib/mobile/owner';
import {handleMobileRequest} from '../lib/mobile/router';
import {linkedProduct,inquiryEligible,restoreInquiry,buildInquiryMessage,buildSocialInquiryMessage} from '../lib/product-inquiry';
import {publicationReadiness} from '../lib/publication-readiness';
import {pagePublicationPort} from '../lib/owner-page-publication-runtime';
import {catalogToRevisionSnapshotV4} from '../lib/revision-v4-defaults';
import {requireRevisionSnapshotV4} from '../lib/revision-v4-domain';
import {SHOWROOM_COMPONENT_BANK_LATEST} from '../lib/showroom-bank-release';
import {publishApprovedRevision} from '../lib/revision-service';
import type {SessionUser,Product} from '../lib/types';
import {GET as discoveryGET} from '../app/api/discovery/route';

async function main(){
 process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED='1';
 const db=await getDb();
 try{
  assert.deepEqual(activeProductKinds,['standard_product','made_to_order']);
  for(const kinds of [[],['service'],['service','standard_product'],['made_to_order','manufacturing_capability','production_supply']] as const)assert.equal(catalogOfferingLabel(kinds.map(offering_kind=>({offering_kind}))),'Products','Current catalog wording never advertises retired services');
  for(const kind of ['service','manufacturing_capability','production_supply','unknown','',null])assert.equal(isActiveProductKind(kind),false);
  for(const kind of ['standard_product','made_to_order','manufacturing_capability','production_supply'])assert.equal(isPublicProduct({offering_kind:kind}),true);
  assert.equal(isPublicProduct({offering_kind:'service'}),false);assert.equal(isPublicProduct({offering_kind:'unknown'}),false);
  assert.equal(productSupplyLabel('standard_product','available'),'Ready to ship');assert.equal(productSupplyLabel('made_to_order','available'),'Made to order');
  assert.equal(productSupplyLabel('manufacturing_capability','available'),'Available');assert.equal(productSupplyLabel('production_supply','available'),'Available');
  for(const kind of ['standard_product','made_to_order','manufacturing_capability','production_supply']){
   for(const status of ['limited','unavailable','coming_soon'])assert.notEqual(productSupplyLabel(kind,status),'Ready to ship');
  }
  assert.equal(productSupplyLabel('made_to_order','limited'),'Limited capacity');assert.equal(productSupplyLabel('made_to_order','unavailable'),'Not accepting orders');
  assert.equal(productSupplyLabel('unknown','available'),'Unavailable');
  for(const raw of [true,'true','1'])assert.equal(normalizeMarketSearch({madeToOrder:raw}).madeToOrder,true);
  for(const raw of [undefined,false,'false','0'])assert.equal(normalizeMarketSearch({madeToOrder:raw}).madeToOrder,false);
  for(const raw of ['','TRUE','2','yes'])assert.throws(()=>normalizeMarketSearch({madeToOrder:raw}),MarketSearchError);
  assert.equal(normalizeMarketSearch({offeringType:'products'}).madeToOrder,false);
  assert.throws(()=>normalizeMarketSearch({offeringType:'services'}),MarketSearchError);
  const search=normalizeMarketSearch({q:'basket',madeToOrder:true,country:'ET',city:'ET:Town A'});
  assert.deepEqual(readMarketSearch(marketSearchParams('products',search)),search);
  assert.equal(marketSearchParams('businesses',search).has('madeToOrder'),false,'Product order filters never serialize into map criteria');
  for(const query of ['madeToOrder=yes','madeToOrder=true&madeToOrder=false','offeringType=services']){
   assert.equal(validMarketFilterParams(new URLSearchParams(query)),false);
   assert.equal((await discoveryGET(new Request('http://localhost/api/discovery?scope=products&'+query))).status,400);
  }

  async function business(handle:string,country='ET',city='Town A',state='active'){
   const id=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition',?)").run(handle,handle,state)).insertedId;
   await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,country_code,city_id,latitude,longitude,approved_at,updated_at) VALUES(?,?,'','',?,?,9,38,1,1)").run(id,city,country,'city-'+id);
   await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'fashion-textiles')").run(id);
   return id;
  }
  async function actor(email:string,role:SessionUser['access_role'],businessId:number|null=null){
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused',?,'admin',?)").run(email,email,businessId)).insertedId;
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   return (await getUserById(id))!;
  }
  const id=await business('product-only-fixture'),serviceOnly=await business('retired-only-fixture','SO','Private service city'),foreignId=await business('other-product-fixture','KE','Other town');
  const owner=await actor('product-only@example.test','client',id),foreign=await actor('other-product@example.test','client',foreignId),manager=await actor('product-manager@example.test','operations_manager');
  async function item(businessId:number,name:string,kind:Product['offering_kind'],published=1){
   return (await db.prepare("INSERT INTO products(business_id,name,slug,description,offering_kind,is_published,capacity_summary,quantity_unit) VALUES(?,?,?,?,?,?,'Retained capacity','piece')").run(businessId,name,name.toLowerCase().replaceAll(' ','-'),'A tangible catalog fixture for '+name,kind,published)).insertedId;
  }
  const ready=await item(id,'Red scarf','standard_product'),custom=await item(id,'Woven basket','made_to_order'),legacy=await item(id,'Custom desk','manufacturing_capability'),supply=await item(id,'Harvest box','production_supply'),retired=await item(id,'Satinlamp repair','service'),hidden=await item(id,'Hidden basket','made_to_order',0);
  const section=async(name:string)=>{
   const collection=(await db.prepare('INSERT INTO collections(business_id,name,slug) VALUES(?,?,?)').run(id,name,name.toLowerCase().replaceAll(' ','-'))).insertedId;
   const category=(await db.prepare('INSERT INTO categories(business_id,collection_id,name,slug) VALUES(?,?,?,?)').run(id,collection,name,name.toLowerCase().replaceAll(' ','-'))).insertedId;
   return {collection,category};
  };
  const retiredSection=await section('Retired diagnostics'),emptySection=await section('Empty story'),mixedSection=await section('Mixed collection');
  await db.prepare('UPDATE products SET collection_id=?,category_id=? WHERE id=?').run(retiredSection.collection,retiredSection.category,retired);
  await db.prepare('UPDATE products SET collection_id=?,category_id=? WHERE id=?').run(mixedSection.collection,mixedSection.category,ready);
  const mixedService=await item(id,'Mixed consultation','service');await db.prepare('UPDATE products SET collection_id=?,category_id=? WHERE id=?').run(mixedSection.collection,mixedSection.category,mixedService);
  await item(serviceOnly,'Satinlamp repair appointment','service');
  const privateCatalog=(await getCatalogByBusinessId(id,true))!,publicCatalog=(await getCatalogByBusinessId(id))!;
  assert.deepEqual(publicCatalog.products.map(p=>p.id).sort(),[ready,custom,legacy,supply].sort());assert.equal(privateCatalog.products.length,7);
  assert.deepEqual(publicCatalog.collections.map(c=>c.id).sort(),[emptySection.collection,mixedSection.collection].sort());assert.deepEqual(publicCatalog.categories.map(c=>c.id).sort(),[emptySection.category,mixedSection.category].sort());
  assert.equal(privateCatalog.collections.length,3);assert.equal(privateCatalog.categories.length,3,'Private metadata and deliberately empty public sections remain intact');
  assert.equal(shopDto(privateCatalog,initialBusinessProfile(privateCatalog)).products.length,4,'Public DTO defends against a private catalog input');
  assert.equal(shopDto(privateCatalog,initialBusinessProfile(privateCatalog),true).products.length,7,'Authorized owner management retains old records');
  assert.equal((await ownerHome({...owner,business_id:id})).activity.products,4);
  const retiredProduct=privateCatalog.products.find(p=>p.id===retired)!;
  assert.equal(linkedProduct(privateCatalog,String(retired)),null);assert.equal(linkedProduct(privateCatalog,String(hidden)),null);assert.equal(inquiryEligible(retiredProduct),false);
  assert.deepEqual(restoreInquiry(privateCatalog,[{productId:retired,quantity:'1',options:{}},{productId:custom,quantity:'2',options:{}}]).map(line=>line.product.id),[custom]);
  assert.doesNotMatch(buildInquiryMessage(privateCatalog.business,[{product:retiredProduct,quantity:'1',options:{}}],'https://suqpage.com'),/Satinlamp/);
  assert.doesNotMatch(buildSocialInquiryMessage(privateCatalog.business,[{id:retired,name:'Satinlamp repair',quantity:'1',options:{},service:true}],'https://suqpage.com'),/Satinlamp/);
  const defaultProducts=await getMarketplaceDiscoveryView({scope:'products'});
  assert.equal(defaultProducts.resultPage.totalItems,4);assert.equal(defaultProducts.searchProducts.length,4);
  assert.ok(defaultProducts.searchProducts.every(p=>p.offeringKind!=='service'&&p.availability==='available'));
  assert.deepEqual(defaultProducts.countries?.map(c=>c.code),['ET']);assert.equal(defaultProducts.places.length,1,'Service-only pages cannot add public location metadata');
  const map=await getMarketplaceDiscoveryView({scope:'businesses'});assert.deepEqual(map.showrooms.map(b=>b.id),[id]);
  const customOnly=await getMarketplaceDiscoveryView({scope:'products',madeToOrder:true,country:'ET',city:'ET:Town A',industry:'fashion-textiles'});
  assert.deepEqual(customOnly.searchProducts.map(p=>p.id),[custom]);assert.equal(customOnly.resultPage.totalItems,1);
  assert.equal((await getMarketplaceDiscoveryView({scope:'products',madeToOrder:true,country:'KE'})).resultPage.totalItems,0);
  assert.equal((await getMarketplaceDiscoveryView({scope:'products',madeToOrder:true,q:'baslet'})).searchProducts[0]?.id,custom,'Bounded typo fallback respects made-to-order admission');
  for(const scope of ['products','businesses'] as const)assert.equal((await getMarketplaceDiscoveryView({scope,q:'Satinlmp repair'})).resultPage.totalItems,0,'Retired services cannot seed typo products or map results');
  const legacySearch=await getMarketplaceDiscoveryView({q:'Satinlmp repair',type:'products'});assert.equal(legacySearch.resultPage.totalItems,0);assert.deepEqual(legacySearch.suggestions,[]);
  await assert.rejects(()=>getMarketplaceDiscoveryView({offeringType:'services'}),MarketSearchError);
  const api=async(query:string)=>handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/market?'+query),['market']);
  const wire=await api('scope=products&madeToOrder=1&country=ET');assert.equal(wire.status,200);const body=await wire.json();assert.equal(body.total,1);assert.equal(body.items[0].id,custom);assert.equal(body.items[0].offeringKind,'made_to_order');assert.equal(body.items[0].availability,'available');
  for(const query of ['scope=products&offeringType=services','scope=products&madeToOrder=yes','madeToOrder=2'])assert.equal((await api(query)).status,400);
  const publicShop=await handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/shops/product-only-fixture'),['shops','product-only-fixture']);assert.equal(publicShop.status,200);assert.equal((await publicShop.json()).products.length,4);

  const base=(productId:number|null,version:number)=>({kind:productId?'update':'create',businessId:id,productId,expectedContentVersion:version,idempotencyKey:crypto.randomUUID(),name:'Physical fixture',description:'A physical fixture product.',availability:'available',quantityMode:'optional',capacitySummary:'',minimumOrderSummary:'',leadTimeSummary:'',priceMinor:null,quantityUnit:'',highlights:[],videoRef:'',categoryId:null,imageAction:'keep',serviceNote:'',preserveMetadata:true});
  assert.equal(parseBasicProductCommand(base(null,1)).offeringKind,'standard_product');
  const rowsBefore=await db.prepare('SELECT id,offering_kind,description FROM products ORDER BY id').all();
  for(const kind of ['service','unknown','manufacturing_capability','production_supply',''])await assert.rejects(()=>executeBasicProductUpkeep(postgresProductUpkeepPort,owner,{...base(ready,1),offeringKind:kind},null),error=>error instanceof ProductUpkeepError&&error.code==='invalid_product_kind');
  await assert.rejects(()=>executeBasicProductUpkeep(postgresProductUpkeepPort,owner,{...base(ready,1),preserveOfferingKind:true},null),error=>error instanceof ProductUpkeepError&&error.code==='unsupported_fields');
  await assert.rejects(()=>executeBasicProductUpkeep(postgresProductUpkeepPort,owner,base(retired,1),null),error=>error instanceof ProductUpkeepError&&error.code==='invalid_product_kind');
  assert.deepEqual(await db.prepare('SELECT id,offering_kind,description FROM products ORDER BY id').all(),rowsBefore,'Rejected kinds never mutate retained records');
  assert.equal((await db.prepare('SELECT content_version FROM businesses WHERE id=?').get(id)).content_version,1);
  const legacySave=base(legacy,1);await executeBasicProductUpkeep(postgresProductUpkeepPort,owner,legacySave,null);assert.equal((await db.prepare('SELECT offering_kind,capacity_summary FROM products WHERE id=?').get(legacy)).offering_kind,'manufacturing_capability');
  assert.equal((await executeBasicProductUpkeep(postgresProductUpkeepPort,owner,legacySave,null)).duplicate,true);
  await assert.rejects(()=>executeBasicProductUpkeep(postgresProductUpkeepPort,foreign,{...base(ready,2),offeringKind:'made_to_order'},null),error=>error instanceof ProductUpkeepError&&error.code==='forbidden');
  await assert.rejects(()=>executeBasicProductUpkeep(postgresProductUpkeepPort,owner,{...base(ready,1),offeringKind:'made_to_order'},null),error=>error instanceof ProductUpkeepError&&error.code==='stale_version');
  const converted=await executeBasicProductUpkeep(postgresProductUpkeepPort,owner,{...base(retired,2),offeringKind:'made_to_order'},null);assert.equal(converted.productId,retired);
  assert.equal((await db.prepare('SELECT offering_kind,capacity_summary FROM products WHERE id=?').get(retired)).offering_kind,'made_to_order');
  assert.equal((await db.prepare('SELECT capacity_summary FROM products WHERE id=?').get(retired)).capacity_summary,'Retained capacity');
  const newItem=await executeBasicProductUpkeep(postgresProductUpkeepPort,owner,base(null,3),null);assert.equal((await db.prepare('SELECT offering_kind FROM products WHERE id=?').get(newItem.productId)).offering_kind,'standard_product');
  const retainedSnapshot=JSON.parse((await db.prepare('SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=1').get(id)).snapshot_json);
  assert.ok(retainedSnapshot.products.some((p:{offeringKind:string})=>p.offeringKind==='service'),'Retained publication history is never reclassified');
  assert.ok(requireRevisionSnapshotV4(retainedSnapshot,SHOWROOM_COMPONENT_BANK_LATEST).products.some(p=>p.offeringKind==='service'));

  const draftId=await business('retired-draft-fixture','KE','Draft city','draft');await item(draftId,'Retired-only consultation','service');assert.equal(await pagePublicationPort.publishable(draftId),false);
  const content=initialBusinessProfile(privateCatalog);assert.equal(publicationReadiness({...content,about:'A real business description.'},[retiredProduct],true).find(check=>check.key==='offerings')?.ready,false);
  const current=(await getCatalogByBusinessId(id,true))!,revisionSnapshot=catalogToRevisionSnapshotV4(current);revisionSnapshot.products[0].offeringKind='service';
  const requestId=(await db.prepare("INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id) VALUES('REQ-PRODUCT-ONLY',?,?,'change','in_progress','Fixture owner','owner@example.test','Fixture','Product-only publication','client',?)").run(id,owner.id,owner.id)).insertedId;
  const revisionId=(await db.prepare("INSERT INTO content_revisions(request_id,business_id,revision_number,base_content_version,status,snapshot_json,snapshot_schema_version,created_by_user_id) VALUES(?,?,1,?,'approved',?,4,?)").run(requestId,id,current.business.content_version,JSON.stringify(revisionSnapshot),manager.id)).insertedId;
  const beforeRevision=await db.prepare('SELECT id,offering_kind,name FROM products ORDER BY id').all();
  await assert.rejects(()=>publishApprovedRevision(manager,revisionId),/Choose Ready to ship or Made to order/);
  assert.deepEqual(await db.prepare('SELECT id,offering_kind,name FROM products ORDER BY id').all(),beforeRevision,'Rejected revision cannot replace products or IDs');assert.equal((await db.prepare('SELECT status FROM content_revisions WHERE id=?').get(revisionId)).status,'approved');
  console.log('PASS product-only active kinds, honest supply labels, retired/history preservation, tenant/version/idempotency guards, explicit conversion, public catalogs/DTO/details/social exclusion, exact/count/fuzzy/geography filters, web/native validation, owner metrics and publication admission.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
