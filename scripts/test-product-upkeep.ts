import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-upkeep-"));
  process.env.SUQPAGE_DB_PATH = path.join(root, "upkeep.db");
  process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.SUQPAGE_BACKUP_ROOT = path.join(root, "backups");
  process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED = "1";
  try {
    const { closeDbForTests, getCatalogByBusinessId, getDb, getUserById } =
      await import("../lib/db");
    const { catalogToRevisionSnapshot } = await import(
      "../lib/revision-domain"
    );
    const { curatedManifestForLegacyDesign } = await import(
      "../lib/showroom-manifests"
    );
    const { executeBasicProductUpkeep: executeWithPort } = await import(
      "../lib/product-upkeep"
    );
    const { sqliteProductUpkeepPort } = await import(
      "../lib/product-upkeep-sqlite"
    );
    const { ProductUpkeepError } = await import(
      "../lib/product-upkeep-domain"
    );
    const { stageUploadedImage } = await import("../lib/media");
    const { migrateDatabase } = await import("../lib/schema");
    const { assertDestructiveMigrationCheckpoint } = await import(
      "../lib/migration-checkpoint"
    );
    const executeBasicProductUpkeep = (
      user: Parameters<typeof executeWithPort>[1],
      command: Parameters<typeof executeWithPort>[2],
      stagedImage: Parameters<typeof executeWithPort>[3],
    ) =>
      executeWithPort(
        sqliteProductUpkeepPort,
        user,
        command,
        stagedImage,
      );
    const db = getDb();

    const createBusiness = (handle: string, name: string) => {
      const businessId = Number(
        db
          .prepare(
            "INSERT INTO businesses(handle,name,design_key,design_manifest_json,status) VALUES(?,?,'composition',?,'active')",
          )
          .run(
            handle,
            name,
            JSON.stringify(curatedManifestForLegacyDesign("novatech")),
          ).lastInsertRowid,
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
            "INSERT INTO categories(business_id,collection_id,name,slug) VALUES(?,?,'Featured','featured')",
          )
          .run(businessId, collectionId).lastInsertRowid,
      );
      const productId = Number(
        db
          .prepare(
            `INSERT INTO products(
              business_id,collection_id,category_id,name,slug,eyebrow,
              description,image_path,availability,is_published,sort_order
            ) VALUES(?,?,?,'Original product','stable-product','Protected label',
              'Original description','','available',1,7)`,
          )
          .run(businessId, collectionId, categoryId).lastInsertRowid,
      );
      const groupId = Number(
        db
          .prepare(
            "INSERT INTO option_groups(product_id,name,position) VALUES(?,'Color',0)",
          )
          .run(productId).lastInsertRowid,
      );
      db.prepare(
        "INSERT INTO option_values(option_group_id,value) VALUES(?,'Blue')",
      ).run(groupId);
      const snapshot = catalogToRevisionSnapshot(
        getCatalogByBusinessId(businessId, true)!,
      );
      db.prepare(
        "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind) VALUES(?,1,?,'baseline')",
      ).run(businessId, JSON.stringify(snapshot));
      return { businessId, collectionId, categoryId, productId };
    };
    const tenantA = createBusiness("upkeep-a", "Upkeep A");
    const tenantB = createBusiness("upkeep-b", "Upkeep B");
    db.exec(`
      PRAGMA foreign_keys=OFF;
      BEGIN IMMEDIATE;
      DROP TABLE product_upkeep_commands;
      CREATE TABLE published_catalog_versions_v9 (
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        content_version INTEGER NOT NULL CHECK(content_version > 0),
        snapshot_json TEXT NOT NULL,
        source_revision_id INTEGER REFERENCES content_revisions(id) ON DELETE SET NULL,
        change_kind TEXT NOT NULL CHECK(change_kind IN ('baseline','publication','rollback')),
        actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(business_id,content_version)
      );
      INSERT INTO published_catalog_versions_v9
        SELECT * FROM published_catalog_versions;
      DROP TABLE published_catalog_versions;
      ALTER TABLE published_catalog_versions_v9
        RENAME TO published_catalog_versions;
      DELETE FROM schema_migrations WHERE version=10;
      COMMIT;
      PRAGMA foreign_keys=ON;
    `);
    assert.throws(
      () => migrateDatabase(db),
      /requires a stopped single-instance deployment/,
    );
    db.exec("PRAGMA wal_checkpoint(FULL)");
    const checkpoint = path.join(
      process.env.SUQPAGE_BACKUP_ROOT,
      "product-upkeep-checkpoint",
    );
    fs.mkdirSync(checkpoint, { recursive: true });
    const checkpointDatabase = path.join(checkpoint, "suqpage.db");
    fs.copyFileSync(process.env.SUQPAGE_DB_PATH, checkpointDatabase);
    const databaseBytes = fs.statSync(checkpointDatabase).size;
    const databaseSha256 = crypto
      .createHash("sha256")
      .update(fs.readFileSync(checkpointDatabase))
      .digest("hex");
    fs.writeFileSync(
      path.join(checkpoint, "backup.json"),
      JSON.stringify({
        createdAt: new Date().toISOString(),
        sourceDatabase: process.env.SUQPAGE_DB_PATH,
        integrity: "ok",
        foreignKeyFailures: 0,
        databaseBytes,
        databaseSha256,
      }),
    );
    process.env.SUQPAGE_APPROVE_DESTRUCTIVE_MIGRATIONS = "1";
    migrateDatabase(db, { assertDestructiveMigrationCheckpoint });
    assert.equal(
      db
        .prepare(
          "SELECT COUNT(*) count FROM published_catalog_versions WHERE content_version=1",
        )
        .get()?.count,
      2,
    );
    assert.equal(
      db
        .prepare(
          "SELECT COUNT(*) count FROM schema_migrations WHERE version=10",
        )
        .get()?.count,
      1,
    );

    const createUser = (
      email: string,
      accessRole:
        | "client"
        | "team_member"
        | "operations_manager"
        | "platform_admin",
      businessId: number | null = null,
    ) => {
      const userId = Number(
        db
          .prepare(
            "INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused',?,?,?)",
          )
          .run(
            email,
            email,
            accessRole === "client" ? "owner" : "admin",
            businessId,
          ).lastInsertRowid,
      );
      db.prepare(
        "INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)",
      ).run(userId, accessRole);
      return getUserById(userId)!;
    };
    const clientA = createUser(
      "client-a@example.test",
      "client",
      tenantA.businessId,
    );
    const clientB = createUser(
      "client-b@example.test",
      "client",
      tenantB.businessId,
    );
    const assignedTeam = createUser("team-a@example.test", "team_member");
    const unassignedTeam = createUser("team-b@example.test", "team_member");
    const manager = createUser("manager@example.test", "operations_manager");
    const admin = createUser("admin@example.test", "platform_admin");
    db.prepare(
      "INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,1)",
    ).run(assignedTeam.id, tenantA.businessId, manager.id);

    const command = (
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      kind: "create",
      businessId: tenantA.businessId,
      productId: null,
      expectedContentVersion: 1,
      idempotencyKey: "upkeep_create_000001",
      name: "New client product",
      description: "A client-created product description.",
      availability: "limited",
      offeringKind: "manufacturing_capability",
      quantityMode: "optional",
      capacitySummary: "Up to 500 assemblies per month",
      minimumOrderSummary: "Prototype or 25-unit production run",
      leadTimeSummary: "Prototype in 10 working days",
      categoryId: tenantA.categoryId,
      imageAction: "keep",
      serviceNote: "",
      ...overrides,
    });
    const throwsCode = (code: string) => (error: unknown) =>
      error instanceof ProductUpkeepError && error.code === code;

    let invalidImageDiscarded = false;
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({ name: "", imageAction: "replace" }),
          {
            imageRef: "/media/uncommitted-invalid.png",
            digest: "invalid-upload-digest",
            discard: () => {
              invalidImageDiscarded = true;
            },
          },
        ),
      /Product name is required/,
    );
    assert.equal(invalidImageDiscarded, true);
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({ offeringKind: "service" }),
          null,
        ),
      /valid offering type/,
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({ quantityMode: "inventory" }),
          null,
        ),
      /desired-quantity policy/,
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({ capacitySummary: "x".repeat(181) }),
          null,
        ),
      /Capacity is too long/,
    );

    const created = executeBasicProductUpkeep(clientA, command(), null);
    assert.deepEqual(
      { version: created.contentVersion, duplicate: created.duplicate },
      { version: 2, duplicate: false },
    );
    const createdProduct = db
      .prepare(
        "SELECT business_id,collection_id,category_id,is_published,availability,offering_kind,quantity_mode,capacity_summary,minimum_order_summary,lead_time_summary FROM products WHERE id=?",
      )
      .get(created.productId) as Record<string, unknown>;
    assert.deepEqual(
      { ...createdProduct },
      {
        business_id: tenantA.businessId,
        collection_id: null,
        category_id: tenantA.categoryId,
        is_published: 1,
        availability: "limited",
        offering_kind: "manufacturing_capability",
        quantity_mode: "optional",
        capacity_summary: "Up to 500 assemblies per month",
        minimum_order_summary: "Prototype or 25-unit production run",
        lead_time_summary: "Prototype in 10 working days",
      },
    );
    assert.equal(
      db
        .prepare(
          "SELECT change_kind FROM published_catalog_versions WHERE business_id=? AND content_version=2",
        )
        .get(tenantA.businessId)?.change_kind,
      "product_upkeep",
    );

    const retry = executeBasicProductUpkeep(clientA, command(), null);
    assert.deepEqual(
      { id: retry.productId, duplicate: retry.duplicate },
      { id: created.productId, duplicate: true },
    );
    assert.equal(
      db.prepare("SELECT content_version FROM businesses WHERE id=?").get(
        tenantA.businessId,
      )?.content_version,
      2,
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({ name: "Conflicting reuse" }),
          null,
        ),
      throwsCode("idempotency_conflict"),
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({
            idempotencyKey: "upkeep_stale_000001",
            expectedContentVersion: 1,
          }),
          null,
        ),
      throwsCode("stale_version"),
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientB,
          command({
            idempotencyKey: "upkeep_cross_000001",
            expectedContentVersion: 2,
          }),
          null,
        ),
      (error: unknown) =>
        error instanceof ProductUpkeepError && error.status === 403,
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          unassignedTeam,
          command({
            idempotencyKey: "upkeep_unassigned_1",
            expectedContentVersion: 2,
            serviceNote: "Client support request.",
          }),
          null,
        ),
      (error: unknown) =>
        error instanceof ProductUpkeepError && error.status === 403,
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          assignedTeam,
          command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_note_000001",
            expectedContentVersion: 2,
          }),
          null,
        ),
      throwsCode("service_note_required"),
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({
            idempotencyKey: "upkeep_collection_01",
            expectedContentVersion: 2,
            collectionId: tenantA.collectionId,
          }),
          null,
        ),
      throwsCode("unsupported_fields"),
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_structure_01",
            expectedContentVersion: 2,
            categoryId: tenantB.categoryId,
          }),
          null,
        ),
      throwsCode("structure_not_found"),
    );

    const teamUpdate = executeBasicProductUpkeep(
      assignedTeam,
      command({
        kind: "update",
        productId: tenantA.productId,
        idempotencyKey: "upkeep_team_000001",
        expectedContentVersion: 2,
        name: "Team-assisted name",
        description: "Updated on behalf of the client.",
        availability: "coming_soon",
        serviceNote: "Client requested this update by phone.",
      }),
      null,
    );
    assert.equal(teamUpdate.contentVersion, 3);
    assert.deepEqual(
      {
        ...(db
          .prepare(
            "SELECT collection_id,category_id,slug,eyebrow,is_published,sort_order FROM products WHERE id=?",
          )
          .get(tenantA.productId) as Record<string, unknown>),
      },
      {
        collection_id: null,
        category_id: tenantA.categoryId,
        slug: "stable-product",
        eyebrow: "Protected label",
        is_published: 1,
        sort_order: 7,
      },
    );
    assert.equal(
      db
        .prepare(
          "SELECT COUNT(*) count FROM option_values v JOIN option_groups g ON g.id=v.option_group_id WHERE g.product_id=? AND g.name='Color' AND v.value='Blue'",
        )
        .get(tenantA.productId)?.count,
      1,
    );

    const imageBytes = await sharp({
      create: {
        width: 8,
        height: 8,
        channels: 4,
        background: { r: 90, g: 40, b: 180, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const replacement = await stageUploadedImage(
      new File([imageBytes], "product.png", { type: "image/png" }),
      "product",
    );
    assert.ok(replacement);
    const managerUpdate = executeBasicProductUpkeep(
      manager,
      command({
        kind: "update",
        productId: tenantA.productId,
        idempotencyKey: "upkeep_manager_0001",
        expectedContentVersion: 3,
        name: "Manager-assisted name",
        description: "Manager supplied the verified image.",
        availability: "available",
        imageAction: "replace",
        serviceNote: "Image supplied during managed onboarding.",
      }),
      replacement,
    );
    assert.equal(managerUpdate.contentVersion, 4);
    const retainedImageRef = String(
      db.prepare("SELECT image_path FROM products WHERE id=?").get(
        tenantA.productId,
      )?.image_path,
    );
    const retainedImageFile = path.join(
      process.env.SUQPAGE_MEDIA_ROOT,
      path.basename(retainedImageRef),
    );
    assert.match(retainedImageRef, /^\/media\/product-/);
    assert.equal(fs.existsSync(retainedImageFile), true);

    const staleImage = await stageUploadedImage(
      new File([imageBytes], "stale.png", { type: "image/png" }),
      "product",
    );
    assert.ok(staleImage);
    const staleFile = path.join(
      process.env.SUQPAGE_MEDIA_ROOT,
      path.basename(staleImage.imageRef),
    );
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          admin,
          command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_admin_stale1",
            expectedContentVersion: 3,
            imageAction: "replace",
            serviceNote: "Attempted stale support update.",
          }),
          staleImage,
        ),
      throwsCode("stale_version"),
    );
    assert.equal(fs.existsSync(staleFile), false);

    const removed = executeBasicProductUpkeep(
      admin,
      command({
        kind: "update",
        productId: tenantA.productId,
        idempotencyKey: "upkeep_admin_remove1",
        expectedContentVersion: 4,
        name: "Admin-assisted name",
        description: "Image removed while preserving retained history.",
        imageAction: "remove",
        serviceNote: "Client asked an administrator to remove the image.",
      }),
      null,
    );
    assert.equal(removed.contentVersion, 5);
    assert.equal(
      db.prepare("SELECT image_path FROM products WHERE id=?").get(
        tenantA.productId,
      )?.image_path,
      "",
    );
    assert.equal(fs.existsSync(retainedImageFile), true);
    assert.equal(
      String(
        db
          .prepare(
            "SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=4",
          )
          .get(tenantA.businessId)?.snapshot_json,
      ).includes(retainedImageRef),
      true,
    );

    process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED = "0";
    assert.throws(
      () =>
        executeBasicProductUpkeep(
          clientA,
          command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_disabled_001",
            expectedContentVersion: 5,
          }),
          null,
        ),
      throwsCode("feature_disabled"),
    );
    process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED = "1";

    assert.equal(db.prepare("PRAGMA foreign_key_check").all().length, 0);
    assert.equal(
      db
        .prepare(
          "SELECT COUNT(*) count FROM audit_logs WHERE action='product.basic_upkeep_published'",
        )
        .get()?.count,
      4,
    );
    console.log(
      "Product upkeep role scope, protected fields, versions, idempotency, media cleanup, retention, and disable control passed.",
    );
    closeDbForTests();
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
