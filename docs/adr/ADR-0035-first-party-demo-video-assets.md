---
id: ADR-0035
title: Bounded first-party MP4 examples for fictional demos
status: accepted
date: 2026-11-15
deciders: [AfricMade]
related: [FE-061, BE-049, ADR-0025, DEP-039, DEP-042]
---

# ADR-0035 — Bounded first-party MP4 examples for fictional demos

External video providers can return a player document while the media file
fails. The S197 fallback is a small set of licensed or original MP4 examples
served as immutable static files by the existing Netlify/Next site. This keeps
the visitor on the same site, does not require a new Supabase bucket, credential,
database table, provider SDK, or universal merchant-video upload service.

A `demo:<slug>` canonical ref contains only a bounded lowercase slug. It
constructs `/videos/demo/<slug>.mp4`; no arbitrary URL, path, HTML or object
key is admitted. Only fictional demo records may save this ref. Existing owners
continue to use the four public providers in ADR-0025. Every packaged asset
requires a retained source/license record, SHA-256, media-format/size review,
business-type visual verdict and one `Example business` label on the showroom.
The player and product cards carry no repeated explanation. Source files
and rights must not be inferred from a thumbnail or an inaccessible embed.

Static assets avoid proxying video through an application function and leave
HTTP range/CDN delivery to the existing host. No hosted media correction is
admitted until desktop/phone web, Expo preview and deployed static delivery
pass. Native Android remains a separate device follow-up. Measure
repository/deploy size and egress before adding the batch.
Rollback keeps the previous published videos and reverts exact demo refs with
protected before-images; do not mutate real merchant content.

The alternative of copying blocked social clips into Storage is rejected:
embed availability is not a license to rehost, and the existing private image
bucket accepts only image MIME types. A general owner-video upload or new
video storage service is outside S197.
