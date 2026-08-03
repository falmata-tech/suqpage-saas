import { redirect } from "next/navigation";
import Link from "next/link";
import { createStaffAccountAction } from "@/app/staff-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { listStaffPage } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function AdminStaff({ searchParams }: {
  searchParams: Promise<{ error?:string; saved?:string; page?:string; q?:string; role?:string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const staff = listStaffPage(query);
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard/admin">Platform overview</Link><span>/</span><strong>Staff &amp; access</strong></nav>
    <div className="dashboard-head"><div><span className="eyebrow">Platform access</span><h1>Staff &amp; access</h1><p>Provision individual accounts and review role-scoped workload.</p></div><Link className="small-btn" href="/dashboard/support/agents">Support agents</Link></div>
    {query.error ? <p className="error">{query.error}</p> : null}{query.saved ? <p className="notice">Staff account created.</p> : null}
    <details className="admin-create-disclosure" open={Boolean(query.error)}><summary>Create staff account</summary><form action={createStaffAccountAction} className="form-grid"><div className="field"><label htmlFor="staff-name">Name</label><input id="staff-name" name="name" required maxLength={100}/></div><div className="field"><label htmlFor="staff-email">Email</label><input id="staff-email" name="email" type="email" required maxLength={160}/></div><div className="field"><label htmlFor="staff-role">Access role</label><select id="staff-role" name="accessRole"><option value="team_member">Team member</option><option value="operations_manager">Operations manager</option></select></div><div className="field"><label htmlFor="staff-password">Temporary password</label><input id="staff-password" name="temporaryPassword" type="password" minLength={12} required/></div><div className="field full"><button className="btn brand">Create staff account</button></div></form></details>
    <CollectionToolbar action="/dashboard/admin/staff" search={query.q || ""} placeholder="Staff name or email" activeFilters={Boolean(query.q || query.role)}><label><span>Role</span><select name="role" defaultValue={query.role || ""}><option value="">All roles</option><option value="team_member">Team member</option><option value="operations_manager">Operations manager</option></select></label></CollectionToolbar>
    {staff.items.length ? <><div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr><th>Staff member</th><th>Role</th><th>Assignments</th><th>Open requests</th><th>Sign-in</th></tr></thead><tbody>{staff.items.map((member)=><tr key={member.id}><td data-label="Staff member"><strong>{member.name}</strong><br/><small>{member.email}</small></td><td data-label="Role">{member.access_role.replaceAll("_"," ")}</td><td data-label="Assignments">{member.active_assignments}</td><td data-label="Open requests">{member.open_requests}</td><td data-label="Sign-in"><span className={`badge ${member.must_change_password ? "draft" : "active"}`}>{member.must_change_password ? "Password change required" : "Ready"}</span></td></tr>)}</tbody></table></div><PaginationNav result={staff} pathname="/dashboard/admin/staff" params={{q:query.q,role:query.role}}/></> : <div className="empty-state">No staff accounts match this view.</div>}
  </DashboardShell>;
}
