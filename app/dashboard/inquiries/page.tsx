import DashboardShell from "@/components/DashboardShell";
import { redirect } from "next/navigation";
import { updateInquiryStatusAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { isClient } from "@/lib/capabilities";
import { resolveBusiness } from "@/lib/dashboard";
import { getDb, listInquiries } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({ searchParams }: { searchParams:Promise<{business?:string;saved?:string}> }) {
  const user = await requireUser();
  if (user.access_role === "team_member") redirect("/dashboard");
  const query = await searchParams;
  const business = resolveBusiness(user, query.business);
  if (!business) return null;
  const client = isClient(user);
  const inquiries = listInquiries(business.id);
  const db = getDb();
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>Customer inquiries</h1><p>{client ? "See the customer activity arriving from your showroom." : "Saved before the customer continues to an external messaging app."}</p></div></div>
    {query.saved ? <p className="notice">Inquiry status updated.</p> : null}
    {inquiries.length ? inquiries.map((inquiry:any) => {
      const items = db.prepare("SELECT * FROM inquiry_items WHERE inquiry_id=?").all(inquiry.id) as any[];
      return <section className="panel" key={inquiry.id}>
        <div className="record-head"><div><span className={`badge ${inquiry.status}`}>{inquiry.status}</span><h2>{inquiry.customer_name}</h2><p>{inquiry.contact_method}: {inquiry.contact} · {new Date(inquiry.created_at).toLocaleString()}</p></div>
          {!client ? <form action={updateInquiryStatusAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="inquiryId" value={inquiry.id}/><select aria-label="Inquiry status" name="status" defaultValue={inquiry.status}><option>new</option><option>contacted</option><option>confirmed</option><option>closed</option><option>cancelled</option></select><button className="small-btn">Update</button></form> : null}
        </div>
        <div className="record-items">{items.map((item) => <div key={item.id}><strong>{item.product_name_snapshot}</strong>{item.quantity === null ? <div>Desired quantity: Open for discussion</div> : <div>Desired quantity: {item.quantity}</div>}{item.options_json !== "{}" ? <div>{Object.entries(JSON.parse(item.options_json)).map(([key,value]) => `${key}: ${value}`).join(" · ")}</div> : null}</div>)}</div>
        {inquiry.note ? <p className="hint">{inquiry.note}</p> : null}
        {!client ? <a className="btn secondary" href={`/dashboard/deliveries?business=${business.id}&inquiry=${inquiry.id}`}>Create delivery request</a> : null}
      </section>;
    }) : <div className="empty-state">No customer inquiries yet.</div>}
  </DashboardShell>;
}
