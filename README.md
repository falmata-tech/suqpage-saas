# SuqPage SaaS MVP — Controlled Launch Build

SuqPage is a multi-tenant Next.js application for manually designed client showrooms. Each client keeps a custom renderer while SuqPage supplies managed onboarding requests, dynamic catalogs, product options, stock and availability, saved inquiries, social handoff, and mock Malikt Board delivery requests.

## Engineering workflow

This repository uses spec-driven development. Before changing behavior, read
`AGENTS.md`, `SUQPAGE-MASTER-PROMPT.md`, and `specs/README.md`, then locate the
controlling FE/BE/DEP specs:

```bash
npm run specs:list
npm run validate:specs
```

The full operating model is in `docs/engineering/SDD-PLAYBOOK.md`; architectural
decisions are in `docs/adr/` and implementation/test evidence is mapped in
`specs/TRACEABILITY.md`.

## Included tenants

- `@alhayabrand` — luxury modest fashion
- `@usashopet` — U.S. beauty and wellness
- `@novatech` — premium light flagship technology
- `@homevibe` — editorial home and living

The visual pages remain separately designed. Products, collections, categories, options, inquiries and delivery workflows are database-backed.

## Requirements

- Node.js 22.16 or newer
- npm
- A single persistent server or container for this SQLite pilot
- HTTPS for production

## Local setup

```bash
cp .env.example .env
npm ci
npm run reset
npm run dev
```

`npm run reset` creates the four test tenants and generates a different temporary password for every account. Credentials are printed once and written to:

```text
.local/seed-credentials.txt
```

The credentials file and database are excluded from the ZIP and Git. Every user is required to change the temporary password.

## Release verification

Run the complete repeatable release check:

```bash
npm run release
```

This performs:

- TypeScript validation
- showroom integration validation
- security and tenant-isolation tests
- production build
- production HTTP smoke tests
- dependency vulnerability audit
- managed-request integration and production HTTP checks

For real Chromium acceptance tests covering public, administrator, and owner
workflows with an isolated temporary database, install the browser once and run:

```bash
npx playwright install --with-deps chromium
npm run test:acceptance
```

To verify migration idempotence plus database/media backup and restore:

```bash
npm run test:operations
```

To build and exercise the production image with disposable Docker resources:

```bash
npm run test:container
```

## Production environment

Create a production `.env` with absolute persistent paths:

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://suqpage.com
SUQPAGE_DB_PATH=/srv/suqpage/data/suqpage.db
SUQPAGE_MEDIA_ROOT=/srv/suqpage/data/media
SUQPAGE_BACKUP_ROOT=/srv/suqpage/backups
PRIVACY_SALT=<at-least-24-random-characters>
```

Generate a salt with:

```bash
openssl rand -hex 32
```

Optional inquiry email notifications use Resend:

```bash
RESEND_API_KEY=
NOTIFICATION_FROM_EMAIL=SuqPage <notifications@suqpage.com>
```

Production startup refuses non-HTTPS app URLs and non-persistent database/media configuration.

## New production installation

```bash
npm ci
npm run reset
npm run release
NODE_ENV=production npm start
```

Before opening the site publicly:

1. Sign in with each temporary account and change its password.
2. Configure real business notification emails and social contacts.
3. Submit a private onboarding request and confirm it appears in the administrator operations queue with any reference images.
4. Put the server behind an HTTPS reverse proxy.
5. Create and verify an initial backup.

## Upgrade from the audited prototype

Copy the previous database to the configured `SUQPAGE_DB_PATH`, then run:

```bash
npm run migrate
```

The migration preserves businesses, products and inquiries, adds the new security tables and constraints, and forces every existing account to change its password. An administrator should reset all old shared passwords before public launch.

Old uploads stored under `public/uploads/runtime` should be re-uploaded through the dashboard so they are validated and stored under the persistent `/media/` route.

## Docker deployment

Set `NEXT_PUBLIC_APP_URL`, any exact `SUQPAGE_SERVER_ACTION_ORIGINS`, and
`PRIVACY_SALT` in a `.env` file. The URL and trusted origins are supplied to both
the build and runtime because Next.js compiles Server Action origin policy into
the production artifact. Then initialize the persistent volume:

```bash
docker compose build
docker compose run --rm suqpage npm run reset
docker compose up -d
```

The application and uploaded media use the `suqpage_data` volume. Run backups with:

```bash
docker compose exec suqpage npm run backup
```

## Backups and restore

```bash
npm run backup
npm run restore -- --from=/absolute/path/to/backups/<timestamp>
```

Stop the application before restoring. Test restoration before relying on a backup policy.

## Social contact formats

Enter these under **Dashboard → Business settings**:

- WhatsApp: `251911234567`
- Telegram: `AlHayaModest`
- TikTok: `alhayabrand`

WhatsApp and Telegram receive the structured inquiry in the destination link. TikTok opens the exact profile and uses copy/manual-message fallback because reliable public DM prefilling is unavailable.

## Secure media uploads

Dashboard uploads:

- accept only verified JPEG, PNG and WebP content
- reject mismatched MIME types and disguised HTML
- enforce a 5 MB limit
- reject excessive image dimensions
- generate server-controlled filenames
- store outside the Next.js static build
- serve through `/media/<generated-file>` with `nosniff`

Initial showroom requests use `/request` and are stored by SuqPage rather than a
third-party form service. They accept one free-form instruction plus up to ten
optional sanitized images. Request images remain below the persistent media root
and are served only through an authenticated private route; they are never
placed under `public/` or returned by the public request reference.

## Mock Malikt Board adapter

The four delivery companies and status workflow are local simulation data. The request API is authenticated and tenant-scoped:

```text
GET  /api/malikt/companies
GET  /api/malikt/requests?businessId=<id>
POST /api/malikt/requests
```

The authenticated `POST` endpoint accepts JSON request bodies up to 64 KiB and
returns HTTP 413 before parsing larger requests. It is an integration contract,
not a live external Malikt Board connection. Replace the adapter with
authenticated Malikt Board APIs when that system is ready.

## Custom showroom workflow

See `showroom-sdk/README-AI-INTEGRATION.md`.

The client renderer owns layout and styling. SuqPage owns catalog data, availability, inquiry state, persistence, social routing and delivery integration. Custom designs must not query SQLite or hard-code tenant products.

## MVP deployment boundary

This build is suitable for a controlled four-client pilot on one persistent server. SQLite is configured with WAL, busy timeout, integrity checks, backups and migrations, but it is not a multi-instance database. Move to managed PostgreSQL and object storage before broad self-service SaaS onboarding or horizontal scaling.
