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
    await getDb();
    try {
        const create = async () => { const result = await createPublicClientWorkspace({ name: 'Fixture owner', businessName: 'Fixture shop', businessCategory: 'electronics', phone: '+447700900999', consent: true, idempotencyKey: randomUUID() }, { providerUserId: randomUUID(), email: `launch-${randomUUID()}@example.test` }); return (await getUserById(result.userId))!; };
        const owner = await create(), foreign = await create();
        const { postgresProductUpkeepPort } = await import('../lib/product-upkeep-postgres');
        const { executeBasicProductUpkeep } = await import('../lib/product-upkeep');
        const { launchWiringCases } = await import('./launch-wiring-cases');
        const command = { kind: 'create', businessId: owner.business_id, productId: null, expectedContentVersion: 1, idempotencyKey: randomUUID(), name: 'Fixture sensor', description: 'A fixture product.', availability: 'available', offeringKind: 'standard_product', quantityMode: 'optional', capacitySummary: 'Retained only', minimumOrderSummary: '', leadTimeSummary: '', priceMinor: null, quantityUnit: 'piece', highlights: ['Small'], videoRef: '', categoryId: null, imageAction: 'keep', serviceNote: '' };
        const product = await executeBasicProductUpkeep(postgresProductUpkeepPort, owner, command, null);
        await launchWiringCases(postgresProductUpkeepPort, owner, foreign, command, product.productId);
    }
    finally {
        await closeDbForTests();
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
