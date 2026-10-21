# Launch clarity: local review candidate

2026-09-24 · FE-052 / S33, preserving S31 brand alignment and S32 transport.
This candidate is implemented locally, not committed or deployed. Production
remains at schema 50; local PostgreSQL has additive migrations 51–55.

## Changes

- A Search & results opener, with a search icon, filter label and right arrow,
  slides open the panel. Search, filters and results all remain inside; the
  opener never performs a search. All categories remain the default. Phone results keep more than 250px of scrollable space.
- Owners can update their own inquiry statuses and use Call/SMS links. Tenant,
  role and canonical status checks remain server-side with transactional audit.
- Seeded businesses have explicit demo identity, preserved across handle changes.
  Demo labels appear in discovery, Featured, business pages and inquiry composition.
  Demo live flags do not imply a real stream. Real signups default to non-demo.
- First publication checks About, contact details, confirmed location and listed
  offerings. Known starter values must be replaced or removed; subsequent active
  page Save remains immediate. The checklist opens the relevant fields.
- Featured omits broadcast status and booth-code decoration when no broadcast
  destination is configured. Gallery preview buttons wait for client readiness;
  The single evening schedule is localized (S36 supersedes two-session timing). The fully rendered gallery and preview
  pass a separate 15-state check (`featured-verified.json`).
- Signup/About explain discovery and direct inquiries without platform pricing
  claims. Key public, owner and support phrases were rewritten by UI purpose in
  Amharic, Afaan Oromo, Somali and Tigrinya. Merchant content stays unchanged.
- Transport remains four-field intake and manual staff coordination. Confirmation
  explains phone follow-up; admin Support has a separate transport queue and
  audited company/contact handoff. No driver/provider accounts or booking API.

## Focused evidence

- `npm run test:wiring-audit`: persisted owner status and audit; foreign owner,
  staff and malformed command denial; first-publication correction flow;
  immediate live Save; safe contact links; explicit demo migration and projection.
- `npm run test:self-service`: direct publication, atomic failure rollback,
  staff privacy, location saves and bounded city marker offsets.
- Native PostgreSQL install/seed, repeat migration and preservation pass with 66
  demos. Initial client timeouts were investigated with operation-only diagnostics;
  the diagnostic run passed without changing limits, assertions or runtime code.
- Support, replay and transport suites pass, including authorization, concurrent
  handoff, duplicate prevention, private fields and queue pagination.
- Typecheck, database-boundary, homepage composition, narrative/category checks
  and specification validation pass. Localization includes dynamic shared starter
  and checklist keys as well as coverage/interpolation/content boundaries.
- `scripts/capture-launch-clarity.mjs`: all five locales at 320/390/1440; visible
  panel opener, in-panel query submission/results/collapse, Featured, About, login and demo
  page; no horizontal overflow or uncaught browser errors.
- Local authenticated browser checks: inquiry status saved through the real
  server action in 15 locale/viewport combinations; first-publication checklist
  also checked in 15 combinations, with disabled publish and working field links.
- Admin transport queue, real company-save action, idempotent saves and copy
  feedback pass at 320/390/1440.
- Public transport real-handler checks pass at 320/390/1440 using a disposable
  database. Temporary local account/inquiry/request fixtures are cleaned up; no
  email or external provider message was sent.

Private screenshots and browser receipts: `.local/launch-clarity-review/`;
transport review: `.local/transport-support-review/`; centered brand review:
`.local/brand-spacing-review/centered-public/` and `centered-owner/`.
The language review is agent-authored, not native-speaker certification.

## Next gate

Review at http://127.0.0.1:3102. Explicit visual approval is required by AGENTS.md
before full check, release/build and acceptance gates. Then review/stage only
this task's paths, commit, and follow the production backup/migration/deployment
procedure. No hosted Auth, SMTP or DNS change is needed for this candidate.
Unrelated `deno.lock` remains untouched.

## Owner correction: keep search inside the panel

The external search form was rejected and removed. Its replacement is one button
with a search icon, Search & results label, Filters sublabel and right arrow.
Opening does not submit a query; the existing panel contains the actual search,
filter controls and results. Collapse/reopen retains the query and returns keyboard
focus to the opener. Focused evidence uses
`node scripts/capture-launch-clarity.mjs --panel-only`.

The panel correction passes all 15 locale/viewport combinations, including
keyboard focus return and retained query/results; typecheck, seven localization
tests, spec validation and homepage checks pass. Visual review remains pending.

## Professional showroom positioning

The owner clarified the positioning for manufacturers/makers without retail
space, existing physical shops seeking online discovery, and home sellers.
About now leads with Your online showroom / Reach more customers and two short
customer-facing paragraphs. Login uses functional showroom-management copy.
Conversational audience questions were discarded. All five locales are updated;
merchant text, roles, inquiry behavior and location privacy are unchanged.
Narrative/localization/type/spec checks and 14 responsive About/login states pass.
Evidence: `.local/showroom-copy-review/`; awaiting visual approval, not deployed.

## Market introduction alignment

FE-052 scenario 8 refines only the homepage introduction and metadata: Discover
products and services / Explore online showrooms from local businesses and
contact them directly. Public navigation, Featured and owner action labels were
reviewed and retained. All five languages are covered. Narrative, localization
and spec checks pass; seven focused header states have no overflow or browser
errors, with English phone/desktop screenshots inspected. Evidence:
`.local/showroom-copy-review/market-verified.json`. Copy/layout verification does
not assert map tile readiness. No behavioral or layout changes; not deployed.

## Map preview above the drawer

FE-052 scenario 9: the old map overlay was below the search drawer (700 versus
800); nearby groups were lower still. Native modal previews now sit above both.
Business-result selection keeps the drawer open. Close/Escape/backdrop preserve
the search; keyboard focus wraps inside and restores on dismissal, with a visible
drawer fallback for redrawn Leaflet markers. Close controls stay accessible while
long content scrolls. Short landscape drawers scroll instead of collapsing results.

`node scripts/capture-map-preview.mjs` verifies eight local viewport/locale states,
including long content and resizing. `--pointer-only` additionally verifies actual
map clicks through the remaining map area at 390/1440 with the drawer open.
`node scripts/capture-nearby-preview.mjs` passes four six-business fixture states
for group/detail/back, focus, long content and close. Nearby data is a component
fixture: real viewer/modal with stubbed map/navigation/images/localization, since
current local demos have no exact-location groups. No stored data changed.
Screenshots: `.local/map-preview-review/`; English phone/desktop inspected.
Typecheck, seven localization tests, spec validation and discovery regression pass.
Two stale discovery expectations were aligned with the already implemented
demo flag/cache identity. Visual approval and release gates remain pending.

## Separate help and transport conversations (S34)

Two external buttons open separate fixed-purpose dialogs. Help and transport
retain their own sessions, replies and drafts; opening or resetting one does not
replace the other. No in-dialog switch or unverified availability badge is shown.
Transport remains four fields with manual phone follow-up.

Staff settings now select Help, Transport or both, with one shared workload limit.
Eligible requests auto-assign or wait for a claim. Assigned staff can reply,
close/reopen and record private transport-company handoffs; managers can reassign
and inspect assignment history. Concurrent assignments respect capacity. Mobile
assignment controls now fit at 320px. Both visitor queues count toward staff unread
attention. See `operations/SUPPORT-AND-TRANSPORT.md` for the day-one workflow.

Focused support/API security suites, seven public language/viewport cases, retry
and transport browser flows, and real local admin/team actions pass. Temporary
staff/request fixtures were removed. Screenshots and receipts are in
`.local/support-channels-review/`; no external notifications were sent. Local
migration 53 is applied. Visual approval and production rollout remain pending.

## Transport callback receipt (S35 correction)

Transport is a request, not visitor chat. Four fields lead to Request received,
phone follow-up and Request another route. No transcript, reply composer,
attachments, End chat, connected-agent label or live polling appears. Starting
another route preserves the earlier staff request. Help retains live chat.
Transport staff use Internal note / Add note, with notes and attachments excluded
from visitor responses. Assignment, capacity and private company handoff remain.

Focused API/privacy suites and browser tests pass for persistence, lost response,
refresh, another route, no polling and independent Help history. Receipt captures
are in `.local/transport-support-review/submitted-*.png` (1440/390/320), plus all
five languages at 320px in `.local/support-channels-review/receipt-*.png`.
Visual approval/release/rollout remain pending; no new migration is required.

Real local admin/team browser verification also passes queue settings, claim,
Help reply, private transport note, company handoff, assignment history,
close/reopen and reassignment at desktop/phone widths. The browser harness now
waits for the settings-save redirect before advancing, eliminating a navigation
race. Temporary accounts and requests were removed; no email was sent. Receipt:
`.local/support-channels-review/staff-verified.json`.

## S36: official evening Featured schedule

The local candidate runs from 8:30 PM to midnight EAT with six 30-minute business
presentations, four five-minute sponsor mentions and two five-minute changeovers.
Automatic selection rotates weekly within the existing daily category. Admins
can select a date, save a manual order, or restore Automatic; saved changes appear
on the next public load even when the previous view was cached. Smaller lineups
finish earlier. No TikTok start integration or new database migration is implied.

Schedule/clock, discovery, localization, typecheck and homepage composition pass.
Browser evidence covers real authenticated save/reorder/revert, seven public
locale/viewport states, and 320/390/1440 admin views. Private screenshots and receipt
are in `.local/evening-featured-review/`. The prior local lineup was restored.
Staff instructions: `docs/operations/FEATURED-SCHEDULE.md`. Visual approval and
full release/deployment gates remain pending along with S31–S35.

## S37: Buying assistance

Replaces the public transport button with Get buying help and three service
choices, name, phone and request details. Submission confirms phone follow-up;
Help remains chat. Staff manage buying requests with assignment, private notes,
close/reopen and reassignment. Historical transport cases remain available.
The Terms page describes the new manual service without claiming purchases or
certification occur on submission.

Five support suites, native PostgreSQL schema 54, typecheck, localization and
spec/narrative checks pass. Browser checks cover real intake/receipt/retry at
320/390/1440, staff/admin actions, and fifteen locale/viewport forms. Evidence:
`.local/buying-assistance-review/`. Local migration preserved 68 businesses;
test staff/request fixtures were removed. Not committed or deployed; owner visual
approval and full release gates remain pending.

## S38: one Buying assistance form

The service selector is removed. Visitors enter only Name, Phone and Request
details. New cases have the Buying assistance subject and no classification;
migration 55 preserves historical choices. The callback receipt and staff queue
remain unchanged. Focused PostgreSQL tests, typecheck and localization pass;
local migration preserves 68 businesses. Desktop/phone evidence is refreshed in
`.local/buying-assistance-review/`. Visual/release gates remain pending.

## S39: owner-only live support

Public pages now show only Get buying help, with a callback form and receipt.
The public Help/Transport/missing-channel APIs are retired; direct requests,
old cookies and forged categories cannot restore chat or create support work.
Public file reads return 404. Owner-dashboard support, staff replies and private
attachments retain their authenticated tenant/role boundaries. Historical visitor
records remain staff-visible; new notes there are private.

Five support suites, typecheck, localization and specs pass. Browser checks verify
buying submission/recovery at 320/390/1440, one launcher across Market/Featured/
About/showroom, owner support and attachment controls at 390/1440, and fifteen
language/viewport forms. Evidence: `.local/owner-only-support-review/` and
`.local/buying-assistance-review/`. No new migration or hosted write. Visual
approval, full gates, commit and deployment remain pending.

## S40 — 2026-09-25 local review

Market: “Everything a business offers, in one place.” Supporting copy introduces
nearby businesses, their story, offerings, capabilities, location and direct
contact. About: “One link to everything you offer.” No new capacity field or
verification claim is implied; user-entered descriptions remain unchanged.

The open drawer offers Products & services / Businesses checkboxes, both selected
initially, then one server-paginated list. Category/location remain optional.
Filters and location labels have separate space; mobile buying help cannot cover
pagination. Five-language desktop/phone and landscape evidence is linked in
TRACEABILITY S40. Review at http://127.0.0.1:3102/ and /about. Not deployed.

## S41 — visible filters (2026-09-26, local)

Category and Region or city are always visible side by side. Categories support
multiple choices, removing the last choice restores all categories, and both
controls have clear actions. Results match any chosen category AND the location
and query. The same selection reaches PostgreSQL exact/fuzzy search, map and
pagination; existing membership data needs no migration. Test and screenshot
evidence, including the outstanding fixture-cleanup limitation, is in TRACEABILITY
S41. Review http://127.0.0.1:3102/?view=search. Not deployed.
