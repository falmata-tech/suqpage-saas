"use client";

import {useCallback, useEffect, useRef, useState} from 'react';

export type MarketBatch<Data, Item> = {
  data: Data; items: Item[]; page: number; pages: number; total: number;
};

/** One bounded request at a time; a new search invalidates all earlier pages. */
export function useMarketFeed<Data, Item extends {id: number | string}>(
  key: string,
  load: (params: string, signal: AbortSignal) => Promise<MarketBatch<Data, Item>>,
  initial?: MarketBatch<Data, Item>,
) {
  const loader = useRef(load);
  loader.current = load;
  const [state, setState] = useState(() => ({key, batch: initial, loading: !initial, loadingMore: false, error: '', moreError: ''}));
  const current = useRef(state);
  current.current = state;
  const firstKey = useRef(initial ? key : null);
  const activeKey = useRef(key);
  activeKey.current = key;
  const generation = useRef(0);
  const more = useRef<AbortController | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const version = ++generation.current;
    more.current?.abort(); more.current = null;
    if (firstKey.current === key && attempt === 0) return () => {generation.current++; more.current?.abort();};
    firstKey.current = null;
    const controller = new AbortController();
    setState(old => ({...old, key, batch: undefined, loading: true, loadingMore: false, error: '', moreError: ''}));
    const timer = setTimeout(() => {
      void loader.current(key, controller.signal).then(batch => {
        if (!controller.signal.aborted && generation.current === version && activeKey.current === key)
          setState({key, batch, loading: false, loadingMore: false, error: '', moreError: ''});
      }).catch(() => {
        if (!controller.signal.aborted && generation.current === version)
          setState(old => ({...old, loading: false, error: 'Search is unavailable. Try again.'}));
      });
    }, 250);
    return () => {clearTimeout(timer); controller.abort(); more.current?.abort();};
  }, [key, attempt]);

  const loadMore = useCallback(() => {
    const old = current.current;
    if (old.key !== activeKey.current || !old.batch || old.loading || more.current || old.batch.page >= old.batch.pages) return;
    const controller = new AbortController(), version = generation.current, expectedKey = old.key;
    more.current = controller;
    setState(s => ({...s, loadingMore: true, moreError: ''}));
    const params = new URLSearchParams(expectedKey);
    params.set('page', String(old.batch.page + 1));
    void loader.current(params.toString(), controller.signal).then(next => {
      if (controller.signal.aborted || generation.current !== version || activeKey.current !== expectedKey) return;
      setState(s => {
        if (!s.batch || s.key !== expectedKey) return s;
        const seen = new Set(s.batch.items.map(item => item.id));
        const items = [...s.batch.items, ...next.items.filter(item => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        })];
        // A shrinking catalog can clamp a requested page: stop instead of looping.
        const pages = next.page <= s.batch.page || !next.items.length ? next.page : next.pages;
        return {...s, batch: {...next, items, pages}, loadingMore: false, moreError: ''};
      });
    }).catch(() => {
      if (!controller.signal.aborted && generation.current === version)
        setState(s => ({...s, loadingMore: false, moreError: 'Search is unavailable. Try again.'}));
    }).finally(() => {if (more.current === controller) more.current = null;});
  }, []);

  const visible = state.key === key ? state : {...state, batch: undefined, loading: true, loadingMore: false, error: '', moreError: ''};
  return {...visible, loadMore, hasMore: Boolean(visible.batch && visible.batch.page < visible.batch.pages), retry: () => setAttempt(n => n + 1)};
}
