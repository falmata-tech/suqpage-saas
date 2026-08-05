# MirtPage delivery and managed-service runbook

This runbook is the operator path for repository checks, Supabase Storage,
PostgreSQL rehearsal, deployment, and rollback. It does not authorize a
production launch or database cutover.

## Current authority

- Node.js `24.18.1` is the repository, nvm, Docker, and CI baseline.
- SQLite is the only application database runtime. It requires one application
  instance and a persistent database volume.
- Supabase Storage is an optional private media adapter. Filesystem storage is
  the default and remains the rollback source during a storage migration.
- MirtPage owns password hashes, opaque sessions, role profiles, revocation,
  and tenant bindings. Supabase Auth is not enabled.
- PostgreSQL tooling creates and reconciles a disposable rehearsal target. It
  does not enable PostgreSQL application traffic.

## Connect Codex and GitHub safely

Use either the Codex GitHub connector or GitHub CLI. Never paste a personal
access token into chat, a terminal command, `.env`, or repository files.

1. In Codex, open connectors, connect GitHub, and grant access only to the
   MirtPage repository. Repository read and Actions read are enough for CI
   review; write access is needed only when you explicitly ask Codex to push or
   open a pull request.
2. For local CLI access, run `gh auth login --web --git-protocol https`, finish
   the browser flow, then run `gh auth status`.
3. Ask Codex to inspect the exact commit's checks. A successful earlier commit
   is not evidence for a newer one.
4. Revoke the connector or CLI authorization from GitHub when the machine or
   collaborator no longer needs it.

## Repository protection

Protect `main` after all five jobs have passed at least once on the target
branch:

- `core`
- `browser`
- `container`
- `dependency`
- `postgres`

Require a pull request, dismiss stale approvals, require the branch to be up to
date, block force pushes, and block branch deletion. Add a human review
requirement when a second trusted reviewer is available. Do not remove a
failing required check to merge around it.

## Local release sequence

Run from a clean checkout using the version selected by `.nvmrc`:

```bash
nvm use
npm ci
npm run check
npm run test:postgres-readiness
npm run test:acceptance
npm run test:operations
npm run release
npm run test:container
```

`npm run reset` destroys and reseeds the configured database. It is for an
explicitly disposable installation only. Existing data uses `npm run migrate`.

## Supabase Storage

1. Create a private bucket. Do not make the bucket public.
2. Keep `MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY` server-only. It bypasses bucket
   row-level policies and must never enter browser code or build arguments.
3. Set `MIRTPAGE_MEDIA_DRIVER=supabase`, the HTTPS project URL, private bucket
   name, service key, and bounded request timeout in the deployment secret
   manager.
4. Back up the database and filesystem media source.
5. Run `npm run migrate:media`, then `npm run reconcile:media`. Treat any
   missing or mismatched authoritative object as a failed migration.
6. Verify a published image and an authorized private request attachment
   through MirtPage routes. Browser clients must not receive provider keys.
7. Retain the filesystem source through the rollback window. Rollback changes
   the driver to `filesystem`; it does not delete copied objects.

## PostgreSQL rehearsal and initial copy

The automated gate starts a disposable PostgreSQL 17 container:

```bash
npm run test:postgres-readiness
```

For an operator-owned target, use a dedicated empty schema whose name starts
with `mirtpage_rehearsal` and supply the connection string through the process
environment:

```bash
MIRTPAGE_POSTGRES_REHEARSAL_URL='postgresql://...' \
  npm run rehearse:postgres -- --reset-target
```

The rehearsal command opens SQLite read-only, creates only the named rehearsal schema,
copies rows transactionally, resets sequences, installs reviewed constraints,
indexes, and triggers, and verifies counts plus fingerprints.

After a verified backup and quiescence, the initial copy to an empty Supabase
project uses the direct database URL for one command only:

```bash
MIRTPAGE_POSTGRES_DIRECT_URL='postgresql://...' \
MIRTPAGE_POSTGRES_MIGRATION_ROLE='postgres' \
MIRTPAGE_APPROVE_PRODUCTION_COPY=COPY_TO_EMPTY_SUPABASE \
  npm run cutover:postgres
```

For a project already linked with an authenticated Supabase CLI, prefer the
temporary-credential wrapper. It keeps the issued password in process memory,
assumes the Supabase owner role transaction-locally, and writes no secret file:

```bash
MIRTPAGE_APPROVE_PRODUCTION_COPY=COPY_TO_EMPTY_SUPABASE \
  npm run cutover:supabase-linked
```

After a reconciled copy, provision and verify the least-privilege runtime login:

```bash
MIRTPAGE_APPROVE_RUNTIME_ROLE=PROVISION_MIRTPAGE_RUNTIME \
  npm run provision:supabase-runtime
```

The command rotates the fixed `mirtpage_runtime` login, grants only schema use,
table DML, and sequence use, verifies the transaction-pooler login, and writes
the runtime URL plus Storage secrets to ignored
`.local/production-secrets.json` with mode `0600`. It never prints a credential.

The command refuses `--reset-target`, refuses existing MirtPage tables, performs
all writes in one transaction, reconciles every table fingerprint and sequence,
and leaves SQLite byte-identical. `MIRTPAGE_POSTGRES_MIGRATION_ROLE` is optional;
use it only when a provider-issued migration login must assume a named owner role.
The command accepts a PostgreSQL identifier, applies it transaction-locally, and
fails closed when role assumption is unavailable. It also disables the provider
statement timeout only for that guarded copy transaction; runtime queries retain
their bounded timeout. Never configure the direct URL or migration role in Vercel.
Fingerprint reconciliation canonicalizes only SQLite REAL/PostgreSQL double
precision values to 12 decimal places; every other column is compared exactly.

## Deployment secrets and configuration

Keep these outside GitHub artifacts and the repository:

- `NEXT_PUBLIC_APP_URL`
- `MIRTPAGE_CANONICAL_URL`
- `MIRTPAGE_SERVER_ACTION_ORIGINS`
- `MIRTPAGE_DATABASE_DRIVER`
- `MIRTPAGE_POSTGRES_URL` (Supabase transaction pooler in Vercel)
- `MIRTPAGE_POSTGRES_DIRECT_URL` (operator environment only)
- `MIRTPAGE_POSTGRES_MIGRATION_ROLE` (operator command only, when required)
- `MIRTPAGE_DB_PATH` (SQLite only)
- `MIRTPAGE_MEDIA_ROOT` when using filesystem media
- `MIRTPAGE_SUPABASE_URL`
- `MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY`
- `MIRTPAGE_SUPABASE_STORAGE_BUCKET`
- `PRIVACY_SALT`
- notification provider credentials

Production must use HTTPS, private Supabase Storage, bounded PostgreSQL pooling,
a retained rollback source, and health monitoring on `/api/health`.
The Next.js configuration explicitly includes its source-map runtime and relative
LRU cache dependency in every Vercel function trace. A deployment that logs a
missing framework runtime file fails smoke checks and must not receive the custom
domain.

## Backup, deploy, and rollback

1. Record the exact commit and image digest.
2. Run `npm run backup` and a restore drill before applying migrations.
3. Run `npm run migrate`, `npm run release`, and production preflight against
   the existing database. Never use reset.
4. Deploy one replica, check `/api/health`, sign-in, tenant isolation, media,
   inquiry, support, and one draft/public visibility path.
5. Monitor failed logins, provider failures, request latency, database lock
   pressure, disk capacity, and health checks.
6. Roll back the application image and media driver when needed. Restore data
   only from a named verified backup and only with explicit approval; code
   rollback must not silently reverse an additive migration.

Record local command results, exact commit, GitHub run ID, backup identifier,
image digest, limitations, and remaining operator steps in the controlling spec
or launch verification document. Never record credentials or customer data.
