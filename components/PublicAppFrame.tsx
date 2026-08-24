"use client";

import Link from "next/link";
import { CalendarClock, FileText, Info, LayoutDashboard, LogIn, Mail, Map, Menu, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import MirtPageBrand from "@/components/MirtPageBrand";
import PublicMobileNavigation from "@/components/PublicMobileNavigation";
import PublicSupportChat from "@/components/PublicSupportChat";

const exploreDestinations = [
  { href: "/", label: "Market", icon: Map },
  { href: "/featured", label: "Daily featured", icon: CalendarClock },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" || pathname === "/discover" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function PublicAppFrame({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  const pathname = usePathname();

  return <div className="public-app-shell">
    <header className="public-app-header">
      <MirtPageBrand className="public-app-brand" />
      <span className="public-app-purpose">Online showrooms for Ethiopian production</span>
    </header>
    <aside className="public-app-rail">
      <section className="public-app-rail-group">
        <span>Explore</span>
        <nav aria-label="Explore MirtPage">
          {exploreDestinations.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>)}
        </nav>
      </section>
      <section className="public-app-rail-group">
        <span>Account</span>
        <nav aria-label="MirtPage account">
          {signedIn
            ? <Link href="/dashboard"><LayoutDashboard aria-hidden="true" /><span>Dashboard</span></Link>
            : <Link href="/login"><LogIn aria-hidden="true" /><span>Sign in</span></Link>}
        </nav>
      </section>
      <section className="public-app-rail-group public-app-rail-information">
        <span>Information</span>
        <nav aria-label="MirtPage information">
          <Link href="/about" aria-current={isCurrent(pathname, "/about") ? "page" : undefined}><Info aria-hidden="true" /><span>About</span></Link>
          <details className="public-app-more">
            <summary><Menu aria-hidden="true" /><span>More</span></summary>
            <div>
              <a href="mailto:falmata.dawano@gmail.com"><Mail aria-hidden="true" /><span>Contact MirtPage</span></a>
              <Link href="/privacy"><Shield aria-hidden="true" /><span>Privacy</span></Link>
              <Link href="/terms"><FileText aria-hidden="true" /><span>Terms</span></Link>
            </div>
          </details>
        </nav>
      </section>
    </aside>
    <main className="public-app-main">{children}</main>
    <PublicSupportChat />
    <PublicMobileNavigation signedIn={signedIn} />
  </div>;
}
