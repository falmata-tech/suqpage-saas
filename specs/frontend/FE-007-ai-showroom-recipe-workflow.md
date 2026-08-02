---
id: FE-007
title: AI showroom recipe import and focused staff studio
status: ready
related: [FE-003, FE-006, FE-008, FE-009, FE-014, FE-016, BE-008, BE-009, BE-010, BE-013, DEP-007, DEP-009, DEP-011, ADR-0005, ADR-0006, ADR-0007]
owners: [product, frontend, design]
last_updated: 2026-07-27
change_level: L3
---

# FE-007 — AI showroom recipe import and focused staff studio

## Problem and outcome

Staff currently prepare a revision through a large structured form while its
showroom composition is read-only. That repeats the work an external AI can do
from the client's request, supplied facts, private asset references, current
showroom snapshot, component bank, schemas, and complete examples.

The primary staff workflow must become one complete showroom recipe: export a
sanitized brief, discuss the desired result with the team's external AI, import
its bounded JSON, resolve validation exceptions, inspect the exact private
preview, and send that revision to the client. Routine staff must not manually
enter every collection, category, product, hero field, story block, or design
choice.

## Scope

### In scope

- An assigned-staff recipe workspace inside a managed request/revision.
- Export/copy of a versioned sanitized brief containing the authoritative
  content schema, design schema, recipe envelope schema, current component-bank
  contract, allowed asset references, source facts, expected counts, and
  one clearly labeled client-independent synthetic structural example.
- Paste or JSON-file import of one recipe containing separately versioned
  content and design documents.
- Manual media intake before brief export: request attachments, same-tenant
  existing media, new verified image uploads, and allowlisted provider links
  such as YouTube become labeled opaque asset keys.
- A validation report grouped into content, design, cross-document, optional
  provenance-reference, and tenant/asset errors.
- A candidate private preview using the client's imported dynamic content and
  exact component combination before any revision is submitted.
- Focused staff controls for approved component, foundation, custom palette,
  section surface, motion, decoration, and content-block associations after a
  valid import.
- Re-import as the default correction path for catalog/content errors; the
  current field-heavy editor becomes a clearly labeled administrative recovery
  tool rather than routine production workflow.
- Structured count/difference summaries for collections, categories, products,
  content blocks, media assignments, and design sections.

### Non-goals

- Client access to the studio, public self-service generation, direct provider
  integration, arbitrary code/CSS/HTML, or automatic publication.
- Automatically publishing AI-created facts without staff/client review.
- Uploading private image bytes to an external provider from MirtPage.
- AI-created image URLs, arbitrary remote-image hotlinks, raw iframe/embed HTML,
  or unrestricted video providers.
- Removing client approval, stale-version checks, manager publication, or
  retained rollback.

## Domain language and invariants

- A **content proposal** contains business identity/presentation, typed section
  content, collections, categories, products, options, availability, and
  allowed media-reference keys. It contains no inventory count.
- A **design proposal** contains the exact bank release, admitted non-color
  foundation, optional contrast-safe custom palette, reviewed sections, bounded
  properties, motion/decorative settings, and bindings.
- A **showroom recipe** is a versioned envelope pairing one content proposal
  with one design proposal plus optional provenance and advisory questions,
  warnings, and rationale. The two documents remain separately inspectable and
  valid.
- A **focused correction** changes only a reviewed bounded choice. It never
  exposes raw CSS, markup, code, database IDs, or unrestricted style values.
- A **media asset** is a manually admitted image or provider link with an opaque
  key, kind, label, source/provenance, usage-rights acknowledgement, and safe
  rendering metadata. AI can assign its key but cannot create the asset.
- A **media slot** is a component-declared requirement such as one hero image,
  an optional story image, a gallery of bounded images, or one supported video.
- Imported data is a private candidate until server validation, staff review,
  client approval, and authorized publication all complete.

## Contracts

- The brief shows schema/bank versions, export time, request reference, base
  content version, allowed opaque asset keys, and counts. It excludes
  credentials, database IDs, storage paths, unrelated tenants, customer
  inquiries, and invitation/session data.
- The brief shows one compact named contract manifest before the schemas. It
  explains that `recipe@1`, `content@1`, `content-blocks@1`, `design@2`,
  component-bank schema `@2`, design-systems `@2`, and the separately versioned
  bank release are compatible nested contracts rather than competing choices.
- The complete example is synthetic, client-independent, and structural-only.
  It demonstrates relationships, options, typed blocks, exact block assignment,
  optional empty provenance, and unresolved media planning without copying the
  active client's facts, counts, opaque keys, or design choices. The AI may
  write provisional content for the private candidate.
- For a first showroom, the AI returns a complete desired content proposal. For
  a change request, the brief includes the authorized current snapshot and the
  AI returns a complete replacement proposal, not an ambiguous patch.
- The portable/current product contract is availability-only. Recipe examples,
  forms, diffs, and returned JSON contain no product or option stock count;
  requested inquiry quantity remains separate customer intent.
- Product, collection, category, option, and section-content lists are dynamic
  within backend limits; the UI never assumes a fixed item count.
- Before export, staff can label and review admitted media. Verified image files
  show dimensions/aspect ratio and a thumbnail; supported provider links show
  their normalized provider/type and title. The UI never accepts embed code.
- The brief's media manifest contains opaque keys and safe descriptors. If the
  external AI needs visual understanding, staff manually supplies the same
  approved images in that separate conversation; MirtPage does not transmit them.
- The design bank and focused studio display each component's required/optional
  media slots, accepted media kinds, count, and aspect-ratio guidance.
- Content blocks assign admitted asset keys to named media slots. Required slots
  block a valid candidate when empty or incompatible; optional slots may remain
  empty without placeholders.
- Initial external-link support is a manually entered YouTube URL normalized by
  the server into a controlled video asset. Preview uses a reviewed video
  component, never recipe-provided iframe markup or query parameters.
- Staff review descriptive alt text, captions, video titles, and usage rights
  before client review. AI may draft descriptive text, but it remains labeled
  until staff accepts it.
- The content schema supports typed hero, story, highlight/trust, information,
  and call-to-action blocks in addition to business metadata and catalog data.
- The UI never silently repairs, drops, or invents imported entries. Errors
  identify a safe JSON path and expected rule; warnings/questions remain visible
  until staff explicitly resolves or accepts them.
- A valid import shows an exact private preview and count/diff review before a
  draft can be saved. Saving cannot submit, approve, or publish it.
- The normal workflow offers one-click copy/download for the brief and
  paste/upload for the returned recipe. The full JSON and recovery editor are
  permission-gated and visually secondary.
- All workspace states are keyboard usable, mobile safe, and deep-linked with a
  breadcrumb and deterministic Back destination.

## Scenarios

```gherkin
Scenario: Staff imports a complete new-showroom recipe
  GIVEN an assigned team member exported the request's sanitized brief
  WHEN they import valid AI JSON with dynamic catalog content, typed page copy,
  allowed media keys, and an approved design combination
  THEN MirtPage shows the exact candidate preview and structured count/difference report
  AND no collection, item, hero, story, or design form must be entered manually

Scenario: Staff imports a complete change recipe
  GIVEN a live showroom and a request based on its current content version
  WHEN the AI returns a full desired snapshot preserving retained stable keys
  THEN additions, removals, content changes, and design changes are explicit
  AND the existing public showroom remains unchanged

Scenario: Staff exports a client-independent structural example
  GIVEN recipe briefs are exported for unrelated clients
  WHEN the complete example is inspected
  THEN every brief contains the same explicitly synthetic reference business
  AND it demonstrates difficult nested recipe structures
  AND no active client fact, opaque key, source key, count, or design choice is copied into it

Scenario: Imported recipe needs correction
  GIVEN a recipe has an invalid product relationship, unsupported component, malformed supplied provenance, or unknown asset key
  WHEN staff imports it
  THEN the report identifies the content, design, cross-document, or provenance failure
  AND no draft candidate is persisted or silently repaired

Scenario: Staff uses a focused design exception
  GIVEN a valid candidate preview
  WHEN assigned staff replace one section or bounded experience setting
  THEN only compatible bank choices are offered
  AND the resulting content/design pair is revalidated before preview

Scenario: Staff assigns manually admitted media
  GIVEN staff uploaded verified images and added a supported YouTube link before exporting the brief
  WHEN the AI recipe assigns their opaque keys to compatible hero, story, gallery, or video slots
  THEN the exact media appears in the private candidate preview
  AND staff did not paste file paths, iframe HTML, or remote image URLs into the recipe

Scenario: Required section media is missing
  GIVEN a selected hero component requires one image
  WHEN the returned content proposal omits that media slot or assigns a video or incompatible aspect
  THEN validation identifies the exact missing or incompatible slot
  AND client review and publication remain unavailable

Scenario: Client attempts studio access
  GIVEN an authenticated client
  WHEN they navigate directly to a recipe export, import, validation, or studio route
  THEN access is denied
  AND no private brief, AI response, or other tenant data is exposed

Scenario: Recipe proposes inventory counts
  GIVEN the stockless content schema and an external AI response
  WHEN the response includes product stock, option stock, or inventory quantity
  THEN import identifies the unknown prohibited fields
  AND no candidate or active inventory state is created
```

## Quality impact

- Security and tenant isolation: server-authorized request scope owns every
  brief, asset key, import, preview, and save; interface hiding is not authority.
- Privacy and data retention: exports are minimal and explicit; no automatic
  provider transfer or private image-byte export occurs; staff explicitly
  acknowledges rights for manually admitted media.
- Accessibility and responsive behavior: validation paths, diffs, preview
  controls, and correction inputs are labeled and operable at 320 pixels.
- Localization and merchant-entered values: supplied names/options remain exact;
  AI-drafted copy is labeled and never silently translated into factual data.
- Performance and limits: large dynamic lists are summarized/virtualized and
  bounded by BE-008; preview uses the deterministic renderer.
- Failure recovery and idempotency: repeated import is identifiable and safe;
  invalid imports do not replace the current draft; retained revision/publication
  recovery remains available.

## Observability

Record safe request/revision IDs, schema/bank versions, import hash, counts,
validation categories, actor, and outcome. Never log raw briefs, recipe JSON,
request text, contacts, product copy, private media, or provider conversations.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Brief export and recipe import workflow | browser | `tests/acceptance/app.spec.ts` |
| Named independent contract versions | contract/integration | `scripts/test-showroom-recipe.ts` |
| Grouped validation and no silent repair | component/browser | `tests/acceptance/app.spec.ts` |
| Dynamic item counts and exact preview | integration/browser | `scripts/test-showroom-recipe.ts`, `tests/acceptance/app.spec.ts` |
| Focused compatible corrections | component/browser | `scripts/test-showroom-recipe.ts`, `tests/acceptance/app.spec.ts` |
| Manual image/provider intake and media-slot assignment | security/browser | `scripts/test-showroom-recipe.ts`, `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` |
| Client/cross-tenant denial | security/browser | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` |
| Mobile, labels, focus, and Back behavior | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Ship behind staff capabilities after BE-008 and DEP-007 gates pass. Keep the
existing recovery editor available to administrators during the pilot, but
route assigned staff through the recipe workspace by default. Rollback disables
recipe import/studio routes and retains every pre-existing revision; it never
publishes, deletes, or rewrites client content.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Implementation checkpoint: the assigned-staff studio, sanitized brief,
verified-image admission, strict recipe import, grouped validation, idempotent
private revision persistence, diff summary, preview, and recovery navigation
are implemented. The exported brief now presents a named contract manifest and
an explicit independent-version instruction before its current schemas and
example. Focused post-import controls, typed section-content blocks, and
controlled YouTube media are implemented through linked FE-009/FE-014 work.
Production rollout and remote evidence remain open, so this spec remains
`ready`.

## Studio deep-link defect follow-up

- On 2026-07-24, a platform administrator reached an unexpected 404 at a newly
  created Codespaces studio deep link (`/dashboard/requests/{requestId}/revisions/{revisionId}/studio`).
- Read-only inspection confirmed the request/revision existed, remained a draft,
  matched the business content version, and the same brief built successfully
  through the application service for the platform-admin actor.
- A temporary diagnostic route edit was removed because it neither reproduced
  nor fixed the cause. No production-code fix is retained or claimed.
- Production-browser acceptance now explicitly covers a platform administrator
  recording a request for an existing seeded client, creating its first draft,
  following the redirect to the studio, and seeing its recovery navigation.
- The isolated production suite passes 7/7 with that regression. The original
  transient Codespaces occurrence has no reproducible application defect; if it
  recurs, retain the request/session/server evidence before changing the route.
