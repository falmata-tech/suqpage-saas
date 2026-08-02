import { redirect } from "next/navigation";
import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import OnBehalfRequestForm from "@/components/OnBehalfRequestForm";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import {
  getManagedClient,
  listManagedClientsPage,
} from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function OnBehalfRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; page?: string; q?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user,"operations:manage")) redirect("/dashboard/requests");
  const query = await searchParams;
  const selectedId = Number.parseInt(query.client || "", 10);
  const selectedClient = Number.isInteger(selectedId)
    ? getManagedClient(selectedId)
    : undefined;
  const clients = listManagedClientsPage(query);
  return <DashboardShell user={user} business={null}>
    <NavigationTrail items={[{label:"Operations",href:"/dashboard/requests"},{label:"On-behalf request"}]} fallback="/dashboard/requests"/>
    <div className="dashboard-head"><div><h1>Record a request for a client</h1><p>Find an existing client or continue with no selection to capture a new prospect. MirtPage is shown as the submitter.</p></div></div>
    <section className="panel client-picker">
      <div className="dashboard-head"><div><h2>Who is this for?</h2><p>Only matching accounts are loaded. Leave the selection empty for a new prospect.</p></div>{selectedClient ? <Link className="small-btn" href="/dashboard/requests/on-behalf">Use new prospect</Link> : null}</div>
      <CollectionToolbar action="/dashboard/requests/on-behalf" search={query.q || ""} placeholder="Client, email, business, or handle" hidden={{client:selectedClient?.id}}/>
      {clients.items.length ? <><div className="table-wrap"><table className="data-table"><thead><tr><th>Client</th><th>Business</th><th>Request type</th><th><span className="sr-only">Select</span></th></tr></thead><tbody>{clients.items.map((client)=><tr key={client.id}><td><strong>{client.name}</strong><br/><small>{client.email}</small></td><td>{client.business_name}</td><td>{client.request_type}</td><td>{selectedClient?.id === client.id ? <span className="badge active">selected</span> : <Link className="small-btn" href={`/dashboard/requests/on-behalf?client=${client.id}&q=${encodeURIComponent(query.q || "")}`}>Select</Link>}</td></tr>)}</tbody></table></div><PaginationNav result={clients} pathname="/dashboard/requests/on-behalf" params={{q:query.q,client:selectedClient?.id}}/></> : <div className="empty-state">No managed clients match this search.</div>}
    </section>
    <OnBehalfRequestForm client={selectedClient}/>
  </DashboardShell>;
}
