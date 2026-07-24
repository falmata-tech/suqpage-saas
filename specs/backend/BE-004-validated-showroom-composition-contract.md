---
id: BE-004
title: Validated showroom composition contract
status: done
related: [BE-005, BE-006, BE-007, FE-006, ADR-0005]
owners: [product, backend, security]
last_updated: 2026-07-24
change_level: L1
---

# BE-004 — Validated showroom composition contract

## Problem and outcome

SuqPage needs a repeatable way to describe distinct showrooms from an approved
bank of reusable components without trusting external AI output as code or
business authority.

This foundation defines a deterministic, versioned domain contract. It accepts
only a bounded design proposal that references components and tokens from one
known bank release, validates component-specific properties and data bindings,
and proves required smart-showroom capabilities before any later import,
preview, or publication workflow can use it.

## Scope

### In scope

- Pure TypeScript contracts for an immutable component-bank release and a
  non-executable showroom design proposal.
- Stable component IDs and versions, typed slots, bounded properties, declared
  content bindings, provided capabilities, and incompatibilities.
- Strict parsing that rejects unknown fields, unknown releases/components,
  duplicate section keys, undeclared properties/bindings, incompatible
  combinations, missing required slots, and missing required capabilities.
- Bounded rationale, questions, warnings, component counts, section counts,
  string sizes, and serialized proposal size.
- Portable JSON Schema documents for syntactic external-tool guidance, while
  server-side semantic validation remains authoritative.

### Non-goals

- A runtime composition renderer, component implementations, staff import UI,
  database persistence, revision schema migration, or migration of the four
  current renderers.
- Automatic application of customer content, direct AI-provider integration,
  AI access to SuqPage credentials or persistence, or publication of AI output.
- Treating JSON Schema alone as proof that a proposal is compatible, complete,
  factually accurate, tenant-authorized, or safe to publish.

## Domain language and invariants

- **Component bank release:** an immutable, validated catalog of components,
  token packs, required slots, and required smart capabilities.
- **Component definition:** metadata for one approved implementation. Its stable
  ID includes an explicit integer version and points to reviewed repository code.
- **Design proposal:** untrusted declarative JSON selecting approved components,
  tokens, bounded properties, and declared data bindings.
- A proposal contains no HTML, CSS, JavaScript, executable expressions, URLs,
  database identifiers, credentials, or storage paths.
- Component code is admitted through the normal repository review, test, and
  release workflow; an external AI proposal cannot create or modify component
  code.
- Proposal validation does not grant tenant access, mutate a revision, or imply
  client approval. Those remain later application use cases inside the
  versioned request/publication boundary.

## Contracts

- Bank release IDs and component IDs use lowercase, bounded, stable identifiers;
  component IDs end with `@<positive-version>`.
- Supported slots are `header`, `hero`, `navigation`, `content`, `catalog`,
  `trust`, `call_to_action`, and `footer`.
- Supported smart capabilities are `catalog_search`, `category_filter`,
  `product_detail`, `add_to_inquiry`, and `inquiry_cart_trigger`.
- Component properties are declared as bounded `enum`, `boolean`, or `integer`
  values. The proposal cannot introduce undeclared keys.
- Component bindings declare one logical input and a non-empty allowed set of
  canonical sources. The proposal must supply every required binding and can
  select only a declared source.
- A bank contains at most 128 components and 32 token packs. A proposal contains
  at most 24 sections, 20 questions, 20 warnings, and 256 KiB of JSON.
- A validated proposal matches one exact bank release, selects one exact token
  pack, uses only registered component IDs, satisfies required slots and
  capabilities, and contains no declared incompatibility pair.
- The parser returns normalized immutable-domain data or a safe typed validation
  error. It never executes or dynamically imports proposal-controlled values.

## Scenarios

```gherkin
Scenario: Approved composition is accepted
  GIVEN a valid immutable bank release with required slots and capabilities
  WHEN an external tool returns a bounded proposal using only declared
  components, properties, bindings, and tokens
  THEN the domain parser returns a normalized design proposal
  AND no code, persistence, tenant access, or publication action occurs

Scenario: Executable or undeclared input is rejected
  GIVEN a proposal containing raw CSS, HTML, JavaScript, a URL, or any other
  undeclared field
  WHEN the domain parser validates the proposal
  THEN validation fails with a safe error
  AND no untrusted value is executed or imported

Scenario: Unknown bank content is rejected
  GIVEN a valid bank release
  WHEN a proposal names another release, an unknown component, token pack,
  property, binding, or binding source
  THEN validation fails
  AND the known bank remains unchanged

Scenario: Unsafe component combination is rejected
  GIVEN approved components with declared incompatibilities and smart features
  WHEN a proposal combines an incompatible pair or omits a required slot or
  capability
  THEN validation fails before preview or persistence
```

## Quality impact

- Security and tenant isolation: the contract is pure and receives no actor,
  tenant, database, filesystem, network, or credential capability.
- Privacy and data retention: no customer request text, contact, or image
  content belongs in this foundation contract.
- Accessibility and responsive behavior: component admission requirements are
  planned in the component-bank implementation phase; this foundation records
  metadata but does not claim visual compliance.
- Localization and merchant-entered values: bindings reference canonical data;
  the proposal cannot rewrite or translate merchant values.
- Performance and limits: bank/proposal counts, text lengths, numeric ranges,
  and serialized size are bounded.
- Failure recovery and idempotency: parsing is deterministic and side-effect
  free; repeated input returns the same result or safe error.

## Observability

Later adapters may record safe bank release, component IDs, validation category,
and proposal outcome. They must not log proposal customer content, contacts,
image data, credentials, or raw external-provider responses.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Valid bank and proposal normalize deterministically | unit | `scripts/test-showroom-composition.ts` |
| Unknown fields and executable-looking extensions are rejected | unit/security | `scripts/test-showroom-composition.ts` |
| Release, component, property, binding, token, and limit failures | unit | `scripts/test-showroom-composition.ts` |
| Required slots/capabilities and incompatibilities | unit | `scripts/test-showroom-composition.ts` |
| External JSON schemas stay present and syntactically valid | contract | `scripts/test-showroom-composition.ts` |

## Rollout and rollback

This increment adds a side-effect-free domain module, schemas, documentation,
and tests without registering a renderer or changing stored revisions. Rollback
removes those additive files and the check-script entry. Runtime behavior and
all four existing showrooms remain unchanged.

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

- `scripts/test-showroom-composition.ts` proves deterministic normalization,
  strict unknown-field denial, markup/external-locator denial, proposal size
  limits, exact bank-release/token/component selection, component property and
  binding constraints, mandatory smart capabilities, required slots, and
  declared incompatibilities.
- Both portable SDK JSON schemas parse successfully and prohibit unknown
  top-level fields; semantic bank validation remains authoritative as specified.
- `npm run check` passed, including spec/workflow validation, type checking, all
  four existing design registrations, the new focused suite, security and
  adapter boundaries, managed requests, and revision approval/publication/
  rollback tests.
- No renderer was registered, no stored revision schema changed, and no
  database, request, preview, publication, external provider, or live showroom
  path imports the new foundation module.
