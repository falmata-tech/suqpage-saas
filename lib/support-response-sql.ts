import {SUPPORT_STAFF_REPLY_TARGET_MS,SUPPORT_UNASSIGNED_QUEUE_TARGET_MS} from './support-assignment-response';
/** PostgreSQL projection shared by deadline, attention and lifecycle adapters. */
export const SUPPORT_ACTIVE_ASSIGNMENT_JOIN=`LEFT JOIN LATERAL (
  SELECT a.id,a.assigned_at FROM support_assignments a
  WHERE a.conversation_id=c.id AND a.assigned_user_id=c.assigned_user_id AND a.released_at IS NULL
  ORDER BY a.id DESC LIMIT 1
) current_assignment ON TRUE`;
export const SUPPORT_RESPONSE_EPOCH_SQL='COALESCE(current_assignment.id,0)';
export const SUPPORT_RESPONSE_START_SQL='GREATEST(c.awaiting_staff_since,COALESCE(current_assignment.assigned_at,c.awaiting_staff_since))';
export const SUPPORT_RESPONSE_DEADLINE_SQL=`${SUPPORT_RESPONSE_START_SQL}+CASE WHEN ${SUPPORT_RESPONSE_EPOCH_SQL}>0 THEN ${SUPPORT_STAFF_REPLY_TARGET_MS} ELSE ${SUPPORT_UNASSIGNED_QUEUE_TARGET_MS} END`;
