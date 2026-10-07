# Web and Android tester release — S69/S70

FE-051 / FE-053 / DEP-042. Source:
`6c27025db6d84cecda43c952597926955aecb71d`. The owner approved the combined
first setup, preview/Edit journey, native logo correction and one replacement
free internal APK under the existing two-advisory tooling exception.

## Owner experience

After email verification, one screen collects the essential account and business
details, including the chosen handle. Availability feedback is bounded and
debounced; signup still claims the name atomically in PostgreSQL. A failed signup
refreshes availability without clearing the other inputs. Older callers retain
automatic handle generation.

The completed private sample opens in preview, with its saved cover, logo,
description, contacts and three example offerings. Edit opens the controls;
unchanged initial preview has no Save prompt. Later handle changes belong in
Page editing, with the existing first-change/30-day interval, reserved aliases
and audited support exception. Account security retains its own controls.
Publication remains deliberate and guarded; no sample is automatically public.

Native static seed SVGs now use the already-installed SVG renderer, fixing blank
business logos and sponsor illustrations without adding dependencies. Other
photos/private-media handling and the Suqpage design remain unchanged.

## Published web

- Live: [suqpage.com](https://suqpage.com).
- Netlify deploy: `6ac5c9940ee5deb5294319ef`, exact source above.
- Site: `26c795eb-5560-4a88-b38d-3cc922c2a5e6`.
- Code rollback: previous deploy `6ac576417f18a89035f75274`.
- Packaged function SHA-256:
  `391c5dd2bf7790017eb89425f6b181b6b3dbf560e7815716f8b73f55d109eabf`.

Independent target verification, clean isolated install, web release and operations
gates pass. Linux handler/image, packaged health/login, archive privacy/native-tool
exclusion and exact upload-cache hash pass. One packaging attempt ran from the
wrong working directory/order; corrected preparation and one controlled rebuild
passed before deployment. No failed artifact was published.

Live association, health, login, Featured, showroom and mobile catalog checks
return 200. The HTTPS association JSON retains the exact signing identity, with
no redirect. Forty-four public desktop/phone locale/layout states pass on the
live deployment; tile imagery is controlled in browser captures, while catalog
and application data are live. Read-only post-deploy verification also confirms
all 64 saved live demo accents on HTML and native API. No OTP, production account
or message was created.
Schema 59, Auth, SMTP, DNS and provider credentials were not changed by this
code rollout. Protected evidence: `.local/web-s70/`.

## Android download

[Install the replacement Android APK](https://expo.dev/accounts/falmatad/projects/suqpage/builds/9bcabbdb-14eb-420d-a2cf-8d84e0ec8c75).

Build `9bcabbdb-14eb-420d-a2cf-8d84e0ec8c75` is FINISHED, owned by `falmatad`,
project `bfc289fb-238e-44a3-9e0f-fec6a7c857d1`. It uses the existing free
internal preview profile and signing identity, package `com.suqpage.app.preview`,
and the production API at `https://suqpage.com`. Metro and Expo Go are unnecessary.
The prior S67 APK is superseded. Expo currently lists artifact expiration as
2026-10-21; retain the protected downloaded APK for later local testing.

- APK size: 152,466,225 bytes.
- APK SHA-256:
  `7c830414e7dd67cc49e87b9f8123af3e78befc899e403a1b6d6289b08af6b436`.
- Signing certificate SHA-256:
  `06:30:C5:6F:88:DF:87:4F:D2:72:96:D1:AA:08:48:A6:8F:C8:34:5F:70:2F:E6:80:2E:DD:82:55:B7:21:11:83`.
- Clean EAS archive: 1,496 files, zero private paths; 19 required code/config
  files byte-match the committed source.
- Final Android export: 1,571 runtime sources, neither admitted tooling root.
- APK signature/manifest and four native MapLibre libraries verified; 10,967
  decoded Hermes string entries inspected without private-key values.

The downloaded APK installs successfully. Android verifies `suqpage.com` for
the actual preview package; cold filtered-search and warm store HTTPS intents
open that app without forcing a package. Its corrected SVG store logo renders
in the unchanged layout. All five native locale switches, public Market/About/
email entry, Featured/category SVG display and gallery next/thumbnail restoration
pass. The available honey video plays inside Suqpage in this final APK; the
activity remains the preview app. The first screen checks
were interrupted by an Android System UI/launcher gesture ANR; a scoped process
restart and bounded retry passed. Original interrupted attempts are preserved,
not reported as a clean first run. Protected artifact/signature/device evidence:
`.local/rebuild-s69/`.

## Gates and limitations

Full `npm run check`, both typechecks and 167-spec validation pass. Eight locale
tests cover 1,257 messages per non-English catalog. PostgreSQL signup concurrency,
atomicity, tenant/cooldown/alias and native API regressions pass. Five-language
combined setup/private preview and actual local chosen signup, Page rename,
contact removal, upload, offering edits, location save and first publication pass.

Release build/trace privacy, provider HTTP smoke, scale, security, media/adapter
and owner stages pass. All eleven distinct production-mode acceptance workflows
have passing evidence: ten in the full run, then the remaining owner workflow in
a focused rerun after its harness was updated to enter Edit from the new private
preview. The original full invocation remains recorded as failed; it is not
reported as one green full run.

The isolated web audit is clean. The full native-toolchain audit remains failed:
20 high graph findings, zero critical, exactly the existing braces and node-forge
advisory roots. The owner-approved exception admitted this single replacement
internal APK; it is now consumed and does not authorize another build or a Play
release. No audit check was suppressed and no additional advisory accepted.

Physical-phone real-inbox delivery, installed social-app handoffs, independent
native-speaker review, iOS and Google Play remain unverified/deferred. No tester
invitations were sent. Aloe's existing example video is unavailable; its bounded
retry state is retained. The available honey video plays inside the final signed
APK. No media was replaced under the color-only approval.

The separate approved accent operation saved one logo-led accent with derived
shades for 66 local and 64 existing live demos; two local-only demos were not
recreated in production. New starters retain Default and real businesses stay
unchanged. See [the accent operation record](DEMO-ACCENT-ROLLOUT-2026-10-06.md).

Local web/API: <http://127.0.0.1:3102>; Expo browser: <http://localhost:8082>.
Local codes use <http://127.0.0.1:54324>; this standalone APK uses live email
delivery. No Git push occurred. The unrelated untracked `deno.lock` is preserved.
