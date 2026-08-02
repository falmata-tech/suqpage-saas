import Link from "next/link";
import WorkspaceNavigation, { type WorkspaceNavGroup, type WorkspaceNavItem } from "@/components/WorkspaceNavigation";
import { hasCapability, isClient } from "@/lib/capabilities";
import { hasRetainedPublication } from "@/lib/db";
import type { Business, SessionUser } from "@/lib/types";

const group = (label: string, items: Array<WorkspaceNavItem | null>): WorkspaceNavGroup | null => {
  const visible = items.filter((item): item is WorkspaceNavItem => Boolean(item));
  return visible.length ? { label, items: visible } : null;
};

export default function DashboardShell({ user, business, children }: { user:SessionUser; business:Business|null; children:React.ReactNode }) {
  const query = business ? `?business=${business.id}` : "";
  const dashboardHref = `/dashboard${query}`;
  const client = isClient(user);
  const operations = hasCapability(user, "operations:manage");
  const platformAdmin = hasCapability(user, "platform:admin");
  const teamMember = user.access_role === "team_member";
  const established = business ? hasRetainedPublication(business.id) : false;
  const canMaintainProducts = Boolean(business && established && hasCapability(user, "basic-product:maintain"));
  const identityContext = business
    ? business.name
    : platformAdmin
      ? "Platform administration"
      : operations
        ? "Operations workspace"
        : teamMember
          ? "Assigned businesses"
          : "Private workspace";

  const groups = [
    group("Workspace", [
      { href: dashboardHref, label: business ? "Overview" : teamMember ? "Assigned businesses" : operations ? "Businesses" : "Overview" },
      operations && business ? { href: "/dashboard", label: "Switch business" } : null,
      canMaintainProducts ? { href: `/dashboard/products${query}`, label: "My offerings" } : null,
      client ? { href: "/dashboard/requests", label: "Requests" } : null,
      client && business ? { href: `/dashboard/inquiries${query}`, label: "Customer inquiries" } : null,
      client && business ? { href: "/dashboard/account-health", label: "Account & insights" } : null,
      client && business ? { href: `/preview/@${business.handle}`, label: "Preview / review" } : null,
      teamMember ? { href: "/dashboard/requests", label: "Assigned requests" } : null,
      teamMember && business ? { href: `/preview/@${business.handle}`, label: "View live showroom" } : null,
      { href: "/dashboard/support", label: client ? "MirtPage support" : "Support inbox" },
    ]),
    group("Client work", [
      operations ? { href: "/dashboard/requests", label: "Client requests" } : null,
      operations ? { href: "/dashboard/requests/on-behalf", label: "Create client request" } : null,
      operations ? { href: "/dashboard/clients/new", label: "Create client workspace" } : null,
      operations ? { href: `/dashboard/account-health${query}`, label: business ? "Account & insights" : "Monthly accounts" } : null,
      operations && business ? { href: `/dashboard/inquiries${query}`, label: "Customer inquiries" } : null,
      operations && business ? { href: `/preview/@${business.handle}`, label: "View showroom", external: true } : null,
    ]),
    group("Design tools", [
      hasCapability(user, "design-bank:view") ? { href: "/dashboard/design-bank", label: "Design library" } : null,
    ]),
    group("Administration", [
      platformAdmin ? { href: "/dashboard/admin", label: "Platform administration" } : null,
      platformAdmin ? { href: "/dashboard/admin/discovery", label: "Discovery profiles" } : null,
    ]),
  ].filter((item): item is WorkspaceNavGroup => Boolean(item));

  return <div className="dashboard">
    <WorkspaceNavigation dashboardHref={dashboardHref} identity={user.name} context={identityContext} groups={groups} />
    <main className="main">{user.must_change_password ? <div className="error temporary-password">Your password is temporary. <Link href="/dashboard/account?required=1">Change it now.</Link></div> : null}{children}</main>
  </div>;
}
