import { changeInquiryStatus, type InquiryStatusChange, type InquiryStatusPort } from "./inquiry-status";
import { runtimeRun, runtimeTransaction } from "./runtime-sql";
import { audit } from "./security";
import type { SessionUser } from "./types";

const port: InquiryStatusPort = {
  update: (actor, change) => runtimeTransaction(async () => {
    const result = await runtimeRun("UPDATE inquiries SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?",
      [change.status, change.inquiryId, change.businessId]);
    if (!result.changes) return false;
    await audit("inquiry.status_updated", { userId: actor.id, businessId: change.businessId, detail: { status: change.status } });
    return true;
  }),
};

export function updateInquiryStatus(actor: SessionUser, change: InquiryStatusChange) {
  return changeInquiryStatus(port, actor, change);
}
