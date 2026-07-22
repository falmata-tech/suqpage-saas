# Controlled MVP launch checklist

## Required before launch

- [ ] Confirm all release-affecting specs are `done` and `npm run validate:specs` passes.
- [ ] Confirm traceability includes implementation, tests, rollout and rollback evidence.
- [ ] Set a production HTTPS `NEXT_PUBLIC_APP_URL`.
- [ ] Set absolute persistent `SUQPAGE_DB_PATH` and `SUQPAGE_MEDIA_ROOT` paths.
- [ ] Generate a private `PRIVACY_SALT` of at least 24 characters.
- [ ] Run `npm ci`, `npm run migrate` or `npm run reset`, and `npm run release`.
- [ ] Change every temporary or migrated account password.
- [ ] Reset any password previously distributed with the audited prototype.
- [ ] Configure each business’s real WhatsApp, Telegram, TikTok and notification email.
- [ ] Confirm only approved businesses are `active`; keep unfinished showrooms `draft`.
- [ ] Submit a public expression of interest and confirm an administrator can
      review it with zero attachments; confirm public multipart upload is rejected.
- [ ] Configure HTTPS and proxy forwarding.
- [ ] Create a backup and perform a test restore.
- [ ] Confirm `/api/health` is monitored.
- [ ] Require pull requests plus the `core`, `browser`, and `container` GitHub
      checks on `main`; block force-pushes and branch deletion.
- [ ] Confirm the real privacy and operating terms are acceptable for the launch jurisdiction.

## Pilot operations

- [ ] Review new inquiries daily.
- [ ] Review new onboarding and change requests daily.
- [ ] Back up the database and media at least daily.
- [ ] Monitor failed login and abuse entries in `audit_logs`.
- [ ] Keep the application to one running instance.
- [ ] Do not describe the local delivery adapter as a live Malikt Board integration.
