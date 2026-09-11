# AfricMade delivery and managed-service runbook

This runbook is the operator path for local Supabase, repository checks,
managed Auth and Storage, PostgreSQL, Netlify deployment, and rollback.
It does not authorize a production launch, DNS change, or destructive cutover.

## Current authority

- Node.js `24.18.1` is the repository, nvm, Docker, and CI baseline.
- Normal development uses the isolated local Supabase stack: PostgreSQL 17,
  local Auth, private Storage, API, and captured email. Realtime and other
  services the app does not yet use locally are disabled. SQLite is
  compatibility and read-only migration infrastructure, not an app runtime.
- Production and Deploy Previews use separate hosted Supabase projects. Each
  selects PostgreSQL through its own transaction pooler, Supabase Auth, and its
  own private Storage bucket through AfricMade's server-side media port. AfricMade
  remains the only role, capability, tenant, and suspension authority.
- PostgreSQL tooling supports disposable rehearsal and a separately guarded,
  copy-only production cutover. The linked Supabase target has reconciled data,
  and the generated Vercel candidate has passed historical PostgreSQL-backed
  smoke checks. Netlify is the current reversible candidate and receives no DNS
  change until the exact current release repeats all gates.

## Local Supabase development

Docker Desktop must be running. The first start downloads the official local
Supabase images and may take several minutes:

```bash
npm run local:supabase:start
npm run local:supabase:configure
npm run local:postgres:copy
npm run local:auth:migrate
npm run local:media:migrate
npm run dev:local
```

`local:supabase:configure` captures only local CLI values into ignored
`.local/supabase-runtime.env` with mode `0600` and never prints credentials.
`local:postgres:copy` opens the retained SQLite demo database read-only and
accepts only loopback PostgreSQL port `54322`. The Auth migration prints
aggregate counts only. Normal app writes then go exclusively to PostgreSQL.

To replace an explicitly disposable local stack, stop the app and run:

```bash
npm run local:supabase:reset
```

The reset uses `supabase db reset --local`; the following bootstrap still
rejects remote database destinations. Never run hosted reset or production-copy
commands for local development. Stop local services with
`npm run local:supabase:stop`.

The normal AfricMade local project uses API/DB ports `54321`/`54322`. Browser
acceptance starts a separate disposable `mirtpage-browser-*` project on
`56321`/`56322`, applies the same schema, copies only an isolated compatibility
fixture, and runs the production Next.js server with PostgreSQL, Supabase Auth,
and private Storage. Its cleanup stops only that disposable project. Never reuse
another repository's Supabase project ID, workdir, volumes, or port family.

## Connect Codex and GitHub safely

Use either the Codex GitHub connector or GitHub CLI. Never paste a personal
access token into chat, a terminal command, `.env`, or repository files.

1. In Codex, open connectors, connect GitHub, and grant access only to the
   AfricMade repository. Repository read and Actions read are enough for CI
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

`npm run reset` is retained only for isolated SQLite compatibility fixtures.
It is not the normal development reset. Existing PostgreSQL data uses
`npm run migrate:postgres`; disposable local data uses the local command above.

## Supabase Auth rollout

1. Apply PostgreSQL migration 37 before selecting the managed Auth driver.
2. Keep the hosted application stopped or on the retained rollback release
   during the one-time retained-user migration.
3. Run `npm run migrate:auth:supabase` without `--apply`. Review only aggregate
   retained, existing, create, linked, and conflict counts.
4. Resolve every conflict. Then run the same exact release with
   `MIRTPAGE_APPROVE_AUTH_MIGRATION=1 npm run migrate:auth:supabase -- --apply`.
5. Configure the exact production site URL and redirect allowlist in Supabase.
   Add the local callback and the selected host's deploy-preview wildcard only
   where needed; do not use a broad production wildcard.
6. Before enabling public email-code entry, configure hosted Supabase custom
   SMTP and send one code to a non-team address. For the bounded tester launch,
   a dedicated Gmail account may use `smtp.gmail.com`, port `587`, its complete
   email address as both sender and username, and a Google app password. Enter
   the app password directly in Supabase; never put it in Netlify, Git, logs, or
   chat. Keep local and browser-test email in the isolated Mailpit instances.
7. Apply the concise AfricMade magic-link template from
   `supabase/templates/magic-link.html`, which renders `{{ .Token }}` as the
   six-digit sign-in code. Prove delivery, expiry, resend throttling, and one-time
   use. Treat personal Gmail as a bounded launch bridge and move to a
   verified-domain transactional sender before broad public promotion.
8. For Google sign-in, create a Google Web OAuth client and place its client ID
   and secret in the Supabase provider dashboard. The callback URI must be the
   exact Supabase callback shown there. Provider secrets never enter Netlify,
   Git, or chat.
9. Enable `MIRTPAGE_AUTH_DRIVER=supabase` on one candidate, prove email OTP and
   Google login, logout, linked/new-user routing, unlinked denial,
   suspended-user denial, and cross-tenant denial, then monitor before retiring
   local sessions.

Supabase proves identity only. `auth_identity_links` maps its immutable UUID to
one MirtPage user; roles and business access never come from OAuth metadata.

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

## PostgreSQL rehearsal and controlled copy

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

For an existing PostgreSQL authority, apply reviewed additive migrations with
the direct migration credential before deploying application code that requires
them:

```bash
MIRTPAGE_POSTGRES_DIRECT_URL='postgresql://...' \
  npm run migrate:postgres
```

The command uses a transaction-scoped advisory lock, reconciles legacy active
showroom-project overlaps into retained cancelled history, installs the partial
unique index, and records migration 31. Application preflight fails closed when
migration 31 is absent.

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
- `MIRTPAGE_POSTGRES_URL` (Supabase transaction pooler on the selected host)
- `MIRTPAGE_POSTGRES_DIRECT_URL` (operator environment only)
- `MIRTPAGE_POSTGRES_MIGRATION_ROLE` (operator command only, when required)
- `MIRTPAGE_DB_PATH` (SQLite only)
- `MIRTPAGE_MEDIA_ROOT` when using filesystem media
- `MIRTPAGE_SUPABASE_URL`
- `MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY`
- `MIRTPAGE_SUPABASE_STORAGE_BUCKET`
- `MIRTPAGE_AUTH_DRIVER`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `MIRTPAGE_GOOGLE_AUTH_ENABLED`
- `PRIVACY_SALT`
- notification provider credentials

Production must use HTTPS, private Supabase Storage, bounded PostgreSQL pooling,
a retained rollback source, and health monitoring on `/api/health`.
The Next.js configuration explicitly includes its source-map runtime and relative
LRU cache dependency in every Vercel function trace. A deployment that logs a
missing framework runtime file fails smoke checks and must not receive the custom
domain. Do not add a broad `./lib/**/*` output-tracing exclusion: Vercel applies
it to Next.js's own server library. The release trace test enforces privacy for
the project's source paths without deleting framework runtime files.

## Netlify candidate

Netlify's maintained Next.js runtime supports App Router, SSR, route handlers,
Server Actions, image optimization, and ISR through OpenNext. The repository
intentionally does not pin a legacy Next.js plugin.

1. Authenticate the CLI with an isolated local home so an unrelated Netlify
   account or project cannot be selected: `HOME="$PWD/.local/netlify-home" npx
   --yes netlify-cli@latest login`. Link only the MirtPage GitHub repository and
   verify the team and site before every deploy. `netlify.toml` supplies
   `npm run build` and Node `24.18.1`.
2. Add separate Preview- and Production-scoped environment variables in the
   Netlify UI. Preview values must belong only to the Preview Supabase project;
   Production values must belong only to Production. Both require their own
   PostgreSQL pooler, publishable key, service-role key, private bucket, and
   privacy salt. Never place a direct PostgreSQL migration URL in Netlify or
   reuse a secret across scopes.
3. Keep `mirtpage.com` on its current target. Test the generated Netlify domain
   for health, public routes, Auth, upload/read, support, PWA, and tenant denial.
4. Run the exact release and remote checks. Only then add the custom domain and
   update DNS. Retain the prior Vercel target for the monitored rollback window.
5. Monitor Netlify credits. The free plan has a hard monthly credit limit and
   can pause service when exhausted; it is suitable for a free commercial
   start, not unmetered production.

The user action required for this stage is Netlify browser/CLI authentication,
choosing the Netlify team/site name, adding secrets in its encrypted UI, and
later controlling DNS at the registrar. Do not paste any secret into chat.

## Realtime, PostGIS, and map geography

- Support messages always commit to PostgreSQL. Realtime may notify only an
  open visible thread or staff inbox, then unsubscribe on close/background. A
  disconnect or quota limit falls back to bounded 4-5 second polling. Queue
  capacity, not Realtime quota, determines whether the UI says agents are busy.
  Local Realtime remains disabled until that optional notification adapter is
  implemented and covered by provider-backed tests.
- The launch basemap uses the centralized `osm-standard` provider and the exact
  `https://tile.openstreetmap.org/{z}/{x}/{y}.png` URL. Tiles load directly in
  the visitor browser for the visible viewport. Do not add a Netlify function,
  caching proxy, prefetch job, bulk download, offline tile pack, or service
  worker route for them. Keep visible OpenStreetMap attribution and the normal
  browser/provider caching headers. An unknown provider setting fails closed.
- Do not enable PostGIS merely to draw the basemap. At tens of thousands of
  showrooms, add PostGIS points and spatial indexes behind a viewport/nearby
  query port so the browser receives bounded MirtPage markers. Search, place
  filtering, and coordinates remain in Supabase regardless of tile provider.

## PWA verification and rollback

The production PWA is enabled unless
`NEXT_PUBLIC_MIRTPAGE_PWA_ENABLED=false` is present at build time. Keep it
enabled for normal releases and verify over the final HTTPS origin that
`/manifest.webmanifest` loads, `/sw.js` controls the page after one reload, a
previously visited public route reaches the branded offline surface without a
network, and `/api`, `/dashboard`, `/preview`, `/login`, and `/request` never
appear in Cache Storage.

A service worker survives an ordinary application rollback. To disable the PWA,
set `NEXT_PUBLIC_MIRTPAGE_PWA_ENABLED=false`, replace `public/sw.js` in the
rollback release with the reviewed `scripts/pwa-cleanup-worker.js` artifact,
and deploy that release at the same origin. Confirm the cleanup worker activates,
deletes only `mirtpage-pwa-` caches, unregisters itself, and leaves subsequent
navigation network-authoritative. Do not remove the registration component or
worker route before this cleanup release has reached controlled browsers.

## Backup, deploy, and rollback

1. Record the exact commit and image digest.
2. Run `npm run backup` and a restore drill before applying migrations.
3. Run `npm run migrate` for SQLite or `npm run migrate:postgres` for managed
   PostgreSQL, then run `npm run release` and production preflight against the
   existing database. Never use reset for retained production data.
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
