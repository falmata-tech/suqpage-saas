---
id: ADR-0012
title: Provider-neutral immutable media storage
status: accepted
date: 2026-08-02
deciders: [MirtPage]
related: [FE-025, BE-024, DEP-002, DEP-015, DEP-021]
---

# ADR-0012 - Provider-neutral immutable media storage

## Context

MirtPage verifies and sanitizes uploads correctly, but product media, request
attachments, routes, and revision publication depend directly on a local
filesystem. The soft launch must preserve the populated demo environment and
support a later object-storage cutover without rewriting database references or
giving browsers provider credentials.

## Decision drivers

- Preserve every current public and private media reference.
- Keep tenant authorization in MirtPage rather than provider URLs.
- Permit a free-first Supabase Storage deployment without requiring it locally.
- Keep uploads immutable so published-version rollback remains reliable.
- Avoid coupling domain services to one SDK or network provider.

## Considered options

1. Keep direct filesystem access everywhere: simplest, but prevents object-store
   deployment and keeps application code coupled to local paths.
2. Store provider public URLs in business, product, attachment, and revision
   records: easy to render, but leaks provider choice into durable content,
   complicates private media, and requires data rewriting on migration.
3. Introduce one server-only media port, preserve stable MirtPage references,
   and implement filesystem plus private Supabase Storage adapters.

## Decision

Choose option 3. Application services address validated opaque object names in a
trusted `public` or `requests` namespace. The filesystem adapter retains current
layout. The Supabase adapter uses a private bucket through server-side Storage
API calls. MirtPage routes remain the read boundary, so authorization and stable
references are independent of the provider.

New objects always receive random immutable names. Replacements never overwrite
an existing object. A copy-only command moves existing keys into the equivalent
object-store namespace without changing database rows or deleting local files.

## Consequences

### Positive

- Existing recipes, products, and retained revisions need no media rewrite.
- Private request attachments stay behind MirtPage authorization.
- Local development remains external-service free.
- Object storage can be enabled independently from the future PostgreSQL cutover.

### Negative / debt

- Public media continues through the application route instead of a direct CDN
  URL; a later reviewed public-bucket or signed-redirect mode may optimize this.
- Provider calls add latency and failure handling to publication and upload.
- SQLite still requires one application replica and persistent database storage.
- Bucket creation, retention policy, backup, and credentials remain operator
  responsibilities.

## Verification

BE-024 proves adapter parity, authorization order, stable references, immutable
writes, and bounded failures. FE-025 proves upload and rendering workflows.
DEP-021 proves copy-only migration, preflight, rollback, and launch gates.
