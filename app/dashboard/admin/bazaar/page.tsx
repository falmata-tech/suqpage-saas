import Link from "next/link";
import { redirect } from "next/navigation";
import {
  regenerateBazaarAction,
  updateBazaarBoothPlacementAction,
  updateBazaarBoothProfileAction,
  updateBazaarThemeAction,
} from "@/app/staff-actions";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { listBazaarAdminState } from "@/lib/bazaar";
import { hasCapability } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function BazaarAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const state = listBazaarAdminState();

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">Daily Bazaar</span>
          <h1>Bazaar controls</h1>
          <p>
            Configure weekly themes, booth eligibility, featured visibility, and
            current floor placement without changing permanent showrooms.
          </p>
        </div>
        <div className="inline-actions">
          <Link className="btn secondary" href="/bazaar" target="_blank">Open public Bazaar</Link>
          <form action={regenerateBazaarAction}>
            <button className="btn brand">Regenerate current Bazaar</button>
          </form>
        </div>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Bazaar controls saved.</p> : null}

      <section className="panel">
        <div className="dashboard-head">
          <div>
            <h2>Current occurrence</h2>
            <p>
              {state.current.themeName} · {state.current.status} · {state.current.booths.length}
              {" "}
              {state.current.booths.length === 1 ? "booth" : "booths"}
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booth</th>
                <th>Profile</th>
                <th>Placement</th>
              </tr>
            </thead>
            <tbody>
              {state.profiles.map((profile) => (
                <tr key={profile.businessId}>
                  <td>
                    <strong>{profile.businessName}</strong>
                    <br />
                    <small>@{profile.handle} · {profile.status}</small>
                    <br />
                    <span className={`badge ${profile.excluded ? "cancelled" : profile.featured ? "limited" : "active"}`}>
                      {profile.excluded ? "excluded" : profile.featured ? "featured" : "eligible"}
                    </span>
                  </td>
                  <td>
                    <form action={updateBazaarBoothProfileAction} className="bazaar-admin-form">
                      <input type="hidden" name="businessId" value={profile.businessId} />
                      <div className="field">
                        <label htmlFor={`profile-keys-${profile.businessId}`}>Industry keys</label>
                        <input id={`profile-keys-${profile.businessId}`} name="industryKeys" defaultValue={profile.industryKeys.join(", ")} required />
                      </div>
                      <div className="field">
                        <label htmlFor={`profile-image-${profile.businessId}`}>Booth image path</label>
                        <input id={`profile-image-${profile.businessId}`} name="boothImagePath" defaultValue={profile.boothImagePath} placeholder="/uploads/..." />
                      </div>
                      <div className="field">
                        <label htmlFor={`profile-fallback-${profile.businessId}`}>Fallback style</label>
                        <input id={`profile-fallback-${profile.businessId}`} name="fallbackStyle" defaultValue={profile.fallbackStyle} />
                      </div>
                      <label className="check-field">
                        <input type="checkbox" name="featured" defaultChecked={profile.featured} />
                        Featured
                      </label>
                      <label className="check-field">
                        <input type="checkbox" name="excluded" defaultChecked={profile.excluded} />
                        Exclude from Bazaar
                      </label>
                      <button className="small-btn">Save profile</button>
                    </form>
                  </td>
                  <td>
                    {profile.booth ? (
                      <form action={updateBazaarBoothPlacementAction} className="bazaar-placement-form">
                        <input type="hidden" name="boothId" value={profile.booth.id} />
                        <div className="field">
                          <label htmlFor={`booth-x-${profile.booth.id}`}>X</label>
                          <input id={`booth-x-${profile.booth.id}`} name="x" type="number" min="0" max="1110" defaultValue={profile.booth.x} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`booth-y-${profile.booth.id}`}>Y</label>
                          <input id={`booth-y-${profile.booth.id}`} name="y" type="number" min="0" max="748" defaultValue={profile.booth.y} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`booth-width-${profile.booth.id}`}>Width</label>
                          <input id={`booth-width-${profile.booth.id}`} name="width" type="number" min="80" max="360" defaultValue={profile.booth.width} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`booth-height-${profile.booth.id}`}>Height</label>
                          <input id={`booth-height-${profile.booth.id}`} name="height" type="number" min="60" max="240" defaultValue={profile.booth.height} required />
                        </div>
                        <button className="small-btn">Save placement</button>
                      </form>
                    ) : (
                      <div className="empty-state">Not on today&apos;s floor.</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Weekly themes</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Theme</th>
                <th>Config</th>
              </tr>
            </thead>
            <tbody>
              {state.themes.map((theme) => (
                <tr key={theme.id}>
                  <td>
                    <strong>{weekdays[theme.weekday]}</strong>
                    <br />
                    <small>{theme.slug}</small>
                  </td>
                  <td>
                    <form action={updateBazaarThemeAction} className="bazaar-theme-form">
                      <input type="hidden" name="themeId" value={theme.id} />
                      <input type="hidden" name="industryKeys" value={theme.industryKeys.join(", ")} />
                      <input type="hidden" name="timezone" value={theme.timezone} />
                      <input type="hidden" name="startsAtTime" value={theme.startsAtTime} />
                      <div className="field">
                        <label htmlFor={`theme-name-${theme.id}`}>Theme name</label>
                        <input id={`theme-name-${theme.id}`} name="name" defaultValue={theme.name} required />
                      </div>
                      <label className="check-field">
                        <input type="checkbox" name="active" defaultChecked={theme.active} />
                        Active
                      </label>
                      <button className="small-btn">Save theme</button>
                    </form>
                  </td>
                  <td>
                    <div className="bazaar-theme-form">
                      <form action={updateBazaarThemeAction} className="bazaar-theme-form">
                        <input type="hidden" name="themeId" value={theme.id} />
                        <input type="hidden" name="name" value={theme.name} />
                        {theme.active ? <input type="hidden" name="active" value="on" /> : null}
                        <div className="field">
                          <label htmlFor={`theme-keys-${theme.id}`}>Industry keys</label>
                          <input id={`theme-keys-${theme.id}`} name="industryKeys" defaultValue={theme.industryKeys.join(", ")} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`theme-timezone-${theme.id}`}>Timezone</label>
                          <input id={`theme-timezone-${theme.id}`} name="timezone" defaultValue={theme.timezone} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`theme-start-${theme.id}`}>Start time</label>
                          <input id={`theme-start-${theme.id}`} name="startsAtTime" defaultValue={theme.startsAtTime} pattern="[0-9]{2}:[0-9]{2}" required />
                        </div>
                        <button className="small-btn">Save config</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
