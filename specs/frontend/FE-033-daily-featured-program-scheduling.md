---
id: FE-033
title: Automatic and adjustable Daily Featured scheduling
status: in_progress
related: [FE-021, FE-024, FE-026, FE-030, FE-037, BE-023, BE-027, BE-029, DEP-020, DEP-023, DEP-024]
owners: [product, frontend, operations]
last_updated: 2026-08-14
change_level: L3
---

# FE-033 - Automatic and adjustable Daily Featured scheduling

## Problem and outcome

Daily Featured Showrooms currently schedules every participant inside one
window and has no staff-owned schedule. MirtPage needs an all-day program with
usable presentation time, deliberate changeovers, sponsor moments, a long
midday break, and a safe way for staff to adjust a particular day's lineup.

The default schedule is generated automatically from that day's eligible
showrooms. Platform administrators can edit the global timing policy or replace
one date's participant order, while the public gallery continues to derive every
time and active highlight from one authoritative agenda.

## Scope

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
