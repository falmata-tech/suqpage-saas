
import { getUiText } from "@/lib/i18n/server";
import {getLocale} from "next-intl/server";
import {countryName} from "@/lib/countries";
import {findKnownPlace} from "@/lib/place-catalog";
import DiscoveryGeographyFields from "@/components/DiscoveryGeographyFields";
import CategoryIllustration from "@/components/CategoryIllustration";
import Link from "next/link";
import { readLocationProposal } from "@/lib/owner-business-runtime";
import { notFound, redirect } from "next/navigation";
import { updateDiscoveryProfileAction } from "@/app/staff-actions";
import DashboardShell from "@/components/DashboardShell";
import FocusedEditForm from '@/components/FocusedEditForm';
import recordStyles from '@/components/BusinessRecordFacts.module.css';
import { requireUser } from "@/lib/auth";
import { currentBusinessAuthority } from "@/lib/staff-business-authority";
import { DISCOVERY_INDUSTRIES } from "@/lib/discovery";
import { getDiscoveryProfileAdminView } from "@/lib/discovery-admin";
import { runtimeBusinessById } from "@/lib/catalog-runtime";

export const dynamic = "force-dynamic";

export default async function DiscoveryProfilePage({ params, searchParams }: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ error?: string; saved?: string; edit?:string }>;
}) {
  const t = await getUiText();
  const locale = await getLocale();
  const user = await requireUser();
  const rawBusinessId = (await params).businessId;
  if (!/^[1-9]\d{0,9}$/.test(rawBusinessId)) notFound();
  const businessId = Number(rawBusinessId);
  const authority = await currentBusinessAuthority(user, businessId);
  if (authority !== 'administrator' && authority !== 'staff') redirect('/dashboard');
  const isAdministrator = authority === 'administrator';
  const profile = await getDiscoveryProfileAdminView(businessId);
  if (!profile) notFound();
  const business = (await runtimeBusinessById(businessId)) || null;
  const proposal = await readLocationProposal(businessId);
  const pending = proposal && proposal.version !== proposal.reviewed_version;
  const geography = pending ? {countryCode:proposal.country_code,city:proposal.city,placeId:proposal.place_id||''} : {countryCode:profile.countryCode,city:profile.city,placeId:profile.cityId};
  const candidate = findKnownPlace(geography.placeId);
  const selectedPlace = candidate?.countryCode === geography.countryCode ? candidate : null;
  const query = await searchParams;
  const industryLabels = new Map<string, string>(DISCOVERY_INDUSTRIES.map((industry) => [industry.key, industry.label]));

  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head standard-page-heading">
      <div><h1>{t("Location & visibility")}</h1>{isAdministrator?<p>{t("Manage how {business} appears in search, maps and sponsors.", {business: profile.businessName})}</p>:null}</div>
      <div className="inline-actions">{query.edit!=='profile'&&<Link className="btn brand" href={`/dashboard/admin/discovery/${businessId}?edit=profile`}>{t('Edit')}</Link>}<Link className="btn secondary" href={`/preview/@${profile.handle}`} target="_blank">{t("Open page")}</Link></div>
    </div>
    {query.error ? <p className="error">{t(query.error)}</p> : null}
    {query.saved ? <p className="notice">{t("Discovery profile saved.")}</p> : null}
    <div className={query.edit==='profile'?"split focused-marketplace-layout":undefined}>
      {query.edit==='profile'?<section className="panel">
        <h2>{t("Edit discovery profile")}</h2>
        {pending?<p className="notice">{t("Owner location:")}{" "}{proposal.city}, {proposal.region}. {proposal.location_mode === "area"?t("General area only: the marker is approximate. Do not use a home address."):t("Public storefront coordinates supplied by the owner.")} {" "}{t("Saved by the owner.")}</p>:!proposal?<p className="hint">{t("The owner has not saved a location yet.")}</p>:null}
        <FocusedEditForm action={updateDiscoveryProfileAction} cancelHref={`/dashboard/admin/discovery/${businessId}`} submitLabel="Save discovery profile" className="form-grid">
          <input type="hidden" name="businessId" value={profile.businessId} /><input type="hidden" name="proposalVersion" value={proposal?.version||0}/>
          <DiscoveryGeographyFields countryCode={geography.countryCode} city={geography.city} place={selectedPlace}/>
          <input type="hidden" name="industriesPresent" value="1"/>
          <input type="hidden" name="visibilityPresent" value="1"/>
          <fieldset className="field full">
            <legend>{t("Industries")}</legend>
            <div className="recipe-checks">{DISCOVERY_INDUSTRIES.map((industry) => <label key={industry.key} className="check-field"><input type="checkbox" name="industryKeys" value={industry.key} defaultChecked={pending?proposal.category_key===industry.key:profile.industryKeys.includes(industry.key)} /><CategoryIllustration name={industry.key} size={32}/>{t(industry.label)}</label>)}</div>
          </fieldset>
          <div className="field full"><label htmlFor="profile-scale">{t("Production scale")}</label><select id="profile-scale" name="productionScale" defaultValue={profile.productionScale}><option value="workshop">{t("Workshop / producer")}</option><option value="growing_factory">{t("Growing factory")}</option></select></div>
          <div className="field full discovery-admin-media">
            <label htmlFor="profile-image">{t("Marketplace booth image")}</label>
            {profile.boothImagePath ? <img src={profile.boothImagePath} alt={t("{value1} booth", { value1: profile.businessName })} /> : null}
            <input id="profile-image" name="boothImage" type="file" accept="image/jpeg,image/png,image/webp" />
            <small>{t("Upload a JPG, PNG, or WebP image up to 5 MB. Leave empty to keep the current image or use the page cover/fallback.")}</small>
          </div>
          <label className="check-field"><input type="checkbox" name="excluded" defaultChecked={profile.excluded} />{t("Exclude from discovery")}</label>
          <section className="field full">
            <h3>{t("Advanced visibility")}</h3>
            <div className="admin-form-disclosure-body form-grid">
              <div className="field"><label htmlFor="profile-latitude">{t("Latitude")}</label><input id="profile-latitude" name="latitude" type="number" min="-90" max="90" step="any" defaultValue={pending?(proposal.location_mode === "storefront"?proposal.latitude??"":proposal.place_latitude??""):profile.latitude??""} required /></div>
              <div className="field"><label htmlFor="profile-longitude">{t("Longitude")}</label><input id="profile-longitude" name="longitude" type="number" min="-180" max="180" step="any" defaultValue={pending?(proposal.location_mode === "storefront"?proposal.longitude??"":proposal.place_longitude??""):profile.longitude??""} required /></div>
              <div className="field full"><label htmlFor="profile-fallback">{t("Booth fallback style")}</label><select id="profile-fallback" name="fallbackStyle" defaultValue={profile.fallbackStyle}>{["workshop", "botanical", "textile", "food", "home", "technical"].map((style) => <option key={style}>{style}</option>)}</select></div>
              {isAdministrator?<div className="field full"><Link className="small-btn" href={`/dashboard/admin/sponsors?business=${profile.businessId}`}>{t('Manage sponsors')}</Link></div>:null}
            </div>
          </section>
        </FocusedEditForm>
      </section>:null}
      <section className="panel">
        <h2>{t("Visibility summary")}</h2>
        <p><span className={`badge ${profile.excluded ? "cancelled" : profile.approved ? "active" : "limited"}`}>{profile.excluded ? t("excluded") : profile.approved ? t("discoverable") : t("incomplete")}</span></p>
        <dl className={recordStyles.facts}><dt>{t("Industries")}</dt><dd>{profile.industryKeys.map((key) => t(industryLabels.get(key) || key)).join(", ") || t("Not assigned")}</dd><dt>{t("Country")}</dt><dd>{countryName(profile.countryCode,locale)||t("Not set")}</dd><dt>{t("Origin")}</dt><dd>{[profile.city, profile.zone, profile.region].filter(Boolean).join(", ") || t("Not set")}</dd>{isAdministrator?<><dt>{t("Sponsored")}</dt><dd>{profile.sponsored ? t("Yes · position {value1}", { value1: profile.sponsorPosition }) : t("No")}</dd></>:null}</dl>
        {query.edit!=='profile'&&<><dl className={recordStyles.facts}><dt>{t('Production scale')}</dt><dd>{t(profile.productionScale==='growing_factory'?'Growing factory':'Workshop / producer')}</dd><dt>{t('Latitude')}</dt><dd>{profile.latitude??t('Not set')}</dd><dt>{t('Longitude')}</dt><dd>{profile.longitude??t('Not set')}</dd></dl>{profile.boothImagePath&&<img src={profile.boothImagePath} alt={t('{value1} booth',{value1:profile.businessName})} width={240} style={{maxWidth:'100%'}}/>}{isAdministrator?<p><Link href={`/dashboard/admin/sponsors?business=${profile.businessId}`}>{t('Manage sponsors')}</Link></p>:null}</>}
      </section>
    </div>
  </DashboardShell>;
}
