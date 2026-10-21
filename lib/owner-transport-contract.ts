import type { BuyingConversation } from './buying-conversation-contract';

/** Portable account-owned transport data; never includes a guest capability. */
export type OwnerTransportConversation = BuyingConversation & {
  id: number;
  subject: string;
  resolvedAt: number | null;
};
export type OwnerTransportDefaults = { name: string; phone: string };
export type OwnerTransportState = {
  conversation: OwnerTransportConversation | null;
  defaults: OwnerTransportDefaults;
};
export type OwnerTransportSummary = {
  id: number;
  publicRef: string;
  subject: string;
  status: BuyingConversation['status'];
  assignedUserName: string | null;
  lastMessageAt: number;
  resolvedAt: number | null;
  unread: boolean;
  agentJoined?: boolean;
  replyState?: BuyingConversation['replyState'];
  staffReplyDueAt?: number | null;
};
export type OwnerTransportHistory = {
  items: OwnerTransportSummary[];
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  firstItem: number;
  lastItem: number;
};
export type OwnerTransportRead = OwnerTransportState | OwnerTransportHistory;

export type OwnerTransportCommand =
  | { action: 'start'; name: string; phone: string; origin: string; destination: string; message?: string; idempotencyKey: string }
  | { action: 'message'; conversationId: number; publicRef: string; message: string; idempotencyKey: string }
  | { action: 'read'; conversationId: number; publicRef: string; messageId: number }
  | { action: 'close' | 'resume'; conversationId: number; publicRef: string };
