import { redirect } from "next/navigation";
import ClientRequestForm from "@/components/ClientRequestForm";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { runtimeCurrentShowroomProject, runtimeRequestTypeForBusiness } from "@/lib/request-runtime";

export default async function NewClientRequestPage() {
  const user=await requireUser();
  if(user.access_role!=="client"||!user.business_id)redirect("/dashboard");
  const business=await runtimeBusinessById(user.business_id);
  if(!business)redirect("/dashboard");
  const current=await runtimeCurrentShowroomProject(business.id);
  if(current)redirect(`/dashboard/requests/${current.id}`);
  const requestType=await runtimeRequestTypeForBusiness(business.id);
  return <DashboardShell user={user} business={business}><NavigationTrail items={[{label:"Showroom project",href:"/dashboard/requests"},{label:requestType==="onboarding"?"Create showroom":"Update showroom"}]} fallback="/dashboard/requests"/><div className="dashboard-head"><div><h1>{requestType==="onboarding"?"Create your showroom":"Update your showroom"}</h1><p>Describe the outcome in your own words. MirtPage will prepare a private revision for your approval.</p></div></div><ClientRequestForm requestType={requestType}/></DashboardShell>;
}
