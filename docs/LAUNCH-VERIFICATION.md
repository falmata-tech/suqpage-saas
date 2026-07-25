# SuqPage SaaS MVP — Launch Verification

**Release:** `1.0.0-mvp-launch`
**Verification date:** 2026-07-22
**Reviewed input:** the uploaded SuqPage SaaS MVP and independent launch audit

## Verdict

The corrected package is suitable for a **controlled four-client public MVP pilot on one persistent server** after completing the deployment checklist in the ZIP.

It is no longer the unsafe prototype described in the independent audit. The critical authentication, tenant-isolation, public API, upload, draft-publication, rate-limit, dependency, migration, backup, and test failures were repaired.

This approval has two explicit boundaries:

1. The MVP uses SQLite and persistent local media, so only one application instance should run.
2. Malikt Board remains a secured mock adapter until the real external API is available.

## Release gate

The final `npm run release` completed successfully and ran:

- Next.js production build
- output-file trace privacy validation
- production HTTP smoke tests
- TypeScript validation
- four-renderer integration validation
- security and tenant-isolation tests
- production dependency audit

**Dependency audit:** 0 vulnerabilities.

## Delivery hardening evidence

DEP-002 was completed from a clean tracked worktree on Node 22.16 or newer:

- `npm ci` reproduced the locked install with 0 reported vulnerabilities.
- `npm run check` and `npm run test:operations` passed.
- the production browser suite passed all six public, mobile, administrator,
  owner, API, authorization, validation, health, and security-header scenarios.
- `npm run release` compiled successfully and validated 32 output-file traces
  with no private runtime paths. Next.js still emits a non-blocking dynamic
  runtime-media tracing warning; explicit tracing exclusions and the privacy
  validation prevent runtime customer data from entering the build output.
- `npm run test:container` used a 12.06 kB Docker context and passed exact
  Server Action origin, non-root runtime, credential-log, preflight, health,
  trace-privacy, and cleanup assertions.
- generated Next.js declarations remained ignored and development/type
  generation did not dirty tracked Git state.
- after advisory `GHSA-f88m-g3jw-g9cj` was published, `sharp` was updated to
  0.35.3 with libvips 8.18.3; the graph contains one patched Sharp version and
  image sanitization regression tests pass.

GitHub Actions run `29889083549` passed its `core`, `browser`, and `container`
jobs on the dependency-remediation commit. A repository administrator must
still require those checks and block branch deletion and force-push before merge
protection is considered active.

## Production HTTP evidence

The application was started with `next start` using an isolated database and media directory. The following checks passed:

- active client showroom: HTTP 200
- draft client showroom: HTTP 404
- persistent media route: HTTP 200
- CSP and frame-denial headers present
- unauthenticated delivery list: HTTP 401
- unauthenticated delivery creation: HTTP 401
- forged cross-tenant inquiry: HTTP 400
- valid canonical inquiry: HTTP 201
- repeated inquiry with the same idempotency key: deduplicated
- repeated abuse attempts: HTTP 429
- public expression of interest: HTTP 201 with a random reference
- repeat interest submit: deduplicated
- cross-origin interest submit: HTTP 403
- public multipart/image submit: HTTP 415 with zero attachment rows

## Critical audit remediations

- Removed exposed and prefilled credentials.
- Added unique generated temporary passwords and mandatory first-login password change.
- Replaced forgeable client-contained sessions with opaque, revocable server-side sessions.
- Protected delivery APIs and enforced tenant scope.
- Validated inquiry products, ownership, publication, availability, stock, quantity, and option values.
- Added inquiry idempotency, persistent rate limits, honeypot handling, and request-size limits.
- Moved runtime uploads outside the Next.js static build.
- Added strict JPEG/PNG/WebP verification, full image decoding, metadata removal, re-encoding, dimension limits, and server-generated filenames.
- Added application checks and SQLite triggers for same-tenant relationships.
- Hid draft and suspended showrooms from public routes; added authenticated preview.
- Added administrator tenant onboarding and owner password reset.
- Added collection/category editing, ordering, deactivation, and deletion.
- Added transactional product and option writes.
- Added migrations, WAL mode, integrity checks, backups, verified restore, health endpoint, Docker deployment files, and persistent-path preflight checks.
- Added security headers and disabled the framework identification header.
- Added privacy and terms pages.
- Added optional merchant email notifications through Resend.
- Fixed the landing-page “All businesses” filter.
- Preserved custom manual renderers for Al Haya, USAshopET, NovaTech, and HomeVibe.

## Upgrade test

The database from the uploaded prototype was copied and migrated with the corrected code.

Results:

- integrity check: `ok`
- businesses preserved: 4
- users preserved: 5
- all migrated users forced to change password: 5
- old sessions retained: 0

## Backup and restore test

A clean seeded database and media directory were backed up, deliberately altered, and restored.

Results:

- restored database integrity: `ok`
- four businesses recovered
- media file recovered
- authenticated managed-request row, event, attachment metadata, and private attachment file recovered

## Deployment requirements

Before opening the site publicly:

1. Configure an HTTPS production domain.
2. Use absolute persistent database, media, and backup paths.
3. generate a private `PRIVACY_SALT`.
4. Run `npm ci`, then `npm run reset` for a new installation or `npm run migrate` for the old database.
5. Run `npm run release` on the deployment machine.
6. Change every temporary or migrated password.
7. Enter each business’s real WhatsApp, Telegram, TikTok, and notification email.
8. Submit and review one private onboarding request, including an image.
9. Keep only approved businesses active.
10. Create a backup and perform a restore test.

## Remaining post-pilot work

Before broad self-service SaaS onboarding or horizontal scaling, migrate to managed PostgreSQL and object storage, add staff roles, connect the real Malikt Board API and callbacks, and expand public localization.
