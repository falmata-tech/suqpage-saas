import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import {useFocusEffect, useIsFocused, useNavigation} from 'expo-router';
import {usePreventRemove} from 'expo-router/react-navigation';

type Leave = () => void;
type RequestLeave = (leave: Leave) => void;
type NavigationBoundary = {
  register: (request: RequestLeave) => () => void;
  request: RequestLeave;
};
const NavigationContext = createContext<NavigationBoundary | null>(null);

/** Only the focused editor can intercept app-owned navigation outside its stack. */
export function OwnerEditNavigationProvider({children}: {children: React.ReactNode}) {
  const active = useRef<{request: RequestLeave} | null>(null);
  const register = useCallback((request: RequestLeave) => {
    const entry = {request};
    active.current = entry;
    return () => { if (active.current === entry) active.current = null; };
  }, []);
  const request = useCallback((leave: Leave) => {
    if (active.current) active.current.request(leave);
    else leave();
  }, []);
  const value = useMemo(() => ({register, request}), [register, request]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

const leaveImmediately: RequestLeave = leave => leave();
export function useOwnerNavigation(): RequestLeave {
  return useContext(NavigationContext)?.request || leaveImmediately;
}

type EditState = {
  dirty: boolean;
  signature: string;
  busy: boolean;
  isBusy?: () => boolean;
  discard: () => void;
};
export function useOwnerEditGuard(state: EditState) {
  const boundary = useContext(NavigationContext), navigation = useNavigation(), focused = useIsFocused();
  const active = useRef(focused); active.current = focused;
  const latest = useRef(state); latest.current = state;
  const edits = useRef(0), renderedEdits = useRef(0), revision = edits.current; renderedEdits.current = revision;
  const pending = useRef<Leave | null>(null), approved = useRef<string | null>(null);
  // Approval belongs to one acknowledged/discarded snapshot, not a future edit.
  if (approved.current !== null && (approved.current !== state.signature || (!state.dirty && !state.busy))) approved.current = null;
  const [confirming, setConfirming] = useState(false);
  const isBusy = () => latest.current.busy || Boolean(latest.current.isBusy?.());
  const requestLeave = useCallback((leave: Leave) => {
    if (!active.current) { leave(); return; }
    const current = latest.current;
    if (approved.current === current.signature) { approved.current = null; leave(); return; }
    if (current.busy || current.isBusy?.()) return;
    if (!current.dirty && edits.current === renderedEdits.current) { leave(); return; }
    // Keep the first intended destination stable until the owner decides.
    if (pending.current) return;
    pending.current = leave;
    setConfirming(true);
  }, []);
  useFocusEffect(useCallback(() => {
    active.current = true;
    const release = boundary?.register(requestLeave);
    return () => { active.current = false; release?.(); pending.current = null; setConfirming(false); };
  }, [boundary, requestLeave]));
  usePreventRemove(focused && (state.dirty || state.busy), ({data}) => {
    requestLeave(() => navigation.dispatch(data.action));
  });
  const keepEditing = () => {
    if (!active.current || isBusy()) return;
    pending.current = null;
    setConfirming(false);
  };
  const discard = () => {
    if (!active.current || isBusy()) return;
    const leave = pending.current;
    pending.current = null;
    approved.current = latest.current.signature;
    latest.current.discard();
    setConfirming(false);
    leave?.();
  };
  /** Call only after the current save has been acknowledged by the owner API. */
  const complete = (leave?: Leave, savedSignature = latest.current.signature, savedRevision = edits.current) => {
    if (!active.current) return;
    approved.current = savedSignature;
    pending.current = null;
    setConfirming(false);
    // A newer input must not be mistaken for the snapshot the server acknowledged.
    if (savedSignature !== latest.current.signature || savedRevision !== edits.current) { approved.current = null; return; }
    leave?.();
  };
  const changed = () => { edits.current++; approved.current = null; };
  const checkpoint = () => revision;
  return {confirming, requestLeave, keepEditing, discard, complete, changed, checkpoint};
}

export type OwnerEditGuard = ReturnType<typeof useOwnerEditGuard>;
