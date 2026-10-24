---
id: FE-070
title: AfricMade identity and supplier-focused digital showroom experience
status: in_progress
related: [BE-059, DEP-029, DEP-049, DEP-051, FE-041, FE-049, FE-071, ADR-0029]
owners: [product, frontend, localization]
last_updated: 2026-10-24
change_level: L2
---

# FE-070 — AfricMade identity and digital showrooms

## S172 — AfricMade presentation and business sourcing (ready)

The public platform becomes **AfricMade** while its current color palette,
typography, marketplace, account roles and contact workflows remain. The brand
celebrates products grown and made in Africa and helps farms, home businesses,
workshops, manufacturers and other suppliers meet both individual and business
buyers. Retailers and
other sellers remain welcome; this positioning introduces no origin restriction,
verification gate or new moderation rule. Begin with the actual East African
catalog without claiming continent-wide listings, delivery or official backing.
Individual and business buyers use the same discovery and enquiry flow. The
Market and About copy must make a one-item enquiry feel as welcome as a larger
order; neither audience gets a separate form or
eligibility rule. Parcel delivery remains a discussion with a selected independent
logistics provider when offered, not a promise by AfricMade or SharedTrucks.
Preserve every existing demo business, its example label and its factual product
data. Where supported by existing data, show packaging or quantity context useful
to sourcing buyers without inventing supplier terms or changing real listings.

GIVEN a visitor opens Market in English WHEN the page settles THEN the heading
is “Discover what Africa makes.” and the supporting text is exactly “Explore
product showrooms from farms, factories and artisans without sifting through
their social media posts.”
Amharic and Afaan Oromo express the same meaning naturally. Market keeps this
copy compact enough to leave room for discovery; About explains the buyer and
supplier journeys in more detail. Public platform labels use “supplier”, not
“producer”. The Market description does not require a buyer to decide whether
their order is small or bulk before browsing; product facts and the inquiry
actions make both paths available.

GIVEN a visitor opens the native Market screen WHEN it settles THEN the same
localized heading and supporting text appear as a compact introduction above
the search modes, without covering the map, product list or main actions. The
introduction remains legible on a narrow phone while leaving useful space for
discovery.

GIVEN a buyer opens a product or prepares an enquiry WHEN they select an existing
channel THEN AfricMade Inbox, configured WhatsApp/Telegram and copy-message keep
their working behavior and familiar action labels. The prepared message lists
the selected product, its options, any quantity the visitor supplied, and its
product link. It asks only about availability; it does not add a pricing or lead-
time questionnaire. Buyers can add detail in the Inbox editor or destination
messaging app before sending. No extra field, stock promise, checkout, delivery
or confirmed order is introduced.

GIVEN a visitor or owner uses web or native Market, showroom, Featured, About,
account, inbox, transport or shipment records WHEN the platform authors a name,
email, push, share or error message THEN it says AfricMade where a brand is needed
and uses plain functional labels elsewhere. No old public MirtPage wordmark/icon
remains. Merchant-authored content and the separate SharedTrucks identity are
preserved.

GIVEN a user selects an active language WHEN the same task renders on web and
native THEN Amharic and Afaan Oromo convey the intent naturally, fit readable
small screens and preserve names, URLs and user-entered content verbatim.
Inactive language catalogs remain compatibility data, not selectable languages.

The logo/icon is a distinct owner review gate. Agent-led desktop/phone web and
Expo task review qualifies the rest of the UI under the current workflow.
The owner replaced the prior artwork with paired light- and dark-background PNG
wordmarks on 2026-10-24. Both show an orange field with a smiling maker holding
a cube, an afro pick, and AfricMade lettering. These replace the previous
profile-only mark everywhere the platform identity appears.
Use those exact pixels as the canonical source for web/native wordmarks and
deterministic icon crops; do not regenerate or reinterpret the mark. Derive
favicon, PWA, Android adaptive icon, notification badge, email and launch assets
at their required sizes, checking legibility on both backgrounds.
Previously published generic and legacy platform icon URLs can remain in saved
browser shortcuts, PWA installations and email. They must serve derivatives of
the same approved AfricMade artwork; no previous platform mark or wordmark may
remain at those URLs. Keep merchant-owned logos and historical protocol IDs
separate from platform presentation.

GIVEN a visitor opens an existing bookmark or installed PWA that requests a
generic or former platform icon URL WHEN the asset loads THEN it shows the
approved AfricMade artwork at the requested size. GIVEN the current web page or
native app loads WHEN it requests its icon, splash, notification or wordmark
THEN those configured assets are also generated from that same owner source.
The favicon, installed app icon and PWA icons use the same high-contrast
charcoal field and approved orange maker symbol so the mark remains recognizable at
tab size. The web header and native header show a legible full wordmark without
crowding controls at narrow phone widths. The native splash shows that same
approved full wordmark at a readable size on the charcoal field. Keep the
approved artwork, orange shade, typography and existing palette unchanged.

GIVEN a visitor uses desktop web, 320–390px phone web, or the native app WHEN
the page or app opens THEN the full wordmark is readable without clipping or
overlap, and the browser tab, app icon and splash remain recognizably related.
Controlling release boundaries are BE-059 and DEP-051; this section does not
rename the temporary domain or an installed mobile package.

## S167 — keep unpublished store drafts aligned with current contact and shipment language

The MirtPage Play listing and campaign captions are drafts, not published copy.
Before a new Android artifact is qualified, describe the available business
Inbox alongside configured messaging channels, name the independent selected
logistics service provider rather than MirtPage's team, and call the separate
email-verified organizer **Shipment records**. A record shows entered route
stages and optional external provider links; do not promise live movement,
automatic scans or delivery dates. English, Amharic and Afaan Oromo drafts use
their current interface terms and natural local grammar. Preserve the draft
and native-speaker-review status; do not claim a Play publication.

GIVEN a visitor reads a draft listing or transport caption in any active
language WHEN they compare it with the app THEN the contact choices, provider
role and Shipment records name match the current web/native journey. GIVEN no
external tracking link is supplied WHEN the record is described THEN the copy
does not imply real-time tracking. Focused draft-schema/copy tests enforce the
terms and the absence of retired promises before release checks.

## S154 — customer-first showroom story and examples (local implementation)

The English Market copy under review leads with “Find local makers and suppliers
for your next order.” Its supporting line names digital showrooms from farms,
workshops, factories and shops, explains that visitors can browse product options
and listed availability, and invites questions about larger orders or made-to-order
items without searching social posts. This prioritizes buyers sourcing from local
producers while preserving a clear path for ordinary shoppers and retailers or
importers. About names workshops, farms, factories, local shops and importers and
explains the same journey from both sides: customers browse before contacting;
businesses that grow, make, source, import or sell goods can bring their story and
products into one shareable digital showroom. Verify demo messaging links against
the already-approved shared contact destination under FE-066/DEP-045; keep the
contact visible only when exact-match approval succeeds and never send a message
during review.
The business handles the final sale; do
not imply MirtPage checkout, verified inventory, delivery promises or online-only
eligibility. Keep a concise headline, readable type, existing plain background
and audience navigation. Sign-in is role-neutral across web/native:
‘Sign in to MirtPage.’ with email sign-in/account-creation instructions replaces
the earlier business-showroom login heading. Existing Auth and business-onboarding
behavior remains unchanged; future transport-provider accounts are not implied.
Active languages explain this idea naturally; preserve merchant identity/content
and inactive locale availability. Shared Market/About/SEO sources stay consistent.

The candidate English wording and authored active-language equivalents remain
pending actual desktop/phone/Expo visual review; earlier logo/layout approvals do
not approve revised copy. Preserve explicit digital-showroom meaning and the
social-post discovery context in each active language without literal word-order
translation or a long sector list in the hero.

Fictional demo businesses are intentional product examples as well as QA
fixtures. Across the Market, Featured and showroom pages, give each one a
believable, business-specific story and catalog representing shops, makers,
workshops, farms, manufacturers or suppliers. Label every fictional showroom
and product visibly as an example, including handles that do not contain the
word “demo”. A no-results public directory may direct visitors to example
showrooms in the Market, but the directory itself and canonical sitemap continue
to include eligible real businesses only. Do not imply that examples are real
merchants, that illustrative media is documentary, or that listed availability
and capacity are verified live promises. Remove generic fixture text/options
that make a sample storefront read like a database record. Headline, About,
examples, product details, contact choices and transport entry should explain
the same customer journey in English, Amharic and Afaan Oromo.

GIVEN a visitor lands on Market in an active language WHEN the introduction
renders THEN its headline identifies local makers and suppliers as places to
find products for an order; its supporting line names farms, workshops, factories
and shops, explains browsing products and listed availability, and invites
questions about larger orders or made-to-order items without searching social
posts. It remains welcoming to shoppers buying smaller quantities and does not
imply that MirtPage negotiates, checks inventory, provides checkout or promises
delivery.

GIVEN an owner or customer opens About in an active language WHEN they select
their audience THEN the customer view explains the browse-then-ask journey and
the business view includes shops, workshops, growers, makers, importers and
suppliers without promising checkout or verified stock.

GIVEN a fictional example appears in Market, Featured, or a showroom WHEN its
name or products render THEN it is identified as an example and its distinct
story/catalog avoids generic option or database-test wording.

GIVEN the public business directory has no eligible real showrooms WHEN its
empty state renders THEN it says no public business showrooms are listed and
offers a clearly labelled link to example showrooms in Market; examples remain
excluded from directory results, canonical metadata and sitemap entries.

FE-075/BE-062 supersede the external-only inquiry positioning for the coordinated
local implementation: visitors submit their name/phone, question and selected
products to a business Inbox; the owner follows up to discuss the sale. Configured
WhatsApp, Telegram and MirtPage Inbox remain equally prominent adjacent choices.
This is asynchronous inquiry, not live business chat,
onsite replies, checkout or verified stock. Source copy may precede its coordinated
local review, but cannot be claimed as deployed until its workflow gates pass.

Focused narrative/localization and empty-state checks plus actual web/native
review precede the batch visual/full-gate boundary. Existing approved artwork
remains intact; root owns the combined master/checklist/traceability update.

## S146 active-language account-copy correction (local focused evidence)

The public account-deletion instructions on web and Expo and the Expo staff
sign-in denial share two interface messages. Their current Amharic and Afaan
Oromo translations must name MirtPage, matching the English source and active
brand, without changing the sign-in, deletion or staff-access workflows.
Historical translation rows and compatibility identifiers are outside this
correction.

GIVEN an Amharic or Afaan Oromo visitor opens account deletion on web or Expo
WHEN the instructions render THEN the sign-in email guidance is localized and
names MirtPage, with no visible Suqpage name.

GIVEN a staff identity is denied access to the Expo owner app WHEN the account
notice renders THEN the localized website sign-in instruction names MirtPage,
with no visible Suqpage name. English retains its current wording.

Regenerate catalogs from `locales/interface.tsv`, assert both messages survive
the browser/client catalog split, and exercise the affected web/Expo views in
actual Chrome at phone size plus the web desktop deletion page. This is an L1
copy correction with no persisted data, Auth, API or provider changes; reverting
the two source translations and regenerating catalogs restores prior copy.

The two source translations and generated Amharic/Afaan Oromo client catalogs
now use MirtPage. Focused localization tests pass 22 frontend and four backend
cases, including both exact client-visible keys; spec validation passes 217.
Actual installed Chrome verifies the deletion instructions on web desktop/phone
and Expo phone in both active languages with zero browser errors (five states,
`.local/account-brand-s146/receipt.json`). An existing local admin's Expo
sign-in was denied by the real session API with `403 staff_web_only`, and the
Amharic MirtPage notice rendered. Its only capture included the open language
sheet; local Auth then rate-limited OTP for a further attempt and a second
existing identity. Settled Amharic/Afaan Oromo staff-notice captures and visual
approval remain open before full release checks. No hosted or native release is
claimed.

## S146 public legal-copy consistency (local copy correction)

The public Privacy and Terms text must describe the current FE-066/BE-055
external WhatsApp/Telegram/SMS product handoff, retained private inquiry history,
FE-072/BE-060 administrator-controlled staff business access, and separate
transport/support chats. It must not promise an active MirtPage business inbox,
owner-granted staff access or last-mile delivery. The privacy text must keep the
existing account, third-party map/video, notifications, deletion and tracking
disclosures; no data flow or provider setting changes with this copy correction.

GIVEN a visitor opens Privacy or Terms on web or through the Expo About links
WHEN they read English, Amharic or Afaan Oromo THEN the supported contact and
staff rules are stated accurately and in their selected language, with readable
desktop and phone layouts. Retained Somali/Tigrinya fallback remains English.
Test the source assertions, generated locale catalogs and actual Chrome
desktop/phone legal routes; use FE-049's translation checks before full gates.

## S146 native public-origin correction (local evidence)

The native About legal links and social-video referrer must use the same
validated public/API origin as the native catalog. The default for an absent
development origin is `https://mirtpage.com`; an explicitly configured local or
staging origin takes precedence and malformed input must fail closed. This does
not change historical session keys, video bridge events, native package IDs or
tenant-owned links.

1. GIVEN a MirtPage app without an origin override WHEN About opens Privacy or
   Terms THEN the respective path opens under `https://mirtpage.com`.
2. GIVEN an explicitly configured safe local or staging API origin WHEN the
   same links or a native social video open THEN they use that exact origin for
   the legal destination or WebView base/referrer; the provider embed remains
   subject to its existing exact-host navigation policy.
3. GIVEN a malformed or credential-bearing origin WHEN configuration resolves
   THEN the app rejects it rather than opening a guessed or attacker URL.
4. GIVEN a native YouTube frame with no Expo application ID WHEN it builds its
   synthetic WebView origin THEN use `https://com.mirtpage.app`; configured
   Android package IDs and Expo Go keep their own existing origin, including a
   historical package on an already-installed app. Only the missing-ID fallback
   changes; accepted provider navigation and bridge event tokens stay intact.

Use focused pure-origin, actual About-button and native WebView-adapter tests,
mobile strict types and an Expo preview legal-link/video task before release.
Exercise the YouTube frame's actual adapter with missing, configured and Expo Go
IDs, including its provider/hostile navigation rule.
The web social frame continues to use the browser's own origin.

Current local evidence: the actual native About component and WebView adapter
pass eight mobile-link cases across default, localhost and staging origins;
four product-video cases retain exact provider navigation and hostile-link
denials. Mobile strict types, mobile build safety and217 spec links pass.
The compiled native YouTube frame passes four focused cases across missing and
configured Android IDs, the historical installed package and Expo Go; the same
adapter checks an absent iOS ID, provider-only navigation and disabled cookie
sharing. The video script passes via `node --import tsx`; the npm `tsx` launcher
could not open its sandbox IPC pipe (`EPERM`) before test execution.
Installed Chrome on Expo8082 follows Market → About → Privacy/Terms → About
and both audience tabs with4 checks, zero local failed requests and no external
map-tile request (`.local/s146-mobile-origin-review/receipt.json`). The native
WebView is not the Expo web frame, so real Android/provider playback and an
installable artifact remain separate release evidence. No visual layout changes,
remote origin updates or deployment are claimed.

## Ready: illustrative demo booth label parity

The 58 generated demo booth SVGs still show the previous platform name on the
illustrated facade. Replace that platform label with `MirtPage` in the
checked-in illustrations and their generation source, with a card-readable
type size that does not collide with the neighboring cue. Keep each fictional
business name, illustrative product cue, SVG dimensions, facade layout and
business-specific palette intact. These demo illustrations are not the
canonical platform logo and must not imply that a real merchant approved a new
brand asset. Do not relabel historical artwork outside this generated demo set.

GIVEN a demo booth SVG is viewed directly or generated again WHEN a visitor
inspects its facade THEN the platform label reads `MirtPage` once, no visible
`SUQPAGE` remains, and the business identity and artwork still render legibly.

Verify all 58 assets as SVG/XML, check exact label parity with the generator,
and inspect representative light/dark business palettes in installed Chrome at
desktop and phone widths. Record captures for visual review before the next
full release gate. Reverting the SVG and generator label changes restores the
prior demo artwork without changing customer data or publication state.

Local source/evidence: all 58 labels and the generator now use `MirtPage`; the
sign type is 40px so it remains readable at card scale. The focused FE-070
narrative test, all-file XML parse, spec validation and exact old/new asset
comparison pass. Installed Chrome 155 rendered three different business palettes
at 1440/390 with six loaded images and no console or request errors; captures
and receipts are in `.local/booth-brand-s146/`. This is illustrative demo
artwork, not new logo geometry or current Play Store imagery. Visual approval
and any subsequent full release gate remain separate.

## S146 shared public canvas (ready)

The shared public shell currently puts decorative venue photography behind
information and task pages, including Shipment records. Use a solid MirtPage
theme canvas for that shell so headings and content retain clear contrast on
desktop and phone. Preserve page-owned About hero media, Market content, real
business/product imagery and tenant showroom identity. Native task pages keep
their existing plain theme background. No copy, brand asset, route, permission,
data, provider or release configuration changes are part of this correction.

1. GIVEN Tracking, Featured, About or legal/information content WHEN viewed in
   the public web shell THEN its shared background is uniform, not an image,
   and text or controls never rely on a photograph for contrast.
2. GIVEN Market, a business showroom or product media WHEN the same shell is
   updated THEN map, page-owned hero and tenant product imagery still render.

FE-069 specifies the Tracking-specific outcome. Test the shared-shell style
contract and actual Chrome1440/390 pages; inspect Expo8082 Tracking for parity.
Capture screenshots and obtain new visual approval before full release gates.
Reverting the isolated CSS restores the prior appearance without data rollback.
Local source and installed-Chrome background checks pass across five public
routes at1440/390. The final localhost3102 retry hydrated and exercised the
Market → chat → Tracking email-entry path on desktop and phone; Expo8082
retains its plain theme treatment. Settled About/Featured interaction remains
open after the bounded browser script stopped on an overly specific phone color
assertion. See FE-069 and `.local/shipment-tracking-canvas-s146/actual/` for
screenshots and receipts; no publication or visual approval is claimed.

## S150 — opaque Auth email wordmark (Ready; local source only)

Dark email surfaces can hide the approved ink-colored “Mirt” lettering when
its PNG canvas is transparent. Preserve the exact canonical geometry, display
size (220×48), orange/ink/white palette and all mobile/web artwork. Publish a
new versioned email-only PNG with a fully opaque white canvas; keep the previous
PNG available. Every Auth template references the new asset and explicitly sets
a white image background. Do not replace the canonical mark or invert its colors.

GIVEN any light or dark email surface WHEN its logo image renders THEN every
PNG pixel is opaque and the original foreground remains visible on white.
GIVEN canonical opaque artwork pixels WHEN comparing the email derivative THEN
their positions and exact RGB values match; formerly transparent pixels become
white, with ordinary antialias alpha composited on white at unchanged dimensions.
GIVEN existing platform/native assets WHEN generating the new email derivative
THEN all previous asset bytes, including the old email PNG, remain unchanged.
GIVEN a returning Gmail image proxy WHEN templates render THEN the versioned
asset URL differs from the previous transparent PNG URL rather than relying on
cache invalidation.

Meaningful regression coverage belongs in scripts/test-platform-brand.ts and
scripts/test-email-branding.ts; deterministic generation remains checked by
scripts/generate-mirtpage-icons.mjs. Exercise actual Chrome static email previews
on desktop/phone in light/dark surfaces, preserving code/link placeholders and
without sending or redeeming an OTP. Capture visuals and wait for owner visual
approval before full/release gates. This source correction does not publish the
asset or apply hosted Auth content; DEP-029 separately controls that later step.

Local S150 implementation and focused checks now pass: three artwork/pixel
cases, thirteen template semantics, four exact Auth-guard cases, generator
reproducibility and218-spec validation. Four isolated headed actual Chrome155
phone/desktop light/dark static states pass with no overflow, browser errors or
external requests. The dark surface is a CSS simulation, not a new Gmail send.
Review evidence is retained under the private S150 email-contrast-review
directory. The owner explicitly approves the logo fix and full local checks on
2026-10-20; source-bound full gates and all hosted rollout remain pending.

## Ready: canonical Auth email artwork and copy

The independently reviewed BE-059 push split is Ready: new browser workers show
literal MirtPage for either admitted old/new wire title, and Expo uses MirtPage.
The browser server wire token remains Suqpage for old installed compatibility.
Old installations may retain their prior display until a normal worker update;
this is not public co-branding or proof that every installation has upgraded.

The independent Auth source tranche in BE-059/DEP-029/DEP-049 is Ready. Preserve
the twelve template layouts, English account-entry meaning, code/link semantics
and approved palette. Replace the old font-based logo with the approved outlined
MirtPage wordmark as one deterministic public PNG, displayed at220×48 with
MirtPage alt text. S150 gives the versioned email-only derivative an opaque
white canvas; canonical foreground geometry/colors and mobile bytes remain exact. The image URL
uses SiteURL and a fixed public asset path; no third-party tracking image,
invented logo, arbitrary font substitute or customer snapshot is introduced.
Existing derivative bytes remain exact. FE-073/BE-061 separately change the
email-change template from a confirmation link to old/new mailbox codes; this
visual branding tranche does not authorize that provider rollout. Static
desktop/phone previews and later
actual Chrome/owner review distinguish local implementation from visual approval
and hosted mail. No locale-aware Auth mail is claimed by this brand-only tranche.

The original transparent email PNG remains identical to the existing mobile
wordmark bytes and is retained. S150 changes only the versioned email derivative
canvas to opaque white; all prior derivatives are preserved. Actual installed
Google Chrome covers24 Auth-template states and18 exact plain-text app-mail
states across phone/desktop. Tracking code/plan and staff alerts cover en/am/om;
their subjects and From display are MirtPage. The combined private review is
auth-mail-source/combined-review.html. The owner explicitly approves these
combined visuals and full checks on2026-10-18. Local Auth reload/real OTP and
hosted delivery remain separate, with no provider mail sent here.

## Ready: default native application identity

DEP-049's local native tranche makes MirtPage the normal app configuration name
and com.mirtpage.app its Android package. Reuse the approved M geometry and exact
palette; derive the Android small notification glyph as white with transparency
and canonical orange tint. No new layout, dependency or customized splash is
claimed. Existing visual approval remains applicable to unchanged artwork/UI;
SDK/config/type/asset tests and later actual binary proof establish their own
platform-specific evidence.

Local native evidence: three canonical asset cases pass, including exact96px
white-alpha notification pixels and deterministic shared M derivatives. The
existing launcher/wordmark outputs remain byte-identical. Actual installed Expo
configuration resolves proper-case MirtPage across development/preview/production;
native and scoped script types pass. No new UI layout or native OS splash/device
proof is inferred, and combined full gates remain separate.

## Problem and outcome

The owner replaces the Suqpage brand with MirtPage, retaining the current orange,
charcoal, cream and white palette. The platform gives businesses of every size
an organized digital showroom: their brand and story, products and optional
collections, with direct customer contact instead of searching social posts.
Retailers, workshops, factories, farms and raw-material suppliers are included;
the proposition must not imply that only small or social-only sellers qualify.

## Scope and staged readiness

The independent local presentation phase is Ready: create an original code-native
symbol/wordmark, integrate the shared web/native brand and public narrative, and
preview desktop/phone/app-icon contexts. The owner chooses a new Android package;
its Firebase registration and separate Play Draft are now verified under DEP-049,
while native wiring/build/signing and release remain later gates. This local
phase does not change runtime API/canonical origins, provider IDs, traffic, signing,
email delivery semantics or production data. Full rollout follows DEP-049. Local
implementation is not an approved shipped brand.

The next independent local presentation tranche also covers nonpersisted backend
validation/consent messages, category labels and read-only renderer fallbacks.
Their error codes, status, permissions and wire schemas remain unchanged. Add
localized MirtPage wording without altering stored customer snapshots, support
requester-label INSERTs/defaults, migration history, senders or delivery jobs.
Prepare this change while the current application review is frozen; apply only
after the owned review browser closes, then verify focused error/localization and
identity contracts against a new source baseline.

Cover public/owner/staff/admin shells, authentication, legal/About/SEO/social
metadata, shared email and notification presentation, PWA/native icons/splash,
Play listing/screenshots and promotional materials. Use the existing design
system and task-based workspaces; this is not permission to replace tenant logos,
colors, names, stories or product photographs with platform branding.

Master sections affected: 1/2/3/5/10/12/13/15/16/17/18/19/22/23/24/25 and current
brand-specific appendices. Until each phase is verified, label it planned/local;
the current hosted brand and previously released artifacts remain historical facts.

## Contracts and invariants

- Latest owner copy refinement (2026-10-18): lead with a professional digital
  showroom for businesses of every size, including online sellers, retailers,
  workshops, growers/farms and manufacturers. Follow with customer-facing copy
  explaining the range, story, product choices and business-listed availability,
  then direct contact without searching old social posts. This is a meaning-first
  refinement of the shared Market/About/SEO/mobile and new-app draft materials,
  not a claim of verified inventory or a restriction to social-only sellers.
  Keep the approved design and canonical artwork. This independent copy tranche
  is Ready; it requires focused active-language/render checks and actual Chrome
  before its revised wording/layout is treated as visually reviewed. The earlier
  explicit approval remains valid for unchanged artwork and layouts.
- The final public name is exactly MirtPage everywhere. Brand words remain
  untranslated. Old names are retained only where historical evidence, required
  technical identities or a safe bounded cutover need them, not as public co-branding.
- The owner visually approved the combined local logo, wording and layouts on
  2026-10-18, requiring consistent artwork and color shades on every platform.
  All current platform marks, app/PWA/notification icons and store exports derive
  from the approved two-panel M geometry. Logo orange is exactly `#ff4b00`, white
  exactly `#ffffff`, and wordmark ink `#202428`; antialiasing, accessible dark/light
  wordmark contrast and operating-system masks do not introduce alternative marks
  or palettes. Buttons retain their deliberately accessible action color.
  Local artwork references and native icon/splash/notification presentation fields
  may be corrected for this parity without changing package/provider/signing,
  credentials or runtime origins. Verify both geometry and color, not filenames.
- Use digital showroom in English, not internet showroom/page as the proposition.
  Explain the idea naturally in active Amharic and Afaan Oromo. Inactive locales
  remain inactive; catalog generation must not accidentally enable them.
- Copy connects brand/story, product range/collections and direct questions. It
  may describe listed availability and made-to-order products; it cannot promise
  verified stock, production capacity, delivery dates, checkout or carrier scans.
- Transport/shipping help and owner support remain live-chat services. The
  showroom business model has no visitor subscription or paid browsing. Margin
  strategy and internal brokerage economics are not public interface copy.
- Preserve compact Market controls, audience-based About, per-business inquiry
  selection/social handoff, independent Tracking, role/tenant boundaries and
  current owner/staff task navigation.
- Introduce a small pure presentation identity contract where useful; runtime
  origins still come from validated environment configuration. Do not replace
  cookie/storage/header/provider identities as a side effect of visible copy.
- Reconcile existing MirtPage-to-Suqpage asset aliases explicitly. New assets
  cannot be shadowed by those aliases or produce redirect cycles.

## Scenarios

GIVEN a visitor on web, phone web or the native preview WHEN they open Market,
About or a showroom THEN the platform is MirtPage and explains business digital
showrooms clearly AND merchant identity and existing discovery actions remain.

GIVEN an owner, staff member or admin WHEN they complete their authorized tasks
THEN shells, notices, emails and notification presentation use the new identity
AND authorization, saved data, chat/Tracking behavior and return context persist.

GIVEN long Amharic/Oromo or enlarged text WHEN the same tasks render THEN names,
tabs, buttons and copy fit accessibly without shrinking or clipping necessary text.

GIVEN a retained historical/technical Suqpage identifier WHEN the brand audit runs
THEN it is classified with a compatibility/history reason rather than blindly
rewritten or misreported as newly visible MirtPage branding.

## Test plan

Focused identity/assets/alias tests, narrative and localization/catalog checks,
PWA/favicon/email-branding/mobile-link tests and affected TypeScript checks.
Registered focused regressions include `scripts/test-platform-brand.ts`,
`scripts/test-backend-brand-presentation.ts` and
`scripts/test-mirtpage-draft-materials.cjs`. Existing localization tests execute
Market/About metadata generation for all active languages, including an explicit
Open Graph site name on child routes that replace the root metadata object.
Actual Google Chrome visitor/owner/staff/admin tasks on desktop/phone web and
Expo8082, with real local API/database outcomes and synthetic automated tiles.
Include320px/enlarged text, en/am/om, fresh and existing sessions, media upload,
social product handoff, support/transport and Tracking. Capture current states
before explicit visual approval and full check/release/acceptance gates. Retake
store screenshots from the actual approved MirtPage app; concept art is not proof.

## Current evidence and limits

Shared identity/assets/copy and nonpersisted backend display messages are local
candidates with focused evidence. The public actual review completed 36
functional checks/36 states and 18 real search readbacks; owner review completed
13 checks/30 states with ordinary local email-code sign-in and unchanged catalog,
draft/publication and location fingerprints. As-run source hashes are retained.
The later backend tranche appended ten translation rows without changing any
previous TSV bytes or the captured hero/About text; it has four focused display
regressions and current identity/localization/catalog/type evidence.

These are not clean full/release receipts: public raw cancellation evidence
includes one unproven native request; owner raw console failures include two
expected unauthenticated Tracking 401 notices, with the related cancelled
startup requests individually explained in a sidecar. Preserve these raw results
and the separately classified test-readiness failures. Staff/admin role slices
record six completed checks/19 states; a documented streaming redirect denies
scoped staff admin access without exposing its heading. A later fresh-phone headed Apply completes the normal trusted click/GET and
correct API result; its raw parent subsequently fails a duplicate-brand-image
screenshot locator, retained as harness failure. The original stall cause is
unproven; no product repair is claimed. Canonical artwork parity now has four
asset/renderer tests, ten worker regressions and nine actual Chrome states.
The owner’s earlier artwork/layout approval remains valid.

Latest copy refinement: six shared strings changed; no unrelated locale values
changed. Focused narrative/catalog,20 localization/metadata cases, seven private
material checks and scoped types pass. Actual headed Chrome passes27 checks and
27 states across en/am/om desktop/phone web and Expo: Market copy/metadata, About
audiences/keyboard controls, customer return and business sign-in entry. Zero
application/console/request/lifecycle errors; synthetic automated tiles only.
AM/OM are meaning-first agent copy, not independent human certification. The owner explicitly approves this
revised copy and full checks on2026-10-18. Current-source application and release
gates now pass; all20 browser acceptance cases now pass as recorded below. Unchanged artwork
approval is preserved.

The current full workflow-UI group passes362/362 with no skipped/cancelled cases.
The earlier group passed361/362 after stale fixture repairs; its
one Chrome-launch timeout occurred before map assertions, and the unchanged
focused case passes on one controlled retry. Raw parents remain failed. The
full check now completes all76 command groups through source-bound first-
incomplete resumes; repairs change tests/planning documentation only. The complete
web release gate passes, including both clean dependency audits, production build,
artifact privacy, provider-backed HTTP/security, migration and tenant/data checks.
DEP-045's exact public-gazetteer admission has29 regressions and actual-build
evidence:93 traces/110 admitted references, absent from54 browser chunks. A
classified disposable Storage startup failure passed on one unchanged-source
release retry. Earlier browser acceptance includes a separate startup-only
failure, a17/20 run and a16/20 corrected run. Proven stale
Cancel/Preview selectors and ordinary-scroll assumptions have test-only repairs.
Actual installed Chrome proves full Send clearance/hit tests after normal PageDown
with all71 public-table fingerprints unchanged after exact cleanup. The corrected
complete16/20 run includes transport Join/reply/privacy/history. Its request/
locator contracts are repaired with strict assertions retained. A controlled
signup replay passes without proving the original Loading failure's cause. A
later interrupted run records9 passes/1 strict Sign out locator failure and10
unobserved cases; it is not a terminal suite result. The exact Sign out helper
now targets the Account main form while preserving logout/private-route checks.

The final isolated full browser gate passes20/20, zero skips/retries, exit0 on
snapshot9e8e8e04774ca23af878169c64e6704e60cca35a17df3e9c50d560abdb953f00.
Application/dependency inputs match release14956738f3d2382334d7855721bd1caf39a7eac1890838949c8c1a672d9d864e;
differences are the reviewed test repairs and status documentation. Exact owned
test containers/server/bucket/temp resources are cleaned, normal web/Expo remain
HTTP200 and all frozen inputs are verified unchanged. Evidence: private
gates/acceptance-completion.json and durable-acceptance-20261018/completion.json.
This suite uses Playwright Chromium; the actual Google Chrome reviews above
remain separate evidence. All failed/interrupted attempts and13 final raw
stream-closed errors are retained. Synchronous Playwright execution blocks the
runner's asynchronous app-log forwarding, so post-summary output does not prove
the closures happened at shutdown. Request/timing attribution remains unproven.
The owner selects the charcoal
feature-graphic direction: canonical assets, minimal localized copy and validated
1024×500 RGB exports. This is selected private artwork, not proof of an upload-ready
listing or a new-app screenshot. Provider configuration, new package/binary/
store publication, mail/sender changes and bounded defaults remain separate.

## Rollout and rollback

Local design → integrated local brand/copy → visual approval → full gates →
DEP-049 controlled hosted/domain/app rollout. Retain previous assets/artifact
for rollback and classified legacy routes. No deployment, new native build, paid service
or provider configuration change follows from this Ready local phase alone.
