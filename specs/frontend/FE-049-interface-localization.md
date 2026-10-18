---
id: FE-049
title: Five-language interface
status: in_progress
related: [FE-069, FE-066, FE-019, FE-055, FE-053, FE-052, FE-051, FE_BASE, BE_BASE, DEP_BASE, ADR-0022, FE-041, FE-062, DEP-044, FE-065, FE-067, FE-063, FE-068]
owners: [product, frontend]
last_updated: 2026-10-15
change_level: L2
---

# FE-049 — Five-language interface

## S132 — three active languages and clearer meaning (ready; supersedes selection)

Newest owner direction enables only English, Amharic and Afaan Oromo for now.
Somali/Tigrinya catalogs and stored language identifiers remain compatibility
data, not selectable languages; Afar was never enabled. No catalog or persisted
customer value is deleted. FE-052 controls the revised inclusive showroom story;
FE-065 controls the compact visible web introduction. Master §§3/10/18/19/22
are affected. This is L2 preference compatibility plus L1 copy/layout work.

1. GIVEN web/native language choices THEN offer only en/am/om. A restored cookie
   or device preference naming inactive so/ti, Afar or unknown input falls back
   to English. Retain the known Locale union and all generated compatibility
   catalogs; explicit enabledLocales separates live availability from retention.
   Public request rendering, native restoration/change and alert presentation
   normalize consistently without rewriting saved records or credentials.
2. GIVEN primary public/owner UI and About/Market copy THEN rewrite Amharic/Oromo
   to explain the task/idea in ordinary local wording. Explain a digital showroom
   as an organized internet page for a business's products; do not invent a
   borrowed technical noun or restrict the audience to online resellers. Review
   discovery/filter/collection, product/stock/custom order, external inquiry,
   account/setup/page publication, and support/transport vocabulary consistently.
   Keep action labels brief while explanatory sentences may expand when needed.
3. GIVEN merchant names, descriptions, options, categories, destinations and form
   values THEN language changes preserve them literally, together with selections,
   filters, permissions and chat state. No translated text becomes a machine key.
4. GIVEN research and verification THEN record primary-source usage/guidance and
   adaptations honestly; no claim of independent native-speaker review. Validate
   active selector/fallback boundaries and retained catalogs, token preservation,
   dynamic action labels, actual Chrome locale switching after usable hydration,
   no English fallback in revised active UI, mobile/desktop wrapping and metadata.

S132 verified defect refinement (Ready before correction): actual Chrome shows
the enabled server-rendered Language select before its onChange handler attaches.
An ordinary Amharic selection can trigger hydration, reset to English and send an
English-cookie refresh. This is not an Add-label or cookie-origin defect. GIVEN
the initial server/hydration boundary THEN keep the selector disabled until its
first client effect commits, as well as during an in-progress refresh. WHEN it
becomes enabled THEN the first ordinary selection must set the intended locale
and refresh text/metadata while preserving product selections. Add an actual-
source SSR/commit regression and repeat the actual UI switch. No extra timer,
forced locale cookie, framework workaround or provider/storage change.

Ready: enabled vs retained locale policy, fallback, copy audiences, source-of-truth
TSV/generator, merchant/privacy invariants and bounded tests/rollback are known.
Plan: record baseline → native-authored shared narrative and key-journey wording
+ enabled locale boundaries → focused semantic/compatibility/types checks →
actual Chrome web/Expo/role-appropriate review → explicit visual approval before
full/commit/rollout. No new provider/dependency/schema or hosted change. Existing
catalogs and keys stay available for a code rollback; no automatic re-enabling.

S133 transport invitation/intake extends this same authored vocabulary under
FE-052; chat assignment, Join, receipts, alerts and inactivity behavior are not
changed by this copy task. Earlier S129–S131 card/category/preview work is retained.

S100 / FE-052, October 15: the current local candidate centers business digital
showrooms near and far, organized offerings and direct questions. Rewrite each
locale for that browsing context; avoid literal English "step into" metaphors
and preserve concise task labels, merchant content and brand typography. Shared
Market/About/map/account copy must reach both clients without English fallback.
Prior release evidence does not prove this candidate's layout or publication.

October 15 refined local evidence: all 1,414 messages in each catalog and ten
localization tests pass, including explicit/shared client coverage and literal
merchant content. Both typechecks, narrative/marketing claims and 74 actual local
web/Expo-browser views pass. Near/far showrooms, social-post browsing, ranges,
merchant-listed availability and production questions/descriptions use contextual
wording in all five languages. FE-052 S100 and TRACEABILITY record the scope;
.local/showroom-narrative-s100/refined-screens/ contains captures/receipt. Layout
approval, full gates, publication, device and human linguistic review are separate.

Later October 15 lead refinement: each locale explicitly identifies an online
showroom/page; English names a "digital showroom". The shared-copy localization
regression checks that meaning in all five languages. Ten localization tests,
both typechecks and 21 refreshed Market/metadata browser views pass; the prior
74-state receipt remains for unchanged About/account layouts. Latest captures:
.local/showroom-narrative-s100/digital-lead/screens/. Visual approval remains pending.

## Problem and scope

### S101 — researched meaning-first wording (in progress, L1)

The owner rejects the previous literal-feeling translations and requests research
and clearer UI/value wording on both clients. Retain the accepted English idea;
each non-English locale may expand/reorder an explanation to convey the same
purpose. An online showroom may be explained as a business's internet page where
its offerings are organized, instead of inventing a literal technical noun.

GIVEN a public or owner workflow WHEN a locale is selected THEN primary labels,
instructions and statuses name the actual task clearly and use consistent terms
for products/services, account vs public page, item inquiries vs support chat,
private preview vs publication and transport assistance. Short controls may use
concise task wording while existing help/body text supplies the explanation.
GIVEN value-proposition/About copy WHEN read THEN the visitor understands organized
offerings, availability confirmation and direct questions without social-post
searching; owners understand sharing their online page and describing their range
and production details. No exact stock, capacity verification or checkout promise.

S101 screen review also finds English platform words inside localized inquiry
headings and an untranslated dynamic owner metric. GIVEN platform-owned nouns
or labels are interpolated WHEN a locale is selected THEN translate those fixed
UI words before interpolation, on both clients. Merchant names, quantities and
other user values remain literal. Include dynamic label arrays in coverage and
browser assertions; literal t() coverage alone cannot detect these omissions.

GIVEN research WHEN applied THEN record primary-source links, actual guidance and
the adaptation chosen. Reference material is evidence of terminology/usage, not
proof that this app's phrasing was independently reviewed by a native speaker.
Do not claim automatic dictionary/key coverage establishes linguistic quality.
GIVEN language changes WHEN forms, inquiry selections or merchant data exist THEN
values, permissions and behavior stay unchanged. No provider, schema, SDK or
managed translation service. Keep brands, destinations and interpolation literal.

Readiness: English intent, audiences, existing shared catalogs/aliases, five
languages, test fixtures and rollback are known. Audit catalog terms and public/
owner/staff uses; prioritize the key journeys without erasing remaining findings.
Verify semantic invariants/interpolation, both typechecks and actual local public,
owner/product/inquiry and mobile browser layouts. Fresh visual approval precedes
full checks and scoped commit. S100's previous views do not prove new wording.
Master sections 3/18/19/22 are affected; rollback restores text/catalogs only.

S101 focused evidence: 138 existing source rows rewritten and one missing metric
added (405 changed/new translation values), plus three explicit capitalized
inquiry-status aliases. Each translated catalog now has 1,418 keys. Twelve
localization regressions, narrative/category/marketing checks, both typechecks,
homepage composition, whitespace and 190-spec validation pass. Browser receipts
under .local/language-research-s101/ prove 74 Market/About/account views, 40 web
product/inquiry/owner/staff views, 12 loaded native-owner views and 16 native
product/inquiry/contact/transport views. Merchant text, selected products, reloads
and typed contact text are preserved; no business form saves or messages sent.
Map tiles alone are stubbed; Expo browser is not native-device evidence.

The review exposed and fixed untranslated interpolated offering/count/quantity
labels, the dynamic owner metric and title-case native inquiry statuses. Tests
protect those distinctions. Screenshot selectors explicitly exclude retained
hidden Expo screens and await actual forms/inquiry content, not loading bars.
The web review uses canonical /dashboard/profile: the redirect through /dashboard
hit an existing development timing error matching Next.js issue 86060. No error
filter, performance monkeypatch, dependency upgrade or app redirect change was
made. The final canonical-route error assertion passes. Initial local navigation
timeouts coincided with dev cache compaction and are not release evidence.
Visual approval, full gates, scoped commit and rollout remain pending; no
independent first-language review or complete language-quality claim is made.

Visitors and owners need plain, readable interface text in English, Amharic,
Afaan Oromo, Somali and Tigrinya. Cover public discovery, Featured, About, legal,
login/signup, business/product/inquiry controls and owner/staff/admin workspaces.
User-written content, identities, place names, contact destinations, prices,
machine values and search terms are preserved. No machine translation service,
semantic search change, database migration or provider configuration change.

English is the default. A shared language selector uses each language's own name,
remembers a validated preference for one year in a same-site cookie and retains
the URL, filters, inquiry list and mounted form state. Invalid preferences fall
back to English. All five languages are left-to-right. Language is a display
preference, never an authorization or catalog filter. Keep English terms when
translation is unclear; do not invent vocabulary. Draft translations must not
be described as native-speaker reviewed.

## Scenarios

1. GIVEN no preference or an invalid cookie WHEN a page renders THEN the document
   language and interface are English; only allowlisted locales can load a catalog.
2. GIVEN any supported language WHEN it is chosen THEN the page and accessible
   labels use that language, the preference survives navigation/reload, and the
   same URL, typed form fields, filters and inquiry selections remain.
3. GIVEN merchant content matching an English interface word WHEN language changes
   THEN that content and all saved/input values stay verbatim. Public/private
   visibility and tenant permissions are unaffected.
4. GIVEN public and dashboard workflows WHEN using any locale THEN navigation,
   forms, status/errors, empty/loading states and primary actions have intentional
   translations or a documented English fallback, with no raw message IDs.
5. GIVEN long Oromo text or Ethiopic script WHEN using desktop or 390/320px screens
   THEN controls wrap/read correctly, selectors work by keyboard and no horizontal
   overflow or hydration errors occur.

## Test plan

Pure tests: locale validation, fallback, interpolation/content preservation,
catalog coverage and collision checks, selected-locale payload size. Focused
browser tests: all locale SSR language, switching/reload/navigation, inquiry/form
state preservation, public and role-scoped dashboards, accessible labels and
phone layouts. Existing security/owner/inquiry tests remain authoritative.
Evidence will be linked in TRACEABILITY; implementation is not deployment.

## Readiness and implementation order

Definition of Ready met: explicit languages/scope, stable URLs, English fallback,
no data mutation, bounded local dictionaries and unchanged domain behavior.
1. Add request/client dictionary adapters and validated preference control.
2. Wire platform-owned text, preserving all user expressions and machine values.
3. Add translations and coverage audit; inspect errors/options/dynamic labels.
4. Focused tests and desktop/phone review; request visual approval.
5. Only after approval run full/release gates and scoped commit/publication if
   authorized. Master sections 18 and 19 are affected.

## Rollout and rollback

Local visual candidate first. No data changes. Reverting the interface release
restores English; an ignored preference cookie cannot affect authentication.
Server rendering loads one language and client messages exclude server-only copy.
Keep optional human linguistic review visible in engineering evidence, not as
filler in the app. Do not claim complete coverage before inventory tests pass.


## Evidence: 2026-09-23

The owner authorized completion and publication after review. Six localization
safety tests pass, including explicit-message translation/fallback coverage and
server-only payload exclusion. 982 dictionary keys per language; retained English
terms and legacy/custom-design copy are documented in locales/english-fallbacks.json.
Unrecognized provider error details use readable English fallback rather than
raw message IDs. No native-speaker review is claimed.

85 public/owner/admin browser checks pass at 1440/390/320, including selected
language across navigation/reload, unchanged merchant content, unsaved form text,
inquiry selection, mobile menu operation and no overflow/hydration errors.
The direct-link inquiry restoration race found by this matrix is fixed under
FE-041 and covered by scripts/capture-product-ready.mjs. Full release gates and
publication evidence remain pending.

Full check, release, all nine production-mode provider/browser scenarios,
operations, final Netlify build and artifact privacy verification pass.
Deployment is separately recorded in docs/SUQPAGE-S25-RELEASE-2026-09-23.md.

Published and independently verified as 6ab399ae7a6f90b9daec07dc;
five-language live browser checks and monitored health pass. See S25 release
evidence for the resolved packaging incident and retained linguistic limits.


## S28 local extension — 2026-09-23

FE-051 / BE-043 / DEP-040 supersede S26's required signup handle field: signup
allocates an unused address and opens the populated private page preview.
Handle edits move to Business details, first change immediate then once every
30 days; a platform administrator may override with an audited support reason.
Reserved old handles redirect public product links without bypassing privacy.
New examples reuse admitted fictional ceramics imagery and include two photos
and two YouTube links per offering. Account identity/consent stays real; existing
content is untouched. The Suqpage wordmark has fixed Latin typography in every
locale. Local focused tests/captures are separate from visual/release approval.

## Contextual writing revision (FE-052, local)

`locales/README.md` records writing decisions for discovery, inquiry, publishing,
owner management and manual transport support. The local catalogs now contain
1,133 messages each, including support, callback receipts, evening schedule labels S40 showroom-value copy and S41 clearable category filters. This is a focused contextual rewrite of key journeys, not a
claim that every retained phrase has received native-speaker review. Merchant
content and canonical status values remain unchanged. Revised phone/desktop
screenshots and checks are tracked under FE-052.

## S67 — contextual copy pass before Android rebuild (2026-10-06)

Owner authorizes latest mobile build and language review. Review active UI labels
and prose by purpose, preserve English narrative/merchant values, and correct
cross-language contamination or confusing action terms. Technical words may retain
English where clearer. Five locales must have catalog coverage, literal placeholder
preservation and readable mobile screens across public and owner workflows. No
claim of independent human/native-speaker signoff. Verify localized preview-first
setup and inquiry/transport distinctions; this is L1 copy, not domain behavior.

S67 focus regression: GIVEN a language sheet is closed after switching languages
WHEN an owner focuses and edits a field THEN hidden dialog content cannot capture
focus or discard edits. Hidden native/browser sheets must unmount their focus
boundary; retain open-sheet semantics. Verify actual deletion, saved empty contacts,
editor re-entry and first publication after switching all five languages.

S67 verified local gates: focused five-language setup/preview and persisted
editing/publication regression passes; full check, production build/trace, provider
smoke and 11 acceptance workflows pass. Release audit remains failed solely on
the approved two-root internal-APK exception; final native artifact checks pending.
See S67 in TRACEABILITY for evidence boundaries and protected capture paths.


S71 (FE-019/FE-053): contextual purchased-goods transport invitation is authored
separately in Amharic, Afaan Oromo, Somali and Tigrinya. Keep English Live Chat
in parentheses alongside each local label; do not change unrelated owner/staff
chat wording, merchant content or backend values. Verify shared catalog coverage,
narrow launchers/intake and preserved paired fields in web/Expo captures. This
revision is in progress pending focused evidence and owner visual review.

S72: author concise local View products/Hide products actions for the existing
Market panel on both clients; preserve compact fit and literal merchant content.
Focused five-language toolbar captures precede owner review.

S71 reviewed launcher revision: shorten the native primary service names as
Delivery help, then describe purchases and live chat in a compact second line.
Keep native live-chat wording with English (Live Chat), allowing natural local
ordering instead of English word order. Intake copy is unchanged.

Owner clarifies: native-speaker comprehension takes priority over matching the
English length. The localized sublabel explicitly names purchased goods and live
conversation, allowing extra descriptive words and clean wrapping. Do not abbreviate
the local meaning just to match English's character count. Authored translations
remain distinct from independent native-speaker approval.

S90 (FE-019/FE-053): author Need help with transport? and the smaller supporting
sentence Let us handle it. Chat with our transport agents live in each language.
Retain native chat wording plus (Live Chat); do not translate merchant content.
The intake invitation also names the transport team and help getting the purchase
to the customer, written naturally in each language. Verify shared-catalog coverage and
legible ordered typography at 320px on web and Expo. Independent native-speaker
approval is separate from automated coverage/layout evidence.

S99.8 (FE-052/DEP-044): write the organized-collection narrative independently in
Amharic, Afaan Oromo, Somali and Tigrinya for Market, both About audiences and
account entry. Use ordinary local words for browsing offerings, models/styles,
colors and direct questions; preserve familiar brand names. Keep the canonical
TSV/generated catalogs synchronized, placeholders and merchant content unchanged.
Coverage/layout checks do not imply independent native-speaker approval.

October 11 focused evidence: canonical TSV/generated catalogs stay synchronized
at 1,401 messages per translated catalog; ten localization safety/coverage tests
pass. Shared narrative/marketing claim tests, both typechecks and 69 actual local
browser states pass, including narrow-phone layouts across all five languages.
Evidence: .local/play-s99/narrative/ and scripts/test-launch-materials.mjs.
The new app-copy candidate awaits visual approval and full release gates; existing
Play version 3 is unchanged. No merchant content is translated or rewritten.

S99.9 (FE-052): each Market heading explicitly identifies businesses selling on
social media and their products. About separates customers browsing those stores
from owners creating them. Use ordinary native phrasing for shops, products and
social media; each heading must make sense without its paragraph. The English
word collection or a literal scrolling metaphor is not required in any locale.
Keep generated catalogs and canonical source synchronized; this correction does
not change merchant text or any data/action contract.

S99.9 focused evidence, October 11: 1,406 messages per translated catalog,
ten localization tests, both typechecks and 69 local five-language browser states
pass. New headings use native business/shop/product terms; no English slogan is
needed to establish context. Captures are under .local/play-s99/copy-clarity-s999/.
This does not imply independent native-speaker signoff or a new installed binary.

S99.10 (FE-052/DEP-044): apply the owner-accepted nearby-business/social-product,
organized-online-store and direct-contact narrative contextually in all five
languages. Market, separate About audiences, aligned account/map introduction
and campaign copy keep the same meaning. English prose is explicitly accepted;
other languages need not follow its word order or idioms. Native local terms for
business, products, shops, social media and browsing remain understandable without
an English slogan. Placeholder, user content and data boundaries stay unchanged.

S99.10 focused evidence: 1,414 synchronized messages and ten localization tests,
both typechecks and 69 local five-language viewport states pass. New five-language
customer/owner campaign sheets are visually inspected. The owner accepts the
linked app layouts and full checks on October 12; independent native-speaker and
physical-phone signoff are not claimed. Prior assets remain separately preserved.

S99.10 verified source/store evidence, October 12: owner visual approval precedes
the complete passing check, clean isolated release:web, 11/11 production-mode
local acceptance workflows, operations, mobile build contracts and Android Hermes
export. Actual packaged Linux handler/Sharp and scheduled worker pass; the worker
uses an empty isolated PostgreSQL fixture and sends no provider requests. The
web audit is clean. Native audit remains failed (20 high, two tooling roots, zero
critical); both roots are absent from all 1,651 compiled runtime modules. The
previous one-AAB waiver is consumed; another build needs exact renewed admission.

Fresh independent normal Console reload verifies exact English/Amharic listing
drafts, ordered assets and seven unchanged phone-image references plus shared
icon. Only six graphics change; all six transformed Google CDN images visually
match source. Thirteen composite AI labels persist, the original icon remains
unlabelled, and Publishing overview still has a disabled Send app for review.
No Google review, closed activation, opt-in, physical-device or campaign publication
is inferred. Source/receipt evidence: .local/play-s99/narrative-s9910/source-gates.json,
console-setup/s9910-final-two-locale-console-read.json and
store-presentation/proximity-v1/provider-readback/verification.json.


## S105 social-contact revision

FE-066 / BE-055 supersede new customer messages to business inboxes. Only
configured social accounts receive visitor handoffs; chosen products and the
simple message follow the active UI language. Retained private history stays
scoped. Public transport chat and authenticated owner support remain unchanged.
Local implementation and review evidence are tracked in checklist S105.


## S112 native client-message coverage correction

GIVEN a product/supply label used only by native app/src WHEN catalogs are built
THEN client-message pruning retains its authored translation in every language.
The generator scans native sources alongside app/components/lib; technical
coverage does not certify native-speaker fluency. `scripts/test-localization.ts`
checks active supply choices, honest unavailable statuses and native conditional
Add product/Edit product labels in clientMessages. Existing branding, literal
merchant data, interpolation, server-message privacy and payload bounds remain.
