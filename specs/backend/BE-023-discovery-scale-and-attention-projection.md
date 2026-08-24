---
id: BE-023
title: Discovery scale and attention projection
status: in_progress
related: [BE-015, BE-018, BE-020, BE-021, BE-022, BE-029, FE-021, FE-024, FE-030, FE-032, FE-033, FE-036, DEP-017, DEP-019, DEP-020, DEP-024, DEP-026]
owners: [backend, security, operations]
last_updated: 2026-08-15
change_level: L3
---

# BE-023 - Discovery scale and attention projection

## Problem and outcome

Discovery cannot distinguish workshops from growing factories, and dashboards
do not expose a bounded projection of work requiring attention. The backend
needs reviewed production-scale metadata and role-scoped aggregate queries that
preserve tenant isolation and predictable query cost.

## Domain invariants

- `production_scale` is exactly `workshop` or `growing_factory`; existing rows
  default to `workshop` and authorized discovery managers may edit it.
- The application projection accepts only an allowlisted production-scale
  value for controlled internal use. Unknown values behave as no scale filter
  and never become SQL fragments.
- Public homepage and discovery route adapters do not forward scale query state;
  public rows, total counts, nearby groups, featured rows, and map points share
  the same industry/search eligibility predicate.
- Platform attention includes: draft businesses with client accounts, submitted
  or needs-information requests, waiting or staff-unread support conversations,
  and received customer inquiries.
- Client attention is tenant-scoped; team-member attention is assignment-scoped;
  manager/admin attention may be platform-scoped according to capability.
- Sponsored placement is a separate persisted concept and never grants Daily Featured
  eligibility, publication, or endorsement. Retained Sunday-selection rows are
  legacy data and have no public or administrative projection.
- Internal sponsor placements reference an eligible MirtPage business. Additive
  migration 35 introduces separately identified external sponsor ads with a
  bounded name, description, approved local image, active flag, position, and
  at least one validated destination: public HTTPS website or normalized phone.
  External ads never create a tenant, showroom, product, or map record.
- Region and city values are selected only from place keys derived from the
  current marketplace result set. Unknown keys are ignored and never become SQL.
- An absent or invalid public industry filter returns the de-duplicated combined
  marketplace projection for the required orientation chooser. Explicit `all`
  returns the same combined result and closes the chooser. Neither value is a
  persisted business industry, and neither changes the selected weekday's Daily
  Featured Showrooms industry.
- A public showroom's primary visual industry is the first of its memberships
  in the canonical `DISCOVERY_INDUSTRIES` order. It is deterministic display
  metadata only: cross-listed businesses remain eligible through every assigned
  membership.
- A public showroom row exposes live state only after the retained provider and
  destination pass `BE-021`. The selected day's floor and the current
  Ethiopia-time agenda are separate: `featuredNowBusinessId` identifies today's
  current booth only during one generated presentation window and is null
  during changeovers, sponsor breaks, intermission, and all inactive time.

## Contracts

- Additive schema migration 25 adds the checked profile field and an index for
  bounded controlled projection; no existing business, route, or publication is removed.
- `getDiscoveryView` retains its bounded `scale` capability for internal and
  compatibility callers and projects reviewed scale metadata with every public
  business. Public page adapters always request the unfiltered projection.
- `getDashboardAttention(user, businessId?)` returns only non-sensitive integer
  aggregates and role-appropriate destinations.
- Aggregate queries are parameterized, bounded to one row, and do not load
  messages, contacts, request text, or inquiry item snapshots.
- Additive migration 26 created bounded sponsorship and retained legacy
  Sunday-selection records with indexed ordering and foreign-key cleanup.
- Additive migration 27 introduces the seventh Agriculture industry and moves
  matching retained growers from the prior combined food group without deleting
  business, product, media, or sponsorship records.
- Additive migration 28 applies reviewed cross-list memberships; migration 29
  corrects the reviewed scale of Laga Grain Mill; migration 30 normalizes legacy
  per-industry sponsor flags to the five globally ordered active sponsors without
  deleting or rewriting showroom content.
- Public sponsorship projection merges eligible active internal placements and
  active external ads, sorts by position and deterministic identity, and returns
  at most five typed placements. Visitor industry, search, place, and selected
  program day never change this pool.
- Available-place filtering is applied before total, map rows, and nearby
  groups. The Daily Featured and sponsored projections remain independent
  from the visitor's search and place filters.
- The selected-industry marketplace total, map rows, nearby groups, and place
  options use one parameterized eligibility predicate. A cross-listed business
  appears once in the selected result.
- Public map, sponsor, Daily Featured, and nearby-group rows project the
  allowlisted primary visual industry key and label. Nearby grouping considers
  only eligible rows in the same reviewed city within 800 meters. It preserves
  every authoritative business coordinate, forms deterministic balanced groups
  of no more than six, and emits no one-business group. A nearby group carries
  only stable showroom IDs; the complete public showroom records remain in the
  single canonical showroom array and are not duplicated inside group payloads.
- The marketplace base executes its unfiltered eligibility projection once.
  When no valid place filter is selected, the place-option source and visible
  showroom source reuse that result rather than issuing an identical second
  database query.
- Nearby grouping partitions eligible rows by normalized city and region, then
  uses bounded geographic grid buckets to compare only neighboring candidates.
  It preserves the exact 800-meter distance check and deterministic output but
  must not scan the complete marketplace once per showroom.
- Public non-search Market projections, Daily Featured projections, and the
  bounded sponsor pool use a twenty-second server cache to absorb identical
  anonymous traffic. Free-form search projections remain uncached so arbitrary
  visitor input cannot create an unbounded application cache key space.
- Search input shorter than two trimmed characters returns no suggestions.
  Longer input returns at most six de-duplicated suggestions from eligible
  public showroom names, published offering names, and reviewed city/region
  labels. Industry and valid place scope use parameterized predicates, and no
  contact, inquiry, account, draft, or unpublished content is projected.
- Live fields use the existing bounded business row projection; current Daily Featured
  spotlight calculation reuses the deterministic eligible booth order and adds
  at most one current-day Daily Featured query when a visitor previews another date.
- Daily Featured projection exposes at most forty rows in deterministic order in
  both Automatic and Manual modes. Oversized retained Manual data is truncated
  defensively without changing geographic marketplace eligibility.

## Scenarios

```gherkin
Scenario: Controlled scale projection remains bounded
  GIVEN eligible workshops and growing factories in one industry
  WHEN an internal caller selects growing_factory with a search term
  THEN projected totals and rows include only matching growing factories
  AND map rows and nearby groups use the identical predicate

Scenario: Invalid scale reaches the adapter
  GIVEN an arbitrary scale query value
  WHEN discovery is built
  THEN the value is ignored safely
  AND the SQL remains parameterized

Scenario: Public route receives legacy scale state
  GIVEN a visitor opens the homepage or discovery route with a scale query
  WHEN the public adapter builds discovery
  THEN the scale query is ignored

Scenario: Large discovery projection avoids quadratic grouping
  GIVEN thousands of eligible showrooms are spread across reviewed locations
  WHEN the marketplace projection builds nearby groups
  THEN candidates are partitioned by city and geographic bucket
  AND only neighboring buckets receive exact distance checks
  AND the result preserves bounded groups and authoritative coordinates
  AND each nearby group references canonical showroom rows by ID without duplicating their content
  AND an unfiltered request executes one eligible-showroom projection rather than two identical queries
  AND no hidden filter narrows the marketplace results

Scenario: Attention projection enforces scope
  GIVEN activity exists for tenants A and B
  WHEN tenant A's client requests dashboard attention
  THEN only tenant A counts are returned
  AND platform-only account and unassigned-request counts are absent

Scenario: Sponsored placement remains independent
  GIVEN an eligible showroom placement and a validated external sponsor ad are active
  WHEN public discovery and Daily Featured are projected
  THEN both compete by staff position in the globally ordered five-placement sponsored section
  AND the same sponsor pool remains visible across industry, date, search, and place changes
  AND sponsorship does not alter Daily Featured order or eligibility

Scenario: Visitor selects an available place
  GIVEN an industry has eligible showrooms in multiple regions and cities
  WHEN a visitor selects one projected region or city key
  THEN total, map rows, and nearby groups use the same place predicate
  AND an unknown place key restores the national result instead of changing SQL

Scenario: Public discovery requires an explicit orientation choice
  GIVEN eligible published businesses span multiple industries
  WHEN public discovery receives no industry or an invalid industry
  THEN it returns the de-duplicated combined result with eight allowlisted choices
  AND the UI retains an unset selection so the orientation chooser remains open
  AND no arbitrary value reaches SQL
  AND the Daily Featured Showrooms projection remains scoped to its weekday industry

Scenario: Visitor explicitly keeps all industries
  GIVEN the combined marketplace projection is visible behind the chooser
  WHEN public discovery receives the allowlisted all value
  THEN it returns the same de-duplicated combined rows with All industries selected
  AND no business acquires all as a persisted industry membership

Scenario: Nearby coordinates create bounded map groups
  GIVEN two or more eligible businesses in one reviewed city are within 800 meters
  WHEN the marketplace projection is built
  THEN deterministic balanced nearby groups contain no more than six businesses each
  AND the source coordinates remain unchanged
  AND a business outside the proximity threshold remains an individual map row

Scenario: Cross-listed showroom receives stable visual metadata
  GIVEN one eligible showroom belongs to multiple allowlisted industries
  WHEN public discovery projects that showroom
  THEN its primary visual industry is the earliest canonical membership
  AND every assigned industry can still include it when selected

Scenario: Search suggestions preserve public eligibility
  GIVEN matching private, unpublished, excluded, and eligible public records exist
  WHEN a visitor enters at least two search characters
  THEN at most six suggestions contain only eligible showroom, published offering, and reviewed-place labels
  AND duplicate values are collapsed
  AND selected industry and place scope are preserved

Scenario: Valid live state is projected safely
  GIVEN eligible businesses contain valid and invalid retained live settings
  WHEN discovery is built
  THEN only the valid settings serialize an active platform and destination
  AND invalid live data serializes as inactive with an empty destination

Scenario: Current Daily Featured spotlight remains date-correct
  GIVEN the Ethiopia-local time is inside today's walkthrough window
  WHEN a visitor previews any program date
  THEN featuredNowBusinessId identifies today's deterministic current booth
  AND no business is identified before or after the walkthrough window
```

## Quality impact

- Tenant/security boundaries are enforced before SQL construction.
- Queries return counts only and log no customer content.
- Additive migration and default preserve retained data.
- Public query plans use the existing eligibility indexes plus the new scale
  index and do not execute a duplicate public List query.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Migration default/check/index | migration | `scripts/test-migrations.ts`, `scripts/test-discovery.ts` |
| Required-industry and selected-industry map scope | integration | `scripts/test-discovery.ts`, `scripts/test-scalable-queries.ts` |
| Attention tenant/role scope | security/integration | `scripts/test-support.ts`, `scripts/test-security.ts` |
| Sponsorship persistence, place filtering, and Daily Featured separation | integration | `scripts/test-discovery.ts` |

## Rollout and rollback

DEP-020 applies migrations 25 through 29 before the new filters and programs are
served. Application rollback ignores the retained additive column and tables.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Verification evidence

Prior evidence: completed locally on 2026-08-02. Migration 25, allowlisted scale composition,
query plans, pagination, fixture counts, and role/tenant-scoped attention
aggregates passed `scripts/test-discovery.ts`, `scripts/test-scalable-queries.ts`,
`scripts/test-scale-fixtures.ts`, `scripts/test-support.ts`, `npm run check`, the
10/10 acceptance suite, and `npm run release`.

Prior evidence: migration 26 and the sponsored/Sunday projection extension completed locally on
2026-08-02. `scripts/test-discovery.ts` proves independent persistence,
allowlisted Sunday assignments, paid ordering, six-week rotation and loop,
future redaction, and today-only curated reveal. `scripts/test-scale-fixtures.ts`
proves five sponsored and five Sunday fixtures in every industry. `npm run
check`, the ordered 10/10 production-browser suite, and `npm run release` passed.

Reopened on 2026-08-09 for additive migrations 27 through 30, seven stable
industry days, legacy Sunday-program retirement, exact server-side region/city
filtering, and the five-business global sponsor pool. Focused discovery,
scale-fixture, revision-migration, homepage, narrative, type, and spec evidence
passes; visual approval and full release evidence remain pending.

Focused evidence on 2026-08-10 adds the allowlisted all-industry projection.
`npm run test:discovery` proves omitted and explicit `all` state equivalence,
cross-list de-duplication, combined place options and totals, five-row List
pagination, selected-industry narrowing, and weekday-program independence.
Type, homepage contract, and specification validation also pass. Full release
evidence remains pending visual approval.

The 2026-08-10 autocomplete extension passes focused integration evidence for
eligible showroom, published-offering, and reviewed-place suggestions. Tests
prove the two-character threshold, six-result limit, duplicate collapse,
industry scoping, and denial of excluded or unpublished content. Type,
homepage-contract, and specification checks also pass.
