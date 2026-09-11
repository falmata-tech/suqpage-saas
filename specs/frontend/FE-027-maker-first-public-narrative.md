---
id: FE-027
title: Small-scale local production public narrative
status: done
related: [FE-013, FE-021, FE-024, FE-025, FE-028, FE-030, FE-036, FE-038, FE-039]
owners: [product, frontend, design]
last_updated: 2026-09-12
change_level: L1
---

# FE-027 - Small-scale local production public narrative

## Problem and outcome

AfricMade must explain one useful connection without turning every screen into a
manifesto. Small-scale local production is often difficult to discover even
when the right product, craft, or workshop is nearby. Buyers need a practical
way to find what is made or grown, understand the work and available capacity,
and contact the source. The launch catalog starts in Ethiopia and is useful
first within a locality, region, and country; wider African discovery follows.

The Market states that outcome plainly. About carries the fuller story. Login,
business setup, support, and workspace screens describe only the task at hand.

## Scope

### In scope

- One consistent production-to-market narrative across Market, About, account
  entry, business setup, sourcing support, metadata, and platform navigation.
- **Locally made and grown products** as the concise primary promise.
- **Artisans, farms and growers, workshops, and small manufacturers** as the
  participant set when the people or operations must be named. The interface
  does not force one vague umbrella noun onto every participant.
- Seven stable public categories with literal contents: **Electronics &
  electrical**, **Personal care & household**, **Farms, livestock & feed**,
  **Food & drink**, **Tools, machinery & metalwork**, **Furniture, art &
  building**, and **Clothing, textiles & leather**. Internal keys may remain
  stable for URL and database compatibility.
- Buyers looking for finished products, made-to-order work, or repeat and bulk
  supply without claiming every participant supports every need.
- Household and individual buyers are the primary public audience. Traders and
  retailers can also discover repeat supply where a listed operation offers it;
  the interface does not recast every participant as a wholesale supplier.
- Direct contact and optional AfricMade help with transport arrangements or a
  report about a listed operation.
- Exact, concise copy assertions and prohibited overclaims.

### Non-goals

- Changing inquiry, publication, payment, location-review, or page-rendering
  behavior.
- Presenting AfricMade as checkout, delivery, financing, certification,
  endorsement, quality guarantee, or commercial representative.
- Listing import-only sellers, repair-only services, or large industrial
  manufacturers in the launch/demo catalog.
- Claiming every listed participant is tax-compliant, job-creating, export-ready,
  available, or suitable for a particular order.
- Injecting platform mission copy into independently branded participant pages.

## Domain language and invariants

- **Artisan** means a skilled person or small studio producing physical goods
  through a craft or trade. It is not a catch-all label for every participant.
- **Workshop** means a small production operation making, assembling, processing,
  or fabricating goods, including joinery, furniture, metalwork, garment,
  equipment, and food-processing work.
- **Small manufacturer** means a small operation producing repeatable physical
  goods or components. Furniture and tables are furniture manufacturing;
  wooden doors and windows are joinery manufacturing; metal or aluminum doors
  and windows are fabrication. Public labels should still use the operation's
  natural identity, such as **furniture workshop** or **aluminum workshop**.
- **Farm or grower** covers agricultural production that sells a grown output.
- **Artist** or **art studio** covers original physical work offered for sale or
  commission, including painting, sculpture, carving, wall pieces, and interior
  artwork. It does not turn unrelated trade workshops into artists.
- **AfricMade page** is the public destination for approved identity, offerings,
  process or story content, location context, and direct inquiry.
- **Custom work**, **ready products**, and **wholesale supply** are optional
  capability labels, not a slogan and not a mandatory onboarding questionnaire.
- Consumer sales are the ordinary starting point. Retail or trader supply is an
  opportunity shown only by relevant products or capabilities, not a platform
  promise or a label applied to every business.
- AfricMade connects buyers and listed participants. It does not set prices,
  process transactions, operate delivery, or guarantee quality or output.
- AfricMade does not inspect, certify, endorse, negotiate for, or guarantee a
  listed participant. Public support may help arrange transport or receive a
  report about a listing; commercial terms remain between buyer and seller.
- Reviewed exact-location claims remain limited to the supported launch catalog.
  Copy must not imply continent-wide listing coverage before it exists.

## Content design contracts

- Every screen has one communication job. Eyebrow, heading, body, and button do
  not repeat the same statement in different words.
- Market uses one literal heading and one short sentence before discovery. It
  does not use slogan fragments, unsupported rankings, audience piles, or a
  second search explanation.
- Search controls use literal task language such as **Products** and
  **Businesses**. Result copy identifies what matched and where it comes from;
  it does not repeat the platform mission or internal audience strategy.
- About is the concise vision story, not a feature checklist or policy summary.
  It explains that valuable local production already exists, discovery should
  not depend on word of mouth, and stronger local demand can create a path from
  Ethiopia toward wider African market connections. It may describe the map,
  AfricMade pages, and direct relationships as one coherent idea, but it does
  not enumerate support categories, commercial caveats, or internal workflows.
- Account entry explains access. Business setup explains profile creation.
  Neither recites the whole market strategy, offer taxonomy, design workflow, or
  publication lifecycle.
- Public support offers only help using AfricMade, transport-arrangement help, and
  reporting a concern about a listed operation. It does not suggest inspection,
  certification, negotiation, production monitoring, or delivery operation.
- Copy uses short, translation-friendly sentences and concrete nouns. It leads
  with the useful outcome and names the participant set only where needed.
- **Business** remains valid where the subject is legally or operationally an
  account, profile, or company. It is not the Market's value proposition.

## Scenarios

```gherkin
Scenario: Visitor understands the Market
  GIVEN the public Market is open
  WHEN a visitor reads its introduction
  THEN the visitor understands that AfricMade lists locally made and grown products
  AND the visitor can search pages from artisans, farms, workshops, and small manufacturers
  AND the visitor can contact them directly
  AND no certification, guaranteed quality, or continent-wide coverage is implied

Scenario: Participant understands that scale is not an exclusion
  GIVEN a qualifying participant is an artisan, farm, workshop, or small manufacturer
  WHEN they read About
  THEN the language includes their production scale without infantilizing it
  AND it uses the participant's natural trade or operation label

Scenario: Task page remains focused
  GIVEN a user is signing in or completing a private production profile
  WHEN the task page renders
  THEN it describes only the immediate action and next destination
  AND it does not repeat the full platform narrative or offer taxonomy

Scenario: Visitor asks for bounded platform help
  GIVEN a buyer may contact a listed participant directly
  WHEN the buyer opens public support
  THEN the buyer can ask how to use AfricMade, request help arranging transport, or report a listing
  AND AfricMade does not claim inspection, certification, negotiation, or delivery responsibility

Scenario: Demo catalog reflects the target market
  GIVEN fictional launch businesses are prepared for public demonstration
  WHEN the demo catalog is reviewed
  THEN every business makes, grows, processes, or fabricates physical goods at small scale
  AND import-only sellers, repair-only services, and large industrial manufacturers are absent

Scenario: Visitor can recognize physical art and local agricultural inputs
  GIVEN the Market category chooser is open
  WHEN a visitor reviews the available categories and icons
  THEN artists and art studios have an obvious home under Furniture, art & building
  AND small animal-feed makers have an obvious home under Farms, livestock & feed
  AND each category uses a distinct icon and plain label
```

## Quality impact

- Security and tenant isolation: no authorization or query change.
- Privacy and data retention: no new public data collection.
- Accessibility and responsive behavior: copy must fit at 320, 390, and desktop
  widths without clipping, overlap, or horizontal overflow.
- Localization: literal language, short sentences, and stable terms reduce
  ambiguity and translation cost.
- Performance: static copy only.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Required narrative and overclaim boundaries | contract | `scripts/test-platform-narrative.mjs` |
| Market, About, auth, setup, and support presentation | browser | `tests/acceptance/app.spec.ts` |
| Narrow-screen fit | browser/manual | `scripts/capture-platform-form-visuals.mjs`, focused public capture |
| Participant page retains independent identity | integration/browser | existing renderer and identity tests |

## Rollout and rollback

No data migration is required for copy. Rollback restores prior platform copy;
participant-authored content and internal renderer identifiers remain unchanged.

## Readiness checklist

- [x] Audience, purpose, launch geography, and non-goals are explicit
- [x] Screen-level content responsibilities are explicit
- [x] Overclaim and sourcing-support boundaries are explicit
- [x] Accessibility, localization, and rollback are evaluated
- [x] Automated and visual evidence is planned

## Evidence

Evidence:

The 2026-09-12 revision passes `npm run check`, `npm run release`, and all 10
ordered production-browser acceptance workflows. Contract coverage proves
the consumer-first locally made and grown promise, optional trader and retailer
opportunities, bounded support language, and exclusion of repair-only and
mass-industrial demo participants. The approved 1440, 390, and 320 CSS-pixel
Search captures under `/tmp/africmade-search-review` show concise copy without
clipping or horizontal overflow.
