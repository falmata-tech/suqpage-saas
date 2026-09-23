
import { getUiText } from "@/lib/i18n/server";
import crypto from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { recordManualPaymentAction } from "@/app/account-health-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import {
  getBusinessSubscription,
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
  const t = await getUiText();
  const user = await requireUser();
  if (user.access_role === "team_member") redirect("/dashboard");
  const query = await searchParams;
  const operations = hasCapability(user, "operations:manage");
  const business = await resolveBusiness(user, query.business);

  if (operations && !business) {
    const accounts = await listAccountHealthPage(user, query);
    return (
      <DashboardShell user={user} business={null}>
        <div className="dashboard-head"><div><span className="eyebrow">{t("Service operations")}</span><h1>{t("Renewals")}</h1><p>{t("Review current and overdue manual service periods. Renewal dates do not control publication.")}</p></div></div>
        <CollectionToolbar action="/dashboard/account-health" search={query.q || ""} placeholder={t("Business or handle")} activeFilters={Boolean(query.q || query.status)}>
          <label><span>{t("Renewal state")}</span><select name="status" defaultValue={query.status || ""}><option value="">{t("All states")}</option><option value="active">{t("Current period")}</option><option value="grace">{t("Renewal due")}</option><option value="inactive">{t("Renewal overdue")}</option></select></label>
        </CollectionToolbar>
        <div className="account-health-list">
          {accounts.items.map((account) => (
            <Link className="account-health-row" href={`/dashboard/account-health?business=${account.businessId}`} key={account.businessId}>
              <span><strong>{account.businessName}</strong><small>/@{account.handle} {" "}{t("· Period ends")}{" "}{date(account.currentPeriodEnd)}</small></span>
              <span className={`badge ${account.state}`}>{account.state}</span>
            </Link>
          ))}
          {!accounts.items.length ? <div className="empty-state">{t("No accounts match this view.")}</div> : null}
        </div>
        <PaginationNav result={accounts} pathname="/dashboard/account-health" params={{ q: query.q, status: query.status }} />
      </DashboardShell>
    );
  }
  if (!business) return null;

  const subscription = await getBusinessSubscription(business.id);
  if (!subscription) return null;
  const payments = await listSubscriptionPayments(user, business.id);
  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div><span className="eyebrow">{t("Business workspace")}</span><h1>{t("Renewal")}</h1><p>{t("Renewal history for {business}", {business: business.name})}</p></div>
        {operations ? <Link className="btn secondary" href="/dashboard/account-health">{t("All renewals")}</Link> : null}
      </div>
      {query.saved ? <p className="notice">{t("Payment recorded and the monthly period renewed.")}</p> : null}
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      <section className={`account-status-panel ${subscription.state}`}>
        <div><span className="eyebrow">{t("Manual renewal record")}</span><h2>{subscription.state === "active" ? t("Current period") : subscription.state === "grace" ? t("Renewal due") : t("Renewal overdue")}</h2></div>
        <div className="account-dates"><span><small>{t("Current period")}</small><strong>{date(subscription.currentPeriodStart)} - {date(subscription.currentPeriodEnd)}</strong></span><span><small>{t("Grace deadline")}</small><strong>{date(subscription.graceEndsAt)}</strong></span></div>
        <p>{subscription.state === "active" ? t("This manual renewal record is current.") : subscription.state === "grace" ? t("Contact Suqpage to confirm the next manual renewal.") : t("This manual renewal record is overdue.")} {" "}{t("Publication is controlled separately: an active published page remains public unless an administrator suspends it.")}</p>
      </section>
      {operations ? (
        <form className="panel form-grid account-payment" action={recordManualPaymentAction}>
          <h2 className="full">{t("Record an accepted payment")}</h2>
          <input type="hidden" name="businessId" value={business.id} />
          <input type="hidden" name="idempotencyKey" value={crypto.randomBytes(16).toString("hex")} />
          <div className="field full"><label htmlFor="payment-date">{t("Renewal received date")}</label><input id="payment-date" name="paidAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></div>
          <div className="field full"><button className="btn brand">{t("Record payment and renew one month")}</button></div>
        </form>
      ) : null}
      <section className="panel">
        <h2>{t("Payment history")}</h2>
        {payments.length ? <div className="account-payment-history">{payments.map((payment) => <div key={payment.id}><span><strong>{payment.public_ref}</strong><small>{t("Renewal recorded by Suqpage")}</small></span><span><small>{date(payment.paid_at || payment.created_at)}</small></span></div>)}</div> : <p className="muted">{t("No renewal records have been added yet.")}</p>}
      </section>
    </DashboardShell>
  );
}
