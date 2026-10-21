import { SUPPORT_WAITING_SCOPE_SQL } from "./support";
import { hasCapability } from "./capabilities";
import { runtimeGet } from "./runtime-sql";
import type { SessionUser } from "./types";

export type DashboardAttention = {
  newAccounts?: number;
  locationReviews?: number;
  pageReviews: number;
  customerInquiries?: number;
  supportReplies: number;
};

async function count(sql: string, ...params: Array<string | number>) {
  return Number(((await runtimeGet<{ total: number }>(sql, params)) as { total: number }).total);
}

export async function getDashboardAttention(
  user: SessionUser,
  businessId?: number | null,
): Promise<DashboardAttention> {
  if (hasCapability(user, "operations:manage") && !businessId) {
    return {
      locationReviews: 0,
      newAccounts: await count(`
        SELECT COUNT(*) total FROM businesses b
        WHERE b.status='draft'
          AND EXISTS(
            SELECT 1 FROM users u
            JOIN user_access_profiles p ON p.user_id=u.id
            WHERE u.business_id=b.id AND p.access_role='client'
          )
      `),
      pageReviews: 0,
      supportReplies: await count(`
        SELECT COUNT(*) total FROM support_conversations c
        WHERE c.status='waiting'
          OR (c.status='open' AND EXISTS(
            SELECT 1 FROM support_messages m
            LEFT JOIN users u ON u.id=m.sender_user_id
            LEFT JOIN user_access_profiles p ON p.user_id=u.id
            WHERE m.conversation_id=c.id
              AND m.id>c.staff_confirmed_read_message_id
              AND (m.sender_kind='visitor' OR p.access_role='client')
          ))
      `),
    };
  }

  if (user.access_role === "team_member") {
    return {
      pageReviews: 0,
      supportReplies: await count(`
        SELECT COUNT(*) total FROM support_conversations c
        WHERE (c.status='waiting' AND ${SUPPORT_WAITING_SCOPE_SQL})
          OR (c.assigned_user_id=? AND c.status='open' AND EXISTS(
            SELECT 1 FROM support_messages m
            LEFT JOIN users u ON u.id=m.sender_user_id
            LEFT JOIN user_access_profiles p ON p.user_id=u.id
            WHERE m.conversation_id=c.id
              AND m.id>c.staff_confirmed_read_message_id
              AND (m.sender_kind='visitor' OR p.access_role='client')
          ))
      `, user.id, user.id),
    };
  }

  const scopedBusinessId = businessId || user.business_id;
  if (!scopedBusinessId) return { pageReviews: 0, supportReplies: 0 };
  const client = user.access_role === "client";
  return {
    pageReviews: 0,
    customerInquiries: await count(
      "SELECT COUNT(*) total FROM inquiries WHERE business_id=? AND status='new'",
      scopedBusinessId,
    ),
    supportReplies: await count(`
      SELECT COUNT(*) total FROM support_conversations c
      WHERE c.business_id=? AND c.status!='closed'
        ${client?"AND c.assistance_category NOT IN ('shipment_observation','buying_assistance')":''}
        AND EXISTS(
          SELECT 1 FROM support_messages m
          WHERE m.conversation_id=c.id
            AND m.id>c.${client ? "client_confirmed_read_message_id" : "staff_confirmed_read_message_id"}
            AND ${client
              ? "m.sender_user_id<>?"
              : "EXISTS(SELECT 1 FROM user_access_profiles p WHERE p.user_id=m.sender_user_id AND (m.sender_kind='visitor' OR p.access_role='client'))"}
        )
    `, ...[scopedBusinessId, ...(client ? [user.id] : [])]),
  };
}
