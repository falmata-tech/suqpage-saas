import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getDb, closeDbForTests, getUserById } from './testing/postgres-fixture';
import { createPublicClientWorkspace } from '../lib/signup';
import { initializeBusinessStarter } from '../lib/business-starter-postgres';
import { postgresRuntimeServices } from '../lib/postgres-runtime-services';
import { createClientInvitation, redeemClientInvitation } from '../lib/invitations';
import { runtimeCatalogByBusinessId } from '../lib/catalog-runtime';
import { ownerPagePort } from '../lib/owner-page-runtime';
import { readOwnerPage, saveOwnerPage } from '../lib/owner-page-service';
import { parsePublicContacts, publicContactFields } from '../lib/business-profile-contacts';
import { getDiscoveryView } from '../lib/discovery';
import { STARTER_VIDEO_REF } from '../lib/business-starter';

async function main() {
  const db = await getDb();
  try {
    const signup = { name: 'Starter owner', phone: '+251911234567', businessName: 'Starter business', businessCategory: 'electronics', idempotencyKey: 'starter-signup-test-001', consent: true };
    const identity = { providerUserId: '11111111-1111-4111-8111-111111111119', email: 'real-owner@example.test' };
    const created = await createPublicClientWorkspace(signup, identity);
    async function assertComplete(businessId: number) {
      const catalog = (await runtimeCatalogByBusinessId(businessId, true))!;
      assert.equal(catalog.business.status, 'draft');
      for (const key of ['name','tagline','description','logo_path','favicon_path','hero_title','hero_subtitle','hero_image_path','process_video_ref','public_email','public_phone','whatsapp','telegram','tiktok','site_title','site_description','contact_email','live_platform','live_url'] as const) assert.ok(catalog.business[key], `Business ${key} is filled`);
      assert.equal(catalog.business.is_live, 0);
      assert.equal(catalog.products.length, 3);
      assert.deepEqual(catalog.products.map(p => p.offering_kind).sort(), ['service','standard_product','standard_product']);
      for (const p of catalog.products) {
        for (const key of ['name','slug','description','image_path','video_ref','availability','category_id','collection_id'] as const) assert.ok(p[key], `Offering ${key} is filled`);
        assert.ok(p.price_minor! > 0); assert.equal(p.highlights.length, 0);
        assert.equal(p.option_groups?.length, 0);
        assert.ok(fs.existsSync(`public${p.image_path}`));
        assert.equal(p.media?.length,3);assert.equal(p.media?.filter(item=>item.kind==='image').length,2);
        assert.deepEqual(p.media?.filter(item=>item.kind==='video'),[{kind:'video',ref:STARTER_VIDEO_REF}]);
        for(const item of p.media||[])if(item.kind==='image')assert.ok(fs.existsSync(`public${item.ref}`));
      }
      const draft = (await ownerPagePort.read(businessId))!;
      assert.ok(draft.content.about && draft.content.videoUrl && draft.content.heroImage);
      assert.ok(fs.existsSync(`public${draft.content.heroImage}`));
      const contacts = parsePublicContacts(draft.content.contacts);
      for (const {key} of publicContactFields) assert.ok(contacts[key], `${key} has a stored example`);
      assert.notEqual(contacts.email, identity.email); assert.notEqual(contacts.phone, signup.phone);
      const location = await db.prepare('SELECT * FROM owner_location_proposals WHERE business_id=?').get(businessId);
      assert.equal(location.city, 'Addis Ababa'); assert.ok(location.region && location.place_id);
      assert.equal(location.latitude, null); assert.equal(location.longitude, null); assert.equal(location.reviewed_version, 0);
      assert.equal((await db.prepare('SELECT COUNT(*) n FROM business_discovery_profiles WHERE business_id=?').get(businessId)).n, 0);
      assert.equal((await db.prepare('SELECT COUNT(*) n FROM owner_page_publications WHERE business_id=?').get(businessId)).n, 0);
      return catalog;
    }
    const catalog = await assertComplete(created.businessId);
    assert.equal(catalog.business.contact_email, identity.email);
    const account = await db.prepare('SELECT email,account_phone FROM users WHERE id=?').get(created.userId);
    assert.deepEqual({...account}, {email: identity.email, account_phone: signup.phone});
    assert.equal((await getDiscoveryView({industry:'all'})).total, 0);
    const owner = (await getUserById(created.userId))!;
    const draft = (await readOwnerPage(ownerPagePort, owner, created.businessId))!;
    await saveOwnerPage(ownerPagePort, owner, created.businessId, draft.version, {...draft.content, about: 'Our real business description.', contacts:{...draft.content.contacts, instagram:''}});
    const runner = postgresRuntimeServices().runner;
    assert.equal(await initializeBusinessStarter(runner, {businessId:created.businessId,actorUserId:owner.id,category:'electronics',notificationEmail:identity.email}), false);
    const after = (await readOwnerPage(ownerPagePort, owner, created.businessId))!;
    assert.equal(after.content.about, 'Our real business description.'); assert.equal(after.content.contacts?.instagram, '');
    assert.equal((await runtimeCatalogByBusinessId(created.businessId,true))?.products.length,3);

    const adminId = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('starter-admin@example.test','unused','Starter admin','admin')").run()).insertedId);
    await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(adminId);
    const invitationInput = {requestId:null,clientName:'Invited starter owner',email:'invited-starter@example.test',businessName:'Invited starter shop',handle:'invited-starter-shop',designKey:'novatech',actorUserId:adminId};
    const invited = await createClientInvitation(invitationInput);
    await assertComplete(invited.businessId);
    const accepted = await redeemClientInvitation({token:invited.token,name:'Invited owner',password:'FixturePassword123!'});
    assert.equal(accepted.businessId,invited.businessId);
    await assertComplete(invited.businessId);
    await assert.rejects(()=>initializeBusinessStarter(runner,{businessId:invited.businessId,actorUserId:owner.id,category:'electronics',notificationEmail:identity.email}),/access denied/);
    await assert.rejects(()=>readOwnerPage(ownerPagePort,owner,invited.businessId),/not available/);
    const retainedId = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status,public_email) VALUES('retained-starter-test','Retained','composition','draft','existing@example.test')").run()).insertedId);
    assert.equal(await initializeBusinessStarter(runner,{businessId:retainedId,actorUserId:adminId,category:'electronics',notificationEmail:'existing@example.test'}),false);
    assert.equal((await db.prepare('SELECT public_email FROM businesses WHERE id=?').get(retainedId)).public_email,'existing@example.test');
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM products WHERE business_id=?').get(retainedId)).n,0);

    // A real database failure after several child inserts must roll back the entire creation.
    await db.runner.query(`CREATE FUNCTION fail_starter_fixture() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
      IF NEW.name='Sample custom order' THEN RAISE EXCEPTION 'controlled starter failure'; END IF; RETURN NEW; END $$;
      CREATE TRIGGER fail_starter_fixture BEFORE INSERT ON products FOR EACH ROW EXECUTE FUNCTION fail_starter_fixture();`);
    const counts = async()=>Promise.all(['businesses','users','products','categories','collections','owner_page_drafts','client_invitations','option_groups','option_values'].map(async table=>(await db.runner.query(`SELECT COUNT(*)::int n FROM ${table}`)).rows[0].n));
    const before = await counts();
    await assert.rejects(()=>createPublicClientWorkspace({...signup,idempotencyKey:'starter-failure-key-001'},{providerUserId:'22222222-2222-4222-8222-222222222229',email:'fail-starter@example.test'}));
    assert.deepEqual(await counts(),before);
    await assert.rejects(()=>createClientInvitation({...invitationInput,email:'fail-invite@example.test',handle:'fail-invite'}),/controlled starter failure/);
    assert.deepEqual(await counts(),before);
    console.log('PASS complete signup/invitation starters, private identity/location, media/options, repeat preservation, foreign-tenant denial and atomic failure rollback.');
  } finally { await closeDbForTests(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
