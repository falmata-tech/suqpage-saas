---
id: FE-011
title: Expo administration controls
status: done
related: [FE-010, FE-017, BE-012, DEP-010]
owners: [product, frontend]
last_updated: 2026-07-29
change_level: L2
---

# FE-011 — Expo administration controls

## Problem and outcome

Platform administrators need a dashboard surface to adjust the Daily Bazaar
without editing SQLite directly. The outcome is a minimal admin UI for theme
configuration, booth eligibility, featured flags, exclusion flags, and manual
coordinates for the current Bazaar.

## Accepted Expo profile revision

- Public and dashboard labels use Expo.
- Each business profile exposes labeled fields for approved booth image path,
  city, region, latitude, longitude, Industry keys, featured, and excluded.
- The page shows an explicit eligible/ineligible state and names missing
  requirements.
- Coordinates use WGS84 decimal degrees and are validated server-side.
- Saving an incomplete profile is allowed, but it remains excluded from
  occurrence generation until booth media and location are complete.
- The current occurrence table shows true origin and assigned regional hub.
- Saving or regenerating revalidates `/expo` and the homepage.

## Scope

### In scope

- Platform-admin-only dashboard route for Bazaar controls.
- Weekly theme table with name, active flag, start time, timezone, and industry
  key mapping.
- Current booth table with business, industry keys, featured flag, exclusion
  flag, booth image path, fallback style, and current x/y/size coordinates.
- Rerun/regenerate action for the current Bazaar after configuration changes.
- Public `/bazaar` revalidation after saved admin changes.

### Non-goals

- Merchant self-service booth uploads.
- Paid placement billing, invoices, or ad-campaign analytics.
- Rich drag-and-drop admin floor editing.
- Multi-day occurrence archive editing.

## Domain language and invariants

- Admin changes affect Bazaar discovery only; they do not publish or modify a
  business's permanent showroom content.
- Featured and excluded statuses must be visible as explicit administrative
  controls.
- Manual coordinates must stay inside the supported floor bounds.

## Contracts

- Dashboard controls submit through server actions.
- All inputs have labels and safe validation errors.
- Only users with `platform:admin` may reach or mutate the controls.

## Scenarios

```gherkin
Scenario: Administrator updates a booth profile
  GIVEN a platform administrator views Bazaar controls
  WHEN they mark a booth featured and save
  THEN the admin page confirms the change
  AND the public Bazaar can render the booth as featured

Scenario: Non-admin attempts Bazaar controls
  GIVEN a non-admin authenticated user
  WHEN they request the Bazaar administration page
  THEN they are redirected away from the page

Scenario: Administrator enters invalid coordinates
  GIVEN a platform administrator edits a current booth
  WHEN coordinates are outside the floor bounds
  THEN the change is rejected safely
```

## Quality impact

- Security and tenant isolation: platform-admin capability gates every route and
  mutation.
- Privacy and data retention: controls expose public showroom fields and Bazaar
  metadata only.
- Accessibility and responsive behavior: tables remain horizontally scrollable;
  inputs and buttons are labeled.
- Localization and merchant-entered values: business names and handles are
  displayed verbatim and wrap in cells.
- Performance and limits: the Expo profile list uses 20-row server pagination,
  bounded search/status filters, and compact summaries; one business-specific
  route loads the complete authorized edit form.
- Failure recovery and idempotency: saving a form twice does not duplicate
  occurrences or booths.

## Observability

Audit safe fields for theme ID, business ID, booth ID, changed control names,
and actor ID. Do not log private request content or customer contact details.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Platform admin can view and save Bazaar controls | acceptance | `tests/acceptance/app.spec.ts` |
| Admin operations validate bounds and status flags | integration | `scripts/test-bazaar.ts` |
| Non-admin route denial | acceptance/security | `tests/acceptance/app.spec.ts`, `scripts/test-security.ts` |

## Rollout and rollback

The admin route is internal to authenticated platform admins. Rollback removes
the route/actions from the dashboard while additive Bazaar data remains unused.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Prior floor evidence (superseded)

Implemented on 2026-07-26 with `/dashboard/admin/bazaar`, dashboard navigation,
labeled theme/profile/placement forms, public Bazaar revalidation, and browser
coverage for platform-admin save plus public featured preview.

Evidence:

- `npm run validate:specs`
- `npm run typecheck`
- `npm run test:bazaar`
- `npm run test:acceptance` passed 9/9.
- `npm run check`

Known limitation: this is a compact form-based admin surface, not a drag-and-drop
floor editor or paid placement campaign manager.

## Completion evidence

The Expo controls revision was implemented and verified on 2026-07-29. The
platform-admin page exposes every participation requirement, an explicit
eligibility result with missing-field reasons, today's hub/reference/origin,
weekly Industry controls, and explicit occurrence regeneration. Legacy manual
floor placement is no longer presented.

Evidence: `npm run test:acceptance` passed the admin save and public Featured
state scenario as part of 10/10 tests; `npm run test:bazaar`,
`npm run test:expo`, `npm run check`, and `npm run release` passed.
