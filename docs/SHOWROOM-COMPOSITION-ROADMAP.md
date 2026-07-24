# Showroom composition roadmap

This roadmap sequences the accepted direction in `ADR-0005`. It is not a claim
that the later capabilities are implemented. Observable behavior is controlled
by accepted feature specs and becomes current only with mapped evidence.

## Outcome

Turn an authenticated client's unstructured request and private references into
a validated showroom proposal assembled from a reviewed component bank. Team
members review the rendered result and exceptions; the client-review and
manager-publication workflow remains the final authority.

## Durable boundaries

- External AI proposes declarative JSON; it never supplies executable tenant
  code or writes SuqPage persistence.
- Component code, schemas, fixtures, screenshots, compatibility metadata, and
  tests are versioned in the repository.
- A revision stores or references the exact immutable bank release and design
  manifest needed to reproduce its preview and publication.
- Customer content remains separate from component code and retains source
  provenance. Missing facts produce questions.
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

### 4. Manual AI proposal import and staff exception workflow

Status: next planned phase.

- Export a sanitized brief containing the selected bank release, schemas,
  examples, request facts, and authorized asset references.
- Import strict JSON manually from the team's external AI account.
- Validate syntax, semantics, compatibility, tenant/asset scope, factual
  provenance, and revision limits before creating a draft.
- Show preview, structured differences, questions, warnings, and focused
  correction controls rather than making the large form the default workflow.

Exit: an assigned team member can move one real pilot request from sanitized
brief to valid private preview without provider credentials or live mutation.

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
  handles, catalog content, client access, requests, inquiries, deliveries,
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
