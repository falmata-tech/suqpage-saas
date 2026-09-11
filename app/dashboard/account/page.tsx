import DashboardShell from "@/components/DashboardShell";
import { changePasswordAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { authDriver } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Account({ searchParams }: { searchParams: Promise<{ required?: string; error?: string; saved?: string }> }) {
  const user = await requireUser({ allowTemporaryPassword: true });
  const params = await searchParams;
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const managed = authDriver() === "supabase";

  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>Account security</h1><p>{managed ? "AfricMade uses your verified email or Google account for sign-in." : "Use a unique password that is not shared with another service."}</p></div></div>
    {managed ? <section className="panel"><span className="eyebrow">Passwordless account</span><h2>Managed by Supabase Auth</h2><p className="muted">Sign in with a one-time email code or your connected Google account. AfricMade does not ask you to create or reset a password.</p><dl className="request-facts"><dt>Email</dt><dd>{user.email}</dd></dl></section> : <>
      {params.required ? <p className="notice">Change the temporary password before using the dashboard.</p> : null}
      {params.error ? <p className="error">{params.error}</p> : null}
      {params.saved ? <p className="notice">Password updated and other sessions revoked.</p> : null}
      <form className="panel form-grid" action={changePasswordAction}>
        <div className="field full"><label htmlFor="current-password">Current password</label><input id="current-password" type="password" name="currentPassword" autoComplete="current-password" required /></div>
        <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" name="newPassword" autoComplete="new-password" minLength={12} required /></div>
        <div className="field"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" name="confirmPassword" autoComplete="new-password" minLength={12} required /></div>
        <div className="field full"><small>At least 12 characters with upper-case, lower-case and a number.</small></div>
        <div className="field full"><button className="btn brand">Change password</button></div>
      </form>
    </>}
  </DashboardShell>;
}
