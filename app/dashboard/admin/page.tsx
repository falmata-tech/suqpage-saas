import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { adminCreateBusinessAction, adminResetPasswordAction, adminUpdateBusinessAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getAllBusinesses, getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
const designs = ["alhaya", "usashopet", "novatech", "homevibe"];

export default async function Admin({ searchParams }: { searchParams:Promise<{error?:string;saved?:string}> }) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const businesses = getAllBusinesses();
  const owners = getDb().prepare(`
    SELECT u.id,u.email,u.name,u.business_id,u.must_change_password
    FROM users u LEFT JOIN user_access_profiles p ON p.user_id=u.id
    WHERE u.role='owner' AND COALESCE(p.access_role,'legacy_owner')='legacy_owner'
    ORDER BY u.name
  `).all() as Array<{id:number;email:string;name:string;business_id:number;must_change_password:number}>;
  return <DashboardShell user={user} business={null}>
    <div className="dashboard-head"><div><h1>SaaS administration</h1><p>Manage legacy owner tenants and showroom publication state. Accepted prospects use the client-request workflow.</p></div></div>
    {query.error ? <p className="error">{query.error}</p> : null}{query.saved ? <p className="notice">Administrative change saved.</p> : null}
    <div className="split">
      <section className="panel"><h2>Create legacy owner tenant</h2><form action={adminCreateBusinessAction} className="form-grid"><div className="field"><label htmlFor="admin-business-name">Business name</label><input id="admin-business-name" name="name" required/></div><div className="field"><label htmlFor="admin-handle">Handle</label><input id="admin-handle" name="handle" required placeholder="businessname"/></div><div className="field"><label htmlFor="admin-design">Design renderer</label><select id="admin-design" name="designKey">{designs.map((design) => <option key={design}>{design}</option>)}</select></div><div className="field"><label htmlFor="admin-owner-name">Owner name</label><input id="admin-owner-name" name="ownerName" required/></div><div className="field"><label htmlFor="admin-owner-email">Owner email</label><input id="admin-owner-email" type="email" name="email" required/></div><div className="field"><label htmlFor="admin-owner-password">Temporary password</label><input id="admin-owner-password" type="password" name="temporaryPassword" minLength={12} required/></div><div className="field full"><small>This compatibility path keeps the existing owner controls. New managed clients should be invited from Client requests.</small></div><div className="field full"><button className="btn brand">Create tenant</button></div></form></section>
      <section className="panel"><h2>Reset legacy owner password</h2><form action={adminResetPasswordAction} className="form-grid"><div className="field full"><label htmlFor="admin-owner">Owner</label><select id="admin-owner" name="userId">{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} · {owner.email}</option>)}</select></div><div className="field full"><label htmlFor="admin-temporary-password">New temporary password</label><input id="admin-temporary-password" type="password" name="temporaryPassword" minLength={12} required/></div><div className="field full"><button className="btn">Reset and revoke sessions</button></div></form></section>
    </div>
    <section className="panel"><h2>Businesses</h2><div className="table-wrap"><table className="data-table"><thead><tr><th>Business</th><th>Legacy owner</th><th>Renderer and status</th></tr></thead><tbody>{businesses.map((business) => {
      const owner = owners.find((candidate) => candidate.business_id === business.id);
      return <tr key={business.id}><td><strong>{business.name}</strong><br/><small>@{business.handle}</small></td><td>{owner?.email || "Managed client / no legacy owner"}{owner?.must_change_password ? <><br/><small>Temporary password</small></> : null}</td><td><form action={adminUpdateBusinessAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><select aria-label={`${business.name} design renderer`} name="designKey" defaultValue={business.design_key}>{designs.map((design) => <option key={design}>{design}</option>)}</select><select aria-label={`${business.name} status`} name="status" defaultValue={business.status}><option value="draft">draft</option><option value="active">active</option><option value="suspended">suspended</option></select><button className="small-btn">Save</button></form></td></tr>;
    })}</tbody></table></div></section>
  </DashboardShell>;
}
