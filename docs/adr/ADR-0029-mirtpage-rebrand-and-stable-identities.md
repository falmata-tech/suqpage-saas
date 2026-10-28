---
id: ADR-0029
title: AfricMade presentation migration with preserved system identities
status: accepted
date: 2026-10-18
deciders: [product, architecture, security]
related: [FE-070, BE-059, DEP-049]
---

# ADR-0029 — AfricMade presentation with preserved system identities

## Current decision

AfricMade is the current public identity and `africmade.com` serves the website.
The owner requests all active code, assets, metadata and release artifacts to
reflect that name before the new Play submission. Retained protocol values,
session keys, provider IDs and historical evidence below remain factual and
require versioned compatibility migrations before removal. The old signed
Android version3 contains former-name strings and is not the Play artifact.
FE-070/BE-059/DEP-049 S188 govern the current completion work.

## Context

The owner requests MirtPage everywhere, mirtpage.com and possibly a new Android
package. Visible names can change; provider IDs, app identity, stored credentials
and domain-scoped state have different migration behavior.

## Proposed decision

Make MirtPage the complete customer-facing identity using current colors and a
new original page/display-panel mark. Keep business data, roles and media on the
existing Supabase/Storage system. Rename provider display labels and verified
public domains while preserving hidden stable identities unless a concrete
separate migration requires change. Retain compatibility namespaces/aliases and
historical evidence; classify all remaining old-name references.

The owner explicitly chooses com.mirtpage.app and a separate Play app after
clarification. This is a new install namespace with fresh testing, not an in-place
update. The owner subsequently purchased the domain; GoDaddy ownership, both
authoritative nameservers and all seven existing records are now verified with
protected beforeimages. Preserve the existing app and keys while preparing the
selected target.

Provision the new aliases/DNS/managed TLS on the unchanged existing deployment
and additive Firebase/Play draft records as independent, exactly reviewed stages.
Their operation-specific backups and readbacks remain mandatory; incomplete
candidate browser acceptance does not become a pass. Candidate code/runtime,
Auth/mail/data, explicit signing/build/upload and store rollout retain all full
gates. This permits useful provisioning without exposing unverified code.

## Alternatives and consequences

A global text/database replace risks sessions, private aliases, push channels,
provider signatures and duplicate email. Recreating databases/Auth/Firebase solely
for names increases migration risk without improving a public showroom. Keep the
current services by default; a Firebase project ID is immutable, so removing that
hidden old ID would require a separately justified parallel migration.

New domain/app installations may require renewed login, Tracking OTP and push
permission. Old APIs and active guest chats need a transition window. The old
domain must not indiscriminately redirect every authenticated POST.

## Verification

FE-070 meaning-first copy/assets/browser tasks; BE-059 protected data/protocol
tests; DEP-049 provider backups, reviewed plans, domain/app checks and rollout.
This proposal does not grant provider writes or claim a deployment completed.
