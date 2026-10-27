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
  // performance.now() has fractional milliseconds; the wait-state contract uses
  // safe integer timestamps. Fractional estimates were rejected as invalid and
  // reset the visible countdown to 03:30 after the first tick.
  return Math.min(8_640_000_000_000_000,serverNow+Math.max(0,Math.floor(currentMonotonicAt-sampledMonotonicAt)));
}

/** A delayed refresh must never put a waiting customer's visible clock back. */
export function advanceTransportClock(
  previous:{serverNow:number;clientAt:number},
  reportedServerNow:number,
  clientAt:number,
):{serverNow:number;clientAt:number}{
  return {serverNow:Math.max(estimateServerNow(previous.serverNow,previous.clientAt,clientAt),validTime(reportedServerNow)?reportedServerNow:0),clientAt};
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

/** Round up so the display never shows 00:00 before the server handoff. */
export function formatTransportRemaining(elapsedMs:number,locale:string):string{
  const remaining=Math.max(0,Math.ceil((TRANSPORT_CALLBACK_AFTER_MS-Math.max(0,elapsedMs))/1000));
  const digits=new Intl.NumberFormat(locale,{useGrouping:false,minimumIntegerDigits:2});
  return `${digits.format(Math.floor(remaining/60))}:${digits.format(remaining%60)}`;
}
