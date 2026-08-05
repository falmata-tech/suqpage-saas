import DashboardShell from "@/components/DashboardShell";
import { updateBusinessAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { resolveManagedBusiness as resolveBusiness } from "@/lib/dashboard";
import { LIVE_PLATFORMS, LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";
import { controlledYouTubeWatchUrl } from "@/lib/youtube-provider";

export const dynamic = "force-dynamic";

function videoUrl(ref: string) {
  if (!ref) return "";
  try { return controlledYouTubeWatchUrl(ref); } catch { return ""; }
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string; saved?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const business = await resolveBusiness(user, params.business);
  if (!business) return null;
  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div>
          <h1>Business settings</h1>
          <p>Keep public identity, contact routes, process media, and live-session status current.</p>
        </div>
      </div>
      {params.saved ? <p className="notice">Business settings saved.</p> : null}
      {params.error ? <p className="error">{params.error}</p> : null}
      <form className="panel form-grid" action={updateBusinessAction}>
        <input type="hidden" name="businessId" value={business.id} />
        <div className="field"><label>Business name</label><input aria-label="Business name" required name="name" defaultValue={business.name} /></div>
        <div className="field"><label>Assigned design</label><input aria-label="Assigned design" value={business.design_key} disabled /></div>
        <div className="field full"><label>Tagline</label><input aria-label="Tagline" name="tagline" defaultValue={business.tagline} /></div>
        <div className="field full"><label>Description</label><textarea aria-label="Description" name="description" defaultValue={business.description} /></div>
        <div className="field"><label>Hero title</label><input aria-label="Hero title" name="heroTitle" defaultValue={business.hero_title} /></div>
        <div className="field"><label>Hero subtitle</label><input aria-label="Hero subtitle" name="heroSubtitle" defaultValue={business.hero_subtitle} /></div>
        <div className="field"><label>Logo</label><input aria-label="Logo" type="file" name="logo" accept="image/jpeg,image/png,image/webp" /></div>
        <div className="field"><label>Hero image</label><input aria-label="Hero image" type="file" name="heroImage" accept="image/jpeg,image/png,image/webp" /></div>
        <div className="field"><label>Browser icon</label><input aria-label="Browser icon" type="file" name="favicon" accept="image/jpeg,image/png,image/webp" /></div>
        <div className="field"><label>Notification email</label><input aria-label="Notification email" type="email" name="contactEmail" defaultValue={business.contact_email} /></div>
        <div className="field"><label>WhatsApp</label><input aria-label="WhatsApp" name="whatsapp" defaultValue={business.whatsapp} placeholder="251911234567" /></div>
        <div className="field"><label>Telegram</label><input aria-label="Telegram" name="telegram" defaultValue={business.telegram} placeholder="BusinessName" /></div>
        <div className="field"><label>TikTok</label><input aria-label="TikTok" name="tiktok" defaultValue={business.tiktok} placeholder="businessname" /></div>
        <div className="field full">
          <label>Process YouTube video <span className="optional">(optional)</span></label>
          <input aria-label="Process YouTube video" type="url" name="processVideoUrl" defaultValue={videoUrl(business.process_video_ref)} placeholder="https://www.youtube.com/watch?v=..." />
          <small>Shown as a responsive video inside the showroom Process section.</small>
        </div>
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
          Show this business as live now
        </label>
        <div className="field"><label>Page title</label><input aria-label="Page title" name="siteTitle" defaultValue={business.site_title || business.name} /></div>
        <div className="field full"><label>Search and sharing description</label><textarea aria-label="Search and sharing description" name="siteDescription" defaultValue={business.site_description || business.description} /></div>
        <div className="field full"><small>Images are limited to valid JPEG, PNG, or WebP files of 5 MB or less.</small></div>
        <div className="field full"><button className="btn brand">Save business settings</button></div>
      </form>
    </DashboardShell>
  );
}
