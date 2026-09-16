---
id: BE-036
title: Suqpage names with persisted-state compatibility
status: done
related: [DEP-033, BE-035, FE-038, DEP-032, ADR-0021]
owners: [backend, security, operations]
last_updated: 2026-09-14
change_level: L3
---

# BE-036 — Suqpage names with persisted-state compatibility

## Problem and scope

The owner requests Suqpage naming throughout code, configuration, documents and
platform-owned database data without breaking the deployed platform. Names are
not permission to replace tenant data, account emails, identities or backups.

## Scenarios

- GIVEN only legacy deployment environment keys WHEN the renamed runtime starts
  THEN its typed configuration resolves the same providers and credentials.
- GIVEN an explicitly configured SUQPAGE key, including an empty/disabled value,
  WHEN both namespaces exist THEN the canonical key wins without secret logging.
- GIVEN a legacy session, visitor or support cookie WHEN the renamed application
  receives it THEN the same authorization checks apply; new cookies use Suqpage
  names and logout revokes/clears both names.
- GIVEN an existing tenant cart or discovery navigation state WHEN opened after
  upgrade THEN state migrates to its Suqpage key without crossing tenants or
  publishing private-preview state; blocked storage still fails safely.
- GIVEN original account emails, identity links, tenant records and backup files
  WHEN naming changes apply THEN their identities and bytes remain intact.
- GIVEN a versioned database WHEN migrations 44–45 runs THEN the platform-owned
  support requester default becomes Suqpage, existing records stay intact, and
  repeated migration is a no-op. No table or database reset is permitted.

## Test plan

Focused canonical/legacy environment precedence, persisted browser-state and
cookie compatibility tests; PostgreSQL migration/default/idempotency and existing
record preservation. Core/security, operations, build and current acceptance gates.

## Rollout

Use canonical names for new source/configuration and explicit compatibility for
persisted names. Provisioned database login, local Supabase project/volume, Storage
bucket and live origin are connection identifiers; retain them where changing
identity would disconnect existing resources. DEP-032 records every exception.
No account-email, Auth-provider-secret or backup rewrite. Master sections 2, 11,
15, 17, 22 and the master filename/references are affected.

## Subscription-label completeness

Migration 45 also changes the platform-owned subscription default and insert
trigger to `Suqpage monthly`. Exact old standard plan labels become that canonical
label; custom plan names, prices, dates, account/tenant identities and all other
values remain unchanged. Regression tests and backup rehearsal compare expected
label-only changes and prove idempotency. Master sections 11 and 17 are affected.

## Evidence

Evidence: 2026-09-14 `test:platform-naming`, final typecheck and clean `release`
pass. Eight isolated browser scenarios pass, including legacy saved inquiry and
asset rewrites. The core chain passed through signup; its final invitation query
timed out during simultaneous packaging, then passed unchanged in both the clean
release and a focused retry. Migration 44–45 rehearsal restored the approved backup
and preserved all 50 original table projections except exact standard-plan names;
custom plan/amount regression and idempotency pass. Local schema is 45.
