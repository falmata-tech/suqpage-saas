---
id: DEP-023
title: Supabase and Vercel production cutover
status: ready
related: [BE-027, ADR-0013]
owners: [deployment, operations, security, backend]
last_updated: 2026-08-04
change_level: L4
---

# DEP-023 - Supabase and Vercel production cutover

## Problem and outcome

MirtPage needs one production deployment using the existing Supabase project,
Vercel, and `mirtpage.com`, without a paid staging environment. The deployment
must replace local SQLite authority with managed PostgreSQL, move retained media
to private object storage, protect production secrets from previews, and provide
a tested rollback before public DNS changes.

## Named topology

- Supabase project: `mirtpage` (`sjeiiqxgscuqajpgddcc`), West EU (Ireland).
- Database: Supabase PostgreSQL through its transaction pooler for serverless
  requests; direct connection is reserved for controlled migrations.
- Media: one private Supabase Storage bucket through BE-024.
- Application: one Vercel production project; local development and required
  GitHub Actions are the pre-production gate.
- Domain: apex `mirtpage.com` with canonical `www` behavior recorded at cutover.
- Identity: existing MirtPage users, bcrypt hashes, sessions, roles, and tenant
  bindings remain authoritative; Supabase Auth is disabled.

## Scope

### In scope

- Supabase project linking, migrations, database copy/reconciliation, private
  bucket provisioning, and production-only secret configuration.
- Vercel project configuration, serverless-compatible pooling, production build,
  health checks, domain attachment, and post-cutover monitoring.
- Preview deployments receive no production database or service-role secret and
  therefore fail closed for authoritative workflows.
- A database backup/export, retained SQLite source, media reconciliation report,
  rollback owner, and rollback deadline before DNS change.

### Non-goals

- A separate staging project, Supabase Auth, realtime, paid provider features,
  destructive reset of retained demo data, or simultaneous unrelated features.

## Cutover contracts

1. The exact release commit passes local release, PostgreSQL integration,
   security, acceptance, and all required GitHub Actions checks.
2. The source SQLite database is quiesced and copied read-only. Target counts,
   fingerprints, sequences, constraints, and representative tenant relationships
   reconcile before PostgreSQL receives writes.
3. Media copy is immutable and private; every database-referenced object is
   present before the media driver changes.
4. Production secrets exist only in Supabase/Vercel secret stores and local
   ignored operator files. Logs and build output contain no credentials.
5. DNS changes occur only after the Vercel production URL passes authenticated,
   tenant, inquiry, upload, support, and mobile smoke checks.
6. After authority changes, SQLite is retained read-only for rollback and no
   dual writes occur.

## Scenarios

```gherkin
Scenario: Production candidate is not proven
  GIVEN a required local or remote gate is failing, pending, or belongs to another commit
  WHEN production deployment is requested
  THEN database authority and public DNS remain unchanged

Scenario: Preview deployment attempts production access
  GIVEN a Vercel preview has no production persistence secrets
  WHEN it starts or receives an authoritative request
  THEN it fails closed without accessing production data

Scenario: Migration reconciliation differs
  GIVEN retained SQLite data was copied to Supabase PostgreSQL
  WHEN any required count, fingerprint, constraint, sequence, or media check differs
  THEN PostgreSQL does not become authoritative
  AND the discrepancy is corrected or the target is recreated from the retained source

Scenario: Production smoke checks pass
  GIVEN the exact release runs on Vercel against reconciled PostgreSQL and private Storage
  WHEN operator smoke checks exercise public, authenticated, tenant, inquiry, upload, and support workflows
  THEN `mirtpage.com` may be attached and monitored

Scenario: A critical defect occurs before the rollback deadline
  GIVEN the retained SQLite deployment and backup remain available
  WHEN the operator declares rollback
  THEN public traffic returns to the retained deployment
  AND PostgreSQL is frozen for reconciliation rather than silently merged
```

## Evidence and operations

Required evidence includes the release commit, GitHub workflow run IDs, Supabase
migration versions, redacted reconciliation totals, private-bucket verification,
Vercel deployment ID, health and workflow smoke results, DNS records, monitoring
window, and rollback deadline. Secrets, row contents, and customer messages are
never evidence artifacts.

## Test plan

| Gate | Evidence |
|---|---|
| Specification and runtime contracts | `npm run validate:specs`, `npm run check:database-boundaries` |
| PostgreSQL persistence and security | BE-027 integration, tenant-isolation, and failure suites |
| Data and media migration | Copy-only reconciliation plus private-object verification |
| Production application | `npm run release`, PostgreSQL-backed acceptance, health, upload, and inquiry smoke checks |
| Exact remote release | Required GitHub Actions checks and the Vercel deployment for the same commit |

## Rollout and rollback

The first deployment uses the Vercel-generated hostname while SQLite remains
authoritative. After backup, quiescence, copy, reconciliation, and smoke evidence,
PostgreSQL becomes the sole authority. `mirtpage.com` changes only after that
candidate passes. Until the recorded rollback deadline, the prior deployment and
read-only SQLite source remain available; rollback restores traffic to that
deployment and freezes PostgreSQL for explicit reconciliation. No automatic
reverse copy or dual-write merge is allowed.

## Readiness checklist

- [x] Production project, region, host, and domain are named
- [x] Free production-only topology and preview isolation are explicit
- [x] Database, media, identity, security, and tenant boundaries are explicit
- [x] Positive, failure, reconciliation, and rollback scenarios are present
- [x] Gates, observability, authority switch, and rollback ownership are planned
- [x] No material implementation decision remains unresolved
