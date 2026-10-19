import {findPlaceSuggestions} from '../lib/place-catalog';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suqpage-launch-'));
process.env.SUQPAGE_MEDIA_ROOT = path.join(root, 'media');
process.env.SUQPAGE_AUTH_DRIVER = 'local';
async function main() {
    const { createPublicClientWorkspace } = await import('../lib/signup');
    const { getUserById, getDb, closeDbForTests } = await import('./testing/postgres-fixture');
    const db = await getDb();
    try {
        const create = async () => { const result = await createPublicClientWorkspace({ name: 'Fixture owner', businessName: 'Fixture shop', businessCategory: 'electronics', placeId:findPlaceSuggestions("Addis Ababa")[0].id, phone: '+447700900999', consent: true, idempotencyKey: randomUUID() }, { providerUserId: randomUUID(), email: `launch-${randomUUID()}@example.test` }); return (await getUserById(result.userId))!; };
        const owner = await create(), foreign = await create();
        const { postgresProductUpkeepPort } = await import('../lib/product-upkeep-postgres');
        const { executeBasicProductUpkeep } = await import('../lib/product-upkeep');
        const { launchWiringCases } = await import('./launch-wiring-cases');
        const command = { kind: 'create', businessId: owner.business_id, productId: null, expectedContentVersion: 1, idempotencyKey: randomUUID(), name: 'Fixture sensor', description: 'A fixture product.', availability: 'available', offeringKind: 'standard_product', quantityMode: 'optional', capacitySummary: 'Retained only', minimumOrderSummary: '', leadTimeSummary: '', priceMinor: null, quantityUnit: 'piece', highlights: ['Small'], videoRef: '', categoryId: null, imageAction: 'keep', serviceNote: '' };
        const product = await executeBasicProductUpkeep(postgresProductUpkeepPort, owner, command, null);
        await launchWiringCases(postgresProductUpkeepPort, owner, foreign, command, product.productId);
        const { readOwnerBusiness, saveOwnerBusiness } = await import('../lib/owner-business-runtime');
        const { getStaffBusinessGrant, setStaffBusinessGrant } = await import('../lib/staff-operations');
        const makeActor = async (role: 'platform_admin' | 'team_member') => {
            const id = Number((await db.prepare(
                "INSERT INTO users(email,password_hash,name,role) VALUES(?,'unused',?,'admin')"
            ).run(`launch-${randomUUID()}@example.test`, role)).insertedId);
            await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id, role);
            if (role === 'team_member') await db.prepare(
                'INSERT INTO staff_business_grants(user_id,enabled,version,updated_at) VALUES(?,1,1,1)'
            ).run(id);
            return (await getUserById(id))!;
        };
        const admin = await makeActor('platform_admin');
        const staff = await makeActor('team_member');
        const bid = owner.business_id!;
        const before = await readOwnerBusiness(staff, bid);
        await saveOwnerBusiness(staff, bid, {
            name: 'Staff-maintained launch fixture',
            expectedVersion: before.business.content_version,
            locationVersion: before.proposal?.version || 0,
        });
        const saved = await readOwnerBusiness(owner, bid);
        assert.equal(saved.business.name, 'Staff-maintained launch fixture');
        const grant = await getStaffBusinessGrant(admin, staff.id);
        assert.equal(grant.enabled, true);
        const revoked = await setStaffBusinessGrant(admin, staff.id, false, grant.version);
        await assert.rejects(() => readOwnerBusiness(staff, bid), /Business details are not available for this account/);
        await assert.rejects(() => saveOwnerBusiness(staff, bid, {
            name: 'Revoked edit',
            expectedVersion: saved.business.content_version,
            locationVersion: saved.proposal?.version || 0,
        }), /Business details are not available for this account/);
        assert.deepEqual((await readOwnerBusiness(owner, bid)).business, saved.business,
            'Revoked staff cannot alter business details with a stale editor');
        await setStaffBusinessGrant(admin, staff.id, true, revoked.version);
        assert.equal((await readOwnerBusiness(staff, bid)).business.name, saved.business.name);
        console.log('PASS BE-060 granted staff business save, immediate revocation, unchanged data, and restored read access.');
    }
    finally {
        await closeDbForTests();
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
