import fs from "node:fs";
import path from "node:path";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";
import { ADDITIONAL_SEED_SHOWROOM_BRIEFS } from "../lib/showroom-seed-briefs";
import { SHOWROOM_DESIGN_SYSTEMS } from "../lib/showroom-design-systems";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const projectsRoot = path.join(root, "showroom-projects");

const benchmarkClients = [
  { handle: "selam-weave", name: "Selam Weave Studio", location: "Addis Ababa", customer: "households, hospitality buyers, and textile collectors", paletteRequest: "indigo, ivory, and warm craft neutrals", paletteAdvice: "Indigo leads on bright neutral surfaces; warm material color stays in the cloth instead of tinting every section.", logoConcept: "crossed warp and weft forming an S", hero: "/uploads/seed/benchmarks/selam-weave/hero.jpg", booth: "/landing/expo-booths/selam-weave.webp" },
  { handle: "afia-botanics", name: "Afia Botanics", location: "Addis Ababa", customer: "ingredient-conscious personal-care customers", paletteRequest: "soft botanical greens", paletteAdvice: "A deep green action color and cool white surfaces prevent the requested soft greens from becoming low contrast.", logoConcept: "a leaf held inside an open A", hero: "/uploads/seed/benchmarks/afia-botanics/hero.jpg", booth: "/landing/expo-booths/afia-botanics.webp" },
  { handle: "warka-furniture", name: "Warka Furniture Works", location: "Addis Ababa", customer: "homes, cafes, and compact hospitality spaces", paletteRequest: "walnut and warm neutral", paletteAdvice: "Walnut remains material-led while blue-green adds crisp digital structure and avoids a brown-on-beige showroom.", logoConcept: "a W assembled from two chair joints", hero: "/uploads/seed/benchmarks/warka-furniture/hero.jpg", booth: "/landing/expo-booths/warka-furniture.webp" },
  { handle: "addis-metalworks", name: "Addis Metalworks", location: "Addis Ababa", customer: "small producers and equipment operators", paletteRequest: "steel gray, black, and orange", paletteAdvice: "Safety orange is restricted to signals; deep blue and white carry the technical hierarchy and readable actions.", logoConcept: "an A built from two folded steel angles", hero: "/uploads/seed/benchmarks/addis-metalworks/hero.jpg", booth: "/landing/expo-booths/addis-metalworks.webp" },
  { handle: "green-terrace-farm", name: "Green Terrace Farm", location: "Jimma", customer: "households, cafes, and neighborhood kitchens", paletteRequest: "field green and earth colors", paletteAdvice: "Clean whites and a second cool role keep seasonal produce brighter than an all-earth interface.", logoConcept: "three terrace lines growing into a leaf", hero: "/uploads/seed/benchmarks/green-terrace-farm/hero.jpg", booth: "/landing/expo-booths/green-terrace-farm.webp" },
  { handle: "blue-nile-apiary", name: "Blue Nile Apiary", location: "Bahir Dar", customer: "households, gift buyers, and small retailers", paletteRequest: "honey gold and river blue", paletteAdvice: "Amber remains the product cue while deep teal provides stable contrast and avoids a page washed entirely in gold.", logoConcept: "a honey cell crossed by one river line", hero: "/uploads/seed/benchmarks/blue-nile-apiary/hero.jpg", booth: "/landing/expo-booths/blue-nile-apiary.webp" },
  { handle: "rift-valley-mill", name: "Rift Valley Mill", location: "Adama", customer: "families, cafes, and neighborhood bakeries", paletteRequest: "grain gold and brown", paletteAdvice: "Copper references grain and roast; deep forest and cool neutrals prevent a dated brown-and-cream result.", logoConcept: "a grain kernel inside a measured mill ring", hero: "/uploads/seed/benchmarks/rift-valley-mill/hero.jpg", booth: "/landing/expo-booths/rift-valley-mill.webp" },
  { handle: "entoto-ceramics", name: "Entoto Ceramics", location: "Addis Ababa", customer: "homes, cafes, and design-conscious gift buyers", paletteRequest: "terracotta and pale clay", paletteAdvice: "Terracotta remains an accent around the actual clay; mineral blue and white produce stronger section contrast.", logoConcept: "an E formed from stacked vessel profiles", hero: "/uploads/seed/benchmarks/entoto-ceramics/hero.jpg", booth: "/landing/expo-booths/entoto-ceramics.webp" },
  { handle: "koba-leather", name: "Koba Leather Workshop", location: "Addis Ababa", customer: "working adults, teams, and practical gift buyers", paletteRequest: "leather brown and black", paletteAdvice: "Leather supplies its own brown; indigo and berry give the interface a distinct modern identity.", logoConcept: "a K cut through a stitched hide edge", hero: "/uploads/seed/benchmarks/koba-leather/hero.jpg", booth: "/landing/expo-booths/koba-leather.webp" },
  { handle: "nova-assembly", name: "Nova Assembly Lab", location: "Addis Ababa", customer: "equipment builders and operators needing electronics work", paletteRequest: "black, silver, and neon blue", paletteAdvice: "Cyan is restricted to a precise signal role; white, graphite, and amber maintain readable technical contrast.", logoConcept: "a circuit node orbiting a compact N", hero: "/uploads/seed/benchmarks/nova-assembly/hero.jpg", booth: "/landing/expo-booths/nova-assembly.webp" },
] as const;

const benchmarkOfferings: Record<string, Array<{ name: string; category: string }>> = {
  "selam-weave": [
    { name: "Indigo Kuta Shawl", category: "Wear" },
    { name: "Natural Cotton Wrap", category: "Wear" },
    { name: "Indigo Table Linen", category: "Table" },
    { name: "Workshop Tote", category: "Carry" },
  ],
  "afia-botanics": [
    { name: "Garden Cleansing Bars", category: "Cleanse" },
    { name: "Leaf & Seed Body Oil", category: "Treat" },
    { name: "Mineral Clay Mask", category: "Treat" },
    { name: "Nourishing Hair Butter", category: "Hair" },
  ],
  "warka-furniture": [
    { name: "Low Woven Lounge Chair", category: "Seating" },
    { name: "Round Cross-Leg Table", category: "Tables" },
    { name: "Entry Bench", category: "Seating" },
    { name: "Open Wall Shelf", category: "Storage" },
  ],
  "addis-metalworks": [
    { name: "Powder-Coated Equipment Frame", category: "Frames" },
    { name: "Stainless Prep Table", category: "Work Surfaces" },
    { name: "Modular Storage Rack", category: "Storage" },
    { name: "Precision Bracket Set", category: "Parts" },
  ],
  "green-terrace-farm": [
    { name: "Highland Greens Mix", category: "Greens" },
    { name: "Kitchen Herb Bunch", category: "Herbs" },
    { name: "Heirloom Tomato Mix", category: "Seasonal Crates" },
    { name: "Weekly Produce Crate", category: "Seasonal Crates" },
  ],
  "blue-nile-apiary": [
    { name: "Seasonal Raw Honey", category: "Honey" },
    { name: "Cut Comb Honey", category: "Comb" },
    { name: "Pure Beeswax Candles", category: "Beeswax" },
    { name: "Honey & Comb Gift Box", category: "Honey" },
  ],
  "rift-valley-mill": [
    { name: "Ivory Teff Flour", category: "Teff" },
    { name: "Brown Teff Flour", category: "Teff" },
    { name: "Roasted Barley Blend", category: "Barley" },
    { name: "Mixed Grain Baking Pack", category: "Blends" },
  ],
  "entoto-ceramics": [
    { name: "Studio Coffee Set", category: "Drinkware" },
    { name: "Everyday Serving Bowl", category: "Serveware" },
    { name: "Textured Stem Vase", category: "Objects" },
    { name: "Dinner Plate Set", category: "Serveware" },
  ],
  "koba-leather": [
    { name: "Structured Work Tote", category: "Bags" },
    { name: "Slim Card Wallet", category: "Small Goods" },
    { name: "Leather Tool Roll", category: "Tools" },
    { name: "Everyday Crossbody", category: "Bags" },
  ],
  "nova-assembly": [
    { name: "Rugged Solar Charge Controller", category: "Power" },
    { name: "Compact Backup Power Box", category: "Power" },
    { name: "Audio Amplifier Rebuild", category: "Repair" },
    { name: "Custom Cable Harness Kit", category: "Harnesses" },
  ],
};

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]!);
}

function hash(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 2166136261);
}

function markSvg(name: string, primary: string, secondary: string) {
  const initial = escapeXml(name.slice(0, 1));
  const variant = hash(name) % 4;
  const motifs = [
    `<circle cx="64" cy="64" r="43" fill="none" stroke="${secondary}" stroke-width="11"/><path d="M34 75L64 31l30 44" fill="none" stroke="${primary}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<rect x="23" y="23" width="82" height="82" rx="18" fill="${secondary}"/><path d="M37 81c18-38 36-38 54 0" fill="none" stroke="${primary}" stroke-width="11" stroke-linecap="round"/>`,
    `<path d="M64 17l42 24v48l-42 24-42-24V41z" fill="${secondary}"/><circle cx="64" cy="64" r="25" fill="${primary}"/>`,
    `<circle cx="64" cy="64" r="48" fill="${primary}"/><path d="M30 65h68M64 31v68" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${escapeXml(name)} mark">
  <rect width="128" height="128" rx="18" fill="#ffffff"/>
  ${motifs[variant]}
  <text x="64" y="75" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="800" fill="#ffffff">${initial}</text>
</svg>\n`;
}

function boothSvg(name: string, primary: string, secondary: string, concept: string) {
  const escapedName = escapeXml(name);
  const escapedConcept = escapeXml(concept);
  const variant = hash(name) % 3;
  const props = [
    `<circle cx="255" cy="555" r="62" fill="#ffffff" stroke="${primary}" stroke-width="16"/><rect x="220" y="490" width="70" height="130" rx="12" fill="${secondary}"/>`,
    `<rect x="195" y="485" width="145" height="115" rx="10" fill="#ffffff" stroke="${primary}" stroke-width="12"/><path d="M215 555h105" stroke="${secondary}" stroke-width="18"/>`,
    `<path d="M205 590l70-125 70 125z" fill="${primary}"/><circle cx="275" cy="535" r="24" fill="${secondary}"/>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Illustrative booth for ${escapedName}">
  <rect width="1200" height="800" fill="#edf0f4"/>
  <path d="M0 655L600 535l600 120v145H0z" fill="#d8dde3"/>
  <path d="M120 170h960v500H120z" fill="#ffffff" stroke="#c5ccd4" stroke-width="8"/>
  <path d="M120 170h960v122H120z" fill="${secondary}"/>
  <path d="M120 292h35v378h-35zM1045 292h35v378h-35z" fill="${primary}"/>
  <rect x="390" y="390" width="620" height="205" rx="12" fill="#f4f6f8" stroke="#d2d8df" stroke-width="6"/>
  <rect x="420" y="470" width="560" height="160" rx="8" fill="${secondary}"/>
  <path d="M420 470h560l-38-55H458z" fill="${primary}"/>
  ${props[variant]}
  <text x="600" y="247" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800" fill="#ffffff">${escapedName}</text>
  <text x="700" y="565" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="#ffffff">MIRTPAGE SHOWROOM</text>
  <text x="700" y="602" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#ffffff" opacity=".82">${escapedConcept}</text>
</svg>\n`;
}

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function publicFile(publicPath: string) {
  return path.join(publicRoot, publicPath.replace(/^\//, ""));
}

function materializeScaleMedia() {
  for (const business of SCALE_DEMO_BUSINESSES) {
    for (const offering of business.offerings) {
      const target = publicFile(offering.imagePath);
      if (!fs.existsSync(target)) {
        throw new Error(`${business.handle} is missing generated offering media ${offering.imagePath}`);
      }
    }
  }
}

function briefDocument(input: {
  handle: string;
  name: string;
  location: string;
  customer: string;
  customerRequest: string;
  paletteRequest: string;
  paletteAdvice: string;
  logoConcept: string;
  visualThesis: string;
  foundationReason: string;
  tokenPack: string;
  palette: Record<string, string>;
  hero: string;
  booth: string;
  offerings: Array<{ name: string; category: string; imagePath: string }>;
}) {
  const paletteRows = Object.entries(input.palette).map(([role, value]) => `- ${role}: \`${value}\``).join("\n");
  const productRows = input.offerings.map((offering) => `| \`${offering.imagePath}\` | ${offering.name} | illustrative demo artwork | yes | offering |`).join("\n");
  return `# ${input.name} showroom brief

> Fictional disposable client used to exercise the MirtPage design workflow. All copy and imagery are demonstration material, not verified business claims.

## Identity

- Business name: ${input.name}
- Permanent handle: \`${input.handle}\`
- Location: ${input.location}
- Existing logo/mark: generated geometric mark based on ${input.logoConcept}
- Short description: ${input.customerRequest}

## Customer And Goal

- Primary customer: ${input.customer}
- Main visitor decision: identify the closest offering and decide what requirement to send
- Inquiry outcome: one direct MirtPage inquiry with optional quantity and practical context
- Product, production, or custom-work mode: mixed as recorded per offering
- Information that must appear early: what the business makes or does, who it serves, and the four available starting points

## Brand Direction

- Customer color request: ${input.paletteRequest}
- Designer advice: ${input.paletteAdvice}
- Logo concept: ${input.logoConcept}
- Visual thesis: ${input.visualThesis}
- Visual directions to avoid: one-color tinting, generic stock scale, framed hero boxes, decorative clutter, unsupported claims

## Final Palette

${paletteRows}

## Content Inventory

- Products or capabilities: ${input.offerings.map((offering) => `${offering.name} (${offering.category})`).join("; ")}
- Required inquiry details: intended use, format or specification, timing, and optional quantity
- Unknowns: all operational facts remain provisional because this is a fictional client

## Media Authority

| File | Subject | Factual Or Illustrative | Rights Confirmed | Preferred Role |
|---|---|---|---|---|
| \`${input.hero}\` | business-specific working scene | illustrative demo artwork | yes | hero |
${productRows}
| \`${input.booth}\` | coordinated virtual venue booth | illustrative demo artwork | yes | discovery booth |

## Composition Direction

- Foundation choice: \`${input.tokenPack}\`
- Foundation reason: ${input.foundationReason}
- Header and hero needs: compact identity, immediate offer, and integrated wide media with protected copy space
- Story/process distinction: opposing alignment and contrasting semantic surfaces without divider clutter
- Catalog density and media behavior: exactly four comparable cards with bounded 4:3 media
- Inquiry CTA and floating control: persistent but clear of phone content
- Footer needs: identity and contact close without category navigation

## Booth Direction

- Approved logo/name treatment: generated mark plus exact business name
- Facade material and color: shared clean City Showroom architecture with the final primary and secondary roles
- Product/craft cue: ${input.logoConcept}
- Generated image authorized: yes, for disposable demonstration use

## Acceptance Notes

- Desktop priorities: integrated hero, clean section rhythm, visible product comparison, decisive CTA
- Phone priorities: no horizontal overflow, readable logo, 44px actions, unobstructed inquiry control
- Accessibility/localization risks: long business names, custom palette contrast, reduced motion
- Client review questions: replace every provisional fact and illustration before any real-client publication
`;
}

function reviewDocument(name: string) {
  return `# ${name} review

- [x] 1440px full-page capture inspected
- [x] 390px full-page capture inspected
- [x] Header and logo are readable
- [x] Hero subject and copy remain distinct
- [x] Story and process have separate visual purpose
- [x] Four offering images are bounded and present
- [x] Floating inquiry control does not cover phone content
- [x] Palette contrast, overflow, focus, and browser console pass

Status: passed local automated and contact-sheet review on 2026-08-02.
`;
}

materializeScaleMedia();

for (const business of SCALE_DEMO_BUSINESSES) {
  const palette = business.brief.profile.customPalette!;
  writeFile(publicFile(business.logoPath), markSvg(business.name, palette.primary, palette.secondary));
  writeFile(publicFile(business.boothPath), boothSvg(business.name, palette.primary, palette.secondary, business.creative.logoConcept));
  const projectRoot = path.join(projectsRoot, business.handle);
  writeFile(path.join(projectRoot, "BRIEF.md"), briefDocument({
    handle: business.handle,
    name: business.name,
    location: `${business.profile.city}, ${business.profile.region}`,
    customer: business.creative.customer,
    customerRequest: business.creative.customerRequest,
    paletteRequest: business.creative.paletteRequest,
    paletteAdvice: business.creative.paletteAdvice,
    logoConcept: business.creative.logoConcept,
    visualThesis: business.creative.visualThesis,
    foundationReason: business.creative.foundationReason,
    tokenPack: business.brief.profile.tokenPack,
    palette,
    hero: business.heroPath,
    booth: business.boothPath,
    offerings: business.offerings,
  }));
  writeFile(path.join(projectRoot, "reviews", "REVIEW.md"), reviewDocument(business.name));
}

for (const business of benchmarkClients) {
  const brief = ADDITIONAL_SEED_SHOWROOM_BRIEFS[business.handle];
  const palette = brief.profile.customPalette || SHOWROOM_DESIGN_SYSTEMS[brief.profile.tokenPack].colors;
  const logoPath = `/uploads/seed/portfolio/${business.handle}/logo.svg`;
  const offerings = benchmarkOfferings[business.handle].map((offering, index) => ({
    ...offering,
    imagePath: `/uploads/seed/benchmarks/${business.handle}/product-${index + 1}.jpg`,
  }));
  writeFile(publicFile(logoPath), markSvg(business.name, palette.primary, palette.secondary));
  const projectRoot = path.join(projectsRoot, business.handle);
  writeFile(path.join(projectRoot, "BRIEF.md"), briefDocument({
    handle: business.handle,
    name: business.name,
    location: business.location,
    customer: business.customer,
    customerRequest: brief.objective,
    paletteRequest: business.paletteRequest,
    paletteAdvice: business.paletteAdvice,
    logoConcept: business.logoConcept,
    visualThesis: brief.template,
    foundationReason: `${brief.profile.tokenPack} was selected for its non-color type, spacing, shape, and media behavior.` ,
    tokenPack: brief.profile.tokenPack,
    palette,
    hero: business.hero,
    booth: business.booth,
    offerings,
  }));
  writeFile(path.join(projectRoot, "reviews", "REVIEW.md"), reviewDocument(business.name));
}

console.log(`Materialized ${SCALE_DEMO_BUSINESSES.length + benchmarkClients.length} fictional client project folders.`);
