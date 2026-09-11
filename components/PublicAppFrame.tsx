"use client";

import Link from "next/link";
import { FileText, Info, LayoutDashboard, LogIn, Mail, Map, Menu, Shield, Star } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AfricMadeBrand from "@/components/AfricMadeBrand";
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
  const pathname = usePathname();
  const showroomOpen = pathname.startsWith("/@");

  return <div className={`public-app-shell${showroomOpen ? " public-app-shell-showroom" : ""}`}>
    <header className="public-app-header">
      <AfricMadeBrand className="public-app-brand" />
      <span className="public-app-purpose">Ethiopia Market</span>
    </header>
    <aside className="public-app-rail">
      <section className="public-app-rail-group">
        <span>Explore</span>
        <nav aria-label="Explore AfricMade">
          {exploreDestinations.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
            <NavigationPendingIndicator label={label} />
          </Link>)}
        </nav>
      </section>
      <section className="public-app-rail-group">
        <span>Account</span>
        <nav aria-label="AfricMade account">
          {signedIn
            ? <Link href="/dashboard"><LayoutDashboard aria-hidden="true" /><span>Dashboard</span><NavigationPendingIndicator label="Dashboard" /></Link>
            : <Link href="/login"><LogIn aria-hidden="true" /><span>Sign in</span><NavigationPendingIndicator label="Sign in" /></Link>}
        </nav>
      </section>
      <section className="public-app-rail-group public-app-rail-information">
        <span>Information</span>
        <nav aria-label="AfricMade information">
          <Link href="/about" aria-current={isCurrent(pathname, "/about") ? "page" : undefined}><Info aria-hidden="true" /><span>About</span><NavigationPendingIndicator label="About" /></Link>
          <details className="public-app-more">
            <summary><Menu aria-hidden="true" /><span>More</span></summary>
            <div>
              <a href="mailto:falmata.dawano@gmail.com"><Mail aria-hidden="true" /><span>Contact AfricMade</span></a>
              <Link href="/privacy"><Shield aria-hidden="true" /><span>Privacy</span><NavigationPendingIndicator label="Privacy" /></Link>
              <Link href="/terms"><FileText aria-hidden="true" /><span>Terms</span><NavigationPendingIndicator label="Terms" /></Link>
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
