---
id: DEP-054
title: Dedicated recurring demo scenario service
status: ready
related: [BE-067, FE-079, ADR-0034, DEP-045, DEP-046, DEP-052, BE-065]
owners: [operations, backend, security]
last_updated: 2026-11-14
change_level: L4
---

# DEP-054 — Dedicated recurring demo scenario service

## Problem and outcome

Early visitors need visible coherent marketplace activity and the team needs
repeatable persistence-to-UI verification without changing real accounts. Deploy
the bounded scenario service and independently qualify its scheduled effects.

## Runtime and identity

Use a dedicated Netlify scheduled function on the existing AfricMade site,
separate from `attention-worker`. Run once per minute in production only, with
bounded stages/deadline and existing server-only PostgreSQL application ports.
Do not provision a VM, add production management tokens, share notification
execution budgets, enable previews against production or invent an HTTP trigger.

Control/enrollment starts disabled. Independently verify Supabase project
`sjeiiqxgscuqajpgddcc` / AfricMade and Netlify site
`26c795eb-5560-4a88-b38d-3cc922c2a5e6` / africmade before hosted changes. Verify the
current schema and BE-065 metadata/privilege hardening equivalence; source
migration 81 and hosted application ledger must be reconciled deliberately.
Never run config push, seed/reset, Auth/SMTP or credential writes for this task.

## Budgets and observability

The owner requires visible activity about every minute, with accelerated coherent
timelines and foreground UI refresh. Start a small reviewed active cohort and
at most two due stages per tick. Bound per-day writes, database size, query and
function duration; measure actual retained snapshot growth rather than assuming
unlimited free capacity. Do not expand provider storage/billing or delete public
history as automatic cleanup. A budget/authority/schema failure pauses demo work.

Record source/deployment identity where available, scenario/stage/run slot,
generic result/category, counts, versions and durations. Keep owner identities,
contacts, baselines, customer data and credentials out of general logs/public
health. Retain only seven days of disposable run telemetry; immutable application
publications and all real-account history are outside that retention.

## Ordered rollout

1. Prove full timelines, mixed-data/new-signup exclusion, ownership/flag/product
   drift, replay/overlap, failure rollback, private privileges and budgets on
   disposable PostgreSQL. Verify normal API/public revision projection.
2. Exercise actual web/phone/Expo/native open-screen changes, draft/selection and
   visibility/race recovery. Review source-bound screenshots and authoritative
   outcomes. Pass spec/type/build/security/operations/acceptance and required CI.
3. Prepare an exact hosted plan with protected schema/privilege/data before-images,
   current target and preserved-real-account fingerprints. Integrate qualified
   compatible source through protection and automatic Netlify main publishing.
   Verify published source and healthy public API on the existing80/81 ledger;
   the worker returns schema/not-ready before reading or writing its private state.
4. Apply the additive schema sequentially through the migration mechanism, with
   the control disabled. Verify82, private privileges and healthy public reads.
   This code-before-schema order preserves readiness because the earlier app
   deliberately refuses a future82 ledger. Verify the published function schedule.
5. Enroll only exact reviewed marked demos/owner identities/products with baseline
   and version fences. Exclude private reviewer, inactive and all real accounts.
   Stage and inspect a coherent canary, then enable bounded recurring execution
   under the owner's standing task authorization. No repeated routine approval.
6. Independently read back multiple scheduled runs, persisted coordinated facts,
   fresh public API and already-open web/native rendering. Measure latency and
   confirm real-account/customer/contact/Auth/notification preservation.

## Failures and rollback

Disable the server-only control to stop further demo writes. Preserve previous
publications and run evidence; code rollback never restores past data. A failed
or ambiguous hosted mutation stops further writes for exact diagnosis; never
bulk restore or repeat a seed. Any later baseline restoration uses reviewed
ordinary commands and fresh version/identity checks, never historical-row edits.
Normal customer signup/use remains available while demo work is paused.

## Scenarios

Scenario: Safe recurring production activity

GIVEN the exact verified site/project and admitted enrolled demos WHEN a scheduled
stage commits THEN stored facts, public API and open screens agree, real data is
unchanged and run/version/latency evidence is retained. GIVEN drift or budget
exhaustion WHEN a tick runs THEN demo writes pause without blocking real accounts.

## Readiness and test plan

BE-067/FE-079 define scope and acceptance. The field/scenario inventory and current
storage measurements are in the operating document. Mapped domain, PostgreSQL,
browser/native, worker and operations checks qualify implementation; exact hosted
receipts qualify deployment separately. This ready plan is not a claim that the
service, migration or production enrollment already exists.
