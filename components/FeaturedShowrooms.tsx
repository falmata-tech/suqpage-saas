"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ShowroomDirectoryEntry } from "@/components/ShowroomDirectory";
import { HOMEPAGE_FEATURED_ADVANCE_MS } from "@/lib/marketplace-home";

function FeaturedCard({ entry, clone = false }: { entry: ShowroomDirectoryEntry; clone?: boolean }) {
  return (
    <Link
      href={`/@${entry.handle}`}
      className="featured-card"
      data-carousel-clone={clone ? "true" : undefined}
      aria-hidden={clone || undefined}
      tabIndex={clone ? -1 : undefined}
    >
      <div className="featured-media">
        {entry.imageUrl ? (
          <Image src={entry.imageUrl} alt="" width={560} height={320} sizes="(max-width: 720px) 78vw, 280px" />
        ) : (
          <span className="market-media-fallback" aria-hidden="true">{entry.name.slice(0, 1)}</span>
        )}
        <span>Featured</span>
      </div>
      <div>
        <strong>{entry.name}</strong>
        <span>/@{entry.handle}</span>
        <small>{entry.industry}</small>
      </div>
    </Link>
  );
}

export default function FeaturedShowrooms({ entries }: { entries: ShowroomDirectoryEntry[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (entries.length < 2 || paused || !documentVisible || reducedMotion.matches) return;

    const interval = window.setInterval(() => {
      const rail = railRef.current;
      const cards = rail?.querySelectorAll<HTMLElement>(".featured-card");
      if (!rail || !cards?.length) return;

      const next = cursorRef.current + 1;
      cursorRef.current = next;
      rail.scrollTo({ left: cards[next].offsetLeft, behavior: "smooth" });

      if (next === entries.length) {
        resetTimerRef.current = setTimeout(() => {
          rail.scrollTo({ left: 0, behavior: "auto" });
          cursorRef.current = 0;
        }, 700);
      }
    }, HOMEPAGE_FEATURED_ADVANCE_MS);

    return () => {
      window.clearInterval(interval);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [documentVisible, entries, paused]);

  if (!entries.length) return null;

  return (
    <div
      className="featured-viewport"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="featured-rail" ref={railRef} aria-label="Featured showrooms">
        {entries.map((entry) => <FeaturedCard entry={entry} key={entry.id} />)}
        {entries.length > 1 && entries.map((entry) => <FeaturedCard entry={entry} clone key={`clone-${entry.id}`} />)}
      </div>
    </div>
  );
}
