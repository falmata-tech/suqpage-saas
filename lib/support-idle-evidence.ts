/** Immutable facts recorded at ending, not an assessment of service quality. */
export type SupportIdleEndEvidence = {
  version: 1;
  reason: 'participant_no_reply';
  endedAt: number;
  waitingSince: number;
  windowMs: number;
  lastPublicStaffReply: { id: number; sentAt: number };
  latestParticipantMessage: { id: number; sentAt: number } | null;
  lastReplyConfirmedReadAtEnding: boolean;
};

const timestamp=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=8_640_000_000_000_000;
function message(value:unknown):value is {id:number;sentAt:number}{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const row=value as Record<string,unknown>;
  return typeof row.id==='number'&&Number.isSafeInteger(row.id)&&row.id>0&&timestamp(row.sentAt)&&Object.keys(row).every(key=>['id','sentAt'].includes(key));
}
/** Unknown/malformed historical records remain unknown; never invent a proof. */
export function supportIdleEndEvidence(value:unknown):SupportIdleEndEvidence|null {
  let raw:unknown=value;
  if(typeof value==='string'){try{raw=JSON.parse(value);}catch{return null;}}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  const row=raw as Record<string,unknown>;
  if(row.version!==1||row.reason!=='participant_no_reply'||!timestamp(row.endedAt)||!timestamp(row.waitingSince)||
    ![30*60_000,24*60*60_000].includes(Number(row.windowMs))||!timestamp(row.windowMs)||
    row.endedAt-row.waitingSince<row.windowMs||!message(row.lastPublicStaffReply)||
    (row.latestParticipantMessage!==null&&!message(row.latestParticipantMessage))||typeof row.lastReplyConfirmedReadAtEnding!=='boolean'||
    Object.keys(row).some(key=>!['version','reason','endedAt','waitingSince','windowMs','lastPublicStaffReply','latestParticipantMessage','lastReplyConfirmedReadAtEnding'].includes(key)))return null;
  if(row.lastPublicStaffReply.sentAt!==row.waitingSince||row.lastPublicStaffReply.sentAt>row.endedAt||
    (row.latestParticipantMessage!==null&&(row.latestParticipantMessage.id>=row.lastPublicStaffReply.id||
      row.latestParticipantMessage.sentAt>row.lastPublicStaffReply.sentAt)))return null;
  return {version:1,reason:'participant_no_reply',endedAt:row.endedAt,waitingSince:row.waitingSince,windowMs:row.windowMs,
    lastPublicStaffReply:{...row.lastPublicStaffReply},latestParticipantMessage:row.latestParticipantMessage===null?null:{...row.latestParticipantMessage},
    lastReplyConfirmedReadAtEnding:row.lastReplyConfirmedReadAtEnding};
}
