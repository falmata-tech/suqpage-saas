"use client";
import { useUiText } from "@/lib/i18n/ui";


import LanguageSelector from "@/components/LanguageSelector";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, FileText, Info, LayoutDashboard, Mail, Map, Menu, Shield, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NavigationPendingIndicator from "@/components/NavigationPendingIndicator";

const items = [
  { href: "/", label: "Market", icon: Map, active: (path: string) => path === "/" || path === "/discover" },
  { href: "/featured", label: "Featured", icon: Star, active: (path: string) => path === "/featured" },
  { href: "/about", label: "About", icon: Info, active: (path: string) => path === "/about" },
] as const;

const informationItems = [
  { href: "mailto:falmata.dawano@gmail.com", label: "Contact Suqpage", icon: Mail },
  { href: "/privacy", label: "Privacy", icon: Shield },
  { href: "/terms", label: "Terms", icon: FileText },
] as const;

export default function PublicMobileNavigation({ signedIn = false, onboarding = false }: { signedIn?: boolean; onboarding?: boolean }) {
  const t = useUiText();
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

  const accountItem = onboarding
    ? { href: "/request", label: t("Business setup"), icon: CircleUserRound }
    : signedIn
      ? { href: "/dashboard", label: t("Dashboard"), icon: LayoutDashboard }
      : { href: "/login", label: t("Sign in"), icon: CircleUserRound };
  const AccountIcon = accountItem.icon;
  const supportingCurrent = pathname === accountItem.href || informationItems.some((item) => item.href.startsWith("/") && pathname === item.href);

  return <nav className="public-mobile-tabs" aria-label={t("Suqpage application navigation")}>
    {items.map((item) => {
      const active = item.active(pathname);
      const Icon = item.icon;
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
        <Icon aria-hidden="true" size={21} strokeWidth={2} />
        <span>{t(item.label)}</span>
        <NavigationPendingIndicator label={t(item.label)} />
      </Link>;
    })}
    <button ref={moreButtonRef} type="button" aria-haspopup="dialog" aria-expanded={menuOpen} aria-current={supportingCurrent ? "page" : undefined} onClick={() => setMenuOpen(true)}>
      <Menu aria-hidden="true" size={21} strokeWidth={2} />
      <span>{t("More")}</span>
    </button>
    <dialog ref={dialogRef} className="public-more-sheet" aria-labelledby="public-more-title" onClose={() => { setMenuOpen(false); moreButtonRef.current?.focus(); }} onCancel={() => setMenuOpen(false)} onClick={(event) => { if (event.target === dialogRef.current) setMenuOpen(false); }}>
      <section>
        <header><h2 id="public-more-title">{t("More")}</h2><button type="button" onClick={() => setMenuOpen(false)} aria-label={t("Close navigation")}><X aria-hidden="true" /></button></header>
        <LanguageSelector /><div className="public-more-group"><span>{t("Account")}</span><nav aria-label={t("Suqpage account")}>
          <Link href={accountItem.href} aria-current={pathname === accountItem.href ? "page" : undefined}>
            <AccountIcon aria-hidden="true" />
            <span>{t(accountItem.label)}</span>
            <NavigationPendingIndicator label={t(accountItem.label)} />
          </Link>
        </nav></div>
        <div className="public-more-group"><span>{t("Information")}</span><nav aria-label={t("Suqpage information")}>
          {informationItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={href.startsWith("/") && pathname === href ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{t(label)}</span>
            {href.startsWith("/") ? <NavigationPendingIndicator label={t(label)} /> : null}
          </Link>)}
        </nav></div>
      </section>
    </dialog>
  </nav>;
}
