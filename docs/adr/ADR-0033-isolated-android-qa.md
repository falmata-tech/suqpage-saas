---
id: ADR-0033
title: Isolated Android QA on standard GitHub runners
status: accepted
related: [DEP-053, FE-053]
owners: [operations, frontend, security]
last_updated: 2026-11-13
---

# ADR-0033 — Isolated Android QA on standard GitHub runners

Use accelerated Android emulators on standard GitHub-hosted Linux VMs for native
development checks. The execution workspace has no `/dev/kvm`; the repository is
public and standard runner compute is free under GitHub's current public-repo
terms. Keep artifacts small with seven-day retention. A new subscription or
interactive paid device service is unnecessary for the first repeatable smoke.

Derive an explicitly labeled, separately packaged debug app against disposable
local API/PostgreSQL data and a synthetic map. Reuse actual app/UI/domain code;
drive Android's accessibility hierarchy through ADB and inspect its screenshots.
Use a pinned emulator action and the installed SDK/Gradle toolchain with finite
timeouts. Do not add a second application, API mock or mobile automation service.

This gives reproducible native evidence without production signing, Firebase,
Auth credentials or customer writes. It leaves push, authenticated owner flows,
physical devices and store release unqualified. Keep DEP-044's exact release
admission intact; this disposable QA artifact is never a release candidate.

References: [GitHub runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners),
[Expo development workflows](https://docs.expo.dev/develop/development-builds/development-workflows/),
[Android ADB](https://developer.android.com/tools/adb).
