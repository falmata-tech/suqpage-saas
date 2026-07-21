# SuqPage Custom Showroom Integration Contract

Use this package when a designer or AI generates a new client showroom.

## Non-negotiable boundaries

1. The custom renderer owns layout, typography, animation, sections, cards and responsive behavior.
2. SuqPage owns business data, catalog data, option groups, stock, inquiry state, inquiry persistence, social routing and delivery APIs.
3. Do not hard-code products, categories, collections, business contacts, availability or inventory.
4. Do not translate product names, color names, sizes, model numbers or other merchant-entered values.
5. Do not call the SQLite database from design components.
6. Keep the supplied TypeScript props intact.
7. Place `SmartAddButton` or the supplied `addProduct` callback anywhere a product can be added.
8. Keep a visible inquiry-cart trigger.
9. Return a manifest describing the design key and supported features.

## AI workflow

1. Copy `ShowroomTemplate.tsx`, `design-manifest.json` and `sample-catalog.json` into a separate design workspace.
2. Ask the AI to redesign every visual section while preserving the integration props and event callbacks.
3. Copy the returned renderer into `components/showroom/designs.tsx` or its own folder.
4. Register the business `design_key` in `ShowroomApp.tsx`.
5. Run `npm run validate:designs` and `npm run build`.
6. Preview the design using real tenant data before publishing.

The four included tenants demonstrate the pattern: Al Haya, USAshopET, NovaTech and HomeVibe each use a separately coded renderer while sharing SuqPage's smart workflow.
