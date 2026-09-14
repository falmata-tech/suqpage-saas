---
id: DEP-032
title: Nonbreaking Suqpage namespace rollout
status: in_progress
related: [BE-036, DEP-029, DEP-030, DEP-031, ADR-0021]
owners: [operations, security]
last_updated: 2026-09-14
change_level: L3
---

# DEP-032 — Nonbreaking Suqpage namespace rollout

## Problem and scope

Canonicalize former platform names in source symbols, environment templates,
Docker image user/service labels, test artifacts, public asset paths, and current
engineering documentation. Rename the master brief and update all references.
This is naming/compatibility work, not a redesign or provider replacement.

## Scenarios

GIVEN an existing deployment WHEN the new source is built without private data
THEN it still starts against its configured database/Auth/private Storage.
GIVEN a bookmarked old public asset WHEN requested after renaming THEN a bounded
mapping resolves the replacement; no arbitrary filesystem path is accepted.
GIVEN old worker caches WHEN the new worker activates THEN obsolete platform
caches are removed while unrelated site caches are preserved.
GIVEN local provider volumes, immutable backups or a published origin WHEN the
source is renamed THEN no destructive replacement is inferred from the name.
GIVEN a hosted Auth URL/template change WHEN requested THEN DEP-029's exact
reviewed plan remains required; naming does not bypass that guard.

## Test plan

Namespace audit with explicitly enumerated compatibility exceptions; config and
browser-state regressions; typecheck/specs/core/release/acceptance/operations and
container gates. Rehearse schema 45 against protected PostgreSQL backup data;
monitor the exact published candidate and account/media continuity.

## Rollout and rollback

Ordered steps are N1–N6 in the active transition checklist. Canonical environment
keys coexist with read compatibility for old hosted configuration during rollout.
Do not delete or rename legacy backup members: restore manifests may bind their
names and hashes. Do not rename a live domain without owned aliases and exact
Auth redirect review, or a provisioned resource without data/credential continuity.
Retain those identifiers as explicit compatibility records and report them. Existing
account emails remain unchanged per the owner's earlier instruction. No Git push
is implied. The existing deployment authorization applies to the verified candidate.

## Subscription-label completeness

Migration 45 also changes the platform-owned subscription default and insert
trigger to `Suqpage monthly`. Exact old standard plan labels become that canonical
label; custom plan names, prices, dates, account/tenant identities and all other
values remain unchanged. Regression tests and backup rehearsal compare expected
label-only changes and prove idempotency. Master sections 11 and 17 are affected.

## Evidence and current gate

Evidence: 2026-09-14 clean release, eight browser scenarios, operations and backup
rehearsal pass. Netlify offline package builds; its 929 runtime/asset sources match
the reviewed candidate, with no production credential or private runtime path in
the function archive. Container context/non-root/origin/trace/fail-closed checks also pass. Hosted
rollout remains the next gate in the active checklist. Retained names are enumerated in
`docs/SUQPAGE-NAMING-COMPATIBILITY.md`.
