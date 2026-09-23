
import { getUiText } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import CreateClientWorkspaceForm from "@/components/CreateClientWorkspaceForm";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

export default async function NewClientWorkspacePage() {
  const t = await getUiText();
  const user = await requireUser();
  if (!hasCapability(user,"operations:manage")) redirect("/dashboard");
  return <DashboardShell user={user} business={null}>
    <NavigationTrail items={[{label:t("Businesses"),href:"/dashboard/admin/businesses"},{label:t("Add business")}]} fallback="/dashboard/admin/businesses"/>
    <div className="dashboard-head"><div><span className="eyebrow">{t("Customer operations")}</span><h1>{t("Add a business")}</h1><p>{t("Create the private business workspace and prepare a secure invitation for its first authorized user.")}</p></div></div>
    <CreateClientWorkspaceForm/>
  </DashboardShell>;
}
