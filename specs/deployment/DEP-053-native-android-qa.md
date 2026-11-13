---
id: DEP-053
title: Isolated native Android development testing
status: in_progress
related: [DEP-042, DEP-044, FE-053, ADR-0033]
owners: [operations, frontend, security]
last_updated: 2026-11-13
change_level: L3
---

# DEP-053 — Isolated native Android development testing

## Problem and outcome

Expo browser checks do not exercise Android layout, native navigation, MapLibre,
keyboard or OS Back. Run the actual React Native app in a hardware-accelerated
Android emulator on a standard GitHub-hosted Linux VM and inspect source-bound
screenshots, accessibility hierarchy, interactions, crashes and persisted results.
The public repository uses standard runners; no new paid service is provisioned.

## Scope and invariants

- A development-only QA derivation has package `com.africmade.qa`, visible name
  `AfricMade QA`, slug/scheme `africmade-qa`, no verified public app links, EAS
  binding, Firebase client, hosted Auth or production signing material. It cannot
  replace an installed production app. Existing release policy stays unchanged.
- Explicit `AFRICMADE_NATIVE_QA=1` is accepted only with the development profile,
  API `http://10.0.2.2:3000`, synthetic native map flag `1`, absent Auth settings
  and absent EAS worker/build profile, Firebase file or mobile data target.
  Malformed flags, release/hosted contexts and mixed production inputs fail closed.
- Build only Gradle `assembleDebug` for x86_64. Install only after independent
  APK package/debuggable inspection. No EAS/Play submission or release signer.
  Development tooling findings remain reported; a QA run cannot admit a release.
- The backend runs ordinary Next API/domain/PostgreSQL code in a disposable,
  randomly named local CI schema seeded with synthetic demo data. Local-only
  target checks precede seed/start/verification. No production secrets, account
  credentials, notifications, external messages or public map-tile requests.
- Android loads the actual app from a local Metro server. This is a native
  development build, not Expo Go, a WebView or an Expo web preview.
- The initial bounded English smoke covers Market map/list switching, a real
  product, native Back, inquiry selection/form/keyboard, local Inbox submission,
  authoritative saved inquiry, About and Login entry. Use actual native nodes
  and their observed bounds; record unmet cases as failures, never mock success.
- Save screenshots and sanitized UI/run evidence on success and failure, bind
  source commit, APK digest, Android/API/ABI, backend fixture and scenario results.
  Keep raw server/Metro/device logs and disposable credentials out of public
  artifacts. Retain public synthetic screenshots and reports seven days.
- Run on relevant PRs and main changes plus manual dispatch, with read-only
  repository permission, bounded job/test time and no production environment.
  Preserve the five existing required quality gates; emulator evidence is a
  separate check until it is qualified. Cancel superseded runs of the same ref.

## Scenarios

GIVEN a QA build and disposable backend WHEN native controls navigate and submit
an inquiry THEN the expected Android screens and saved tenant-bound record agree
with the public API, and another business receives no inquiry.

GIVEN production, hosted Auth, signing/Firebase inputs or a wrong API/fixture flag
WHEN QA configuration is requested THEN resolution refuses the mixed inputs before
prebuild. GIVEN ordinary profiles THEN their current release identities and
admission checks remain unchanged.

GIVEN a crash, missing native control, backend failure or test timeout WHEN the
workflow ends THEN the job fails and retains the last safe screenshot/hierarchy
and explicit failed step. A passed browser test cannot substitute for that result.

## Test plan

| Criterion | Level | Evidence |
|---|---|---|
| QA isolation and mixed-context refusal | configuration | `scripts/test-native-qa-config.cjs`, existing mobile build/release safety tests |
| Actual install/navigation/keyboard/Back | native UI | `scripts/native-qa-ui.py`, Android workflow screenshots/hierarchies |
| Ordinary API persistence and tenant boundary | integration | `scripts/native-qa-backend.ts`, `scripts/native-qa-verify.ts` |
| Repeatable bounded runner and safe artifacts | operations | workflow/script checks, first native workflow run |

## Quality and limits

The QA app uses the existing English UI and accessibility labels, changes no
merchant content and publishes no production behavior. Add locale/font-scale,
offline/recovery, owner Auth/edit/publish and broader web/native parity cases
incrementally after this first real smoke. Missing Auth/push credentials remain
explicit coverage gaps. Native accessibility nodes do not prove TalkBack, and
an emulator does not prove physical-device keyboard/push or Play delivery.

## Rollout and rollback

Land the isolated workflow after its native run and required quality checks pass;
inspect actual screenshots before claiming native visual qualification. The test
build is disposable and never uploaded to EAS/Play. Removing/disabling the QA
workflow stops future runs; cleanup drops only its validated local fixture schema.
Production release, hosting, credentials and databases require no mutation.

## Readiness

Scope, exact QA target/identity, negative contracts, tests and rollout are explicit.
Master §22 will describe the implemented native QA boundary after qualification.
Ordered execution is checklist S195; the recurring demo simulator remains S194.
