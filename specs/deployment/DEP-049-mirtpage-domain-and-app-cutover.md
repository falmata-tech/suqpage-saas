---
id: DEP-049
title: MirtPage domain, managed services and app release cutover
status: draft
related: [FE-070, BE-059, DEP-029, ADR-0029]
owners: [operations, security, mobile]
last_updated: 2026-10-18
change_level: L4
---

# DEP-049 — MirtPage cutover

## Problem and outcome

Move the platform's visible identity and canonical domain to MirtPage/mirtpage.com
while preserving the business system. The owner confirms new com.mirtpage.app with a separate Play app and
confirms mirtpage.com purchased and ready in GoDaddy on 2026-10-18.
GoDaddy ownership/delegation and all seven current zone records are independently
verified and protected, together with the exact Netlify site/account/domain
beforeimage. Later runtime/env, hosted data/Auth phases and remaining providers
still need their own phase-specific verification. The owner approves the exact independent domain
and app-record operations on2026-10-18. Both new Netlify aliases and the reviewed
GoDaddy A/www records are saved/read back; both authoritative nameservers agree
and all unrelated zone records, old primary and published deployment are retained.
Managed HTTPS/host verification and additive app records are now complete under
the exact approved operations. All four reviewed hosts pass normal TLS/root/
health checks and retain the published deploy6acd6e4203a2e50c6b9286dd and its20
public assets. Firebase registered com.mirtpage.app as
1:588262779708:android:9a9f3944058b1fcc248c39; Play app4975632567188114692 is a
separate Free MirtPage Draft. Original applications and keys are preserved.
Protected receipts are provider-domain-apply/verified.json and
provider-registration/verified.json under the private S145 review. No candidate
code/canonical/runtime/mail/data cutover is inferred. Hosted Auth staging now
adds only the exact new callback to uri_allow_list: site_url remains the old
origin, Google login disabled, and an independent243-field readback exactly
matches the approved patch with241 non-target fields preserved. New-primary
Auth is still unapplied; its short-lived read-only plan is not approval.
Existing production schema63 and local
candidate schema72 are different release states, not interchangeable baselines.

The final public brand is MirtPage everywhere. Retained old provider IDs,
protocols and historical evidence support a bounded transition, not permanent
public co-branding. Retire them only where safe and explicitly reviewed; do not
delete business records or rotate keys merely to remove an internal old name.

## Independent provisioning readiness

The hosting-alias and additive app-record phases were independently Ready and
have now completed under exact owner approvals. Their independence remains:
neither deploys the candidate nor changes the current primary domain, application
runtime, Auth, mail, schema, explicit signing selection, build or release. The
existing published Netlify deploy and old applications remain the authorities.
This separates provisioning from code rollout; it does not waive, skip or mark
the failed acceptance cases passed.

For hosting staging, require fresh exact GoDaddy/Netlify target and field checks,
the protected recoverable beforeimages, and owner approval of only the new apex/
www aliases, reviewed A/www records and managed HTTPS coverage. Verify the
unchanged published deploy and old primary/TLS/health, authoritative DNS, exact
reviewed host boundaries, bounded redirects with no loop, and new-host HTTPS.
For app records, require fresh complete inventories and duplicate checks, retained
old-client configuration, reviewed package/name/language/App/Free and owner
acknowledgement of the actual Play declarations. Read back actual new identities
and any provider-provisioned defaults while preserving old apps and keys. These
are additive persistent records, not a cross-provider transaction.

Candidate code publication, primary/canonical/Auth/mail/data cutover, native
identity/build/upload and store release still require their full applicable
checks and exact recovery/approval gates. Local application check76, full web
release and all20 browser journeys now pass on source-bound isolated snapshots;
browser digest9e8e8e04774ca23af878169c64e6704e60cca35a17df3e9c50d560abdb953f00
preserves the passing release's application/dependency inputs. Earlier17/20,
16/20 and interrupted partial attempts remain raw evidence. Thirteen stream-
closure errors are retained with unproven timing/cause. None of this publishes
the candidate or new native app. Ambiguous hosted outcomes still stop further writes; no automatic
retry, deletion or restore follows from independent readiness.

## Ordered contracts

1. Independently verify registrar ownership/delegation, current Netlify account/
   site/deploy, Supabase project/schema, Expo/EAS, Firebase and Play app. Public
   Earlier NXDOMAIN is historical; recheck authoritative delegation and records
   after the owner's purchase confirmation rather than relying on resolver caches.
2. Capture protected configuration, DNS/mail, database/Auth/Storage and artifact
   recovery evidence. Do not reset projects or rotate secrets to improve names.
3. Finish local FE-070/BE-059, review actual visuals, then full/release/acceptance
   and artifact/security gates before publishing candidate code or changing its
   runtime. Independent provisioning above does not publish it. Preserve
   unfinished S141–S144 evidence and scope.
4. Attach new apex/www to the existing site; prove HTTPS and domain control before
   changing canonical origin. Prepare reviewed exact dual-origin actions/CORS/
   Auth callback policy, OAuth consent/display and App Links. Google login stays
   disabled unless separately requested; no paid custom Auth domain is required.
5. Verify the new email-sending domain and DNS records without overwriting mail.
   Choose reviewed sender addresses, preserve recoverable credentials and handle
   in-flight jobs before changing templates/senders. Test controlled delivery.
6. Apply provider-specific changes only under their exact backup/approval guards.
   DEP-029 plan/apply must support the reviewed domain transition before hosted
   Auth changes; no config push, broad REST write or raw-command fallback.
7. If a new Android package is selected, create a separate Play app and Firebase
   Android registration, verify generated configuration/signing and app-scoped
   submission permissions, build and inspect a new binary. Never fabricate a
   Firebase registration by editing old JSON or assume the Play signer certificate.
8. Recreate listing metadata, disclosures, reviewer access, icon/feature graphic
   and real screenshots in en/am/om. New-package closed testing has fresh opt-in
   and qualifying duration; old app/test history is not transferred or discarded.
9. Cut over with monitored old/new host, Auth, media, public/owner/staff/admin,
   support/transport, Tracking, email, push and installed-device checks. Keep old
   API/active anonymous traffic working and redirect safe public GET links with
   handles/query intact. Avoid broad redirects of POSTs and private sessions.
10. Retire old paths/services only after verified adoption and a separate reviewed
    retirement plan. Do not delete the old Play app, credentials or service data.

## Scenarios

GIVEN unresolved domain delegation or package choice WHEN a remote cutover is
requested THEN keep current traffic/signing intact AND continue independent local
design and planning.

GIVEN a proven new HTTPS domain and reviewed origin/Auth/email plans WHEN the
cutover runs THEN MirtPage public pages and workflows work AND old-client API,
account/tenant data, media and active chat access have verified compatibility.

GIVEN new com.mirtpage.app is chosen WHEN it is submitted THEN it is treated as
a separate app with measured signing, new registration/tokens and fresh testing;
the previous package is never claimed to update in place.

## Test plan

Exact target/DNS/HTTPS/redirect checks, protected backups and isolated restore;
dual-domain Auth/action/CORS/App Link tests; current/legacy client and push-channel
compatibility; real email/Mailpit distinction; full local/release/acceptance gates;
artifact package/certificate/config privacy inspection; controlled real-device
login/media/social handoff/notification tests; provider readbacks and monitoring.

## Rollout and rollback

Use staged provider plans with exact fields/digests and recoverable backups.
Rollback code/domain configuration without dropping new data. Unexpected remote
mutations/timeouts stop further writes pending exact recovery direction. No
credentials, private artifacts or customer data enter Git, logs or screenshots.
