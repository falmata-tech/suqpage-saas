# Launch UX and performance audit

**Review date:** 2026-08-11
**Controlling specs:** FE-025, FE-031, FE-035, BE-024, BE-028, DEP-023

## Reviewed journeys

- Public marketplace at 1440, 390, and 320 CSS pixels
- Industry selection, instant search, map/list state, location jump, clusters,
  city marketplace, sponsored showrooms, Daily Featured Showrooms, and showroom preview
- Public login and business signup
- Administrator attention dashboard and paginated business workspace list
- Client request intake, AI brief, recipe import, generated image checklist,
  focused revision editor, preview, and approval path
- Public showroom header, hero, combined Story and process, Products & Capabilities, product
  detail, floating inquiry, final inquiry call to action, and footer
- Local and Supabase media adapters, stable public reads, authorized private
  reads, upload cleanup, publication copying, configuration, and migration

## Corrections included in this release

- Public search now updates after a 420 ms pause and keeps URL-backed industry,
  region/city, view, and featured-day state. There is no redundant Search
  button; clearing remains explicit.
- Public result cards stay at five per page. Authenticated collection pages use
  ten records per page, deterministic ordering, server filters, result counts,
  and previous/next navigation.
- Daily Featured and city floors use bounded DOM/CSS effects, broad circulation, a defined
  venue perimeter, and responsive pan, zoom, and fit controls without a fine
  square grid or animation library.
- Ethiopia administrative boundaries load first. The 184 KiB zone layer,
  412 KiB place layer, and 732 KiB road layer load during browser idle time.
- Process video is part of the combined Story and process chapter, has a deliberate unloaded state,
  and creates a privacy-enhanced iframe only after activation. The header does
  not duplicate it.
- Recipe import creates labeled image slots. Staff fulfill those slots with the
  existing authorization, signature, decode, pixel, byte, rights, and private
  storage checks, then edit settings, layout/style, content, and offerings in
  four focused areas.
- AI briefs distinguish an initial design from a change request. Existing
  showrooms also export the complete current recipe after staff, client,
  offering, content, and media changes.
- Visible copy now uses task language such as design, images, preview, approval,
  business, and showroom. Internal storage and schema terms remain in technical
  staff tools only where needed.
- Mutable media reads and writes use one asynchronous server-only port. Local
  filesystem behavior remains the default; a private Supabase Storage adapter
  and repeatable copy-and-hash migration command are available without changing
  database references.

## Current operating boundary

The application is driver-selectable and the prior exact production candidate
passed PostgreSQL and private Supabase Storage smoke checks. This newer release
still requires exact-commit gates and redeployment; no custom-domain launch is
claimed here. PostgreSQL removes the former single-replica SQLite runtime
boundary, while one controlled application deployment remains the initial
operating plan.

The current map sends the active industry/scale showroom projection to the
browser so Supercluster can provide fluid local zooming. That is appropriate for
the present demonstration and early cohort. Before an industry contains several
hundred active showrooms, replace it with a bounded viewport or tile endpoint.

Public search uses indexed scope predicates followed by bounded SQL substring
matching. Before the catalog reaches sustained high thousands, measure real
queries and introduce PostgreSQL full-text or trigram search rather than adding
client filtering.

Daily Featured and city floors intentionally render every participant in the selected
program or city. Measure low-end phone behavior before a single floor approaches
200 businesses; add spatial windowing while preserving one continuous venue if
that boundary is reached.

The static public asset tree is approximately 37 MiB, mostly demonstration
showroom media. Browser pages load only referenced images, but production image
delivery should use immutable caching and an image CDN in front of object
storage as traffic grows.

The former Delivery/Malikt demonstration is retired. Its routes, navigation,
actions, query adapters, and fresh setup data are absent; legacy tables remain
dormant for a data-preserving rollback window.

## Release evidence

On 2026-08-02, the full check, 10/10 ordered browser acceptance, non-destructive
migration, backup/restore operations, production release, and production
container gates passed. The two reviewed demo videos cover the public
marketplace and the complete operating workflow. Commit/push and remote GitHub
Actions evidence remain tracked in `docs/LAUNCH-VERIFICATION.md`; no production
launch is claimed. On 2026-08-09, focused contract evidence for the combined
chapter, client workflow, current homepage, and storage boundary passes; updated
visual approval and full release evidence remain pending.

On 2026-08-11, the current working tree passed 88 cross-role desktop/390px
accessibility states, 10/10 ordered browser acceptance workflows, the production
release gate, backup/restore operations, the production-container gate, and the
disposable PostgreSQL 17 readiness rehearsal. That rehearsal reconciled 47
tables and 2,806 rows with 99 checks, 83 foreign keys, 81 indexes, 14 triggers,
sequences, row fingerprints, runtime workflows, and read-only source
preservation. This is local release-candidate evidence; commit-specific GitHub
Actions, Vercel deployment, custom-domain checks, and production monitoring are
still required before launch is claimed.
