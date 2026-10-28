# Daily Featured scheduling

FE-033 / BE-029 / FE-021 · S182 source update; current release qualification is
tracked in `../AFRICMADE-TRANSITION-CHECKLIST.md` and `../../specs/TRACEABILITY.md`.

## Automatic schedule

The official booking window is **8:15 PM–9:45 PM EAT (UTC+3)**.
Each day's existing category selects up to four eligible businesses. The selection
rotates weekly, so the same shortlist does not permanently occupy it.
No daily setup, background job or manual publish action is needed. Changes to
business eligibility can change the automatic selection.

With four businesses, the running order reserves four 20-minute presentations,
two two-minute sponsor mentions and two three-minute changeovers: 90 minutes.
Fewer businesses finish earlier; none produces an empty agenda. All displayed
times use AM/PM. The final segment ends no later than 9:45 PM EAT.

## Change one date

1. Sign in as a platform admin and open **Daily Featured schedule** at
   `/dashboard/admin/featured-schedule`.
2. Choose a program date and select **Open date**.
3. Choose **Manual**, check up to four eligible businesses and set their numbered
   order. Uncheck an existing selection before adding another candidate. Use
   another category-appropriate date for additional businesses; do not shorten slots.
4. Select **Save lineup**. The agenda recalculates automatically; the public
   schedule reflects the saved order on its next load.
5. To resume the rotation for that date, select **Automatic** and **Save lineup**.

These controls edit participants and order, not the official time window or
presentation durations. An override affects only its selected date. Future-day
public business identities remain hidden until that Ethiopia calendar day.

## Sponsor mentions and broadcast

Use **Manage sponsors** to manage the existing ordered active sponsor placements.
The two chronological mention slots use that order. If there are fewer than
two placements, the sequence repeats; missing sponsors remain unassigned.
The admin agenda names each placement so the host can review it before going live.
Sponsor placement does not determine which businesses receive editorial features.

AfricMade supplies the running order and public timetable. The team starts and runs
TikTok itself; there is no automatic TikTok broadcast creation or start command.

## Release notes

S182 needs no database migration. Historical timing-policy and manual-lineup rows
are retained. Older oversized manual lineups display at most four businesses;
the new editor enforces the four-business limit. Rollback restores the previous
application code, which can still read those retained rows.
