import type {SessionUser} from "./types";
import {InquiryError} from "./inquiries";
export type InquiryReadChange={businessId:number;inquiryId:number};
interface InquiryAuthorityPort{authorize(actor:SessionUser,change:InquiryReadChange):Promise<boolean>;}
export interface InquiryReadPort extends InquiryAuthorityPort{read(change:InquiryReadChange):Promise<string|null|undefined>;}
export type InquiryStatusChange=InquiryReadChange&{status:string};
export interface InquiryStatusPort extends InquiryAuthorityPort{update(actor:SessionUser,change:InquiryStatusChange):Promise<boolean>;}
async function checkAccess(port:InquiryAuthorityPort,actor:SessionUser,change:InquiryReadChange){
 if(![change.businessId,change.inquiryId].every(id=>Number.isSafeInteger(id)&&id>0))throw new InquiryError("Inquiry not found.",404);
 if(!await port.authorize(actor,change))throw new InquiryError("Inquiry access required.",403);
}
export async function acknowledgeInquiryRead(port:InquiryReadPort,actor:SessionUser,change:InquiryReadChange){
 await checkAccess(port,actor,change);const readAt=await port.read(change);if(readAt===undefined)throw new InquiryError("Inquiry not found.",404);return {readAt};
}
export async function changeInquiryStatus(port:InquiryStatusPort,actor:SessionUser,change:InquiryStatusChange){
 await checkAccess(port,actor,change);
 if(!["new","contacted","confirmed","closed","cancelled"].includes(change.status))throw new InquiryError("Invalid inquiry update.");
 if(!await port.update(actor,change))throw new InquiryError("Inquiry not found.",404);
}
