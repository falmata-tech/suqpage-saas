# Demo account access

DEP-041 records the owner-authorized correction of existing demonstration account
sign-in emails to distinct aliases of one owner-controlled inbox. Public shop
contact details are separate. S102 corrects public contacts in the local preview
only; hosted correction remains a distinct release operation. Generic fixture code contains no
personal inbox address.

The private account directory is
`.local/demo-account-emails-20260923/SIGN-IN-ACCOUNTS.md`. It lists exact emails
and account roles; it contains no passwords or one-time codes. Open `/login`,
enter the selected email, and complete the normal six-digit email-code flow.
Each alias identifies a separate account and retains its existing business and
permissions. Do not strip the plus suffix or substitute the base inbox address.

Local Supabase captures mail in its local mail viewer; it does not send to Gmail.
The hosted sender and email templates remain unchanged. A disposable fixture
reset recreates the generic fake-email seed; this one-time data correction is not
an automatic fixture reset or a change to real customer onboarding.

## Current workflow test guide

### Current local showroom/preview review — S129–S136

Open web `http://127.0.0.1:3102` or the mobile preview
`http://localhost:8082`. English, Amharic and Afaan Oromo are the current language
choices; retained Somali/Tigrinya preferences fall back to English. The web
language control becomes available after its client handler is ready.

1. Open `@demo-tena-food-kitchen` from Market (or `/@demo-tena-food-kitchen` on
   web, `/shop/demo-tena-food-kitchen` in the mobile preview). Choose Prepared
   Meals, search for the product, add it from its card, open details and go Back.
   Category and query should remain. All clears only the category; clearing the
   search keeps the selected category. Collection names are merchant content.
   Very narrow public/private previews use one full-width product card; wider
   grids use two columns only when both150px cards plus their gap fit.
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

These are inspection instructions. The linked protected receipts distinguish
actual completed workflows, controlled fixtures, visual approval and deployment.
Expo in Chrome does not prove installed Android, native MapLibre or OS handoffs.
The automated checks currently use isolated installed-Chrome headless sessions;
they need not open a visible window. Test cleanup closes only its own browser.
An unexpected close/crash/deadline fails the recorded journey. Keep the preview
servers running and use the links above in an ordinary browser for manual testing.

The protected `.local/workspace-audit-s122/TEST-GUIDE.html` is the current local
workflow guide. It records role-specific login aliases and setup status for the
main admin, demo owner, private QA business and dedicated support/transport
agents. It includes current web/mobile links, Mailpit, separate-session
instructions and ordered inspection and editing scenarios. The S102 and S110
directories are historical evidence. The guide is a testing procedure, not a
claim that every scenario has passed on every platform.

S106 removes new business-inbox submissions. Select products and activate a
configured SMS, WhatsApp or Telegram contact to copy the inquiry before opening
its destination; sending remains the visitor's choice. Manual Copy remains an
extra option. Owner-approved demo contacts are active only when their effective
contact matches the configured approval. Separate website/social-profile links
remain distinct from inquiry handoffs. Transport and owner-support tests remain;
staff/admin stay web-only. Private login aliases remain usable. Exact personal
emails belong only in the protected local guide; passwords and one-time codes
belong in neither this document nor builds.

## Evidence and recovery

Protected target-specific plans, before-images, journals, reconciliation and
session results are under `.local/demo-account-emails-20260923/`, with directory
permissions 0700 and file permissions 0600. They are excluded from Git and builds.
Provider UUIDs and existing historical link records are preserved. Accounts that
previously had no provider identity gain a confirmed identity and one immutable
link to their existing canonical user. Roles and tenant ownership do not change.

An interrupted operation must be diagnosed from its per-account journal and both
identity stores. Never bulk restore users or rerun a broad seed/migration. An exact
recovery plan can restore an old account email and its existing provider email;
newly provisioned provider identities require separate reviewed cleanup. There
is no schema migration or application deployment to roll back.

Verified 2026-09-23: 77 live accounts (47 updated identities, 30 newly linked)
and 79 local accounts (47 updated identities, 32 newly linked). One real hosted
account and two real local accounts retain their emails. Every corrected account
reconciles with Supabase; existing UUIDs and historical links are unchanged.
Thirteen public-content/role tables are unchanged in each environment.

The actual application OTP-verification route, correct dashboard and sign-out
pass locally and live for an existing demo owner, a newly linked demo owner,
administrator, operations manager and team member. Owner product lists also load.
No email-delivery API was called; actual Gmail receipt was not tested. Local and
hosted `/api/health` return 200. Negative rehearsal checks reject real/non-demo
accounts, canonical/Auth collisions and invalid role admission. Long aliases remain
unique within the email local-part length limit. Spec validation passes.

This is a completed data operation, independent of the pending gallery/handle/
starter feature release. Production application deployment and schema are unchanged.


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
is historical. Use the S122 guide for current behavior; production/installed
Android and release approval remain separate.

S114 adds **Account → Transport chat** on web and mobile. Sign in with the
existing demo-owner identity from the protected guide. Check the editable name
and phone, enter a clearly labelled local test route/goods, then Start chat.
Match its reference in the existing transport-agent web session and test replies
both ways. End chat as the owner; verify it remains in owner Chat history and
staff follow-up history, then resolve as staff. Account → Support still goes to
the separate business-support team. Visitor transport remains independent;
signing in does not import a guest chat. No new test account or password is needed.
Use local previews only until the separately approved rollout.

S115 organizes management under the same existing test identities. On owner web
or mobile, open Account → Your page, then choose About, Cover photo, Business
video, Page color, Public contact details, Page address or Allow team editing.
Preview remains the publication destination. Each editor shows only its task;
Cancel returns to Your page and asks before discarding unsaved work. Business
details holds business/category/location; Account settings holds private details
and security. Use the protected local guide for exact login aliases and Mailpit.

On admin web, open Businesses → a business. Its local sections are Overview,
Your page when consented, Products, Business details, Location & visibility and
Access. Categories are inside Products, with a saved list and deliberate Add/Edit
or removal confirmation. Business details separates identity, live presentation
and sharing; Access contains owner sign-in, staff assistance and status controls.
Read/Edit/Cancel is safe for layout review; Save, Publish, Assign and Delete are
real writes and should be tested only with the appropriate labelled local fixture.
