import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-scale-queries-"));
  process.env.MIRTPAGE_DB_PATH = path.join(root, "queries.db");
  process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.MIRTPAGE_BACKUP_ROOT = path.join(root, "backups");
  try {
    const { closeDbForTests, getDb } = await import("../lib/db");
    const {
      listBusinessesPage,
      listInquiriesPage,
      listManagedClientsPage,
      listProductsPage,
      listPublicShowrooms,
      listStaffPage,
    } = await import("../lib/scalable-queries");
    const { listRequestsPage } = await import("../lib/request-sqlite");
    const db = getDb();
    const businessIds: number[] = [];
    const productIds: number[] = [];
    for (let index = 1; index <= 45; index += 1) {
      const businessId = Number(
        db.prepare(
          "INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,?,'active')",
        ).run(`query-business-${index}`, `Query Business ${index}`, "composition")
          .lastInsertRowid,
      );
      businessIds.push(businessId);
      db.prepare(`
        INSERT INTO bazaar_booth_profiles(
          business_id,industry_keys_json,booth_image_path,city,zone,region,
          latitude,longitude,is_featured,approved_at
        ) VALUES(?,'["electronics"]','/demo.webp','Addis Ababa','Addis Ababa',
          'Addis Ababa',9.02,38.75,?,CURRENT_TIMESTAMP)
      `).run(businessId, index <= 3 ? 1 : 0);
      const categoryId = Number(
        db.prepare(
          "INSERT INTO categories(business_id,name,slug,sort_order) VALUES(?,?,?,0)",
        ).run(businessId, "Components", `components-${index}`).lastInsertRowid,
      );
      const productId = Number(
        db.prepare(`
          INSERT INTO products(
            business_id,category_id,name,slug,description,offering_kind,
            quantity_mode,is_published,sort_order
          ) VALUES(?,?,?,?,?,'standard_product','optional',1,0)
        `).run(
          businessId,
          categoryId,
          `Widget ${index}`,
          `widget-${index}`,
          `Searchable widget ${index}`,
        ).lastInsertRowid,
      );
      productIds.push(productId);
    }
    for (let index = 1; index <= 24; index += 1) {
      db.prepare(`
        INSERT INTO products(
          business_id,name,slug,description,offering_kind,quantity_mode,
          is_published,sort_order
        ) VALUES(?,?,?,?, 'production_supply','optional',1,?)
      `).run(
        businessIds[0],
        `Extra Input ${index}`,
        `extra-input-${index}`,
        "Multi-page product fixture",
        index,
      );
    }

    const clientIds: number[] = [];
    for (let index = 0; index < 25; index += 1) {
      const userId = Number(
        db.prepare(
          "INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,? ,?,'owner',?,1)",
        ).run(
          `client-${index + 1}@example.test`,
          "hash",
          `Client ${index + 1}`,
          businessIds[index],
        ).lastInsertRowid,
      );
      clientIds.push(userId);
      db.prepare(
        "INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')",
      ).run(userId);
    }
    for (let index = 0; index < 25; index += 1) {
      const userId = Number(
        db.prepare(
          "INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES(?,? ,?,'admin',1)",
        ).run(`staff-${index + 1}@example.test`, "hash", `Staff ${index + 1}`)
          .lastInsertRowid,
      );
      db.prepare(
        "INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)",
      ).run(userId, index < 20 ? "team_member" : "operations_manager");
    }

    for (let index = 1; index <= 25; index += 1) {
      const inquiryId = Number(
        db.prepare(`
          INSERT INTO inquiries(
            business_id,customer_name,contact,contact_method,note,status,idempotency_key
          ) VALUES(?,?,?,'email',?,'new',?)
        `).run(
          businessIds[0],
          `Buyer ${index}`,
          `buyer-${index}@example.test`,
          "Widget requirement",
          `query-inquiry-${index}`,
        ).lastInsertRowid,
      );
      db.prepare(`
        INSERT INTO inquiry_items(
          inquiry_id,product_id,product_name_snapshot,quantity_intent,
          offering_kind_snapshot,quantity_mode_snapshot,options_json
        ) VALUES(?,?,?,'1 ton','standard_product','optional','{}')
      `).run(inquiryId, productIds[0], "Widget 1");
    }

    for (let index = 1; index <= 25; index += 1) {
      db.prepare(`
        INSERT INTO service_requests(
          public_ref,business_id,represented_client_user_id,request_type,status,
          contact_name,contact_value,business_name,request_text,submitter_kind,
          submitted_by_user_id,idempotency_key,notification_state
        ) VALUES(?,?,?,'change','submitted','Client','client@example.test',
          'Query Business','Pagination request','client',?,?,'not_required')
      `).run(
        `QUERY-REQUEST-${index}`,
        index === 25 ? businessIds[1] : businessIds[0],
        index === 25 ? clientIds[1] : clientIds[0],
        index === 25 ? clientIds[1] : clientIds[0],
        `query-request-${index}`,
      );
    }

    const publicFirst = listPublicShowrooms({ q: "widget", page: 1 });
    assert.equal(publicFirst.items.length, 5);
    assert.equal(publicFirst.totalItems, 45);
    assert.equal(publicFirst.totalPages, 9);
    assert.ok(publicFirst.items.every((item) => item.industryKey === "electronics"));
    const publicLast = listPublicShowrooms({ q: "widget", page: 999 });
    assert.equal(publicLast.page, 9);
    assert.equal(publicLast.items.length, 5);

    const businesses = listBusinessesPage({ page: 2 });
    assert.equal(businesses.items.length, 10);
    assert.equal(businesses.page, 2);
    assert.equal(businesses.totalItems, 45);
    assert.equal(listManagedClientsPage({ page: 2 }).items.length, 10);
    assert.equal(listStaffPage({ page: 2 }).items.length, 10);
    assert.equal(listProductsPage(businessIds[0], { page: 1 }).items.length, 10);
    assert.equal(listProductsPage(businessIds[0], { page: 2 }).items.length, 10);

    const inquiries = listInquiriesPage(businessIds[0], { page: 1, q: "widget" });
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
    const clientRequests = listRequestsPage(clientOne, { page: 1 });
    assert.equal(clientRequests.totalItems, 24);
    assert.ok(clientRequests.items.every((request) => request.business_id === businessIds[0]));

    assert.ok(
      db.prepare("SELECT 1 FROM schema_migrations WHERE version=20").get(),
      "additive scale indexes are migrated",
    );
    const plan = db.prepare(`
      EXPLAIN QUERY PLAN
      SELECT * FROM products
      WHERE business_id=? AND is_published=1
      ORDER BY sort_order,id
    `).all(businessIds[0]) as Array<{ detail: string }>;
    assert.ok(
      plan.some((row) => row.detail.includes("product_business_published_order_idx")),
      "product page uses the scoped ordering index",
    );
    assert.equal((db.prepare("PRAGMA foreign_key_check").all() as unknown[]).length, 0);
    closeDbForTests();
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main()
  .then(() => console.log("Server-paginated collection query and tenant-scope tests passed."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
