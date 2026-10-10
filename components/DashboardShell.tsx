import PublicMobileNavigation from "@/components/PublicMobileNavigation";

import { getUiText } from "@/lib/i18n/server";
import Link from "next/link";
import { NavigationPendingMain, NavigationPendingProvider } from "@/components/NavigationPendingIndicator";
import WorkspaceNavigation, { type WorkspaceNavGroup, type WorkspaceNavItem } from "@/components/WorkspaceNavigation";
import { hasCapability, isClient, isQueueAgent } from "@/lib/capabilities";
import { authDriver } from "@/lib/config";
import type { Business, SessionUser } from "@/lib/types";
import { ownerPageEditorEnabled, ownerPagePort } from "@/lib/owner-page-runtime";
import { readOwnerPage } from "@/lib/owner-page-service";
import { OwnerPageError } from "@/lib/owner-page-domain";
import AttentionAlerts from './AttentionAlerts';
import attentionStyles from './AttentionAlerts.module.css';
import type { SupportQueue } from '@/lib/support-navigation';

const group = (label: string, items: Array<WorkspaceNavItem | null>): WorkspaceNavGroup | null => {
  const visible = items.filter((item): item is WorkspaceNavItem => Boolean(item));
  return visible.length ? { label, items: visible } : null;
};

export default async function DashboardShell({ user, business, children, supportQueue }: { user:SessionUser; business:Business|null; children:React.ReactNode; supportQueue?:SupportQueue }) {
  const t = await getUiText();
  const query = business ? `?business=${business.id}` : "";
  const client = isClient(user);
  const operations = hasCapability(user, "operations:manage");
  const platformAdmin = hasCapability(user, "platform:admin");
  const teamMember = user.access_role === "team_member";
  const queueAgent = isQueueAgent(user);
  const canMaintainProducts = Boolean(business && hasCapability(user, "basic-product:maintain"));
  let pageEditor = false;
  if (business && ownerPageEditorEnabled()) {
    try { await readOwnerPage(ownerPagePort, user, business.id); pageEditor = true; }
    catch (error) { if (!(error instanceof OwnerPageError && error.status === 403)) throw error; }
  }
  const dashboardHref = queueAgent ? `/dashboard/support?queue=${user.staff_queue_scope}` : platformAdmin ? "/dashboard/admin" : `/dashboard${query}`;
  const identityContext = business
    ? business.name
    : queueAgent ? user.staff_queue_scope === "transport" ? "Transport agent" : "Support agent"
    : platformAdmin
      ? "Platform administration"
      : operations
        ? "Operations workspace"
        : teamMember
          ? "Assigned businesses"
          : "Private workspace";

  const globalGroups = platformAdmin ? [
    group("Chats", [
      { href: "/dashboard/support?queue=support", label: "Business support", icon: "support" },
      { href: "/dashboard/reports", label: "Listing reports", icon: "reports" },
      { href: "/dashboard/support?queue=transport", label: "Transport", icon: "transport" },
      { href: "/dashboard/admin/staff", label: "Staff", icon: "staff", activePaths:["/dashboard/support/agents"] },
    ]),
    group("Administration", [
      { href: "/dashboard/admin", label: "Overview", icon: "overview" },
      { href: "/dashboard/admin/businesses", label: "Businesses", icon: "businesses" },
      { href: "/dashboard/admin/discovery", label: "Marketplace", icon: "discovery" },
    ]),
    group("Featured", [
      { href: "/dashboard/admin/featured-schedule", label: "Featured schedule", icon: "schedule" },
      { href: "/dashboard/admin/sponsors", label: "Sponsor placements", icon: "discovery" },
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item)) : null;
  const focusedStaffGroups = business && (operations || teamMember) ? [
    group("Business workspace", [
      { href: `/dashboard${query}`, label: "Business workspace", icon: "workspace" },
      platformAdmin ? { href: `/dashboard/settings${query}`, label: "Business details", icon: "settings" } : null,
      pageEditor ? { href: `/dashboard/page-editor${query}`, label: "Page draft", icon: "pageEditor" } : null,
      client ? { href: "/dashboard/business", label: "Business details", icon: "settings" } : null,
      canMaintainProducts ? { href: `/dashboard/products${query}`, label: "Products & services", icon: "offerings" } : null,
      !client && canMaintainProducts ? { href: `/dashboard/catalog${query}`, label: "Categories", icon: "offerings" } : null,
      platformAdmin ? { href: `/dashboard/admin/businesses/${business!.id}/team`, label: "Staff assistance", icon: "staff" } : null,
      { href: `/preview/@${business.handle}`, label: "View page", icon: "public", external: true },
    ]),
    group("Customers & discovery", [
      platformAdmin ? { href: `/dashboard/admin/discovery/${business.id}`, label: "Marketplace", icon: "discovery" } : null,
      operations ? { href: `/dashboard/inquiries${query}`, label: "Customer inquiries", icon: "inquiries" } : null,
    ]),
    group("Business administration", [
    ]),
    group("Leave business workspace", [
      { href: platformAdmin ? "/dashboard/admin/businesses" : "/dashboard", label: "Switch business", icon: "switch" },
      platformAdmin ? { href: "/dashboard/admin", label: "Platform overview", icon: "overview" } : null,
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item)) : null;
  const standardGroups = [
    group(business ? "Business workspace" : "Workspace", [
      { href: dashboardHref, label: business ? "Overview" : teamMember ? "Assigned businesses" : "Business workspaces", icon: "overview" },
      operations && business ? { href: "/dashboard", label: "Switch business", icon: "switch" } : null,
      client ? { href: "/dashboard/business", label: "Business details", icon: "settings" } : null,
      canMaintainProducts ? { href: `/dashboard/products${query}`, label: "Products & services", icon: "offerings" } : null,
      pageEditor ? { href: `/dashboard/page-editor${query}`, label: "Your page", icon: "pageEditor" } : null,
      !client && canMaintainProducts ? { href: `/dashboard/catalog${query}`, label: "Categories", icon: "offerings" } : null,
      (client || operations) && business ? { href: `/dashboard/inquiries${query}`, label: "Customer inquiries", icon: "inquiries" } : null,
      (teamMember || operations) && business ? { href: `/preview/@${business.handle}`, label: "View page", icon: "public", external: true } : null,
      { href: "/dashboard/support", label: client ? "Suqpage support" : "Support inbox", icon: "support" },
    ]),
    group("Customer operations", [
      operations ? { href: "/dashboard/clients/new", label: "Add business", icon: "businesses" } : null,
      operations ? { href: "/dashboard/support/agents", label: "Support agents", icon: "supportAgents" } : null,
    ]),
    group("Page", [
    ]),
    group("Platform", [
      platformAdmin ? { href: "/dashboard/admin", label: "Platform overview", icon: "overview" } : null,
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item));
  const clientGroups = [group("Your business", [
    {href:"/",label:"Market",icon:"discovery"},
    {href:"/featured",label:"Featured",icon:"schedule"},
    {href:"/dashboard/inquiries",label:"Inquiries",icon:"inquiries"},
    {href:"/dashboard/profile",label:"Account",icon:"account"},

  ])].filter((item): item is WorkspaceNavGroup => Boolean(item));
  const agentGroups = [group("Chats",[{href:dashboardHref,label:user.staff_queue_scope === "transport" ? "Transport" : "Business support",icon:user.staff_queue_scope === "transport" ? "transport" : "support"},...(user.staff_queue_scope==='support'?[{href:'/dashboard/reports',label:'Listing reports',icon:'reports' as const}]:[])])].filter((item): item is WorkspaceNavGroup => Boolean(item));
  const operationsGroups = operations && !platformAdmin ? [group("Chats",[
    {href:"/dashboard/support?queue=support",label:"Business support",icon:"support"},
    {href:'/dashboard/reports',label:'Listing reports',icon:'reports'},
    {href:"/dashboard/support?queue=transport",label:"Transport",icon:"transport"},
    {href:"/dashboard/support/agents",label:"Workload & availability",icon:"staff"},
  ])].filter((item): item is WorkspaceNavGroup => Boolean(item)) : [];
  const groups = client ? clientGroups : queueAgent ? agentGroups : globalGroups ? [...globalGroups,...(focusedStaffGroups?.slice(0,2)||[])] : operations ? [...operationsGroups,...(focusedStaffGroups||standardGroups).map(entry=>({...entry,items:entry.items.filter(item=>!item.href.startsWith('/dashboard/support'))})).filter(entry=>entry.items.length)] : focusedStaffGroups || standardGroups;

  return <NavigationPendingProvider><div className="dashboard">
    <WorkspaceNavigation dashboardHref={dashboardHref} identity={user.name} context={business ? identityContext : t(identityContext)} groups={groups} clientNavigation={client} staffNavigation={operations||queueAgent} supportQueue={supportQueue}/>
    <NavigationPendingMain className="main"><div className={attentionStyles.bar}><AttentionAlerts identity={'user-'+user.id}/></div>{authDriver() === "local" && user.must_change_password ? <div className="error temporary-password">{t("Your password is temporary.")}{" "}<Link href="/dashboard/account?required=1">{t("Change it now.")}</Link></div> : null}{children}</NavigationPendingMain>
  {client && <PublicMobileNavigation signedIn/>}</div></NavigationPendingProvider>;
}
