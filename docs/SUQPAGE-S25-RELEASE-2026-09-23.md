# S25 release — five-language interface and demo workflow fixes

## Scope and authorization

The owner approved the reviewed candidate and instructed completion/publication
on 2026-09-23. Suqpage only; no Loadgistic changes. FE-049/ADR-0022 add English,
Amharic, Afaan Oromo, Somali and Tigrinya interface selection across public and
role-scoped workspaces. Merchant content and submitted values remain unchanged.
FE-042 exposes more mobile results with compact optional filters and footer
paging. BE-040 ranks original title matches before broader text matches.
FE-032/FE-033 remove the redundant logo caption, use AM/PM clocks and avoid
claiming a broadcast when no stream URL is configured. FE-041 prevents lost
first inquiry-list selections. BE-018/FE-019 prevent duplicate public support
starts/replies after lost responses. Search controls wait for hydration.

## Verification

- Full `npm run check`, `npm run release` and `npm run test:operations`: pass.
- Six localization tests; 982 keys per translated catalog; 85 public/owner/admin
  browser checks at 1440/390/320: pass. Selected-catalog payload excludes server-only copy.
- Twelve immediate direct-product selections/reloads: pass. Search typing,
  spelling, rapid changes, filters, type tabs, back navigation and overflow at
  all three widths: pass. Category pagination/accessibility: pass.
- Support lost-response tests use real UI/API handlers and isolated PostgreSQL;
  transport loss is injected and external notifications are disabled.
- Actual buyer inquiry form persists the selected option to the owner inbox in
  the local workflow capture; setup, media, location, publish/save and visibility
  checks pass. Time-input tests cover all 1,440 minute values and noon/midnight.
- A disposable operations database disconnected on startup; one controlled
  retry passed unchanged checks. Old clock/localized-label and viewport test
  expectations were corrected. Map network-idle waits were replaced with
  DOM readiness plus explicit result/state assertions. No gate was weakened.
- All nine production-mode provider/browser acceptance scenarios pass.
- Final Netlify build and generated artifact privacy/source-byte verification
  pass. Publication remains pending until independent provider readback.

## Target and recovery

Netlify site `26c795eb-5560-4a88-b38d-3cc922c2a5e6`, account
`5d8a1491d8dc83018e9f4814`, https://suqpage.com, were independently verified.
Supabase project `sjeiiqxgscuqajpgddcc`, schema 48. No migration, hosted Auth,
SMTP, DNS or merchant-data update is part of this release.

A private owner-only PostgreSQL archive was made before publication and restored
into a disposable database: 56 tables, all 3,607 rows across 55 application tables
preserved; migration rerun is a schema-48 no-op. Archive SHA-256:
`38d523a5af5688b9d8035f91da99ba9985f96cf021f9a8f27ee23085b856a387`.
The archive includes public application data/search extensions, not hosted Auth
identities or Storage objects; those are unchanged. Private evidence is outside
Git and the deployed artifact under `.local/publish-s25-20260923/`.

Application rollback target: Netlify `6ab13a1acad8a70492ba56a9`. Re-publishing
that retained artifact reverses application changes without deleting support
conversations, inquiries or merchant data. A database restore is not required.

## Limits

Translations have not had native-speaker review. Technical, legacy/custom-design
terms and unknown provider errors may retain English. Outgoing inquiry text
retains the existing English template; this release localizes interface text.
Demo contacts are example destinations; actual WhatsApp/SMS/Telegram receipt
and external video playback are not established. Hosted OTP delivery and real
hosted authenticated sessions are not exercised; isolated provider acceptance
covers local provider integration. No claim of exhaustive defect coverage or
production-scale latency is made. Existing untracked `deno.lock` is excluded.

## First publication and controlled rollback

Source `0195bbd1fb03b6bf32584fd3eb0247543458f794` published as Netlify
`6ab397a6fa1799d61d40c665`. Independent homepage verification returned HTTP 500.
Function logs identified missing Linux/x64 Sharp/libvips optional dependencies
in the Mac-built archive. Existing output tracing included those paths, but
the native packages were absent from the build tree. The earlier artifact
privacy check did not test runtime native loading.

The planned rollback restored `6ab13a1acad8a70492ba56a9`; independent homepage
and health checks returned 200. No database, customer records, Auth, SMTP or
DNS configuration changed. The failed deployment remains available for diagnosis.

Recovery adds `node scripts/test-netlify-native.mjs <function.zip>` to publication
readiness. It extracts the exact archive into a private temporary directory and
performs a PNG transform using that archive's Sharp in Node 24 Linux/x64/glibc,
without network or a writable application filesystem. It rejects the first
archive with the same runtime error. A rebuild includes only the two native
packages at package-lock versions with tarball integrity verified. Record the
passing archive SHA before publication; never infer native readiness from a Mac
build or a successful JavaScript compile. Recovery publication remains pending.

Corrected archive passes Linux/x64 Node 24 PNG transformation and artifact
privacy/source verification. SHA-256:
`320b98d144c541ecff23d6c75cbc7b722e4697e815a88afbdf6de3c920b17047`.
The original archive fails the same test; no application code changed for recovery.

## Verified publication — 2026-09-23

The corrected release is live at https://suqpage.com. Netlify deployment
`6ab399ae7a6f90b9daec07dc`, source `f16f2e3131a5739a96790bd362de767cbe1aaffc`
(application change `0195bbd1fb03b6bf32584fd3eb0247543458f794`). The production
account/domain/deployment identity is independently verified; 15 public checks
pass, including health, spelling searches, email-only entry, private-route
redirects and www canonical redirect.

Live browser verification passes 20 locale/route combinations across all five
languages at desktop/390/320 widths; original-title ordering, immediate search,
direct-product inquiry-list selection/reload, and language/unsaved-email
persistence pass without browser errors or customer messages. The 390px results
screenshot was inspected: four complete product cards and visible footer paging.
The Grass product used by the local regression is absent from the production
catalog; production ranking was checked using the existing Aloe offerings.
A transient measurement before panel visibility was corrected to await visible
results; the resulting explicit layout/state assertions pass.

Post-browser monitoring confirms this deployment remains active and healthy.
The earlier pending-publication statements above are superseded by this evidence.
All application data and provider settings remain unchanged. No Git push was
requested; the pre-existing untracked deno.lock remains untouched.
