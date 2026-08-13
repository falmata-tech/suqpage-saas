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
  const owners = platformAdmin ? await listBusinessClientAccess(business.id) : [];
  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">Business workspace</span>
          <h1>Business details</h1>
          <p>Keep identity, contact routes, live status, and search settings current.</p>
        </div>
      </div>
      {params.saved === "password" ? <p className="notice">Temporary owner password saved. Existing sessions were revoked.</p> : params.saved ? <p className="notice">Business details saved.</p> : null}
      {params.error ? <p className="error">{params.error}</p> : null}
      <form className="panel form-grid" action={updateBusinessAction}>
        <input type="hidden" name="businessId" value={business.id} />
        <div className="field full settings-section-heading"><span className="eyebrow">Identity</span><h2>Business identity</h2></div>
        <div className="field"><label>Business name</label><input aria-label="Business name" required name="name" defaultValue={business.name} /></div>
        <div className="field settings-media-field"><label>Logo</label>{business.logo_path ? <img src={business.logo_path} alt="Current business logo" /> : <div className="settings-media-empty">No logo uploaded</div>}<input aria-label="Replace logo" type="file" name="logo" accept="image/jpeg,image/png,image/webp" /></div>
        <div className="field settings-media-field"><label>Browser icon</label>{business.favicon_path ? <img src={business.favicon_path} alt="Current browser icon" /> : <div className="settings-media-empty">No browser icon uploaded</div>}<input aria-label="Replace browser icon" type="file" name="favicon" accept="image/jpeg,image/png,image/webp" /></div>
        <div className="field full settings-section-heading"><span className="eyebrow">Contact</span><h2>Buyer contact routes</h2></div>
        <div className="field"><label>Notification email</label><input aria-label="Notification email" type="email" name="contactEmail" defaultValue={business.contact_email} /></div>
        <div className="field"><label>WhatsApp</label><input aria-label="WhatsApp" name="whatsapp" defaultValue={business.whatsapp} placeholder="251911234567" /></div>
        <div className="field"><label>Telegram</label><input aria-label="Telegram" name="telegram" defaultValue={business.telegram} placeholder="BusinessName" /></div>
        <div className="field"><label>TikTok</label><input aria-label="TikTok" name="tiktok" defaultValue={business.tiktok} placeholder="businessname" /></div>
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
          Show this business as live now in its showroom and across the MirtPage marketplace
        </label>
        <div className="field full settings-section-heading"><span className="eyebrow">Search</span><h2>Browser and sharing details</h2></div>
        <div className="field"><label>Page title</label><input aria-label="Page title" name="siteTitle" defaultValue={business.site_title || business.name} /></div>
        <div className="field full"><label>Search and sharing description</label><textarea aria-label="Search and sharing description" name="siteDescription" defaultValue={business.site_description || business.description} /></div>
        <div className="field full"><small>Images are limited to valid JPEG, PNG, or WebP files of 5 MB or less.</small></div>
        <div className="field full"><button className="btn brand">Save business details</button></div>
      </form>
      {platformAdmin ? <section className="panel owner-access" id="owner-sign-in">
        <div className="dashboard-head"><div><h2>Owner sign-in</h2><p>The primary account created for this business. Password recovery is available here only when the owner cannot sign in.</p></div></div>
        {params.accessError ? <p className="error">{params.accessError}</p> : null}
        {owners.length ? owners.map((owner) => <div className="owner-access-record" key={owner.id}>
          <div className="record-head"><div><strong>{owner.name}</strong><p>{owner.email}</p></div><span className={`badge ${owner.must_change_password ? "limited" : "active"}`}>{owner.must_change_password ? "password change required" : "active"}</span></div>
          <details className="admin-form-disclosure" open={params.saved === "password" || Boolean(params.accessError)}><summary>Account recovery <span>Reset the owner's temporary password</span></summary><div className="admin-form-disclosure-body"><form action={adminResetClientPasswordAction} className="form-grid"><input type="hidden" name="userId" value={owner.id}/><input type="hidden" name="businessId" value={business.id}/><div className="field full"><label htmlFor={`temporary-password-${owner.id}`}>New temporary password</label><input id={`temporary-password-${owner.id}`} type="password" name="temporaryPassword" minLength={12} required/></div><div className="field full"><small>Use at least 12 characters with upper-case, lower-case, and a number. The owner must change it after signing in.</small></div><div className="field full"><button className="btn">Reset owner password</button></div></form></div></details>
        </div>) : <p className="muted">The owner invitation has not been accepted yet. Sign-in details will appear here after activation.</p>}
      </section> : null}
    </DashboardShell>
  );
}
