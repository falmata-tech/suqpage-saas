import { changeInquiryStatus,acknowledgeInquiryRead,type InquiryReadChange, type InquiryStatusChange, type InquiryStatusPort } from "./inquiry-status";
import { runtimeRun, runtimeTransaction } from "./runtime-sql";
import { audit } from "./security";
import type { SessionUser } from "./types";
import {runtimeGet} from "./runtime-sql";
import {currentBusinessAuthority} from "./staff-business-authority";

const port: InquiryStatusPort = {
  authorize:async(actor,change)=>Boolean(await currentBusinessAuthority(actor,change.businessId,true)),
  update: (actor, change) => runtimeTransaction(async () => {
    const result = await runtimeRun("UPDATE inquiries SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?",
      [change.status, change.inquiryId, change.businessId]);
    if (!result.changes) return false;
    await audit("inquiry.status_updated", { userId: actor.id, businessId: change.businessId, detail: { status: change.status } });
    return true;
  }),
};

export function updateInquiryStatus(actor: SessionUser, change: InquiryStatusChange) {
  return runtimeTransaction(()=>changeInquiryStatus(port,actor,change));
}
export function markInquiryRead(actor:SessionUser,change:InquiryReadChange){
 return runtimeTransaction(()=>acknowledgeInquiryRead({authorize:async(user,target)=>Boolean(await currentBusinessAuthority(user,target.businessId,true)),read:async target=>{
  const row=await runtimeGet<{read_at:string}>("UPDATE inquiries SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP::text) WHERE id=? AND business_id=? RETURNING read_at",[target.inquiryId,target.businessId]);
  return row?.read_at;
 }},actor,change));
}
