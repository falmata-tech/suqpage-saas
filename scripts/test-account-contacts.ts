import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseAccountPhone, saveAccountPhone } from "../lib/account-contacts";
import { publicBusinessCatalog } from "../lib/business-profile";
import { legacyPublicContacts, publicContactLinks } from "../lib/business-profile-contacts";
const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-contacts-"));
process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");
async function main() {
    const { getDb, closeDbForTests, getUserById, getBusinessById } = await import("./testing/postgres-fixture");
    const { accountContactPort } = await import("../lib/account-contact-runtime");
    try {
        const db = await getDb();
        const businessId = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,contact_email) VALUES('contact-test','Contact test','composition','private@example.test')").run()).insertedId);
        const first = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES('account@example.test','disabled','First','owner',?)").run(businessId)).insertedId);
        const second = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('other@example.test','disabled','Second','admin')").run()).insertedId);
        assert.equal((await accountContactPort.read(first))?.account_phone, "");
        const before = (await getBusinessById(businessId))!;
        assert.equal(publicBusinessCatalog({ business: before, products: [], categories: [], collections: [] }).business.contact_email, "");
        assert.equal(before.contact_email, "private@example.test");
        assert.equal(before.public_phone, "");
        assert.equal(before.public_email, "");
        assert.deepEqual(await getBusinessById(businessId), before, "Repeated migration preserves retained contacts");
        assert.equal(parseAccountPhone(" +44 (7700) 900-001 "), "+447700900001");
        for (const invalid of [null, {}, 1234, "+12", "07700900001", "+447700900001\n", "+" + "1".repeat(40)])
            assert.throws(() => parseAccountPhone(invalid));
        await assert.rejects(saveAccountPhone(accountContactPort, null, "+447700900001"));
        await saveAccountPhone(accountContactPort, { id: first }, "+447700900001");
        assert.deepEqual({ ...await accountContactPort.read(first) }, { email: "account@example.test", account_phone: "+447700900001" });
        assert.equal((await accountContactPort.read(second))?.account_phone, "", "Other user untouched");
        assert.ok(!("account_phone" in (await getUserById(first))!), "Private phone excluded from session user");
        assert.deepEqual(await getBusinessById(businessId), before, "Private save never changes public fields");
        await db.prepare("UPDATE businesses SET public_email=?,public_phone=? WHERE id=?").run("public@example.com", "+447700900002", businessId);
        const contacts = legacyPublicContacts((await getBusinessById(businessId))!);
        assert.equal(contacts.email, "public@example.com");
        assert.equal(contacts.phone, "+447700900002");
        assert.ok(!JSON.stringify(contacts).includes("private@example.test"));
        assert.deepEqual(publicContactLinks({}), [], "Explicit empty published contacts stay empty");
        await saveAccountPhone(accountContactPort, { id: first }, "");
        assert.equal((await accountContactPort.read(first))?.account_phone, "");
        await assert.rejects(saveAccountPhone(accountContactPort, { id: 999999 }, "+447700900001"));
        console.log("PASS PostgreSQL account phone validation, self scope, identity preservation, clearing and public/private separation");
    }
    finally {
        await closeDbForTests();
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
