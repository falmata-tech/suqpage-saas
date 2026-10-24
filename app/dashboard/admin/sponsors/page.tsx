
import { getUiText } from "@/lib/i18n/server";
import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import SponsorPlacementEditor from '@/components/SponsorPlacementEditor';
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getSponsoredShowrooms } from "@/lib/discovery";
import { getDiscoveryProfileAdminView,listDiscoveryProfilesPage } from "@/lib/discovery-admin";
import { getExternalSponsorAd,listExternalSponsorAdsPage } from "@/lib/sponsor-admin";
import {resolveManagedBusiness} from '@/lib/dashboard';
import recordStyles from '@/components/BusinessRecordFacts.module.css';

export const dynamic = "force-dynamic";

export default async function SponsorPlacementsPage({ searchParams }: {
  searchParams: Promise<{ business?:string; q?: string; businessPage?: string; adPage?: string; saved?: string; error?: string; edit?:string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  if(query.business!==undefined){
    const selected=await resolveManagedBusiness(user,query.business);
    const profile=await getDiscoveryProfileAdminView(selected.id);
    const readHref=`/dashboard/admin/sponsors?business=${selected.id}`;
    if(!profile)notFound();
    if(query.edit&&query.edit!==`business-${selected.id}`)redirect(readHref);
    return <DashboardShell user={user} business={selected}>
      <div className="dashboard-head standard-page-heading"><div><h1>{t('Sponsor placements')}</h1></div><Link className="btn secondary" href={`/dashboard/admin/discovery/${selected.id}`}>{t('Location & visibility')}</Link></div>
      {query.error?<p className="error" role="alert">{t(query.error)}</p>:null}{query.saved?<p className="notice" role="status">{t('Sponsor placements updated.')}</p>:null}
      {query.edit?<SponsorPlacementEditor business={profile} origin={{business:String(selected.id)}} cancelHref={readHref}/>:<section className="panel"><div className="dashboard-section-head"><h2>{selected.name}</h2><Link className="btn brand" href={`${readHref}&edit=business-${selected.id}`}>{t('Edit')}</Link></div><dl className={recordStyles.facts}><dt>{t('Sponsored')}</dt><dd>{t(profile.sponsored?'Active':'Inactive')}</dd><dt>{t('Position')}</dt><dd>{profile.sponsorPosition}</dd><dt>{t('Marketplace')}</dt><dd>{t(profile.approved&&!profile.excluded?'eligible profile':'setup required')}</dd></dl></section>}
    </DashboardShell>;
  }
  const origin={q:query.q,businessPage:query.businessPage,adPage:query.adPage};
  const returnQuery=new URLSearchParams(Object.entries(origin).filter((entry):entry is [string,string]=>Boolean(entry[1])));
  const readHref='/dashboard/admin/sponsors'+(returnQuery.size?'?'+returnQuery:'');
  const editHref=(edit:string)=>readHref+(returnQuery.size?'&':'?')+'edit='+edit;
  const adId=/^ad-([1-9]\d*)$/.exec(query.edit||'')?.[1];
  const businessId=/^business-([1-9]\d*)$/.exec(query.edit||'')?.[1];
  if(query.edit==='new'||adId||businessId) {
    const ad=adId?await getExternalSponsorAd(Number(adId)):undefined;
    const business=businessId?await getDiscoveryProfileAdminView(Number(businessId)):undefined;
    if(adId&&!ad||businessId&&!business)redirect(readHref);
    return <DashboardShell user={user} business={null}><nav className="workspace-breadcrumbs" aria-label={t('Breadcrumb')}><Link href={readHref}>{t('Sponsor placements')}</Link><span aria-hidden="true">/</span><strong aria-current="page">{t(query.edit==='new'?'Create sponsor ad':'Edit')}</strong></nav><div className="dashboard-head"><h1>{t(query.edit==='new'?'Create sponsor ad':'Edit')}</h1></div><SponsorPlacementEditor ad={ad} business={business||undefined} origin={origin} cancelHref={readHref}/></DashboardShell>;
  }
  const [publicPlacements, businesses, externalAds] = await Promise.all([
    getSponsoredShowrooms(),
    listDiscoveryProfilesPage({ q: query.q, page: query.businessPage }),
    listExternalSponsorAdsPage({ page: query.adPage }),
  ]);

  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label={t("Breadcrumb")}><Link href="/dashboard/admin">{t("Platform overview")}</Link><span>/</span><strong>{t("Sponsor placements")}</strong></nav>
    <div className="dashboard-head"><div><span className="eyebrow">{t("Paid placement")}</span><h1>{t("Sponsor placements")}</h1><p>{t("Order up to five public sponsors from AfricMade pages and external advertisers. Sponsorship never changes marketplace or Daily Featured eligibility.")}</p></div><div className="inline-actions"><Link className="btn brand" href={editHref('new')}>{t('Create sponsor ad')}</Link><Link className="btn secondary" href="/featured" target="_blank">{t("View Daily Featured")}</Link></div></div>
    {query.error ? <p className="error">{t(query.error)}</p> : null}
    {query.saved ? <p className="notice">{t("Sponsor placements updated.")}</p> : null}

    <section className="panel sponsor-public-preview">
      <div><span className="eyebrow">{t("Currently public")}</span><h2>{t("Current sponsors")}</h2><p>{t("Up to five active sponsors appear in this order.")}</p></div>
      {publicPlacements.length ? <ol>{publicPlacements.map((placement) => <li key={placement.id}><img src={placement.imagePath} alt=""/><span><small>{placement.kind === "showroom" ? t("AfricMade page") : t("External advertiser")}</small><strong>{placement.name}</strong><em>{t("Position")}{" "}{placement.position}</em></span></li>)}</ol> : <div className="empty-state">{t("No active sponsor placement is currently eligible.")}</div>}
    </section>

    <section className="panel">
      <div className="dashboard-section-head"><div><span className="eyebrow">{t("External ads")}</span><h2>{t("Manage advertiser cards")}</h2><p>{t("Changes update the sponsor card on Featured.")}</p></div></div>
      {externalAds.items.length ? <div className="compact-business-list">{externalAds.items.map((ad)=><article key={ad.id} className="compact-business-row"><span><strong>{ad.name}</strong><small>{ad.description}</small><small>{ad.active?t('Active · position {value1}',{value1:ad.position}):t('Inactive')}</small></span><Link className="small-btn" href={editHref('ad-'+ad.id)}>{t('Edit')}</Link></article>)}</div> : <div className="empty-state">{t("No external sponsor ads have been created.")}</div>}
      <PaginationNav result={externalAds} pathname="/dashboard/admin/sponsors" pageParam="adPage" params={{ q: query.q, businessPage: query.businessPage }}/>
    </section>

    <section className="panel">
      <div className="dashboard-section-head"><div><span className="eyebrow">{t("AfricMade accounts")}</span><h2>{t("Sponsor a AfricMade page")}</h2><p>{t("Find a business and choose its sponsor position.")}</p></div></div>
      <CollectionToolbar action="/dashboard/admin/sponsors" search={query.q || ""} placeholder={t("Business, handle, or location")} activeFilters={Boolean(query.q)}/>
      {businesses.items.length ? <div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr><th>{t("Business")}</th><th>{t("Marketplace")}</th><th>{t("Paid placement")}</th></tr></thead><tbody>{businesses.items.map((business) => <tr key={business.businessId}>
        <td data-label="Business"><strong>{business.businessName}</strong><br/><small>@{business.handle}</small></td>
        <td data-label="Marketplace"><span className={`badge ${business.approved && !business.excluded ? "active" : "limited"}`}>{business.approved && !business.excluded ? t("eligible profile") : t("setup required")}</span></td>
        <td data-label="Paid placement"><span>{business.sponsored?t('Active · position {value1}',{value1:business.sponsorPosition}):t('Inactive')}</span> · <Link className="small-btn" href={editHref('business-'+business.businessId)}>{t('Edit')}</Link></td>
      </tr>)}</tbody></table></div> : <div className="empty-state">{t("No businesses match this search.")}</div>}
      <PaginationNav result={businesses} pathname="/dashboard/admin/sponsors" pageParam="businessPage" params={{ q: query.q, adPage: query.adPage }}/>
    </section>
  </DashboardShell>;
}
