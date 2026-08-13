---
id: BE-022
title: Demo showroom portfolio contract
status: done
related: [FE-023, BE-013, BE-021, BE-023, DEP-019]
owners: [backend, design-systems]
last_updated: 2026-08-11
change_level: L2
---

# BE-022 - Demo showroom portfolio contract

## Problem and outcome

Generic theme expansion currently supplies incomplete fixture identity and media.
The reset adapter needs one explicit, validated source of fictional customer
content and art direction so publication cannot silently fall back to shared
heroes, empty logos, repeated products, or unreviewed color choices.

## Domain invariants

- Every active demo handle resolves to exactly one creative profile.
- A creative profile contains customer intent, palette request and advice, a
  complete safe custom palette, an admitted component profile, project copy,
  logo and media references, and exactly four unique offerings.
- Offering slugs are unique within a business; all four are published and have
  non-empty image references.
- Logo, hero, offering, and booth paths are normalized local managed paths.
- Showroom and offering video references are independently derived from a
  controlled production-family allowlist. An unmatched active fixture fails
  validation rather than silently receiving an unrelated video.
- Newly generated hero and offering raster derivatives use bounded WebP fixture
  assets; hero files stay within 300 KiB and offering files within 150 KiB.
- The design manifest is generated through the existing parser. Invalid colors,
  unreadable role pairs, unknown components, or incompatible composition data
  fail reset instead of falling back.
- Fixture facts stay explicitly fictional and do not gain exported fact-source
  authority merely because they are committed.
- Fictional provenance belongs to fixture metadata, briefs, and audit evidence.
  Published descriptions and process copy must remain neutral and useful without
  leaking seed, test, fictional, or provisional-copy terminology.

## Scenarios

```gherkin
Scenario: Complete portfolio is materialized
  GIVEN all 66 creative profiles and reviewed media exist
  WHEN the local setup adapter resets the disposable database
  THEN it publishes 66 admitted snapshots with four offerings each
  AND every public discovery record uses its own logo, hero, and booth references

Scenario: A creative profile is incomplete
  GIVEN one profile has a missing media file, palette role, or offering
  WHEN fixture validation runs
  THEN the gate fails with the affected handle and field
  AND completion evidence is not recorded

Scenario: Existing tenant behavior is exercised after reset
  GIVEN the portfolio has been republished
  WHEN tenant-negative and inquiry tests run
  THEN fixture richness does not alter authorization or inquiry ownership

Scenario: Fixture copy is projected to a public showroom
  GIVEN the fixture remains marked as fictional in its internal project record
  WHEN the setup adapter builds its published content blocks
  THEN public copy contains no seed or provisional-development disclaimer
  AND no unsupported certification, capacity, or verified-business claim is added
```

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Profile completeness and file integrity | unit/fixture | `scripts/test-demo-client-portfolio.ts` |
| Internal provenance and natural public copy | unit/fixture | `scripts/test-demo-client-portfolio.ts` |
| Controlled production-video assignment | unit/fixture | `scripts/test-demo-client-portfolio.ts` |
| Snapshot and palette admission | contract | `scripts/test-showroom-benchmarks.ts` |
| Tenant and inquiry regression | security/integration | `scripts/test-security.ts`, `scripts/test-inquiries.ts` |

## Rollout and rollback

The creative source is consumed only by local fixture setup. A code rollback and
local reset restore the prior disposable portfolio; no database migration is
required.

## Readiness checklist

- [x] Complete profile invariant is explicit
- [x] Failure behavior is explicit
- [x] Existing parser and authorization boundaries are retained
- [x] Fixture-only persistence boundary is explicit

## Evidence

Evidence: `scripts/test-demo-client-portfolio.ts` passed on 2026-08-11 for the
66-showroom, 264-offering portfolio and its controlled production-video mapping.

The original 58-showroom admission passed on 2026-08-02. The current expanded
contract contains 66 admitted client-specific manifests, exactly four offerings
per showroom, 264 managed offering references, independent logo/hero/booth
paths, nine growing-factory profiles, and complete custom palettes. Current
verification is recorded in traceability.
