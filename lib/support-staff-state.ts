type StaffConversationState = {
  status: "waiting" | "open" | "closed";
  assignedUserName: string | null;
  agentJoined?: boolean;
  resolvedAt?: number | null;
  idleEndedAt?: number | null;
};

/** Assignment and joining describe active work; ended cases never wait for an agent. */
export function supportStaffState(conversation: StaffConversationState): {
  key: string;
  values?: { value1: string };
} {
  if (conversation.status === "closed") {
    return { key: conversation.resolvedAt ? "Resolved" : conversation.idleEndedAt != null
      ? "Automatically ended after no reply." : "Chat ended" };
  }
  if (conversation.assignedUserName) {
    return {
      key: conversation.agentJoined ? "{value1} joined the chat" : "Assigned to {value1}",
      values: { value1: conversation.assignedUserName },
    };
  }
  return { key: "Waiting for a team member" };
}

/** Staff work priority comes from the server, independently of routing/joining. */
export function supportStaffWorkState(conversation:{
  status:string;
  resolvedAt?:number|null;
  replyState?:'needs_reply'|'overdue'|'waiting_customer'|null;
  staffReplyDueAt?:number|null;
}):{
  replyKey:'Needs staff reply'|'Waiting for customer'|'Needs follow-up'|null;
  overdue:boolean;
  dueAt:number|null;
  terminalKey:'Chat ended'|'Resolved'|null;
} {
  if(conversation.resolvedAt!=null)return {replyKey:null,overdue:false,dueAt:null,terminalKey:'Resolved'};
  if(conversation.status==='closed')return {replyKey:'Needs follow-up',overdue:false,dueAt:null,terminalKey:'Chat ended'};
  const replyKey=conversation.replyState==='needs_reply'||conversation.replyState==='overdue'?'Needs staff reply':conversation.replyState==='waiting_customer'?'Waiting for customer':null;
  const dueAt=replyKey==='Needs staff reply'&&typeof conversation.staffReplyDueAt==='number'&&Number.isFinite(conversation.staffReplyDueAt)&&conversation.staffReplyDueAt>0&&conversation.staffReplyDueAt<=8.64e15?conversation.staffReplyDueAt:null;
  return {replyKey,overdue:conversation.replyState==='overdue',dueAt,terminalKey:null};
}
