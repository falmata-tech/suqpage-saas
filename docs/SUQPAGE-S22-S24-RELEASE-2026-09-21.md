# Suqpage S22–S24 release — 2026-09-21

The owner visually approved the local candidate and authorized deployment. This
release adds the optional search/results drawer over a full map, All categories
by default, consistent inquiry-list wording, recognizable category illustrations
and shorter public/workspace copy. The workflow audit fixes email-only staff and
invitation entry, obsolete password controls, shadowed public-contact fields,
false success on missing inquiries and inaccurate publication guidance.

Controlling contracts: FE-038/BE-031, FE-041, FE-042/BE-040, FE-044,
FE-048/BE-041 and DEP-037. Existing tenant IDs, data and permissions are preserved.

## Verification

Focused domain, persistence, privacy, accessibility and browser checks passed at
1440/390/320. The complete `npm run check`, release/build/dependency audit, archive operations,
all nine isolated provider browser scenarios and final Netlify packaging/privacy
checks pass. Production dependency
audit reports zero vulnerabilities. The isolated provider browser gate includes the delegated release HTTP smoke.

Two old source-layout assertions were updated to verify the new labelled,
keyboard-accessible drawer/category component. The first archive operations run
hit a disposable-container startup connection failure; one retry passed all
archive integrity, populated-target denial and restore checks. No product check
was weakened. No production retry or recovery mutation was involved.

## Recovery and target

Production site `26c795eb-5560-4a88-b38d-3cc922c2a5e6`, account
`5d8a1491d8dc83018e9f4814`, domain https://suqpage.com and prior deployment
`6ab0dfee5b7bbcd1cb221ce6` were independently verified. The protected public-schema
archive parsed and restored all 56 tables, preserving 3,597 application records
across 55 application tables. Schema 48 requires no migration; repeat is a no-op.
Archive SHA-256: `9d3bbe452077f7358b45579018611f7e261fd5a11840c371f280642fc228ffed`.
The archive includes search extensions, excludes Auth identities and Storage
objects, and remains owner-only outside Git and the published artifact.

Rollback republishes `6ab0dfee5b7bbcd1cb221ce6`. No database, Storage, Auth, SMTP,
DNS or environment configuration changes are part of this rollout. Email-only
accounts remain usable through OTP if application code is rolled back.

## Rollout

Source `c565f917281238333fbebc260ed40942a92fb6de` is published as Netlify `6ab13a1acad8a70492ba56a9` at https://suqpage.com.
Independent provider readback confirms the expected source and ready deployment;
a subsequent monitoring check confirms that deployment remains active and healthy.
Fifteen public/entry/health/search checks and the www redirect pass. Live category,
About, Featured and independent single/group inquiry checks pass at 1440/390/320.
Separate live pagination checks reach page 2 at all three widths. The desktop
map-state check proves retained page/results, map identity/zoom/bounds and keyboard
focus/Escape/inert behavior. No inquiry was sent.

The combined live drawer test remains inconclusive under variable network timing.
Measured successful pagination took 9–10 seconds; direct public HTML/CSS requests
took 8–12 seconds from the verification machine. The initial Escape assertion
also raced next-frame focus transfer. The test now waits for rendered markers and
focus, uses DOM readiness instead of generic network idle, and allows bounded
30-second hosted navigation while retaining short local interaction assertions.
A later phone run still timed out waiting for markers, so complete live phone-map
interaction verification is not claimed. The updated full drawer test passes locally at 1440/390/320, including focus,
Escape, retained filters/pages, stable map, previews and reduced motion. All nine
isolated provider browser scenarios also pass; these remain separate from the
hosted phone-map verification limitation.

No Git push occurred. The unrelated user-owned `deno.lock` remains untouched.

## Limits

Real external email delivery and authenticated hosted owner/admin sessions have
not been exercised; isolated local provider workflows provide the automated
Auth/tenant evidence. Demo contact destinations remain examples. Inquiry email
alerts require their separate Resend configuration; the persisted dashboard inbox
works independently of email. Live verification sent no customer inquiries. Complete live phone-map interaction
verification remains outstanding after loading/marker timeouts.
