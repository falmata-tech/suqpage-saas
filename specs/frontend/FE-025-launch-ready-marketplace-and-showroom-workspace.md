---
id: FE-025
title: Launch-ready marketplace and showroom workspace
status: done
related: [FE-003, FE-009, FE-017, FE-024, FE-026, FE-027, FE-028, BE-008, BE-010, BE-024, BE-025, DEP-015, DEP-020, DEP-021, ADR-0012]
owners: [product, frontend, design, operations]
last_updated: 2026-08-04
change_level: L3
---

# FE-025 - Launch-ready marketplace and showroom workspace

## Problem and outcome

The pre-launch application has the right public value proposition, but several
important interactions still expose implementation history: marketplace search
requires an unnecessary submit button, Expo and city floors resemble graph
paper, a business process video appears in showroom chrome instead of the
Process chapter, and the focused revision editor can select admitted images but
cannot admit a new one in place. MirtPage needs a clear mobile-first public and
workspace experience that can be demonstrated and operated without misleading
copy or hidden media steps.

## Scope

### In scope

- Debounced public marketplace search that updates without a Search button,
  preserves all active filters, and keeps an explicit clear action.
- Dynamic Expo and city marketplace floors with quiet architectural surfaces,
  legible aisles, and a useful central place without fine graph-paper grids.
- Controlled business process video embedded inside the canonical Process
  section, with a responsive privacy-enhanced player and no duplicate header
  link.
- A generated post-import image checklist that admits each authorized image
  directly into its labeled logo, hero, section, icon, or offering destination.
- High-signal copy and UI corrections across the public landing page,
  administrator workspace, client workspace, and media authoring surfaces.
- Bounded server-paginated primary collections and compact, collapsible
  secondary history on narrow screens so one record cannot create an
  unbounded dashboard page.
- An accessible sponsored-showroom rail that advances paid placements
  automatically, loops through the complete bounded set, pauses for visitor
  interaction, and respects reduced-motion preferences.
- Separate copy/download actions for the AI design brief and the exact current
  showroom recipe. Change work starts from the latest private draft snapshot,
  including approved manual content and admitted-media changes.
- Relevant, curated process-reference videos for fictional demonstration
  showrooms, selected by production process rather than one generic fixture.
- One coherent staff production sequence: start from the initial/change brief,
  import the complete design, complete its generated content/media work, edit
  showroom settings/layout/page content/offerings, preview, and request approval.
- A calm four-area draft editor with compatible component switching, all custom
  palette roles, section surfaces, admitted media treatments, and supported
  motion controls without exposing one uninterrupted recovery form.
- Browser review of public, administrator, client, revision, showroom, city,
  Expo, and narrow-phone workflows.
- One short and one longer MirtPage demonstration video using reviewed demo data
  and clearly provisional/generic media.

### Non-goals

- New marketplace business rules, checkout, automatic payment enforcement,
  arbitrary showroom code, a new video provider, or a general dashboard rewrite.
- Presenting generic demonstration video or generated imagery as factual evidence
  of a real business's process, product, certification, or capacity.

## Domain language and invariants

- **Process video** is one controlled provider reference owned by a business and
  presented as supporting media in its Process chapter.
- **Admitted image** is a verified, sanitized request-scoped asset assigned to a
  labeled private-draft destination; upload alone never publishes it.
- Search remains URL-addressable. A debounced update changes the same query state
  a submitted form would have changed, so links, back/forward navigation, list
  pagination, and server-side filtering remain authoritative.
- Floor geometry grows from the number of visible showrooms. Surface styling may
  decorate that geometry but cannot encode or replace business placement data.

## Contracts

- Search starts after 350-500 milliseconds of inactivity when the value is empty
  or contains at least two non-space characters. Stale timers are cancelled.
- Search URL replacement preserves industry, production scale, map/list mode,
  and Expo day, does not force page scrolling, and resets result pagination.
- Expo and city floors contain no repeating fine square grid. Their venue edge,
  primary circulation, central identity, booth/shop contrast, pan, zoom, fit,
  reduced-motion behavior, and dynamic layout remain visible at 320, 390, and
  1440 CSS pixels.
- Process media is lazy-loaded, titled, keyboard reachable, responsive, and
  rendered only from the existing normalized YouTube reference through the
  privacy-enhanced host. Missing or invalid references leave a deliberate
  text/process layout rather than an empty frame.
- Header chrome may show live status but never a duplicate process-video action.
- Post-import image completion reuses request/revision authorization, image
  signature validation, sanitization, size/pixel limits, rights acknowledgement,
  and opaque storage keys. Success returns to the same checklist with the exact
  destination complete; failure exposes a bounded actionable message.
- Workspace language describes user outcomes and authority clearly. Internal
  architecture terms appear only where an operator actually needs them. Public
  and client-facing screens use concise professional language rather than
  development vocabulary such as recipe, blueprint, tenant, adapter, candidate,
  or media admission.
- Primary workspace collections return at most ten records per page and public
  discovery returns at most five. Detail histories use a bounded initial view
  or a contained scroll region and do not expand the whole mobile document by
  hundreds of records.
- The sponsored rail advances one card at a time after a bounded interval and
  wraps to the first card. Pointer, touch, keyboard focus, document visibility,
  a visitor pause control, and `prefers-reduced-motion` suspend automatic
  motion without hiding manual horizontal navigation.
- The showroom studio labels initial-showroom and showroom-change briefs in
  user language. It separately exposes an importable full current recipe whose
  base version, content, design, and media references match the latest
  authorized private snapshot; it never reconstructs state from stale form
  inputs or a generic example.
- Demonstration process references use reviewed YouTube IDs relevant to the
  business's production family. They are supporting examples, not evidence that
  a fictional or future real client owns the footage or follows that exact
  process.
- Generic pre-design image admission is not part of the normal flow. The AI
  declares labeled logo, hero, section, and offering image destinations in its
  recipe media plan; import creates the post-design checklist and each upload is
  assigned directly to its intended private-draft destination.
- The seven canonical section roles remain fixed. AI may name and write each
  typed content block and choose a compatible component, surface, media
  treatment, and supported motion setting, but cannot invent an unrenderable
  section role or assign one block more than once.
- The post-import editor is divided into Showroom settings, Layout and style,
  Page content, and Offerings. Repeated sections and offerings are collapsed or
  paged inside the editor so mobile users do not scroll through the full draft
  merely to change one field.
- Product images and videos remain part of the initial private draft when needed
  for first publication. After publication, routine product media and facts use
  the existing My offerings workflow; structural category or page changes stay
  in a revision.

## Scenarios

```gherkin
Scenario: Visitor searches as they type
  GIVEN an industry, production scale, and Expo day are selected
  WHEN the visitor pauses after entering a search phrase
  THEN matching server results replace the current marketplace state without a Search button
  AND industry, scale, view, and Expo day remain selected

Scenario: Visitor watches how a business works
  GIVEN a showroom has a valid controlled process video
  WHEN the canonical Process section renders
  THEN the video is presented inside that section beside its process content
  AND the showroom header contains no process-video link

Scenario: Staff adds missing revision imagery
  GIVEN authorized staff are correcting a private draft
  WHEN they upload a valid image into a labeled checklist destination
  THEN the private draft reloads with that image assigned to its exact owner
  AND the live showroom remains unchanged

Scenario: A venue contains many showrooms on a phone
  GIVEN a dynamic Expo or city marketplace floor
  WHEN it renders at 320 or 390 CSS pixels
  THEN its floor reads as an architectural venue rather than graph paper
  AND pan, zoom, fit, booth activation, close, and native page scrolling remain usable

Scenario: Visitor encounters sponsored placements on a phone
  GIVEN several active paid placements match the selected industry
  WHEN the visitor leaves the sponsored rail idle
  THEN each placement advances into view in a bounded loop
  AND touch, focus, pause, or reduced-motion preference prevents unwanted movement

Scenario: Staff asks AI to revise an existing showroom
  GIVEN authorized staff have made content and media corrections after an earlier AI import
  WHEN they open the showroom studio
  THEN they can copy or download a change brief and the exact current full recipe separately
  AND the current recipe validates against the same import contract and base content version

Scenario: Operator opens a collection-heavy workspace on a phone
  GIVEN more than one page of authorized records and a long record history
  WHEN the workspace renders at 320 or 390 CSS pixels
  THEN primary results are server paginated
  AND secondary history remains contained without hiding the record's primary action

Scenario: Staff completes an AI-designed showroom
  GIVEN the AI brief requested a logo, hero image, section image, and offering image
  WHEN staff import the complete recipe
  THEN one labeled post-import checklist exposes each declared destination
  AND staff can upload directly to each destination without a generic reference-image step

Scenario: Staff corrects one part of an imported design
  GIVEN a valid private draft contains the canonical showroom roles
  WHEN staff open Showroom settings, Layout and style, Page content, or Offerings
  THEN only that focused work area is expanded
  AND compatible component, palette, surface, media-treatment, motion, and content changes save into the same private snapshot
```

## Quality impact

- Security and tenant isolation: existing revision/request authorization remains
  mandatory for upload and private reads.
- Privacy and data retention: no new personal data; demo videos use fictional
  fixture data and contain no credentials.
- Accessibility and responsive behavior: 44px controls, focus-visible states,
  semantic dialog/player titles, reduced motion, no narrow-screen overflow.
- Localization and merchant-entered values: bounded text remains escaped and no
  generic media is described as a verified merchant fact.
- Performance and limits: search is debounced, video is lazy, floor effects use
  bounded CSS, and no runtime animation dependency is added.
- Failure recovery and idempotency: URL search remains replayable; image
  admission uses immutable keys and does not mutate a draft until explicitly
  selected and saved.

## Observability

Record safe route, search-length bucket, media provider, action category, result,
and bounded timing only. Never log query text, image bytes, provider secrets,
private asset keys, client content, or video recordings.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Instant search state and debounce | browser/integration | `tests/acceptance/app.spec.ts`, `scripts/test-discovery.ts` |
| Process video location and CSP | contract/browser | `scripts/test-showroom-renderer.ts`, `tests/acceptance/app.spec.ts` |
| Authorized focused image admission | integration/security | `scripts/test-showroom-recipe.ts`, `scripts/test-security.ts` |
| Architectural responsive floors | browser/manual | `scripts/capture-discovery-visuals.mjs` |
| Workspace copy and responsive audit | browser/manual | platform and dashboard capture scripts |
| Bounded collections and mobile navigation | integration/browser | `scripts/test-pagination.ts`, `scripts/test-scalable-queries.ts`, `tests/acceptance/app.spec.ts` |
| Sponsored automatic rotation and pause behavior | unit/browser | `scripts/test-discovery.ts`, `tests/acceptance/app.spec.ts` |
| Current recipe plus initial/change brief workflow | contract/integration | `scripts/test-showroom-recipe.ts`, `scripts/test-revisions.ts` |
| Relevant demo process-video mapping | contract/browser | `scripts/test-demo-client-portfolio.ts`, `scripts/test-showroom-renderer.ts` |
| Unified post-import editing workflow | integration/browser | `scripts/test-showroom-recipe.ts`, `scripts/test-revisions.ts`, `tests/acceptance/app.spec.ts` |
| Demo video artifacts | operations/manual | `scripts/capture-demo-videos.mjs`, generated artifact inspection |

## Rollout and rollback

DEP-021 admits these changes without resetting the existing demo database.
Rollback restores the prior UI and renderer while preserving additive admitted
assets and stable media references.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related layers and ADR linked
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: completed locally on 2026-08-02. `npm run check` passed the complete contract,
security, pagination, media, recipe, revision, support, and 66-showroom fixture
suite. Ordered `npm run test:acceptance` passed 10/10 production-browser
workflows, including sponsored rotation, timed Expo return, 320/390-pixel
behavior, process-video CSP, role isolation, post-import staff creation of an
offering, current-design export, client approval, and publication.

`scripts/capture-demo-videos.mjs` produced reviewed 1280x720 H.264/AAC public
and platform walkthroughs of 55 and 110 seconds from fictional data. `npm run
release` and `npm run test:container` passed. DEP-021 retains production
configuration, optional Supabase copy verification, publication, and remote CI
as separate rollout evidence.
