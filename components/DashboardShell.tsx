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
import BusinessWorkspaceNavigation, {type BusinessWorkspaceLink} from './BusinessWorkspaceNavigation';
import {canUseStaffTracking} from '@/app/dashboard/tracking/navigation';

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
  const tracking=canUseStaffTracking(user);
  const canMaintainProducts = Boolean(business && hasCapability(user, "basic-product:maintain"));
  let pageEditor = false;
  if (business && ownerPageEditorEnabled()) {
    try { await readOwnerPage(ownerPagePort, user, business.id); pageEditor = true; }
    catch (error) { if (!(error instanceof OwnerPageError && error.status === 403)) throw error; }
  }
  const dashboardHref = client ? "/dashboard/profile" : queueAgent ? `/dashboard/support?queue=${user.staff_queue_scope}` : platformAdmin ? "/dashboard/admin" : `/dashboard${query}`;
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
      { href: "/dashboard/support?queue=transport", label: "Transport", icon: "transport" },
    ]),
    group("Administration", [
      { href: "/dashboard/admin", label: "Overview", icon: "overview" },
      { href: "/dashboard/admin/businesses", label: "Businesses", icon: "businesses", activePaths:['/dashboard','/dashboard/products','/dashboard/settings','/dashboard/access','/dashboard/page-editor','/dashboard/catalog','/dashboard/admin/discovery',...(business?['/dashboard/admin/sponsors']:[])] },
      { href: "/dashboard/tracking", label: "Tracking", icon: "tracking" },
      { href: "/dashboard/admin/staff", label: "Staff", icon: "staff", activePaths:["/dashboard/support/agents"] },
      { href: "/dashboard/reports", label: "Listing reports", icon: "reports" },
    ]),
    group("Featured", [
      { href: "/dashboard/admin/featured-schedule", label: "Featured schedule", icon: "schedule" },
      { href: "/dashboard/admin/sponsors", label: "Sponsor placements", icon: "discovery" },
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item)) : null;
  const clientGroups = [
    group('Your business',[
      {href:'/dashboard/profile',label:'Account',icon:'account'},
      {href:'/dashboard/profile/showroom',label:'Your page',icon:'pageEditor',activePaths:['/dashboard/page-editor','/dashboard/profile/cover','/dashboard/profile/handle']},
      {href:'/dashboard/products',label:'Products',icon:'offerings',activePaths:['/dashboard/catalog']},
      {href:'/dashboard/transport',label:'Transport chat',icon:'transport'},
      {href:'/dashboard/support',label:'Support',icon:'support'},
    ]),
    group('Settings',[
      {href:'/dashboard/business',label:'Business details',icon:'businesses'},
      {href:'/dashboard/account',label:'Account settings',icon:'account'},
    ]),
    group('Explore',[
      {href:'/',label:'Market',icon:'discovery'},
      {href:'/featured',label:'Featured',icon:'schedule'},
      {href:'/about',label:'About',icon:'library'},
    ]),
  ].filter((item):item is WorkspaceNavGroup=>Boolean(item));
  const agentGroups = [group("Chats",[{href:dashboardHref,label:user.staff_queue_scope === "transport" ? "Transport" : "Business support",icon:user.staff_queue_scope === "transport" ? "transport" : "support"},...(user.staff_queue_scope==='support'?[{href:'/dashboard/reports',label:'Listing reports',icon:'reports' as const}]:[])]),tracking?group('Workspace',[{href:'/dashboard/tracking',label:'Tracking',icon:'tracking'}]):null].filter((item): item is WorkspaceNavGroup => Boolean(item));
  const operationsGroups = operations && !platformAdmin ? [group("Chats",[
    {href:"/dashboard/support?queue=support",label:"Business support",icon:"support"},
    {href:'/dashboard/reports',label:'Listing reports',icon:'reports'},
    {href:"/dashboard/support?queue=transport",label:"Transport",icon:"transport"},
    {href:"/dashboard/support/agents",label:"Workload & availability",icon:"staff"},
  ])].filter((item): item is WorkspaceNavGroup => Boolean(item)) : [];
  const staffHomeGroups=[group("Workspace",[
    {href:'/dashboard',label:teamMember?'Assigned businesses':'Business workspaces',icon:'businesses'},
    tracking?{href:'/dashboard/tracking',label:'Tracking',icon:'tracking'}:null,
    !operations?{href:'/dashboard/support',label:'Support inbox',icon:'support'}:null,
  ])].filter((entry):entry is WorkspaceNavGroup=>Boolean(entry));
  const groups = client ? clientGroups : queueAgent ? agentGroups : globalGroups || [...operationsGroups,...staffHomeGroups];
  const businessLinks:BusinessWorkspaceLink[]=business&&!client&&!queueAgent?[
    {href:`/dashboard${query}`,label:t('Overview')},
    ...(pageEditor?[{href:`/dashboard/page-editor${query}&view=preview`,label:t('Your page')}]:[]),
    ...(canMaintainProducts?[{href:`/dashboard/products${query}`,label:t('Products'),activePaths:['/dashboard/catalog']}]:[]),
    ...(platformAdmin?[
      {href:`/dashboard/settings${query}`,label:t('Business details')},
      {href:`/dashboard/admin/discovery/${business.id}`,label:t('Location & visibility'),activePaths:['/dashboard/admin/sponsors']},
      {href:`/dashboard/access${query}`,label:t('Access'),activePaths:[`/dashboard/admin/businesses/${business.id}/team`]},
    ]:[]),
  ]:[];

  return <NavigationPendingProvider><div className="dashboard">
    <WorkspaceNavigation dashboardHref={dashboardHref} identity={user.name} context={business ? identityContext : t(identityContext)} groups={groups} clientNavigation={client} staffNavigation={operations||queueAgent} supportQueue={supportQueue}/>
    <NavigationPendingMain className="main"><div className={attentionStyles.bar}><AttentionAlerts identity={'user-'+user.id}/></div>{authDriver() === "local" && user.must_change_password ? <div className="error temporary-password">{t("Your password is temporary.")}{" "}<Link href="/dashboard/account?required=1">{t("Change it now.")}</Link></div> : null}{business&&businessLinks.length>0?<BusinessWorkspaceNavigation name={business.name} handle={business.handle} actorId={user.id} businessId={business.id} parentHref={platformAdmin?'/dashboard/admin/businesses':'/dashboard'} parentLabel={t('Switch business')} label={t('Business workspace')} links={businessLinks}/>:null}{children}</NavigationPendingMain>
  {client && <PublicMobileNavigation signedIn dashboardHref="/dashboard/profile"/>}</div></NavigationPendingProvider>;
}
