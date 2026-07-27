---
id: DEP-011
title: Ten-showroom benchmark and visual admission
status: done
related: [FE-007, FE-009, FE-010, FE-012, FE-014, FE-015, BE-008, BE-010, BE-011, BE-013, DEP-009, DEP-010]
owners: [operations, product, design]
last_updated: 2026-07-27
change_level: L3
---

# DEP-011 - Ten-showroom benchmark and visual admission

## Problem and outcome

Four ecommerce-oriented disposable seeds do not exercise the producer,
manufacturer, farm, sparse-media, or RFQ paths that SuqPage intends to support.
A reset-only ten-showroom benchmark must prove blueprint, bank, homepage, and
Bazaar behavior before these features are considered complete.

## Scope

- Replace the disposable local seed set with ten fictional varied businesses.
- Validate each seed through the authoritative v4 content, design, blueprint,
  and publication parsers.
- Use project-owned generated illustrative media with explicit internal
  provenance and no real-client claims.
- Cover sparse/dense catalogs, varied image counts, long content, optional-media
  fallbacks, and at least eight reviewed composition templates.
- Capture desktop, 390px, and representative 320px browser evidence for the
  homepage, Bazaar, staff workflow, and every public showroom.

## Contracts

- This plan is authorized only because the current local/client data is
  disposable. `npm run reset` may replace it. Production or data-important
  environments require a new preserve/reset decision and migration plan.
- Seed fixtures contain no real credentials, customer facts, copyrighted brand
  catalog, or unreviewed remote assets.
- Generated product or decorative imagery is internally marked illustrative.
- Every seeded business has a unique handle, contact policy, Industry, Bazaar
  booth reference, dynamic catalog, and validated showroom recipe.
- Admission fails for browser errors, broken media, unexplained initials,
  horizontal overflow, overlapping controls, inaccessible interactions, or hard
  composition-fitness failures.

## Scenarios

```gherkin
Scenario: Operator resets the disposable benchmark environment
  GIVEN the product owner has confirmed that the local seed data is not important
  WHEN the operator runs the reset setup
  THEN exactly ten fictional validated benchmark showrooms are created
  AND their recipes, media, Bazaar placements, and public routes pass admission

Scenario: Benchmark media or composition is defective
  GIVEN a seeded showroom has a broken image, unexplained initial, overflow, or hard fitness failure
  WHEN the benchmark admission gate runs
  THEN the gate fails with the affected handle and criterion
  AND no production-readiness claim is made
```

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Ten deterministic validated seeds | integration | `scripts/test-showroom-benchmarks.ts` |
| Reset idempotency and no private leakage | operations/security | `npm run reset`, `scripts/test-security.ts` |
| Homepage/Bazaar benchmark coverage | browser | `tests/acceptance/app.spec.ts` |
| Showroom desktop/mobile matrix | browser/manual | benchmark Playwright screenshot runner |
| Complete repository gates | release | `npm run check`, `npm run release`, `npm run test:acceptance` |

## Rollout and rollback

Local rollback runs the prior seed fixture revision. No production seed or
customer migration is authorized. Runtime feature rollback follows DEP-009 and
DEP-010.

## Readiness checklist

- [x] Disposable-data authorization recorded
- [x] Fixture boundaries and provenance explicit
- [x] Visual and automated admission planned
- [x] Production exclusion explicit

## Completion evidence

Evidence: implemented and verified on 2026-07-27.

- `npm run reset` creates exactly ten fictional benchmark businesses with
  varied catalogs and media coverage across the required business types.
- Fifty project-owned generated benchmark images were reviewed with desktop and
  mobile screenshots for every handle. Narrow split heroes and 320px map fit
  were corrected from that review.
- Benchmark, full-check, production build/HTTP smoke, and 10/10 acceptance
  evidence passed. Production/data-preserving rollout remains excluded.
