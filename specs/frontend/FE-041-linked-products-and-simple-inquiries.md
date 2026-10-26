---
id: FE-041
title: Linked product pages and simple single or grouped inquiries
status: in_progress
related: [FE-074, FE-066, FE-050, FE-047, FE-044, FE-001, FE-016, FE-030, FE-036, FE-040, BE-001, BE-014, DEP-030, DEP-051, FE-042, FE-049, FE-053, BE-044, FE-075, FE-070, FE-054]
owners: [product, frontend, security]
last_updated: 2026-10-23
change_level: L2
---

# FE-041 — Linked products, simpler inquiries and search beside the map

## S173 — one product page for individual and business buyers (ready)

AfricMade centers goods made in Africa while welcoming both B2C and B2B
buyers. A merchant can state whether a listed product is offered as individual
items, bulk orders, both, or has no declared order size. This is a merchant
declaration, not a platform verification, stock promise or checkout rule.
Existing products have no declared order size until their merchant edits them;
industry, price, minimum order and product kind never silently infer a tag.

GIVEN an authorized owner or staff member edits a product on web or native WHEN
they save its order-size choice, unit, optional minimum order, typical lead time,
capacity and short highlights THEN the same tenant-scoped versioned upkeep
stores those fields. Older clients that omit the new fields preserve existing
values. A forged or cross-tenant edit cannot alter another business's facts.

GIVEN a buyer opens a product on web or native WHEN the merchant has entered
order-size and other facts THEN the order-size badges, price (when supplied),
supply status, unit and merchant-entered facts are easy to scan before the
description and inquiry actions. Empty facts add no empty labels. Long facts
wrap on 320px screens and remain readable in English, Amharic and Afaan Oromo.

GIVEN a buyer selects one item or a larger order WHEN they inquire THEN the
existing optional quantity, selected product/options and channel choice remain.
Order-size tags and product facts do not create a required quantity, minimum,
lead-time question or purchase restriction; the buyer can add details at the
message destination.

BE-014 owns the additive catalog/snapshot/wire contract. A guarded additive
database migration precedes any web or native release using the new column.
Tests cover old-client preservation, tenant isolation, snapshot round-trip,
native projection and the simple inquiry. Browser review covers web phone,
desktop and Expo owner/buyer tasks. No origin eligibility gate is added.

## S172 — rebrand without changing the enquiry journey

FE-070 changes platform identity and the short prepared message, not this
workflow. GIVEN a visitor selects products and optionally enters a quantity WHEN
they choose AfricMade Inbox, WhatsApp, Telegram or copy THEN the same channel
selection, editable message step and product links remain. The draft contains
only selected product information and a simple availability question; it never
adds an unrequested pricing or lead-time prompt. Retain the established “Add to
inquiry list” and “Send inquiry” labels so the list and send actions stay clear.

## S153 N09 — reachable floating inquiry actions without viewport obstruction

FE-053 N09 moves the variable measured shell-dock clearance into scroll content.
GIVEN a current business has saved selections WHEN its inquiry action increases
the dock height THEN the last product/content can scroll above both actions,
without a full-width opaque viewport band. Preserve distinct per-business lists,
count/quantity/options, direct inquiry behavior, public contact handoff and
48dp localized controls. Market keeps its existing own feed clearance; private
Account/editor screens gain no public inset or launcher. Actual source/component
and 320/390/landscape Chrome checks precede the existing visual/full/build gates.


## S151 — native showroom grid survives pixel-rounded layout widths (local correction; review pending)

The physical Android release check found a native-only geometry defect: every
product occupied half a row while the other half stayed empty. The measured-width
arithmetic passed the earlier controlled JSX/browser tests, but Yoga exposes a
pixel-rounded `onLayout` width that can exceed its actual internal row width.
Feeding two exact half-widths back into that row can therefore wrap the second
card. Installed React Native 0.86.3 Yoga reproduces this at the Pixel 8a's
1080px/density2.625 geometry. No product, inquiry, backend or permission changes
are required; FE-053 controls the native release boundary.

1. GIVEN an actually measured public or private-preview grid wide enough for two
   150dp cards and the existing12dp gap, with font scale at most1.3 WHEN Yoga lays
   out cards at fractional widths or display densities THEN two consecutive cards
   share the row, use its available width and never wrap merely because the
   reported width was pixel-rounded. Let the layout engine allocate remaining
   space rather than reuse a rounded measurement as two exact card widths.
2. GIVEN an unmeasured/narrow grid or enlarged text WHEN cards render THEN each
   card fills a single row. A final unpaired card may use the full remaining row.
   Container resize, orientation, filtering, category selection and public/private
   preview retain their existing description, details, Add, options and list rules.
3. GIVEN the previous exact-width algorithm WHEN evaluated by the installed Yoga
   engine at the failing fractional geometry THEN the regression fixture must
   reproduce the wrap. The corrected styles must pass that same fixture, broader
   fractional widths/densities, narrow/enlarged fallback and odd item counts.
   Controlled component ports and Chrome Expo are labelled separately from native
   Yoga and physical-phone evidence. A rebuilt APK must pass on the actual phone
   before it or a new AAB is admitted; the old-source AAB review is superseded.

Definition of Ready: the physical defect, minimal native presentation scope,
unchanged data/security/localization contracts, reusable150dp/12dp breakpoints,
meaningful engine-level regression and separate visual/full/device/release gates
are explicit. Plan: reproduce with installed Yoga → use flexible card allocation →
actual-source/engine/type/spec checks → focused actual Chrome Expo tasks/captures →
owner visual approval → full gates → newly reviewed APK/device/AAB admission.
Master §§8,19,22 need corresponding current-source and device-evidence limits.

Focused source implementation now passes: `test-native-showroom-cards.ts` and
`test-native-featured-grid.ts` cover11 actual-component cases, including existing
Add/options/categories/return behavior and measured narrow/resize/text fallbacks.
`test-native-catalog-grid-yoga.ts` compiles the installed React Native0.86.3 Yoga
sources and passes864 width/density/card-count/font-scale cases using the actual
shared sizing contract; it first reproduces both previous failure geometries.
Actual visible Google Chrome155 Expo review passes11 English user/geometry checks
and6 Amharic/Afaan Oromo label/geometry checks, with15 captures, real local catalog
reads and browser-local inquiry persistence. Loopback DB schema77/Auth were
independently verified; no backend writes, remote Auth email or public OSM requests
occurred. Receipts are `.local/native-showroom-grid-s151/chrome-expo-receipt.json`
and `chrome-locales-receipt.json`. Initial hidden-route/translation-key harness
failures were retained and corrected separately; they were not product changes.
Root/mobile strict types and218 spec links pass. Private-preview browser login,
owner visual approval, full gates and rebuilt physical-phone verification remain
pending. This is neither a deployed mobile fix nor a new AAB admission.

## S131 — optional, visible showroom collections (ready)

Here “collection” means the merchant's existing product categories, not the
retained legacy collection tables or global Market business industries. This L2
cross-platform presentation/projection change keeps category creation and product
assignment permissions unchanged. FE-053 and BE-044 govern additive native wire
parity; FE-066 and S129/S118 keep details, Add and per-business lists authoritative.

1. GIVEN active tenant-local categories containing visible products WHEN the
   showroom grid opens THEN show a styled, wrapping single-select chip group
   labelled Product category: All and literal merchant category names with product
   counts. Use the current showroom accent, a clear selected state, keyboard/
   screen-reader selection and at least48px hit areas. Long names wrap without
   clipping; no horizontal-only hidden choices or oversized modal is required.
2. GIVEN a category and search text WHEN either changes THEN apply both criteria
   to the same canonical visible products. Counts describe the category's visible
   catalog membership, not a server request or inventory quantity. All resets
   only category selection; clearing search preserves the category. Details/Back
   and Add preserve the current selection and inquiry list. If a refreshed catalog
   removes the selected category, fall back to All rather than an empty stale ID.
   Actual-Chrome defect refinement, Ready before correction: Expo remounts the
   showroom on details→Back, so component-only query/category state is insufficient.
   Retain bounded public search/category return criteria in app memory, scoped
   by canonical API origin and business ID, at most32 businesses with two-hour
   expiry. Save no product/catalog snapshot, private preview, customer content,
   identity or credentials. Apply matching criteria atomically on business
   changes and validate category IDs against the latest visible category set.
   Use the existing bounded public-search text limit for cacheable query input;
   never replay a different shop's state or overwrite a restored state during
   the initial mount effect. Regress actual remount, A/B isolation, private
   preview exclusion, expiry/eviction, stale category removal and details/Back.
3. GIVEN a visible product belongs to a currently active category in that same
   catalog THEN show its literal category name as a small, readable card label.
   Unassigned, inactive and foreign category IDs do not invent an affiliation.
   Categories with no visible products do not become empty browsing choices.
4. GIVEN a showroom has no usable categories THEN show its ordinary search and
   flat product grid, with no category requirement, blank selector or fabricated
   collection. Signup, saving, publication, product management and old app clients
   remain compatible; do not make categories compulsory or revive legacy groups.
5. GIVEN native public/private preview projections THEN add only optional typed
   category list/identity fields derived from the existing scoped Catalog. Never
   trust a hydrated name from an inactive/foreign category, infer from Market rows,
   expose private products through counts, or fetch once per card. No schema,
   new endpoint, dependency, new permission or provider is needed.

Ready: user intent, users/non-goals, optionality, active tenant authority, backward
compatibility, counts/filter semantics, accessibility and five-language reuse are
explicit. Master §§7/8/18/19 are affected. Reuse translated All/Product category
and existing result labels; merchant names are never machine-translated. Plan:
record baseline → additive projection + styled web/native chips/affiliation →
focused canonical/filter/optional tests → actual Chrome real catalog journeys
and separately labelled fixture edge cases → visual approval → inherited full,
commit and separately authorized rollout gates. UI rollback leaves category data
and saved inquiry lists untouched. No owner editor expansion is included.

Test mapping: actual-source web/native card tests cover search intersection,
counts, empty/inactive/foreign/unassigned categories, deletion refresh, literal
names, selection, accessible48px targets and unchanged Add/details. Projection
tests cover canonical tenant category identity and backward-compatible omission.
Actual Chrome covers desktop/phone web and Expo390/320/landscape, enabled en/am/om
under the later FE-049 S132 direction, category→search→Add→details→Back and a
flat-grid shop. Retained inactive catalogs remain separately validated. No catalog or
account writes are necessary. Response-only fixtures are recorded separately
from real API/database evidence. S128–S130 and earlier unfinished tasks remain.

## S129 — add from native showroom cards (local implementation; review pending)

The owner requests parity with the existing web showroom grid: see a short
product description and add to the inquiry list without first visiting details.
This changes shared native/Expo showroom cards, not Market search cards, checkout,
external contacts or transport. FE-053 governs native parity; FE-066 and the S118
canonical, per-business persistence and maximum20 rules remain authoritative.

1. GIVEN a visible published product in a native showroom WHEN its card renders
   in a narrow public or private-preview container THEN size the grid from that
   container's measured width, including its12px gap. Use two columns only when
   both cards fit at least150px; otherwise use one full-width card. Enlarged text
   keeps the existing full-width fallback. A card must not remain half-width on
   its own row with an empty right half. This refinement is Ready before correction
   after the actual320px private-preview screenshot proved percentage widths plus
   the fixed gap wrap every card. Regress narrow private/public measured containers
   and retain description/Add/stock/preview semantics.
   Show name, up to two description lines, supply state, existing price and
   separate details and48px Add to inquiry list actions. Details retains full
   description/media. Use the business's current accent and existing labels in
   all five languages; long labels wrap, no nested interactive controls or overflow.
   The existing web phone grid also retains its two-line excerpt instead of
   hiding descriptions; its established Add/options route is otherwise unchanged.
   Card accessibility action names use the same translated Add/Added wording as
   their visible label, followed by the literal product name.
2. GIVEN an eligible available/limited product with no required option choices
   WHEN Add is pressed THEN add that canonical item once and remain on the grid.
   Sole-value groups may use their canonical single value. The existing floating
   current-business inquiry count updates; repeated activation cannot duplicate.
   After an item is saved its card shows Added to inquiry list. Other businesses'
   lists and direct-single inquiries remain unchanged, including after reload.
3. GIVEN a product has multiple size/color/etc values WHEN Add is pressed THEN
   open the existing bounded Sheet with its canonical option Chips and explicit
   Add; no product-detail route or arbitrary variant default is required. Missing
   or invalid choices cannot add. Cancel leaves lists unchanged; a successful Add
   returns to the same grid. A maximum-list limit encountered inside the picker
   shows its feedback inside that active picker, not hidden behind it.
   Options remain literal merchant text. Empty/invalid
   option groups cannot enter a saved list.
4. GIVEN unavailable/coming-soon, unpublished/retired, preview-only or not-yet-
   loaded selection state WHEN cards are used THEN do not create selections.
   Show stock/disabled state honestly, retain preview details, and preserve the
   existing storage-error/retry feedback. Revalidate current public product,
   options, duplicates and maximum20 at the action boundary before mutation.
5. Verify actual-source component behavior and existing storage/availability
   regressions. In installed Chrome compare web desktop/phone and Expo390/320/844,
   including all five language labels, real public catalog reads, inline Add→count
   →list→Back/reload, details, required options where real data supplies them,
   availability, per-business isolation and an unobstructed floating dock. Record
   controlled fixtures separately; no catalog/account/customer/backend writes or
   real social messages. Expo Chrome is not installed Android/OS verification.

Ready: scope, users, option interaction, stock/canonical/tenant/privacy invariants,
existing storage/UI/provider ports, localization, targeted tests and rollback are
explicit. Master §§8/18/19 are affected. Plan: record baseline → small native card/
option-sheet change → focused tests and real Chrome journeys → concrete visual
review → existing approval/full/commit/rollout gates. No dependency/API/schema
change; reverting only UI restores detail-first cards and preserves saved lists.
S128 and earlier workspace/chat/map reviews remain pending, not replaced.

S129 focused test mapping:

| Acceptance | Evidence |
| --- | --- |
| 1: native excerpt, separate target, accent/wrapping and translated names | `scripts/test-native-showroom-cards.ts` actual source/native presentation ports |
| 1: web phone excerpt, long/empty text and translated Add/Added accessibility | `scripts/test-showroom-card-excerpt.ts` actual React renderer/compiled CSS, controlled catalog/callback ports at320/390/844/1440 |
| 2–4: no-options/sole/multiple choices, stock, preview, hydration, duplicate/cap and storage failure | `scripts/test-native-showroom-cards.ts`, `scripts/test-business-inquiry-baskets.ts` actual canonical store with controlled storage |
| 2–4: unchanged handoff/dock/public eligibility | `scripts/test-contact-handoff-native-ui.ts`, `scripts/test-mobile-public-action-dock.ts`, `scripts/test-product-only-native-ui.ts` |
| 5: real catalog Add/list/details/reload and public/preview safety | Installed Chrome evidence under `.local/product-cards-s129/`, recorded in traceability; response-only option fixtures labelled separately |

Both new focused scripts are registered in the existing `test:workflow-ui` gate.
S131 adds `test-showroom-category-projection.ts`, `test-showroom-categories-web.ts`
and `test-showroom-return-state.ts`; the extended native card suite regresses
actual component remount, public/preview and business/origin isolation. The later
FE-049 S132 direction limits new visible-language review to en/am/om while
preserving the four non-English compatibility catalogs.
Actual visual approval, full gates and rollout remain separate. Native/controlled
component evidence does not establish installed Android or OS storage/handoffs.

## S118 — separate saved lists inside each business (ready)

The latest owner correction supersedes S113's global last-business list launcher
and native single-basket restriction. L1 web UI/L2 native local persistence; existing
canonical product/options authority and maximum20 selections per business remain.
FE-066 governs external contact, FE-053 native parity and DEP-045 demo safety.

- GIVEN business A has two selections and B has one WHEN each showroom or its
  product detail is opened THEN a reachable floating action shows respectively2
  or1, opens only that business's list and does not merge/clear the other list.
  Empty shops show no inquiry action. Never show a last-business fallback on
  Market/Featured/About/account or inside another empty showroom. Transport keeps
  its appropriate separate place and neither action obscures content/navigation.
- GIVEN a visitor adds/removes/changes/clears A's list THEN B remains unchanged,
  including after navigation and local app/browser restart. Persist only bounded
  canonical item IDs, option selections and optional quantity, scoped by business
  and runtime environment; no cached catalog snapshots or customer/private data.
  Use existing local storage capabilities, no package/provider/database addition.
- GIVEN retained local data WHEN a page/list loads THEN rehydrate from that
  business's fresh public catalog; prune unavailable/removed/foreign products,
  invalid options and duplicates before count or handoff. Loading must not save
  an empty default over an unread list. A late read/write from A cannot change B.
- GIVEN storage is malformed, denied or fails WHEN browsing THEN fail safely,
  preserve current in-memory selections and show concise honest recovery feedback;
  do not claim durable saving. Keep failed-write state retryable, do not corrupt
  another business's file/key or interfere with account credentials/logout.
- GIVEN direct inquiry about one product WHEN opened THEN only that product is
  prepared; it does not add to, replace, remove or substitute any stored list.
  All selections are canonical and no action creates a Suqpage business inbox row.

Ready: audiences, persistence scope/failure/privacy, existing file/browser storage,
product authority, route targets and testing are known. Reuse current native
storage dependencies; avoid SecureStore for large nonsecret public selection
lists. Web's existing per-handle lists must remain compatible. Native existing
in-session selections must not be silently lost during the transition. Test pure
store races/failures plus actual components and local paired-A/B navigation/
restart/count/direct-inquiry behavior. Capture desktop/phone/Expo and five-language
labels before inherited visual/full gates; current Android binary is separate.

### S118 local verification — visual approval pending

The implemented dock exposes the current business's saved count only on its
showroom/product screens. Existing web per-handle storage remains compatible;
native/Expo lists persist separately by canonical API origin and business ID.
Only bounded product references, options and quantities are stored. Fresh catalog
rehydration and independent direct-product inquiry preserve canonical authority.

Mapped focused regressions are `scripts/test-business-inquiry-baskets.ts`,
`test-floating-inquiry-web.ts`, `test-mobile-public-action-dock.ts`,
`test-product-only-native-ui.ts` and `test-public-transport-launcher.ts`. They cover
A/B isolation, reload, unavailable/foreign selections, initial-read/add races,
late reads, serialized writes, denied reads, failed-write retry, bounded UTF-8
storage and direct-single isolation. Native filesystem checks use actual temporary
Node files through SDK-shaped ports; they do not establish installed Android
filesystem behavior. The shared S118 focused set passed 92 cases; after the narrow
supported-pointer-events correction, 26 relevant cases passed again. Final web
and native typechecks passed; the repeated cases are not additional unique tests.

Actual anonymous local web 1440/390 and Expo 390 journeys passed all three surfaces
with six screenshots, including an Amharic composer:
`.local/business-inquiry-s118/actual/attempt-2/outcome.json`. A's two selections and
B's one survived switching and reload; Market/Featured showed no inquiry action
while retaining transport, and direct inquiry left both lists unchanged. Fresh
public catalog GETs supplied authority. Clipboard/openers were isolated; no
external message, SMS protocol launch or application mutation occurred. Eleven
source hashes stayed stable and no runtime, console or API error occurred.

The raw receipt retains 31 navigation-cancelled analytics POST records. The
companion `expected-network-verified.json` verifies that all are intercepted
`/api/analytics/visit` POSTs, never forwarded; no public API GET failed and no
unexpected request failed. The first strict-failure receipt remains unchanged.
This is local implementation/test evidence, not visual approval, full/release
gate completion, an installed Android test, a new binary or deployment.

## Current release evidence — 2026-09-14

The owner approved the visual design and deployment. Source `41e2fed` is published
as Netlify `6aa7fe5a106ca381ba08bba3`; hosted schema 43 and the public desktop/phone
workflows are verified. Full core/release, seven isolated authenticated/public
acceptance scenarios, 72 accessibility states, operations, PostgreSQL and container
gates pass. Earlier approval/full-gate-pending notes below describe intermediate
local milestones, not a new approval requirement. Remaining hosted email delivery
and authenticated production smoke are tracked in DEP-030 and
`docs/SUQPAGE-DEPLOYMENT-2026-09-14.md`; this evidence does not claim those passes.

## Problem and scope

Product modals hide navigation and cannot be linked from search. Production facts,
cart chrome and an immediate phone form make a simple question feel complicated.
The user requests routed product detail inside the business product section,
separate single-product and grouped inquiries, and search beside a persistent map.
No schema migration, checkout, new delivery provider, seller facts or remote writes.
This governs the shared public profile; retained legacy renderer recovery is unchanged.

## Ready and implementation plan

User direction resolves layout and journey. Existing canonical product, contact,
media, inquiry and discovery ports suffice. Implement S2h in the transition checklist:
1. Pure product URL, cart reconciliation and safe message handoff contracts.
2. Inline product route/media/features and two clear inquiry actions.
3. Single/group composer with contact fields disclosed only for platform send.
4. Search results beside retained map and direct product links.
5. Focused domain/security/browser tests and 1440/390/320 captures; visual approval
   before expensive full gates, commit or rollout. Existing pending work remains.

## Contracts and acceptance criteria

- P1: `/@handle?product=<canonical-id>` addresses a published product within that
  active tenant. Cards/search use real links. Detail replaces only the product grid,
  retaining the cover, identity and contact section. Back to products, browser
  back/forward and reload work. Unknown/unpublished/foreign IDs show a safe unavailable
  state and return link. Opening locally retains filter/search and restores the
  originating product link/scroll when returning. A direct arrival has a safe catalog
  return. Product metadata uses the selected canonical name/description/image.
- P2: Cards do not announce Video. Detail shows photo first, a clear Watch video
  action only when provided, and no third-party iframe before intentional playback.
  Photos remain reachable. Missing media has a deliberate fallback. Media uses
  existing approved references; illustrative fixtures are not factual photography.
- P3: Single-value option groups need no selector; canonical defaults still travel
  with the inquiry. Detail contains name, description, optional price, feature chips, canonical
  availability and selling unit (pieces/bulk or the existing exact unit). It omits
  capacity, minimum order, lead time and internal offering-kind labels. Retained
  data/editor contracts remain compatible; no bulk claim is inferred from industry.
- I1: Inquire about this product opens a single-product composer with selected options
  and does not add, merge, clear or send the saved group. Add to inquiry adds one
  selection with clear feedback and stays on the product page. Existing selection
  is not duplicated; all required options remain canonical. Unavailable/coming-soon
  products cannot enter either path. Group maximum is 20 selections, matching BE-001.
- I2: No empty persistent cart/list chrome. With one selection, composer shows a
  compact product summary, not a repeated list. With multiple selections, show
  editable/removable list and group count. Optional quantity remains bounded text.
  Stored selection references are revalidated against current tenant products/options;
  invalid, removed or ineligible values cannot become share-message authority.
- I3: Composer offers configured WhatsApp, Telegram and SMS plus Copy inquiry and
  Send on Suqpage. Destinations use effective validated public contacts (published
  object overrides canonical fallback, including clearing); never private phone/email.
  SMS uses explicitly public phone, never assumes it is WhatsApp. All app handoffs
  prepare a message for user review, never claim delivery and never create inbox rows.
  Copy/visible selectable text remain available if clipboard/app launch fails.
- I4: Reply phone is absent until Send on Suqpage is chosen. Then labelled phone,
  Back to sending options, and explicit Send inquiry appear. Validation, pending,
  successful, retry/error and duplicate prevention are clear. Cart edits are disabled
  while sending. BE-001 canonical server validation, tenant scope, idempotency and
  rate limiting remain authoritative. Phone is not persisted in browser storage.
- M1: Desktop search results replace the solid command-panel filler, beside the
  still-mounted map. Search stays at the panel top. Category/place, zoom, reset and
  near-me controls float over the map with accessible labels and clear attribution.
  Phone keeps search, bounded map and scrollable results visible in one workspace.
  Meaningful-query threshold, scoped ranking/limits and reviewed geography remain.
  Autocomplete closes once the full result panel is active, avoiding duplicate results.
- M2: Product search results link directly to P1; business results retain preview.
  Map center/zoom survive query/result-type changes; category/place still scope the
  existing map projection. Empty/search/loading/error states do not remove the map.
- A1: Keyboard navigation, product-heading focus and return focus, composer focus
  trap/Escape/scroll restoration, 44px controls, no overflow at 320/390/1440, long
  names and feature wrapping. Preview supports navigation/selections without sending.

## Scenarios

```gherkin
Scenario: Search opens a specific product
  GIVEN a meaningful product query and the visible marketplace map
  WHEN a visitor opens a product result
  THEN that product appears inside its business product section at a shareable URL
  AND browser Back returns to the search beside the preserved map
Scenario: A single question does not send the saved group
  GIVEN two saved products and a third product open
  WHEN the visitor chooses Inquire about this product
  THEN the composer contains only that third selection and shows no multi-product list
  AND closing the composer leaves the saved two-product group intact
Scenario: Phone is needed only for platform delivery
  GIVEN one or more selected products
  WHEN the visitor opens inquiry sending options
  THEN no phone field appears and configured direct handoffs and copy are available
  WHEN the visitor chooses Send on Suqpage and confirms a valid reply phone
  THEN exactly one canonical inquiry is saved to the target tenant
Scenario: Foreign or stale product cannot be shared as current
  GIVEN a foreign, unpublished, removed or unavailable product reference
  WHEN it is loaded from a URL or retained cart
  THEN no unauthorized product details or eligible inquiry selection are disclosed
```

## Test plan and rollout

`scripts/test-product-inquiry.ts`: URLs, tenancy/availability/options/limits,
message destinations/encoding, private-contact exclusion and selling units.
`scripts/capture-product-inquiry.mjs`: P1–P3/I1–I4/M1–M2/A1 desktop/phone, public
responses, local canonical inbox persistence with fixture cleanup and no external
messages. Existing security tests cover BE-001. Screenshots/check results recorded
in TRACEABILITY and active checklist. Preview delivery and YouTube test stubs must
be disclosed. Rollback restores compatible UI; persisted contacts/products/inquiries
remain. No migrations or provider configuration changes.

Provider URI references: [WhatsApp](https://faq.whatsapp.com/5913398998672934),
[Telegram](https://core.telegram.org/api/links#public-username-links),
[SMS RFC 5724](https://www.rfc-editor.org/rfc/rfc5724.html).


## Verification checkpoint — 2026-09-14

Implementation and focused verification pass; status remains in progress pending
explicit visual approval and the required full gates. S2h in
`docs/SUQPAGE-TRANSITION-CHECKLIST.md` records the criterion-mapped browser flows,
1440/390/320 screenshots, typecheck/domain/security/architecture checks, real local
inbox retry/duplicate evidence with cleanup, preview regression and known stubs.
The legacy full acceptance runner needs FE-040/FE-041 selector/flow reconciliation
at the approved gate; no full-suite, build, commit or production claim is made.

FE-047/BE-040 adds local-candidate case-insensitive word matching across one
offering and its business/location text. Existing five-row backend pagination,
map persistence, product links and inquiry contracts are retained. No semantic
translation or media analysis is included; visual/release gates remain pending.

## Inquiry action clarity — 2026-09-20 (S13)

The user requests clearer distinction at the point of selection. Detail actions
read “Inquire about this product only” (or service) and “Add to inquiry list”.
Each has adjacent explanatory text: direct inquiry chooses a channel for only that
item; adding keeps browsing and collects items for one later inquiry. Added state
reads “Added to list”. Card actions read “Add to list”, with the item named in the
accessible label. The saved-selection action reads “Review item” for one selection
or “Review list” for multiple; count remains visible. No send happens on Add.

GIVEN two saved items WHEN direct inquiry is opened for a third THEN its message
contains only that third item and the saved list remains unchanged after closing.
GIVEN an eligible card/detail WHEN Add is clicked THEN no composer or message is
sent, the list count increases once and review exposes the accumulated selections.
GIVEN desktop/390/320 or a service WHEN controls render THEN scope and later-send
behavior are visible, accessible and do not overflow. No persistence/API change.

Focused verification: scripts/capture-inquiry-clarity.mjs, test:product-inquiry,
typecheck. Record screenshots before visual approval/full gates. Master section 9
customer flow and S13 checklist describe current labels once verified.

S13 focused evidence: nine captures at 1440/390/320 in
`.local/inquiry-clarity-review/`; product/service/card labels, saved-list independence,
zero sends on Add, no overflow and scoped axe pass. Inquiry unit tests and typecheck
pass. Current visuals are local and await explicit approval before release gates.

## Copy standard supersedes S13 helper text — S15

The user's newest instruction removes redundant explanations. Keep the explicit
single-item versus list labels, remove adjacent helper paragraphs, and use a
message icon for opening an inquiry, a list-plus icon for adding, and a clipboard
list icon for reviewing selections. Keep errors, outcomes, field requirements and
privacy/consent details needed for a decision. Never show implementation notes,
release status or explanatory filler in product UI. This is the default for future
Suqpage work; master section 5.3 records the standing rule.

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

## S24 — plain inquiry language

GIVEN a product/service card or detail WHEN selecting the grouped path THEN its
visible label is "Add to inquiry list", followed by "Added to inquiry list".
The saved-selection entry is "View inquiry list" at any nonzero count; remove
ambiguous "Review item", "Review list" and "Add to list" labels. The single-item
action continues to explicitly refer to that product/service only and does not
alter the saved list. Confirmation is one short sentence, with no instructions
repeating the button. Product/service words replace platform-owned "offering";
merchant content and legacy stored field names remain unchanged. Existing single/
group sending, delayed phone input, media and return-navigation contracts stand.
Test: focused product/browser copy checks at desktop/390/320 and product-inquiry
regressions. No mutation contract or schema changes.

Local evidence: `test:product-inquiry` passes; `capture-inquiry-clarity.mjs`
verifies the new labels, independent single/group actions, no send on Add,
service wording, accessibility and layouts at 1440/390/320. Screenshots:
`.local/inquiry-clarity-review/`. Visual approval and release remain pending.

## S22–S24 approved release evidence

The owner approved the combined visuals and deployment on 2026-09-21. Full check,
release, operations, nine isolated provider browser scenarios and Netlify artifact
privacy checks pass. Earlier S22–S24 pending-review notes are superseded.
Deployment evidence and remaining hosted-email limits:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.

### Direct-link initialization (2026-09-23)

GIVEN a customer opens a product URL directly WHEN the saved inquiry list has not
finished restoring THEN the product inquiry buttons stay disabled. WHEN ready
THEN the first click adds the selection exactly once and survives language
switching and reload. Do not allow an initialization effect to discard that click.
Evidence: focused direct-link regression and FE-049 browser matrix. No schema or
server inquiry contract change.

## Ordered media extension — 2026-09-23

FE-050 / BE-042 supersede the single-photo/single-video controls for the local
candidate. Owners add/remove/reorder up to eight photos and four YouTube links.
The linked product view uses thumbnails, arrows and horizontal scrolling; an
explicit play action starts the selected video. Save/reload retains the order
and existing records expand without backfill. DEP-039 gates hosted rollout.


## S105 social-contact revision

FE-066 / BE-055 supersede new customer messages to business inboxes. Only
configured social accounts receive visitor handoffs; chosen products and the
simple message follow the active UI language. Retained private history stays
scoped. Public transport chat and authenticated owner support remain unchanged.
Local implementation and review evidence are tracked in checklist S105.


## S113 floating saved inquiry list — ready, local implementation in progress

Historical S113 decisions below are superseded by S118 for global visibility and
native single-business/session-only storage. Current contract is the S118 section
above: a persistent independent list per business, floating only in its own
showroom/product context. Retain S113 direct-product, authority and transport
regressions that do not conflict with this explicit owner correction.

The owner requests persistent, compact access to selections across desktop web,
phone web and the native app, coordinated with transport chat. FE-066 supersedes
I3/I4 platform-send behavior above; configured social handoffs and manual copy stay.

- GIVEN no saved selection WHEN browsing THEN no empty floating inquiry action
  appears. Direct product inquiry opens only that product and never creates a list.
- GIVEN one or more eligible saved selections WHEN browsing a public screen THEN
  show a labeled floating Inquiry list action with the saved selection count.
  Duplicate selections do not increment it; removal/clear updates it immediately.
  The action opens the existing list composer, without another intermediate screen.
- GIVEN a saved web list WHEN navigating to another supported public page THEN
  retain its navigation-session count and link to its original showroom. Opening
  it restores canonical current selections before composing; an empty other shop
  never relabels or deletes that group. Same-handle hard reload retains existing
  per-handle storage; global-summary hard-reload persistence is not introduced.
- GIVEN a direct product composer and a separate saved list WHEN changing quantity,
  copying or closing the direct inquiry THEN the saved group/count remains intact.
  Modal background actions are inert; the native direct screen may navigate to the
  separately identified saved group. Hide redundant list access on its own composer.
- GIVEN a different web showroom WHEN its local saved references are restoring
  THEN no previous-shop selection/count/contact action is exposed as the new shop.
  Canonical current products/options remain authority. Web persistence stays
  per-handle; native selection lifetime stays navigation-session only. Native
  cross-shop access opens the saved basket's business, never the current other shop.
- GIVEN preview/private/account screens THEN no new public floating commerce action
  appears. Preserve existing preview simulation, tenant guards and social handoffs.
- GIVEN a supported phone, short viewport or interface language WHEN the dock is
  visible THEN both actions have readable labels, at least 48px targets, visible
  focus/count and safe-area/bottom-navigation clearance, without covering map
  handles or final page actions. Inquiry sits above Transport chat in one stack;
  short Market stages use one centered row, with a recognizable list icon/count
  and the full accessible list name beside the visibly labeled Transport chat.

GIVEN a public URL for showroom A changes while B is still mounted WHEN the
open-list command arrives THEN B cannot consume it or compose B’s group; A must
mount and restore its own canonical references first. Modal close restores a
connected focusable opener, or a visible current list/catalog control after
navigation or clearing the final item.

Ready: UI-only, existing cart/basket and transport ports suffice; no API, schema,
provider, dependency, durable native storage or release change. Related FE-036,
FE-049, FE-053, FE-066 apply. Master §§8–9,13,18–19 and local reachability statement
are affected. Ordered checklist S113 governs implementation. Focused actual React
regressions and local desktop/phone/Expo five-language captures precede visual
approval/full gates. Rollback restores UI with saved data unchanged.

S113 focused evidence: six actual web-component scenarios in
`scripts/test-floating-inquiry-web.ts`, native dock/Market/root tests and existing
selection/clipboard contracts pass; 105 current local web/Expo states across five
languages are indexed by `.local/floating-actions-s113/combined-verified.json`.
Review is `review.html` there. Focused runs preserve original failures and targeted
fix retests. Visual approval/full gates/commit/release and Android-device checks
remain pending; no new contact submission or external send occurred.
