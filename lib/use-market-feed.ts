"use client";

import {useCallback, useEffect, useRef, useState} from 'react';

export type MarketBatch<Data, Item> = {
  data: Data; items: Item[]; page: number; pages: number; total: number;
};
export type MarketFeedOptions = {
  /** Retain only within this explicitly public/authorized collection boundary. */
  scopeKey?: string;
  /** Server data can describe a different query from restored client criteria. */
  initialSnapshotKey?: string;
};

/** One bounded request at a time; a new search invalidates all earlier pages. */
export function useMarketFeed<Data, Item extends {id: number | string}>(
  key: string,
  load: (params: string, signal: AbortSignal) => Promise<MarketBatch<Data, Item>>,
  initial?: MarketBatch<Data, Item>,
  options: MarketFeedOptions = {},
) {
  const scopeKey = options.scopeKey ?? key;
  const loader = useRef(load);
  loader.current = load;
  const [state, setState] = useState(() => ({key, scopeKey, displayedSnapshotKey: initial ? options.initialSnapshotKey ?? key : null as string | null, batch: initial, loading: !initial || (options.initialSnapshotKey ?? key) !== key, loadingMore: false, error: '', moreError: ''}));
  const current = useRef(state);
  current.current = state;
  const activeKey = useRef(key);
  activeKey.current = key;
  const activeScope = useRef(scopeKey);
  activeScope.current = scopeKey;
  const generation = useRef(0);
  const more = useRef<AbortController | null>(null);
  const [attempt, setAttempt] = useState(0);
  const lastAttempt = useRef(attempt);

  useEffect(() => {
    const version = ++generation.current;
    more.current?.abort(); more.current = null;
    const retry = lastAttempt.current !== attempt;
    lastAttempt.current = attempt;
    const previous = current.current;
    if (!retry && previous.scopeKey === scopeKey && previous.displayedSnapshotKey === key && previous.batch) {
      setState(old => ({...old, key, loading: false, loadingMore: false, error: '', moreError: ''}));
      return () => {generation.current++; more.current?.abort();};
    }
    const controller = new AbortController();
    setState(old => ({...old, key, scopeKey, batch: old.scopeKey === scopeKey ? old.batch : undefined, displayedSnapshotKey: old.scopeKey === scopeKey ? old.displayedSnapshotKey : null, loading: true, loadingMore: false, error: '', moreError: ''}));
    const timer = setTimeout(() => {
      void loader.current(key, controller.signal).then(batch => {
        if (!controller.signal.aborted && generation.current === version && activeKey.current === key && activeScope.current === scopeKey)
          setState({key, scopeKey, displayedSnapshotKey: key, batch, loading: false, loadingMore: false, error: '', moreError: ''});
      }).catch(() => {
        if (!controller.signal.aborted && generation.current === version && activeKey.current === key && activeScope.current === scopeKey)
          setState(old => ({...old, loading: false, error: 'Search is unavailable. Try again.'}));
      });
    }, 250);
    return () => {clearTimeout(timer); controller.abort(); more.current?.abort();};
  }, [key, scopeKey, attempt]);

  const loadMore = useCallback(() => {
    const old = current.current;
    if (old.key !== activeKey.current || old.displayedSnapshotKey !== activeKey.current || old.scopeKey !== activeScope.current || !old.batch || old.loading || old.error || more.current || old.batch.page >= old.batch.pages) return;
    const controller = new AbortController(), version = generation.current, expectedKey = old.key, expectedScope = old.scopeKey;
    more.current = controller;
    setState(s => ({...s, loadingMore: true, moreError: ''}));
    const params = new URLSearchParams(expectedKey);
    params.set('page', String(old.batch.page + 1));
    void loader.current(params.toString(), controller.signal).then(next => {
      if (controller.signal.aborted || generation.current !== version || activeKey.current !== expectedKey || activeScope.current !== expectedScope) return;
      setState(s => {
        if (!s.batch || s.key !== expectedKey || s.displayedSnapshotKey !== expectedKey || s.scopeKey !== expectedScope) return s;
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
      if (!controller.signal.aborted && generation.current === version && activeKey.current === expectedKey && activeScope.current === expectedScope)
        setState(s => ({...s, loadingMore: false, moreError: 'Search is unavailable. Try again.'}));
    }).finally(() => {if (more.current === controller) more.current = null;});
  }, []);

  const sameScope = state.scopeKey === scopeKey;
  const batch = sameScope ? state.batch : undefined;
  const displayedSnapshotKey = batch ? state.displayedSnapshotKey : null;
  const snapshotCurrent = Boolean(batch && displayedSnapshotKey === key);
  const requested = sameScope && state.key === key;
  const loading = requested ? state.loading : !snapshotCurrent;
  const visible = {...state, key, scopeKey, batch, displayedSnapshotKey, loading, loadingMore: requested && snapshotCurrent && state.loadingMore, error: requested ? state.error : '', moreError: requested && snapshotCurrent ? state.moreError : ''};
  return {...visible, requestedKey: key, snapshotCurrent, initialLoading: loading && !batch, updating: loading && Boolean(batch), loadMore, hasMore: Boolean(snapshotCurrent && !loading && !visible.error && batch && batch.page < batch.pages), retry: () => setAttempt(n => n + 1)};
}
