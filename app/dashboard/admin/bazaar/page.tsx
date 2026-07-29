import Link from "next/link";
import { redirect } from "next/navigation";
import {
  regenerateBazaarAction,
  updateBazaarBoothProfileAction,
  updateBazaarThemeAction,
} from "@/app/staff-actions";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { listBazaarAdminState } from "@/lib/bazaar";
import { hasCapability } from "@/lib/capabilities";
import { getCurrentExpo } from "@/lib/expo";

export const dynamic = "force-dynamic";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function ExpoAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const state = listBazaarAdminState();
  const expo = getCurrentExpo();
  const currentByBusiness = new Map(
    expo.booths.map((booth) => [booth.businessId, booth]),
  );

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">Daily Expo</span>
          <h1>Expo controls</h1>
          <p>
            Manage daily Industries, geographic eligibility, booth media, and
            the city-host assignment without changing permanent showrooms.
          </p>
        </div>
        <div className="inline-actions">
          <Link className="btn secondary" href="/expo" target="_blank">
            Open public Expo
          </Link>
          <form action={regenerateBazaarAction}>
            <button className="btn brand">Regenerate current Expo</button>
          </form>
        </div>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Expo controls saved.</p> : null}

      <section className="panel">
        <div className="dashboard-head">
          <div>
            <h2>Business Expo profiles</h2>
            <p>
              {expo.themeName} · {expo.status} · {expo.map.hubs.length} regional{" "}
              {expo.map.hubs.length === 1 ? "hub" : "hubs"} · {expo.booths.length}{" "}
              {expo.booths.length === 1 ? "booth" : "booths"}
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Required Expo profile</th>
                <th>Today&apos;s assignment</th>
              </tr>
            </thead>
            <tbody>
              {state.profiles.map((profile) => {
                const assignment = currentByBusiness.get(profile.businessId);
                return (
                  <tr key={profile.businessId}>
                    <td>
                      <strong>{profile.businessName}</strong>
                      <br />
                      <small>@{profile.handle} · {profile.status}</small>
                      <br />
                      <span
                        className={`badge ${
                          profile.excluded
                            ? "cancelled"
                            : profile.eligible
                              ? "active"
                              : "limited"
                        }`}
                      >
                        {profile.excluded
                          ? "excluded"
                          : profile.eligible
                            ? "Expo eligible"
                            : `Missing ${profile.eligibilityIssues.join(", ")}`}
                      </span>
                    </td>
                    <td>
                      <form
                        action={updateBazaarBoothProfileAction}
                        className="bazaar-admin-form expo-admin-profile"
                      >
                        <input type="hidden" name="businessId" value={profile.businessId} />
                        <div className="field">
                          <label htmlFor={`profile-keys-${profile.businessId}`}>Industry keys</label>
                          <input
                            id={`profile-keys-${profile.businessId}`}
                            name="industryKeys"
                            defaultValue={profile.industryKeys.join(", ")}
                            required
                          />
                        </div>
                        <div className="field">
                          <label htmlFor={`profile-image-${profile.businessId}`}>Approved booth image path</label>
                          <input
                            id={`profile-image-${profile.businessId}`}
                            name="boothImagePath"
                            defaultValue={profile.boothImagePath}
                            placeholder="/uploads/..."
                            required
                          />
                        </div>
                        <div className="field">
                          <label htmlFor={`profile-city-${profile.businessId}`}>City</label>
                          <input id={`profile-city-${profile.businessId}`} name="city" defaultValue={profile.city} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`profile-zone-${profile.businessId}`}>Zone / administrative area</label>
                          <input id={`profile-zone-${profile.businessId}`} name="zone" defaultValue={profile.zone} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`profile-region-${profile.businessId}`}>Region</label>
                          <input id={`profile-region-${profile.businessId}`} name="region" defaultValue={profile.region} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`profile-latitude-${profile.businessId}`}>Latitude</label>
                          <input
                            id={`profile-latitude-${profile.businessId}`}
                            name="latitude"
                            type="number"
                            min="-90"
                            max="90"
                            step="any"
                            defaultValue={profile.latitude ?? ""}
                            required
                          />
                        </div>
                        <div className="field">
                          <label htmlFor={`profile-longitude-${profile.businessId}`}>Longitude</label>
                          <input
                            id={`profile-longitude-${profile.businessId}`}
                            name="longitude"
                            type="number"
                            min="-180"
                            max="180"
                            step="any"
                            defaultValue={profile.longitude ?? ""}
                            required
                          />
                        </div>
                        <input type="hidden" name="fallbackStyle" value={profile.fallbackStyle} />
                        <label className="check-field">
                          <input type="checkbox" name="featured" defaultChecked={profile.featured} />
                          Featured
                        </label>
                        <label className="check-field">
                          <input type="checkbox" name="excluded" defaultChecked={profile.excluded} />
                          Exclude from Expo
                        </label>
                        <button className="small-btn">Save Expo profile</button>
                      </form>
                    </td>
                    <td>
                      {assignment ? (
                        <div className="expo-admin-assignment">
                          <strong>{assignment.hubName}</strong>
                          <span>{assignment.boothReference}</span>
                          <small>From {assignment.city}, {assignment.region}</small>
                        </div>
                      ) : (
                        <div className="empty-state">
                          Not participating in today&apos;s Industry Expo.
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Weekly Expo themes</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Theme</th>
                <th>Schedule and Industry</th>
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
                        <input id={`theme-name-${theme.id}`} name="name" defaultValue={theme.name.replace(/Market/g, "Expo")} required />
                      </div>
                      <label className="check-field">
                        <input type="checkbox" name="active" defaultChecked={theme.active} />
                        Active
                      </label>
                      <button className="small-btn">Save theme</button>
                    </form>
                  </td>
                  <td>
                    <form action={updateBazaarThemeAction} className="bazaar-theme-form">
                      <input type="hidden" name="themeId" value={theme.id} />
                      <input type="hidden" name="name" value={theme.name.replace(/Market/g, "Expo")} />
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
                      <button className="small-btn">Save schedule</button>
                    </form>
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
