---
id: FE-039
title: Plain-language AfricMade pages and task-focused copy
status: done
related: [FE-027, FE-036, FE-037, FE-038, BE-031, DEP-028]
owners: [product, frontend, design, operations]
last_updated: 2026-09-12
change_level: L2
---

# FE-039 - Plain-language AfricMade pages and task-focused copy

## Problem and outcome

AfricMade currently alternates among maker, producer, manufacturer, workshop,
showroom, profile, and page. It also repeats the complete platform story inside
login and setup tasks. Visitors cannot form one simple model of the product, and
business owners must read marketing copy before completing basic account work.

AfricMade leads with the outcome **find locally made and grown products** and
uses **AfricMade page** for the customer-facing destination. Where the audience
must be named, it uses **artisans, farms and growers, workshops, and small
manufacturers**. Precise categories and the participant's own trade identity
explain what each operation does. Each screen states its immediate purpose in
concise language; the fuller market story belongs on About.

## Scope

### In scope

- Public Market, Daily Featured, account entry, business setup, platform
  navigation, discovery inspectors, workspace navigation, project labels, and
  platform-owned metadata.
- **AfricMade page** for the public presentation and **production profile** for
  private account details.
- Plain verbs such as **grow**, **make**, **process**, and **fabricate** when a
  sentence needs to describe the participant set.
- Internal compatibility identifiers may retain `showroom` where renaming them
  would change routes, persistence, analytics, renderer contracts, or rollback.

### Non-goals

- Renaming tenant-authored content, stored handles, component-bank IDs,
  database columns, media keys, or historical analytics values.
- Claiming AfricMade certifies, guarantees, ranks, transacts with, or represents
  a listed business.
- Replacing precise business categories with one new vague marketing noun.

## Domain language and invariants

- **Locally made and grown products** is the concise primary promise.
- **Artisans, farms and growers, workshops, and small manufacturers** is the
  bounded participant set. A participant's page may use a more precise identity
  such as furniture workshop, joinery workshop, farm, weaving studio, food
  processor, or small garment manufacturer.
- **AfricMade page** is the public destination containing approved identity,
  offerings, process or story content, contact options, and inquiry controls.
- **Production profile** is private account and operating information. It is
  not interchangeable with the public AfricMade page.
- **Daily Featured** is the program label. Supporting copy may say featured
  businesses; it does not require “showrooms” in the title.
- A page may describe relevant participant types once when context requires it.
  It does not stack audience lists into eyebrows, headings, body copy, and
  buttons on the same screen.
- Publicly reviewed marketplace category and location remain server-owned. A
  category selected during onboarding is private intake data until staff review.

## Contracts

- Market opens with one literal outcome-oriented heading and one short sentence
  identifying searchable pages for Ethiopian small-scale local production.
  Launch geography belongs in context or filters, not a slogan fragment.
- Account entry says what the user can do after signing in. It does not repeat
  the marketplace narrative or list business types.
- Business setup asks only for owner name, verified email, the name buyers will
  see, what the operation makes or grows, and phone or WhatsApp. Google display name
  is prefilled when safely available and remains editable.
- Business setup creates a private production profile and opens the dashboard. It
  does not automatically create a business-page design request.
- The dashboard presents **Create AfricMade page** as a separate deliberate
  action. Existing design/revision workflows remain authoritative behind that
  label.
- Buttons use direct actions such as **Open page**, **Finish setup**,
  **Create AfricMade page**, **Edit page**, and **View details**.
- Platform-owned active copy does not use “maker” or “producer” as a catch-all
  noun and does not expose “showroom” as the general customer-facing object.
- Internal source identifiers may retain `showroom` but must not leak into
  visible text, accessible names, metadata, or generated customer messages.

## Scenarios

```gherkin
Scenario: Visitor understands the marketplace object
  GIVEN a visitor opens Market
  WHEN the page and one result render
  THEN the interface describes locally made and grown products and their AfricMade pages
  AND category labels explain what each business does
  AND the interface does not require the visitor to interpret “showroom”

Scenario: New owner completes a focused setup
  GIVEN Google supplied a safe display name for an authenticated unlinked user
  WHEN the user opens account setup
  THEN the owner-name field is prefilled and editable
  AND the form asks what the operation makes or grows instead of a design brief
  AND successful setup opens the dashboard without creating a page request

Scenario: Private intake cannot classify a public listing
  GIVEN an owner selects a category during business setup
  WHEN the private production profile is created
  THEN the category is retained as onboarding context
  AND no public industry, map, featured, or publication eligibility is granted
```

## Quality impact

- Security and tenant isolation: unchanged application authorization; private
  onboarding category cannot write public marketplace classification.
- Privacy and data retention: one bounded private category replaces free-form
  setup text; provider metadata is used only as an editable display-name hint.
- Accessibility and responsive behavior: short labels and copy must fit at 320,
  390, and desktop widths with persistent form labels and 44px controls.
- Localization: literal nouns, short sentences, and verb-led actions reduce
  ambiguity and translation cost.
- Performance: no additional client request or public payload.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Current customer-facing terminology | contract | `scripts/test-platform-narrative.mjs` |
| Provider-name prefill and private category | unit/integration | `scripts/test-auth-runtime.ts`, `scripts/test-signup.ts` |
| No automatic page request | integration/PostgreSQL | `scripts/test-signup.ts`, `scripts/test-postgres-runtime.ts` |
| Focused setup and responsive copy | browser/visual | `scripts/capture-platform-form-visuals.mjs`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Apply additive onboarding storage before enabling the new setup command.
Rollback restores the previous application while retaining the harmless private
category row. Internal showroom identifiers remain available throughout.

## Readiness checklist

- [x] Participant and public-object terminology are explicit
- [x] Public and private category authority are separated
- [x] Setup and page-creation workflow boundaries are explicit
- [x] Security, accessibility, localization, and rollback are evaluated
- [x] Tests map visible language and persistence behavior

## Evidence

Evidence:

On 2026-09-12 `npm run check`, `npm run release`, and all 10 ordered
production-browser acceptance workflows passed. The tests prove provider-name
prefill, private category persistence without public classification, focused
authenticated setup, separate page-project creation, current AfricMade page
language, and responsive task copy. Approved desktop, 390px, and 320px form and
public captures show no horizontal overflow.
