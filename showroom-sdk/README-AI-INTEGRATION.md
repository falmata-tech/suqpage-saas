# SuqPage Showroom Integration Contract

The current production path uses separately reviewed showroom renderer code. The
accepted target in `ADR-0005` is a versioned bank of reviewed components and
strict, non-executable AI design proposals.

The files `component-bank.schema.json` and `showroom-proposal.schema.json`
describe the syntactic foundation for that target. SuqPage now has the reviewed
repository release `showroom-bank@1.0.0` and a staff-only visual laboratory. It
does **not** yet have a public composition renderer, proposal import screen,
revision-schema integration, client-content mapper, or external AI provider
integration. A JSON document that matches the portable schema is not authorized
for preview, persistence, or publication until later server-side semantic,
tenant, revision, provenance, and compatibility validation exists.

Use `ShowroomTemplate.tsx`, `design-manifest.json`, and `sample-catalog.json` only
for the current reviewed-code workflow described below.

## Non-negotiable boundaries

1. The custom renderer owns layout, typography, animation, sections, cards and responsive behavior.
2. SuqPage owns business data, catalog data, option groups, stock, inquiry state, inquiry persistence, social routing and delivery APIs.
3. Do not hard-code offerings, product categories, business contacts, availability, capacity, MOQ, lead time, or inventory. The `products` array is the compatibility transport for products and capabilities; collection fields are compatibility-only and must remain empty/null.
4. Do not translate product names, color names, sizes, model numbers or other merchant-entered values.
5. Do not call the SQLite database from design components.
6. Keep the supplied TypeScript props intact.
7. Place `SmartAddButton` or the supplied `addProduct` callback anywhere an offering can be added to an inquiry.
8. Keep a visible inquiry-cart trigger.
9. Return a manifest describing the design key and supported features.

## Current reviewed-code workflow

1. Copy `ShowroomTemplate.tsx`, `design-manifest.json` and `sample-catalog.json` into a separate design workspace.
2. Ask the AI to redesign every visual section while preserving the integration props and event callbacks.
3. Treat all returned code as untrusted proposed source: review it, remove
   external dependencies and tenant-specific hard-coding, and add tests.
4. Copy the reviewed renderer into `components/showroom/designs.tsx` or its own
   folder.
5. Register the business `design_key` in `ShowroomApp.tsx`.
6. Run `npm run validate:designs`, `npm run check`, and the applicable release
   and production-browser gates.
7. Preview the exact revision using authorized tenant data and publish only
   after client approval.

The four included tenants demonstrate the pattern: Al Haya, USAshopET, NovaTech and HomeVibe each use a separately coded renderer while sharing SuqPage's smart workflow.

## Planned constrained-composition workflow

After the later roadmap phases are implemented, an external AI tool will receive
a sanitized component-bank package and return only a proposal matching
`showroom-proposal.schema.json`. It will not return executable tenant code,
receive database credentials, write a revision, or publish a showroom.

Authorized staff can currently inspect the admitted components and token systems
at `/dashboard/design-bank`. The laboratory uses synthetic fixture content and
is not an AI export, tenant preview, or publication tool.

The authoritative delivery sequence and remaining gates are in
`docs/SHOWROOM-COMPOSITION-ROADMAP.md`.
