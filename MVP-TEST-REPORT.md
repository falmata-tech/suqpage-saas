# MirtPage SaaS MVP - Current Verification Report

**Release:** `1.0.0-mvp-launch`

**Verified locally:** 2026-08-03

**Runtime:** Node.js 24.18.1, npm 11.16.0, Next.js 16.2.12

## Result

The current commit candidate passes the complete local release, browser,
operations, container, and PostgreSQL-readiness gates. The npm production audit
reports zero vulnerabilities. This is strong local release evidence; it is not
a production deployment or a completed PostgreSQL cutover.

## Verified Gates

- `npm run check`: specifications, runtime consistency, database boundaries,
  type checking, tenant/security contracts, media, support, pagination,
  showroom design, revisions, and request workflows.
- `npm run release`: production build, trace privacy, HTTP smoke, scale fixture,
  security, adapter, request, revision, and dependency-audit gates.
- `npm run test:acceptance`: 10/10 ordered production-browser workflows across
  public discovery, Expo, inquiries, administrator, operations, team-member,
  client, mobile, API, CSP, and controlled-video behavior.
- `npm run test:operations`: migration, integrity, request attachment/revision
  backup, and verified restore behavior.
- `npm run test:container`: immutable Node image, locked install, build-time
  origin validation, non-root execution, persistent-path preflight, trace
  privacy, and health checks.
- `npm run test:postgres-readiness`: disposable PostgreSQL 17 rehearsal of 44
  tables and 2,849 rows with constraints, indexes, triggers, sequences,
  per-table fingerprints, invariant probes, and byte-preserved SQLite source.

## Current Boundaries

- SQLite remains the only enabled database runtime and supports one application
  replica. PostgreSQL is a tested migration target, not yet the write authority.
- MirtPage-owned bcrypt identities and opaque revocable sessions remain active.
  Supabase Auth is not configured or implied by Supabase Storage support.
- Private Supabase Storage is available behind the media port, but a real bucket
  copy and reconciliation require deployment credentials and operator approval.
- GitHub Actions now defines `core`, `browser`, `container`, `dependency`, and
  `postgres` jobs. This candidate still needs a remote run and required branch
  rules before remote delivery evidence is complete.

Operational setup and rollback instructions live in
`docs/DEVOPS-RUNBOOK.md`; the detailed release record is
`docs/LAUNCH-VERIFICATION.md`.
