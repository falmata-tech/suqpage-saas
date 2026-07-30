import crypto from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { recordManualPaymentAction } from "@/app/account-health-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import {
  getBusinessSubscription,
  getShowroomInsights,
  listAccountHealthPage,
  listSubscriptionPayments,
} from "@/lib/account-health";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { resolveBusiness } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

function date(value: number) {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

export default async function AccountHealthPage({
  searchParams,
}: {
  searchParams: Promise<{
    business?: string;
    page?: string;
    q?: string;
    status?: string;
    saved?: string;
    error?: string;
  }>;
}) {
  const user = await requireUser();
  if (user.access_role === "team_member") redirect("/dashboard");
  const query = await searchParams;
  const operations = hasCapability(user, "operations:manage");
  const business = resolveBusiness(user, query.business);

  if (operations && !business) {
    const accounts = listAccountHealthPage(user, query);
    return (
      <DashboardShell user={user} business={null}>
        <div className="dashboard-head"><div><span className="eyebrow">Platform health</span><h1>Monthly accounts</h1><p>Find renewals approaching grace or inactivity without loading every business at once.</p></div></div>
        <CollectionToolbar action="/dashboard/account-health" search={query.q || ""} placeholder="Business or handle" activeFilters={Boolean(query.q || query.status)}>
          <label><span>Account state</span><select name="status" defaultValue={query.status || ""}><option value="">All states</option><option value="active">Active</option><option value="grace">Grace</option><option value="inactive">Inactive</option></select></label>
        </CollectionToolbar>
        <div className="account-health-list">
          {accounts.items.map((account) => (
            <Link className="account-health-row" href={`/dashboard/account-health?business=${account.businessId}`} key={account.businessId}>
              <span><strong>{account.businessName}</strong><small>/@{account.handle} · Period ends {date(account.currentPeriodEnd)}</small></span>
              <span className={`badge ${account.state}`}>{account.state}</span>
            </Link>
          ))}
          {!accounts.items.length ? <div className="empty-state">No accounts match this view.</div> : null}
        </div>
        <PaginationNav result={accounts} pathname="/dashboard/account-health" params={{ q: query.q, status: query.status }} />
      </DashboardShell>
    );
  }
  if (!business) return null;

  const subscription = getBusinessSubscription(business.id);
  if (!subscription) return null;
  const insights = getShowroomInsights(user, business.id);
  const payments = listSubscriptionPayments(user, business.id);
  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div><span className="eyebrow">Account and visibility</span><h1>{business.name}</h1><p>Monthly showroom access and privacy-conscious visitor totals in one place.</p></div>
        {operations ? <Link className="btn secondary" href="/dashboard/account-health">All accounts</Link> : null}
      </div>
      {query.saved ? <p className="notice">Payment recorded and the monthly period renewed.</p> : null}
      {query.error ? <p className="error">{query.error}</p> : null}
      <section className={`account-status-panel ${subscription.state}`}>
        <div><span className="eyebrow">Showroom status</span><h2>{subscription.state === "active" ? "Active" : subscription.state === "grace" ? "Payment grace period" : "Inactive"}</h2></div>
        <div className="account-dates"><span><small>Current period</small><strong>{date(subscription.currentPeriodStart)} - {date(subscription.currentPeriodEnd)}</strong></span><span><small>Grace deadline</small><strong>{date(subscription.graceEndsAt)}</strong></span></div>
        <p>{subscription.state === "active" ? "The public showroom and Expo eligibility are online." : subscription.state === "grace" ? "The showroom remains online temporarily. Contact SuqPage to confirm renewal before the grace deadline." : "The public showroom is offline and no longer appears in Expo or directory results. Contact SuqPage to renew access."}</p>
      </section>
      <div className="cards account-insights">
        <article className="metric"><span>Unique visits</span><strong>{insights.totalVisitors}</strong><small>All recorded showroom sources</small></article>
        <article className="metric"><span>From Expo</span><strong>{insights.expoVisitors}</strong><small>Visitors who entered through a booth</small></article>
        <article className="metric"><span>From directory</span><strong>{insights.directoryVisitors}</strong><small>Visitors who used showroom search</small></article>
        <article className="metric"><span>Last 30 days</span><strong>{insights.last30Days}</strong><small>Deduplicated daily visits</small></article>
      </div>
      {operations ? (
        <form className="panel form-grid account-payment" action={recordManualPaymentAction}>
          <h2 className="full">Record an accepted payment</h2>
          <input type="hidden" name="businessId" value={business.id} />
          <input type="hidden" name="idempotencyKey" value={crypto.randomBytes(16).toString("hex")} />
          <div className="field full"><label htmlFor="payment-date">Renewal received date</label><input id="payment-date" name="paidAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></div>
          <div className="field full"><button className="btn brand">Record payment and renew one month</button></div>
        </form>
      ) : null}
      <section className="panel">
        <h2>Payment history</h2>
        {payments.length ? <div className="account-payment-history">{payments.map((payment) => <div key={payment.id}><span><strong>{payment.public_ref}</strong><small>Renewal recorded by SuqPage</small></span><span><small>{date(payment.paid_at || payment.created_at)}</small></span></div>)}</div> : <p className="muted">No renewal records have been added yet.</p>}
      </section>
    </DashboardShell>
  );
}
