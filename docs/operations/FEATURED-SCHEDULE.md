# Daily Featured scheduling

FE-033 / BE-029 / DEP-024 · S36, deployed 2026-09-27.
Owner-approved; release and live checks pass. See `../SUQPAGE-RELEASE-2026-09-27.md`.

## Automatic schedule

The official window is **8:30 PM–12:00 AM Ethiopia time (UTC+3)**.
Each day's existing category selects up to six eligible businesses. The selection
rotates weekly, so the same first six businesses do not permanently occupy it.
No daily setup, background job or manual publish action is needed. Changes to
business eligibility can change the automatic selection.

With six businesses, the running order reserves six 30-minute presentations,
four five-minute sponsor mentions and two five-minute changeovers: 210 minutes.
Fewer businesses finish earlier; none produces an empty agenda. All displayed
times use AM/PM. Midnight ends the previous evening's broadcast.

## Change one date

1. Sign in as a platform admin and open **Daily Featured schedule** at
   `/dashboard/admin/featured-schedule`.
2. Choose a program date and select **Open date**.
3. Choose **Manual**, check up to six eligible businesses and set their numbered
   order. Uncheck an existing selection before adding a seventh candidate.
4. Select **Save lineup**. The agenda recalculates automatically; the public
   schedule reflects the saved order on its next load.
5. To resume the rotation for that date, select **Automatic** and **Save lineup**.

These controls edit participants and order, not the official time window or
presentation durations. An override affects only its selected date. Future-day
public business identities remain hidden until that Ethiopia calendar day.

## Sponsor mentions and broadcast

Use **Manage sponsors** to manage the existing ordered active sponsor placements.
The four chronological mention slots use that order. If there are fewer than
four placements, the sequence repeats; missing sponsors remain unassigned.
The admin agenda names each placement so the host can review it before going live.
Sponsor placement does not determine which businesses receive editorial features.

Suqpage supplies the running order and public timetable. The team starts and runs
TikTok itself; there is no automatic TikTok broadcast creation or start command.

## Release notes

S36 needs no database migration. Historical timing-policy and manual-lineup rows
are retained. Older oversized manual lineups display at most six businesses;
the new editor enforces the six-business limit. Rollback restores the previous
application code, which can still read those retained rows.
