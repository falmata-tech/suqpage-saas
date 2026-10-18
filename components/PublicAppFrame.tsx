"use client";
import { useUiText } from "@/lib/i18n/ui";


import LanguageSelector from "@/components/LanguageSelector";
import Link from "next/link";
import { FileText, Info, LayoutDashboard, LogIn, Map, Menu, Shield, Star } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SuqpageBrand from "@/components/SuqpageBrand";
import NavigationPendingIndicator, { NavigationPendingMain, NavigationPendingProvider } from "@/components/NavigationPendingIndicator";
import PublicMobileNavigation from "@/components/PublicMobileNavigation";
import PublicSupportChat from "@/components/PublicSupportChat";
import { PublicActionDockProvider } from "@/components/PublicActionDock";
import {publicTransportPlacement} from "@/lib/public-transport-placement";

const exploreDestinations = [
  { href: "/", label: "Market", icon: Map },
  { href: "/featured", label: "Featured", icon: Star },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" || pathname === "/discover" : pathname === href || pathname.startsWith(`${href}/`);
}

function PublicAppFrameContent({ children, signedIn, dashboardHref="/dashboard" }: { children: ReactNode; signedIn: boolean;dashboardHref?:string }) {
  const t = useUiText();
  const pathname = usePathname();
  const showroomOpen = pathname.startsWith("/@");

  return <PublicActionDockProvider enabled={publicTransportPlacement(pathname,"web")==="shell"} transport={<PublicSupportChat />}><div className={`public-app-shell${showroomOpen ? " public-app-shell-showroom" : ""}`}>
    <header className="public-app-header">
      <SuqpageBrand className="public-app-brand" />
      <LanguageSelector />
    </header>
    <aside className="public-app-rail">
      <section className="public-app-rail-group">
        <span>{t("Explore")}</span>
        <nav aria-label={t("Explore MirtPage")}>
          {exploreDestinations.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{t(label)}</span>
            <NavigationPendingIndicator label={t(label)} />
          </Link>)}
        </nav>
      </section>
      <section className="public-app-rail-group">
        <span>{t("Account")}</span>
        <nav aria-label={t("MirtPage account")}>
          {signedIn
            ? <Link href={dashboardHref} aria-current={isCurrent(pathname,"/dashboard")?"page":undefined}><LayoutDashboard aria-hidden="true" /><span>{t("Account")}</span><NavigationPendingIndicator label={t("Account")} /></Link>
            : <Link href="/login" aria-current={pathname==="/login"||pathname==="/request"?"page":undefined}><LogIn aria-hidden="true" /><span>{t("Login")}</span><NavigationPendingIndicator label={t("Login")} /></Link>}
        </nav>
      </section>
      <section className="public-app-rail-group public-app-rail-information">
        <span>{t('Information')}</span><nav aria-label={t('Information')}>
          {[{href:'/about',label:'About',icon:Info},{href:'/privacy',label:'Privacy',icon:Shield},{href:'/terms',label:'Terms',icon:FileText}].map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={isCurrent(pathname,href)?'page':undefined}><Icon aria-hidden="true"/><span>{t(label)}</span><NavigationPendingIndicator label={t(label)}/></Link>)}
        </nav>
      </section>
    </aside>
    <NavigationPendingMain className={`public-app-main${showroomOpen ? " public-app-showroom-main" : ""}`}>{children}</NavigationPendingMain>
    {showroomOpen ? null : <PublicMobileNavigation signedIn={signedIn} dashboardHref={dashboardHref} />}
  </div></PublicActionDockProvider>;
}

export default function PublicAppFrame(props: { children: ReactNode; signedIn: boolean;dashboardHref?:string }) {
  return <NavigationPendingProvider><PublicAppFrameContent {...props} /></NavigationPendingProvider>;
}
