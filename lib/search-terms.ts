// Shared, deterministic text matching; no provider calls or guessed brand changes.
export const SEARCH_SEPARATORS = '-–—/.,!?;:"()[]{}';
const requestWords = new Set(['a', 'an', 'the', 'and', 'for', 'in', 'at', 'of', 'to', 'with', 'find', 'show', 'me', 'please', 'i', 'need', 'looking']);

export function normalizeSearchText(value: string): string {
  let normalized = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  for (const separator of SEARCH_SEPARATORS) normalized = normalized.replaceAll(separator, ' ');
  return normalized.replace(/\s+/gu, ' ').trim();
}

function variants(term: string): string[] {
  const result = [term];
  if (/^[a-z]{4,}$/.test(term)) {
    if (/ies$/.test(term)) result.push(term.slice(0, -3) + 'y');
    else if (/(?:ches|shes|xes|zes|sses)$/.test(term)) result.push(term.slice(0, -2));
    else if (/s$/.test(term) && !/(?:ss|us|is)$/.test(term)) result.push(term.slice(0, -1));
    else if (/[^aeiou]y$/.test(term)) result.push(term.slice(0, -1) + 'ies');
  }
  return result;
}

export function searchTermGroups(query: string): string[][] {
  const raw = query.trim().slice(0, 80);
  if (!raw) return [];
  const words = [...new Set(normalizeSearchText(raw).split(' ').filter(Boolean))];
  const meaningful = words.filter(word => !requestWords.has(word));
  const terms = meaningful.length ? meaningful : words;
  // Nonempty punctuation-only input must never become the empty-query match-all.
  if (!terms.length) return [[raw]];
  return terms.map(variants);
}
