import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const postgresCatalogSource = fs.readFileSync(path.join(process.cwd(), "lib/postgres-catalog-repository.ts"), "utf8");
const showroomPageSource = fs.readFileSync(path.join(process.cwd(), "app/(public)/[handle]/page.tsx"), "utf8");
assert.match(postgresCatalogSource, /option_groups WHERE product_id IN/);
assert.match(postgresCatalogSource, /option_values WHERE option_group_id IN/);
assert.doesNotMatch(postgresCatalogSource, /products\.rows\.map\(async/);
assert.match(postgresCatalogSource, /getCatalogByBusinessId\(business\.id, false, business\)/);
assert.match(showroomPageSource, /const catalog\s*=\s*await runtimeCatalogByHandle\(handle\);\s*if\s*\(!catalog\)\s*\{\s*const existing\s*=\s*await runtimeBusinessByHandleAny\(handle\)/);
async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-scale-queries-"));
    process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");
    process.env.MIRTPAGE_BACKUP_ROOT = path.join(root, "backups");
    try {
        const { closeDbForTests, getDb } = await import("./testing/postgres-fixture");
        const { listBusinessesPage, listBusinessClientAccess, listInquiriesPage, listManagedClientsPage, listProductsPage, listPublicShowrooms, listStaffPage, } = await import("../lib/scalable-queries");
        const { runtimeListRequestsPage: listRequestsPage } = await import("../lib/request-runtime");
        const db = await getDb();
        await db.prepare(`
      INSERT INTO discovery_industries(key,label,icon,position,active)
      VALUES('electronics','Electronics','circuit',1,1) ON CONFLICT(key) DO NOTHING
    `).run();
        const businessIds: number[] = [];
        const productIds: number[] = [];
        for (let index = 1; index <= 45; index += 1) {
            const businessId = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,?,'active')").run(`query-business-${index}`, `Query Business ${index}`, "composition")).insertedId);
            businessIds.push(businessId);
            await db.prepare(`
        INSERT INTO business_discovery_profiles(
          business_id,booth_image_path,city,zone,region,latitude,longitude,approved_at,updated_at
        ) VALUES(?,'/demo.webp',?,?,?,9.02,38.75,?,?)
      `).run(businessId, `Market City ${index}`, `Market Zone ${index}`, `Market Region ${index}`, Date.now(), Date.now());
            await db.prepare(`
        INSERT INTO business_industries(business_id,industry_key)
        VALUES(?,'electronics')
      `).run(businessId);
            if (index <= 3)
                await db.prepare(`
        INSERT INTO discovery_sponsorships(business_id,position,active,updated_at)
        VALUES(?,?,1,?)
      `).run(businessId, index, Date.now());
            const categoryId = Number((await db.prepare("INSERT INTO categories(business_id,name,slug,sort_order) VALUES(?,?,?,0)").run(businessId, "Components", `components-${index}`)).insertedId);
            const productId = Number((await db.prepare(`
          INSERT INTO products(
            business_id,category_id,name,slug,description,offering_kind,
            quantity_mode,is_published,sort_order
          ) VALUES(?,?,?,?,?,'standard_product','optional',1,0)
        `).run(businessId, categoryId, `Widget ${index}`, `widget-${index}`, `Searchable widget ${index}`)).insertedId);
            productIds.push(productId);
        }
        for (let index = 1; index <= 24; index += 1) {
            await db.prepare(`
        INSERT INTO products(
          business_id,name,slug,description,offering_kind,quantity_mode,
          is_published,sort_order
        ) VALUES(?,?,?,?, 'production_supply','optional',1,?)
      `).run(businessIds[0], `Extra Input ${index}`, `extra-input-${index}`, "Multi-page product fixture", index);
        }
        const secondCatalogProductId = Number((await db.prepare("SELECT id FROM products WHERE business_id=? ORDER BY sort_order,id LIMIT 1 OFFSET 1").get(businessIds[0]) as {
            id: number;
        }).id);
        const firstGroupId = Number((await db.prepare("INSERT INTO option_groups(product_id,name,position) VALUES(?,'Finish',0)").run(productIds[0])).insertedId);
        const secondGroupId = Number((await db.prepare("INSERT INTO option_groups(product_id,name,position) VALUES(?,'Size',0)").run(secondCatalogProductId)).insertedId);
        await db.prepare("INSERT INTO option_values(option_group_id,value) VALUES(?,?)").run(firstGroupId, "Matte");
        await db.prepare("INSERT INTO option_values(option_group_id,value) VALUES(?,?)").run(secondGroupId, "Large");
        const clientIds: number[] = [];
        for (let index = 0; index < 25; index += 1) {
            const userId = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,? ,?,'owner',?,1)").run(`client-${index + 1}@example.test`, "hash", `Client ${index + 1}`, businessIds[index])).insertedId);
            clientIds.push(userId);
            await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(userId);
        }
        for (let index = 0; index < 25; index += 1) {
            const userId = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES(?,? ,?,'admin',1)").run(`staff-${index + 1}@example.test`, "hash", `Staff ${index + 1}`)).insertedId);
            await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)").run(userId, index < 20 ? "team_member" : "operations_manager");
        }
        for (let index = 1; index <= 25; index += 1) {
            const inquiryId = Number((await db.prepare(`
          INSERT INTO inquiries(
            business_id,customer_name,contact,contact_method,note,status,idempotency_key
          ) VALUES(?,?,?,'email',?,'new',?)
        `).run(businessIds[0], `Buyer ${index}`, `buyer-${index}@example.test`, "Widget requirement", `query-inquiry-${index}`)).insertedId);
            await db.prepare(`
        INSERT INTO inquiry_items(
          inquiry_id,product_id,product_name_snapshot,quantity_intent,
          offering_kind_snapshot,quantity_mode_snapshot,options_json
        ) VALUES(?,?,?,'1 ton','standard_product','optional','{}')
      `).run(inquiryId, productIds[0], "Widget 1");
        }
        for (let index = 1; index <= 25; index += 1) {
            await db.prepare(`
        INSERT INTO service_requests(
          public_ref,business_id,represented_client_user_id,request_type,status,
          contact_name,contact_value,business_name,request_text,submitter_kind,
          submitted_by_user_id,idempotency_key,notification_state
        ) VALUES(?,?,?,'change',?,'Client','client@example.test',
          'Query Business','Pagination request','client',?,?,'not_required')
      `).run(`QUERY-REQUEST-${index}`, index === 25 ? businessIds[1] : businessIds[0], index === 25 ? clientIds[1] : clientIds[0], index >= 24 ? "submitted" : "published", index === 25 ? clientIds[1] : clientIds[0], `query-request-${index}`);
        }
        const publicFirst = await listPublicShowrooms({ q: "widget", page: 1 });
        assert.equal(publicFirst.items.length, 5);
        assert.equal(publicFirst.totalItems, 45);
        assert.equal(publicFirst.totalPages, 9);
        assert.ok(publicFirst.items.every((item) => item.industryKey === "electronics"));
        const publicLast = await listPublicShowrooms({ q: "widget", page: 999 });
        assert.equal(publicLast.page, 9);
        assert.equal(publicLast.items.length, 5);
        const businesses = await listBusinessesPage({ page: 2 });
        assert.equal(businesses.items.length, 6);
        assert.equal(businesses.page, 2);
        assert.equal(businesses.totalItems, 45);
        assert.ok(businesses.items.every((business) => business.marketplace_approved_at));
        assert.equal((await listBusinessesPage({ q: "client-1@example.test" })).totalItems, 1);
        assert.equal((await listBusinessesPage({ q: "market city 45" })).totalItems, 1);
        assert.equal((await listBusinessClientAccess(businessIds[0])).length, 1);
        assert.equal((await listManagedClientsPage({ page: 2 })).items.length, 6);
        assert.equal((await listStaffPage({ page: 2 })).items.length, 6);
        assert.equal((await listProductsPage(businessIds[0], { page: 1 })).items.length, 10);
        assert.equal((await listProductsPage(businessIds[0], { page: 2 })).items.length, 10);
        const { getCatalogByBusinessId } = await import("./testing/postgres-fixture");
        const catalog = await getCatalogByBusinessId(businessIds[0]);
        const firstCatalogProduct = catalog?.products.find((product) => product.id === productIds[0]);
        const secondCatalogProduct = catalog?.products.find((product) => product.id === secondCatalogProductId);
        assert.equal(firstCatalogProduct?.option_groups?.at(0)?.values.at(0)?.value, "Matte");
        assert.equal(secondCatalogProduct?.option_groups?.at(0)?.values.at(0)?.value, "Large");
        const inquiries = await listInquiriesPage(businessIds[0], { page: 1, q: "widget" });
        assert.equal(inquiries.items.length, 10);
        assert.equal(inquiries.totalItems, 25);
        assert.equal(inquiries.items[0].items.length, 1);
        assert.equal(inquiries.items[0].items[0].quantity_intent, "1 ton");
        const clientOne = {
            id: clientIds[0],
            email: "client-1@example.test",
            name: "Client 1",
            role: "owner" as const,
            access_role: "client" as const,
            business_id: businessIds[0],
            must_change_password: 1,
        };
        const clientRequests = await listRequestsPage(clientOne, { page: 1 });
        assert.equal(clientRequests.totalItems, 24);
        assert.ok(clientRequests.items.every((request) => request.business_id === businessIds[0]));
        const manager = {
            id: 999,
            email: "manager@example.test",
            name: "Manager",
            role: "admin" as const,
            access_role: "operations_manager" as const,
            business_id: null,
            must_change_password: 0,
        };
        const selectedBusinessRequests = await listRequestsPage(manager, { page: 1, business: businessIds[1] });
        assert.equal(selectedBusinessRequests.totalItems, 1);
        assert.ok(selectedBusinessRequests.items.every((request) => request.business_id === businessIds[1]));
        assert.ok(await db.prepare("SELECT 1 FROM schema_migrations WHERE version=20").get(), "additive scale indexes are migrated");
        const indexes = await db.prepare("SELECT indexname FROM pg_indexes WHERE schemaname=current_schema() AND tablename='products'").all();
        assert.ok(indexes.some(row => row.indexname === "product_business_published_order_idx"), "product pages have the scoped ordering index");
        assert.equal((await db.prepare("SELECT COUNT(*) total FROM pg_constraint WHERE connamespace=current_schema()::regnamespace AND NOT convalidated").get()).total, 0);
        await closeDbForTests();
    }
    finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().then(() => console.log("Server-paginated collection query and tenant-scope tests passed."))
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
