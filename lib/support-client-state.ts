/** Customer-facing presentation only; reply deadlines and assignment stay server-owned. */
export type ClientChatSnapshot = {
  status: string;
  resolvedAt?: number | null;
  replyState?: 'needs_reply' | 'overdue' | 'waiting_customer' | null;
  agentJoined?: boolean;
  assignedUserName?: string | null;
};

export type ClientChatPresentation = {
  statusKey: 'Waiting for our team' | 'Waiting for your reply' | 'Chat ended' | 'Resolved';
  joined: {key: '{value1} joined your chat'; values: {value1: string}} | {key: 'An agent joined your chat'; values?: undefined} | null;
  terminal: boolean;
  awaitingTeam: boolean;
};

export function clientChatPresentation(snapshot: ClientChatSnapshot): ClientChatPresentation {
  const resolved = snapshot.resolvedAt != null;
  const terminal = resolved || snapshot.status === 'closed';
  const awaitingTeam = !terminal && snapshot.replyState !== 'waiting_customer';
  const statusKey = resolved ? 'Resolved' : terminal ? 'Chat ended' : awaitingTeam ? 'Waiting for our team' : 'Waiting for your reply';
  // Internal routing is not public acceptance. Historical joins do not announce
  // a currently live agent after the conversation has ended.
  const joined = terminal || snapshot.agentJoined !== true ? null : snapshot.assignedUserName
    ? {key: '{value1} joined your chat' as const, values: {value1: snapshot.assignedUserName}}
    : {key: 'An agent joined your chat' as const};
  return {statusKey, joined, terminal, awaitingTeam};
}
