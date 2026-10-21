import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-rich-offering-"));
    try {
        const { closeDbForTests, getDb } = await import("./testing/postgres-fixture");
        const db = await getDb();
        const businessColumns = new Set((await db.prepare("SELECT column_name name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='businesses'").all() as Array<{
            name: string;
        }>).map((column) => column.name));
        const productColumns = new Set((await db.prepare("SELECT column_name name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='products'").all() as Array<{
            name: string;
        }>).map((column) => column.name));
        for (const column of ["process_video_ref", "is_live", "live_platform", "live_url"]) {
            assert(businessColumns.has(column));
        }
        for (const column of [
            "video_ref",
            "price_minor",
            "currency",
            "quantity_unit",
            "highlights_json",
        ]) {
            assert(productColumns.has(column));
        }
        assert.equal((await db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=24").get())?.count, 1);
        await assert.rejects(async () => await db.prepare("INSERT INTO businesses(handle,name,design_key,live_platform) VALUES('bad-live','Bad Live','composition','unsupported')").run());
        await closeDbForTests();
    }
    finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().then(() => console.log("Rich offering additive migration and constraints passed."))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
