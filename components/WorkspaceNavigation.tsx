"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/actions";
import MirtPageBrand from "@/components/MirtPageBrand";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  external?: boolean;
};

export type WorkspaceNavGroup = {
  label: string;
  items: WorkspaceNavItem[];
};

function NavigationGroups({ groups, onNavigate }: { groups: WorkspaceNavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeHref = groups
    .flatMap((group) => group.items)
    .filter((item) => {
      const [path, query = ""] = item.href.split("?");
      if (path === "/dashboard" && pathname === path) {
        return new URLSearchParams(query).get("business") === searchParams.get("business");
      }
      return pathname === path || pathname.startsWith(`${path}/`);
    })
    .sort((left, right) => right.href.split("?")[0].length - left.href.split("?")[0].length)[0]?.href;
  return (
    <nav className="workspace-nav" aria-label="Workspace">
      {groups.map((group) => (
        <div className="workspace-nav-group" key={group.label}>
          <span className="workspace-nav-label">{group.label}</span>
          {group.items.map((item) => {
            const path = item.href.split("?")[0];
            const active = item.href === activeHref;
            return (
              <Link
                href={item.href}
                key={`${group.label}-${item.href}-${item.label}`}
                aria-current={active ? "page" : undefined}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                onClick={onNavigate}
              >
                {item.label}{item.external ? <span aria-hidden="true"> ↗</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="workspace-nav-group workspace-nav-utility">
        <span className="workspace-nav-label">Account</span>
        <Link href="/dashboard/account" aria-current={pathname === "/dashboard/account" ? "page" : undefined} onClick={onNavigate}>Account security</Link>
        <Link href="/" target="_blank" rel="noreferrer" onClick={onNavigate}>Public site <span aria-hidden="true">↗</span></Link>
        <form action={logoutAction}><button type="submit">Sign out</button></form>
      </div>
    </nav>
  );
}

export default function WorkspaceNavigation({
  dashboardHref,
  identity,
  context,
  groups,
}: {
  dashboardHref: string;
  identity: string;
  context: string;
  groups: WorkspaceNavGroup[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const previousRoute = useRef(routeKey);

  useEffect(() => {
    if (previousRoute.current !== routeKey) setOpen(false);
    previousRoute.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []);
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
        <MirtPageBrand href={dashboardHref} className="workspace-brand" />
        <div className="sidebar-identity"><strong>{identity}</strong><span>{context}</span></div>
        <NavigationGroups groups={groups} />
      </aside>
      <header className="workspace-mobile-header">
        <MirtPageBrand href={dashboardHref} className="workspace-brand" />
        <button
          className="workspace-menu-button"
          type="button"
          aria-label="Open workspace menu"
          aria-expanded={open}
          aria-controls="workspace-mobile-menu"
          onClick={() => setOpen(true)}
          ref={openerRef}
        >
          <span /><span /><span />
        </button>
      </header>
      {open ? (
        <div className="workspace-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className="workspace-drawer" id="workspace-mobile-menu" role="dialog" aria-modal="true" aria-label="Workspace menu" ref={dialogRef}>
            <div className="workspace-drawer-head">
              <div className="sidebar-identity"><strong>{identity}</strong><span>{context}</span></div>
              <button className="workspace-menu-close" type="button" aria-label="Close workspace menu" onClick={() => setOpen(false)}>×</button>
            </div>
            <NavigationGroups groups={groups} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
