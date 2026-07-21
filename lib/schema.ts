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
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  addColumn(db, "businesses", "site_title TEXT DEFAULT ''");
  addColumn(db, "businesses", "site_description TEXT DEFAULT ''");
  addColumn(db, "businesses", "favicon_path TEXT DEFAULT ''");
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
}
