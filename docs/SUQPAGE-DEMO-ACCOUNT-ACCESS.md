# MirtPage demo account access and workflow testing

Updated 20 October 2026. This guide describes current source navigation and
account qualification, not certification that every role works or that the
pending S151 repairs are deployed. Controlling contracts:
[FE-026](../specs/frontend/FE-026-role-oriented-workspace-navigation.md),
[FE-056](../specs/frontend/FE-056-owner-profile-and-focused-editors.md),
[FE-072](../specs/frontend/FE-072-admin-controlled-staff-business-management.md),
[BE-060](../specs/backend/BE-060-admin-controlled-business-management.md) and
[DEP-041](../specs/deployment/DEP-041-demo-account-email-aliases.md).

DEP-041 records the owner-authorized correction of existing demonstration account
sign-in emails to distinct aliases of one owner-controlled inbox. Public shop
contact details are separate. S102 recorded a local-only public-contact
correction; hosted correction remains a distinct release operation. Generic
fixture code contains no personal inbox address.

The private account directory is
`.local/demo-account-emails-20260923/SIGN-IN-ACCOUNTS.md`. It lists exact emails
and intended account roles; it contains no passwords or one-time codes. Before
using an entry, requalify its current canonical user, Auth link, role, business
ownership and permission state. The directory is not a fresh reconciliation.
For a qualified account, open `/login` on web or Account in Expo, enter its exact
address and complete the normal six-digit email-code flow. Confirm the expected
business/role before editing. Do not strip the plus suffix or substitute the
base inbox address. If an expected existing owner sees setup, record the mismatch
rather than creating a duplicate business to work around it.

Local Supabase captures mail in its local mail viewer; it does not send to Gmail.
Hosted Auth has been rebranded to MirtPage; the newer S150 email-logo contrast
fix still has a separate reviewed publication/template-update boundary. Source
templates and local mail capture do not prove current hosted inbox delivery.
A disposable fixture reset recreates the generic fake-email seed; this one-time
data correction is not an automatic fixture reset or a change to real customer
onboarding.

## Current workflow test guide

### Current environment and role map — S151

The live website is `https://mirtpage.com`. For local testing, open web
`http://127.0.0.1:3102` or the mobile preview `http://localhost:8082`; local mail
is captured at `http://127.0.0.1:54324`. English, Amharic and Afaan Oromo are the
current language choices; retained Somali/Tigrinya preferences fall back to English. The web
language control becomes available after its client handler is ready.

Use the matching entry from the protected directory, not a newly invented
account. Keep each role in its own browser profile/isolated session and visitors
signed out. Staff/admin/operations sign in on the website; mobile staff sign-in
must be refused.

| Role | Starting screen | Main tasks |
| --- | --- | --- |
| Visitor, no account | Market `/` | Business map, Products, showroom/detail, per-business Inquiry list, social handoffs, About, transport intake and recipient Shipment tracking. |
| Business owner | Account `/dashboard/profile`; Expo Account | Your page, Products, Business details, Account settings, Support and Transport chat for their own business. |
| Main administrator | `/dashboard/admin` | Businesses, Staff, both chat queues, Shipment tracking and platform tasks. |
| Support agent | `/dashboard/support?queue=support` | Business support and authorized reports; business editing requires a separate current Manage businesses grant. No Transport/Shipment tracking editing. |
| Transport agent | `/dashboard/support?queue=transport` | Transport conversations and independent Shipment tracking; business editing requires the separate grant. |
| Operations manager, if separately qualified | `/dashboard` | Existing authorized business, queue and shipment tasks; no administrator-only staff-permission or owner-identity bypass. |

The S151 local inspection found no linked staff identities and all eight local
team-member business grants disabled. Current local private-actor regressions
use synthetic application identities inside rollback transactions. B06's local
navigation captures use controlled role/route props, not authenticated staff
sign-in. Earlier live staff work and September/S122 results are separate, dated
evidence. Requalify sign-in/setup before claiming the complete role matrix works;
do not enable grants, create Auth links or provision replacements to manufacture
a passing audit.

### Visitor showroom and product workflows

1. Open `@demo-tena-food-kitchen` from Market (or `/@demo-tena-food-kitchen` on
   web, `/shop/demo-tena-food-kitchen` in the mobile preview). Choose Prepared
   Meals, search for the product, add it from its card, open details and go Back.
   Category and query should remain. All clears only the category; clearing the
   search keeps the selected category. Collection names are merchant content.
   Collections are optional. Listings are products, including custom-order
   products; there is no public Products-versus-Services filter.
   Very narrow public/private previews use one full-width product card; wider
   grids use two columns only when both 150px cards plus their gap fit.
2. Use the floating current-business Inquiry list. Switch to
   `@demo-aloe-field-care`; its list is separate. No list button appears on Market.
   Contact handoffs use the existing approved test destinations; do not send a
   message unless you intend to contact that destination. Manual Copy is optional.
3. In Market Products, read the excerpt, supply and source business/city before
   opening details. The source business link opens the showroom separately. On
   the map, counted groups zoom normally; final groups show every admitted shop
   together with description/location and a fuller business preview.
4. Open the transport/shipping invitation, check From/To and contact fields, then
   close or go Back without starting a chat if you only want to inspect the form.
   Transport chat and owner Support remain independent of business social messages.
5. Listing options groups Report, Block and saved-block management. Visitors need
   no login; a block is a reversible browser/device preference, not a business
   suspension. Cancel a report to test the UI without sending a staff task.
6. On Featured, choose the category by its illustrated name; weekday/date are
   secondary schedule context. Scroll the row sideways on a small screen.
   Confirm its category/date match the chosen lineup, then open a business and
   go Back. The selected choice should return in view. This S151 B10 source
   correction is part of the pending combined review, not a live-release claim.

These are inspection instructions. The linked protected receipts distinguish
actual completed workflows, controlled fixtures, visual approval and deployment.
Expo in Chrome does not prove installed Android, native MapLibre or OS handoffs.
The automated checks currently use isolated installed-Chrome headless sessions;
they need not open a visible window. Test cleanup closes only its own browser.
An unexpected close/crash/deadline fails the recorded journey. Keep the preview
servers running and use the links above in an ordinary browser for manual testing.

The combined current review is
`.local/mirtpage-final-release-20261019/s151-batch-audit/review.html`; its receipts
distinguish actual public web/Expo tasks, earlier bounded live staff work,
controlled local private-actor tests and blocked authenticated local journeys.
Supporting reviews are `.local/native-showroom-grid-s151/review.html` and
`.local/contextual-loading-s151/review.html`. S151 visual approval, full gates,
publication and a newly built Android verification remain separate steps.
The protected `.local/workspace-audit-s122/TEST-GUIDE.html` retains private
role-specific aliases and historical setup/procedure references. It is not
evidence those accounts or Auth links are currently ready. S102/S110 and later
S113–S136 receipts remain dated evidence rather than complete certification.

S106 removes new business-inbox submissions. Select products and activate a
configured SMS, WhatsApp or Telegram contact to copy the inquiry before opening
its destination; sending remains the visitor's choice. Manual Copy remains an
extra option. Owner-approved demo contacts are active only when their effective
contact matches the configured approval. Separate website/social-profile links
remain distinct from inquiry handoffs. Transport and owner-support tests remain;
staff/admin stay web-only. Demo handoffs remain disabled when effective contacts
do not match the configured approval. S151 B04 found mismatched published
contacts and a missing production operator setting; prepared corrections are
not evidence of a live repair. Private login aliases require the qualification
above. Exact personal emails belong only in the protected local guide;
passwords and one-time codes belong in neither this document nor builds.

## Historical identity evidence and recovery — 23 September 2026

Protected target-specific plans, before-images, journals, reconciliation and
session results are under `.local/demo-account-emails-20260923/`, with directory
permissions 0700 and file permissions 0600. They are excluded from Git and builds.
In that operation, provider UUIDs and historical link records were preserved.
Admitted accounts without provider identities gained confirmed identities and
immutable links to their existing canonical users. Roles and tenant ownership
were unchanged. These are historical operation results, not a current-directory
or October Auth-link qualification.

An interrupted operation must be diagnosed from its per-account journal and both
identity stores. Never bulk restore users or rerun a broad seed/migration. An exact
recovery plan can restore an old account email and its existing provider email;
newly provisioned provider identities require separate reviewed cleanup. There
is no schema migration or application deployment to roll back.

Verified 2026-09-23: 77 live accounts (47 updated identities, 30 newly linked)
and 79 local accounts (47 updated identities, 32 newly linked). One real hosted
account and two real local accounts retained their emails. Each corrected account
reconciled with Supabase then; existing UUIDs and historical links were unchanged.
Thirteen public-content/role tables were unchanged in each environment.

The actual application OTP-verification route, correct dashboard and sign-out
passed locally and live in that dated operation for an existing demo owner, a
newly linked demo owner, administrator, operations manager and team member. Owner
product lists also loaded. No email-delivery API was called; actual Gmail receipt
was not tested. Local and hosted health checks returned HTTP 200 then. Negative
rehearsals rejected real/non-demo accounts, collisions and invalid role admission;
alias uniqueness/length and spec validation passed. These results do not establish
that every current role works or that Gmail delivery currently succeeds.

That was a completed data operation, independent of application releases; it made
no application deployment or schema change. Later deployment status is recorded
in the active transition checklist and target-specific release receipts.

## Current focused tasks

The current floating Inquiry list is specific to the business whose shop/product
is open; it does not appear on Market or carry one shop's count into another.
Without signing in, add two products, inquire directly about a third and confirm
the saved count remains two. Open the list to remove items or clear a group when
offered; it disappears at zero. Return to that business to recover its independently
saved list. Web and mobile restore per-business references and validate them
against the current eligible catalog. Configured, owner-approved demo SMS,
WhatsApp and Telegram actions copy the selected-product message before handoff;
Manual Copy and separate profile links remain available. Transport chat opens
the route intake in one activation, or a saved conversation; no request is created
until Start chat. The S113 review at `.local/floating-actions-s113/review.html`
is historical. Use this task map and the S151 evidence/limits above; source,
production and installed Android remain distinct.

**Account → Transport chat** remains separate from owner Support on web and
mobile. After requalifying the demo-owner identity, check the editable name
and phone, enter a clearly labelled local test route/goods, then Start chat.
Match its reference in a separately qualified transport-agent web session and
test replies both ways. End chat as the owner; verify it remains in owner Chat history and
staff follow-up history, then resolve as staff. Account → Support still goes to
the separate business-support team. Visitor transport remains independent;
signing in does not import a guest chat. An unqualified role remains blocked;
do not create an account or Auth link as a workaround.
Use labelled local fixtures for new tests. Live conversations, emails and social
sends require their own authorized scope; this guide is not that authorization.

### Focused owner and business management

On owner web or mobile, open Account → Your page, then choose About the business,
Cover photo, Business video, Page color, Public contact details or Page address.
There is no Allow team editing task: business management authority is controlled
by the administrator, not owner consent. Web Your page is
`/dashboard/profile/showroom`, Products is `/dashboard/products`, Business details
is `/dashboard/business` and private Account settings is `/dashboard/account`.
Expo exposes the same focused tasks through its `/owner/...` screens.
Preview remains the publication destination. Each editor shows only its task;
Cancel returns to Your page and asks before discarding unsaved work. Business
details holds business/category/location; Account settings holds private details
and security. Use the protected local guide for exact login aliases and Mailpit.

On admin web, open Businesses → a business. Its local sections are Overview,
Your page, Products, Business details, Location & visibility and
Access. Categories are inside Products, with a saved list and deliberate Add/Edit
or removal confirmation. Business details separates identity, live presentation
and sharing; administrator-only Access contains owner sign-in and public-page
status. Staff business editing is controlled at Staff → a staff record →
Manage businesses / Edit business access. A current grant enables all-business
management independently of Support/Transport function and chat availability.
Granted staff enter Business workspaces at `/dashboard`, then select a business;
a missing/revoked grant must deny stale direct links and open editors as well as
hide business navigation. Only an administrator can change it. Do not change the
eight disabled local grants for this guide. Private account security and owner
sign-in verification remain outside staff business authority.
Read/Edit/Cancel is safe for layout review; Save, Publish, Assign and Delete are
real writes and should be tested only with the appropriate labelled local fixture.

### Independent Shipment tracking

Authorized transport staff/managers open `/dashboard/tracking` → New or a saved
record → Edit. Recipient-addressed shipments and their ordered provider legs,
methods and optional external tracking links/codes are independent of a chat;
one recipient can have several shipments. Staff do not wait for recipient
verification to create a shipment. Visitors/owners enter `/tracking`, including
its link from Transport chat, verify their email and see only their shipments.
This does not establish a live scan/status integration. Support-only staff have
no shipment-editing authority. Owner Support (`/dashboard/support`), owner
Transport chat (`/dashboard/transport`) and staff Shipment tracking are separate
tasks, not a business customer inbox.

For chat workflow checks, match the exact request reference between sessions.
Internal assignment does not tell the customer an agent joined: staff must
explicitly Join chat. Read receipts require incoming messages visible in a
focused transcript; opening a record is insufficient. Test both-way replies,
End chat, history and staff Resolve separately. Inactivity timers and alerts
need their own elapsed-time and delivery evidence.

Current mobile testing uses Chrome at `localhost:8082`. Physical-phone control
is stopped at the owner's request. Expo does not prove installed Android,
native MapLibre, OS notifications or external app inbox handoffs. No account,
grant, Auth, database or provider change is part of this documentation update.
