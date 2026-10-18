import { runtimeUserById } from '../../lib/catalog-runtime';
import { getSupportConversation, joinSupportConversation, postSupportMessage } from '../../lib/support';
import type { SessionUser } from '../../lib/types';

/** Tests perform the same explicit acceptance as staff; they never bypass its gate. */
export async function joinAssignedSupportConversation(viewer: SessionUser, conversationId: number, now=Date.now()) {
  const {conversation}=await getSupportConversation(viewer,conversationId);
  if(!conversation.assignedUserId)throw Error('Fixture must assign the conversation before an explicit Join.');
  const agent=await runtimeUserById(conversation.assignedUserId);
  if(!agent)throw Error('Fixture assignee was not found.');
  await joinSupportConversation(agent,conversationId,{publicRef:conversation.publicRef,assignmentEpoch:conversation.readEpoch},now);
  return agent;
}

export async function postAssignedSupportReply(viewer: SessionUser, conversationId: number,
  input: Parameters<typeof postSupportMessage>[2], now=Date.now()) {
  return postSupportMessage(await joinAssignedSupportConversation(viewer,conversationId,now),conversationId,input,now);
}
