---
id: BE-012
title: Expo administration operations
status: done
related: [BE-011, BE-015, FE-011, DEP-010]
owners: [backend, security]
last_updated: 2026-07-29
change_level: L2
---

# BE-012 — Expo administration operations

## Problem and outcome

The Daily Bazaar needs server-side admin operations so platform staff can adjust
themes, booth profiles, and manual coordinates without bypassing validation. The
outcome is a narrow application boundary for safe Bazaar administration.

## Accepted Expo profile revision

- Booth-profile mutation accepts city, region, latitude, longitude, Industry
  keys, booth image path, featured, and excluded.
- Latitude must be within `[-90, 90]`, longitude within `[-180, 180]`, and booth
  paths must use an approved public application path.
- Eligibility is derived server-side and returned with human-readable missing
  requirements; the browser does not decide participation.
- Regeneration recomputes regional hubs for a new occurrence but preserves
  assignments for an existing occurrence unless an administrator explicitly
  regenerates after profile changes.
- Existing manual floor-coordinate operations become legacy compatibility
  behavior and are not presented in the geographic Expo UI.

## Scope

### In scope

- Read model for Bazaar administration state.
- Update one Bazaar theme's display/configuration fields.
- Update one business's Bazaar booth profile.
- Update one current booth's manual placement within floor bounds.
- Rerun current Bazaar generation idempotently after configuration changes.
- Audit-safe mutation result data.

### Non-goals

- Billing, paid campaign lifecycle, or impression/click reporting.
- Upload, verification, or re-encoding of new booth image files.
- Multi-instance scheduler locks.
- Arbitrary SQL or JSON editing in admin forms.

## Domain language and invariants

- Theme industry keys are simple lowercase slugs separated by commas in the
  admin form and stored as JSON arrays.
- Booth profile mutations are scoped by business ID.
- Coordinate mutations are scoped by booth ID and cannot move a booth outside
  the floor.
- Rerunning current generation must preserve existing manual coordinates.

## Contracts

```ts
listBazaarAdminState(): BazaarAdminState
updateBazaarTheme(input: BazaarThemeUpdate): BazaarMutationResult
updateBazaarBoothProfile(input: BazaarBoothProfileUpdate): BazaarMutationResult
updateBazaarBoothPlacement(input: BazaarBoothPlacementUpdate): BazaarMutationResult
```

Server actions own authorization and redirect UX. Domain/application functions
own parsing, validation, transactions, and public route revalidation inputs.

## Scenarios

```gherkin
Scenario: Theme update normalizes industry keys
  GIVEN a theme update contains spaced comma-separated keys
  WHEN the update succeeds
  THEN keys are stored as a deduplicated JSON string array

Scenario: Booth placement rejects out-of-bounds coordinates
  GIVEN a current booth exists
  WHEN an administrator submits a negative x coordinate
  THEN the operation rejects the command
  AND the stored coordinate remains unchanged

Scenario: Excluded booth disappears after regeneration
  GIVEN an administrator excludes a booth profile
  WHEN current Bazaar generation reruns
  THEN the existing booth record is marked excluded
  AND public booth data omits it
```

## Quality impact

- Security and tenant isolation: route/actions require `platform:admin`; updates
  use server-loaded IDs rather than trusting client authority.
- Privacy and data retention: only public Bazaar/display metadata is mutated.
- Accessibility and responsive behavior: backend supplies bounded values for
  labeled admin controls.
- Localization and merchant-entered values: business text remains unchanged.
- Performance and limits: mutations are one theme/profile/booth at a time.
- Failure recovery and idempotency: reruns and repeated saves are safe.

## Observability

Audit actor ID, theme ID, business ID, booth ID, changed fields, and safe error
category. Do not log raw private media bytes, contacts, or request text.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Theme/profile/placement happy path | integration | `scripts/test-bazaar.ts` |
| Invalid coordinate and invalid theme rejection | integration | `scripts/test-bazaar.ts` |
| Admin action route coverage | acceptance | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Operations are additive over BE-011 tables. Rollback removes server actions and
the admin page; existing theme/profile/booth rows remain compatible with the
public Bazaar map.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Prior floor evidence (superseded)

Implemented on 2026-07-26 with Bazaar admin read/mutation helpers in
`lib/bazaar.ts` and platform-admin server actions in `app/staff-actions.ts`.
The implementation validates theme keys, public image paths, featured/excluded
flags, and coordinate bounds while preserving idempotent current-Bazaar
generation.

Evidence:

- `npm run validate:specs`
- `npm run typecheck`
- `npm run test:bazaar`
- `npm run test:acceptance` passed 9/9.
- `npm run check`

Known limitation: new booth image upload/approval remains out of scope; the
admin can point a booth at an existing public app media path.

## Completion evidence

The Expo profile revision was implemented and verified on 2026-07-29.
Platform-admin actions validate approved local booth paths, Industry keys,
city, region, WGS84 latitude/longitude, featured/excluded state, and explicit
hub regeneration. Public eligibility remains server-derived.

Evidence: `npm run test:bazaar`, `npm run test:expo`, `npm run check`,
`npm run test:acceptance` (10/10), and `npm run release` passed.
