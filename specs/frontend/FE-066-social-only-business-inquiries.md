---
id: FE-066
title: External business contact with localized product messages
status: in_progress
related: [FE-040, BE-055, DEP-045, FE-001, FE-041, FE-049, FE-052, FE-053, FE-056, FE-062, FE-067]
owners: [product, frontend, security]
last_updated: 2026-10-17
change_level: L2
---

# FE-066 — External business contact; no Suqpage inbox

## Problem, scope and readiness

The owner retires customer inquiries delivered to business inboxes on Suqpage.
Visitors instead take a simple message and chosen products to the business's
configured social accounts. Transport live chat and authenticated owner support
are explicitly retained. This supersedes FE-001/FE-041 platform-send behavior.
No data deletion, provider integration, account change or deployment is included.
S106 corrects S105's overreach: preserve the existing full public contact fields,
public contact links and first-publication eligibility. Do not remove WhatsApp or
any configured social-account setup. Only new Suqpage business-inbox submission
and its primary navigation/counters are removed. All stored contact data stays.
Existing private inquiry history remains authorized, outside primary navigation.

Definition of Ready: confirmed scope, existing social-link validation, product
selection, language catalogs, native link opener and clipboard adapters are known.
No direct messages are sent automatically. Destination apps control pasting and
delivery. Retain visible message/copy fallback on clipboard or opener failures.
Inclusive showroom positioning describes what businesses sell, make and offer;
merchant facts, offerings, map/search and custom styling are unchanged.

## Scenarios and acceptance criteria

1. GIVEN a selected item or list WHEN opening contact options THEN configured,
   validated WhatsApp/Telegram and existing external contact choices remain the
   primary actions. S118 restricts inbox/message choices to WhatsApp, Telegram
   and SMS. TikTok, Instagram and Facebook remain ordinary profile links in the
   showroom header/footer, outside inquiry choices. All social setup remains. No Suqpage
   send form, required visitor phone capture or fabricated contact exists. Manual
   copy stays secondary and never replaces automatic copy on account activation.
2. GIVEN any of the five interface languages WHEN preparing a message THEN
   its greeting, short question, quantity/request labels and closing match that
   language; product names/options/quantities/business name remain literal and
   every selected item has its canonical public product link. Switching language
   refreshes the draft without losing selections.
3. GIVEN a social-account click WHEN clipboard succeeds THEN copy that draft
   before opening the account. WhatsApp and Telegram additionally receive encoded
   draft text; SMS receives its supported message body. Profile browsing is
   separate and does not copy inquiry text. Never claim
   that an external message was sent. A blocked popup/open failure retains the
   visible draft and a usable destination link. Clipboard denial offers selection
   and manual copy rather than false success.
4. GIVEN no configured account WHEN preparing a message THEN offer optional
   message copy without inventing destinations. S118 supersedes disabled demo
   inquiry buttons: explicitly owner-approved demo WhatsApp/Telegram/SMS contacts
   may launch supported draft links; residual fake contacts remain blocked. Absent
   channels remain absent. Real businesses retain active configured contact links.
5. GIVEN an owner dashboard WHEN loaded THEN primary navigation, cards and
   metrics do not advertise incoming business inquiries. Retained private history
   remains tenant-scoped. Transport chat, private owner support, staff assignment,
   replies and notifications remain available as before.
6. GIVEN web desktop, phone or native WHEN browsing Market/About/account setup
   THEN consistent natural-language copy explains a digital showroom for varied
   businesses, organized offerings and direct social contact, with no promise of
   a Suqpage business inbox, automatic sending or checkout.

## Test plan, evidence and rollout

### S118 — usable contact choices and showroom-scoped lists (ready)

L1 UI plus FE-041/FE-053 local persistence; BE-055/DEP-045 safety remains.
Tena Food Kitchen initially has reserved WhatsApp/phone and no Telegram. The
owner explicitly authorizes all marked demos to use the corrected owned phone
+19528552202 for SMS, WhatsApp and explicit Telegram phone, superseding the earlier
fake-phone rule for those three fields only. Real businesses/private login aliases
and other public contacts remain unchanged. DEP-045 governs the exact operation.
Master §§5,8–9,13,15,18–19,22 and the S113 floating-selection statement are affected.

- GIVEN real configured WhatsApp/Telegram/SMS WHEN selected with a valid current
  product/list THEN automatic copy precedes the supported recipient/draft launch;
  Copy remains optional. No destination message is sent automatically. Missing
  contacts are omitted, private contacts never substituted, clipboard/open failure
  retains selectable draft and honest feedback. Validate provider links against
  primary documentation; no external messages are sent in tests.
- GIVEN a marked demo with an explicitly approved destination WHEN its inbox
  choice is tapped THEN copy/prepare the same draft and open the supported link.
  Server projection approves each method only when its effective public value
  matches nonsecret operator setting `SUQPAGE_DEMO_INQUIRY_PHONE`. No hardcoded
  UI/domain number, inferred trust from arbitrary digits or private fallback.
  Missing/invalid configuration fails closed for demo inbox destinations; real
  businesses do not depend on it. Only the separately approved public profile/site
  examples below are exempt; residual fake contacts stay protected.
  Telegram supports a username or explicit +international phone; never interpret
  an arbitrary invite hash as a phone. Native/web validation agrees, and account/
  privacy restrictions still apply. No automatic sending or delivery promise.
- GIVEN TikTok/Instagram/Facebook accounts WHEN browsing THEN show ordinary profile
  links in the business header/footer, outside the composer. Opening a profile
  does not copy an inquiry or imply an inbox.
  The owner also authorizes all marked demos to use TikTok `@tiktok`, Instagram
  `@instagram`, Facebook `facebookapp` and website `https://example.com/` as
  examples. These are provider-owned/profile examples, not demo-business accounts
  or endorsements. Server policy approves only exact matching example values;
  arbitrary fake profiles/sites remain blocked. No private login/contact change.
- GIVEN a visitor on a business/product page THEN its floating inquiry action
  counts only that business's saved canonical selections; Market/Featured/About/
  account pages never display a saved-business list launcher. Transport/support
  are preserved. See FE-041 S118 for per-business persistence and direct inquiry.

Test actual components/clipboard/opener ports, A/B navigation and fresh catalog
rehydration, denied storage/copy/open, all five languages, desktop/phone/Expo
captures before visual approval/full gates. Native device remains a separate
gate. No direct Suqpage business inbox, checkout, provider or schema changes.

Focused domain/HTTP regression and local browser workflows, five-language catalogs,
typechecks and desktop/phone screenshots precede explicit visual approval.
Full check/release/acceptance and a scoped commit follow approval, per AGENTS.md.
BE-055 covers stale-client denial and preserved history. No migration is needed;
rollback restores the compatible previous application. Deploy web/API before a
replacement Android build so stale apps cannot create retired inquiries.

## S118 locally verified evidence — October 17, 2026

The current focused run passes 92 combined tests and 17 localization tests, with
1,574 messages in each of the four non-English catalogs; both typechecks pass.
Contact-specific coverage includes `test-demo-inquiry-policy.ts` (4), actual web
composer/cart tests in `test-floating-inquiry-web.ts` (7), controlled actual Expo
components in `test-contact-handoff-native-ui.ts` (3), product/message tests (10)
and native link-policy tests (6). These prove automatic copy before the three
supported inbox launches, encoded drafts, denied-copy/open fallbacks, no copying
on ordinary profile taps, and inert unapproved/fake demo contacts. Clipboard and
opener ports are controlled; no destination message or remote account access is
claimed. The historical capture script was updated and syntax-checked, not run.

DEP-045's two local corrections cover all 67 marked demos, with owned message
destinations and the exact official profile/site examples above. Read-only
verification receipts at `.local/contact-workspace-s118/demo-contact-verified.json`
and `demo-profile-examples/demo-profile-verified.json` confirm idempotence,
protected data and immutable history; the private reviewer remains unpublished.
Actual visual approval, full/release/acceptance gates and commit remain pending.
No hosted correction, web deployment, Android build or installed-device pass is
established by these local tests and operations.


## Focused local evidence — review pending

- `npm run test:product-inquiry`: 9 product/message/readiness tests, 2 retired
  adapter tests and 2 browser clipboard failure/cleanup tests pass.
- `scripts/test-mobile-api.ts`: retained history, scoped owner mutations,
  foreign-product denial, support and buying/transport compatibility pass.
- `scripts/test-live-transport.ts`: live replies, assignment, capacity, private
  notes, token isolation, end/history/resolution/reopen pass unchanged.
- `scripts/test-launch-clarity.ts` and `scripts/test-self-service-publication.ts`:
  real first-publication social contacts, tenant scope and atomicity pass.
- Both typechecks, 1,474-message localization, 196-spec validation, narrative,
  prepared listing/campaign and PWA contracts pass. Whitespace check passes.
- `.local/social-contact-s105/screens/evidence.json`: final stable-source 32
  desktop/phone web/Expo states; real local HTTP denials leave inquiry/event counts
  unchanged. All five social destinations are isolated externally by Playwright;
  no messages are sent. Empty-account/demos and denied-copy/blocked-popup paths
  pass on both clients. Test fixtures/identities are removed.
- `.local/social-contact-s105/copy-screens/`: 74 shared-copy language/layout
  states pass. No installed Android, provider publication or production rollout
  is claimed. Visual approval, full gates and scoped commit remain outstanding.


## S106 correction and regression plan

The previous S105 captures do not approve removed contact fields or changed
publication rules. Restore those before further review. Regress the reported
/@demo-aloe-field-care?product=74&ref=discovery URL, full web/native setup fields,
automatic copy on social activation without a preceding manual-copy click, and
optional manual copy. Preserve privacy on demos and transport/owner support.


## Historical S106 focused evidence — demo restriction superseded by S118

Owner correction restores original contact configuration and first-publication
rules. `scripts/test-product-inquiry.ts` covers phone-only publication, retained
sample-contact rejection, encoded external messages and all five languages.
`capture-social-contact-workflows.mjs` supports an explicit local output/locale
scope: 32 five-language states plus 18 final targeted states pass, including a
real native owner login/edit screen with all eight fields. Social taps overwrite
the clipboard without prior manual copying, including the selected-cart footer.
Manual copy remains optional. Demos display configured choices disabled; no fake
contact opens. The reported URL passes network-loss/reconnection without runtime
errors. Evidence lives under .local/contact-repair-s106/. Earlier S105-only
field/publication restrictions are superseded. Full gates and actual visual
approval remain pending; no deployment or installed-device pass is claimed.
