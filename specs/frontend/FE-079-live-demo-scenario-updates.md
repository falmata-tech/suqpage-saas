---
id: FE-079
title: Visible scenario updates in public marketplace screens
status: in_progress
related: [BE-067, DEP-054, ADR-0034, FE-053, FE-065, FE-066, FE-075]
owners: [frontend, product, security]
last_updated: 2026-11-14
change_level: L3
---

# FE-079 — Visible scenario updates in public marketplace screens

## Problem, outcome and scope

Users see frequent, coordinated demo business/product changes after real backend
stage commits. Demo identity comes from the authoritative server flag, never a
handle prefix. Preserve inquiry drafts/selections, navigation, focus, scrolling
and independent business/product searches. Existing real businesses retain their
data and use the same visibility-filtered public reading capability.

## Foreground refresh contract

- Public showroom/product/inquiry data observes a fingerprint containing both
  business content version and current public page revision. It refreshes the
  ordinary API/server projection on change; no locally invented scenario values.
- Poll at a bounded 15-second foreground cadence, one admitted request at a time.
  Stop hidden/background/blurred native scopes and departed handles. Abort/fence
  late reads, preserve a newer acknowledged state and back off failures. Resume
  current-scope recovery on return. This is polling, not a claimed Supabase
  Realtime subscription.
- Marketplace first-page data refreshes quietly while its pane is active without
  resetting search/filter/map state or replacing the screen with a skeleton.
  Retained deeper pagination offers an explicit refresh when new results appear;
  do not silently discard loaded pages or jump the reader's scroll position.
- Price, availability, unit/minimum/capacity/lead-time summaries and public profile
  text update together from authoritative projections. Canonical product IDs stay
  stable. Unavailable/hidden products cannot remain falsely inquirable.
- Preserve a visitor's edited Inbox message across automatic catalog refresh.
  Reconcile stored product/options through current ordinary selection rules; never
  replace a direct item with an unrelated saved group or submit automatically.
- Keep example labels and product categories visually separate, and use sensible
  selling-unit nouns in newly initialized demo fixtures.
- Keep existing external contact approval and the owned demo number unchanged.
  Demo labels remain clear; a real business is not labeled by its name/handle.

## Scenarios

GIVEN an open showroom/native product and a committed demo stage WHEN the next
foreground refresh completes THEN the visible facts match the fresh public API
within the admitted poll/request time, without navigating away or losing a draft.

GIVEN an unchanged business content version and a new public page revision WHEN
the screen refreshes THEN its displayed business description updates. A private draft does
not become visible. GIVEN an old/departed or cancelled response THEN it cannot
replace the current resource.

GIVEN Market search, map and pagination state WHEN background data changes THEN
first-page facts update quietly; deeper loaded results remain available until
explicit refresh. The inactive pane makes no recurring reads.

GIVEN hidden/background/offline/revoked state WHEN polling would run THEN request
growth is bounded, failures recover visibly where appropriate, and no stale
private/foreign business data appears. No outgoing message is sent by a refresh.

## Test plan and quality

Extend actual React lifecycle/resource and marketplace retention tests for timing,
visibility, errors, stale results and mutation races. Add actual Chrome desktop/
phone and Expo/native scenario journeys using ordinary write ports and real local
API/database outcomes. Inspect screenshots/readability and record a source-bound
visual decision before full gates. Cover enabled languages and preserve merchant
content verbatim; reuse existing refresh/loading text where possible.

## Rollout and rollback

Production verification observes only enrolled demo changes and current public
reads. Physical-device/Auth/push/Play evidence remains separately qualified.
DEP-054 controls rollout/rollback; disabling demo writes does not disable normal
public reading or restore old customer data. Definition of Ready is satisfied.

Native evidence: DEP-053 driver plus `scripts/native-qa-demo.ts` advances the
source-bound disposable scenario while the product screen remains open, checks
actual Limited availability rendering and saves authoritative readback.
