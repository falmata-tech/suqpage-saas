// Identical immutable expressions in the indexes and their read queries.
export function indexedSearchText(columns: readonly string[]): string {
  return `lower(regexp_replace(normalize(${columns.map(column => `COALESCE(${column},'')`).join(" || ' ' || ")}, NFKD), '[\u0300-\u036f]', '', 'g'))`;
}
export const SEARCH_INDEXES = [
  { table: 'products', name: 'products_spelling_gist', columns: ['name', 'description'] },
  { table: 'businesses', name: 'businesses_spelling_gist', columns: ['name', 'handle', 'tagline', 'description'] },
  { table: 'business_discovery_profiles', name: 'places_spelling_gist', columns: ['city', 'zone', 'region'] },
  { table: 'owner_page_publications', name: 'page_about_spelling_gist', columns: ["content_json::jsonb->>'about'"] },
] as const;
export const SPELLING_INDEX_SQL = SEARCH_INDEXES.map(index =>
  `CREATE INDEX ${index.name} ON ${index.table} USING gist ((${indexedSearchText(index.columns)}) extensions.gist_trgm_ops(siglen=32));`,
).join('\n');
