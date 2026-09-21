import source from './place-catalog.json';
import { searchKnownPlaces, type KnownPlace } from './place-search';

// Derived only from the committed OSM city/town points and admitted region polygons.
// Keep this adapter server-side; the browser receives bounded search results.
const places: readonly KnownPlace[] = source;
const byId = new Map(places.map(place => [place.id, place]));
export function findKnownPlace(id: string): KnownPlace | null { return byId.get(id) || null; }
export function findPlaceSuggestions(query: string): KnownPlace[] { return searchKnownPlaces(places, query); }

export function findKnownPlaceByName(city: string, region: string): KnownPlace | null {
  const key = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase();
  const matches = places.filter(place => key(place.region) === key(region) &&
    (key(place.name) === key(city) || (place.localName && key(place.localName) === key(city))));
  return matches.length === 1 ? matches[0] : null;
}
