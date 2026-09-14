import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getDb, closeDbForTests } from "./testing/postgres-fixture";
import { parseRevisionSnapshot, RevisionError, upgradeRevisionSnapshotToV3, } from "../lib/revision-domain";
import { curatedManifestForLegacyDesign } from "../lib/showroom-manifests";
async function runPostgresFixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-stockless-"));
    const databasePath = path.join(root, "stockless.db");
    process.env.MIRTPAGE_BACKUP_ROOT = path.join(root, "backups");
    const db = await getDb();
    const tableColumns = async (table: string) => (await db.prepare(`SELECT column_name name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='${table}'`).all() as Array<{
        name: string;
    }>).map((row) => row.name);
    try {
        assert.equal((await tableColumns("products")).includes("stock_count"), false);
        assert.equal((await tableColumns("option_values")).includes("stock_count"), false);
        const manifest = curatedManifestForLegacyDesign("novatech");
        const businessId = Number((await db
            .prepare("INSERT INTO businesses(handle,name,design_key,design_manifest_json,status) VALUES('stockless-test','Stockless Test','composition',?,'active')")
            .run(JSON.stringify(manifest))).insertedId);
        const collectionId = Number((await db
            .prepare("INSERT INTO collections(business_id,name,slug) VALUES(?,'Main','main')")
            .run(businessId)).insertedId);
        const categoryId = Number((await db
            .prepare("INSERT INTO categories(business_id,collection_id,name,slug) VALUES(?,?,'Coffee','coffee')")
            .run(businessId, collectionId)).insertedId);
        const productId = Number((await db
            .prepare("INSERT INTO products(business_id,collection_id,category_id,name,slug,availability,is_published) VALUES(?,?,?,?,?,'limited',1)")
            .run(businessId, collectionId, categoryId, "Forest Coffee", "forest-coffee")).insertedId);
        const optionGroupId = Number((await db
            .prepare("INSERT INTO option_groups(product_id,name,position) VALUES(?,'Roast',0)")
            .run(productId)).insertedId);
        const optionValueId = Number((await db
            .prepare("INSERT INTO option_values(option_group_id,value) VALUES(?,'Medium')")
            .run(optionGroupId)).insertedId);
        const inquiryId = Number((await db
            .prepare("INSERT INTO inquiries(business_id,customer_name,contact) VALUES(?,'Demo Customer','demo@example.com')")
            .run(businessId)).insertedId);
        await db.prepare("INSERT INTO inquiry_items(inquiry_id,product_id,product_name_snapshot,quantity) VALUES(?,?,?,20)").run(inquiryId, productId, "Forest Coffee");
        assert.equal((await tableColumns("products")).includes("stock_count"), false);
        assert.equal((await tableColumns("option_values")).includes("stock_count"), false);
        assert.deepEqual({
            ...(await db
                .prepare("SELECT id,business_id,collection_id,category_id,name,availability FROM products WHERE id=?")
                .get(productId) as Record<string, unknown>),
        }, {
            id: productId,
            business_id: businessId,
            collection_id: collectionId,
            category_id: categoryId,
            name: "Forest Coffee",
            availability: "limited",
        });
        assert.deepEqual({
            ...(await db
                .prepare("SELECT id,option_group_id,value FROM option_values WHERE id=?")
                .get(optionValueId) as Record<string, unknown>),
        }, { id: optionValueId, option_group_id: optionGroupId, value: "Medium" });
        assert.equal((await db
            .prepare("SELECT product_id,quantity FROM inquiry_items WHERE inquiry_id=?")
            .get(inquiryId) as {
            product_id: number;
            quantity: number;
        }).product_id, productId);
        assert.equal((await db
            .prepare("SELECT product_id,quantity FROM inquiry_items WHERE inquiry_id=?")
            .get(inquiryId) as {
            product_id: number;
            quantity: number;
        }).quantity, 20);
        assert.equal((await db.prepare("SELECT COUNT(*) total FROM pg_constraint WHERE connamespace=current_schema()::regnamespace AND NOT convalidated").get()).total, 0);
        assert.equal((await db
            .prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=9")
            .get() as {
            count: number;
        }).count, 1);
        assert.equal((await db.prepare("SELECT COUNT(*) count FROM products").get() as {
            count: number;
        }).count, 1);
        const legacyV2 = {
            schemaVersion: 2,
            business: {
                name: "Stockless Test",
                designKey: "composition",
                tagline: "",
                description: "",
                logoRef: "",
                heroTitle: "",
                heroSubtitle: "",
                heroImageRef: "",
                contactEmail: "",
                whatsapp: "",
                telegram: "",
                tiktok: "",
                siteTitle: "",
                siteDescription: "",
                faviconRef: "",
            },
            designManifest: manifest,
            collections: [],
            categories: [],
            products: [
                {
                    key: "product-1",
                    collectionKey: null,
                    categoryKey: null,
                    name: "Legacy product",
                    slug: "legacy-product",
                    eyebrow: "",
                    description: "",
                    imageRef: "",
                    availability: "available",
                    stockCount: 0,
                    published: true,
                    sortOrder: 0,
                    optionGroups: [],
                },
            ],
        };
        const upgraded = upgradeRevisionSnapshotToV3(legacyV2);
        assert.equal(upgraded.schemaVersion, 3);
        assert.equal(upgraded.products[0].availability, "available");
        assert.equal("stockCount" in upgraded.products[0], false);
        assert.equal(JSON.stringify(upgraded).includes("stockCount"), false);
        assert.throws(() => parseRevisionSnapshot({
            ...upgraded,
            products: [{ ...upgraded.products[0], stockCount: 1 }],
        }), (error: unknown) => error instanceof RevisionError && /unsupported field/i.test(error.message));
        const activeRoots = ["app", "components", "lib", "showroom-sdk"];
        const legacyLines = new Map<string, RegExp[]>([
            [
                "lib/revision-domain.ts",
                [
                    /schemaVersion < 3 .*\["stockCount"\]/,
                    /schemaVersion < 3 && value\.stockCount/,
                    /integer\(value\.stockCount/,
                ],
            ],
            [
                "lib/schema.ts",
                [/columns\(db, "products"\)\.has\("stock_count"\)/],
            ],
        ]);
        const inventoryPattern = /\bstock_count\b|\bstockCount\b|\bstock\s+count\b/i;
        const violations: string[] = [];
        const inspect = (relative: string) => {
            const fullPath = path.join(process.cwd(), relative);
            for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
                const child = path.posix.join(relative, entry.name);
                if (entry.isDirectory())
                    inspect(child);
                else if (/\.(?:ts|tsx|json)$/.test(entry.name)) {
                    fs.readFileSync(path.join(process.cwd(), child), "utf8")
                        .split("\n")
                        .forEach((line, index) => {
                        if (!inventoryPattern.test(line))
                            return;
                        const allowed = legacyLines
                            .get(child)
                            ?.some((pattern) => pattern.test(line));
                        if (!allowed)
                            violations.push(`${child}:${index + 1}`);
                    });
                }
            }
        };
        activeRoots.forEach(inspect);
        assert.deepEqual(violations, [], `Active stock contracts remain: ${violations.join(", ")}`);
        console.log("PostgreSQL stockless schema, relationship preservation and v2-to-v3 recovery passed.");
    }
    finally {
        await closeDbForTests();
        fs.rmSync(root, { recursive: true, force: true });
    }
}
runPostgresFixture().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
