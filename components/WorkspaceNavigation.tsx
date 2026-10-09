"use client";
import { useUiText } from "@/lib/i18n/ui";


import LanguageSelector from "@/components/LanguageSelector";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Building2,
  CircleUserRound,
  ClipboardList,
  ExternalLink,
  Headphones,
  House,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LockKeyhole,
  LogOut,
  MapPinned,
  Menu,
  Package,
  Palette,
  RefreshCw,
  CalendarClock,
  Settings2,
  ShieldCheck,
  Store,
  Truck,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/actions";
import SuqpageBrand from "@/components/SuqpageBrand";
import NavigationPendingIndicator from "@/components/NavigationPendingIndicator";
import { workspaceActiveHref, type SupportQueue } from "@/lib/support-navigation";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  icon?: WorkspaceNavIcon;
  external?: boolean;
  activePaths?: string[];
};

export type WorkspaceNavIcon =
  | "account"
  | "access"
  | "businesses"
  | "clients"
  | "design"
  | "discovery"
  | "inquiries"
  | "insights"
  | "library"
  | "offerings"
  | "overview"
  | "pageEditor"
  | "public"
  | "requests"
  | "security"
  | "settings"
  | "staff"
  | "support"
  | "supportAgents"
  | "transport"
  | "schedule"
  | "switch"
  | "workspace";

const icons: Record<WorkspaceNavIcon, LucideIcon> = {
  account: CircleUserRound,
  access: Users,
  businesses: Building2,
  clients: Users,
  design: Palette,
  discovery: MapPinned,
  inquiries: Inbox,
  insights: BarChart3,
  library: BookOpen,
  offerings: Package,
  overview: LayoutDashboard,
  pageEditor: LayoutTemplate,
  public: ExternalLink,
  requests: ClipboardList,
  security: LockKeyhole,
  settings: Settings2,
  staff: UserCog,
  support: Headphones,
  supportAgents: Headphones,
  transport: Truck,
  schedule: CalendarClock,
  switch: RefreshCw,
  workspace: Store,
};

function NavIcon({ name }: { name?: WorkspaceNavIcon }) {
  const Icon = name ? icons[name] : House;
  return <Icon aria-hidden="true" size={17} strokeWidth={2} />;
}

const mobileLabels: Record<string, string> = {
  "Business details": "Details",
  "Customer inquiries": "Inquiries",
  "My offerings": "Offerings",
  "Products & services": "Items",
  "Platform overview": "Overview",
  "Page project": "Page",
  "Your page": "Page",
  "Page draft": "Draft",
  "Page requests": "Requests",
  "Support inbox": "Support",
  "Business support": "Support",
  "Workload & availability": "Staff",
};

export type WorkspaceNavGroup = {
  label: string;
  items: WorkspaceNavItem[];
};

function NavigationGroups({ groups, onNavigate, clientNavigation=false, supportQueue }: { groups: WorkspaceNavGroup[]; onNavigate?: () => void; clientNavigation?:boolean; supportQueue?:SupportQueue }) {
  const t = useUiText();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeHref = workspaceActiveHref(groups.flatMap(group=>group.items), pathname, searchParams, supportQueue);
  return (
    <nav className="workspace-nav" aria-label={t("Workspace")}>
      {groups.map((group) => (
        <div className="workspace-nav-group" key={t(group.label)}>
          <span className="workspace-nav-label">{t(group.label)}</span>
          {group.items.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                href={item.href}
                key={`${t(group.label)}-${item.href}-${t(item.label)}`}
                aria-current={active ? "page" : undefined}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                onClick={onNavigate}
              >
                <NavIcon name={item.icon} />
                <span>{t(item.label)}</span>
                {item.external ? <ExternalLink className="workspace-nav-external" aria-hidden="true" size={14} /> : null}
                {item.external ? null : <NavigationPendingIndicator label={t(item.label)} />}
              </Link>
            );
          })}
        </div>
      ))}
      {!clientNavigation && <div className="workspace-nav-group workspace-nav-utility">
        <span className="workspace-nav-label">{t("Account")}</span>
        <Link href="/dashboard/account" aria-current={pathname === "/dashboard/account" ? "page" : undefined} onClick={onNavigate}><ShieldCheck aria-hidden="true" size={17}/><span>{t("Account security")}</span><NavigationPendingIndicator label={t("Account security")} /></Link>
        <Link href="/" target="_blank" rel="noreferrer" onClick={onNavigate}><ExternalLink aria-hidden="true" size={17}/><span>{t("Public site")}</span><ExternalLink className="workspace-nav-external" aria-hidden="true" size={14}/></Link>
        <form action={logoutAction}><button type="submit"><LogOut aria-hidden="true" size={17}/><span>{t("Sign out")}</span></button></form>
      </div>}
    </nav>
  );
}

export default function WorkspaceNavigation({
  dashboardHref,
  identity,
  context,
  groups,
  clientNavigation=false,
  supportQueue,
  staffNavigation=false,
}: {
  dashboardHref: string;
  identity: string;
  context: string;
  groups: WorkspaceNavGroup[];
  clientNavigation?:boolean;
  supportQueue?:SupportQueue;
  staffNavigation?:boolean;
}) {
  const t = useUiText();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const previousRoute = useRef(routeKey);
  const allItems = groups.flatMap((group) => group.items);
  const priority: WorkspaceNavIcon[] = staffNavigation ? ["support", "transport", "staff", "overview"] : ["overview", "businesses", "offerings", "pageEditor", "inquiries", "support"];
  const primaryItems = priority
    .map((icon) => allItems.find((item) => item.icon === icon && !item.external))
    .filter((item): item is WorkspaceNavItem => Boolean(item))
    .filter((item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index)
    .slice(0, 4);
  for (const item of staffNavigation ? [] : allItems) {
    if (primaryItems.length >= 4) break;
    if (!item.external && !primaryItems.some((candidate) => candidate.href === item.href)) primaryItems.push(item);
  }
  if (staffNavigation && primaryItems.length < 4) primaryItems.push({href:"/dashboard/account",label:"Account",icon:"account"});
  const primaryActiveHref = workspaceActiveHref(primaryItems, pathname, searchParams, supportQueue);
  const primaryContainsActive = Boolean(primaryActiveHref);

  useEffect(() => {
    if (previousRoute.current !== routeKey) setOpen(false);
    previousRoute.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select:not([disabled])') || []);
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const targets = focusable();
      if (!targets.length) return;
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <aside className="sidebar">
        <SuqpageBrand href={dashboardHref} className="workspace-brand" />
      <LanguageSelector />
        <div className="sidebar-identity"><strong>{identity}</strong><span>{context}</span></div>
        <NavigationGroups groups={groups} clientNavigation={clientNavigation} supportQueue={supportQueue}/>
      </aside>
      <header className="workspace-mobile-header">
        <SuqpageBrand href={dashboardHref} className="workspace-brand" />
        <LanguageSelector />
      </header>
      {!clientNavigation && <nav className="workspace-mobile-tabs" style={{gridTemplateColumns:`repeat(${primaryItems.length+1}, minmax(0, 1fr))`}} aria-label={t("Workspace application navigation")}>
        {primaryItems.map((item) => {
          const active = item.href === primaryActiveHref;
          return <Link key={`mobile-${item.href}-${t(item.label)}`} href={item.href} aria-current={active ? "page" : undefined} aria-label={t(item.label)}>
            <NavIcon name={item.icon} />
            <span>{t(mobileLabels[item.label] || item.label)}</span>
            <NavigationPendingIndicator label={t(item.label)} />
          </Link>;
        })}
        <button
          className="workspace-menu-button"
          type="button"
          aria-label={t("Open all workspace navigation")}
          aria-expanded={open}
          aria-controls="workspace-mobile-menu"
          data-active={open || !primaryContainsActive || undefined}
          onClick={() => setOpen(true)}
          ref={openerRef}
        >
          <Menu aria-hidden="true" size={22}/>
          <span>{t("More")}</span>
        </button>
      </nav>}
      {open ? (
        <div className="workspace-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className="workspace-drawer" id="workspace-mobile-menu" role="dialog" aria-modal="true" aria-label={t("Workspace menu")} ref={dialogRef}>
            <div className="workspace-drawer-head">
              <div className="sidebar-identity"><strong>{identity}</strong><span>{context}</span></div>
              <button className="workspace-menu-close" type="button" aria-label={t("Close workspace menu")} onClick={() => setOpen(false)}><X aria-hidden="true" size={22}/></button>
            </div>
            <LanguageSelector /><NavigationGroups groups={groups} onNavigate={() => setOpen(false)} supportQueue={supportQueue} />
          </div>
        </div>
      ) : null}
    </>
  );
}
