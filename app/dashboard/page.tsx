import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { getAllBusinesses, getCatalogByBusinessId, listDeliveryRequests, listInquiries } from "@/lib/db";
import { resolveBusiness } from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ business?: string }> }) {
  const user = await requireUser(); const params = await searchParams; const business = resolveBusiness(user,params.business);
  if (user.role === "admin" && !business) {
    const businesses = getAllBusinesses();
    return <DashboardShell user={user} business={null}><div className="dashboard-head"><div><h1>Businesses</h1><p>Choose a tenant to manage its dynamic showroom and workflow.</p></div></div><div className="showroom-grid">{businesses.map(b=><Link className="showroom-card" href={`/dashboard?business=${b.id}`} key={b.id}><div><span className={`badge ${b.status}`}>{b.status}</span><h3>{b.name}</h3><p>@{b.handle} · {b.design_key}</p><strong>Manage tenant →</strong></div></Link>)}</div></DashboardShell>;
  }
  if (!business) return null;
  const catalog = getCatalogByBusinessId(business.id,true)!; const inquiries = listInquiries(business.id); const deliveries = listDeliveryRequests(business.id);
  const available = catalog.products.filter(p=>p.availability==="available" && p.is_published).length;
  return <DashboardShell user={user} business={business}><div className="dashboard-head"><div><h1>{business.name}</h1><p>Dynamic catalog and customer workflow overview.</p></div><Link className="btn" href={`/preview/@${business.handle}`} target="_blank">Preview showroom</Link></div>
    <div className="cards"><div className="metric"><span>Products</span><strong>{catalog.products.length}</strong></div><div className="metric"><span>Available</span><strong>{available}</strong></div><div className="metric"><span>Inquiries</span><strong>{inquiries.length}</strong></div><div className="metric"><span>Deliveries</span><strong>{deliveries.length}</strong></div></div>
    <section className="panel"><h2>How this MVP works</h2><p>The showroom design is a custom renderer. Products, collections, options, availability, inquiries and delivery requests come from SuqPage’s shared data layer.</p><div className="notice">Edit a product or add a new one, then reopen the public showroom. The custom page updates without changing its design code.</div></section>
    <section className="panel"><h2>Recent inquiries</h2>{inquiries.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>Contact</th><th>Items</th><th>Status</th><th>Received</th></tr></thead><tbody>{inquiries.slice(0,5).map(i=><tr key={i.id}><td>{i.customer_name}</td><td>{i.contact}</td><td>{i.item_count}</td><td><span className={`badge ${i.status}`}>{i.status}</span></td><td>{new Date(i.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>:<div className="empty-state">No inquiries yet.</div>}</section>
  </DashboardShell>;
}
