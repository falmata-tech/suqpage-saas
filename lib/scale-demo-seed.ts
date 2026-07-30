import type { DenseDemoDesignVariant, DenseDemoOfferingKind } from "./dense-demo-seed";
import type { SeededExpoProfile } from "./expo-seed";

type ScaleTheme = {
  key: string;
  names: string[];
  categories: [string, string, string];
  offerings: [string, string, string];
  kinds: [DenseDemoOfferingKind, DenseDemoOfferingKind, DenseDemoOfferingKind];
  copy: {
    tagline: string;
    description: string;
    heroTitle: string;
    heroSubtitle: string;
  };
  designVariant: DenseDemoDesignVariant;
  heroPath: string;
  boothPath: string;
};

export type ScaleDemoBusiness = {
  handle: string;
  name: string;
  tagline: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  designVariant: DenseDemoDesignVariant;
  industryKey: string;
  heroPath: string;
  boothPath: string;
  profile: SeededExpoProfile;
  offerings: Array<{
    name: string;
    category: string;
    description: string;
    kind: DenseDemoOfferingKind;
  }>;
};

const locations: readonly SeededExpoProfile[] = [
  { industryKeys: [], city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.018, longitude: 38.748 },
  { industryKeys: [], city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 8.982, longitude: 38.781 },
  { industryKeys: [], city: "Adama", zone: "East Shewa", region: "Oromia", latitude: 8.545, longitude: 39.272 },
  { industryKeys: [], city: "Bishoftu", zone: "East Shewa", region: "Oromia", latitude: 8.748, longitude: 38.982 },
  { industryKeys: [], city: "Bahir Dar", zone: "Bahir Dar", region: "Amhara", latitude: 11.579, longitude: 37.367 },
  { industryKeys: [], city: "Hawassa", zone: "Sidama", region: "Sidama", latitude: 7.058, longitude: 38.477 },
  { industryKeys: [], city: "Dire Dawa", zone: "Dire Dawa urban", region: "Dire Dawa", latitude: 9.594, longitude: 41.856 },
  { industryKeys: [], city: "Jimma", zone: "Jimma", region: "Oromia", latitude: 7.681, longitude: 36.839 },
  { industryKeys: [], city: "Hosaena", zone: "Hadiya", region: "Central Ethiopia", latitude: 7.553, longitude: 37.854 },
  { industryKeys: [], city: "Robe", zone: "Bale", region: "Oromia", latitude: 7.118, longitude: 40.003 },
  { industryKeys: [], city: "Gondar", zone: "Central Gondar", region: "Amhara", latitude: 12.607, longitude: 37.463 },
  { industryKeys: [], city: "Arba Minch", zone: "Gamo", region: "South Ethiopia", latitude: 6.036, longitude: 37.55 },
];

const themes: readonly ScaleTheme[] = [
  {
    key: "electronics",
    names: ["Aster Device Assembly", "Lume Power Systems", "Tana Control Works", "Shewa Cable Lab", "Desta Appliance Parts", "Orbit Meter Works", "Kora Solar Controls", "Nile Sensor Assembly", "Fana Power Enclosures", "Meda Circuit Supply", "Horizon Device Repair", "Abay Electrical Inputs"],
    categories: ["Devices", "Assemblies", "Inputs"],
    offerings: ["Configured Control Unit", "Labeled Electrical Assembly", "Recurring Device Input Supply"],
    kinds: ["made_to_order", "manufacturing_capability", "production_supply"],
    copy: { tagline: "Practical electrical products and repeat assemblies.", description: "A fictional scale fixture representing electronics production, repair, and component supply.", heroTitle: "Specify the device, connections, and working environment.", heroSubtitle: "Review standard work or describe a repeat assembly and production requirement." },
    designVariant: "technical",
    heroPath: "/uploads/seed/benchmarks/nova-assembly/hero.jpg",
    boothPath: "/landing/expo-booths/nova-assembly.webp",
  },
  {
    key: "beauty-wellness",
    names: ["Aloe Field Care", "Muna Botanical Lab", "Liya Soap Studio", "Biftu Natural Oils", "Hana Herbal Works", "Sena Body Care", "Meriem Care Compounds", "Zema Plant Formulas", "Rohi Wellness Supply", "Nardos Clean Care", "Kiya Essential Blends", "Ayni Botanical Inputs"],
    categories: ["Care", "Formulation", "Supply"],
    offerings: ["Botanical Care Range", "Reviewed Small-Batch Formula", "Recurring Care Input Supply"],
    kinds: ["standard_product", "manufacturing_capability", "production_supply"],
    copy: { tagline: "Botanical care and controlled small-batch production.", description: "A fictional scale fixture representing natural care makers, formulators, and input suppliers.", heroTitle: "Understand the formula, format, and production batch.", heroSubtitle: "Compare current care products or discuss an approved repeat production brief." },
    designVariant: "producer",
    heroPath: "/uploads/seed/benchmarks/afia-botanics/hero.jpg",
    boothPath: "/landing/expo-booths/afia-botanics.webp",
  },
  {
    key: "food-farming",
    names: ["Bora Highland Produce", "Laga Grain Supply", "Mulu Farm Cooperative", "Kaffa Ingredient Works", "Sofi Orchard Supply", "Wabi Milling Inputs", "Rift Seed Producers", "Tena Food Processing", "Awash Grower Network", "Buno Harvest Supply", "Gibe Farm Outputs", "Dara Spice Producers"],
    categories: ["Harvest", "Processing", "Supply"],
    offerings: ["Seasonal Producer Output", "Configured Processing Run", "Recurring Ingredient Supply"],
    kinds: ["production_supply", "made_to_order", "production_supply"],
    copy: { tagline: "Farm outputs, food production, and repeat supply.", description: "A fictional scale fixture representing growers, processors, cooperatives, and agricultural suppliers.", heroTitle: "Plan the product around harvest, processing, and volume.", heroSubtitle: "Review current outputs or discuss a recurring production and supply requirement." },
    designVariant: "producer",
    heroPath: "/uploads/seed/benchmarks/green-terrace-farm/hero.jpg",
    boothPath: "/landing/expo-booths/green-terrace-farm.webp",
  },
  {
    key: "home-living",
    names: ["Meda Furniture Studio", "Tullu Timber Works", "Buna Interior Supply", "Kora Ceramic House", "Aster Lighting Works", "Wabi Joinery Lab", "Sena Home Textiles", "Dara Fixture Works", "Lume Panel Supply", "Nile Seating Studio", "Biftu Interior Parts", "Horizon Home Inputs"],
    categories: ["Furniture", "Interior Components", "Projects"],
    offerings: ["Repeat Furniture Range", "Custom Interior Component", "Made-to-Order Project Package"],
    kinds: ["standard_product", "manufacturing_capability", "made_to_order"],
    copy: { tagline: "Furniture, interior components, and useful home production.", description: "A fictional scale fixture representing furniture makers, interior producers, and material suppliers.", heroTitle: "Bring dimensions, materials, and repeat use together.", heroSubtitle: "Browse useful formats or describe the space and production requirement." },
    designVariant: "editorial",
    heroPath: "/uploads/seed/benchmarks/warka-furniture/hero.jpg",
    boothPath: "/landing/expo-booths/warka-furniture.webp",
  },
  {
    key: "fashion-textiles",
    names: ["Sora Workwear Studio", "Liya Textile Supply", "Biftu Leather Goods", "Meda Uniform Works", "Kora Woven Inputs", "Ayni Garment Assembly", "Tana Fabric House", "Zema Bag Production", "Hana Trim Supply", "Wabi Loom Studio", "Dara Protective Wear", "Mulu Soft Goods"],
    categories: ["Textiles", "Garments", "Production Supply"],
    offerings: ["Repeat Textile Product", "Configured Garment Run", "Recurring Material Supply"],
    kinds: ["standard_product", "manufacturing_capability", "production_supply"],
    copy: { tagline: "Textile products, garment runs, and production inputs.", description: "A fictional scale fixture representing apparel, leather, weaving, and soft-goods production.", heroTitle: "Define the material, construction, sizing, and run.", heroSubtitle: "Compare current products or prepare a repeat production requirement." },
    designVariant: "editorial",
    heroPath: "/uploads/seed/benchmarks/selam-weave/hero.jpg",
    boothPath: "/landing/expo-booths/selam-weave.webp",
  },
  {
    key: "community",
    names: ["Abay Export Packing", "Shewa Recycled Inputs", "Bora Safety Supply", "Meda Water Products", "Laga Nursery Works", "Fana Institutional Goods", "Kora Circular Materials", "Tana Producer Services", "Dara Construction Inputs", "Wabi Cooperative Supply", "Horizon Utility Products", "Biftu Trade Packaging"],
    categories: ["Enterprise Goods", "Production Inputs", "Supply Programs"],
    offerings: ["Enterprise Product Range", "Configured Production Input", "Recurring Supply Program"],
    kinds: ["standard_product", "made_to_order", "production_supply"],
    copy: { tagline: "Enterprise goods and practical production supply.", description: "A fictional scale fixture representing cross-industry producers and suppliers in the weekly enterprise showcase.", heroTitle: "Present what the business can make, supply, and repeat.", heroSubtitle: "Review current outputs or send one clear production and supply requirement." },
    designVariant: "catalog",
    heroPath: "/uploads/seed/expo/dawa-water-solutions/hero.webp",
    boothPath: "/landing/expo-booths/dawa-water-solutions.webp",
  },
];

function slug(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const SCALE_DEMO_BUSINESSES: readonly ScaleDemoBusiness[] = themes.flatMap(
  (theme, themeIndex) =>
    theme.names.map((name, index) => {
      const location = locations[(index + themeIndex * 2) % locations.length];
      return {
        handle: `demo-${slug(name)}`,
        name,
        ...theme.copy,
        designVariant: theme.designVariant,
        industryKey: theme.key,
        heroPath: theme.heroPath,
        boothPath: theme.boothPath,
        profile: {
          ...location,
          industryKeys: [theme.key],
          latitude: location.latitude + themeIndex * 0.0004 + index * 0.0001,
          longitude: location.longitude + themeIndex * 0.0004 + index * 0.0001,
        },
        offerings: theme.offerings.map((offering, offeringIndex) => ({
          name: offering,
          category: theme.categories[offeringIndex],
          description: `${offering} presented as a fictional demo capability for ${name}.`,
          kind: theme.kinds[offeringIndex],
        })),
      };
    }),
);

export function scaleDemoBusiness(handle: string) {
  return SCALE_DEMO_BUSINESSES.find((business) => business.handle === handle);
}
