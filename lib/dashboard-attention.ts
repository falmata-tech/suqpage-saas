import { hasCapability } from "./capabilities";
import { getDb } from "./db";
import type { SessionUser } from "./types";

export type DashboardAttention = {
  newAccounts?: number;
  showroomRequests: number;
  customerInquiries?: number;
  supportReplies: number;
};

function count(sql: string, ...params: Array<string | number>) {
  return Number((getDb().prepare(sql).get(...params) as { total: number }).total);
}

export function getDashboardAttention(
  user: SessionUser,
  businessId?: number | null,
): DashboardAttention {
  if (hasCapability(user, "operations:manage") && !businessId) {
    return {
      newAccounts: count(`
        SELECT COUNT(*) total FROM businesses b
        WHERE b.status='draft'
          AND EXISTS(
            SELECT 1 FROM users u
            JOIN user_access_profiles p ON p.user_id=u.id
            WHERE u.business_id=b.id AND p.access_role='client'
          )
      `),
      showroomRequests: count("SELECT COUNT(*) total FROM service_requests WHERE status='submitted'"),
      supportReplies: count(`
        SELECT COUNT(*) total FROM support_conversations c
        WHERE c.status='waiting'
          OR (c.status='open' AND EXISTS(
            SELECT 1 FROM support_messages m
            JOIN users u ON u.id=m.sender_user_id
            JOIN user_access_profiles p ON p.user_id=u.id
            WHERE m.conversation_id=c.id
              AND m.id>c.staff_last_read_message_id
              AND p.access_role='client'
          ))
      `),
    };
  }

  if (user.access_role === "team_member") {
    return {
      showroomRequests: count(`
        SELECT COUNT(*) total FROM service_requests
        WHERE assigned_user_id=?
          AND status IN ('submitted','under_review','approved_for_work','in_progress')
      `, user.id),
      supportReplies: count(`
        SELECT COUNT(*) total FROM support_conversations c
        WHERE c.status='waiting'
          OR (c.assigned_user_id=? AND c.status='open' AND EXISTS(
            SELECT 1 FROM support_messages m
            JOIN users u ON u.id=m.sender_user_id
            JOIN user_access_profiles p ON p.user_id=u.id
            WHERE m.conversation_id=c.id
              AND m.id>c.staff_last_read_message_id
              AND p.access_role='client'
          ))
      `, user.id),
    };
  }

  const scopedBusinessId = businessId || user.business_id;
  if (!scopedBusinessId) return { showroomRequests: 0, supportReplies: 0 };
  const client = user.access_role === "client";
  return {
    showroomRequests: count(
      `SELECT COUNT(*) total FROM service_requests
       WHERE business_id=? AND status IN (${client ? "'needs_information','client_review'" : "'submitted','client_approved'"})`,
      scopedBusinessId,
    ),
    customerInquiries: count(
      "SELECT COUNT(*) total FROM inquiries WHERE business_id=? AND status='new'",
      scopedBusinessId,
    ),
    supportReplies: count(`
      SELECT COUNT(*) total FROM support_conversations c
      WHERE c.business_id=? AND c.status!='closed'
        AND EXISTS(
          SELECT 1 FROM support_messages m
          WHERE m.conversation_id=c.id
            AND m.id>c.${client ? "client_last_read_message_id" : "staff_last_read_message_id"}
            AND ${client
              ? "m.sender_user_id<>?"
              : "EXISTS(SELECT 1 FROM user_access_profiles p WHERE p.user_id=m.sender_user_id AND p.access_role='client')"}
        )
    `, ...[scopedBusinessId, ...(client ? [user.id] : [])]),
  };
}
