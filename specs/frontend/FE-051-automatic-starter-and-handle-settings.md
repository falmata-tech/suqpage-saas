---
id: FE-051
title: Automatic starter and editable address
status: done
related: [FE-038, FE-046, FE-049, BE-043, DEP-040]
owners: [product, frontend, backend, operations]
last_updated: 2026-09-23
change_level: L3
---

# FE-051 — Automatic starter and editable address

## Problem and scope

Signup should open a complete private example without requiring handle selection.
Keep the Suqpage wordmark identical in every locale. Reuse atomic starter creation,
add persisted example gallery entries and concise editable copy. Keep real account
identity and consent real; do not publish sample content automatically or overwrite
existing accounts. No new media provider or business-specific redesign.

## Scenarios and readiness

- GIVEN signup without a handle WHEN it completes THEN an available generated
  address and complete private starter exist atomically; open the page editor in preview mode.
  Collision retries are bounded and database-authoritative. Explicit handles from
  compatible clients remain validated. No extra manual initialization is needed.
- GIVEN an owner WHEN changing their handle THEN validate format/availability,
  permit the first change immediately and subsequent changes after 30 days.
  Unchanged saves consume no allowance. Simultaneous requests cannot bypass the
  interval or claim the same current/retired address.
- GIVEN an earlier change WHEN the owner needs another THEN link to support;
  only a platform administrator can override with a recorded reason.
- GIVEN an old public link WHEN opened THEN redirect to the current address and
  preserve product/query parameters. Private/suspended visibility remains enforced.
  Retired addresses stay reserved to prevent another shop taking over old links.
- GIVEN different locales WHEN rendering the brand THEN wordmark text, font,
  weight and spacing are unchanged; surrounding interface remains localized.
- GIVEN a fresh workspace WHEN previewing/editing THEN cover/logo, About, public
  contacts, city and three sample product/service/custom-order offerings are saved,
  with photos, prices, descriptions and multiple gallery items. Examples stay
  identified as examples, editable and private until owner publication.

Definition of Ready met. Existing S26 is revised by this newest instruction;
The final S27 gallery and S28 starter/handle design are visually approved and deployed. Master §§5/7/11/13/17/18/19/22 affected.

## Test plan

Focused PostgreSQL tests: collision, concurrent rename, cooldown boundary, owner/
admin authorization, override audit, unchanged save, alias resolution, privacy,
atomic starter completeness and no overwrite. Browser: actual signup defaults,
handle settings/save/failure, all-locale wordmark geometry and desktop/phone views.
Typecheck, localization, schema/trace validation before visual review; full gates
and release after explicit approval.

## Rollout

Additive schema 50: last-change timestamp and reserved address registry seeded
from existing handles, with transactional uniqueness for all insertion/update
paths. Existing data must remain intact. Keep table server-only and include it
in backup/grant verification. Local rehearsal and production backup/migration/release gates pass. Application rollback retains registry/history;
do not drop it or release reserved addresses during rollback.


## Local evidence — 2026-09-23

Focused signup/lifecycle, starter, native schema, invitation and gallery tests
pass; see S28 in TRACEABILITY. Real local browser signup/rename/admin override/
redirect/privacy flows and all-locale logo equality pass at desktop/390/320.
Starter field/image/save/reload/private-preview review passes 29 captures.
Local and hosted schema 50 are applied; visual approval, full/release gates and publication are complete.

## Release evidence — 2026-09-23

Evidence: `docs/SUQPAGE-S28-RELEASE-2026-09-23.md` records source `90094c6`,
Netlify `6ab3c4e43c9a7f1e972648ad`, verified schema 50, protected backup and
rollback target. Full check, release, operations, nine production-mode acceptance
scenarios and exact-artifact Linux/privacy gates pass. Live public and gallery/
owner/handle/five-language wordmark checks and health monitoring pass. Existing
merchant content and demo account aliases are preserved; mail delivery and
external video playback are not asserted by the no-delivery live smoke.
