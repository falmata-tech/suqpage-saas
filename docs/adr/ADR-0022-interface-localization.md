---
id: ADR-0022
title: Request-scoped local interface dictionaries
status: accepted
related: [FE-049, FE_BASE, BE_BASE]
---

# Local interface dictionaries

Use next-intl for request-scoped server/client language context, with local
message catalogs behind narrow UI-text adapters. The library supports the
installed Next.js/React versions. Domain modules remain independent of Next and
localization. No hosted translation provider or automatic DOM rewriting.

A validated cookie preserves stable business/product URLs. Server and client
render from the same selected catalog. Only platform-authored display strings
are translated explicitly; database rows and submitted values are never passed
through a generic tree/DOM translator. A small pure formatter keeps interpolation
literal and falls back to English for intentionally retained terms.

This adds a dependency but avoids inventing request-context/hydration machinery.
Only the selected language is sent to clients. Maintain catalog coverage and
payload-size checks. Future locale-prefixed SEO routes are outside this change.
