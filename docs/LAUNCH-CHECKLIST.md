# Controlled MVP launch checklist

## Required before launch

- [ ] Confirm all release-affecting specs are `done` and `npm run validate:specs` passes.
- [ ] Confirm traceability includes implementation, tests, rollout and rollback evidence.
- [ ] Set a production HTTPS `NEXT_PUBLIC_APP_URL`.
- [ ] Set an absolute persistent `MIRTPAGE_DB_PATH` and backup path. In
      filesystem media mode, also set a persistent `MIRTPAGE_MEDIA_ROOT`.
- [ ] If using Supabase Storage, create a private bucket, configure server-only
      credentials, complete the copy-only hash verification, and retain local
      source media through the rollback window.
- [ ] Generate a private `PRIVACY_SALT` of at least 24 characters.
- [ ] Run `npm ci`, `npm run migrate`, and `npm run release` against an existing
      database. Use `npm run reset` only for a new empty installation.
- [ ] Change every temporary or migrated account password.
- [ ] Reset any password previously distributed with the audited prototype.
- [ ] Configure each business’s real WhatsApp, Telegram, TikTok and notification email.
- [ ] Confirm only approved businesses are `active`; keep unfinished showrooms `draft`.
- [ ] Submit a public expression of interest and confirm an administrator can
      review it with zero attachments; confirm public multipart upload is rejected.
- [ ] Confirm marketplace search updates without a submit button and preserves
      industry, production scale, map/list, and Expo day state.
- [ ] Confirm one process video loads only after activation inside a showroom
      Process section and only from `youtube-nocookie.com`.
- [ ] Confirm the imported design creates a labeled image checklist, an authorized
      staff member can fulfill a slot, and the live showroom remains unchanged.
- [ ] Confirm staff can edit imported settings, layout/style, page content, and
      offerings, then export the exact current private design.
- [ ] Configure HTTPS and proxy forwarding.
- [ ] Create a backup and perform a test restore.
- [ ] Confirm `/api/health` is monitored.
- [ ] Require pull requests plus the `core`, `browser`, and `container` GitHub
      checks on `main`; block force-pushes and branch deletion.
- [ ] Confirm the real privacy and operating terms are acceptable for the launch jurisdiction.

## Pilot operations

- [ ] Review new inquiries daily.
- [ ] Review new onboarding and change requests daily.
- [ ] Back up the database and configured media source at least daily.
- [ ] Monitor failed login and abuse entries in `audit_logs`.
- [ ] Keep the application to one running instance.
- [ ] Confirm old Delivery and Malikt URLs return 404 and no workspace exposes a
      logistics action.
