---
id: DEP-030
title: Data-preserving Suqpage self-service rollout
status: in_progress
related: [FE-052, DEP-036, DEP-034, DEP-032, DEP-031, FE-041, FE-040, BE-032, ADR-0018, FE-042, BE-033, FE-043, BE-034]
owners: [operations, security, product]
last_updated: 2026-09-21
change_level: L3
---

# DEP-030 - Data-preserving Suqpage self-service rollout

## S43 final approved web rollout — 2026-09-27

Owner approval covers cumulative S31–S47 web features and revised screens. Deploy
only after check/release/provider acceptance/operations pass on isolated source.
Verify Netlify site/account and Supabase project independently, take private
public-schema backup, restore/rehearse 51–57, and prove original-column/table
fingerprints unchanged. New demo flags and nullable support fields are additive;
existing staff notes remain private. Retain schema on rollback; rollback code
must preserve retired guest support and handle buying conversations safely.
Bind commit, artifact/native validation and deployment receipt; monitor the exact
published site. No Auth/SMTP, Storage or DNS configuration changes are required.
Expo/mobile work waits until rollout is terminal.

## S42 buying conversation rollout

Before serving live buying code, back up and apply additive schema 56 following
the release sequence. New `support_messages.visitor_visible` defaults false;
never backfill private historical notes. Preflight requires migration 56.
Rollback retains the column and messages. General guest Help/Transport stay
retired; buying replies are explicitly visible text only. Local migration
preserved 68 businesses; fresh/idempotent PostgreSQL tests pass. No hosted
Realtime setting or provider credentials change. Native preparation in ADR-0023
and docs/MOBILE-MONOREPO-PREP.md does not change deployment paths. Visual approval,
full/build/release gates and monitored hosted rollout remain outstanding.

## Problem and outcome

Introduce customer-controlled pages without overwriting existing business content,
mixing local/hosted providers, or treating a public rename as an Auth migration.

## Scope

The owner approved deployment, the exact private production-data backup destination
and an email-only launch on 2026-09-14. Production requires email-code sign-in;
Google UI stays disabled until its provider credentials are separately restored
and verified. This does not authorize Google/SMTP secret replacement or bypass
DEP-029's exact-plan requirement for hosted Auth configuration changes.

`docs/SUQPAGE-TRANSITION-CHECKLIST.md` is the active sequence. FE-042/BE-033 enable the standard
editor by default, with an explicit emergency-disable environment switch. Its additive
schema is rehearsed locally before any remote application. Public and ordinary
preview rendering uses the shared profile for all businesses; retained design
records and managed project history are unchanged. No reset or hosted config push.

`SUQPAGE_OWNER_EDITOR_ENABLED=0` disables the editor and API; unset or `1`
enables them. Migration 39 was verified on local Supabase PostgreSQL on 2026-09-13.
No hosted application, provider setting or database has been changed by this step.

S3a adds migration 40 for owner publication history, denied to Supabase
public roles. The same gate controls draft publication and public snapshot reads.
Gate-off returns existing handles to canonical content in the shared profile; saved
drafts, products and publication history remain retained. Local rehearsal and
focused tests precede any hosted migration. Public rollout remains blocked on
visual approval, full gates and broader asset retention in S3b. FE-042/BE-033
verify local first-listing review and category discovery pagination.
Migration 40 and owner-publication/restore flows were verified only on this
project's local Supabase (54322/54321) and app port 3101 on 2026-09-13. No remote
migration, config change, deployment, commit or full release gate was performed.

## Scenarios

```gherkin
Scenario: Gate is off
  GIVEN the new editor is not enabled
  WHEN someone opens its route or API
  THEN no draft feature is exposed and public pages use canonical content in the shared profile

Scenario: Rollback after draft use
  GIVEN private drafts exist
  WHEN the editor gate is disabled
  THEN the drafts remain retained but inaccessible through the new surface
  AND the existing public catalog and pages remain intact
```

## Test plan

Focused unit/security and local PostgreSQL evidence first; desktop/phone review
and explicit visual approval before full check/release/acceptance gates. Hosted
approval, backups, migration rehearsal and monitoring are pending rollout work.

## Rollout and rollback

Sequence: approve UI; complete owner publish and moderation; local migration and
regressions; reviewed scoped commits; explicit remote approval/backup; deploy
and monitor. Gate off is the first rollback. Keep data and provider identifiers.
Suqpage logo and email/PWA metadata are a separate visual checkpoint. Google
credential restoration under DEP-028 remains pending and is not part of rename.

## S2g local contact migration

Migration 41 is additive and introduces no Auth changes. Before applying locally,
verify loopback port 54322 and retain a protected public-schema backup outside Git.
Verify a second apply is a no-op and preserve existing account emails, notification
contacts and provider links. Demo contact filling is a one-time reviewed operation,
not production migration logic; only allowlisted demos may receive approved fictional
values. Missing real-user details require owner input. Rollback application code can
leave the empty-compatible columns retained; restore demo values transactionally from
the protected backup if needed. Hosted migration/build/release remains unperformed.

S2g local verification (2026-09-14): migration 41 and repeat apply passed after
protected loopback backup. Account/signup/domain and PostgreSQL privacy tests pass;
66 anonymous page responses exclude private contacts. Three account browser
workflows/accessibility scans and the 24-state/12-profile-scan public matrix pass.
Approved fictional contacts populated for 66 demo pages and 47 demo users, retaining
account emails. Two non-demo account phones require owner input. Evidence and
screenshots: docs/SUQPAGE-TRANSITION-CHECKLIST.md S2g. Visual approval, full gates,
commit and hosted rollout remain pending.

## S2h public experience revision

FE-041 now governs the shared profile's linked inline product view, simplified
public features/unit presentation, single/group inquiry choice, progressive phone
form and search panel beside the persistent map. It supersedes earlier public
modal, production-fact, persistent empty-cart and map-replacement statements here.
Retained data, canonical server security and legacy recovery contracts remain.
Implementation/evidence tracked in docs/SUQPAGE-TRANSITION-CHECKLIST.md S2h.


## S2i/S2j local standard-page lifecycle

Migration 42 adds owner_page_reviews with direct PUBLIC/anon/authenticated access
denied. Applied only to local PostgreSQL after a mode-0600 PGDMP backup at
`.local/backups/before-page-review-20260914.dump`; the path is gitignored.
Rollback keeps additive schema and retained history. No destructive reverse
migration is needed. Local real-provider rollback tests and browser fixtures
verify draft catalog/privacy, first submission, feedback, stale-version denial,
first publication, direct assignment/revocation and retired endpoints. See
`docs/SUQPAGE-APP-WIRING-AUDIT.md` for mapped evidence and test boundaries.
No hosted migration, full release gate, deployment or remote Git operation is claimed.

## S2k/S2l local candidate

Local additive migration 43 followed protected backup
`.local/backups/before-launch-wiring-20260914.dump`. FE-043/BE-034 now connect owner
identity/location, product options/visibility and media reconciliation. BE-035 and
DEP-031 replace every executable embedded-database path with native PostgreSQL.
Fresh install, adapter and current browser workflows pass locally. Explicit visual
approval, full gates, commit and hosted candidate verification remain separate.
See `docs/SUQPAGE-LAUNCH-WIRING-AUDIT.md` and the PostgreSQL-only runbook.

## Current rollout evidence

The owner approved visuals, deployment, the private data backup and email-only
entry on 2026-09-14. Core/release, seven acceptance scenarios, 72 accessibility
states, PostgreSQL, operations and container gates pass. Restoring the production
backup preserved 50 original table fingerprints through additive migrations
39–43. Netlify email/Google application flags are verified; hosted migration,
publication and delivery monitoring remain pending. See
`docs/SUQPAGE-DEPLOYMENT-2026-09-14.md` for the current admission record; earlier
local-only evidence above does not impose another visual approval gate.

The contact rollout carries the previously approved fictional demo contact data
into the exact hosted seed identities after schema 43. Match 66 allowlisted seed
handles and 47 exact seed account emails, fill only empty public email/phone and
private account-phone fields, and preserve every existing value and account email.
Emails must end in example.com and phones remain within the reserved drama range.
No owner publication may be overwritten. Verify exact before/after projections
in one transaction; retain the protected pre-rollout data backup. This is a
one-time reviewed demo operation, not a permanent synchronization service.

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
