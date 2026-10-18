import source from './place-catalog.json';
import fs from 'node:fs';
import path from 'node:path';
import { isCountryCode } from './countries';
import { searchKnownPlaces, type KnownPlace } from './place-search';

// Canonical OSM Ethiopian anchors plus a committed GeoNames world-city snapshot.
// Keep this adapter server-side; the browser receives bounded search results.
const world = JSON.parse(fs.readFileSync(path.join(process.cwd(),'lib/world-place-catalog.json'),'utf8')) as {cities:unknown[][]};
const globalPlaces: KnownPlace[] = world.cities.map(row => {
  const [id, name, localName, region, countryCode, latitude, longitude, aliases] = row;
  if (typeof id !== 'string' || typeof name !== 'string' || typeof localName !== 'string' ||
    typeof region !== 'string' || !isCountryCode(countryCode) || typeof latitude !== 'number' ||
    typeof longitude !== 'number' || !Array.isArray(aliases) || !aliases.every(value => typeof value === 'string')) {
    throw new Error('Invalid committed world-city record.');
  }
  return { id, name, localName, region, countryCode, latitude, longitude, aliases, kind: 'city' };
});
const localAliases:Record<string,string[]>={'place-553e667e63bb8da0':['Finfinne','Finfinnee'],'place-a814cfc7f6130009':['Hosaena','Hosanna'],'place-d90f3975cdb18e56':['Gondar']};
const places: readonly KnownPlace[] = [...source.map(place => ({ ...place, countryCode: 'ET',aliases:localAliases[place.id]||[] })), ...globalPlaces];
const byId = new Map(places.map(place => [place.id, place]));
const byCountry = new Map<string, KnownPlace[]>();
for (const place of places) {
  const bucket = byCountry.get(place.countryCode!) || [];
  bucket.push(place); byCountry.set(place.countryCode!, bucket);
}
export function findKnownPlace(id: string): KnownPlace | null { return byId.get(id) || null; }
export function findPlaceSuggestions(query: string, countryCode = 'ET'): KnownPlace[] {
  return searchKnownPlaces(byCountry.get(countryCode) || [], query);
}

export function findKnownPlaceByName(city: string, region: string, countryCode = 'ET'): KnownPlace | null {
  const key = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase();
  const matches = (byCountry.get(countryCode) || []).filter(place => key(place.region) === key(region) &&
    (key(place.name) === key(city) || (place.localName && key(place.localName) === key(city))));
  return matches.length === 1 ? matches[0] : null;
}
