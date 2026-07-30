import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { redirect } from "next/navigation";
import { createDeliveryRequestAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { isClient } from "@/lib/capabilities";
import { resolveBusiness } from "@/lib/dashboard";
import { getInquiry, listDeliveryCompanies } from "@/lib/db";
import {
  listDeliveriesPage,
  listRecentInquiryChoices,
} from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage({ searchParams }: { searchParams:Promise<{business?:string;inquiry?:string;created?:string;error?:string;page?:string;q?:string}> }) {
  const user = await requireUser();
  if (user.access_role === "team_member") redirect("/dashboard");
  const query = await searchParams;
  const business = resolveBusiness(user, query.business);
  if (!business) return null;
  const client = isClient(user);
  const deliveries = listDeliveriesPage(business.id, query);
  const selectedInquiryId = query.inquiry ? Number(query.inquiry) : undefined;
  const inquiries = client ? [] : listRecentInquiryChoices(business.id, selectedInquiryId);
  const companies = client ? [] : listDeliveryCompanies();
  const chosen = !client && query.inquiry ? getInquiry(Number(query.inquiry), business.id) : undefined;
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>{client ? "Delivery activity" : "Delivery requests"}</h1><p>{client ? "Follow delivery work connected to your business." : "Send a request to one or several supported delivery companies through the mock Malikt Board adapter."}</p></div></div>
    {query.error ? <p className="error">{query.error}</p> : null}{query.created ? <p className="notice">Delivery request <strong>{query.created}</strong> was submitted to the mock Malikt Board.</p> : null}
    {!client ? <div className="split"><section className="panel"><h2>Initiate delivery</h2><form action={createDeliveryRequestAction} className="form-grid"><input type="hidden" name="businessId" value={business.id}/><div className="field full"><label htmlFor="delivery-inquiry">Related inquiry</label><select id="delivery-inquiry" name="inquiryId" defaultValue={chosen?.id || ""}><option value="">No related inquiry</option>{inquiries.map((inquiry:any) => <option key={inquiry.id} value={inquiry.id}>{inquiry.customer_name} · #{inquiry.id}</option>)}</select></div><div className="field"><label htmlFor="delivery-customer">Customer name</label><input id="delivery-customer" required name="customerName" defaultValue={chosen?.customer_name || ""}/></div><div className="field"><label htmlFor="delivery-phone">Phone</label><input id="delivery-phone" required name="phone" defaultValue={chosen?.contact || ""}/></div><div className="field full"><label htmlFor="delivery-pickup">Pickup address</label><input id="delivery-pickup" required name="pickupAddress" defaultValue="Business pickup location"/></div><div className="field full"><label htmlFor="delivery-destination">Delivery address</label><input id="delivery-destination" required name="deliveryAddress" placeholder="Customer delivery area or address"/></div><div className="field"><label htmlFor="delivery-packages">Package count</label><input id="delivery-packages" type="number" min="1" name="packageCount" defaultValue="1"/></div><div className="field full"><label htmlFor="delivery-note">Delivery note</label><textarea id="delivery-note" name="note" defaultValue={chosen?.note || ""}/></div><fieldset className="field full delivery-companies"><legend>Send to delivery companies</legend>{companies.map((company:any) => <label key={company.id}><input type="checkbox" name="companyIds" value={company.id} defaultChecked={company.slug === "malikt-express"}/><span><strong>{company.name}</strong><br/><small>{company.service_area}</small></span></label>)}</fieldset><div className="field full"><button className="btn brand">Submit to Malikt Board</button></div></form></section><section className="panel"><h2>Mock API contract</h2><p>The dashboard reads supported companies from the same data exposed at:</p><div className="sdk-code">GET /api/malikt/companies<br/>POST /api/malikt/requests</div><p className="muted">A real delivery provider can replace this adapter without changing showroom designs.</p></section></div> : null}
    <section className="panel">
      <h2>Request history</h2>
      <CollectionToolbar
        action="/dashboard/deliveries"
        search={query.q || ""}
        placeholder="Reference, customer, phone, or route"
        hidden={{ business: business.id }}
      />
      {deliveries.items.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Request</th><th>Customer</th><th>Route</th><th>Packages</th><th>Status</th><th>Created</th></tr></thead><tbody>{deliveries.items.map((delivery) => <tr key={delivery.id}><td><strong>{delivery.external_request_id}</strong></td><td>{delivery.customer_name}<br/><small>{delivery.phone}</small></td><td>{delivery.pickup_address}<br/>→ {delivery.delivery_address}</td><td>{delivery.package_count}</td><td><span className={`badge ${delivery.status}`}>{delivery.status}</span></td><td>{new Date(delivery.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty-state">No delivery requests match this view.</div>}
      <PaginationNav
        result={deliveries}
        pathname="/dashboard/deliveries"
        params={{ business: business.id, q: query.q }}
      />
    </section>
  </DashboardShell>;
}
