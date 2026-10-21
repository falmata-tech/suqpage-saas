import type {AttentionItem} from '../attention-contract';
export function attentionLabel(item:AttentionItem):string {
  if(item.kind==='assigned')return item.destination.screen==='support-chat'?'Chat assigned to you':'An agent has been assigned';
  return {
    inquiry:'New customer inquiry',waiting_chat:'A new chat is waiting',reassigned:'Chat reassigned',
    joined:'An agent joined your chat',message:'New chat message',closed:'Chat ended',reopened:'Chat reopened',
    reply_overdue:'A chat is overdue for a reply.',
  }[item.kind];
}
