---
id: FE-031
title: Focused client workspace and combined process story
status: done
related: [FE-003, FE-007, FE-009, FE-025, FE-026, FE-030, FE-032, FE-035, BE-008, BE-010, BE-024, BE-028, DEP-011, DEP-023]
owners: [product, frontend, design, operations]
last_updated: 2026-08-14
change_level: L3
---

# FE-031 - Focused client workspace and combined process story

## Problem and outcome

Normal showrooms currently place a standalone business-story section directly
before a process section that already contains the approved process video. The
two chapters repeat the same explanation and make every showroom longer. In the
operations workspace, staff can also lose the active client context because
global destinations and repeated actions compete with the current request.

MirtPage needs one concise story-and-process chapter and one persistent,
task-oriented client workflow from instruction through publication.

## Scope

- The normal showroom order becomes header, hero, combined story and process,
  products, inquiry call to action, and footer.
- The combined chapter explains the business, presents concise process or
  capability steps, and embeds the approved process video when available.
- The AI-facing content schema and recipe brief no longer offer a standalone
  story block or separate story section for normal showrooms.
- Retained valid story-plus-process showrooms render as one combined chapter;
  no destructive database rewrite is required to display the new structure.
- Staff receive one request-scoped workflow navigation for Request, Design,
  Edit, Preview, and the existing review/publication state.
- While a staff member is inside a business workspace, primary navigation keeps
  client destinations together and labels leaving actions explicitly.
- Supporting administration such as team assignment, request history, map
  coordinates, fallback presentation, and sponsor ordering uses progressive
  disclosure so it does not compete with the current client task.
- The discovery profile accepts an authorized booth-image upload through the
  configured media adapter instead of requiring staff to type a storage path.
- A release-readiness audit records public controls, their administrative
  authority, persistence adapter coverage, and any remaining operator-only
  configuration.

## Non-goals

- Arbitrary page sections, client-authored code, automatic publication,
  checkout, destructive revision migration, or changing tenant permissions.
- Moving deployment secrets, DNS, provider credentials, or rollback controls
  into the application dashboard.

## Contracts

- A current normal showroom has exactly six sections: header, hero, one
  `highlights` story-and-process chapter, catalog, inquiry CTA, and footer.
- The chapter body contains approved business context and process framing;
  ordered items contain useful production, preparation, customization, supply,
  or inquiry steps. Default step explanations use the supplied step as an
  action without duplicating its opening verb. The process video appears inside
  this chapter only.
- A normal imported recipe containing a `story` block or a second content
  chapter is rejected with a correction that names the combined chapter.
- Retained managed content may contain a legacy `story` block. At the read
  boundary, its non-duplicated body and optional image are merged into the
  highlights chapter, and its design section is omitted. The source record is
  not rewritten until an authorized draft save or publication persists the
  canonical snapshot.
- The focused editor labels the chapter **Story and process**, edits its body,
  steps, optional image, and approved process video, and exposes no redundant
  standalone-story editor.
- The focused editor owns only revision-worthy showroom work: narrative,
  hero/process/offering media, products, section components, layout, motion,
  palette, and the client-readable revision summary. Business name, logo,
  browser icon, contact routes, live-session settings, and search/share metadata
  are read from Business details and have no duplicate revision controls.
- The hero content block is the editor's single hero-copy and hero-image
  control. Compatibility fields retained in the revision schema are mirrored
  from that block so public discovery summaries and retained renderers cannot
  diverge from the designed hero.
- The focused editor renders a deferred, interaction-disabled showroom preview
  from the current unsaved snapshot below the editing forms. Staff can jump to
  it from the save controls and inspect desktop-width or phone-width output
  without first saving, submitting, or mutating the live showroom.
- Palette background controls keep their paired foreground role readable when
  possible. While a typed hex value or color combination is incomplete or
  fails the design contract, the editor retains the last valid preview, names
  the correction, and disables draft save instead of rendering the public
  unavailable-showroom state.
- Every editable image destination provides an in-place JPEG, PNG, or WebP
  replacement upload, including logo, hero, browser icon, story/process media,
  and offering images. Story/process and offering video destinations accept a
  controlled YouTube URL in place. A successful admission selects the new media
  immediately and updates the unsaved preview.
- Inline images remain private request media until approved publication copies
  selected references into durable public media storage. Controlled YouTube
  URLs persist as normalized provider references; internal recipe asset keys
  never enter a saved revision field that expects a provider reference.
- Request, Studio, Editor, and Preview pages preserve the same business and
  request context. Their workflow control uses stable destinations and does not
  duplicate unrelated platform actions.
- Business-context navigation follows FE-032. Switching business or returning
  to platform operations is visually separated as leaving the current
  workspace.
- Request instructions, revision work, and clarifications remain immediately
  visible. Assignment and audit history remain available in collapsed,
  keyboard-operable disclosures. The discovery editor keeps industries, booth
  media, and plain-language location fields primary while grouping technical
  placement and sponsorship controls as advanced visibility settings.
- Booth uploads accept only the existing sanitized JPEG, PNG, and WebP contract,
  use provider-neutral private server credentials, and save the resulting
  public media reference only after storage succeeds.
- Public behavior has a named owner: showroom content and products use the
  revision workspace; map location, industry, booth, exclusion, and sponsorship
  use Discovery profile; account visibility uses Monthly accounts; support and
  inquiries retain their existing workspaces. Environment and DNS controls are
  documented as operator-only.

## Scenarios

```gherkin
Scenario: Visitor reads one useful business chapter
  GIVEN a showroom has business context, process steps, and an approved video
  WHEN the showroom renders
  THEN one Story and process chapter presents all three
  AND no standalone story section appears above it

Scenario: Retained showroom uses the former two-chapter structure
  GIVEN valid managed content has one story block followed by highlights
  WHEN the public renderer or private workspace loads it
  THEN the visitor sees one combined highlights chapter
  AND the stored retained revision is not silently mutated

Scenario: Staff works through one client revision
  GIVEN an authorized staff member opens a client request
  WHEN they move through Design, Edit, and Preview
  THEN the active business and request remain visible
  AND global operations are separated from the client workflow

Scenario: Staff checks an unsaved edit
  GIVEN an authorized staff member changes content, design, or offerings
  WHEN they open the editor's preview area
  THEN the preview reflects the current in-memory snapshot
  AND the staff member can compare desktop and phone widths
  AND no live or persisted showroom data changes

Scenario: Staff enters an incomplete or low-contrast palette value
  GIVEN an authorized staff member is editing a valid showroom revision
  WHEN the current palette no longer passes its format or contrast contract
  THEN the last valid showroom remains visible in the unsaved preview
  AND the editor identifies the palette correction
  AND draft save remains unavailable until the snapshot is valid

Scenario: Staff replaces media while editing
  GIVEN an authorized staff member is editing a private revision
  WHEN they upload a valid replacement image or add a supported YouTube URL at a specific field
  THEN that field selects the admitted media
  AND the unsaved preview displays it without leaving the editor
  AND publication promotes selected private images through the configured media adapter

Scenario: Staff edits the showroom without changing business settings
  GIVEN Business details contains the current identity, contact, live, and search settings
  WHEN staff edit, import, preview, publish, or roll back a showroom revision
  THEN those current settings are used in the rendered showroom
  AND the revision cannot replace them with stale snapshot values
  AND hero and process media remain editable in the revision workflow

Scenario: Staff needs a supporting administrative control
  GIVEN an authorized staff member is focused on a client request or profile
  WHEN they need assignment, audit, coordinate, fallback, or sponsor controls
  THEN those controls are available under a labeled disclosure
  AND they do not dominate the default client-workspace view

Scenario: Administrator adds a booth image
  GIVEN an administrator edits a discovery profile
  WHEN they upload a valid image and save the profile
  THEN the configured media adapter stores the sanitized image
  AND discovery uses the resulting managed media reference
```

## Quality impact

- Security and tenant isolation: existing request, business, revision, and role
  checks remain authoritative; inline media is request-scoped and unavailable
  to unrelated tenants.
- Data integrity: legacy input normalization is pure and non-destructive; new
  writes persist only validated canonical snapshots.
- Accessibility and responsive behavior: workflow controls and uploads are
  keyboard labeled, touch sized, and bounded at 320 and 390 CSS pixels.
- Performance: one rendered content section is removed; the editor reuses the
  existing preview renderer with deferred snapshot updates and introduces no
  new public query or client-side dependency.

## Test plan

| Criterion | Evidence |
|---|---|
| Canonical six-section output and legacy merge | content, revision-v4, fitness, recipe, benchmark tests |
| Process video remains controlled and chapter-scoped | renderer, YouTube-provider, acceptance tests |
| Staff remains in client context | workspace contract and focused browser tests |
| Unsaved desktop and phone editor preview | revision-editor and focused browser tests |
| Inline image and controlled-video replacement | media, revision, security, and browser tests |
| Business-settings ownership and hero synchronization | recipe, revision, and focused browser tests |
| Booth upload storage and authorization | discovery, media-storage, security tests |
| Responsive showroom and workspace | focused desktop, 390px, and 320px captures |

## Rollout and rollback

The renderer normalization is reversible and does not rewrite retained rows.
Rollback restores the previous renderer, schema guidance, and navigation. Media
uploaded before rollback remains an immutable valid object and its stored path
continues to resolve.

## Evidence

Evidence:

On 2026-08-14, focused domain, recipe, renderer, media, navigation, editor,
palette, type, build, and desktop/phone browser evidence passed. The 10/10
acceptance run proves one combined story/process chapter, in-place media and
controlled-video replacement, business-settings ownership, and the unsaved
desktop/phone preview. A palette regression proves that changing a background
automatically selects a readable paired foreground when possible; invalid
in-progress colors retain the last valid preview, identify the correction, and
disable Save without showing the public unavailable-showroom state. The
complete release and all five jobs in GitHub Actions run `31750355870` passed,
and production deployment `dpl_EPpUwucKvJE18WCckB7RqMq3EFVT` is ready.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Canonical information architecture explicit
- [x] Legacy compatibility and persistence timing explicit
- [x] Tenant, media, responsive, and rollback impacts explicit
- [x] Observable scenarios and evidence mapped
- [x] Focused, acceptance, release, remote, and production evidence passed
