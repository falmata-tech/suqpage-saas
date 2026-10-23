import { SCALE_DEMO_BUSINESSES } from "./scale-demo-seed";
import { SPELLING_INDEX_SQL } from "./search-index";
import { DISCOVERY_INDUSTRIES } from "./discovery-contract";
import ethiopianPlaces from './place-catalog.json';
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
    const migration49 = await runner.query("SELECT version FROM schema_migrations WHERE version=49");
    if (!migration49.rows.length) {
      await runner.query(`ALTER TABLE products ADD COLUMN media_json TEXT NOT NULL DEFAULT '[]'
        CHECK (jsonb_typeof(media_json::jsonb)='array' AND jsonb_array_length(media_json::jsonb)<=12)`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(49)");
      applied.push(49);
    }
    const migration50 = await runner.query("SELECT version FROM schema_migrations WHERE version=50");
    if (!migration50.rows.length) {
      await runner.query(`ALTER TABLE businesses ADD COLUMN handle_changed_at BIGINT NOT NULL DEFAULT 0;
        CREATE TABLE business_handles (
          handle TEXT PRIMARY KEY CHECK(handle=lower(handle)),
          business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE
        );
        CREATE INDEX business_handles_business_idx ON business_handles(business_id);
        INSERT INTO business_handles(handle,business_id) SELECT lower(handle),id FROM businesses;
        REVOKE ALL ON business_handles FROM PUBLIC;
        ALTER TABLE business_handles ENABLE ROW LEVEL SECURITY;
        CREATE FUNCTION reserve_business_handle() RETURNS trigger LANGUAGE plpgsql
          SET search_path=${quotedSchema(schema)} AS $$
        BEGIN
          INSERT INTO business_handles(handle,business_id) VALUES(lower(NEW.handle),NEW.id)
            ON CONFLICT(handle) DO NOTHING;
          IF NOT EXISTS(SELECT 1 FROM business_handles WHERE handle=lower(NEW.handle) AND business_id=NEW.id) THEN
            RAISE EXCEPTION 'Business handle is already reserved' USING ERRCODE='23505', CONSTRAINT='business_handles_pkey';
          END IF;
          RETURN NEW;
        END $$;
        CREATE TRIGGER reserve_business_handle AFTER INSERT OR UPDATE OF handle ON businesses
          FOR EACH ROW EXECUTE FUNCTION reserve_business_handle();`);
      const roles = await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated')");
      for(const role of roles.rows) await runner.query(`REVOKE ALL ON business_handles FROM ${quotedRole(role.rolname)}`);
      const runtimeRoles = await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('suqpage_runtime','mirtpage_runtime')");
      for(const role of runtimeRoles.rows) {
        await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON business_handles TO ${quotedRole(role.rolname)}`);
        await runner.query(`CREATE POLICY ${quotedRole(`handle_access_${role.rolname}`)} ON business_handles TO ${quotedRole(role.rolname)} USING (true) WITH CHECK (true)`);
      }
      await runner.query("INSERT INTO schema_migrations(version) VALUES(50)");
      applied.push(50);
    }
    const migration51 = await runner.query("SELECT version FROM schema_migrations WHERE version=51");
    if (!migration51.rows.length) {
      await runner.query(`
        ALTER TABLE support_conversations
          ADD COLUMN transport_origin TEXT,
          ADD COLUMN transport_destination TEXT,
          DROP CONSTRAINT IF EXISTS support_visitor_contact_check;
        CREATE OR REPLACE FUNCTION enforce_support_visitor_contact() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          IF NEW.participant_kind='visitor' AND (
            NEW.visitor_phone IS NULL OR NEW.visitor_phone !~ '^\\+?[0-9]{7,15}$'
            OR (NEW.assistance_category<>'shipment_observation' AND (
              NEW.visitor_email IS NULL OR length(btrim(NEW.visitor_email)) NOT BETWEEN 3 AND 254
              OR position('@' IN NEW.visitor_email)<=1
            ))
          ) THEN RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='visitor contact required'; END IF;
          RETURN NEW;
        END $$;
        DROP TRIGGER IF EXISTS support_visitor_contact_insert ON support_conversations;
        DROP TRIGGER IF EXISTS support_visitor_contact_update ON support_conversations;
        CREATE TRIGGER support_visitor_contact_insert BEFORE INSERT ON support_conversations
          FOR EACH ROW EXECUTE FUNCTION enforce_support_visitor_contact();
        CREATE TRIGGER support_visitor_contact_update BEFORE UPDATE OF participant_kind,assistance_category,visitor_email,visitor_phone ON support_conversations
          FOR EACH ROW EXECUTE FUNCTION enforce_support_visitor_contact();
        ALTER TABLE support_conversations ADD CONSTRAINT support_transport_route_check CHECK(
          (transport_origin IS NULL AND transport_destination IS NULL) OR (
            assistance_category='shipment_observation'
            AND transport_origin IS NOT NULL AND length(btrim(transport_origin)) BETWEEN 1 AND 120
            AND transport_destination IS NOT NULL AND length(btrim(transport_destination)) BETWEEN 1 AND 120
            AND length(btrim(requester_label)) BETWEEN 1 AND 80
          )
        );
        ALTER TABLE support_events DROP CONSTRAINT ck_support_events_1;
        ALTER TABLE support_events ADD CONSTRAINT ck_support_events_1 CHECK(
          event_type IN ('created','assigned','reassigned','message','closed','reopened','transport_handoff')
        );
        CREATE INDEX support_transport_queue_idx ON support_conversations(status,last_message_at DESC,id DESC)
          WHERE assistance_category='shipment_observation';
        CREATE INDEX support_transport_handoff_idx ON support_events(conversation_id,id DESC)
          WHERE event_type='transport_handoff';
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(51)");
      applied.push(51);
    }
    const migration52 = await runner.query("SELECT version FROM schema_migrations WHERE version=52");
    if (!migration52.rows.length) {
      await runner.query("ALTER TABLE businesses ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0 CHECK(is_demo IN (0,1))");
      // Classify only the explicit seeded identities, including retained handles.
      const demoHandles = ["selam-weave","afia-botanics","warka-furniture","addis-metalworks",
        "green-terrace-farm","blue-nile-apiary","rift-valley-mill","entoto-ceramics","koba-leather","nova-assembly",
        ...SCALE_DEMO_BUSINESSES.map(business => business.handle)];
      await runner.query(`UPDATE businesses SET is_demo=1 WHERE id IN (
        SELECT business_id FROM business_handles WHERE handle IN (${demoHandles.map(() => "?").join(",")})
      )`, demoHandles);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(52)");
      applied.push(52);
    }
    const migration53 = await runner.query("SELECT version FROM schema_migrations WHERE version=53");
    if (!migration53.rows.length) {
      await runner.query("ALTER TABLE support_agent_settings ADD COLUMN queue_scope TEXT NOT NULL DEFAULT 'all' CHECK(queue_scope IN ('all','support','transport'))");
      await runner.query("INSERT INTO schema_migrations(version) VALUES(53)");
      applied.push(53);
    }
    const migration54 = await runner.query("SELECT version FROM schema_migrations WHERE version=54");
    if (!migration54.rows.length) {
      await runner.query(`
        ALTER TABLE support_conversations DROP CONSTRAINT IF EXISTS support_assistance_category_check;
        ALTER TABLE support_conversations DROP CONSTRAINT IF EXISTS ck_support_conversations_2;
        ALTER TABLE support_conversations ADD CONSTRAINT support_assistance_category_check CHECK(
          assistance_category IN ('general','sourcing','document_review','site_visit','shipment_observation','buying_assistance'));
        ALTER TABLE support_conversations ADD COLUMN buying_service TEXT;
        ALTER TABLE support_conversations ADD CONSTRAINT support_buying_service_check CHECK(
          (assistance_category='buying_assistance' AND buying_service IS NOT NULL
            AND buying_service IN ('purchase','business_check','quality_check') AND participant_kind='visitor')
          OR (assistance_category<>'buying_assistance' AND buying_service IS NULL));
        CREATE OR REPLACE FUNCTION enforce_support_visitor_contact() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          IF NEW.participant_kind='visitor' AND (
            NEW.visitor_phone IS NULL OR NEW.visitor_phone !~ '^\\+?[0-9]{7,15}$'
            OR (NEW.assistance_category NOT IN ('shipment_observation','buying_assistance') AND (
              NEW.visitor_email IS NULL OR length(btrim(NEW.visitor_email)) NOT BETWEEN 3 AND 254
              OR position('@' IN NEW.visitor_email)<=1
            ))
          ) THEN RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='visitor contact required'; END IF;
          RETURN NEW;
        END $$;
        CREATE INDEX support_buying_queue_idx ON support_conversations(status,last_message_at DESC,id DESC)
          WHERE assistance_category='buying_assistance';
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(54)");
      applied.push(54);
    }
    const migration55 = await runner.query("SELECT version FROM schema_migrations WHERE version=55");
    if (!migration55.rows.length) {
      await runner.query(`
        ALTER TABLE support_conversations DROP CONSTRAINT support_buying_service_check;
        ALTER TABLE support_conversations ADD CONSTRAINT support_buying_service_check CHECK(
          (assistance_category='buying_assistance' AND participant_kind='visitor'
            AND (buying_service IS NULL OR buying_service IN ('purchase','business_check','quality_check')))
          OR (assistance_category<>'buying_assistance' AND buying_service IS NULL));
      `);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(55)");
      applied.push(55);
    }
    const migration56 = await runner.query("SELECT version FROM schema_migrations WHERE version=56");
    if (!migration56.rows.length) {
      // Existing staff messages were private notes. Never backfill them as replies.
      await runner.query("ALTER TABLE support_messages ADD COLUMN visitor_visible BOOLEAN NOT NULL DEFAULT FALSE");
      await runner.query("INSERT INTO schema_migrations(version) VALUES(56)");
      applied.push(56);
    }
    const migration57 = await runner.query("SELECT version FROM schema_migrations WHERE version=57");
    if (!migration57.rows.length) {
      await runner.query(`ALTER TABLE support_conversations ADD COLUMN resolved_at BIGINT;
        ALTER TABLE support_conversations ADD CONSTRAINT support_resolution_check CHECK
          (resolved_at IS NULL OR (status='closed' AND assistance_category='buying_assistance'));`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(57)");
      applied.push(57);
    }
    const migration58 = await runner.query("SELECT version FROM schema_migrations WHERE version=58");
    if (!migration58.rows.length) {
      await runner.query(`CREATE TABLE support_video_requests (
        conversation_id INTEGER PRIMARY KEY REFERENCES support_conversations(id) ON DELETE CASCADE,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        target_kind TEXT NOT NULL CHECK(target_kind IN ('header','product')),
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        target_label TEXT NOT NULL,
        source_url TEXT NOT NULL CHECK(length(source_url)<=1500),
        request_note TEXT NOT NULL DEFAULT '',
        baseline_videos TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','declined')),
        approved_ref TEXT,
        reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at BIGINT,
        created_at BIGINT NOT NULL,
        CHECK(target_kind='product' OR product_id IS NULL),
        CHECK((status='pending' AND reviewed_at IS NULL AND approved_ref IS NULL) OR
          (status='declined' AND reviewed_at IS NOT NULL AND approved_ref IS NULL) OR
          (status='approved' AND reviewed_at IS NOT NULL AND approved_ref IS NOT NULL))
      );
      CREATE INDEX support_video_business_idx ON support_video_requests(business_id,created_at DESC);
      REVOKE ALL ON support_video_requests FROM PUBLIC;
      ALTER TABLE support_video_requests ENABLE ROW LEVEL SECURITY;`);
      const roles = await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','suqpage_runtime','mirtpage_runtime')");
      for (const role of roles.rows) {
        if (role.rolname === "anon" || role.rolname === "authenticated") await runner.query(`REVOKE ALL ON support_video_requests FROM ${quotedRole(role.rolname)}`);
        else {
          await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON support_video_requests TO ${quotedRole(role.rolname)}`);
          await runner.query(`CREATE POLICY ${quotedRole(`video_request_${role.rolname}`)} ON support_video_requests TO ${quotedRole(role.rolname)} USING (true) WITH CHECK (true)`);
        }
      }
      await runner.query("INSERT INTO schema_migrations(version) VALUES(58)");
      applied.push(58);
    }
    const migration59 = await runner.query("SELECT version FROM schema_migrations WHERE version=59");
    if (!migration59.rows.length) {
      await runner.query(`ALTER TABLE support_conversations DROP CONSTRAINT support_resolution_check;
        ALTER TABLE support_conversations ADD CONSTRAINT support_resolution_check CHECK
          (resolved_at IS NULL OR (status='closed' AND assistance_category IN ('buying_assistance','shipment_observation')));`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(59)");
      applied.push(59);
    }
    const migration60 = await runner.query("SELECT version FROM schema_migrations WHERE version=60");
    if (!migration60.rows.length) {
      // Retire automatic billing without deleting historical financial records.
      await runner.query("DROP TRIGGER IF EXISTS business_subscription_after_insert ON businesses");
      await runner.query("DROP FUNCTION IF EXISTS create_business_subscription()");
      await runner.query("INSERT INTO schema_migrations(version) VALUES(60)");
      applied.push(60);
    }
    const migration61 = await runner.query("SELECT version FROM schema_migrations WHERE version=61");
    if (!migration61.rows.length) {
      await runner.query(`
        ALTER TABLE support_conversations
          ADD COLUMN client_confirmed_read_message_id BIGINT NOT NULL DEFAULT 0,
          ADD COLUMN staff_confirmed_read_message_id BIGINT NOT NULL DEFAULT 0,
          ADD COLUMN visitor_confirmed_read_message_id BIGINT NOT NULL DEFAULT 0,
          ADD COLUMN client_confirmed_read_at BIGINT,
          ADD COLUMN staff_confirmed_read_at BIGINT,
          ADD COLUMN visitor_confirmed_read_at BIGINT,
          ADD COLUMN staff_joined_user_id BIGINT REFERENCES users(id),
          ADD COLUMN staff_joined_at BIGINT,
          ADD CONSTRAINT support_confirmed_reads_nonnegative CHECK (
            client_confirmed_read_message_id>=0 AND staff_confirmed_read_message_id>=0 AND visitor_confirmed_read_message_id>=0);
        ALTER TABLE support_events DROP CONSTRAINT ck_support_events_1;
        ALTER TABLE support_events ADD CONSTRAINT ck_support_events_1 CHECK(
          event_type IN ('created','assigned','reassigned','message','closed','reopened','transport_handoff','joined'));
        CREATE TABLE attention_notifications (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          source_key TEXT NOT NULL,
          recipient_key TEXT NOT NULL,
          user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
          visitor_conversation_id BIGINT REFERENCES support_conversations(id) ON DELETE CASCADE,
          conversation_id BIGINT REFERENCES support_conversations(id) ON DELETE CASCADE,
          inquiry_id BIGINT REFERENCES inquiries(id) ON DELETE CASCADE,
          kind TEXT NOT NULL CHECK(kind IN ('inquiry','waiting_chat','assigned','reassigned','joined','message','closed','reopened')),
          created_at BIGINT NOT NULL,
          read_at BIGINT,
          UNIQUE(source_key,recipient_key),
          CHECK ((user_id IS NOT NULL AND visitor_conversation_id IS NULL) OR
            (user_id IS NULL AND visitor_conversation_id IS NOT NULL))
        );
        CREATE INDEX attention_user_feed ON attention_notifications(user_id,id DESC);
        CREATE INDEX attention_visitor_feed ON attention_notifications(visitor_conversation_id,id DESC);
        CREATE INDEX attention_user_unread ON attention_notifications(user_id,id) WHERE read_at IS NULL;
        CREATE TABLE attention_preferences (
          recipient_key TEXT PRIMARY KEY,
          sound_enabled BOOLEAN NOT NULL DEFAULT FALSE,
          language TEXT NOT NULL DEFAULT 'en' CHECK(language IN ('en','am','om','so','ti')),
          updated_at BIGINT NOT NULL
        );
        CREATE TABLE attention_subscriptions (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          recipient_key TEXT NOT NULL,
          kind TEXT NOT NULL CHECK(kind IN ('web','expo')),
          endpoint_hash TEXT NOT NULL UNIQUE,
          subscription_json TEXT NOT NULL,
          expires_at BIGINT,
          created_at BIGINT NOT NULL,
          revoked_at BIGINT
        );
        CREATE INDEX attention_recipient_devices ON attention_subscriptions(recipient_key,id) WHERE revoked_at IS NULL;
        CREATE TABLE attention_deliveries (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          notification_id BIGINT NOT NULL REFERENCES attention_notifications(id) ON DELETE CASCADE,
          subscription_id BIGINT NOT NULL REFERENCES attention_subscriptions(id) ON DELETE CASCADE,
          state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','failed','ignored')),
          attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 6),
          next_attempt_at BIGINT NOT NULL,
          lease_until BIGINT,
          provider_receipt TEXT,
          error_category TEXT,
          UNIQUE(notification_id,subscription_id)
        );
        CREATE INDEX attention_delivery_due ON attention_deliveries(next_attempt_at,id) WHERE state IN ('pending','sending');
      `);
      const roles = await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','suqpage_runtime','mirtpage_runtime')");
      for (const table of ['attention_notifications','attention_preferences','attention_subscriptions','attention_deliveries']) {
        await runner.query(`REVOKE ALL ON ${quotedRole(table)} FROM PUBLIC; ALTER TABLE ${quotedRole(table)} ENABLE ROW LEVEL SECURITY`);
        for (const role of roles.rows) {
          if (role.rolname === 'anon' || role.rolname === 'authenticated') await runner.query(`REVOKE ALL ON ${quotedRole(table)} FROM ${quotedRole(role.rolname)}`);
          else {
            await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${quotedRole(table)} TO ${quotedRole(role.rolname)}`);
            await runner.query(`CREATE POLICY ${quotedRole(`${table}_${role.rolname}`)} ON ${quotedRole(table)} TO ${quotedRole(role.rolname)} USING (true) WITH CHECK (true)`);
          }
        }
      }
      for (const role of roles.rows.filter(r => ['suqpage_runtime','mirtpage_runtime'].includes(r.rolname))) await runner.query(`GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA ${quotedRole(schema)} TO ${quotedRole(role.rolname)}`);
      await runner.query("INSERT INTO schema_migrations(version) VALUES(61)");
      applied.push(61);
    }
    const migration62=await runner.query('SELECT version FROM schema_migrations WHERE version=62');
    if(!migration62.rows.length){
      // One device may receive its owner's alerts and its separate guest chat.
      // Keep those authority bindings independent instead of overwriting either.
      await runner.query(`ALTER TABLE attention_subscriptions DROP CONSTRAINT attention_subscriptions_endpoint_hash_key;
        ALTER TABLE attention_subscriptions ADD CONSTRAINT attention_subscription_binding UNIQUE(endpoint_hash,recipient_key);`);
      await runner.query('INSERT INTO schema_migrations(version) VALUES(62)');applied.push(62);
    }
    const migration63=await runner.query('SELECT version FROM schema_migrations WHERE version=63');
    if(!migration63.rows.length){
      await runner.query(`CREATE TABLE content_reports (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        receipt TEXT NOT NULL UNIQUE,
        business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
        product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
        handle TEXT NOT NULL,business_name TEXT NOT NULL,product_name TEXT NOT NULL DEFAULT '',
        reason TEXT NOT NULL CHECK(reason IN ('Misleading listing','Prohibited goods','Abusive content','Other')),
        details TEXT NOT NULL DEFAULT '' CHECK(length(details)<=1500),
        request_hash TEXT NOT NULL UNIQUE,payload_hash TEXT NOT NULL,ip_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','review','resolved','dismissed')),
        version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
        assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        decided_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at BIGINT NOT NULL,updated_at BIGINT NOT NULL
      );CREATE INDEX content_reports_queue ON content_reports(status,created_at DESC,id DESC);
      REVOKE ALL ON content_reports FROM PUBLIC;REVOKE ALL ON content_reports_id_seq FROM PUBLIC;ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;`);
      const roles=await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','suqpage_runtime','mirtpage_runtime')");
      for(const role of roles.rows){
        if(['anon','authenticated'].includes(role.rolname))await runner.query(`REVOKE ALL ON content_reports FROM ${quotedRole(role.rolname)};REVOKE ALL ON content_reports_id_seq FROM ${quotedRole(role.rolname)}`);
        else {
          await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON content_reports TO ${quotedRole(role.rolname)};GRANT USAGE,SELECT ON content_reports_id_seq TO ${quotedRole(role.rolname)}`);
          await runner.query(`CREATE POLICY ${quotedRole('content_reports_'+role.rolname)} ON content_reports TO ${quotedRole(role.rolname)} USING(true) WITH CHECK(true)`);
        }
      }
      await runner.query('INSERT INTO schema_migrations(version) VALUES(63)');applied.push(63);
    }
    const migration64 = await runner.query('SELECT version FROM schema_migrations WHERE version=64');
    if (!migration64.rows.length) {
      await runner.query(`ALTER TABLE business_discovery_profiles
        ADD COLUMN country_code TEXT NOT NULL DEFAULT '' CHECK(country_code='' OR country_code ~ '^[A-Z]{2}$'),
        ADD COLUMN city_id TEXT NOT NULL DEFAULT '' CHECK(length(city_id)<=100);
        ALTER TABLE owner_location_proposals ADD COLUMN country_code TEXT NOT NULL DEFAULT '' CHECK(country_code='' OR country_code ~ '^[A-Z]{2}$');`);
      // Only an existing canonical Ethiopian ID establishes a country. Keep all
      // coordinates and unknown legacy placements unchanged.
      await runner.query("UPDATE owner_location_proposals SET country_code='ET' WHERE place_id=ANY(?::text[])", [ethiopianPlaces.map(place => place.id)]);
      await runner.query(`UPDATE business_discovery_profiles p SET country_code=l.country_code,city_id=l.place_id
        FROM owner_location_proposals l WHERE l.business_id=p.business_id AND l.country_code='ET'
        AND p.city=l.city AND p.region=l.region`);
      const checks = await runner.query<{conname:string; definition:string}>(`SELECT conname,pg_get_constraintdef(oid) definition FROM pg_constraint
        WHERE conrelid='owner_location_proposals'::regclass AND contype='c'`);
      for (const name of ['owner_location_place_anchor_check','owner_location_proposals_check']) {
        const check=checks.rows.find(check=>check.conname===name);
        if(!check||!['latitude','longitude','3','15','32','49'].every(token=>check.definition.includes(token)))throw Error('Unexpected owner coordinate constraint; review the migration target.');
        await runner.query(`ALTER TABLE owner_location_proposals DROP CONSTRAINT ${quotedRole(name)}`);
      }
      await runner.query(`ALTER TABLE owner_location_proposals
        ADD CONSTRAINT owner_location_privacy_coordinates_check CHECK(
          (location_mode='area' AND latitude IS NULL AND longitude IS NULL) OR
          (location_mode='storefront' AND latitude IS NOT NULL AND longitude IS NOT NULL AND
            latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)),
        ADD CONSTRAINT owner_location_place_anchor_check CHECK(
          (place_id IS NULL AND place_latitude IS NULL AND place_longitude IS NULL) OR
          (place_id IS NOT NULL AND length(place_id) BETWEEN 1 AND 100 AND place_latitude IS NOT NULL AND
            place_longitude IS NOT NULL AND place_latitude BETWEEN -90 AND 90 AND place_longitude BETWEEN -180 AND 180));
        CREATE INDEX discovery_country_city ON business_discovery_profiles(country_code,city_id) WHERE approved_at>0;
        INSERT INTO schema_migrations(version) VALUES(64)`);
      const profileChecks=await runner.query<{conname:string;definition:string}>(`SELECT conname,pg_get_constraintdef(oid) definition FROM pg_constraint WHERE conrelid='business_discovery_profiles'::regclass AND contype='c'`);
      for(const [name,tokens] of [['ck_business_discovery_profiles_1',['latitude','3','15']],['ck_business_discovery_profiles_2',['longitude','32','49']]] as const) {
        const check=profileChecks.rows.find(check=>check.conname===name);
        if(!check||!tokens.every(token=>check.definition.includes(token)))throw Error('Unexpected discovery coordinate constraint; review the migration target.');
        await runner.query(`ALTER TABLE business_discovery_profiles DROP CONSTRAINT ${quotedRole(name)}`);
      }
      await runner.query(`ALTER TABLE business_discovery_profiles ADD CONSTRAINT discovery_world_coordinates_check CHECK(latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)`);
      applied.push(64);
    }
    const migration65 = await runner.query('SELECT version FROM schema_migrations WHERE version=65');
    if (!migration65.rows.length) {
      await runner.query(`ALTER TABLE support_conversations
        ADD COLUMN awaiting_participant_since BIGINT,
        ADD COLUMN idle_ended_at BIGINT;
        CREATE INDEX support_open_participant_idle ON support_conversations(participant_kind,awaiting_participant_since,id)
          WHERE status='open' AND assigned_user_id IS NOT NULL
            AND awaiting_participant_since IS NOT NULL AND resolved_at IS NULL;
        INSERT INTO schema_migrations(version) VALUES(65)`);
      applied.push(65);
    }
    const migration66 = await runner.query('SELECT version FROM schema_migrations WHERE version=66');
    if (!migration66.rows.length) {
      // Existing sender roles cannot safely be reconstructed after a role change.
      // Leave historical rows NULL; all new sends record server-derived authority.
      await runner.query(`ALTER TABLE support_messages ADD COLUMN sender_side TEXT
        CHECK(sender_side IN ('participant','staff'));
        INSERT INTO schema_migrations(version) VALUES(66)`);
      applied.push(66);
    }
    const migration67 = await runner.query('SELECT version FROM schema_migrations WHERE version=67');
    if (!migration67.rows.length) {
      await runner.query(`ALTER TABLE support_conversations
        ADD COLUMN awaiting_staff_since BIGINT,
        ADD COLUMN awaiting_staff_message_id BIGINT,
        ADD COLUMN overdue_notified_message_id BIGINT,
        ADD COLUMN staff_joined_assignment_id BIGINT,
        ADD CONSTRAINT support_staff_reply_anchor_check CHECK(
          (awaiting_staff_since IS NULL AND awaiting_staff_message_id IS NULL) OR
          (awaiting_staff_since IS NOT NULL AND awaiting_staff_message_id IS NOT NULL
            AND awaiting_staff_since>=0 AND awaiting_staff_message_id>0)),
        ADD CONSTRAINT support_reply_notification_anchor_check CHECK(overdue_notified_message_id IS NULL OR overdue_notified_message_id>0),
        ADD CONSTRAINT support_explicit_join_assignment_check CHECK(staff_joined_assignment_id IS NULL OR staff_joined_assignment_id>0);
        ALTER TABLE attention_notifications DROP CONSTRAINT attention_notifications_kind_check;
        ALTER TABLE attention_notifications ADD CONSTRAINT attention_notifications_kind_check
          CHECK(kind IN ('inquiry','waiting_chat','assigned','reassigned','joined','message','closed','reopened','reply_overdue'))`);
      // Original send-side is authoritative. A historical visitor or original
      // owner is also certain; another legacy user may have been staff, including
      // an ambiguous old note, so never infer an unanswered cycle across it.
      // Known transport notes are not replies. Preserve all historical messages,
      // read/join cursors and events, and do not accept legacy read-generated joins.
      await runner.query(`WITH cycles AS (
        SELECT c.id,first_unanswered.id message_id,first_unanswered.created_at
        FROM support_conversations c
        LEFT JOIN LATERAL (
          SELECT m.id FROM support_messages m WHERE m.conversation_id=c.id AND (
            (m.sender_side='staff' AND
              (c.assistance_category NOT IN ('shipment_observation','buying_assistance') OR m.visitor_visible)) OR
            (m.sender_side IS NULL AND m.sender_kind='user' AND NOT
              (c.participant_kind='client' AND m.sender_user_id=c.opened_by_user_id)))
          ORDER BY m.id DESC LIMIT 1
        ) possible_reply ON TRUE
        CROSS JOIN LATERAL (
          SELECT m.id,m.created_at FROM support_messages m
          WHERE m.conversation_id=c.id AND m.id>COALESCE(possible_reply.id,0)
            AND m.created_at>=0 AND (
              m.sender_side='participant' OR
              (m.sender_side IS NULL AND (
                (c.participant_kind='visitor' AND m.sender_kind='visitor') OR
                (c.participant_kind='client' AND m.sender_kind='user' AND m.sender_user_id=c.opened_by_user_id))))
          ORDER BY m.id LIMIT 1
        ) first_unanswered
        WHERE c.status IN ('waiting','open') AND c.resolved_at IS NULL
      ) UPDATE support_conversations c SET awaiting_staff_since=cycles.created_at,
          awaiting_staff_message_id=cycles.message_id,overdue_notified_message_id=cycles.message_id
        FROM cycles WHERE c.id=cycles.id`);
      // Only cycles still needing their first escalation enter the worker index;
      // legacy cycles are visible as overdue without a catch-up push flood.
      await runner.query(`CREATE INDEX support_staff_reply_pending ON support_conversations(awaiting_staff_since,id)
        WHERE status IN ('waiting','open') AND resolved_at IS NULL
          AND awaiting_staff_since IS NOT NULL AND awaiting_staff_message_id IS NOT NULL
          AND overdue_notified_message_id IS DISTINCT FROM awaiting_staff_message_id;
        INSERT INTO schema_migrations(version) VALUES(67)`);
      applied.push(67);
    }
    const migration68 = await runner.query('SELECT version FROM schema_migrations WHERE version=68');
    if (!migration68.rows.length) {
      await runner.query(`ALTER TABLE support_conversations DROP CONSTRAINT support_resolution_check;
        ALTER TABLE support_conversations ADD CONSTRAINT support_resolution_check CHECK(resolved_at IS NULL OR status='closed');
        ALTER TABLE support_events DROP CONSTRAINT ck_support_events_1;
        ALTER TABLE support_events ADD CONSTRAINT ck_support_events_1 CHECK(event_type IN
          ('created','assigned','reassigned','message','closed','reopened','transport_handoff','joined','idle_ended'));
        CREATE INDEX support_idle_end_evidence_latest ON support_events(conversation_id,id DESC) WHERE event_type='idle_ended';
        INSERT INTO schema_migrations(version) VALUES(68)`);
      applied.push(68);
    }
    const migration69 = await runner.query('SELECT version FROM schema_migrations WHERE version=69');
    if (!migration69.rows.length) {
      await runner.query(`ALTER TABLE support_conversations ADD COLUMN overdue_notified_assignment_id BIGINT
          CHECK(overdue_notified_assignment_id IS NULL OR overdue_notified_assignment_id>=0);
        UPDATE support_conversations c SET overdue_notified_assignment_id=COALESCE((
          SELECT MAX(a.id) FROM support_assignments a WHERE a.conversation_id=c.id
            AND a.assigned_user_id=c.assigned_user_id AND a.released_at IS NULL),0)
          WHERE c.overdue_notified_message_id IS NOT NULL;
        CREATE TABLE attention_email_deliveries (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          notification_id BIGINT NOT NULL UNIQUE REFERENCES attention_notifications(id) ON DELETE CASCADE,
          state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','failed','ignored')),
          attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 6),
          created_at BIGINT NOT NULL,
          next_attempt_at BIGINT NOT NULL,
          lease_until BIGINT,
          expires_at BIGINT NOT NULL,
          accepted_at BIGINT,
          error_category TEXT CHECK(error_category IS NULL OR length(error_category)<=80)
        );
        CREATE INDEX attention_email_delivery_due ON attention_email_deliveries(next_attempt_at,id) WHERE state IN ('pending','sending');
        REVOKE ALL ON attention_email_deliveries FROM PUBLIC;
        REVOKE ALL ON SEQUENCE attention_email_deliveries_id_seq FROM PUBLIC;
        ALTER TABLE attention_email_deliveries ENABLE ROW LEVEL SECURITY`);
      const roles=await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','suqpage_runtime','mirtpage_runtime')");
      for(const role of roles.rows){
        if(['anon','authenticated'].includes(role.rolname)){
          await runner.query(`REVOKE ALL ON attention_email_deliveries FROM ${quotedRole(role.rolname)}`);
          await runner.query(`REVOKE ALL ON SEQUENCE attention_email_deliveries_id_seq FROM ${quotedRole(role.rolname)}`);
        }
        else {
          await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON attention_email_deliveries TO ${quotedRole(role.rolname)}`);
          await runner.query(`CREATE POLICY ${quotedRole(`attention_email_deliveries_${role.rolname}`)} ON attention_email_deliveries
            TO ${quotedRole(role.rolname)} USING (true) WITH CHECK (true)`);
          await runner.query(`GRANT USAGE,SELECT ON SEQUENCE attention_email_deliveries_id_seq TO ${quotedRole(role.rolname)}`);
        }
      }
      await runner.query('INSERT INTO schema_migrations(version) VALUES(69)');
      applied.push(69);
    }
    const migration70 = await runner.query('SELECT version FROM schema_migrations WHERE version=70');
    if (!migration70.rows.length) {
      await runner.query(`CREATE TABLE support_transport_plans (
          conversation_id BIGINT PRIMARY KEY REFERENCES support_conversations(id) ON DELETE CASCADE,
          version INTEGER NOT NULL CHECK(version>0),
          legs JSONB NOT NULL CHECK(jsonb_typeof(legs)='array' AND jsonb_array_length(legs) BETWEEN 1 AND 12 AND octet_length(legs::text)<=24000),
          share_nonce TEXT NOT NULL CHECK(share_nonce ~ '^[a-f0-9]{64}$'),
          share_token_hash TEXT NOT NULL UNIQUE CHECK(share_token_hash ~ '^[a-f0-9]{64}$'),
          updated_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
          updated_at BIGINT NOT NULL CHECK(updated_at>=0)
        );
        REVOKE ALL ON support_transport_plans FROM PUBLIC;
        ALTER TABLE support_transport_plans ENABLE ROW LEVEL SECURITY;
        ALTER TABLE support_events DROP CONSTRAINT ck_support_events_1;
        ALTER TABLE support_events ADD CONSTRAINT ck_support_events_1 CHECK(event_type IN
          ('created','assigned','reassigned','message','closed','reopened','transport_handoff','joined','idle_ended','transport_plan_updated','transport_plan_link_replaced'));
        CREATE INDEX support_transport_plan_events_latest ON support_events(conversation_id,id DESC)
          WHERE event_type IN ('transport_plan_updated','transport_plan_link_replaced')`);
      const roles=await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role','suqpage_runtime','mirtpage_runtime')");
      for(const role of roles.rows){
        if(['anon','authenticated','service_role'].includes(role.rolname))await runner.query(`REVOKE ALL ON support_transport_plans FROM ${quotedRole(role.rolname)}`);
        else{
          await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON support_transport_plans TO ${quotedRole(role.rolname)}`);
          await runner.query(`CREATE POLICY ${quotedRole(`transport_plan_${role.rolname}`)} ON support_transport_plans
            TO ${quotedRole(role.rolname)} USING (true) WITH CHECK (true)`);
        }
      }
      await runner.query('INSERT INTO schema_migrations(version) VALUES(70)');
      applied.push(70);
    }
    const migration71=await runner.query('SELECT version FROM schema_migrations WHERE version=71');
    if(!migration71.rows.length){
      await runner.query(`CREATE TABLE tracking_recipients (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          email TEXT NOT NULL UNIQUE CHECK(length(email) BETWEEN 3 AND 254),
          email_hash TEXT NOT NULL UNIQUE CHECK(email_hash ~ '^[a-f0-9]{64}$'),
          locale TEXT NOT NULL DEFAULT 'en' CHECK(locale IN ('en','am','om')),
          verified_at BIGINT NOT NULL CHECK(verified_at>=0)
        );
        CREATE TABLE tracking_challenges (
          id TEXT PRIMARY KEY CHECK(id ~ '^[a-f0-9]{32}$'),
          email TEXT NOT NULL CHECK(length(email) BETWEEN 3 AND 254),
          email_hash TEXT NOT NULL CHECK(email_hash ~ '^[a-f0-9]{64}$'),
          nonce TEXT NOT NULL CHECK(nonce ~ '^[a-f0-9]{64}$'),
          code_hash TEXT NOT NULL CHECK(code_hash ~ '^[a-f0-9]{64}$'),
          locale TEXT NOT NULL CHECK(locale IN ('en','am','om')),
          attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
          created_at BIGINT NOT NULL,expires_at BIGINT NOT NULL CHECK(expires_at>created_at),
          consumed_at BIGINT,superseded_at BIGINT
        );
        CREATE INDEX tracking_challenge_email_latest ON tracking_challenges(email_hash,created_at DESC,id DESC);
        CREATE INDEX tracking_challenge_expiry ON tracking_challenges(expires_at,id);
        CREATE TABLE tracking_sessions (
          token_hash TEXT PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'),
          recipient_id BIGINT NOT NULL REFERENCES tracking_recipients(id) ON DELETE CASCADE,
          created_at BIGINT NOT NULL,expires_at BIGINT NOT NULL CHECK(expires_at>created_at),revoked_at BIGINT
        );
        CREATE INDEX tracking_session_recipient ON tracking_sessions(recipient_id);
        CREATE INDEX tracking_session_expiry ON tracking_sessions(expires_at,token_hash);
        CREATE TABLE tracking_shipments (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          reference TEXT NOT NULL UNIQUE CHECK(reference ~ '^SHP-[A-F0-9]{20}$'),
          recipient_id BIGINT NOT NULL REFERENCES tracking_recipients(id),
          label TEXT NOT NULL DEFAULT '' CHECK(length(label)<=120),
          version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
          legs JSONB NOT NULL CHECK(jsonb_typeof(legs)='array' AND jsonb_array_length(legs) BETWEEN 1 AND 12 AND octet_length(legs::text)<=24000),
          created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
          idempotency_key TEXT NOT NULL CHECK(idempotency_key ~ '^[A-Za-z0-9_-]{16,100}$'),
          created_at BIGINT NOT NULL,updated_at BIGINT NOT NULL,revoked_at BIGINT,
          UNIQUE(created_by_user_id,idempotency_key)
        );
        CREATE INDEX tracking_recipient_shipments ON tracking_shipments(recipient_id,id DESC) WHERE revoked_at IS NULL;
        CREATE TABLE tracking_events (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          shipment_id BIGINT NOT NULL REFERENCES tracking_shipments(id) ON DELETE CASCADE,
          actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
          event_type TEXT NOT NULL CHECK(event_type IN ('submitted','updated','revoked')),
          detail JSONB NOT NULL CHECK(octet_length(detail::text)<=25000),created_at BIGINT NOT NULL
        );
        CREATE INDEX tracking_event_latest ON tracking_events(shipment_id,id DESC);
        CREATE TABLE tracking_email_deliveries (
          id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          kind TEXT NOT NULL CHECK(kind IN ('code','initial')),
          challenge_id TEXT UNIQUE REFERENCES tracking_challenges(id) ON DELETE CASCADE,
          shipment_id BIGINT UNIQUE REFERENCES tracking_shipments(id) ON DELETE CASCADE,
          CHECK((kind='code' AND challenge_id IS NOT NULL AND shipment_id IS NULL) OR (kind='initial' AND shipment_id IS NOT NULL AND challenge_id IS NULL)),
          state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','failed','ignored')),
          attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 6),
          created_at BIGINT NOT NULL,next_attempt_at BIGINT NOT NULL,expires_at BIGINT NOT NULL,
          lease_until BIGINT,accepted_at BIGINT,error_category TEXT CHECK(error_category IS NULL OR length(error_category)<=80)
        );
        CREATE INDEX tracking_email_due ON tracking_email_deliveries(next_attempt_at,id) WHERE state IN ('pending','sending')`);
      const tables=['tracking_recipients','tracking_challenges','tracking_sessions','tracking_shipments','tracking_events','tracking_email_deliveries'];
      const roles=await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role','suqpage_runtime','mirtpage_runtime')");
      for(const table of tables){
        await runner.query(`REVOKE ALL ON ${table} FROM PUBLIC; ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
        const sequence=['tracking_recipients','tracking_shipments','tracking_events','tracking_email_deliveries'].includes(table)?`${table}_id_seq`:null;
        if(sequence)await runner.query(`REVOKE ALL ON SEQUENCE ${sequence} FROM PUBLIC`);
        for(const role of roles.rows){
          if(['anon','authenticated','service_role'].includes(role.rolname)){
            await runner.query(`REVOKE ALL ON ${table} FROM ${quotedRole(role.rolname)}`);
            if(sequence)await runner.query(`REVOKE ALL ON SEQUENCE ${sequence} FROM ${quotedRole(role.rolname)}`);
          }else{
            await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${table} TO ${quotedRole(role.rolname)}`);
            await runner.query(`CREATE POLICY ${quotedRole(`${table}_${role.rolname}`)} ON ${table} TO ${quotedRole(role.rolname)} USING (true) WITH CHECK (true)`);
            if(sequence)await runner.query(`GRANT USAGE,SELECT ON SEQUENCE ${sequence} TO ${quotedRole(role.rolname)}`);
          }
        }
      }
      await runner.query('INSERT INTO schema_migrations(version) VALUES(71)');applied.push(71);
    }
    const migration72=await runner.query('SELECT version FROM schema_migrations WHERE version=72');
    if(!migration72.rows.length){
      await runner.query('ALTER TABLE tracking_recipients ALTER COLUMN verified_at DROP NOT NULL');
      await runner.query('INSERT INTO schema_migrations(version) VALUES(72)');applied.push(72);
    }
    const migration73=await runner.query('SELECT version FROM schema_migrations WHERE version=73');
    if(!migration73.rows.length){
      const label=await runner.query<{data_type:string;is_nullable:string;column_default:string|null}>(
        "SELECT data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='support_conversations' AND column_name='requester_label'",
      );
      const column=label.rows[0];
      const freshBaselineDefault=!installed.rows[0]?.name&&column?.column_default===null;
      if(column?.data_type!=='text'||column.is_nullable!=='NO'||(!freshBaselineDefault&&!["'Suqpage client'::text","'MirtPage client'::text"].includes(column.column_default||''))){
        throw new Error('Migration 73 requires the reviewed support requester-label metadata and default.');
      }
      await runner.query("ALTER TABLE support_conversations ALTER COLUMN requester_label SET DEFAULT 'MirtPage client'");
      await runner.query('INSERT INTO schema_migrations(version) VALUES(73)');applied.push(73);
    }
    const migration74=await runner.query('SELECT version FROM schema_migrations WHERE version=74');
    if(!migration74.rows.length){
      // Immutable platform-reference snapshot; future UI copy cannot alter74.
      const categories=[
        ['electronics','Electronics & electrical','circuit',0],
        ['beauty-wellness','Personal care & household','leaf',1],
        ['agriculture-growers','Farms, livestock & feed','sprout',2],
        ['food-farming','Food & drink','bowl',3],
        ['machinery-tools','Tools, machines & metalwork','tool',4],
        ['home-living','Furniture, art & building','frame',5],
        ['fashion-textiles','Clothes, fabrics & leather','thread',6],
      ] as const;
      const columns=await runner.query<{column_name:string;data_type:string;is_nullable:string}>(
        "SELECT column_name,data_type,is_nullable FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='discovery_industries' ORDER BY ordinal_position",
      );
      const expectedColumns=[['key','text'],['label','text'],['icon','text'],['position','bigint'],['active','bigint']];
      const constraints=await runner.query<{contype:string;convalidated:boolean;definition:string}>(
        "SELECT contype,convalidated,pg_get_constraintdef(oid) definition FROM pg_constraint WHERE conrelid='discovery_industries'::regclass",
      );
      const normalized=(definition:string)=>definition.replace(/\s+/g,'');
      if(columns.rows.length!==5||!columns.rows.every((column,index)=>column.column_name===expectedColumns[index][0]&&column.data_type===expectedColumns[index][1]&&column.is_nullable==='NO')||
        constraints.rows.length!==2||constraints.rows.some(constraint=>!constraint.convalidated)||
        !constraints.rows.some(constraint=>constraint.contype==='p'&&normalized(constraint.definition)==='PRIMARYKEY(key)')||
        !constraints.rows.some(constraint=>constraint.contype==='c'&&normalized(constraint.definition)==='CHECK((active=ANY(ARRAY[(0)::bigint,(1)::bigint])))')){
        throw new Error('Migration 74 requires the reviewed business-category reference schema.');
      }
      const keys=categories.map(category=>category[0]);
      const existing=await runner.query<{key:string;active:number}>(
        'SELECT key,active FROM discovery_industries WHERE key=ANY(?::text[]) FOR UPDATE',[keys],
      );
      if(existing.rows.some(row=>Number(row.active)!==1))throw new Error('Migration 74 requires existing canonical business categories to be active.');
      for(const [key,label,icon,position]of categories){
        await runner.query('INSERT INTO discovery_industries(key,label,icon,position,active) VALUES(?,?,?,?,1) ON CONFLICT(key) DO NOTHING',[key,label,icon,position]);
        await runner.query('UPDATE discovery_industries SET position=? WHERE key=? AND position IS DISTINCT FROM ?',[position,key,position]);
      }
      const after=await runner.query<{key:string;position:number;active:number}>(
        'SELECT key,position,active FROM discovery_industries WHERE key=ANY(?::text[]) ORDER BY position',[keys],
      );
      if(after.rows.length!==categories.length||!after.rows.every((row,index)=>row.key===categories[index][0]&&Number(row.position)===categories[index][3]&&Number(row.active)===1)){
        throw new Error('Migration 74 could not verify canonical business-category references.');
      }
      await runner.query('INSERT INTO schema_migrations(version) VALUES(74)');applied.push(74);
    }
    const migration75=await runner.query('SELECT version FROM schema_migrations WHERE version=75');
    if(!migration75.rows.length){
      const columns=await runner.query<{table_name:string;column_name:string;data_type:string;is_nullable:string;column_default:string|null}>(
        "SELECT table_name,column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema=current_schema() AND (table_name='tracking_shipments' AND column_name='legs' OR table_name='tracking_events' AND column_name='detail') ORDER BY table_name",
      );
      const expectedColumns=[['tracking_events','detail'],['tracking_shipments','legs']];
      const constraintQuery="SELECT c.conname,c.contype,c.convalidated,pg_get_expr(c.conbin,c.conrelid) expression FROM pg_constraint c JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=ANY(c.conkey) WHERE c.contype='c' AND (c.conrelid='tracking_shipments'::regclass AND a.attname='legs' OR c.conrelid='tracking_events'::regclass AND a.attname='detail') ORDER BY c.conname";
      const before=await runner.query<{conname:string;contype:string;convalidated:boolean;expression:string}>(constraintQuery);
      const expressions=[
        '(octet_length((detail)::text) <= 25000)',
        "((jsonb_typeof(legs) = 'array'::text) AND ((jsonb_array_length(legs) >= 1) AND (jsonb_array_length(legs) <= 12)) AND (octet_length((legs)::text) <= 24000))",
      ];
      const names=['tracking_events_detail_check','tracking_shipments_legs_check'],normalized=(value:string)=>value.replace(/\s+/g,'');
      const reviewed=(rows:typeof before.rows,expected:readonly string[])=>rows.length===2&&rows.every((row,index)=>row.conname===names[index]&&row.contype==='c'&&row.convalidated&&normalized(row.expression)===normalized(expected[index]));
      if(columns.rows.length!==2||!columns.rows.every((column,index)=>column.table_name===expectedColumns[index][0]&&column.column_name===expectedColumns[index][1]&&column.data_type==='jsonb'&&column.is_nullable==='NO'&&column.column_default===null)||!reviewed(before.rows,expressions)){
        throw new Error('Migration 75 requires the reviewed shipment tracking JSON bounds.');
      }
      await runner.query("ALTER TABLE tracking_shipments DROP CONSTRAINT tracking_shipments_legs_check, ADD CONSTRAINT tracking_shipments_legs_check CHECK(jsonb_typeof(legs)='array' AND jsonb_array_length(legs) BETWEEN 1 AND 12 AND octet_length(legs::text)<=64000)");
      await runner.query('ALTER TABLE tracking_events DROP CONSTRAINT tracking_events_detail_check, ADD CONSTRAINT tracking_events_detail_check CHECK(octet_length(detail::text)<=65000)');
      const after=await runner.query<typeof before.rows[number]>(constraintQuery);
      if(!reviewed(after.rows,[expressions[0].replace('25000','65000'),expressions[1].replace('24000','64000')]))throw new Error('Migration 75 could not verify shipment tracking JSON bounds.');
      await runner.query('INSERT INTO schema_migrations(version) VALUES(75)');applied.push(75);
    }
    const migration76=await runner.query('SELECT version FROM schema_migrations WHERE version=76');
    if(!migration76.rows.length){
      if(!(await runner.query('SELECT version FROM schema_migrations WHERE version=75')).rows.length){
        throw new Error('Migration 76 requires shipment-tracking schema 75.');
      }
      await runner.query(`CREATE TABLE staff_business_grants (
        user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        enabled BIGINT NOT NULL CHECK(enabled IN (0,1)),
        version BIGINT NOT NULL CHECK(version>=1),
        updated_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        updated_at BIGINT NOT NULL CHECK(updated_at>=0)
      )`);
      await runner.query(`INSERT INTO staff_business_grants(user_id,enabled,version,updated_by_user_id,updated_at)
        SELECT p.user_id,1,1,NULL,? FROM user_access_profiles p
        WHERE p.access_role IN ('team_member','operations_manager')`,[Date.now()]);
      await runner.query('REVOKE ALL ON staff_business_grants FROM PUBLIC');
      await runner.query('ALTER TABLE staff_business_grants ENABLE ROW LEVEL SECURITY');
      for(const role of ['anon','authenticated','service_role','suqpage_runtime','mirtpage_runtime']){
        if(!(await runner.query('SELECT 1 FROM pg_roles WHERE rolname=?',[role])).rows.length)continue;
        if(['anon','authenticated','service_role'].includes(role)){
          await runner.query(`REVOKE ALL ON staff_business_grants FROM ${quotedRole(role)}`);
        }else{
          await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON staff_business_grants TO ${quotedRole(role)}`);
          await runner.query(`CREATE POLICY ${quotedRole(`staff_business_grants_${role}`)} ON staff_business_grants TO ${quotedRole(role)} USING (true) WITH CHECK (true)`);
        }
      }
      const missing=await runner.query<{total:number}>(`SELECT COUNT(*) total FROM user_access_profiles p
        LEFT JOIN staff_business_grants g ON g.user_id=p.user_id
        WHERE p.access_role IN ('team_member','operations_manager') AND (g.user_id IS NULL OR g.enabled<>1 OR g.version<>1)`);
      if(Number(missing.rows[0]?.total)!==0)throw new Error('Migration 76 did not backfill every current staff account.');
      await runner.query('INSERT INTO schema_migrations(version) VALUES(76)');applied.push(76);
    }
    const migration77=await runner.query('SELECT version FROM schema_migrations WHERE version=77');
    if(!migration77.rows.length){
      if(!(await runner.query('SELECT version FROM schema_migrations WHERE version=76')).rows.length){
        throw new Error('Migration 77 requires staff-grant schema 76.');
      }
      await runner.query(`CREATE TABLE owner_email_change_requests (
        user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        provider_user_id TEXT NOT NULL CHECK(length(provider_user_id) BETWEEN 32 AND 64),
        old_email TEXT NOT NULL CHECK(length(old_email) BETWEEN 3 AND 254),
        new_email TEXT NOT NULL CHECK(length(new_email) BETWEEN 3 AND 254),
        state TEXT NOT NULL CHECK(state IN ('prepared','pending','reconciled')),
        requested_at BIGINT NOT NULL CHECK(requested_at>=0),
        expires_at BIGINT NOT NULL CHECK(expires_at>requested_at),
        last_sent_at BIGINT,
        old_verified_at BIGINT,
        new_verified_at BIGINT,
        reconciled_at BIGINT,
        CHECK(old_email<>new_email)
      );
      CREATE INDEX owner_email_change_expiry ON owner_email_change_requests(expires_at,user_id) WHERE state<>'reconciled';
      CREATE TABLE owner_auth_session_fences (
        user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        valid_after_epoch_seconds BIGINT NOT NULL CHECK(valid_after_epoch_seconds>=0)
      )`);
      for(const table of ['owner_email_change_requests','owner_auth_session_fences']){
        await runner.query(`REVOKE ALL ON ${table} FROM PUBLIC; ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
        const roles=await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role','suqpage_runtime','mirtpage_runtime')");
        for(const role of roles.rows){
          if(['anon','authenticated','service_role'].includes(role.rolname))await runner.query(`REVOKE ALL ON ${table} FROM ${quotedRole(role.rolname)}`);
          else{
            await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${table} TO ${quotedRole(role.rolname)}`);
            await runner.query(`CREATE POLICY ${quotedRole(`${table}_${role.rolname}`)} ON ${table} TO ${quotedRole(role.rolname)} USING (true) WITH CHECK (true)`);
          }
        }
      }
      await runner.query('INSERT INTO schema_migrations(version) VALUES(77)');applied.push(77);
    }
    const migration78=await runner.query('SELECT version FROM schema_migrations WHERE version=78');
    if(!migration78.rows.length){
      if(!(await runner.query('SELECT version FROM schema_migrations WHERE version=77')).rows.length)throw new Error('Migration 78 requires schema 77.');
      await runner.query(`ALTER TABLE inquiries ADD COLUMN read_at TEXT;
        ALTER TABLE inquiries ADD COLUMN request_fingerprint TEXT CHECK(request_fingerprint IS NULL OR request_fingerprint ~ '^[0-9a-f]{64}$');
        CREATE INDEX inquiries_unread ON inquiries(business_id,created_at DESC,id DESC) WHERE read_at IS NULL`);
      await runner.query('INSERT INTO schema_migrations(version) VALUES(78)');applied.push(78);
    }
    const migration79=await runner.query('SELECT version FROM schema_migrations WHERE version=79');
    if(!migration79.rows.length){
      if(!(await runner.query('SELECT version FROM schema_migrations WHERE version=78')).rows.length)throw new Error('Migration 79 requires schema 78.');
      await runner.query(`CREATE TABLE transport_partner_interests (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        reference TEXT NOT NULL UNIQUE CHECK(reference ~ '^PI-[A-F0-9]{12}$'),
        company_name TEXT NOT NULL CHECK(length(company_name) BETWEEN 2 AND 160),
        contact_name TEXT NOT NULL CHECK(length(contact_name) BETWEEN 2 AND 80),
        email TEXT NOT NULL CHECK(length(email) BETWEEN 3 AND 160),
        email_hash TEXT NOT NULL,phone TEXT,message TEXT NOT NULL CHECK(length(message) BETWEEN 1 AND 4000),
        locale TEXT NOT NULL CHECK(locale IN ('en','am','om')),
        idempotency_key TEXT NOT NULL UNIQUE,request_fingerprint TEXT NOT NULL CHECK(request_fingerprint ~ '^[a-f0-9]{64}$'),
        ip_hash TEXT NOT NULL,created_at BIGINT NOT NULL CHECK(created_at>=0)
      );
      CREATE INDEX transport_partner_interest_retention ON transport_partner_interests(created_at,id);
      CREATE TABLE transport_partner_interest_deliveries (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        interest_id BIGINT NOT NULL REFERENCES transport_partner_interests(id) ON DELETE CASCADE,
        admin_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','ignored','failed')),
        attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 6),
        created_at BIGINT NOT NULL,next_attempt_at BIGINT NOT NULL,expires_at BIGINT NOT NULL,
        lease_until BIGINT,accepted_at BIGINT,error_category TEXT,
        UNIQUE(interest_id,admin_user_id)
      );
      CREATE INDEX transport_partner_interest_due ON transport_partner_interest_deliveries(next_attempt_at,id) WHERE state IN ('pending','sending')`);
      for(const table of ['transport_partner_interests','transport_partner_interest_deliveries']){
        await runner.query(`REVOKE ALL ON ${table} FROM PUBLIC; ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
        const roles=await runner.query<{rolname:string}>("SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role','suqpage_runtime','mirtpage_runtime')");
        for(const role of roles.rows){
          if(['anon','authenticated','service_role'].includes(role.rolname))await runner.query(`REVOKE ALL ON ${table} FROM ${quotedRole(role.rolname)}`);
          else{
            await runner.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${table} TO ${quotedRole(role.rolname)}`);
            await runner.query(`GRANT USAGE,SELECT ON SEQUENCE ${table}_id_seq TO ${quotedRole(role.rolname)}`);
            await runner.query(`CREATE POLICY ${quotedRole(`${table}_${role.rolname}`)} ON ${table} TO ${quotedRole(role.rolname)} USING (true) WITH CHECK (true)`);
          }
        }
      }
      await runner.query('INSERT INTO schema_migrations(version) VALUES(79)');applied.push(79);
    }
    return { applied };
  });
}
