---
id: FE-023
title: Complete demo showroom portfolio
status: done
related: [FE-014, FE-022, BE-013, BE-022, DEP-011, DEP-019]
owners: [product, frontend, design]
last_updated: 2026-08-02
change_level: L2
---

# FE-023 - Complete demo showroom portfolio

## Problem and outcome

The disposable local portfolio proves marketplace scale, but 48 of its 58
showrooms still look like repeated test records: they share broad copy, media,
component profiles, and three generic offerings. A team member therefore cannot
use the reset environment as a credible example of the intended customer-to-
designer workflow.

The outcome is a complete fictional portfolio in which every active showroom is
traceable to an authored customer brief and an advised art direction. Every
showroom has a recognizable logo, a corrected accessible palette, a deliberate
component composition, a business-specific hero, exactly four photographed or
illustrated offerings, a coordinated booth, and motion that honors reduced-motion
preferences.

## Scope

### In scope

- One durable project brief and art-direction record for every disposable client.
- Designer advice when a fictional requested palette is low-contrast, visually
  monotonous, or unsuitable for the supplied media.
- Business-specific logos, hero media, four offering records with media, and a
  coordinated marketplace booth.
- Independent component and palette choices based on content anatomy, buyer
  decisions, media character, and brand direction rather than an industry label.
- Published local fixtures and desktop/mobile visual admission for every client.

### Non-goals

- Production customer migration, automated logo generation for real clients,
  arbitrary components, tenant CSS, checkout, or verified factual claims.
- Replacing human design review with an automatic score.
- Requiring real businesses to provide exactly four offerings.

## Contracts

- The fixture portfolio contains exactly 58 active fictional showrooms and
  exactly four published offerings per showroom after reset.
- Every fixture references a non-empty logo, hero, booth, and four non-empty
  offering images that exist under managed public fixture paths.
- Each showroom recipe remains valid under the current immutable component-bank,
  typed-content, custom-palette, contrast, media-authority, and publication rules.
- Catalog search and filters remain explicit recipe properties; the compact
  Addis Metalworks benchmark retains search to exercise specification lookup.
- Every project brief records the fictional customer's request, customer goal,
  palette advice, final palette, logo idea, visual direction, composition reason,
  media plan, and review state.
- Motion may vary by brief but must use admitted values and retain the existing
  reduced-motion behavior.
- Generated media is demonstration artwork and must not be represented as a
  verified photograph of a real business or product.

## Scenarios

```gherkin
Scenario: Team member inspects a complete fictional client project
  GIVEN the local fixture reset has completed
  WHEN the team member opens a project brief and its published showroom
  THEN the brief explains the customer request and designer decisions
  AND the logo, hero, four offerings, booth, palette, and components agree

Scenario: Fictional customer requests an unsuitable palette
  GIVEN a requested palette is too low contrast or visually repetitive
  WHEN the designer authors the fixture direction
  THEN the brief records the concern and an accessible corrected palette
  AND the published recipe uses the corrected colors

Scenario: Visitor uses a fixture on a small screen
  GIVEN a published fixture has expressive media and motion
  WHEN it is opened at 390 CSS pixels or with reduced motion enabled
  THEN content remains readable without horizontal overflow
  AND motion never blocks browsing, product review, or inquiry
```

## Quality impact

- Fixture generation is deterministic apart from committed reviewed artwork.
- No production or tenant-owned row is modified; the destructive reset remains
  explicitly local and disposable.
- Media files are bounded, locally served, and checked for existence and size.
- Browser evidence covers every portfolio showroom, not only representative
  component samples.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| 58 briefs, complete media, four offerings | fixture/integration | `scripts/test-demo-client-portfolio.ts` |
| Valid distinct recipes and palettes | contract | `scripts/test-showroom-benchmarks.ts`, `scripts/test-demo-client-portfolio.ts` |
| Desktop/mobile presentation | production browser | `scripts/capture-demo-client-portfolio.ts` |
| Existing inquiry, tenant, and recipe behavior | regression/security | `npm run check`, `npm run test:acceptance` |

## Rollout and rollback

DEP-019 rebuilds only the explicitly disposable local database and committed
fixture assets. Rollback is a normal Git revert followed by local reset; there is
no production data rollout.

## Readiness checklist

- [x] Fictional portfolio size and completeness are explicit
- [x] Design decision and media contracts are explicit
- [x] Accessibility, security, and data boundaries are explicit
- [x] Positive and failure evidence is identified
- [x] Production customer data is excluded

## Evidence

Evidence: completed locally on 2026-08-02 against the explicitly disposable database.
Reset and `scripts/test-demo-client-portfolio.ts` proved 58 active fictional
showrooms, 58 briefs/logos/heroes/booths, at least 40 palette signatures, and
232 independent imaged offerings. All 58 showrooms passed 1440px and 390px
browser capture with no broken media, overflow, browser-console, section-order,
or floating-inquiry failures. `npm run check`, all ten acceptance workflows, and
`npm run release` passed. Production customer publication remains excluded.
