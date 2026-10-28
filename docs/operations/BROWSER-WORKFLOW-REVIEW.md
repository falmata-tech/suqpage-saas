# Actual Chrome workflow review

S120 makes this a recurring requirement for AfricMade UI, UX, layout and navigation
work. Follow [AGENTS.md](../../AGENTS.md), the active task checklist and the
controlling specs. Review the affected tasks, roles and platforms and record an
agent-owned visual pass/fail decision before full checks; then follow the
existing release workflow. This
guide adds no deployment permission and preserves the existing emergency-fix
exception. A screenshot is supporting evidence, not a completed workflow test.

## Prepare a bounded review

1. Record the spec/task IDs, changed source, local URLs, affected roles, expected
   outcomes and planned writes. Verify the running process, repository and local
   API/database target independently. Never infer AfricMade identity from the IDE
   tab or an open browser. Do not touch Loadgistic or hosted systems.
2. Use actual **Google Chrome**, preferably a visible Chrome session controlled
   through its existing authorized browser/CDP connection. Use isolated browser
   contexts or profiles for each participant. Keep existing user tabs, logins
   and unrelated processes intact. Record browser/version and viewport. Another
   Chromium browser or a component harness may supplement this check; describe
   that evidence accurately rather than labelling it actual Chrome.
3. Use existing authorized local role accounts and clearly labelled disposable
   fixtures. Bound mutations to those records and retain protected before-images
   or existing fixture recovery procedures. Use read-only inspection for real
   customer records. Do not create privileges, reset accounts or modify unrelated
   records merely to make a browser test pass. Keep tokens/cookies in memory;
   never print credentials, customer messages or contact details in test output.
4. Coordinate one quiet preview/capture slot with other agents. Freeze the
   relevant source during a journey; record the source revision or hashes and
   any controlled test clock, worker or network conditions.
5. Record page crash/close, context close and browser disconnect with the current
   stage and whether teardown or a bounded deadline caused it. An early close is
   a failed journey, even without a console error. Temporary test windows may
   close after completion or failure cleanup; retain the receipt that distinguishes
   those cases. If visible Chrome exits unexpectedly, preserve that failure and
   classify one bounded retry before changing the harness. Accurately labelled
   installed-Chrome headless checks may continue independent work; they do not
   prove the visible-window issue fixed. Do not kill shared Chrome processes,
   unrelated user tabs or preview servers as test cleanup.

## Exercise the task as its user

For interface changes, also follow the [AfricMade interface-design skill](../../.agents/skills/africmade-interface-design/SKILL.md). At affected phone widths, inspect real active-language labels and content—not just English—with equal attention to meaning, fit and whether the main task stays visible. Catalog/key parity is not evidence of natural wording; record when qualified language review remains outstanding.

Cover every affected role below; an unaffected role need not repeat an unrelated
workflow. Shared navigation changes require the affected role entry/exit paths.

| Surface | Required coverage when affected |
| --- | --- |
| Visitor | Anonymous discovery, business/product details, selection/contact handoff, transport intake and returning to the previous view. |
| Business owner | Sign-in/setup, Account/task navigation, private preview, edit/save/cancel/publication, and owner Support/Transport. |
| Support/transport agent | Own queue, case/assignment context, reply/note, history and return navigation; inaccessible queues/tasks remain denied. |
| Administrator | Business-centered workspace, contextual tasks, staff/queue management and safe return to the originating list. |

- Review affected web tasks at desktop and phone sizes, normally 1440px and 390px.
  Also use actual Chrome on **http://localhost:8082** for affected Expo visitor
  and owner tasks. Staff/admin remain web-only; do not invent mobile management
  screens. Exercise the mobile preview's own navigation and interactions.
- Start through the real entry point. Click links/buttons, type inputs, choose
  filters, scroll and use browser Back plus in-app Back where provided. Direct
  `goto` visits alone cannot prove navigation or restoration. Check list→detail→
  task→return context, reload recovery and deep-link entry when affected.
- Perform applicable Save and Cancel journeys, validation/error/retry states,
  empty/loading states and permission-denied paths. Confirm Cancel leaves saved
  data unchanged, a successful save survives reload, and retry does not create
  duplicate records. Read-only changes require no invented save operation.
- Record raw failed requests, including method, path and stage. When a workflow
  intentionally cancels fetches during navigation, scope changes or hidden views,
  observe each request's AbortSignal reason/timing and fulfilled HTTP headers
  without changing request options or responses. A completed response whose body
  is discarded differs from an unanswered request or timeout. A matching path or
  plausible cleanup function alone does not prove an old cancellation expected;
  preserve that provenance limitation rather than silently filtering failures.
- Inspect the actual task: visible priority, clear labels/current location,
  reachable actions, keyboard focus, phone navigation clearance, overflow and
  long/native-language labels. A button existing below a large irrelevant form
  is not proof that the task is usable. Capture settled states with
  `caret: 'initial'` so screenshot tooling does not inject focus/caret CSS.
- Wait for the application to finish its visible transition before interacting:
  initial client autofocus/ready state before typing controlled fields, and the
  post-Join public Reply composer before sending a visitor-visible message. A
  committed database Join alone does not prove its new RSC UI has rendered. Do
  not skip a missing audience selector or use a still-visible Internal note form
  as a public reply. Verify the saved message's audience as well as its text.
- Expo retains earlier stack screens in the DOM. Scope repeated labels to the
  visible active screen; an unscoped `.first()` may match a hidden predecessor.
- Check console/page errors and failed application requests throughout. After a
  real write, verify the authoritative local API/database state and reload it in
  the relevant user view. For paired chat, inspect both participants, assignment,
  receipt and maintenance outcomes. Keep readback scoped; never expose database
  credentials or customer rows. Browser results supplement automated security,
  role and tenant-isolation regressions; they do not replace those tests.

## Recurring real-user review and physical Android

Treat affected user journeys as part of normal development and release work,
including UI changes that compile cleanly. Walk through the actual interface;
do not replace navigation, typing, validation, loading, Back, Save/Cancel or
paired-participant checks with direct URLs and screenshots. Batch reproducible
findings in one protected task issue list with severity, platform, role, steps,
expected/actual outcome, evidence and retest status before selecting a fix batch.
Keep untested journeys visible instead of declaring the whole app passed.

For requested cross-platform audits, use live web for the current public read
experience and local web/Expo for labelled role fixtures and controlled writes.
Hosted writes remain limited to the owner's authorized scope. Use independent
browser contexts; never disturb ordinary signed-in tabs or another project.

When a physical Android phone is available and authorized, verify the exact
installed package/version/APK digest first. Exercise visitor and demo-owner
journeys through native controls, including real keyboard, Back/gesture return,
category/search state, inquiry isolation, account task navigation, loading/error
recovery and foreground/resume. Staff/admin remain web-only. Device evidence is
separate from Expo and must identify the tested binary; a source fix is not an
installed fix. Resume the existing build/release admission when a new binary is
needed rather than silently reusing an older build approval.

For native-backed controls such as map markers, exercise the installed SDK event
path and measured touch area. Calling a React callback directly does not prove
that an Android tap reaches it; keep that regression separate from device proof.
For sustained phone development, prefer a source-qualified development client
with matching native dependencies and local API/Auth over repeated release builds.
Use Fast Refresh for JavaScript changes; separately verify the final standalone
release, OS integration and production configuration before distribution.

Before every phone interaction/capture, confirm the phone is awake, unlocked and
AfricMade is the actual foreground window. Stop if another app, notification shade
or lockscreen appears. Keep credentials out of captures/output and private demo
records protected; never capture unrelated phone content. Recheck after capture,
wait for settled transitions and retain rejected/loading captures as such. Use
only owned test data and restore test selections/settings when practical. Avoid
automated public OSM tile traffic on native as on web: exercise native map tasks
with an admitted local tile fixture, or record the human-operated provider check
and leave automated native-map coverage explicitly unqualified.

## Map tiles during automated review

Follow [ADR-0016](../adr/ADR-0016-policy-compliant-osm-basemap.md) and
[FE-021](../../specs/frontend/FE-021-geographic-showroom-map-and-daily-featured.md).
Automated reviews must not request real public OpenStreetMap tiles. This includes
headed or headless pan/zoom, reload, resize, language and screenshot matrices, and
any test context with caching disabled. Playwright request routing itself
[disables the HTTP cache](https://playwright.dev/docs/api/class-browsercontext#browser-context-route),
even when the route was added for an unrelated application request.

Before navigation or mounting a map, intercept tile requests in every relevant
browser context and fulfil them from a declared, local synthetic fixture. Do not
fetch public tiles to build that fixture, use `route.fetch()` or continue a tile
request to the public service. Prevent service workers or later catch-all routes
from bypassing the interception. Record the fixture identity, fulfilled request
count and any uncontrolled tile requests; an escaped public request fails the
review. Keep real local catalog/API reads and map gestures intact. Fixture tiles
prove application geometry and behavior, not provider availability or playback.
The bounded helper at `scripts/testing/map-tile-fixture.mjs` supplies this guard
for Playwright contexts; register it after any other context-wide routing and
before opening the page.

A provider smoke check is a separate **human-operated** ordinary browser visit,
with normal caching, the browser's real identity, the required referrer and
visible attribution. Follow the
[OSMF tile policy](https://operations.osmfoundation.org/policies/tiles/). Do not
automate that check, repeat tile probes after a block, add cache-busting URLs or
no-cache headers, or bypass enforcement through a proxy, alternate tile hostname,
rotated identity or IP. Preserve the observed result; fixture success does not
establish that a provider block has cleared.

## Keep the evidence honest

Use the real local application, API and persistence path. Never route-fulfil a
successful application response, inject a saved UI state or call a fake adapter
and report that as an end-to-end success. Component tests with controlled ports
remain useful, separately labelled evidence. Bounded offline/failure injection
can verify recovery; identify exactly what was blocked and retain the failure.

Public map tiles must use the local fixture rule above. Other external media may
be controlled to keep a local test deterministic; record the affected domains/assets
and coverage limit. A placeholder or blocked
video cannot establish provider playback. Do not send real social messages or
notifications to unrelated recipients. Focus emulation can test a visibility
branch; report it explicitly and do not claim real background/OS notification
delivery. Expo in Chrome is a mobile-preview check, not installed Android,
MapLibre-native, device keyboard, TalkBack or push-delivery evidence.

Retain a compact receipt and representative screenshots in the ignored,
access-controlled `.local/<task>/` review directory. Record journeys/assertions,
roles/platforms, source hashes, permitted mutations and readback, runtime/API
errors, unexpected writes, external controls and unresolved limits. Restrict
sensitive evidence to its authorized audience; do not commit raw logs, cookies,
customer data or screenshots containing private records. Link a sanitized
summary from the controlling spec/checklist/traceability.

An assertion failure, unexpected application error/write or missing required
readback makes the receipt fail. Preserve the first result. After one controlled
retry, classify the cause as product behavior, stale fixtures or test
infrastructure before expanding scope; document any corrected harness and
re-verify the affected journey. Do not hide errors, weaken assertions or turn a
mixed receipt into an unconditional pass. Record implemented, focused-tested,
agent-visually-reviewed and deployed as distinct states. Inspect the concrete
local review yourself, record the source-bound pass/fail decision and share the
evidence with the owner. A passing agent visual review admits expensive full,
release, container or remote CI checks without a separate owner sign-off under
DEP-002 S165. An untested or failed affected journey does not pass this gate.
Hosted configuration, signing, recovery and protected-branch actions retain
their separate controls.
