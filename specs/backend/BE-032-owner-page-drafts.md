---
id: BE-032
title: Tenant-owned page drafts and revocable staff assistance
status: in_progress
related: [FE-052, BE-031, FE-038, FE-040, DEP-030, ADR-0018, BE-033, BE-034, FE-019, BE-018, DEP-039]
owners: [backend, security]
last_updated: 2026-09-27
change_level: L2
---

# BE-032 - Tenant-owned page drafts and revocable staff assistance

## Current release evidence — 2026-09-14

The owner approved the visual design and deployment. Source `41e2fed` is published
as Netlify `6aa7fe5a106ca381ba08bba3`; hosted schema 43 and the public desktop/phone
workflows are verified. Full core/release, seven isolated authenticated/public
acceptance scenarios, 72 accessibility states, operations, PostgreSQL and container
gates pass. Earlier approval/full-gate-pending notes below describe intermediate
local milestones, not a new approval requirement. Remaining hosted email delivery
and authenticated production smoke are tracked in DEP-030 and
`docs/SUQPAGE-DEPLOYMENT-2026-09-14.md`; this evidence does not claim those passes.

## Problem and outcome

The existing full-page revision requires a staff service request and replaces
the catalog at publication. Self-service drafts must be owned by a tenant,
independent from staff requests, with consent that cannot be forged in content.

## Contracts

- Additive schema stores one current draft per tenant, a monotonically increasing
  draft version, separate assistance consent and actor-attributed events.
- A new draft uses one standard business profile; it never changes a canonical catalog or
  converts the existing live design. No service request is fabricated.
- Owners read/edit only their own tenant. Scoped staff need explicit active
  consent. Managers/admins are staff for this content-edit boundary; team members
  also need an existing assignment. No client-provided role or owner ID is trusted.
- Consent is off initially, owner-only and revocable. Reads and mutations recheck
  it; saving an old snapshot cannot enable it. Permission and draft commands are
  separate operations sharing one draft version to reject races, including
  revoke-versus-save.
- Saves require the expected draft version, reject unsupported keys, and accept
  only bounded text, two admitted cover treatments and tenant-owned media references.
- Business names come from canonical business details, not a separate heading.
  Optional business-video URLs use the existing controlled YouTube validator and
  privacy-enhanced embed. Reject arbitrary hosts, credentials and script URLs.
- Previously saved local `shop-v1` drafts are read through a bounded adapter;
  introduction, About and image are preserved, the canonical name is used, and
  the two old layouts map to the two cover treatments. New writes accept only
  `profile-v1`. No catalog or schema conversion is required for that draft change.
- The editor selects existing tenant-owned catalog images or new private
  uploads using existing sanitization and private storage, authorized before upload
  and again before attachment. Private reads recheck tenant/consent; no public
  URL is emitted for a private image.
- Cover uploads reuse the existing sanitizer and media store in a private
  `pages` namespace, with tenant-prefixed random object keys. No new bucket,
  database schema or provider configuration is introduced. Reads authorize the
  exact tenant and current staff consent before storage access; responses are
  private/no-store and never redirect to a public or signed provider URL.
- Both initial and later draft saves require an existing tenant-owned image.
  Uploads recheck permission after storage and remove staged bytes if permission
  was lost. Image size is limited to 5 MB, the existing 20M-pixel limit applies,
  and multipart bodies are stream-bounded before parsing. Twelve upload attempts
  per tenant/hour are enforced by the existing shared limiter.
- Replaced or abandoned uploads stay private during this gated checkpoint.
  Retention/promotion belongs to S3 before public rollout, not a broad cleanup
  operation in this upload-control fix.
- API failures are bounded, redacted, no-store and same-origin protected.
- First save accepts the same validated fields and owned media as later saves.
  An identical create retry may return the existing draft; a different concurrent
  create receives a conflict, never an implicit overwrite of the new version.
- Owner publication for existing active pages is defined by S3a below.
  Marketplace moderation and new-tenant product authoring remain later steps.

## Optional public contact details (S2f)

- The compatible profile JSON may include optional public contacts: phone, email,
  website, WhatsApp, Telegram, TikTok, Instagram and Facebook. Missing contacts
  use canonical public email/phone and legacy public social handles; notification email and private
  onboarding/account phone/email are never public fallback data.
- Owners or consented scoped staff may save these with the same private draft
  version checks. Only explicit owner publication makes those draft edits public.
  Profile edits do not rewrite canonical contacts, notification or inquiry
  destinations. S2g below adds explicit canonical public fields for baseline pages.
- Phone/WhatsApp use bounded international digits, email is bounded and rejects
  header injection, website requires HTTPS without credentials, and social
  profiles use bounded handles on fixed provider origins. Unsupported keys,
  control characters and unsafe URLs fail before saving. Empty fields omit links.

```gherkin
Scenario: Public contacts require owner publication
  GIVEN a saved private contact edit by an owner or consented staff member
  WHEN a visitor opens the business page before publication
  THEN they still see only canonical public social handles or the last publication
  WHEN the owner publishes the exact saved draft
  THEN its validated public contacts appear without changing private notification data

Scenario: Reject unsafe contact destinations
  GIVEN malformed phones, injected email headers, script URLs or unknown contact keys
  WHEN a profile is saved
  THEN it fails validation and preserves the previously saved draft
```

## Scenarios

### S3a publication checkpoint

- Existing active-page owners can publish only the exact saved draft/version,
  never client-submitted content. Staff, including admins with editing consent,
  cannot publish or restore. New/draft and suspended businesses cannot publish.
  First-listing approval remains S3b and is not granted by this operation.
- Publication history is append-only, tenant-scoped, with independent revision,
  source draft version, owner actor and timestamp. Serialize publication with
  draft writes, compare the expected draft and publication versions, and reject
  conflicts. No products, contacts, handles, live design manifests, business
  status or discovery approval records are overwritten.
- Restore previous appends the immediately preceding published snapshot (or a
  null profile selecting canonical content in the shared profile on first restoration).
  The private draft is retained. Neither restore nor later draft edits can
  silently change another published revision.
- Public rendering selects the latest published snapshot only while the owner
  editor gate is enabled and the business is active. Without a snapshot or with
  the gate off, the same renderer uses canonical content. Public cover reads require the exact currently
  published private image reference, with an active-business check before and
  after storage; draft-only and superseded private covers remain inaccessible.
  These media responses are no-store; no object is copied to public storage.
- Retained publication images cannot be removed while referenced by history.
  Abandoned-upload retention remains an S3b rollout requirement. Discovery joins
  only the latest publication, never drafts, and emits the same public cover
  reference as the page without per-card database calls. Restoration restores
  canonical cover selection too. Publish/restore invalidate tagged discovery
  caches and routes. The public cache adapter refreshes current covers outside
  the heavier cached geography/schedule projection, in batches of up to 250 IDs,
  so stale cache entries cannot select a previous cover. No per-card query or
  private draft read is introduced. Approved draft-cover URLs bypass the image optimizer's persistent
  cache and retain the media endpoint's no-store behavior.
  This checkpoint does not change providers.

```gherkin
Scenario: Publish a saved profile
  GIVEN an owner with an active page and a saved draft
  WHEN they publish its current draft and publication versions
  THEN only that saved profile becomes the public page at the existing handle
  AND further draft edits remain private until another explicit publication

Scenario: Reject a stale or unauthorized publication
  GIVEN a staff account, foreign owner, inactive business or changed version
  WHEN publication or restoration is attempted
  THEN no public snapshot or canonical catalog record is changed

Scenario: Restore the previous page
  GIVEN a published profile and the current publication revision
  WHEN the owner restores the previous page
  THEN the previous profile or original managed page is selected atomically
  AND the draft and full publication history are retained

Scenario: Private save
  GIVEN an owner, their tenant and the current draft version
  WHEN they save validated page fields
  THEN the draft version advances and the actor is recorded
  AND canonical products, public visibility and inquiries are unchanged

Scenario: Cross-tenant or unconsented staff edit
  GIVEN another tenant owner or staff without current consent and scope
  WHEN they read or mutate the draft or reference another tenant's media
  THEN the operation is denied without exposing content

Scenario: Consent revocation wins
  GIVEN a staff editor loaded a permitted draft
  WHEN the owner revokes assistance before the save is committed
  THEN that save cannot overwrite consent or commit private changes

Scenario: Conflicting saves
  GIVEN two writers with the same expected version
  WHEN both save different changes
  THEN at most one succeeds and the other receives a conflict

Scenario: Another account tries a private cover URL
  GIVEN a saved private cover
  WHEN an anonymous visitor, foreign client or revoked staff requests its URL
  THEN no image bytes are returned
  AND an unknown, traversal or foreign-tenant media reference cannot be saved
```

## Test plan

Focused tests cover all roles, assignment, consent/revocation, forged fields,
media scope, concurrent versions, safe failure, and no canonical catalog writes.
Local PostgreSQL integration is required before persistence is marked verified;
fakes are identified separately and never claimed provider evidence.

## Local checkpoint evidence

`test:owner-page` has 19 passing cases covering domain permissions, first-save
conflicts, profile/video validation, saved local draft compatibility, private
media ownership, bounded multipart/image input, upload-time revocation,
owner publication, stale revisions, inactive businesses and restoration;
`test:owner-page:postgres` verifies the actual adapter on local Supabase, including
the revoked-write race, attributable events, normalized business video/cover
settings, local saved-draft compatibility and unchanged canonical records.
Migration 39 adds `owner_page_drafts` and `owner_page_events`; Supabase `anon`
and `authenticated` have no table access. Authorized app-server access retains
the current application authorization model. Browser checks verify actual local
Supabase private Storage upload/read/save/reload, anonymous draft read denial,
owner publication, exact current public-cover scope and restoration;
adapter tests separately use fake transport to verify namespace isolation.
Migration 40 adds server-only publication history. Integration verifies current
draft/publication version checks, retained drafts, unchanged canonical records,
restore to original, inactive-business denial and gate rollback. Public image
reads expose only the approved current reference without changing storage ACLs.
FE-042/BE-033 verify local first-listing review and discovery pagination.
Full release gates and the broader asset-retention rollout remain pending;
no hosted migration or provider configuration change was performed.

## Rollout and rollback

DEP-030 covers the additive migrations. FE-042/BE-033 enable the editor by default;
SUQPAGE_OWNER_EDITOR_ENABLED=0 explicitly disables it. No
hosted migration in this implementation checkpoint. Roll back application access
without dropping drafts, consent history or existing managed-service records.

## Readiness

Draft saving, owner publication and first-listing review are separate operations.
FE-042/BE-033 govern first publication; marketplace geography remains independently
approved and is not implied by successful draft persistence.

S2f local evidence (2026-09-14): optional public contacts round-trip through the
actual PostgreSQL draft/publication adapter; canonical catalog/notification fields
remain unchanged. Unit regressions reject unsafe destinations and prove private
contact edits remain unpublished. Browser checks verify visible phone/email and
safe site/social hrefs only after owner publication. 22 focused domain/security
cases pass; full build/release and hosted verification remain gated on UI approval.

## S2g — Contact separation contract

Additive migration 41 adds businesses.public_email/public_phone (empty defaults)
and users.account_phone (empty default). The existing users.email remains the
verified account email; businesses.contact_email remains private notification
data. No automatic backfill copies either to public fields. Published contacts
override canonical public fields, including explicit clearing. Private phone is
excluded from SessionUser and all public catalogs; a narrow server adapter reads
and updates only the authenticated user's row. Inputs accept a bounded international
phone, normalize spaces/parentheses/hyphens, or allow clearing. A phone is contact
data, not verified identity or an authentication factor.

```gherkin
Scenario: Forged account target cannot alter another user
  GIVEN authenticated user A and a submitted user ID B
  WHEN A saves account phone
  THEN the server uses A's session ID only
  AND B's phone, account email and all public contacts are unchanged
Scenario: Signup contact stays private
  GIVEN a verified email and valid account phone
  WHEN private onboarding succeeds
  THEN users stores that email and phone
  AND business public phone/email and WhatsApp remain empty
Scenario: Migration preserves retained identity
  GIVEN existing users, businesses and immutable identity links
  WHEN migration 41 is applied twice
  THEN additive contact columns exist with empty defaults
  AND retained contacts and identities are unchanged
```

Test plan: scripts/test-account-contacts.ts (validation/self scope/SQLite privacy),
scripts/test-account-contacts-postgres.ts (migration/rehearsal/signup/privacy),
scripts/test-signup.ts, scripts/capture-account-contacts.mjs.

S2g privacy regression: the public route must blank the server-only notification
email before serializing catalog props to the browser. Structured inquiry delivery
continues resolving its destination on the server. Tests must inspect anonymous
HTML/RSC output, not only visible links.

S2g local verification (2026-09-14): migration 41 and repeat apply passed after
protected loopback backup. Account/signup/domain and PostgreSQL privacy tests pass;
66 anonymous page responses exclude private contacts. Three account browser
workflows/accessibility scans and the 24-state/12-profile-scan public matrix pass.
Approved fictional contacts populated for 66 demo pages and 47 demo users, retaining
account emails. Two non-demo account phones require owner input. Evidence and
screenshots: docs/SUQPAGE-TRANSITION-CHECKLIST.md S2g. Visual approval, full gates,
commit and hosted rollout remain pending.

## S33 first-publication readiness — FE-052 (local)

For the current self-service first-Publish flow, the server rejects an unchanged
starter About, any retained starter contact value, an unreviewed example location,
and missing real offerings or listed starter offerings. The owner can replace or
remove optional sample contacts and offerings. UI readiness links lead to the
relevant editable fields; the server rechecks while holding publication locks.
Existing active-page Save, consent and tenant/version guards are preserved.
`scripts/test-launch-clarity.ts` and `scripts/test-self-service-publication.ts`
cover denial, correction, publication, atomic failure and immediate live Save.
This local extension is not a hosted rollout claim.

## S48 reviewed video entry

FE-019/BE-018 and DEP-039 govern video changes. Normal owner/staff media saves
retain existing references or the example; new links require a target-bound
support request and assigned staff review. Staff may approve a supported
YouTube URL from any channel without channel configuration. Existing photos,
other fields and previously admitted videos remain unchanged. New products use
the starter video. `scripts/test-video-requests.ts` covers tenant/agent boundaries,
forged saves, approval without channel setup, retries, stale targets and exact-field
preservation; `scripts/capture-video-requests.ts` covers the real owner/staff forms.
Local evidence passes; refreshed release and publication gates remain pending.
