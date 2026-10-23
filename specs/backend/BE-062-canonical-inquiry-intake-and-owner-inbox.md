---
id: BE-062
title: Canonical public inquiry intake and private owner Inbox
status: ready
related: [FE-075, BE-001, BE-044, BE-050, BE-055, FE-066, FE-062, DEP-027, DEP-049]
owners: [backend, security]
last_updated: 2026-10-21
change_level: L2
---

# BE-062 — Canonical public inquiry intake and private owner Inbox

## Problem, outcome and compatibility

S154 restores first-party asynchronous business inquiry submission and private
owner handling. UI channel choice is equally prominent with configured
WhatsApp/Telegram on phones; name/phone validation applies only to a MirtPage
submission, not an external handoff. This replaces BE-055's public410 contract only when the new
application is released. Preserve the existing inquiries/items, tenant boundary,
status vocabulary and attention infrastructure. Transport/owner Support are not
inquiry adapters and remain unchanged. No guest live chat, reply/status portal,
phone verification claim, account requirement, payment or inventory reservation.

## Public command and bounds

Web POST /api/inquiries and native POST /api/mobile/v1/inquiries adapt the same
application command: businessId, customerName, contact, contactMethod=phone,
note, items, idempotencyKey and the existing website honeypot. Selected items
contain productId, optional quantity intent and option-name/value references.
Business/general contact allows0items; product/list intake allows up to20.

| Input | Contract |
|---|---|
| Customer name | Required single Unicode name, normalized/trimmed,1–80 characters |
| Contact | Required format-tolerant phone,7–15 normalized digits; optional initial+ |
| Message/note | Required editable text,1–10,000 characters; preserve normal line breaks |
| Selections |0–20 unique product/option combinations, one target tenant |
| Quantity intent | Optional text,≤80 characters; never stock/reservation authority |
| Options | Only current canonical group names and valid values, fully selected |
| Idempotency key | Existing bounded10–100-character safe key; random key from UI |
| HTTP body | Route-specific128KiB streamed and declared limit; other APIs unchanged |

Reject malformed JSON, unknown fields/types, invalid limits and prototype-key
forgery without persistence. Reject oversize input rather than silently truncate.
Browser uses same-origin/CSRF controls; native retains BE-044 origin/CORS rules.
Responses and private Inbox data are no-store. Private phone/message never enter
URLs, public catalogs, analytics/general logs or browser/device storage.

## Canonical transaction and idempotency

- A target must be active and publicly eligible. A private/unpublished/disabled
  business cannot accept an anonymous inquiry simply because its numeric ID exists.
- Product IDs, current public visibility, product-only kind, available/limited
  state and selected options must be validated against the same effective public
  catalog plus canonical records. Never trust names/availability/contact/permission
  metadata supplied by a client or an old stored selection.
- Validate and save consistently inside the transaction, with sufficient row/
  publication locking to prevent a product/options/visibility race. A foreign,
  deleted, retired service or unavailable selection rejects the entire inquiry.
- Snapshot canonical names/options/quantity and visitor message/contact atomically.
  Free-text claims never replace canonical selection authority. General inquiries
  still require a valid target, name, phone and nonempty message.
- Fingerprint the normalized action, including contact/message and normalized
  selections. Same business/key and equivalent payload returns the existing ID;
  changed payload under that key returns409 idempotency_conflict. Concurrent
  equivalent submissions create one inquiry and one set of item snapshots.
  Canonical option-key/selection ordering avoids a false conflict from JSON order.
- Persist exactly one owner-attention source per inquiry in the same transaction.
  Duplicate, invalid, honeypot or rolled-back attempts create no inquiry event.
  Notification delivery is downstream, never a reason to undo or duplicate intake.
- Keep the existing10attempts/business+hashed-IP/10min boundary with30min blocking,
  plus a global hashed-IP bound of30attempts/10min. Bound every request including
  retries; return429 with Retry-After when limited. A trapped honeypot may return
  a generic accepted response but never a genuine inquiry identifier or owner alert.

Adapters return an explicit durable accepted receipt only after commit (201new,
200equivalent retry), stable validation/not-found/conflict/rate/size failures and
safe error copy. A receipt grants no anonymous read or lookup by phone/key/ID.

## Private Inbox/read/status contracts

Current persisted business authority controls Inbox access: the current owner,
platform administrator, or staff with a currently enabled business-management
grant. Mere queue membership is insufficient. Revoked grants deny list/detail,
read and status; mutations lock the current profile/grant for the transaction so
an administrator's revoke cannot race admission. Native owner APIs stay owner-only.


Authenticated list/detail/read/status commands derive business authority from
current server identity, not a body businessId. Owners access only their business;
existing explicitly authorized operations access remains; queue-agent status
never grants business-inquiry access. Deep links recheck exact inquiry+tenant.
Retained history remains scoped; no old request or alert broadens access.

List/detail DTOs include immutable visitor message/contact, canonical selection
snapshots, created timestamp, readAt and current workflow status. Preserve existing
paginated/filter/search behavior with bounded queries. Detail GET/prefetch/list
never mutates read state. A separate current-authority read command after genuine
visible/focused opening sets the first read_at monotonically/idempotently. This
records opening in the owner's private workflow, not visitor-visible proof that
someone read the entire message. Reading an alert is not this acknowledgement.

Keep statuses new/contacted/confirmed/closed/cancelled; update/audit atomically
inside exact tenant scope. Read does not change status, and status does not imply
contact/delivery/read beyond the owner's explicit chosen workflow state. Visitor
message is immutable. Owner-private notes and onsite owner replies are deferred.

Existing BE-050 owner/manager fallback recipients and event deduplication apply.
New inquiry in-app attention/deep links are required; optional configured push
retains permission and generic-copy/privacy boundaries. Do not call the dormant
Resend-only inquiry notifier. Owner inquiry email is an explicit later follow-up,
not part of acceptance or a success claim in this phase.

## Schema, rollout and observability

Reserve additive migration78 for inquiries.read_at (nullable timestamp) and
request_fingerprint (nullable for legacy history). Existing IDs, content, items,
status, contacts and history are preserved. Do not fabricate historic read times
or request fingerprints. New attempts use fingerprints; legacy-key replay must
compare normalized retained action or safely reject a conflict, never silently
return a different action's inquiry. Root reserves79 for unrelated partner intake.
No reset/delete, hosted setting or automatic restore is part of this work.

Record safe IDs/error categories/attempt outcomes only; never phone, body, private
email, token, full provider payload or fingerprint inputs. Apply shared-local
migration only after the reviewed backup/target plan and root GO. Hosted migration
and monitored web/API then native rollout remain separate release gates.

## Scenarios and test plan

| GIVEN / WHEN | THEN | Verification |
|---|---|---|
| Eligible business, valid general0-item or selected1–20-item input | One durable inquiry/items/event and truthful receipt | Focused canonical intake/API tests |
| Foreign/private/unpublished/retired/unavailable product or invalid options | Whole action rejected, no row/event | Existing security/product tests + isolated persistence negatives |
| Same normalized key/payload, including concurrent retry | One inquiry/event, same ID | Real transaction/concurrency regression |
| Same key with changed visitor/contact/message/selection |409, original content unchanged | Fingerprint regression |
| Rate/size/type/prototype/blank input or honeypot | Bounded safe denial/trap, no notification leak | Real adapters + pure parser negatives |
| Owner A lists/opens/marks/updates owner B inquiry | Denied; B untouched | Owner API/status/read tenant negatives |
| List/prefetch/background vs genuine focused detail opening | Only explicit read command marks first opening; status unaffected | Actual UI read-command and persistence checks |
| Commit succeeds, optional notification unavailable | Inbox/event remain, no duplicate or email claim | Attention/provider-failure regressions |
|77→78 twice, legacy history and foreign tenant records | Additive fields, original bytes/IDs unchanged | Isolated migration rehearsal |

Reuse test-security.ts, test-mobile-api.ts, test-product-inquiry.ts,
test-business-inquiry-baskets.ts, test-attention-notifications.ts and focused
restored-inquiry UI/API/migration tests (test-restored-inquiry.ts,
test-restored-inquiry-postgres.ts, and the restored-adapter cases retained under
test-retired-business-inquiry.ts). Replace the obsolete retired-adapter
assertions only after both adapters satisfy this contract. Actual Chrome/Expo
visitor→correct-owner Inbox→read/status/Back evidence, explicit visual approval,
full/release/acceptance and scoped release evidence remain separate from unit
ports. No migration apply or deployment is claimed by this ready spec.
