import {redirect} from "next/navigation";
import {workspaceHomeHref} from "@/lib/capabilities";

import { inquiryContactLinks } from "@/lib/inquiry-contact-links";
import { getUiText } from "@/lib/i18n/server";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { updateInquiryStatusAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import "./inquiries.css";
import InquiryReadMarker from "@/components/InquiryReadMarker";
import { resolveBusiness } from "@/lib/dashboard";
import { listInquiriesPage } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({ searchParams }: { searchParams:Promise<{business?:string;saved?:string;error?:string;page?:string;q?:string;status?:string;inquiry?:string}> }) {
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const business = await resolveBusiness(user, query.business);
  if (!business) redirect(workspaceHomeHref(user));
  const inquiries = await listInquiriesPage(business.id, query);
  const detail=query.inquiry?(await listInquiriesPage(business.id,{inquiryId:query.inquiry})).items[0]:null;
  const base=new URLSearchParams({business:String(business.id),...(query.q?{q:query.q}:{}),...(query.status?{status:query.status}:{}),...(query.page?{page:query.page}:{})});
  const href=(id?:number)=>`/dashboard/inquiries?${base}${id?`&inquiry=${id}`:""}`;
  return <DashboardShell user={user} business={business}><div className="inquiry-workspace" data-detail-open={Boolean(query.inquiry)}>
    <div className="dashboard-head"><div><h1>{t("Inbox")}</h1><p>{t("Customer inquiries, selected products and contact details.")}</p></div></div>
    {query.error ? <p className="error" role="alert">{t(query.error)}</p> : null}
    {!query.error && query.saved ? <p className="notice">{t("Inquiry status updated.")}</p> : null}
    <div className="inquiry-inbox-tools"><CollectionToolbar
      action="/dashboard/inquiries"
      search={query.q || ""}
      placeholder={t("Customer, phone or product")}
      hidden={{ business: business.id }}
      activeFilters={Boolean(query.q || query.status)}
    >
      <label><span>{t("Status")}</span><select name="status" defaultValue={query.status || ""}><option value="">{t("All statuses")}</option><option value="new">{t("new")}</option><option value="contacted">{t("contacted")}</option><option value="confirmed">{t("confirmed")}</option><option value="closed">{t("closed")}</option><option value="cancelled">{t("cancelled")}</option></select></label>
    </CollectionToolbar></div>
    <div className="inquiry-inbox" data-detail-open={Boolean(query.inquiry)}>
      <div className="inquiry-inbox-list" aria-label={t("Inquiries")}>
        {inquiries.items.length?inquiries.items.map(inquiry=><a key={inquiry.id} className="panel inquiry-inbox-row" href={href(inquiry.id)} aria-current={detail?.id===inquiry.id?"page":undefined}>
          <div className="record-head"><strong>{inquiry.customer_name}</strong>{!inquiry.read_at&&<span className="badge new">{t("Unread")}</span>}</div>
          <span className={`badge ${inquiry.status}`}>{t(inquiry.status)}</span><p>{inquiry.note.slice(0,140)}</p><small>{new Date(inquiry.created_at).toLocaleString("en-US",{hour12:true})}</small>
        </a>):<div className="empty-state">{t("No customer inquiries match this view.")}</div>}
      </div>
      {detail?<section className="panel inquiry-inbox-detail" aria-label={t("Inquiry details")}>
        <a className="small-btn inquiry-back" href={href()}>{t("Back to inbox")}</a>
        <InquiryReadMarker inquiryId={detail.id} businessId={business.id} readAt={detail.read_at}/>
        <h2>{detail.customer_name}</h2><p>{new Date(detail.created_at).toLocaleString("en-US",{hour12:true})}</p>
        <p><strong>{t("Phone number")}</strong><br/><span className="inquiry-contact-value">{detail.contact}</span></p>
        <div className="inline-actions">{inquiryContactLinks(detail.contact_method,detail.contact).map(link=><a key={link.label} className="small-btn" href={link.href}>{t(link.label)}</a>)}</div>
        <h3>{t("Customer message")}</h3><p className="inquiry-message">{detail.note}</p>
        {detail.items.length>0&&<div className="record-items">{detail.items.map(item=><div key={item.id}><strong>{item.product_name_snapshot}</strong><div>{t("Quantity:")} {item.quantity_intent||(item.quantity===null?"":String(item.quantity))||t("Open for discussion")}</div>{item.options_json!=="{}"&&<div>{Object.entries(JSON.parse(item.options_json)).map(([key,value])=>`${key}: ${value}`).join(" · ")}</div>}</div>)}</div>}
        <form action={updateInquiryStatusAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="inquiryId" value={detail.id}/><input type="hidden" name="returnInquiry" value={detail.id}/><input type="hidden" name="returnQ" value={query.q||""}/><input type="hidden" name="returnStatus" value={query.status||""}/><input type="hidden" name="returnPage" value={query.page||""}/><label>{t("Inquiry status")}<select name="status" defaultValue={detail.status}>{["new","contacted","confirmed","closed","cancelled"].map(status=><option key={status} value={status}>{t(status)}</option>)}</select></label><button className="small-btn">{t("Update")}</button></form>
      </section>:<section className="panel inquiry-inbox-detail"><p>{t(query.inquiry?"Inquiry not found.":"Choose an inquiry to see the message and contact details.")}</p></section>}
    </div>
    <PaginationNav
      result={inquiries}
      pathname="/dashboard/inquiries"
      params={{ business: business.id, q: query.q, status: query.status, inquiry:query.inquiry }}
    />
  </div></DashboardShell>;
}
