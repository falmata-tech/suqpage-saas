---
id: BE-044
title: Native API and session boundaries
status: in_progress
related: [BE-032, BE-048, BE-047, BE-045, FE-056, FE-054, FE-053, FE-026, DEP-042, BE_BASE, BE-018, BE-040, ADR-0023, BE-046, BE-050, BE-051, BE-052]
owners: [product, frontend, backend, security]
last_updated: 2026-10-07
change_level: L3
---

# BE-044 — Native API and session boundaries

## S88 — staff identity denial throughout mobile

Ready security/identity refinement. GIVEN a verified admin/operator/team-member
bearer WHEN accessing session, signup or any private native route THEN reject
with 403 before side effects. Load current role from the server for every call,
including an identity promoted from owner to admin; stale JWT/client role claims
cannot bypass this. Public guest discovery/transport remains available anonymously.
GIVEN a linked identity without a current access profile THEN deny authentication;
legacy user.role must not promote a missing staff profile into administrator access.

GIVEN mobile email-code or restored-session authentication THEN validate the
application session before admitting owner screens. Staff rejection signs out
only that local mobile session, removes persisted owner credentials/private
cache and shows clear website guidance; it does not revoke the separate web
session. Verification runs outside the Supabase Auth callback to avoid deadlock.
GIVEN a transient validation outage THEN retain retry authority without admitting
an unverified new session; a retry needs no second OTP. Existing owners and new
unlinked verified identities retain their signup/owner flows. No Auth config push.

Test all staff kinds/current-role changes, normal owner/setup, malformed/expired
tokens and private denial; browser code/restored-session rejection and cleanup,
validation retry/failure, and uninterrupted web staff access. Physical native,
hosted API/mobile rebuild and full gates remain separate release evidence.

## Problem

Visitors and business owners need native access to Suqpage without exposing staff management.

## Scope and contracts

Versioned `/api/mobile/v1` routes expose public discovery/featured/catalog and
explicit owner workflows. Reuse existing application/domain services and PostgreSQL
transactions; never invoke cookie-bound Next server actions from native screens.
The server verifies Supabase access tokens with the configured provider, maps the
verified subject through auth_identity_links, and reloads current application role
and tenant for every private call. Client IDs/roles/tenant values confer no authority.
Unlinked verified identities may create their own workspace via the existing signup
service. Private routes accept bearer credentials only and never cookie fallback.

Supabase public URL/key are device configuration, never service-role credentials.
Device refresh tokens live in SecureStore; browser preview keeps sessions in memory.
No application database driver belongs in the mobile client. The owner permits
MapLibre’s internal SQLite tile cache only; application data stays in PostgreSQL. Server errors hide stack/SQL.
No wildcard credentialed CORS. Native requests need no CORS; browser development
origins are explicit allowlisted loopback origins only, disabled in production.
Public read APIs have bounded query/body sizes and rate limits. Owner/public write
APIs retain existing rate, tenant/version, idempotency, file validation and publication
checks. Private responses are no-store. Public catalog DTOs exclude account contacts,
internal drafts, staff notes and user/password/auth data.

Buying session authority is a separate opaque token in SecureStore, transmitted in
an explicit header to the versioned buying route; its own scoped reference is checked
for messages/close. It is never a user bearer identity. Existing historical notes
remain private. Owner support uses verified owner authority. Native support attachment upload
and retrieval are pending parity work and must enforce scoped access before release;
the initial preview supports text messages only. New API endpoints do not loosen existing browser origin checks.

## Scenarios

GIVEN forged/expired/foreign provider tokens WHEN private data is requested THEN 401.
GIVEN owner A WHEN B IDs are supplied THEN no B reads/writes occur.
GIVEN an admin/staff bearer WHEN owner endpoints are requested THEN 403.
GIVEN public visitors WHEN discovery/catalog is requested THEN only published data
is serialized. GIVEN oversized/unknown writes THEN bounded safe rejection.
GIVEN a request retry WHEN its idempotency key repeats THEN no duplicate mutation.

## Test plan

 provider-verification port tests, real local PostgreSQL integration and
negative HTTP tests in `scripts/test-mobile-api.ts`; no production seed or message
is needed. Existing domain regression tests remain mandatory.

## Readiness

The owner authorized visitor pages and business-owner dashboard, excluding admin
management. Scope, permission/failure contracts, verification and rollout boundaries
are explicit. Implementation may proceed; visual approval and native-device evidence
are required before release claims. Track ordered evidence in checklist S49.

## Rollout

Review focused phone and tablet captures first. Keep this feature in progress until native device checks, required gates and a separate API rollout are verified. No store submission is authorized.

## S50 audit additions

Native owner support attachment reads/writes must reuse the existing support
attachment domain/storage path with verified bearer owner scope, bounded files and
MIME checks. Native conversation DTOs include authorized attachment metadata and
inquiry option snapshots; no bearer/query token in an external download URL.
Regression tests cover cross-tenant attachment denial and persisted mutation reads.
Read and write rate budgets use separate counters: loading owner screens or private
photos cannot exhaust the mutation allowance. Reads remain bounded at 240/minute
and writes at 50/minute per privacy-hashed address. Regression: after more than 50
authorized reads, a valid first save succeeds; exceeding the write budget is denied.
Market DTOs also project the web map's public live/featured flags and nearby group
membership, with no private account or moderation data.
The owner now authorizes release gates and tester-build preparation; production API
rollout still requires passing release/backup/rollback/target checks in DEP-042.

S50 multipart business updates delegate to saveOwnerBusiness with a staged,
tenant-owned logo reference. Reject unknown/duplicate multipart fields, bound file
bytes and discard failed uploads. No arbitrary client logo reference is authority.

## FE-054 additive accent projection (local)

Signup admits optional validated accentColor. Profile and public/private Shop DTOs
carry it; Shop also projects the existing safe business logo path for its accent
surround. No API version bump: old clients may omit the field, preserving a saved
choice; explicit empty resets. Existing auth/tenant/publication guards remain.
Mapped evidence: scripts/test-storefront-accent.ts and test-mobile-api.ts pass
against isolated PostgreSQL; release and physical-device validation remain pending.

## S54 — Market result boundary

GET market always selects the existing product/service projection before SQL
counts/pagination, including callers passing legacy all/businesses types. Business
map/nearby DTOs and query/category/place eligibility remain unchanged. No migration
or auth change; existing response shape remains compatible. Covered by the public
mobile-boundary regression in scripts/test-discovery-pagination.ts and focused
HTTP/browser captures in scripts/capture-offering-results.mjs (FE-030/FE-042).

## S57 transport and delivery assistance — in progress, 2026-10-05

Master §3/§4/§5/§19 support and mobile statements affected. This supersedes the
receipt-only transport entry and public buying-assistance entry. Suqpage retains
its own visual design. GIVEN a visitor WHEN providing pickup, destination, name
and phone THEN create a transport conversation and show live messages/status.
Optional goods details aid dispatch. Staff arrange carriers externally; there is
no driver/provider account, booking guarantee, payment or commission ledger.
GIVEN the transport queue WHEN staffed THEN existing least-loaded capacity and
scope rules assign only eligible agents; managers can assign/reassign and staff
can claim, explicitly reply, save private carrier contact and add internal notes.
GIVEN historical notes or handoffs THEN never expose them to visitors; only
visitor messages and explicitly visitor-visible staff replies are public.
GIVEN ended chats THEN preserve contact/history for phone follow-up; distinguish
ended from staff-resolved, retain reopen and private notes. Token/category scope,
expiry, rate limits, idempotency, text bounds and attachment denial remain enforced.
Old buying conversations and their API remain compatible, with no new public
buying entry. Reuse shipment_observation records/transport queue and existing
origin/destination/resolution/visibility columns. Migration 59 extends the existing
closed-only resolution constraint to transport as well as buying, without touching
history. Apply before rolling out this code; rollback retains the additive schema.
English, Amharic, Afaan Oromo, Somali and Tigrinya copy is authored for the actual
UI purpose; user content remains unchanged. Focused support/transport/channel
security tests, mobile API tests and phone/desktop UI review are required.

S57 focused evidence (local): search suites and test-multiple-locations.ts pass
multi-region/city union, overlap deduplication, exact/fuzzy pagination, category/
query intersections, legacy and repeated URL parameters. Support suites plus
test-live-transport.ts pass both APIs, token/queue/tenant isolation, assignment
capacity, retry, private notes/carrier data, chat ending/resolution/reopen, and
bounds. Migration 59 is applied locally only. capture-multiple-locations.mjs
records seven web and six native-browser states; capture-live-transport.ts,
capture-transport-dispatch-staff.ts and capture-mobile-transport.ts exercise real
handlers and staff server actions at desktop/phone sizes. Temporary staff fixtures
are removed; controlled map tiles and isolated API fixtures are documented in
scripts. Evidence: .local/multiple-location-review/ and .local/live-transport-review/.
Both typechecks and localization checks pass. Owner visual/native-speaker review,
physical device tests, build/full release gates and deployment remain pending.
