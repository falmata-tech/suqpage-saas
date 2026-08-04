---
id: FE-027
title: Maker-first public narrative
status: done
related: [FE-013, FE-021, FE-024, FE-025, FE-028]
owners: [product, frontend, design]
last_updated: 2026-08-04
change_level: L1
---

# FE-027 - Maker-first public narrative

## Problem and outcome

MirtPage's public pages explain digital showrooms and discovery, but they do not
yet tell a coherent story about the people the platform exists to serve. Small
and growing Ethiopian producers invest time, savings, land, tools, skill, and
reputation to make locally while often remaining difficult for nearby consumers
and wholesale buyers to find and evaluate. The public experience must honor that
commitment and explain how MirtPage turns real production into a credible,
discoverable presence without overstating verified business outcomes.

## Scope

### In scope

- One consistent maker-first narrative across the homepage, discovery
  introduction, About page, business signup, login support copy, footer, and
  platform metadata.
- Primary audience language for small and growing Ethiopian makers, growers,
  workshops, processors, and factories that still need practical market access.
- Buyer language covering local discovery, reviewed location, professional
  showrooms, product and production-capability context, and direct consumer or
  wholesale inquiry.
- Concise homepage messaging with the fuller economic and human story on the
  About page and a producer-focused invitation on signup.
- Automated assertions for the narrative's required claims and prohibited
  overclaims.

### Non-goals

- Changing discovery, signup, inquiry, publication, payment, or showroom
  behavior.
- Claiming that every business has verified tax, employment, certification,
  import-substitution, availability, or economic-impact outcomes.
- Targeting importers, general resellers, giant enterprises, or businesses that
  do not need managed discovery.
- Adding MirtPage's platform narrative inside independently branded client
  showrooms.
- Presenting MirtPage as checkout, delivery, financing, certification, or an
  endorsement of listed businesses.

## Domain language and invariants

- **Local producer** means a business that makes, grows, processes, or adds
  material value to a product in Ethiopia.
- **Small and growing** describes the intended market-access audience; it is not
  a legal, revenue, staffing, credit, or quality classification.
- **Professional presence** means a permanent branded showroom with useful
  product, capability, process, location, and inquiry information. It does not
  imply certification or platform ownership of the customer relationship.
- Public copy may state that local production supports skills, jobs, local
  supply, and wider buyer choice as a platform mission. It must not attribute a
  specific unverified impact to every listed business.
- The public homepage remains an application-first marketplace. Narrative copy
  introduces and frames discovery without displacing it with a marketing hero.
- Client showrooms retain their own identity and approved business claims.

## Contracts

- The homepage names the people behind Ethiopian products and immediately
  directs visitors into search, industry, map, list, sponsored, and Expo
  discovery.
- Homepage supporting copy identifies small and growing local producers and
  explains that visitors can search by product or place, inspect a professional
  showroom, and inquire directly for personal or wholesale needs.
- The About page leads with the producer's decision to make locally, names the
  risks and work involved, explains the public-value mission, and then connects
  that story to MirtPage's actual capabilities.
- Signup copy begins from work the producer already does and explains the value
  of a professional showroom without implying automatic publication or sales.
- Login support copy remains task-focused while identifying the workspace as the
  place where producers manage their showroom, inquiries, requests, and support.
- Footer and metadata use the same small-and-growing producer audience and
  discovery/inquiry purpose.
- Copy uses **consumer and wholesale buyers** where both audiences matter,
  **inquiry** instead of order or checkout, and **reviewed location** instead of
  unsupported distance or proximity guarantees.
- Active platform-owned public surfaces do not use giant-enterprise targeting,
  broad importer/reseller language, or unverified phrases such as "every
  business pays taxes" or "guaranteed sales."

## Scenarios

```gherkin
Scenario: Visitor understands who MirtPage is for
  GIVEN the public marketplace is open
  WHEN a visitor reads the welcome and discovery introduction
  THEN small and growing Ethiopian producers are the named focus
  AND the visitor is invited to discover them by product and place
  AND professional showrooms and direct inquiry are clear next steps

Scenario: Producer understands why the platform exists
  GIVEN a local maker, grower, processor, workshop, or growing factory opens About
  WHEN they read the MirtPage story
  THEN their investment and commitment to producing locally are acknowledged
  AND MirtPage's contribution is limited to presentation, discovery, and inquiry

Scenario: Producer begins signup without a false promise
  GIVEN a producer opens business signup
  WHEN they read the signup context
  THEN the page connects their existing work to a professional public presence
  AND it still states that publication follows private design and review

Scenario: Client showroom keeps its independent identity
  GIVEN a visitor opens a published client showroom
  WHEN the showroom renders
  THEN MirtPage's platform mission copy is not injected into client-owned content
  AND only the client's approved identity and claims are presented
```

## Quality impact

- Security and tenant isolation: no authorization or data access changes.
- Privacy and data retention: no new data collection or tracking.
- Accessibility and responsive behavior: revised text must fit existing 320,
  390, and desktop layouts without clipping, overlap, or horizontal overflow.
- Localization and merchant-entered values: English copy uses plain,
  translation-friendly sentences; no merchant-entered content changes.
- Performance and limits: static copy only; no dependency, asset, or runtime
  request changes.
- Failure recovery and idempotency: not applicable to static presentation.

## Observability

No new runtime events or logs. Existing page and inquiry analytics remain
unchanged and must not capture private copy or contact information.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Required audience, mission, capability, and overclaim boundaries | contract | `scripts/test-platform-narrative.mjs` |
| Homepage, discovery, About, signup, and login presentation | browser | `tests/acceptance/app.spec.ts` |
| Narrow-screen fit and overflow | browser/manual | `scripts/capture-platform-form-visuals.mjs`, focused public capture |
| Client identity remains independent | contract/browser | existing showroom identity and acceptance tests |

## Rollout and rollback

No data or deployment migration is required. Rollback restores the preceding
copy and metadata files; all routes, stored data, and showroom content remain
unchanged.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: completed locally on 2026-08-04. `npm run test:narrative` proves the required
producer audience, commitment language, real platform capabilities, overclaim
boundaries, and absence of MirtPage mission slogans in client showroom source.
`npm run check` passed all specification, identity, design-system, recipe,
security, discovery, media, tenant-scope, and revision contracts. Ordered
`npm run test:acceptance` passed 10/10 production-browser workflows, including
the About story, business signup, marketplace, mobile behavior, and independent
client showroom identity.

`npm run test:platform-forms-visual` passed desktop, 390-pixel, and 320-pixel
login/signup captures with no horizontal overflow, visible forms, and touch-size
controls. Focused Chromium captures of the homepage and About page at 1440 and
390 CSS pixels were reviewed without clipped or overlapping narrative text.
