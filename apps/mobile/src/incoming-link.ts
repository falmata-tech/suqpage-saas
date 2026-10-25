import { parseBusinessHandle } from '../../../lib/business-handle';
import { normalizeDiscoveryCategories, discoveryPlaceKey } from '../../../lib/discovery-contract';
import {readMarketSearch,marketWorkspaceParams} from '../../../lib/market-search';
import {isTrackingReference} from '../../../lib/tracking-contract';

type Param = string | string[] | undefined;
export type MarketLinkInput = { q?: Param; category?: Param; industry?: Param; place?: Param; page?: Param; view?: Param; _intent?: Param };
const first = (value: Param) => typeof value === 'string' ? value : value?.[0] || '';
let marketIntent=0;
/** Distinguish a fresh explicit action from returning to an existing route. */
export function createMarketNavigationIntent():string {return String(++marketIntent);}
export function marketLinkState(input: MarketLinkInput) {
  const query = first(input.q).slice(0, 200).trim();
  const categories = normalizeDiscoveryCategories([...(typeof input.category === 'string' ? [input.category] : input.category || []), ...(typeof input.industry === 'string' ? [input.industry] : input.industry || [])]);
  const place = discoveryPlaceKey(input.place);
  const rawPage = first(input.page);
  const page = /^\d+$/.test(rawPage) && Number(rawPage) > 0 ? Math.min(Number(rawPage),10000) : 1;
  const open = first(input.view) === 'map' ? false : first(input.view) === 'search' || Boolean(query || categories.length || place);
  return { query, categories, place, page, open };
}

/** OS/browser input is navigation only; identity and public eligibility remain server authority. */
export function incomingSuqpagePath(input: string): string {
  try {
    if (!input || input.length > 16384 || /[\u0000-\u001f\u007f\\]/u.test(input)) return '/';
    let url = new URL(input, 'https://mirtpage.com');
    if (url.username || url.password || url.port) return '/';
    const canonicalSource=url.protocol==='https:'&&['mirtpage.com','suqpage.com'].includes(url.hostname);
    if (url.protocol === 'africmade:' || url.protocol === 'mirtpage:' || url.protocol === 'suqpage:') {
      const path = `${url.hostname ? '/' + url.hostname : ''}${url.pathname}` || '/';
      url = new URL(path + url.search, 'https://mirtpage.com');
    } else if (!canonicalSource) return '/';
    const path = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/';
    if(path==='/transport-plan'){
      return canonicalSource&&url.pathname==='/transport-plan'&&!url.search?'/tracking':'/';
    }
    if(path==='/tracking'||path.startsWith('/tracking/')){
      if(!canonicalSource||url.search||url.hash||url.pathname!==path)return '/';
      if(path==='/tracking')return '/tracking';
      const reference=path.slice('/tracking/'.length);
      return isTrackingReference(reference)?'/tracking?'+new URLSearchParams({reference}):'/';
    }
    if (path.startsWith('/@') || path.startsWith('/shop/')) {
      const handle = parseBusinessHandle(path.startsWith('/@') ? path.slice(2) : path.slice(6));
      const id = url.searchParams.get('product');
      if (id && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id))) {
        return `/product?${new URLSearchParams({handle,id})}`;
      }
      return `/shop/${encodeURIComponent(handle)}`;
    }
    if (path === '/product') {
      const handle = parseBusinessHandle(url.searchParams.get('handle'));
      const id = url.searchParams.get('id');
      return id && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id))
        ? `/product?${new URLSearchParams({handle,id})}` : `/shop/${handle}`;
    }
    if (path === '/' || path === '/market') {
      if([...url.searchParams.keys()].some(key=>key.startsWith('b.')||key.startsWith('p.'))) {
        return '/?'+marketWorkspaceParams(url.searchParams.get('view')==='search'?'products':'businesses',readMarketSearch(url.searchParams,'b.'),readMarketSearch(url.searchParams,'p.'));
      }
      const state = marketLinkState({q:url.searchParams.get('q') || undefined,category:url.searchParams.getAll('category'),industry:url.searchParams.getAll('industry'),place:url.searchParams.getAll('place'),page:url.searchParams.get('page') || undefined,view:url.searchParams.get('view') || undefined});
      const params = new URLSearchParams();
      if(state.query)params.set('q',state.query);
      state.categories.forEach(category=>params.append('category',category));
      if(state.place)params.set('place',state.place);
      if(state.page>1)params.set('page',String(state.page));
      if(state.open)params.set('view','search');else if(url.searchParams.get('view')==='map')params.set('view','map');
      return params.size ? `/?${params}` : '/';
    }
    if (path === '/featured' || path === '/about') return path;
    if (path === '/login' || path === '/account') return '/account';
    return '/';
  } catch { return '/'; }
}
