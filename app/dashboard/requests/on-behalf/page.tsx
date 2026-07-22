import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import OnBehalfRequestForm from "@/components/OnBehalfRequestForm";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { listManagedClients } from "@/lib/staff-operations";

export const dynamic = "force-dynamic";

export default async function OnBehalfRequestPage() {
  const user = await requireUser();
  if (!hasCapability(user,"operations:manage")) redirect("/dashboard/requests");
  return <DashboardShell user={user} business={null}>
    <NavigationTrail items={[{label:"Operations",href:"/dashboard/requests"},{label:"On-behalf request"}]} fallback="/dashboard/requests"/>
    <div className="dashboard-head"><div><h1>Record a request for a client</h1><p>Select an invited client, or capture a new prospect’s onboarding request. SuqPage is shown as the submitter.</p></div></div>
    <OnBehalfRequestForm clients={listManagedClients()}/>
  </DashboardShell>;
}
