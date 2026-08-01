# Client showroom design workflow

Use this workflow whenever the user asks to design, redesign, review, or create
media for a client Suq. The design system remains the implementation boundary;
this folder holds the evidence that makes each result specific to the brand.

## Start a project

1. Copy the structure of `_template/` to `showroom-projects/<handle>/`.
2. Complete `BRIEF.md` from the user instruction and verified client material.
3. Put approved source images in `assets/`, inspiration screenshots in
   `references/`, booth direction or output in `booth/`, and review captures in
   `reviews/`.
4. Never place credentials, private customer data, database copies, raw exports,
   or unapproved third-party media in this folder.

The command `Design the client showroom for <handle>` means: read this workflow,
read that handle's complete project folder, inspect the existing Suq and current
recipe, implement a private candidate, review it in browsers, correct it, and
report the evidence. It never grants publication authority.

## Design sequence

### 1. Understand the business

- Identify the customer, product or capability, buying/inquiry context, brand
  character, and information priority.
- Separate verified facts from provisional writing. Do not invent capacity,
  certification, location, materials, availability, or contact details.
- Inventory every approved image by subject, orientation, quality, rights, and
  whether it is factual photography or clearly illustrative artwork.
- Record missing information as a review question without blocking a useful
  private design unless the missing fact affects safety or identity.

### 2. Establish art direction

- Write one short visual thesis before selecting components.
- Choose a non-color foundation for typography, spacing, shape, density, and
  media behavior from objective content needs.
- Derive a complete contrast-safe palette from the actual logo, packaging,
  products, workspace, or explicit client preference. Use primary, secondary,
  neutral, strong, and inverse roles intentionally; do not tint the entire site
  one color or default to cream, brown, or an industry stereotype.
- Choose components from their machine-readable anatomy, media needs,
  responsive behavior, and unsuitable conditions. Component IDs and industries
  are not design recommendations.

### 3. Compose the private Suq

- Preserve the canonical journey: header, hero, story/about, process, products
  or capabilities, inquiry call-to-action, footer.
- Give each section one distinct purpose. Alternate adjacent story/process
  composition and use deliberate surface contrast without divider clutter.
- Integrate hero and story media through a selected blend, fade, overlap, stage,
  or other admitted treatment. Do not place loose framed images on the page.
- Keep product media bounded and comparable. Use labeled media slots and honest
  no-media treatments until approved photography arrives.
- Keep the floating inquiry control available without covering phone content.

### 4. Create a coordinated booth when requested

Every City Suq booth should look like part of the same well-managed virtual
venue while remaining unmistakably tied to its business.

Shared booth language:

- clean front or slight three-quarter architectural view;
- consistent eye level, daylight, sign placement, floor contact, and image
  aspect ratio;
- a readable business name, one restrained product/craft cue, no people, no
  unsupported certification, and no fake street or building claim;
- realistic simple materials and a quiet base that crops safely inside booth
  cards.

Brand-specific variation:

- use the approved logo, palette, material, facade detail, display product, and
  degree of openness from the client brief;
- avoid changing the common camera, scale, or venue language so drastically
  that one booth appears to belong to another map or mall;
- label generated product-like imagery as illustrative until the client replaces
  or approves it.

### 5. Review and iterate

1. Render the exact private candidate with the client's current dynamic data.
2. Capture full-page 1440px desktop and 390px phone views. Add 320px when long
   words, dense products, or compact controls create additional risk.
3. Inspect the header, hero/media integration, section distinction, palette,
   type scale, product bounds, inquiry control, footer, touch targets, overflow,
   broken media, and browser errors.
4. Record findings in `reviews/REVIEW.md`, fix every blocking/high issue, and
   capture the corrected views. A first render is evidence, not completion.
5. Run the mapped focused tests plus `npm run check`; use acceptance/release gates
   when shared behavior or publication paths changed.
6. Send the exact candidate through client review and authorized publication.

## Completion standard

A client design is complete only when the brief and asset authority are clear,
the recipe validates, desktop and phone screenshots have been inspected, the
review log records the correction pass, inquiry behavior still works, and no
one has confused a private candidate with a published client decision.
