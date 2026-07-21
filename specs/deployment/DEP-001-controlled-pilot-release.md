---
id: DEP-001
title: Controlled pilot release and recovery
status: done
related: [FE-001, BE-001, ADR-0002]
owners: [operations, security]
last_updated: 2026-07-20
change_level: L3
---

# DEP-001 — Controlled pilot release and recovery

## Problem and outcome

The pilot must be repeatably installed, verified, backed up, restored, and run on
persistent storage without implying horizontal scale or live Malikt integration.

## Scenarios

```gherkin
Scenario: Production configuration is unsafe
  GIVEN production mode with HTTP, missing persistent paths, or weak privacy salt
  WHEN startup preflight runs
  THEN startup fails before serving customer traffic

Scenario: Verified restore
  GIVEN a database and media backup
  WHEN operators restore while application writes are stopped
  THEN database integrity is checked before replacement
  AND database and media content are recovered

Scenario: Release candidate
  GIVEN locked dependencies and accepted specs
  WHEN the release gate runs
  THEN build, HTTP, type, design, security, spec, and dependency gates pass
```

## Observability, rollout, and rollback

Monitor health, process restarts, audit/rate events, disk capacity, integrity, and
backup freshness without customer contact data. Deploy one instance behind HTTPS.
Back up before migration, retain the prior image/build, and restore only after
stopping writes and validating the backup.

## Test plan and evidence

- `scripts/preflight.ts`, `scripts/release.sh`, `scripts/test-operations.mjs`.
- Docker persistent volume and health check in `docker-compose.yml`.
- Evidence: operations and complete release gates passed 2026-07-20.
