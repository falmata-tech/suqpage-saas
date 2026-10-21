import { canOperateBusiness } from "./capabilities";
import type { SessionUser } from "./types";

export type InquiryStatusChange = { businessId: number; inquiryId: number; status: string };
export interface InquiryStatusPort {
  update(actor: SessionUser, change: InquiryStatusChange): Promise<boolean>;
}

export async function changeInquiryStatus(port: InquiryStatusPort, actor: SessionUser, change: InquiryStatusChange) {
  if (!(actor.access_role === "client" && actor.business_id === change.businessId) && !canOperateBusiness(actor, change.businessId)) throw new Error("Inquiry access required.");
  if (![change.businessId, change.inquiryId].every(id => Number.isSafeInteger(id) && id > 0)
    || !["new", "contacted", "confirmed", "closed", "cancelled"].includes(change.status)) throw new Error("Invalid inquiry update.");
  if (!await port.update(actor, change)) throw new Error("Inquiry not found.");
}
