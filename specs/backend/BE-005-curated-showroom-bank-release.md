---
id: BE-005
title: Curated cross-industry showroom bank release
status: done
related: [FE-004, FE-005, FE-006, DEP-004, DEP-005, BE-004, BE-006, BE-007, ADR-0005]
owners: [product, frontend, backend, design]
last_updated: 2026-07-24
change_level: L2
---

# BE-005 — Curated cross-industry showroom bank release

## Problem and outcome

The composition contract is useful only when SuqPage has a broad, reviewed,
versioned bank whose components can be rendered without database, network, or
tenant-specific assumptions. The outcome is the first immutable production bank
release with enough orthogonal coverage for thousands of distinct product
showrooms across consumer, producer, artisan, industrial, and wholesale
businesses.

## Scope

### In scope

- One parsed `showroom-bank@1.1.0` release backed by reviewed repository
  components and token definitions.
- At least 40 components across all eight BE-004 slots and at least 12
  cross-industry token systems.
- Shared typed presentation data and smart-action callbacks that preserve
  canonical business/product values and platform-owned inquiry behavior.
- Registry parity, code-reference existence, coverage, capability, compatibility,
  and combinatorial-floor validation.
- A lower bound of 10,000 base combinations using only required header, hero,
  catalog, footer, and token choices; optional slots and bounded properties add
  variety beyond that floor.

### Non-goals

- Proposal-controlled public rendering, revision schema v2, persistence, AI
  import, provider access, client-data mapping, publication, or migration of the
  four existing renderers.
- Hard-coded tenant content, prices, certifications, stock claims, logistics
  claims, or industry facts.
- Admitting generated components without repository review and evidence.

## Domain language and invariants

- **Bank registry:** the exact mapping from every admitted component ID to one
  statically imported reviewed renderer.
- **Token system:** an immutable named set of scoped visual variables. Tokens
  alter presentation but cannot alter content or platform behavior.
- **Base combination floor:** product of available variants for required slots
  and token systems, before optional components or properties.
- All component IDs are immutable/versioned. Changing behavior that breaks old
  manifests requires a new component version or bank release.
- Components consume typed presentation data and callbacks. They do not query
  SQLite, read request media, fetch external data, mutate canonical state, or
  dynamically import proposal-controlled paths.

## Contracts

- Minimum coverage is five headers, eight heroes, four navigation components,
  six content/story components, six catalog components, five trust components,
  four call-to-action components, and four footers.
- Every bank definition has exactly one registry renderer and every renderer has
  exactly one bank definition.
- Every code reference exists under `components/showroom/bank/`; registry and
  token keys are compile-time constants rather than computed import paths.
- Every catalog renderer exposes product detail and add-to-inquiry actions.
  The selected bank can always satisfy catalog search, category filtering,
  product detail, add-to-inquiry, and an inquiry-cart trigger.
- Components receive no raw HTML, arbitrary style object, executable expression,
  URL, database handle, or tenant identifier from a design proposal.
- Product names, descriptions, collection/category names, availability, and
  image references pass through the typed context without rewriting.
- Token systems cover restrained luxury, natural/agricultural, food/honey,
  coffee, artisan, furniture, industrial/manufacturing, wholesale/trade,
  beauty/editorial, technology, coastal, and vibrant retail directions.
- CSS Modules or an equivalently scoped mechanism isolate component styles; no
  global selectors, `:global`, fixed overlay ownership, or document mutation is
  allowed.

## Scenarios

```gherkin
Scenario: Production bank release is admitted
  GIVEN the reviewed registry, component definitions, tokens, and code files
  WHEN the bank admission gate runs
  THEN every BE-005 coverage minimum and BE-004 semantic invariant passes
  AND the required-slot base combination floor is at least 10000

Scenario: Registry drift fails closed
  GIVEN a definition without a renderer or a renderer without a definition
  WHEN the admission gate compares immutable IDs
  THEN the gate fails before release
  AND no partial bank is described as available

Scenario: Component consumes dynamic product data
  GIVEN typed product and business presentation data
  WHEN a registered catalog or presentation section renders
  THEN supplied names and availability remain verbatim
  AND inquiry actions call only the supplied platform callbacks

Scenario: Component styling remains local
  GIVEN multiple token systems and component variants
  WHEN source and production build validation run
  THEN component styling remains rooted in the component module
  AND no component claims ownership of document-level or platform overlay state
```

## Quality impact

- Security and tenant isolation: pure presentation contracts receive no tenant
  authority or server adapter.
- Privacy and data retention: no customer/request content is stored in the bank.
- Accessibility and responsive behavior: components use semantic regions,
  headings, labeled controls, keyboard buttons, wrapping layouts, and bounded
  imagery.
- Localization and merchant-entered values: values are rendered verbatim and
  layouts allow long labels and inherited direction.
- Performance and limits: bank stays below BE-004 limits; no dependency or
  network asset is added.
- Failure recovery and idempotency: static bank release and deterministic
  registry; removal restores the previous code-only renderer state.

## Observability

Admission reports release, counts per slot, token count, combination floor, and
safe failing component ID. It never logs tenant content or private data.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Bank parses and meets exact coverage/floor | contract | `scripts/test-showroom-bank.ts` |
| Registry, token, and repository references have exact parity | contract | `scripts/test-showroom-bank.ts` |
| Dynamic values and callbacks survive component rendering contract | type/render | `scripts/test-showroom-bank.ts`, `npm run typecheck` |
| CSS isolation and prohibited dependency/source checks | security/static | `scripts/test-showroom-bank.ts` |

## Rollout and rollback

This release is repository-only and is consumed by the internal laboratory. It
does not alter a database or public renderer. Rollback removes the release and
laboratory; existing `design_key` values and schema-v1 revisions remain
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

Evidence: verified locally on 2026-07-24.

- `showroom-bank@1.1.0` parses through the BE-004 semantic contract with 42
  components: 5 headers, 8 heroes, 4 navigation, 6 content, 6 catalog, 5 trust,
  4 call-to-action, and 4 footer variants.
- Thirteen scoped token systems cover the specified consumer, producer, maker,
  industrial, wholesale, and trade directions without adding a dependency or
  external asset.
- The required-slot combination floor is 12,480. Optional navigation, content,
  trust, call-to-action sections and bounded properties are intentionally not
  used to inflate that baseline.
- `scripts/test-showroom-bank.ts` proves coverage, exact metadata/registry/token
  parity, code-reference existence, required smart capabilities, industry
  guidance, scoped CSS, and absence of database, network, dynamic-import,
  document-mutation, window-mutation, and raw-markup access.
- Type checking and the production build prove the statically imported React
  registry and typed dynamic presentation/callback contract compile.
