import Link from "next/link";
import WorkspaceNavigation, { type WorkspaceNavGroup, type WorkspaceNavItem } from "@/components/WorkspaceNavigation";
import { hasCapability, isClient } from "@/lib/capabilities";
import { hasRetainedPublication } from "@/lib/db";
import { hasClientReviewableRevision } from "@/lib/dashboard";
import type { Business, SessionUser } from "@/lib/types";

const group = (label: string, items: Array<WorkspaceNavItem | null>): WorkspaceNavGroup | null => {
  const visible = items.filter((item): item is WorkspaceNavItem => Boolean(item));
  return visible.length ? { label, items: visible } : null;
};

export default function DashboardShell({ user, business, children }: { user:SessionUser; business:Business|null; children:React.ReactNode }) {
  const query = business ? `?business=${business.id}` : "";
  const client = isClient(user);
  const operations = hasCapability(user, "operations:manage");
  const platformAdmin = hasCapability(user, "platform:admin");
  const teamMember = user.access_role === "team_member";
  const established = business ? hasRetainedPublication(business.id) : false;
  const canMaintainProducts = Boolean(business && established && hasCapability(user, "basic-product:maintain"));
  const reviewable = Boolean(client && business && hasClientReviewableRevision(user.id, business.id));
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

  const groups = platformAdmin && !business ? [
    group("Platform", [
      { href: "/dashboard/admin", label: "Overview", icon: "overview" },
      { href: "/dashboard/admin/businesses", label: "Businesses", icon: "businesses" },
      { href: "/dashboard/admin/clients", label: "Clients", icon: "clients" },
      { href: "/dashboard/admin/staff", label: "Staff & access", icon: "staff" },
    ]),
    group("Operations", [
      { href: "/dashboard/requests", label: "Showroom requests", icon: "requests" },
      { href: "/dashboard/support", label: "Support inbox", icon: "support" },
      { href: "/dashboard/support/agents", label: "Support agents", icon: "supportAgents" },
      { href: "/dashboard/account-health", label: "Monthly accounts", icon: "account" },
    ]),
    group("Showroom system", [
      { href: "/dashboard/admin/discovery", label: "Discovery profiles", icon: "discovery" },
      { href: "/dashboard/design-bank", label: "Design library", icon: "design" },
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item)) : [
    group("Workspace", [
      { href: dashboardHref, label: business ? "Overview" : teamMember ? "Assigned businesses" : "Business workspaces", icon: "overview" },
      operations && business ? { href: "/dashboard", label: "Switch business", icon: "switch" } : null,
      canMaintainProducts ? { href: `/dashboard/products${query}`, label: client ? "My offerings" : "Offerings", icon: "offerings" } : null,
      client ? { href: "/dashboard/requests", label: "Requests", icon: "requests" } : null,
      teamMember ? { href: "/dashboard/requests", label: "Assigned requests", icon: "requests" } : null,
      operations ? { href: "/dashboard/requests", label: "Showroom requests", icon: "requests" } : null,
      (client || operations) && business ? { href: `/dashboard/inquiries${query}`, label: "Customer inquiries", icon: "inquiries" } : null,
      (client || operations) && business ? { href: `/dashboard/account-health${operations ? query : ""}`, label: "Account & insights", icon: "insights" } : null,
      reviewable ? { href: `/preview/@${business!.handle}`, label: "Review showroom", icon: "workspace" } : null,
      (teamMember || operations) && business ? { href: `/preview/@${business.handle}`, label: "View showroom", icon: "public", external: true } : null,
      { href: "/dashboard/support", label: client ? "MirtPage support" : "Support inbox", icon: "support" },
    ]),
    group("Customer operations", [
      operations ? { href: "/dashboard/clients/new", label: "Create client workspace", icon: "clients" } : null,
      operations ? { href: "/dashboard/requests/on-behalf", label: "Create client request", icon: "requests" } : null,
      operations ? { href: "/dashboard/support/agents", label: "Support agents", icon: "supportAgents" } : null,
      operations && !business ? { href: "/dashboard/account-health", label: "Monthly accounts", icon: "account" } : null,
    ]),
    group("Design", [
      hasCapability(user, "design-bank:view") ? { href: "/dashboard/design-bank", label: "Design library", icon: "design" } : null,
    ]),
    group("Platform", [
      platformAdmin ? { href: "/dashboard/admin", label: "Platform overview", icon: "overview" } : null,
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item));

  return <div className="dashboard">
    <WorkspaceNavigation dashboardHref={dashboardHref} identity={user.name} context={identityContext} groups={groups} />
    <main className="main">{user.must_change_password ? <div className="error temporary-password">Your password is temporary. <Link href="/dashboard/account?required=1">Change it now.</Link></div> : null}{children}</main>
  </div>;
}
