export const SUPPORT_STAFF_REPLY_TARGET_MS=10*60_000;

const maximumDate=8_640_000_000_000_000;
const timestamp=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=maximumDate;

/** The customer anchor stays unchanged; the current agent receives a fresh window. */
export function supportAssignmentReplyDueAt(awaitingStaffSince:number|null|undefined,assignedAt:number|null|undefined):number|null {
  if(!timestamp(awaitingStaffSince)||assignedAt!=null&&!timestamp(assignedAt))return null;
  const start=Math.max(awaitingStaffSince,assignedAt??0);
  return start<=maximumDate-SUPPORT_STAFF_REPLY_TARGET_MS?start+SUPPORT_STAFF_REPLY_TARGET_MS:null;
}

/** No capability, address or customer content is encoded in this durable identity. */
export function supportReplyOverdueSource(conversationId:number,messageId:number,assignmentId:number):string {
  if(!Number.isSafeInteger(conversationId)||conversationId<1||!Number.isSafeInteger(messageId)||messageId<1||
    !Number.isSafeInteger(assignmentId)||assignmentId<0)throw Error('Invalid reply escalation identity.');
  return `support-reply-overdue:${conversationId}:${messageId}:${assignmentId}`;
}
