"use server";

import {requireUser} from "@/lib/auth";
import type {OwnerEditResult} from "@/lib/owner-edit-contract";

// Retained action URLs must not provide a second shipment-creation workflow.
// Authenticate stale callers, then leave historical chat plans unchanged.
async function retiredPlanAction():Promise<OwnerEditResult>{
  await requireUser();
  return {error:'Create shipment plans from Tracking.'};
}

export async function saveTransportPlanAction(_form:FormData):Promise<OwnerEditResult>{
  return retiredPlanAction();
}

export async function replaceTransportPlanLinkAction(_form:FormData):Promise<OwnerEditResult>{
  return retiredPlanAction();
}
