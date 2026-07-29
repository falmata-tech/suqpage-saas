import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { migrateDatabase } from "../lib/schema";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-offerings-"));
const databasePath = path.join(root, "offerings.db");
const db = new DatabaseSync(databasePath);

try {
  migrateDatabase(db);
  const businessId = Number(
    db.prepare(
      "INSERT INTO businesses(handle,name,design_key,status) VALUES('legacy-offerings','Legacy Offerings','composition','active')",
    ).run().lastInsertRowid,
  );
  const productId = Number(
    db.prepare(
      "INSERT INTO products(business_id,name,slug,availability) VALUES(?,'Legacy product','legacy-product','available')",
    ).run(businessId).lastInsertRowid,
  );
  const inquiryId = Number(
    db.prepare(
      "INSERT INTO inquiries(business_id,customer_name,contact) VALUES(?,'Buyer','buyer@example.test')",
    ).run(businessId).lastInsertRowid,
  );
  const inquiryItemId = Number(
    db.prepare(
      "INSERT INTO inquiry_items(inquiry_id,product_id,product_name_snapshot,quantity) VALUES(?,?,?,20)",
    ).run(inquiryId, productId, "Legacy product").lastInsertRowid,
  );

  db.exec(`
    PRAGMA foreign_keys = OFF;
    BEGIN IMMEDIATE;
    DROP TRIGGER IF EXISTS product_collection_same_business_insert;
    DROP TRIGGER IF EXISTS product_collection_same_business_update;
    DROP TRIGGER IF EXISTS product_category_same_business_insert;
    DROP TRIGGER IF EXISTS product_category_same_business_update;
    DROP TRIGGER IF EXISTS inquiry_item_same_business_insert;

    CREATE TABLE products_v17 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      eyebrow TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image_path TEXT DEFAULT '',
      availability TEXT NOT NULL DEFAULT 'available'
        CHECK(availability IN ('available','limited','unavailable','coming_soon')),
      is_published INTEGER NOT NULL DEFAULT 1 CHECK(is_published IN (0,1)),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(business_id, slug)
    );
    INSERT INTO products_v17(
      id,business_id,collection_id,category_id,name,slug,eyebrow,description,
      image_path,availability,is_published,sort_order,created_at
    )
    SELECT
      id,business_id,collection_id,category_id,name,slug,eyebrow,description,
      image_path,availability,is_published,sort_order,created_at
    FROM products;

    CREATE TABLE inquiry_items_v17 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inquiry_id INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name_snapshot TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity BETWEEN 1 AND 20),
      options_json TEXT NOT NULL DEFAULT '{}'
    );
    INSERT INTO inquiry_items_v17(
      id,inquiry_id,product_id,product_name_snapshot,quantity,options_json
    )
    SELECT id,inquiry_id,product_id,product_name_snapshot,quantity,options_json
    FROM inquiry_items;

    DROP TABLE inquiry_items;
    DROP TABLE products;
    ALTER TABLE products_v17 RENAME TO products;
    ALTER TABLE inquiry_items_v17 RENAME TO inquiry_items;

    CREATE TRIGGER product_collection_same_business_insert
    BEFORE INSERT ON products WHEN NEW.collection_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM collections
        WHERE id=NEW.collection_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'collection does not belong to business') END;
    END;
    CREATE TRIGGER product_collection_same_business_update
    BEFORE UPDATE OF collection_id,business_id ON products
    WHEN NEW.collection_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM collections
        WHERE id=NEW.collection_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'collection does not belong to business') END;
    END;
    CREATE TRIGGER product_category_same_business_insert
    BEFORE INSERT ON products WHEN NEW.category_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM categories
        WHERE id=NEW.category_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'category does not belong to business') END;
    END;
    CREATE TRIGGER product_category_same_business_update
    BEFORE UPDATE OF category_id,business_id ON products
    WHEN NEW.category_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM categories
        WHERE id=NEW.category_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'category does not belong to business') END;
    END;
    CREATE TRIGGER inquiry_item_same_business_insert
    BEFORE INSERT ON inquiry_items WHEN NEW.product_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM inquiries i JOIN products p ON p.id=NEW.product_id
        WHERE i.id=NEW.inquiry_id AND i.business_id=p.business_id
      ) THEN RAISE(ABORT, 'product does not belong to inquiry business') END;
    END;
    DELETE FROM schema_migrations WHERE version IN (18,19);
    COMMIT;
    PRAGMA foreign_keys = ON;
  `);

  assert.throws(
    () => migrateDatabase(db),
    /requires a stopped single-instance deployment/,
  );
  assert.equal(
    (db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=18").get() as { count: number }).count,
    0,
  );

  let checkpointLabel = "";
  migrateDatabase(db, {
    assertDestructiveMigrationCheckpoint(label) {
      checkpointLabel = label;
    },
  });
  assert.equal(checkpointLabel, "Unified offering inquiry migration");
  const columns = (table: string) =>
    (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map(
      (column) => column.name,
    );
  assert.ok(columns("products").includes("offering_kind"));
  assert.ok(columns("products").includes("quantity_mode"));
  assert.ok(columns("inquiry_items").includes("offering_kind_snapshot"));
  assert.ok(columns("inquiry_items").includes("quantity_mode_snapshot"));
  assert.ok(columns("inquiry_items").includes("quantity_intent"));
  assert.deepEqual(
    {
      ...(db.prepare(
        "SELECT id,offering_kind,quantity_mode,capacity_summary,minimum_order_summary,lead_time_summary FROM products WHERE id=?",
      ).get(productId) as Record<string, unknown>),
    },
    {
      id: productId,
      offering_kind: "standard_product",
      quantity_mode: "required",
      capacity_summary: "",
      minimum_order_summary: "",
      lead_time_summary: "",
    },
  );
  assert.deepEqual(
    {
      ...(db.prepare(
        "SELECT id,inquiry_id,product_id,quantity,quantity_intent,offering_kind_snapshot,quantity_mode_snapshot FROM inquiry_items WHERE id=?",
      ).get(inquiryItemId) as Record<string, unknown>),
    },
    {
      id: inquiryItemId,
      inquiry_id: inquiryId,
      product_id: productId,
      quantity: 20,
      quantity_intent: "20",
      offering_kind_snapshot: "standard_product",
      quantity_mode_snapshot: "required",
    },
  );
  assert.doesNotThrow(() =>
    db.prepare(
      "INSERT INTO inquiry_items(inquiry_id,product_id,product_name_snapshot,quantity,quantity_intent,offering_kind_snapshot,quantity_mode_snapshot) VALUES(?,?,?,NULL,'one pallet','manufacturing_capability','optional')",
    ).run(inquiryId, productId, "Custom capability"),
  );
  assert.throws(() =>
    db.prepare(
      "UPDATE products SET offering_kind='unsupported' WHERE id=?",
    ).run(productId),
  );
  assert.equal(db.prepare("PRAGMA integrity_check").get()?.integrity_check, "ok");
  assert.equal(db.prepare("PRAGMA foreign_key_check").all().length, 0);
  assert.equal(
    (db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=18").get() as { count: number }).count,
    1,
  );
  assert.equal(
    (db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=19").get() as { count: number }).count,
    1,
  );

  migrateDatabase(db);
  assert.equal(
    (db.prepare("SELECT COUNT(*) count FROM products").get() as { count: number }).count,
    1,
  );
  console.log(
    "Unified offering migration checkpoint, defaults, inquiry preservation, constraints, and idempotency passed.",
  );
} finally {
  db.close();
  fs.rmSync(root, { recursive: true, force: true });
}
