# Email-only access, email branding and domain preparation

Local candidate verified 2026-09-21. S17/S18/S19, FE-038/BE-031 and DEP-026/027/029.
Visual approval, complete release gates, scoped commit and hosted rollout remain
pending. The existing unrelated `deno.lock` was not changed.

## Implemented and verified locally

- Email OTP is the sole offered login. Retained Google enablement flags cannot
  initiate OAuth; existing identities, callbacks and sessions remain compatible.
- Local Auth itself has Google disabled. Runtime generation cannot auto-enable it
  from retained credentials. Account settings use concise email-only wording.
- All six Auth email types and seven security notification templates have Suqpage
  subjects/content. Signup and sign-in retain six-digit codes; recovery returns to
  email-code login. Notification enablement remains off locally. Templates do not
  introduce new product workflows or provider capabilities.
- Local SMTP uses the existing isolated Docker mail catcher, fictional `.test`
  address and Suqpage display name. Required local SMTP placeholder fields are not
  production credentials. Acceptance configuration rewrites the catcher hostname
  to its own isolated stack. Never push this local configuration to a hosted project.
- Inquiry notifications preserve the configured verified sender address while
  using the Suqpage display name; malformed sender/header injection is rejected.
- The production Auth guard admits only exact repository-owned email fields and
  the Suqpage sender display name, not SMTP addresses, credentials, notification
  enablement or Google enablement. Its prepared primary origin is suqpage.com.

Evidence: 38 production-guard tests; email-branding, Auth-runtime, local-startup and
narrative regressions; typecheck/spec validation; 42 desktop/390/320 login/email
captures under `.local/email-entry-review/`. The local mail-catcher smoke proves
Suqpage sender/subject, delivered six-digit code, successful verification and replay
denial; its disposable Auth identity was deleted. No external email was sent.

## Remaining names audit

Customer-facing platform UI and repository email copy use Suqpage. Remaining retired
names serve verified existing deployment URLs, compatibility asset redirects, old
cache cleanup, migration matching, infrastructure identifiers, historical evidence,
or tests. Removing these blindly would break retained assets, data or sign-in.
The old Netlify hostname stays reachable during custom-domain preparation; it is
not claimed renamed or removed. Customer-owned names/addresses are preserved.

## Hosted email configuration

Saved CLI access now works through the guarded command after the owner allowed
macOS Keychain access. Its first attempts timed out at ten seconds; the tested
bound is now 60 seconds for an interactive permission response. All 50 credential/
guard regressions, typecheck and 151-spec validation pass. A real read-only plan
verified the exact active production project and retained a protected provider
before-state. Hosted Google is already disabled and the configured sender address
matches the owner's Gmail address. The hosted Auth site URL still uses the old
Netlify origin. The owner approved email plan `b6429f35a06de0cd42df3ebb` and its exact digest.
Guarded apply made one narrow PATCH, then stopped because provider readback did
not equal the exact expected state. No retry or automatic restore was attempted.
Read-only inspection proves all 27 approved fields match. Only the two provider
custom-content maps differ: exactly 22 corresponding flags changed false to true.
All other fields, including provider/SMTP credentials, are unchanged. No rollback
is needed to achieve the approved branding. Stop further hosted writes until
owner direction; local guard correction predicts only matching existing flags,
retaining checks on every other key. The private plan, attempt and review are
retained; the failed attempt is never replayed or relabeled as a guarded success.
A read-only check of the live login page returned 200, with email entry visible and
no Google button; this does not verify the provider-level setting.
Exact unapproved JSON patches are prepared separately under `.local/suqpage-domain/`:
`email-branding-patch.json` and `domain-auth-patch.json`. These are inputs, not plans
or approval digests. To prepare a fresh plan after expiry, run:

```sh
npm run ops:auth-config -- plan --credential-source cli --project sjeiiqxgscuqajpgddcc --patch .local/suqpage-domain/email-branding-patch.json
```

CLI selection uses only the default macOS Supabase CLI Keychain profile and its
legacy account. Successful empty placeholders follow the CLI behavior; denial,
timeout and invalid nonempty values stop. No file/profile/env fallback occurs.
The default env mode still accepts `SUPABASE_ACCESS_TOKEN` privately; do not combine
it with CLI selection or put management credentials into application runtime.
Version-2 plans bind credential source and fingerprint without retaining token bytes.
Review the exact
returned target, changed fields and digest before guarded apply. Plan the domain
patch separately when DNS/TLS is ready. Hosted Google disablement is an explicitly
requested provider-dashboard operation; preserve client credentials. No raw API or
configuration-push fallback is allowed by DEP-029.

## GoDaddy domain preparation

The owner confirms `suqpage.com`, apex primary and `www` redirect. GoDaddy nameservers
are authoritative. The owner completed DNS: both 1.1.1.1 and 8.8.8.8 resolve apex
to 75.2.60.5 and www to africmade.netlify.app. A system-resolver check briefly
returned ENODATA; direct public resolver checks agree. No NS/mail records were
changed by the agent. Before the owner edit, apex had four GitHub Pages A values
185.199.108.153 through 185.199.111.153 and www pointed to falmata-tech.github.io.

The verified Netlify site is `26c795eb-5560-4a88-b38d-3cc922c2a5e6`, with generated
hostname `africmade.netlify.app`. It now has primary `suqpage.com` and sole alias
`www.suqpage.com`; readback confirms the published deployment is unchanged. A protected
before-state is retained in `.local/suqpage-domain/`. Alias-only association received
HTTP 422; one controlled retry exposed the precise reason: Netlify requires a primary
custom domain before aliases. Readback confirmed primary, aliases and deployment
unchanged. The subsequent primary-and-www patch succeeded after DNS verification.
Two earlier prechecks stopped before writing (obsolete environment endpoint 404,
then system DNS ENODATA). Environment and site backups are private under `.local/`.
The managed-certificate request returned successfully with an empty body; a local
result-format assumption then failed. Do not repeat the write; use read-only TLS
status and HTTPS checks to determine completion.

Verified GoDaddy records:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 75.2.60.5 |
| CNAME | www | africmade.netlify.app |

The owner replaced the previous GitHub Pages records; there are no conflicting
A answers in the two public-resolver checks.
[Netlify external DNS guidance](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)
documents the standard-network target. Keep GoDaddy DNS; no nameserver transfer is
needed. The CNAME is an internal hosting target, not the public brand.

Order the remaining cutover: obtain exact approval for the prepared branding plan, verify
HTTPS, then separately plan/review and apply the
Auth origin and production application canonical URL, then check email login,
business/product links and www→apex redirects. Primary/domain changes must be narrow
and preserve the current deployment/environment until the reviewed cutover. Rollback
uses the protected domain/DNS before-state and a reviewed Auth/application rollback;
no automatic broad restore. Existing local visual gates still apply to code deployment.

Template fields follow [Supabase email-template documentation](https://supabase.com/docs/guides/auth/auth-email-templates).

S19 Keychain compatibility follows the [Supabase CLI credential reader](https://github.com/supabase/cli/blob/develop/apps/cli/src/auth/command-credentials.layer.ts). Tests use injected native readers and fake provider transport; no test contains real tokens.

S18 latest HTTPS check: managed certificate issued for suqpage.com and www.suqpage.com,
expiring 2026-12-20. Apex /login returns 200; www /login redirects 301 to the apex
while preserving the path. The generated Netlify login also remains 200. Google
button is absent on apex and generated-host login. Production canonical settings
and hosted Auth site URL remain on the generated host; no application deployment
or canonical environment change was made. No live email was sent for testing.

Independent email reconciliation (2026-09-21): the protected read-only snapshot
exactly matches 27 approved values plus 22 corresponding customization flags.
Sender/SMTP credentials, providers, notification enablement and URLs are unchanged.
The guard correction passes 52 regressions, typecheck and spec validation. Original
attempt status is preserved; there is a separate private reconciliation record.
No test email was sent to an external address. Code remains uncommitted alongside
the prior visual work; full release gates and application rollout remain pending.

Additional domain smoke: homepage, About, health and login each return HTTP 200;
www redirects with path and query preserved. Separate two-field Auth domain plan
prepared for exact owner approval; application canonical environment is unchanged.

S20 approved Auth cutover: the exact two-field plan was applied while fresh on
2026-09-21; full guarded readback passed. Site URL is https://suqpage.com and the
redirect allow-list is https://suqpage.com/auth/callback. Email branding, Gmail
sender credentials and disabled Google provider remain unchanged. Application
canonical environment/deployment and final public verification remain in progress.
