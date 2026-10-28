# MirtPage rebrand and migration plan

Historical release plan for the former identity. AfricMade is the current
platform; use FE-070/BE-059/DEP-049 S188 and the active AfricMade checklist for
current branding and release decisions. The dated target below is retained as
evidence of the prior transition, not a current instruction.

Owner direction confirmed 2026-10-18. Controlling contracts: FE-070, BE-059,
DEP-049 and proposed ADR-0029. Ordered work lives in
[the active checklist](../AFRICMADE-TRANSITION-CHECKLIST.md). This plan records the
target and verification order; it is not evidence of a completed migration.

## Confirmed target

| Area | Target |
|---|---|
| Public name | **MirtPage**, consistent capitalization, untranslated |
| Website | **https://mirtpage.com**, www redirects to the reviewed canonical host |
| Android | **com.mirtpage.app**, a separate Play app and new installation |
| Palette | Current orange/charcoal/cream/white; no return to older blue/teal artwork |
| Icon | Original M/page/display-panel symbol, one vector source and derived assets |
| Proposition | Digital showrooms for product businesses of every size |
| Customers | Explore a business's identity/story, products and optional collections; understand listed choices/availability, then contact the business directly |
| Businesses | Present what they sell, make, grow or supply in one organized, branded showroom alongside their existing social channels |
| Revenue | Transport arrangement; no visitor subscription, checkout or paid browsing |
| Languages | English, natural Amharic and Afaan Oromo; other locales remain disabled |
| Public support | Retain owner-approved marketvision.tech@gmail.com initially |

The owner purchased mirtpage.com on 2026-10-18. Exact GoDaddy/Netlify beforeimages,
targets and fields were verified before the owner's approved alias/DNS/TLS stage.
Both new aliases, the reviewed A/www records and managed HTTPS are now verified:
31 checks include both authoritative nameservers, all four certificate names,
eight root/health HTTPS probes and unchanged deployment6acd6e4203a2e50c6b9286dd
with its20 public assets. That was the alias/DNS staging phase. The later
MirtPage web deploy `6ad73e5a9df2756523e8ac95` is live. A separately
approved guarded Netlify setting now makes `mirtpage.com` primary and retains
`suqpage.com`, `www.mirtpage.com` and `www.suqpage.com` as HTTPS aliases. The
published deploy remained unchanged; MirtPage root/health and old-domain
privacy routes returned 200 after the switch. Earlier missing-domain and
TLS-pending failures remain historical evidence, not current unavailability.

MirtPage replaces Suqpage as the final public identity throughout. Retained old
records and internal identifiers exist only for safe migration, compatibility
or historical authority; they do not require permanent public co-branding or
authorize blanket account/data deletion.

The proposition includes retail, workshops, manufacturing, farms and materials
suppliers. These are audiences, not a long list repeated on every button. Use
products/collections and business stories as the visible value. Do not disclose
internal freight margins or promise stock, capacity, payment or shipment dates
that the application cannot verify. Continue using **digital**, not **internet**,
in the English proposition; local languages may explain the idea in fuller words.

## What the audit found

Three independent read-only inventories found 870 text-source files with 4,404
old-brand references and 112 files containing the old domain. References include
history, tests, technical protocols and customer-data boundaries; they are not
4,404 safe replacement targets. Primary UI buckets contain 146 files; 52 translation
source rows mention the brand. Thirteen Auth HTML templates, web/native brand
components, SEO/PWA, notification presentation and store materials need review.

The initial inventory found MirtPage asset aliases resolving to Suqpage artwork.
The local presentation tranche now fixes those mappings with canonical parity
tests; never silently shadow or loop the approved artwork.
Existing Play presentation covers English/Amharic; add an Oromo set when the
native wording and layout are approved.

The last verified live deployment uses schema 63; the unreleased local candidate
uses schema 77 and contains newer workflows. A rebrand is not permission to deploy
that schema/code gap without its release, backup and compatibility gates. Earlier
S141–S144 work and remaining gates stay in the checklist.

On 2026-10-19, a protected read-only archive of the verified hosted schema-63
database was captured. Its receipt records 98 table fingerprints and the 59
existing migration markers; the archive and receipt remain outside Git under
`.local/mirtpage-rebrand-s145/production-cutover-readiness/protected-live-backup/`.
This protects database content and metadata only. The first isolated restore
rehearsal stopped at its role/extension assertion before `pg_restore`, imported
no customer rows and cleaned up its disposable target. A corrected, independently
reviewed partial-rehearsal plan awaits the owner's exact authorization; it has not
run. Recovery remains unqualified because the private Storage object bytes and
managed role settings are not recoverable from this archive. No hosted schema,
traffic or data was changed by these read-only/isolated steps.
The first one-object private Storage backup also stopped before download because
its guard looked only for the absent legacy bucket setting. A separate bounded
read-only diagnostic verified that the canonical MirtPage bucket and key settings
exist on the same Netlify site; it did not access Storage or capture object bytes.
A corrected one-object backup still requires its own frozen guard and readback.

## Preserve the business system

Reuse the existing Netlify site and Supabase system unless a verified constraint
requires otherwise. The database role and private media bucket already use
MirtPage naming. Preserve Auth UUIDs, accounts, roles, handles, products, media
paths, chats, Tracking shipments and audit facts. Rename provider display labels;
do not delete databases or recreate identities to obtain a prettier project ID.

Firebase/Google project IDs are permanent. A new Android package needs a new
Firebase Android registration, but can use the retained project. Rename its
display name to MirtPage. A new Firebase project solely to remove a hidden old
ID would add sender/token/credential migration and needs a separate justification.

Keep existing cookies/storage/header/environment aliases, signing/private salts,
notification channel IDs and delivery idempotency namespaces where compatibility
requires them. Native and server currently share the same notification channel
IDs; renaming them blindly can break old installed-app notifications. Change
visible names now and migrate technical identities only with explicit contracts.

Classify every remaining old-name match as active visible branding, stable
compatibility identity, immutable history, provider ID or merchant-owned content.
Unclassified active matches fail the final audit. Never rewrite tenant stories,
external contacts, historical chat text or private login aliases by global replace.

## Ordered delivery

| Phase | Work and dependency | Evidence before moving on |
|---|---|---|
| 1. Identity and narrative | Original mark/wordmark, hero/About/customer/business voice, phone/app-icon study | Same palette, readable small icon, 320/390/1440 layouts, concrete design review |
| 2. Local integration | Small shared presentation identity; all public/owner/staff/admin surfaces; natural en/am/om; metadata/legal/PWA/native assets | Focused types/assets/alias/localization/narrative tests and exhaustive classified brand scan |
| 3. Real workflows | Visitor discovery/social contact; owner setup/edit/save/media; staff/admin support/transport; recipient Tracking | Actual Chrome desktop/phone/Expo, real local API/DB/Mailpit, current screenshots and explicit controls/limits |
| 4. Infrastructure preparation | Verify registrar/providers, exact backups, new HTTPS domain, origin/callback/CORS/email/App Link plans | Protected recovery evidence, provider-specific target/field/digest review; no traffic change yet |
| 5. Release readiness | Visual approval, full check/release/acceptance/security/artifact gates, task-scoped commit | Terminal passing required gates, source-bound artifact and rollback |
| 6. Website/domain/email | Controlled new-domain canonical/Auth/sender change; compatible old-origin API/chat and public redirects | Independent readbacks, real controlled mail, all-role smoke tests and monitoring |
| 7. New Android app | New Firebase registration/Play listing, reviewed Expo identity/signing, new build and install | Actual package/certificate/runtime/config-privacy checks and device workflows |
| 8. Play presentation/testing | Fresh icon/feature graphic/screenshots/listing/disclosures/reviewer access; invite approved testers through the new test | Correct new app/track, fresh opt-ins, 14 continuous days with at least 12 testers, then production-access application |
| 9. Retirement | Retire old entry points only after adoption and an exact reviewed plan | Old users/links/active guest sessions accounted for, recovery retained |

Phases 1–3 can proceed while registrar/provider access is being arranged. No new
paid plan, app-signing change, secret rotation or irreversible provider action is
implicit in a local design preview. Prepare concrete plans before requesting
any separately required credential/signing authorization.

## Domain and authentication cutover

Use the existing site rather than copying it into a second unrelated deployment.
Add and verify new apex/www, obtain HTTPS, and test direct access before changing
the primary domain. Inspect Netlify's actual domain-redirect behavior: old API
and authenticated POST paths must not be trapped by an automatic domain redirect.
If one-site policy cannot retain old API/session traffic, prepare an explicit
compatibility endpoint before switching, rather than force a blanket redirect.
Netlify documents automatic redirects for the apex/www alternative pair and
separate rules for other domain-level redirects; an arbitrary alias is not proof
of an automatic cross-domain redirect. Prefer the existing site with reviewed
aliases and route rules, and test its actual responses before adding infrastructure.
See [Netlify's multiple-domain behavior](https://docs.netlify.com/domains/manage-domains/manage-multiple-domains/).

Update canonical/SEO/OG/sitemap/robots/shared links only when the new host is
ready. Preserve handles and product/query routes in safe public GET redirects.
Keep old app API, attachments and active anonymous chat access during transition.

FE-071 now has a local, focused-tested crawl path from the Market introduction
through About and the public showroom directory to eligible published products.
The directory, page-specific metadata, canonical URLs, minimal structured data,
robots rules and bounded sitemap are implemented locally; this is not yet a
hosted indexing claim. After the reviewed primary-domain deploy, verify that
`robots.txt`, `sitemap.xml`, representative real showroom/product HTML and
their canonical/OG URLs all name `mirtpage.com`, and that an old public GET
redirect preserves its handle and product ID. Then verify the MirtPage domain
property in Google Search Console and submit the sitemap. Record Search
Console's actual crawl/index reports; submission does not guarantee indexing.
Amharic and Afaan Oromo currently share cookie-selected URLs, so do not add
`hreflang` or claim separately indexed language pages until stable locale URLs
and matching translated public content exist.

Fresh mirtpage.com browser cookies, local storage and push permission cannot be
borrowed from suqpage.com. Accounts remain, but sign-in/Tracking OTP and push
enrollment may be needed on the new origin. Explain that only where useful.

DEP-029's local version3 guard now supports exact legacy, dual-old-primary and
dual-new-primary policies, with62 injected-port/credential cases passing in the
complete check. Hosted plans/applies still require their exact protected target/
field/digest approval and independent readback; local tests do not grant writes.
The approved hosted callback-staging operation added the exact new callback
alongside the old, with 241 non-target fields preserved in its readback. The
separately approved primary-origin transition then set `site_url` to
`https://mirtpage.com`. The exact guarded apply passed and a separate read-only
management API check confirmed project health, the new primary, both callback
URLs and Google login still disabled. A full live login/callback test remains.
Preserve existing provider configuration. Google sign-in is currently disabled;
changing consent branding does not authorize enabling it. Do not run config push
or use broad provider writes as a shortcut.

## Email, notifications and records

Inventory existing Auth SMTP and tracking/escalation sender settings without
exposing credentials. Verify a new transactional sending domain and required DNS
records; a verified sending address does not imply an incoming mailbox exists.
Keep the current public Gmail support contact until an incoming alternative is
verified. Do not purchase mail hosting or rotate app passwords just for a label.

Handle outstanding jobs before changing rendered brand/origin. Reusing the same
provider idempotency key with a different body can produce duplicates or rejected
retries. Preserve immutable snapshots and version new work deliberately. Test Auth,
Tracking, staff-overdue alerts and push presentation separately. Mailpit proof is
local only; provider acceptance is not evidence of inbox delivery or reading.

Current local source now has exact27-field MirtPage Auth presentation and a
canonical SiteURL-relative PNG identical to the mobile wordmark. Sixty-five
guard tests preserve provider/credential/origin/OTP/notice fences and reject old
saved branding plans before provider reads. No local Auth restart or hosted mail
apply occurred. Serve the PNG before an exact reviewed hosted template operation.

Tracking/escalation/Telegram source changed only after the reviewed ordinary
supervisor stopped, both app-mail queues proved unfinished/lease-zero twice and
Expo stayed unchanged. One same-command restart restored web HTTP200; unchanged
Expo is HTTP200 at localhost8082. The first verifier's wrong127.0.0.1:8082 error
is retained as harness evidence; it caused no second start. Addresses/origins/
provider keys/Message-ID namespaces/history remain intact. Tracking subjects
use en/am/om. Actual Chrome24 Auth and18 exact plain-mail states pass; the owner
approves their combined visuals/full checks on2026-10-18. No real email, Auth
OTP redemption or OS delivery is claimed. New worker display is MirtPage while
browser wire Suqpage preserves installed old-worker compatibility; native Expo
wire is MirtPage. Keep every channel/tag/token/delivery permission boundary.

For DB records, first inventory platform-owned labels/defaults and exact IDs.
Use an additive allowlisted migration only where necessary, with an isolated
rehearsal and protected-row fingerprints. Do not restore retired billing features
while updating legacy subscription defaults. No tenant/customer-wide text rewrite.

## New Android and Play identity

The local source now makes MirtPage/com.mirtpage.app the default for development,
preview and production, with no future Suqpage build fallback. Canonical client
selection uses only the actual new registration through
MIRTPAGE_GOOGLE_SERVICES_FILE and pins exact downloaded bytes. The expected
public Play signer is independently verified and owner-accepted; actual new
APK/AAB signature and EAS credential-slot proof remain separate. Initial approved
hosted targets are empty, so workers fail before compilation until the candidate
runtime qualifies. iOS workers are denied and no new iOS release is claimed.

The prepared additive assetlinks entry preserves both historical entries. The
new Android claim additionally requires the exact qualified new runtime target,
then contains only mirtpage.com. A first future web deployment can serve the
association before native qualification without a second web deployment. Source
preparation is not hosted or OS verification. Submission names a distinct absent
protected MirtPage credential path rather than silently borrowing the old grant.
See docs/MOBILE-DISTRIBUTION.md for current source gates; its old builds are
explicitly labelled historical.

The confirmed package change creates a separate app, not an update to Suqpage.
Business data remains on the backend; users install MirtPage and sign in again.
Device-local guest capabilities, unsent lists and prior notification tokens do
not automatically transfer. Preserve the old app/signing material during rollout.

Verify the actual Expo project/slug state before changing pins. Reuse its project
UUID/build history if appropriate; do not invent an EAS project or Firebase
config by editing JSON. The current app has no enabled OTA update configuration;
native identity/icon/splash changes require a new binary. Remote versioning,
not the local versionCode field alone, controls the release version.

The approved additive registrations are complete: Firebase project suqpage/
588262779708 now contains com.mirtpage.app, nickname MirtPage, app ID
1:588262779708:android:9a9f3944058b1fcc248c39. Its actual provider-generated client
configuration is protected privately; the old registration remains unchanged.
Play developer5256539403314542898 now has a separate Free MirtPage Draft,
app4975632567188114692, package com.mirtpage.app, with the reviewed en-US/App/Free
form and two approved declarations. New Draft identity/package/status are read
back; those other fields are evidenced by the immediately verified submitted
form, not a claim of separately reopened post-create settings. No build/upload/
publication follows. Complete native/EAS wiring, app-scoped submission access and
reviewed signing enrollment/recovery next.
Measure the new Play-delivered certificate for assetlinks; do not substitute an
upload certificate or assume the old app's certificate applies. Test verified
mirtpage.com App Links, social handoffs, notifications, login and uploads on an
installed Android build. Keep old notification dispatch compatible per token.

Retake screenshots from the actual rebuilt app: business discovery, clear product
collections/details, showroom identity/story/contact and useful owner experience.
Use real current UI with minimal deliberate text; do not repaint old screenshots
or imply features not shipped. Prepare a 512px icon, 1024×500 feature graphic and
portrait 1080×1920 screen sets, then validate each against current Play rules.
Include English/Amharic/Oromo and current privacy/data-safety/content-rating,
account-deletion/reviewer-access declarations. Reuse the approved private tester
address list without publishing it; each tester must join the new test.

The separate new-app drafts live in `docs/play-store/mirtpage/` and
`docs/marketing/mirtpage/`. Google's documented store-listing translation table
includes English and Amharic but does not list Afaan Oromo; keep Oromo active in
the app and promotional drafts rather than inventing a Console locale. Confirm
the current Console options before upload. These drafts and six capture plans
are marked not upload ready; actual new-binary screenshots and publication are
not established by their pure validation. App-record creation is independently
verified above; private feature-graphic exports are separate evidence below.
Existing Suqpage materials remain a
separate frozen old-app contract. See [Play listing translations](https://support.google.com/googleplay/android-developer/answer/9844778).

## Access and approvals

Needed console access: the GoDaddy mirtpage.com zone, existing Netlify site,
Supabase project, Google/Firebase project and the new Play app. Start by opening
GoDaddy's DNS page in regular signed-in Chrome. Enter passwords/2FA only in the
provider. Use scoped delegated access or existing approved sessions; never paste
private keys, passwords or codes into chat. Current domain-stage and additive
app-record receipts independently verify the exact accounts and targets. Reuse
existing authorization for unchanged operations; recheck access and drift before
any later separately scoped mutation.

Every hosted mutation independently verifies its target and exact fields, has
protected recovery evidence, obeys its existing approval guard, and gets readback.
Unexpected remote mutation or an ambiguous timeout stops further writes. A
restore is another reviewed mutation. Git history and historical release evidence
are retained; the final record separates implemented, tested, approved and live.

## Current local evidence

The owner explicitly approved the combined local MirtPage visuals on 2026-10-18
and requires identical logo/icon artwork and color shades across mobile and every
surface. Preserve the approved two-panel M, exact orange `#ff4b00`/white and
wordmark ink; derive exports from that source, allowing only necessary masks,
antialiasing and accessible light/dark wordmark contrast. Audit current references
as well as generated pixels before full gates. This is presentation consistency,
not authorization to rotate provider/signing identities.

The original two-panel M symbol, wordmark and small/app-icon study are retained
in the protected `.local/mirtpage-rebrand-s145/design/` review. Installed Google
Chrome completed 37 focused static checks and captured 27 states at 320, 390 and
1440 pixels, with no external or API traffic. This establishes the design
artifact's layout only: it is not application workflow, native-device, release
or owner visual-approval evidence. Amharic and Oromo study text is an authored
draft, not independent native-speaker certification.

The shared-brand/public-copy and nonpersisted backend-display local tranches are
implemented with focused evidence. The private consolidated review is
`.local/mirtpage-rebrand-s145/release-review.html`: actual public, owner, admin,
transport and support roles cover desktop/phone web and affected Expo views.
Protected catalog/draft/location fingerprints are unchanged; headed and headless
slices, expected Tracking 401s and raw failures remain distinct. One native
cancelled request and the original headed fresh-phone Apply stall still lack
complete provenance. A later fresh headed Apply succeeds with real API readback;
its parent subsequently fails a duplicate-image screenshot helper. Neither
success explains the earlier failure. Those raw focused reviews are not rewritten
as clean receipts.

Ordinary previews are restored with saved settings unchanged. Existing runtime
origins, native package configuration, delivery identities and live data are
unchanged by the local gates. The owner approved both the combined visuals and
refined27-state en/am/om copy review. The76-group complete check and full web
release pass; the final browser suite passes20/20, no skips/retries, exit0 on
snapshot9e8e8e04774ca23af878169c64e6704e60cca35a17df3e9c50d560abdb953f00.
Its application/dependency inputs match the passing release snapshot. Exact
owned test resources are removed, normal web/Expo remain HTTP200 and frozen
source hashes are verified. The Chromium suite and actual Google Chrome reviews
are distinct evidence. Earlier failures/interrupted attempts remain unchanged.
Thirteen final raw stream-closure errors remain unclassified: the synchronous
suite blocks asynchronous app-log forwarding, so post-summary output cannot
prove the closures occurred at shutdown or during navigation. No errors were
filtered or asserted harmless.

Protected evidence is in `.local/mirtpage-rebrand-s145/gates/` (check-completion,
release-completion, acceptance-completion and durable-acceptance-20261018),
`provider-domain-apply/verified.json` and `provider-registration/verified.json`.
Local test builds are not deployable production artifacts. Final native wiring/
binary/screenshots, hosted data/defaults/canonical/runtime/mail and store rollout
remain incomplete. Private charcoal feature graphics and en/am/om PNG/MP4 teasers
are validated; new Play/promo drafts pass seven focused checks. No uploaded
listing, campaign or completed S145 migration is claimed.

## Primary references

- [Android application identity](https://developer.android.com/build/configure-app-module)
- [Google Play personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Play preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Firebase Android registration](https://firebase.google.com/docs/android/setup)
- [Firebase project identities](https://firebase.google.com/docs/projects/learn-more)
- [Expo push-token lifecycle](https://docs.expo.dev/push-notifications/faq/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Netlify domain aliases](https://docs.netlify.com/manage/domains/configure-domains/add-a-domain-alias/)
- [Supabase exact redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [GoDaddy nameserver management](https://www.godaddy.com/help/change-my-domain-nameservers-664)
