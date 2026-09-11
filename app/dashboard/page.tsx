import Link from "next/link";
import { adminUpdateBusinessAction } from "@/app/actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { getShowroomInsights, type ShowroomInsights } from "@/lib/account-health";
import { hasCapability, isClient } from "@/lib/capabilities";
import { runtimeHasRetainedPublication } from "@/lib/catalog-runtime";
import { hasClientReviewableRevision, resolveBusiness } from "@/lib/dashboard";
import { getDashboardAttention, type DashboardAttention } from "@/lib/dashboard-attention";
import { runtimeCurrentShowroomProject } from "@/lib/request-runtime";
import {
  getBusinessActivityCounts,
  listAssignedBusinessesPage,
  listBusinessesPage,
} from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

function AttentionCards({ attention, businessId, platform = false }: { attention: DashboardAttention; businessId?: number; platform?: boolean }) {
  const cards = [
    platform && attention.newAccounts !== undefined ? { label: "New client accounts", value: attention.newAccounts, detail: "Draft workspaces to review", href: "/dashboard/admin/businesses?status=draft" } : null,
    { label: platform ? "New page requests" : "Page requests", value: attention.showroomRequests, detail: platform ? "Submitted and waiting for review" : "Needs your next action", href: businessId ? `/dashboard/requests?business=${businessId}` : "/dashboard/requests" },
    attention.customerInquiries !== undefined ? { label: "New customer inquiries", value: attention.customerInquiries, detail: "Sent from your AfricMade page", href: `/dashboard/inquiries?business=${businessId}` } : null,
    { label: "Support needing reply", value: attention.supportReplies, detail: platform ? "Waiting or unread conversations" : "Unread support activity", href: "/dashboard/support" },
  ].filter((card): card is { label: string; value: number; detail: string; href: string } => Boolean(card));
  return <section className="attention-section" aria-labelledby="attention-title"><div className="attention-heading"><div><span className="eyebrow">Needs attention</span><h2 id="attention-title">Start with what changed.</h2></div><p>Live counts point to work that needs a response now.</p></div><div className="attention-grid">{cards.map((card) => <Link className={card.value ? "attention-card active" : "attention-card"} href={card.href} key={card.label}><span>{card.label}</span><strong>{card.value}</strong><small>{card.detail}</small><b>{card.value ? "Review now" : "Nothing waiting"}</b></Link>)}</div></section>;
}

function ShowroomVisitSummary({ insights, businessName }: { insights: ShowroomInsights; businessName: string }) {
  const metrics = [
    ["Unique visits", insights.totalVisitors, "All recorded page sources"],
    ["From marketplace", insights.directoryVisitors, "Visitors arriving through map or list discovery"],
    ["Direct visits", insights.directVisitors, "Visitors opening the page directly"],
    ["Last 30 days", insights.last30Days, "Deduplicated daily visits"],
  ] as const;
  return <section className="overview-insights" id="showroom-visits" aria-labelledby="showroom-visits-title"><div className="attention-heading"><div><span className="eyebrow">Page performance</span><h2 id="showroom-visits-title">Page visits</h2></div><p>Privacy-conscious totals show how people reached {businessName}.</p></div><div className="cards account-insights">{metrics.map(([label, value, detail]) => <article className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</div></section>;
}

export default async function Dashboard({ searchParams }: { searchParams:Promise<{business?:string;page?:string;q?:string;saved?:string;error?:string}> }) {
  const user = await requireUser();
  const params = await searchParams;
  const business = await resolveBusiness(user, params.business);
  if (user.access_role === "team_member" && !business) {
    const assignedBusinesses = await listAssignedBusinessesPage(user.id, params);
    const attention = await getDashboardAttention(user);
    return <DashboardShell user={user} business={null}><div className="dashboard-head"><div><h1>Assigned businesses</h1><p>Only businesses connected to your active request assignments appear here.</p></div><Link className="btn" href="/dashboard/requests">Assigned requests</Link></div><AttentionCards attention={attention}/><CollectionToolbar action="/dashboard" search={params.q || ""} placeholder="Business or handle"/>{assignedBusinesses.items.length ? <><div className="compact-business-list">{assignedBusinesses.items.map((tenant)=><Link className="compact-business-row" href={`/dashboard?business=${tenant.id}`} key={tenant.id}><span><strong>{tenant.name}</strong><small>@{tenant.handle}</small></span><span className={`badge ${tenant.status}`}>{tenant.status}</span><b>Open business</b></Link>)}</div><PaginationNav result={assignedBusinesses} pathname="/dashboard" params={{q:params.q}}/></> : <div className="empty-state">No assigned business matches this view.</div>}</DashboardShell>;
  }
  if (hasCapability(user, "operations:manage") && !business) {
    const businesses = await listBusinessesPage(params);
    const platformAdmin = hasCapability(user,"platform:admin");
    const attention = await getDashboardAttention(user);
    return <DashboardShell user={user} business={null}><div className="dashboard-head"><div><h1>Business workspaces</h1><p>{platformAdmin ? "Find a business and open its workspace." : "Find an assigned business and review its requests."}</p></div></div><AttentionCards attention={attention} platform/><CollectionToolbar action="/dashboard" search={params.q || ""} placeholder="Business, handle, or client email"/>{businesses.items.length ? <><div className="compact-business-list">{businesses.items.map((tenant) => <Link className="compact-business-row" href={`/dashboard?business=${tenant.id}`} key={tenant.id}><span><strong>{tenant.name}</strong><small>@{tenant.handle} · {tenant.client_email || "No client account"}</small></span><span className={`badge ${tenant.status}`}>{tenant.status}</span><b>{platformAdmin ? "Open workspace" : "Open business"}</b></Link>)}</div><PaginationNav result={businesses} pathname="/dashboard" params={{q:params.q}}/></> : <div className="empty-state">No businesses match this search.</div>}</DashboardShell>;
  }
  if (!business) return null;
  const established = await runtimeHasRetainedPublication(business.id);
  if (user.access_role === "team_member") {
    return <DashboardShell user={user} business={business}><div className="dashboard-head"><div><span className="eyebrow">Assigned context</span><h1>{business.name}</h1><p>Prepare client-approved page revisions{established ? ", or provide basic offering upkeep when the client asks for direct customer service" : ""}.</p></div><Link className="btn" href={`/preview/@${business.handle}`} target="_blank">View live page</Link></div><section className="panel"><h2>Work within your assignment</h2><p>Settings, design, categories, and publication stay inside the request and revision workflow.{established ? " Basic product and capability details can be maintained with a recorded service note." : " Offering upkeep becomes available after the first page publication."}</p><div className="hero-actions"><Link className="btn brand" href="/dashboard/requests">Open assigned requests</Link>{established ? <Link className="btn secondary" href={`/dashboard/products?business=${business.id}`}>Maintain offerings</Link> : null}</div></section></DashboardShell>;
  }
  const activity = await getBusinessActivityCounts(business.id);
  const attention = await getDashboardAttention(user, business.id);
  const insights = await getShowroomInsights(user, business.id);
  const currentProject = await runtimeCurrentShowroomProject(business.id);
  const projectAction = currentProject
    ? `Continue page ${currentProject.request_type === "onboarding" ? "setup" : "update"}`
    : established
      ? "Update page"
      : "Create AfricMade page";
  const projectHref = currentProject
    ? `/dashboard/requests/${currentProject.id}`
    : isClient(user)
      ? "/dashboard/requests/new"
      : `/dashboard/requests?business=${business.id}`;
  if (isClient(user)) {
    const reviewable = await hasClientReviewableRevision(user.id,business.id);
    return <DashboardShell user={user} business={business}>
      <div className="dashboard-head"><div><span className="eyebrow">Business workspace</span><h1>{business.name}</h1><p>Manage offerings, page work, inquiries, and support.</p></div>{reviewable ? <Link className="btn brand" href={`/preview/@${business.handle}`}>Review page</Link> : <Link className="btn brand" href={projectHref}>{projectAction}</Link>}</div>
      <AttentionCards attention={attention} businessId={business.id}/>
      <ShowroomVisitSummary insights={insights} businessName={business.name}/>
      <section className="client-workspace-actions" aria-label="AfricMade page workspace">
        <Link href={established ? `/dashboard/products?business=${business.id}` : projectHref}><span><strong>{established ? "Offerings" : "Page setup"}</strong><small>{established ? "Update products, capabilities, images, and production details." : "Start a private page design for your review."}</small></span><b>{established ? "Manage" : "Open"}</b></Link>
        <Link href="/dashboard/requests"><span><strong>Project history</strong><small>{currentProject ? `Includes the active ${currentProject.request_type === "onboarding" ? "setup" : "update"} and completed page work.` : `${activity.requests} completed project${activity.requests === 1 ? "" : "s"} in history.`}</small></span><b>View</b></Link>
      </section>
    </DashboardShell>;
  }
  if (hasCapability(user, "operations:manage")) {
    const platformAdmin = hasCapability(user, "platform:admin");
    return <DashboardShell user={user} business={business}>
      <div className="dashboard-head"><div><span className="eyebrow">Business workspace</span><h1>{business.name}</h1><p>Coordinate page work, marketplace presentation, customer activity, access, and service records.</p></div><Link className="btn secondary" href={`/preview/@${business.handle}`} target="_blank">View page</Link></div>
      {params.saved ? <p className="notice">Page status updated.</p> : null}{params.error ? <p className="error">{params.error}</p> : null}
      <AttentionCards attention={attention} businessId={business.id}/>
      <div className="cards"><Link className="metric" href={`/dashboard/requests?business=${business.id}`}><span>Page project</span><strong>{currentProject ? "Active" : activity.requests}</strong><small>{currentProject ? projectAction : "Start work or review page history"}</small></Link><Link className="metric" href={`/dashboard/inquiries?business=${business.id}`}><span>Customer inquiries</span><strong>{activity.inquiries}</strong><small>Follow buyer conversations</small></Link></div>
      <ShowroomVisitSummary insights={insights} businessName={business.name}/>
      <section className="panel"><div className="dashboard-head"><div><h2>Page status</h2><p>Publication follows the approved revision workflow. A published page can be suspended or restored here.</p></div><span className={`badge ${business.status}`}>{business.status}</span></div>{platformAdmin && business.status !== "draft" ? <form action={adminUpdateBusinessAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="returnBusiness" value={business.id}/><select aria-label={`${business.name} page status`} name="status" defaultValue={business.status}><option value="active">active</option><option value="suspended">suspended</option></select><button className="small-btn">Update status</button></form> : <p className="muted">Draft pages become active only through approved publication.</p>}</section>
    </DashboardShell>;
  }
  return null;
}
