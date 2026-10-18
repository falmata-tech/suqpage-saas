import {findPlaceSuggestions} from '../lib/place-catalog';
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-signup-"));
process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
async function main() {
    try {
        const { closeDbForTests, getDb } = await import("./testing/postgres-fixture");
        const { createPublicClientWorkspace, parseSignupInput, SignupError } = await import("../lib/signup");
        const { getDiscoveryView } = await import("../lib/discovery");
        const valid = {
            name: "Aster Bekele",
            phone: "+251911234567",
            businessName: "Aster Food Studio",
            businessCategory: "food-farming", placeId: findPlaceSuggestions("Hawassa")[0].id,
            idempotencyKey: "signup-test-key-0001",
            consent: true,
        };
        const identity = { providerUserId: "11111111-1111-4111-8111-111111111111", email: "aster@example.test" };
        const db = await getDb();
        const created = await createPublicClientWorkspace(valid, identity);
        assert.equal(created.businessId > 0 && created.userId > 0, true);
        assert.deepEqual({ ...(await db.prepare("SELECT handle,name,status,contact_email,whatsapp,public_email,public_phone FROM businesses WHERE id=?").get(created.businessId) as object) }, {
            handle: (await db.prepare("SELECT handle FROM businesses WHERE id=?").get(created.businessId) as {
                handle: string;
            }).handle,
            name: "Aster Food Studio",
            status: "draft",
            contact_email: "aster@example.test",
            whatsapp: "+447700900123",
            public_email: "hello@example.invalid",
            public_phone: "+447700900123",
        });
        assert.match((await db.prepare("SELECT handle FROM businesses WHERE id=?").get(created.businessId) as {
            handle: string;
        }).handle, /^aster-food-studio-[a-f0-9]{12}$/);
        assert.deepEqual({ ...(await db.prepare("SELECT role,business_id,must_change_password,account_phone FROM users WHERE id=?").get(created.userId) as object) }, {
            role: "owner",
            business_id: created.businessId,
            must_change_password: 0,
            account_phone: valid.phone,
        });
        assert.deepEqual({ ...(await db.prepare("SELECT provider,provider_user_id,email_at_link FROM auth_identity_links WHERE user_id=?").get(created.userId) as object) }, {
            provider: "supabase",
            provider_user_id: identity.providerUserId,
            email_at_link: identity.email,
        });
        assert.equal((await db.prepare("SELECT access_role FROM user_access_profiles WHERE user_id=?").get(created.userId) as {
            access_role: string;
        }).access_role, "client");
        assert.deepEqual({ ...(await db.prepare("SELECT business_id,declared_category_key,idempotency_key FROM business_onboarding_profiles WHERE business_id=?").get(created.businessId) as object) }, {
            business_id: created.businessId,
            declared_category_key: "food-farming",
            idempotency_key: valid.idempotencyKey,
        });
        assert.equal((await db.prepare("SELECT COUNT(*) count FROM service_requests WHERE business_id=?").get(created.businessId) as {
            count: number;
        }).count, 0, "account setup does not create a page project");
        assert.equal((await db.prepare("SELECT COUNT(*) count FROM business_industries WHERE business_id=?").get(created.businessId) as {
            count: number;
        }).count, 1, "chosen city prepares owner-declared discovery classification while the business stays private");
        assert.equal((await getDiscoveryView({ industry: "food-farming" })).total, 0, "a self-created draft is never public");
        const selected=findPlaceSuggestions('Hawassa')[0];
        const location=await db.prepare('SELECT * FROM owner_location_proposals WHERE business_id=?').get(created.businessId);
        assert.equal(location.city,selected.name);assert.equal(location.region,selected.region);assert.equal(location.place_id,selected.id);assert.equal(location.reviewed_version,1);
        const anchor=await db.prepare('SELECT * FROM business_discovery_profiles WHERE business_id=?').get(created.businessId);assert.equal(anchor.city,selected.name);assert.equal(anchor.latitude,Math.round(selected.latitude*10)/10);assert.equal(anchor.longitude,Math.round(selected.longitude*10)/10);
        for(const placeId of [undefined,'','forged-place',500,'x'.repeat(81)])assert.throws(()=>parseSignupInput({...valid,placeId},identity),error=>error instanceof SignupError&&error.code==='city_required');
        const counts = async () => ({
            businesses: Number((await db.prepare("SELECT COUNT(*) count FROM businesses").get() as {
                count: number;
            }).count),
            users: Number((await db.prepare("SELECT COUNT(*) count FROM users").get() as {
                count: number;
            }).count),
            requests: Number((await db.prepare("SELECT COUNT(*) count FROM service_requests").get() as {
                count: number;
            }).count),
            onboardingProfiles: Number((await db.prepare("SELECT COUNT(*) count FROM business_onboarding_profiles").get() as {
                count: number;
            }).count),
        });
        const beforeConflict = await counts();
        await assert.rejects(() => createPublicClientWorkspace({ ...valid, idempotencyKey: "signup-test-key-0002" }, identity), (error: unknown) => error instanceof SignupError && error.status === 409 && error.code === "already_linked");
        assert.deepEqual(await counts(), beforeConflict, "duplicate provider identity creates no partial tenant state");
        await assert.rejects(() => createPublicClientWorkspace({ ...valid, idempotencyKey: "signup-test-key-0003" }, { providerUserId: "22222222-2222-4222-8222-222222222222", email: identity.email }), (error: unknown) => error instanceof SignupError && error.status === 409 && error.code === "email_conflict");
        assert.deepEqual(await counts(), beforeConflict, "duplicate verified email creates no partial tenant state");
        const parsed = parseSignupInput({ ...valid, email: "forged@example.test", handle: "forged", password: "forged" }, { providerUserId: "33333333-3333-4333-8333-333333333333", email: "verified@example.test" });
        assert.equal(parsed.email, "verified@example.test");
        assert.equal(parsed.handle, "forged", "Handle is user-chosen; verified identity remains server-owned");
        assert.throws(() => parseSignupInput(valid, { providerUserId: "bad", email: "bad" }), SignupError);
        const {parseBusinessHandle} = await import('../lib/business-handle');
        const {getHandleAvailability} = await import('../lib/handle-availability');
        assert.equal(parseBusinessHandle(' @My-Shop '), 'my-shop');
        for (const invalid of ['', 'ab', '-shop', 'shop-', 'a--b', 'shop/name', 'hello world', 'ሱቅ', 'a'.repeat(61), 'suqpage', 'ADMIN', 'support']) {
            assert.throws(() => parseBusinessHandle(invalid));
            assert.throws(() => parseSignupInput({...valid,handle:invalid}, identity), SignupError);
        }
        const handle = 'chosen-handle';
        assert.deepEqual(await getHandleAvailability(handle), {handle,available:true});
        const beforeRace = await counts();
        const race = await Promise.allSettled([
            createPublicClientWorkspace({...valid,handle:' @Chosen-Handle ',idempotencyKey:'signup-handle-race-0001'}, {providerUserId:'44444444-4444-4444-8444-444444444444',email:'handle-one@example.test'}),
            createPublicClientWorkspace({...valid,handle:'CHOSEN-HANDLE',idempotencyKey:'signup-handle-race-0002'}, {providerUserId:'55555555-5555-4555-8555-555555555555',email:'handle-two@example.test'}),
        ]);
        assert.equal(race.filter(result=>result.status==='fulfilled').length,1);
        const failure = race.find(result=>result.status==='rejected');
        assert.ok(failure?.status==='rejected' && failure.reason instanceof SignupError && failure.reason.code==='handle_conflict' && failure.reason.status===409);
        const afterRace = await counts();
        assert.equal(afterRace.businesses,beforeRace.businesses+1);
        assert.equal(afterRace.users,beforeRace.users+1);
        assert.equal(afterRace.onboardingProfiles,beforeRace.onboardingProfiles+1);
        assert.deepEqual(await getHandleAvailability('CHOSEN-HANDLE'), {handle,available:false}, 'Private drafts reserve handles without disclosing their identity');
        await db.prepare("UPDATE businesses SET status='suspended' WHERE handle=?").run(handle);
        assert.equal((await getHandleAvailability(handle)).available,false);
        console.log("Private account bootstrap, category privacy, atomicity, and conflict tests passed.");
        await closeDbForTests();
    }
    finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
