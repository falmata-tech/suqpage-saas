---
id: FE-033
title: Automatic and adjustable Daily Featured scheduling
status: in_progress
related: [FE-052, FE-021, FE-024, FE-026, FE-030, FE-037, BE-023, BE-027, BE-029, DEP-020, DEP-023, DEP-024]
owners: [product, frontend, operations]
last_updated: 2026-09-24
change_level: L3
---

# FE-033 - Automatic and adjustable Daily Featured scheduling

## Problem and outcome

The official Daily Featured broadcast window is 8:30 PM–12:00 AM Ethiopia time.
The prior two-session policy and 40-business capacity are superseded. Automatic
lineups showcase at most six eligible businesses with four five-minute sponsor
mentions. Staff can replace and order a date's lineup, then restore Automatic.

## S36 — evening broadcast (implemented and focused-tested locally)

- GIVEN six eligible businesses WHEN the agenda is generated THEN six 30-minute
  presentations, four five-minute sponsor mentions and two five-minute changeovers
  fill 8:30 PM through midnight, with no overlap or morning/intermission session.
- GIVEN fewer than six businesses THEN use only eligible businesses, at most
  30 minutes each; retain four sponsor mentions and finish within the official
  window rather than invent businesses or stretch presentations. Zero businesses
  yields an empty agenda. Adjacent sponsor mentions may share a boundary on small
  lineups. Midnight belongs to the following date and displays 12:00 AM.
- Automatic is the default without daily setup or a cron job. A deterministic
  weekly rotation selects up to six from the category's eligible pool. Admin and
  public use the same eligibility/order/selection contract. Sponsor mentions use
  the ordered active placement pool, repeating when fewer than four are available;
  absent placements leave clearly unassigned inventory, never invented sponsors.
- Manual mode selects/reorders up to six for a date; save recalculates all times.
  Returning to Automatic removes only that date's override. Stale/ineligible
  candidates remain excluded; old oversized overrides expose at most six without
  deleting stored history. Public cache invalidation makes manual edits visible.
- The official time window and segment durations are fixed product rules; retire
  the old morning/evening policy form and write action. Retain its historical DB
  row without using it as current authority. No schema change is required.
- Scheduling is a Suqpage rundown; it does not start or schedule TikTok itself.
  Ads remain separate from editorial selection. Current sponsor and business
  states must agree with the agenda at starts, transitions and midnight.

Ready: bounded scheduling change under existing admin/eligibility ports. Tests
cover capacity/totals/midnight/empty and small lineups, weekly rotation, manual
save/revert and privacy/reveal rules. Capture public/admin at desktop and phone;
visual approval precedes full release gates. Master §§3/5/19 and operations docs
need current single-evening behavior. Older sections below are retained history
where they describe morning/intermission/global-policy or 40-business behavior.

## S36 verification

Schedule/clock, discovery, localization, homepage composition and typecheck pass.
Tests cover 0–6 participants, exact 210-minute full agendas, four mentions,
midnight, deterministic rotating eligibility, manual transaction rejection and
revert. A real browser save against a warmed cache exposed and verified a fix for
stale public lineups; manual order and return to Automatic now display immediately.
Seven public language/viewport states and admin at 320/390/1440 pass without
horizontal overflow. Screenshots and receipt: `.local/evening-featured-review/`.
The single-session agenda uses the full width; phone time ranges have more space.
Original local schedule rows were restored after the test. Staff procedure:
`docs/operations/FEATURED-SCHEDULE.md`. Owner visual approval, full gates, commit
and deployment remain pending; status stays in_progress.

## Scope

### 12-hour display refinement (2026-09-23, local candidate)

GIVEN a public or dashboard schedule WHEN a clock time is displayed THEN it uses
1–12 hours, two-digit minutes and explicit AM/PM, including noon and midnight.
Ranges label both endpoints; the existing EAT timezone remains. Support/inquiry/
invitation timestamps use the same 12-hour rule. Admin hour/minute/AM-PM controls
submit the same validated HH:mm machine value, preserving authorization and
persistence. All interface languages retain AM/PM. Date-only labels and elapsed
durations are unaffected. ISO timestamps and agenda calculations never consume
display labels. This supersedes the earlier native-time-control UI.

DOR met: L1 display refinement; no schema/provider/timezone change. Focused tests
cover noon/midnight/PM, agenda epoch boundaries and form round trips. Desktop/phone
captures precede visual approval/full gates. Rollback restores source without
migrating schedule data. Master §§5/19 affected.

Demo-audit correction: GIVEN no valid platform TikTok destination WHEN any
schedule phase renders THEN it shows Featured schedule/current/break/ended status
without claiming a TikTok broadcast or offering a dead watch action. Configured
provider links retain their existing behavior. Schedule timing never proves an
external stream exists. Verify absent/configured destination states in browser;
no new provider integration or production configuration mutation.

### In scope

- Morning capacity window from 08:00 to 13:00 EAT and evening capacity window
  from 17:00 to 22:00 EAT.
- Participant-responsive session starts: a small morning lineup contracts toward
  its 13:00 end and a small evening lineup contracts toward its 22:00 end.
- At least the original four-hour 13:00–17:00 midday interval remains inactive;
  a contracted evening session may begin later.
- Dynamically divided booth airtime after reserving booth-change and recurring
  sponsor-break intervals.
- Public scheduled, live, break, intermission, and ended states.
- A platform-admin schedule workspace for global rules and per-date
  Automatic/Manual lineup mode.
- Manual inclusion and ordering of currently eligible businesses for one date.
- A hard maximum of forty participating showrooms per date in Automatic and
  Manual modes. Responsive image-led cards preserve readable identity without
  ranking, a simulated venue, or pagination.

### Non-goals

- Livestream hosting, recording, reminders, attendance, or provider API control.
- Per-business editing of arbitrary start/end times.
- Allowing sponsors to buy Daily Featured participation or position.
- Exposing future-day business identity, manual selections, or private notes.
- Changing the fixed weekday-to-industry assignment.

## Domain language and invariants

- **Program policy** is the global pair of sessions, intermission, changeover,
  and sponsor-break rules.
- **Automatic lineup** is the first forty currently eligible showrooms in the
  deterministic selected-weekday industry order.
- **Manual lineup** is an administrator-selected ordered subset for one ISO
  date. Timing is still generated from the program policy.
- A sponsor break is program inventory, not evidence that an adjacent showroom
  is sponsored or endorsed.
- Generated sponsor breaks receive chronological sponsor slots. Each slot
  resolves against the current ordered sponsor-placement pool, repeating only
  when a day contains more sponsor breaks than active placements. The admin
  agenda names the assigned sponsor and exact time. During that live segment,
  the public status and sponsor rail bring the assigned placement forward and
  label it **Sponsor spotlight** without changing showroom order or airtime.
- Every participating booth receives one non-overlapping presentation window.
  A transition or sponsor break separates consecutive booths.
- Each non-empty session is at least 60 minutes and targets no more than 30
  presentation minutes per booth. A larger lineup expands toward its complete
  five-hour capacity window, where presentation duration may contract to fit.
- When at least two businesses participate, both sessions receive a lineup.
- No booth is **Featured now** during transition, sponsor-break, or intermission
  time.
- A selected date has at most forty participating showrooms. Eligible businesses
  outside an Automatic top forty remain in the geographic marketplace and may be
  selected by an administrator on another appropriate date.
- Forty responsive cards are the visual capacity of one Daily Featured gallery.
  The grid keeps a minimum readable width and adds vertical rows instead of
  shrinking the complete lineup or creating a hall.

## Contracts

- Public status identifies the date's generated morning and evening windows,
  not merely the maximum 08:00–22:00 capacity, and never presents inactive
  midday or pre-session time as live.
- Today's public program header includes one compact **Today's schedule**
  disclosure sourced from the same generated agenda as booth highlighting. Its
  closed summary names the actual participant-responsive morning and evening
  windows; opening it lists every participating showroom with its EAT range,
  recurring sponsor breaks, and the complete intermission. Ordinary booth
  changeovers are summarized rather than expanded into repetitive rows.
- Booth cards expose their generated EAT range. Current status names the active
  booth, sponsor break, booth changeover, intermission, or ended state.
- Today's gallery is a circular schedule queue. Before the first presentation,
  slot one leads. During a presentation, its card leads. During a break, the
  most recently completed presentation remains first. When the next
  presentation begins, that card moves first and prior cards rotate behind the
  remaining lineup. After the program ends, the final presentation remains
  first. Stable booth references, airtime, and the administrator lineup never
  change; non-today previews retain stored lineup order.
- The public composition remains compact on phones: session context belongs in
  the existing status and schedule controls, and the schedule remains collapsed
  by default rather than adding another stacked calendar or agenda wall above
  the gallery. When intentionally opened, morning and evening entries use one
  readable phone column without horizontal scrolling.
- `/dashboard/admin/featured-schedule` is available only to platform admins.
  It exposes global time inputs, break controls, a date chooser, the date's
  assigned industry, current mode, eligible participants, and numeric order.
- Saving Manual mode requires at least one eligible participant. Reverting to
  Automatic removes the retained manual lineup for that date.
- Saving Manual mode rejects more than forty selected participants atomically.
  The admin workspace states the limit and prevents additional selection after
  forty are checked without relying on browser enforcement for authority.
- The admin form explains that participant eligibility is rechecked when the
  public schedule is read and shows a generated preview before publication.

## Scenarios

```gherkin
Scenario: Today's agenda is generated automatically
  GIVEN no manual override exists for today's date
  WHEN Daily Featured Showrooms is projected
  THEN at most the first forty eligible showrooms in today's assigned industry receive one presentation window
  AND the windows are divided between morning and afternoon sessions
  AND changeover or sponsor breaks separate consecutive booths

Scenario: Visitor checks today's generated schedule
  GIVEN today's eligible lineup and program policy have produced an agenda
  WHEN a visitor opens Today's schedule
  THEN every participating showroom is named beside its generated EAT range
  AND morning, evening, sponsor-break, and intermission timing match the authoritative agenda
  AND closing the schedule restores the compact gallery composition

Scenario: Today's gallery follows the live program
  GIVEN today's ordered lineup has generated walkthrough windows
  WHEN time advances from one presentation through a break into the next
  THEN the active presentation leads while it is live
  AND the just-completed presentation leads during the break
  AND the next presentation moves first only when its own window begins
  AND all cards retain their original booth reference and EAT range

Scenario: Sponsor segment reaches the live screen
  GIVEN today's agenda contains sponsor breaks and active sponsor placements
  WHEN the agenda and public Daily Featured workspace render
  THEN each sponsor break names its assigned placement and exact time
  AND the currently active sponsor segment moves that placement to the front of the sponsor rail
  AND the live status identifies it as a paid sponsor spotlight

Scenario: Administrator adjusts one day's lineup
  GIVEN a platform administrator opens a future date
  WHEN they choose Manual, select eligible businesses, assign order, and save
  THEN that date uses the saved eligible order
  AND presentation times are recalculated from the current program policy
  AND public future-day identities remain redacted

Scenario: Administrator exceeds the Daily Featured capacity
  GIVEN forty eligible businesses are selected for a Manual lineup
  WHEN an administrator attempts to add a forty-first business and save
  THEN the mutation is rejected atomically with a clear capacity message
  AND the prior lineup remains unchanged

Scenario: Administrator restores automatic scheduling
  GIVEN a date has a manual lineup
  WHEN a platform administrator saves Automatic mode
  THEN retained manual rows for that date are removed
  AND the complete current eligible set becomes authoritative again

Scenario: Visitor opens the program during the long intermission
  GIVEN Ethiopia time is after the morning session and before the generated evening session
  WHEN today's status renders
  THEN it announces the intermission and the generated evening restart
  AND no booth is labeled Featured now

Scenario: A small lineup receives a shorter operating day
  GIVEN a date has fewer booths than require both complete five-hour capacity windows
  WHEN its agenda is generated
  THEN the morning session ends at 13:00 and begins later than 08:00
  AND the evening session ends at 22:00 and begins later than 17:00
  AND both sessions remain present when at least two booths participate
```

## Quality impact

- Security and tenant isolation: platform-admin authorization guards all
  mutations; the public projection contains only already eligible fields.
- Privacy and data retention: dates, business IDs, positions, and schedule
  policy are retained; no visitor or contact data is added.
- Accessibility and responsive behavior: native time/date/number controls,
  labeled mode selection, readable status, and no new phone overflow.
- Localization and merchant-entered values: times are explicitly EAT; bounded
  staff labels are plain text.
- Performance and limits: one singleton read and at most one bounded per-date
  lineup query are added to the existing discovery projection.
- Failure recovery and idempotency: repeated saves replace one date atomically;
  stale manual entries fail closed and an empty eligible override falls back to
  Automatic.

## Observability

Audit global policy changes, manual lineup saves, and Automatic restoration
with actor ID, date, mode, and participant count. Do not log business content,
provider links, or credentials.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Two-session agenda and breaks | unit | `scripts/test-featured-schedule.ts` |
| Automatic/manual eligibility and atomic replacement | integration/security | `scripts/test-featured-schedule.ts`, `scripts/test-security.ts` |
| Public status, booth labels, and phone layout | browser/visual | focused Playwright capture, `scripts/capture-discovery-visuals.mjs` |
| Admin workflow | acceptance | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

DEP-024 adds migration 32 before enabling the admin route. Application rollback
may leave additive policy and override tables in place; the prior application
ignores them and continues its prior deterministic schedule.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Implementation and focused evidence are in progress.

Focused local evidence and remaining gates: [2026-09-23 workflow audit](../../docs/SUQPAGE-DEMO-WORKFLOW-AUDIT-2026-09-23.md), mapped in TRACEABILITY.md.
