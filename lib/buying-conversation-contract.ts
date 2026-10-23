// Portable DTO: no Next.js, DOM, database or provider dependency.
import type {TransportPlan} from '@suqpage/contracts';
export type BuyingConversation = {
  publicRef: string;
  createdAt?: number;
  serverNow?: number;
  transportWaitStartedAt?: number;
  agentJoinedAt?: number | null;
  firstStaffReplyAt?: number | null;
  category: string;
  status: "waiting" | "open" | "closed";
  assignedUserName: string | null;
  agentJoined?: boolean;
  resolvedAt?: number | null;
  replyState?: 'needs_reply' | 'overdue' | 'waiting_customer' | null;
  staffReplyDueAt?: number | null;
  idleWarningAt?: number | null;
  idleEndsAt?: number | null;
  idleEndedAt?: number | null;
  transportPlan?: TransportPlan;
  transportPlanLink?: string;
  /** Private to this already-authorized participant; returned only for transport callbacks. */
  transportCallback?: { phone: string | null; email: string | null; submitted: boolean };
  messages: Array<{ id: number; sender: "visitor" | "staff"; senderName: string; body: string; createdAt: number; read?: boolean }>;
};
export const buyingRefreshDelay = (failures: number) => Math.min(30_000, 5_000 * 2 ** Math.min(3, Math.max(0, failures)));
