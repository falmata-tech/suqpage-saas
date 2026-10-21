---
id: ADR-0030
title: Administrator-controlled global staff business management
status: accepted
date: 2026-10-18
deciders: [product, architecture, security]
related: [FE-072, BE-060, ADR-0018]
---

# ADR-0030 — One staff business-management grant

## Context

ADR-0018 originally let each business owner consent to team editing while an
administrator assigned individual businesses to generic staff. That produced
two controls for one task and inconsistent authority across page, product and
business settings. The owner now explicitly wants platform staff able to manage
all businesses by default, with a single administrator revocation per person.

## Decision drivers

- One obvious control in Staff rather than a switch on every owner page.
- Revocation must stop an open editor before it commits and leave chats intact.
- Business content authority must not imply private account or platform power.
- Existing owner content, assignments, consent and audit history must survive.

## Considered options

1. Keep owner consent plus per-business assignments: preserves narrow reach but
   conflicts with the requested default and repeats confusing controls.
2. Infer business rights from chat role or its availability flag: fewer fields,
   but a queue change could silently widen or remove business authority.
3. Use one explicit administrator-controlled staff grant, enabled at creation
   and backfilled for current staff: direct UX and independently revocable.

## Decision

Choose option 3. This supersedes ADR-0018's owner-consent/assignment requirement
for platform staff business management once FE-072/BE-060 are verified and
deployed. Until then the existing consent and assignment gates remain current.
Every business read and mutation checks the persisted current grant; revoke and
in-flight writes serialize. Support/Transport chat scope, private account
identity, staff administration and platform moderation remain separate. Preserve
historical consent and assignment records without using them to grant access.

## Consequences

### Positive

- Owners manage their showroom without acting as platform-staff gatekeepers.
- One admin control determines whether a staff member can serve every business.
- Chat availability changes cannot silently change business access.

### Negative / debt

- Staff reach intentionally broadens across businesses. Audit, current-role
  checks, simple admin revocation, protected migration and negative tests are
  required. Future narrower roles need a new explicit contract, not reuse of
  historical per-business associations.

## Verification

FE-072 actual Chrome web/Expo workflows and BE-060 migration, cross-role,
concurrency, media/publication and account-security tests. Hosted enablement
requires its own protected backup, approval and observed rollout.
