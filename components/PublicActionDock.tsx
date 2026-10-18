"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ClipboardList } from "lucide-react";
import { useUiText } from "@/lib/i18n/ui";
import styles from "./PublicActionDock.module.css";

type DockHost = {
  target: HTMLDivElement | null;
  setInquiryOpen: (open: boolean) => void;
};
const DockContext = createContext<DockHost | undefined>(undefined);

/** The shell keeps chat mounted while the showroom owns its saved selections. */
export function PublicActionDockProvider({ children, enabled, transport }: {
  children: ReactNode;
  enabled: boolean;
  transport: ReactNode;
}) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
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
  return <DockContext.Provider value={{ target, setInquiryOpen }}>
    <div className={styles.scope} style={{ "--public-action-clearance": `${enabled ? height + 24 : 0}px` } as CSSProperties}>
    {children}
    {enabled && <div ref={setDock} className={styles.dock} data-public-action-dock inert={inquiryOpen} aria-hidden={inquiryOpen || undefined}>
      <div className={styles.inquirySlot} ref={setTarget} />
      {transport}
    </div>}
    </div>
  </DockContext.Provider>;
}

export function InquiryFloatingAction({ count, handle, onOpen, dialogOpen = false }: {
  count: number;
  handle: string;
  onOpen: () => void;
  dialogOpen?: boolean;
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
