# Mobile Suqpage branding release

The owner approved the mobile appearance and explicitly requested deployment on
2026-09-23. FE-038 S30 and FE-034 restore the Suqpage mark and wordmark on phones
across Market, Featured, About, sign-in and private workspaces. Public shop and
product pages fit the brand into the existing back/language row. Desktop chrome,
tenant branding, authentication, media and business data remain unchanged.
Market and Featured reserve viewport space for the compact header and bottom bar.

## Verification

Local review passed 39 public and 51 authenticated responsive checks at
1440/390/320 in all five languages. Both phone search panels retain scrollable
results, remain above the bottom navigation and collapse correctly. Typecheck,
160-spec validation and the updated PWA shell contract passed. Screenshots and
receipts are private under `.local/mobile-brand-review/`.

The isolated Netlify artifact passes source-byte comparison, private-path and
credential exclusion, dynamic account-entry checks and a real image transform
inside network-isolated Linux/x64 Node 24. Function archive SHA-256:
`5ba82b107bd87c1e98995fbbb2477095e5d69535a78db4ea31b8be874439d0c1`.
Production runtime preflight and operations recovery tests pass.
Full `npm run check`, `npm run release`, all nine isolated provider-backed
browser acceptance scenarios and operations recovery pass. The production
dependency audit reports zero vulnerabilities.

## Data and rollback

Target: https://suqpage.com, Netlify site
`26c795eb-5560-4a88-b38d-3cc922c2a5e6`, account
`5d8a1491d8dc83018e9f4814`, Supabase project `sjeiiqxgscuqajpgddcc`.
Schema remains 50; no migration, hosted Auth, SMTP or DNS change.

Fresh private PostgreSQL archive: 57 public tables and 3,781 rows restore and
match their original fingerprints. SHA-256:
`40644097e7bb0267ff19745724297cfe432639fc468ed06505cb5396ac757ae2`.
The archive excludes unchanged Auth identities and media objects. Restore needed
a temporary NOLOGIN compatibility role absent from the local test environment;
its cleanup is verified before publication. The original database is unchanged.

Rollback target: previous application deploy `6ab3c4e43c9a7f1e972648ad`.
Republish that application if required; do not restore old data over customer
activity. Private evidence resides under `.local/publish-s30-20260923/`.
The user-owned `deno.lock` is excluded. No Git push is requested.

## Publication

Pending final gates and independent live checks. No outgoing test email or
merchant-content mutation is part of verification.
