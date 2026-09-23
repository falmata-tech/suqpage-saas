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
          {exploreDestinations.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
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
            ? <Link href="/dashboard"><LayoutDashboard aria-hidden="true" /><span>{t("Dashboard")}</span><NavigationPendingIndicator label={t("Dashboard")} /></Link>
            : <Link href="/login"><LogIn aria-hidden="true" /><span>{t("Sign in")}</span><NavigationPendingIndicator label={t("Sign in")} /></Link>}
        </nav>
      </section>
      <section className="public-app-rail-group public-app-rail-information">
        <span>{t("Information")}</span>
        <nav aria-label={t("Suqpage information")}>
          <Link href="/about" aria-current={isCurrent(pathname, "/about") ? "page" : undefined}><Info aria-hidden="true" /><span>{t("About")}</span><NavigationPendingIndicator label={t("About")} /></Link>
          <details className="public-app-more">
            <summary><Menu aria-hidden="true" /><span>{t("More")}</span></summary>
            <div>
              <a href="mailto:falmata.dawano@gmail.com"><Mail aria-hidden="true" /><span>{t("Contact Suqpage")}</span></a>
              <Link href="/privacy"><Shield aria-hidden="true" /><span>{t("Privacy")}</span><NavigationPendingIndicator label={t("Privacy")} /></Link>
              <Link href="/terms"><FileText aria-hidden="true" /><span>{t("Terms")}</span><NavigationPendingIndicator label={t("Terms")} /></Link>
            </div>
          </details>
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
