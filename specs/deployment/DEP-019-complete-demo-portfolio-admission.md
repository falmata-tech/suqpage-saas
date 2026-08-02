---
id: DEP-019
title: Complete demo portfolio admission
status: done
related: [FE-023, BE-022, DEP-011, DEP-018]
owners: [operations, engineering, design]
last_updated: 2026-08-02
change_level: L2
---

# DEP-019 - Complete demo portfolio admission

## Problem and scope

Admit the complete 58-client fictional portfolio into the disposable local
environment with committed briefs and reviewed media, then prove that the richer
fixtures remain valid, responsive, and operationally bounded.

## Rollout sequence

1. Validate all creative records and materialized project briefs.
2. Verify every managed logo, hero, offering, and booth asset exists and stays
   within fixture size limits.
3. Reset the explicitly disposable local database.
4. Verify 58 active showrooms, four offerings each, and admitted recipes.
5. Capture every showroom at 1440 and 390 CSS pixels and inspect contact sheets.
6. Correct blocking overflow, contrast, broken media, or repeated-profile defects.
7. Run `npm run check`, `npm run test:acceptance`, and `npm run release`.

## Rollback

Revert the task-scoped commit and rerun the disposable local reset. Production
data, remote services, and migrations are outside this rollout.

## Scenarios

```gherkin
Scenario: Portfolio admission succeeds
  GIVEN committed creative profiles and media are complete
  WHEN the reset and admission gates run
  THEN all 58 showrooms publish with four imaged offerings
  AND desktop and mobile captures complete without browser or overflow failures

Scenario: Media is missing or oversized
  GIVEN a fixture references invalid committed media
  WHEN admission validation runs
  THEN the gate identifies the handle and path
  AND the portfolio is not reported complete
```

## Test plan

| Gate | Evidence |
|---|---|
| Fixture and media admission | `scripts/test-demo-client-portfolio.ts` |
| Desktop/mobile visual review | `scripts/capture-demo-client-portfolio.ts` |
| Complete repository regression | `npm run check`, `npm run test:acceptance`, `npm run release` |

## Readiness checklist

- [x] Local destructive boundary is explicit
- [x] Asset and browser evidence are defined
- [x] Rollback is deterministic
- [x] Production rollout is excluded

## Evidence

Evidence: completed locally on 2026-08-02. Eight bounded browser batches covered all 58
showrooms at 1440px and 390px with zero automated failures and reviewed contact
sheets. `npm run check`, the ordered ten-workflow production-browser acceptance
suite, and `npm run release` passed, including production build, HTTP smoke,
trace privacy, tenant security, additive migrations, and a zero-vulnerability
production dependency audit. No production deployment or data migration is
claimed.
