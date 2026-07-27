---
id: BE-008
title: Validated full-showroom recipe import
status: ready
related: [FE-007, FE-009, FE-014, BE-003, BE-004, BE-007, BE-009, BE-010, BE-013, DEP-007, DEP-008, DEP-009, DEP-011, ADR-0005, ADR-0006, ADR-0007]
owners: [product, backend, security]
last_updated: 2026-07-27
change_level: L3
---

# BE-008 — Validated full-showroom recipe import

## Problem and outcome

The existing design-proposal parser validates only visual composition, while
revision-v2 content is entered through application forms and has no portable
external-tool schema, typed per-section content model, durable provenance, or
combined import boundary.

SuqPage needs one untrusted recipe-import use case that validates content and
design independently, cross-validates their references and completeness, and
creates only a private revision candidate. External AI can structure all
supplied content and propose bounded marketing copy, but cannot invent business
authority, access tenant persistence, or publish.

## Scope

### In scope

- `ShowroomContentProposal` schema/parser for business/meta/contact fields,
  typed section-content blocks, collections, categories, products, options,
  availability, and opaque media references. Numeric inventory is absent.
- A separately versioned `ShowroomDesignProposal` schema/parser for approved
  bank composition.
- A small `ShowroomRecipeEnvelope` schema/parser pairing exact content/design
  versions with provenance, source reconciliation, questions, warnings, and
  rationale.
- Export of an actor/tenant-scoped sanitized brief with current content for
  change requests, allowed asset keys, source facts, expected counts, bank
  contract, portable schemas, and synthetic/authorized examples.
- A request-scoped media registry for manually admitted verified images and
  allowlisted external-provider links, exposed to recipes only through opaque
  asset descriptors.
- Cross-validation of content keys, section-content types, component content
  contracts, bindings, asset scope, source requirements, limits, and current
  base content version.
- Idempotent private candidate import and conversion into the next revision
  write schema without live mutation.
- Structured safe validation results for the staff workflow.

### Non-goals

- Provider API calls, prompt hosting, runtime-generated code, arbitrary
  markup/styles/URLs, direct database access, or automatic publication.
- Trusting JSON Schema as semantic, factual, tenant, media, or authorization
  proof.
- Product/variant inventory, pricing, payment, or ecommerce checkout.
- Partial AI patches whose omitted entries have ambiguous delete/retain meaning.

## Domain language and invariants

- **Recipe import** is an application use case around pure content, design, and
  cross-document domain parsers.
- **Source fact** is attributable to the client request/clarification, an
  authorized current snapshot, an authorized asset, or an explicit staff input.
- **AI draft copy** is proposed presentation language, not authority for
  contacts, availability, product specifications, certifications,
  materials, origin, delivery, pricing, or other factual claims.
- **Stable key** is a recipe-local opaque relationship key. It is never a
  database ID or storage path.
- **Media descriptor** is an authorized opaque key plus a bounded kind, label,
  source/provenance, rights acknowledgement, and rendering metadata. It contains
  no local storage path or recipe-controlled embed markup.
- **Component media contract** declares named slots, required/optional state,
  permitted image/video kinds, minimum/maximum count, and bounded aspect-ratio
  guidance.
- **Complete replacement** explicitly represents the desired candidate state.
  For changes, retained entities preserve their exported stable keys; omitted
  entities are reported as removals.
- Content and design remain separate versioned documents even when stored and
  rendered together as one immutable revision.

## Contracts

- Portable schemas use JSON Schema 2020-12 with `additionalProperties: false`.
  Authoritative TypeScript parsers reject unknown fields, control characters,
  unsafe locators/markup, duplicate keys/slugs, invalid relationships, invalid
  enums, and limit violations.
- Every exported brief contains a named contract manifest. Versions belong only
  to their named document contract and are never presented as one global
  generation: recipe `@1` contains content `@1`, content-blocks `@1`, and
  design `@2`, while component-bank schema `@2` describes the separately named
  `showroom-bank@1.2.0` release. The brief gives the AI one explicit instruction
  not to normalize those independent versions.
- The exported `schemas` object contains only the current recipe, content,
  content-block, design, component-bank, and design-system schemas. Their
  required versions, references, and required nested documents must match the
  complete example and authoritative parsers; a legacy design schema cannot be
  exported under the current design contract.
- Content permits up to 100 collections, 200 categories, 500 products, four
  option groups and 50 values per group, and 24 typed section-content blocks,
  subject to one bounded serialized recipe limit. Counts may be zero through
  their maxima and are never fixed by the UI or examples.
- Product content has descriptive availability only. `stock`, `stockCount`,
  `stock_count`, option inventory, and equivalent numeric inventory fields are
  unknown/prohibited. Requested inquiry quantity is not recipe content.
- Typed section-content contracts cover hero, story/editorial, highlights,
  trust/information, and call-to-action copy/media. Component-bank definitions
  declare compatible content types; a design section requiring content points
  to exactly one compatible content-block key.
- Allowed image keys are generated by SuqPage for same-request attachments,
  authorized same-tenant current media, and new staff uploads that pass the
  existing JPEG/PNG/WebP signature, decode, size, pixel, re-encoding, metadata,
  filename, storage, and controlled-serving requirements.
- Component definitions declare media contracts. Content blocks bind opaque
  media keys to named slots; cross-validation enforces required slots, kind,
  count, and aspect rules before candidate creation.
- External-provider links are admitted manually through a provider-specific
  parser. Initial YouTube support accepts only recognized HTTPS watch/share URLs,
  extracts a canonical video ID, strips unrelated parameters, stores the
  normalized provider record, and renders only through a reviewed controlled
  component. Raw iframe/object/embed HTML and arbitrary provider URLs fail.
- Remote image URLs are never recipe authority. A remote image must be manually
  downloaded/uploaded through the verified managed-image boundary before it
  receives an asset key.
- Imports cannot use raw URLs, filesystem paths, database/media IDs, another
  request's key, or another tenant's asset. AI can select only keys present in
  the exported media manifest.
- The brief exports safe descriptors such as opaque key, staff label, media
  kind, dimensions/aspect ratio, and provider/title. It exports no private file
  bytes or storage locations; staff may separately supply approved files to the
  external AI conversation.
- Provenance maps every factual or media-bearing field to an exported source
  key. AI-drafted marketing copy is labeled `ai_draft`; missing required facts
  become questions. Server validation never upgrades `ai_draft` to `source_fact`.
- Image alt text/captions and video titles are bounded and reviewed. AI may
  propose descriptive text, but staff acceptance and media usage-rights
  acknowledgement are required before client review.
- A change brief includes the exact base content version and complete authorized
  current recipe content. Import rejects stale base versions before replacing a
  draft candidate.
- Source reconciliation records expected and returned counts and stable keys.
  Missing/duplicate source items, unexplained removals, and unresolved required
  questions block submission for client review.
- Import authorization reuses request assignment/manager scope. Clients,
  unassigned staff, and cross-tenant actors cannot export, import, preview, or
  read recipe payloads.
- One idempotency key/import hash cannot create duplicate candidates. Invalid
  content, design, provenance, asset scope, or compatibility causes no revision,
  media promotion, live mutation, approval, or publication.
- A valid import creates or replaces only a mutable private draft. Submitted
  revisions remain immutable; later imports create a newer revision.
- Revision schema v3 stores exact validated content and design documents plus
  the minimum durable recipe provenance/reconciliation metadata needed for
  client review and audit. V2 remains a read/upgrade recovery input during the
  controlled rollout.
- `BE-009`, `DEP-007`, and `DEP-008` admit one identical stockless revision-v3
  content contract. Legacy v1/v2 inventory fields are discarded only at the
  recovery reader and never enter a v3 write.
- The application ports are independent of Next.js, SQLite, filesystem, and AI
  providers: brief reader, recipe candidate repository, authorized asset
  resolver, revision writer, and audit/event sink.

## Scenarios

```gherkin
Scenario: Complete recipe becomes a private candidate
  GIVEN assigned staff exported a current authorized brief
  WHEN they import separately valid and cross-compatible content and design documents
  THEN one idempotent private candidate is stored against the exact base version
  AND its dynamic catalog and typed page content render in the deterministic preview

Scenario: AI structures a dynamic catalog
  GIVEN source material describes an arbitrary permitted number of products and collections
  WHEN the AI returns all entries inside the content schema and limits
  THEN relationships, options, counts, provenance, and media keys are validated
  AND no fixed example count or manual per-item form is required

Scenario: AI invents a factual claim
  GIVEN no exported source supports a product specification, certification, availability, or contact
  WHEN the recipe marks that value as a source fact or omits provenance
  THEN import fails with a safe provenance error
  AND the value cannot enter a revision candidate

Scenario: AI includes an inventory count
  GIVEN the portable content schema has no numeric inventory field
  WHEN a recipe includes product stock, option stock, or equivalent inventory data
  THEN strict parsing rejects the unknown field
  AND no inventory value enters a candidate, canonical row, or retained v3 snapshot

Scenario: Content and design disagree
  GIVEN a design section references a missing or incompatible content block or media key
  WHEN the recipe is cross-validated
  THEN import fails with a bounded path/category report
  AND neither document is silently rewritten

Scenario: AI receives independently versioned contracts
  GIVEN the current recipe envelope uses recipe schema 1 and design schema 2
  WHEN staff export the sanitized brief
  THEN a named contract manifest identifies the owner of every version
  AND the exported design and component-bank schemas require version 2
  AND the complete example uses those exact versions

Scenario: Recipe assigns admitted section media
  GIVEN the request media registry contains verified image keys and a normalized YouTube asset
  WHEN content blocks assign those keys to compatible declared component slots
  THEN cross-validation accepts the assignments for private preview
  AND the renderer receives only canonical managed image references or a controlled provider ID

Scenario: Recipe injects external media
  GIVEN an AI recipe contains a remote image URL, raw iframe HTML, unknown provider URL, or another tenant's asset key
  WHEN media assignments are parsed and authorized
  THEN import fails before fetch, decode, embed, or persistence
  AND no external content executes or enters the revision

Scenario: Change recipe silently loses source items
  GIVEN the brief exports 50 retained product keys
  WHEN the returned complete proposal contains 47 without declared removals
  THEN reconciliation blocks the candidate
  AND staff must obtain a corrected recipe or explicitly sourced removal intent

Scenario: Unauthorized actor imports a valid recipe
  GIVEN a client, unassigned team member, or actor from another tenant
  WHEN they call the recipe import port directly
  THEN access is denied before payload persistence
  AND no validation response exposes private content or asset keys
```

## Quality impact

- Security and tenant isolation: explicit actor/request/business scope wraps
  every export/import; pure parsers have no persistence or provider authority.
- Privacy and data retention: briefs are minimal manual exports; payloads are
  private revision data with bounded retention and no general logging.
- Accessibility and responsive behavior: owned by FE-007; typed content is
  validated for component compatibility before preview.
- Localization and merchant-entered values: product/brand/option values remain
  exact; AI copy/provenance cannot silently translate canonical merchant data.
- Performance and limits: serialized bytes, nesting, lists, text, products,
  options, blocks, sections, questions, warnings, and validation errors are
  bounded; parsing is deterministic.
- Failure recovery and idempotency: import hash/idempotency, immutable submitted
  revisions, v2 recovery reads, v3 retained versions, and atomic publication
  preserve replay and rollback.

## Observability

Record actor, safe request/business/revision IDs, schema and bank versions,
import hash, counts, validation categories, base-version conflict, and outcome.
Never log raw recipes/briefs, field values, contacts, request text, private
asset keys, image bytes, provider prompts, or complete validation payloads.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Strict content and envelope parsing | unit/security | `scripts/test-showroom-recipe.ts` |
| Named contract manifest and current portable-schema parity | contract | `scripts/test-showroom-recipe.ts` |
| Dynamic catalog, typed blocks, and relationships | unit/integration | `scripts/test-showroom-recipe.ts` |
| Provenance, reconciliation, and no invented facts | domain/security | `scripts/test-showroom-recipe.ts` |
| Component/content/media cross-validation | domain/security | `scripts/test-showroom-recipe.ts`, `scripts/test-security.ts` |
| Verified uploads and controlled provider-link parsing | media/security | `scripts/test-showroom-recipe.ts`, `scripts/test-security.ts` |
| Assignment and cross-tenant authorization | integration/security | `scripts/test-requests.ts`, `scripts/test-security.ts` |
| Idempotent draft creation, stale conflict, v2/v3 recovery | integration | `scripts/test-revisions.ts`, `scripts/test-showroom-recipe.ts` |
| Exact preview/approval/publication/rollback | browser/integration | `tests/acceptance/recipe.spec.ts`, `scripts/test-revisions.ts` |

## Rollout and rollback

DEP-007 controls schema-v3 migration and admission. Land pure parsers/schemas
before persistence and UI adapters, then add private candidate storage, v3
dual-read/write, recipe workspace, and four-test-client migration. Rollback
disables import and restores the compatible code/database checkpoint; published
v2/v3 revisions remain immutable and retained.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Implementation checkpoint: portable content/recipe schemas, strict dynamic
catalog parsing, provenance/reconciliation, opaque verified-image scope,
request authorization, idempotent private import, and revision-v3 recipe
metadata persistence are implemented and covered by the focused recipe gate.
The current brief names every independent contract, exports design/component
bank schema 2 rather than legacy schema 1, and keeps its portable content and
recipe references aligned with the typed-block parser and complete example.
Typed section-content blocks and controlled YouTube admission/rendering are now
implemented through the linked BE-010 work. Production migration, remote
checks, and the remaining rollout evidence are still open, so this spec remains
`ready`.
