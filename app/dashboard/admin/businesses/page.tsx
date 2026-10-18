
import { getUiText } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { listBusinessesPage } from "@/lib/scalable-queries";
import {businessListOriginParams} from '@/lib/business-workspace-navigation';

export const dynamic = "force-dynamic";

export default async function AdminBusinesses({ searchParams }: {
  searchParams: Promise<{ error?:string; saved?:string; page?:string; q?:string; status?:string; location?:string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const businesses = await listBusinessesPage({...query, location:undefined});
  const origin=businessListOriginParams(query);
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label={t("Breadcrumb")}><Link href="/dashboard/admin">{t("Platform overview")}</Link><span>/</span><strong>{t("Businesses")}</strong></nav>
    <div className="dashboard-head standard-page-heading"><div><h1>{t("Businesses")}</h1><p>{t("Open a business to manage its page, products and customer activity.")}</p></div><Link className="btn brand" href="/dashboard/clients/new">{t("Add business")}</Link></div>
    {query.error ? <p className="error">{t(query.error)}</p> : null}
    {query.saved ? <p className="notice">{t("Business status saved.")}</p> : null}
    <CollectionToolbar action="/dashboard/admin/businesses" search={query.q || ""} placeholder={t("Business, handle, or client email")} activeFilters={Boolean(query.q || query.status || query.location)}>
      <label><span>{t("Status")}</span><select name="status" defaultValue={query.status || ""}><option value="">{t("All statuses")}</option><option value="active">{t("active")}</option><option value="draft">{t("draft")}</option><option value="suspended">{t("suspended")}</option></select></label>

    </CollectionToolbar>
    {businesses.items.length ? <>
      <div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr><th>{t("Business")}</th><th>{t("Access")}</th><th>{t("Marketplace")}</th><th>{t("Page")}</th><th><span className="sr-only">{t("Workspace")}</span></th></tr></thead><tbody>{businesses.items.map((business)=><tr key={business.id}>
        <td data-label={t("Business")}><strong>{business.name}</strong><br/><small>@{business.handle}</small></td>
        <td data-label={t("Access")}>{business.client_email ? <><strong>{business.client_name}</strong><br/><small>{business.client_email}{business.client_count > 1 ? t(" · {value1} users", { value1: business.client_count }) : ""}</small></> : <span className="muted">{t("Invitation pending")}</span>}</td>
        <td data-label={t("Marketplace")}><span className={`badge ${business.marketplace_excluded ? "cancelled" : business.marketplace_approved_at ? "active" : "limited"}`}>{business.marketplace_excluded ? t("hidden") : business.marketplace_approved_at ? t("visible") : t("setup needed")}</span>{business.marketplace_city || business.marketplace_region ? <><br/><small>{[business.marketplace_city,business.marketplace_region].filter(Boolean).join(", ")}</small></> : null}</td>

        <td data-label={t("Page")}><span className={`badge ${business.status}`}>{t(business.status)}</span></td>
        <td data-label={t("Workspace")}><Link className="small-btn" href={`/dashboard?business=${business.id}${origin?'&'+origin:''}`}>{t("Open workspace")}</Link></td>
      </tr>)}</tbody></table></div>
      <PaginationNav result={businesses} pathname="/dashboard/admin/businesses" params={{q:query.q,status:query.status,location:query.location}}/>
    </> : <div className="empty-state">{t("No businesses match this view.")}</div>}
  </DashboardShell>;
}
