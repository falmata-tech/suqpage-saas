/** Shared policy only: the server persists and ends chats; clients display it. */
export type SupportIdleParticipant = 'guest' | 'owner';
export const SUPPORT_IDLE_SWEEP_LIMIT = 25;
export const SUPPORT_IDLE_WINDOWS = {
 guest:{warningMs:25*60_000,endMs:30*60_000},
 owner:{warningMs:23*60*60_000,endMs:24*60*60_000},
} as const;

export function supportIdleDeadlines(awaitingSince:number|null,participant:SupportIdleParticipant):{idleWarningAt:number|null;idleEndsAt:number|null}{
 const window=SUPPORT_IDLE_WINDOWS[participant];
 if(!Number.isSafeInteger(awaitingSince)||awaitingSince===null||awaitingSince<0||awaitingSince>Number.MAX_SAFE_INTEGER-window.endMs)return {idleWarningAt:null,idleEndsAt:null};
 return {idleWarningAt:awaitingSince+window.warningMs,idleEndsAt:awaitingSince+window.endMs};
}

/** Presentation only. A deadline never authorizes a client to close a chat. */
export function supportIdlePresentation(snapshot:{status:string;idleWarningAt?:number|null;idleEndsAt?:number|null;idleEndedAt?:number|null;resolvedAt?:number|null},now:number){
 const timestamp=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0;
 const autoEnded=snapshot.status==='closed'&&timestamp(snapshot.idleEndedAt)&&snapshot.resolvedAt==null;
 const warning=snapshot.status==='open'&&snapshot.idleEndedAt==null&&timestamp(snapshot.idleWarningAt)&&timestamp(snapshot.idleEndsAt)&&snapshot.idleWarningAt<snapshot.idleEndsAt&&timestamp(now)&&now>=snapshot.idleWarningAt;
 return {warning,autoEnded};
}
