# PostgreSQL-only operations

Controlling contracts: BE-035, DEP-031, ADR-0020. Updated 2026-09-14.
This supersedes earlier file-database fixture, copy and restore instructions.

## Development and fresh installation

Every executable environment uses PostgreSQL. Install Node 24.18.1, npm,
Docker and Supabase CLI. Keep local provider values in ignored environment files.

```sh
npm ci
npm run local:supabase:start
npm run local:supabase:bootstrap
npm run dev -- --hostname 127.0.0.1 --port 3102
```

Bootstrap writes the protected local runtime configuration, installs native
PostgreSQL schema 45, seeds an empty local database, reconciles local Auth accounts,
and copies local media into private local Storage. It preserves an existing
populated database. Demo setup is local-only; it never prints generated passwords.
The protected `.local/seed-credentials.txt` is a fixture artifact, not a hosted
credential source. Normal application sign-in uses Supabase email codes only.
Do not copy local Google/SMTP credentials to a hosted project.

`npm run setup` may be rerun safely on a populated local database: it preserves
existing rows instead of resetting them. `local:supabase:reset` remains a destructive
Supabase CLI operation for explicitly disposable local projects; it is never a
repair step for retained data.

The installer uses `lib/postgres-baseline.json` for empty schemas and
`lib/postgres-migrations.ts` for existing versioned schemas. It refuses an
unversioned populated schema. Fresh installation includes discovery taxonomy,
default featured scheduling, constraints, indexes, identity sequences and tenant
triggers. Direct public SQL privileges are revoked. Hosted runtime permissions
must be granted by the separately reviewed least-privilege provisioning operation.

## Isolated tests

Set `SUQPAGE_TEST_POSTGRES_URL` to an isolated local PostgreSQL service, or use
the ignored local Supabase runtime file. Each persistence test creates a random
`suqpage_test_*` schema, installs the native schema, and cleans up its own fixture.
No retained developer rows or hosted database may be used as fixture data.

```sh
npm run check:database-boundaries
npm run test:native-postgres
npm run test:launch-wiring
npm run test:discovery-pagination
npm run test:standard-pages:visual
```

The native install test creates 66 demo businesses inside its own schema and
verifies repeated migrations preserve records. Current browser acceptance starts
a separate Supabase project on ports 56321/56322; development uses 54321/54322.
The browser bootstrap installs directly in PostgreSQL. Local synthetic accounts,
private media and test-issued Auth sessions are explicitly test fixtures.

After explicit visual approval, run `npm run check`, `npm run release`,
`npm run test:acceptance`, `npm run test:operations`, and the applicable container
and hosted rollout checks. Passing a focused local test is not deployment evidence.

## Backup and restore

Use PostgreSQL 17-compatible `pg_dump` and `pg_restore` on PATH or configure
`SUQPAGE_PG_BIN_DIR`. For local Supabase, the exact container may instead be set
in `SUQPAGE_LOCAL_PG_CONTAINER`; its published loopback port is independently
checked against the configured target. Archive tools require
`SUQPAGE_POSTGRES_DIRECT_URL`; credentials are supplied privately, never logged.

```sh
npm run backup
npm run restore -- --from=/absolute/path/to/verified/backup
```

Backup writes a 0600 PostgreSQL custom archive and SHA-256 manifest in a protected
directory. It includes the application `public` schema. Supabase Auth and private
Storage need their separate provider backups; this archive does not claim to
back up provider credentials or media objects.

Restore defaults to a plan containing a target digest. Only after reviewing the
exact target, stopping relevant writes and explicitly authorizing the operation,
set `SUQPAGE_APPROVE_POSTGRES_RESTORE` to that digest for one command and add
`--execute`. The tool refuses a populated public schema, verifies archive integrity,
and restores in one transaction. Use an empty recovery database and verify it
before any traffic switch. Existing application data is never automatically dropped.
The native operations test verifies backup, tamper rejection, missing approval,
populated-target denial and restore into an isolated empty database.

## Hosted changes and launch

No repository edit, local test or target digest authorizes a hosted mutation.
DEP-029 still governs Auth/provider configuration, exact fields, recoverable backups
and separate owner approval. Never run `supabase config push` or bulk configuration
restores. Deploy Preview and Production must use separate database/Auth/Storage
projects. Verify hosted Google, email delivery, production credentials, migration
permissions, private media, health and rollback against the exact release candidate.

Historical file-database backups remain inert protected records. No application,
fixture, build, CI job or operations command opens them. Source/data retirement is
not permission to delete historical customer data or backups.

Local development uses the same guarded launcher for `npm run dev` and
`npm run dev:local`. It loads `.local/supabase-runtime.env`, validates the local
PostgreSQL/Auth/Storage endpoints, and accepts `--hostname` / `--port`. CLI port
overrides `PORT`; both app origins follow the chosen address. Startup does not
migrate or reset the database. Restart an older running Next process after changing
these settings. Missing runtime settings require `npm run local:supabase:configure`.

After initial local setup, `npm run dev -- --hostname 127.0.0.1 --port 3102`
checks local PostgreSQL and Auth before launching Next. On macOS it opens Docker
Desktop if needed, waits up to two minutes for the engine, and starts this local
Supabase project if services have not resumed. Supabase startup and readiness each
have a three-minute limit. Healthy services are reused. It never resets, migrates
or seeds data. Missing local settings still require `local:supabase:configure`;
Linux/other systems must start their Docker engine manually when it is stopped.
CLI output containing local keys is not printed by the launcher. A failure points
to the explicit local command to inspect; no hosted configuration is changed.
