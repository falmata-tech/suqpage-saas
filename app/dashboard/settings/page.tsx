import Link from "next/link";
import { authDriver } from "@/lib/config";
import { ownerPageEditorEnabled, ownerPagePort } from "@/lib/owner-page-runtime";
import { readOwnerPage } from "@/lib/owner-page-service";
import { OwnerPageError } from "@/lib/owner-page-domain";
import DashboardShell from "@/components/DashboardShell";
import { adminResetClientPasswordAction, updateBusinessAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { resolveManagedBusiness as resolveBusiness } from "@/lib/dashboard";
import { LIVE_PLATFORMS, LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";
import { listBusinessClientAccess } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string; saved?: string; error?: string; accessError?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const business = await resolveBusiness(user, params.business);
  if (!business) return null;
  const platformAdmin = hasCapability(user, "platform:admin");
  const managed = authDriver() === "supabase";
  let canEditPage = false;
  if (ownerPageEditorEnabled()) {
    try { await readOwnerPage(ownerPagePort, user, business.id); canEditPage = true; }
    catch (error) { if (!(error instanceof OwnerPageError && error.status === 403)) throw error; }
  }
  const owners = platformAdmin ? await listBusinessClientAccess(business.id) : [];
  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">Business workspace</span>
          <h1>Business details</h1>
        </div>
      </div>
      {params.saved === "password" && !managed ? <p className="notice">Temporary owner password saved. Existing sessions were revoked.</p> : params.saved ? <p className="notice">Business details saved.</p> : null}
      {params.error ? <p className="error">{params.error}</p> : null}
      <form className="panel form-grid" action={updateBusinessAction}>
        <input type="hidden" name="businessId" value={business.id} />
        <div className="field full settings-section-heading"><span className="eyebrow">Identity</span><h2>Business identity</h2></div>
        <div className="field"><label>Business name</label><input aria-label="Business name" required name="name" defaultValue={business.name} /></div>
        <div className="field settings-media-field"><label>Logo</label>{business.logo_path ? <img src={business.logo_path} alt="Current business logo" /> : <div className="settings-media-empty">No logo uploaded</div>}<input aria-label="Replace logo" type="file" name="logo" accept="image/jpeg,image/png,image/webp" /></div>
        <div className="field full settings-section-heading"><h2>Notifications</h2></div>
        <div className="field"><label>Notification email</label><input aria-label="Notification email" type="email" name="contactEmail" defaultValue={business.contact_email} /></div>
        <div className="field full settings-section-heading"><span className="eyebrow">Live</span><h2>Live presentation</h2></div>
        <div className="field">
          <label>Live platform</label>
          <select aria-label="Live platform" name="livePlatform" defaultValue={business.live_platform}>
            <option value="">Not configured</option>
            {LIVE_PLATFORMS.map((platform) => <option key={platform} value={platform}>{LIVE_PLATFORM_LABELS[platform]}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Live-session link</label>
          <input aria-label="Live-session link" type="url" name="liveUrl" defaultValue={business.live_url} placeholder="https://..." />
        </div>
        <label className="check-field field full">
          <input type="checkbox" name="isLive" defaultChecked={Boolean(business.is_live)} />
          Show this business as live now on its page and across the Suqpage Market
        </label>
        <div className="field full settings-section-heading"><span className="eyebrow">Search</span><h2>Browser and sharing details</h2></div>
        <div className="field"><label>Page title</label><input aria-label="Page title" name="siteTitle" defaultValue={business.site_title || business.name} /></div>
        <div className="field full"><label>Search and sharing description</label><textarea aria-label="Search and sharing description" name="siteDescription" defaultValue={business.site_description || business.description} /></div>
        <div className="field full"><small>Images are limited to valid JPEG, PNG, or WebP files of 5 MB or less.</small></div>
        <div className="field full"><button className="btn brand">Save business details</button></div>
      </form>
      <section className="panel"><h2>Public contacts</h2>
        {canEditPage ? <Link className="btn" href={`/dashboard/page-editor?business=${business.id}`}>Edit page contacts</Link>
          : <p>The owner manages public contacts in their page editor and can enable staff assistance there.</p>}
      </section>
      {platformAdmin ? <section className="panel owner-access" id="owner-sign-in">
        <div className="dashboard-head"><div><h2>Owner sign-in</h2><p>{managed ? "Owners sign in with a code sent to their account email." : "Recover access with a temporary password."}</p></div></div>
        {params.accessError ? <p className="error">{params.accessError}</p> : null}
        {owners.length ? owners.map((owner) => <div className="owner-access-record" key={owner.id}>
          <div className="record-head"><div><strong>{owner.name}</strong><p>{owner.email}</p></div><span className={`badge ${!managed && owner.must_change_password ? "limited" : "active"}`}>{!managed && owner.must_change_password ? "password change required" : "active"}</span></div>
          {!managed ? <details className="admin-form-disclosure" open={params.saved === "password" || Boolean(params.accessError)}><summary>Account recovery <span>Reset the owner's temporary password</span></summary><div className="admin-form-disclosure-body"><form action={adminResetClientPasswordAction} className="form-grid"><input type="hidden" name="userId" value={owner.id}/><input type="hidden" name="businessId" value={business.id}/><div className="field full"><label htmlFor={`temporary-password-${owner.id}`}>New temporary password</label><input id={`temporary-password-${owner.id}`} type="password" name="temporaryPassword" minLength={12} required/></div><div className="field full"><small>Use at least 12 characters with upper-case, lower-case, and a number. The owner must change it after signing in.</small></div><div className="field full"><button className="btn">Reset owner password</button></div></form></div></details> : null}
        </div>) : <p className="muted">The owner invitation has not been accepted yet. Sign-in details will appear here after activation.</p>}
      </section> : null}
    </DashboardShell>
  );
}
