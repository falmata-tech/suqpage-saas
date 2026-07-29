# SuqPage AI Showroom Integration Contract

SuqPage accepts a bounded, declarative showroom recipe. The AI chooses reviewed
components, writes provisional content, selects media behavior, and supplies a
semantic color palette. It never returns executable code or publishes a site.

The portable schemas in this directory describe the JSON shape. The server is
authoritative for component compatibility, tenant and revision scope, media
admission, payload limits, private preview, approval, and publication.

## What the AI may choose

1. Freely drafted business, product, capability, story, process, hero, and call
   to action copy within the schema limits.
2. Any compatible reviewed component for each canonical page role.
3. Any admitted semantic `surfaceRole` for each section.
4. Any compatible reviewed `mediaIntegration` treatment.
5. An admitted `tokenPack` for typography, spacing, geometry, density, and media
   bounds.
6. An optional complete `customPalette` of exact six-digit hex colors. This
   replaces the token pack's colors without changing its non-color foundation.

`provenance` may be omitted or empty. `questions` and `warnings` are useful
review notes but do not block creation of a private draft. When provenance is
supplied, its paths and exported source keys must be valid.

## Boundaries

1. Return JSON only. Do not return React, JavaScript, CSS, HTML, class names,
   selectors, gradients, URLs, iframes, scripts, or dependencies.
2. Use the exact bank release, component IDs, properties, bindings, content
   block keys, and media destinations exported in the brief.
3. Assign every typed content block exactly once. This connects authored
   content to a renderer; it is not a factual-source requirement.
4. Keep the normal page roles in their exported order. Vary the component
   anatomy, alignment, density, surface, palette, and media treatment.
5. Do not invent media references. Use admitted opaque asset keys or declared
   planned-media destinations only.
6. Do not invent relationship keys. Preserve retained keys, declare intended
   removals, and obey the exported catalog limits.
7. Custom palettes must include every documented color role and maintain
   readable foreground/background contrast. They are data, not arbitrary CSS.
8. The recipe creates a private candidate only. Staff editing, client review,
   approval, and authorized publication remain separate actions.

## Workflow

1. Download the sanitized brief from the staff recipe studio.
2. Choose the content direction and write a complete provisional draft.
3. Choose a page template and compatible components from their explicit visual
   metadata rather than their IDs or an assumed industry.
4. Choose the non-color foundation, section surfaces, media treatments, and
   optional custom palette.
5. Return one complete recipe matching `showroom-recipe.schema.json`.
6. Import it into the private studio, resolve any true schema or media errors,
   and inspect the exact responsive preview.
7. Correct content or design in the focused editor, then use the existing
   client-review and publication workflow.

The example in each downloaded brief is synthetic and structural. Copy its JSON
shape, not its words, identifiers, counts, colors, or component choices.
