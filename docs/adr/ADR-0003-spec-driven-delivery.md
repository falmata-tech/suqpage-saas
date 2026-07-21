---
id: ADR-0003
title: Specs precede material behavior changes
status: accepted
date: 2026-07-20
deciders: [SuqPage]
related: [FE_BASE, BE_BASE, DEP-002]
---

# ADR-0003 — Specs precede material behavior changes

## Context

AI-assisted development can drift when chat instructions, implementation, and
tests evolve independently.

## Decision

Material behavior begins with cross-linked FE/BE/DEP specs as applicable.
Externally observable and security behavior uses GIVEN/WHEN/THEN. Completion
requires mapped tests and evidence. A validator runs locally and in CI/release.
Small non-behavior documentation changes may remain L0 without a feature spec.

## Consequences

- Requirements, code, tests, and rollout evidence remain reviewable.
- Work pauses at Definition of Ready when material choices are unresolved.
- Specs remain concise and outcome-focused to prevent documentation overhead.

## Verification

`npm run validate:specs`, traceability review, pull-request checklist, and CI.
