# Controlled MVP launch checklist

Current MirtPage work and qualification live in the
[active delivery checklist](AFRICMADE-TRANSITION-CHECKLIST.md) and
[DEP-049](../specs/deployment/DEP-049-africmade-domain-and-app-cutover.md).
Netlify is the host; existing Supabase remains the managed data/Auth/media target.
BE-035/DEP-031 retire all executable file-database tooling. The inherited pilot
checks below are historical reference, not current commands or proof of readiness.
Do not run retired cutover commands or recreate the former Vercel topology.

## Historical pilot checks

- [ ] Confirm all release-affecting specs are `done` and `npm run validate:specs` passes.
- [ ] Confirm traceability includes implementation, tests, rollout and rollback evidence.
- [ ] Set a production HTTPS `NEXT_PUBLIC_APP_URL`.
- [ ] Set `SUQPAGE_DATABASE_DRIVER=postgres` and the Supabase transaction
      pooler URL only in the verified Netlify Production secret store, through the
      current scoped settings review. Keep the direct URL operator-only.
- [ ] If using Supabase Storage, create a private bucket, configure server-only
      credentials, complete the copy-only hash verification, and retain local
      source media through the rollback window.
- [ ] Generate a private `PRIVACY_SALT` of at least 24 characters.
- [ ] Back up and quiesce SQLite, run `npm run cutover:postgres` against an empty
      target, and retain the successful reconciliation output. Never use reset.
- [ ] Change every temporary or migrated account password.
- [ ] Reset any password previously distributed with the audited prototype.
- [ ] Configure each business’s real WhatsApp, Telegram, TikTok and notification email.
- [ ] Configure `NEXT_PUBLIC_SUQPAGE_TIKTOK_URL` and `NEXT_PUBLIC_SUQPAGE_YOUTUBE_URL` with Suqpage's exact public profiles before promoting Daily Featured Showrooms broadcasts.
- [ ] Confirm only approved businesses are `active`; keep unfinished showrooms `draft`.
- [ ] Submit a public expression of interest and confirm an administrator can
      review it with zero attachments; confirm public multipart upload is rejected.
- [ ] Confirm marketplace search updates without a submit button and preserves
      industry, region/city, map/list, and Daily Featured Showrooms day state.
- [ ] Confirm one process video loads only after activation inside the combined
      Story and process chapter and only from `youtube-nocookie.com`.
- [ ] Confirm the imported design creates a labeled image checklist, an authorized
      staff member can fulfill a slot, and the live showroom remains unchanged.
- [ ] Confirm staff can edit imported settings, layout/style, page content, and
      offerings, then export the exact current private design.
- [ ] Configure HTTPS and proxy forwarding.
- [ ] Create a backup and perform a test restore.
- [ ] Confirm `/api/health` is monitored.
- [ ] Require pull requests plus the `core`, `browser`, `container`,
      `dependency`, and `postgres` GitHub checks on `main`; block force-pushes
      and branch deletion. Follow `docs/DEVOPS-RUNBOOK.md`.
- [ ] Confirm the real privacy and operating terms are acceptable for the launch jurisdiction.

## Pilot operations

- [ ] Review new inquiries daily.
- [ ] Review new onboarding and change requests daily.
- [ ] Back up the database and configured media source at least daily.
- [ ] Monitor failed login and abuse entries in `audit_logs`.
- [ ] Keep the application to one running instance.
- [ ] Confirm old Delivery and Malikt URLs return 404 and no workspace exposes a
      logistics action.
