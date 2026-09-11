"use client";

import { useLinkStatus } from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useState, type ReactNode } from "react";

type PendingNavigation = { id: string; label: string } | null;
type PendingNavigationContextValue = {
  pending: PendingNavigation;
  report: (id: string, label: string, isPending: boolean) => void;
};

const PendingNavigationContext = createContext<PendingNavigationContextValue | null>(null);

export function NavigationPendingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingNavigation>(null);
  const report = useCallback((id: string, label: string, isPending: boolean) => {
    setPending((current) => {
      if (isPending) return { id, label };
      return current?.id === id ? null : current;
    });
  }, []);
  return <PendingNavigationContext.Provider value={{ pending, report }}>{children}</PendingNavigationContext.Provider>;
}

export function NavigationPendingMain({ children, className }: { children: ReactNode; className: string }) {
  const state = useContext(PendingNavigationContext);
  return <main className={`${className} navigation-pending-main`} aria-busy={state?.pending ? "true" : undefined} data-navigation-pending={state?.pending ? "true" : undefined}>
    {children}
    {state?.pending ? <div className="navigation-workspace-status" role="status"><i aria-hidden="true" /><span>Opening {state.pending.label}</span></div> : null}
  </main>;
}

export default function NavigationPendingIndicator({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  const context = useContext(PendingNavigationContext);
  const report = context?.report;
  const id = useId();
  useEffect(() => {
    report?.(id, label, pending);
    return () => report?.(id, label, false);
  }, [id, label, pending, report]);
  return <>
    <i className={`navigation-pending-indicator${pending ? " is-pending" : ""}`} aria-hidden="true" />
    {pending ? <i className="navigation-pending-status" role="status" aria-label={`Loading ${label}`} /> : null}
  </>;
}
