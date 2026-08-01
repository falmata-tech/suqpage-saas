import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateDiscoveryProfileAction } from "@/app/staff-actions";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { DISCOVERY_INDUSTRIES } from "@/lib/discovery";
import { getDiscoveryProfileAdminView } from "@/lib/discovery-admin";

export const dynamic = "force-dynamic";

export default async function DiscoveryProfilePage({ params, searchParams }: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const businessId = Number.parseInt((await params).businessId, 10);
  if (!Number.isInteger(businessId)) notFound();
  const profile = getDiscoveryProfileAdminView(businessId);
  if (!profile) notFound();
  const query = await searchParams;
  return <DashboardShell user={user} business={null}>
    <NavigationTrail items={[{ label: "Discovery profiles", href: "/dashboard/admin/discovery" }, { label: profile.businessName }]} fallback="/dashboard/admin/discovery" />
    <div className="dashboard-head"><div><span className="eyebrow">Business discovery profile</span><h1>{profile.businessName}</h1><p>@{profile.handle} · {profile.city || "Origin incomplete"}</p></div><Link className="btn secondary" href={`/preview/@${profile.handle}`} target="_blank">Open Suq</Link></div>
    {query.error ? <p className="error">{query.error}</p> : null}
    {query.saved ? <p className="notice">Discovery profile saved.</p> : null}
    <div className="split focused-expo-layout">
      <section className="panel"><h2>Visibility summary</h2><p><span className={`badge ${profile.excluded ? "cancelled" : profile.approved ? "active" : "limited"}`}>{profile.excluded ? "excluded" : profile.approved ? "discoverable" : "incomplete"}</span></p><dl className="request-facts"><dt>Industries</dt><dd>{profile.industryKeys.join(", ") || "Not assigned"}</dd><dt>Origin</dt><dd>{[profile.city, profile.zone, profile.region].filter(Boolean).join(", ") || "Not set"}</dd><dt>Featured</dt><dd>{profile.featured ? "Yes" : "No"}</dd></dl></section>
      <section className="panel"><h2>Edit discovery profile</h2><form action={updateDiscoveryProfileAction} className="form-grid"><input type="hidden" name="businessId" value={profile.businessId}/><fieldset className="field full"><legend>Industries</legend><div className="recipe-checks">{DISCOVERY_INDUSTRIES.map((industry) => <label key={industry.key} className="check-field"><input type="checkbox" name="industryKeys" value={industry.key} defaultChecked={profile.industryKeys.includes(industry.key)}/>{industry.label}</label>)}</div></fieldset><div className="field full"><label htmlFor="profile-image">Approved booth image path</label><input id="profile-image" name="boothImagePath" defaultValue={profile.boothImagePath} placeholder="/uploads/..." required/></div><div className="field"><label htmlFor="profile-city">City</label><input id="profile-city" name="city" defaultValue={profile.city} required/></div><div className="field"><label htmlFor="profile-zone">Zone / administrative area</label><input id="profile-zone" name="zone" defaultValue={profile.zone} required/></div><div className="field full"><label htmlFor="profile-region">Region</label><input id="profile-region" name="region" defaultValue={profile.region} required/></div><div className="field"><label htmlFor="profile-latitude">Latitude</label><input id="profile-latitude" name="latitude" type="number" min="3" max="15" step="any" defaultValue={profile.latitude ?? ""} required/></div><div className="field"><label htmlFor="profile-longitude">Longitude</label><input id="profile-longitude" name="longitude" type="number" min="32" max="49" step="any" defaultValue={profile.longitude ?? ""} required/></div><div className="field full"><label htmlFor="profile-fallback">Fallback style</label><select id="profile-fallback" name="fallbackStyle" defaultValue={profile.fallbackStyle}>{["workshop", "botanical", "textile", "food", "home", "technical"].map((style) => <option key={style}>{style}</option>)}</select></div><label className="check-field"><input type="checkbox" name="featured" defaultChecked={profile.featured}/>Featured Suq</label><label className="check-field"><input type="checkbox" name="excluded" defaultChecked={profile.excluded}/>Exclude from discovery</label><div className="field full"><button className="btn brand">Save discovery profile</button></div></form></section>
    </div>
  </DashboardShell>;
}
