---
id: BE-024
title: Provider-neutral media storage
status: done
related: [BE-010, BE-026, BE-028, FE-009, FE-025, FE-031, DEP-015, DEP-021, DEP-022, ADR-0012, ADR-0013]
owners: [backend, security, operations]
last_updated: 2026-08-02
change_level: L3
---

# BE-024 - Provider-neutral media storage

## Problem and outcome

Verified media is currently written and read directly from one local filesystem.
That is appropriate for the single-instance pilot, but it couples application
services and routes to local paths and prevents a data-preserving object-storage
deployment. MirtPage needs one server-only media port with local and Supabase
Storage adapters while retaining every existing database reference.

## Scope

### In scope

- One narrow asynchronous object-store contract for put, get, and remove in
  public-showroom and private-request namespaces.
- A filesystem adapter preserving current paths and a server-only Supabase
  Storage REST adapter for a private bucket.
- Existing image verification, decoding, metadata removal, dimension/byte limits,
  random immutable names, and MIME handling.
- Public `/media/:filename` and authorized request-attachment routes reading
  through the port.
- Revision publication materializing selected private images through the port.
- Direct focused-editor admission through the existing recipe-media authority.
- Adapter and negative-path tests with no live provider dependency.

### Non-goals

- Browser possession of service credentials, arbitrary remote image URLs, public
  request attachments, automatic bucket creation, PostgreSQL migration, or
  multi-instance SQLite.

## Domain language and invariants

- **Media object key** is an opaque validated filename. The storage namespace is
  chosen by trusted application code and is not accepted from a public caller.
- Stable application references remain `/media/<opaque-name>` for published
  media and `request-attachment:<database-id>` for private revision media.
- Supabase credentials are server-only. The application proxies public reads so
  changing storage provider never rewrites published recipes or tenant content.
- Objects are immutable. Replacement creates a new random key; existing
  published versions retain their old key until an explicit retention process
  proves it is unreferenced.

## Contracts

- `MediaObjectStore` exposes asynchronous `put`, `read`, and `remove` operations
  over `public` and `requests` namespaces and returns bounded typed failures.
- Both adapters reject traversal, slashes in object names, unsupported
  extensions, and unknown namespaces before I/O.
- Supabase requests use HTTPS, a configured private bucket, `apikey` plus bearer
  service authorization, exact content type, immutable cache metadata, and no
  upsert. Provider response bodies and credentials never reach a user or log.
- A missing object returns the same 404 behavior from either provider. Authorized
  request reads retain `private, no-store`; published reads retain immutable
  caching and `nosniff`.
- Storage succeeds before database publication. If a later transaction fails,
  cleanup is awaited; failed cleanup is reported safely for operator follow-up
  without hiding the original failure.
- Local mode remains the default and requires no external service. Supabase mode
  fails production preflight when URL, server credential, or bucket is absent or
  malformed.
- Existing local data is migrated by copying keys to the matching object-store
  namespace without modifying or deleting source files or database rows.

## Scenarios

```gherkin
Scenario: Existing published reference is served from object storage
  GIVEN the database contains /media/product-<uuid>.webp
  AND the same key exists in the configured public media namespace
  WHEN a visitor requests that stable route
  THEN the adapter returns the exact sanitized image and MIME type
  AND no provider credential is exposed

Scenario: Authorized staff publishes a selected private image
  GIVEN a private request attachment is stored in the requests namespace
  WHEN an approved revision is published
  THEN a new immutable public object is created and the published snapshot uses /media/<new-key>
  AND the private source and retained revisions remain available

Scenario: Unauthorized request attachment read is attempted
  GIVEN a valid private storage key belongs to another tenant request
  WHEN a caller requests its attachment route
  THEN authorization fails before object storage is read
  AND the response is indistinguishable from a missing attachment

Scenario: Object provider fails during upload
  GIVEN Supabase mode is configured but the provider rejects a write
  WHEN a user uploads an image
  THEN no database reference is committed
  AND the user receives a bounded retryable error with no provider body or secret
```

## Quality impact

- Security and tenant isolation: namespace and route authorization are server
  owned; provider service credentials never reach client bundles.
- Privacy and data retention: private attachments remain non-public and existing
  retained media is never overwritten.
- Performance and limits: all objects remain at most 5 MiB; provider reads may be
  streamed or bounded in memory; immutable cache semantics are preserved.
- Failure recovery and idempotency: immutable random keys make retries safe;
  migration is copy-only and repeatable.

## Observability

Record provider name, namespace, operation, safe status class, byte-size bucket,
and duration. Never record object keys, signed/provider URLs, credentials,
request content, file names supplied by users, or response bodies.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Local and Supabase adapter parity | unit/integration | `scripts/test-media-storage.ts` |
| Image validation and cleanup | integration | `scripts/test-product-upkeep.ts`, `scripts/test-requests.ts` |
| Private route authorization | security | `scripts/test-security.ts` |
| Revision publication through port | integration | `scripts/test-revisions.ts` |
| Production configuration denial | operations | `scripts/test-operations.mjs`, `scripts/test-container.mjs` |

## Rollout and rollback

DEP-021 performs a copy-only media rehearsal and switches the provider only after
key parity passes. Rollback restores filesystem mode; source files and stable
database references remain unchanged.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related layers and ADR linked
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: completed locally on 2026-08-02. `scripts/test-media-storage.ts` proves
filesystem/Supabase adapter parity, immutable names, traversal denial, and
bounded provider failures without a live dependency. Product-upkeep, request,
security, revision-publication, operations, release, and container gates prove
sanitization, authorization-before-read, cleanup, stable serving, invalid
configuration denial, trace privacy, and filesystem-mode persistence.

The copy-only Supabase command remains an operational rollout tool: its remote
dry run and execute/hash-verification steps intentionally require the private
bucket credentials described by DEP-021 and are not completion criteria for
this provider-neutral contract.
