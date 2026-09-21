# Suqpage delivery and managed-service runbook

This runbook is the operator path for local Supabase, repository checks,
managed Auth and Storage, PostgreSQL, Netlify deployment, and rollback.
It does not authorize a production launch, DNS change, or destructive cutover.

## Current authority

- Node.js `24.18.1` is the repository, nvm, Docker, and CI baseline.
- Normal development uses the isolated local Supabase stack: PostgreSQL 17,
  local Auth, private Storage, API, and captured email. Realtime and other
  services the app does not yet use locally are disabled. PostgreSQL is the sole
  database engine, including fixtures and operations (BE-035/DEP-031).
- Production and Deploy Previews use separate hosted Supabase projects. Each
  selects PostgreSQL through its own transaction pooler, Supabase Auth, and its
  own private Storage bucket through Suqpage's server-side media port. Suqpage
  remains the only role, capability, tenant, and suspension authority.
- PostgreSQL tooling supports native installation, isolated fixtures, and
  explicitly approved archive recovery. The linked Supabase target has reconciled data,
  and the generated Vercel candidate has passed historical PostgreSQL-backed
  smoke checks. Netlify is the current reversible candidate and receives no DNS
  change until the exact current release repeats all gates.

## Local Supabase development

Docker Desktop must be running. The first start downloads the official local
Supabase images and may take several minutes:

```bash
npm run local:supabase:start
npm run local:supabase:configure
npm run local:postgres:seed
npm run local:auth:migrate
npm run local:media:migrate
npm run dev -- --hostname 127.0.0.1 --port 3102
```

`local:supabase:configure` captures only local CLI values into ignored
`.local/supabase-runtime.env` with mode `0600` and never prints credentials.
`local:postgres:seed` installs the native PostgreSQL schema and seeds only an empty
local database. Existing rows are preserved. Auth migration reports aggregate counts.
See `docs/POSTGRES-ONLY-RUNBOOK.md` for current setup, fixtures and archive recovery.

To replace an explicitly disposable local stack, stop the app and run:

```bash
npm run local:supabase:reset
```

The reset uses `supabase db reset --local`; the following bootstrap still
rejects remote database destinations. Never run hosted reset or production-copy
commands for local development. Stop local services with
`npm run local:supabase:stop`.

The normal Suqpage local project uses API/DB ports `54321`/`54322`. Browser
acceptance starts a separate disposable `suqpage-browser-*` project on
`56321`/`56322`, applies the same schema, copies only an isolated compatibility
fixture, and runs the production Next.js server with PostgreSQL, Supabase Auth,
and private Storage. Its cleanup stops only that disposable project. Never reuse
another repository's Supabase project ID, workdir, volumes, or port family.

## Connect Codex and GitHub safely

Use either the Codex GitHub connector or GitHub CLI. Never paste a personal
access token into chat, a terminal command, `.env`, or repository files.

1. In Codex, open connectors, connect GitHub, and grant access only to the
   Suqpage repository. Repository read and Actions read are enough for CI
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

Full gates follow explicit desktop/phone approval under AGENTS.md. Existing
PostgreSQL data uses `npm run migrate:postgres`; native test fixtures are isolated.

## Supabase Auth rollout

### Recovery safeguards

- Before changing hosted Auth, retain a protected provider-configuration backup
  and review the exact requested fields. Use the guarded plan/apply command
  below; never push the development configuration to Production.
- Hosted `supabase config push` is prohibited, including from isolated working
  directories. The 2026-09-12 incident showed both directory-selection mistakes
  and writes of defaulted fields without an interactive confirmation. A push is
  never a dry run. DEP-029 replaces routine Auth maintenance with the guarded
  plan/apply command below; credential maintenance remains an owner action.
- Keep managed CLI database operations sequential. Each linked command can
  rotate the same temporary login role; concurrent dumps caused one backup to
  fail authentication during this recovery.
- A Netlify draft has Preview runtime context even when built with
  `--context production`. Keep secrets isolated; do not copy Production keys to
  Preview to make that draft work. Test a correctly scoped production candidate
  under a reviewed publication/rollback procedure.
- Check provider health, required Auth flags, schema versions, and Linux native
  dependencies before publication. A Netlify `ready` state alone is not an
  application-health check. A paused Supabase project must be resumed, not
  recreated or treated as evidence that its database password is incorrect.

### Guarded production Auth maintenance

`npm run ops:auth-config -- plan --project sjeiiqxgscuqajpgddcc --patch /absolute/path/to/patch.json`
is read-only remotely. The patch must be JSON containing only the intended
fields, for example `{"mailer_otp_length":6,"mailer_otp_exp":600}`. The tool uses
no local Supabase config, linked project or dotenv file. By default supply a
management token privately as `SUPABASE_ACCESS_TOKEN` for the approved operation
only; never include it in a command argument or commit it. Alternatively add
`--credential-source cli` to both plan and apply to opt into the default Supabase
CLI macOS Keychain entry. This bounded reader checks account `supabase`, then
legacy `access-token` only when the first is absent or returns an empty password.
Missing credentials, locked/denied reads or invalid nonempty credentials stop the
operation. There is no automatic credential fallback,
profile/endpoint discovery or support for other saved-login stores. Unset an
existing environment token before explicitly selecting CLI login.

The output names the pinned project, production origin, proposed safe values,
plan ID, expiry, and review digest. It never prints current provider settings or
credentials. The provider-returned before-state and patch are retained together
under `.local/production-auth-plans` with private permissions. A provider-masked
secret is not recoverable merely because it appears in that backup.

After the owner reviews that exact plan, use:

`npm run ops:auth-config -- apply --project sjeiiqxgscuqajpgddcc --plan PLAN_ID --approve REVIEWED_DIGEST`

Version-2 plans bind credential source and a token fingerprint without storing the
token. A changed login/source or older unbound plan requires a fresh review.
Plans expire after ten minutes. Apply revalidates the backup, digest, scope,
project health, and unchanged remote state before one narrow PATCH and complete
readback. Existing customization flags for approved nonempty subject/template
fields are predicted explicitly, never sent to the provider or ignored wholesale.
All other provider values must match exactly. Coordinate a single writer during
this maintenance window: Supabase's
API does not provide an atomic compare-and-swap for the configuration snapshot.
Verification detects unexpected readback changes but cannot prevent another
administrator writing between the precheck and PATCH. An attempt is never
automatically retried, including after timeout, and there is no blanket rollback.
Inspect the provider state and obtain direction before preparing another plan.

Google credentials/enablement, SMTP credentials, arbitrary templates, and unknown
fields cannot be changed through this tool. Use the owner-authorized provider
dashboard process for those operations. A blocked plan must not be worked around
with raw shell, REST, `--workdir`, or an ignored script. This is a guarded
repository path, not an OS sandbox; restrict management credentials accordingly.

1. Apply PostgreSQL migration 37 before selecting the managed Auth driver.
2. Keep the hosted application stopped or on the retained rollback release
   during the one-time retained-user migration.
3. Run `npm run migrate:auth:supabase` without `--apply`. Review only aggregate
   retained, existing, create, linked, and conflict counts.
4. Resolve every conflict. Then run the same exact release with
   `SUQPAGE_APPROVE_AUTH_MIGRATION=1 npm run migrate:auth:supabase -- --apply`.
5. Configure the exact production site URL and redirect allowlist in Supabase.
   Add the local callback and the selected host's deploy-preview wildcard only
   where needed; do not use a broad production wildcard.
6. Before enabling public email-code entry, configure hosted Supabase custom
   SMTP and send one code to a non-team address. For the bounded tester launch,
   a dedicated Gmail account may use `smtp.gmail.com`, port `587`, its complete
   email address as both sender and username, and a Google app password. Enter
   the app password directly in Supabase; never put it in Netlify, Git, logs, or
   chat. Keep local and browser-test email in the isolated Mailpit instances.
7. Apply the concise Suqpage magic-link template from
   `supabase/templates/magic-link.html`, which renders `{{ .Token }}` as the
   six-digit sign-in code. Prove delivery, expiry, resend throttling, and one-time
   use. Treat personal Gmail as a bounded launch bridge and move to a
   verified-domain transactional sender before broad public promotion.
8. Google sign-in is disabled under S17. Retain existing provider credentials;
   do not restore OAuth unless separately requested. The app ignores old enabled
   flags, and local provisioning sets Google off. Provider-level hosted disablement
   uses the dashboard under DEP-029, never a broad config push.
9. Enable `SUQPAGE_AUTH_DRIVER=supabase` on one candidate, prove email OTP and
   Google-initiation denial, logout, linked/new-user routing, unlinked denial,
   suspended-user denial, and cross-tenant denial, then monitor before retiring
   local sessions.

Supabase proves identity only. `auth_identity_links` maps its immutable UUID to
one Suqpage user; roles and business access never come from OAuth metadata.

## Supabase Storage

1. Create a private bucket. Do not make the bucket public.
2. Keep `SUQPAGE_SUPABASE_SERVICE_ROLE_KEY` server-only. It bypasses bucket
   row-level policies and must never enter browser code or build arguments.
3. Set `SUQPAGE_MEDIA_DRIVER=supabase`, the HTTPS project URL, private bucket
   name, service key, and bounded request timeout in the deployment secret
   manager.
4. Back up the database and filesystem media source.
5. Run `npm run migrate:media`, then `npm run reconcile:media`. Treat any
   missing or mismatched authoritative object as a failed migration.
6. Verify a published image and an authorized private request attachment
   through Suqpage routes. Browser clients must not receive provider keys.
7. Retain source objects through the rollback window. Production continues to
   require private Supabase Storage; never switch its driver to local files.

## Native PostgreSQL installation and verification

`npm run test:postgres-readiness` verifies the native installer and application
adapters against a disposable PostgreSQL 17 container. It uses no intermediate
database engine. The baseline installs only into empty schemas; existing versioned
schemas apply reviewed migrations. Preflight requires migration 43.

For an explicitly authorized target, `npm run migrate:postgres` uses its direct
migration connection and optional identifier-safe migration role. Keep direct
credentials outside application runtimes. Hosted writes require independent target
verification, backup, reviewed fields and owner approval under DEP-029.

Least-privilege hosted runtime provisioning remains a separately authorized
operation (`npm run provision:supabase-runtime`). It rotates the fixed runtime
login and writes protected credentials; do not run it as a routine setup check.
Historical source-copy commands have been removed. Archive-based recovery is
specified in `docs/POSTGRES-ONLY-RUNBOOK.md`.

## Deployment secrets and configuration

Keep these outside GitHub artifacts and the repository:

- `NEXT_PUBLIC_APP_URL`
- `SUQPAGE_CANONICAL_URL`
- `SUQPAGE_SERVER_ACTION_ORIGINS`
- `SUQPAGE_DATABASE_DRIVER`
- `SUQPAGE_POSTGRES_URL` (Supabase transaction pooler on the selected host)
- `SUQPAGE_POSTGRES_DIRECT_URL` (operator environment only)
- `SUQPAGE_POSTGRES_MIGRATION_ROLE` (operator command only, when required)
- `SUQPAGE_MEDIA_ROOT` when using filesystem media
- `SUQPAGE_SUPABASE_URL`
- `SUQPAGE_SUPABASE_SERVICE_ROLE_KEY`
- `SUQPAGE_SUPABASE_STORAGE_BUCKET`
- `SUQPAGE_AUTH_DRIVER`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUQPAGE_GOOGLE_AUTH_ENABLED`
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
   --yes netlify-cli@latest login`. Link only the Suqpage GitHub repository and
   verify the team and site before every deploy. `netlify.toml` supplies
   `npm run build` and Node `24.18.1`.
2. Add separate Preview- and Production-scoped environment variables in the
   Netlify UI. Preview values must belong only to the Preview Supabase project;
   Production values must belong only to Production. Both require their own
   PostgreSQL pooler, publishable key, service-role key, private bucket, and
   privacy salt. Never place a direct PostgreSQL migration URL in Netlify or
   reuse a secret across scopes.
3. Keep existing custom domains on their verified current targets. Test the generated Netlify domain
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
  query port so the browser receives bounded Suqpage markers. Search, place
  filtering, and coordinates remain in Supabase regardless of tile provider.

## PWA verification and rollback

The production PWA is enabled unless
`NEXT_PUBLIC_SUQPAGE_PWA_ENABLED=false` is present at build time. Keep it
enabled for normal releases and verify over the final HTTPS origin that
`/manifest.webmanifest` loads, `/sw.js` controls the page after one reload, a
previously visited public route reaches the branded offline surface without a
network, and `/api`, `/dashboard`, `/preview`, `/login`, and `/request` never
appear in Cache Storage.

A service worker survives an ordinary application rollback. To disable the PWA,
set `NEXT_PUBLIC_SUQPAGE_PWA_ENABLED=false`, replace `public/sw.js` in the
rollback release with the reviewed `scripts/pwa-cleanup-worker.js` artifact,
and deploy that release at the same origin. Confirm the cleanup worker activates,
deletes only obsolete Suqpage and prior platform caches, unregisters itself, and leaves subsequent
navigation network-authoritative. Do not remove the registration component or
worker route before this cleanup release has reached controlled browsers.

## Backup, deploy, and rollback

1. Record the exact commit and image digest.
2. Run `npm run backup` and a restore drill before applying migrations.
3. Run `npm run migrate:postgres` for the verified PostgreSQL target, then run `npm run release` and production preflight against the
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
