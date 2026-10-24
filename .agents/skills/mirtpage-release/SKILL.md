---
name: mirtpage-release
description: Prepare and qualify a requested AfricMade Android build, web deployment, hosted setting change or release recovery. Use when delivery work is requested; not copy-only edits or ordinary feature tests.
---

Resolve paths from this repository root. Read the active release dependencies in
`docs/SUQPAGE-TRANSITION-CHECKLIST.md`, then only the relevant `DEP-049` section at
`specs/deployment/DEP-049-mirtpage-domain-and-app-cutover.md`. Follow `AGENTS.md`;
this skill supplies no deployment, credential or signing authority.

Verify current identity from `lib/brand.ts`, `apps/mobile/app.json` and the
app's build configuration: AfricMade is the public presentation brand;
mirtpage.com and Android `com.mirtpage.app` remain compatibility identifiers
until their separately guarded cutovers.
Independently confirm any provider account/project/environment through the
existing operation's target checks. Do not infer a target from the checkout,
provider slug or historical Suqpage name. Read current evidence summaries and
exact manifests instead of raw credentials or large logs.

Resume the first incomplete dependency. Bind source, lock/tool inputs, gates,
artifact identity and applicable existing owner approval. Reuse source-matched
passing evidence when its relevant inputs are unchanged. For Auth use
`specs/deployment/DEP-029-production-auth-change-guard.md`. For native tooling
use `specs/deployment/DEP-044-google-play-testing-rollout.md` and its current
exact artifact-admission contract. A previous build or consumed rollout approval does
not admit a different artifact.

Use existing reviewed commands and recoverable before-images. Preserve failures;
an unexpected hosted outcome stops subsequent writes until the existing recovery
contract is satisfied. Verify the published routes, images and worker when
applicable. Report static inspection, physical Android, Play delivery and actual
closed-test enrollment separately; build success starts no testing clock.
