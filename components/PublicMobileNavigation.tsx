"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CircleUserRound, FileText, Info, Mail, Map, Menu, Shield, Store, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const items = [
  { href: "/", label: "Market", icon: Map, active: (path: string) => path === "/" || path === "/discover" },
  { href: "/featured", label: "Featured", icon: CalendarClock, active: (path: string) => path === "/featured" },
  { href: "/about", label: "About", icon: Info, active: (path: string) => path === "/about" },
] as const;

const supportingItems = [
  { href: "/request", label: "Sign up", icon: Store },
  { href: "/login", label: "Sign in", icon: CircleUserRound },
  { href: "mailto:falmata.dawano@gmail.com", label: "Contact MirtPage", icon: Mail },
  { href: "/privacy", label: "Privacy", icon: Shield },
  { href: "/terms", label: "Terms", icon: FileText },
] as const;

export default function PublicMobileNavigation() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const supportingCurrent = supportingItems.some((item) => item.href.startsWith("/") && pathname === item.href);

  return <nav className="public-mobile-tabs" aria-label="MirtPage application navigation">
    {items.map((item) => {
      const active = item.active(pathname);
      const Icon = item.icon;
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
        <Icon aria-hidden="true" size={21} strokeWidth={2} />
        <span>{item.label}</span>
      </Link>;
    })}
    <button ref={moreButtonRef} type="button" aria-haspopup="dialog" aria-expanded={menuOpen} aria-current={supportingCurrent ? "page" : undefined} onClick={() => setMenuOpen(true)}>
      <Menu aria-hidden="true" size={21} strokeWidth={2} />
      <span>More</span>
    </button>
    <dialog ref={dialogRef} className="public-more-sheet" aria-labelledby="public-more-title" onClose={() => { setMenuOpen(false); moreButtonRef.current?.focus(); }} onCancel={() => setMenuOpen(false)} onClick={(event) => { if (event.target === dialogRef.current) setMenuOpen(false); }}>
      <section>
        <header><h2 id="public-more-title">More</h2><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X aria-hidden="true" /></button></header>
        <nav aria-label="More MirtPage destinations">
          {supportingItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={href.startsWith("/") && pathname === href ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>)}
        </nav>
      </section>
    </dialog>
  </nav>;
}
