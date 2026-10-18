import {findPlaceSuggestions} from '../lib/place-catalog';
import { launchWiringCases } from "./launch-wiring-cases";
import assert from 'node:assert/strict';
import { createClientInvitation } from '../lib/invitations';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { postgresRuntimeServices,closePostgresRuntimeForTests } from '../lib/postgres-runtime-services';
import { createPostgresPublicClientWorkspace } from '../lib/signup-postgres';
import { runtimeCatalogByBusinessId,runtimeUserById } from '../lib/catalog-runtime';
import { initialBusinessProfile } from '../lib/business-profile';
import { ownerPagePort } from '../lib/owner-page-runtime';
import { startOwnerPage,saveOwnerPage,readOwnerPage,setOwnerPageAssistance } from '../lib/owner-page-service';
import { pageReviewPort } from '../lib/page-review-runtime';
import { submitPageReview,decidePageReview } from '../lib/page-review';
import { runtimePublishedPage } from '../lib/owner-page-publication-runtime';
import { changePagePublication } from '../lib/owner-page-publication';
import { pagePublicationPort } from '../lib/owner-page-publication-runtime';
import { executeBasicProductUpkeep } from '../lib/product-upkeep';
import { postgresProductUpkeepPort } from '../lib/product-upkeep-postgres';
import { changeProductCategory,type CategoryChange } from '../lib/product-categories';
import { setBusinessAssignment } from '../lib/business-assistance';
import { stageTenantProductImage,readTenantProductImage } from '../lib/tenant-product-media';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import type { SessionUser } from '../lib/types';
import type { StagedImage } from '../lib/media';
import {getDb,closeDbForTests} from './testing/postgres-fixture';

async function categorySecurity(){
 const db=await getDb();
 try{
  const businessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('category-security','Category security fixture','composition')").run()).insertedId);
  const foreignId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('category-security-foreign','Foreign category fixture','composition')").run()).insertedId);
  async function account(name:string,role:SessionUser['access_role'],tenant:number|null=null,scope?:'all'|'support'|'transport'){
   const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused',?,'admin',?)").run(name+'@example.test',name,tenant)).insertedId);
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,updated_by_user_id,updated_at,queue_scope) VALUES(?,1,?,1,?)').run(id,id,scope);
   return (await runtimeUserById(id))!;
  }
  const admin=await account('Admin','platform_admin'),owner=await account('Owner','client',businessId),foreign=await account('Foreign owner','client',foreignId);
  const generic=await account('Generic editor','team_member'),genericAll=await account('Generic all editor','team_member',null,'all'),support=await account('Support agent','team_member',null,'support'),transport=await account('Transport agent','team_member',null,'transport');
  // Deliberately reproduce historical associations only inside this disposable schema.
  for(const staff of [generic,genericAll,support,transport])await db.prepare('INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,1)').run(staff.id,businessId,admin.id);
  await changeProductCategory(owner,{kind:'create',businessId,name:'Owner category',slug:'owner-category'});
  const category=await db.prepare('SELECT id FROM categories WHERE business_id=?').get(businessId);
  const foreignCategory=Number((await db.prepare("INSERT INTO categories(business_id,name,slug,sort_order,is_active) VALUES(?,'Foreign category','foreign-category',0,1)").run(foreignId)).insertedId);
  const productId=Number((await db.prepare("INSERT INTO products(business_id,category_id,name,slug) VALUES(?,?,'Fixture product','fixture-product')").run(businessId,category.id)).insertedId);
  const commands:CategoryChange[]=[{kind:'create',businessId,name:'Denied create',slug:'denied-create'},{kind:'update',businessId,id:category.id,name:'Denied update',slug:'denied-update',active:false},{kind:'delete',businessId,id:category.id}];
  const snapshot=async()=>({categories:await db.prepare('SELECT id,business_id,name,slug,sort_order,is_active FROM categories ORDER BY id').all(),products:await db.prepare('SELECT id,business_id,category_id FROM products ORDER BY id').all(),versions:await db.prepare('SELECT id,content_version FROM businesses ORDER BY id').all(),audits:await db.prepare('SELECT id,business_id,action FROM audit_logs ORDER BY id').all()});
  async function denied(actor:SessionUser){const before=await snapshot();for(const command of commands)await assert.rejects(()=>changeProductCategory(actor,command),/access/);assert.deepEqual(await snapshot(),before,'Denied category commands preserve rows, product relations, versions and audit history');}
  await denied(foreign);
  for(const agent of [support,transport]){
   await denied(agent);
   await denied({...agent,staff_queue_scope:'all'});
   await denied({...agent,access_role:'platform_admin'});
  }
  const beforeForeign=await snapshot();for(const kind of ['update','delete'] as const)await assert.rejects(()=>changeProductCategory(owner,{kind,businessId,id:foreignCategory,name:'Foreign mutation',slug:'foreign-mutation'}),/not found/);assert.deepEqual(await snapshot(),beforeForeign);
  for(const actor of [generic,genericAll]){
   await changeProductCategory(actor,{kind:'create',businessId,name:'Assigned '+actor.id,slug:'assigned-'+actor.id});
   await changeProductCategory(actor,{kind:'update',businessId,id:category.id,name:'Assigned update',slug:'owner-category',active:true});
   const assignedCategory=await db.prepare('SELECT id FROM categories WHERE business_id=? AND slug=?').get(businessId,'assigned-'+actor.id);
   await changeProductCategory(actor,{kind:'delete',businessId,id:assignedCategory.id});
  }
  await db.prepare('UPDATE staff_business_assignments SET active=0 WHERE user_id=? AND business_id=?').run(generic.id,businessId);await denied(generic);
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(genericAll.id);await denied(genericAll);
  const beforeAudit=await snapshot();
  await db.exec("CREATE FUNCTION reject_category_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture category audit unavailable'; END $$; CREATE TRIGGER reject_category_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_category_audit()");
  await assert.rejects(()=>changeProductCategory(owner,{kind:'update',businessId,id:category.id,name:'Audit rollback',slug:'owner-category',active:false}),/fixture category audit unavailable/);assert.deepEqual(await snapshot(),beforeAudit);
  await db.exec('DROP TRIGGER reject_category_audit ON audit_logs; DROP FUNCTION reject_category_audit()');
  await changeProductCategory(owner,{kind:'delete',businessId,id:category.id});
  assert.equal((await db.prepare('SELECT category_id FROM products WHERE id=?').get(productId)).category_id,null,'Authorized deletion preserves the product without its category');
  assert.equal((await db.prepare('SELECT name FROM categories WHERE id=?').get(foreignCategory)).name,'Foreign category');
  console.log('PASS isolated category security: current/stale support and transport roles, retained assignments, generic staff, owner/foreign/revoked boundaries, all commands, audit rollback and product preservation.');
 }finally{await closeDbForTests();}
}
async function main(){
 if(process.argv.includes('--category-security'))return categorySecurity();
 const target=new URL(process.env.SUQPAGE_POSTGRES_URL||'');assert.ok(['localhost','127.0.0.1'].includes(target.hostname)&&target.port==='54322');assert.equal(process.env.SUQPAGE_DATABASE_DRIVER,'postgres');
 process.env.SUQPAGE_OWNER_EDITOR_ENABLED='1';const {runner}=postgresRuntimeServices();const rollback=new Error('ROLLBACK_STANDARD_PAGE_TEST');let staged:StagedImage|null=null;
 try{await runner.transaction(async()=>{
  assert.deepEqual((await migratePostgresDatabase(runner)).applied,[]);
  for(const role of ['anon','authenticated'])assert.equal((await runner.query<{allowed:boolean}>("SELECT has_table_privilege(?,'public.owner_page_reviews','SELECT') allowed",[role])).rows[0].allowed,false);
  for(const role of ['anon','authenticated'])assert.equal((await runner.query<{allowed:boolean}>("SELECT has_table_privilege(?,'public.owner_location_proposals','SELECT') allowed",[role])).rows[0].allowed,false);
  const requestsBefore=(await runner.query<{n:string}>('SELECT COUNT(*) n FROM service_requests')).rows[0].n;
  const userQuery='SELECT u.id,u.email,u.name,u.role,u.business_id,u.must_change_password,p.access_role FROM users u JOIN user_access_profiles p ON p.user_id=u.id';
  const admin=(await runner.query<SessionUser>(`${userQuery} WHERE p.access_role='platform_admin' ORDER BY u.id LIMIT 1`)).rows[0];assert.ok(admin);
  const create=async()=>{const created=await createPostgresPublicClientWorkspace(runner,{name:'Page review fixture',businessName:'Page review fixture',businessCategory:'electronics', placeId:findPlaceSuggestions("Addis Ababa")[0].id,phone:'+447700900999',consent:true,idempotencyKey:randomUUID()},{providerUserId:randomUUID(),email:`review-${randomUUID()}@example.test`});return (await runner.query<SessionUser>(`${userQuery} WHERE u.id=?`,[created.userId])).rows[0];};
  const invitation={requestId:null,clientName:'Invitation fixture',email:`invite-${randomUUID()}@example.test`,businessName:'Invitation fixture',handle:`invite-${randomUUID()}`,designKey:'novatech',actorUserId:admin.id};
  await assert.rejects(()=>createClientInvitation({...invitation,requestId:1}),/no longer available/);
  assert.ok((await createClientInvitation(invitation)).businessId);
  const owner=await create();const foreign=await create();const bid=owner.business_id!;
  let catalog=(await runtimeCatalogByBusinessId(bid,true))!;
  const seeded=(await readOwnerPage(ownerPagePort,owner,bid))!;
  let draft=await saveOwnerPage(ownerPagePort,owner,bid,seeded.version,{...seeded.content,about:'A fixture shop with carefully described products.'});
  // Retain the no-listed-offering rejection case after default examples are created.
  await runner.query('UPDATE products SET is_published=0 WHERE business_id=?',[bid]);
  await assert.rejects(()=>submitPageReview(ownerPagePort,pageReviewPort,foreign,bid,draft.version),/Only the owner/);
  await assert.rejects(()=>submitPageReview(ownerPagePort,pageReviewPort,owner,bid,draft.version),/Add a product/);
  await changeProductCategory(owner,{kind:'create',businessId:bid,name:'Sensors',slug:'sensors'});
  const category=(await runner.query<{id:number}>('SELECT id FROM categories WHERE business_id=?',[bid])).rows[0];
  await assert.rejects(()=>changeProductCategory(foreign,{kind:'delete',businessId:bid,id:category.id}),/access/);
  catalog=(await runtimeCatalogByBusinessId(bid,true))!;
  const png=await sharp({create:{width:12,height:12,channels:3,background:'#446677'}}).png().toBuffer();
  await assert.rejects(()=>stageTenantProductImage(foreign,bid,new File([new Uint8Array(png)],'fixture.png',{type:'image/png'})),/access/);
  staged=await stageTenantProductImage(owner,bid,new File([new Uint8Array(png)],'fixture.png',{type:'image/png'}));assert.ok(staged);
  const command={kind:'create',businessId:bid,productId:null,expectedContentVersion:catalog.business.content_version,idempotencyKey:randomUUID(),name:'Fixture sensor',description:'A sensor for page lifecycle verification.',availability:'available',offeringKind:'standard_product',quantityMode:'optional',capacitySummary:'',minimumOrderSummary:'',leadTimeSummary:'',priceMinor:null,quantityUnit:'piece',highlights:['Simple reading'],videoRef:'',categoryId:category.id,imageAction:'replace',serviceNote:''};
  const product=await executeBasicProductUpkeep(postgresProductUpkeepPort,owner,command,staged);assert.ok(product.productId);
  const key=staged.imageRef.split('/').at(-1)!;
  assert.equal(await readTenantProductImage(key,null),null);assert.equal(await readTenantProductImage(key,foreign),null);assert.ok(await readTenantProductImage(key,owner));
  await launchWiringCases(postgresProductUpkeepPort,owner,foreign,command,product.productId);
  const review=await submitPageReview(ownerPagePort,pageReviewPort,owner,bid,draft.version);assert.equal(review.status,'pending');
  assert.equal((await submitPageReview(ownerPagePort,pageReviewPort,owner,bid,draft.version)).submission,review.submission);
  await assert.rejects(()=>decidePageReview(pageReviewPort,owner,bid,review.submission,'approve',''),/Administrator/);
  await changeProductCategory(owner,{kind:'update',businessId:bid,id:category.id,name:'Updated sensors',slug:'sensors',active:true});
  await assert.rejects(()=>decidePageReview(pageReviewPort,admin,bid,review.submission,'approve',''),/changed/);
  assert.equal((await pageReviewPort.readiness(bid))?.status,'draft');assert.equal(await runtimePublishedPage(bid),undefined);
  const latest=await submitPageReview(ownerPagePort,pageReviewPort,owner,bid,draft.version);assert.ok(latest.submission>review.submission);
  const changes=await decidePageReview(pageReviewPort,admin,bid,latest.submission,'changes','Please clarify the product features.');assert.equal(changes.status,'changes_requested');
  draft=await saveOwnerPage(ownerPagePort,owner,bid,draft.version,{...draft.content,about:'A clarified fixture shop description.'});
  const submitted=await submitPageReview(ownerPagePort,pageReviewPort,owner,bid,draft.version);
  const approved=await decidePageReview(pageReviewPort,admin,bid,submitted.submission,'approve','Ready for publication.');assert.equal(approved.status,'approved');
  assert.equal((await runtimePublishedPage(bid))?.about,draft.content.about);assert.equal((await pageReviewPort.readiness(bid))?.status,'active');assert.ok((await readTenantProductImage(key,null))?.isPublic);
  await runner.query("UPDATE businesses SET status='suspended' WHERE id=?",[bid]);assert.equal(await readTenantProductImage(key,null),null);await runner.query("UPDATE businesses SET status='active' WHERE id=?",[bid]);
  await assert.rejects(()=>decidePageReview(pageReviewPort,admin,bid,submitted.submission,'approve',''),/changed/);
  await assert.rejects(()=>readOwnerPage(ownerPagePort,admin,bid),/access/);
  draft=await setOwnerPageAssistance(ownerPagePort,owner,bid,draft.version,true);assert.ok(await readOwnerPage(ownerPagePort,admin,bid));
  await assert.rejects(()=>changePagePublication(ownerPagePort,pagePublicationPort,admin,bid,{action:'publish',version:draft.version,revision:1}),/Only the owner/);
  const staff=(await runner.query<SessionUser>(`${userQuery} WHERE p.access_role='team_member' ORDER BY u.id LIMIT 1`)).rows[0];
  assert.ok(staff,'Local staff fixture exists');
  await assert.rejects(()=>setBusinessAssignment(owner,bid,staff.id,true),/Administrator/);
  await setBusinessAssignment(admin,bid,staff.id,true);assert.ok(await readOwnerPage(ownerPagePort,staff,bid));
  await setBusinessAssignment(admin,bid,staff.id,false);await assert.rejects(()=>readOwnerPage(ownerPagePort,staff,bid),/access/);
  assert.equal((await runner.query<{n:string}>('SELECT COUNT(*) n FROM service_requests')).rows[0].n,requestsBefore);
  console.log('PASS draft owner categories/products/private media, foreign denial, exact-version review, feedback/resubmit/atomic publication, consent and direct staff assignment, signup without requests; all database fixtures rolled back');
  throw rollback;
 });}catch(error){if(error!==rollback)throw error;}finally{await (staged as StagedImage | null)?.discard();await closePostgresRuntimeForTests();}
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Standard page test failed');process.exitCode=1;});
