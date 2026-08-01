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
    names: ["Aster Device Workshop", "Lume Solar Repair", "Tana Radio Works", "Shewa Cable Studio", "Desta Appliance Repair", "Orbit Meter Workshop", "Kora Solar Lights", "Nile Sensor Studio"],
    categories: ["Devices", "Repairs", "Assemblies"],
    offerings: ["Practical Control Unit", "Device Repair Service", "Labeled Cable Assembly"],
    kinds: ["made_to_order", "made_to_order", "manufacturing_capability"],
    copy: { tagline: "Useful devices, repairs, and careful small-batch assembly.", description: "A small technical workshop presenting practical electrical work and locally serviceable devices.", heroTitle: "See what the workshop builds and repairs.", heroSubtitle: "Browse practical devices or describe the connection, repair, or small assembly you need." },
    designVariant: "technical",
    heroPath: "/uploads/seed/benchmarks/nova-assembly/hero.jpg",
    boothPath: "/landing/expo-booths/nova-assembly.webp",
  },
  {
    key: "beauty-wellness",
    names: ["Aloe Field Care", "Muna Botanical Studio", "Liya Soap Kitchen", "Biftu Natural Oils", "Hana Herbal Works", "Sena Body Care", "Meriem Hair Care", "Zema Plant Balms"],
    categories: ["Body Care", "Hair Care", "Soap"],
    offerings: ["Botanical Body Oil", "Nourishing Hair Blend", "Small-Batch Cleansing Bar"],
    kinds: ["standard_product", "standard_product", "made_to_order"],
    copy: { tagline: "Botanical care made in careful small batches.", description: "An independent natural-care maker organizing products, ingredients, and direct questions in one place.", heroTitle: "Meet the maker behind each jar and bar.", heroSubtitle: "Compare current care products and ask directly about ingredients, fit, or a small custom batch." },
    designVariant: "producer",
    heroPath: "/uploads/seed/benchmarks/afia-botanics/hero.jpg",
    boothPath: "/landing/expo-booths/afia-botanics.webp",
  },
  {
    key: "food-farming",
    names: ["Bora Highland Farm", "Laga Grain Mill", "Mulu Family Farm", "Kaffa Spice Kitchen", "Sofi Orchard", "Wabi Flour Mill", "Rift Seed Growers", "Tena Food Kitchen"],
    categories: ["Harvest", "Pantry", "Processed Foods"],
    offerings: ["Seasonal Harvest Box", "Freshly Milled Grain", "Small-Batch Pantry Product"],
    kinds: ["production_supply", "production_supply", "standard_product"],
    copy: { tagline: "Farm harvests and foods made close to their source.", description: "A small grower or food maker sharing seasonal products and processing work directly with customers.", heroTitle: "Know who grew it and how it was prepared.", heroSubtitle: "See what is available now, then ask about the next harvest, batch, or recurring order." },
    designVariant: "producer",
    heroPath: "/uploads/seed/benchmarks/green-terrace-farm/hero.jpg",
    boothPath: "/landing/expo-booths/green-terrace-farm.webp",
  },
  {
    key: "machinery-tools",
    names: ["Shewa Tool Workshop", "Rift Metal Studio", "Abay Machine Works", "Tana Welding Shop", "Bale Equipment Repair", "Dawa Hand Tools", "Kaffa Mill Workshop", "Sidama Fabrication"],
    categories: ["Tools", "Fabrication", "Repair"],
    offerings: ["Workshop Tool", "Custom Metal Fabrication", "Equipment Repair"],
    kinds: ["standard_product", "manufacturing_capability", "made_to_order"],
    copy: { tagline: "Tools, repairs, and small-run fabrication from a working shop.", description: "A local metal or equipment workshop showing what it can make, repair, and adapt.", heroTitle: "See the work before bringing the job.", heroSubtitle: "Review useful tools and past fabrication types, then share dimensions or the repair need." },
    designVariant: "technical",
    heroPath: "/uploads/seed/benchmarks/addis-metalworks/hero.jpg",
    boothPath: "/landing/expo-booths/addis-metalworks.webp",
  },
  {
    key: "home-living",
    names: ["Meda Furniture Studio", "Tullu Timber Works", "Buna Basket House", "Kora Ceramic House", "Aster Lighting Works", "Wabi Joinery Studio", "Sena Home Textiles", "Dara Clay Works"],
    categories: ["Furniture", "Home Objects", "Custom Work"],
    offerings: ["Repeat Furniture Range", "Custom Interior Component", "Made-to-Order Project Package"],
    kinds: ["standard_product", "manufacturing_capability", "made_to_order"],
    copy: { tagline: "Useful furniture and home objects made by local hands.", description: "A small furniture, ceramics, or home-goods studio sharing materials, sizes, and custom work.", heroTitle: "Objects for the home, with a visible maker behind them.", heroSubtitle: "Browse useful pieces or describe the size, finish, and space you have in mind." },
    designVariant: "editorial",
    heroPath: "/uploads/seed/benchmarks/warka-furniture/hero.jpg",
    boothPath: "/landing/expo-booths/warka-furniture.webp",
  },
  {
    key: "fashion-textiles",
    names: ["Sora Workwear Studio", "Liya Textile House", "Biftu Leather Goods", "Meda Uniform Works", "Kora Weaving Studio", "Ayni Garment Room", "Tana Cloth House", "Zema Bag Studio"],
    categories: ["Textiles", "Garments", "Leather Goods"],
    offerings: ["Woven Textile Piece", "Made-to-Measure Garment", "Hand-Finished Carry Goods"],
    kinds: ["standard_product", "made_to_order", "standard_product"],
    copy: { tagline: "Clothing, woven goods, and leather pieces made in small runs.", description: "An independent textile, garment, or leather studio presenting its real work and custom options.", heroTitle: "See the material, construction, and maker.", heroSubtitle: "Browse current pieces or ask about sizing, color, finishing, and a small repeat run." },
    designVariant: "editorial",
    heroPath: "/uploads/seed/benchmarks/selam-weave/hero.jpg",
    boothPath: "/landing/expo-booths/selam-weave.webp",
  },
];

function slug(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const SCALE_BUSINESSES_PER_THEME = 8;
const businessForms = ["Works", "Cooperative", "Production", "Supply"] as const;
const themeMarkers: Record<string, string> = {
  electronics: "Electrical",
  "beauty-wellness": "Botanical",
  "food-farming": "Agricultural",
  "machinery-tools": "Industrial",
  "home-living": "Interior",
  "fashion-textiles": "Textile",
};

function expandedNames(theme: ScaleTheme) {
  const names = [...theme.names];
  for (let index = 0; names.length < SCALE_BUSINESSES_PER_THEME; index += 1) {
    const location = locations[index % locations.length];
    const category = theme.categories[index % theme.categories.length];
    const form = businessForms[Math.floor(index / locations.length) % businessForms.length];
    names.push(`${location.city} ${themeMarkers[theme.key]} ${category} ${form}`);
  }
  return names;
}

const locationPlans: Record<string, readonly number[]> = {
  electronics: [0, 0, 0, 2, 2, 2, 6, 7],
  "beauty-wellness": [0, 0, 0, 9, 9, 9, 5, 7],
  "food-farming": [7, 7, 7, 4, 4, 4, 11, 9],
  "machinery-tools": [2, 2, 2, 6, 6, 6, 0, 8],
  "home-living": [5, 5, 5, 8, 8, 8, 0, 11],
  "fashion-textiles": [0, 0, 0, 5, 5, 5, 4, 10],
};

export const SCALE_DEMO_BUSINESSES: readonly ScaleDemoBusiness[] = themes.flatMap(
  (theme, themeIndex) =>
    expandedNames(theme).map((name, index) => {
      const location = locations[locationPlans[theme.key]?.[index] ?? (index + themeIndex * 2) % locations.length];
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
