---
id: BE-029
title: Daily Featured schedule policy and override projection
status: in_progress
related: [BE-020, BE-023, BE-027, FE-021, FE-033, FE-037, DEP-020, DEP-023, DEP-024]
owners: [backend, security, operations]
last_updated: 2026-10-26
change_level: L3
---

# BE-029 - Daily Featured schedule and override projection

## Problem and outcome

S182 uses the official 8:15–9:45 PM EAT booking window. Automatic selection must
be fair across weeks, bounded to four
businesses and consistent with the manual admin preview and public page.

## Scope

Pure agenda generation, current-business projection, deterministic rotation and
transactional per-date manual overrides. PostgreSQL is the only persistence
engine. Existing policy history remains stored, but the official evening rules
supersede its previous values; its write action is retired. No new migration,
cron, queue or TikTok integration is introduced.

## Domain language and invariants

- Fixed EAT start 1215, latest end 1305, presentation duration 20, changeover 3,
  sponsor duration 2 and two sponsor mentions. Four presentations plus two
  mentions and two changeovers total 90 minutes. A sponsor break already supplies
  the transition at that boundary; do not add another changeover. Small lineups
  finish earlier; empty lineups have no agenda. The visitor's official booking
  range stays 8:15–9:45 PM, while card times and phase follow the actual agenda.
- `MAX_FEATURED_SHOWROOMS` is four. Invalid counts/dates/times are rejected. All
  generated intervals are positive, contiguous and inside the official window.
- Automatic rotates a deterministic alphabetical eligible pool weekly. A given
  date and unchanged pool retain the same order; all businesses eventually rotate
  through. Sponsorship does not influence that editorial order.
- Manual rows are intersected with current active, published, approved,
  non-excluded, media-complete businesses in the date's category. An empty stale
  manual set falls back to Automatic. Old oversized sets project at most four;
  retain their stored history instead of deleting rows for the new capacity.
- Non-today public views redact business identities. During a break or after the
  last segment no business is Featured now. Client and server use the same agenda.
- Two chronological sponsor slots resolve to the ordered active sponsor pool,
  repeating when it has fewer than two entries. Missing sponsors remain empty
  inventory. No sponsored adjacency implies endorsement.

## Contracts

- `buildFeaturedProgramAgenda(dateIso, boothCount, now, policy)` returns evening
  business, changeover and sponsor entries with epoch bounds, 12-hour EAT labels,
  chronological sponsor slots and at most one current entry.
- `resolveFeaturedProgramSessions` returns the actual single evening range.
  `featuredBroadcastPhase` identifies scheduled/live/ended using that range.
- `featuredProgramDisplayOrder` rotates around the current/last completed
  presentation without mutating the stored lineup.
- `automaticFeaturedLineup` selects up to four without duplicate identities.
  Admin and public apply matching eligibility and alphabetical ordering first.
- `saveFeaturedProgramDay` validates dates, eligible IDs, maximum count and actor;
  it atomically replaces one date's manual rows or removes that override to resume
  automatic selection. Server actions enforce platform-admin capability and audit
  date, mode and count. Untrusted form data never becomes SQL structure.
- Manual writes invalidate Featured and Market tags/routes. Public cache keys also
  include EAT date and the indexed current week's mode/order/update rows, bounded
  by seven dates. No credentials or customer contacts enter the key.
- `featured_program_policy` remains historical data. Existing per-date and lineup
  tables and cascading deletion semantics remain unchanged.

## Scenarios

GIVEN no override WHEN the weekly eligible pool is read THEN up to four businesses
rotate deterministically, without a daily materialization job.

GIVEN a valid manual date WHEN staff submit a fifth or ineligible business THEN
reject before persistence and retain the previous order.
The administrator can choose another category-appropriate date for additional
businesses; the cap never shortens presentations or silently queues a new write.

GIVEN the public automatic view is cached WHEN staff save a manual reordered
lineup THEN the next public load shows that saved lineup. Returning to Automatic
restores the rotating set. Admin preview and public order agree.

GIVEN four participants WHEN the clock reaches 8:15 PM THEN the first presentation
starts; at 9:45 PM no presentation or sponsor segment remains current.

GIVEN a smaller lineup WHEN the agenda is generated THEN each presentation remains
20 minutes and the evening finishes before 9:45 PM without overlaps.

## Quality impact

Existing role/eligibility boundaries and private future-day identities remain.
Indexed override reads add one bounded cache-version query per cached public
projection; no per-card queries or daily writes. Manual replacement is atomic;
server caches are never business authority. UI controls are localized and usable
on phones. Staff choose participants/order; they do not change the official window.

## Test plan

| Criterion | Evidence |
|---|---|
| Timing, midnight, rotation and capacity | scripts/test-featured-schedule.ts, scripts/test-clock-display.ts |
| Atomic manual replacement, ineligible/oversized denial | scripts/test-featured-schedule.ts |
| Admin/public ordering, restore and cache version | scripts/test-featured-schedule.ts; real local browser save/refresh |
| Eligible media, category independence, current business | scripts/test-discovery.ts |
| Desktop/phone admin and public workflow | .local/evening-featured-review/ |

## Rollout and rollback

No S36 schema migration. Retain existing policy and manual rows. Deploy the new
code after visual and release gates; older code can still read its historical
policy and lineup data. Avoid changing stored history merely to fit the new cap.

## Readiness checklist

- [x] Scope, non-goals and reciprocal FE-033/DEP-024 links
- [x] Observable contracts, negative cases and privacy boundaries
- [x] Focused tests and rollout/rollback defined
- [ ] Visual approval, full gates and deployment

## Completion evidence

Local schedule/clock, discovery, localization, homepage composition and typecheck pass.
The real authenticated admin form saved a reordered two-business lineup against a
warm public cache, immediately displayed it publicly, and restored Automatic.
Seven public locale/viewport states and admin widths 320/390/1440 pass; private
evidence is `.local/evening-featured-review/verified.json`. Original local lineup
rows were restored. Full gates, owner visual approval and production rollout are
pending. See `docs/operations/FEATURED-SCHEDULE.md` for staff procedures.
