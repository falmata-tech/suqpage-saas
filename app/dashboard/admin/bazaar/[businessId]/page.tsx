import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateBazaarBoothProfileAction } from "@/app/staff-actions";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import { requireUser } from "@/lib/auth";
import { getBazaarProfileAdminView } from "@/lib/bazaar";
import { hasCapability } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

export default async function ExpoProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const businessId = Number.parseInt((await params).businessId, 10);
  if (!Number.isInteger(businessId)) notFound();
  const profile = getBazaarProfileAdminView(businessId);
  if (!profile) notFound();
  const query = await searchParams;
  return (
    <DashboardShell user={user} business={null}>
      <NavigationTrail items={[{ label: "Expo controls", href: "/dashboard/admin/bazaar" }, { label: profile.businessName }]} fallback="/dashboard/admin/bazaar"/>
      <div className="dashboard-head">
        <div><span className="eyebrow">Expo participant profile</span><h1>{profile.businessName}</h1><p>@{profile.handle} · {profile.industryLabel}</p></div>
        <Link className="btn secondary" href={`/preview/@${profile.handle}`} target="_blank">Open showroom</Link>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Expo profile saved and the current occurrence regenerated.</p> : null}
      <div className="split focused-expo-layout">
        <section className="panel">
          <h2>Eligibility summary</h2>
          <p><span className={`badge ${profile.excluded ? "cancelled" : profile.eligible ? "active" : "limited"}`}>{profile.excluded ? "excluded" : profile.eligible ? "Expo eligible" : "incomplete"}</span></p>
          {profile.eligibilityIssues.length ? <p>Missing: {profile.eligibilityIssues.join(", ")}.</p> : <p>Required media and geographic fields are complete.</p>}
          <dl className="request-facts">
            <dt>Today</dt><dd>{profile.booth ? `${profile.booth.boothReference}${profile.booth.floorRow ? ` · floor row ${profile.booth.floorRow}` : ""}` : "Not assigned to today's Industry"}</dd>
            <dt>Origin</dt><dd>{[profile.city, profile.zone, profile.region].filter(Boolean).join(", ") || "Not set"}</dd>
            <dt>Featured</dt><dd>{profile.featured ? "Yes" : "No"}</dd>
          </dl>
        </section>
        <section className="panel">
          <h2>Edit Expo profile</h2>
          <form action={updateBazaarBoothProfileAction} className="form-grid">
            <input type="hidden" name="businessId" value={profile.businessId}/>
            <div className="field full"><label htmlFor="profile-keys">Industry keys</label><input id="profile-keys" name="industryKeys" defaultValue={profile.industryKeys.join(", ")} required/></div>
            <div className="field full"><label htmlFor="profile-image">Approved booth image path</label><input id="profile-image" name="boothImagePath" defaultValue={profile.boothImagePath} placeholder="/uploads/..." required/></div>
            <div className="field"><label htmlFor="profile-city">City</label><input id="profile-city" name="city" defaultValue={profile.city} required/></div>
            <div className="field"><label htmlFor="profile-zone">Zone / administrative area</label><input id="profile-zone" name="zone" defaultValue={profile.zone} required/></div>
            <div className="field full"><label htmlFor="profile-region">Region</label><input id="profile-region" name="region" defaultValue={profile.region} required/></div>
            <div className="field"><label htmlFor="profile-latitude">Latitude</label><input id="profile-latitude" name="latitude" type="number" min="-90" max="90" step="any" defaultValue={profile.latitude ?? ""} required/></div>
            <div className="field"><label htmlFor="profile-longitude">Longitude</label><input id="profile-longitude" name="longitude" type="number" min="-180" max="180" step="any" defaultValue={profile.longitude ?? ""} required/></div>
            <div className="field full"><label htmlFor="profile-fallback">Fallback style</label><input id="profile-fallback" name="fallbackStyle" defaultValue={profile.fallbackStyle}/></div>
            <label className="check-field"><input type="checkbox" name="featured" defaultChecked={profile.featured}/>Featured showroom</label>
            <label className="check-field"><input type="checkbox" name="excluded" defaultChecked={profile.excluded}/>Exclude from Expo</label>
            <div className="field full"><button className="btn brand">Save Expo profile</button></div>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}
