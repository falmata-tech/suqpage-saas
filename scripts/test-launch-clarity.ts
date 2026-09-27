import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { getDb, getUserById, closeDbForTests } from './testing/postgres-fixture';
import { createPublicClientWorkspace } from '../lib/signup';
import { ownerPagePort } from '../lib/owner-page-runtime';
import { changePagePublication } from '../lib/owner-page-publication';
import { pagePublicationPort } from '../lib/owner-page-publication-runtime';
import { saveOwnerPageAndPublication } from '../lib/owner-page-save-runtime';
import { firstPublicationIssues } from '../lib/publication-readiness-runtime';
import { saveOwnerBusiness } from '../lib/owner-business-runtime';
import { findPlaceSuggestions } from '../lib/place-catalog';
import { updateInquiryStatus } from '../lib/inquiry-status-runtime';
import { inquiryContactLinks } from '../lib/inquiry-contact-links';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { getMarketplaceDiscoveryView } from '../lib/discovery';

async function main() {
  const db = await getDb();
  try {
    const create = async (email:string) => {
      const workspace = await createPublicClientWorkspace({name:'Fixture owner',businessName:'Demo named real business',businessCategory:'electronics',phone:'+251911234567',consent:true,idempotencyKey:randomUUID()}, {providerUserId:randomUUID(),email});
      return (await getUserById(workspace.userId))!;
    };
    const owner = await create('launch-owner@example.test');
    const foreign = await create('other-launch-owner@example.test');
    const businessId = owner.business_id!;
    assert.equal((await db.prepare('SELECT is_demo FROM businesses WHERE id=?').get(businessId)).is_demo,0,'A real signup is never classified from its name');
    let draft = (await ownerPagePort.read(businessId))!;
    const publish = () => changePagePublication(ownerPagePort,pagePublicationPort,owner,businessId,{action:'publish',version:draft.version,revision:0});
    assert.deepEqual((await firstPublicationIssues(businessId,draft.content)).map(x=>x.key),['about','contacts','location','offerings']);
    await assert.rejects(publish,/Describe your business/);
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM owner_page_publications WHERE business_id=?').get(businessId)).n,0);
    draft = await saveOwnerPageAndPublication(owner,businessId,{action:'save',version:draft.version,content:{...draft.content,heroImage:'',about:'We repair household electronics.',contacts:{phone:'+251911234567'}}});
    await assert.rejects(publish,/Choose your business location/);
    const place = findPlaceSuggestions('Addis Ababa')[0];
    await saveOwnerBusiness(owner,businessId,{name:'Launch repair shop',expectedVersion:1,locationVersion:1,category:'electronics',city:place.name,region:place.region,placeId:place.id,mode:'area'});
    await assert.rejects(publish,/Replace or remove sample offerings/);
    await db.prepare('UPDATE products SET is_published=0 WHERE business_id=?').run(businessId);
    assert.equal((await firstPublicationIssues(businessId,draft.content)).some(x=>x.key==='offerings'),true,'At least one real offering is needed');
    await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,'Radio repair','radio-repair','Repair radios and small speakers.',1)").run(businessId);
    await assert.rejects(()=>changePagePublication(ownerPagePort,pagePublicationPort,foreign,businessId,{action:'publish',version:draft.version,revision:0}),/Only the owner/);
    assert.deepEqual(await firstPublicationIssues(businessId,draft.content),[]);
    await publish();
    assert.equal((await db.prepare('SELECT status FROM businesses WHERE id=?').get(businessId)).status,'active');
    const saved = await saveOwnerPageAndPublication(owner,businessId,{action:'save',version:draft.version,content:{...draft.content,about:'We repair radios and speakers.'}});
    assert.equal(saved.publication?.content?.about,'We repair radios and speakers.','Live Save remains immediate');
    assert.deepEqual(await firstPublicationIssues(businessId,{...draft.content,about:''}),[],'Existing active businesses retain their save contract');

    const inquiryId = Number((await db.prepare("INSERT INTO inquiries(business_id,customer_name,contact,contact_method,status,idempotency_key) VALUES(?,'Fixture customer','+251911234567','phone','new','launch-owner-inquiry')").run(businessId)).insertedId);
    await updateInquiryStatus(owner,{businessId,inquiryId,status:'contacted'});
    assert.equal((await db.prepare('SELECT status FROM inquiries WHERE id=?').get(inquiryId)).status,'contacted');
    assert.equal((await db.prepare("SELECT user_id FROM audit_logs WHERE action='inquiry.status_updated' AND business_id=?").get(businessId)).user_id,owner.id);
    for (const actor of [foreign,{...owner,access_role:'team_member' as const}]) await assert.rejects(()=>updateInquiryStatus(actor,{businessId,inquiryId,status:'closed'}),/access required/);
    await assert.rejects(()=>updateInquiryStatus(owner,{businessId:foreign.business_id!,inquiryId,status:'closed'}),/access required/);
    assert.equal((await db.prepare('SELECT status FROM inquiries WHERE id=?').get(inquiryId)).status,'contacted');
    assert.deepEqual(inquiryContactLinks('phone','+251 911 234 567').map(x=>x.href),['tel:+251911234567','sms:+251911234567']);
    assert.equal(inquiryContactLinks('email','owner+shop@example.test')[0]?.href,'mailto:owner%2Bshop%40example.test');
    for(const value of ['javascript:alert(1)','123','+251911234567?body=bad']) assert.deepEqual(inquiryContactLinks('phone',value),[]);
    assert.deepEqual(inquiryContactLinks('email','a@example.test?bcc=b@example.test'),[]);

    // Replay only the additive demo migration in this disposable test schema.
    const demoId = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status,is_live,live_platform,live_url) VALUES('renamed-fixture','Demo fixture','composition','active',1,'tiktok','https://www.tiktok.com/@fixture/live')").run()).insertedId);
    await db.prepare("INSERT INTO business_handles(handle,business_id) VALUES('selam-weave',?)").run(demoId);
    await db.exec('ALTER TABLE businesses DROP COLUMN is_demo; DELETE FROM schema_migrations WHERE version=52;');
    const schema = (await db.prepare('SELECT current_schema() name').get()).name as string;
    assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[52]);
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
    assert.equal((await db.prepare('SELECT is_demo FROM businesses WHERE id=?').get(demoId)).is_demo,1,'Retained seeded handle survives a rename');
    assert.equal((await db.prepare('SELECT is_demo FROM businesses WHERE id=?').get(businessId)).is_demo,0);
    await db.prepare(`INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at) VALUES(?,'Addis Ababa','Addis Ababa','Addis Ababa',9,38,1,1)`).run(demoId);
    await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'electronics')").run(demoId);
    await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,'Fixture item','fixture-item','Test offering',1)").run(demoId);
    const market = await getMarketplaceDiscoveryView({q:'Demo fixture',type:'businesses'});
    const demo = market.searchBusinesses.find(item=>item.id===demoId);
    assert.ok(demo); assert.equal(demo.isDemo,true); assert.equal(demo.isLive,false,'A seeded live flag never advertises a real broadcast');
    console.log('PASS first publication sample checks, real owner save, cross-tenant inquiry denial and audit, safe contact links, explicit demo migration and public projection.');
  } finally { await closeDbForTests(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
