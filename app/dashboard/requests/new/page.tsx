import { redirect } from "next/navigation";
import ClientRequestForm from "@/components/ClientRequestForm";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import { requireUser } from "@/lib/auth";
import { getBusinessById } from "@/lib/db";
import { requestTypeForBusiness } from "@/lib/request-sqlite";

export default async function NewClientRequestPage() {
  const user=await requireUser();
  if(user.access_role!=="client"||!user.business_id)redirect("/dashboard");
  const business=getBusinessById(user.business_id);
  if(!business)redirect("/dashboard");
  const requestType=requestTypeForBusiness(business.id);
  return <DashboardShell user={user} business={business}><NavigationTrail items={[{label:"My requests",href:"/dashboard/requests"},{label:"New request"}]} fallback="/dashboard/requests"/><div className="dashboard-head"><div><h1>{requestType==="onboarding"?"Request your first showroom":"Request a showroom change"}</h1><p>No catalog forms or design settings—just describe the outcome and attach useful references.</p></div></div><ClientRequestForm requestType={requestType}/></DashboardShell>;
}
