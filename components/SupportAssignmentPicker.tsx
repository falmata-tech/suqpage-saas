type AssignmentAgent = {
  userId: number;
  name: string;
  openConversations: number;
};

export type SupportAssignmentPickerProps = {
  conversationId: number;
  assignedUserId: number | null;
  assignedUserName: string | null;
  agents: ReadonlyArray<AssignmentAgent>;
  label: string;
  waitingLabel: string;
  pausedLabel: string;
};

export default function SupportAssignmentPicker({
  conversationId, assignedUserId, assignedUserName, agents, label, waitingLabel, pausedLabel,
}: SupportAssignmentPickerProps) {
  const retainedAssignee = assignedUserId !== null && !agents.some(agent => agent.userId === assignedUserId);
  // Refreshes preserve a manual choice unless the saved assignment or case changes.
  return <select
    key={`${conversationId}:${assignedUserId ?? "waiting"}`}
    name="assignedUserId"
    aria-label={label}
    defaultValue={assignedUserId ?? ""}
  >
    <option value="">{waitingLabel}</option>
    {/* Keep the retained value submittable; saving the same assignee is a server no-op. */}
    {retainedAssignee && assignedUserId !== null ? <option value={assignedUserId}>{assignedUserName ? `${assignedUserName} (${pausedLabel})` : pausedLabel}</option> : null}
    {agents.map(agent => <option key={agent.userId} value={agent.userId}>{agent.name} ({agent.openConversations})</option>)}
  </select>;
}
