# Launch demo workflow audit — 2026-09-23

Scope: unfinished behavior and disconnected workflows, including local behavior.
The intended presentation is suqpage.com. This audit distinguishes proven paths
from untested providers; it does not treat deployment lag as a workflow defect.

## Findings and corrections

| Finding | Correction | Evidence |
|---|---|---|
| Featured claimed TikTok Live without a configured broadcast destination | Show schedule status and no watch action when the URL is absent | FE-033; clock browser capture at 1440/390/320; configured-provider branch retained, not newly browser-tested |
| A lost support response could create a second conversation/message on retry | Prepare an HttpOnly token; serialize conversation creation; retain the request key through retry and reopening; discard duplicate staged attachments | BE-018/FE-019; isolated PostgreSQL concurrency, replay, expiry and isolation regression; actual browser UI plus real route handlers with transport failure injection |
| Support initialization failure had no explicit recovery action | Offer Retry and keep Send disabled until the session is ready | Same support browser regression |
| `gras` ranked Farm Grass with Dirt on page two | Prioritize original query words in titles over description/plural-variant matches | BE-040; failing-before/passing-after regression, spelling/pagination/performance checks and browser paging |
| Phone search controls crowded out products | Compact search, optional Filters, paging below independently scrolling results | FE-042; all five languages, desktop/390/320 and accessibility checks |

Requested copy/display refinements also implemented locally: removed the redundant
Ethiopia Market logo caption and changed public/dashboard clocks and admin time
controls to AM/PM. Schedule timestamps, timezone and submitted machine values are
unchanged. Unit tests cover all 1,440 input round trips and noon/midnight.

## Completed workflow checks

- Disposable local business: account/workspace creation, private image/logo
  uploads, city selection, location save, product creation, initial publish and
  immediate live edits. No retired approval flow is required.
- Staff: product options and visibility save/reload; hidden products reject
  inquiries; owner/admin destinations and retired-route redirects behave correctly.
- Customer: actual product option selection → Inquire → Send on Suqpage → phone
  → Send → success → persisted inquiry with the selected option in the owner inbox.
  A separate API replay check confirms duplicate suppression.
- Support: normal assignment/capacity, client and anonymous access boundaries,
  private attachments, replies, expiry, close/reopen/reassignment. Failure injection
  proves one conversation and two messages after lost opening/reply responses
  and manual retries, including reopening after the lost opening response.
- Live public read-only checks: health, Market/Featured/About/login/request/legal
  routes, lotion search, marker/zoom interaction, product image and video toggle,
  single/group inquiry selection, email-only login entry, 390/320 layout checks.
  Fourteen checks passed without JavaScript errors or submitted customer messages.

Reusable evidence: `scripts/capture-launch-wiring.mjs`,
`scripts/capture-support-retries.ts`, `scripts/test-support-retries.ts`,
`scripts/capture-clock-display.mjs`, `scripts/test-clock-display.ts`,
`test:launch-wiring`, `test:self-service`, `test:wiring-audit`, `test:support`,
`test:product-inquiry`, and `test:featured-schedule`.
Typecheck, catalog freshness, localization safety tests and 153-spec validation
pass. Private captures stay ignored under `.local/demo-review/` and
`/tmp/suqpage-launch-review`; no private dashboard screenshots are published.

## Remaining limits

- FE-049 completion is verified locally: 982 catalog entries per language, explicit
  fallback coverage and 85 public/owner/admin browser checks pass. Technical and
  legacy/design terms, plus unknown provider error details, retain English. No
  native-speaker review is claimed.
- Hosted OTP email delivery and real hosted authenticated sessions were not
  exercised. Local browser sessions were test-issued, not delivered by email.
- Demo social destinations and phone numbers are examples as previously approved.
  Handoff URLs and prepared text work; actual receipt by WhatsApp/SMS/Telegram is
  not established. Video embedding/toggling was checked, not external playback.
- Support failure testing uses the actual UI, route handlers and isolated database,
  with intercepted HTTP transport to simulate response loss. External notifications
  were disabled. Normal backend permission/attachment tests are separate.
- No new claim of exhaustive coverage or production performance. Prior combined
  live phone-map gesture verification limits remain; this pass verifies narrower
  marker/zoom and responsive states.
- The owner subsequently approved completion and publication. Full check, release
  and production-mode acceptance are running; publication remains pending. No
  hosted configuration change or schema migration is needed.
  The existing untracked `deno.lock` remains untouched.

Rollback for these refinements is application-code rollback; no schema migration.
Never delete persisted conversations/messages to undo a UI change.


Follow-up verification found and fixed one further workflow defect: opening a
product directly allowed an early inquiry-list click before restoration finished.
The product actions now wait for readiness. Twelve immediate direct-link
selection/reload repetitions pass; language-switch inquiry persistence also
passes. FE-041 and scripts/capture-product-ready.mjs retain the regression.

Search interaction verification also exposed editable input before hydration.
Search controls now wait for handlers; immediate typing and rapid-query/back
regressions pass on desktop and both phone widths. This is a real readiness
fix, separate from replacing the test's unbounded map network-idle wait.
The disposable operations database disconnected during initial startup; one
controlled rerun passed all privacy/integrity/restore assertions. No product
backup/restore code or assertions were weakened.
