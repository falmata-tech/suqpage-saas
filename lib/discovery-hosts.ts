export type DiscoveryHost = {
  key: string;
  code: string;
  city: string;
  zone: string;
  region: string;
  latitude: number;
  longitude: number;
};

export const DISCOVERY_HOSTS: readonly DiscoveryHost[] = [
  { key: "addis-ababa", code: "ADD", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.018, longitude: 38.748 },
  { key: "adama", code: "ADM", city: "Adama", zone: "East Shewa", region: "Oromia", latitude: 8.545, longitude: 39.272 },
  { key: "bishoftu", code: "BSH", city: "Bishoftu", zone: "East Shewa", region: "Oromia", latitude: 8.748, longitude: 38.982 },
  { key: "bahir-dar", code: "BHR", city: "Bahir Dar", zone: "Bahir Dar", region: "Amhara", latitude: 11.579, longitude: 37.367 },
  { key: "gondar", code: "GON", city: "Gondar", zone: "Central Gondar", region: "Amhara", latitude: 12.607, longitude: 37.463 },
  { key: "hawassa", code: "HAW", city: "Hawassa", zone: "Sidama", region: "Sidama", latitude: 7.058, longitude: 38.477 },
  { key: "dire-dawa", code: "DIR", city: "Dire Dawa", zone: "Dire Dawa urban", region: "Dire Dawa", latitude: 9.594, longitude: 41.856 },
  { key: "jimma", code: "JIM", city: "Jimma", zone: "Jimma", region: "Oromia", latitude: 7.681, longitude: 36.839 },
  { key: "hosaena", code: "HOS", city: "Hosaena", zone: "Hadiya", region: "Central Ethiopia", latitude: 7.553, longitude: 37.854 },
  { key: "robe", code: "ROB", city: "Robe", zone: "Bale", region: "Oromia", latitude: 7.118, longitude: 40.003 },
  { key: "arba-minch", code: "ARB", city: "Arba Minch", zone: "Gamo", region: "South Ethiopia", latitude: 6.036, longitude: 37.55 },
] as const;
