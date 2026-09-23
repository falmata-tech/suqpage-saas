---
id: FE-041
title: Linked product pages and simple single or grouped inquiries
status: in_progress
related: [FE-050, FE-047, FE-044, FE-001, FE-016, FE-030, FE-036, FE-040, BE-001, DEP-030, FE-042, FE-049]
owners: [product, frontend, security]
last_updated: 2026-09-23
change_level: L2
---

# FE-041 — Linked products, simpler inquiries and search beside the map

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
