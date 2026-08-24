"use client";

import Image from "next/image";
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
  type FeaturedProgramBreak,
} from "@/lib/featured-program";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";

const DISCOVERY_RETURN_KEY = "mirtpage:last-marketplace-url:v1";

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

const MIRTPAGE_TIKTOK_URL = socialProfileUrl(process.env.NEXT_PUBLIC_MIRTPAGE_TIKTOK_URL, "tiktok");
const MIRTPAGE_YOUTUBE_URL = socialProfileUrl(process.env.NEXT_PUBLIC_MIRTPAGE_YOUTUBE_URL, "youtube");

function rememberCurrentPublicWorkspace() {
  try {
    window.sessionStorage.setItem(DISCOVERY_RETURN_KEY, `${window.location.pathname}${window.location.search}`);
  } catch {}
}

const iconPath: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  circuit: "M4 4h6v6H4zM14 14h6v6h-6zM10 7h4v10h-4M7 10v4h10",
  leaf: "M19 4C11 4 5 8 5 15c4 1 9-1 12-5-3 4-7 6-12 7M5 20c1-6 5-10 11-13",
  sprout: "M12 21v-9M12 14c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 11c0-4 3-7 8-7 0 5-3 8-8 8",
  bowl: "M4 10h16c0 5-3 9-8 9s-8-4-8-9ZM7 6c1-2 3-3 5-3s4 1 5 3M8 22h8",
  tool: "M14 6 6 14l4 4 8-8M15 3l6 6-3 3-6-6zM4 16l4 4-2 2H2v-4z",
  home: "M3 11 12 4l9 7v9h-6v-6H9v6H3z",
  thread: "M7 4h10v4H7zM8 8h8l2 12H6zM9 12h6M8 16h8",
};

function IndustryIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={iconPath[name] || iconPath.home} /></svg>;
}

type ShowroomPresence = {
  kind: "featured" | "live" | "";
  label: string;
  shortLabel: string;
};

function showroomPresence(showroom: DiscoveryShowroom, featuredNowBusinessId: number | null): ShowroomPresence {
  if (showroom.id === featuredNowBusinessId) return { kind: "featured", label: "Featured now", shortLabel: "Featured" };
  if (showroom.isLive && showroom.livePlatform) return { kind: "live", label: `Live on ${LIVE_PLATFORM_LABELS[showroom.livePlatform]}`, shortLabel: "Live" };
  return { kind: "", label: "", shortLabel: "" };
}

function ShowroomImage({ showroom }: { showroom: DiscoveryShowroom }) {
  const [failed, setFailed] = useState(false);
  return showroom.imagePath && !failed
    ? <Image src={showroom.imagePath} alt="" width={480} height={300} sizes="(max-width: 700px) 46vw, 300px" onError={() => setFailed(true)} />
    : <span className={`discovery-image-fallback ${showroom.fallbackStyle}`} aria-hidden="true"><i>{showroom.name.slice(0, 1)}</i><b>{showroom.name}</b></span>;
}

function ShowroomPreview({ showroom, onClose, onOpen, presence }: { showroom: DiscoveryShowroom; onClose: () => void; onOpen: () => void; presence: ShowroomPresence }) {
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
  const status = presence.label || (showroom.sponsored ? "Sponsored showroom" : showroom.productionScale === "growing_factory" ? "Growing factory" : "Workshop / producer");
  return createPortal(<div className="discovery-preview-layer"><button className="discovery-preview-scrim" type="button" tabIndex={-1} onClick={onClose} aria-label="Dismiss showroom preview" /><aside ref={previewRef} className="discovery-preview" role="dialog" aria-modal="false" aria-labelledby={`showroom-preview-${showroom.id}`} tabIndex={-1}><article><button className="discovery-preview-close" type="button" onClick={onClose} aria-label="Close showroom preview"><X aria-hidden="true" /></button><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span className={presence.kind ? `presence-${presence.kind}` : undefined}>{status}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3><p>{showroom.tagline}</p><small>{showroom.city} · {showroom.zone} · {showroom.region}</small><Link href={`/@${showroom.handle}?ref=featured`} onClick={onOpen}>Open showroom <b aria-hidden="true">→</b></Link></div></article></aside></div>, portalRoot);
}

function featuredHref(featuredDay: number, hash = "daily-featured-title") {
  return `/featured?featuredDay=${featuredDay}${hash ? `#${hash}` : ""}`;
}

function FeaturedGallery({ featured, walkthroughs, featuredNowBusinessId, now }: { featured: WeeklyFeaturedProgram; walkthroughs: FeaturedBoothWalkthrough[]; featuredNowBusinessId: number | null; now: number | null }) {
  const [selected, setSelected] = useState<DiscoveryShowroom | null>(null);
  const sessions = useMemo(() => resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy), [featured.boothCount, featured.programPolicy]);
  const displayBooths = useMemo(() => {
    if (!featured.isToday || now === null) return featured.booths;
    const bySlot = new Map(featured.booths.map((booth) => [booth.slot, booth]));
    return featuredProgramDisplayOrder(walkthroughs, now).map((slot) => bySlot.get(slot)).filter((booth): booth is WeeklyFeaturedProgram["booths"][number] => Boolean(booth));
  }, [featured.booths, featured.isToday, now, walkthroughs]);
  useEffect(() => setSelected(null), [featured.dateLabel, featured.industryCode]);

  if (!featured.booths.length) return <div className="discovery-empty"><h3>Today&apos;s featured lineup is being prepared.</h3><p>More businesses will appear here as their showrooms are published.</p></div>;
  return <div className="featured-gallery-wrap"><div className="featured-gallery" aria-label={`${featured.title}, ${featured.boothCount} featured showrooms`}>
    {displayBooths.map((booth) => {
      const walkthrough = walkthroughs.find((entry) => entry.slot === booth.slot);
      const walkthroughLabel = walkthrough ? `${walkthrough.label} EAT` : `${featuredProgramTimeLabel(sessions.morning.startMinute, sessions.afternoon.endMinute)} EAT`;
      const isCurrent = Boolean(featured.isToday && booth.revealed && booth.showroom.id === featuredNowBusinessId);
      if (!booth.revealed) return <article key={booth.reference} data-featured-slot={booth.slot} className="featured-card featured-card-preview" aria-label={`${booth.reference}, future featured showroom preview, ${walkthroughLabel}`}><span className="featured-card-media"><span className="featured-card-placeholder" aria-hidden="true"><i /><i /><i /></span><b>{booth.reference}</b></span><span className="featured-card-copy"><small>Featured schedule</small><strong>Showroom announced on the day</strong><span>{walkthroughLabel}</span></span></article>;
      const showroom = booth.showroom;
      const presence = showroomPresence(showroom, featuredNowBusinessId);
      return <button key={showroom.id} data-business-id={showroom.id} data-walkthrough-current={isCurrent || undefined} data-presence={presence.kind || undefined} type="button" className={`featured-card${isCurrent ? " walkthrough-current" : presence.kind === "live" ? " merchant-live" : ""}${selected?.id === showroom.id ? " selected" : ""}`} onClick={() => setSelected(showroom)} aria-label={`${booth.reference}, ${showroom.name}, ${showroom.city}, walkthrough ${walkthroughLabel}${presence.label ? `, ${presence.label}` : ""}`}><span className="featured-card-media"><ShowroomImage showroom={showroom} /><b>{booth.reference}</b>{presence.kind ? <i className={`featured-card-presence featured-card-presence-${presence.kind}`}>{presence.shortLabel}</i> : null}</span><span className="featured-card-copy"><small>{showroom.city} · {showroom.primaryIndustryShortLabel}</small><strong>{showroom.name}</strong><span>{presence.label || walkthroughLabel}</span></span></button>;
    })}
  </div>{selected ? <ShowroomPreview showroom={selected} onClose={() => setSelected(null)} onOpen={rememberCurrentPublicWorkspace} presence={showroomPresence(selected, featuredNowBusinessId)} /> : null}</div>;
}

function FeaturedWeekNav({ featured }: { featured: WeeklyFeaturedProgram }) {
  return <nav className="featured-week" aria-label="Daily featured showroom schedule">{featured.schedule.map((day) => <Link key={day.weekday} href={featuredHref(day.weekday)} className={[day.weekday === featured.selectedWeekday ? "active" : "", day.isToday ? "today" : ""].filter(Boolean).join(" ")} aria-current={day.weekday === featured.selectedWeekday ? "date" : undefined} aria-label={`${day.dayLabel}, ${day.dateLabel}, ${day.industryLabel}${day.isToday ? ", today" : ""}`}><span><IndustryIcon name={day.industryIcon} /></span><b>{day.dayLabel.slice(0, 3)}</b><small>{day.dateLabel}</small><em>{day.industryLabel}</em>{day.isToday ? <mark>Today</mark> : null}</Link>)}</nav>;
}

function sponsorForSlot(placements: SponsorPlacement[], slot: number | undefined) {
  return slot && placements.length ? placements[(slot - 1) % placements.length] : null;
}

function TodayProgramSchedule({ featured, agenda, sponsorPlacements }: { featured: WeeklyFeaturedProgram; agenda: FeaturedProgramAgendaEntry[]; sponsorPlacements: SponsorPlacement[] }) {
  if (!featured.isToday) return null;
  const sessions = resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy);
  const intermission = agenda.find((entry) => entry.kind === "intermission");
  const sessionSummary = [sessions.morning, sessions.afternoon].filter((session) => session.boothCount > 0).map((session) => `${session.session === "morning" ? "Morning" : "Evening"} ${featuredProgramTimeLabel(session.startMinute, session.endMinute)}`).join(" · ");
  const boothName = (slot: number) => {
    const booth = featured.booths[slot - 1];
    return booth?.revealed ? booth.showroom.name : `Booth ${slot}`;
  };
  const sessionSection = (session: "morning" | "afternoon", label: string) => {
    const entries = agenda.filter((entry) => entry.session === session && (entry.kind === "booth" || entry.kind === "sponsor_break"));
    if (!entries.length) return null;
    const resolved = sessions[session];
    return <section className={`featured-agenda-session featured-agenda-${session}`} aria-label={`${label} featured showroom schedule`}><header><span>{label}</span><strong>{featuredProgramTimeLabel(resolved.startMinute, resolved.endMinute)} EAT</strong></header><ol>{entries.map((entry) => entry.kind === "booth"
      ? <li key={`booth-${entry.slot}`} className={entry.current ? "current" : undefined} aria-current={entry.current ? "time" : undefined}><time>{entry.label}</time><span><b>{boothName(entry.slot)}</b><small>Booth {String(entry.slot).padStart(2, "0")}</small></span></li>
      : <li key={`${entry.kind}-${entry.start}`} className={`featured-agenda-break${entry.current ? " current" : ""}`} aria-current={entry.current ? "time" : undefined}><time>{entry.timeLabel}</time><span><b>{sponsorForSlot(sponsorPlacements, entry.sponsorSlot)?.name || entry.label}</b><small>{entry.sponsorSlot ? "Sponsor spotlight" : "Program break"}</small></span></li>)}</ol></section>;
  };
  return <details className="featured-agenda"><summary><CalendarClock aria-hidden="true" /><span><small>Today&apos;s schedule</small><strong>{sessionSummary || "No presentations scheduled"}</strong></span><em>{featured.boothCount} {featured.boothCount === 1 ? "showroom" : "showrooms"}</em><ChevronDown className="featured-agenda-chevron" aria-hidden="true" /></summary><div className="featured-agenda-body">{sessionSection("morning", "Morning session")}{intermission?.kind === "intermission" ? <div className={`featured-agenda-intermission${intermission.current ? " current" : ""}`} aria-current={intermission.current ? "time" : undefined}><span>{intermission.label}</span><strong>{intermission.timeLabel} EAT</strong></div> : null}{sessionSection("afternoon", "Evening session")}<p>Five-minute booth changeovers are included between listed presentations unless a sponsor break is shown.</p></div></details>;
}

function SponsoredRail({ placements, activeSponsorSlot }: { placements: SponsorPlacement[]; activeSponsorSlot?: number }) {
  const baseSponsors = placements.slice(0, 5);
  const activeSponsor = sponsorForSlot(baseSponsors, activeSponsorSlot);
  const sponsors = activeSponsor ? [activeSponsor, ...baseSponsors.filter((placement) => placement.id !== activeSponsor.id)] : baseSponsors;
  const [mobileStart, setMobileStart] = useState(0);
  useEffect(() => {
    if (sponsors.length <= 2 || activeSponsor) return;
    const timer = window.setInterval(() => setMobileStart((current) => (current + 2) % sponsors.length), 7_000);
    return () => window.clearInterval(timer);
  }, [activeSponsor, sponsors.length]);
  const mobileVisible = activeSponsor ? new Set([0, Math.min(1, sponsors.length - 1)]) : new Set([mobileStart, (mobileStart + 1) % Math.max(1, sponsors.length)]);
  if (!sponsors.length) return null;
  return <aside className="discovery-sponsored" id="featured-sponsors" aria-labelledby="featured-sponsors-title"><header className="discovery-sponsored-heading"><div><span>Paid placement</span><h2 id="featured-sponsors-title">Sponsors</h2><p>Businesses supporting their placement on MirtPage.</p></div><small>{sponsors.length} sponsors</small></header><div className="discovery-sponsored-rail">{sponsors.map((sponsor, index) => <a key={sponsor.id} className={sponsor.id === activeSponsor?.id ? "sponsor-spotlight" : undefined} href={sponsor.href} target={sponsor.kind === "external" && sponsor.href.startsWith("https://") ? "_blank" : undefined} rel={sponsor.kind === "external" && sponsor.href.startsWith("https://") ? "noreferrer" : undefined} onClick={sponsor.kind === "showroom" ? rememberCurrentPublicWorkspace : undefined} data-mobile-visible={mobileVisible.has(index) ? "true" : undefined}>{sponsor.imagePath ? <img src={sponsor.imagePath} alt="" loading="lazy" /> : <span className="discovery-image-fallback" aria-hidden="true">{sponsor.name.slice(0, 1)}</span>}<span><small>{sponsor.id === activeSponsor?.id ? "Sponsor spotlight" : "Sponsored"}</small><b>{sponsor.name}</b><span className="sponsor-placement-details">{sponsor.details}</span><em>{sponsor.actionLabel} <strong aria-hidden="true">→</strong></em></span></a>)}</div></aside>;
}

function FeaturedBroadcastStatus({ featured, selectedDay, now, agenda, sponsorPlacements }: { featured: WeeklyFeaturedProgram; selectedDay: WeeklyFeaturedProgram["schedule"][number] | undefined; now: number | null; agenda: FeaturedProgramAgendaEntry[]; sponsorPlacements: SponsorPlacement[] }) {
  if (!selectedDay) return null;
  const sessions = resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy);
  const phase: FeaturedBroadcastPhase = now === null ? "scheduled" : featuredBroadcastPhase(selectedDay.dateIso, featured.boothCount, now, featured.programPolicy);
  const activeEntry = agenda.find((entry) => entry.current);
  const activeWalkthrough = activeEntry?.kind === "booth" ? activeEntry : null;
  const activeBooth = activeWalkthrough ? featured.booths[activeWalkthrough.slot - 1] : null;
  const activeBusiness = activeBooth?.revealed ? activeBooth.showroom.name : null;
  const activeSponsor = activeEntry?.kind === "sponsor_break" ? sponsorForSlot(sponsorPlacements, activeEntry.sponsorSlot) : null;
  const sessionSummary = `${featuredProgramTimeLabel(sessions.morning.startMinute, sessions.morning.endMinute)} · ${featuredProgramTimeLabel(sessions.afternoon.startMinute, sessions.afternoon.endMinute)} EAT`;
  const afternoonRestart = featuredProgramTimeLabel(sessions.afternoon.startMinute, sessions.afternoon.startMinute).split("–")[0];
  const content = phase === "live"
    ? activeWalkthrough
      ? { title: `TikTok Live · ${activeBooth?.reference || "Booth walkthrough"}`, detail: `${activeBusiness ? `Now visiting ${activeBusiness} · ` : ""}${activeWalkthrough.label} EAT`, action: "Watch live", href: MIRTPAGE_TIKTOK_URL }
      : activeEntry && (activeEntry.kind === "changeover" || activeEntry.kind === "sponsor_break")
        ? { title: activeSponsor ? `Sponsor spotlight · ${activeSponsor.name}` : `${activeEntry.label} · ${activeEntry.timeLabel} EAT`, detail: activeSponsor ? `${activeEntry.timeLabel} EAT · Paid placement` : "The next featured showroom begins shortly.", action: "Watch live", href: MIRTPAGE_TIKTOK_URL }
        : { title: "TikTok Live program", detail: sessionSummary, action: "Watch live", href: MIRTPAGE_TIKTOK_URL }
    : phase === "intermission"
      ? { title: `${featured.programPolicy.intermissionLabel} · ${featuredProgramTimeLabel(sessions.morning.endMinute, sessions.afternoon.startMinute)} EAT`, detail: `Evening walkthroughs resume at ${afternoonRestart} EAT.`, action: "TikTok", href: MIRTPAGE_TIKTOK_URL }
      : phase === "ended"
        ? { title: "Livestream ended", detail: "Watch the business recordings on YouTube.", action: "View recordings", href: MIRTPAGE_YOUTUBE_URL }
        : { title: featured.isToday ? "Live on TikTok today" : `Live on ${selectedDay.dayLabel}`, detail: sessionSummary, action: "TikTok", href: MIRTPAGE_TIKTOK_URL };
  return <aside className={`featured-program featured-program-${phase}`} aria-label="Featured showroom livestream status"><span><Radio aria-hidden="true" />{featured.isToday ? "Today’s broadcast" : "Program preview"}</span><strong>{content.title}</strong><small>{content.detail}</small>{content.href ? <a href={content.href} target="_blank" rel="noreferrer">{content.action}<ExternalLink aria-hidden="true" /></a> : null}</aside>;
}

function WeeklyFeatured({ featured, sponsorPlacements, featuredNowBusinessId }: { featured: WeeklyFeaturedProgram; sponsorPlacements: SponsorPlacement[]; featuredNowBusinessId: number | null }) {
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
  const activeSponsorEntry = agenda.find((entry): entry is FeaturedProgramBreak => entry.kind === "sponsor_break" && entry.current);
  useEffect(() => {
    if (featured.isToday || !today) return;
    const timer = window.setTimeout(() => router.replace(featuredHref(today.weekday), { scroll: false }), 6_000);
    return () => window.clearTimeout(timer);
  }, [featured.isToday, featured.selectedWeekday, router, today]);
  return <section className={`daily-featured featured-theme-${featured.industryCode.toLowerCase()}`} aria-labelledby="daily-featured-title"><div className="featured-program-header"><header className="daily-featured-head"><div><span className="discovery-kicker">{featured.industryLabel} · {featured.dayLabel} · {featured.dateLabel} · Country-wide</span><h1 id="daily-featured-title">{featured.title}</h1><p>{featured.isToday ? `Meet today's ${featured.industryLabel.toLowerCase()} businesses from across Ethiopia, then open any showroom for products, capabilities, and direct contact.` : `Preview the ${featured.dayLabel} program. Participating businesses are revealed when their featured day opens.`}</p></div><FeaturedBroadcastStatus featured={featured} selectedDay={selectedDay} now={broadcastNow} agenda={agenda} sponsorPlacements={sponsorPlacements} /></header><TodayProgramSchedule featured={featured} agenda={agenda} sponsorPlacements={sponsorPlacements} /></div><div className="featured-experience"><FeaturedWeekNav featured={featured} /><FeaturedGallery featured={featured} walkthroughs={walkthroughs} featuredNowBusinessId={featuredNowBusinessId} now={broadcastNow} /><SponsoredRail placements={sponsorPlacements} activeSponsorSlot={activeSponsorEntry?.sponsorSlot} /></div></section>;
}

export default function FeaturedShowroomsWorkspace({ discovery, sponsoredShowrooms }: { discovery: FeaturedShowroomsView; sponsoredShowrooms: SponsorPlacement[] }) {
  return <section className="discovery discovery-featured-experience" aria-label="Daily Featured Showrooms experience"><WeeklyFeatured featured={discovery.featured} sponsorPlacements={sponsoredShowrooms} featuredNowBusinessId={discovery.featuredNowBusinessId} /></section>;
}
