import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suqpage-invitations-'));
process.env.SUQPAGE_MEDIA_ROOT = path.join(root, 'media');
process.env.SUQPAGE_AUTH_DRIVER = 'local';
async function main() {
    const { getDb, closeDbForTests } = await import('./testing/postgres-fixture');
    const { createClientInvitation, getActiveInvitation, redeemClientInvitation, hashInvitationToken, INVITATION_LIFETIME_MS } = await import('../lib/invitations');
    try {
        const db = await getDb();
        const adminId = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('invite-admin@example.test','unused','Admin','admin')").run()).insertedId);
        const input = { requestId: null, clientName: 'Invited owner', email: 'owner@example.test', businessName: 'Invited shop', handle: 'invited-shop', designKey: 'novatech', actorUserId: adminId };
        const now = 1000000;
        const count = async () => (await db.prepare('SELECT COUNT(*) n FROM service_requests').get() as {
            n: number;
        }).n;
        const before = await count();
        await assert.rejects(() => createClientInvitation({ ...input, requestId: 1 }), /no longer available/);
        const invitation = await createClientInvitation(input, { now });
        const stored = await db.prepare('SELECT token_hash,request_id FROM client_invitations WHERE id=?').get(invitation.invitationId) as {
            token_hash: string;
            request_id: number | null;
        };
        assert.equal(stored.token_hash, hashInvitationToken(invitation.token));
        assert.notEqual(stored.token_hash, invitation.token);
        assert.equal(stored.request_id, null);
        assert.equal((await getActiveInvitation(invitation.token, now + 1))?.business_id, invitation.businessId);
        assert.equal(await getActiveInvitation(invitation.token, now + INVITATION_LIFETIME_MS), undefined);
        assert.equal(await getActiveInvitation('invalid', now), undefined);
        await assert.rejects(() => redeemClientInvitation({ token: invitation.token, name: 'Owner', password: 'weak' }, now + 1), /12 characters/);
        const owner = await redeemClientInvitation({ token: invitation.token, name: 'Owner', password: 'FixturePassword123!' }, now + 1);
        assert.equal(owner.businessId, invitation.businessId);
        assert.equal(owner.requestId, null);
        assert.equal((await db.prepare('SELECT status FROM businesses WHERE id=?').get(owner.businessId) as {
            status: string;
        }).status, 'draft');
        assert.equal((await db.prepare('SELECT access_role FROM user_access_profiles WHERE user_id=?').get(owner.userId) as {
            access_role: string;
        }).access_role, 'client');
        assert.equal(await getActiveInvitation(invitation.token, now + 2), undefined);
        await assert.rejects(() => redeemClientInvitation({ token: invitation.token, name: 'Owner', password: 'FixturePassword123!' }, now + 2), /already used/);
        await assert.rejects(() => createClientInvitation({ ...input, handle: 'duplicate-owner' }, { now }), /already uses/);
        const revoked = await createClientInvitation({ ...input, email: 'revoked@example.test', handle: 'revoked-shop' }, { now });
        await db.prepare('UPDATE client_invitations SET revoked_at=? WHERE id=?').run(now + 1, revoked.invitationId);
        assert.equal(await getActiveInvitation(revoked.token, now + 2), undefined);
        await assert.rejects(() => redeemClientInvitation({ token: revoked.token, name: 'Owner', password: 'FixturePassword123!' }, now + 2), /invalid/);
        assert.equal(await count(), before);
        console.log('PASS standard invitations: isolated private owner, token hashing, expiry, revocation, replay, duplicate email and retired-request denial; no service requests created.');
    }
    finally {
        await closeDbForTests();
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
