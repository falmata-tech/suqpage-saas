---
id: DEP-028
title: AfricMade identity and passwordless production cutover
status: in_progress
related: [FE-038, FE-039, BE-030, BE-031, DEP-026, DEP-027, ADR-0017]
owners: [deployment, operations, security, product]
last_updated: 2026-09-12
change_level: L4
---

# DEP-028 - AfricMade identity and passwordless production cutover

## Problem and outcome

The currently deployed Netlify rollback candidate uses the retired MirtPage
identity and password-first entry. AfricMade must be released as an exact,
reviewed commit with working managed identity delivery, while the unpurchased
custom domain and private compatibility identifiers remain explicitly outside
the visual cutover.

## Scope

### In scope

- AfricMade production build, generated Netlify URL, PWA cache/version, Auth
  redirects, private Storage, PostgreSQL, and representative browser smoke.
- Custom SMTP and Google OAuth provider readiness gates.
- Existing Netlify deployment as rollback until the new generated-origin smoke
  and monitoring pass.

### Non-goals

- Configuring or claiming `mirtpage.com`, an AfricMade custom domain, or DNS
  before the owner purchases a domain.
- Destructive database, identity, media, or internal environment-key renames.

## Contracts

- Production remains on Netlify plus Supabase PostgreSQL/Auth/private Storage.
- The generated production origin is `https://africmade.netlify.app`. Supabase
  Site URL, redirect allowlists, Google authorized origins, and application
  canonical/trusted-origin settings must use this exact HTTPS origin.
- Hosted Supabase uses the AfricMade six-digit token template and subject for
  both confirmation and magic-link messages, so new and existing email users
  complete the same in-app code flow without an email redirect.
- Public email OTP is disabled or release-blocked until custom SMTP sends to a
  non-team test address. Supabase's built-in demonstration mailer is not
  accepted as production delivery evidence.
- Hosted Auth may use a dedicated Gmail account with a Google app password for
  the bounded tester launch. The app password exists only in Supabase provider
  configuration, the sender address must match the SMTP username, and local or
  browser-test Auth continues to deliver only to isolated Mailpit. Personal
  Gmail limits are monitored and this temporary sender is replaced by a
  verified-domain transactional provider before broad public promotion.
- Google entry is disabled until Google client credentials, Supabase provider
  configuration, allowlisted generated callback origin, and linked/new-user
  browser paths pass.
- The release records the exact commit, Netlify deploy ID, generated URL,
  health/auth/onboarding/page/PWA smoke, production logs, rollback URL, and
  remaining provider or custom-domain limits.
- Private `MIRTPAGE_*` environment keys and historical database identifiers may
  remain during rollback. They must not appear as product language in public or
  operator UI.

## Scenarios

```gherkin
Scenario: Email delivery is not production capable
  GIVEN custom SMTP is absent or a real-address OTP smoke fails
  WHEN AfricMade release admission runs
  THEN public email-code entry is not claimed ready
  AND the prior production deployment remains available

Scenario: Exact AfricMade candidate passes
  GIVEN the reviewed commit and provider configuration are deployed
  WHEN public, OTP, Google, onboarding, linked dashboard, AfricMade page, Storage, and
    PWA smokes pass
  THEN the generated AfricMade Netlify URL may become the public launch URL
  AND the prior MirtPage deployment remains rollback during monitoring
```

## Quality impact

- Security and tenant isolation: L3 identity/security evidence plus monitored
  L4 provider rollout and retained rollback.
- Privacy and data retention: no secrets or customer data in deploy output;
  no destructive migration.
- Accessibility and responsive behavior: approved 1440/390/320 captures before
  full release gates.
- Performance and limits: local brand assets, bounded auth calls, free-plan
  email/provider limits documented and monitored.
- Failure recovery and idempotency: exact prior deploy rollback and retryable
  unlinked identities.

## Test plan

| Gate | Evidence |
|---|---|
| Brand and auth focused checks | FE-038 and BE-031 mapped tests |
| Provider delivery | real-address OTP plus Google linked/new browser smoke |
| Production release | `npm run check`, `npm run release`, GitHub required checks |
| Exact deployment | generated-origin public/auth/onboarding/page/PWA smoke and logs |

## Rollout and rollback

Obtain visual approval first, then run complete local and remote gates. Configure
provider secrets directly in hosted Supabase without printing or routing them
through Netlify, deploy the exact approved commit, and smoke the generated
Netlify origin. Keep the current deployment URL and Supabase data unchanged for
immediate rollback. Custom-domain and verified-domain mail rollout is a later
L4 task.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

On 2026-08-27 Netlify site `26c795eb-5560-4a88-b38d-3cc922c2a5e6` was renamed
in place from `mirtpage` to `africmade`; its existing deploy and environment
configuration were retained. The production canonical URL and trusted action
origin now target `https://africmade.netlify.app`, and unauthenticated `/` and
`/login` requests return HTTP 200 on the renamed origin. The updated AfricMade
application has approved responsive visual evidence and passes `npm run check`,
`npm run release`, and all 10 ordered production-browser workflows locally. It
still awaits exact deployment and complete production smoke. Hosted Supabase
advertises Google and routes its OAuth
authorization request to `accounts.google.com` with the exact hosted Supabase
callback. The Netlify production Google feature flag is enabled for the next
deploy; real consent, code exchange, identity linking/onboarding, and logout
with an allowlisted Google test user remain required before public admission.
