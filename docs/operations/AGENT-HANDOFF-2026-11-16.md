# AfricMade agent handoff — 2026-11-16

Read [AGENTS.md](../../AGENTS.md), the [active checklist](../AFRICMADE-TRANSITION-CHECKLIST.md), and [traceability](../../specs/TRACEABILITY.md) before making changes. This is a dated status check, not permission to change hosted data.

## Verified state

- GitHub `main` and the Netlify web deployment reported `89b6f584` when checked. The public Market Agriculture filter showed listings from all six reviewed growers; the public discovery API returned six businesses. The real-business-only `/showrooms` SEO directory was empty as designed for the current example data.
- The exact grower IDs 5, 6, 27, 29, 31 and 33 have Agriculture plus Food & drink membership. Food mills 28 and 32 remain Food-primary. No category key was added.
- The simulator control is `enabled=0`, `pause_reason='operator'` at the owner's direction. All 64 enrollments remain active, with no pending requests. Its scheduled Netlify function can still invoke, but it advances no stages while disabled. The six growers' saved category bindings and expected hashes still describe Food only; reconcile these exact records and verify a stage before any future resume. There is no midnight wait for the category fix.
- The last 15 demo showrooms' cover and product video corrections were applied through guarded requests. Their readback covered all 66 active demo covers and 264 product video slots. Deployed MP4 size and byte-range checks passed; representative phone playback passed. This does not establish installed Android playback for every item.
- The separate showroom **process-video** task remains open in the active checklist. Source PRs #106, #113 and #114 packaged assets, corrected the two unenrolled legacy refs and added the guarded operator. Do not infer that the 53 enrolled process refs were changed: the checklist's hosted application and all-player readback gates remain unchecked. Confirm exact live state before any new correction. Liya's separate phone-player follow-up also remains open.
- The Expo **web** preview ran locally on port 8083 against API port 3104 and was checked in desktop and phone-sized Chromium. No Expo hosted-device session or new signed Android release was qualified. S191 owns the latter.
- S200's public one-badge and demo copy correction reached main in #118, #120 and #121. S199's remaining private owner/staff helper-copy review is still open in the active checklist.

## Local work and publication decision

The current main checkout is clean. Twelve historical worktrees have local files or edits. No unique, qualified product fix was found in them to publish wholesale. `legacy-starter-guard` product changes are already merged in #110; `s197-process-video` contains an older social-player approach; `s197-replacements` has an obsolete tick assumption; `s197-video-credit` conflicts with the one-badge direction. The other dirty trees chiefly hold dependency installs, private data or unpublished QA experiments. Preserve them for review; do not bulk stage, force-push, or publish internal fixtures. The older `work` branch has commits that diverge by ancestry after squash merges and should not be treated as a release branch.

## Next agent's shortest useful path

1. Recheck main, live health, simulator control and the exact S197 process refs before claiming completion. Keep the simulator off unless the owner requests its return.
2. Finish the 53 enrolled process-video corrections through the guarded BE-049 path only if live readback confirms they are still needed; verify public web and Expo playback and retained page/product facts. Keep the Liya phone-player follow-up distinct.
3. Finish the remaining S199 private form copy review and checks without changing the single public `Example business` badge.
4. Treat the signed Android successor, physical device checks, push and Play testing as open S191 work. The local Expo web viewport is not a native-device test.

Historical receipts and exact protected before-images remain outside Git. The 2026-11-14 [handoff](AGENT-HANDOFF.md) is historical and predates the corrections above.
