import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { redirect } from "next/navigation";
import { updateInquiryStatusAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { isClient } from "@/lib/capabilities";
import { resolveBusiness } from "@/lib/dashboard";
import { listInquiriesPage } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({ searchParams }: { searchParams:Promise<{business?:string;saved?:string;page?:string;q?:string;status?:string}> }) {
  const user = await requireUser();
  if (user.access_role === "team_member") redirect("/dashboard");
  const query = await searchParams;
  const business = resolveBusiness(user, query.business);
  if (!business) return null;
  const client = isClient(user);
  const inquiries = listInquiriesPage(business.id, query);
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>Customer inquiries</h1><p>{client ? "See explicit contact-bearing inquiries sent to your showroom." : "Review explicit contact-bearing inquiries and their requested offerings."}</p></div></div>
    {query.saved ? <p className="notice">Inquiry status updated.</p> : null}
    <CollectionToolbar
      action="/dashboard/inquiries"
      search={query.q || ""}
      placeholder="Customer, contact, or offering"
      hidden={{ business: business.id }}
      activeFilters={Boolean(query.q || query.status)}
    >
      <label><span>Status</span><select name="status" defaultValue={query.status || ""}><option value="">All statuses</option><option>new</option><option>contacted</option><option>confirmed</option><option>closed</option><option>cancelled</option></select></label>
    </CollectionToolbar>
    {inquiries.items.length ? <div className="record-list">{inquiries.items.map((inquiry) => {
      return <section className="panel record-panel" key={inquiry.id}>
        <div className="record-head"><div><span className={`badge ${inquiry.status}`}>{inquiry.status}</span><h2>{inquiry.customer_name}</h2><p>{inquiry.contact_method}: {inquiry.contact} · {new Date(inquiry.created_at).toLocaleString()}</p></div>
          {!client ? <form action={updateInquiryStatusAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="inquiryId" value={inquiry.id}/><input type="hidden" name="returnQ" value={query.q || ""}/><input type="hidden" name="returnStatus" value={query.status || ""}/><input type="hidden" name="returnPage" value={query.page || ""}/><select aria-label="Inquiry status" name="status" defaultValue={inquiry.status}><option>new</option><option>contacted</option><option>confirmed</option><option>closed</option><option>cancelled</option></select><button className="small-btn">Update</button></form> : null}
        </div>
        <div className="record-items">{inquiry.items.map((item) => {
          const quantityIntent = item.quantity_intent || (item.quantity === null ? "" : String(item.quantity));
          return <div key={item.id}><strong>{item.product_name_snapshot}</strong><div>Desired quantity: {quantityIntent || "Open for discussion"}</div>{item.options_json !== "{}" ? <div>{Object.entries(JSON.parse(item.options_json)).map(([key,value]) => `${key}: ${value}`).join(" · ")}</div> : null}</div>;
        })}</div>
        {inquiry.note ? <p className="hint">{inquiry.note}</p> : null}
      </section>;
    })}</div> : <div className="empty-state">No customer inquiries match this view.</div>}
    <PaginationNav
      result={inquiries}
      pathname="/dashboard/inquiries"
      params={{ business: business.id, q: query.q, status: query.status }}
    />
  </DashboardShell>;
}
