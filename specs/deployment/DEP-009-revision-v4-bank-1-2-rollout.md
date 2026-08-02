---
id: DEP-009
title: Revision v4 and showroom bank 1.2 controlled rollout
status: in_progress
related: [DEP-004, DEP-005, DEP-006, DEP-007, DEP-011, DEP-013, FE-007, FE-009, FE-014, BE-005, BE-006, BE-007, BE-008, BE-010, BE-013, ADR-0005, ADR-0007, ADR-0008]
owners: [operations, security, product]
last_updated: 2026-07-28
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
- Reset-only development cutover for the current disposable local seed
  database. This cutover may make v4 and bank 1.2 the default for reset-created
  rows without preserving obsolete prototype snapshots.
- Release registry packages immutable bank 1.1 and 1.2; new v4 drafts pin 1.2
  only after admission while retained revisions resolve their original bank.
- Narrow CSP `frame-src` only to the privacy-enhanced YouTube origin when the
  controlled component is enabled; arbitrary frames/scripts remain denied.
- Separate emergency switches for recipe-v4 creation, focused corrections, and
  provider rendering, with retained v3/recovery workflow available.

### Non-goals

- Destructive migration, provider API calls, arbitrary origins, removal of old
  readers, automatic production rollout, or committing private visual artifacts.
- Treating reset-only development cutover as a production data migration
  pattern. Future major feature switches must explicitly confirm whether
  existing data is important before choosing reset versus migration.

## Admission gates

- Parser/portable-schema parity for content v2, design v2, recipe, blocks, media,
  and maximum-safe fixtures.
- Bank 1.2 exact registry/code/token parity; at least 66 components, 18 token
  systems, and a 90,000 required-slot combination floor.
- Pairwise fixtures across industry families, block types, media kinds, token
  systems, experience settings, and required capabilities.
- Industry-neutral guidance fixtures prove the exported decision sequence,
  template pacing, semantic surfaces, treatment prerequisites, and corrective
  fitness messages without steering from tenant or industry labels.
- Token-to-renderer parity proves every authoritative typography, spacing,
  layout, shape, color, and media foundation decision has a scoped runtime
  representation.
- Palette admission proves admitted foundations and recipe-defined custom
  palettes use exact safe color values, required foreground/background pairs
  meet WCAG AA text contrast, and rendered children inherit the active section
  foreground instead of a different token pair. Custom colors never become
  arbitrary CSS, URLs, gradients, selectors, or executable input.
- Static checks prohibit network access, runtime dependencies, global CSS,
  dynamic imports, document mutation, unbounded animation, and raw markup.
- Browser checks at 320/390/desktop cover long text, missing optional media,
  keyboard/touch, reduced motion, no horizontal page overflow, client denial,
  focused corrections, exact preview, approval, publication, and rollback.
- The ten disposable benchmark showrooms are regenerated through the current
  bank and reviewed as one visual matrix at desktop and 390px. Admission rejects
  repeated generic compositions, one-hue pages, abrupt unintended image blocks,
  unreadable overlay headers, unbounded product media, dishonest component
  anatomy, or a dense manufacturer catalog rendered as a sparse lifestyle page.
- Every benchmark uses the same canonical hero/about/process/products/inquiry
  order. Admission rejects an extra trust/information chapter, changed order,
  or adjacent filler sections. Palette and surface choices are free within the
  safe semantic contract; monotony and weak color pacing are review findings,
  not one mandatory band sequence.
- Recipe regression proves empty provenance and advisory questions can create a
  private candidate, while malformed provenance remains rejected when supplied.
  Browser evidence proves staff can edit custom palette colors and section
  surfaces before the existing client review and publication gates.
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

Scenario: Ten-showroom design evaluation exposes a generic bank
  GIVEN the current semantic brief, renderer, and ten varied benchmark catalogs
  WHEN every showroom is captured at desktop and phone widths
  THEN the matrix demonstrates multiple coherent templates, surface rhythms, catalog anatomies, and intentional media treatments
  AND any repeated weak composition is corrected before the bank checkpoint is accepted

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
| Ten-showroom design matrix and responsive media treatments | browser/manual | benchmark Playwright screenshot runner, `scripts/test-showroom-benchmarks.ts` |
| Provider/CSP/security denial | security/browser | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` |
| Mobile/reduced-motion/role/publication/rollback | production browser | `tests/acceptance/app.spec.ts` |
| Complete release and container privacy | release | `npm run release`, `npm run test:container` |

## Rollout and rollback

Reset-only development cutover path for the current repository state:

1. Preserve tenant isolation, auth, inquiry, media, request, approval,
   publication, and rollback behavior.
2. Make reset-created businesses, baseline publications, and new drafts use v4
   typed content and bank 1.2 by default.
3. Run `npm run reset` rather than migrating disposable prototype rows.
4. Remove compatibility code only when no current reset-created workflow or
   test requires it.

Production/data-preserving path:

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

Checkpoint: the additive release registry still admits only bank 1.1, with no
default/write change. A frozen bank-1.2 candidate now meets the planned numeric
floor with 67 components, 18 token systems, and 98,280 required-slot
combinations; it is exposed only in the permissioned synthetic laboratory.
Static bank/experience/compatibility gates, the complete release, all eight
production-browser scenarios, and the isolated container privacy/build gate
pass. V4 persistence/rendering, local reset-default writes, provider/CSP
browser proof, and focused private-draft controls are implemented. Operations
migration/restore, full pairwise visual admission, remote checks, and
production rollout evidence remain. The local ten-showroom admission runner
creates twenty 1440px/390px captures plus comparison sheets and fails on browser
errors, broken media, horizontal page/text overflow, or insufficient surface
variety. The deterministic benchmark gate additionally requires four
page-pacing templates, four surface rhythms, five header anatomies, seven
catalog anatomies, six hero treatments, and no exact component repetition
inside a showroom.

The YouTube normalizer and request-scoped persistence adapter are implemented
without network access. Admission is independently disabled by default through
`MIRTPAGE_YOUTUBE_ADMISSION_ENABLED=0`; stored exports expose only opaque asset
keys. CSP enablement and browser rendering are covered by the production-like
acceptance scenario for the privacy-enhanced `youtube-nocookie.com` iframe.
The additive revision-v4 domain document is now validated independently of the
retained v1-v3 reader and is included in local/release gates. The reset-only
development cutover updates default local writers and renderers; production
deployment still needs explicit data-preserving or reset-approved rollout
evidence.
Migration 13 adds the non-destructive revision snapshot-version marker, verifies
stored-marker parity, and extends submitted-revision immutability. Revision and
backup/restore integration tests pass with the marker, while v4 rows and v4
managed-file restore remain intentionally outside this checkpoint.
