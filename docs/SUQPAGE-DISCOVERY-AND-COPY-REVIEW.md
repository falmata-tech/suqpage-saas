# Discovery, favicon and copy review — 2026-09-20

S14/S15/S16 under FE-038, FE-041, FE-048, BE-041 and DEP-038. Local candidate;
visual approval, full gates, task-scoped commit and hosted rollout remain pending.

## Discovery defect

An active local business with a listed product was absent from business and product
search because its saved starter location/category still had no discovery profile
or industry membership. Publication activated the page but did not apply setup.

Publication now applies a pending saved proposal inside the same transaction as
activation/publication. Both location Save and publication reuse the same validated
application logic. Already-applied placements are left alone; exclusions, exact GPS
choice, coarse area privacy and unknown-place handling remain. No saved proposal
means no invented map location. Discovery failure rolls back activation, publication
and industry changes.

`test-self-service-publication.ts` passes first publication without an extra location
Save, deliberate discovery-write failure/rollback, business-name and product/location
word search, stale/foreign/suspended denial, staff privacy and existing atomicity
checks. `test-place-selection.ts` passes canonical/forged-place and privacy checks.

The exact affected local business was repaired from its existing saved proposal
after a verified native backup. All business, product, account, saved-page and
publication content remained hash-identical. Protected before-state, backup and
browser evidence are under `.local/prairie-discovery-repair/`; do not commit them.
Business-name and product-name search plus product links pass at 1440/390/320.
No hosted data was changed.

## UI copy and icon standard

Master section 5.3 now requires clear action labels, matching icons, and no filler
or implementation notes for all future work. Redundant explanations were removed
from inquiry choices, posting forms, page contacts, product headings and workspace
cards. Required errors, statuses, upload constraints and location/assistance privacy
information remain. Customer business descriptions were not rewritten.

The single-item button retains “only”; the saved-list action remains explicit.
Message/list-plus/clipboard-list icons distinguish opening an inquiry, adding an
item and reviewing saved selections. `capture-inquiry-clarity.mjs` passes nine
desktop/phone product/service/card captures, single/group independence, zero sends
on Add, overflow and scoped accessibility checks after helper text removal.

## One platform favicon

Business routes inherit the root Suqpage favicon and Apple icon. The obsolete
business Browser icon upload field was removed; historical assets remain stored.
On-page business logos and sharing titles/images remain specific to the business.
`test-platform-favicon.mjs` verifies home, Featured, login, dashboard entry,
business/product navigation and reload; all icon assets return 200.
`test-pwa-shell.mjs` passes. Typecheck and spec validation pass.

Owner/admin desktop/phone checks pass with 29 captures retained under
`.local/business-starter-review/`, including filled starter fields, images,
save/reload and private-preview contact safety. These use isolated local fixtures and test
sessions, not hosted email delivery. Full release approval remains separate.

## Verified rollout — 2026-09-21

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
