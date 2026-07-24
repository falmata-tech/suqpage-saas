---
id: DEP-009
title: Revision v4 and showroom bank 1.2 controlled rollout
status: in_progress
related: [DEP-004, DEP-005, DEP-006, DEP-007, FE-007, FE-009, BE-005, BE-006, BE-007, BE-008, BE-010, ADR-0005, ADR-0007]
owners: [operations, security, product]
last_updated: 2026-07-24
change_level: L3
---

# DEP-009 — Revision v4 and showroom bank 1.2 controlled rollout

## Problem and outcome

Release typed v4 content, focused corrections, controlled YouTube, and a larger
creative bank without rewriting retained revisions or widening trusted input.

## Scope

### In scope

- Additive/idempotent schema migration for v4 recipe metadata and normalized
  provider assets; no destructive v1-v3 or bank-1.1 rewrite.
- Release registry packages immutable bank 1.1 and 1.2; new v4 drafts pin 1.2
  only after admission while retained revisions resolve their original bank.
- Narrow CSP `frame-src` only to the privacy-enhanced YouTube origin when the
  controlled component is enabled; arbitrary frames/scripts remain denied.
- Separate emergency switches for recipe-v4 creation, focused corrections, and
  provider rendering, with retained v3/recovery workflow available.

### Non-goals

- Destructive migration, provider API calls, arbitrary origins, removal of old
  readers, automatic production rollout, or committing private visual artifacts.

## Admission gates

- Parser/portable-schema parity for content v2, design v2, recipe, blocks, media,
  and maximum-safe fixtures.
- Bank 1.2 exact registry/code/token parity; at least 66 components, 18 token
  systems, and a 90,000 required-slot combination floor.
- Pairwise fixtures across industry families, block types, media kinds, token
  systems, experience settings, and required capabilities.
- Static checks prohibit network access, runtime dependencies, global CSS,
  dynamic imports, document mutation, unbounded animation, and raw markup.
- Browser checks at 320/390/desktop cover long text, missing optional media,
  keyboard/touch, reduced motion, no horizontal page overflow, client denial,
  focused corrections, exact preview, approval, publication, and rollback.
- Provider security checks prove normalized IDs, privacy-enhanced lazy rendering,
  no autoplay, title, CSP allowlist, and denial of all unapproved origins.
- Operations backup/restore pairs v4 rows, provider descriptors, and managed
  files; container traces contain no private content, media, or provider input.

## Scenarios

```gherkin
Scenario: V4 rollout preserves retained showrooms
  GIVEN published revisions pinned to v3 and bank 1.1
  WHEN migrations and bank 1.2 admission complete
  THEN their previews/public pages remain byte-contract compatible
  AND only new authorized drafts use v4 and bank 1.2

Scenario: Creative component fails mobile admission
  GIVEN a new variant overflows, hides an action, or depends on hover at 320px
  WHEN the bank release gate runs
  THEN bank 1.2 is not admitted
  AND bank 1.1 remains the default supported release

Scenario: Provider capability is disabled
  GIVEN a retained v4 draft references a normalized video asset
  WHEN operators disable controlled provider rendering
  THEN the page shows a safe unavailable state without loading a frame
  AND images, catalog, inquiries, approval, and rollback remain functional
```

## Quality impact

- Security/privacy: narrow CSP, synthetic CI, no provider credentials or private
  exports, and fail-closed release resolution.
- Accessibility/mobile: 320/390, keyboard, reduced-motion, and no-overflow gates.
- Performance: no new animation dependency; bounded CSS and provider lazy load.
- Recovery: additive migrations, exact old readers, emergency switches, paired
  backup/restore, and monitored staged rollout.

## Observability

Record safe migration/release/schema versions, component counts, gate category,
capability state, and outcome. Never record raw recipes, URLs, asset keys, client
copy, images, provider conversations, or credentials.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Migration, backup, restore, retained-release parity | operations | `scripts/test-operations.mjs`, planned v4 migration tests |
| Bank 1.2 coverage/isolation/pairwise admission | contract/static | `scripts/test-showroom-bank.ts`, `npm run check` |
| Provider/CSP/security denial | security/browser | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` |
| Mobile/reduced-motion/role/publication/rollback | production browser | `tests/acceptance/app.spec.ts` |
| Complete release and container privacy | release | `npm run release`, `npm run test:container` |

## Rollout and rollback

1. Land dual readers/resolver and synthetic fixtures without changing defaults.
2. Add v4/provider persistence and prove backup/restore on isolated data.
3. Admit bank 1.2 in the laboratory and production-browser fixtures.
4. Enable one administrator test request, then each staff role and four example
   tenants; compare retained bank-1.1 renders.
5. Enable v4 as the new-draft default only after all gates pass.

Rollback disables v4 writes/corrections/provider frames and returns new work to
the verified v3 recipe/recovery path. It never downgrades or rewrites retained
v4 data; compatible readers remain until explicit retirement.

## Readiness checklist

- [x] Migration, compatibility, security, and rollback explicit
- [x] Bank/mobile/provider admission thresholds explicit
- [x] Role and retained-release scenarios present
- [x] Complete release evidence mapped

## Completion evidence

Checkpoint: the additive release registry is present with bank 1.1 as the only
admitted release and no default/write change. Focused renderer/composition/bank
tests and type checking pass. V4 persistence, bank 1.2, provider/CSP, operations,
browser, and rollout evidence remain.
