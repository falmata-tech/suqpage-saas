"use client";

import Link from "next/link";
import { CalendarClock, FileText, Info, LogIn, Mail, Map, Menu, Shield, Store } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import MirtPageBrand from "@/components/MirtPageBrand";
import PublicMobileNavigation from "@/components/PublicMobileNavigation";

const destinations = [
  { href: "/", label: "Market", icon: Map },
  { href: "/featured", label: "Daily featured", icon: CalendarClock },
  { href: "/about", label: "About", icon: Info },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" || pathname === "/discover" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function PublicAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return <div className="public-app-shell">
    <header className="public-app-header">
      <MirtPageBrand className="public-app-brand" />
      <span className="public-app-purpose">Online showrooms for Ethiopian production</span>
    </header>
    <aside className="public-app-rail">
      <nav aria-label="MirtPage public application">
        {destinations.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </Link>)}
      </nav>
      <div className="public-app-rail-secondary">
        <Link className="public-app-create" href="/request"><Store aria-hidden="true" /><span>Create showroom</span></Link>
        <Link href="/login"><LogIn aria-hidden="true" /><span>Sign in</span></Link>
        <details className="public-app-more">
          <div>
            <a href="mailto:falmata.dawano@gmail.com"><Mail aria-hidden="true" /><span>Contact MirtPage</span></a>
            <Link href="/privacy"><Shield aria-hidden="true" /><span>Privacy</span></Link>
            <Link href="/terms"><FileText aria-hidden="true" /><span>Terms</span></Link>
          </div>
          <summary><Menu aria-hidden="true" /><span>More</span></summary>
        </details>
      </div>
    </aside>
    <main className="public-app-main">{children}</main>
    <PublicMobileNavigation />
  </div>;
}
