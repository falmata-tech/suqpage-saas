import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { migrateDatabase } from "../lib/schema";
import { parseRevisionSnapshot } from "../lib/revision-domain";
import { parsePublishedDesignManifest } from "../lib/showroom-manifests";

const root = fs.mkdtempSync(
  path.join(os.tmpdir(), "mirtpage-showroom-migration-"),
);

function legacySnapshot(designKey: string, name: string) {
  return JSON.stringify({
    schemaVersion: 1,
    business: {
      name,
      designKey,
      tagline: "Original tagline",
      description: "Original description",
      logoRef: "",
      heroTitle: "Original hero",
      heroSubtitle: "Original subtitle",
      heroImageRef: "",
      contactEmail: "",
      whatsapp: "",
      telegram: "",
      tiktok: "",
      siteTitle: name,
      siteDescription: "Original sharing description",
      faviconRef: "",
    },
    collections: [],
    categories: [],
    products: [],
  });
}

try {
  const db = new DatabaseSync(path.join(root, "migration.db"));
  migrateDatabase(db);
  db.prepare("DELETE FROM schema_migrations WHERE version=8").run();

  const identities = [
    ["alhayabrand", "Al Haya Brand", "alhaya"],
    ["usashopet", "USAshopET", "usashopet"],
    ["novatech", "NovaTech", "novatech"],
    ["homevibe", "HomeVibe", "homevibe"],
  ] as const;
  const businessIds = new Map<string, number>();
  for (const [handle, name, designKey] of identities) {
    const id = Number(
      db
        .prepare(
          "INSERT INTO businesses(handle,name,design_key,hero_title,status,content_version) VALUES(?,?,?,'Original hero','active',3)",
        )
        .run(handle, name, designKey).lastInsertRowid,
    );
    businessIds.set(handle, id);
    db.prepare(
      "INSERT INTO collections(business_id,name,slug,description) VALUES(?,'Original collection','original','Keep this content')",
    ).run(id);
  }
  const firstBusinessId = businessIds.get("alhayabrand")!;
  const userId = Number(
    db
      .prepare(
        "INSERT INTO users(email,password_hash,name,role,business_id) VALUES('migration-client@example.test','unused','Migration Client','owner',?)",
      )
      .run(firstBusinessId).lastInsertRowid,
  );
  const requestId = Number(
    db
      .prepare(
        "INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id) VALUES('REQ-MIGRATION01',?,?,'change','client_review','Migration Client','migration-client@example.test','Al Haya Brand','Preserve this request.','client',?)",
      )
      .run(firstBusinessId, userId, userId).lastInsertRowid,
  );
  const snapshot = legacySnapshot("alhaya", "Al Haya Brand");
  assert.throws(
    () =>
      parseRevisionSnapshot({
        ...JSON.parse(snapshot),
        executableHint: "ignored fields must not survive",
      }),
    /unsupported field/,
  );
  const revisionId = Number(
    db
      .prepare(
        "INSERT INTO content_revisions(request_id,business_id,revision_number,base_content_version,status,snapshot_json,summary,created_by_user_id,submitted_at) VALUES(?,?,1,3,'awaiting_review',?,'Preserve this summary',?,CURRENT_TIMESTAMP)",
      )
      .run(requestId, firstBusinessId, snapshot, userId).lastInsertRowid,
  );
  db.prepare(
    "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,source_revision_id,change_kind,actor_user_id) VALUES(?,3,?,?,'publication',?)",
  ).run(firstBusinessId, snapshot, revisionId, userId);

  const before = {
    businesses: db.prepare("SELECT COUNT(*) count FROM businesses").get() as {
      count: number;
    },
    collections: db.prepare("SELECT COUNT(*) count FROM collections").get() as {
      count: number;
    },
    revisions: db
      .prepare("SELECT COUNT(*) count FROM content_revisions")
      .get() as { count: number },
    publications: db
      .prepare("SELECT COUNT(*) count FROM published_catalog_versions")
      .get() as { count: number },
  };

  migrateDatabase(db);
  migrateDatabase(db);

  assert.equal(
    (
      db
        .prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=8")
        .get() as { count: number }
    ).count,
    1,
  );
  assert.equal(
    (
      db.prepare("SELECT COUNT(*) count FROM businesses").get() as {
        count: number;
      }
    ).count,
    before.businesses.count,
  );
  assert.equal(
    (
      db.prepare("SELECT COUNT(*) count FROM collections").get() as {
        count: number;
      }
    ).count,
    before.collections.count,
  );
  assert.equal(
    (
      db.prepare("SELECT COUNT(*) count FROM content_revisions").get() as {
        count: number;
      }
    ).count,
    before.revisions.count,
  );
  assert.equal(
    (
      db
        .prepare("SELECT COUNT(*) count FROM published_catalog_versions")
        .get() as { count: number }
    ).count,
    before.publications.count,
  );

  const migrated = db
    .prepare(
      "SELECT id,handle,design_key,design_manifest_json,hero_title,content_version FROM businesses ORDER BY id",
    )
    .all() as Array<{
    id: number;
    handle: string;
    design_key: string;
    design_manifest_json: string;
    hero_title: string;
    content_version: number;
  }>;
  const signatures = new Set<string>();
  for (const business of migrated) {
    assert.equal(business.design_key, "composition");
    assert.equal(business.hero_title, "Original hero");
    assert.equal(business.content_version, 3);
    const manifest = parsePublishedDesignManifest(business.design_manifest_json);
    signatures.add(
      `${manifest.tokenPack}:${manifest.sections.map((section) => section.component).join(",")}`,
    );
  }
  assert.equal(signatures.size, 4);

  const migratedRevision = db
    .prepare("SELECT id,status,summary,snapshot_json FROM content_revisions")
    .get() as {
    id: number;
    status: string;
    summary: string;
    snapshot_json: string;
  };
  assert.equal(migratedRevision.id, revisionId);
  assert.equal(migratedRevision.status, "awaiting_review");
  assert.equal(migratedRevision.summary, "Preserve this summary");
  assert.equal(
    parseRevisionSnapshot(migratedRevision.snapshot_json).schemaVersion,
    2,
  );
  const migratedPublication = db
    .prepare(
      "SELECT content_version,source_revision_id,snapshot_json FROM published_catalog_versions",
    )
    .get() as {
    content_version: number;
    source_revision_id: number;
    snapshot_json: string;
  };
  assert.equal(migratedPublication.content_version, 3);
  assert.equal(migratedPublication.source_revision_id, revisionId);
  assert.equal(
    parseRevisionSnapshot(migratedPublication.snapshot_json).schemaVersion,
    2,
  );
  assert.equal(
    (
      db.prepare("SELECT COUNT(*) count FROM businesses WHERE design_key!='composition' OR design_manifest_json=''").get() as {
        count: number;
      }
    ).count,
    0,
  );
  assert.equal(
    (
      db.prepare("SELECT COUNT(*) count FROM content_revisions WHERE json_extract(snapshot_json,'$.schemaVersion')!=2").get() as {
        count: number;
      }
    ).count,
    0,
  );
  db.close();

  const unsafeDb = new DatabaseSync(path.join(root, "unsafe.db"));
  migrateDatabase(unsafeDb);
  unsafeDb.prepare("DELETE FROM schema_migrations WHERE version=8").run();
  unsafeDb
    .prepare(
      "INSERT INTO businesses(handle,name,design_key,status) VALUES('unsafe','Unsafe','unknown-renderer','active')",
    )
    .run();
  assert.throws(() => migrateDatabase(unsafeDb), /not supported/);
  assert.equal(
    (
      unsafeDb
        .prepare(
          "SELECT design_key,design_manifest_json FROM businesses WHERE handle='unsafe'",
        )
        .get() as { design_key: string; design_manifest_json: string }
    ).design_key,
    "unknown-renderer",
  );
  assert.equal(
    (
      unsafeDb
        .prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=8")
        .get() as { count: number }
    ).count,
    0,
  );
  unsafeDb.close();

  console.log(
    "Four-client composition migration, data preservation, idempotency, and atomic failure tests passed.",
  );
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
