---
id: DEP-046
title: Product-only demo correction and compatible rollout
status: in_progress
related: [FE-067, BE-056, DEP-034, DEP-038, DEP-042, DEP-044, DEP-045, BE-022]
owners: [operations, security]
last_updated: 2026-10-17
change_level: L3
---

# DEP-046 — Product-only demo correction

## Problem, scope and safety

S112 authorizes product-only implementation and audit/correction of marked demo
content. This is a one-time local correction plus maintained source fixtures,
not a permanent synchronization service or permission to rewrite real businesses.
No hosted write, new APK/AAB or deployment is included. Preserve all earlier
S107–S111 pending review gates and user-owned worktree changes.

## Scenarios

- GIVEN demo source fixtures/starters THEN list tangible products only, retain
  made-to-order kinds instead of flattening manufacturing work into services,
  and replace genuine diagnostics/repair visits with plausible physical products.
  Media must match the product or remain honestly illustrative; no invented real
  product photograph/certification claim. Retain stable demo IDs/handles.
- GIVEN a local correction WHEN it is applied THEN verify loopback account/database/schema target,
  save protected exact before-images, admit only reviewed is_demo IDs/names and
  published/draft catalog snapshots, and stop on drift. Preserve private login
  aliases, ownership, fake public contacts, GPS, real tenants and chat/inquiry data.
- GIVEN correction success THEN prove exact changed fields, public counts and
  product supply modes, replay/no-op behavior, and unchanged excluded rows.
  Keep a protected rollback plan; do not automatically restore on ambiguity.
- GIVEN previously released clients THEN fail retired service writes safely and
  keep historical storage readable. Code rollback does not delete retained kinds
  or restore unsafe real contact targets. Any future hosted correction requires
  its own exact target/backup/review and monitored verification.

## Test plan and rollout

Focused fixture/product-only/tenant tests, typechecks, localization/spec checks
and actual five-language desktop/phone/Expo workflows precede visual approval.
Then run applicable check/release/acceptance gates before a reviewed task commit
or separately authorized rollout. Definition of Ready is met; existing kinds
support the behavior without a migration or provider change. Prepared Play/social
copy follows product-only wording; previously published graphics/binaries are not
claimed updated by source changes alone.

Mapped tests: `scripts/test-simple-demo-seed.ts`,
`scripts/test-business-starters.ts`, `scripts/test-category-starter.ts`,
`scripts/test-product-only-catalog.ts`, localization/narrative checks and protected
one-time correction receipts plus actual local desktop/phone/Expo captures.
