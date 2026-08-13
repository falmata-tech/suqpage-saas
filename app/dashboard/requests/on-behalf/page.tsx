import { redirect } from "next/navigation";
import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import OnBehalfRequestForm from "@/components/OnBehalfRequestForm";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { runtimeCurrentShowroomProject, runtimeRequestTypeForBusiness } from "@/lib/request-runtime";
import {
  getManagedClient,
  listManagedClientsPage,
} from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function OnBehalfRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; business?: string; page?: string; q?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user,"operations:manage")) redirect("/dashboard/requests");
  const query = await searchParams;
  const selectedId = Number.parseInt(query.client || "", 10);
  const selectedClient = Number.isInteger(selectedId)
    ? await getManagedClient(selectedId)
    : undefined;
  const selectedBusinessId = Number.parseInt(query.business || "", 10);
  const businessId = selectedClient?.business_id || (Number.isInteger(selectedBusinessId) ? selectedBusinessId : null);
  const business = businessId ? (await runtimeBusinessById(businessId)) || null : null;
  const current = business ? await runtimeCurrentShowroomProject(business.id) : undefined;
  if (current) redirect(`/dashboard/requests/${current.id}`);
  const requestType = business ? await runtimeRequestTypeForBusiness(business.id) : undefined;
  const clients = await listManagedClientsPage(query);
  const requestsHref = business ? `/dashboard/requests?business=${business.id}` : "/dashboard/requests";
  return <DashboardShell user={user} business={business}>
    <NavigationTrail items={[{label:business ? "Showroom project" : "Showroom requests",href:requestsHref},{label:business ? requestType==="onboarding"?"Create showroom":"Update showroom" : "Record request"}]} fallback={requestsHref}/>
    <div className="dashboard-head"><div><h1>{business ? `${requestType==="onboarding"?"Create":"Update"} showroom for ${business.name}` : "Record a showroom request"}</h1><p>{business ? "Record the intended outcome and begin one private showroom project in this business workspace." : "Find an existing business or continue with no selection to capture a new prospect. MirtPage is shown as the submitter."}</p></div></div>
    {!business ? <section className="panel client-picker">
      <div className="dashboard-head"><div><h2>Who is this for?</h2><p>Only matching accounts are loaded. Leave the selection empty for a new prospect.</p></div></div>
      <CollectionToolbar action="/dashboard/requests/on-behalf" search={query.q || ""} placeholder="Client, email, business, or handle"/>
      {clients.items.length ? <><div className="table-wrap"><table className="data-table"><thead><tr><th>Client</th><th>Business</th><th>Project type</th><th><span className="sr-only">Select</span></th></tr></thead><tbody>{clients.items.map((client)=><tr key={client.id}><td><strong>{client.name}</strong><br/><small>{client.email}</small></td><td>{client.business_name}</td><td>{client.request_type === "onboarding" ? "Showroom setup" : "Showroom update"}</td><td><Link className="small-btn" href={`/dashboard/requests/on-behalf?client=${client.id}&q=${encodeURIComponent(query.q || "")}`}>Select</Link></td></tr>)}</tbody></table></div><PaginationNav result={clients} pathname="/dashboard/requests/on-behalf" params={{q:query.q}}/></> : <div className="empty-state">No managed clients match this search.</div>}
    </section> : null}
    <OnBehalfRequestForm client={selectedClient} business={business || undefined} requestType={requestType}/>
  </DashboardShell>;
}
