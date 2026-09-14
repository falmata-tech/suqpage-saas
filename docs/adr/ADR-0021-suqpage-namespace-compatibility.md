---
id: ADR-0021
title: Canonical Suqpage namespace with bounded legacy compatibility
status: accepted
date: 2026-09-14
deciders: [product, engineering]
related: [BE-036, DEP-032]
---

# ADR-0021 — Canonical Suqpage namespace

Use Suqpage for source, configuration names, generated artifacts and current
platform language. Centralize the old namespace where it is needed to read
persisted state or connect to an existing provisioned resource. Canonical values
win, including explicit empty values; never log values during normalization.

Blind textual replacement of account emails, Auth identities, cookie/cart keys,
Storage buckets, provider URLs or archived backup members would break continuity.
Keep exact compatibility mappings and regression evidence rather than disguising
old identifiers or inventing replacement resources. New writes use canonical
browser-state names; old reads are supported during migration. Historical URLs
and externally assigned IDs remain factual evidence.
