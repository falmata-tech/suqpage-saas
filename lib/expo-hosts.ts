export type ExpoHostCity = {
  key: string;
  city: string;
  zone: string;
  region: string;
  latitude: number;
  longitude: number;
};

export const EXPO_HOST_CITIES: ExpoHostCity[] = [
  { key: "addis-ababa", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.03, longitude: 38.74 },
  { key: "adama", city: "Adama", zone: "East Shewa", region: "Oromia", latitude: 8.54, longitude: 39.27 },
  { key: "ambo", city: "Ambo", zone: "West Shewa", region: "Oromia", latitude: 8.98, longitude: 37.86 },
  { key: "robe", city: "Robe", zone: "Bale", region: "Oromia", latitude: 7.12, longitude: 40.0 },
  { key: "shashamane", city: "Shashamane", zone: "West Arsi", region: "Oromia", latitude: 7.2, longitude: 38.59 },
  { key: "bahir-dar", city: "Bahir Dar", zone: "Bahir Dar", region: "Amhara", latitude: 11.57, longitude: 37.36 },
  { key: "gondar", city: "Gondar", zone: "Central Gondar", region: "Amhara", latitude: 12.6, longitude: 37.45 },
  { key: "jimma", city: "Jimma", zone: "Jimma", region: "Oromia", latitude: 7.68, longitude: 36.83 },
  { key: "hosaena", city: "Hosaena", zone: "Hadiya", region: "Central Ethiopia", latitude: 7.55, longitude: 37.85 },
  { key: "butajira", city: "Butajira", zone: "East Gurage", region: "Central Ethiopia", latitude: 8.12, longitude: 38.37 },
  { key: "hawassa", city: "Hawassa", zone: "Sidama", region: "Sidama", latitude: 7.05, longitude: 38.49 },
  { key: "dire-dawa", city: "Dire Dawa", zone: "Dire Dawa urban", region: "Dire Dawa", latitude: 9.6, longitude: 41.85 },
  { key: "gambela", city: "Gambela", zone: "Agniwak", region: "Gambela", latitude: 8.25, longitude: 34.59 },
];
