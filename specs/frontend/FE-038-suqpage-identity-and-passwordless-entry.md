---
id: FE-038
title: Suqpage identity and passwordless account entry
status: in_progress
related: [FE-051, FE-046, DEP-033, BE-036, BE-032, FE-040, FE-013, FE-027, FE-029, FE-034, FE-035, FE-036, FE-039, BE-031, DEP-026, DEP-027, DEP-028, ADR-0017]
owners: [product, frontend, design, security]
last_updated: 2026-09-21
change_level: L3
---

# FE-038 - Suqpage identity and passwordless account entry

## Problem and outcome

### S30 — mobile brand visibility (L1, visually approved; release in progress)

- GIVEN a phone from 320px wide WHEN opening Market, Featured, About, sign-in
  or a private workspace THEN the Suqpage mark and wordmark are visible in a
  compact header without opening a menu; language selection remains accessible.
- GIVEN a public shop or product on a phone WHEN it opens THEN the existing
  return bar contains the same brand, an accessible Back to Market control and
  language selection in one row; tenant branding stays independent.
- GIVEN any of the five locales WHEN viewing that header THEN Latin wordmark
  typography stays fixed, controls do not overlap, and no horizontal overflow
  occurs. Desktop keeps its existing header and navigation.
- GIVEN the mobile map/results workspace THEN its height accounts for the
  header and bottom navigation so results remain scrollable and reachable.

Scope: shell presentation only; no data, authentication or routing changes.
Master impact: public showroom framing and shared identity in §5.2.
Verification: `scripts/capture-mobile-brand.mjs`, typecheck and spec validation;
desktop/320/390 captures precede visual approval and full release gates.
Rollback: revert the scoped shell styles and brand placement; no migration.
Evidence: 39 public and 51 authenticated responsive browser checks pass at
1440/390/320 across all five locales; phone result-list scroll/collapse checks,
typecheck, spec validation and PWA shell contract pass. Captures/receipts in
`.local/mobile-brand-review/`. The owner approved deployment; full gates, commit and publication are in progress.

The launch candidate needs consistent Suqpage identity and email-only entry.
The supplied Suqpage direction establishes
an Africa-pin mark, a lower-case two-color wordmark, and a crisp orange,
charcoal, gray, and white platform system. Account entry must ask only for an
email code; business details belong to a protected onboarding
step after authentication.

The outcome is one coherent Suqpage identity across public, showroom-host,
PWA, authentication, and workspace surfaces, with a short passwordless entry
flow and a separate authenticated business setup.

## Scope

### In scope

- Project-owned responsive Suqpage mark, wordmark, favicon, PWA icons, titles,
  metadata, public copy, workspace chrome, and showroom host provenance.
- One semantic platform palette based on safety orange, near-black charcoal,
  middle gray, soft gray, and white with derived accessible states.
- One account entry page for email OTP, with explicit code-entry,
  resend, error, loading, and recovery states.
- An authenticated business-onboarding page that collects business details only
  after identity verification.
- Existing linked users continue directly to their permitted dashboard.

### Non-goals

- Recoloring or renaming tenant-owned showrooms, tenant logos, tenant palettes,
  products, or business content.
- Renaming database tables, historical migrations, immutable media keys, or
  private `SUQPAGE_*` compatibility environment variables during this rollout.
- Password entry/reset, phone OTP, a custom OAuth provider, or collecting a
  full catalog during initial onboarding.

## Domain language and invariants

- The product name is **Suqpage** in prose. The visual wordmark renders
  lower-case **suqpage**, with `suq` in charcoal and `page` in orange.
- Platform-owned UI uses Suqpage tokens; tenant renderers continue to use
  their approved independent palettes.
- **Sign in** and **Create account** are one identity step. New-user business
  setup begins only after Supabase verifies an email OTP.
- Color is never the sole state indicator, and the orange action color must
  retain readable text and visible focus treatment.

## Contracts

- Account entry asks only for email; Google initiation is disabled.
- Account entry never exposes rollout or launch-placeholder language. Production
  configuration requires verified email-code entry; Google is disabled. The owner approved an email-only launch on 2026-09-14.
  A misconfigured non-production
  environment shows one concise temporary-unavailability status instead of a
  control that cannot work.
- Email continuation moves to a six-digit code state without navigating away.
  The address remains visible and editable; resend is bounded and never exposes
  whether an application account already exists.
- New and existing email identities receive the same concise Suqpage code
  experience. Neither path sends a confirmation button or asks the user to
  follow an email link back to the application.
- Successful verification routes a linked user to the dashboard and an
  authenticated but unlinked user to business setup.
- Business setup asks for owner name, business name, private account phone, and one
  bounded private business category. A safe retained provider display name is prefilled
  when available and remains editable. A safe unique public-page handle is
  generated server-side and can be changed later in business settings.
- Public and workspace navigation use Suqpage labels and assets without
  exposing retired platform wording.
- Public navigation resolves the linked application session on the server:
  anonymous visitors see **Sign in**, while authenticated linked clients see
  **Dashboard** and no competing sign-in action.
- Controls are at least 44 CSS pixels, focus is visible, errors use live regions,
  and 320/390px views have no horizontal overflow.

## Scenarios

```gherkin
Scenario: Existing user enters with an email code
  GIVEN a linked active user enters a valid email address
  WHEN the user submits the delivered six-digit code
  THEN the user receives a managed Supabase session
  AND the app opens the permitted Suqpage dashboard

Scenario: New user enters before creating a business
  GIVEN an email address has no Supabase identity or application link
  WHEN the user requests and submits the delivered six-digit code
  THEN the app opens protected business setup
  AND the email contains no confirmation link
  AND no role, tenant, showroom, or publication authority is inferred yet

Scenario: Public identity is viewed on a phone
  GIVEN a visitor opens a public, auth, showroom-host, or PWA surface at 320px
  WHEN the surface renders
  THEN the Suqpage mark and semantic palette remain legible
  AND navigation and forms fit without horizontal overflow
```

## Quality impact

- Security and tenant isolation: provider sessions remain non-authoritative
  until linked by BE-031; generic OTP responses resist account enumeration.
- Privacy and data retention: email is sent only to Supabase Auth during entry;
  business details are submitted only after authentication.
- Accessibility and responsive behavior: persistent labels, code input naming,
  status announcements, focus states, 44px targets, and exact-width checks.
- Localization and merchant-entered values: English-first controlled UI;
  bounded Unicode business display values after authentication.
- Performance and limits: local SVG/vector assets and CSS tokens add no runtime
  image provider; auth calls are user initiated and bounded.
- Failure recovery and idempotency: users can resend or restart entry; failed
  business setup retains an unlinked provider identity for safe retry.

## Observability

Record safe outcome codes and duration buckets for OTP request, OTP verify,
OAuth callback, and onboarding. Never log email, OTP, OAuth code, provider UUID,
contact data, tokens, cookies, or onboarding request text.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Shared identity and no retired public wording | focused | `scripts/test-platform-identity.mjs` |
| Email-code entry and Google-initiation denial | browser/security | `tests/acceptance/app.spec.ts`, focused auth tests |
| Phone and desktop composition | browser/visual | `scripts/capture-platform-form-visuals.mjs` |
| Tenant showroom identity remains independent | integration | `scripts/test-showroom-renderer.ts` |
| Accessible fields, statuses, focus, and overflow | browser/accessibility | `scripts/test-accessibility-audit.mjs` |

## Rollout and rollback

Ship behind managed Supabase Auth after email delivery and Google-denial evidence.
The current Suqpage Netlify deployment remains rollback until Suqpage entry,
onboarding, workspace, PWA, and representative showroom flows pass. Rollback
restores the previous deployment; no tenant data is rewritten by the visual
change.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

On 2026-09-12 the approved desktop, 390px, and 320px identity and form states,
`npm run check`, `npm run release`, and all 10 ordered production-browser
workflows passed. Browser acceptance verifies a real six-digit Supabase Auth
email-code exchange through isolated Mailpit, authenticated setup, dashboard
routing, logout, and retained provider-aware account states. Exact hosted
Google consent/code exchange and the new Suqpage Netlify deployment remain
rollout gates under DEP-028.

S2g contact separation (BE-032/FE-040): signup phone is private users.account_phone;
verified account email is retained. FE-046/BE-039 supersede the empty public
contact default for NEW private workspaces in the local candidate with explicitly
fictional editable contact examples, independent of real account identity. Existing
records and cleared fields remain unchanged; hosted rollout is pending.

## One platform favicon — 2026-09-20 (S14)

GIVEN any Suqpage route, including a business page, linked product or private
workspace WHEN browser metadata resolves on load or client navigation THEN its
favicon and Apple touch icon inherit the main Suqpage root metadata. Business
logos and retained favicon fields must not override browser icons. Business title,
description, sharing image and on-page logo remain business-specific. Remove the
obsolete business Browser icon upload control; preserve existing stored assets.
No migration or account-data change. Verify resolved DOM icon URLs across home,
business/product, Featured, login and dashboard navigation, plus typecheck and
existing PWA asset checks. Master section 18 and S14 describe this platform rule.

## Email-only entry and complete email branding — S17

The newest instruction supersedes optional Google entry above. GIVEN any runtime,
including retained Google credentials or an old enabled flag, WHEN a visitor opens
sign-in or invokes the old Google action THEN email code is the only offered entry
and no new Google authorization request is made. Retained identities/sessions remain
valid. Account settings describe email sign-in without provider implementation copy.

All six Auth email types and seven security notification templates use Suqpage
subjects and branding. Signup and sign-in remain code-only. Other templates preserve
their appropriate provider token/link semantics; recovery directs users to email-code
entry, as no password-reset UI is exposed. Preparing their branding does not
enable password, phone, OAuth or notification features. Sender display name is
Suqpage; verified sender address and credentials are preserved. Live hostnames,
compatibility aliases and tenant content are not blindly rewritten.

Test: focused email-only runtime/Google-start denial, template manifest/content and
guard tests, local login plus template desktop/phone captures. Hosted configuration
requires verified access, a protected read-only plan and exact reviewed apply under
DEP-029. No hosted access or delivery is presumed from local source checks.

## Evidence: verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.

## S23 audit correction — managed account recovery

GIVEN email-code authentication WHEN administrators open owner access THEN show
email-code identity status, never a temporary-password form or password-change
badge. Retained local rollback mode keeps its password form. BE-031 guards the
corresponding server actions as well. Test: focused wiring browser audit and
password-mode policy regression; no provider credentials or sessions are changed.

Managed staff creation and invitation acceptance also omit password fields and
password-change badges. Invitation acceptance continues to email sign-in without
claiming the recipient is authenticated. Remove retired pending-page-review counts
from the staff table; active assignment counts remain. Local rollback keeps its
password inputs. Browser tests verify staff creation, invitation acceptance,
correct tenant/role links, and no session from invitation redemption alone.

## S22–S24 approved release evidence

The owner approved the combined visuals and deployment on 2026-09-21. Full check,
release, operations, nine isolated provider browser scenarios and Netlify artifact
privacy checks pass. Earlier S22–S24 pending-review notes are superseded.
Deployment evidence and remaining hosted-email limits:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.

## Owner-selected handle at setup — 2026-09-23

This accepted change supersedes generated-only handle selection. New setup UI
requires a chosen handle and displays suqpage.com/@handle with concise localized
availability feedback. Normalize surrounding whitespace, one optional leading @
and case; accept 3–60 ASCII letters/digits with internal single hyphens. Reject
reserved platform identities (suqpage, admin, support). Existing handles remain
unchanged; renaming existing pages is outside this change. Older clients that
omit the handle retain generated-handle compatibility; an explicitly empty or
invalid handle is rejected.

- GIVEN a verified identity WHEN checking a valid handle THEN return only the
  canonical handle and availability, considering every business status and case;
  no private business/account information is returned. Anonymous checks are denied.
- GIVEN typing WHEN checks are pending/fail/out of order THEN only the current
  input receives feedback; a failed check never claims availability.
- GIVEN two signups choosing the same available handle WHEN they save concurrently
  THEN only one workspace commits; the other receives a clear conflict without
  partial tenant/user records. The check is advisory, never a reservation.
- GIVEN existing setup/session defenses WHEN handle selection is added THEN
  identity, tenant, role, publication and private starter-content rules remain.

Test plan: validation/reserved/case checks, actual PostgreSQL availability and
concurrent creation/conflict/rollback tests, authenticated API checks and
desktop/390/320 form states. No migration/provider change. Master §§5.2 and 11
(onboarding statements) affected. Focused visual review precedes full gates.


## S28 local extension — 2026-09-23

FE-051 / BE-043 / DEP-040 supersede S26's required signup handle field: signup
allocates an unused address and opens the populated private page preview.
Handle edits move to Business details, first change immediate then once every
30 days; a platform administrator may override with an audited support reason.
Reserved old handles redirect public product links without bypassing privacy.
New examples reuse admitted fictional ceramics imagery and include two photos
and two YouTube links per offering. Account identity/consent stays real; existing
content is untouched. The Suqpage wordmark has fixed Latin typography in every
locale. Local focused tests/captures are separate from visual/release approval.
