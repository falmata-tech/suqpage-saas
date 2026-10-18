import {redirect} from "next/navigation";
import {requireUser} from "@/lib/auth";
import {canUseStaffTracking} from "@/app/dashboard/tracking/navigation";

export const dynamic='force-dynamic';

/** Obsolete conversation-bound plans no longer expose a staff workspace. */
export default async function RetiredCasePlanPage(){
  const actor=await requireUser();
  if(!canUseStaffTracking(actor))redirect('/dashboard');
  // The destination performs its own fresh authority/readiness check.
  // Do not load any historical plan, capability or conversation here.
  redirect('/dashboard/tracking');
}
