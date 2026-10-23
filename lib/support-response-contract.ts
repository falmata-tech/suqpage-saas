/** Internal work targets only. These are not response-time promises to customers. */
import {supportAssignmentReplyDueAt} from './support-assignment-response';
export {SUPPORT_STAFF_REPLY_TARGET_MS,SUPPORT_UNASSIGNED_QUEUE_TARGET_MS} from './support-assignment-response';
export const SUPPORT_REPLY_SWEEP_LIMIT = 25;
export type SupportReplyState = 'needs_reply' | 'overdue' | 'waiting_customer' | null;

export type SupportReplySnapshot = {
  status: string;
  resolvedAt?: number | null;
  awaitingStaffSince?: number | null;
  awaitingParticipantSince?: number | null;
  assignedAt?: number | null;
};

const timestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 8_640_000_000_000_000;

/** Projects persisted clocks; message timestamps and read/join state are not clocks. */
export function supportReplyState(snapshot: SupportReplySnapshot, now = Date.now()): {
  replyState: SupportReplyState;
  staffReplyDueAt: number | null;
} {
  if (!['waiting', 'open'].includes(snapshot.status) || snapshot.resolvedAt != null) {
    return { replyState: null, staffReplyDueAt: null };
  }
  const due=supportAssignmentReplyDueAt(snapshot.awaitingStaffSince,snapshot.assignedAt);
  if (due!==null) {
    return { replyState: timestamp(now) && now >= due ? 'overdue' : 'needs_reply', staffReplyDueAt: due };
  }
  return {
    replyState: timestamp(snapshot.awaitingParticipantSince) ? 'waiting_customer' : null,
    staffReplyDueAt: null,
  };
}
