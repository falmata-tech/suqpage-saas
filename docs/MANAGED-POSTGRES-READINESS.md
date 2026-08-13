# Managed PostgreSQL readiness

MirtPage supports SQLite for local development/rollback and managed PostgreSQL
for the production runtime. Media can use a persistent filesystem in SQLite
mode or the implemented private Supabase Storage adapter. PostgreSQL mode does
not use a local database file and requires Supabase Storage in production.
Support polling, account entitlement, visit attribution, Daily Featured allocation, and
all tenant workflows use the same authoritative database.

## Current scale controls

- Public and workspace collections are server-paginated.
- Support inboxes use indexed status, tenant, assignee, and message-ID queries.
- Support thread history is bounded to 100 messages and refreshes every five
  seconds only while open.
- Showroom visits deduplicate by business, opaque daily visitor hash, and source.
- Daily Featured assignments are calculated once per changed occurrence membership and
  persisted; one venue floor is shown at a time.
- SQLite uses WAL, foreign keys, a five-second busy timeout, integrity checks,
  persistent volumes, and tested backup/restore commands.
- `npm run test:postgres-readiness` now creates a disposable PostgreSQL 17
  target, translates the complete current SQLite schema, copies all rows,
  installs reviewed constraints, indexes, and 14 triggers, and reconciles
  per-table counts and fingerprints while proving the source is byte-identical.
- `architecture/sqlite-boundaries.json` records 15 reviewed SQLite source,
  local-development, injected-test, migration, or rollback modules. Active
  production workflows select asynchronous runtime adapters, and new direct
  SQLite coupling fails the standard check.
- `MIRTPAGE_DATABASE_DRIVER=postgres` enables PostgreSQL without dual writes and
  fails closed when the managed URL is absent or invalid.

## Required operationally before public production

1. Back up and quiesce the retained SQLite source; record the exact release.
2. Run the guarded copy against an empty Supabase target and retain its complete
   count/fingerprint/constraint/sequence reconciliation evidence.
3. Configure the existing media-storage port for the target private object
   bucket, copy local objects with `npm run migrate:media`, verify hashes, and
   exercise authorized private and stable published reads. This storage step may
   be completed before the database migration.
4. Use the Supabase transaction pooler for Vercel with a bounded application
   pool; reserve the direct URL for the one-time operator copy.
5. Add scheduled jobs for visit retention, account warnings, and adapter retries;
   jobs must be idempotent and single-owner.
6. Replace support polling only after PostgreSQL is authoritative. Supabase
   Realtime Broadcast is a candidate adapter; authorization and bounded payloads
   remain server-owned.
7. Define database backups, point-in-time recovery, restore drills,
   observability, slow-query thresholds, and a monitored single-instance
   cutover before enabling replicas.

Supabase Storage is a current optional media runtime mode described by
ADR-0012. ADR-0013 accepts Supabase as a candidate managed PostgreSQL host while
keeping application-owned authentication for the first database cutover.
`docs/DEVOPS-RUNBOOK.md` contains the current rehearsal and operations sequence.
Setting a connection string alone cannot migrate this application safely.
