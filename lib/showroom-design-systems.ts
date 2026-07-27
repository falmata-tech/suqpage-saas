import type { ShowroomArchetype } from "./showroom-guidance";

export type ShowroomVisualTone =
  | "editorial"
  | "organic"
  | "precise"
  | "technical"
  | "playful"
  | "quiet";

export type HeroMediaIntegration =
  | "split_bleed"
  | "soft_inset"
  | "editorial_overlap"
  | "product_stage"
  | "hidden";

export type ShowroomDesignSystem = {
  id: string;
  label: string;
  description: string;
  colors: {
    canvas: string;
    surface: string;
    text: string;
    textMuted: string;
    primary: string;
    primarySoft: string;
    secondary: string;
    secondarySoft: string;
    onSecondary: string;
    border: string;
  };
  typography: {
    displayStack: string;
    bodyStack: string;
    displayRole: "editorial_serif" | "humanist_sans" | "technical_sans";
    scale: "compact" | "standard" | "expressive";
  };
  shape: {
    radius: number;
    treatment: "square" | "subtle";
  };
  spacing: {
    base: 4;
    scale: readonly number[];
    sectionMobile: number;
    sectionDesktop: number;
  };
  layout: {
    containerMax: 1200;
    density: "compact" | "comfortable" | "spacious";
    sectionRhythm: "quiet_alternation" | "editorial_contrast" | "technical_bands";
  };
  media: {
    heroAspect: "16:10";
    productAspect: "4:3";
    fit: "cover";
    maxHeroHeight: 620;
    maxProductColumns: 3;
    preferredHeroIntegration: Exclude<HeroMediaIntegration, "hidden">;
    allowedHeroIntegrations: readonly HeroMediaIntegration[];
  };
  guidance: {
    archetypes: ShowroomArchetype[];
    tones: ShowroomVisualTone[];
  };
};

const bodyStack = "Arial, Helvetica, sans-serif";
const serifStack = "Georgia, 'Times New Roman', serif";
const spacingScale = [4, 8, 12, 16, 24, 32, 48, 64, 80] as const;

function designSystem(
  input: Omit<
    ShowroomDesignSystem,
    "spacing" | "media"
  > & {
    spacing?: Partial<ShowroomDesignSystem["spacing"]>;
    media?: Partial<ShowroomDesignSystem["media"]>;
  },
): ShowroomDesignSystem {
  const preferredHeroIntegration =
    input.media?.preferredHeroIntegration ||
    (input.layout.sectionRhythm === "technical_bands"
      ? "split_bleed"
      : input.layout.sectionRhythm === "editorial_contrast"
        ? "editorial_overlap"
        : "soft_inset");
  return {
    ...input,
    spacing: {
      base: 4,
      scale: spacingScale,
      sectionMobile: 48,
      sectionDesktop: 80,
      ...input.spacing,
    },
    media: {
      heroAspect: "16:10",
      productAspect: "4:3",
      fit: "cover",
      maxHeroHeight: 620,
      maxProductColumns: 3,
      preferredHeroIntegration,
      allowedHeroIntegrations: [
        "split_bleed",
        "soft_inset",
        "editorial_overlap",
        "product_stage",
        "hidden",
      ],
      ...input.media,
    },
  };
}

const systems = [
  designSystem({
    id: "linen-luxury", label: "Linen luxury",
    description: "Warm neutral canvas, walnut primary, and cool eucalyptus secondary for restrained premium goods.",
    colors: { canvas: "#f6f0e6", surface: "#fffaf2", text: "#29231d", textMuted: "#74685c", primary: "#8b5e3c", primarySoft: "#ead8c4", secondary: "#315c57", secondarySoft: "#dce9e5", onSecondary: "#ffffff", border: "#d8c8b7" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["artisan", "furniture", "textile_atelier"], tones: ["editorial", "quiet"] },
  }),
  designSystem({
    id: "harvest-earth", label: "Harvest earth",
    description: "Grain neutral, field green primary, and clay secondary for farms and natural producers.",
    colors: { canvas: "#f2efe2", surface: "#fbf9ef", text: "#263526", textMuted: "#66705d", primary: "#53723f", primarySoft: "#dbe5c9", secondary: "#8a4d32", secondarySoft: "#ecd7c8", onSecondary: "#ffffff", border: "#cdd5bf" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "quiet_alternation" },
    guidance: { archetypes: ["farm", "food_producer"], tones: ["organic", "quiet"] },
  }),
  designSystem({
    id: "honey-amber", label: "Honey amber",
    description: "Soft parchment, amber primary, and deep teal secondary for ingredient-led producers.",
    colors: { canvas: "#fff7dc", surface: "#fffdf4", text: "#3a2912", textMuted: "#735f40", primary: "#a95f00", primarySoft: "#f4d58a", secondary: "#245b57", secondarySoft: "#d9ebe6", onSecondary: "#ffffff", border: "#dfc477" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["food_producer", "farm"], tones: ["organic", "editorial"] },
  }),
  designSystem({
    id: "coffee-roast", label: "Coffee roast",
    description: "Roasted neutral canvas, copper primary, and sage secondary for dark hospitality and craft stories.",
    colors: { canvas: "#211a17", surface: "#30251f", text: "#f8eee2", textMuted: "#c7b3a2", primary: "#d18d52", primarySoft: "#5a3c2c", secondary: "#7fa69a", secondarySoft: "#26433d", onSecondary: "#171c1a", border: "#58483e" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["food_producer", "artisan"], tones: ["editorial", "organic"] },
  }),
  designSystem({
    id: "artisan-clay", label: "Artisan clay",
    description: "Clay-neutral canvas, terracotta primary, and mineral blue secondary for handmade goods.",
    colors: { canvas: "#f4e7df", surface: "#fff8f2", text: "#3a2825", textMuted: "#765e58", primary: "#a9553f", primarySoft: "#eac1b3", secondary: "#315b62", secondarySoft: "#d8e5e5", onSecondary: "#ffffff", border: "#d9b8ae" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "quiet_alternation" },
    guidance: { archetypes: ["artisan", "food_producer"], tones: ["organic", "editorial"] },
  }),
  designSystem({
    id: "forest-botanical", label: "Forest botanical",
    description: "Deep forest surfaces, leaf primary, and ochre secondary for botanical and wellness ranges.",
    colors: { canvas: "#12251f", surface: "#1b332b", text: "#eff8ef", textMuted: "#adc4b7", primary: "#8ccf85", primarySoft: "#315a45", secondary: "#d7a64a", secondarySoft: "#4a4024", onSecondary: "#1b251f", border: "#426456" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["natural_beauty", "farm"], tones: ["organic", "quiet"] },
  }),
  designSystem({
    id: "furniture-walnut", label: "Furniture walnut",
    description: "Warm architectural neutral, walnut primary, and blue-green secondary for interiors.",
    colors: { canvas: "#eee8df", surface: "#faf7f2", text: "#292622", textMuted: "#706960", primary: "#704b34", primarySoft: "#d8c6b5", secondary: "#355b63", secondarySoft: "#dce7e8", onSecondary: "#ffffff", border: "#cfc5b9" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["furniture", "artisan"], tones: ["editorial", "quiet"] },
  }),
  designSystem({
    id: "industrial-steel", label: "Industrial steel",
    description: "Steel neutral, safety-orange primary, and technical blue secondary for fabrication and RFQ.",
    colors: { canvas: "#e9edf0", surface: "#f9fafb", text: "#182127", textMuted: "#59666e", primary: "#c94f29", primarySoft: "#f0c5b6", secondary: "#2f6073", secondarySoft: "#d7e5ea", onSecondary: "#ffffff", border: "#bfc8ce" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "technical_sans", scale: "compact" },
    shape: { radius: 2, treatment: "square" },
    layout: { containerMax: 1200, density: "compact", sectionRhythm: "technical_bands" },
    guidance: { archetypes: ["manufacturer", "service_product_hybrid"], tones: ["technical", "precise"] },
  }),
  designSystem({
    id: "maker-indigo", label: "Maker indigo",
    description: "Cool studio neutral, indigo primary, and muted berry secondary for practical makers.",
    colors: { canvas: "#edf0f8", surface: "#fdfdff", text: "#19203c", textMuted: "#626b8a", primary: "#4056b8", primarySoft: "#ccd4fa", secondary: "#8d455b", secondarySoft: "#efd8df", onSecondary: "#ffffff", border: "#c5cbe0" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "humanist_sans", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "quiet_alternation" },
    guidance: { archetypes: ["artisan", "service_product_hybrid"], tones: ["precise", "quiet"] },
  }),
  designSystem({
    id: "ocean-trade", label: "Ocean trade",
    description: "Cool trade neutral, ocean primary, and brick secondary for suppliers and distributors.",
    colors: { canvas: "#e9f3f4", surface: "#fbffff", text: "#12323b", textMuted: "#54727a", primary: "#087a8b", primarySoft: "#bce4e7", secondary: "#a9472f", secondarySoft: "#f1d9d1", onSecondary: "#ffffff", border: "#b7d1d4" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "humanist_sans", scale: "compact" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "compact", sectionRhythm: "technical_bands" },
    guidance: { archetypes: ["manufacturer", "service_product_hybrid"], tones: ["precise", "technical"] },
  }),
  designSystem({
    id: "beauty-editorial", label: "Beauty editorial",
    description: "Blush neutral, berry primary, and evergreen secondary for editorial beauty ranges.",
    colors: { canvas: "#fff1f6", surface: "#fffafd", text: "#361e2b", textMuted: "#7f6071", primary: "#b9346d", primarySoft: "#f2c6da", secondary: "#38645a", secondarySoft: "#dceae5", onSecondary: "#ffffff", border: "#e5c3d3" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["natural_beauty"], tones: ["editorial", "playful"] },
  }),
  designSystem({
    id: "technology-mono", label: "Technology mono",
    description: "Neutral technical canvas, signal-blue primary, and red secondary for compact technology catalogs.",
    colors: { canvas: "#f2f3f5", surface: "#ffffff", text: "#101114", textMuted: "#666970", primary: "#1517c2", primarySoft: "#d8d9ff", secondary: "#b8402f", secondarySoft: "#f3d8d2", onSecondary: "#ffffff", border: "#d3d5db" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "technical_sans", scale: "compact" },
    shape: { radius: 6, treatment: "subtle" },
    layout: { containerMax: 1200, density: "compact", sectionRhythm: "technical_bands" },
    guidance: { archetypes: ["manufacturer", "service_product_hybrid"], tones: ["technical", "precise"] },
  }),
  designSystem({
    id: "vibrant-market", label: "Vibrant market",
    description: "Warm market canvas, coral primary, and teal secondary for lively small catalogs.",
    colors: { canvas: "#fff5d8", surface: "#ffffff", text: "#17223a", textMuted: "#68728a", primary: "#d94328", primarySoft: "#ffd2a6", secondary: "#087a8b", secondarySoft: "#d3ecef", onSecondary: "#ffffff", border: "#e2cfaa" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "humanist_sans", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["artisan", "natural_beauty"], tones: ["playful", "organic"] },
  }),
  designSystem({
    id: "silk-atelier", label: "Silk atelier",
    description: "Soft textile neutral, magenta primary, and deep green secondary for atelier stories.",
    colors: { canvas: "#f2ece8", surface: "#fffaf7", text: "#271b25", textMuted: "#786873", primary: "#96265e", primarySoft: "#e9bfd3", secondary: "#375f59", secondarySoft: "#d9e8e4", onSecondary: "#ffffff", border: "#d7c3cd" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 6, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["textile_atelier", "artisan"], tones: ["editorial", "playful"] },
  }),
  designSystem({
    id: "cosmetic-laboratory", label: "Cosmetic laboratory",
    description: "Clean laboratory neutral, rose primary, and botanical secondary for natural beauty.",
    colors: { canvas: "#f5f7f3", surface: "#ffffff", text: "#17211d", textMuted: "#69766f", primary: "#cf4569", primarySoft: "#f4d4df", secondary: "#416e63", secondarySoft: "#dceae5", onSecondary: "#ffffff", border: "#d7dfda" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "humanist_sans", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "quiet_alternation" },
    guidance: { archetypes: ["natural_beauty"], tones: ["quiet", "organic"] },
  }),
  designSystem({
    id: "chrome-future", label: "Chrome future",
    description: "Graphite surfaces, electric-cyan primary, and amber secondary for engineered products.",
    colors: { canvas: "#0d0f14", surface: "#171a21", text: "#f3f7ff", textMuted: "#a4adbd", primary: "#76f0ff", primarySoft: "#193c47", secondary: "#ffb454", secondarySoft: "#4b3521", onSecondary: "#101114", border: "#343a46" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "technical_sans", scale: "expressive" },
    shape: { radius: 4, treatment: "square" },
    layout: { containerMax: 1200, density: "compact", sectionRhythm: "technical_bands" },
    guidance: { archetypes: ["manufacturer", "service_product_hybrid"], tones: ["technical", "precise"] },
  }),
  designSystem({
    id: "paper-gallery", label: "Paper gallery",
    description: "Paper neutral, vermilion primary, and blue-green secondary for design-led products.",
    colors: { canvas: "#e9e2d5", surface: "#faf6ee", text: "#23201c", textMuted: "#70695f", primary: "#a83b28", primarySoft: "#e8c4b5", secondary: "#315b63", secondarySoft: "#d9e6e7", onSecondary: "#ffffff", border: "#c9c0b2" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 0, treatment: "square" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { archetypes: ["furniture", "artisan", "food_producer"], tones: ["editorial", "quiet"] },
  }),
  designSystem({
    id: "mineral-spa", label: "Mineral spa",
    description: "Mineral neutral, muted-teal primary, and clay secondary for calm wellness brands.",
    colors: { canvas: "#e8efec", surface: "#f8fbfa", text: "#1f302e", textMuted: "#687b78", primary: "#4d746f", primarySoft: "#c8ddda", secondary: "#8d4f3c", secondarySoft: "#ead9d3", onSecondary: "#ffffff", border: "#c1d0cd" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "quiet_alternation" },
    guidance: { archetypes: ["natural_beauty", "artisan"], tones: ["quiet", "organic"] },
  }),
] as const;

export const SHOWROOM_DESIGN_SYSTEMS = Object.freeze(
  Object.fromEntries(systems.map((system) => [system.id, Object.freeze(system)])),
) as Readonly<Record<string, ShowroomDesignSystem>>;
