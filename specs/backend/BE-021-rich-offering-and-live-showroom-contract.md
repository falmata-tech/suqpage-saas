---
id: BE-021
title: Rich offering and live showroom contract
status: done
related: [FE-022, DEP-018]
owners: [backend, security]
last_updated: 2026-08-01
change_level: L3
---

# BE-021 - Rich offering and live showroom contract

## Problem and outcome

Persist and publish optional offering presentation facts and controlled
showroom live/video settings without weakening tenant isolation, inquiry
semantics, provider security, or retained-version recovery.

## Domain invariants

- `price_minor` is nullable or an integer from 0 through 999,999,999 and its
  currency is `ETB`. It is display context, never an amount charged by SuqPage.
- `quantity_unit` is optional normalized plain text of at most 40 characters.
- `highlights_json` parses to an ordered unique array of at most six strings,
  each containing 1-80 characters.
- `video_ref` and `process_video_ref` are empty or canonical
  `youtube:<11-character-id>` managed references.
- `live_platform` is one of `tiktok`, `facebook`, `youtube`, or `google_meet`.
  An active live state requires a matching HTTPS allowlisted host URL; an
  inactive state may retain its valid destination for the next session.
- Basic upkeep, recipe import, revision publication, rollback, preview, and
  catalog projection preserve every expanded field.
- Product detail pattern is a closed design-schema choice and unknown values
  fail validation before publication.

## Ports and persistence

- Product upkeep validates normalized commands before the SQLite adapter enters
  its tenant-scoped transaction.
- Snapshot parsing owns bounded structured values; SQL stores canonical scalar
  values and serialized highlights.
- Live/showroom setting writes require existing business authority and are
  audited without logging full URLs or product copy.
- Additive SQLite migration 24 creates compatible columns and constraints where
  SQLite permits them; application validation remains authoritative at ports.

## Scenarios

```gherkin
Scenario: Tenant updates rich offering fields
  GIVEN an authorized client owns an established showroom
  WHEN they publish valid price, unit, highlights, and video values
  THEN the product, retained catalog version, public catalog, and audit summary agree

Scenario: Cross-tenant update is attempted
  GIVEN a user does not control the target business
  WHEN they submit rich offering or live settings
  THEN authorization fails before any row or retained version changes

Scenario: Revision is rolled back
  GIVEN a published revision contains rich offering and showroom fields
  WHEN an authorized rollback restores that version
  THEN all expanded fields and the product-detail pattern are restored atomically

Scenario: Managed URL validation fails
  GIVEN an unsupported provider, host, scheme, or embed payload
  WHEN a command or recipe is parsed
  THEN validation fails closed without storing the value
```

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Command validation and idempotency | unit/integration | `scripts/test-product-upkeep.ts` |
| Migration and retained-version fidelity | integration | `scripts/test-revisions.ts`, `scripts/test-rich-offering-migration.ts` |
| Tenant and live-setting authorization | security | `scripts/test-live-showroom.ts` |
| Recipe and design pattern admission | contract | `scripts/test-showroom-recipe.ts`, `scripts/test-showroom-composition-v2.ts` |

## Rollout and rollback

DEP-018 applies additive migration 24 before new writes are enabled. Rollback
retains the compatible columns and disables expanded controls/readers without a
destructive table rebuild.

## Readiness checklist

- [x] Domain limits explicit
- [x] Authorization boundary identified
- [x] Migration compatibility defined
- [x] Failure behavior explicit
- [x] Evidence paths identified

## Evidence

Evidence: completed locally on 2026-08-01. Migration 24, product-upkeep idempotency and
tenant scope, revision publication/rollback, recipe asset reconciliation,
managed YouTube references, live-platform URL denial, security integration, and
schema constraints passed in `npm run check` and `npm run release`. Production
acceptance also proved the narrow CSP and privacy-enhanced browser embed. No
production data migration is included.
