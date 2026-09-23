# Demo account access

DEP-041 records the owner-authorized correction of existing demonstration account
sign-in emails to distinct aliases of one owner-controlled inbox. Public shop
contact details are separate and unchanged. Generic fixture code contains no
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
