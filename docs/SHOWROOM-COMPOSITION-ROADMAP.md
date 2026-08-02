# Showroom composition roadmap

This roadmap sequences the accepted direction in `ADR-0005`. It is not a claim
that the later capabilities are implemented. Observable behavior is controlled
by accepted feature specs and becomes current only with mapped evidence.

## Outcome

Turn an authenticated client's unstructured request, authorized current
showroom content, source facts, and private asset references into one validated
full-showroom recipe. External AI structures the dynamic catalog and page copy
through a content schema and independently proposes a composition through the
design schema. Team members review the rendered result and exceptions rather
than manually entering every field; client review and manager publication
remain the final authority.

## Durable boundaries

- External AI proposes declarative JSON; it never supplies executable tenant
  code or writes MirtPage persistence.
- Component code, schemas, fixtures, screenshots, compatibility metadata, and
  tests are versioned in the repository.
- A revision stores or references the exact immutable bank release and design
  manifest needed to reproduce its preview and publication.
- Customer content remains separate from component code and design. A versioned
  content proposal supports dynamic catalog lists and typed hero, story,
  highlight/trust, information, and call-to-action blocks. Written fields may
  be provisional with optional provenance; media remains separately admitted.
- One recipe envelope pins separately versioned content/design documents,
  schema/bank releases, provenance, source reconciliation, questions, and
  warnings. It never grants either document independent publication authority.
- Images and supported external media are admitted manually before export.
  Components declare typed media slots; AI recipes may assign only the opaque
  keys in the exported media manifest and can never introduce a URL or embed.
- The next active product contract is availability-only. A bounded product-
  upkeep path lets clients and authorized staff maintain routine product facts
  without granting catalog-structure or design authority.
- Former renderer keys and schema-v1 revisions are read-only recovery inputs.
  Current seeds, invitations, drafts, publications, and rollback writes are
  schema v2 and use the composition renderer.

## Delivery sequence

### 1. Contract foundation — BE-004

Status: completed and verified on 2026-07-24.

- Define and test bounded component-bank and design-proposal contracts.
- Publish portable syntactic JSON schemas for external-tool guidance.
- Keep the contract pure: no database, files, network, renderer registration,
  or customer content.

Exit: invalid releases, components, properties, bindings, capabilities, slots,
and combinations fail deterministically without changing runtime behavior.

### 2. Curated bank and visual laboratory

Status: completed and verified on 2026-07-24 by `FE-004`, `BE-005`, and
`DEP-004`.

- Extract or create a small orthogonal set of headers, heroes, navigation,
  catalog grids, trust/story sections, calls to action, and footers.
- Define scoped styling, shared platform callbacks, responsive behavior,
  accessibility requirements, fixtures, and visual examples.
- Build an authenticated staff gallery/contact sheet and automated component
  contract tests.

Exit: every admitted component has reviewed code, metadata, fixtures, responsive
screenshots, accessibility evidence, and compatibility constraints.

Current release evidence: `showroom-bank@1.1.0` contains 42 component variants
across all eight slots, 13 scoped token systems, exact static-registry parity,
and 12,480 required-slot combinations. `BE-006`, `FE-005`, and `DEP-005` add
required bounded motion and decorative properties to every component, scoped
CSS-only experience primitives, touch-first behavior, container-based
390-pixel previews, and reduced-motion enforcement. The authenticated
laboratory renders every component using bounded synthetic content. Desktop
and 390-pixel screenshots were reviewed locally without committing generated
artifacts. Production-browser acceptance checks every component canvas for
overflow and every visible bank input/button for 44-pixel touch height, while
the four current public renderers remain covered at 320 pixels. Automated
screenshot-baseline infrastructure remains a later enhancement; current
evidence is source isolation, contract tests, production build, visual review,
and browser acceptance.

### 3. Revision schema v2 and composition renderer

Status: completed and verified on 2026-07-24 by `FE-006`, `BE-007`, and
`DEP-006`.

- Revision schema v2 stores canonical content separately from the exact
  validated `designManifest`.
- New drafts, publications, retained baselines, and rollback writes are v2-only.
- The interpreter resolves only the static bank registry and forbids dynamic
  imports, raw markup, arbitrary style values, and component-owned persistence.
- Schema-v1 snapshots and former design keys can be upgraded only through the
  migration/recovery boundary.

Exit evidence: private preview, exact approval, atomic publication, retained
rollback, inquiry behavior, and fail-closed invalid-manifest behavior pass.

### 3.5 Stockless basic product upkeep

Status: ready under `FE-008`, `BE-009`, `DEP-008`, and `ADR-0006`.

- Replace numeric product/option inventory with descriptive availability across
  domain, storage, inquiries, snapshots, fixtures, UI, and portable schemas.
- Add one narrow versioned command for a client to create a product or edit its
  name, description, primary image, availability, and assignment to existing
  compatible collection/category choices.
- Give assigned team members the same customer-service command for assigned
  businesses with explicit staff attribution; managers/administrators use their
  broader tenant scope.
- Preserve monotonic retained versions and reject stale commands. Full drafts
  based on an older live version must be rebased.
- Do not expose collection/category creation, options, ordering, structural
  deletion/unpublish, page content, settings, design, or complete publication.
- Coordinate one stockless revision-v3 contract with the recipe phase. V1/v2
  readers discard legacy inventory only at the recovery boundary.

Exit: all four example clients can complete mobile basic product upkeep without
seeing an inventory field or protected structure/design controls, while every
cross-tenant, hidden-field, media, and stale-version test passes.

### 4. Full AI showroom recipe import and focused staff studio

Status: verified private checkpoint under `FE-007`, `BE-008`, and `DEP-007`.
The portable schema, sanitized brief, verified-image registry, strict manual
import, idempotent private draft, exact preview, client-review/publication path,
and emergency disable are implemented. Typed section-content blocks, focused
post-import controls, controlled YouTube support, and final spec completion
remain planned; the three controlling specs therefore remain `ready`.
The product owner promoted completion plus a creative bank expansion to **Now**
under `FE-009`, `BE-010`, `DEP-009`, and `ADR-0007`. Bank 1.1 and revision v3
remain immutable while additive v4/bank-1.2 work proceeds.

#### 4.1 Portable content and recipe contracts

- Add a strict portable content schema for business/meta/contact values,
  dynamic collections, categories, products, option groups, availability,
  allowed media keys, and typed section-content blocks. Numeric inventory fields
  are prohibited.
- Keep the existing design proposal as a separately versioned schema and extend
  component admission with compatible typed content and media-slot contracts:
  allowed kind, required/optional state, count, and aspect-ratio guidance.
- Add a small recipe-envelope schema that pins content/design versions, bank
  release, provenance, expected/returned counts, stable-key reconciliation,
  questions, warnings, and rationale.
- Publish synthetic complete examples for no-catalog/service, small artisan, and
  larger multi-collection showrooms. Examples demonstrate structure and
  dynamic counts; they are not fixed templates or customer data.

#### 4.2 Sanitized brief export

- Before export, staff manually admit and label request attachments,
  same-tenant media, new verified JPEG/PNG/WebP uploads, and allowlisted provider
  links. Initial external-video support normalizes a recognized YouTube URL into
  one controlled provider asset; raw embed HTML and arbitrary URLs are invalid.
- Export/copy one request-scoped package containing schemas, bank/component
  metadata including media slots, synthetic examples, source facts, an opaque
  media manifest with safe labels/kinds/dimensions/aspect/provider metadata,
  expected counts, and the exact base content version.
- For a new showroom, request a complete desired content/design pair. For a
  change, include the authorized current snapshot and require a complete
  replacement recipe with retained stable keys and explicit removals.
- Do not export credentials, database IDs, storage paths, unrelated tenant
  data, customer inquiries, invitation/session data, or image bytes.
- If the external AI needs to inspect images, staff manually supplies the same
  approved files in that conversation. MirtPage performs no automatic media
  transfer to the AI provider.

#### 4.3 Strict manual import and cross-validation

- Import JSON manually from the team's approved external AI account; MirtPage
  performs no provider call in this phase.
- Validate content, design, and envelope independently, then cross-validate
  component/content-block types, bindings, required/optional media slots, media
  kind/count/aspect, asset scope, provenance, completeness, item relationships,
  version limits, and stale base state.
- Permit dynamic item counts through existing bounded maxima. Never silently
  truncate, repair, invent, or drop catalog/content entries.
- Treat AI marketing language as labeled draft copy. Contacts, availability,
  specifications, certifications, product facts, media, and unexplained removals
  require attributable source evidence. Inventory counts are rejected rather
  than treated as source facts.

#### 4.4 Candidate preview and focused correction

- Show grouped validation paths, questions, warnings, count/difference summaries,
  and the exact private candidate preview before persistence.
- Show a media intake/assignment view with thumbnails or normalized provider
  cards, slot requirements, descriptive alt/caption/title review, and usage-
  rights acknowledgement. AI decides placement only among admitted assets.
- Make corrected re-import the normal content/catalog correction path.
- Offer focused compatible controls for approved components, token packs,
  motion, decoration, and content-block association. Do not turn the workflow
  into another page of unrestricted forms.
- Keep the existing structured editor as an administrative recovery surface
  during rollout, not the routine staff production workflow.

#### 4.5 Versioned revision and rollout

- Persist valid candidates in revision schema v3 with separate exact content
  and design documents plus durable reconciliation and any supplied provenance.
- Share the identical stockless v3 content contract admitted by DEP-008; neither
  product upkeep nor recipe import may release a conflicting v3 schema.
- Keep v2 as a read/upgrade recovery input during the controlled migration.
- Preserve immutable submission, exact client approval, manager publication,
  stale-version rejection, and retained monotonic rollback.
- Enable one test request, then all roles and four example clients, before
  making the recipe workspace the default.

Exit: an assigned team member can move one real pilot request from sanitized
brief to a complete valid private preview—dynamic catalog, all page copy,
manually admitted image/video assignments, and design—without provider
credentials, manual per-item entry, raw embeds, live mutation, or publication
authority.

### 5. Client review, publication, and four-client migration

Status: completed and verified on 2026-07-24 by `FE-006`, `BE-007`, and
`DEP-006`. The migration was intentionally completed before manual AI import
because all four current tenants are test clients and the product owner chose a
fresh cutover rather than visual parity with obsolete renderers.

- Reuse exact revision submission, client approval/rejection, stale-version
  checks, atomic publication, and retained rollback.
- Browser-test visitor, client, assigned team member, operations manager, and
  administrator paths.
- All four example showrooms use distinct curated compositions and retain their
  handles, catalog content, client access, requests, inquiries, support,
  content versions, and retained revision history.

Exit: the bank is the default production path. Former renderers remain only as
a temporary read-only recovery path for pre-cutover backups until the recovery
window and removal criteria are handled in a later scoped change.

### 6. Optional provider adapter

- Select a provider only after reviewing retention, training, regional,
  credential, private-image, and deletion terms.
- Add a narrow adapter with bounded input/output, timeout, retry, redaction,
  audit, idempotency, and operator-visible failure behavior.
- Keep manual import as a recovery path and never grant the provider publication
  authority.

Exit: an accepted L3 spec and ADR amendment prove provider security,
observability, cost controls, and rollback.

## Bank admission rule

A component enters an available bank release only when its implementation,
schema, examples, isolation checks, accessibility behavior, responsive visual
evidence, performance budget, compatibility constraints, and required
smart-showroom callbacks all pass. AI-generated component ideas follow this same
repository review process; they are never admitted by a tenant proposal.

## Business measures

- Minutes from accepted request to first private preview.
- Staff correction minutes per proposal.
- Percentage of proposals accepted without structural correction.
- Component reuse rate and bank coverage.
- Client review cycles before approval.
- Post-publication defect and rollback rate.
- Cost per proposal and component-maintenance cost.
