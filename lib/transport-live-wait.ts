export const TRANSPORT_BUSY_AFTER_MS=2*60_000;
export const TRANSPORT_CALLBACK_AFTER_MS=3*60_000+30_000;
/** Retained alias for existing call sites while S162 migrates the former composer flow. */
export const TRANSPORT_INBOX_AFTER_MS=TRANSPORT_CALLBACK_AFTER_MS;

export type TransportLiveWaitPhase='waiting'|'busy'|'inbox'|'joined'|'closed';
export type TransportLiveWaitSnapshot={
  status:string;
  waitStartedAt?:number|null;
  agentJoined?:boolean;
  agentJoinedAt?:number|null;
  firstStaffReplyAt?:number|null;
};

const validTime=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=8_640_000_000_000_000;

export function estimateServerNow(serverNow:number,sampledMonotonicAt:number,currentMonotonicAt:number):number{
  if(!validTime(serverNow)||!Number.isFinite(sampledMonotonicAt)||!Number.isFinite(currentMonotonicAt))return validTime(serverNow)?serverNow:0;
  return serverNow+Math.max(0,currentMonotonicAt-sampledMonotonicAt);
}

/** Uses server-supplied timestamps; a reconnect or device clock change cannot restart the queue wait. */
export function transportLiveWait(snapshot:TransportLiveWaitSnapshot,serverNow:number):{phase:TransportLiveWaitPhase;elapsedMs:number}{
  if(snapshot.status==='closed')return {phase:'closed',elapsedMs:0};
  const started=validTime(snapshot.waitStartedAt)?snapshot.waitStartedAt:null;
  const elapsedMs=started===null||!validTime(serverNow)?0:Math.max(0,serverNow-started);
  const joinedBeforeHandoff=validTime(snapshot.agentJoinedAt)&&started!==null&&snapshot.agentJoinedAt>=started&&snapshot.agentJoinedAt<=serverNow&&snapshot.agentJoinedAt<started+TRANSPORT_CALLBACK_AFTER_MS;
  const legacyJoinWithoutTimestamp=snapshot.agentJoined===true&&!validTime(snapshot.agentJoinedAt);
  const staffHasReplied=validTime(snapshot.firstStaffReplyAt)&&started!==null&&snapshot.firstStaffReplyAt>=started&&snapshot.firstStaffReplyAt<=serverNow&&snapshot.firstStaffReplyAt<started+TRANSPORT_CALLBACK_AFTER_MS;
  if(joinedBeforeHandoff||legacyJoinWithoutTimestamp||staffHasReplied)return {phase:'joined',elapsedMs};
  if(started===null)return {phase:'waiting',elapsedMs:0};
  if(elapsedMs>=TRANSPORT_CALLBACK_AFTER_MS)return {phase:'inbox',elapsedMs};
  if(elapsedMs>=TRANSPORT_BUSY_AFTER_MS)return {phase:'busy',elapsedMs};
  return {phase:'waiting',elapsedMs};
}

export function formatTransportElapsed(elapsedMs:number,locale:string):string{
  const total=Math.max(0,Math.floor(elapsedMs/1000));
  const digits=new Intl.NumberFormat(locale,{useGrouping:false});
  return `${digits.format(Math.floor(total/60)).padStart(2,'0')}:${digits.format(total%60).padStart(2,'0')}`;
}
