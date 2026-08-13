import { DENSE_DEMO_BUSINESSES } from "./dense-demo-seed";
import { SCALE_DEMO_BUSINESSES, scaleDemoBusiness } from "./scale-demo-seed";

export type SeededMarketplaceProfile = {
  industryKeys: string[];
  city: string;
  zone: string;
  region: string;
  latitude: number;
  longitude: number;
};

export const SEEDED_FEATURED_HANDLES = Object.freeze([
  "selam-weave",
  "afia-botanics",
  "warka-furniture",
  "addis-metalworks",
  "green-terrace-farm",
  "blue-nile-apiary",
  "rift-valley-mill",
  "entoto-ceramics",
  "koba-leather",
  "nova-assembly",
]);

export function isSeededFeatured(handle: string) {
  return (SEEDED_FEATURED_HANDLES as readonly string[]).includes(handle);
}

export const SEEDED_MARKETPLACE_PROFILES: Record<string, SeededMarketplaceProfile> = {
  "nova-assembly": {
    industryKeys: ["electronics"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.0192,
    longitude: 38.7525,
  },
  "tekle-circuit-systems": {
    industryKeys: ["electronics"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.031,
    longitude: 38.761,
  },
  "luna-cold-chain": {
    industryKeys: ["electronics"],
    city: "Adama",
    zone: "East Shewa",
    region: "Oromia",
    latitude: 8.541,
    longitude: 39.268,
  },
  "abyssinia-solar-devices": {
    industryKeys: ["electronics"],
    city: "Bishoftu",
    zone: "East Shewa",
    region: "Oromia",
    latitude: 8.752,
    longitude: 38.978,
  },
  "afia-botanics": {
    industryKeys: ["beauty-wellness"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.012,
    longitude: 38.744,
  },
  "nuru-naturals-lab": {
    industryKeys: ["beauty-wellness"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 8.998,
    longitude: 38.757,
  },
  "bale-herb-care": {
    industryKeys: ["beauty-wellness"],
    city: "Robe",
    zone: "Bale",
    region: "Oromia",
    latitude: 7.12,
    longitude: 40.0,
  },
  "saba-soap-works": {
    industryKeys: ["beauty-wellness"],
    city: "Robe",
    zone: "Bale",
    region: "Oromia",
    latitude: 7.13,
    longitude: 40.01,
  },
  "green-terrace-farm": {
    industryKeys: ["agriculture-growers"],
    city: "Bishoftu",
    zone: "East Shewa",
    region: "Oromia",
    latitude: 8.75,
    longitude: 38.98,
  },
  "rift-valley-mill": {
    industryKeys: ["food-farming"],
    city: "Adama",
    zone: "East Shewa",
    region: "Oromia",
    latitude: 8.54,
    longitude: 39.27,
  },
  "blue-nile-apiary": {
    industryKeys: ["agriculture-growers"],
    city: "Bahir Dar",
    zone: "Bahir Dar",
    region: "Amhara",
    latitude: 11.574,
    longitude: 37.361,
  },
  "geda-coffee-cooperative": {
    industryKeys: ["agriculture-growers"],
    city: "Bahir Dar",
    zone: "Bahir Dar",
    region: "Amhara",
    latitude: 11.58,
    longitude: 37.37,
  },
  "addis-metalworks": {
    industryKeys: ["machinery-tools"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 8.986,
    longitude: 38.742,
  },
  "merkato-packaging-systems": {
    industryKeys: ["machinery-tools"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.037,
    longitude: 38.736,
  },
  "atlas-pump-works": {
    industryKeys: ["machinery-tools"],
    city: "Jimma",
    zone: "Jimma",
    region: "Oromia",
    latitude: 7.69,
    longitude: 36.84,
  },
  "jimma-agro-machinery": {
    industryKeys: ["machinery-tools"],
    city: "Jimma",
    zone: "Jimma",
    region: "Oromia",
    latitude: 7.677,
    longitude: 36.834,
  },
  "warka-furniture": {
    industryKeys: ["home-living"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.041,
    longitude: 38.727,
  },
  "entoto-ceramics": {
    industryKeys: ["home-living"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.086,
    longitude: 38.75,
  },
  "hadiya-woodcraft": {
    industryKeys: ["home-living"],
    city: "Hosaena",
    zone: "Hadiya",
    region: "Central Ethiopia",
    latitude: 7.55,
    longitude: 37.85,
  },
  "gurage-lighting-works": {
    industryKeys: ["home-living"],
    city: "Butajira",
    zone: "East Gurage",
    region: "Central Ethiopia",
    latitude: 8.12,
    longitude: 38.37,
  },
  "selam-weave": {
    industryKeys: ["fashion-textiles"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.025,
    longitude: 38.746,
  },
  "koba-leather": {
    industryKeys: ["fashion-textiles"],
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.008,
    longitude: 38.72,
  },
  "sidama-workwear": {
    industryKeys: ["fashion-textiles"],
    city: "Hawassa",
    zone: "Sidama",
    region: "Sidama",
    latitude: 7.05,
    longitude: 38.49,
  },
  "hawassa-loom-house": {
    industryKeys: ["fashion-textiles"],
    city: "Hawassa",
    zone: "Sidama",
    region: "Sidama",
    latitude: 7.063,
    longitude: 38.476,
  },
  "dawa-water-solutions": {
    industryKeys: ["community"],
    city: "Dire Dawa",
    zone: "Dire Dawa urban",
    region: "Dire Dawa",
    latitude: 9.6,
    longitude: 41.85,
  },
  "eastern-safety-gear": {
    industryKeys: ["community"],
    city: "Dire Dawa",
    zone: "Dire Dawa urban",
    region: "Dire Dawa",
    latitude: 9.61,
    longitude: 41.86,
  },
  "gambela-recycled-paper": {
    industryKeys: ["community"],
    city: "Gambela",
    zone: "Agniwak",
    region: "Gambela",
    latitude: 8.25,
    longitude: 34.59,
  },
  "baro-nursery-supplies": {
    industryKeys: ["agriculture-growers"],
    city: "Gambela",
    zone: "Agniwak",
    region: "Gambela",
    latitude: 8.263,
    longitude: 34.575,
  },
  ...Object.fromEntries(
    DENSE_DEMO_BUSINESSES.map((business) => [
      business.handle,
      {
        industryKeys: ["machinery-tools"],
        city: "Addis Ababa",
        zone: "Addis Ababa",
        region: "Addis Ababa",
        latitude: business.latitude,
        longitude: business.longitude,
      },
    ]),
  ),
  ...Object.fromEntries(
    SCALE_DEMO_BUSINESSES.map((business) => [
      business.handle,
      business.profile,
    ]),
  ),
};

export function seededMarketplaceBoothPath(handle: string) {
  const scaleDemo = scaleDemoBusiness(handle);
  if (scaleDemo) return scaleDemo.boothPath;
  return `/landing/expo-booths/${handle}.webp`;
}
