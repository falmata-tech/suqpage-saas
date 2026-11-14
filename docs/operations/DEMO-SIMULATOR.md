# Recurring demo marketplace simulator — implementation inventory

## Full-catalog expansion under qualification (S196)

The requested final target is all64 public demo businesses and all256 current
published products, with the private draft reviewer and real accounts excluded.
The existing three-business cohort remains live until the expanded source and
exact hosted plan qualify. No broad enrollment has been applied yet.

Each coordinated business stage updates every enrolled product through the
ordinary bounded upkeep batch, retaining one final catalog version and normal
per-product audit/idempotency receipts. Deliberate phase offsets retain at least
one usable product. General production, short-window food preparation and fresh-
food batches supplement the original replenishment/harvest/workshop timelines.
The exact owner/provider/product/quantity/unit manifest is protected outside Git;
new products and manual edits are drift, never silent enrollment authority.

Private schema83 adds catalog bindings and the reviewed scenario/request bounds;
it creates no inferred enrollment or Auth identity. The paused worker can admit
at most eight reviewed requests per tick, stopping new admissions after12seconds.
The global minute schedule, at-most-two business stages,2,880 daily stages,
256MiB storage guard and retained-history policy remain. With64 businesses,
normal oldest-due rotation updates each whole catalog about every32 successful
minute ticks; marketplace activity remains frequent across the full set.

Qualification and actual full-manifest rollout evidence belong in traceability
S196. After schema83, pause first and retain a qualified83-compatible build or
roll forward; an82-only application refuses the future ledger.

Checklist S194 and BE-067 / FE-079 / DEP-054 own this service. Three versioned
scenario catalogs publish coordinated example updates through ordinary application
commands. This inventory records supported fields, current operating controls and
the reviewed initial cohort. Exact delivery, test and hosted receipts live in
`specs/TRACEABILITY.md`; controls and identities never belong in public DTOs.

The production contact audit found 65 marked demos, 64 published demos and six
non-demo businesses. Those counts are observations, never an enrollment rule.
New signups omit `is_demo` and receive its database default `0`; a user-supplied
demo-looking name/handle cannot authorize automation.

## Supported business data

| Data | Existing write/read contract | First simulator behavior |
|---|---|---|
| Business name, logo | `saveOwnerBusiness`; catalog/business DTO | Preserve identity; inventory existing owned media |
| Introduction, About | `saveOwnerPageAndPublication`; current publication | Rotate predefined, industry-appropriate example updates |
| Page template and cover style | Owner page parser/publication | Preserve template; use only accepted cover styles when a later scenario needs them |
| Cover photo and process video | Owner page, validated media/video references | Preserve approved existing references; no external media fetching |
| Accent color | Owner page/domain contrast policy | Preserve branding; a later explicit launch scenario may admit a coordinated palette |
| Public phone, email, WhatsApp, Telegram, website and social profiles | Effective publication contacts and server demo permission | Preserve all contacts; WhatsApp/Telegram stay on the owned number |
| City, country, area/storefront coordinates, business category | Owner business/location proposal and discovery profile | Preserve geography and classifications in the first worker; never generate random coordinates |
| Handle, aliases, publication status | Separate identity/publication authorities | Preserve handles, real/draft/suspended state and immutable history |
| Livestream presence/URL, Featured/sponsor placement | Separate platform-controlled workflows | Do not simulate genuine live activity or change admin placement |

## Supported product data

| Data | Existing contract | First simulator behavior |
|---|---|---|
| Name, description | `BasicProductCommand`, 140/3000 character limits | Keep product identity; use predefined coherent description updates |
| Availability | available, limited, unavailable, coming_soon | Cycle admitted states; keep at least one usable published product per enrolled showroom |
| Ready to ship / Made to order | Active product-kind policy | Preserve kind initially; scenario facts must agree with it |
| Price, currency, quantity unit | Nullable integer minor price; ETB; bounded unit | Use finite baseline-derived example prices; preserve null/ask-for-price and currency/unit |
| Minimum order, lead time, capacity | Bounded summaries in the normal product command | Predefined values consistent with the business and existing selling unit |
| Order size and quantity intent | `order_scope`, optional quantity policy | Preserve supported semantics; no stock-count field exists |
| Highlights | Existing normalized fact list | Predefined example facts, within current limits |
| Gallery images and videos | Product-owned media admission | Reorder only already-owned references in a later admitted scenario; no uploads/foreign images |
| Variant groups and choices | Up to four groups, bounded distinct choices | Preserve initially so active selections are stable; test option-change handling on isolated fixtures |
| Product category, collection, ordering | Existing tenant-bound structure | Preserve first; inventory as separate later scenarios |
| Listed/hidden state | Existing listing-state command | Keep identity/history; temporary hiding only after explicit scenario coverage proves recovery |

There is no cart checkout, order-payment state, stock count or transport-route
field to invent. Product, page and location changes must use the ordinary
application/domain paths rather than direct writes to public snapshots.

## Identity and write boundary

Use an explicit server-side enrollment, not a handle prefix or a broad
`WHERE is_demo=1` update. Bind each enrollment to its current business ID/handle,
demo owner and immutable Auth linkage, selected product IDs and baseline facts.
Every tick locks/rechecks the enrollment, current demo flag, active/public state,
owner/role/link and product tenancy before any mutation. Ownership/flag drift,
an unregistered account, a new signup or a private reviewer must fail closed.

Record deliberate simulator attribution in audit evidence without implying an
interactive owner login. Keep normal command parsing, authorization, optimistic
versions, product idempotency, publication append-only history and transactions.
Preserve real tenants, contacts, Auth, customers, inboxes, chats and notification
outboxes. Do not send external messages or alter credentials.

## Scenario catalog and timelines

The owner's clarification requires a catalog of realistic situations with planned
changes over time. A scenario owns the coordinated business/product changes for
an entire timeline. It is not a collection of independent field toggles.

| Scenario | Planned stages | Related facts that move together |
|---|---|---|
| Seasonal harvest | Preparing → checking → available → dispatch → limited → replenished | Availability, capacity, lead time, minimum order, predefined price and showroom update |
| Workshop production cycle | Slots open → scheduled → production → finishing → planning → capacity restored | Made-to-order identity, available/limited state, capacity, lead time and matching introduction |
| Wholesale batch replenishment | Batch open → dispatch → limited → preparing → checking → replenished | Availability, quantity unit, minimum order, capacity and dispatch promise |

Product/model launches and assortment/variant changes remain later scenarios;
they are not currently automated. Each current definition has an immutable scenario ID/version, eligible business/product
types, required target bindings, ordered stages, minimum stage duration, explicit
field values, consistency checks, completion/loop cooldown and coverage cases.
Assign a compatible scenario to an explicitly enrolled demo; its values must fit
that business, product kind and selling unit. Preserve prices quoted on inquiry
and never pretend a stock count, customer sale, shipment or live stream occurred.

Persist scenario/stage, stage start/due time and the exact acknowledged versions.
A restart resumes that point; a delayed run does not rush through every missed
stage. Validate and commit all related stage changes in one outer transaction
through existing commands, then advance progress. A partial write, conflict or
failed consistency check advances nothing. Pause for a human edit/ownership drift;
do not overwrite it. Replays return the same stage result. Failure/recovery tests
must cover complete timelines and prove that rendered facts agree at each stage.

Use curated coherent scenarios; selection may choose among compatible plans,
but field values and transitions come from the selected scenario. No random
prices, destinations, coordinates, names or unrelated supplier facts.
Retain the exact baseline/version for conflict detection; never overwrite a
concurrent human edit silently. One coordinated tenant stage is the
write unit, with at most two due stages per tick. The owner's frequency clarification requires visible activity
about every minute across a rotating active cohort. Compress planned scenario
durations and refresh already-open screens; do not make users wait hours to see
a demo change. Bound each tick to the coordinated affected records, skip unchanged
facts, and measure snapshot/history growth when choosing cohort size. Keep concurrency locking, replay
protection, a pause switch and bounded runtime/run retention.

## Foreground refresh and verification

Public shop revision includes the business content version and the current public
page revision. Private drafts/messages do not advance it. The public API and
server page read product/profile facts in one read-only repeatable snapshot.
Web/native screens poll every15 seconds while active, abort/fence departed reads,
back off failures and retain navigation, filters, selections and edited drafts.
First-page marketplace updates stay quiet; deeper pagination offers explicit
Refresh rather than discarding the reader's loaded pages.

Disposable mixed-data PostgreSQL proves normal writes, full timelines, identity/
version drift, new-signup exclusion, replay/overlap, rollback, private privileges
and budgets. Actual Chrome desktop/phone journeys cover open-screen updates,
draft/expanded-copy retention and English/Amharic/Afaan Oromo fit. Actual Android
covers open product updates, Back/search, selection and a saved local inquiry.
Neither controlled fixtures nor this English emulator smoke qualify physical
Android, owner Auth, push or Play. Production uses the actual Netlify clock,
public API/readback and an already-open browser; no supplied test clock or HTTP
trigger is exposed in the hosted worker.

## Hosting choice

A dedicated Netlify scheduled function runs separately from `attention-worker`,
using existing server-only PostgreSQL application ports. Netlify scheduled work
has a 30-second bound and runs only on published deployments. Keep each tick below
that bound and pause safely if data/schema/budget admission fails. A VM or a new
Supabase scheduling/provider credential is unnecessary if this measured contract
fits. The pre-rollout read-only measurement was24,112,275 database bytes,306
retained catalog versions averaging 8,591 snapshot bytes, 263 page publications
and application ledger80. The rollout verifies the already-applied81 metadata/
privilege equivalence before recording81 and adding private schema82. No earlier
data patches, seed/reset, Auth/SMTP or configuration sync is replayed.

At one product change per minute, catalog snapshots alone add roughly 12.4 MB/day
before PostgreSQL/index overhead and compression. Each selected stage now changes
its predefined listing summary, even when its selling facts remain steady. At
the maximum two stages per minute, budget roughly 24.8 MB/day of raw snapshot JSON
before measuring actual stored growth. Identical retries create no new snapshot.
Preserve immutable history and pause at the explicit storage budget; never delete
retained publications or raise provider spending limits. The selected
cadence and limits are now fixed in the runtime: one minute,
two due stages, at most six active enrollments, 2,880 successful stages per UTC
day and a 256 MiB database soft limit. PostgreSQL17 imposes a 23-second transaction
deadline. Storage pressure disables demo work; the daily limit defers it until
the next day. Neither condition changes merchant history or provider billing.
Only seven-day private operational run rows are pruned during active work.

The service publishes each short stage summary before the preserved original
product description and business story, so cards and showrooms expose activity.
Enrollment reserves space in the ordinary text limits without truncating either.
Public catalog/profile reads use one read-only repeatable snapshot to avoid
mixed stages during concurrent writes. The service uses ordinary product upkeep and owner page save/publication in
one transaction. It refuses pending location proposals and page-owned Storage
images so a stage cannot approve geography or fetch Storage while holding locks.
Current catalog, draft/publication, identity and geography fingerprints fence
human edits. Deployment/migration never enables the control or infers enrollment.
The operator explicitly admits a reviewed cohort and enables bounded execution;
current hosted evidence and preserved-real-account checks belong in traceability.

Native qualification extends DEP-053 with `scripts/native-qa-demo.ts`: the exact
source-bound local QA fixture advances through ordinary scenario commands while
the actual product screen stays open. The driver waits for Limited availability
and retains before/after screenshots plus independent public-read receipts.
This local synthetic identity is never a hosted Auth account or session.

Hosted registration uses private `demo_simulator_requests` rows for exact reviewed
inputs and content/draft/publication versions. A disabled scheduled worker admits
at most two per tick through ordinary enrollment, then stays disabled. An explicit
`initializeUnit` may fill only an empty selling unit using normal product upkeep;
all related preparation rolls back on refusal. Existing units are preserved.
Accepted/rejected outcomes are private and contain no raw exception. Active
simulation does not process requests. This avoids a public administration route or
copying management credentials into the application.

The public no-store health endpoint includes validated build commit/deployment IDs
when Netlify supplies them at build time. Only these public identifiers are
embedded; no credential or private simulator state enters health or client code.

## Reviewed initial cohort

| Example business | Scenario | Product | Unit | Minimum | Normal / limited capacity per week |
|---|---|---|---|---|---|
| Selam Weave | Wholesale replenishment | Indigo Kuta Shawl | shawls |10|120 /20|
| Addis Metalworks | Workshop production | Powder-Coated Equipment Frame | frames |1|12 /4|
| Green Terrace Farm | Seasonal harvest | Highland Greens Mix | crates |5|200 /40|

Preserve each existing base price, identity, category, geography, media and contact.
These units were explicitly initialized only where empty, through normal upkeep.
The initial cohort is deliberately smaller than the65 marked examples; the flag
alone never authorizes updates. Normal signup keeps `is_demo=0`.

Pause via the verified private control before any new request. The worker admits
at most two requests per disabled tick and never resumes itself. Inspect every
accepted/rejected result before enabling. A rejected request rolls back its unit
preparation as well as enrollment. Drift pauses the affected example; do not
rewrite an expected hash or re-enroll blindly. Storage pressure pauses the service
rather than deleting immutable history or raising provider billing.

After ledger82, retain a qualified82-compatible deployment or roll forward;
redeploying an81-only app would fail its future-ledger check. The first rollback
is the private pause control. Keep protected before-images outside Git and never
restore customer/history rows automatically. Hosted ledger versions are bigint;
exact array guards must use the matching type. The first rollout guard refused
an integer-array comparison before any DDL; readback proved no change before the
corrected single atomic migration was applied.

Ordinary upkeep materializes the selected products’ legacy image/video fallbacks
into explicit gallery JSON. Source-aware comparison verifies the effective gallery
references/order remain identical for all12 cohort products; raw JSON byte equality
is not the media contract. The PostgreSQL regression covers that legacy form.
