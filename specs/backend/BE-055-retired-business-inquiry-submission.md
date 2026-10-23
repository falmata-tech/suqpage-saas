---
id: BE-055
title: Retired public business-inquiry submission with preserved history
status: in_progress
related: [BE-062, FE-075, BE-032, FE-066, DEP-045, BE-001, BE-044, BE-050]
owners: [backend, security]
last_updated: 2026-10-17
change_level: L2
---

# BE-055 — Retired business inbox submission

## S154 planned replacement — FE-075 / BE-062

The owner now restores on-platform inquiries as the primary asynchronous business
contact path. [FE-075](../frontend/FE-075-primary-business-inquiries-and-owner-inbox.md)
and [BE-062](../backend/BE-062-canonical-inquiry-intake-and-owner-inbox.md) control
that replacement. This retirement contract describes the currently deployed
behavior until the coordinated new implementation is qualified and released;
its older scenarios do not override the new accepted product intent. Preserve
Transport, owner Support, contact validation and historical tenant isolation.


## S118 — public demo contact projection (ready)

FE-066/DEP-045 explicitly approve owned demo SMS/WhatsApp/Telegram destinations.
A pure policy derives a typed per-method permission array from canonical demo
status, effective validated public contacts and an explicit normalized operator
phone setting. Public adapters discard any snapshot-supplied permission metadata
and derive it afresh server-side. No private-contact fallback, raw client trust,
hardcoded destination or exposure of unrelated runtime settings. Missing/malformed
configuration denies demo inbox launches; non-demo contact behavior is unchanged.
Telegram accepts existing usernames or explicit E164 +phone links, with matching
exact-host native parsing. Direct Suqpage inquiry endpoints remain retired and
transport/support unchanged. No schema change is needed; DEP-045 controls exact
contact data correction and current publication appends with preserved history.
Test forged/stale metadata, mismatched/blank/invalid setting, field clears,
non-demo independence and public/private data boundaries before visual/full gates.
The approved public-method projection also permits S118's exact provider-owned
profile examples (`tiktok`, `instagram`, `facebookapp`) and `https://example.com/`
for marked demos. This wider public-link permission does not widen the inquiry
provider set beyond SMS/WhatsApp/Telegram; unrecognized demo profiles/sites fail
closed. Ignore approval arrays stored in untrusted or historical snapshots.
The exact approved public profile/site examples do not require the phone setting;
they confer no inbox or email permission.

## S118 locally verified evidence — October 17, 2026

`test-demo-inquiry-policy.ts` passes four policy/projection/actual web-footer
tests. Effective published public contacts determine fresh server-derived
`approvedDemoContactMethods`; forged/stale snapshot permissions, empty contacts,
mismatched or malformed phone configuration, fake email, lookalike sites and
unverified profiles cannot grant a launch. Exact provider-owned `tiktok`,
`instagram`, `facebookapp` and `https://example.com/` are separately allowed only
as public profile/site links. Telegram phone parsing and the exact-host native
handler preserve the recipient/draft while rejecting invite hashes and unsupported
parameters. No private sign-in/contact value becomes public authority.

The final S118 combined focused run passes 92 tests plus 17 localization tests;
both typechecks pass. Contact component and link-policy tests exercise real and
approved-demo handoffs with controlled clipboard/open ports and no messages sent.
DEP-045's separate local phone and profile readbacks each verify 67 canonical
businesses/drafts and 66 current public/catalog projections, protected records and
immutable historical rows; the private reviewer stays draft. The two verification
receipts remain under `.local/contact-workspace-s118/`. No hosted data, Android
rollout or new permission to historical inquiry records is implied. Visual
approval, full/release/acceptance gates and a scoped commit remain pending.

## Problem, contract and readiness

Only public business-inquiry creation is retired. Existing canonical persistence
and protected history remain for recovery/audit. First-publication contact readiness and all external contact values keep their
pre-S105 contract under the explicit S106 correction. No migration, destructive data
operation, transport-chat change or owner-support change is authorized.
Ready: web POST /api/inquiries and native POST /api/mobile/v1/inquiries are the
two public adapters; they must return 410 with stable code inquiry_retired and
safe social-contact guidance before reading a body or accessing persistence.
Responses are no-store. No inquiry rows, notifications or success states result.

## Scenarios and acceptance criteria

1. GIVEN an old or forged caller WHEN posting any body to either public adapter
   THEN return 410 inquiry_retired, create no row/event and schedule no notification.
2. GIVEN retained inquiries WHEN an authenticated owner/admin reads or updates
   authorized history THEN existing scope/validation still applies; another owner
   is denied. Retiring submission grants no new history access.
3. GIVEN public transport or authenticated owner support WHEN starting, replying,
   assigning, reading or ending THEN existing live contracts still work. No shared
   support handler is disabled as part of this feature.

## Test plan and rollout

Focused HTTP tests call real adapters with valid and malformed bodies and compare
local inquiry/event counts. Existing tenant security and support tests remain.
FE-066 supplies browser/localization evidence. No full release gates until visual
approval. A coordinated web/API then native rollout denies stale submissions;
historical records and existing transports survive application rollback.


## Focused local evidence — review pending

- `npm run test:product-inquiry`: 9 product/message/readiness tests, 2 retired
  adapter tests and 2 browser clipboard failure/cleanup tests pass.
- `scripts/test-mobile-api.ts`: retained history, scoped owner mutations,
  foreign-product denial, support and buying/transport compatibility pass.
- `scripts/test-live-transport.ts`: live replies, assignment, capacity, private
  notes, token isolation, end/history/resolution/reopen pass unchanged.
- `scripts/test-launch-clarity.ts` and `scripts/test-self-service-publication.ts`:
  real first-publication social contacts, tenant scope and atomicity pass.
- Both typechecks, 1,474-message localization, 196-spec validation, narrative,
  prepared listing/campaign and PWA contracts pass. Whitespace check passes.
- `.local/social-contact-s105/screens/evidence.json`: final stable-source 32
  desktop/phone web/Expo states; real local HTTP denials leave inquiry/event counts
  unchanged. All five social destinations are isolated externally by Playwright;
  no messages are sent. Empty-account/demos and denied-copy/blocked-popup paths
  pass on both clients. Test fixtures/identities are removed.
- `.local/social-contact-s105/copy-screens/`: 74 shared-copy language/layout
  states pass. No installed Android, provider publication or production rollout
  is claimed. Visual approval, full gates and scoped commit remain outstanding.


## Historical S106 focused evidence — demo restriction superseded by S118

Owner correction restores original contact configuration and first-publication
rules. `scripts/test-product-inquiry.ts` covers phone-only publication, retained
sample-contact rejection, encoded external messages and all five languages.
`capture-social-contact-workflows.mjs` supports an explicit local output/locale
scope: 32 five-language states plus 18 final targeted states pass, including a
real native owner login/edit screen with all eight fields. Social taps overwrite
the clipboard without prior manual copying, including the selected-cart footer.
Manual copy remains optional. Demos display configured choices disabled; no fake
contact opens. The reported URL passes network-loss/reconnection without runtime
errors. Evidence lives under .local/contact-repair-s106/. Earlier S105-only
field/publication restrictions are superseded. Full gates and actual visual
approval remain pending; no deployment or installed-device pass is claimed.
