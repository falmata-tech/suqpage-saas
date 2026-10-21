import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,seedFixture,closeDbForTests} from './testing/postgres-fixture';
import {CatalogSafetyError,excludedBusinessIds,blockedBusinesses,listingReportCommand} from '../lib/catalog-safety';
import {submitListingReport,canReviewListings} from '../lib/listing-reports';
import {listingReportPort} from '../lib/listing-reports-postgres';
import {getMarketplaceDiscoveryView,getSponsoredShowrooms} from '../lib/discovery';
import {migratePostgresDatabase} from '../lib/postgres-migrations';
import type {SessionUser} from '../lib/types';
import {hashPrivateValue} from '../lib/security';
import {handleMobileRequest} from '../lib/mobile/router';
import {POST as reportHttp} from '../app/api/catalog/reports/route';
import {POST as preferenceHttp} from '../app/api/catalog/preferences/route';
async function main(){
  assert.deepEqual(excludedBusinessIds('4,2,4'),[2,4]);
  for(const v of [['1); DROP TABLE businesses'],[-1],[false],[1.5],Array(101).fill(1),[Number.MAX_SAFE_INTEGER+1]])assert.throws(()=>excludedBusinessIds(v),CatalogSafetyError);
  assert.deepEqual(blockedBusinesses([{id:1,handle:'@some-shop',name:'Some shop'}]),[{id:1,handle:'some-shop',name:'Some shop'}]);
  const db=await getDb();try{
    await seedFixture();
    const target=await db.prepare("SELECT p.id product_id,b.id business_id,b.handle FROM products p JOIN businesses b ON b.id=p.business_id WHERE b.status='active' AND p.is_published=1 ORDER BY p.id LIMIT 1").get();assert.ok(target);
    async function actor(name:string,role:SessionUser['access_role'],queue:SessionUser['staff_queue_scope']=null):Promise<SessionUser>{
      const id=Number((await db.prepare('INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,?,?,?,NULL,0)').run(name+'@example.test','fixture',name,role==='client'?'owner':'admin')).insertedId);
      await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
      if(role==='team_member')await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,max_open_conversations,updated_at) VALUES(?,1,?,8,0)').run(id,queue);
      return {id,email:name+'@example.test',name,role:role==='client'?'owner':'admin',access_role:role,business_id:null,must_change_password:0,staff_queue_scope:queue};
    }
    const admin=await actor('qa-safety-admin','platform_admin'),support=await actor('qa-safety-support','team_member','support'),transport=await actor('qa-safety-transport','team_member','transport'),owner=await actor('qa-safety-owner','client');
    assert.equal(canReviewListings(transport),false);assert.equal(canReviewListings(owner),false);
    const command={businessId:target.business_id,productId:target.product_id,reason:'Misleading listing',details:'LOCAL QA report details',idempotencyKey:crypto.randomUUID()};
    assert.throws(()=>listingReportCommand({...command,assignedUserId:admin.id}));
    const [first,second]=await Promise.all([submitListingReport(listingReportPort,command,hashPrivateValue('qa-ip')),submitListingReport(listingReportPort,command,hashPrivateValue('qa-ip'))]);
    assert.equal(first.receipt,second.receipt);assert.equal(Number(first.duplicate)+Number(second.duplicate),1);
    assert.equal((await db.prepare('SELECT count(*) total FROM content_reports').get()).total,1);
    assert.deepEqual(Object.keys(first).sort(),['duplicate','receipt']);
    await assert.rejects(()=>submitListingReport(listingReportPort,{...command,details:'Changed replay'},hashPrivateValue('qa-ip')),e=>e instanceof CatalogSafetyError&&e.status===409);
    const foreign=await db.prepare('SELECT id FROM products WHERE business_id<>? LIMIT 1').get(target.business_id);assert.ok(foreign);
    await assert.rejects(()=>submitListingReport(listingReportPort,{...command,productId:foreign.id,idempotencyKey:crypto.randomUUID()},hashPrivateValue('qa-foreign')),e=>e instanceof CatalogSafetyError&&e.status===404);
    await db.prepare('UPDATE products SET is_published=0 WHERE id=?').run(target.product_id);
    await assert.rejects(()=>submitListingReport(listingReportPort,{...command,idempotencyKey:crypto.randomUUID()},hashPrivateValue('qa-private')),e=>e instanceof CatalogSafetyError&&e.status===404);
    await db.prepare('UPDATE products SET is_published=1 WHERE id=?').run(target.product_id);
    for(const denied of [owner,transport]){await assert.rejects(()=>listingReportPort.list(denied,{}),e=>e instanceof CatalogSafetyError&&e.status===403);await assert.rejects(()=>listingReportPort.update(denied,{id:1,version:1,action:'claim'}),CatalogSafetyError);}
    await assert.rejects(()=>listingReportPort.list({...owner,access_role:'platform_admin'},{}),e=>e instanceof CatalogSafetyError&&e.status===403,'Forged/stale client actor cannot gain staff report access');
    let row=(await listingReportPort.list(support,{})).items[0];assert.equal(row.details,command.details);
    await assert.rejects(()=>listingReportPort.update(admin,{id:row.id,version:row.version,action:'assign',assignedUserId:transport.id}),CatalogSafetyError);
    await listingReportPort.update(admin,{id:row.id,version:row.version,action:'assign',assignedUserId:support.id});
    await assert.rejects(()=>listingReportPort.update(support,{id:row.id,version:row.version,action:'dismiss'}),e=>e instanceof CatalogSafetyError&&e.status===409);
    row=(await listingReportPort.list(support,{})).items[0];
    await assert.rejects(()=>listingReportPort.update(support,{id:row.id,version:row.version,action:'resolve'}),e=>e instanceof CatalogSafetyError&&e.status===409);
    await db.prepare('UPDATE products SET is_published=0 WHERE id=?').run(target.product_id);
    await listingReportPort.update(support,{id:row.id,version:row.version,action:'resolve'});
    assert.equal((await listingReportPort.list(support,{status:'resolved'})).items[0].status,'resolved');
    await db.prepare('UPDATE products SET is_published=1 WHERE id=?').run(target.product_id);
    for(const reason of ['Prohibited goods','Abusive content']){
      const details='LOCAL QA catalog policy '+reason;
      await submitListingReport(listingReportPort,{...command,reason,details,idempotencyKey:crypto.randomUUID()},hashPrivateValue('qa-policy-'+reason));
      let reported=(await listingReportPort.list(support,{status:'open'})).items.find(item=>item.reason===reason&&item.details===details);assert.ok(reported);
      await listingReportPort.update(support,{id:reported.id,version:reported.version,action:'claim'});
      reported=(await listingReportPort.list(support,{})).items.find(item=>item.id===reported!.id);assert.ok(reported);
      await assert.rejects(()=>listingReportPort.update(support,{id:reported!.id,version:reported!.version,action:'resolve'}),e=>e instanceof CatalogSafetyError&&e.status===409,'A policy report cannot be resolved while the listing remains public');
      await db.prepare('UPDATE products SET is_published=0 WHERE id=?').run(target.product_id);
      await listingReportPort.update(support,{id:reported.id,version:reported.version,action:'resolve'});
      assert.ok((await listingReportPort.list(support,{status:'resolved'})).items.some(item=>item.id===reported!.id&&item.reason===reason));
      await db.prepare('UPDATE products SET is_published=1 WHERE id=?').run(target.product_id);
    }
    for(let i=0;i<5;i++)await submitListingReport(listingReportPort,{...command,idempotencyKey:crypto.randomUUID()},hashPrivateValue('qa-rate'));
    await assert.rejects(()=>submitListingReport(listingReportPort,{...command,idempotencyKey:crypto.randomUUID()},hashPrivateValue('qa-rate')),e=>e instanceof CatalogSafetyError&&e.status===429);
    const all=await getMarketplaceDiscoveryView({industry:'all',type:'products'});
    const blocked=await getMarketplaceDiscoveryView({industry:'all',type:'products',excludedBusinessIds:[target.business_id]});
    assert.ok(all.showrooms.some(b=>b.id===target.business_id));assert.ok(!blocked.showrooms.some(b=>b.id===target.business_id));
    const removed=Number((await db.prepare('SELECT count(*) total FROM products WHERE business_id=? AND is_published=1').get(target.business_id)).total);
    assert.equal(all.resultCounts.products-blocked.resultCounts.products,removed);
    for(let page=1;page<=blocked.resultPage.totalPages;page++){
      const v=await getMarketplaceDiscoveryView({industry:'all',type:'products',page,excludedBusinessIds:[target.business_id]});assert.ok(v.searchProducts.every(p=>p.businessId!==target.business_id));assert.equal(v.resultCounts.products,blocked.resultCounts.products);
    }
    for(const q of ['lotion','lotoin','gras','Prairie Medows']){const v=await getMarketplaceDiscoveryView({industry:'all',type:'products',q,excludedBusinessIds:all.showrooms.map(b=>b.id)});assert.equal(v.resultPage.totalItems,0);assert.equal(v.showrooms.length,0);}
    const sponsors=await getSponsoredShowrooms({excludedBusinessIds:all.showrooms.map(b=>b.id)});assert.ok(sponsors.every(s=>s.kind==='external'));
    const httpCommand={...command,details:'LOCAL QA HTTP',idempotencyKey:crypto.randomUUID()};
    const post=(url:string,body:unknown,origin?:string)=>new Request(url,{method:'POST',headers:{'content-type':'application/json',...(origin?{origin}:{})},body:JSON.stringify(body)});
    const web=await reportHttp(post('http://127.0.0.1/api/catalog/reports',httpCommand));assert.equal(web.status,200);assert.deepEqual(Object.keys(await web.json()).sort(),['duplicate','receipt']);
    const native=await handleMobileRequest(post('http://127.0.0.1/api/mobile/v1/reports',{...httpCommand,idempotencyKey:crypto.randomUUID()}),['reports']);assert.equal(native.status,200);assert.deepEqual(Object.keys(await native.json()).sort(),['duplicate','receipt']);
    assert.equal((await reportHttp(post('http://127.0.0.1/api/catalog/reports',httpCommand,'https://foreign.example'))).status,403);
    assert.equal((await handleMobileRequest(post('http://127.0.0.1/api/mobile/v1/reports',{...httpCommand,productId:foreign.id,idempotencyKey:crypto.randomUUID()}),['reports'])).status,404);
    const preferences=await preferenceHttp(post('http://127.0.0.1/api/catalog/preferences',{blockedIds:[target.business_id]}));assert.equal(preferences.status,200);assert.ok(preferences.headers.get('set-cookie')?.includes('HttpOnly'));
    assert.equal((await preferenceHttp(post('http://127.0.0.1/api/catalog/preferences',{blockedIds:[true]}))).status,400);
    assert.equal((await preferenceHttp(post('http://127.0.0.1/api/catalog/preferences',{blockedIds:[]},'https://foreign.example'))).status,403);
    const mobileMarket=await handleMobileRequest(new Request('http://127.0.0.1/api/mobile/v1/market?exclude='+target.business_id),['market']);assert.equal(mobileMarket.status,200);const market=await mobileMarket.json();assert.equal(market.total,blocked.resultPage.totalItems);assert.ok(market.showrooms.every((v:{id:number})=>v.id!==target.business_id));
    const mobileFeatured=await handleMobileRequest(new Request('http://127.0.0.1/api/mobile/v1/featured?exclude='+all.showrooms.map(b=>b.id).join(',')),['featured']);assert.equal(mobileFeatured.status,200);const featured=await mobileFeatured.json();assert.ok(featured.slots.every((slot:{shop:unknown})=>slot.shop===null),'Blocked businesses must not remain in Featured');
    await assert.rejects(()=>submitListingReport(listingReportPort,command,'127.0.0.1'),CatalogSafetyError,'Raw IP is never accepted by the storage port');
    const schema=(await db.prepare('SELECT current_schema() name').get()).name;
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
    assert.equal((await db.prepare("SELECT relrowsecurity enabled FROM pg_class WHERE oid='content_reports'::regclass").get()).enabled,true);
    for(const role of ['anon','authenticated']){if(await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role)){assert.equal((await db.prepare("SELECT has_table_privilege(?,'content_reports','SELECT') allowed").get(role)).allowed,false);assert.equal((await db.prepare("SELECT has_sequence_privilege(?,'content_reports_id_seq','USAGE') allowed").get(role)).allowed,false);}}
    console.log('PASS catalog safety: real PostgreSQL report/replay/rate/role/assignment/stale/removal/private grants, blocked counts/all pages/fuzzy candidates and sponsorship.');
  }finally{await closeDbForTests();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
