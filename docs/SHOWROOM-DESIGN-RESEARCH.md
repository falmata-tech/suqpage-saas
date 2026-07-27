# Showroom bank 1.2 design research

Research checkpoints: 2026-07-24 and 2026-07-27. This document records transferable interaction
and art-direction patterns, not layouts or trade dress to copy. Component-bank
contracts remain authoritative under `FE-009`, `BE-010`, `BE-013`, `DEP-009`,
and `DEP-011`.

## SuqPage v1 comparison

Desktop and 390px full-page captures of the static v1 homepage and its four
linked examples were reviewed on 2026-07-27:

- [Al Haya](https://suqpage.com/@alhayabrand/) succeeds through one immersive
  campaign image, a restrained green/gold palette, compact category discovery,
  and unusually effective two-column mobile product cards. Its weaknesses are
  repeated card actions and a 5,540px mobile page.
- [NovaTech](https://suqpage.com/@novatech/) integrates the hero product
  composition into the page background, uses a strong neutral/signal-blue
  hierarchy, and changes grid proportions according to product importance. Its
  mobile page reaches 7,676px and some secondary copy and controls become too
  small.
- [USAshopET](https://suqpage.com/@usashopet/) uses a real multi-role palette,
  an illustrative hero collage, clear status labels, and a satisfying
  contrasting close. Its repeated single-column mobile cards extend to 9,533px
  and the many tinted card surfaces compete with product recognition.
- [HomeVibe](https://suqpage.com/@homevibe/) has the strongest editorial
  product hierarchy: overlapping hero media, an asymmetric catalog, and
  full-width story bands prevent the page from reading as a uniform card grid.
  Uneven cards and a 10,352px mobile page make repeated shopping inefficient.
- The v1 homepage uses clear finished-showroom examples, but its 390px capture
  measures 407px wide and therefore fails the current no-horizontal-overflow
  contract.

The transferable lesson is template-level art direction. Hero imagery may be
split-bleed, softly inset on one edge, editorially overlapped, or blended as a
product stage. Catalog density and image treatment must still be bounded, and
mobile composition must shorten and reflow instead of merely stacking every
desktop block.

## Observed patterns

- Beauty and personal care: [Aesop](https://www.aesop.com/) combines sensory
  editorial headlines, short product films, ingredient/material close-ups,
  curated sets, and alternating story/product chapters. [Glossier skincare](https://www.glossier.com/pages/skincare)
  uses a concise brand philosophy, strong category framing, compact benefit
  copy, badges, and product cards that remain easy to scan.
- Furniture and interiors: [IKEA room inspiration](https://www.ikea.com/gb/en/ideas/rooms-inspiration/)
  moves between room scenes, practical editorial guidance, categories, and
  products in context. Its [living-room presentation](https://www.ikea.com/us/en/rooms/living-room/)
  uses horizontal collection shelves, seasonal color stories, video with user
  controls/transcript, planning tools, and trust/service panels.
- Premium furniture and technical products: [Herman Miller product discovery](https://www.hermanmiller.com/en_eur/search-results/products/)
  separates product families and use contexts while keeping detailed systems
  and specifications discoverable rather than forcing every fact into a card.
- Platform-quality motion: [WebKit's current animation guidance](https://developer.apple.com/videos/play/wwdc2025/233/)
  supports CSS scroll-driven effects as progressive enhancement, with explicit
  accessibility consideration. Native scroll behavior and clear page purpose
  remain more important than spectacle.

## Patterns admitted for design exploration

- Editorial alternation: full-bleed or framed media followed by concise copy,
  product chapters, and strong whitespace rhythm.
- Tactile material language: swatch edges, fibers, grain, ingredient circles,
  macro-image crops, layered paper frames, and bounded collage.
- Product-specific cards: beauty swatches and benefit chips; technology feature
  labels and specification drawers; textile sample stacks; furniture room-set
  cards; ingredient or provenance annotations.
- Progressive disclosure: short visible facts with semantic detail expansion,
  visual chapter navigation, horizontal rails with clear scroll affordance, and
  no hover-only content.
- Controlled delight: short mask/fade/lift/stagger reveals, restrained image
  zoom on deliberate focus/hover, subtle light/glow or border response, and
  static presentation when effects are unavailable.
- Semantic foundation systems: named canvas, surface, text, primary, secondary,
  on-color, border, typography, shape, spacing, layout, and media decisions.
  The recipe brief selects this system before choosing a page template or
  component variants.

## Rejected patterns

- Scroll-jacking, large parallax planes, cursor followers, autoplay with sound,
  perpetual marquees, flashing, essential content hidden behind animation,
  hover-only actions, remote animation scripts, and recipe-controlled CSS.
- Cloning a researched company's layout, typography, text, imagery, color
  signature, or code. The bank uses generic capabilities and SuqPage-owned
  implementations only.

## Accessibility and performance boundary

[W3C guidance on animation from interaction](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
requires non-essential interaction motion to be disableable. The broadly
supported [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
preference must remove non-essential movement, especially large scaling,
panning, and parallax. [MDN's CSS performance guidance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS)
supports CSS animation over JavaScript for bounded DOM effects.

Bank 1.2 therefore adds no animation dependency or scroll listener. Effects use
reviewed scoped CSS, prefer transform/opacity or progressive CSS capabilities,
have a static fallback, preserve layout and actions, and are removed under
reduced motion. Admission includes 320/390-pixel behavior, keyboard/touch,
contrast, long text, missing media, layout stability, and no page overflow.
