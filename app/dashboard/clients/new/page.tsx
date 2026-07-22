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
    <NavigationTrail items={[{label:"Operations",href:"/dashboard/requests"},{label:"New client workspace"}]} fallback="/dashboard/requests"/>
    <div className="dashboard-head"><div><h1>Create a client workspace</h1><p>Invite a referred client without fabricating a public lead or service request.</p></div></div>
    <CreateClientWorkspaceForm/>
  </DashboardShell>;
}
