# MirtPage SaaS MVP — Launch Verification Report

**Release:** `1.0.0-mvp-launch`
**Verified:** 2026-07-20
**Runtime:** Node.js 22.16.0, Next.js 16.2.10

## Release-gate result

`npm run release` completed successfully after a clean production build.

The release gate includes:

- Next.js production build
- production HTTP smoke tests
- TypeScript validation
- custom-showroom integration validation
- security and tenant-isolation integration tests
- production dependency audit

The production dependency audit reported **0 vulnerabilities**.

## Production HTTP checks

Verified against `next start` with an isolated temporary database and media directory:

- active showroom returned HTTP 200
- draft showroom returned HTTP 404
- runtime media route returned HTTP 200
- security headers included CSP and frame denial
- unauthenticated Malikt Board request listing returned HTTP 401
- unauthenticated Malikt Board request creation returned HTTP 401
- forged cross-tenant inquiry returned HTTP 400
- valid canonical inquiry returned HTTP 201
- duplicate inquiry returned the original record instead of creating another
- inquiry abuse threshold returned HTTP 429

## Security and data-integrity checks

Verified:

- cross-tenant collection/product relationships are rejected by SQLite triggers
- public inquiry quantities are limited and checked against stock
- invalid option names and values are rejected
- draft businesses cannot be resolved by the public catalog lookup
- delivery requests cannot be created for another owner’s tenant
- HTML disguised as an image is rejected
- valid images are decoded, stripped of metadata, and re-encoded before storage
- runtime uploads use persistent media storage instead of the Next.js build directory
- opaque server-side sessions are revocable and contain no user identity in the cookie
- temporary-password accounts cannot use dashboard or authenticated API workflows until the password is changed

## Seed validation

A reset creates:

- four separately rendered test businesses
- one administrator and four owner accounts
- unique generated temporary passwords
- collections, categories, products, option groups, and values
- four mock delivery companies

Generated credentials are written to `.local/seed-credentials.txt`, which is excluded from source control and the release ZIP. Every seeded user must change the temporary password.

## Deployment boundary

This release is approved for a **controlled four-client pilot on one persistent server**. It is not approved for horizontal scaling because the MVP intentionally uses SQLite and local persistent media. The Malikt Board integration remains a secured local simulation until the external API is available.
