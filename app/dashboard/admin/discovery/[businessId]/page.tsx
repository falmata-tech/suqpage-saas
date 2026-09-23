
import { getUiText } from "@/lib/i18n/server";
import CategoryIllustration from "@/components/CategoryIllustration";
import Link from "next/link";
import { readLocationProposal } from "@/lib/owner-business-runtime";
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
  const t = await getUiText();
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const businessId = Number.parseInt((await params).businessId, 10);
  if (!Number.isInteger(businessId)) notFound();
  const profile = await getDiscoveryProfileAdminView(businessId);
  if (!profile) notFound();
  const business = (await runtimeBusinessById(businessId)) || null;
  const proposal = await readLocationProposal(businessId);
  const pending = proposal && proposal.version !== proposal.reviewed_version;
  const query = await searchParams;
  const industryLabels = new Map<string, string>(DISCOVERY_INDUSTRIES.map((industry) => [industry.key, industry.label]));

  return <DashboardShell user={user} business={business}>
    <NavigationTrail items={[{ label: t("Businesses"), href: "/dashboard/admin/businesses" }, { label: profile.businessName }, { label: t("Marketplace") }]} fallback={`/dashboard?business=${businessId}`} />
    <div className="dashboard-head standard-page-heading">
      <div><span className="eyebrow">{t("Business workspace")}</span><h1>{t("Marketplace")}</h1><p>{t("Manage how {business} appears in search, maps and sponsors.", {business: profile.businessName})}</p></div>
      <Link className="btn secondary" href={`/preview/@${profile.handle}`} target="_blank">{t("Open page")}</Link>
    </div>
    {query.error ? <p className="error">{t(query.error)}</p> : null}
    {query.saved ? <p className="notice">{t("Discovery profile saved.")}</p> : null}
    <div className="split focused-marketplace-layout">
      <section className="panel">
        <h2>{t("Visibility summary")}</h2>
        <p><span className={`badge ${profile.excluded ? "cancelled" : profile.approved ? "active" : "limited"}`}>{profile.excluded ? t("excluded") : profile.approved ? t("discoverable") : t("incomplete")}</span></p>
        <dl className="request-facts"><dt>{t("Industries")}</dt><dd>{profile.industryKeys.map((key) => industryLabels.get(key) || key).join(", ") || t("Not assigned")}</dd><dt>{t("Origin")}</dt><dd>{[profile.city, profile.zone, profile.region].filter(Boolean).join(", ") || t("Not set")}</dd><dt>{t("Sponsored")}</dt><dd>{profile.sponsored ? t("Yes · position {value1}", { value1: profile.sponsorPosition }) : t("No")}</dd></dl>
      </section>
      <section className="panel">
        <h2>{t("Edit discovery profile")}</h2>
        {proposal?<p className="notice">{t("Owner location:")}{" "}{proposal.city}, {proposal.region}. {proposal.location_mode === "area"?t("General area only: the marker is approximate. Do not use a home address."):t("Public storefront coordinates supplied by the owner.")} {" "}{t("Saved by the owner.")}</p>:<p className="hint">{t("The owner has not saved a location yet.")}</p>}
        <form action={updateDiscoveryProfileAction} className="form-grid">
          <input type="hidden" name="businessId" value={profile.businessId} /><input type="hidden" name="proposalVersion" value={proposal?.version||0}/>
          <fieldset className="field full">
            <legend>{t("Industries")}</legend>
            <div className="recipe-checks">{DISCOVERY_INDUSTRIES.map((industry) => <label key={industry.key} className="check-field"><input type="checkbox" name="industryKeys" value={industry.key} defaultChecked={pending?proposal.category_key===industry.key:profile.industryKeys.includes(industry.key)} /><CategoryIllustration name={industry.key} size={32}/>{industry.label}</label>)}</div>
          </fieldset>
          <div className="field full"><label htmlFor="profile-scale">{t("Production scale")}</label><select id="profile-scale" name="productionScale" defaultValue={profile.productionScale}><option value="workshop">{t("Workshop / producer")}</option><option value="growing_factory">{t("Growing factory")}</option></select></div>
          <input type="hidden" name="existingBoothImagePath" value={profile.boothImagePath} />
          <div className="field full discovery-admin-media">
            <label htmlFor="profile-image">{t("Marketplace booth image")}</label>
            {profile.boothImagePath ? <img src={profile.boothImagePath} alt={t("{value1} booth", { value1: profile.businessName })} /> : null}
            <input id="profile-image" name="boothImage" type="file" accept="image/jpeg,image/png,image/webp" />
            <small>{t("Upload a JPG, PNG, or WebP image up to 5 MB. Leave empty to keep the current image or use the page cover/fallback.")}</small>
          </div>
          <div className="field"><label htmlFor="profile-city">{t("City")}</label><input id="profile-city" name="city" defaultValue={pending?proposal.city:profile.city} required /></div>
          <div className="field"><label htmlFor="profile-zone">{t("Zone / administrative area")}</label><input id="profile-zone" name="zone" defaultValue={profile.zone || (pending?proposal.city:profile.city)} required /></div>
          <div className="field full"><label htmlFor="profile-region">{t("Region")}</label><input id="profile-region" name="region" defaultValue={pending?proposal.region:profile.region} required /></div>
          <label className="check-field"><input type="checkbox" name="excluded" defaultChecked={profile.excluded} />{t("Exclude from discovery")}</label>
          <details className="field full admin-form-disclosure">
            <summary>{t("Advanced visibility")}{" "}<span>{t("Map placement, fallback, and sponsorship")}</span></summary>
            <div className="admin-form-disclosure-body form-grid">
              <div className="field"><label htmlFor="profile-latitude">{t("Latitude")}</label><input id="profile-latitude" name="latitude" type="number" min="3" max="15" step="any" defaultValue={pending?(proposal.location_mode === "storefront"?proposal.latitude??"":proposal.place_latitude??""):profile.latitude??""} required /></div>
              <div className="field"><label htmlFor="profile-longitude">{t("Longitude")}</label><input id="profile-longitude" name="longitude" type="number" min="32" max="49" step="any" defaultValue={pending?(proposal.location_mode === "storefront"?proposal.longitude??"":proposal.place_longitude??""):profile.longitude??""} required /></div>
              <div className="field full"><label htmlFor="profile-fallback">{t("Booth fallback style")}</label><select id="profile-fallback" name="fallbackStyle" defaultValue={profile.fallbackStyle}>{["workshop", "botanical", "textile", "food", "home", "technical"].map((style) => <option key={style}>{style}</option>)}</select></div>
              <fieldset className="field full">
                <legend>{t("Homepage sponsor")}</legend>
                <div className="recipe-checks"><label className="check-field"><input type="checkbox" name="sponsored" defaultChecked={profile.sponsored} />{t("Include this business in the global Sponsors pool")}</label></div>
                <div className="field"><label htmlFor="sponsor-position">{t("Sponsor order")}</label><input id="sponsor-position" name="sponsorPosition" type="number" min="1" max="999" defaultValue={profile.sponsorPosition} required /><small>{t("The five active placements with the lowest positions appear. This selection is independent of industries and Daily Featured.")}</small></div>
              </fieldset>
            </div>
          </details>
          <div className="field full"><button className="btn brand">{t("Save discovery profile")}</button></div>
        </form>
      </section>
    </div>
  </DashboardShell>;
}
