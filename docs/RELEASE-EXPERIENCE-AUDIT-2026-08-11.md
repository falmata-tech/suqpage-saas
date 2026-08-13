# MirtPage release experience audit

**Date:** 2026-08-11
**Controlling contracts:** FE-031, FE-032, FE-034, FE-035, BE-026, BE-027,
DEP-002, DEP-023, DEP-025

## Scope

The audit exercised the public marketplace, hosted showrooms, product and
inquiry surfaces, administrator and operations workspaces, team-member work,
client workspaces, support, renewal, revision editing and preview, API failure
states, PWA phone navigation, PostgreSQL migration/runtime parity, and the
production container. Desktop and 390-pixel phone states were reviewed with
automated WCAG checks and focused screenshots. It does not claim conformance
from automation alone.

## Corrections

- Restored one primary landmark and top-level heading per audited route; removed
  duplicate IDs and corrected unnamed controls, SVG marker semantics, dialog
  state, focus paths, table containment, touch sizing, and admitted contrast.
- Made phone navigation and workspace menus expose their open/current states
  without covering primary content or creating page-level overflow.
- Corrected product-detail and inquiry temporary surfaces, including reachable
  close paths and reduced-motion behavior.
- Removed customer-facing fixture language about fictional workflows and
  operations queues while preserving neutral demonstration content.
- Aligned public signup labels and acceptance copy with the current product
  vocabulary, and tested the actual mobile discovery filter sheet.
- Corrected stale browser assumptions about industry-colored markers, preview
  scrim opacity, workspace labels, progressive disclosures, and exact preview
  actions.
- Corrected the PostgreSQL runtime rehearsal so automatic support assignment is
  verified against the real enabled-agent contract instead of assuming a newly
  created agent is the only available agent.
- Corrected operations backup fixtures to honor the one-active-project
  invariant instead of selecting a business already carrying active work.

## Evidence

| Gate | Result |
|---|---|
| `npm run test:accessibility` | 88 cross-role desktop/phone states passed; `/tmp/mirtpage-accessibility-audit.json` |
| `npm run test:acceptance` | 10/10 ordered workflows passed |
| `npm run release` | Production build, trace privacy, HTTP smoke, scale, security, adapter, revision, recipe, and dependency audit gates passed; 0 production vulnerabilities |
| `npm run test:operations` | Migration, integrity, private attachment/revision backup, and restore passed |
| `npm run test:container` | Context exclusions, build-time origins, non-root runtime, production preflight, persistence, and health passed |
| `npm run test:postgres-readiness` | PostgreSQL 17 schema, copy, constraints, triggers, sequences, invariants, fingerprints, runtime, and source preservation passed |

Focused visual evidence is available at
`/tmp/mirtpage-audit-discovery-final`,
`/tmp/mirtpage-audit-workspaces-final-2`, and
`/tmp/mirtpage-audit-focused-final-3`.

## Remaining launch evidence

- Commit and push an intentionally reviewed task scope, then require all remote
  GitHub Actions jobs to pass on that exact commit.
- Deploy that commit to Vercel with production-only Supabase and media secrets;
  verify HTTPS, canonical URLs, custom-domain DNS, CSP, provider video, backup,
  monitoring, and rollback against the deployed origin.
- Complete hands-on review with keyboard-only users and people who use target
  assistive technologies. Record exceptions or remediation without treating
  an automated scan as a WCAG certification.
- Measure real low-end phones as a single city or Daily Featured floor grows
  toward the documented 200-showroom rendering boundary.

## Final release-candidate addendum — 2026-08-13

The exact production candidate additionally passed:

- `npm run release`, including a production build, 60 private-path-safe output
  traces, HTTP/security smoke, 66-showroom scale fixtures, revision rollback,
  and a zero-vulnerability production dependency audit.
- `npm run test:acceptance`: 10/10 ordered production-browser workflows.
- `npm run test:accessibility`: 88/88 public, administrator, operations,
  client, dialog, drawer, and phone states with no admitted WCAG A/AA,
  duplicate-ID, overflow, load, or browser-console failures.
- `npm run test:public-app-visual`: Market, City Market, Daily Featured, About,
  and More at 1440px, 390px, and 320px, including responsive venue geometry and
  booth-origin panning.
- `npm run test:postgres-readiness`: PostgreSQL 17 rehearsal of 47 tables,
  2,733 rows, 99 checks, 83 foreign keys, 81 indexes, 14 triggers, 47 table
  fingerprints, four negative invariants, and a byte-preserved SQLite source.

The exact-tree `npm run test:container` retry did not reach application
compilation because Docker's clean `npm ci` connection to `registry.npmjs.org`
ended in `EIDLETIMEOUT`. The earlier audited container behavior remains valid
for its prior candidate, but it is not claimed as exact-tree evidence. Required
GitHub Actions must independently perform the clean-network build before this
candidate is merged or deployed.
