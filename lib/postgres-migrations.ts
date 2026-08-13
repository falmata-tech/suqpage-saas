import type { PostgresTransactionRunner } from "./postgres-runtime";

const SCHEMA_NAME = /^[a-z_][a-z0-9_]*$/i;

function quotedSchema(schema: string) {
  if (!SCHEMA_NAME.test(schema)) throw new Error("The PostgreSQL migration schema is invalid.");
  return `"${schema}"`;
}

export async function migratePostgresDatabase(
  runner: PostgresTransactionRunner,
  schema = "public",
) {
  return runner.transaction(async () => {
    await runner.query(`SET LOCAL search_path TO ${quotedSchema(schema)}`);
    await runner.query("SELECT pg_advisory_xact_lock(6870619271341)");
    const migration31 = await runner.query<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=31",
    );
    const applied: number[] = [];

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
    return { applied };
  });
}
