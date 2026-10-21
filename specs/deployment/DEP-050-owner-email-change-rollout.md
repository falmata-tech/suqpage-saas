---
id: DEP-050
title: Guarded rollout of owner email change
status: ready
related: [FE-073, BE-061, FE-072, BE-060, FE-038, BE-031, DEP-029, DEP-027, DEP-049]
owners: [operations, security]
last_updated: 2026-10-18
change_level: L3
---

# DEP-050 — Guarded rollout of owner email change

## Problem and outcome

The owner email-change workflow depends on Supabase secure email-change
configuration, email delivery to both addresses and a verified application
reconciliation path. A disposable local proof found that
`double_confirm_changes=true` with `enable_confirmations=false` still changed
the provider email after only the current-mailbox code; the new-mailbox code
then failed. The source configuration now stages email confirmations and an
OTP template, but neither source proves the hosted setting or the corrected
two-code flow. The local post-change security notification is disabled. The outcome is a
reviewed, observable release that cannot silently reduce old-mailbox proof or
claim the provider and application are in sync when they are not.

## Scope and non-goals

- Prove the actual local and hosted provider configuration independently:
  secure/double email-change confirmation, email confirmation/autoconfirm
  behavior, verified sender, old/new email templates, OTP expiry and post-change
  security notification. A flag named double confirmation alone is insufficient
  if another setting makes an address update immediate. [Supabase's Auth
  guidance](https://supabase.com/docs/guides/auth/general-configuration)
  states that disabling email confirmations implicitly confirms an address.
  Do not infer hosted values from repository config or a provider screenshot.
- Prepare native, readable six-digit code messages for both addresses and a
  post-change notice to the former address. Confirm actual old/new code mapping
  with a disposable local provider identity and Mailpit before enabling the UI.
- Stage BE-061 compatible pending/reconciliation storage, then web/mobile
  FE-073 task, then bounded local end-to-end and hosted smoke with disposable
  identities. Do not migrate any real account email as a launch smoke.
- Use DEP-029's exact hosted Auth plan, protected backup, project identity,
  digest review, drift fence, bounded apply and readback for any setting or
  template change. Notification enablement or a new guard allowlist field needs
  its own exact owner-reviewed change; existing branding approval does not
  authorize it.

No `supabase config push`, raw management fallback, direct Auth admin email
mutation, SMTP credential rotation, public release or unverified production
account email change is part of this spec.

## Contracts and scenarios

- Feature admission fails closed when the provider's secure old/new change
  setting, mail delivery, application schema or reconciliation path is absent.
- Local and hosted tests must prove codes delivered to the correct old/new
  mailboxes, single use, expiry, URL/callback ownership and confirmed provider
  UUID. Never place private code or new email in build artifacts or test logs.
- A failed, timed-out or ambiguous hosted Auth write stops all further writes
  pending an exact read-only investigation and owner direction under DEP-029.

```gherkin
Scenario: Provider configuration is ready
  GIVEN a verified local provider and protected hosted configuration read
  WHEN rollout preflight checks secure email change, both code deliveries,
    sender, notification, schema and callback origin
  THEN the owner task may be enabled only for the exact verified environment

Scenario: Hosted secure setting is absent or unreadable
  GIVEN secure email change is disabled, masked or not independently verified
  WHEN rollout is attempted
  THEN initiation remains disabled and no owner email is changed

Scenario: An Auth configuration apply times out
  GIVEN a reviewed exact change has been sent to the hosted provider
  WHEN readback is unavailable or differs from the plan
  THEN no broader retry or automatic rollback occurs
  AND operator inspection and new direction are required before another write
```

## Quality impact and observability

- Security: send old/new codes through the verified provider path and never
  weaken secure email change to make a demo pass. Hosted notification and
  template changes require separate approval.
- Privacy: protected backups and test receipts omit email addresses, tokens,
  SMTP secrets and message bodies. Use labelled disposable accounts only.
- Reliability: no background retry can cause duplicate change emails or adopt
  an unverified provider identity. Retain safe pending/reconciliation metrics.
- Compatibility: old deployments must tolerate pending schema; later source
  rollback disables initiation but preserves provider-complete reconciliation.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Local actual old/new email codes | operations/acceptance | `scripts/test-owner-email-change-local.ts`, Mailpit; old-address post-change notice remains a separate hosted-template check |
| Guard rejects insecure/unknown hosted fields | operations/security | `scripts/test-production-auth-config.ts`, guarded dry run |
| Provider/DB partial failure and rollback compatibility | integration/operations | `scripts/test-owner-email-change-migration.ts`, isolated restore rehearsal |
| Hosted post-approval smoke and readback | manual/operations | protected DEP-029 plan/receipt with disposable owner |

## Rollout and rollback

No hosted mutation occurs until the owner reviews an exact DEP-029 plan for the
correct project, fields and digest after a recoverable backup. Before release,
verify domain/Auth callback, mail sender, local and hosted code delivery,
application identity reconciliation and owner/staff negative paths. Enable the
task only after those checks pass. Roll back the UI/entry point and investigate
pending cases without reverting a provider-confirmed email or restoring broad
Auth configuration automatically. Record any residual access-token lifetime;
provider global sign-out alone does not revoke an already issued JWT instantly.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps acceptance criteria
- [x] Rollout/rollback decided

## Completion evidence

The local Auth/Mailpit proof now passes through the application/native route:
both code deliveries, first-code no change, single use, exact UUID
reconciliation and session revocation. The temporary local test email limit was
restored to its original value. The approved local 75→77 apply installed the
empty pending-request/session-fence schema without an Auth setting change;
`.local/mirtpage-rebrand-s145/local75-to77/attempt-20261019T024300Z/verified.json`.
Owner workflow review, hosted settings/template readback, release checks and
monitored rollout remain pending; initiation stays disabled.
