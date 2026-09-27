# Suqpage web release — 2026-09-27

Scope: the owner-approved S31–S48 web changes. Mobile remains preparation only.
No Auth, SMTP, DNS or hosted Realtime configuration change is included.

## Candidate

- Compact, clearable category/location filters and one paginated search result list;
  map previews remain usable with the drawer open on phones and desktop.
- Clear product inquiry actions, consistent branding, localized interface copy,
  and the 8:30 PM–midnight Ethiopia featured schedule.
- Owner starter content and publication readiness, live page saves and retained galleries.
- Buying assistance with visitor messages, staff replies, private notes, assignment,
  End chat, retained contact/history and separate resolution. General guest support
  remains closed; owners retain dashboard support.
- Product/header video requests enter business support. Staff may approve a supported
  YouTube URL from any channel. Examples remain until approval; unrelated content is preserved.

## Verification

Locked install, optimized release/build, operations backup/restore, artifact privacy,
dynamic Auth routes and the exact Linux/x64 native image transform pass. Complete
check-chain continuation passes after a disposable demo fixture exceeded its original
180-second bound under concurrent load; the isolated retry used the unchanged bound.
The original failed log is retained alongside the successful continuation.

Production-mode browser coverage includes signup/email codes, account privacy,
owner editing/publishing, gallery uploads, product inquiries, staff permissions,
search/category/pagination, mobile map, and buying replies/private notes/history.
The owner fixture was updated to replace its starter products/contacts before Publish,
matching the existing readiness contract. Video review verification waits for the
staff server action before refreshing the owner page. All 11 browser workflows now pass across the initial run and focused reruns.
Deployment is verified at https://suqpage.com.

Private evidence: `.local/publish-s48-20260927/`. No credentials, customer records
or raw browser logs belong in this document.

## Database and rollback

The private schema-50 backup restores 57 tables / 3,821 rows. The 51–58 migration
rehearsal preserves all original-column row fingerprints, existing private notes,
closed/unresolved history, and demo identities. The new video-request table has RLS;
anonymous and authenticated provider roles cannot access it. Runtime access and a
repeat no-op migration pass. The production write must verify backup fingerprints
again immediately before mutation.

Retain the additive schema and all new request/history data on rollback. Prefer a
corrective application artifact that preserves buying messages, private notes and
video review. Do not restore the old guest-support surface, drop new fields, or
automatically restore a backup after an ambiguous write.

## Operating limits

- Staff must monitor Dashboard → Support and enable the appropriate queue/capacity
  under Support agents. Auto-assignment does not mean an agent is online.
- Live replies use five-second polling while visible, with bounded backoff. There
  is no push/SMS alert or promised response time; staff retain the callback number.
- YouTube hosting, uploading and availability remain external. Tests verify the
  selected privacy-enhanced embed, not third-party playback availability.
- Provider acceptance uses isolated local Supabase Auth/Storage; production mail
  delivery to a real inbox is not claimed by those tests.
- Demonstration contacts/media are examples, not a fulfillment guarantee.

Staff procedures: [Support and buying assistance](operations/SUPPORT-AND-TRANSPORT.md)
and [Featured schedule](operations/FEATURED-SCHEDULE.md).

## Published evidence

- Application commit: `d2ebacdaead00e73541d1db7597e5140065b0144`.
- Netlify deploy: `6ab98e309c70ac17fe871293`; site `26c795eb-5560-4a88-b38d-3cc922c2a5e6`.
- Supabase project: `sjeiiqxgscuqajpgddcc`; schema 58 verified with existing records preserved.
- Function archive SHA-256: `676da3d48755998a5df0c4a5cd7bce289d34c790bb12d7fe4885bc811a25c03c`.
- Private backup SHA-256: `5253ee6d494205944a32e646d9deb78bf57849aba1024ab0ac65ee0c06caefdd`.
- Independent live checks pass: 19 route/API/search/redirect checks, 39 public
  layout/language states, buying intake/session/dismiss at 320/390/1440, and
  actual map tiles/markers/preview focus/dismissal with an open drawer at 390/1440.
- Follow-up monitoring confirms the expected deployment and healthy runtime.
  Four production support team accounts are enabled; availability still depends
  on staff monitoring and remaining assignment capacity.

Initial live checks returned an edge-handler HTTP 502 after publication. A later
read-only request recovered without another deployment or configuration change.
The historical edge-log query returned no entries, so the underlying cause is not
proven. The complete route, mobile, buying and map retries then passed, followed by
healthy monitoring. Preserve the initial failure evidence; investigate recurrence
in Netlify edge logs rather than silently redeploying or changing Auth settings.

No real customer request, message or email was sent by the post-publication checks.
Authenticated workflows were verified against isolated production-mode providers;
the live responsive sweep covers public pages. Git publication was not requested:
the local release commit was deployed directly, without a Git push or remote CI run.
The unrelated `deno.lock` remains untracked and excluded from the release.
