import Link from "next/link";
import { redirect } from "next/navigation";
import { createExternalSponsorAdAction, setBusinessSponsorshipAction, updateExternalSponsorAdAction } from "@/app/staff-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getSponsoredShowrooms } from "@/lib/discovery";
import { listDiscoveryProfilesPage } from "@/lib/discovery-admin";
import { listExternalSponsorAdsPage } from "@/lib/sponsor-admin";

export const dynamic = "force-dynamic";

export default async function SponsorPlacementsPage({ searchParams }: {
  searchParams: Promise<{ q?: string; businessPage?: string; adPage?: string; saved?: string; error?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const [publicPlacements, businesses, externalAds] = await Promise.all([
    getSponsoredShowrooms(),
    listDiscoveryProfilesPage({ q: query.q, page: query.businessPage }),
    listExternalSponsorAdsPage({ page: query.adPage }),
  ]);

  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard/admin">Platform overview</Link><span>/</span><strong>Sponsor placements</strong></nav>
    <div className="dashboard-head"><div><span className="eyebrow">Paid placement</span><h1>Sponsor placements</h1><p>Order up to five public sponsors from AfricMade pages and external advertisers. Sponsorship never changes marketplace or Daily Featured eligibility.</p></div><Link className="btn secondary" href="/featured" target="_blank">View Daily Featured</Link></div>
    {query.error ? <p className="error">{query.error}</p> : null}
    {query.saved ? <p className="notice">Sponsor placements updated.</p> : null}

    <section className="panel sponsor-public-preview">
      <div><span className="eyebrow">Currently public</span><h2>Five-placement rail</h2><p>The lowest active positions appear in this exact order across every Daily Featured day.</p></div>
      {publicPlacements.length ? <ol>{publicPlacements.map((placement) => <li key={placement.id}><img src={placement.imagePath} alt=""/><span><small>{placement.kind === "showroom" ? "AfricMade page" : "External advertiser"}</small><strong>{placement.name}</strong><em>Position {placement.position}</em></span></li>)}</ol> : <div className="empty-state">No active sponsor placement is currently eligible.</div>}
    </section>

    <section className="panel">
      <div className="dashboard-section-head"><div><span className="eyebrow">External advertiser</span><h2>Create sponsor ad</h2><p>Use a real advertiser image and provide a public HTTPS website, phone number, or both.</p></div></div>
      <form action={createExternalSponsorAdAction} className="form-grid">
        <div className="field"><label htmlFor="new-sponsor-name">Business name</label><input id="new-sponsor-name" name="name" minLength={2} maxLength={100} required/></div>
        <div className="field"><label htmlFor="new-sponsor-position">Public position</label><input id="new-sponsor-position" name="position" type="number" min="1" max="999" defaultValue="100" required/></div>
        <div className="field full"><label htmlFor="new-sponsor-description">Short details</label><textarea id="new-sponsor-description" name="description" minLength={2} maxLength={180} rows={3} required/></div>
        <div className="field"><label htmlFor="new-sponsor-website">Website</label><input id="new-sponsor-website" name="websiteUrl" type="url" inputMode="url" placeholder="https://example.com"/></div>
        <div className="field"><label htmlFor="new-sponsor-phone">Phone</label><input id="new-sponsor-phone" name="phone" type="tel" inputMode="tel" placeholder="+251…"/></div>
        <div className="field full"><label htmlFor="new-sponsor-image">Sponsor image</label><input id="new-sponsor-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" required/><small>JPG, PNG, or WebP up to 5 MB.</small></div>
        <label className="check-field"><input name="active" type="checkbox" defaultChecked/>Active immediately</label>
        <div className="field full"><button className="btn brand" type="submit">Create sponsor ad</button></div>
      </form>
    </section>

    <section className="panel">
      <div className="dashboard-section-head"><div><span className="eyebrow">External ads</span><h2>Manage advertiser cards</h2><p>Changes update the public rail without creating a AfricMade business account.</p></div></div>
      {externalAds.items.length ? <div className="sponsor-admin-list">{externalAds.items.map((ad) => <details key={ad.id} className="admin-form-disclosure">
        <summary><span><strong>{ad.name}</strong><small>{ad.active ? `Active · position ${ad.position}` : "Inactive"}</small></span><img src={ad.imagePath} alt=""/></summary>
        <form action={updateExternalSponsorAdAction} className="admin-form-disclosure-body form-grid">
          <input type="hidden" name="id" value={ad.id}/>
          <div className="field"><label htmlFor={`sponsor-name-${ad.id}`}>Business name</label><input id={`sponsor-name-${ad.id}`} name="name" minLength={2} maxLength={100} defaultValue={ad.name} required/></div>
          <div className="field"><label htmlFor={`sponsor-position-${ad.id}`}>Public position</label><input id={`sponsor-position-${ad.id}`} name="position" type="number" min="1" max="999" defaultValue={ad.position} required/></div>
          <div className="field full"><label htmlFor={`sponsor-description-${ad.id}`}>Short details</label><textarea id={`sponsor-description-${ad.id}`} name="description" minLength={2} maxLength={180} rows={3} defaultValue={ad.description} required/></div>
          <div className="field"><label htmlFor={`sponsor-website-${ad.id}`}>Website</label><input id={`sponsor-website-${ad.id}`} name="websiteUrl" type="url" defaultValue={ad.websiteUrl}/></div>
          <div className="field"><label htmlFor={`sponsor-phone-${ad.id}`}>Phone</label><input id={`sponsor-phone-${ad.id}`} name="phone" type="tel" defaultValue={ad.phone}/></div>
          <div className="field full"><label htmlFor={`sponsor-image-${ad.id}`}>Replace image</label><input id={`sponsor-image-${ad.id}`} name="image" type="file" accept="image/jpeg,image/png,image/webp"/><small>Leave empty to keep the current image.</small></div>
          <label className="check-field"><input name="active" type="checkbox" defaultChecked={ad.active}/>Active</label>
          <div className="field full"><button className="btn" type="submit">Save sponsor ad</button></div>
        </form>
      </details>)}</div> : <div className="empty-state">No external sponsor ads have been created.</div>}
      <PaginationNav result={externalAds} pathname="/dashboard/admin/sponsors" pageParam="adPage" params={{ q: query.q, businessPage: query.businessPage }}/>
    </section>

    <section className="panel">
      <div className="dashboard-section-head"><div><span className="eyebrow">AfricMade accounts</span><h2>Sponsor an AfricMade page</h2><p>Search the bounded account list and set paid placement independently from marketplace eligibility.</p></div></div>
      <CollectionToolbar action="/dashboard/admin/sponsors" search={query.q || ""} placeholder="Business, handle, or location" activeFilters={Boolean(query.q)}/>
      {businesses.items.length ? <div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr><th>Business</th><th>Marketplace</th><th>Paid placement</th></tr></thead><tbody>{businesses.items.map((business) => <tr key={business.businessId}>
        <td data-label="Business"><strong>{business.businessName}</strong><br/><small>@{business.handle}</small></td>
        <td data-label="Marketplace"><span className={`badge ${business.approved && !business.excluded ? "active" : "limited"}`}>{business.approved && !business.excluded ? "eligible profile" : "setup required"}</span></td>
        <td data-label="Paid placement"><form action={setBusinessSponsorshipAction} className="sponsor-business-form"><input type="hidden" name="businessId" value={business.businessId}/><label><span>Position</span><input name="position" type="number" min="1" max="999" defaultValue={business.sponsorPosition} required/></label><label className="check-field"><input name="active" type="checkbox" defaultChecked={business.sponsored}/>Sponsored</label><button className="small-btn" type="submit">Save</button></form></td>
      </tr>)}</tbody></table></div> : <div className="empty-state">No businesses match this search.</div>}
      <PaginationNav result={businesses} pathname="/dashboard/admin/sponsors" pageParam="businessPage" params={{ q: query.q, adPage: query.adPage }}/>
    </section>
  </DashboardShell>;
}
