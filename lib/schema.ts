import type { DatabaseSync } from "node:sqlite";
import {
  parseRevisionSnapshot,
  upgradeRevisionSnapshotToV2,
} from "./revision-domain";
import { resolveDesignManifest } from "./showroom-manifests";

function columns(db: DatabaseSync, table: string) {
  return new Set((db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((row) => row.name));
}

function addColumn(db: DatabaseSync, table: string, definition: string) {
  const name = definition.trim().split(/\s+/)[0];
  if (!columns(db, table).has(name)) {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`); }
    catch (error) { if (!(error instanceof Error) || !/duplicate column name/i.test(error.message)) throw error; }
  }
}

export type MigrationOptions = {
  assertDestructiveMigrationCheckpoint?: (label: string) => void;
};

function requireDestructiveMigrationCheckpoint(
  options: MigrationOptions,
  label: string,
) {
  if (!options.assertDestructiveMigrationCheckpoint) {
    throw new Error(
      `${label} requires a stopped single-instance deployment, npm run backup, and the approved npm run migrate command.`,
    );
  }
  options.assertDestructiveMigrationCheckpoint(label);
}

export function migrateDatabase(
  db: DatabaseSync,
  options: MigrationOptions = {},
) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handle TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      design_key TEXT NOT NULL,
      content_blocks_json TEXT NOT NULL DEFAULT '{"schemaVersion":1,"blocks":[]}',
      tagline TEXT DEFAULT '',
      description TEXT DEFAULT '',
      logo_path TEXT DEFAULT '',
      hero_title TEXT DEFAULT '',
      hero_subtitle TEXT DEFAULT '',
      hero_image_path TEXT DEFAULT '',
      contact_email TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      telegram TEXT DEFAULT '',
      tiktok TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('active','draft','suspended')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','owner')),
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
      UNIQUE(business_id, slug)
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
      UNIQUE(business_id, slug)
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      eyebrow TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image_path TEXT DEFAULT '',
      availability TEXT NOT NULL DEFAULT 'available' CHECK(availability IN ('available','limited','unavailable','coming_soon')),
      is_published INTEGER NOT NULL DEFAULT 1 CHECK(is_published IN (0,1)),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(business_id, slug)
    );
    CREATE TABLE IF NOT EXISTS option_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      UNIQUE(product_id, name)
    );
    CREATE TABLE IF NOT EXISTS option_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      option_group_id INTEGER NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
      value TEXT NOT NULL,
      UNIQUE(option_group_id, value)
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      contact TEXT NOT NULL,
      contact_method TEXT NOT NULL DEFAULT 'phone',
      note TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','confirmed','closed','cancelled')),
      source TEXT NOT NULL DEFAULT 'showroom',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS inquiry_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inquiry_id INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name_snapshot TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity BETWEEN 1 AND 20),
      options_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS delivery_companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      service_area TEXT DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
    );
    CREATE TABLE IF NOT EXISTS delivery_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      inquiry_id INTEGER REFERENCES inquiries(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      pickup_address TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      package_count INTEGER NOT NULL DEFAULT 1 CHECK(package_count BETWEEN 1 AND 100),
      note TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('draft','submitted','viewed','accepted','driver_assigned','picked_up','delivered','cancelled')),
      external_request_id TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS delivery_request_companies (
      delivery_request_id INTEGER NOT NULL REFERENCES delivery_requests(id) ON DELETE CASCADE,
      company_id INTEGER NOT NULL REFERENCES delivery_companies(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'sent',
      PRIMARY KEY(delivery_request_id, company_id)
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL,
      ip_hash TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      revoked_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      blocked_until INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      detail TEXT DEFAULT '',
      ip_hash TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_ref TEXT UNIQUE NOT NULL,
      business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL,
      represented_client_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      request_type TEXT NOT NULL CHECK(request_type IN ('onboarding','change')),
      status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN (
        'submitted','under_review','needs_information','approved_for_work',
        'in_progress','client_review','client_approved','published','completed',
        'rejected','cancelled'
      )),
      contact_name TEXT NOT NULL,
      contact_value TEXT NOT NULL,
      business_name TEXT DEFAULT '',
      request_text TEXT NOT NULL,
      submitter_kind TEXT NOT NULL CHECK(submitter_kind IN ('public','client','manager')),
      submitted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      idempotency_key TEXT,
      ip_hash TEXT DEFAULT '',
      notification_state TEXT NOT NULL DEFAULT 'pending' CHECK(notification_state IN ('pending','sent','failed','not_required')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS request_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
      storage_key TEXT UNIQUE NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL CHECK(mime_type IN ('image/jpeg','image/png','image/webp')),
      byte_size INTEGER NOT NULL CHECK(byte_size BETWEEN 1 AND 5242880),
      width INTEGER NOT NULL CHECK(width BETWEEN 1 AND 20000),
      height INTEGER NOT NULL CHECK(height BETWEEN 1 AND 20000),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS recipe_media_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
      asset_key TEXT UNIQUE NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('image','youtube')),
      label TEXT NOT NULL,
      request_attachment_id INTEGER UNIQUE REFERENCES request_attachments(id) ON DELETE CASCADE,
      provider_id TEXT,
      rights_acknowledged INTEGER NOT NULL CHECK(rights_acknowledged=1),
      added_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK(
        (kind='image' AND request_attachment_id IS NOT NULL AND provider_id IS NULL)
        OR
        (kind='youtube' AND request_attachment_id IS NULL AND provider_id IS NOT NULL)
      )
    );
    CREATE TABLE IF NOT EXISTS request_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
      actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL,
      detail TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS staff_business_assignments (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      assigned_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user_id,business_id)
    );
    CREATE TABLE IF NOT EXISTS user_access_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      access_role TEXT NOT NULL CHECK(access_role IN (
        'platform_admin','client','team_member','operations_manager'
      )),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS client_invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      accepted_at INTEGER,
      accepted_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      revoked_at INTEGER,
      created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS content_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      revision_number INTEGER NOT NULL CHECK(revision_number > 0),
      base_content_version INTEGER NOT NULL CHECK(base_content_version > 0),
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','awaiting_review','approved','rejected','published','superseded')),
      snapshot_json TEXT NOT NULL,
      snapshot_schema_version INTEGER NOT NULL DEFAULT 3 CHECK(snapshot_schema_version IN (1,2,3,4)),
      summary TEXT NOT NULL DEFAULT '',
      recipe_import_hash TEXT,
      recipe_metadata_json TEXT,
      recipe_imported_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      recipe_imported_at TEXT,
      created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      submitted_at TEXT,
      decided_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      decision_comment TEXT NOT NULL DEFAULT '',
      decided_at TEXT,
      published_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      published_at TEXT,
      published_content_version INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(request_id,revision_number)
    );
    CREATE TABLE IF NOT EXISTS published_catalog_versions (
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      content_version INTEGER NOT NULL CHECK(content_version > 0),
      snapshot_json TEXT NOT NULL,
      source_revision_id INTEGER REFERENCES content_revisions(id) ON DELETE SET NULL,
      change_kind TEXT NOT NULL CHECK(change_kind IN ('baseline','publication','rollback','product_upkeep')),
      actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(business_id,content_version)
    );
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  addColumn(db, "businesses", "site_title TEXT DEFAULT ''");
  addColumn(db, "businesses", "site_description TEXT DEFAULT ''");
  addColumn(db, "businesses", "favicon_path TEXT DEFAULT ''");
  addColumn(db, "businesses", "content_version INTEGER NOT NULL DEFAULT 1");
  const existingUserColumns = columns(db, "users");
  const addedMustChange = !existingUserColumns.has("must_change_password");
  addColumn(db, "users", "must_change_password INTEGER NOT NULL DEFAULT 0");
  if (addedMustChange) db.exec("UPDATE users SET must_change_password=1");
  addColumn(db, "users", "password_updated_at TEXT");
  addColumn(db, "users", "created_at TEXT");
  db.exec("UPDATE users SET created_at=CURRENT_TIMESTAMP WHERE created_at IS NULL");
  addColumn(db, "inquiries", "idempotency_key TEXT");
  addColumn(db, "inquiries", "ip_hash TEXT DEFAULT ''");
  addColumn(db, "inquiries", "updated_at TEXT");
  addColumn(db, "delivery_requests", "idempotency_key TEXT");
  addColumn(db, "content_revisions", "recipe_import_hash TEXT");
  addColumn(db, "content_revisions", "recipe_metadata_json TEXT");
  addColumn(
    db,
    "content_revisions",
    "recipe_imported_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL",
  );
  addColumn(db, "content_revisions", "recipe_imported_at TEXT");

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS inquiry_idempotency_unique
      ON inquiries(business_id, idempotency_key)
      WHERE idempotency_key IS NOT NULL AND idempotency_key != '';
    CREATE UNIQUE INDEX IF NOT EXISTS delivery_idempotency_unique
      ON delivery_requests(business_id, idempotency_key)
      WHERE idempotency_key IS NOT NULL AND idempotency_key != '';
    CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS inquiry_business_created_idx ON inquiries(business_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS delivery_business_created_idx ON delivery_requests(business_id, created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS request_public_idempotency_unique
      ON service_requests(ip_hash,idempotency_key)
      WHERE submitter_kind='public' AND idempotency_key IS NOT NULL AND idempotency_key != '';
    CREATE UNIQUE INDEX IF NOT EXISTS request_client_idempotency_unique
      ON service_requests(submitted_by_user_id,idempotency_key)
      WHERE submitter_kind='client' AND idempotency_key IS NOT NULL AND idempotency_key != '';
    CREATE UNIQUE INDEX IF NOT EXISTS request_manager_idempotency_unique
      ON service_requests(submitted_by_user_id,idempotency_key)
      WHERE submitter_kind='manager' AND idempotency_key IS NOT NULL AND idempotency_key != '';
    CREATE INDEX IF NOT EXISTS request_status_created_idx ON service_requests(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS request_business_created_idx ON service_requests(business_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS request_assignee_created_idx ON service_requests(assigned_user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS request_event_request_idx ON request_events(request_id, created_at, id);
    CREATE INDEX IF NOT EXISTS invitation_request_idx ON client_invitations(request_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS invitation_expiry_idx ON client_invitations(expires_at);
    CREATE INDEX IF NOT EXISTS revision_request_number_idx ON content_revisions(request_id,revision_number DESC);
    CREATE INDEX IF NOT EXISTS revision_business_status_idx ON content_revisions(business_id,status,created_at DESC);
    CREATE TRIGGER IF NOT EXISTS submitted_revision_content_immutable
    BEFORE UPDATE OF snapshot_json,summary,base_content_version ON content_revisions
    WHEN OLD.status != 'draft'
    BEGIN
      SELECT RAISE(ABORT, 'submitted revision content is immutable');
    END;
    CREATE TRIGGER IF NOT EXISTS public_request_attachment_denied
    BEFORE INSERT ON request_attachments
    WHEN EXISTS (SELECT 1 FROM service_requests WHERE id=NEW.request_id AND submitter_kind='public')
    BEGIN
      SELECT RAISE(ABORT, 'public interest requests cannot have attachments');
    END;
    CREATE TRIGGER IF NOT EXISTS public_request_attachment_move_denied
    BEFORE UPDATE OF request_id ON request_attachments
    WHEN EXISTS (SELECT 1 FROM service_requests WHERE id=NEW.request_id AND submitter_kind='public')
    BEGIN
      SELECT RAISE(ABORT, 'public interest requests cannot have attachments');
    END;
    CREATE TRIGGER IF NOT EXISTS attached_request_cannot_become_public
    BEFORE UPDATE OF submitter_kind ON service_requests
    WHEN NEW.submitter_kind='public' AND EXISTS (SELECT 1 FROM request_attachments WHERE request_id=NEW.id)
    BEGIN
      SELECT RAISE(ABORT, 'requests with attachments cannot become public interests');
    END;

    CREATE TRIGGER IF NOT EXISTS category_collection_same_business_insert
    BEFORE INSERT ON categories WHEN NEW.collection_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM collections WHERE id=NEW.collection_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'collection does not belong to business') END;
    END;
    CREATE TRIGGER IF NOT EXISTS category_collection_same_business_update
    BEFORE UPDATE OF collection_id,business_id ON categories WHEN NEW.collection_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM collections WHERE id=NEW.collection_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'collection does not belong to business') END;
    END;
    CREATE TRIGGER IF NOT EXISTS product_collection_same_business_insert
    BEFORE INSERT ON products WHEN NEW.collection_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM collections WHERE id=NEW.collection_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'collection does not belong to business') END;
    END;
    CREATE TRIGGER IF NOT EXISTS product_collection_same_business_update
    BEFORE UPDATE OF collection_id,business_id ON products WHEN NEW.collection_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM collections WHERE id=NEW.collection_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'collection does not belong to business') END;
    END;
    CREATE TRIGGER IF NOT EXISTS product_category_same_business_insert
    BEFORE INSERT ON products WHEN NEW.category_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM categories WHERE id=NEW.category_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'category does not belong to business') END;
    END;
    CREATE TRIGGER IF NOT EXISTS product_category_same_business_update
    BEFORE UPDATE OF category_id,business_id ON products WHEN NEW.category_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM categories WHERE id=NEW.category_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'category does not belong to business') END;
    END;
    CREATE TRIGGER IF NOT EXISTS inquiry_item_same_business_insert
    BEFORE INSERT ON inquiry_items WHEN NEW.product_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM inquiries i JOIN products p ON p.id=NEW.product_id
        WHERE i.id=NEW.inquiry_id AND i.business_id=p.business_id
      ) THEN RAISE(ABORT, 'product does not belong to inquiry business') END;
    END;
    CREATE TRIGGER IF NOT EXISTS delivery_inquiry_same_business_insert
    BEFORE INSERT ON delivery_requests WHEN NEW.inquiry_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM inquiries WHERE id=NEW.inquiry_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'inquiry does not belong to delivery business') END;
    END;
    CREATE TRIGGER IF NOT EXISTS delivery_inquiry_same_business_update
    BEFORE UPDATE OF inquiry_id,business_id ON delivery_requests WHEN NEW.inquiry_id IS NOT NULL
    BEGIN
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM inquiries WHERE id=NEW.inquiry_id AND business_id=NEW.business_id
      ) THEN RAISE(ABORT, 'inquiry does not belong to delivery business') END;
    END;
  `);

  db.prepare("INSERT OR IGNORE INTO schema_migrations(version) VALUES(?)").run(1);
  db.prepare("INSERT OR IGNORE INTO schema_migrations(version) VALUES(?)").run(2);
  db.prepare("INSERT OR IGNORE INTO schema_migrations(version) VALUES(?)").run(3);
  db.prepare("INSERT OR IGNORE INTO schema_migrations(version) VALUES(?)").run(4);
  db.prepare("INSERT OR IGNORE INTO schema_migrations(version) VALUES(?)").run(5);
  db.prepare("INSERT OR IGNORE INTO schema_migrations(version) VALUES(?)").run(6);

  const cutoverApplied = db.prepare("SELECT 1 FROM schema_migrations WHERE version=7").get();
  if (!cutoverApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(`
        CREATE TABLE user_access_profiles_v7 (
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          access_role TEXT NOT NULL CHECK(access_role IN (
            'platform_admin','client','team_member','operations_manager'
          )),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO user_access_profiles_v7(user_id,access_role,created_at)
        SELECT user_id,CASE WHEN access_role='legacy_owner' THEN 'client' ELSE access_role END,created_at
        FROM user_access_profiles;
        INSERT OR IGNORE INTO user_access_profiles_v7(user_id,access_role)
        SELECT id,CASE WHEN role='admin' THEN 'platform_admin' ELSE 'client' END FROM users;

        CREATE TABLE client_invitations_v7 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
          business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          token_hash TEXT UNIQUE NOT NULL,
          expires_at INTEGER NOT NULL,
          accepted_at INTEGER,
          accepted_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          revoked_at INTEGER,
          created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at INTEGER NOT NULL
        );
        INSERT INTO client_invitations_v7
        SELECT * FROM client_invitations;

        DROP TABLE client_invitations;
        ALTER TABLE client_invitations_v7 RENAME TO client_invitations;
        DROP TABLE user_access_profiles;
        ALTER TABLE user_access_profiles_v7 RENAME TO user_access_profiles;
        CREATE INDEX invitation_request_idx ON client_invitations(request_id,created_at DESC);
        CREATE INDEX invitation_expiry_idx ON client_invitations(expires_at);
      `);
      db.prepare(`
        UPDATE sessions SET revoked_at=?
        WHERE revoked_at IS NULL AND user_id IN (
          SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
          WHERE u.role='owner' AND p.access_role='client'
        )
      `).run(Date.now());
      db.prepare("INSERT INTO schema_migrations(version) VALUES(7)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const compositionCutoverApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=8")
    .get();
  if (!compositionCutoverApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      addColumn(
        db,
        "businesses",
        "design_manifest_json TEXT NOT NULL DEFAULT ''",
      );
      const businesses = db
        .prepare(
          "SELECT id,design_key,design_manifest_json FROM businesses ORDER BY id",
        )
        .all() as Array<{
        id: number;
        design_key: string;
        design_manifest_json: string;
      }>;
      const updateBusiness = db.prepare(
        "UPDATE businesses SET design_key='composition',design_manifest_json=? WHERE id=?",
      );
      for (const business of businesses) {
        let existingManifest: unknown;
        if (business.design_key === "composition") {
          try {
            existingManifest = JSON.parse(business.design_manifest_json);
          } catch {
            throw new Error(
              `Business ${business.id} has an invalid composition manifest.`,
            );
          }
        }
        const manifest = resolveDesignManifest(
          business.design_key,
          existingManifest,
        );
        updateBusiness.run(JSON.stringify(manifest), business.id);
      }

      db.exec("DROP TRIGGER IF EXISTS submitted_revision_content_immutable");
      const revisionRows = db
        .prepare("SELECT id,snapshot_json FROM content_revisions ORDER BY id")
        .all() as Array<{ id: number; snapshot_json: string }>;
      const updateRevision = db.prepare(
        "UPDATE content_revisions SET snapshot_json=? WHERE id=?",
      );
      for (const revision of revisionRows) {
        updateRevision.run(
          JSON.stringify(upgradeRevisionSnapshotToV2(revision.snapshot_json)),
          revision.id,
        );
      }
      const publishedRows = db
        .prepare(
          "SELECT business_id,content_version,snapshot_json FROM published_catalog_versions ORDER BY business_id,content_version",
        )
        .all() as Array<{
        business_id: number;
        content_version: number;
        snapshot_json: string;
      }>;
      const updatePublished = db.prepare(
        "UPDATE published_catalog_versions SET snapshot_json=? WHERE business_id=? AND content_version=?",
      );
      for (const published of publishedRows) {
        updatePublished.run(
          JSON.stringify(upgradeRevisionSnapshotToV2(published.snapshot_json)),
          published.business_id,
          published.content_version,
        );
      }
      for (const revision of db
        .prepare("SELECT snapshot_json FROM content_revisions")
        .all() as Array<{ snapshot_json: string }>) {
        if (parseRevisionSnapshot(revision.snapshot_json).schemaVersion !== 2) {
          throw new Error("A content revision did not migrate to schema version 2.");
        }
      }
      for (const published of db
        .prepare("SELECT snapshot_json FROM published_catalog_versions")
        .all() as Array<{ snapshot_json: string }>) {
        if (parseRevisionSnapshot(published.snapshot_json).schemaVersion !== 2) {
          throw new Error(
            "A retained publication did not migrate to schema version 2.",
          );
        }
      }
      db.exec(`
        CREATE TRIGGER submitted_revision_content_immutable
        BEFORE UPDATE OF snapshot_json,summary,base_content_version ON content_revisions
        WHEN OLD.status != 'draft'
        BEGIN
          SELECT RAISE(ABORT, 'submitted revision content is immutable');
        END;
      `);
      db.prepare("INSERT INTO schema_migrations(version) VALUES(8)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const stocklessCutoverApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=9")
    .get();
  if (!stocklessCutoverApplied) {
    if (columns(db, "products").has("stock_count")) {
      requireDestructiveMigrationCheckpoint(
        options,
        "Stockless catalog migration",
      );
    }
    db.exec("PRAGMA foreign_keys = OFF");
    try {
      db.exec("BEGIN IMMEDIATE");
      if (columns(db, "products").has("stock_count")) {
        db.exec(`
          DROP TRIGGER IF EXISTS product_collection_same_business_insert;
          DROP TRIGGER IF EXISTS product_collection_same_business_update;
          DROP TRIGGER IF EXISTS product_category_same_business_insert;
          DROP TRIGGER IF EXISTS product_category_same_business_update;
          DROP TRIGGER IF EXISTS inquiry_item_same_business_insert;

          CREATE TABLE products_v9 (
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
          INSERT INTO products_v9(
            id,business_id,collection_id,category_id,name,slug,eyebrow,
            description,image_path,availability,is_published,sort_order,created_at
          )
          SELECT
            id,business_id,collection_id,category_id,name,slug,eyebrow,
            description,image_path,availability,is_published,sort_order,created_at
          FROM products;

          CREATE TABLE option_values_v9 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            option_group_id INTEGER NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
            value TEXT NOT NULL,
            UNIQUE(option_group_id, value)
          );
          INSERT INTO option_values_v9(id,option_group_id,value)
          SELECT id,option_group_id,value FROM option_values;

          DROP TABLE option_values;
          DROP TABLE products;
          ALTER TABLE products_v9 RENAME TO products;
          ALTER TABLE option_values_v9 RENAME TO option_values;

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
        `);
      }
      const foreignKeyFailures = db.prepare("PRAGMA foreign_key_check").all();
      if (foreignKeyFailures.length) {
        throw new Error("Stockless migration failed foreign-key validation.");
      }
      db.prepare("INSERT INTO schema_migrations(version) VALUES(9)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    } finally {
      db.exec("PRAGMA foreign_keys = ON");
    }
  }

  const productUpkeepApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=10")
    .get();
  if (!productUpkeepApplied) {
    const versionTable = db
      .prepare(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='published_catalog_versions'",
      )
      .get() as { sql: string } | undefined;
    const needsHistoryRebuild = !versionTable?.sql.includes("product_upkeep");
    if (needsHistoryRebuild) {
      requireDestructiveMigrationCheckpoint(
        options,
        "Product-upkeep history migration",
      );
    }
    db.exec("PRAGMA foreign_keys = OFF");
    try {
      db.exec("BEGIN IMMEDIATE");
      if (needsHistoryRebuild) {
        db.exec(`
          CREATE TABLE published_catalog_versions_v10 (
            business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
            content_version INTEGER NOT NULL CHECK(content_version > 0),
            snapshot_json TEXT NOT NULL,
            source_revision_id INTEGER REFERENCES content_revisions(id) ON DELETE SET NULL,
            change_kind TEXT NOT NULL CHECK(change_kind IN (
              'baseline','publication','rollback','product_upkeep'
            )),
            actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(business_id,content_version)
          );
          INSERT INTO published_catalog_versions_v10(
            business_id,content_version,snapshot_json,source_revision_id,
            change_kind,actor_user_id,created_at
          )
          SELECT
            business_id,content_version,snapshot_json,source_revision_id,
            change_kind,actor_user_id,created_at
          FROM published_catalog_versions;
          DROP TABLE published_catalog_versions;
          ALTER TABLE published_catalog_versions_v10
            RENAME TO published_catalog_versions;
        `);
      }
      db.exec(`
        CREATE TABLE IF NOT EXISTS product_upkeep_commands (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          idempotency_key TEXT NOT NULL,
          payload_hash TEXT NOT NULL,
          actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          result_product_id INTEGER NOT NULL,
          result_content_version INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(business_id,idempotency_key),
          FOREIGN KEY(business_id,result_content_version)
            REFERENCES published_catalog_versions(business_id,content_version)
            ON DELETE CASCADE
        );
      `);
      const foreignKeyFailures = db.prepare("PRAGMA foreign_key_check").all();
      if (foreignKeyFailures.length) {
        throw new Error(
          "Product-upkeep migration failed foreign-key validation.",
        );
      }
      db.prepare("INSERT INTO schema_migrations(version) VALUES(10)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    } finally {
      db.exec("PRAGMA foreign_keys = ON");
    }
  }

  const recipeMetadataApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=11")
    .get();
  if (!recipeMetadataApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(`
        DROP TRIGGER IF EXISTS submitted_revision_content_immutable;
        CREATE TRIGGER submitted_revision_content_immutable
        BEFORE UPDATE OF
          snapshot_json,summary,base_content_version,recipe_import_hash,
          recipe_metadata_json,recipe_imported_by_user_id,recipe_imported_at
        ON content_revisions
        WHEN OLD.status != 'draft'
        BEGIN
          SELECT RAISE(ABORT, 'submitted revision content is immutable');
        END;
        CREATE UNIQUE INDEX IF NOT EXISTS revision_recipe_import_unique
          ON content_revisions(request_id,recipe_import_hash)
          WHERE recipe_import_hash IS NOT NULL AND recipe_import_hash != '';
      `);
      db.prepare("INSERT INTO schema_migrations(version) VALUES(11)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const recipeMediaApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=12")
    .get();
  if (!recipeMediaApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS recipe_media_assets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
          asset_key TEXT UNIQUE NOT NULL,
          kind TEXT NOT NULL CHECK(kind IN ('image','youtube')),
          label TEXT NOT NULL,
          request_attachment_id INTEGER UNIQUE REFERENCES request_attachments(id) ON DELETE CASCADE,
          provider_id TEXT,
          rights_acknowledged INTEGER NOT NULL CHECK(rights_acknowledged=1),
          added_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CHECK(
            (kind='image' AND request_attachment_id IS NOT NULL AND provider_id IS NULL)
            OR
            (kind='youtube' AND request_attachment_id IS NULL AND provider_id IS NOT NULL)
          )
        );
        CREATE INDEX IF NOT EXISTS recipe_media_request_idx
          ON recipe_media_assets(request_id,created_at,id);
      `);
      db.prepare("INSERT INTO schema_migrations(version) VALUES(12)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const revisionVersionMarkerApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=13")
    .get();
  if (!revisionVersionMarkerApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      addColumn(
        db,
        "content_revisions",
        "snapshot_schema_version INTEGER NOT NULL DEFAULT 3 CHECK(snapshot_schema_version IN (1,2,3,4))",
      );
      db.exec(`
        UPDATE content_revisions
        SET snapshot_schema_version=CAST(json_extract(snapshot_json,'$.schemaVersion') AS INTEGER)
        WHERE json_extract(snapshot_json,'$.schemaVersion') IN (1,2,3,4);
        DROP TRIGGER IF EXISTS submitted_revision_content_immutable;
        CREATE TRIGGER submitted_revision_content_immutable
        BEFORE UPDATE OF
          snapshot_json,snapshot_schema_version,summary,base_content_version,
          recipe_import_hash,recipe_metadata_json,recipe_imported_by_user_id,
          recipe_imported_at
        ON content_revisions
        WHEN OLD.status != 'draft'
        BEGIN
          SELECT RAISE(ABORT, 'submitted revision content is immutable');
        END;
        CREATE INDEX IF NOT EXISTS revision_schema_version_idx
          ON content_revisions(snapshot_schema_version,status);
      `);
      const invalid = db
        .prepare(
          `SELECT COUNT(*) count FROM content_revisions
           WHERE snapshot_schema_version != CAST(json_extract(snapshot_json,'$.schemaVersion') AS INTEGER)
              OR snapshot_schema_version NOT IN (1,2,3,4)`,
        )
        .get() as { count: number };
      if (invalid.count) {
        throw new Error("Revision schema-version markers do not match stored snapshots.");
      }
      db.prepare("INSERT INTO schema_migrations(version) VALUES(13)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const publishedContentBlocksApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=14")
    .get();
  if (!publishedContentBlocksApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      addColumn(
        db,
        "businesses",
        "content_blocks_json TEXT NOT NULL DEFAULT '{\"schemaVersion\":1,\"blocks\":[]}'",
      );
      db.prepare("INSERT INTO schema_migrations(version) VALUES(14)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const bazaarApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=15")
    .get();
  if (!bazaarApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS bazaar_themes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6),
          industry_keys_json TEXT NOT NULL DEFAULT '[]',
          icon TEXT DEFAULT '',
          timezone TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
          active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
          starts_at_time TEXT NOT NULL DEFAULT '04:00',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS bazaar_occurrences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          theme_id INTEGER NOT NULL REFERENCES bazaar_themes(id) ON DELETE CASCADE,
          bazaar_date TEXT NOT NULL,
          starts_at TEXT NOT NULL,
          ends_at TEXT NOT NULL,
          timezone TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('scheduled','live','ended','cancelled')),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(theme_id,bazaar_date)
        );
        CREATE TABLE IF NOT EXISTS bazaar_booth_profiles (
          business_id INTEGER PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
          industry_keys_json TEXT NOT NULL DEFAULT '[]',
          booth_image_path TEXT DEFAULT '',
          fallback_style TEXT DEFAULT '',
          is_featured INTEGER NOT NULL DEFAULT 0 CHECK(is_featured IN (0,1)),
          is_excluded INTEGER NOT NULL DEFAULT 0 CHECK(is_excluded IN (0,1)),
          approved_at TEXT,
          approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS bazaar_booths (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          occurrence_id INTEGER NOT NULL REFERENCES bazaar_occurrences(id) ON DELETE CASCADE,
          business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          x INTEGER NOT NULL CHECK(x >= 0),
          y INTEGER NOT NULL CHECK(y >= 0),
          width INTEGER NOT NULL CHECK(width BETWEEN 80 AND 360),
          height INTEGER NOT NULL CHECK(height BETWEEN 60 AND 240),
          floor_section TEXT DEFAULT '',
          featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
          status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','excluded')),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(occurrence_id,business_id)
        );
        CREATE INDEX IF NOT EXISTS bazaar_theme_weekday_idx
          ON bazaar_themes(active,weekday,slug);
        CREATE INDEX IF NOT EXISTS bazaar_occurrence_status_idx
          ON bazaar_occurrences(status,bazaar_date,theme_id);
        CREATE INDEX IF NOT EXISTS bazaar_booth_occurrence_idx
          ON bazaar_booths(occurrence_id,status,featured,business_id);
        CREATE INDEX IF NOT EXISTS bazaar_profile_flags_idx
          ON bazaar_booth_profiles(is_excluded,is_featured,business_id);
      `);
      db.prepare("INSERT INTO schema_migrations(version) VALUES(15)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const expoGeographyApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=16")
    .get();
  if (!expoGeographyApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      addColumn(db, "bazaar_booth_profiles", "city TEXT NOT NULL DEFAULT ''");
      addColumn(db, "bazaar_booth_profiles", "region TEXT NOT NULL DEFAULT ''");
      addColumn(db, "bazaar_booth_profiles", "latitude REAL");
      addColumn(db, "bazaar_booth_profiles", "longitude REAL");
      db.exec(`
        CREATE TABLE IF NOT EXISTS expo_hub_assignments (
          occurrence_id INTEGER NOT NULL REFERENCES bazaar_occurrences(id) ON DELETE CASCADE,
          business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          origin_region TEXT NOT NULL,
          hub_key TEXT NOT NULL,
          hub_name TEXT NOT NULL,
          hub_city TEXT NOT NULL,
          hub_latitude REAL NOT NULL CHECK(hub_latitude BETWEEN -90 AND 90),
          hub_longitude REAL NOT NULL CHECK(hub_longitude BETWEEN -180 AND 180),
          hall_number INTEGER NOT NULL CHECK(hall_number >= 1),
          booth_number INTEGER NOT NULL CHECK(booth_number >= 1),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY(occurrence_id,business_id)
        );
        CREATE INDEX IF NOT EXISTS expo_hub_assignment_idx
          ON expo_hub_assignments(occurrence_id,hub_key,hall_number,booth_number);
      `);
      db.prepare("INSERT INTO schema_migrations(version) VALUES(16)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const expoCityHostsApplied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version=17")
    .get();
  if (!expoCityHostsApplied) {
    db.exec("BEGIN IMMEDIATE");
    try {
      addColumn(db, "bazaar_booth_profiles", "zone TEXT NOT NULL DEFAULT ''");
      addColumn(db, "expo_hub_assignments", "origin_zone TEXT NOT NULL DEFAULT ''");
      addColumn(db, "expo_hub_assignments", "hub_zone TEXT NOT NULL DEFAULT ''");
      addColumn(db, "expo_hub_assignments", "hub_region TEXT NOT NULL DEFAULT ''");
      db.prepare("INSERT INTO schema_migrations(version) VALUES(17)").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}
