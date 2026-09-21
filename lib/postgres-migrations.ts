import { SPELLING_INDEX_SQL } from "./search-index";
import { DISCOVERY_INDUSTRIES } from "./discovery-contract";
import baseline from "./postgres-baseline.json";
import { OWNER_BUSINESS_SCHEMA_SQL, OWNER_PLACE_ANCHOR_SCHEMA_SQL } from "./owner-business-schema";
import { PAGE_REVIEW_SCHEMA_SQL } from "./page-review-schema";
import { CONTACT_SCHEMA_SQL } from "./contact-schema";
import type { PostgresTransactionRunner } from "./postgres-runtime";
import { OWNER_PAGE_SCHEMA_SQL, OWNER_PAGE_PUBLICATION_SCHEMA_SQL } from "./owner-page-schema";

const SCHEMA_NAME = /^[a-z_][a-z0-9_]*$/i;

function quotedSchema(schema: string) {
  if (!SCHEMA_NAME.test(schema)) throw new Error("The PostgreSQL migration schema is invalid.");
  return `"${schema}"`;
}

function quotedRole(role: string) {
  if (!SCHEMA_NAME.test(role)) throw new Error("The PostgreSQL migration role is invalid.");
  return `"${role}"`;
}

export async function migratePostgresDatabase(
  runner: PostgresTransactionRunner,
  schema = "public",
  migrationRole = "",
) {
  return runner.transaction(async () => {
    if (migrationRole) await runner.query(`SET LOCAL ROLE ${quotedRole(migrationRole)}`);
    await runner.query(`SET LOCAL search_path TO ${quotedSchema(schema)}`);
    await runner.query("SELECT pg_advisory_xact_lock(6870619271341)");
    const installed = await runner.query<{ name: string | null }>("SELECT to_regclass('schema_migrations')::text name");
    const applied: number[] = [];
    if (!installed.rows[0]?.name) {
      const existing = await runner.query<{ total: number }>("SELECT COUNT(*) total FROM information_schema.tables WHERE table_schema=current_schema() AND table_type='BASE TABLE'");
      if (Number(existing.rows[0]?.total)) throw new Error("Refusing to install into an unversioned populated schema.");
      const ddl = baseline.sql.join("\n").replaceAll('"public".', `${quotedSchema(schema)}.`).replaceAll("public.", `${quotedSchema(schema)}.`);
      await runner.query(ddl);
      await runner.query("INSERT INTO schema_migrations(version) SELECT generate_series(1, ?)", [baseline.version]);
      for (const [position, industry] of DISCOVERY_INDUSTRIES.entries()) {
        await runner.query("INSERT INTO discovery_industries(key,label,icon,position,active) VALUES(?,?,?,?,1)", [industry.key,industry.label,industry.icon,position]);
      }
      await runner.query(`INSERT INTO featured_program_policy(id,morning_start_minute,morning_end_minute,afternoon_start_minute,afternoon_end_minute,changeover_minutes,sponsor_break_every,sponsor_break_minutes,sponsor_break_label,intermission_label,updated_at) VALUES(1,480,780,1020,1320,5,3,10,'Sponsor break','Lunch and program break',0)`);

      await runner.query(`REVOKE ALL ON ALL TABLES IN SCHEMA ${quotedSchema(schema)} FROM PUBLIC`);
      await runner.query(`REVOKE ALL ON ALL SEQUENCES IN SCHEMA ${quotedSchema(schema)} FROM PUBLIC`);
      for (const role of ["anon", "authenticated"]) {
        const exists = await runner.query("SELECT 1 FROM pg_roles WHERE rolname=?", [role]);
        if (exists.rows.length) {
          await runner.query(`REVOKE ALL ON ALL TABLES IN SCHEMA ${quotedSchema(schema)} FROM ${quotedRole(role)}`);
          await runner.query(`REVOKE ALL ON ALL SEQUENCES IN SCHEMA ${quotedSchema(schema)} FROM ${quotedRole(role)}`);
        }
      }
      applied.push(...Array.from({ length: baseline.version }, (_, index) => index + 1));
    }
    const migration31 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=31",
    );
    if (!migration31.rows.length) {
      await runner.query(`
      WITH ranked AS (
        SELECT id,business_id,
          row_number() OVER (
            PARTITION BY business_id
            ORDER BY updated_at DESC,id DESC
          ) AS project_rank,
          first_value(id) OVER (
            PARTITION BY business_id
            ORDER BY updated_at DESC,id DESC
          ) AS current_id
        FROM service_requests
        WHERE business_id IS NOT NULL
          AND status IN (
            'submitted','under_review','needs_information','approved_for_work',
            'in_progress','client_review','client_approved'
          )
      )
      INSERT INTO request_events(request_id,event_type,detail)
      SELECT id,'project_superseded','current_project:' || current_id::text
      FROM ranked
      WHERE project_rank>1
    `);
      await runner.query(`
      WITH ranked AS (
        SELECT id,
          row_number() OVER (
            PARTITION BY business_id
            ORDER BY updated_at DESC,id DESC
          ) AS project_rank
        FROM service_requests
        WHERE business_id IS NOT NULL
          AND status IN (
            'submitted','under_review','needs_information','approved_for_work',
            'in_progress','client_review','client_approved'
          )
      )
      UPDATE service_requests request
      SET status='cancelled',updated_at=CURRENT_TIMESTAMP
      FROM ranked
      WHERE request.id=ranked.id AND ranked.project_rank>1
    `);
      await runner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS one_active_showroom_project_per_business_idx
        ON service_requests(business_id)
        WHERE business_id IS NOT NULL
          AND status IN (
            'submitted','under_review','needs_information','approved_for_work',
            'in_progress','client_review','client_approved'
          )
    `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(31)");
      applied.push(31);
    }

    const migration32 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=32",
    );
    if (!migration32.rows.length) {
      await runner.query(`
        CREATE TABLE IF NOT EXISTS featured_program_policy (
          id INTEGER PRIMARY KEY CHECK(id=1),
          morning_start_minute INTEGER NOT NULL CHECK(morning_start_minute BETWEEN 0 AND 1439),
          morning_end_minute INTEGER NOT NULL CHECK(morning_end_minute BETWEEN 1 AND 1439),
          afternoon_start_minute INTEGER NOT NULL CHECK(afternoon_start_minute BETWEEN 1 AND 1439),
          afternoon_end_minute INTEGER NOT NULL CHECK(afternoon_end_minute BETWEEN 1 AND 1439),
          changeover_minutes INTEGER NOT NULL CHECK(changeover_minutes BETWEEN 2 AND 20),
          sponsor_break_every INTEGER NOT NULL CHECK(sponsor_break_every BETWEEN 2 AND 8),
          sponsor_break_minutes INTEGER NOT NULL CHECK(sponsor_break_minutes BETWEEN 5 AND 30),
          sponsor_break_label TEXT NOT NULL CHECK(length(sponsor_break_label) BETWEEN 2 AND 60),
          intermission_label TEXT NOT NULL CHECK(length(intermission_label) BETWEEN 2 AND 60),
          updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          updated_at BIGINT NOT NULL,
          CHECK(morning_start_minute < morning_end_minute),
          CHECK(morning_end_minute + 30 <= afternoon_start_minute),
          CHECK(afternoon_start_minute < afternoon_end_minute)
        );
        INSERT INTO featured_program_policy(
          id,morning_start_minute,morning_end_minute,afternoon_start_minute,
          afternoon_end_minute,changeover_minutes,sponsor_break_every,
          sponsor_break_minutes,sponsor_break_label,intermission_label,updated_at
        ) VALUES(1,480,780,1020,1320,5,3,10,'Sponsor break','Lunch and program break',0)
        ON CONFLICT(id) DO NOTHING;

        CREATE TABLE IF NOT EXISTS featured_program_days (
          date_iso TEXT PRIMARY KEY CHECK(length(date_iso)=10),
          mode TEXT NOT NULL CHECK(mode IN ('automatic','manual')),
          updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS featured_program_lineup (
          date_iso TEXT NOT NULL REFERENCES featured_program_days(date_iso) ON DELETE CASCADE,
          business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          position INTEGER NOT NULL CHECK(position BETWEEN 1 AND 100),
          PRIMARY KEY(date_iso,business_id),
          UNIQUE(date_iso,position)
        );
        CREATE INDEX IF NOT EXISTS featured_program_lineup_date_idx
          ON featured_program_lineup(date_iso,position,business_id)
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(32)");
      applied.push(32);
    }

    const migration33 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=33",
    );
    if (!migration33.rows.length) {
      await runner.query(`
        ALTER TABLE support_conversations
          ADD COLUMN participant_kind TEXT NOT NULL DEFAULT 'client',
          ADD COLUMN visitor_token_hash TEXT,
          ADD COLUMN visitor_session_expires_at BIGINT,
          ADD COLUMN assistance_category TEXT NOT NULL DEFAULT 'general',
          ADD COLUMN requester_label TEXT NOT NULL DEFAULT 'Suqpage client',
          ADD COLUMN visitor_last_read_message_id INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE support_conversations
          ALTER COLUMN business_id DROP NOT NULL,
          ALTER COLUMN opened_by_user_id DROP NOT NULL;
        ALTER TABLE support_conversations
          ADD CONSTRAINT support_participant_kind_check
            CHECK(participant_kind IN ('client','visitor')),
          ADD CONSTRAINT support_assistance_category_check
            CHECK(assistance_category IN ('general','sourcing','document_review','site_visit','shipment_observation')),
          ADD CONSTRAINT support_requester_label_check
            CHECK(length(requester_label) BETWEEN 1 AND 80),
          ADD CONSTRAINT support_participant_identity_check CHECK(
            (participant_kind='client' AND business_id IS NOT NULL AND opened_by_user_id IS NOT NULL
              AND visitor_token_hash IS NULL AND visitor_session_expires_at IS NULL)
            OR
            (participant_kind='visitor' AND business_id IS NULL AND opened_by_user_id IS NULL
              AND visitor_token_hash IS NOT NULL AND visitor_session_expires_at IS NOT NULL)
          );
        CREATE UNIQUE INDEX support_queue_visitor_token_idx
          ON support_conversations(visitor_token_hash)
          WHERE visitor_token_hash IS NOT NULL;
        CREATE INDEX support_queue_visitor_idx
          ON support_conversations(visitor_token_hash,visitor_session_expires_at);

        ALTER TABLE support_messages
          ADD COLUMN sender_kind TEXT NOT NULL DEFAULT 'user',
          ADD COLUMN sender_key TEXT;
        UPDATE support_messages SET sender_key='user:' || sender_user_id::text WHERE sender_key IS NULL;
        ALTER TABLE support_messages
          ALTER COLUMN sender_key SET NOT NULL,
          ALTER COLUMN sender_user_id DROP NOT NULL;
        ALTER TABLE support_messages
          ADD CONSTRAINT support_message_sender_kind_check CHECK(sender_kind IN ('user','visitor')),
          ADD CONSTRAINT support_message_sender_identity_check CHECK(
            (sender_kind='user' AND sender_user_id IS NOT NULL)
            OR (sender_kind='visitor' AND sender_user_id IS NULL)
          );
        ALTER TABLE support_messages DROP CONSTRAINT IF EXISTS support_messages_sender_user_id_idempotency_key_key;
        CREATE UNIQUE INDEX support_message_sender_idempotency_idx
          ON support_messages(sender_key,idempotency_key);
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(33)");
      applied.push(33);
    }
    const migration34 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=34",
    );
    if (!migration34.rows.length) {
      await runner.query(`
        ALTER TABLE support_conversations
          ADD COLUMN visitor_email TEXT,
          ADD COLUMN visitor_phone TEXT;
        ALTER TABLE support_conversations
          ADD CONSTRAINT support_visitor_contact_check CHECK(
            participant_kind<>'visitor' OR (
              visitor_email IS NOT NULL
              AND length(btrim(visitor_email)) BETWEEN 3 AND 254
              AND position('@' IN visitor_email)>1
              AND visitor_phone IS NOT NULL
              AND visitor_phone ~ '^\\+?[0-9]{7,15}$'
            )
          ) NOT VALID;
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(34)");
      applied.push(34);
    }
    const migration35 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=35",
    );
    if (!migration35.rows.length) {
      await runner.query(`
        CREATE TABLE external_sponsor_ads (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 100),
          description TEXT NOT NULL CHECK(length(description) BETWEEN 2 AND 180),
          image_path TEXT NOT NULL CHECK(length(image_path) BETWEEN 2 AND 300 AND left(image_path,1)='/'),
          website_url TEXT CHECK(website_url IS NULL OR length(website_url) BETWEEN 10 AND 500),
          phone TEXT CHECK(phone IS NULL OR length(phone) BETWEEN 7 AND 16),
          position INTEGER NOT NULL DEFAULT 100 CHECK(position BETWEEN 1 AND 999),
          active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL,
          CHECK(website_url IS NOT NULL OR phone IS NOT NULL)
        );
        CREATE INDEX external_sponsor_ads_active_idx
          ON external_sponsor_ads(active,position,id);
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(35)");
      applied.push(35);
    }
    const migration36 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=36",
    );
    if (!migration36.rows.length) {
      await runner.query(`
        CREATE TABLE support_attachments (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          message_id BIGINT NOT NULL UNIQUE REFERENCES support_messages(id) ON DELETE CASCADE,
          storage_key TEXT NOT NULL UNIQUE CHECK(length(storage_key) BETWEEN 40 AND 120),
          original_name TEXT NOT NULL CHECK(length(original_name) BETWEEN 1 AND 180),
          mime_type TEXT NOT NULL CHECK(mime_type IN ('image/jpeg','image/png','image/webp','application/pdf')),
          byte_size INTEGER NOT NULL CHECK(byte_size BETWEEN 1 AND 5242880),
          created_at BIGINT NOT NULL
        );
        CREATE INDEX support_attachment_message_idx
          ON support_attachments(message_id,id);
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(36)");
      applied.push(36);
    }
    const migration37 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=37",
    );
    if (!migration37.rows.length) {
      await runner.query(`
        CREATE TABLE auth_identity_links (
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          provider TEXT NOT NULL CHECK(provider='supabase'),
          provider_user_id TEXT NOT NULL UNIQUE CHECK(length(provider_user_id) BETWEEN 32 AND 64),
          email_at_link TEXT NOT NULL CHECK(length(email_at_link) BETWEEN 3 AND 254),
          created_at BIGINT NOT NULL
        );
        CREATE INDEX auth_identity_provider_lookup_idx
          ON auth_identity_links(provider,provider_user_id,user_id);
        CREATE OR REPLACE FUNCTION prevent_auth_identity_link_change()
        RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
        BEGIN
          IF NEW.user_id<>OLD.user_id OR NEW.provider<>OLD.provider OR NEW.provider_user_id<>OLD.provider_user_id THEN
            RAISE EXCEPTION 'auth identity link is immutable';
          END IF;
          RETURN NEW;
        END $$;
        CREATE TRIGGER auth_identity_link_immutable
          BEFORE UPDATE OF user_id,provider,provider_user_id ON auth_identity_links
          FOR EACH ROW EXECUTE FUNCTION prevent_auth_identity_link_change();
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(37)");
      applied.push(37);
    }
    const migration38 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=38",
    );
    if (!migration38.rows.length) {
      await runner.query(`
        CREATE TABLE business_onboarding_profiles (
          business_id INTEGER PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
          declared_category_key TEXT NOT NULL CHECK(declared_category_key IN (
            'electronics','beauty-wellness','agriculture-growers','food-farming',
            'machinery-tools','home-living','fashion-textiles','other-manufacturing'
          )),
          idempotency_key TEXT NOT NULL UNIQUE CHECK(length(idempotency_key) BETWEEN 16 AND 100),
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE INDEX business_onboarding_category_idx
          ON business_onboarding_profiles(declared_category_key,business_id);
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(38)");
      applied.push(38);
    }
    const migration39 = await runner.query<{ version: number }>("SELECT version FROM schema_migrations WHERE version=39");
    if (!migration39.rows.length) {
      await runner.query(OWNER_PAGE_SCHEMA_SQL);
      // These drafts are accessible only through the tenant-authorized server adapter.
      await runner.query(`REVOKE ALL ON owner_page_drafts, owner_page_events FROM PUBLIC;
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
            REVOKE ALL ON owner_page_drafts, owner_page_events FROM anon;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
            REVOKE ALL ON owner_page_drafts, owner_page_events FROM authenticated;
          END IF;
        END $$;`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(39)");
      applied.push(39);
    }
    const migration40 = await runner.query<{ version: number }>("SELECT version FROM schema_migrations WHERE version=40");
    if (!migration40.rows.length) {
      await runner.query(OWNER_PAGE_PUBLICATION_SCHEMA_SQL);
      await runner.query(`REVOKE ALL ON owner_page_publications FROM PUBLIC;
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
            REVOKE ALL ON owner_page_publications FROM anon;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
            REVOKE ALL ON owner_page_publications FROM authenticated;
          END IF;
        END $$;`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(40)");
      applied.push(40);
    }
    const migration41 = await runner.query<{ version: number }>("SELECT version FROM schema_migrations WHERE version=41");
    if (!migration41.rows.length) {
      await runner.query(CONTACT_SCHEMA_SQL);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(41)");
      applied.push(41);
    }
    const migration42 = await runner.query<{ version: number }>("SELECT version FROM schema_migrations WHERE version=42");
    if (!migration42.rows.length) {
      await runner.query(PAGE_REVIEW_SCHEMA_SQL);
      await runner.query(`REVOKE ALL ON owner_page_reviews FROM PUBLIC;
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON owner_page_reviews FROM anon; END IF;
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON owner_page_reviews FROM authenticated; END IF;
        END $$;`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(42)");
      applied.push(42);
    }
    const migration43 = await runner.query("SELECT version FROM schema_migrations WHERE version=43");
    if (!migration43.rows.length) {
      await runner.query(OWNER_BUSINESS_SCHEMA_SQL);
      await runner.query(`REVOKE ALL ON owner_location_proposals FROM PUBLIC;
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON owner_location_proposals FROM anon; END IF;
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON owner_location_proposals FROM authenticated; END IF;
        END $$;`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(43)");
      applied.push(43);
    }
    const migration44 = await runner.query("SELECT version FROM schema_migrations WHERE version=44");
    if (!migration44.rows.length) {
      // Only the platform-owned default changes; existing labels and tenant data remain verbatim.
      await runner.query("ALTER TABLE support_conversations ALTER COLUMN requester_label SET DEFAULT 'Suqpage client'");
      await runner.query("INSERT INTO schema_migrations(version) VALUES(44)");
      applied.push(44);
    }
    const migration45 = await runner.query("SELECT version FROM schema_migrations WHERE version=45");
    if (!migration45.rows.length) {
      await runner.query("ALTER TABLE business_subscriptions ALTER COLUMN plan_name SET DEFAULT 'Suqpage monthly'");
      // Reuse the native trigger contract so fresh installs and upgrades agree.
      const trigger = baseline.sql.slice(0, baseline.sql.indexOf("")).join("\n")
        .replace("CREATE FUNCTION", "CREATE OR REPLACE FUNCTION")
        .replaceAll('"public".', `${quotedSchema(schema)}.`).replaceAll("public.", `${quotedSchema(schema)}.`);
      await runner.query(trigger);
      await runner.query("UPDATE business_subscriptions SET plan_name='Suqpage monthly' WHERE plan_name IN (?, ?, ?)",
        ["MirtPage monthly", "AfricMade monthly", "AfricPage monthly"]);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(45)");
      applied.push(45);
    }
    const migration46 = await runner.query("SELECT version FROM schema_migrations WHERE version=46");
    if (!migration46.rows.length) {
      await runner.query(`ALTER TABLE products DROP CONSTRAINT ck_products_6;
        ALTER TABLE products ADD CONSTRAINT ck_products_6 CHECK (offering_kind IN ('standard_product','service','made_to_order','manufacturing_capability','production_supply'));
        ALTER TABLE inquiry_items DROP CONSTRAINT ck_inquiry_items_3;
        ALTER TABLE inquiry_items ADD CONSTRAINT ck_inquiry_items_3 CHECK (offering_kind_snapshot IN ('standard_product','service','made_to_order','manufacturing_capability','production_supply'));`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(46)");
      applied.push(46);
    }
    const migration47 = await runner.query("SELECT version FROM schema_migrations WHERE version=47");
    if (!migration47.rows.length) {
      await runner.query(OWNER_PLACE_ANCHOR_SCHEMA_SQL);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(47)");
      applied.push(47);
    }
    const migration48 = await runner.query("SELECT version FROM schema_migrations WHERE version=48");
    if (!migration48.rows.length) {
      await runner.query('CREATE SCHEMA IF NOT EXISTS extensions');
      for (const name of ['pg_trgm','fuzzystrmatch']) {
        const extension = await runner.query<{ schema: string }>("SELECT n.nspname AS schema FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace WHERE e.extname=?",[name]);
        if (extension.rows.length && extension.rows[0].schema !== 'extensions') throw new Error(`${name} must use the reviewed extensions schema; do not relocate it automatically.`);
        await runner.query(`CREATE EXTENSION IF NOT EXISTS ${name} WITH SCHEMA extensions`);
      }
      const runtimeRoles = await runner.query<{ rolname: string }>("SELECT rolname FROM pg_roles WHERE rolname IN ('suqpage_runtime','mirtpage_runtime')");
      for (const role of runtimeRoles.rows) await runner.query(`GRANT USAGE ON SCHEMA extensions TO ${quotedRole(role.rolname)}`);
      await runner.query(SPELLING_INDEX_SQL);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(48)");
      applied.push(48);
    }
    return { applied };
  });
}
