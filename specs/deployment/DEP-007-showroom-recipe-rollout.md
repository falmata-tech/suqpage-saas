---
id: DEP-007
title: Showroom recipe schema and studio rollout
status: ready
related: [FE-007, FE-009, BE-008, BE-010, DEP-003, DEP-004, DEP-006, DEP-008, DEP-009, ADR-0005, ADR-0006, ADR-0007]
owners: [operations, security, product]
last_updated: 2026-07-24
change_level: L3
---

# DEP-007 — Showroom recipe schema and studio rollout

## Problem and outcome

Portable content/design schemas, recipe import, revision-v3 persistence, and a
staff studio introduce version-skew, private-export, migration, and rollback
risks. The rollout must prove that an external AI can produce a complete
showroom recipe without receiving application authority and that current
showrooms remain recoverable throughout the transition.

## Scope

### In scope

- Version and release portable content, design, and recipe-envelope schemas with
  synthetic complete showroom examples across multiple catalog sizes/industries.
- Add recipe/schema compatibility and fixture admission to the standard check.
- Additive private recipe-import persistence and revision-v3 migration with
  backup, integrity, idempotency, and restore evidence.
- V2 read/upgrade compatibility while all new recipe candidates/writes become
  v3 after cutover.
- One stockless revision-v3 content contract coordinated with DEP-008; recipe
  schemas, examples, and writes contain availability but no inventory count.
- Feature/capability rollout to assigned team members, operations managers, and
  administrators only.
- Production-browser evidence for brief export, recipe import, validation,
  exact preview, client decision, manager publication, and retained rollback.
- Safe export/download headers and explicit operator guidance for manually using
  an approved external AI account.
- Controlled image/provider-media configuration, CSP/privacy behavior, and
  backup/restore coverage for recipe media descriptors and managed files.

### Non-goals

- Automatic provider transmission, provider credentials, production migration,
  public recipe endpoints, customer self-service, or attaching raw AI payloads
  to CI.
- Removing v2 recovery until its explicit retirement criteria pass.

## Domain language and invariants

- A schema/example release is immutable and pinned by each brief and recipe.
- CI uses synthetic fixtures only. Private briefs, recipes, request attachments,
  client content, and provider conversations never become source or artifacts.
- Manual export/import is the controlled initial boundary. A provider adapter
  remains a separate L3 decision and release.
- Recipe capability can be disabled without disabling current public showrooms,
  client review, publication, or rollback.

## Contracts

- `npm run check` admits authoritative parser/portable-schema parity, strict
  examples, dynamic count fixtures, content/design cross-validation, and
  prohibited executable/external values.
- Complete examples include at least a no-catalog/service showroom, a small
  artisan catalog, and a larger multi-collection catalog. Examples are
  synthetic and never define fixed production item counts.
- Export responses are authenticated, non-cacheable, attachment-disposition
  controlled, and bounded; generic logs and error trackers receive no payload
  bodies.
- Managed recipe images remain inside the existing persistent media/backup
  boundary. Synthetic CI fixtures never contain client images; restore evidence
  proves media registry rows and managed files remain paired.
- Initial YouTube rendering uses a reviewed provider-specific component,
  privacy-enhanced canonical embed origin, lazy/user-initiated loading, bounded
  title/ID, no autoplay by default, and the narrow CSP/frame policy required for
  that origin only. Arbitrary frames, scripts, trackers, and providers remain
  denied.
- Operators must confirm media usage rights and manually supply any approved
  private images to the external AI conversation. SuqPage does not upload image
  bytes or provider links to an AI service in the manual phase.
- Migration starts from an integrity-clean backup, is transactional/idempotent,
  preserves tenant/request/revision/publication/inquiry/delivery authority, and
  records only safe schema/count evidence.
- DEP-007 and DEP-008 schema/parity gates must agree on the exact revision-v3
  content contract before either rollout writes v3.
- Rollout first enables one test request per staff role, then the four example
  clients, before making recipe import the default staff path.
- Release requires `npm run check`, operations backup/restore, production build,
  HTTP/security tests, full browser acceptance, and container trace/privacy
  gates.
- Production configuration contains no AI-provider credential because the
  initial workflow is manual. Any later credential fails scope review without a
  provider spec/ADR amendment.
- Rollback disables recipe routes/capabilities and restores the compatible
  checkpoint. It never downgrades or overwrites post-cutover published content
  without retained-version or reconciled restore authority.

## Scenarios

```gherkin
Scenario: Schema and examples are released safely
  GIVEN authoritative content, design, and recipe parsers
  WHEN the release gate validates portable schemas and synthetic examples
  THEN every example parses identically and exercises dynamic list sizes
  AND no private client data or executable value enters the release

Scenario: Revision-v3 migration succeeds
  GIVEN an integrity-clean v2 database and verified media backup
  WHEN the controlled migration runs
  THEN retained content/design values and all authority/history remain intact
  AND new recipe candidates are written only in v3

Scenario: Recipe and product-upkeep releases disagree on v3
  GIVEN DEP-007 and DEP-008 propose different revision-v3 content contracts
  WHEN schema parity admission runs
  THEN both write paths remain disabled
  AND no ambiguous v3 revision or migration is released

Scenario: Recipe rollout regresses a current workflow
  GIVEN a failing request role, preview, approval, publication, inquiry, mobile, backup, or rollback check
  WHEN the release admission runs
  THEN rollout exits non-zero
  AND recipe import is not enabled as the default staff workflow

Scenario: Unsupported external media is proposed
  GIVEN a recipe or operator supplies an unapproved provider, raw embed, or remote image URL
  WHEN security and release admission run
  THEN the value is rejected and CSP remains narrow
  AND no provider script or unverified image enters the build, preview, or publication

Scenario: Operator rolls back recipe capability
  GIVEN import or studio behavior is unsafe after deployment
  WHEN the feature is disabled and the compatible checkpoint is restored
  THEN current public showrooms and retained approved revisions remain available
  AND no imported private candidate is published implicitly
```

## Quality impact

- Security and tenant isolation: capability gates, private non-cacheable exports,
  synthetic CI data, container trace checks, and cross-role browser tests.
- Privacy and data retention: no automatic external transfer; bounded private
  recipe retention and explicit operator handling guidance.
- Accessibility and responsive behavior: studio/browser admission includes
  keyboard, 320/390-pixel, touch, focus, and reduced-motion evidence.
- Localization and merchant-entered values: fixtures exercise long/non-English
  values and exact canonical preservation.
- Performance and limits: parser/import/preview time and payload limits are
  measured with maximum-safe fixtures; no provider latency in initial rollout.
- Failure recovery and idempotency: additive migration, backup/restore,
  idempotent imports, capability disable, and retained v2/v3 rollback.

## Observability

Report schema/bank release, safe counts, migration version, capability state,
validation category, latency buckets, and outcome. Never report raw content,
recipe JSON, source facts, private asset keys, contacts, prompts, or credentials.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Schema/parser/example parity | contract | `scripts/test-showroom-recipe.ts` |
| No private/export data in source, logs, traces, artifacts | security/container | `scripts/test-security.ts`, `scripts/test-build-trace.mjs`, `scripts/test-container.mjs` |
| V2/v3 migration, backup, restore, idempotency | operations | `scripts/test-operations.mjs`, `scripts/test-showroom-recipe.ts` |
| Staff capability and tenant isolation | security/browser | `scripts/test-requests.ts`, `tests/acceptance/app.spec.ts` |
| Media persistence, provider allowlist, CSP, and privacy | security/operations/browser | `scripts/test-security.ts`, `scripts/test-operations.mjs`, `tests/acceptance/app.spec.ts` |
| Export/import/preview/approval/publication/rollback | production browser | `tests/acceptance/app.spec.ts` |
| Complete release admission | release | `npm run check`, `npm run release`, `npm run test:operations`, `npm run test:acceptance`, `npm run test:container` |

## Rollout and rollback

1. Land pure schemas/parsers, synthetic examples, and check admission.
2. Add private candidate storage and the same stockless v2-reader/v3-writer
   compatibility admitted by DEP-008.
3. Back up and migrate isolated/test data; prove stockless preservation,
   restore, and idempotency.
4. Enable export/import and focused studio for one assigned test request.
5. Exercise every staff/client role and all four example clients.
6. Make recipe import the default staff path only after all release gates pass.
7. Retain the administrative recovery editor and v2 reader through the pilot
   recovery window; remove either only in a later scoped spec.

Rollback disables recipe capability, returns staff to the recovery editor, and
restores the compatible database/media checkpoint if required. Any published
post-cutover content is reconciled through retained-version publication or an
approved restore; it is never silently overwritten.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Implementation checkpoint: additive recipe metadata/media migrations, release
gate admission, private staff studio routes, verified-image persistence,
backup/restore row coverage, and the manual import boundary are implemented.
`SUQPAGE_RECIPE_STUDIO_ENABLED=0` denies the recipe application boundary and
returns new staff drafts to the retained administrative editor.
The standard check, production release, 7/7 browser acceptance, container
privacy/build, and operations restore gates pass for this checkpoint.
Controlled provider/CSP work remains open. This ready spec does not authorize a
production migration, push, or rollout and is not complete.
