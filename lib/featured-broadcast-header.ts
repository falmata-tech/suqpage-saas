import type { UiText } from "./i18n/core";
import {
  clockTimeLabel,
} from "./clock-display";
import {
  featuredBroadcastPhase,
  featuredProgramTimeLabel,
  resolveFeaturedProgramSessions,
  type FeaturedProgramPolicy,
} from "./featured-program";

export type FeaturedBroadcastHeaderDay = {
  dateIso: string;
  dayLabel: string;
  isToday: boolean;
};

export type FeaturedBroadcastHeader = {
  phase: "scheduled" | "window" | "ended" | "empty";
  label: string;
  title: string;
  detail: string;
  note: string;
  actionLabel: string;
  href: string;
};

export function featuredBroadcastHeader(input: {
  day: FeaturedBroadcastHeaderDay;
  boothCount: number;
  now: number;
  policy: FeaturedProgramPolicy;
  tiktokUrl: string;
  youtubeUrl: string;
  t: UiText;
}): FeaturedBroadcastHeader {
  const { day, boothCount, now, policy, tiktokUrl, youtubeUrl, t } = input;
  const label = t(day.isToday ? "Today's schedule" : "Program preview");
  if (boothCount === 0) {
    return {
      phase: "empty",
      label,
      title: t(day.isToday ? "No businesses are scheduled today" : "No businesses are scheduled for this day"),
      detail: "",
      note: "",
      actionLabel: "",
      href: "",
    };
  }

  const phase = featuredBroadcastPhase(day.dateIso, boothCount, now, policy);
  const sessions = resolveFeaturedProgramSessions(boothCount, policy);
  const window = featuredProgramTimeLabel(sessions.evening.startMinute, sessions.evening.endMinute);
  const start = clockTimeLabel(sessions.evening.startMinute);

  if (phase === "scheduled") {
    return {
      phase,
      label,
      title: day.isToday
        ? t("TikTok Live is scheduled for {value1} EAT today", { value1: start })
        : t("Featured program for {value1}", { value1: day.dayLabel }),
      detail: day.isToday
        ? t("Scheduled window: {value1} EAT", { value1: window })
        : t("Starts at {value1} EAT", { value1: start }),
      note: tiktokUrl && day.isToday ? t("Check TikTok for the stream") : "",
      actionLabel: tiktokUrl ? t("Open TikTok") : "",
      href: tiktokUrl,
    };
  }

  if (phase === "live") {
    return {
      phase: "window",
      label,
      title: t("Scheduled TikTok Live window is open"),
      detail: t("Today's scheduled window: {value1} EAT", { value1: window }),
      note: tiktokUrl ? t("Open TikTok to see whether the stream is live") : "",
      actionLabel: tiktokUrl ? t("Check TikTok Live") : "",
      href: tiktokUrl,
    };
  }

  return {
    phase,
    label,
    title: t(day.isToday ? "Today's featured program has ended" : "This featured program day has passed"),
    detail: t("Scheduled window: {value1} EAT", { value1: window }),
    note: "",
    actionLabel: youtubeUrl ? t("View recordings") : "",
    href: youtubeUrl,
  };
}
