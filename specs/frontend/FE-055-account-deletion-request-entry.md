---
id: FE-055
title: Discoverable account deletion requests
status: in_progress
related: [FE-053, FE-049, DEP-042, DEP-044]
owners: [product, frontend, operations]
last_updated: 2026-10-09
change_level: L1
---

# FE-055 — Account deletion request entry

## Problem and scope

The approved release audit found no dedicated mobile account-deletion entry.
Expose the existing privacy-notice email request channel clearly in web account
settings, native Account/Account security and a public `/account-deletion` page.
The page works without an account, app installation or completed business setup.
This is a request to the existing Suqpage contact, not an automated deletion API.

## Contracts and readiness

Reuse the existing `falmata.dawano@gmail.com` contact with an encoded, fixed
Suqpage account-deletion subject. No user ID, email or tenant data is placed in
navigation URLs. Show the address as selectable text when no email app is set up.
Explain identity verification before deletion; do not claim a request is sent
when a mail composer opens. No database mutation, authentication change,
retention-period promise, queue simulation or external provider is introduced.
Use the existing page/button styles and five UI languages. Master sections 11
and 22 need a local-candidate statement after focused checks pass.

Definition of Ready is met for this entry/discoverability fix. Actual deletion
fulfilment, identity verification and any required retention must be reviewed by
operations for each request. This change alone does not establish public-store
readiness or authorize deleting any account.

## Scenarios

- GIVEN a signed-in mobile account, including incomplete setup WHEN opening
  Account THEN a Delete account entry opens native request instructions.
- GIVEN web or native account settings WHEN choosing Delete account THEN the
  same email request channel is available without inserting personal data in the URL.
- GIVEN an anonymous visitor or an uninstalled app WHEN opening the public URL
  THEN the Suqpage identity, instructions and email request link are available.
- GIVEN no configured email application WHEN viewing the page THEN the contact
  address can still be read/copied; opening the link never displays false success.
- GIVEN a privacy-page visitor WHEN selecting Delete account THEN the request
  page loads without authentication or account-existence disclosure.

## Test plan

Focused browser capture verifies direct anonymous access, email destination and
subject, privacy navigation, no overflow at 1440/390/320, locale text and no
submission/success claims. Web/mobile typecheck and localization validation cover
both adapters. Test the native page in the browser preview; physical-device
email-client handoff remains a native release check.

## Rollout and rollback

Additive UI only; deploy web URL before distributing native links. Obtain focused
visual approval before new full release gates. Revert links/page to roll back;
existing email requests and user records are untouched. Operations must verify
the receiving mailbox and a complete deletion procedure before claiming Play
compliance; no live message is sent as a test without owner authorization.

## Focused evidence (local only)

Both typechecks, localization and spec validation pass.
`scripts/capture-account-deletion.mjs` verifies 13 web/native-browser states at
1440/390/320, all five languages and signed-in Account before setup.
The first native locale attempt used stale Metro catalogs; a server restart
resolved it, and the unchanged assertions passed. Captures and verification:
`.local/account-deletion-review/`. No request email or real account deletion was
performed. The owner approved proceeding in S61; actual-device handoff remains pending.
