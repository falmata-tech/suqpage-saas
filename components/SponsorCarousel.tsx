"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { SponsorPlacement } from "@/lib/discovery";
import { useUiText } from "@/lib/i18n/ui";
import { useSponsorRotation } from "@/lib/use-sponsor-rotation";
import styles from "./SponsorCarousel.module.css";

export default function SponsorCarousel({ placements, onOpenShowroom }: {
  placements: SponsorPlacement[]; onOpenShowroom: () => void;
}) {
  const sponsors = placements.slice(0, 5);
  return sponsors.length ? <Carousel key={sponsors.map(s => s.id).join(",")} sponsors={sponsors} onOpenShowroom={onOpenShowroom} /> : null;
}

function Carousel({ sponsors, onOpenShowroom }: { sponsors: SponsorPlacement[]; onOpenShowroom: () => void }) {
  const t = useUiText();
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(motion.matches);
    const updateVisibility = () => setForeground(document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5), { threshold: [0, 0.5] });
    if (root.current) observer.observe(root.current);
    updateMotion(); updateVisibility();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => { observer.disconnect(); motion.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", updateVisibility); };
  }, []);
  const rotation = useSponsorRotation(sponsors.length, visible && foreground && !hovered && !focused, reduced);
  const sponsor = sponsors[rotation.index];
  const external = sponsor.kind === "external" && sponsor.href.startsWith("https://");
  return <aside ref={root} id="featured-sponsors" className={styles.carousel} aria-label={t("Sponsors")}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <header className={styles.header}>
      <h2>{t("Sponsored")}</h2>
      {sponsors.length > 1 && <div className={styles.controls}>
        <span className={styles.count}>{rotation.index + 1} / {sponsors.length}</span>
        <button type="button" onClick={() => { if (rotation.paused) { setFocused(false); setHovered(false); } rotation.toggle(); }} aria-label={t(rotation.paused ? "Resume sponsors" : "Pause sponsors")} title={t(rotation.paused ? "Resume sponsors" : "Pause sponsors")}>
          {rotation.paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
        <button type="button" onClick={() => rotation.step(-1)} aria-label={t("Previous sponsor")} title={t("Previous sponsor")}><ChevronLeft aria-hidden="true" /></button>
        <button type="button" onClick={() => rotation.step(1)} aria-label={t("Next sponsor")} title={t("Next sponsor")}><ChevronRight aria-hidden="true" /></button>
      </div>}
    </header>
    <div className={styles.viewport} aria-live={rotation.running ? "off" : "polite"} aria-atomic="true">
      <a key={sponsor.id} className={styles.card} data-sponsor-id={sponsor.id} href={sponsor.href}
        target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}
        onClick={sponsor.kind === "showroom" ? onOpenShowroom : undefined}>
        {sponsor.imagePath ? <img src={sponsor.imagePath} alt="" /> : <span className={styles.fallback} aria-hidden="true">{sponsor.name.slice(0, 1)}</span>}
        <span className={styles.copy}><b>{sponsor.name}</b><span className={styles.details}>{sponsor.details}</span><em>{t(sponsor.actionLabel)} <ChevronRight aria-hidden="true" /></em></span>
      </a>
    </div>
  </aside>;
}
