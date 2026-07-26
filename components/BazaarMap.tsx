"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BazaarBoothView, CurrentBazaarView } from "@/lib/bazaar";

type Point = { x: number; y: number };

export default function BazaarMap({ bazaar, embedded = false }: { bazaar: CurrentBazaarView; embedded?: boolean }) {
  const [view, setView] = useState<"map" | "list">("map");
  const initialScale = embedded ? 1.05 : 0.74;
  const initialOffset = embedded ? { x: -18, y: 0 } : { x: -80, y: -20 };
  const [scale, setScale] = useState(initialScale);
  const [offset, setOffset] = useState<Point>(initialOffset);
  const [selectedId, setSelectedId] = useState<number | null>(bazaar.booths[0]?.id || null);
  const drag = useRef<{ pointerId: number; start: Point; origin: Point } | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("suqpage-bazaar-view");
    if (saved === "map" || saved === "list") setView(saved);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("suqpage-bazaar-view", view);
  }, [view]);

  const selected = useMemo(
    () => bazaar.booths.find((booth) => booth.id === selectedId) || bazaar.booths[0] || null,
    [bazaar.booths, selectedId],
  );

  function zoomBy(delta: number) {
    setScale((value) => Math.max(0.5, Math.min(1.35, Number((value + delta).toFixed(2)))));
  }

  function resetView() {
    setScale(initialScale);
    setOffset(initialOffset);
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: offset,
    };
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    setOffset({
      x: drag.current.origin.x + event.clientX - drag.current.start.x,
      y: drag.current.origin.y + event.clientY - drag.current.start.y,
    });
  }

  function stopDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  }

  if (bazaar.status === "unavailable") {
    return (
      <section className="bazaar-empty" aria-labelledby="bazaar-unavailable-title">
        <h2 id="bazaar-unavailable-title">Bazaar unavailable</h2>
        <p>The daily Bazaar schedule is not configured yet. Permanent showrooms are still available.</p>
        <Link className="btn brand" href="/#showrooms">View showrooms</Link>
      </section>
    );
  }

  if (bazaar.status === "empty") {
    return (
      <section className="bazaar-empty" aria-labelledby="bazaar-empty-title">
        <h2 id="bazaar-empty-title">No booths in today&apos;s Bazaar yet</h2>
        <p>Every active showroom remains available through the public directory.</p>
        <Link className="btn brand" href="/#showrooms">View showrooms</Link>
      </section>
    );
  }

  return (
    <section className={`bazaar-explorer${embedded ? " bazaar-explorer-embedded" : ""}`} aria-labelledby="bazaar-title">
        <div className="bazaar-section-head">
        <div>
          <span className="eyebrow">Live now</span>
          <h2 id="bazaar-title">Today&apos;s Bazaar: {bazaar.themeName}</h2>
          <p>Changes daily at 4:00 AM in {bazaar.timezone}. Drag the floor or use Bazaar List.</p>
        </div>
        <div className="bazaar-tabs" role="tablist" aria-label="Bazaar view">
          <button type="button" role="tab" aria-selected={view === "map"} className={view === "map" ? "active" : ""} onClick={() => setView("map")}>Bazaar View</button>
          <button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "active" : ""} onClick={() => setView("list")}>Bazaar List</button>
          {embedded ? <Link className="bazaar-all-link" href="/#showrooms">View all showrooms</Link> : null}
        </div>
      </div>

      {view === "map" ? (
        <div className="bazaar-map-shell">
          <div className="bazaar-map-toolbar" aria-label="Bazaar map controls">
            <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.12)}>+</button>
            <button type="button" aria-label="Zoom out" onClick={() => zoomBy(-0.12)}>-</button>
            <button type="button" aria-label="Reset Bazaar view" onClick={resetView}>Reset</button>
          </div>
          <div
            className="bazaar-map-viewport"
            aria-label="Draggable Bazaar floor"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
          >
            <div
              className="bazaar-floor bazaar-floor-visual"
              style={{
                width: bazaar.floor.width,
                height: bazaar.floor.height,
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              }}
            >
              <div className="bazaar-lounge">Bazaar Lounge</div>
              {bazaar.booths.map((booth) => (
                <button
                  key={booth.id}
                  type="button"
                  className={`bazaar-booth${selectedId === booth.id ? " selected" : ""}${booth.featured ? " featured" : ""}`}
                  style={{ left: booth.x, top: booth.y, width: booth.width, height: booth.height }}
                  data-fallback={booth.fallbackToken}
                  aria-label={`Select ${booth.name} booth`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setSelectedId(booth.id)}
                >
                  <BoothMedia booth={booth} />
                  <span>{booth.name}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="bazaar-drag-note">Drag to explore the Bazaar floor.</p>
          {selected ? <BoothPreview booth={selected} onClose={() => setSelectedId(null)} /> : null}
          {embedded ? <BazaarDirectory booths={bazaar.booths} selectedId={selectedId} onSelect={setSelectedId} /> : null}
        </div>
      ) : (
        <BazaarList booths={bazaar.booths} />
      )}
    </section>
  );
}

function BazaarDirectory({
  booths,
  selectedId,
  onSelect,
}: {
  booths: BazaarBoothView[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <aside className="bazaar-map-directory" aria-label={`Bazaar Directory (${booths.length})`}>
      <div className="bazaar-map-directory-head">
        <strong>Bazaar Directory ({booths.length})</strong>
        <span aria-hidden="true">×</span>
      </div>
      <div className="bazaar-map-directory-list">
        {booths.map((booth) => (
          <button
            type="button"
            key={booth.id}
            className={selectedId === booth.id ? "active" : ""}
            onClick={() => onSelect(booth.id)}
          >
            <BoothMedia booth={booth} />
            <span>
              <strong>{booth.name}</strong>
              <small>@{booth.handle}</small>
              <small>{booth.industryLabel}</small>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      <Link href="/#showrooms">View all showrooms <span aria-hidden="true">→</span></Link>
    </aside>
  );
}

function BoothMedia({ booth }: { booth: BazaarBoothView }) {
  if (!booth.imageUrl) {
    return <span className="bazaar-booth-fallback" aria-hidden="true">{booth.name.slice(0, 1).toUpperCase()}</span>;
  }
  return <img src={booth.imageUrl} alt="" loading="lazy" />;
}

function BoothPreview({ booth, onClose }: { booth: BazaarBoothView; onClose: () => void }) {
  return (
    <aside className="bazaar-preview" aria-label={`${booth.name} booth preview`}>
      <button type="button" className="bazaar-preview-close" aria-label="Close booth preview" onClick={onClose}>Close</button>
      <BoothMedia booth={booth} />
      <div>
        <span className="eyebrow">{booth.featured ? "Featured" : booth.industryLabel}</span>
        <h3>{booth.name}</h3>
        <p className="bazaar-handle">@{booth.handle}</p>
        <p>{booth.description}</p>
        <Link className="btn brand" href={`/@${booth.handle}`}>Enter showroom</Link>
      </div>
    </aside>
  );
}

function BazaarList({ booths }: { booths: BazaarBoothView[] }) {
  return (
    <div className="bazaar-list" aria-label="Bazaar List">
      {booths.map((booth) => (
        <article key={booth.id} className="bazaar-list-card">
          <BoothMedia booth={booth} />
          <div>
            <span className="eyebrow">{booth.featured ? "Featured" : booth.industryLabel}</span>
            <h3>{booth.name}</h3>
            <p className="bazaar-handle">@{booth.handle}</p>
            <p>{booth.description}</p>
          </div>
          <Link className="small-btn" href={`/@${booth.handle}`}>Enter showroom</Link>
        </article>
      ))}
    </div>
  );
}
