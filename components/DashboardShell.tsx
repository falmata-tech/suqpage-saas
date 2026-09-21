import Link from "next/link";
import { NavigationPendingMain, NavigationPendingProvider } from "@/components/NavigationPendingIndicator";
import WorkspaceNavigation, { type WorkspaceNavGroup, type WorkspaceNavItem } from "@/components/WorkspaceNavigation";
import { hasCapability, isClient } from "@/lib/capabilities";
import { authDriver } from "@/lib/config";
import type { Business, SessionUser } from "@/lib/types";
import { ownerPageEditorEnabled, ownerPagePort } from "@/lib/owner-page-runtime";
import { readOwnerPage } from "@/lib/owner-page-service";
import { OwnerPageError } from "@/lib/owner-page-domain";

const group = (label: string, items: Array<WorkspaceNavItem | null>): WorkspaceNavGroup | null => {
  const visible = items.filter((item): item is WorkspaceNavItem => Boolean(item));
  return visible.length ? { label, items: visible } : null;
};

export default async function DashboardShell({ user, business, children }: { user:SessionUser; business:Business|null; children:React.ReactNode }) {
  const query = business ? `?business=${business.id}` : "";
  const client = isClient(user);
  const operations = hasCapability(user, "operations:manage");
  const platformAdmin = hasCapability(user, "platform:admin");
  const teamMember = user.access_role === "team_member";
  const canMaintainProducts = Boolean(business && hasCapability(user, "basic-product:maintain"));
  let pageEditor = false;
  if (business && ownerPageEditorEnabled()) {
    try { await readOwnerPage(ownerPagePort, user, business.id); pageEditor = true; }
    catch (error) { if (!(error instanceof OwnerPageError && error.status === 403)) throw error; }
  }
  const dashboardHref = platformAdmin && !business ? "/dashboard/admin" : `/dashboard${query}`;
  const identityContext = business
    ? business.name
    : platformAdmin
      ? "Platform administration"
      : operations
        ? "Operations workspace"
        : teamMember
          ? "Assigned businesses"
          : "Private workspace";

  const globalGroups = platformAdmin && !business ? [
    group("Platform", [
      { href: "/dashboard/admin", label: "Overview", icon: "overview" },
      { href: "/dashboard/admin/businesses", label: "Businesses", icon: "businesses" },
      { href: "/dashboard/clients/new", label: "Add business", icon: "businesses" },
      { href: "/dashboard/admin/discovery", label: "Marketplace", icon: "discovery" },
      { href: "/dashboard/admin/staff", label: "Staff & access", icon: "staff" },
    ]),
    group("Operations", [
      { href: "/dashboard/support", label: "Support inbox", icon: "support" },
      { href: "/dashboard/support/agents", label: "Support agents", icon: "supportAgents" },
      { href: "/dashboard/account-health", label: "Renewals", icon: "renewal" },
    ]),
    group("Page system", [
      { href: "/dashboard/admin/featured-schedule", label: "Featured schedule", icon: "schedule" },
      { href: "/dashboard/admin/sponsors", label: "Sponsor placements", icon: "discovery" },
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item)) : null;
  const focusedStaffGroups = business && (operations || teamMember) ? [
    group("Business workspace", [
      { href: dashboardHref, label: "Overview", icon: "overview" },
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
      operations ? { href: `/dashboard/account-health${query}`, label: "Renewal", icon: "renewal" } : null,
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
      !client && operations && business ? { href: `/dashboard/account-health${operations ? query : ""}`, label: "Renewal", icon: "renewal" } : null,
      (teamMember || operations) && business ? { href: `/preview/@${business.handle}`, label: "View page", icon: "public", external: true } : null,
      { href: "/dashboard/support", label: client ? "Suqpage support" : "Support inbox", icon: "support" },
    ]),
    group("Customer operations", [
      operations ? { href: "/dashboard/clients/new", label: "Add business", icon: "businesses" } : null,
      operations ? { href: "/dashboard/support/agents", label: "Support agents", icon: "supportAgents" } : null,
      operations && !business ? { href: "/dashboard/account-health", label: "Renewals", icon: "renewal" } : null,
    ]),
    group("Page", [
    ]),
    group("Platform", [
      platformAdmin ? { href: "/dashboard/admin", label: "Platform overview", icon: "overview" } : null,
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item));
  const groups = globalGroups || focusedStaffGroups || standardGroups;

  return <NavigationPendingProvider><div className="dashboard">
    <WorkspaceNavigation dashboardHref={dashboardHref} identity={user.name} context={identityContext} groups={groups} />
    <NavigationPendingMain className="main">{authDriver() === "local" && user.must_change_password ? <div className="error temporary-password">Your password is temporary. <Link href="/dashboard/account?required=1">Change it now.</Link></div> : null}{children}</NavigationPendingMain>
  </div></NavigationPendingProvider>;
}
