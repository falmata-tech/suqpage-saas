---
id: ADR-0019
title: Retire custom-page requests in favor of owner pages
status: accepted
date: 2026-09-14
deciders: [product, engineering]
related: [FE-042, BE-033, ADR-0018]
---

# ADR-0019 — Standard pages replace custom-page requests

The owner explicitly removes custom-page requests and all their application features.
Use the standard page editor and canonical products throughout owner/staff/admin
workspaces. First publication has a small owner-submitted, admin-reviewed lifecycle;
subsequent owner publication and revocable staff assistance retain BE-032 boundaries.
Staff assignments belong to businesses, not page projects. Support, buyer inquiries,
account invitations and marketplace moderation remain independent capabilities.

Remove live custom request/revision/studio/intake entrypoints and navigation, rather
than hiding links while leaving mutation paths available. Preserve historical rows,
assets and compatible catalog version readers for data integrity; their presence does
not enable the retired feature. A destructive purge is outside this change. This
supersedes earlier ADR/spec statements that managed design is an available workflow.
