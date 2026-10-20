"use client";
import SponsorCarousel from "./SponsorCarousel";
import launchStyles from "./LaunchClarity.module.css";
import { useUiText } from "@/lib/i18n/ui";


import Image from "next/image";
import CategoryIllustration from "./CategoryIllustration";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronDown, ExternalLink, Radio, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DiscoveryShowroom, FeaturedShowroomsView, SponsorPlacement, WeeklyFeaturedProgram } from "@/lib/discovery";
import {
  buildFeaturedProgramAgenda,
  featuredBroadcastPhase,
  featuredProgramDisplayOrder,
  featuredProgramTimeLabel,
  resolveFeaturedProgramSessions,
  type FeaturedBoothWalkthrough,
  type FeaturedBroadcastPhase,
  type FeaturedProgramAgendaEntry,
} from "@/lib/featured-program";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";

const DISCOVERY_RETURN_KEY = "suqpage:last-marketplace-url:v1";

function socialProfileUrl(value: string | undefined, provider: "tiktok" | "youtube") {
  if (!value) return "";
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (url.protocol !== "https:") return "";
    if (provider === "tiktok" && host !== "tiktok.com") return "";
    if (provider === "youtube" && !["youtube.com", "youtu.be"].includes(host)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

const SUQPAGE_TIKTOK_URL = socialProfileUrl(process.env.NEXT_PUBLIC_SUQPAGE_TIKTOK_URL, "tiktok");
const SUQPAGE_YOUTUBE_URL = socialProfileUrl(process.env.NEXT_PUBLIC_SUQPAGE_YOUTUBE_URL, "youtube");

function rememberCurrentPublicWorkspace() {
  try {
    window.sessionStorage.setItem(DISCOVERY_RETURN_KEY, `${window.location.pathname}${window.location.search}`);
  } catch {}
}

type ShowroomPresence = {
  kind: "featured" | "live" | "";
  label: string;
  shortLabel: string;
};

function showroomPresence(showroom: DiscoveryShowroom, featuredNowBusinessId: number | null, t: import("@/lib/i18n/core").UiText): ShowroomPresence {
  if (showroom.id === featuredNowBusinessId) return { kind: "featured", label: t("Featured now"), shortLabel: t("Featured") };
  if (showroom.isLive && showroom.livePlatform) return { kind: "live", label: t("Live on {value1}", { value1: LIVE_PLATFORM_LABELS[showroom.livePlatform] }), shortLabel: t("Live") };
  return { kind: "", label: "", shortLabel: "" };
}

function ShowroomImage({ showroom }: { showroom: DiscoveryShowroom }) {
  const [failed, setFailed] = useState(false);
  return showroom.heroImagePath && !failed
    ? <Image src={showroom.heroImagePath} unoptimized={showroom.heroImagePath.startsWith("/api/page-media/") || showroom.heroImagePath.startsWith("/media/product-private-")} alt="" width={480} height={300} sizes="(max-width: 700px) 46vw, 300px" onError={() => setFailed(true)} />
    : <span className={`discovery-image-fallback ${showroom.fallbackStyle}`} aria-hidden="true"><i>{showroom.name.slice(0, 1)}</i><b>{showroom.name}</b></span>;
}

function ShowroomPreview({ showroom, onClose, onOpen, presence }: { showroom: DiscoveryShowroom; onClose: () => void; onOpen: () => void; presence: ShowroomPresence }) {
  const t = useUiText();
  const previewRef = useRef<HTMLElement | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalRoot(document.body), []);
  useEffect(() => {
    if (!portalRoot) return;
    previewRef.current?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, portalRoot, showroom.id]);
  if (!portalRoot) return null;
  const status = presence.label || (showroom.sponsored ? "Sponsored" : showroom.primaryIndustryShortLabel);
  return createPortal(<div className="discovery-preview-layer"><button className="discovery-preview-scrim" type="button" tabIndex={-1} onClick={onClose} aria-label={t("Dismiss page preview")} /><aside ref={previewRef} className="discovery-preview" role="dialog" aria-modal="false" aria-labelledby={`showroom-preview-${showroom.id}`} data-hero-image={showroom.heroImagePath || undefined} tabIndex={-1}><article><button className="discovery-preview-close" type="button" onClick={onClose} aria-label={t("Close page preview")}><X aria-hidden="true" /></button><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span className={presence.kind ? `presence-${presence.kind}` : undefined}>{t(status)}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3>{showroom.isDemo ? <span className={launchStyles.example}>{t("Demo")}</span> : null}<p>{showroom.tagline}</p><small>{showroom.city} · {showroom.zone} · {showroom.region}</small><Link href={`/@${showroom.handle}?ref=featured`} onClick={onOpen}>{t("Open page")}{" "}<b aria-hidden="true">→</b></Link></div></article></aside></div>, portalRoot);
}

function featuredHref(featuredDay: number, hash = "daily-featured-title") {
  return `/featured?featuredDay=${featuredDay}${hash ? `#${hash}` : ""}`;
}

function FeaturedGallery({ featured, walkthroughs, featuredNowBusinessId, now }: { featured: WeeklyFeaturedProgram; walkthroughs: FeaturedBoothWalkthrough[]; featuredNowBusinessId: number | null; now: number | null }) {
  const t = useUiText();
  const [selected, setSelected] = useState<DiscoveryShowroom | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const sessions = useMemo(() => resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy), [featured.boothCount, featured.programPolicy]);
  const displayBooths = useMemo(() => {
    if (!featured.isToday || now === null) return featured.booths;
    const bySlot = new Map(featured.booths.map((booth) => [booth.slot, booth]));
    return featuredProgramDisplayOrder(walkthroughs, now).map((slot) => bySlot.get(slot)).filter((booth): booth is WeeklyFeaturedProgram["booths"][number] => Boolean(booth));
  }, [featured.booths, featured.isToday, now, walkthroughs]);
  useEffect(() => setSelected(null), [featured.dateLabel, featured.industryCode]);

  if (!featured.booths.length) return <div className="discovery-empty"><h3>{t("Today's featured lineup is being prepared.")}</h3><p>{t("More businesses will appear as they publish their pages.")}</p></div>;
  return <div className="featured-gallery-wrap"><div className="featured-gallery" aria-label={t("{value1}, {value2} featured businesses", { value1: featured.title, value2: featured.boothCount })}>
    {displayBooths.map((booth) => {
      const walkthrough = walkthroughs.find((entry) => entry.slot === booth.slot);
      const walkthroughLabel = walkthrough ? `${walkthrough.label} EAT` : `${featuredProgramTimeLabel(sessions.evening.startMinute, sessions.evening.endMinute)} EAT`;
      const isCurrent = Boolean(featured.isToday && booth.revealed && booth.showroom.id === featuredNowBusinessId);
      if (!booth.revealed) return <article key={booth.reference} data-featured-slot={booth.slot} className="featured-card featured-card-preview" aria-label={t("{value1}, upcoming business, {value2}", { value1: booth.reference, value2: walkthroughLabel })}><span className="featured-card-media"><span className="featured-card-placeholder" aria-hidden="true"><i /><i /><i /></span>{SUQPAGE_TIKTOK_URL ? <b>{booth.reference}</b> : null}</span><span className="featured-card-copy"><small>{t("Featured schedule")}</small><strong>{t("Participant announced that day")}</strong><span>{walkthroughLabel}</span></span></article>;
      const showroom = booth.showroom;
      const presence = showroomPresence(showroom, featuredNowBusinessId, t);
      return <button disabled={!ready} key={showroom.id} data-business-id={showroom.id} data-hero-image={showroom.heroImagePath || undefined} data-walkthrough-current={isCurrent || undefined} data-presence={presence.kind || undefined} type="button" className={`featured-card${isCurrent ? " walkthrough-current" : presence.kind === "live" ? " merchant-live" : ""}${selected?.id === showroom.id ? " selected" : ""}`} onClick={() => setSelected(showroom)} aria-label={SUQPAGE_TIKTOK_URL ? t("{value1}, {value2}, {value3}, walkthrough {value4}{value5}", { value1: booth.reference, value2: showroom.name, value3: showroom.city, value4: walkthroughLabel, value5: presence.label ? `, ${t(presence.label)}` : "" }) : t("{value1}, {value2}, {value3}. View details.", {value1:showroom.name,value2:t(showroom.primaryIndustryLabel),value3:showroom.city})}><span className="featured-card-media"><ShowroomImage showroom={showroom} />{SUQPAGE_TIKTOK_URL ? <b>{booth.reference}</b> : null}{presence.kind ? <i className={`featured-card-presence featured-card-presence-${presence.kind}`}>{t(presence.shortLabel)}</i> : null}</span><span className="featured-card-copy"><small>{showroom.city} · {t(showroom.primaryIndustryShortLabel)}</small><strong>{showroom.name}</strong>{showroom.isDemo ? <span className={launchStyles.example}>{t("Demo")}</span> : null}<span>{presence.label || (SUQPAGE_TIKTOK_URL ? walkthroughLabel : t("Explore this business"))}</span></span></button>;
    })}
  </div>{selected ? <ShowroomPreview showroom={selected} onClose={() => setSelected(null)} onOpen={rememberCurrentPublicWorkspace} presence={showroomPresence(selected, featuredNowBusinessId, t)} /> : null}</div>;
}

function FeaturedWeekNav({ featured }: { featured: WeeklyFeaturedProgram }) {
  const t = useUiText();
  const row = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const nav = row.current;
    const selected = nav?.querySelector<HTMLElement>('[aria-current="date"]');
    if (!nav || !selected) return;
    const reveal = () => {
      const bounds = nav.getBoundingClientRect(), item = selected.getBoundingClientRect();
      if (item.left < bounds.left || item.right > bounds.right) {
        // Move this row only; scrollIntoView could also move the gallery page.
        nav.scrollLeft += item.left - bounds.left - (nav.clientWidth - item.width) / 2;
      }
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(nav);
    observer.observe(selected);
    return () => observer.disconnect();
  }, [featured.selectedWeekday, t]);
  return <nav ref={row} className="featured-week" aria-label={t("Daily Featured schedule")}>
    {featured.schedule.map(day => <Link key={day.weekday} href={featuredHref(day.weekday)} scroll={false}
      data-featured-day={day.weekday}
      className={[day.weekday === featured.selectedWeekday ? "active" : "", day.isToday ? "today" : ""].filter(Boolean).join(" ")}
      aria-current={day.weekday === featured.selectedWeekday ? "date" : undefined}
      aria-label={t("{value1}, {value2}, {value3}{value4}", { value1: t(day.industryLabel), value2: t(day.dayLabel), value3: day.dateLabel, value4: day.isToday ? `, ${t("Today")}` : "" })}>
      <span className="featured-category-art"><CategoryIllustration name={day.industryIcon} size={32} /></span>
      <b className="featured-category-name">{t(day.industryLabel)}</b>
      <small className="featured-category-date">{t(day.dayLabel)} · {day.dateLabel}{day.isToday ? ` · ${t("Today")}` : ""}</small>
    </Link>)}
  </nav>;
}

function sponsorForSlot(placements: SponsorPlacement[], slot: number | undefined) {
  return slot && placements.length ? placements[(slot - 1) % placements.length] : null;
}

function TodayProgramSchedule({ featured, agenda, sponsorPlacements }: { featured: WeeklyFeaturedProgram; agenda: FeaturedProgramAgendaEntry[]; sponsorPlacements: SponsorPlacement[] }) {
  const t = useUiText();
  if (!featured.isToday) return null;
  const sessions = resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy);
  const sessionSummary = featured.boothCount ? `${featuredProgramTimeLabel(sessions.evening.startMinute, sessions.evening.endMinute)} EAT` : "";
  const boothName = (slot: number) => {
    const booth = featured.booths[slot - 1];
    return booth?.revealed ? booth.showroom.name : `Booth ${slot}`;
  };
  const sessionSection = (session: "evening", label: string) => {
    const entries = agenda.filter((entry) => entry.session === session && (entry.kind === "booth" || entry.kind === "sponsor_break"));
    if (!entries.length) return null;
    const resolved = sessions[session];
    return <section className={`featured-agenda-session featured-agenda-${session}`} aria-label={t("{value1} featured schedule", { value1: label })}><header><span>{t(label)}</span><strong>{featuredProgramTimeLabel(resolved.startMinute, resolved.endMinute)} {" "}{t("EAT")}</strong></header><ol>{entries.map((entry) => entry.kind === "booth"
      ? <li key={`booth-${entry.slot}`} className={entry.current ? "current" : undefined} aria-current={entry.current ? "time" : undefined}><time>{entry.label}</time><span><b>{boothName(entry.slot)}</b><small>{t("Booth")}{" "}{String(entry.slot).padStart(2, "0")}</small></span></li>
      : <li key={`${entry.kind}-${entry.start}`} className={`featured-agenda-break${entry.current ? " current" : ""}`} aria-current={entry.current ? "time" : undefined}><time>{entry.timeLabel}</time><span><b>{sponsorForSlot(sponsorPlacements, entry.sponsorSlot)?.name || t(entry.label)}</b><small>{entry.sponsorSlot ? t("Sponsor spotlight") : t("Program break")}</small></span></li>)}</ol></section>;
  };
  return <details className="featured-agenda"><summary><CalendarClock aria-hidden="true" /><span><small>{t("Today's schedule")}</small><strong>{sessionSummary || t("No presentations scheduled")}</strong></span><em>{featured.boothCount} {featured.boothCount === 1 ? t("business") : t("businesses")}</em><ChevronDown className="featured-agenda-chevron" aria-hidden="true" /></summary><div className="featured-agenda-body">{sessionSection("evening", "Evening session")}<p>{t("Five-minute changeovers are included between listed presentations unless a sponsor break is shown.")}</p></div></details>;
}


function FeaturedBroadcastStatus({ featured, selectedDay, now, agenda, sponsorPlacements }: { featured: WeeklyFeaturedProgram; selectedDay: WeeklyFeaturedProgram["schedule"][number] | undefined; now: number | null; agenda: FeaturedProgramAgendaEntry[]; sponsorPlacements: SponsorPlacement[] }) {
  const t = useUiText();
  if (!selectedDay || !SUQPAGE_TIKTOK_URL) return null;
  const sessions = resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy);
  const phase: FeaturedBroadcastPhase = now === null ? "scheduled" : featuredBroadcastPhase(selectedDay.dateIso, featured.boothCount, now, featured.programPolicy);
  const activeEntry = agenda.find((entry) => entry.current);
  const activeWalkthrough = activeEntry?.kind === "booth" ? activeEntry : null;
  const activeBooth = activeWalkthrough ? featured.booths[activeWalkthrough.slot - 1] : null;
  const activeBusiness = activeBooth?.revealed ? activeBooth.showroom.name : null;
  const activeSponsor = activeEntry?.kind === "sponsor_break" ? sponsorForSlot(sponsorPlacements, activeEntry.sponsorSlot) : null;
  const sessionSummary = `${featuredProgramTimeLabel(sessions.evening.startMinute, sessions.evening.endMinute)} EAT`;
  const content = phase === "live"
    ? activeWalkthrough
      ? { title: `TikTok Live · ${activeBooth?.reference || "Featured business"}`, detail: `${activeBusiness ? `Now visiting ${activeBusiness} · ` : ""}${activeWalkthrough.label} EAT`, action: "Watch live", href: SUQPAGE_TIKTOK_URL }
      : activeEntry && (activeEntry.kind === "changeover" || activeEntry.kind === "sponsor_break")
        ? { title: activeSponsor ? `Sponsor spotlight · ${activeSponsor.name}` : `${activeEntry.label} · ${activeEntry.timeLabel} EAT`, detail: activeSponsor ? `${activeEntry.timeLabel} EAT · Paid placement` : "The next presentation begins shortly.", action: "Watch live", href: SUQPAGE_TIKTOK_URL }
        : { title: t("TikTok Live program"), detail: sessionSummary, action: "Watch live", href: SUQPAGE_TIKTOK_URL }
    : phase === "ended"
        ? { title: t("Livestream ended"), detail: "Watch the business recordings on YouTube.", action: "View recordings", href: SUQPAGE_YOUTUBE_URL }
        : { title: featured.isToday ? "Live on TikTok today" : `Live on ${selectedDay.dayLabel}`, detail: sessionSummary, action: "TikTok", href: SUQPAGE_TIKTOK_URL };
  return <aside className={`featured-program featured-program-${phase}`} aria-label={t("Daily Featured status")}><span><Radio aria-hidden="true" />{featured.isToday ? t(SUQPAGE_TIKTOK_URL ? "Today’s broadcast" : "Today's schedule") : t("Program preview")}</span><strong>{content.title}</strong><small>{content.detail}</small>{content.href ? <a href={content.href} target="_blank" rel="noreferrer">{t(content.action)}<ExternalLink aria-hidden="true" /></a> : null}</aside>;
}

function WeeklyFeatured({ featured, sponsorPlacements, featuredNowBusinessId }: { featured: WeeklyFeaturedProgram; sponsorPlacements: SponsorPlacement[]; featuredNowBusinessId: number | null }) {
  const t = useUiText();
  const router = useRouter();
  const today = featured.schedule.find((day) => day.isToday);
  const selectedDay = featured.schedule.find((day) => day.weekday === featured.selectedWeekday);
  const [broadcastNow, setBroadcastNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setBroadcastNow(Date.now());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const agenda = useMemo(() => selectedDay ? buildFeaturedProgramAgenda(selectedDay.dateIso, featured.boothCount, broadcastNow ?? Date.parse(`${selectedDay.dateIso}T00:00:00+03:00`), featured.programPolicy) : [], [broadcastNow, featured.boothCount, featured.programPolicy, selectedDay]);
  const walkthroughs = useMemo(() => agenda.filter((entry): entry is FeaturedBoothWalkthrough => entry.kind === "booth"), [agenda]);
  const currentSlot = walkthroughs.find(entry => entry.current)?.slot;
  const currentBooth = featured.isToday && currentSlot ? featured.booths[currentSlot - 1] : null;
  const currentBusinessId = broadcastNow === null ? featuredNowBusinessId : currentBooth?.revealed ? currentBooth.showroom.id : null;
  useEffect(() => {
    if (broadcastNow === null || !today) return;
    const date = new Date(broadcastNow + 3 * 60 * 60 * 1000).toISOString().slice(0,10);
    if (date !== today.dateIso) router.refresh();
  }, [broadcastNow, today, router]);
  useEffect(() => {
    if (featured.isToday || !today) return;
    const timer = window.setTimeout(() => router.replace(featuredHref(today.weekday), { scroll: false }), 6_000);
    return () => window.clearTimeout(timer);
  }, [featured.isToday, featured.selectedWeekday, router, today]);
  return <section className={`daily-featured featured-theme-${featured.industryCode.toLowerCase()}`} aria-labelledby="daily-featured-title"><div className="featured-program-header"><header className="daily-featured-head"><div><span className="discovery-kicker">{t(featured.industryLabel)} · {t(featured.dayLabel)} · {featured.dateLabel} {" "}{t("· Ethiopia")}</span><h1 id="daily-featured-title">{t(featured.title)}</h1><p>{featured.isToday ? t("Explore today’s {value1} businesses. See their products, then get in touch.", { value1: t(featured.industryLabel).toLowerCase() }) : t("See what’s coming on {value1}. Businesses appear here on their featured day.", { value1: t(featured.dayLabel) })}</p></div><FeaturedBroadcastStatus featured={featured} selectedDay={selectedDay} now={broadcastNow} agenda={agenda} sponsorPlacements={sponsorPlacements} /></header><TodayProgramSchedule featured={featured} agenda={agenda} sponsorPlacements={sponsorPlacements} /></div><div className="featured-experience"><FeaturedWeekNav featured={featured} /><FeaturedGallery featured={featured} walkthroughs={walkthroughs} featuredNowBusinessId={currentBusinessId} now={broadcastNow} /><SponsorCarousel placements={sponsorPlacements} onOpenShowroom={rememberCurrentPublicWorkspace} /></div></section>;
}

export default function FeaturedShowroomsWorkspace({ discovery, sponsoredShowrooms }: { discovery: FeaturedShowroomsView; sponsoredShowrooms: SponsorPlacement[] }) {
  const t = useUiText();
  return <section className="discovery discovery-featured-experience" aria-label={t("Daily Featured")}><WeeklyFeatured featured={discovery.featured} sponsorPlacements={sponsoredShowrooms} featuredNowBusinessId={discovery.featuredNowBusinessId} /></section>;
}
