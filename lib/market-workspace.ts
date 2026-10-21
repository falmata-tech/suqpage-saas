import {
  emptyMarketSearch, marketSearchParams, marketWorkspaceParams, readMarketSearch,
  MarketSearchError, type MarketSearch, type MarketScope,
} from './market-search';

export type MarketWorkspaceState = {
  mode: MarketScope;
  business: MarketSearch;
  product: MarketSearch;
};

export const MARKET_WORKSPACE_SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_SNAPSHOT_LENGTH = 65_536;
const LEGACY_KEYS = ['q', 'category', 'industry', 'place', 'country', 'city', 'offeringType', 'madeToOrder', 'page'];

export function emptyMarketWorkspace(): MarketWorkspaceState {
  return {mode: 'businesses', business: emptyMarketSearch(), product: emptyMarketSearch()};
}

/** Explicit navigation wins even when it deliberately clears an earlier search. */
export function hasExplicitMarketIntent(params: URLSearchParams): boolean {
  return params.has('view') || LEGACY_KEYS.some(key => params.has(key))
    || [...params.keys()].some(key => key.startsWith('b.') || key.startsWith('p.'));
}

/** Shared URL policy; legacy unscoped searches apply only to their selected pane. */
export function marketWorkspaceFromParams(params: URLSearchParams): MarketWorkspaceState {
  const scoped = [...params.keys()].some(key => key.startsWith('b.') || key.startsWith('p.'));
  const legacy = !scoped && LEGACY_KEYS.some(key => params.has(key));
  const mode = params.get('view') === 'search' || (legacy && params.get('view') !== 'map') ? 'products' : 'businesses';
  const state: MarketWorkspaceState = {
    mode, business: readMarketSearch(params, 'b.'), product: readMarketSearch(params, 'p.'),
  };
  if (legacy) {
    const previous = new URLSearchParams(params);
    for (const industry of params.getAll('industry')) previous.append('category', industry);
    state[mode === 'products' ? 'product' : 'business'] = readMarketSearch(previous);
  } else if (params.has('offeringType') || params.has('madeToOrder')) {
    // Do not conceal a retired or malformed legacy filter beside scoped fields.
    readMarketSearch(params);
  }
  return state;
}

function canonicalParams(state: MarketWorkspaceState): URLSearchParams {
  if (state.mode !== 'businesses' && state.mode !== 'products') throw new MarketSearchError();
  return marketWorkspaceParams(state.mode,
    readMarketSearch(marketSearchParams('businesses', state.business)),
    readMarketSearch(marketSearchParams('products', state.product)));
}

/** Only bounded public URL criteria are retained, never result or account data. */
export function serializeMarketWorkspaceSnapshot(state: MarketWorkspaceState, now = Date.now()): string {
  if (!Number.isFinite(now) || now < 0) throw new MarketSearchError();
  const raw = JSON.stringify({version: 1, updatedAt: now, params: canonicalParams(state).toString()});
  if (raw.length > MAX_SNAPSHOT_LENGTH) throw new MarketSearchError();
  return raw;
}

export function parseMarketWorkspaceSnapshot(raw: string | null, now = Date.now()): MarketWorkspaceState | null {
  if (!raw || raw.length > MAX_SNAPSHOT_LENGTH || !Number.isFinite(now)) return null;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return null;
    const value = saved as Record<string, unknown>;
    if (value.version !== 1 || typeof value.updatedAt !== 'number' || !Number.isFinite(value.updatedAt)
      || value.updatedAt < 0 || value.updatedAt > now || now - value.updatedAt > MARKET_WORKSPACE_SESSION_TTL_MS
      || typeof value.params !== 'string') return null;
    const params = new URLSearchParams(value.params);
    if (!['map', 'search'].includes(params.get('view') || '')) return null;
    const state = marketWorkspaceFromParams(params);
    return canonicalParams(state).toString() === value.params ? state : null;
  } catch {
    return null;
  }
}
