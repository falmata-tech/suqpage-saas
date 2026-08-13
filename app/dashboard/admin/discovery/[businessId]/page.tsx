import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateDiscoveryProfileAction } from "@/app/staff-actions";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { DISCOVERY_INDUSTRIES } from "@/lib/discovery";
import { getDiscoveryProfileAdminView } from "@/lib/discovery-admin";
import { runtimeBusinessById } from "@/lib/catalog-runtime";

export const dynamic = "force-dynamic";

export default async function DiscoveryProfilePage({ params, searchParams }: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const businessId = Number.parseInt((await params).businessId, 10);
  if (!Number.isInteger(businessId)) notFound();
  const profile = await getDiscoveryProfileAdminView(businessId);
  if (!profile) notFound();
  const business = (await runtimeBusinessById(businessId)) || null;
  const query = await searchParams;
  const industryLabels = new Map<string, string>(DISCOVERY_INDUSTRIES.map((industry) => [industry.key, industry.label]));

  return <DashboardShell user={user} business={business}>
    <NavigationTrail items={[{ label: "Businesses", href: "/dashboard/admin/businesses" }, { label: profile.businessName }, { label: "Marketplace" }]} fallback={`/dashboard?business=${businessId}`} />
    <div className="dashboard-head">
      <div><span className="eyebrow">Business workspace</span><h1>Marketplace</h1><p>Control how {profile.businessName} appears in discovery, maps, and sponsored placement.</p></div>
      <Link className="btn secondary" href={`/preview/@${profile.handle}`} target="_blank">Open showroom</Link>
    </div>
    {query.error ? <p className="error">{query.error}</p> : null}
    {query.saved ? <p className="notice">Discovery profile saved.</p> : null}
    <div className="split focused-marketplace-layout">
      <section className="panel">
        <h2>Visibility summary</h2>
        <p><span className={`badge ${profile.excluded ? "cancelled" : profile.approved ? "active" : "limited"}`}>{profile.excluded ? "excluded" : profile.approved ? "discoverable" : "incomplete"}</span></p>
        <dl className="request-facts"><dt>Industries</dt><dd>{profile.industryKeys.map((key) => industryLabels.get(key) || key).join(", ") || "Not assigned"}</dd><dt>Origin</dt><dd>{[profile.city, profile.zone, profile.region].filter(Boolean).join(", ") || "Not set"}</dd><dt>Sponsored</dt><dd>{profile.sponsored ? `Yes · position ${profile.sponsorPosition}` : "No"}</dd></dl>
      </section>
      <section className="panel">
        <h2>Edit discovery profile</h2>
        <form action={updateDiscoveryProfileAction} className="form-grid">
          <input type="hidden" name="businessId" value={profile.businessId} />
          <fieldset className="field full">
            <legend>Industries</legend>
            <div className="recipe-checks">{DISCOVERY_INDUSTRIES.map((industry) => <label key={industry.key} className="check-field"><input type="checkbox" name="industryKeys" value={industry.key} defaultChecked={profile.industryKeys.includes(industry.key)} />{industry.label}</label>)}</div>
          </fieldset>
          <div className="field full"><label htmlFor="profile-scale">Production scale</label><select id="profile-scale" name="productionScale" defaultValue={profile.productionScale}><option value="workshop">Workshop / producer</option><option value="growing_factory">Growing factory</option></select></div>
          <input type="hidden" name="existingBoothImagePath" value={profile.boothImagePath} />
          <div className="field full discovery-admin-media">
            <label htmlFor="profile-image">Marketplace booth image</label>
            {profile.boothImagePath ? <img src={profile.boothImagePath} alt={`${profile.businessName} booth`} /> : null}
            <input id="profile-image" name="boothImage" type="file" accept="image/jpeg,image/png,image/webp" />
            <small>Upload a JPG, PNG, or WebP image up to 5 MB. Leave empty to keep the current booth.</small>
          </div>
          <div className="field"><label htmlFor="profile-city">City</label><input id="profile-city" name="city" defaultValue={profile.city} required /></div>
          <div className="field"><label htmlFor="profile-zone">Zone / administrative area</label><input id="profile-zone" name="zone" defaultValue={profile.zone} required /></div>
          <div className="field full"><label htmlFor="profile-region">Region</label><input id="profile-region" name="region" defaultValue={profile.region} required /></div>
          <label className="check-field"><input type="checkbox" name="excluded" defaultChecked={profile.excluded} />Exclude from discovery</label>
          <details className="field full admin-form-disclosure">
            <summary>Advanced visibility <span>Map placement, fallback, and sponsorship</span></summary>
            <div className="admin-form-disclosure-body form-grid">
              <div className="field"><label htmlFor="profile-latitude">Latitude</label><input id="profile-latitude" name="latitude" type="number" min="3" max="15" step="any" defaultValue={profile.latitude ?? ""} required /></div>
              <div className="field"><label htmlFor="profile-longitude">Longitude</label><input id="profile-longitude" name="longitude" type="number" min="32" max="49" step="any" defaultValue={profile.longitude ?? ""} required /></div>
              <div className="field full"><label htmlFor="profile-fallback">Booth fallback style</label><select id="profile-fallback" name="fallbackStyle" defaultValue={profile.fallbackStyle}>{["workshop", "botanical", "textile", "food", "home", "technical"].map((style) => <option key={style}>{style}</option>)}</select></div>
              <fieldset className="field full">
                <legend>Homepage sponsor</legend>
                <div className="recipe-checks"><label className="check-field"><input type="checkbox" name="sponsored" defaultChecked={profile.sponsored} />Include this business in the global Sponsors pool</label></div>
                <div className="field"><label htmlFor="sponsor-position">Sponsor order</label><input id="sponsor-position" name="sponsorPosition" type="number" min="1" max="999" defaultValue={profile.sponsorPosition} required /><small>The five active businesses with the lowest positions appear. This selection is independent of industries and daily featured showrooms.</small></div>
              </fieldset>
            </div>
          </details>
          <div className="field full"><button className="btn brand">Save discovery profile</button></div>
        </form>
      </section>
    </div>
  </DashboardShell>;
}
