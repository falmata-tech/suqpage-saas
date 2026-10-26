import { clockTimeLabel } from "./clock-display";

export type FeaturedProgramPolicy = {
  startMinute: number;
  endMinute: number;
  presentationMinutes: number;
  changeoverMinutes: number;
  sponsorMentionCount: number;
  sponsorMentionMinutes: number;
};

export const DEFAULT_FEATURED_PROGRAM_POLICY: FeaturedProgramPolicy = Object.freeze({
  startMinute: 20 * 60 + 15,
  endMinute: 21 * 60 + 45,
  presentationMinutes: 20,
  changeoverMinutes: 3,
  sponsorMentionCount: 2,
  sponsorMentionMinutes: 2,
});
export const MAX_FEATURED_SHOWROOMS = 4;
export type FeaturedBroadcastPhase = "scheduled" | "live" | "ended";
export type FeaturedProgramSession = "evening";
export type FeaturedBoothWalkthrough = {
  kind: "booth"; slot: number; session: FeaturedProgramSession;
  start: number; end: number; label: string; current: boolean;
};
export type FeaturedProgramBreak = {
  kind: "changeover" | "sponsor_break"; session: FeaturedProgramSession;
  start: number; end: number; label: string; timeLabel: string;
  current: boolean; sponsorSlot?: number;
};
export type FeaturedProgramAgendaEntry = FeaturedBoothWalkthrough | FeaturedProgramBreak;

export function validateFeaturedProgramDate(dateIso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) throw new Error("Featured program date must use YYYY-MM-DD.");
  const [year, month, day] = dateIso.split("-").map(Number);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) throw new Error("Featured program date is invalid.");
}
function countWithinCapacity(count: number) {
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_FEATURED_SHOWROOMS) throw new Error(`Featured program booth count must be between 0 and ${MAX_FEATURED_SHOWROOMS}.`);
}
function officialPolicy(policy: FeaturedProgramPolicy) {
  if (Object.entries(DEFAULT_FEATURED_PROGRAM_POLICY).some(([key,value]) => policy[key as keyof FeaturedProgramPolicy] !== value)) throw new Error("Daily Featured uses the official evening schedule.");
  return policy;
}
export function featuredProgramTimeLabel(startMinute: number, endMinute: number) {
  return `${clockTimeLabel(startMinute)}–${clockTimeLabel(endMinute)}`;
}

// A category recurs weekly. Rotating its alphabetical pool avoids a permanent
// fixed shortlist while keeping the same lineup throughout a given date.
export function automaticFeaturedLineup<T>(dateIso: string, eligible: readonly T[]): T[] {
  validateFeaturedProgramDate(dateIso);
  if (!eligible.length) return [];
  const week = Math.floor((Date.parse(`${dateIso}T00:00:00Z`) - Date.UTC(2026,0,5)) / (7 * 86400000));
  const offset = ((week * MAX_FEATURED_SHOWROOMS) % eligible.length + eligible.length) % eligible.length;
  return Array.from({length:Math.min(eligible.length,MAX_FEATURED_SHOWROOMS)},(_,index)=>eligible[(offset+index)%eligible.length]);
}

export function buildFeaturedProgramAgenda(dateIso: string, boothCount: number, now: number | Date, rawPolicy = DEFAULT_FEATURED_PROGRAM_POLICY): FeaturedProgramAgendaEntry[] {
  validateFeaturedProgramDate(dateIso); countWithinCapacity(boothCount);
  const policy = officialPolicy(rawPolicy);
  const value = now instanceof Date ? now.getTime() : now;
  if (!Number.isFinite(value)) throw new Error("Featured program current time is invalid.");
  if (!boothCount) return [];
  // Numeric minute offsets make midnight the following day, never 24:00 PM.
  const midnight = Date.parse(`${dateIso}T00:00:00+03:00`);
  const entries: FeaturedProgramAgendaEntry[] = [];
  const sponsorsAfter = Array.from({length:policy.sponsorMentionCount},(_,i)=>Math.ceil(boothCount*(i+1)/policy.sponsorMentionCount));
  let cursor=policy.startMinute, sponsorSlot=0;
  const interval=(minutes:number)=>{
    const start=midnight+cursor*60000; const label=featuredProgramTimeLabel(cursor,cursor+minutes);
    cursor+=minutes; const end=midnight+cursor*60000;
    return {start,end,label,current:value>=start && value<end,session:"evening" as const};
  };
  for(let slot=1;slot<=boothCount;slot++) {
    entries.push({kind:"booth",slot,...interval(policy.presentationMinutes)});
    const mentions=sponsorsAfter.filter(boundary=>boundary===slot).length;
    for(let i=0;i<mentions;i++) {
      const span=interval(policy.sponsorMentionMinutes);
      entries.push({...span,kind:"sponsor_break",label:"Sponsor mention",timeLabel:span.label,sponsorSlot:++sponsorSlot});
    }
    if(!mentions && slot<boothCount) {
      const span=interval(policy.changeoverMinutes);
      entries.push({...span,kind:"changeover",label:"Booth changeover",timeLabel:span.label});
    }
  }
  if(cursor>policy.endMinute) throw new Error("The lineup exceeds the evening broadcast window.");
  return entries;
}
export function resolveFeaturedProgramSessions(boothCount:number,policy=DEFAULT_FEATURED_PROGRAM_POLICY) {
  const agenda=buildFeaturedProgramAgenda("2026-01-01",boothCount,0,policy);
  const midnight=Date.parse("2026-01-01T00:00:00+03:00");
  return {evening:{session:"evening" as const,startMinute:policy.startMinute,endMinute:agenda.length?(agenda.at(-1)!.end-midnight)/60000:policy.startMinute,boothCount}};
}
export function featuredBroadcastPhase(dateIso:string,boothCount:number,now:number|Date,policy=DEFAULT_FEATURED_PROGRAM_POLICY):FeaturedBroadcastPhase {
  const agenda=buildFeaturedProgramAgenda(dateIso,boothCount,now,policy);
  const value=now instanceof Date?now.getTime():now;
  if(!agenda.length) return "ended";
  return value<agenda[0].start?"scheduled":value<agenda.at(-1)!.end?"live":"ended";
}
export function featuredBoothWalkthroughs(dateIso:string,boothCount:number,now:number|Date,policy=DEFAULT_FEATURED_PROGRAM_POLICY):FeaturedBoothWalkthrough[] {
  return buildFeaturedProgramAgenda(dateIso,boothCount,now,policy).filter((entry):entry is FeaturedBoothWalkthrough=>entry.kind==="booth");
}
export function featuredProgramDisplayOrder(walkthroughs:readonly FeaturedBoothWalkthrough[],now:number|Date) {
  if(!walkthroughs.length) return [];
  const value=now instanceof Date?now.getTime():now;
  if(!Number.isFinite(value)) throw new Error("Featured program display time is invalid.");
  const anchor=walkthroughs.find(entry=>value>=entry.start&&value<entry.end)||walkthroughs.filter(entry=>entry.end<=value).at(-1)||walkthroughs[0];
  const index=walkthroughs.indexOf(anchor);
  return [...walkthroughs.slice(index),...walkthroughs.slice(0,index)].map(entry=>entry.slot);
}
