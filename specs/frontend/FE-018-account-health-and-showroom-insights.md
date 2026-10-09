---
id: FE-018
title: Showroom insights and retired renewal screens
status: in_progress
related: [FE-021, FE-032, BE-017, BE-015, DEP-015, ADR-0010, ADR-0011]
owners: [frontend, operations]
last_updated: 2026-10-07
change_level: L3
---

# FE-018 — showroom insights without business billing

## Problem and scope

Business owners see useful visit/inquiry/offering counts without plans,
subscriptions, renewal dates, payment controls or upgrade prompts. Transport
arrangement is the only Suqpage revenue service. Product prices, transport chat
and customer/business transactions stay unchanged; no new fees or integrations.

## Scenarios

GIVEN an owner or administrator WHEN opening web/native workspace navigation,
Profile or platform overview THEN no business plan/subscription/payment/renewal
control is displayed. GIVEN an old `/dashboard/account-health` bookmark THEN
require authentication and redirect to the actor's workspace without billing UI.
GIVEN a customer or owner WHEN browsing a public showroom or its aggregate stats
THEN publication and analytics do not depend on historical ledger dates.
GIVEN an unauthorized tenant or queue agent THEN analytics authority is unchanged.

## Quality and readiness

Reuse existing Profile/overview and aggregate APIs. No replacement revenue screen,
empty billing panel or new mobile workflow. Desktop/phone layout and all five
languages retain existing meaningful labels; historical unused translations cannot
create a visible feature. Ready before implementation in S89.

## Test plan and evidence

BE-017 migration/security/analytics regression passes. Focused admin/owner browser
states must verify no renewal navigation/card/action and useful statistics remain;
old bookmark redirects and no horizontal overflow. Mobile Profile still uses the
same owner/home activity projection. Actual admin old-bookmark/no-renewal navigation capture passes locally.
Visual review precedes full/release gates.

## Rollout

Remove current payment server action and navigation as one web release; native
source has no plan/subscription UI. Forward migration 60 stops automatic ledger
creation without erasing old data. Hosted web/API and replacement APK remain
separately gated; no deployment or native-device claim from local browser evidence.
