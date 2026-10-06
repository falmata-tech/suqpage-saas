---
id: FE-054
title: Restrained business storefront accents
status: in_progress
related: [FE-040, FE-053, BE-031, BE-041, BE-044]
owners: [product, frontend]
last_updated: 2026-10-05
change_level: L2
---

# FE-054 — Storefront accent proposal

## Problem and readiness

Owner requests a visual sample before choosing the final treatment. The local
prototype is ready for visual review; production implementation is now authorized by owner approval below. The local implementation below is under verification; hosted behavior is unchanged.
Master sections 5, 7, 11, 15, 18, 19 and 22 would be affected after approval.

## Scenarios — current observable contracts

- GIVEN an owner editing Page WHEN choosing an optional accent THEN the actual
  full storefront preview demonstrates subtle personalization. Signup has no
  color controls and starts at Default.
- GIVEN extreme colors WHEN previewed THEN body text stays neutral and buttons,
  text and focus retain readable contrast. Accent choices never recolor Suqpage
  branding/navigation/map markers/status colors, product photos or video playback.
- GIVEN a hero tint THEN a very light cover-only overlay may apply; identity and
  product images remain unchanged. No tint changes actual uploaded media bytes.
- GIVEN a future save THEN a validated business-level value must persist through
  PostgreSQL, private/public snapshots and native projections with tenant/version
  guards. Defaults preserve existing profiles. No browser snapshot is authority.

## Prototype evidence / non-goals

showroom-projects/accent-personalization-preview/BRIEF.md records the demo asset
rights, exact design constraints and unresolved client review. Prototype served
only on loopback, no account mutations, API additions, schema or hosted changes.
Interactive HTML/CSS uses existing approved illustrative demo assets. No image
provider or third-party dependency. Test keyboard/color extremes, contrast and
1440/390/320 overflow; review screenshots before any persistence implementation.

## Test plan and future rollout

After visual approval, finalize linked backend/FE contracts and add tenant,
validation/default/version, persistence/publication/native parity tests; complete
localization and applicable release gates. Rollback must preserve stored values
while reverting rendering; no current production rollout is authorized here.

## Prototype verification

`showroom-projects/accent-personalization-preview/reviews/check-preview.mjs`
passes seven presets, 4,096 palette samples, 1440/390/320 overflow/touch checks,
custom input validation, keyboard selection, fixed platform branding/product
images and cover tint. See `reviews/REVIEW.md` and `verification.json` in that
project for reviewed captures and limits. These tests validate the visual prototype; production-contract evidence is recorded below.

## Accepted implementation — 2026-10-05

Owner approved all prototype treatments. Definition of Ready is satisfied for
Page-editor selection on web/native (signup selection superseded by A5), fixed 8% cover-poster
tint, cover edge, logo surround, current catalog navigation, contact surface and
inquiry actions. Product photos, playing videos, platform chrome/map/status colors
stay unchanged. No extra tint setting or layout changes.

Persist optional `accentColor` in existing PostgreSQL owner-page draft/publication
content JSON. Empty string explicitly resets to platform default; omission reads
legacy default and preserves an existing selection when older clients save.
Only six-digit hex is admitted, normalized uppercase; reject null, nonstrings,
CSS/functions/URLs. A shared pure palette derives readable ink/inverse/edge roles.
Native public/private DTOs carry the optional value. Existing save/publication
transactions, tenant/consent checks, optimistic versions and refresh invalidation
apply unchanged. Signup validates before creating anything and stores the selected
accent inside the existing starter transaction. No schema migration/backfill.

### Scenarios for implementation

- A1 GIVEN a compatible verified signup API caller WHEN optional color is supplied THEN the
  created private starter page and subsequent editor carry that color; default
  setup stays valid. Invalid input creates no account/business rows.
- A2 GIVEN owner WHEN saving a new color or explicit reset THEN reload/preview and
  public active page/native DTO match; unpublished drafts remain private. Older
  caller omission preserves the current saved selection. Stale, foreign or
  unconsented staff writes cannot change it; publication failure rolls back.
- A3 GIVEN any accepted hex WHEN rendered THEN contrast-safe controls, 8% poster
  tint and bounded accents apply only to that business, with original photos and
  playing video unchanged; absent/reset colors retain existing appearance.
- A4 GIVEN web/native Page editor WHEN choosing presets/custom color THEN labeled
  controls support keyboard/touch, no narrow-screen overflow, clear validation,
  immediate preview and localized UI in all five supported languages.

Test plan: pure validation/palette/property samples and legacy-save regression;
actual PostgreSQL signup/save/publication/foreign/stale tests and native projection;
focused web/native-browser setup/editor/public captures at desktop/390/320.
Owner approval covers prototype visual direction; capture implementation before
full check/release/acceptance gates. No hosted rollout is part of this step.
Rollback rendering may ignore stored accents without dropping data; an older
strict parser must be updated to tolerate the field before a code rollback.

## S52 local evidence (before A5/A6 correction)

A1–A3: scripts/test-storefront-accent.ts passes real isolated PostgreSQL signup,
validation-without-writes, reload/publication/reset, native public/private DTO,
foreign/stale/unconsented-staff rejection, consented staff privacy, publication
rollback and legacy omission preservation. Pure validation checks 4,096 palettes.
The regression is included in npm run check.

A1/A2/A4: scripts/capture-storefront-accent.mjs passes actual web signup, web save
and reload, first publication, native-editor save reflected in web, and original
product photos. Twelve captures at desktop/390/320 live in
.local/storefront-accent-implementation/ with verification.json. Native evidence
is Expo browser, not physical-device validation. 22 owner-page tests, eight
localization tests (1,235 messages per language), web and native typechecks pass.
Full gates/status are recorded in the active checklist before completion.

## S52 gates and limitation (before A5/A6 correction)

Full check, native API suite, both typechecks, production build/trace privacy and
release behavioral/security gates pass. Production-mode acceptance runs two
passing signup/account and video scenarios, including accent save/reload/reset
and no tint over a playing video. The release command fails only its final
existing Expo dependency audit (20 high entries through braces/node-forge).
No audit exception/downgrade, commit, hosted rollout or device build is claimed.
Status remains in_progress until the separate release/commit/device gates close.
See S52 in docs/SUQPAGE-TRANSITION-CHECKLIST.md.

## Current owner correction — 2026-10-05

Supersedes signup/color-code UI above. Color selection belongs only to Page editing,
with the actual whole-page preview visible during selection. Signup collects
identity/business details and starts at Default. Keep the additive backend field
compatible for existing callers; saved choices and tenant/version safeguards remain.

A5 GIVEN web/native signup THEN no color control appears. GIVEN Page color in the
editor WHEN opened THEN the full storefront preview remains visible with live
unsaved color changes and existing Save behavior. No miniature stand-in preview.
A6 GIVEN custom color WHEN chosen visually THEN it updates immediately without
entering/pasting a hex code or a separate Apply step. Web uses its native color
input; native uses visual hue/strength/brightness controls built with existing
SVG/responder capabilities, touch and accessible adjustment buttons. No dependency.
Defaults/presets, 44px targets, disabled states and five-language labels remain.
Focused tests cover pure conversion, signup absence, whole-preview live updates,
save/reload/reset and mobile viewport layouts. Capture for visual approval before
repeating full/release gates. No backend migration or hosted mutation.

### A5/A6 local evidence

`test-visual-color.ts` passes 4,096 RGB/HSV round trips, hue boundaries,
signup-control absence and removal of the code-Apply UI; it runs with
`test:storefront-accent`. Both typechecks and eight localization tests pass.
`capture-storefront-accent.mjs` verifies real default signup, visual custom web
selection in the full preview, save/reload/publication, native visual adjustment
and saved native color reflected on web. Thirteen captures and verification.json
are in `.local/storefront-color-refinement/`. Desktop/390/320 layouts have no
horizontal page overflow; native presets scroll horizontally, and the picker
accounts for the bottom safe area and bounded sheet height. Reviewed screenshots
show the actual storefront behind the native picker and beneath web controls.
The first native capture hit Metro's stale file map; restarting only its preview
server resolved it. The final focused run passes without browser errors.

Corrected visual approval is pending. Updated production acceptance assertions
have not been rerun; full/release gates are not repeated before that review.
Physical-device gesture/OS-color-dialog evidence remains pending. No new package,
migration, production data change, commit or deployment was performed in S53.
