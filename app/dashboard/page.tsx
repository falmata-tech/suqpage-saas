import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability, isClient } from "@/lib/capabilities";
import { hasRetainedPublication } from "@/lib/db";
import { resolveBusiness } from "@/lib/dashboard";
import { getDashboardAttention, type DashboardAttention } from "@/lib/dashboard-attention";
import {
  getBusinessActivityCounts,
  listAssignedBusinessesPage,
  listBusinessesPage,
} from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

function AttentionCards({ attention, businessId, platform = false }: { attention: DashboardAttention; businessId?: number; platform?: boolean }) {
  const cards = [
    platform && attention.newAccounts !== undefined ? { label: "New client accounts", value: attention.newAccounts, detail: "Draft workspaces to review", href: "/dashboard/admin?view=businesses&status=draft" } : null,
    { label: platform ? "New showroom requests" : "Showroom requests", value: attention.showroomRequests, detail: platform ? "Submitted and waiting for review" : "Needs your next action", href: "/dashboard/requests" },
    attention.customerInquiries !== undefined ? { label: "New customer inquiries", value: attention.customerInquiries, detail: "Sent directly from your showroom", href: `/dashboard/inquiries?business=${businessId}` } : null,
    { label: "Support needing reply", value: attention.supportReplies, detail: platform ? "Waiting or unread conversations" : "Unread support activity", href: "/dashboard/support" },
  ].filter((card): card is { label: string; value: number; detail: string; href: string } => Boolean(card));
  return <section className="attention-section" aria-labelledby="attention-title"><div className="attention-heading"><div><span className="eyebrow">Needs attention</span><h2 id="attention-title">Start with what changed.</h2></div><p>Live counts point to work that needs a response now.</p></div><div className="attention-grid">{cards.map((card) => <Link className={card.value ? "attention-card active" : "attention-card"} href={card.href} key={card.label}><span>{card.label}</span><strong>{card.value}</strong><small>{card.detail}</small><b>{card.value ? "Review now" : "Nothing waiting"}</b></Link>)}</div></section>;
}

export default async function Dashboard({ searchParams }: { searchParams:Promise<{business?:string;page?:string;q?:string}> }) {
  const user = await requireUser();
  const params = await searchParams;
  const business = resolveBusiness(user, params.business);
  if (user.access_role === "team_member" && !business) {
    const assignedBusinesses = listAssignedBusinessesPage(user.id, params);
    const attention = getDashboardAttention(user);
    return <DashboardShell user={user} business={null}><div className="dashboard-head"><div><h1>Assigned businesses</h1><p>Only businesses connected to your active request assignments appear here.</p></div><Link className="btn" href="/dashboard/requests">Assigned requests</Link></div><AttentionCards attention={attention}/><CollectionToolbar action="/dashboard" search={params.q || ""} placeholder="Business or handle"/>{assignedBusinesses.items.length ? <><div className="compact-business-list">{assignedBusinesses.items.map((tenant)=><Link className="compact-business-row" href={`/dashboard?business=${tenant.id}`} key={tenant.id}><span><strong>{tenant.name}</strong><small>@{tenant.handle}</small></span><span className={`badge ${tenant.status}`}>{tenant.status}</span><b>Open business</b></Link>)}</div><PaginationNav result={assignedBusinesses} pathname="/dashboard" params={{q:params.q}}/></> : <div className="empty-state">No assigned business matches this view.</div>}</DashboardShell>;
  }
  if (hasCapability(user, "operations:manage") && !business) {
    const businesses = listBusinessesPage(params);
    const platformAdmin = hasCapability(user,"platform:admin");
    const attention = getDashboardAttention(user);
    return <DashboardShell user={user} business={null}><div className="dashboard-head"><div><h1>Business workspaces</h1><p>{platformAdmin ? "Find a business and open its workspace." : "Find an assigned business and review its requests."}</p></div></div><AttentionCards attention={attention} platform/><CollectionToolbar action="/dashboard" search={params.q || ""} placeholder="Business, handle, or client email"/>{businesses.items.length ? <><div className="compact-business-list">{businesses.items.map((tenant) => <Link className="compact-business-row" href={`/dashboard?business=${tenant.id}`} key={tenant.id}><span><strong>{tenant.name}</strong><small>@{tenant.handle} · {tenant.client_email || "No client account"}</small></span><span className={`badge ${tenant.status}`}>{tenant.status}</span><b>{platformAdmin ? "Open workspace" : "Open business"}</b></Link>)}</div><PaginationNav result={businesses} pathname="/dashboard" params={{q:params.q}}/></> : <div className="empty-state">No businesses match this search.</div>}</DashboardShell>;
  }
  if (!business) return null;
  const established = hasRetainedPublication(business.id);
  if (user.access_role === "team_member") {
    return <DashboardShell user={user} business={business}><div className="dashboard-head"><div><span className="eyebrow">Assigned context</span><h1>{business.name}</h1><p>Prepare client-approved showroom revisions{established ? ", or provide basic offering upkeep when the client asks for direct customer service" : ""}.</p></div><Link className="btn" href={`/preview/@${business.handle}`} target="_blank">View live showroom</Link></div><section className="panel"><h2>Work within your assignment</h2><p>Settings, design, categories, and full showroom publication stay inside the request/revision workflow.{established ? " Basic product and capability details can be maintained with a recorded service note." : " Offering upkeep becomes available after the first showroom publication."}</p><div className="hero-actions"><Link className="btn brand" href="/dashboard/requests">Open assigned requests</Link>{established ? <Link className="btn secondary" href={`/dashboard/products?business=${business.id}`}>Maintain offerings</Link> : null}</div></section></DashboardShell>;
  }
  const activity = getBusinessActivityCounts(business.id);
  const attention = getDashboardAttention(user, business.id);
  if (isClient(user)) {
    return <DashboardShell user={user} business={business}>
      <div className="dashboard-head"><div><span className="eyebrow">Client workspace</span><h1>Welcome to {business.name}</h1><p>Send requests in your own words and follow the work MirtPage manages for you.</p></div><Link className="btn brand" href="/dashboard/requests/new">Make a request</Link></div>
      <AttentionCards attention={attention} businessId={business.id}/>
      <div className="cards client-metrics"><Link className="metric" href="/dashboard/requests"><span>Requests</span><strong>{activity.requests}</strong><small>View request history</small></Link><Link className="metric" href={`/dashboard/inquiries?business=${business.id}`}><span>Customer inquiries</span><strong>{activity.inquiries}</strong><small>View showroom activity</small></Link><Link className="metric" href="/dashboard/account-health"><span>Account &amp; insights</span><strong>View</strong><small>Monthly access and showroom visitors</small></Link></div>
      <section className="panel client-next"><h2>Manage your showroom</h2><p>{established ? "Use My offerings to update products, capabilities, production details, images, availability, and existing categories. " : "Your first showroom starts with a request in your own words. "}For new categories, settings, or visual changes, send a request and approve the private preview before publication.</p><div className="hero-actions">{established ? <Link className="btn brand" href={`/dashboard/products?business=${business.id}`}>Edit offerings</Link> : <Link className="btn brand" href="/dashboard/requests/new">Request your first showroom</Link>}<Link className="btn secondary" href="/dashboard/requests/new">{established ? "Request a larger change" : "Open request form"}</Link><Link className="btn secondary" href={`/preview/@${business.handle}`}>Open private preview</Link></div></section>
    </DashboardShell>;
  }
  if (hasCapability(user, "operations:manage")) {
    return <DashboardShell user={user} business={business}>
      <div className="dashboard-head"><div><span className="eyebrow">Operations workspace</span><h1>{business.name}</h1><p>Review customer activity and coordinate managed-service work without changing live showroom content directly.</p></div></div>
      <AttentionCards attention={attention} businessId={business.id}/>
      <div className="cards"><Link className="metric" href="/dashboard/requests"><span>Managed requests</span><strong>{activity.requests}</strong><small>Review, assign, and prepare revisions</small></Link><Link className="metric" href={`/dashboard/inquiries?business=${business.id}`}><span>Customer inquiries</span><strong>{activity.inquiries}</strong><small>Update inquiry status</small></Link></div>
      <section className="panel"><h2>Review before publication</h2><p>Business settings, design, categories, and complete showroom changes follow the request and approval workflow.{established ? " Routine offering updates remain tracked separately for accountability." : " Routine offering updates become available after the first showroom is published."}</p><div className="hero-actions"><Link className="btn brand" href="/dashboard/requests">Open client requests</Link>{established ? <Link className="btn secondary" href={`/dashboard/products?business=${business.id}`}>Edit offerings</Link> : null}</div></section>
    </DashboardShell>;
  }
  return null;
}
