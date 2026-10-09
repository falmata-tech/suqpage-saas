"use client";
import { useUiText } from "@/lib/i18n/ui";


import LanguageSelector from "@/components/LanguageSelector";
import Link from "next/link";
import { FileText, Info, LayoutDashboard, LogIn, Mail, Map, Menu, Shield, Star } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SuqpageBrand from "@/components/SuqpageBrand";
import NavigationPendingIndicator, { NavigationPendingMain, NavigationPendingProvider } from "@/components/NavigationPendingIndicator";
import PublicMobileNavigation from "@/components/PublicMobileNavigation";
import PublicSupportChat from "@/components/PublicSupportChat";

const exploreDestinations = [
  { href: "/", label: "Market", icon: Map },
  { href: "/featured", label: "Featured", icon: Star },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: LayoutDashboard },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" || pathname === "/discover" : pathname === href || pathname.startsWith(`${href}/`);
}

function PublicAppFrameContent({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  const t = useUiText();
  const pathname = usePathname();
  const showroomOpen = pathname.startsWith("/@");

  return <div className={`public-app-shell${showroomOpen ? " public-app-shell-showroom" : ""}`}>
    <header className="public-app-header">
      <SuqpageBrand className="public-app-brand" />
      <LanguageSelector />
    </header>
    <aside className="public-app-rail">
      <section className="public-app-rail-group">
        <span>{t("Explore")}</span>
        <nav aria-label={t("Explore Suqpage")}>
          {exploreDestinations.filter(item=>item.label!=="Inquiries"||signedIn).map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{t(label)}</span>
            <NavigationPendingIndicator label={t(label)} />
          </Link>)}
        </nav>
      </section>
      <section className="public-app-rail-group">
        <span>{t("Account")}</span>
        <nav aria-label={t("Suqpage account")}>
          {signedIn
            ? <Link href="/dashboard/profile"><LayoutDashboard aria-hidden="true" /><span>{t("Account")}</span><NavigationPendingIndicator label={t("Account")} /></Link>
            : <Link href="/login"><LogIn aria-hidden="true" /><span>{t("Account")}</span><NavigationPendingIndicator label={t("Account")} /></Link>}
        </nav>
      </section>

    </aside>
    <NavigationPendingMain className={`public-app-main${showroomOpen ? " public-app-showroom-main" : ""}`}>{children}</NavigationPendingMain>
    <PublicSupportChat />
    {showroomOpen ? null : <PublicMobileNavigation signedIn={signedIn} />}
  </div>;
}

export default function PublicAppFrame(props: { children: ReactNode; signedIn: boolean }) {
  return <NavigationPendingProvider><PublicAppFrameContent {...props} /></NavigationPendingProvider>;
}
