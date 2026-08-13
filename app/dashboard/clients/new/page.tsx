import { redirect } from "next/navigation";
import CreateClientWorkspaceForm from "@/components/CreateClientWorkspaceForm";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

export default async function NewClientWorkspacePage() {
  const user = await requireUser();
  if (!hasCapability(user,"operations:manage")) redirect("/dashboard");
  return <DashboardShell user={user} business={null}>
    <NavigationTrail items={[{label:"Businesses",href:"/dashboard/admin/businesses"},{label:"Add business"}]} fallback="/dashboard/admin/businesses"/>
    <div className="dashboard-head"><div><span className="eyebrow">Customer operations</span><h1>Add a business</h1><p>Create the private business workspace and prepare a secure invitation for its first authorized user.</p></div></div>
    <CreateClientWorkspaceForm/>
  </DashboardShell>;
}
