---
id: BE-047
title: Canonical business city in signup transaction
status: in_progress
related: [BE-049, FE-059, BE-031, BE-038, BE-041, FE-051, BE-044, DEP-042]
owners: [backend, security]
last_updated: 2026-10-07
change_level: L2
---

# BE-047 — Canonical business city in signup transaction

## Problem

An assumed starter city misrepresents the owner's location and undermines map
discovery. Signup must use the chosen known city without accepting forged GPS.

## Contract

The existing web/native signup body gains required placeId. Validate a bounded
string against the server's known-place catalog before any writes. Native allowlist
admits only this field, not city/region/lat/lon authority. SignupInput carries the
canonical place value; initialize the new starter/location proposal/business
anchor within the existing account/business/identity transaction. City and region
are factual chosen values, not editable sample defaults. Area mode remains
approximate and never claims a street address. Existing starter initialization
for non-signup internal/test paths may retain its explicit existing default;
public signup always supplies a validated city. No schema migration.

## Scenarios

- GIVEN a verified unlinked identity and valid city WHEN creating its workspace
  THEN business and owner location city/region/place ID/anchor match the server
  catalog, private sample remains unpublished and identity/contact rules remain.
- GIVEN missing, oversized, unknown or forged place input WHEN signup is attempted
  THEN reject with 400 before creating any business/user/location/identity link.
- GIVEN a second signup or handle conflict WHEN creation fails THEN no partial
  city/account changes are committed; existing accounts/locations stay unchanged.
- GIVEN same-city area shops WHEN map projection runs THEN existing deterministic
  offsets apply on both clients without modifying saved city/GPS coordinates.

## Test plan

`scripts/test-signup.ts` covers parser, real PostgreSQL creation/rollback/privacy,
city fields and replay conflicts. `scripts/test-mobile-api.ts` covers strict body
field rejection and saved owner/public map projection. Existing location/offset
tests plus FE-059 browser capture map the visual selection and initial preview.
No external service, raw address logs or new database permission is introduced.

Eight-category persistence regression (BE-049): `other-manufacturing` is a valid
owner setup choice, not one of the seven public discovery filters. Retain that
declared category and canonical city, but write no foreign public-industry tag.
These businesses remain eligible for All categories, text search and map discovery
after publication. Apply the same rule to later owner location/category saves and
pending setup publication; retain the seven-filter public taxonomy and schema.
GIVEN Other products & services WHEN signup/save/publication runs THEN no foreign
key failure or partial setup occurs, category/city remain saved and All-category
discovery includes the business with a neutral category. Test with actual
PostgreSQL in `test-business-starters.ts` and `test-self-service-publication.ts`.

## Rollout

Web/API/new native signup release must align; old APKs cannot supply required city
and need update for new-account setup. Existing account access remains unaffected.
Keep chosen location on rollback; do not relocate any existing business. No schema
change or production write until visual/release gates and DEP-042 admission pass.
