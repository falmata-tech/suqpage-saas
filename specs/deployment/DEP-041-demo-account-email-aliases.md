---
id: DEP-041
title: Demo account inbox aliases
status: done
related: [BE-022, BE-030]
owners: [operations, security]
last_updated: 2026-09-23
change_level: L4
---

# DEP-041 — Demo account inbox aliases

## Problem, scope and readiness

One-time owner-authorized correction of existing local and hosted demonstration
accounts to unique plus aliases of the owner's supplied Gmail inbox. Includes
seeded demo owners and demonstration staff/admin accounts. Real accounts remain
untouched. The inbox and exact account directory stay in protected local evidence,
not application source, public contacts, fixtures or deployment artifacts.
Definition of Ready met: explicit target/account admission, identity invariants,
failure handling and verification below. No app, schema or Auth configuration
change. Master current demo summary and §§6/11 are affected.

## Scenarios

- GIVEN an admitted seeded account with a fake email WHEN corrected THEN its
  canonical email and Supabase email match a unique owner-approved plus alias.
- GIVEN an existing linked identity WHEN corrected THEN its provider UUID, role,
  business ownership, credentials, historical link email and public contacts remain
  intact. Real/non-demo accounts are excluded even when linked to a demo business.
- GIVEN an admitted demo account without a provider identity WHEN corrected THEN
  create a confirmed email identity and immutable canonical link for that account;
  do not create a new application user, tenant or grant additional permissions.
- GIVEN a collision, unexpected account metadata, changed before-image or ambiguous
  provider result WHEN encountered THEN stop further writes and retain the exact
  completed-operation journal; diagnose read-only before any recovery decision.
- GIVEN a completed correction WHEN verified THEN all admitted accounts reconcile
  with Auth and representative owner/staff sessions resolve their existing access;
  no verification emails are sent. Actual inbox delivery remains user-verifiable.

## Rollout and recovery

Independently verify Netlify site/account/domain, Supabase project and database
connection target. Inventory first; admit exact seeded handles, fake email shapes
and expected roles. Preflight aliases against both account stores. Back up affected
email/link/identity before-images privately with owner-only permissions. Record
before/after hashes for unrelated public data, roles and account fields. Rehearse
against disposable local Auth users before local and hosted application.

Update linked Auth users individually, then use guarded canonical SQL updates.
For missing identities use the existing provision-and-link contract and never
reuse an unrelated provider identity. Journal each boundary. Cross-provider writes
are not atomic: a failed or ambiguous boundary stops the operation, without an
automatic bulk restore. Recovery is an exact reviewed email/link plan from protected
before-images; newly created identities are identifiable by operation metadata.
No reset, broad identity migration, provider configuration write or app deployment.
A fresh disposable reset may recreate the original fictional seed emails.

## Test plan

Protected one-time scripts under `.local/demo-account-emails-20260923/` exercise
alias uniqueness, collision and admission rejection, provider UUID preservation,
missing-identity provisioning, role/tenant/link/public-data invariance, replay
protection, full before/after reconciliation and representative no-delivery sessions.
Read-only public health verifies the hosted application remains healthy. Spec
validation and private evidence review complete this operations-only change;
application build/release gates belong to the separate pending feature rollout.

## Evidence

Evidence: `docs/SUQPAGE-DEMO-ACCOUNT-ACCESS.md` and protected target-specific
`*-verified.json` / `*-sessions-verified.json` receipts. All 79 local and 77 hosted
demo accounts reconcile; 32/30 missing links are provisioned. Real accounts,
existing provider UUIDs, historical links, account invariants and 13 public/role
tables are preserved per target. Five role/provisioning session paths per target
pass through the actual app OTP verifier, dashboard and sign-out; health is 200.
Admission/collision/length tests and spec validation (154 isolated / 160 working) pass. No delivery API
invoked, configuration changed, application deployed or schema migrated.
