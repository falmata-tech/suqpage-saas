---
id: BE-007
title: Versioned composition revision and publication
status: done
related: [FE-003, FE-006, DEP-006, BE-003, BE-004, BE-005, BE-006, BE-008, BE-009, ADR-0004, ADR-0005]
owners: [product, backend, security]
last_updated: 2026-07-24
change_level: L3
---

# BE-007 — Versioned composition revision and publication

## Problem and outcome

Revision schema version 1 stores only one of four renderer keys. It cannot
reproduce a bank composition, and new drafts currently copy that format
indefinitely. Revision schema version 2 must store an exact validated
`designManifest`, make every new write v2-only, and preserve the existing
approval, publication, tenant, media, and rollback invariants.

## Scope

### In scope

- A strict schema-v2 revision snapshot with canonical content and a separate
  validated design manifest.
- A read-only v1 parser and deterministic v1-to-v2 upgrader for migration and
  bounded recovery.
- V2-only draft creation, save, baseline capture, publication, and rollback
  writes.
- Persist the currently published manifest on the business row.
- Transactionally migrate existing business rows, content revisions, and
  retained catalog versions while preserving IDs, content, status, attribution,
  and version numbers.
- Four curated manifest factories keyed only by the former design identity.

### Non-goals

- Editing arbitrary manifest JSON in the browser, AI/provider calls, changing
  revision status rules, or preserving exact legacy pixels.
- Deleting the temporary v1 parser before the retirement criteria are met.

## Domain language and invariants

- `RevisionSnapshotV1` is legacy read input only.
- `RevisionSnapshotV2` is the sole write format and contains
  `schemaVersion: 2`, canonical business/catalog content, and one
  `ShowroomDesignProposal`.
- A **curated migration manifest** is deterministic for a recognized legacy
  design key and contains no tenant facts or executable values.
- Publication remains an atomic replacement of canonical content plus its exact
  manifest after client approval and stale-version validation.

## Contracts

- Parsing dispatches by exact schema version and rejects unknown fields,
  versions, invalid manifests, unsupported bank releases, components, tokens,
  properties, bindings, incompatibilities, or missing mandatory capabilities.
- Upgrade from v1 preserves every business and catalog value and maps only the
  design identity to a validated curated manifest.
- New draft creation upgrades its source before insertion; save rejects v1.
- Current live persistence uses `design_key='composition'` and non-empty
  `design_manifest_json` validated before use.
- Publication changes canonical rows and manifest in the existing transaction;
  any validation/media/database failure leaves live content and version
  unchanged.
- Rollback parses any retained v1/v2 input, upgrades if required, and writes a
  new monotonic v2 publication rather than restoring an old key as live state.
- Migration is idempotent and transactional. It preserves business IDs,
  handles, client users, assignments, requests, revision IDs/statuses,
  published version numbers, catalog IDs/content, inquiries, and deliveries.
- After migration, zero active business, revision, or retained publication rows
  remain in v1/legacy-key form.

## Scenarios

```gherkin
Scenario: New revision is v2-only
  GIVEN a business whose newest retained input is schema version 1
  WHEN assigned staff creates a draft
  THEN the stored draft is schema version 2 with a valid design manifest
  AND all canonical content values are preserved

Scenario: Approved composition publishes atomically
  GIVEN the latest exact schema-v2 revision approved by its client
  WHEN an operations manager publishes it against the unchanged base version
  THEN catalog content and the exact manifest become live in one transaction
  AND content version increases once

Scenario: Invalid manifest cannot affect live content
  GIVEN a malformed, incompatible, or unsupported design manifest
  WHEN it is saved, published, migrated, or rolled back
  THEN the operation fails before live replacement
  AND tenant content, approval state, and content version remain unchanged

Scenario: Legacy retained version rolls forward safely
  GIVEN an authorized retained schema-v1 version during the recovery window
  WHEN an operations manager chooses rollback
  THEN it is upgraded to v2 and republished as a new content version
  AND the live business remains on the composition renderer
```

## Quality impact

- Security and tenant isolation: existing actor/request/business checks remain
  authoritative; manifest parsing is pure and has no I/O.
- Privacy and data retention: migration rewrites format only and does not export
  or log snapshot contents.
- Accessibility and responsive behavior: manifests admit only reviewed bank
  components and bounded experience properties.
- Localization and merchant-entered values: canonical strings and references
  are copied exactly.
- Performance and limits: existing 256 KiB proposal and 24-section limits;
  manifest parse occurs at write/read boundaries.
- Failure recovery and idempotency: migration transaction, backup, retained
  snapshots, monotonic rollback, and repeat-safe schema migration marker.

## Observability

Operators may observe counts by schema version, recognized legacy design key,
migration version, and safe validation category. No snapshot JSON, contacts,
private references, or credentials may be logged.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Strict v1 read/v2 write and upgrade | unit | `scripts/test-showroom-migration.ts` |
| Draft/approval/publication/rollback invariants | integration | `scripts/test-revisions.ts` |
| Atomic invalid-manifest failure and tenant scope | security | `scripts/test-revisions.ts`, `scripts/test-security.ts` |
| Complete data-preserving migration | operations | `scripts/test-operations.mjs`, `scripts/test-showroom-migration.ts` |

## Rollout and rollback

DEP-006 controls backup and cutover. Schema migration 8 adds live-manifest
storage and transactionally upgrades recognized legacy rows and snapshot JSON.
The code deploy must understand both v1 and v2 before migration runs. During the
recovery window, v1 is read-only. Its retirement requires zero v1 rows after
backup/restore and rollback drills plus passing release evidence; history stays
recoverable from the backup and Git, not a parallel live renderer.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-07-24.

- Revision schema v2 strictly separates canonical content from an exact parsed
  `designManifest`. The parser still reads recognized v1 snapshots only for
  upgrade/recovery; draft save, submission, publication, baseline, and rollback
  writes require or produce v2.
- Publication atomically replaces canonical catalog content and
  `design_manifest_json`. Rollback upgrades retained v1 input when necessary and
  republishes a new monotonic v2 version.
- Migration 8 transactionally converts business rows, content revisions, and
  retained publications. It drops and recreates the submitted-revision
  immutability trigger only inside the transaction and rolls back on any unknown
  identity or invalid snapshot.
- `scripts/test-showroom-migration.ts` proved four distinct manifests, preserved
  IDs/counts/content/status/version/attribution, idempotency, zero remaining v1
  rows, and atomic failure. `scripts/test-revisions.ts` proved exact approval,
  stale conflict, media staging, publication, and rollback.
- Full security, request, adapter, type, build, release, operations, and browser
  gates passed.
