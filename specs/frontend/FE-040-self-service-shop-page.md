---
id: FE-040
title: Simple owner-controlled business profiles
status: in_progress
related: [FE-066, FE-060, BE-045, FE-056, FE-054, FE-046, FE-044, FE-041, BE-031, FE-038, BE-032, DEP-030, ADR-0018, FE-042, FE-043]
owners: [product, frontend]
last_updated: 2026-09-21
change_level: L2
---

# FE-040 - Simple owner-controlled business profiles

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

Page setup currently requires staff intake, design, client approval and manager
publication. Suqpage owners need a small understandable editor, with optional
staff assistance, rather than the staff recipe/studio interface.

## Scope and contracts

The local standard-page implementation supports private profile editing, explicit save,
current catalog preview, owner-managed assistance, and owner publication for
existing active pages. The owner's latest direction makes this same profile the
default for every public business page and regular catalog preview. Without an
owner publication it renders canonical catalog content, not an old custom design.
FE-042/BE-033 add first-listing review and private new-tenant products. The local
implementation is enabled by default; visual approval and rollout remain pending.

- One fixed profile serves consumer-facing retailers, home sellers and businesses
  that make or grow products. There are no category templates, layout builders,
  editable component recipes or duplicated business-name fields.
- Owners edit one About description and an optional YouTube business video.
  Existing About takes precedence over the legacy introduction; intro-only
  profiles use that text as fallback. The editor shows that effective text in
  one field. Explicit editing replaces the legacy intro fallback too, so clearing
  the field truly removes the description. Untouched records remain readable.
  The video may show the business or its process; neither is required.
  Products retain their own images, videos, options and inquiry-cart behavior.
- The hero image is the video poster. One play control loads the privacy-enhanced
  player in the same frame only after visitor activation, requesting playback only from that click. No
  player or provider request is made on arrival. Without video it is
  an ordinary image; without an image video gets a neutral play surface. Without
  either, omit the media space. No media-switch toolbar.
- Logo/name and one About description sit directly below the media. No separate
  intro, About heading/tab or trailing business section. Legacy coverStyle values
  stay readable but no longer select layouts or appear in the editor.
- The standard profile is deliberately designed, not a stock banner/card-grid
  template. Keep the real cover recognizable, give the business name a clear
  visual hierarchy, and use unframed image-led product listings with restrained
  orange/charcoal accents. No fabricated ratings, trust badges or seller claims.
- Product sections use compact navigation and filtering; whitespace supports
  browsing rather than placing the catalog below an oversized introductory area.
- Products and inquiry cart use compact sticky navigation below business
  identity. The default description is a short excerpt; Read more reveals full
  text in place, with bounded scrolling for long content. Expansion may move
  products; starting video must not. Sponsor names remain readable.
- Preview reuses the existing product/inquiry behavior but not the generated
  design-manifest pipeline. No made-by-the-seller claim is inferred from category.
- The profile preview can open product details, select options and try the cart.
  It never sends an inquiry, opens a contact handoff or persists a visitor cart.
- Cover images have an explicit Upload image button opening the native file
  picker on desktop and phones, separate from existing-image selection. JPEG,
  PNG and WebP up to 5 MB are accepted. Cancel/invalid/failed uploads leave the
  selected cover and unsaved text unchanged; retrying the same file works.
- Uploading replaces the preview cover only after private storage succeeds.
  Save draft persists its authorized reference; reload shows the same image.
  Upload progress disables conflicting save/cover changes, not navigation.
- Save changes only the private draft. Unsaved edits are visibly distinguished
  from saved state; failed/stale saves retain form values.
- Desktop offers editor and preview; phones use predictable Edit/Preview views
  without duplicate app navigation or horizontal overflow.
- The owner editor occupies the mobile Page destination. FE-042 retires custom
  projects from all menus and endpoints. Draft inputs are disabled until
  hydration completes, and the mobile save toolbar remains reachable on scroll.
- The owner can enable/disable team assistance independently of draft edits.
  Staff see attributable delegated work, never owner consent controls.
- Draft editing is enabled unless SUQPAGE_OWNER_EDITOR_ENABLED=0 explicitly disables
  it. Hosted rollout still requires DEP-030 approval. Shared
  rendering does not rewrite custom-design history, products or business records.
- Suqpage is the visible platform identity, including navigation, forms, support,
  metadata, email templates and installed-app assets. Its shop/map mark and
  wordmark retain orange, charcoal and white. Tenant names and logos remain theirs.
- Public copy welcomes shops, home sellers and businesses selling products,
  whether they make, grow or resell them. It does not claim certification,
  payments, delivery guarantees or that every seller produces its own inventory.
- Map and Featured cards use the current published profile cover where present,
  otherwise the canonical hero image. Private later edits never leak into cards.
- Infrastructure IDs, existing domains, provider configuration and historical
  media references are not renamed as part of visible branding.

## Scenarios

### S3a owner publication controls

- Existing active-page owners see Save draft and a separate Publish action.
  Publish is unavailable for unsaved/invalid content, pending upload, or a draft
  already matching the current publication. A confirmation names the page and
  makes the public change explicit. Staff do not receive publication controls.
- Show private draft and public publication status separately. Offer View page
  only for an active public page and Restore previous when a publication exists.
  Restoration requires confirmation; it does not discard the private draft.
- Failures preserve edits, the current public page and navigation. A stale
  publication asks the owner to reload instead of retrying against a new version.
- Public profiles keep their Products/Cart bar reachable on scroll below
  Back to Market. They do not inherit the managed-page floating inquiry button
  over the product grid. Restoring the baseline keeps this same shared structure.
- Draft/inactive businesses continue editing privately; a concise pending-review
  status replaces Publish. First listing review and new-seller products follow
  S3b/S4. Do not display a nonfunctional approval action.

```gherkin
Scenario: Owner prepares a business profile
  GIVEN an authenticated owner and their own tenant
  WHEN they edit and save a private business profile
  THEN preview shows the saved poster, description and public-contact preview
  AND the live page, catalog, map eligibility and inquiries do not change

Scenario: Owner chooses staff assistance
  GIVEN the owner has enabled assistance for their tenant
  WHEN scoped staff open the editor
  THEN they can save private changes attributed to themselves
  AND they cannot change consent or publish as the owner

Scenario: A save is stale or access is revoked
  GIVEN a newer saved version or withdrawn staff consent
  WHEN an old editor saves
  THEN it reports a conflict or access denial and preserves the local inputs

Scenario: A retailer uses the same profile
  GIVEN a shop that resells products and a business that makes products
  WHEN their profiles are previewed
  THEN both use the same poster, description, contact and Products structure
  AND product details, videos, filtering and the inquiry cart remain usable
  AND no production story is invented for either business

Scenario: Upload a replacement cover
  GIVEN the owner or a currently authorized staff editor
  WHEN they choose Upload image, select a valid image and save the draft
  THEN the native chooser opens and the uploaded image appears in preview
  AND the same cover appears after reloading
  AND no live business or public media record is changed

Scenario: Every business uses the same page
  GIVEN active businesses with different legacy designs and catalog content
  WHEN visitors open their permanent links or authorized users preview them
  THEN each uses the same business profile structure with its own content
  AND product identities and inquiry behavior are preserved
  AND private drafts are not disclosed by ordinary preview or discovery

Scenario: Platform identity remains consistent
  GIVEN desktop or phone navigation, authentication, a business page or Featured
  WHEN a visitor moves between them
  THEN platform labels and brand assets say Suqpage
  AND tenant-specific identity remains unchanged
```

### S2e video poster and one description

```gherkin
Scenario: Hero image becomes the video poster
  GIVEN a profile with a cover image and controlled YouTube video
  WHEN the visitor opens the page
  THEN the hero image is visible and no video iframe is mounted
  WHEN the visitor activates Play business video
  THEN the privacy-enhanced player loads in the same media frame
  AND the catalog does not shift and no media-switch toolbar appears

Scenario: One description below the cover
  GIVEN a profile with both legacy introduction and About text
  WHEN its public page or preview renders
  THEN only About appears below the business name and logo
  AND intro-only profiles use their existing introduction as fallback
  AND the optional contact area follows products as its own section

Scenario: Owner updates the single description
  GIVEN an existing profile, including an intro-only profile
  WHEN its owner edits or clears About the business and saves
  THEN reload shows that exact new description or an empty description
  AND no separate introduction or cover-style input appears

Scenario: Optional media and long descriptions
  GIVEN profiles without image/video/logo or with maximum-length About text
  WHEN they render on desktop or 390/320 pixel phones
  THEN absent media creates no empty cover section
  AND a compact description precedes products, with Read more only when needed
  AND full text is reachable by keyboard without horizontal overflow
```

### S2f public contact area

A distinct contact section appears on every business page after the entire product section. It is separate
from the cover/identity/About area, with its own heading and visual surface.
Show only provided public phone, email, HTTPS website and supported social handles.
Social/website links open a labelled new tab with safe rel attributes; phone/email
use native actions. No private notification/account details are inferred. The
editor labels this optional group Public contact details and explains that these
fields become public only on publication. Preview permits testing disclosure
layout but does not open contact handoffs. Missing direct contacts omit only their links. The section always offers a
selection-aware inquiry action, or Explore products when nothing is selected;
preview keeps the existing non-sending selection behavior (FE-041).

```gherkin
Scenario: Contact a business using provided details
  GIVEN a business with explicitly published contact details
  WHEN a visitor opens its page
  THEN labelled contact/social links appear in their own section after products
  AND unavailable methods, notification email and private onboarding data are absent
```

```gherkin
Scenario: A business has no direct contact details
  GIVEN an active business without public phone, email, website or social handles
  WHEN its page is opened
  THEN its standalone contact section still appears after products
  AND Product inquiry opens the existing inquiry drawer
  AND no direct contact details or destinations are fabricated
```

## Quality impact

Tenant-bound reads and writes, same-origin requests, no private data in shared
caches. Visible labels, keyboard controls, focus-visible states and 44px touch
targets. Bounded plain text/media only; no external code or automatic translation.
Preview loads one renderer and uses deferred values for expensive updates.

## Test plan

- Focused domain/service tests cover ownership, scope, consent, stale saves and
  absence of live/catalog writes.
- Desktop, 390px and 320px browser tests cover editing, preview and overflow.
- Owner visual approval precedes full release gates; see checklist S2a/S2b.

## Local checkpoint evidence

The owner superseded the two-layout Shop checkpoint with the single-profile
direction on 2026-09-13. Fresh `test:owner-page` (19 tests),
`test:owner-page:postgres`, `test:owner-page:visual`, typecheck and existing
renderer checks passed. Desktop, 390px and 320px screenshots were inspected and
are listed in the active checklist. The browser test exercises real local
Supabase identity and app/database saves; third-party YouTube responses and one
stale-save response are stubbed and are not hosted-provider verification.
S2c additionally verifies native desktop/phone file choosers, actual local private
Storage upload and save/reload, anonymous image denial and invalid-upload
preservation. S2d replaces the rejected basic styling with a visible cover,
logo/name identity, unframed products and two-column phone browsing. Updated
captures are in the checklist. New retailer demo records remain S6.
S3a verifies owner confirmation, cancel/focus return, publication at the same
handle, current-cover access, private later edits, stale-publication rejection,
mobile restore and a reachable section/cart bar without the legacy floating
inquiry control. Public desktop/390/320 screenshots were inspected. Typecheck,
PostgreSQL integration and public/editor browser checks pass locally.
Visual approval and full gates remain pending, so this spec
stays in progress. Nothing was deployed.

## Rollout and rollback

DEP-030 gates the opt-in draft editor. Disable the gate to remove its routes
without changing retained drafts. Public pages still use the shared canonical
profile when owner publication is disabled. Roll back the release to restore the
previous renderer; no content or history migration is required.

## Readiness

The draft checkpoint's scope, permissions, error paths, tests, privacy and
rollback are agreed. Publishing and wider rollout remain later checklist steps.

S2e readiness: the newest instruction selects the image-as-video-poster and
single-description layout, superseding the hero switch. Existing storage remains
compatible. Focused geometry, keyboard, video and description-save tests precede
explicit visual approval.

Latest S2e/S2f evidence (2026-09-14): poster playback geometry, one-description
save/clear/reload, optional/long content, public contacts and preview safety pass
in the real local owner browser workflow. Nine profile accessibility scans and
21 cross-page states pass at desktop/390/320; 22 domain/security cases, local
PostgreSQL and typecheck pass. See the checklist for screenshots, fixture limits
and pending visual/full-release gates. Earlier layout evidence is superseded.

S2f placement correction: contacts are now a separate final section after the
product grid. `capture-suqpage-redesign.mjs` asserts sibling order (and omission
when contacts are absent), captures desktop/390/320 contact states and runs the
focused accessibility scan. The 21-state matrix passed locally; see the checklist.

## S2g — Public and private contacts

Every business has distinct optional public email/phone storage, used in the
contact area when no owner-published contact object exists. Explicitly empty
published contacts remain empty. Account settings show the existing sign-in email
and a private account phone editable by the signed-in user only. Account phone
is labelled private and unverified; saving it does not alter public contacts or
identity. All roles can maintain their own account phone. Signup labels the
phone as private. Missing real values are requested, never invented.

```gherkin
Scenario: Account and public contacts remain independent
  GIVEN an owner with different account and public contact details
  WHEN they save their account phone
  THEN only their private account phone changes
  AND their sign-in email and public page remain unchanged
Scenario: Legacy page has public baseline contacts
  GIVEN a page with canonical public email and phone and no contact publication
  WHEN a visitor scrolls past its products
  THEN both contact links appear in the standalone contact area
```

Focused evidence planned: scripts/test-account-contacts.ts, scripts/test-signup.ts,
scripts/test-account-contacts-postgres.ts and scripts/capture-account-contacts.mjs.

S2g local verification (2026-09-14): migration 41 and repeat apply passed after
protected loopback backup. Account/signup/domain and PostgreSQL privacy tests pass;
66 anonymous page responses exclude private contacts. Three account browser
workflows/accessibility scans and the 24-state/12-profile-scan public matrix pass.
Approved fictional contacts populated for 66 demo pages and 47 demo users, retaining
account emails. Two non-demo account phones require owner input. Evidence and
screenshots: docs/SUQPAGE-TRANSITION-CHECKLIST.md S2g. Visual approval, full gates,
commit and hosted rollout remain pending.

## S2h public experience revision

FE-041 now governs the shared profile's linked inline product view, simplified
public features/unit presentation, single/group inquiry choice, progressive phone
form and search panel beside the persistent map. It supersedes earlier public
modal, production-fact, persistent empty-cart and map-replacement statements here.
Retained data, canonical server security and legacy recovery contracts remain.
Implementation/evidence tracked in docs/SUQPAGE-TRANSITION-CHECKLIST.md S2h.

## New-workspace starter override (FE-046 / BE-039)

The local candidate now initializes every newly created private business with
complete editable examples: page/media/contacts, location and three offerings.
This supersedes empty initial presentation defaults only; existing page records,
cleared fields and true account identity are preserved. Samples are labelled and
private preview handoffs remain disabled. Full evidence and pending visual/release
gates are recorded under FE-046 and checklist S8a.

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

## FE-054 local accent addition

The optional Page color picker is available only in Page editing, alongside the
full live storefront preview. Signup retains the default color. Custom colors
use visual selection without requiring a code or separate Apply action.
Bounded accents personalize the fixed profile; no new layout/tint controls or
product-photo tint. Validated business-profile JSON, atomic owner publication,
legacy defaults and consented staff privacy retain the existing contracts.
See FE-054 for focused tests/captures and pending rollout.

S106 / FE-066: preserve all eight original public contact fields and links.
First publication retains its original contact rules. Only public business-inbox
submission/navigation is retired; transport and owner support remain.
