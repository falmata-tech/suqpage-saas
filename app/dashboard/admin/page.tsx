import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  ClipboardList,
  Headphones,
  Palette,
  UserCog,
  CalendarClock,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getDashboardAttention } from "@/lib/dashboard-attention";
import { getPlatformCounts } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function AdminOverview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  if (["businesses", "clients", "discovery", "staff"].includes(query.view || "")) {
    const destination = query.view === "clients" || query.view === "discovery" ? "/dashboard/admin/businesses" : `/dashboard/admin/${query.view}`;
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (key !== "view" && value) next.set(key, value);
    }
    redirect(`${destination}${next.size ? `?${next}` : ""}`);
  }

  const counts = await getPlatformCounts();
  const attention = await getDashboardAttention(user);
  const destinations = [
    {
      href: "/dashboard/admin/businesses",
      label: "Businesses",
      value: counts.businesses,
      detail: `${attention.newAccounts || 0} draft account${attention.newAccounts === 1 ? "" : "s"} need review`,
      icon: Building2,
    },
    {
      href: "/dashboard/requests",
      label: "Showroom requests",
      value: attention.showroomRequests,
      detail: `${counts.open_requests} open across the managed workflow`,
      icon: ClipboardList,
    },
    {
      href: "/dashboard/support",
      label: "Support inbox",
      value: attention.supportReplies,
      detail: "Waiting or unread conversations",
      icon: Headphones,
    },
    {
      href: "/dashboard/admin/staff",
      label: "Staff & access",
      value: counts.staff,
      detail: "Individual roles and sign-in readiness",
      icon: UserCog,
    },
    {
      href: "/dashboard/admin/featured-schedule",
      label: "Featured schedule",
      value: "Daily",
      detail: "Automatic timing and date-specific lineups",
      icon: CalendarClock,
    },
    {
      href: "/dashboard/account-health",
      label: "Renewals",
      value: "Open",
      detail: "Manual service periods and renewal records",
      icon: CalendarClock,
    },
    {
      href: "/dashboard/design-bank",
      label: "Design library",
      value: "67",
      detail: "Approved showroom components and patterns",
      icon: Palette,
    },
  ];

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head admin-overview-head">
        <div>
          <span className="eyebrow">Platform overview</span>
          <h1>Good afternoon.</h1>
          <p>Start with work that needs a decision, then move into the relevant queue.</p>
        </div>
        <Link className="btn brand" href="/dashboard/clients/new">Add business</Link>
      </div>
      <section className="admin-command-grid" aria-label="Platform work areas">
        {destinations.map(({ icon: Icon, ...destination }) => (
          <Link className="admin-command" href={destination.href} key={destination.href}>
            <Icon aria-hidden="true" size={20}/>
            <span><strong>{destination.label}</strong><small>{destination.detail}</small></span>
            <b>{destination.value}</b>
          </Link>
        ))}
      </section>
      <section className="admin-quick-actions" aria-labelledby="admin-quick-title">
        <div><span className="eyebrow">Common actions</span><h2 id="admin-quick-title">Keep work moving</h2></div>
        <div>
          <Link className="small-btn" href="/dashboard/requests/on-behalf">Record a request</Link>
          <Link className="small-btn" href="/dashboard/support/agents">Manage support capacity</Link>
          <Link className="small-btn" href="/dashboard/account-health">Review monthly accounts</Link>
        </div>
      </section>
    </DashboardShell>
  );
}
