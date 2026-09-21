---
id: DEP-029
title: Guarded production Auth configuration changes
status: in_progress
related: [DEP-032, DEP-028, ADR-0014]
owners: [operations, security]
last_updated: 2026-09-13
change_level: L3
---

# DEP-029 - Guarded production Auth configuration changes

## Problem and outcome

A broad hosted configuration push applied development Auth settings and replaced
production Google credentials. A different working directory is not a sufficient
safety boundary. Routine production Auth maintenance must use a narrow,
fail-closed plan/apply command, not the Supabase configuration-push command.

## Scope and contracts

- One explicitly named production project and its exact HTTPS origin are pinned
  in the tool. There is no linked-project, working-directory, Preview, or local
  configuration fallback. No provider writes occur during this implementation.
  S18 prepares the owner's verified chosen origin `https://suqpage.com`; using the
  new allowlist does not claim DNS/TLS cutover. The old hosted origin is no longer
  an admissible new configuration value. Apply waits for domain and access readiness.
- Plan is read-only remotely. It validates an explicit JSON patch, checks project
  identity/health, and retains the provider-returned configuration and exact patch
  in an exclusive private local plan before returning its review digest.
- Only exact production URL/callback, safe email-code settings, the reviewed
  repository email templates/subjects, and security-enforcing boolean values are
  permitted. S17 also permits the exact Suqpage sender display name and reviewed
  repository subjects/content for all six Auth and seven security emails. It does
  not change notification enablement or the verified sender address.
  Google enablement/credentials, SMTP credentials, arbitrary templates,
  other providers, paid capabilities, and unknown keys are denied, not stripped.
  The current repository subject is exactly `Your Suqpage sign-in code`; the
  earlier platform subject is rejected. Updating this allowlist does not authorize
  a hosted write or remove the separate reviewed-plan requirement.
- Apply requires the digest of the reviewed plan, no more than ten minutes old,
  and unchanged remote configuration. It revalidates target, patch, and private
  plan permissions before one narrow PATCH, then reads back changed and unchanged
  fields. A single-use attempt marker prevents concurrent or repeated application.
- Timeouts, redirects, provider errors, incomplete reads, or verification drift
  stop the operation without automatic retries or blanket rollback. After an
  ambiguous write, inspect remote state before preparing another plan.
- Provider readback also contains `mailer_subjects_custom_contents` and
  `mailer_templates_custom_contents`: boolean maps marking customized content.
  For a nonempty approved subject/template, its existing matching uppercase map
  key must become true. Predict only those keys in the expected readback; never
  send these maps in a PATCH or ignore entire metadata objects. Unrelated keys,
  additions, removals, incorrect types and false flags remain verification errors.
  This correction follows the S19 read-only inspection: all 27 approved fields
  matched; exactly 22 corresponding flags changed false to true. Sender,
  credentials, providers and every other field matched the saved before-state.
  The attempted plan is not replayed or retrospectively marked as a guarded
  success. Record an independent read-only verification; further hosted writes
  require owner direction and a fresh exact plan.
- S19 explicitly selects credentials with `--credential-source env|cli` (env by
  default). The cli option reads only the macOS Supabase CLI default-profile
  Keychain entry (`Supabase CLI`/`supabase`), or its legacy `access-token` entry
  only when the first entry is absent or successfully returns an empty password,
  matching the CLI's empty-placeholder handling. A locked/denied Keychain is an error, not
  a fallback. Other platforms/file-backed/custom profiles use explicit env input.
  An environment token combined with cli selection is rejected as ambiguous.
  There is no dotenv, custom-profile, linked-project or endpoint discovery.
  The fixed native Keychain read is shell-free, private and bounded to 60 seconds
  to allow an interactive macOS permission response; token and
  subprocess errors never appear in output or files. Existing Go keyring base64
  encoding is normalized and malformed/oversized tokens fail closed.
  Version-2 plans bind the selected credential source and a protected token
  fingerprint. A switched credential/source or old unbound plan cannot apply.
  No token bytes are retained in plans. Project/health checks, exact allowlist,
  protected backup, owner digest review, expiry, drift checks, one-use attempts,
  non-retrying write and readback remain required.
  Backups and attempt records stay outside Git at mode 0600,
  inside non-symlink directories restricted to the current user. Provider-masked
  secrets are not claimed recoverable; credential edits require separate owner
  authorization and a recoverable source in the provider dashboard.
- AGENTS.md prohibits broad hosted config pushes, including emergency workarounds
  and ignored one-time scripts. Blocked backup or access is a stop condition.
  The command is not a sandbox: it cannot prevent an operator with full shell or
  provider access from bypassing it. Runtime credentials and CI must not receive
  provider-management credentials to enforce the wider separation of duties.

## Scenarios

```gherkin
Scenario: Local configuration or credential edits are submitted
  GIVEN a patch with a local URL, wildcard, Google/SMTP credential, unsafe flag,
    arbitrary email template, or unknown field
  WHEN the operator plans or applies it
  THEN validation rejects the entire operation before any provider write

Scenario: A reviewed narrow change is applied
  GIVEN the exact production target and a private unexpired plan with a backup
  WHEN the operator applies its reviewed digest and the remote state is unchanged
  THEN exactly the allowlisted patch is sent once
  AND changed and untouched provider fields are checked afterward

Scenario: Backup, approval, freshness, or integrity is missing
  GIVEN a missing, corrupt, public, symlinked, stale, drifted, or already-attempted plan
  WHEN apply is requested
  THEN no provider write occurs

Scenario: A provider request fails or a write cannot be verified
  GIVEN a redirect, timeout, malformed response, provider error, or readback mismatch
  WHEN the tool encounters it
  THEN it returns a redacted failure without retrying or restoring broad configuration
```

## Test plan

S19: test credential-source selection with injected readers (no real Keychain in
tests), no automatic fallback, ambiguous/missing/invalid/locked/oversized cases,
legacy encoding, redacted errors, fixed subprocess bounds and source/token changes
between plan and apply. After focused checks, a live saved-login read-only plan is
permitted; this is not approval to apply it. User accepted this extension on
2026-09-21. Ready: L3 operations adapter, master section 17 affected, no app UI or
new dependency. Earlier visual/deployment work remains separately gated.

- `scripts/test-production-auth-config.ts`: isolated temporary private files and
  fake provider transport; zero-write negative cases, successful exact PATCH,
  immutable credentials, private backups, tampering/drift/expiry, one-use attempts,
  bounded provider errors and CLI argument handling from a different directory.
- The focused test is part of `npm run check`; typecheck/build and release gates
  cover repository integration. Tests never use real management credentials.
- No live mutation is required or authorized by the guard implementation itself.

## Rollout and rollback

Replace the unsafe runbook path and mandatory agent instructions before admitting
another provider change. Master-prompt section 17 describes this operations
boundary; application Auth behavior, schema, and deployment remain unchanged.
Owner approval of a plan is a separate operational step, not implied by running
tests or producing the digest. If the guard fails, stop; do not fall back to a
raw provider command. Existing DEP-028 provider restoration remains pending.

## Readiness

Scope, target, prohibited edits, failure paths, tests, privacy, and rollout are
specified. No new hosted provider, paid service, or application feature is added.

## Evidence

Evidence: verified on 2026-09-13.

- `npm run test:production-auth-config`: 35/35 passing regression tests using
  isolated private files and fake provider transport, including credential
  injection at both plan and apply, stale/tampered backups, simultaneous apply,
  ambiguous timeout, unrelated readback drift, and redacted provider failures.
- `npm run check`: passed, including the new guard tests and typechecking.
- `npm run test:operations`: passed migration, integrity, backup, and restore
  checks against disposable local fixtures.
- `npm run release`: passed production build, 67 private-path trace checks,
  isolated local Supabase HTTP/security smoke (1/1), integration checks, and
  production dependency audit (zero vulnerabilities).

No hosted configuration, credentials, or deployment was changed or verified by
this task. Google provider restoration and the production cutover remain under
DEP-028. The guard's network behavior is tested with fakes, not a live PATCH.

S19 evidence (2026-09-21): 52 credential/guard regressions, typecheck and 151-spec
validation pass. Saved Keychain login produced a real protected hosted plan;
owner approved its exact digest. The single PATCH applied all 27 branding fields,
but the original guard stopped on two derived customization maps. Independent
read-only reconciliation proves only the 22 corresponding false→true flags also
changed; every other field is unchanged. The local guard now predicts only these
specific flags, with corruption/credential-drift regression coverage. The failed
attempt remains consumed and is not relabeled or retried. Further writes require
owner direction and a new exact plan. Full release/commit gates remain pending.
