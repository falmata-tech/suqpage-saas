import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  parseRevisionSnapshot,
  RevisionError,
  upgradeRevisionSnapshotToV3,
} from "../lib/revision-domain";
import { migrateDatabase } from "../lib/schema";
import { curatedManifestForLegacyDesign } from "../lib/showroom-manifests";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-stockless-"));
const databasePath = path.join(root, "stockless.db");
const db = new DatabaseSync(databasePath);

const tableColumns = (table: string) =>
  (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map(
    (row) => row.name,
  );

try {
  migrateDatabase(db);
  assert.equal(tableColumns("products").includes("stock_count"), false);
  assert.equal(tableColumns("option_values").includes("stock_count"), false);

  const manifest = curatedManifestForLegacyDesign("novatech");
  const businessId = Number(
    db
      .prepare(
        "INSERT INTO businesses(handle,name,design_key,design_manifest_json,status) VALUES('stockless-test','Stockless Test','composition',?,'active')",
      )
      .run(JSON.stringify(manifest)).lastInsertRowid,
  );
  const collectionId = Number(
    db
      .prepare(
        "INSERT INTO collections(business_id,name,slug) VALUES(?,'Main','main')",
      )
      .run(businessId).lastInsertRowid,
  );
  const categoryId = Number(
    db
      .prepare(
        "INSERT INTO categories(business_id,collection_id,name,slug) VALUES(?,?,'Coffee','coffee')",
      )
      .run(businessId, collectionId).lastInsertRowid,
  );
  const productId = Number(
    db
      .prepare(
        "INSERT INTO products(business_id,collection_id,category_id,name,slug,availability,is_published) VALUES(?,?,?,?,?,'limited',1)",
      )
      .run(businessId, collectionId, categoryId, "Forest Coffee", "forest-coffee")
      .lastInsertRowid,
  );
  const optionGroupId = Number(
    db
      .prepare(
        "INSERT INTO option_groups(product_id,name,position) VALUES(?,'Roast',0)",
      )
      .run(productId).lastInsertRowid,
  );
  const optionValueId = Number(
    db
      .prepare(
        "INSERT INTO option_values(option_group_id,value) VALUES(?,'Medium')",
      )
      .run(optionGroupId).lastInsertRowid,
  );
  const inquiryId = Number(
    db
      .prepare(
        "INSERT INTO inquiries(business_id,customer_name,contact) VALUES(?,'Demo Customer','demo@example.com')",
      )
      .run(businessId).lastInsertRowid,
  );
  db.prepare(
    "INSERT INTO inquiry_items(inquiry_id,product_id,product_name_snapshot,quantity) VALUES(?,?,?,20)",
  ).run(inquiryId, productId, "Forest Coffee");

  db.exec(`
    PRAGMA foreign_keys = OFF;
    BEGIN IMMEDIATE;
    DROP TRIGGER IF EXISTS product_collection_same_business_insert;
    DROP TRIGGER IF EXISTS product_collection_same_business_update;
    DROP TRIGGER IF EXISTS product_category_same_business_insert;
    DROP TRIGGER IF EXISTS product_category_same_business_update;
    DROP TRIGGER IF EXISTS inquiry_item_same_business_insert;
    CREATE TABLE products_legacy (
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
      stock_count INTEGER NOT NULL DEFAULT 0 CHECK(stock_count >= 0),
      is_published INTEGER NOT NULL DEFAULT 1 CHECK(is_published IN (0,1)),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(business_id, slug)
    );
    INSERT INTO products_legacy(
      id,business_id,collection_id,category_id,name,slug,eyebrow,description,
      image_path,availability,stock_count,is_published,sort_order,created_at
    )
    SELECT
      id,business_id,collection_id,category_id,name,slug,eyebrow,description,
      image_path,availability,7,is_published,sort_order,created_at
    FROM products;

    CREATE TABLE option_values_legacy (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      option_group_id INTEGER NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
      value TEXT NOT NULL,
      stock_count INTEGER NOT NULL DEFAULT 0 CHECK(stock_count >= 0),
      UNIQUE(option_group_id, value)
    );
    INSERT INTO option_values_legacy(id,option_group_id,value,stock_count)
    SELECT id,option_group_id,value,7 FROM option_values;

    DROP TABLE option_values;
    DROP TABLE products;
    ALTER TABLE products_legacy RENAME TO products;
    ALTER TABLE option_values_legacy RENAME TO option_values;
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
    DELETE FROM schema_migrations WHERE version=9;
    COMMIT;
    PRAGMA foreign_keys = ON;
  `);

  assert.equal(tableColumns("products").includes("stock_count"), true);
  assert.equal(tableColumns("option_values").includes("stock_count"), true);

  migrateDatabase(db);
  assert.equal(tableColumns("products").includes("stock_count"), false);
  assert.equal(tableColumns("option_values").includes("stock_count"), false);
  assert.deepEqual(
    {
      ...(db
        .prepare(
          "SELECT id,business_id,collection_id,category_id,name,availability FROM products WHERE id=?",
        )
        .get(productId) as Record<string, unknown>),
    },
    {
      id: productId,
      business_id: businessId,
      collection_id: collectionId,
      category_id: categoryId,
      name: "Forest Coffee",
      availability: "limited",
    },
  );
  assert.deepEqual(
    {
      ...(db
        .prepare(
          "SELECT id,option_group_id,value FROM option_values WHERE id=?",
        )
        .get(optionValueId) as Record<string, unknown>),
    },
    { id: optionValueId, option_group_id: optionGroupId, value: "Medium" },
  );
  assert.equal(
    (
      db
        .prepare(
          "SELECT product_id,quantity FROM inquiry_items WHERE inquiry_id=?",
        )
        .get(inquiryId) as { product_id: number; quantity: number }
    ).product_id,
    productId,
  );
  assert.equal(
    (
      db
        .prepare(
          "SELECT product_id,quantity FROM inquiry_items WHERE inquiry_id=?",
        )
        .get(inquiryId) as { product_id: number; quantity: number }
    ).quantity,
    20,
  );
  assert.equal(db.prepare("PRAGMA foreign_key_check").all().length, 0);
  assert.equal(
    (
      db
        .prepare(
          "SELECT COUNT(*) count FROM schema_migrations WHERE version=9",
        )
        .get() as { count: number }
    ).count,
    1,
  );

  migrateDatabase(db);
  assert.equal(
    (
      db.prepare("SELECT COUNT(*) count FROM products").get() as {
        count: number;
      }
    ).count,
    1,
  );

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
  assert.throws(
    () =>
      parseRevisionSnapshot({
        ...upgraded,
        products: [{ ...upgraded.products[0], stockCount: 1 }],
      }),
    (error: unknown) =>
      error instanceof RevisionError && /unsupported field/i.test(error.message),
  );

  console.log(
    "Stockless schema rebuild, relationship preservation, idempotency, and v2-to-v3 recovery passed.",
  );
} finally {
  db.close();
  fs.rmSync(root, { recursive: true, force: true });
}
