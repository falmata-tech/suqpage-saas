---
id: DEP-023
title: Supabase and Vercel production cutover
status: in_progress
related: [BE-027, BE-028, BE-029, FE-031, FE-032, FE-033, FE-034, FE-037, DEP-024, DEP-025, ADR-0013]
owners: [deployment, operations, security, backend]
last_updated: 2026-08-10
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
   reconcile before PostgreSQL receives writes. REAL geographic coordinates use
   a 12-decimal canonical representation so provider serialization differences
   do not produce false mismatches; all non-REAL fields remain exact.
3. Media copy is immutable and private; every database-referenced object is
   present before the media driver changes.
4. Production secrets exist only in Supabase/Vercel secret stores and local
   ignored operator files. Logs and build output contain no credentials.
5. DNS changes occur only after the Vercel production URL passes authenticated,
   tenant, inquiry, upload, support, and mobile smoke checks.
6. After authority changes, SQLite is retained read-only for rollback and no
   dual writes occur.
7. A provider-issued temporary migration login may assume an explicitly named,
   identifier-safe database owner role only inside the guarded copy transaction;
   the role is never inferred from untrusted input or retained as a runtime secret.
   The linked-project wrapper parses that credential in memory and never prints
   or persists it. Provider statement timeout is disabled only inside this
   guarded copy transaction; runtime statement timeouts remain bounded.
8. Production uses a dedicated `mirtpage_runtime` login with schema usage,
   application-table DML, and sequence use rather than the database owner. Its
   generated credential is verified through the transaction pooler and retained
   only in ignored mode-0600 operator storage and the deployment secret store.
9. PostgreSQL schema migration 31 reconciles any pre-existing overlapping
   current showroom projects, records the supersession events, and installs the
   partial unique business guard before `MIRTPAGE_DATABASE_DRIVER=postgres` is
   enabled for this release. Production preflight fails closed if it is absent.

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

Scenario: Current-project guard is absent
  GIVEN PostgreSQL schema migration 31 has not been recorded
  WHEN production preflight evaluates the Postgres runtime
  THEN startup fails closed before authoritative workflow traffic is accepted

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

On 2026-08-05 the linked `mirtpage` project received a transactionally reconciled
copy of 44 tables and 3,030 rows with 83 checks, 79 foreign keys, 78 indexes, 14
triggers, 307 not-null columns, 44 fingerprints, four negative invariants, and a
byte-identical retained SQLite source. The private `mirtpage-media` bucket was
created; the source manifest contained zero mutable objects and reconciled with
zero missing or conflicting objects. The least-privilege runtime login and
production preflight passed through Supabase's transaction pooler. Commit
`e3f3d0a` passed `npm run release` and every required check in GitHub Actions
run `31044968522`.

The first Vercel candidate (`dpl_9wor7DAet3w8jcphoeSasW8MDBv9`) built but failed
closed on every dynamic route because the platform function bundle omitted
Next.js `server/lib/source-maps.js` even though Next's NFT manifest traced it.
No custom domain was attached. The deployment config now explicitly includes
that framework runtime file for every dynamic route, and release trace validation
guards the inclusion before redeployment.
The second candidate (`dpl_3N3WJbFvumZ7ZsfEgxm9NBiwj8fs`) proved Vercel does not
follow relative dependencies from an explicit include and failed closed on
`server/lib/lru-cache.js`; the guarded include and trace assertion now cover both
files. The domain remained unattached.
The third candidate (`dpl_2Yc3wi1dJTFQhUNNSLvqGEsTLGHx`) then failed closed on
`server/lib/parse-stack.js`, proving the root cause was the broad `./lib/**/*`
trace exclusion removing Next.js's own server library. That exclusion is removed;
the release trace privacy gate remains responsible for rejecting project-private
source paths. The domain remained unattached.
The healthy public candidate then exposed a retained synchronous SQLite call in
the authenticated dashboard shell; client login succeeded, but the shell failed
closed when Vercel correctly denied `/var/task/data` creation. The shell now
awaits the driver-selectable publication and revision ports, and component-level
database-boundary scanning guards the fix.

The corrected exact-commit production deployment
`dpl_6MgbbKDKyYQ1km23maMk3Tw8GhdE` is ready at
`https://mirtpage.vercel.app`. Public health and showroom requests returned 200.
An authenticated temporary-password client rendered the PostgreSQL-backed
account shell and protected workspace handoff without the prior filesystem
failure. A separate read-only production probe proved that the same client's
latest awaiting-review revision passes request authorization, revision lookup,
schema-v4 validation, and four-offering catalog construction. The browser probe
did not alter that seeded client's password or bypass the required first-login
password change.

Vercel owns and has attached `mirtpage.com` and `www.mirtpage.com` to the
production project. External DNS remains unconfigured. The registrar must add
apex A records for `216.198.79.1` and `64.29.17.1`, plus a `www` CNAME to
`c5e46d2721b36922.vercel-dns-017.com`, before verification, canonical-domain
smoke checks, and rollback-window monitoring can begin.

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
- [x] PostgreSQL runtime selection and production startup validation implemented
- [x] Guarded empty-target production copy and full reconciliation implemented
- [x] Private Supabase Storage adapter and copy/hash verification implemented
- [x] Real Supabase database and Storage copy completed
- [x] Exact release commit passes local and remote gates
- [x] Vercel production deployment and generated-host smoke checks pass
- [ ] `mirtpage.com` DNS is attached and monitored through the rollback window
