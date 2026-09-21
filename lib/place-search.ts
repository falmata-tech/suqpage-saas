export type KnownPlace = { id: string; name: string; localName: string; kind: string; region: string; latitude: number; longitude: number };
export const PLACE_SEARCH_LIMIT = 8;
const normalized = (value: string) => value.normalize('NFKC').toLocaleLowerCase('en').trim().replace(/\s+/g, ' ');
export function searchKnownPlaces(places: readonly KnownPlace[], query: string): KnownPlace[] {
  if (query.length > 80 || /[\u0000-\u001f\u007f]/.test(query)) return [];
  const needle = normalized(query);
  if (needle.length < 2) return [];
  const matches = places.flatMap(place => {
    const names = [normalized(place.name), normalized(place.localName)];
    const text = `${names.join(' ')} ${normalized(place.region)}`;
    if (!needle.split(' ').every(part => text.includes(part))) return [];
    const score = names.includes(needle) ? 0 : names.some(name => name.startsWith(needle)) ? 1 : 2;
    return [{ place, score }];
  });
  return matches.sort((a,b) => a.score-b.score || a.place.name.localeCompare(b.place.name) || a.place.region.localeCompare(b.place.region) || a.place.id.localeCompare(b.place.id)).slice(0, PLACE_SEARCH_LIMIT).map(item => item.place);
}
