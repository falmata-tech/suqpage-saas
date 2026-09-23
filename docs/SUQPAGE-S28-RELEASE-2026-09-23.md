# Product gallery, starter and handle release

The owner approved the reviewed visual result and instructed deployment on
2026-09-23. This releases S26–S28: FE-050/BE-042/DEP-039 and
FE-051/BE-043/DEP-040, with the final automatic signup behavior superseding the
intermediate manual signup-handle design.

Products and services support an ordered gallery of up to eight photos and four
YouTube links. Buyers use thumbnails, arrows, keyboard and horizontal touch
scrolling; videos activate only on demand. Owners add, remove and reorder media.
The first photo remains the card/search cover and older offerings retain their
existing image/video without a bulk content rewrite. Media ownership, retained
snapshots, cleanup and the five-megabyte combined upload limit remain enforced.

Signup assigns an available handle and opens a populated private page preview
with editable sample galleries. Owners can change the handle immediately the
first time, then once per 30 days; support administrators have an audited override.
Old handles stay reserved and redirect to the new public address. Private and
suspended visibility stays enforced. The Suqpage wordmark uses the same Latin
font across all interface languages.

## Release evidence

Focused PostgreSQL, security, media-retention and browser checks passed before
visual approval, including desktop/390/320 captures, mixed galleries, repeated
save without reupload, collisions/concurrency/cooldown, signup preview, old links
and identical wordmark pixels in all five languages.

Full `npm run check`, `npm run release`, operations recovery and all nine isolated
Supabase production-mode browser acceptance scenarios pass. The dependency audit
reports zero vulnerabilities. The first full check stopped because the isolated
source copy lacked Git metadata; the complete rerun passes after initializing
that isolated repository, without changing or weakening the test. Shutdown logs
show canceled response streams after all browser tests passed; no test failed.

The exact Netlify archive passes private-path/credential exclusion, source-byte
comparison, dynamic Auth-route checks and a real PNG transform in Linux/x64 Node
24. Archive SHA-256:
`c6e08503edde4474ea9e0e5d581f2cac4b9cd05ac6e9e65a9aa1863592deec1f`.
No hosted credentials were supplied to the build.

## Data and recovery

Target: Netlify site `26c795eb-5560-4a88-b38d-3cc922c2a5e6`, account
`5d8a1491d8dc83018e9f4814`, https://suqpage.com; Supabase project
`sjeiiqxgscuqajpgddcc`. Previous live deployment and application rollback target:
`6ab399ae7a6f90b9daec07dc`.

A fresh protected public PostgreSQL backup restores successfully: 56 tables,
3,660 existing application rows across 55 tables. Schema 49 adds ordered product
media; schema 50 adds handle-change timestamps and a reserved-handle registry.
The local restore/migration/reapply rehearsal preserves all pre-existing field
values and passes anonymous/authenticated denial for the server-only registry.
Repeat migration is a no-op. Production application and schema publication are
pending final gates and independent readback.

Protected evidence remains under `.local/publish-s28-20260923/`. No credentials,
private backups, demo sign-in directory or unrelated `deno.lock` enter the build
or task commit. DEP-041 demo account aliases are retained. Rollback republishes
the previous application and keeps additive gallery/handle data; never drop the
new columns/registry or restore a stale database over new customer activity.
No hosted Auth configuration, SMTP, DNS or public demo-contact changes are included.

## Limits

Local browser tests use isolated provider sessions and mail capture. Actual
external video playback and inbox delivery are separate from gallery interaction
and session verification. Examples remain editable private starters; existing
business content is not replaced. A fixture reset recreates generic seed emails;
see `docs/SUQPAGE-DEMO-ACCOUNT-ACCESS.md` for the private current alias directory.
