---
id: ADR-0011
title: Review-gated self-service onboarding and public visibility
status: accepted
date: 2026-08-01
deciders: [MirtPage]
related: [FE-003, FE-018, FE-021, BE-003, BE-017, BE-020, DEP-017, ADR-0004, ADR-0010]
---

# ADR-0011 - Review-gated self-service onboarding and public visibility

## Context

Invitation-only client provisioning creates onboarding friction before a client
can describe a simple design request. Separately, the pre-launch manual renewal
ledger was made an automatic public entitlement gate before price or payment
operations were decided. MirtPage now needs immediate private client access while
keeping staff-reviewed publication and explicit suspension as public authority.

## Decision drivers

- Any legitimate product business should be able to start a private request.
- Unfinished client content and unreviewed coordinates must never become public.
- Payment remains a manual business conversation, not application logic.
- Existing admin-created invitations must remain available.
- Account creation must preserve tenant isolation, strong authentication, abuse
  controls, and atomic failure behavior.

## Considered options

1. Keep invitation-only onboarding: strongest manual control but unnecessary
   friction and operations work before private intake.
2. Self-register and publish immediately: low friction but exposes unreviewed
   content, creates impersonation/abuse risk, and bypasses exact approval.
3. Self-register into a private draft tenant and first request, then use the
   existing reviewed revision and manager publication workflow.

## Decision

Choose option 3. A prospect may atomically create a private draft business,
client account, and first-showroom request and then authenticate immediately.
The account is active; the showroom is not public. Only publication of the exact
approved revision activates the showroom. An administrator can suspend or
restore an established showroom.

Manual subscription and payment records remain available for operations and
future policy, but dates do not automatically redirect, unpublish, or remove an
otherwise active published showroom. No payment processor or automatic payment
decision is introduced.

## Consequences

### Positive

- Clients can start immediately without waiting for an invitation.
- Draft privacy, approval, publication, and tenant boundaries remain intact.
- Manual commercial decisions do not accidentally create technical outages.
- Existing invitation onboarding remains useful for staff-assisted clients.

### Negative / debt

- Public signup needs ongoing abuse monitoring and may later need verified email
  or phone ownership before higher-risk actions.
- Operations must review more unsolicited private requests.
- Subscription-ledger language and tests must distinguish advisory account
  records from public visibility authority.

## Verification

BE-020 proves atomic signup, exact-origin/rate-limit controls, tenant binding,
private drafts, and publication/status authority. FE-021 proves the public result
set. DEP-017 proves backup, release, and route-disable rollback behavior.
