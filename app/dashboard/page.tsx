import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { hasCapability, isClient } from "@/lib/capabilities";
import { getAllBusinesses, getCatalogByBusinessId, listDeliveryRequests, listInquiries } from "@/lib/db";
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
  if (user.access_role === "team_member") {
    return <DashboardShell user={user} business={business}><div className="dashboard-head"><div><span className="eyebrow">Assigned context</span><h1>{business.name}</h1><p>Review the live showroom for context. Content changes must wait for the versioned revision workspace and client approval.</p></div><Link className="btn" href={`/preview/@${business.handle}`} target="_blank">View live showroom</Link></div><section className="panel"><h2>Work from the assigned request</h2><p>This workspace intentionally has no live catalog, product, settings, design, inquiry, or delivery controls.</p><Link className="btn brand" href="/dashboard/requests">Open assigned requests</Link></section></DashboardShell>;
  }
  const inquiries = listInquiries(business.id);
  const deliveries = listDeliveryRequests(business.id);
  if (isClient(user)) {
    const requests = listClientRequests(user);
    return <DashboardShell user={user} business={business}>
      <div className="dashboard-head"><div><span className="eyebrow">Client workspace</span><h1>Welcome to {business.name}</h1><p>Send requests in your own words and follow the work SuqPage manages for you.</p></div><Link className="btn brand" href="/dashboard/requests/new">Make a request</Link></div>
      <div className="cards client-metrics"><Link className="metric" href="/dashboard/requests"><span>Requests</span><strong>{requests.length}</strong><small>View request history</small></Link><Link className="metric" href={`/dashboard/inquiries?business=${business.id}`}><span>Customer inquiries</span><strong>{inquiries.length}</strong><small>View showroom activity</small></Link><Link className="metric" href={`/dashboard/deliveries?business=${business.id}`}><span>Deliveries</span><strong>{deliveries.length}</strong><small>Follow delivery activity</small></Link></div>
      <section className="panel client-next"><h2>Simple by design</h2><p>You do not need to manage products, collections, colors, categories, settings, or design tools. Tell SuqPage what you want changed; the team prepares a private preview, and nothing goes live without your approval.</p><div className="hero-actions"><Link className="btn brand" href="/dashboard/requests/new">Start a new request</Link><Link className="btn secondary" href={`/preview/@${business.handle}`}>Open private showroom preview</Link></div></section>
    </DashboardShell>;
  }
  const catalog = getCatalogByBusinessId(business.id, true)!;
  const available = catalog.products.filter((product) => product.availability === "available" && product.is_published).length;
  return <DashboardShell user={user} business={business}><div className="dashboard-head"><div><h1>{business.name}</h1><p>Dynamic catalog and customer workflow overview.</p></div><Link className="btn" href={`/preview/@${business.handle}`} target="_blank">Preview showroom</Link></div>
    <div className="cards"><div className="metric"><span>Products</span><strong>{catalog.products.length}</strong></div><div className="metric"><span>Available</span><strong>{available}</strong></div><div className="metric"><span>Inquiries</span><strong>{inquiries.length}</strong></div><div className="metric"><span>Deliveries</span><strong>{deliveries.length}</strong></div></div>
    <section className="panel"><h2>Managed showroom</h2><p>The showroom design is a custom renderer. Products, collections, options, availability, inquiries and delivery requests come from SuqPage’s shared data layer.</p></section>
    <section className="panel"><h2>Recent inquiries</h2>{inquiries.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>Contact</th><th>Items</th><th>Status</th><th>Received</th></tr></thead><tbody>{inquiries.slice(0,5).map((inquiry) => <tr key={inquiry.id}><td>{inquiry.customer_name}</td><td>{inquiry.contact}</td><td>{inquiry.item_count}</td><td><span className={`badge ${inquiry.status}`}>{inquiry.status}</span></td><td>{new Date(inquiry.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty-state">No inquiries yet.</div>}</section>
  </DashboardShell>;
}
