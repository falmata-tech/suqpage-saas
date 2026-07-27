---
id: BE-010
title: Revision v4 typed content and multi-release bank contract
status: in_progress
related: [BE-004, BE-005, BE-006, BE-007, BE-008, BE-013, FE-007, FE-009, FE-014, DEP-004, DEP-005, DEP-006, DEP-007, DEP-009, DEP-011, ADR-0005, ADR-0007]
owners: [backend, security, product]
last_updated: 2026-07-28
change_level: L3
---

# BE-010 — Revision v4 typed content and multi-release bank contract

## Problem and outcome

Typed page content, provider media, focused corrections, and bank 1.2 cannot be
added by mutating revision v3 or the bank 1.1 contract. The backend needs one
additive v4 domain boundary that preserves all retained releases.

## Scope and invariants

- Revision v4 with content-schema v2 and design-schema v2; v1-v3 remain
  read/recovery inputs and are never rewritten implicitly.
- For the current disposable local seed database, reset-created rows may move
  directly to v4/bank 1.2. Future production or data-important cutovers must ask
  whether retained data matters and use the staged additive path when it does.
- Strict discriminated blocks: `hero`, `story`, `highlights`, `information`,
  `call_to_action`, and `video`; at most 24 blocks with stable unique keys.
- Bounded block copy, ordered items, accessible labels, and named media-slot
  assignments using request-scoped opaque keys only.
- Exact multi-release resolver for immutable bank 1.1 and 1.2 definitions.
- Typed focused-correction commands over authorized mutable private v4 drafts.
- Controlled YouTube admission from recognized HTTPS watch/share URLs into one
  canonical 11-character provider ID and opaque media key.

## Contracts

- Content and design parsers reject unknown fields, markup, controls, raw URLs,
  duplicate keys, incompatible block/component pairs, invalid media kind/count/
  aspect, stale bases, unresolved questions, and unsupported releases.
- V4 provenance covers factual and media-bearing block fields; AI draft copy
  never becomes authority for contacts, product facts, claims, or provider media.
- Design-schema v2 sections reference at most one compatible content-block key;
  catalog/navigation/header/footer components may use canonical bindings without
  inventing a page block.
- Design-schema v2 sections may declare one reviewed `mediaIntegration`
  treatment independently of the selected component. Only media-bearing hero
  and content sections may use a visible treatment; unsupported values and
  incompatible slot/treatment pairs fail closed. Omitted values remain readable
  through deterministic integrated defaults and do not rewrite retained data.
- Exact typed-block assignment errors identify the specific unassigned or
  multiply assigned block key and the required correction. They never collapse
  an actionable key mismatch into a generic whole-design error.
- A release registry returns only statically imported reviewed banks. Existing
  bank-1.1 proposals parse/render exactly as before; unknown releases fail closed.
- Focused commands allow: replace compatible component, select admitted token,
  change bounded experience properties, edit one typed block, or assign/remove
  optional compatible media. They reauthorize and revalidate atomically and
  record actor plus safe diff metadata.
- YouTube parsing accepts `youtube.com/watch?v=ID` and `youtu.be/ID` over HTTPS,
  discards unrelated parameters, rejects playlists/shorts/embed markup/arbitrary
  hosts, and stores no recipe-controlled URL. Rendering receives only
  `youtube:ID` after exact validation.
- No focused command or recipe import can submit, approve, publish, mutate live
  catalog state, or access another request/tenant.

## Scenarios

```gherkin
Scenario: V4 recipe binds typed content
  GIVEN an authorized brief with typed blocks and admitted assets
  WHEN staff imports compatible content-schema-v2 and design-schema-v2 documents
  THEN one private revision-v4 candidate is stored and rendered deterministically
  AND retained v3 and bank-1.1 revisions are unchanged

Scenario: Old retained revision is rendered after bank 1.2 release
  GIVEN a published v3 revision pinned to showroom-bank@1.1.0
  WHEN bank 1.2 becomes the new-draft default
  THEN the retained revision resolves bank 1.1 exactly
  AND preview, rollback, and public rendering do not drift

Scenario: Untrusted provider input is supplied
  GIVEN a remote image, arbitrary video host, iframe, or malformed YouTube URL
  WHEN media admission or recipe parsing runs
  THEN it is rejected before network fetch or rendering
  AND CSP and persistence remain unchanged

Scenario: Recipe requests an unsupported image frame
  GIVEN a design-v2 recipe with typed section media
  WHEN its section requests an unknown or slot-incompatible mediaIntegration
  THEN parsing rejects the complete recipe before persistence
  AND no arbitrary CSS, class name, or image URL reaches the renderer

Scenario: Unauthorized focused command is called directly
  GIVEN a client, unassigned staff actor, submitted revision, or another tenant
  WHEN the actor sends an otherwise valid correction
  THEN access is denied before content disclosure or persistence

Scenario: Typed block is not assigned
  GIVEN a recipe contains a showroom-information block with no section reference
  WHEN design-v2 validation checks exact assignment
  THEN the issue identifies showroom-information as unassigned
  AND tells the caller to assign it once or remove it from the content document
```

## Quality impact

- Preserve the 1 MiB recipe limit, existing dynamic catalog limits, 24 blocks,
  bounded block items/media, and safe validation issue counts.
- Security/tenant isolation: every port is actor/request scoped and pure parsers
  own no persistence or provider authority.
- Accessibility/responsive behavior: content contracts require accessible media
  text and compatible components own mobile rendering.
- Failure recovery/idempotency: retained versions, atomic commands, hashes, and
  exact bank pins preserve retries and rollback.

## Observability

- Record only actor/safe IDs, schema/bank versions, command category, hash,
  counts, and outcome; never raw content, asset keys, URLs, or provider prompts.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Parser/schema parity and payload limits | contract/security | `scripts/test-showroom-content-blocks.ts`, `scripts/test-showroom-recipe.ts` |
| Bounded section-media integration and retained defaults | contract/unit | `scripts/test-showroom-composition-v2.ts` |
| V3/v4 and bank 1.1/1.2 exact compatibility | integration | `scripts/test-showroom-composition-v2.ts`, planned v4 migration tests |
| Provider normalization and unsafe-input denial | unit/security | `scripts/test-youtube-provider.ts`, `scripts/test-security.ts` |
| Atomic authorized focused commands | integration/security | planned focused-command tests |
| Exact preview/publication/rollback | integration/browser | `scripts/test-revisions.ts`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

DEP-009 controls migrations, default writers, CSP, and rollback. V4 writes stay
disabled until bank 1.2 and provider/browser gates pass, except for the
explicit reset-only development cutover approved for the current disposable
seed data.

## Readiness checklist

- [x] Durable versions and compatibility explicit
- [x] Typed block/provider/command contracts explicit
- [x] Authorization and failure scenarios present
- [x] Limits, observability, tests, and rollback planned

## Completion evidence

Checkpoint: the exact release resolver is implemented with bank 1.1 as the only
available/default immutable release. Published-manifest parsing and composed
rendering resolve the pinned release and fail closed for unknown releases. The
six strict typed blocks now have a pure server parser and portable schema with
bounded copy, items, media, keys, and unsafe-input denial. An additive design-v2
parser wraps the unchanged v1 validator and enforces exact one-time compatible
block assignment and named content-media slot counts using bank-v2 compatibility
metadata. Portable bank/design-v2 schemas and a frozen 67-component bank-1.2
candidate are available to the synthetic laboratory. Revision-v4 storage,
typed rendering, local reset-default bank-1.2 admission, provider CSP rendering,
and focused private-draft controls are implemented. The provider boundary now
accepts only exact HTTPS watch/share hosts and rejects playlists, shorts, embed
markup, and lookalikes. Authorized private-draft admission is default-off,
reuses request authorization,
stores only the normalized ID behind a random opaque key, deduplicates per
request, and exports neither the raw URL nor provider ID.
The isolated revision-v4 domain parser now composes strict catalog content,
managed typed blocks, and design-v2 validation against an explicitly supplied
reviewed bank while retaining the 1 MiB limit and rejecting unknown fields.
It is part of `npm run check` and `npm run release`; database writes, runtime
rendering, publication, and old-reader changes are intentionally not included in
this checkpoint.
Exact content-block assignment failures now identify the duplicated, unknown,
or unassigned block key and state whether to bind it once or remove it.
Schema migration 13 now records and indexes the exact snapshot schema version on
each revision, backfills it from validated retained JSON, checks parity, and
makes the marker immutable after submission. Existing creation/import writers
remain v3, so this migration alone cannot create or publish v4 data.
