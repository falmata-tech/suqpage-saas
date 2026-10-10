---
id: BE-053
title: Verified owner-account erasure operations
status: in_progress
related: [FE-055, DEP-044]
owners: [operations, backend, security]
last_updated: 2026-10-09
change_level: L2
---

# BE-053 — Verified account erasure

## Problem, scope and readiness

Complete the existing email deletion-request channel with a rehearsed operator
procedure, not a new public destructive endpoint. Every real request requires
identity verification, a protected recoverable backup, an exact private target
plan and owner approval before applying. General release authorization does not
authorize deleting real accounts. Only an ordinary owner with a single unshared
business and exact immutable provider UUID/email mapping is supported. Staff,
shared tenants and unexpected cross-tenant dependencies stop for separate review.
The operation is recurring, so a narrow tested PostgreSQL recipe is justified.
Master §§11/16/17/22 are affected. No new provider or schema is needed.

## Contract

Read-only inspection binds exact user/business/provider/email and a digest of
all account/tenant rows plus notifications, subscriptions/preferences, invitations,
requests and audit records associated with that identity. Approval and backup
evidence are explicit operator inputs; apply reloads the binding and digest under
transaction locks, rejects drift and removes the scoped records atomically.
Never weaken foreign keys or redirect references to another account. Existing
cascades remove products, inquiries, drafts, publications, visits and support
history. SQL failures roll back and are not reported as success.

Remove and verify the exact managed Auth identity before removing its app binding,
so an old token cannot be offered fresh signup during a partial erasure. The
recipe requires a typed identity-absence port, not an unvalidated caller flag.
After app erasure, remove associated uploaded objects only when no remaining
catalog/attachment references use them, including owner-prefixed orphan uploads.
Verify its former web/native access is denied. Retain a private progress receipt
until every component is verified.
Provider failures or ambiguous outcomes stop further writes and require an exact
recovery decision; partial erasure is never called complete. Guest chats created
without account identity require their own verified conversation reference.

Minimal records required for a documented fraud/security/legal reason may be
retained only under a separate reviewed scope. Restricted backups are not live
accounts; any restoration must reapply recorded deletions before reopening access.
Do not promise instant deletion of provider/backup copies or infer a legal duty.

## Scenarios and acceptance

GIVEN staff/shared tenant/wrong UUID/email WHEN planning THEN reject without writes.
GIVEN approved plan WHEN current binding/data differs THEN refuse before erasure.
GIVEN verified ordinary owner WHEN app erasure runs THEN remove only scoped rows,
including non-FK push preferences/subscriptions, while preserving other tenants.
GIVEN shared media WHEN removing uploads THEN preserve it while still referenced.
GIVEN successful provider erasure THEN old sessions cannot reach an account and the
Auth identity is absent. GIVEN failure THEN preserve evidence, report incomplete
and stop rather than silently retrying or deleting more data.

## Test plan and operations

Focused isolated PostgreSQL, real local Supabase identity/media and tenant/session/
negative tests in scripts/test-account-erasure.ts; runbook in
docs/ACCOUNT-DELETION-OPERATIONS.md. No real account is deleted by the rehearsal.
Complete repository/release gates and truthful privacy/deletion wording precede
store declarations. Email opens a composer, not a sent/deleted confirmation.

## Rollout and recovery

Ship only the operator recipe and request/privacy wording after focused and full
gates. No scheduled purge, destructive schema migration or real-account deletion
is authorized by rollout. Per-request plans and backups remain private; a partial
provider/SQL operation requires a reviewed recovery decision, never automatic
restoration, reference reassignment or a broader erase.

## Complete local gate evidence

2026-10-09: full repository check, isolated clean-install web release, all 11 browser
acceptance workflows, operations and mobile build contracts pass. Protected
receipts: .local/play-s99/gates/. Final privacy-only copy passes five-language
390/320 captures and localization/narrative/geography checks. No production
provisioning, actual customer erasure or Play-delivered install is inferred.
