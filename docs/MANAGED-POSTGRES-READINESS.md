# Managed PostgreSQL readiness

Current contracts: BE-035, DEP-031, ADR-0020. PostgreSQL is the only executable
database engine in development, tests, CI and deployments. Supabase Auth and
private Storage remain separate provider services with application-owned roles,
tenant scope and authorization. Follow `docs/POSTGRES-ONLY-RUNBOOK.md`.

## Implemented locally

- Native schema 43 with constraints, indexes, sequences and tenant triggers.
- Fresh local installation, demo seeding and idempotent migration preservation.
- Bounded asynchronous pools and PostgreSQL transactions for all runtime paths.
- Isolated PostgreSQL schema fixtures; no driver fallback or source-copy bootstrap.
- Backend-paginated public category/search and administrative lists.
- Owner product/page/contact workflows and admin page/location moderation.
- Database-derived private media manifests and PostgreSQL archive tools.

## Launch gates

Focused local evidence is in `docs/SUQPAGE-LAUNCH-WIRING-AUDIT.md`. Complete the
approved visual review, full check/release/browser gates, operations restore test,
container gate and exact hosted candidate verification before launch claims.

Verify hosted Google/email sign-in, delivery, tenant roles, private media, runtime
permissions, provider backups and monitored rollback. Auth and Storage backups are
separate from the application-schema archive. Realtime is optional and disabled
until its own authorized adapter and privacy tests exist; current support polling
is intentional. All hosted mutations follow DEP-029 and explicit target approval.
