---
id: BE-063
title: Single transport coordinator and private partner interest intake
status: ready
related: [FE-076, BE-018, BE-058, DEP-043, DEP-048, FE-077, BE-064]
owners: [backend, security, operations]
last_updated: 2026-10-21
change_level: L2
---

# BE-063 — One coordinator without premature multi-company authority

## Problem, outcome and contract

The sole admitted coordinator identifier remains `shared-trucks-logistics` for
compatibility with existing conversations and clients. Its official display
brand, based on the user-provided company website and logo, is **SharedTrucks
Logistics**; its service type is
**freight brokerage**. Parcel express delivery and hub-and-spoke logistics are
other service types in the presentation vocabulary; no other company is enabled.
This is the platform's
current transport offering, not a user-editable tenant, carrier directory entry
or arbitrary contact. A shared portable contract owns its identity and approved
logo reference. New web and native intakes start without a selection and require
an explicit choice before sending a new request. Missing selection on compatible
older clients maps to this sole offering at the server boundary; explicitly
unknown or invalid selections are rejected before a write. The display-name
change does not rewrite historical records or authorize another provider.

The existing internal queue, capability, managed-identity eligibility, assignment,
Join, read, close and response rules remain authoritative. No requester-supplied
company identifier creates or changes staff/tenant authority. Current independent
shipments are arranged through this single offering; their recipient verification
and ordered leg/carrier/external-tracking contracts stay unchanged. Future
multi-company enablement must persist ownership and isolate staff/shipments in a
separately reviewed migration before a second company can operate.

Customer transport chats currently enter MirtPage's internal transport queue;
MirtPage staff operate that queue today. SharedTrucks Logistics is the selected
arranging provider, but its own tenant, staff accounts and direct conversation
routing do not exist yet. General site and chat copy does not advertise or name
the selected company. It stays focused on the route and says a live coordinator
can discuss transport options without claiming the coordinator is provider staff
or promising MirtPage staff as the customer's contact. The dedicated provider
interest page explains that transport companies can ask to be listed; it is kept
outside the transport chat. Provider-owned routing requires a separately
specified and authorized change.

## Partner interest

Additive migration79 follows BE-062's inquiry migration78; neither is a
reset or deletion of history. Store one private request with an opaque receipt,
bounded company/contact names, normalized email, optional validated phone,
message, locale, idempotency key/fingerprint and bounded email-delivery state.
An interest request is not an approved transport organization or identity.

Public web and native adapters call one application contract. Validate body size,
allowed fields and content before persistence; apply existing same-origin web
and private rate-limit primitives. Repeated identical keys return the same
non-sensitive receipt without another delivery; changed content under a key
returns409. Never expose submissions through a public list/detail API or send
confirmation mail to an unverified applicant address.

The command accepts only companyName (2–160 Unicode characters), contactName
(2–80), normalized email (at most160), optional phone (7–15 digits with optional
leading+), message (1–4000), enabled locale and UUID idempotencyKey. Web bodies
are bounded at24KiB before parsing. Rate limits are5 attempts/IP/hour plus3 per
normalized applicant email/day, using existing salted private rate-limit keys;
no raw IP is retained. Retry fingerprints bind the normalized full request.
No attachment, applicant password or arbitrary destination address is accepted.

Persist the request and one delivery intent per current eligible platform admin
in one transaction; absence of a qualifying admin fails without a partial row.
Each intent binds an admin user ID, not an applicant-controlled recipient. Resolve
the current role and private email again at dispatch; changed/ineligible recipients
are ignored. Leases last30 seconds; batches contain at most2 deliveries; retry at
most6 times with bounded exponential delay, expiring after7 days. Requests and
their delivery records expire after90 days via bounded maintenance; idempotency
is guaranteed within that retention. No list/detail public API is introduced.

Notify only current authorized platform administrators using verified private
account destinations and the existing transactional email adapter. Persist before
delivery, bound leases/retries/batches and retain safe delivery categories. Local
preview may send only to Mailpit; missing hosted configuration stays pending
instead of falling through to another provider. Provider acceptance is not human
receipt. No credentials, email bodies, raw IPs or contact fields enter logs/URLs.

## Scenarios

1. GIVEN an existing compatible client omits a coordinator WHEN it starts valid
   transport THEN the current single offering handles it under unchanged queue
   authority. An explicit foreign identifier produces no conversation or alert.
2. GIVEN an owner/visitor or staff tries another company identifier WHEN acting
   on conversations or shipments THEN existing actor, recipient and tenant checks
   cannot be bypassed; a display label cannot confer authority.
3. GIVEN valid interest data WHEN submitted THEN one request and delivery intent
   persist atomically, with no application user, Auth identity, staff role,
   transport account or operating approval created.
4. GIVEN invalid, oversized, repeated, changed-key or rate-limited data WHEN
   submitted THEN return a bounded error/identical receipt as appropriate without
   extra rows, privileged changes, duplicate delivery intent or reflected PII.
5. GIVEN provider failure or worker overlap WHEN delivery runs THEN retries/leases
   remain bounded, local delivery remains local, and unsafe recipient/configuration
   changes cannot cause delivery to an unauthorized address.

## Test plan

Map the criteria to `scripts/test-transport-coordinator.ts`,
`scripts/test-transport-partner-interest.ts` (isolated PostgreSQL),
`scripts/test-transport-partner-http.ts` (origin/body/rate/field denial),
`scripts/test-transport-partner-email.ts` (fresh-recipient/lease/retry and no
external-local fallback), and FE-076's actual form journeys. Negative cases cover
role loss, changed content under one key, concurrent submissions, worker overlap,
email header injection and provider failure without privilege creation.

## Rollout and rollback

The planned79 migration
needs reviewed SQL, a protected local before-image and transaction verification;
hosted apply remains separately authorized. Removing frontend entry restores the
previous flow; persisted submissions are retained privately rather than dropped
as an automatic rollback. Reuse the existing bounded Gmail/Resend/Mailpit adapter
selection without changing hosted configuration or credentials. SMTP acceptance
and uncertain retries cannot guarantee human delivery or exactly-once receipt;
retain deterministic message IDs and honest delivery states. This ready contract
does not qualify a migration apply, visual layout, provider email or release.
