# Suqpage

Suqpage is a multi-tenant marketplace for locally made products. Sellers manage a
standard public page, product photos/videos, choices, visibility and public
contacts. Buyers discover businesses beside a map, open linked product pages,
and send one-product or grouped inquiries through the platform or available
contact channels. Owners and administrators have separate workspaces; the first
page publication and marketplace location are reviewed by an administrator.

The current implementation uses Next.js, Supabase PostgreSQL, Supabase Auth and
private Supabase Storage. PostgreSQL is the only database engine in local
development, tests, browser acceptance, CI and deployments. Custom-page requests
and the design studio are retired; historical published content remains readable.

## Start locally

Use Node 24.18.1, npm, Docker and Supabase CLI. Start from `.env.example` and retain
all provider values in ignored local environment files.

```sh
npm ci
npm run local:supabase:start
npm run local:supabase:bootstrap
npm run dev:local
```

The native installer creates schema and 66 fictional demo businesses in an empty
local database. It preserves a populated database. Sign in using the configured
local Supabase email-code or Google flow. Local fixture passwords, when generated,
are written only to `.local/seed-credentials.txt` with restricted permissions.
Never copy them or local provider credentials to Preview or Production.

The local review server currently uses `http://127.0.0.1:3101`. Useful routes:

- `/`: category/search results, backend pagination and retained map.
- `/@demo-nile-sensor-studio?ref=discovery`: a public business page.
- `/dashboard/page`, `/dashboard/products`, `/dashboard/business`: owner editing.
- `/dashboard/account`: private account contacts.
- `/dashboard/admin/page-reviews`: initial publication review.
- `/dashboard/admin/businesses?location=pending`: pending location review.

Public contact details and private account identity are separate. Existing verified
account emails are preserved. Optional public channels appear only when provided.

## Engineering and verification

Read `AGENTS.md`, `MIRTPAGE-MASTER-PROMPT.md` and `specs/README.md` before changing
behavior. The active ordered work is in `docs/SUQPAGE-TRANSITION-CHECKLIST.md`.
Contracts FE-040–043, BE-032–035, DEP-030–031 and ADR-0018–0020 control the current
transition. Evidence is mapped in `specs/TRACEABILITY.md`.

```sh
npm run validate:specs
npm run check:database-boundaries
npm run typecheck
npm run test:native-postgres
npm run test:launch-wiring
```

Persistence tests require an isolated local PostgreSQL service; they use disposable
schemas and the real native installer. `MIRTPAGE_TEST_POSTGRES_URL` can select a
local/CI test service. Browser acceptance starts a separate Supabase project and
uses real local Auth/Storage with synthetic users. No external inquiry message is
sent by the focused launch fixtures.

Visual changes require desktop/phone review before expensive gates. After approval:

```sh
npm run check
npm run release
npm run test:acceptance
npm run test:operations
npm run test:container
```

See `docs/SUQPAGE-LAUNCH-WIRING-AUDIT.md` for the wiring audit and current limits.
A passing local workflow does not imply hosted provider readiness or deployment.

## Operations

Follow [PostgreSQL operations](docs/POSTGRES-ONLY-RUNBOOK.md) for native installation,
fixtures, migration, backup, restore and release checks. Database archives cover
the application schema; Auth and private Storage require separate provider backups.
Restore requires a reviewed target digest and an empty recovery database.

Hosted changes follow DEP-029. Never run `supabase config push`; never replace or
disable hosted Google/SMTP settings as a recovery shortcut. Preview and Production
must use separate projects and credentials. Deployment requires verified migrations,
private media, email/Google sign-in, host configuration, health and rollback evidence.
The current release is live at https://africmade.netlify.app with email-only entry.
See `docs/SUQPAGE-DEPLOYMENT-2026-09-14.md` for exact deployment, backup and
verification evidence. Real hosted email delivery remains unverified.
