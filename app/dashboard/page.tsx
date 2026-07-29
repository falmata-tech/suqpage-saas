import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { hasCapability, isClient } from "@/lib/capabilities";
import { getAllBusinesses, hasRetainedPublication, listDeliveryRequests, listInquiries } from "@/lib/db";
import { resolveBusiness } from "@/lib/dashboard";
import { listClientRequests } from "@/lib/request-sqlite";
import { listAssignedBusinesses } from "@/lib/staff-operations";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams:Promise<{business?:string}> }) {
  const user = await requireUser();
  const params = await searchParams;
  const business = resolveBusiness(user, params.business);
  if (user.access_role === "team_member" && !business) {
    const assignedBusinesses = listAssignedBusinesses(user.id);
    return <DashboardShell user={user} business={null}><div className="dashboard-head"><div><h1>Assigned businesses</h1><p>Only businesses connected to your active request assignments appear here.</p></div><Link className="btn" href="/dashboard/requests">Assigned requests</Link></div>{assignedBusinesses.length ? <div className="showroom-grid">{assignedBusinesses.map((tenant)=><Link className="showroom-card" href={`/dashboard?business=${tenant.id}`} key={tenant.id}><div><span className={`badge ${tenant.status}`}>{tenant.status}</span><h3>{tenant.name}</h3><p>@{tenant.handle}</p><strong>Open read-only context →</strong></div></Link>)}</div> : <div className="empty-state">No business or request is assigned to you.</div>}</DashboardShell>;
  }
  if (hasCapability(user, "operations:manage") && !business) {
    const businesses = getAllBusinesses();
    const platformAdmin = hasCapability(user,"platform:admin");
    return <DashboardShell user={user} business={null}><div className="dashboard-head"><div><h1>Businesses</h1><p>{platformAdmin ? "Choose a tenant to manage its showroom and workflow." : "Choose a tenant to review its live context and request activity."}</p></div></div><div className="showroom-grid">{businesses.map((tenant) => <Link className="showroom-card" href={`/dashboard?business=${tenant.id}`} key={tenant.id}><div><span className={`badge ${tenant.status}`}>{tenant.status}</span><h3>{tenant.name}</h3><p>@{tenant.handle} · {tenant.design_key}</p><strong>{platformAdmin ? "Open workspace" : "Review context"} →</strong></div></Link>)}</div></DashboardShell>;
  }
  if (!business) return null;
  const established = hasRetainedPublication(business.id);
  if (user.access_role === "team_member") {
    return <DashboardShell user={user} business={business}><div className="dashboard-head"><div><span className="eyebrow">Assigned context</span><h1>{business.name}</h1><p>Prepare client-approved showroom revisions{established ? ", or provide basic offering upkeep when the client asks for direct customer service" : ""}.</p></div><Link className="btn" href={`/preview/@${business.handle}`} target="_blank">View live showroom</Link></div><section className="panel"><h2>Work within your assignment</h2><p>Settings, design, categories, and full showroom publication stay inside the request/revision workflow.{established ? " Basic product and capability details can be maintained with a recorded service note." : " Offering upkeep becomes available after the first showroom publication."}</p><div className="hero-actions"><Link className="btn brand" href="/dashboard/requests">Open assigned requests</Link>{established ? <Link className="btn secondary" href={`/dashboard/products?business=${business.id}`}>Maintain offerings</Link> : null}</div></section></DashboardShell>;
  }
  const inquiries = listInquiries(business.id);
  const deliveries = listDeliveryRequests(business.id);
  if (isClient(user)) {
    const requests = listClientRequests(user);
    return <DashboardShell user={user} business={business}>
      <div className="dashboard-head"><div><span className="eyebrow">Client workspace</span><h1>Welcome to {business.name}</h1><p>Send requests in your own words and follow the work SuqPage manages for you.</p></div><Link className="btn brand" href="/dashboard/requests/new">Make a request</Link></div>
      <div className="cards client-metrics"><Link className="metric" href="/dashboard/requests"><span>Requests</span><strong>{requests.length}</strong><small>View request history</small></Link><Link className="metric" href={`/dashboard/inquiries?business=${business.id}`}><span>Customer inquiries</span><strong>{inquiries.length}</strong><small>View showroom activity</small></Link><Link className="metric" href={`/dashboard/deliveries?business=${business.id}`}><span>Deliveries</span><strong>{deliveries.length}</strong><small>Follow delivery activity</small></Link></div>
      <section className="panel client-next"><h2>Simple by design</h2><p>{established ? "Use My offerings for quick product, capability, production-fact, image, availability, and existing category updates. " : "Your first showroom starts with one request in your own words. "}For new categories, options, settings, or visual design, send a request and approve the team’s private preview before publication.</p><div className="hero-actions">{established ? <Link className="btn brand" href={`/dashboard/products?business=${business.id}`}>Maintain offerings</Link> : <Link className="btn brand" href="/dashboard/requests/new">Request your first showroom</Link>}<Link className="btn secondary" href="/dashboard/requests/new">{established ? "Request a larger change" : "Open request form"}</Link><Link className="btn secondary" href={`/preview/@${business.handle}`}>Open private showroom preview</Link></div></section>
    </DashboardShell>;
  }
  if (hasCapability(user, "operations:manage")) {
    return <DashboardShell user={user} business={business}>
      <div className="dashboard-head"><div><span className="eyebrow">Operations workspace</span><h1>{business.name}</h1><p>Review customer activity and coordinate managed-service work without changing live showroom content directly.</p></div><Link className="btn" href={`/preview/@${business.handle}`} target="_blank">View showroom</Link></div>
      <div className="cards"><Link className="metric" href="/dashboard/requests"><span>Managed requests</span><strong>Open</strong><small>Review, assign, and prepare revisions</small></Link><Link className="metric" href={`/dashboard/inquiries?business=${business.id}`}><span>Customer inquiries</span><strong>{inquiries.length}</strong><small>Update inquiry status</small></Link><Link className="metric" href={`/dashboard/deliveries?business=${business.id}`}><span>Deliveries</span><strong>{deliveries.length}</strong><small>Create and follow delivery activity</small></Link></div>
      <section className="panel"><h2>Controlled publication</h2><p>Business settings, design, categories, and full showroom changes stay inside an approved request revision.{established ? " Basic offering upkeep is separately versioned and records your customer-service attribution." : " Basic offering upkeep unlocks after the first showroom publication."}</p><div className="hero-actions"><Link className="btn brand" href="/dashboard/requests">Open managed requests</Link>{established ? <Link className="btn secondary" href={`/dashboard/products?business=${business.id}`}>Maintain offerings</Link> : null}<Link className="btn secondary" href="/dashboard/requests/on-behalf">Submit on behalf of client</Link></div></section>
    </DashboardShell>;
  }
  return null;
}
