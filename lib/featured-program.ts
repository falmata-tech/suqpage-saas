export type FeaturedProgramPolicy = {
  morningStartMinute: number;
  morningEndMinute: number;
  afternoonStartMinute: number;
  afternoonEndMinute: number;
  changeoverMinutes: number;
  sponsorBreakEvery: number;
  sponsorBreakMinutes: number;
  sponsorBreakLabel: string;
  intermissionLabel: string;
};

export const DEFAULT_FEATURED_PROGRAM_POLICY: FeaturedProgramPolicy = {
  morningStartMinute: 8 * 60,
  morningEndMinute: 13 * 60,
  afternoonStartMinute: 17 * 60,
  afternoonEndMinute: 22 * 60,
  changeoverMinutes: 5,
  sponsorBreakEvery: 3,
  sponsorBreakMinutes: 10,
  sponsorBreakLabel: "Sponsor break",
  intermissionLabel: "Lunch and program break",
};

export const FEATURED_PROGRAM_TARGET_PRESENTATION_MINUTES = 30;
export const FEATURED_PROGRAM_MIN_SESSION_MINUTES = 60;

export type FeaturedBroadcastPhase = "scheduled" | "live" | "intermission" | "ended";
export type FeaturedProgramSession = "morning" | "afternoon";

export type ResolvedFeaturedProgramSessions = {
  morning: { session: "morning"; startMinute: number; endMinute: number; boothCount: number };
  afternoon: { session: "afternoon"; startMinute: number; endMinute: number; boothCount: number };
};

export type FeaturedBoothWalkthrough = {
  kind: "booth";
  slot: number;
  session: FeaturedProgramSession;
  start: number;
  end: number;
  label: string;
  current: boolean;
};

export type FeaturedProgramBreak = {
  kind: "changeover" | "sponsor_break" | "intermission";
  session: FeaturedProgramSession | "intermission";
  start: number;
  end: number;
  label: string;
  timeLabel: string;
  current: boolean;
};

export type FeaturedProgramAgendaEntry = FeaturedBoothWalkthrough | FeaturedProgramBreak;

function validLabel(value: string, field: string) {
  const cleaned = String(value || "").trim();
  if (cleaned.length < 2 || cleaned.length > 60 || /[\u0000-\u001F\u007F]/.test(cleaned)) {
    throw new Error(`${field} must be 2 to 60 plain-text characters.`);
  }
  return cleaned;
}

export function validateFeaturedProgramPolicy(input: FeaturedProgramPolicy): FeaturedProgramPolicy {
  const values = [
    input.morningStartMinute,
    input.morningEndMinute,
    input.afternoonStartMinute,
    input.afternoonEndMinute,
    input.changeoverMinutes,
    input.sponsorBreakEvery,
    input.sponsorBreakMinutes,
  ];
  if (!values.every(Number.isSafeInteger)) throw new Error("Featured program times and intervals must use whole minutes.");
  if (
    input.morningStartMinute < 0 ||
    input.morningStartMinute >= input.morningEndMinute ||
    input.morningEndMinute + 30 > input.afternoonStartMinute ||
    input.afternoonStartMinute >= input.afternoonEndMinute ||
    input.afternoonEndMinute > 23 * 60 + 59
  ) throw new Error("Featured program sessions must be ordered on one day with at least a 30-minute intermission.");
  if (input.changeoverMinutes < 2 || input.changeoverMinutes > 20) throw new Error("Booth changeovers must be between 2 and 20 minutes.");
  if (input.sponsorBreakEvery < 2 || input.sponsorBreakEvery > 8) throw new Error("Sponsor breaks must occur after every 2 to 8 booths.");
  if (input.sponsorBreakMinutes < 5 || input.sponsorBreakMinutes > 30) throw new Error("Sponsor breaks must be between 5 and 30 minutes.");
  return {
    ...input,
    sponsorBreakLabel: validLabel(input.sponsorBreakLabel, "Sponsor break label"),
    intermissionLabel: validLabel(input.intermissionLabel, "Intermission label"),
  };
}

export function validateFeaturedProgramDate(dateIso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) throw new Error("Featured program date must use YYYY-MM-DD.");
  const [year, month, day] = dateIso.split("-").map(Number);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) throw new Error("Featured program date is invalid.");
}

function timeLabel(minutesFromMidnight: number) {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function atEthiopiaMinute(dateIso: string, minutesFromMidnight: number) {
  return Date.parse(`${dateIso}T${timeLabel(minutesFromMidnight)}:00+03:00`);
}

function splitBoothCount(boothCount: number, policy: FeaturedProgramPolicy) {
  const morningMinutes = policy.morningEndMinute - policy.morningStartMinute;
  const afternoonMinutes = policy.afternoonEndMinute - policy.afternoonStartMinute;
  const morningCount = boothCount < 2
    ? boothCount
    : Math.max(1, Math.min(boothCount - 1, Math.round(boothCount * morningMinutes / (morningMinutes + afternoonMinutes))));
  return { morningCount, afternoonCount: boothCount - morningCount };
}

function boundaryMinutes(count: number, policy: FeaturedProgramPolicy) {
  let total = 0;
  for (let index = 1; index < count; index += 1) {
    total += index % policy.sponsorBreakEvery === 0
      ? policy.sponsorBreakMinutes
      : policy.changeoverMinutes;
  }
  return total;
}

function contractedSessionStart(startMinute: number, endMinute: number, count: number, policy: FeaturedProgramPolicy) {
  if (!count) return endMinute;
  const capacity = endMinute - startMinute;
  const required = count * FEATURED_PROGRAM_TARGET_PRESENTATION_MINUTES + boundaryMinutes(count, policy);
  const minimum = Math.min(FEATURED_PROGRAM_MIN_SESSION_MINUTES, capacity);
  return endMinute - Math.min(capacity, Math.max(minimum, required));
}

export function resolveFeaturedProgramSessions(
  boothCount: number,
  rawPolicy: FeaturedProgramPolicy = DEFAULT_FEATURED_PROGRAM_POLICY,
): ResolvedFeaturedProgramSessions {
  if (!Number.isSafeInteger(boothCount) || boothCount < 0) throw new Error("Featured program booth count must be a non-negative integer.");
  const policy = validateFeaturedProgramPolicy(rawPolicy);
  const { morningCount, afternoonCount } = splitBoothCount(boothCount, policy);
  return {
    morning: {
      session: "morning",
      startMinute: contractedSessionStart(policy.morningStartMinute, policy.morningEndMinute, morningCount, policy),
      endMinute: policy.morningEndMinute,
      boothCount: morningCount,
    },
    afternoon: {
      session: "afternoon",
      startMinute: contractedSessionStart(policy.afternoonStartMinute, policy.afternoonEndMinute, afternoonCount, policy),
      endMinute: policy.afternoonEndMinute,
      boothCount: afternoonCount,
    },
  };
}

export function featuredProgramTimeLabel(startMinute: number, endMinute: number) {
  return `${timeLabel(startMinute)}–${timeLabel(endMinute)}`;
}

function sessionAgenda(input: {
  dateIso: string;
  session: FeaturedProgramSession;
  startMinute: number;
  endMinute: number;
  count: number;
  slotOffset: number;
  policy: FeaturedProgramPolicy;
  now: number;
}): FeaturedProgramAgendaEntry[] {
  if (input.count === 0) return [];
  const boundaryKinds = Array.from({ length: Math.max(0, input.count - 1) }, (_, index) =>
    (index + 1) % input.policy.sponsorBreakEvery === 0 ? "sponsor_break" as const : "changeover" as const);
  const reservedMinutes = boundaryKinds.reduce((total, kind) => total + (kind === "sponsor_break" ? input.policy.sponsorBreakMinutes : input.policy.changeoverMinutes), 0);
  const sessionMinutes = input.endMinute - input.startMinute;
  const presentationMinutes = sessionMinutes - reservedMinutes;
  if (presentationMinutes < input.count) throw new Error("The featured program policy cannot fit every participating booth into its sessions.");
  const baseDuration = Math.floor(presentationMinutes / input.count);
  const remainder = presentationMinutes % input.count;
  const entries: FeaturedProgramAgendaEntry[] = [];
  let cursor = input.startMinute;
  for (let index = 0; index < input.count; index += 1) {
    const duration = baseDuration + (index < remainder ? 1 : 0);
    const endMinute = cursor + duration;
    const start = atEthiopiaMinute(input.dateIso, cursor);
    const end = atEthiopiaMinute(input.dateIso, endMinute);
    entries.push({
      kind: "booth",
      slot: input.slotOffset + index + 1,
      session: input.session,
      start,
      end,
      label: featuredProgramTimeLabel(cursor, endMinute),
      current: input.now >= start && input.now < end,
    });
    cursor = endMinute;
    const boundaryKind = boundaryKinds[index];
    if (!boundaryKind) continue;
    const breakMinutes = boundaryKind === "sponsor_break" ? input.policy.sponsorBreakMinutes : input.policy.changeoverMinutes;
    const breakEnd = cursor + breakMinutes;
    const breakStartEpoch = atEthiopiaMinute(input.dateIso, cursor);
    const breakEndEpoch = atEthiopiaMinute(input.dateIso, breakEnd);
    entries.push({
      kind: boundaryKind,
      session: input.session,
      start: breakStartEpoch,
      end: breakEndEpoch,
      label: boundaryKind === "sponsor_break" ? input.policy.sponsorBreakLabel : "Booth changeover",
      timeLabel: featuredProgramTimeLabel(cursor, breakEnd),
      current: input.now >= breakStartEpoch && input.now < breakEndEpoch,
    });
    cursor = breakEnd;
  }
  return entries;
}

export function buildFeaturedProgramAgenda(
  dateIso: string,
  boothCount: number,
  now: number | Date,
  rawPolicy: FeaturedProgramPolicy = DEFAULT_FEATURED_PROGRAM_POLICY,
): FeaturedProgramAgendaEntry[] {
  validateFeaturedProgramDate(dateIso);
  if (!Number.isSafeInteger(boothCount) || boothCount < 0) throw new Error("Featured program booth count must be a non-negative integer.");
  const policy = validateFeaturedProgramPolicy(rawPolicy);
  const value = now instanceof Date ? now.getTime() : now;
  if (!Number.isFinite(value)) throw new Error("Featured program current time is invalid.");
  const sessions = resolveFeaturedProgramSessions(boothCount, policy);
  const morning = sessionAgenda({ dateIso, session: "morning", startMinute: sessions.morning.startMinute, endMinute: sessions.morning.endMinute, count: sessions.morning.boothCount, slotOffset: 0, policy, now: value });
  const intermissionStart = atEthiopiaMinute(dateIso, policy.morningEndMinute);
  const intermissionEndMinute = sessions.afternoon.boothCount ? sessions.afternoon.startMinute : policy.morningEndMinute;
  const intermissionEnd = atEthiopiaMinute(dateIso, intermissionEndMinute);
  const intermission: FeaturedProgramBreak = {
    kind: "intermission",
    session: "intermission",
    start: intermissionStart,
    end: intermissionEnd,
    label: policy.intermissionLabel,
    timeLabel: featuredProgramTimeLabel(policy.morningEndMinute, intermissionEndMinute),
    current: value >= intermissionStart && value < intermissionEnd,
  };
  const afternoon = sessionAgenda({ dateIso, session: "afternoon", startMinute: sessions.afternoon.startMinute, endMinute: sessions.afternoon.endMinute, count: sessions.afternoon.boothCount, slotOffset: sessions.morning.boothCount, policy, now: value });
  return [...morning, intermission, ...afternoon];
}

export function featuredBroadcastPhase(
  dateIso: string,
  boothCount: number,
  now: number | Date,
  rawPolicy: FeaturedProgramPolicy = DEFAULT_FEATURED_PROGRAM_POLICY,
): FeaturedBroadcastPhase {
  validateFeaturedProgramDate(dateIso);
  const policy = validateFeaturedProgramPolicy(rawPolicy);
  const sessions = resolveFeaturedProgramSessions(boothCount, policy);
  const value = now instanceof Date ? now.getTime() : now;
  if (value < atEthiopiaMinute(dateIso, sessions.morning.startMinute)) return "scheduled";
  if (sessions.morning.boothCount && value < atEthiopiaMinute(dateIso, sessions.morning.endMinute)) return "live";
  if (!sessions.afternoon.boothCount) return "ended";
  if (value < atEthiopiaMinute(dateIso, sessions.afternoon.startMinute)) return "intermission";
  if (value < atEthiopiaMinute(dateIso, sessions.afternoon.endMinute)) return "live";
  return "ended";
}

export function featuredBoothWalkthroughs(
  dateIso: string,
  boothCount: number,
  now: number | Date,
  policy: FeaturedProgramPolicy = DEFAULT_FEATURED_PROGRAM_POLICY,
): FeaturedBoothWalkthrough[] {
  return buildFeaturedProgramAgenda(dateIso, boothCount, now, policy).filter((entry): entry is FeaturedBoothWalkthrough => entry.kind === "booth");
}
