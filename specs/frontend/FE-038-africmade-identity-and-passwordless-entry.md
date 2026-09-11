---
id: FE-038
title: AfricMade identity and passwordless account entry
status: in_progress
related: [FE-013, FE-027, FE-029, FE-034, FE-035, FE-036, FE-039, BE-031, DEP-026, DEP-027, DEP-028, ADR-0017]
owners: [product, frontend, design, security]
last_updated: 2026-09-12
change_level: L3
---

# FE-038 - AfricMade identity and passwordless account entry

## Problem and outcome

The launch candidate still presents the retired MirtPage name, mark, teal/navy
palette, and password-first signup. The supplied AfricMade direction establishes
an Africa-pin mark, a lower-case two-color wordmark, and a crisp orange,
charcoal, gray, and white platform system. Account entry must ask only for an
email code or Google identity; business details belong to a protected onboarding
step after authentication.

The outcome is one coherent AfricMade identity across public, showroom-host,
PWA, authentication, and workspace surfaces, with a short passwordless entry
flow and a separate authenticated business setup.

## Scope

### In scope

- Project-owned responsive AfricMade mark, wordmark, favicon, PWA icons, titles,
  metadata, public copy, workspace chrome, and showroom host provenance.
- One semantic platform palette based on safety orange, near-black charcoal,
  middle gray, soft gray, and white with derived accessible states.
- One account entry page for email OTP or Google, with explicit code-entry,
  resend, error, loading, and recovery states.
- An authenticated business-onboarding page that collects business details only
  after identity verification.
- Existing linked users continue directly to their permitted dashboard.

### Non-goals

- Recoloring or renaming tenant-owned showrooms, tenant logos, tenant palettes,
  products, or business content.
- Renaming database tables, historical migrations, immutable media keys, or
  private `MIRTPAGE_*` compatibility environment variables during this rollout.
- Password entry/reset, phone OTP, a custom OAuth provider, or collecting a
  full catalog during initial onboarding.

## Domain language and invariants

- The product name is **AfricMade** in prose. The visual wordmark renders
  lower-case **africmade**, with `afric` in charcoal and `made` in orange.
- Platform-owned UI uses AfricMade tokens; tenant renderers continue to use
  their approved independent palettes.
- **Sign in** and **Create account** are one identity step. New-user business
  setup begins only after Supabase verifies an email OTP or Google identity.
- Color is never the sole state indicator, and the orange action color must
  retain readable text and visible focus treatment.

## Contracts

- Account entry initially asks only for email and offers **Continue with
  Google** when the provider is configured.
- Account entry never exposes rollout or launch-placeholder language. Production
  configuration requires both approved methods; a misconfigured non-production
  environment shows one concise temporary-unavailability status instead of a
  control that cannot work.
- Email continuation moves to a six-digit code state without navigating away.
  The address remains visible and editable; resend is bounded and never exposes
  whether an application account already exists.
- New and existing email identities receive the same concise AfricMade code
  experience. Neither path sends a confirmation button or asks the user to
  follow an email link back to the application.
- Successful verification routes a linked user to the dashboard and an
  authenticated but unlinked user to business setup.
- Business setup asks for owner name, business name, phone/WhatsApp, and one
  bounded private business category. A safe Google display name is prefilled
  when available and remains editable. A safe unique public-page handle is
  generated server-side and can be changed later in business settings.
- Public and workspace navigation use AfricMade labels and assets without
  exposing retired MirtPage wording.
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
  AND the app opens the permitted AfricMade dashboard

Scenario: New user enters before creating a business
  GIVEN an email address has no Supabase identity or application link
  WHEN the user requests and submits the delivered six-digit code
  THEN the app opens protected business setup
  AND the email contains no confirmation link
  AND no role, tenant, showroom, or publication authority is inferred yet

Scenario: Public identity is viewed on a phone
  GIVEN a visitor opens a public, auth, showroom-host, or PWA surface at 320px
  WHEN the surface renders
  THEN the AfricMade mark and semantic palette remain legible
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
| Email-code and Google entry states | browser/security | `tests/acceptance/app.spec.ts`, focused auth tests |
| Phone and desktop composition | browser/visual | `scripts/capture-platform-form-visuals.mjs` |
| Tenant showroom identity remains independent | integration | `scripts/test-showroom-renderer.ts` |
| Accessible fields, statuses, focus, and overflow | browser/accessibility | `scripts/test-accessibility-audit.mjs` |

## Rollout and rollback

Ship behind managed Supabase Auth after SMTP and Google provider smoke evidence.
The current MirtPage Netlify deployment remains rollback until AfricMade entry,
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
Google consent/code exchange and the new AfricMade Netlify deployment remain
rollout gates under DEP-028.
