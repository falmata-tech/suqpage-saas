---
id: FE-027
title: Maker-first public narrative
status: in_progress
related: [FE-013, FE-021, FE-024, FE-025, FE-028, FE-030, FE-036]
owners: [product, frontend, design]
last_updated: 2026-08-09
change_level: L1
---

# FE-027 - Maker-first public narrative

## Problem and outcome

MirtPage's public pages explain digital showrooms and discovery, but they do not
yet give buyers one clear model for the different offers found across Ethiopian
production. A workshop may make doors, windows, furniture, equipment, or other
work to specification. A producer may sell finished goods that a household can
buy or a retailer can stock. A manufacturer may need recurring wholesale and
distribution relationships. MirtPage must unite these as three understandable
buying paths—custom work, ready products, and wholesale supply—without implying
that every business supports every path or claiming guaranteed outcomes.

## Scope

### In scope

- One consistent production-to-market narrative across the homepage, discovery
  introduction, About page, business signup, login support copy, footer, and
  platform metadata.
- Primary audience language for small and growing Ethiopian makers, growers,
  workshops, processors, and factories that still need practical market access.
- Buyer language covering national and local sourcing, reviewed location,
  professional showrooms, product and production-capability context, and direct
  consumer, retail, distribution, or wholesale inquiry.
- Customer-facing copy calls showrooms **online showrooms** and explains their
  utility: discovering workshops, growers, producers, and manufacturers that a
  visitor may not already know nearby or elsewhere in Ethiopia; understanding
  what they make, their skills and capabilities, and available supply context;
  and starting a direct inquiry. It does not assume every visitor understands
  the platform from the word "showroom" alone.
- One controlled three-offer vocabulary: **custom work**, **ready products**,
  and **wholesale supply**. These terms clarify marketplace capabilities in
  supporting copy and functional labels; they are not repeated as slogans or
  used as a substitute for a clear customer outcome. Growers and processors fit
  ready-product or wholesale-supply offers according to their approved content.
- Concise homepage messaging with the fuller Ethiopian supply-chain story on
  the About page and a producer-focused invitation on signup.
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
- Public copy may state that connecting Ethiopian production to households,
  retailers, distributors, and wholesale buyers can strengthen local supply,
  widen buyer choice, and keep more trade activity within Ethiopian businesses.
  It must not attribute a specific unverified impact to every listing.
- MirtPage connects participants and forwards inquiries. It does not set,
  compare, guarantee, or process prices, transactions, delivery, or quality.
- **Custom work** means made-to-order work based on the buyer's measurements,
  specification, configuration, or brief. **Ready products** are finished goods
  presented for direct or retail inquiry. **Wholesale supply** covers repeat or
  bulk supply for retailers, wholesalers, distributors, and organizations.
- A showroom may support one, two, or all three paths. Platform copy describes
  the marketplace as a whole and never assigns an unsupported mode to a listing.
- The public homepage remains an application-first marketplace. Narrative copy
  introduces and frames discovery without displacing it with a marketing hero.
- Client showrooms retain their own identity and approved business claims.

## Contracts

- The homepage presents one Ethiopian production market and immediately directs
  visitors into search, industry, map, list, sponsored, and Daily Featured
  Showrooms discovery.
- The homepage headline promises direct discovery of the people and businesses
  that make what a visitor needs. Supporting copy immediately identifies the
  destination as online showrooms, explains local and country-wide discovery,
  and connects business skills, products, customization, supply, and direct
  contact. Functional benefit labels retain custom, ready-product, and wholesale
  distinctions where useful. Supporting copy makes clear that households can
  find products or skilled custom work and that retailers, distributors,
  organizations, and wholesale buyers can source for their own markets from
  anywhere in Ethiopia.
- The About page explains the broken connection between production and demand,
  shows how a product can move from producer to household, retailer,
  distributor, or wholesale buyer, and then connects that story to MirtPage's
  actual showroom, map, search, and inquiry capabilities.
- About-page steps describe observable buyer actions: search for the need,
  compare what businesses can deliver, understand the producer, and start a
  direct conversation. They do not frame internal offer taxonomy as a vague
  instruction to "choose a path."
- Signup copy asks whether the business takes custom orders, sells ready
  products, supplies in bulk, or seeks distributors, and explains the value of
  one professional showroom without implying automatic publication or sales.
- Login support copy remains task-focused while identifying the workspace as the
  place where producers manage their showroom, inquiries, requests, and support.
- Footer and metadata use the same production-to-market audience and direct
  connection purpose.
- Copy uses **households, retailers, distributors, organizations, and wholesale
  buyers** where the wider trade chain matters, **connect** or **inquiry** instead
  of platform checkout, and **reviewed location** instead of unsupported
  distance or proximity guarantees.
- Public copy may describe avoiding unnecessary import and intermediary layers,
  but it must not promise a lower price or a specific logistics saving.
- Active platform-owned public surfaces do not use giant-enterprise targeting,
  broad importer/reseller language, or unverified phrases such as "every
  business pays taxes" or "guaranteed sales."

## Scenarios

```gherkin
Scenario: Visitor understands the trade MirtPage enables
  GIVEN the public marketplace is open
  WHEN a visitor reads the welcome and discovery introduction
  THEN the destination is identified as online showrooms for Ethiopian production
  AND custom work, ready products, and wholesale supply are available as useful distinctions
  AND Ethiopian producers and the buyers at the next step in their market are named
  AND visiting a showroom and making direct contact are clear next steps

Scenario: Platform language does not overstate one business's offer
  GIVEN a listed business may support only one buying path
  WHEN MirtPage describes the overall marketplace
  THEN it presents the three paths as choices available across the platform
  AND it does not claim that every listing accepts custom, retail, and wholesale orders

Scenario: Producer understands how MirtPage connects the market
  GIVEN a local maker, grower, processor, workshop, or growing factory opens About
  WHEN they read the MirtPage story
  THEN the page explains the path from production to households and trade buyers
  AND MirtPage's contribution is limited to presentation, discovery, and inquiry

Scenario: Public copy does not guarantee transaction economics
  GIVEN MirtPage does not set product prices or operate delivery
  WHEN a visitor reads about buying closer to the source
  THEN the copy does not promise a better price, savings amount, quality, or delivery outcome
  AND it may explain the value of reducing unnecessary market layers as a platform purpose

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

Reopened narrative evidence on 2026-08-09: `npm run test:narrative`,
`npm run test:homepage`, `npm run typecheck`, and `npm run validate:specs`
pass after identifying the customer-facing product as online showrooms and
replacing vague buying-path slogans with direct discovery, capability, and
contact outcomes. Focused Chromium captures at 1440, 390, and 320 CSS pixels
show the complete homepage explanation and About buyer journey with zero
horizontal overflow. Full release gates remain pending visual approval.
