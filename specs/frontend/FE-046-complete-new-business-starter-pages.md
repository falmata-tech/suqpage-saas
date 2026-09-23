---
id: FE-046
title: Complete new business starter pages
status: done
related: [FE-051, FE-038, BE-039, DEP-036, FE-040]
owners: [product, backend, operations]
last_updated: 2026-09-21
change_level: L2
---

# FE-046 — Complete new business starter pages

## Problem, scope and contracts

New owners need a complete editable example rather than an empty page. The owner's
latest instruction explicitly selects ALL newly created business workspaces,
including self-signup and staff invitations. This recurring bootstrap is atomic
with creation. Shared example defaults are persisted per tenant, never injected
as hard-coded runtime tenant content. Existing accounts and demos are untouched.

Populate every currently editable business presentation field: About, cover/logo/
icon, YouTube video, public phone/email/website and all supported social handles,
page/share descriptions, inactive live-session configuration, category and sample
city/region. Include three complete sample offerings: product, service and made-to-
order item, each with name, description, image, video, price, unit, highlights,
category, availability and selectable options. Reuse existing media and inquiry
contracts. Retired intro/capacity/minimum/lead-time fields are not reintroduced.
File chooser controls stay empty by browser design while stored images are shown.
Operational forms (passwords, support messages, search, consent), actual account
identity and authorization fields are never populated with fake values.

Examples are visibly described as examples. New tenants remain private drafts;
no discovery approval, fabricated exact storefront, live-now flag, message or
public publication is created. Initial location is the existing Addis Ababa general
area example, awaiting owner correction and existing admin geographic review.
Default social handles/video illustrate the layout, not verified business accounts.
Private preview retains disabled external contact/inquiry handoffs. No auto-backfill
of existing records, Save/publication redesign or checkout is included.

## Scenarios

- GIVEN a verified new signup WHEN account creation succeeds THEN a saved private
  page and three complete editable offerings exist, all public contact fields are
  filled, and verified account email/phone remain exactly the provided values.
- GIVEN a staff-created invitation WHEN its new business is created THEN the same
  examples exist; accepting the invitation retains that content and edits.
- GIVEN existing content or a repeated bootstrap WHEN initialization is attempted
  THEN it does not overwrite edits, refill intentionally cleared fields or duplicate
  offerings; invalid ownership is denied without changing any tenant.
- GIVEN an insert failure midway through signup/invitation WHEN the transaction
  fails THEN no partial business, user, page, category or offering is retained.
- GIVEN a new starter page WHEN anonymous visitors search or open its handle THEN
  it remains private and its location is absent from the public map.
- GIVEN an owner on desktop or phone WHEN they open the page, business and offering
  editors THEN all applicable presentation values and stored images are populated,
  sample content is explained, and editing/saving/reloading preserves their values.

## Quality, observability and test plan

Existing scoped PostgreSQL transaction port; no new provider or schema migration.
Bounded defaults use validators and existing media namespaces. Generic original
illustrations are sample artwork, not photos of a business. Existing admitted demo
YouTube reference illustrates video only; live third-party playback is not promised.
No network request or notification during initialization. Created page events retain
actor and version; never log personal fields. English sample copy remains editable.

All scenarios map to scripts/test-business-starters.ts plus existing signup and
invitation tests. Browser coverage in scripts/capture-business-starters.ts checks
phone/desktop field completeness, image loading, sample notice, private route denial,
save/reload, tenant denial and preview safety. Typecheck and focused tests precede
visual approval; full check/release/build and acceptance gates follow that approval.

## Rollout and rollback

Deployment must include starter illustrations. Schema 47 is required by the pending
service/place work. No data backfill or persistent database write in this local task.
Rollback code stops future automatic initialization; keep created owner content.
Use the existing protected backup and monitored rollout gates before deployment.

## Readiness

Scope, failure cases, privacy, port, fixtures and rollback are explicit; reciprocal
spec links recorded. User's new-workspace scope resolves this part of S8. Earlier
Save visibility and existing-page fill decisions remain separately pending.

## Evidence

Focused starter, signup, invitation, launch-wiring tests and typecheck pass.
Eighteen desktop/390/320 browser captures verify populated fields, media, private
denial, safe preview and save/reload; three offering accessibility scans pass.
See checklist S8a and `.local/business-starter-review/`. Original PNG illustrations
are included. No actual YouTube playback or hosted provider workflow is claimed.
Visual approval, full check/release/build/acceptance, scoped commit and rollout
remain pending; this spec is not done.

## Evidence: verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.


## S28 local extension — 2026-09-23

FE-051 / BE-043 / DEP-040 supersede S26's required signup handle field: signup
allocates an unused address and opens the populated private page preview.
Handle edits move to Business details, first change immediate then once every
30 days; a platform administrator may override with an audited support reason.
Reserved old handles redirect public product links without bypassing privacy.
New examples reuse admitted fictional ceramics imagery and include two photos
and two YouTube links per offering. Account identity/consent stays real; existing
content is untouched. The Suqpage wordmark has fixed Latin typography in every
locale. Local focused tests/captures are separate from visual/release approval.
