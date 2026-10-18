import {redirect} from "next/navigation";
import {workspaceHomeHref} from "@/lib/capabilities";

import { inquiryContactLinks } from "@/lib/inquiry-contact-links";
import { getUiText } from "@/lib/i18n/server";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { updateInquiryStatusAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { isClient } from "@/lib/capabilities";
import { resolveBusiness } from "@/lib/dashboard";
import { listInquiriesPage } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({ searchParams }: { searchParams:Promise<{business?:string;saved?:string;error?:string;page?:string;q?:string;status?:string;inquiry?:string}> }) {
  const t = await getUiText();
  const user = await requireUser();
  if (user.access_role === "team_member") redirect("/dashboard");
  const query = await searchParams;
  const business = await resolveBusiness(user, query.business);
  if (!business) redirect(workspaceHomeHref(user));
  const client = isClient(user);
  const inquiries = await listInquiriesPage(business.id, {...query,inquiryId:query.inquiry});
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>{t("Inquiry history")}</h1><p>{client ? t("Saved inquiries from before social-only contact.") : t("Saved inquiries from before social-only contact.")}</p></div></div>
    {query.error ? <p className="error" role="alert">{t(query.error)}</p> : null}
    {!query.error && query.saved ? <p className="notice">{t("Inquiry status updated.")}</p> : null}
    {query.inquiry?<a className="small-btn" href="/dashboard/inquiries">{t('All inquiries')}</a>:null}
    <CollectionToolbar
      action="/dashboard/inquiries"
      search={query.q || ""}
      placeholder={t("Customer, contact, product or service")}
      hidden={{ business: business.id, inquiry:query.inquiry }}
      activeFilters={Boolean(query.q || query.status)}
    >
      <label><span>{t("Status")}</span><select name="status" defaultValue={query.status || ""}><option value="">{t("All statuses")}</option><option value="new">{t("new")}</option><option value="contacted">{t("contacted")}</option><option value="confirmed">{t("confirmed")}</option><option value="closed">{t("closed")}</option><option value="cancelled">{t("cancelled")}</option></select></label>
    </CollectionToolbar>
    {inquiries.items.length ? <div className="record-list">{inquiries.items.map((inquiry) => {
      return <section className="panel record-panel" key={inquiry.id}>
        <div className="record-head"><div><span className={`badge ${inquiry.status}`}>{t(inquiry.status)}</span><h2>{inquiry.customer_name}</h2><p>{inquiry.contact_method === "phone" ? t("Phone") : t("Email")}: {inquiry.contact} · {new Date(inquiry.created_at).toLocaleString("en-US", { hour12: true })}</p></div>
          <form action={updateInquiryStatusAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="inquiryId" value={inquiry.id}/><input type="hidden" name="returnQ" value={query.q || ""}/><input type="hidden" name="returnStatus" value={query.status || ""}/><input type="hidden" name="returnPage" value={query.page || ""}/><select aria-label={t("Inquiry status")} name="status" defaultValue={inquiry.status}><option value="new">{t("new")}</option><option value="contacted">{t("contacted")}</option><option value="confirmed">{t("confirmed")}</option><option value="closed">{t("closed")}</option><option value="cancelled">{t("cancelled")}</option></select><button className="small-btn">{t("Update")}</button></form>
        </div>
        <div className="inline-actions">{inquiryContactLinks(inquiry.contact_method,inquiry.contact).map(link => <a key={link.label} className="small-btn" href={link.href}>{t(link.label)}</a>)}</div>
        <div className="record-items">{inquiry.items.map((item) => {
          const quantityIntent = item.quantity_intent || (item.quantity === null ? "" : String(item.quantity));
          return <div key={item.id}><strong>{item.product_name_snapshot}</strong><div>{t("Quantity:")}{" "}{quantityIntent || t("Open for discussion")}</div>{item.options_json !== "{}" ? <div>{Object.entries(JSON.parse(item.options_json)).map(([key,value]) => `${key}: ${value}`).join(" · ")}</div> : null}</div>;
        })}</div>
        {inquiry.note ? <p className="hint">{inquiry.note}</p> : null}
      </section>;
    })}</div> : <div className="empty-state">{t("No customer inquiries match this view.")}</div>}
    <PaginationNav
      result={inquiries}
      pathname="/dashboard/inquiries"
      params={{ business: business.id, q: query.q, status: query.status }}
    />
  </DashboardShell>;
}
