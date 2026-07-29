export type ShowroomVisualTone =
  | "editorial"
  | "organic"
  | "precise"
  | "technical"
  | "playful"
  | "quiet";

export type SectionMediaIntegration =
  | "natural"
  | "surface_blend"
  | "ambient_overlay"
  | "edge_fade"
  | "split_bleed"
  | "editorial_overlap"
  | "product_stage"
  | "hidden";

export type HeroMediaIntegration = SectionMediaIntegration;

export type ShowroomColorPalette = {
  canvas: string;
  surface: string;
  layer: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  secondary: string;
  secondarySoft: string;
  onSecondary: string;
  strong: string;
  onStrong: string;
  inverse: string;
  onInverse: string;
  border: string;
};

export type ShowroomDesignSystem = {
  id: string;
  label: string;
  description: string;
  colors: ShowroomColorPalette;
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
    containerMax: number;
    density: "compact" | "comfortable" | "spacious";
    sectionRhythm: "quiet_alternation" | "editorial_contrast" | "technical_bands";
  };
  media: {
    heroAspect: "16:10";
    productAspect: "4:3";
    fit: "cover";
    maxHeroHeight: number;
    maxProductColumns: 1 | 2 | 3 | 4;
    preferredHeroIntegration: Exclude<SectionMediaIntegration, "hidden">;
    allowedHeroIntegrations: readonly SectionMediaIntegration[];
  };
  guidance: {
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
    input.media?.preferredHeroIntegration || "natural";
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
        "natural",
        "surface_blend",
        "ambient_overlay",
        "edge_fade",
        "split_bleed",
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
    id: "linen-luxury", label: "Warm eucalyptus",
    description: "White and cool-neutral layers, walnut accent, deep eucalyptus emphasis, expressive serif type, and spacious editorial contrast.",
    colors: { canvas: "#ffffff", surface: "#f4f5f6", layer: "#e7eceb", text: "#1c2222", textMuted: "#5e6867", primary: "#8b5e3c", primarySoft: "#e9ddd2", secondary: "#1f5a55", secondarySoft: "#d5e6e3", onSecondary: "#ffffff", strong: "#1f5a55", onStrong: "#ffffff", inverse: "#151a1a", onInverse: "#f7f9f8", border: "#cbd2d0" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["editorial", "quiet"] },
  }),
  designSystem({
    id: "harvest-earth", label: "Field and clay",
    description: "White and pale-gray-green layers, field-green emphasis, clay accent, standard serif type, and clear neutral alternation.",
    colors: { canvas: "#ffffff", surface: "#f3f5f1", layer: "#e3e9df", text: "#1c2b20", textMuted: "#5d695f", primary: "#3f6b3f", primarySoft: "#dce8d8", secondary: "#b54a2f", secondarySoft: "#f2ddd7", onSecondary: "#ffffff", strong: "#244d32", onStrong: "#ffffff", inverse: "#162019", onInverse: "#ffffff", border: "#c9d2c7" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "quiet_alternation" },
    guidance: { tones: ["organic", "quiet"] },
  }),
  designSystem({
    id: "honey-amber", label: "Amber and teal",
    description: "White and neutral-gray layers, amber accent, deep teal emphasis, standard serif type, and decisive editorial contrast.",
    colors: { canvas: "#ffffff", surface: "#f5f5f2", layer: "#e9ece7", text: "#20231f", textMuted: "#656a61", primary: "#a95f00", primarySoft: "#f6e0b1", secondary: "#155e75", secondarySoft: "#d7eaf0", onSecondary: "#ffffff", strong: "#155e75", onStrong: "#ffffff", inverse: "#171a1c", onInverse: "#ffffff", border: "#d1d3cc" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["organic", "editorial"] },
  }),
  designSystem({
    id: "coffee-roast", label: "Copper and forest",
    description: "White and cool-neutral layers, copper accent, deep forest emphasis, standard serif type, and a dark grounded close.",
    colors: { canvas: "#ffffff", surface: "#f4f4f3", layer: "#e5e8e6", text: "#1d2220", textMuted: "#646c68", primary: "#a14f22", primarySoft: "#efd8cc", secondary: "#236255", secondarySoft: "#d7e8e3", onSecondary: "#ffffff", strong: "#173f36", onStrong: "#ffffff", inverse: "#171918", onInverse: "#ffffff", border: "#cbd0cd" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["editorial", "organic"] },
  }),
  designSystem({
    id: "artisan-clay", label: "Terracotta and mineral",
    description: "White and architectural-gray layers, terracotta accent, mineral-blue emphasis, standard serif type, and crisp section alternation.",
    colors: { canvas: "#ffffff", surface: "#f4f5f7", layer: "#e7ebef", text: "#20242a", textMuted: "#646b75", primary: "#b44d2f", primarySoft: "#f0d8cf", secondary: "#2056a8", secondarySoft: "#d9e5f7", onSecondary: "#ffffff", strong: "#204f91", onStrong: "#ffffff", inverse: "#151a20", onInverse: "#ffffff", border: "#cbd1d8" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "quiet_alternation" },
    guidance: { tones: ["organic", "editorial"] },
  }),
  designSystem({
    id: "forest-botanical", label: "Leaf and ochre",
    description: "White and restrained green-neutral layers, leaf accent, ochre detail, standard serif type, and deep-green emphasis.",
    colors: { canvas: "#ffffff", surface: "#f2f5f3", layer: "#dfe8e3", text: "#17251e", textMuted: "#5b6961", primary: "#26744d", primarySoft: "#d5eadf", secondary: "#d18a16", secondarySoft: "#f5e6c4", onSecondary: "#1a1a1a", strong: "#164f34", onStrong: "#ffffff", inverse: "#101914", onInverse: "#ffffff", border: "#c7d2cb" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["organic", "quiet"] },
  }),
  designSystem({
    id: "furniture-walnut", label: "Walnut and blue-green",
    description: "White and architectural-gray layers, walnut accent, blue-green emphasis, expressive serif type, and spacious editorial contrast.",
    colors: { canvas: "#ffffff", surface: "#f3f4f5", layer: "#e4e8ea", text: "#202427", textMuted: "#62686c", primary: "#795033", primarySoft: "#eadfd5", secondary: "#1e6375", secondarySoft: "#d8e9ed", onSecondary: "#ffffff", strong: "#1c5362", onStrong: "#ffffff", inverse: "#15191b", onInverse: "#ffffff", border: "#cbd0d3" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["editorial", "quiet"] },
  }),
  designSystem({
    id: "industrial-steel", label: "Steel signal",
    description: "White, steel-gray, and dark navy layers with safety-orange accent, compact sans type, and dense horizontal bands.",
    colors: { canvas: "#ffffff", surface: "#eef1f4", layer: "#dce3e8", text: "#15202a", textMuted: "#59636d", primary: "#c94f29", primarySoft: "#f0c5b6", secondary: "#15557a", secondarySoft: "#d7e5ea", onSecondary: "#ffffff", strong: "#123f5a", onStrong: "#ffffff", inverse: "#111820", onInverse: "#ffffff", border: "#bcc7cf" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "technical_sans", scale: "compact" },
    shape: { radius: 2, treatment: "square" },
    layout: { containerMax: 1200, density: "compact", sectionRhythm: "technical_bands" },
    media: { maxProductColumns: 4, maxHeroHeight: 600 },
    guidance: { tones: ["technical", "precise"] },
  }),
  designSystem({
    id: "maker-indigo", label: "Indigo and berry",
    description: "White and cool-gray layers, decisive indigo emphasis, restrained crimson accent, humanist sans type, and clear alternation.",
    colors: { canvas: "#ffffff", surface: "#f1f4f8", layer: "#e0e7f0", text: "#121c32", textMuted: "#5c667c", primary: "#3157c8", primarySoft: "#d8e2ff", secondary: "#c13f52", secondarySoft: "#f4d9de", onSecondary: "#ffffff", strong: "#193f9d", onStrong: "#ffffff", inverse: "#10182a", onInverse: "#ffffff", border: "#c6cedc" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "humanist_sans", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "quiet_alternation" },
    guidance: { tones: ["precise", "quiet"] },
  }),
  designSystem({
    id: "ocean-trade", label: "Ocean and brick",
    description: "White and cool-gray layers, ocean-blue emphasis, brick accent, compact humanist sans type, and dense horizontal bands.",
    colors: { canvas: "#ffffff", surface: "#eef4f5", layer: "#dce8ea", text: "#102a31", textMuted: "#536a70", primary: "#00798a", primarySoft: "#cce8eb", secondary: "#b5432c", secondarySoft: "#f1d9d1", onSecondary: "#ffffff", strong: "#07566a", onStrong: "#ffffff", inverse: "#101b20", onInverse: "#ffffff", border: "#bfd0d3" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "humanist_sans", scale: "compact" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "compact", sectionRhythm: "technical_bands" },
    media: { maxProductColumns: 4, maxHeroHeight: 580 },
    guidance: { tones: ["precise", "technical"] },
  }),
  designSystem({
    id: "beauty-editorial", label: "Evergreen and cobalt",
    description: "White and neutral-gray layers, evergreen emphasis, cobalt accent, expressive serif type, and spacious editorial contrast.",
    colors: { canvas: "#ffffff", surface: "#f3f5f4", layer: "#e4eae7", text: "#18251f", textMuted: "#5e6d65", primary: "#18734c", primarySoft: "#d5eadf", secondary: "#3159c7", secondarySoft: "#dce4fb", onSecondary: "#ffffff", strong: "#155d40", onStrong: "#ffffff", inverse: "#111a16", onInverse: "#ffffff", border: "#c8d2cd" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["editorial", "playful"] },
  }),
  designSystem({
    id: "technology-mono", label: "Signal monochrome",
    description: "White and neutral-gray layers, signal-blue emphasis, red accent, compact technical sans type, and dense horizontal bands.",
    colors: { canvas: "#ffffff", surface: "#f2f3f5", layer: "#e1e3e7", text: "#101114", textMuted: "#5f636b", primary: "#1517c2", primarySoft: "#d8d9ff", secondary: "#b8402f", secondarySoft: "#f3d8d2", onSecondary: "#ffffff", strong: "#1517a8", onStrong: "#ffffff", inverse: "#101114", onInverse: "#ffffff", border: "#ccd0d6" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "technical_sans", scale: "compact" },
    shape: { radius: 6, treatment: "subtle" },
    layout: { containerMax: 1200, density: "compact", sectionRhythm: "technical_bands" },
    media: { maxProductColumns: 4, maxHeroHeight: 580 },
    guidance: { tones: ["technical", "precise"] },
  }),
  designSystem({
    id: "vibrant-market", label: "Coral and teal",
    description: "White and cool-neutral layers, coral accent, teal emphasis, standard humanist sans type, and lively editorial contrast.",
    colors: { canvas: "#ffffff", surface: "#f4f5f7", layer: "#e5e8ed", text: "#17223a", textMuted: "#626d83", primary: "#d94328", primarySoft: "#f8d9d2", secondary: "#087a8b", secondarySoft: "#d3ecef", onSecondary: "#ffffff", strong: "#086474", onStrong: "#ffffff", inverse: "#111a2d", onInverse: "#ffffff", border: "#c9ced8" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "humanist_sans", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["playful", "organic"] },
  }),
  designSystem({
    id: "silk-atelier", label: "Ink blue and magenta",
    description: "White and cool-gray layers, magenta accent, ink-blue emphasis, expressive serif type, and spacious editorial contrast.",
    colors: { canvas: "#ffffff", surface: "#f3f4f6", layer: "#e1e5eb", text: "#171c27", textMuted: "#5f6674", primary: "#a32355", primarySoft: "#f0d7e1", secondary: "#164f8c", secondarySoft: "#d8e5f2", onSecondary: "#ffffff", strong: "#163f72", onStrong: "#ffffff", inverse: "#121722", onInverse: "#ffffff", border: "#c8ced8" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 6, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["editorial", "playful"] },
  }),
  designSystem({
    id: "cosmetic-laboratory", label: "Green and cobalt clean",
    description: "White and clinical neutral layers, green emphasis, cobalt accent, standard humanist sans type, and clean alternation.",
    colors: { canvas: "#ffffff", surface: "#f3f5f4", layer: "#e2e9e5", text: "#17211d", textMuted: "#5f6e66", primary: "#14704a", primarySoft: "#d5eadf", secondary: "#2b59c3", secondarySoft: "#dce4fa", onSecondary: "#ffffff", strong: "#115a3d", onStrong: "#ffffff", inverse: "#101a16", onInverse: "#ffffff", border: "#c7d2cc" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "humanist_sans", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "comfortable", sectionRhythm: "quiet_alternation" },
    guidance: { tones: ["quiet", "organic"] },
  }),
  designSystem({
    id: "chrome-future", label: "Graphite and electric cyan",
    description: "Clearly stepped graphite layers, electric-cyan emphasis, amber detail, a light inverse close, expressive technical sans type, and compact bands.",
    colors: { canvas: "#080a0d", surface: "#171c24", layer: "#303943", text: "#f3f7ff", textMuted: "#bfc7d3", primary: "#00d4f0", primarySoft: "#173945", secondary: "#ffb000", secondarySoft: "#3d321c", onSecondary: "#111111", strong: "#00cbe8", onStrong: "#071115", inverse: "#f4f6f8", onInverse: "#11151a", border: "#48515d" },
    typography: { displayStack: bodyStack, bodyStack, displayRole: "technical_sans", scale: "expressive" },
    shape: { radius: 4, treatment: "square" },
    layout: { containerMax: 1200, density: "compact", sectionRhythm: "technical_bands" },
    media: { maxProductColumns: 4, maxHeroHeight: 640 },
    guidance: { tones: ["technical", "precise"] },
  }),
  designSystem({
    id: "paper-gallery", label: "Paper and vermilion",
    description: "White and paper-gray layers, vermilion accent, deep-blue emphasis, expressive serif type, square geometry, and spacious contrast.",
    colors: { canvas: "#ffffff", surface: "#f3f4f6", layer: "#e3e7eb", text: "#1b2028", textMuted: "#616975", primary: "#b53f28", primarySoft: "#efd8d2", secondary: "#185b7a", secondarySoft: "#d7e7ed", onSecondary: "#ffffff", strong: "#174b6e", onStrong: "#ffffff", inverse: "#111820", onInverse: "#ffffff", border: "#c8ced5" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "expressive" },
    shape: { radius: 0, treatment: "square" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "editorial_contrast" },
    guidance: { tones: ["editorial", "quiet"] },
  }),
  designSystem({
    id: "mineral-spa", label: "Mineral teal",
    description: "White and mineral-gray layers, muted-teal emphasis, clay accent, standard serif type, and spacious neutral alternation.",
    colors: { canvas: "#ffffff", surface: "#f2f5f4", layer: "#e1e9e6", text: "#1b2927", textMuted: "#61716e", primary: "#34736d", primarySoft: "#d3e6e2", secondary: "#b34c2e", secondarySoft: "#f0d9d1", onSecondary: "#ffffff", strong: "#245a55", onStrong: "#ffffff", inverse: "#141b1a", onInverse: "#ffffff", border: "#c6d1ce" },
    typography: { displayStack: serifStack, bodyStack, displayRole: "editorial_serif", scale: "standard" },
    shape: { radius: 8, treatment: "subtle" },
    layout: { containerMax: 1200, density: "spacious", sectionRhythm: "quiet_alternation" },
    guidance: { tones: ["quiet", "organic"] },
  }),
] as const;

export const SHOWROOM_DESIGN_SYSTEMS = Object.freeze(
  Object.fromEntries(systems.map((system) => [system.id, Object.freeze(system)])),
) as Readonly<Record<string, ShowroomDesignSystem>>;
