"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import {useQuoteGroups} from "@/lib/web-quote-list";
const MultiShopInquiry=dynamic(()=>import("./MultiShopInquiry"),{ssr:false});
import {useBlockedBusinesses} from './useBlockedBusinesses';
import { ClipboardList } from "lucide-react";
import { useUiText } from "@/lib/i18n/ui";
import { storefrontAccentVariables } from "@/lib/storefront-accent";
import styles from "./PublicActionDock.module.css";

type DockHost = {
  target: HTMLDivElement | null;
  marketplace: boolean;
  setAccent: (accent?: string) => void;
  setInquiryOpen: (open: boolean) => void;
};
const DockContext = createContext<DockHost | undefined>(undefined);

/** A standalone showroom retains its own composer. The public market shares one list. */
export function useShowroomInquiryDock(accent: string | undefined, dialogOpen: boolean) {
  const host = useContext(DockContext);
  const marketplace = host?.marketplace ?? false;
  const setAccent = host?.setAccent;
  const setOpen = host?.setInquiryOpen;
  useLayoutEffect(() => {
    if (!marketplace) return;
    setAccent?.(accent);
    setOpen?.(dialogOpen);
    return () => { setAccent?.(undefined); setOpen?.(false); };
  }, [marketplace, accent, dialogOpen, setAccent, setOpen]);
  return marketplace;
}

function MarketplaceInquiryAction({ accent }: { accent?: string }) {
  const blocked = useBlockedBusinesses();
  const groups = useQuoteGroups().filter(group => !blocked.list.some(b => b.handle === group.handle));
  const [review, setReview] = useState(false);
  useEffect(() => {
    const open = () => setReview(true);
    window.addEventListener('africmade-open-quote-list', open);
    return () => window.removeEventListener('africmade-open-quote-list', open);
  }, []);
  return <>
    <InquiryFloatingAction handle="" count={groups.reduce((n, g) => n + g.lines.length, 0)}
      accentColor={accent} onOpen={() => setReview(true)} dialogOpen={review}/>
    {review && <MultiShopInquiry groups={groups} close={() => setReview(false)}/>}
  </>;
}

export function PublicActionDockProvider({ children, enabled, marketplace = false }: {
  children: ReactNode;
  enabled: boolean;
  marketplace?: boolean;
}) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [accent, setAccent] = useState<string>();
  const [dock, setDock] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(48);
  useEffect(() => {
    if (!dock) return;
    const measure = () => setHeight(Math.ceil(dock.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => observer.disconnect();
  }, [dock]);
  return <DockContext.Provider value={{ target, setInquiryOpen, setAccent, marketplace: enabled && marketplace }}>
    <div className={styles.scope} style={{ "--public-action-clearance": `${enabled ? height + 24 : 0}px` } as CSSProperties}>
    {children}
    {enabled && marketplace && <MarketplaceInquiryAction accent={accent}/>}
    {enabled && <div ref={setDock} className={styles.dock} data-public-action-dock inert={inquiryOpen} aria-hidden={inquiryOpen || undefined}>
      <div className={styles.inquirySlot} ref={setTarget} />
    </div>}
    </div>
  </DockContext.Provider>;
}

export function InquiryFloatingAction({ count, handle, onOpen, dialogOpen = false, accentColor }: {
  count: number;
  handle: string;
  onOpen: () => void;
  dialogOpen?: boolean;
  accentColor?: string;
}) {
  const t = useUiText();
  const host = useContext(DockContext);
  const setInquiryOpen = host?.setInquiryOpen;
  useLayoutEffect(() => {
    setInquiryOpen?.(dialogOpen);
    return () => setInquiryOpen?.(false);
  }, [dialogOpen, setInquiryOpen]);
  if (count <= 0) return null;
  const action = <button type="button" className={styles.inquiry} data-inquiry-floating
    style={storefrontAccentVariables(accentColor) as CSSProperties}
    aria-label={t("View inquiry list, {value1} {value2}", { value1: count, value2: t(count === 1 ? "item" : "items") })}
    aria-haspopup="dialog" aria-expanded={dialogOpen} onClick={onOpen}>
    <ClipboardList size={20} aria-hidden="true" />
    <span>{t("Inquiry list")}</span>
    <b className={styles.count} aria-hidden="true">{count}</b>
  </button>;
  if (host) return host.target ? createPortal(action, host.target) : null;
  // Retained standalone public renderers have no platform shell host.
  return <div className={styles.dock} data-public-action-dock inert={dialogOpen} aria-hidden={dialogOpen || undefined}>{action}</div>;
}
