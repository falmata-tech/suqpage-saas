# Recurring demo marketplace simulator — implementation inventory

Checklist S194 owns this requested work. This inventory records current source
contracts and the proposed first simulation matrix. No recurring worker,
enrollment, migration or hosted write is implemented by this document.

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
| Seasonal harvest | Preparing → harvest available → limited seasonal supply → next window | Availability, capacity, lead time, minimum order, predefined price and showroom update |
| Workshop production cycle | Open production slots → busy schedule → capacity recovers | Made-to-order identity, available/limited state, capacity, lead time and matching introduction |
| New product/model launch | Announced → available for inquiry → normal supply | Existing enrolled product visibility/availability, description, selling facts and matching showroom announcement |
| Wholesale batch replenishment | Available batch → limited batch → replenished batch | Availability, quantity unit, minimum order, capacity and dispatch promise |
| Planned assortment update | Existing choices → declared revised choices → stable assortment | Product-owned variants/media, descriptions and safe inquiry-selection revalidation |

Each definition needs an immutable scenario ID/version, eligible business/product
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
concurrent human edit silently. One bounded tenant operation per tick is the
initial write unit. The owner's frequency clarification requires visible activity
about every minute across a rotating active cohort. Compress planned scenario
durations and refresh already-open screens; do not make users wait hours to see
a demo change. Bound each tick to the coordinated affected records, skip unchanged
facts, and measure snapshot/history growth when choosing cohort size. Keep concurrency locking, replay
protection, a pause switch and bounded runtime/run retention.

## Refresh gap and verification

Current chat clients poll while active. The marketplace feed retains its loaded
snapshot, the native `useResourceLoad` refreshes on explicit/selected focus events,
and public showroom rendering has no recurring catalog subscription. Backend
writes alone do not update an already-open marketplace/showroom automatically.
Mobile shop DTO `version` is the business content version; page publication also
has an independent revision that must participate in any refresh fingerprint.

The implementation needs a bounded foreground refresh contract for web/native,
with current-scope/stale-response fencing and retained filter, selection, scroll
and inquiry-draft state. Stop hidden/background requests, back off failures and
show recovery; do not call polling a verified Supabase Realtime subscription.

Prove on disposable mixed real/demo/new-signup fixtures: normal write → stored
version/publication → fresh public API → already-open rendered values, measured
with one selected scenario. Cover replay, overlapping runs, rollback, flag/owner/
product drift, immutable history and no notification creation. Production rollout
then needs exact project/site, protected before-images/enrollment plan, guarded
canary, scheduled-run readback and independent real-account preservation checks.

## Hosting choice

Prefer a dedicated Netlify scheduled function, separate from `attention-worker`,
using existing server-only PostgreSQL application ports. Netlify scheduled work
has a 30-second bound and runs only on published deployments. Keep each tick below
that bound and pause safely if data/schema/budget admission fails. A VM or a new
Supabase scheduling/provider credential is unnecessary if this measured contract
fits. A fresh read-only production measurement reports 24,112,275 database bytes, 306
retained catalog versions averaging 8,591 snapshot bytes, 263 page publications
and application ledger version 80. Source migration 81 is a separate metadata/
privilege hardening step; verify its hosted equivalence and ledger before any
later simulator migration. These are observations, not an admission to mutate.

At one product change per minute, catalog snapshots alone add roughly 12.4 MB/day
before PostgreSQL/index overhead and compression. Profile-only stages and unchanged
product facts should avoid unnecessary product snapshots. Preserve immutable
history, measure actual growth and choose an explicit pause/storage budget; do
not add an unbounded fast loop or silently delete retained publications. Final
cadence and limits are now fixed in the implementation candidate: one minute,
two due stages, at most six active enrollments, 2,880 successful stages per UTC
day and a 256 MiB database soft limit. PostgreSQL17 imposes a 23-second transaction
deadline. Storage pressure disables demo work; the daily limit defers it until
the next day. Neither condition changes merchant history or provider billing.
Only seven-day private operational run rows are pruned during active work.

The candidate uses ordinary product upkeep and owner page save/publication in
one transaction. It refuses pending location proposals and page-owned Storage
images so a stage cannot approve geography or fetch Storage while holding locks.
Current catalog, draft/publication, identity and geography fingerprints fence
human edits. Qualification and hosted enrollment remain pending; deployment does
not enable the disabled control or infer any enrolled business from its name.
