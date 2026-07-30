# Managed PostgreSQL readiness

SuqPage currently supports one Node.js application instance with persistent
SQLite and media volumes. Docker does not make this build horizontally scalable.
Support polling, account entitlement, visit attribution, Expo allocation, and
all tenant workflows use the same authoritative database.

## Current scale controls

- Public and workspace collections are server-paginated.
- Support inboxes use indexed status, tenant, assignee, and message-ID queries.
- Support thread history is bounded to 100 messages and refreshes every five
  seconds only while open.
- Showroom visits deduplicate by business, opaque daily visitor hash, and source.
- Expo assignments are calculated once per changed occurrence membership and
  persisted; one venue floor is shown at a time.
- SQLite uses WAL, foreign keys, a five-second busy timeout, integrity checks,
  persistent volumes, and tested backup/restore commands.

## Required before multiple application instances

1. Define PostgreSQL ports for businesses, auth sessions, revisions, inquiries,
   Expo, subscriptions, analytics, and support. Remove direct `node:sqlite`
   assumptions from application services.
2. Translate migrations and SQLite-specific SQL, including `json_extract`,
   `INSERT OR IGNORE`, triggers, synchronous transactions, and query-plan tests.
3. Rehearse copy, row-count reconciliation, foreign-key validation, tenant
   sampling, and rollback from a production-like backup.
4. Move mutable media to object storage with tenant-safe signed reads and
   retention/backup policy.
5. Choose connection mode and pool size for the deployed runtime. Do not place a
   transaction pooler underneath code that assumes session state.
6. Add scheduled jobs for visit retention, account warnings, and adapter retries;
   jobs must be idempotent and single-owner.
7. Replace support polling only after PostgreSQL is authoritative. Supabase
   Realtime Broadcast is a candidate adapter; authorization and bounded payloads
   remain server-owned.
8. Define database backups, point-in-time recovery, restore drills,
   observability, slow-query thresholds, and a monitored single-instance
   cutover before enabling replicas.

Supabase is a candidate managed PostgreSQL host, not a current runtime mode.
Setting a connection string alone cannot migrate this application safely.
