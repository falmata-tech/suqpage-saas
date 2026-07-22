import type { DatabaseSync } from "node:sqlite";

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

export function migrateDatabase(db: DatabaseSync) {
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
      stock_count INTEGER NOT NULL DEFAULT 0 CHECK(stock_count >= 0),
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
      stock_count INTEGER NOT NULL DEFAULT 0 CHECK(stock_count >= 0),
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
        'platform_admin','legacy_owner','client','team_member','operations_manager'
      )),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS client_invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
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
      summary TEXT NOT NULL DEFAULT '',
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
      change_kind TEXT NOT NULL CHECK(change_kind IN ('baseline','publication','rollback')),
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
}
