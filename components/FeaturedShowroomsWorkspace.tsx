"use client";
import SponsorCarousel from "./SponsorCarousel";
import launchStyles from "./LaunchClarity.module.css";
import { useUiText } from "@/lib/i18n/ui";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";


import Image from "next/image";
import CategoryIllustration from "./CategoryIllustration";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DiscoveryShowroom, FeaturedShowroomsView, SponsorPlacement, WeeklyFeaturedProgram } from "@/lib/discovery";
import {
  buildFeaturedProgramAgenda,
  featuredProgramDisplayOrder,
  featuredProgramTimeLabel,
  type FeaturedBoothWalkthrough,
  type FeaturedProgramAgendaEntry,
} from "@/lib/featured-program";
import { featuredBroadcastHeader } from "@/lib/featured-broadcast-header";
import { publicLiveLink } from "@/lib/public-live-link";
import { discoveryLocationLabel } from "@/lib/discovery-contract";

const DISCOVERY_RETURN_KEY = "suqpage:last-marketplace-url:v1";

function socialProfileUrl(value: string | undefined, provider: "tiktok" | "youtube") {
  return publicLiveLink(value, provider);
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
  return createPortal(<div className="discovery-preview-layer"><button className="discovery-preview-scrim" type="button" tabIndex={-1} onClick={onClose} aria-label={t("Dismiss page preview")} /><aside ref={previewRef} className="discovery-preview" role="dialog" aria-modal="false" aria-labelledby={`showroom-preview-${showroom.id}`} data-hero-image={showroom.heroImagePath || undefined} tabIndex={-1}><article><button className="discovery-preview-close" type="button" onClick={onClose} aria-label={t("Close page preview")}><X aria-hidden="true" /></button><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span className={presence.kind ? `presence-${presence.kind}` : undefined}>{t(status)}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3>{showroom.isDemo ? <span className={launchStyles.example}>{t("Example page")}</span> : null}<p>{showroom.tagline}</p><small>{discoveryLocationLabel([showroom.city, showroom.zone, showroom.region])}</small><Link href={`/@${showroom.handle}?ref=featured`} onClick={onOpen}>{t("Open page")}{" "}<b aria-hidden="true">→</b></Link></div></article></aside></div>, portalRoot);
}

function featuredHref(featuredDay: number, hash = "daily-featured-title") {
  return `/featured?featuredDay=${featuredDay}${hash ? `#${hash}` : ""}`;
}

function FeaturedGallery({ featured, walkthroughs, featuredNowBusinessId, now }: { featured: WeeklyFeaturedProgram; walkthroughs: FeaturedBoothWalkthrough[]; featuredNowBusinessId: number | null; now: number | null }) {
  const t = useUiText();
  const [selected, setSelected] = useState<DiscoveryShowroom | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const displayBooths = useMemo(() => {
    if (!featured.isToday || now === null) return featured.booths;
    const bySlot = new Map(featured.booths.map((booth) => [booth.slot, booth]));
    return featuredProgramDisplayOrder(walkthroughs, now).map((slot) => bySlot.get(slot)).filter((booth): booth is WeeklyFeaturedProgram["booths"][number] => Boolean(booth));
  }, [featured.booths, featured.isToday, now, walkthroughs]);
  useEffect(() => setSelected(null), [featured.dateLabel, featured.industryCode]);
  const visibleSelection = featured.isToday && selected && featured.booths.some(booth => booth.revealed && booth.showroom.id === selected.id) ? selected : null;

  if (!featured.booths.length) return <div className="discovery-empty"><h3>{t(featured.isToday ? "Today's featured lineup is being prepared." : "No businesses are scheduled for this day")}</h3><p>{t("More businesses will appear as they publish their pages.")}</p></div>;
  return <div className="featured-gallery-wrap"><div className="featured-gallery" aria-label={t("{value1}, {value2} featured businesses", { value1: featured.title, value2: featured.boothCount })}>
    {displayBooths.map((booth) => {
      const walkthrough = walkthroughs.find((entry) => entry.slot === booth.slot);
      const walkthroughLabel = walkthrough ? `${walkthrough.label} EAT` : `${featuredProgramTimeLabel(featured.programPolicy.startMinute, featured.programPolicy.endMinute)} EAT`;
      const isCurrent = Boolean(featured.isToday && booth.revealed && booth.showroom.id === featuredNowBusinessId);
      if (!featured.isToday || !booth.revealed) return <article key={booth.slot} data-featured-slot={booth.slot} className="featured-card featured-card-preview" aria-label={`${t("Participant announced that day")} · ${walkthroughLabel}`}><span className="featured-card-media"><span className="featured-card-placeholder" aria-hidden="true"><i /><i /><i /></span></span><span className="featured-card-copy"><strong>{t("Participant announced that day")}</strong><time>{walkthroughLabel}</time></span></article>;
      const showroom = booth.showroom;
      const presence = showroomPresence(showroom, featuredNowBusinessId, t);
      return <button disabled={!ready} key={showroom.id} data-business-id={showroom.id} data-hero-image={showroom.heroImagePath || undefined} data-walkthrough-current={isCurrent || undefined} data-presence={presence.kind || undefined} type="button" className={`featured-card${isCurrent ? " walkthrough-current" : presence.kind === "live" ? " merchant-live" : ""}${visibleSelection?.id === showroom.id ? " selected" : ""}`} onClick={() => setSelected(showroom)} aria-label={`${t("{value1}, {value2}, {value3}. View details.", {value1:showroom.name,value2:t(showroom.primaryIndustryLabel),value3:showroom.city})} ${walkthroughLabel}${presence.label ? ` · ${t(presence.label)}` : ""}`}><span className="featured-card-media"><ShowroomImage showroom={showroom} />{presence.kind ? <i className={`featured-card-presence featured-card-presence-${presence.kind}`}>{t(presence.shortLabel)}</i> : null}</span><span className="featured-card-copy"><small>{showroom.city}</small><strong>{showroom.name}</strong>{showroom.isDemo ? <span className={launchStyles.example}>{t("Example page")}</span> : null}<time>{walkthroughLabel}</time></span></button>;
    })}
  </div>{visibleSelection ? <ShowroomPreview showroom={visibleSelection} onClose={() => setSelected(null)} onOpen={rememberCurrentPublicWorkspace} presence={showroomPresence(visibleSelection, featuredNowBusinessId, t)} /> : null}</div>;
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

function FeaturedBroadcastStatus({ featured, selectedDay, now }: { featured: WeeklyFeaturedProgram; selectedDay: WeeklyFeaturedProgram["schedule"][number] | undefined; now: number | null }) {
  const t = useUiText();
  if (!selectedDay) return null;
  const status = featuredBroadcastHeader({ day: selectedDay, boothCount: featured.boothCount,
    now: now ?? Date.parse(`${selectedDay.dateIso}T00:00:00+03:00`), policy: featured.programPolicy,
    tiktokUrl: SUQPAGE_TIKTOK_URL, youtubeUrl: SUQPAGE_YOUTUBE_URL, t });
  return <div className={`featured-program featured-program-${status.phase}`} aria-label={t("Daily Featured status")}>
    <span>{t(selectedDay.dayLabel)} · {selectedDay.dateLabel}</span><time>{status.timeLabel}</time><span className="featured-program-status">{status.statusLabel}</span>
    {status.href ? <a href={status.href} target="_blank" rel="noreferrer">{status.actionLabel}<ExternalLink aria-hidden="true" /></a> : null}
  </div>;
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
  return <section className={`daily-featured featured-theme-${featured.industryCode.toLowerCase()}`} aria-labelledby="daily-featured-title">
    <header className="featured-program-header daily-featured-head"><h1 id="daily-featured-title">{t("Daily Featured on TikTok Live")}</h1><FeaturedBroadcastStatus featured={featured} selectedDay={selectedDay} now={broadcastNow} /></header>
    <div className="featured-experience"><FeaturedWeekNav featured={featured} /><FeaturedGallery featured={featured} walkthroughs={walkthroughs} featuredNowBusinessId={currentBusinessId} now={broadcastNow} /><SponsorCarousel placements={sponsorPlacements} onOpenShowroom={rememberCurrentPublicWorkspace} /></div>
  </section>;
}

export default function FeaturedShowroomsWorkspace({ discovery, sponsoredShowrooms }: { discovery: FeaturedShowroomsView; sponsoredShowrooms: SponsorPlacement[] }) {
  const t = useUiText();
  return <section className="discovery discovery-featured-experience" aria-label={t("Daily Featured")}><WeeklyFeatured featured={discovery.featured} sponsorPlacements={sponsoredShowrooms} featuredNowBusinessId={discovery.featuredNowBusinessId} /></section>;
}
