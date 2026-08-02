---
id: DEP-001
title: Controlled pilot release and recovery
status: done
related: [FE-001, BE-001, DEP-006, DEP-008, DEP-012, ADR-0002]
owners: [operations, security]
last_updated: 2026-07-24
change_level: L3
---

# DEP-001 — Controlled pilot release and recovery

## Problem and outcome

The pilot must be repeatably installed, verified, backed up, restored, and run on
persistent storage without implying horizontal scale or logistics integration.

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

Scenario: Browser acceptance on the supported Node 22 baseline
  GIVEN GitHub Actions runs Playwright on a supported Node 22 release
  WHEN the acceptance suite loads its SQLite persistence assertions
  THEN all browser scenarios are discovered and executed
  AND the test transform loader does not intercept the experimental SQLite module

Scenario: Acceptance credentials remain private
  GIVEN setup generates credentials for an isolated acceptance database
  WHEN the browser job runs in CI
  THEN tests may read the private temporary credential file
  AND credential values are not written to the job log or uploaded artifacts
```

## Observability, rollout, and rollback

Monitor health, process restarts, audit/rate events, disk capacity, integrity, and
backup freshness without customer contact data. Deploy one instance behind HTTPS.
Back up before migration, retain the prior image/build, and restore only after
stopping writes and validating the backup.

## Test plan and evidence

- `scripts/preflight.ts`, `scripts/release.sh`, `scripts/test-operations.mjs`.
- `tests/acceptance/app.spec.ts`, `scripts/acceptance-db-probe.mjs`, and
  `scripts/acceptance-runner.mjs` on Node 22.
- Docker persistent volume and health check in `docker-compose.yml`.
- Evidence: exact Node 22.16 discovery and all five browser scenarios,
  `npm run check`, `npm run test:operations`, `npm run test:http`, and
  `npm run release` passed on 2026-07-21; automated setup output contained no
  credential values.
