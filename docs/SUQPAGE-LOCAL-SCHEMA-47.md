# Suqpage local schema 47 verification

Verified 2026-09-17. Scope: Suqpage's retained local PostgreSQL database on
127.0.0.1:54322 only. The owner explicitly authorized finishing this update.
Loadgistic and hosted services were not changed.

## Result

- Applied migrations 46 and 47 from schema 45; repeated migration reports current.
- All 3,401 pre-existing rows across 55 application tables have matching before/
  after fingerprints. Only schema-migration metadata and additive schema changed.
- A rollback-only transaction on the upgraded database verified complete private
  starter creation, page save/readback, service edit, canonical service inquiry,
  city selection and saved coordinates with general-area privacy.
- Fixture rows were rolled back. PostgreSQL identity sequences may advance; no
  existing IDs or content changed and no fake accounts were retained.
- Homepage, sign-in, health and city-search API return HTTP 200 on port 3102.
- New accounts receive starter examples; existing accounts are not auto-backfilled.

## Backup and tooling

Homebrew tooling was updated and libpq@17 17.11 installed. Its client directory is
configured only in the ignored local runtime file as SUQPAGE_PG_BIN_DIR. No shell
profile or hosted provider settings changed.

Protected pre-migration archive:
`.local/local-schema-update/backups/2026-09-17T03-57-38-794Z/`.
The archive and manifest are mode 0600. It was restored into an empty disposable
local database and all 56 table fingerprints matched, including schema metadata.
The rehearsal database was removed. This is a database backup only; private object
Storage was unchanged and is not included or claimed backed up here.

Two archive-tool defects were corrected under DEP-031:

1. Full non-executing pg_restore parsing replaces header-only listing, avoiding
   premature stdin closure and rejecting truncated data blocks.
2. Guarded restore prepares only the verified empty public namespace without
   CASCADE, then restores atomically without broad cleanup flags. Populated
   targets remain rejected. This avoids dropping triggers on nonexistent tables
   and duplicate public-schema creation.

`test:archive-validation` passes valid/large, truncated and invalid-format cases.
`test:operations` passes backup privacy/integrity, required target approval,
continued populated-target denial, trigger restoration and truncated-payload denial.
Typecheck and spec validation pass. General logs contain no archive data/credentials.

## Running and remaining gates

`npm run dev -- --hostname 127.0.0.1 --port 3102` is running with the real local
PostgreSQL, Supabase Auth and private Storage settings. Restarting loads schema 47
without resetting or reseeding existing data.

This completes the requested persistent local update. Production remains on its
previous release. Visual approval of the pending service/place/starter screens,
full release/acceptance gates, scoped commits and any hosted rollout remain
separate work; no hosted email delivery or external video playback is claimed.
Rollback retains schema 47's additive fields/expanded constraints. Review any
new service content before older-code rollback; never shrink constraints or delete
owner records to downgrade. Restore only to an explicitly approved empty recovery
database using the protected backup, not over the retained local database.
