# MirtPage SaaS MVP — Controlled Launch Build

MirtPage is a multi-tenant Next.js application for professionally designed client showrooms. Each client keeps a distinct renderer while MirtPage supplies managed onboarding requests, dynamic catalogs, product options, descriptive availability, saved inquiries, social handoff, and first-party support.

## Engineering workflow

This repository uses spec-driven development. Before changing behavior, read
`AGENTS.md`, `MIRTPAGE-MASTER-PROMPT.md`, and `specs/README.md`, then locate the
controlling FE/BE/DEP specs:

```bash
npm run specs:list
npm run validate:specs
```

The full operating model is in `docs/engineering/SDD-PLAYBOOK.md`; architectural
decisions are in `docs/adr/` and implementation/test evidence is mapped in
`specs/TRACEABILITY.md`.

## Included benchmark tenants

- `@selam-weave` — textile atelier
- `@afia-botanics` — small-batch botanical care
- `@warka-furniture` — furniture workshop
- `@addis-metalworks` — small-run fabrication and RFQ
- `@green-terrace-farm` — seasonal farm
- `@blue-nile-apiary` — honey and beeswax producer
- `@rift-valley-mill` — grain mill
- `@entoto-ceramics` — pottery studio
- `@koba-leather` — leather workshop
- `@nova-assembly` — electronics assembly and repair

The visual pages remain separately designed. Products, categories, options, inquiries, requests, and support workflows are database-backed.

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

`npm run reset` creates 66 fictional, disposable demo businesses, including ten
visual benchmarks, and generates a different temporary password for every account. Credentials are
printed once and written to:

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
- stockless schema/recovery and versioned product-upkeep tests
- production build
- production HTTP smoke tests
- dependency vulnerability audit
- managed-request integration and production HTTP checks
- blueprint-media, composition-fitness, and ten-showroom benchmark checks

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
NEXT_PUBLIC_APP_URL=https://mirtpage.com
MIRTPAGE_DB_PATH=/srv/mirtpage/data/mirtpage.db
MIRTPAGE_MEDIA_DRIVER=filesystem
MIRTPAGE_MEDIA_ROOT=/srv/mirtpage/data/media
MIRTPAGE_BACKUP_ROOT=/srv/mirtpage/backups
PRIVACY_SALT=<at-least-24-random-characters>
```

Generate a salt with:

```bash
openssl rand -hex 32
```

Optional inquiry email notifications use Resend:

```bash
RESEND_API_KEY=
NOTIFICATION_FROM_EMAIL=MirtPage <notifications@mirtpage.com>
```

Customer support is first-party and works without an external provider.
Operations can enable support agents, set each concurrent-conversation limit,
and rely on transactional least-loaded assignment with a waiting queue.
Optional Telegram alerts contain only the support reference, business name,
assignment, and an authenticated dashboard link:

```bash
MIRTPAGE_TELEGRAM_BOT_TOKEN=
MIRTPAGE_TELEGRAM_SUPPORT_CHAT_ID=
MIRTPAGE_SUPPORT_WHATSAPP_URL=
```

The WhatsApp value is an optional official `https://wa.me/...` or
`https://api.whatsapp.com/...` emergency handoff. Telegram and WhatsApp are not
the support record and never receive the in-app message body.

Monthly account access is also manual in this release. MirtPage staff record that
a renewal was received and advance the monthly period. No amount or price is
collected in the current UI, and no checkout, payment gateway, or automatic
debit is configured.

Production startup refuses non-HTTPS app URLs and a non-persistent database.
Filesystem media mode also requires a persistent media path. Supabase media mode
requires a valid HTTPS project URL, server-only service-role key, and private
bucket name.
Set `MIRTPAGE_PRODUCT_UPKEEP_ENABLED=0` only as an emergency switch to disable
basic product writes while leaving requests and showrooms available.
Set `MIRTPAGE_RECIPE_STUDIO_ENABLED=0` to deny recipe export/import and route
new or existing private drafts through the retained administrative editor.
Controlled YouTube admission is disabled by default. Set
`MIRTPAGE_YOUTUBE_ADMISSION_ENABLED=1` only after the DEP-009 provider gate is
approved; this enables private normalized-ID admission, not public rendering.

## New production installation

```bash
npm ci
npm run reset
npm run release
NODE_ENV=production npm start
```

`npm run reset` is only for a new empty installation. Never run it against the
populated demonstration or production database. Existing installations use
`npm run migrate` after a verified backup.

Before opening the site publicly:

1. Sign in with each temporary account and change its password.
2. Configure real business notification emails and social contacts.
3. Submit a public expression of interest and confirm it appears in the administrator operations queue without attachments or account creation.
4. Put the server behind an HTTPS reverse proxy.
5. Create and verify an initial backup.

## Upgrade from the audited prototype

Copy the previous database to the configured `MIRTPAGE_DB_PATH`. For an existing
database whose product/history tables require a destructive rebuild, stop every
application instance, create a verified checkpoint, and approve that one
migration command:

```bash
npm run backup
MIRTPAGE_APPROVE_DESTRUCTIVE_MIGRATIONS=1 npm run migrate
npm run release
```

Do not leave `MIRTPAGE_APPROVE_DESTRUCTIVE_MIGRATIONS` in the persistent
environment. Migration refuses a checkpoint older than 24 hours, a backup for a
different database, an integrity/foreign-key failure, changed source bytes, or
insufficient disk. The migration preserves businesses, products, availability,
inquiries, relationships, and retained history while removing obsolete numeric
inventory columns and adding product-upkeep history. An administrator should
reset all old shared passwords before public launch.

Old uploads stored under `public/uploads/runtime` should be re-uploaded through
the dashboard so they are validated and stored behind the stable `/media/`
route.

## Supabase media storage

MirtPage can keep SQLite on one persistent application instance while moving
verified media to a private Supabase Storage bucket. This removes media-volume
coupling only; it does not make SQLite safe for multiple application replicas.

Create one private bucket, then configure server-only deployment secrets:

```bash
MIRTPAGE_MEDIA_DRIVER=supabase
MIRTPAGE_SUPABASE_URL=https://<project-ref>.supabase.co
MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
MIRTPAGE_SUPABASE_STORAGE_BUCKET=mirtpage-media
```

Never expose the service-role key through `NEXT_PUBLIC_*`, browser code, logs,
screenshots, or support messages. The application proxies public showroom media
and authorizes private request media before reading the private bucket.

For an existing installation, copy media without changing database references
or deleting local source files:

```bash
npm run backup
npm run migrate:media -- --dry-run
npm run migrate:media -- --execute
npm run migrate:media -- --dry-run
```

The final dry run must report every object as already verified. Then switch the
driver, run `npm run preflight` and `npm run release`, and test one published
image, one authorized private attachment, one upload, and one approved revision
publication. Retain the local media tree through the rollback window. Rollback
sets `MIRTPAGE_MEDIA_DRIVER=filesystem`; stable `/media/<key>` and private
attachment references do not change.

## Docker deployment

Set `NEXT_PUBLIC_APP_URL`, any exact `MIRTPAGE_SERVER_ACTION_ORIGINS`, and
`PRIVACY_SALT` in a `.env` file. The URL and trusted origins are supplied to both
the build and runtime because Next.js compiles Server Action origin policy into
the production artifact. Then initialize the persistent volume:

```bash
docker compose build
docker compose run --rm mirtpage npm run reset
docker compose up -d
```

The application and uploaded media use the `mirtpage_data` volume. Run backups with:

```bash
docker compose exec mirtpage npm run backup
```

## Backups and restore

```bash
npm run backup
npm run restore -- --from=/absolute/path/to/backups/<timestamp>
```

The backup command reads the database without invoking application migrations,
checkpoints WAL, verifies integrity and foreign keys before and after copying,
and records a source hash used by destructive-migration admission. Stop the
application before backup for a destructive upgrade and before any restore.
Test restoration before relying on a backup policy.

## Social contact formats

Enter these under **Dashboard → Business settings**:

- WhatsApp: `251911234567`
- Telegram: `AlHayaModest`
- TikTok: `selamweave`

WhatsApp and Telegram receive the structured inquiry in the destination link. TikTok opens the exact profile and uses copy/manual-message fallback because reliable public DM prefilling is unavailable.

## Secure media uploads

Dashboard uploads:

- accept only verified JPEG, PNG and WebP content
- reject mismatched MIME types and disguised HTML
- enforce a 5 MB limit
- reject excessive image dimensions
- generate server-controlled filenames
- store outside the Next.js static build through the configured filesystem or
  private Supabase adapter
- serve published media through `/media/<generated-file>` with `nosniff`

Public, authenticated-client, and on-behalf request intake is attachment-free.
After staff import the design, each labeled image destination accepts one
verified upload. Those private images remain in the request-media namespace and
are served only through an authorized route until approved publication.

## AI showroom design workflow

Authenticated clients and operations staff describe the business type, catalog
stage, photography stage, products, and desired outcome. They do not choose a
page layout or fixed image count. Authorized staff use the design workspace in
five stages: **Brief**, **Import**, **Images**, **Edit**, and **Preview**.
The AI design may choose bounded dynamic product and image counts and declare
labeled unresolved image destinations. Staff fulfill those exact spaces with
verified request-scoped images. Required slots and hard composition-fitness
issues block client review; optional slots use reviewed no-media treatments.
The revision editor groups complete staff control into settings, layout/style,
page content, and offerings.

## Basic product upkeep

After the first showroom publication, clients see **My offerings**. They may add
an offering or maintain its exact name, description, primary managed image,
descriptive availability, and compatible existing category placement. Before
publication, assigned team members, operations managers, and administrators can
edit the complete imported offering set inside the private revision workflow.
Every post-publication save creates a retained monotonic showroom version;
stale forms fail instead of overwriting newer revisions. Category structure,
ordering, slugs, structural removal, settings, design, and full publication
remain in the request/revision workflow.

## Custom showroom workflow

See `showroom-sdk/README-AI-INTEGRATION.md`.

The client renderer owns layout and styling. MirtPage owns catalog data, availability, inquiry state, persistence, and social routing. Custom designs must not query SQLite or hard-code tenant products.

## MVP deployment boundary

This build is suitable for a small controlled pilot on one persistent server.
The 66 included businesses are disposable local fixtures, including ten visual
benchmarks, not a production capacity claim. SQLite is configured with WAL,
busy timeout, integrity checks,
backups and migrations, but it is not a multi-instance database. Move to managed
PostgreSQL and complete a verified object-storage cutover before broad external
onboarding or horizontal scaling.
