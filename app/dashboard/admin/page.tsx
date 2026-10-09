
import { getUiText } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Truck,
  ArrowRight,
  Headphones,
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
  const t = await getUiText();
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
      label: t("Businesses"),
      value: counts.businesses,
      detail: `${attention.newAccounts || 0} draft account${attention.newAccounts === 1 ? "" : "s"} being set up`,
      icon: Building2,
    },
    {
      href: "/dashboard/support?queue=support",
      label: t("Business support"),
      value: null,
      detail: t("Questions from business owners"),
      icon: Headphones,
    },
    {
      href: "/dashboard/support?queue=transport",
      label: t("Transport"),
      value: null,
      detail: t("Transport requests from customers"),
      icon: Truck,
    },
    {
      href: "/dashboard/admin/staff",
      label: t("Staff"),
      value: counts.staff,
      detail: "Individual roles and sign-in readiness",
      icon: UserCog,
    },
    {
      href: "/dashboard/admin/featured-schedule",
      label: t("Featured schedule"),
      value: "Daily",
      detail: "Automatic timing and date-specific lineups",
      icon: CalendarClock,
    },

  ];

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head admin-overview-head">
        <div>
          <span className="eyebrow">{t("Platform overview")}</span>
          <h1>{t("Suqpage administration")}</h1>
        </div>
        <Link className="btn brand" href="/dashboard/clients/new">{t("Add business")}</Link>
      </div>
      <section className="admin-command-grid" aria-label={t("Platform work areas")}>
        {destinations.map(({ icon: Icon, ...destination }) => (
          <Link className="admin-command" href={destination.href} key={destination.href}>
            <Icon aria-hidden="true" size={20}/>
            <span><strong>{destination.label}</strong><small>{destination.detail}</small></span>
            <b>{destination.value===null?<ArrowRight aria-hidden="true" size={19}/>:destination.value}</b>
          </Link>
        ))}
      </section>
      <section className="admin-quick-actions" aria-labelledby="admin-quick-title">
        <div><span className="eyebrow">{t("Common actions")}</span><h2 id="admin-quick-title">{t("Keep work moving")}</h2></div>
        <div>
          <Link className="small-btn" href="/dashboard/admin/businesses">{t("Manage businesses")}</Link>
          <Link className="small-btn" href="/dashboard/support/agents">{t("Workload & availability")}</Link>
        </div>
      </section>
    </DashboardShell>
  );
}
