# AfricMade agent handoff — 2026-11-14

This is a source and evidence checkpoint for the owner-requested agent transfer.
It does not mark unfinished work complete or authorize a production repair.
Verified against GitHub main and draft heads on 2026-11-14. Start with
[AGENTS](../../AGENTS.md), [master brief](../../AFRICMADE-MASTER-PROMPT.md),
[spec workflow](../../specs/README.md), the
[active checklist](../AFRICMADE-TRANSITION-CHECKLIST.md), then
[traceability](../../specs/TRACEABILITY.md), especially S197, S196 and S191.
Those owning contracts remain authoritative; the dated observations below are
historical evidence, not a claim about a later live environment.

## What is actually published

| Work | GitHub location | State at handoff |
| --- | --- | --- |
| Simulator and guarded media-maintenance command | Main `b5486408ec4200e0e53af3b46ba28f9a95c5075e`, tree `49aa8f9d0bb471b6c007021353784f7e8bdaa67c`; PR66 merged | Integrated and deployed; no demo videos replaced |
| Actual Android TikTok experiment | [PR67](https://github.com/falmata-tech/suqpage-saas/pull/67), `test/fe-057-live-tiktok`, head `fc020396ddea5c9005605d36041a14fe5af9589d` | Pushed draft; finite synthetic soap fixture, do not merge wholesale |
| Actual web/Expo provider experiment | [PR68](https://github.com/falmata-tech/suqpage-saas/pull/68), `test/fe-057-live-web-media`, head `4a1db0078e37bceba7d187b26e1a6db1c72850f4` | Pushed draft based on PR67; contains the portrait candidate and its geometry test; do not merge wholesale |
| Compatible native tooling security fix | [PR69](https://github.com/falmata-tech/suqpage-saas/pull/69), `fix/dep-042-compatible-native-tooling`, head `f913eff44ab9c9ee68449d2d9bf39638656427a8`, tree `9d08b9feac3bdcf0b5aefac16f24cc92c1049c5e` | Pushed draft; all five required quality jobs pass; rebuilt Android QA remains unqualified after adb failure |
| Remaining local portrait edits | [Exact six-file patch](handoff-2026-11-14/portrait-player-candidate.patch) | Preserved here without changing runtime files; applies to PR69 head, not main; incomplete visual fix |
| Media inventory and source review | [64/256 inventory](handoff-2026-11-14/public-demo-video-inventory.json), [review notes](handoff-2026-11-14/MEDIA-REVIEW.md) | Public references only; candidate mappings remain incomplete and unadmitted |

The website is published by Netlify's existing Git connection to protected main.
Last verified deployment `6af801bd1efb5643dfad1c6b` reports the main source above
and site `26c795eb-5560-4a88-b38d-3cc922c2a5e6`. Branch/PR previews remain disabled
until their backend is isolated. Do not add another publisher or deploy a finite
QA branch. Recheck live health and deployment before later operational work.

## Evidence and failures to preserve

- PR67: required quality run [43607030261](https://github.com/falmata-tech/suqpage-saas/actions/runs/43607030261) passes.
  Android [43607030339](https://github.com/falmata-tech/suqpage-saas/actions/runs/43607030339), attempt2,
  passes real navigation, live product update, TikTok progress 0:00 to0:16,
  Photo1 player unmount, retained Back/search and one authoritative isolated
  inquiry. Attempt1 lost adb during later inquiry entry; preserve that failure.
  Earlier multiword-search and gallery-scroll failures are not claimed product fixes.
- PR68: all five required jobs in [43610368525](https://github.com/falmata-tech/suqpage-saas/actions/runs/43610368525) pass.
  [43610368553](https://github.com/falmata-tech/suqpage-saas/actions/runs/43610368553)
  passes real Google Chrome157 headless desktop1440/phone390 and Expo web390,
  actual decoded TikTok product/story playback, direct loopback API and unmount.
  Artifact `14119822637`, SHA256 `d6baf2a07119853b02cd6011a7bbdc9f75f3890fb1bd7a78cf802077b8636f2a`,
  retains the synthetic screenshots/review report until2026-11-21.
  **Visual verdict is partial/fail for complete product-frame containment:**
  phone product screenshot `web-390-progress.png` still crops the portrait frame
  vertically; desktop product also clips compared with the intended full frame.
  Story covers and Expo show the full portrait frame. The numeric iframe9:16
  test passes but checks horizontal containment only; it does not prove the
  iframe fits the visible stage vertically. Add vertical containment and actual
  product-gallery review before treating the candidate as fixed.
- PR69: [43609385783](https://github.com/falmata-tech/suqpage-saas/actions/runs/43609385783)
  passes core/browser/container/dependency/postgres. Clean full native audit
  reports zero findings; meaningful fingerprint path/hash/adversarial cases pass.
  Expo57 patch and scoped fingerprint minimatch override preserve the SDK major,
  React Native version, release identity and guards. The historical DEP-044
  release document is unchanged; current evidence belongs in DEP-042.
  [43609385834](https://github.com/falmata-tech/suqpage-saas/actions/runs/43609385834)
  successfully compiles and validates the separate QA APK, then fails actual
  emulator interaction: `adb ... uiautomator dump` exits255. This is an observed
  emulator communication failure, not a passed UI run or signed release.
  Diagnose current evidence before the repository's bounded retry; do not weaken
  the test, replace its identity, or claim compilation proves usability.

Downloaded review artifacts are temporary. Preserve concise source-bound verdicts
in the owning documents before they expire; do not commit raw logs/screenshots.
This handoff intentionally records the phone cropping that the green run missed.

## S197 — video cleanup is not finished

Scope: all64 public demos and all256 current published products. Real/new merchants
and private draft reviewer business71 are excluded. Keep names, original stories,
photos/order, contacts, selling facts and scenario progress. Demo WhatsApp and
Telegram stay `+19528552202`. National origin is not a quality test; suitability,
clear footage and actual playback govern selection. Retain the liked farm/wheat
clips where relevant. A qualified story clip may serve related products. Include
a suitable TikTok example with inline web/native evidence.

No production control pause, media request or replacement has been applied for
this cleanup. The remaining candidate patch is not a completed delivery. The
full per-business/product replacement manifest has not been admitted.

Next sequence:

1. Resolve the product-stage vertical containment defect and qualify actual
   full-frame playback, unmount and error handling on web/phone/Expo. Keep the
   finite QA fixture out of production; port only the coherent fix/test/specs.
2. Complete primary-source review and each business/product mapping using the
   attached inventory and notes. Existing YouTube runner failures remain
   unverified; a title, thumbnail or successful page load cannot admit a clip.
3. Finish PR69's rebuilt native QA qualification and normal protected integration
   when ready. A portrait task based on its head must declare that dependency.
   Recheck current heads/checks/reviews; do not force-push or bypass protection.
4. Follow BE-049/BE-067/FE-061/FE-057 and DEP-054: retain the exact protected
   before-image and admitted plan, then use the deployed finite maintenance path
   through ordinary product/page writes. The exact operator pause is required
   by that command; do not pause production while still curating.
5. Submit at most one pending media correction at a time. Preserve optimistic
   versions, bound identities, exact before-media and immutable history. An
   ambiguous remote result stops further writes; no blind reset/hash refresh,
   re-enrollment, direct snapshot updates or automatic rollback.
6. Verify all64/256 effective public media plus protected facts and scheduled
   continuation. Retain an approved after-image, then reconcile the read-only
   monitor's media baseline and its request-kind counts. Existing monitoring
   expects64 accepted enrollment requests; planned media receipts must not be
   mistaken for foreign enrollment or silently ignored.

## S191 — no new signed phone APK

The last recorded canonical `com.africmade.app` artifact is version3 and is held
from Play. The requested successor is version4. Emulator/debug `com.africmade.qa`
artifacts and Metro development clients are not the requested phone release.

Authentic signing material was previously located in the retained provider
account, but its recoverable key/password are not available in the resumed build
environment. The authentic Firebase client and predecessor signed APK are also
absent there. Use the exact expected identities/hashes and admission procedures
in DEP-044/DEP-042; obtain the real protected inputs or a verified provider
session. Do not fabricate configuration, generate a replacement signing key,
reuse another project's files, reuse consumed exceptions or bypass admission.
Finish independent native QA first. Physical-device installation,16-KB runtime,
owner Auth, push and Play checks remain separate unfinished qualification.
The deferred Google support-mail verification/SMTP work remains deferred.

## Production simulator and read-only monitoring

BE-009/BE-067/FE-079/DEP-054 and S196 own the deployed service. It is a dedicated
Netlify scheduled function using the existing Supabase PostgreSQL application
ports, not a VM. It advances predefined coherent whole-business catalogs through
ordinary upkeep/page publication. At most two businesses advance per minute;
hosted yielding currently gives roughly one. Normal full rotation takes32–64
successful minute ticks. Do not require every business/product to change in a
90-second sample; individual starvation requires a wait beyond70minutes while
global work otherwise advances.

The latest completed read-only observation at2026-11-14T17:24:02Z passed:64 active
enrollments/256 products/64 accepted requests;991 successful stages total,
781 whole-catalog stages since resume; latest global age56.6s, max wait63.97min.
All64 public shops and2048 product fields match exact immutable catalog/page
versions and predefined phases;4 revisions advanced and60 remained unchanged
over184seconds. No failure/pause/duplicate/oversized/foreign effect was found.
Real merchants, private reviewer, names/effective media/contacts and retained
history were preserved. Database34,663,571bytes is12.913% of268,435,456; measured
forecasts8.38days at the maximum cadence and9.89days for that short observed
interval. Those are dated estimates, not a new live guarantee.

Keep daily2880 and storage268435456-byte limits. Monitor membership SHA256
`e0e8d690c63cb269e59aada7a62c9b8a8bbbf78e3520492849f11c8ce86225af`.
The protected recovery file is `africmade-full-demo-before-20261114.json`, SHA256
`83e4974af258482de366b811b698aaab8b95a0763bfeb3d7223492c9e99ff263`.
Its private owner/provider bindings and full monitoring observation stay outside
Git. The owner can provide the protected files through the private file channel.
Do not copy private identities, credentials or customer data into this handoff.

Read-only monitor runs never enroll, enable, pause, reset, trigger or repair;
they never change Auth/contacts/customer data/billing or send inquiries. Compare
the exact public revision with immutable versions to tolerate concurrent commits.
Ordinary real-merchant edits are legitimate; inspect simulator attribution before
calling them corruption. New signups default `is_demo=0`. Warn on storage above80%
or a measured exhaustion forecast within seven days; do not raise budgets/delete
history. If access fails, report verification unavailable, never claim health.

## Recovering this checkpoint

The handoff branch is docs-only: `docs/dep-002-agent-handoff-20261114`, based on
main `b548640`. It changes no runtime file or production configuration. The
portrait patch was captured from PR69's exact head; fetch that parent before
applying it in a separate task branch, and run `git apply --unidiff-zero --check` first.
It includes the component, focused test, workflow registration and related
master/spec/checklist edits. Do not mistake preserving the patch for approval to
merge it. PR67/68 contain all finite QA scripts needed to reproduce their runs.
Local caches, generated dependencies and browser sessions are disposable; use
GitHub source/evidence and the protected inputs rather than relying on them.
