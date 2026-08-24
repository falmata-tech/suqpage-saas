"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crosshair, LocateFixed, Minus, Plus, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MarketplaceMap, { type MarketplaceMapController } from "@/components/MarketplaceMap";
import type { DiscoveryNearbyGroup, DiscoverySearchSuggestion, DiscoveryShowroom, MarketplaceDiscoveryView } from "@/lib/discovery";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";

const ETHIOPIA_BOUNDS: [number, number, number, number] = [32, 3, 49, 15];
const DISCOVERY_SESSION_KEY = "mirtpage:discovery-navigation:v2";
const DISCOVERY_RETURN_KEY = "mirtpage:last-marketplace-url:v1";

type MapView = {
  center: [number, number];
  zoom: number;
};

type DiscoverySessionState = {
  scope: string;
  activeNearbyGroupKey: string | null;
  mapView: MapView;
  updatedAt: number;
};

function readDiscoverySession(scope: string): DiscoverySessionState | null {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(DISCOVERY_SESSION_KEY) || "null") as DiscoverySessionState | null;
    if (!parsed || parsed.scope !== scope || Date.now() - parsed.updatedAt > 2 * 60 * 60 * 1000) return null;
    if (![...parsed.mapView.center, parsed.mapView.zoom].every(Number.isFinite)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDiscoverySession(state: DiscoverySessionState) {
  try {
    window.sessionStorage.setItem(DISCOVERY_SESSION_KEY, JSON.stringify(state));
  } catch {}
}

function rememberCurrentPublicWorkspace() {
  try {
    window.sessionStorage.setItem(DISCOVERY_RETURN_KEY, `${window.location.pathname}${window.location.search}${window.location.pathname === "/" ? "#discover" : ""}`);
  } catch {}
}

const compactIndustryLabels: Record<string, string> = {
  all: "All industries",
  electronics: "Electronics",
  "beauty-wellness": "Beauty & home care",
  "agriculture-growers": "Agriculture & growers",
  "food-farming": "Food & beverages",
  "machinery-tools": "Machinery & industrial",
  "home-living": "Furniture & home",
  "fashion-textiles": "Textiles & apparel",
};

type ShowroomPresence = {
  kind: "featured" | "live" | "";
  label: string;
  shortLabel: string;
};

function showroomPresence(showroom: DiscoveryShowroom, featuredNowBusinessId: number | null): ShowroomPresence {
  if (showroom.id === featuredNowBusinessId) return { kind: "featured", label: "Featured now", shortLabel: "Featured" };
  if (showroom.isLive && showroom.livePlatform) {
    return { kind: "live", label: `Live on ${LIVE_PLATFORM_LABELS[showroom.livePlatform]}`, shortLabel: "Live" };
  }
  return { kind: "", label: "", shortLabel: "" };
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
  live: "M8 8.5a5 5 0 0 0 0 7M5 5.5a9 9 0 0 0 0 13M16 8l5-3v14l-5-3zM3 8h13v8H3z",
};

function IndustryIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={iconPath[name] || iconPath.home} /></svg>;
}

function MapPinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>;
}

function DiscoverySearch({ id, value, suggestions, onChange, onSelect, onClear }: { id: string; value: string; suggestions: DiscoverySearchSuggestion[]; onChange: (value: string) => void; onSelect: (value: string) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedValue = value.trim().toLocaleLowerCase();
  const visibleSuggestions = normalizedValue.length >= 2
    ? suggestions.filter((suggestion) => `${suggestion.label} ${suggestion.detail} ${suggestion.query}`.toLocaleLowerCase().includes(normalizedValue)).slice(0, 6)
    : [];
  const listboxId = `${id}-suggestions`;
  const expanded = open && visibleSuggestions.length > 0;
  const choose = (suggestion: DiscoverySearchSuggestion) => {
    setOpen(false);
    setActiveIndex(-1);
    onSelect(suggestion.query);
  };
  return <div className="discovery-search" role="search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { setOpen(false); setActiveIndex(-1); } }}>
    <label><span className="sr-only">Search by business, offering, capability, or place. Results and suggestions update as you type.</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg><input id={id} name="q" type="search" role="combobox" value={value} onFocus={() => setOpen(true)} onChange={(event) => { setOpen(true); setActiveIndex(-1); onChange(event.target.value); }} onKeyDown={(event) => {
      if (event.key === "ArrowDown" && visibleSuggestions.length) { event.preventDefault(); setOpen(true); setActiveIndex((current) => Math.min(current + 1, visibleSuggestions.length - 1)); }
      if (event.key === "ArrowUp" && visibleSuggestions.length) { event.preventDefault(); setOpen(true); setActiveIndex((current) => current <= 0 ? visibleSuggestions.length - 1 : current - 1); }
      if (event.key === "Enter" && expanded && activeIndex >= 0) { event.preventDefault(); choose(visibleSuggestions[activeIndex]); }
      if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); }
    }} maxLength={80} autoComplete="off" aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listboxId : undefined} aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined} placeholder="Search" /></label>
    {value ? <button className="discovery-search-clear" type="button" onClick={() => { setOpen(false); setActiveIndex(-1); onClear(); }} aria-label="Clear marketplace search" title="Clear search"><X aria-hidden="true" /></button> : null}
    {expanded ? <div id={listboxId} className="discovery-search-suggestions" role="listbox" aria-label="Search suggestions">{visibleSuggestions.map((suggestion, index) => <button id={`${listboxId}-${index}`} key={`${suggestion.kind}-${suggestion.query}`} type="button" role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(suggestion)}><span><b>{suggestion.label}</b><small>{suggestion.detail}</small></span><em>{suggestion.kind === "offering" ? "Offering" : suggestion.kind === "showroom" ? "Showroom" : "Place"}</em></button>)}</div> : null}
  </div>;
}

function IndustryPicker({ discovery, action }: { discovery: MarketplaceDiscoveryView; action: string }) {
  return <details className="discovery-industry-picker">
    <summary data-industry={discovery.industry.key} aria-label="Choose an industry"><IndustryIcon name={discovery.industry.icon} /><span><small>Industry</small><b>{compactIndustryLabels[discovery.industry.key] || discovery.industry.label}</b></span><i aria-hidden="true">⌄</i></summary>
    <div className="discovery-industry-menu" role="menu" aria-label="Filter showrooms by industry">
      {discovery.industries.map((industry) => <Link key={industry.key} data-industry={industry.key} role="menuitemradio" aria-checked={industry.key === discovery.industry.key} href={discoveryHref(action, { industry: industry.key, q: discovery.query, place: discovery.place })}><i className="industry-accent-swatch" aria-hidden="true" /><IndustryIcon name={industry.icon} /><span>{industry.label}</span></Link>)}
    </div>
  </details>;
}

function IndustryStartChooser({ discovery, action }: { discovery: MarketplaceDiscoveryView; action: string }) {
  return <section className="discovery-industry-start" aria-labelledby="discovery-industry-start-title">
    <span className="discovery-kicker">Choose what you need</span>
    <h2 id="discovery-industry-start-title">Explore showrooms by industry</h2>
    <p>Choose a specific industry, or keep the complete mixed marketplace with All industries.</p>
    <div>{discovery.industries.map((industry) => <Link key={industry.key} data-industry={industry.key} href={discoveryHref(action, { industry: industry.key })}><span aria-hidden="true"><IndustryIcon name={industry.icon} /></span><b>{industry.shortLabel}</b><small>{industry.label}</small></Link>)}</div>
  </section>;
}

function discoveryHref(action: string, values: Record<string, string | number | undefined>, hash = "discover") {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `${action}?${params.toString()}#${hash}`;
}

export default function DiscoveryWorkspace({ discovery, hideIntro = false }: { discovery: MarketplaceDiscoveryView; hideIntro?: boolean }) {
  const router = useRouter();
  const action = "/";
  const [searchInput, setSearchInput] = useState(discovery.query);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedShowroomId, setSelectedShowroomId] = useState<number | null>(null);
  const [activeNearbyGroupKey, setActiveNearbyGroupKey] = useState<string | null>(null);
  const [requestedView, setRequestedView] = useState<MapView | null>(null);
  const [nearMeStatus, setNearMeStatus] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterDialogRef = useRef<HTMLDialogElement | null>(null);
  const mapRef = useRef<MarketplaceMapController | null>(null);
  const mapViewRef = useRef<MapView>({ center: [9.145, 40.4897], zoom: 5 });
  const navigationScope = useMemo(() => [action, discovery.industry.key, discovery.query, discovery.place].join("|"), [action, discovery.industry.key, discovery.place, discovery.query]);

  useEffect(() => {
    setSelectedShowroomId(null);
    setActiveNearbyGroupKey(null);
  }, [discovery.industry.key, discovery.place, discovery.query]);

  useEffect(() => {
    const saved = readDiscoverySession(navigationScope);
    if (saved) {
      mapViewRef.current = saved.mapView;
      setRequestedView(saved.mapView);
      const savedGroup = discovery.nearbyGroups.find((group) => group.key === saved.activeNearbyGroupKey) || null;
      setActiveNearbyGroupKey(savedGroup?.key || null);
    } else {
      const defaultView: MapView = { center: [9.145, 40.4897], zoom: 5 };
      mapViewRef.current = defaultView;
      setRequestedView(defaultView);
    }
    rememberCurrentPublicWorkspace();
  }, [discovery.nearbyGroups, navigationScope]);

  useEffect(() => {
    setSearchInput(discovery.query);
  }, [discovery.query]);

  useEffect(() => {
    const dialog = filterDialogRef.current;
    if (!dialog) return;
    if (mobileFiltersOpen && !dialog.open) dialog.showModal();
    if (!mobileFiltersOpen && dialog.open) dialog.close();
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const nextQuery = searchInput.trim();
    if (nextQuery === discovery.query || (nextQuery.length > 0 && nextQuery.length < 2)) return;
    const timer = window.setTimeout(() => {
      router.replace(discoveryHref(action, {
        industry: discovery.industry.key,
        q: nextQuery,
        place: discovery.place,
      }), { scroll: false });
    }, 420);
    return () => window.clearTimeout(timer);
  }, [action, discovery.industry.key, discovery.place, discovery.query, router, searchInput]);

  function rememberNavigation(activeGroup: string | null, mapView = mapViewRef.current) {
    writeDiscoverySession({
      scope: navigationScope,
      activeNearbyGroupKey: activeGroup,
      mapView,
      updatedAt: Date.now(),
    });
  }

  function openNearbyGroup(group: DiscoveryNearbyGroup) {
    setSelectedShowroomId(null);
    setActiveNearbyGroupKey(group.key);
    rememberNavigation(group.key);
  }

  function applySearch(nextQuery: string) {
    const boundedQuery = nextQuery.trim().slice(0, 80);
    setSearchInput(boundedQuery);
    router.replace(discoveryHref(action, {
      industry: discovery.industry.key,
      q: boundedQuery,
      place: discovery.place,
    }), { scroll: false });
  }

  const showroomById = useMemo(() => new Map(discovery.showrooms.map((showroom) => [showroom.id, showroom])), [discovery.showrooms]);
  const selectedShowroom = showroomById.get(selectedShowroomId || -1) || null;
  const activeNearbyGroup = discovery.nearbyGroups.find((group) => group.key === activeNearbyGroupKey) || null;
  const activeNearbyShowrooms = useMemo(() => activeNearbyGroup?.showroomIds.map((showroomId) => showroomById.get(showroomId)).filter((showroom): showroom is DiscoveryShowroom => Boolean(showroom)) || [], [activeNearbyGroup, showroomById]);
  function resetMap() {
    setActiveNearbyGroupKey(null);
    setSelectedShowroomId(null);
    mapRef.current?.reset();
  }

  function zoomBy(factor: number) {
    if (factor > 1) mapRef.current?.zoomIn();
    else mapRef.current?.zoomOut();
  }

  function useNearMe() {
    if (!navigator.geolocation) {
      setNearMeStatus("Location is not available in this browser.");
      return;
    }
    setNearMeStatus("Finding your general area...");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (coords.longitude < ETHIOPIA_BOUNDS[0] || coords.latitude < ETHIOPIA_BOUNDS[1] || coords.longitude > ETHIOPIA_BOUNDS[2] || coords.latitude > ETHIOPIA_BOUNDS[3]) {
        setNearMeStatus("Your location is outside the current Ethiopia map.");
        return;
      }
      mapRef.current?.centerAt(coords.latitude, coords.longitude, 11);
      setNearMeStatus("Map centered near your location.");
    }, () => {
      setNearMeStatus("Location was not shared. Choose a region or city instead.");
    }, {
      enableHighAccuracy: false,
      timeout: 8_000,
      maximumAge: 300_000,
    });
  }

  const industrySelected = Boolean(discovery.industry.key);
  return <section className="discovery discovery-marketplace" id="discover" aria-label="MirtPage showroom marketplace">
    {!hideIntro ? <div className="discovery-switcher">
      <div className="discovery-switcher-head"><div><span className="discovery-kicker">Online showrooms across Ethiopian production</span><h2 id="discovery-title">Find businesses equipped to make or supply what you need.</h2></div><p>Search by product, skill, production capability, industry, or reviewed location, then visit the showroom and contact the business directly.</p></div>
    </div> : null}

    <div className={`discovery-workbench discovery-workbench-map${industrySelected ? "" : " discovery-workbench-unselected"}`}>
    {industrySelected ? <div className="discovery-summary">
      <div className="discovery-mobile-command">
        <DiscoverySearch id="discovery-search-mobile" value={searchInput} suggestions={discovery.suggestions} onChange={setSearchInput} onSelect={applySearch} onClear={() => applySearch("")} />
        <button className="discovery-mobile-filter-trigger" type="button" onClick={() => setMobileFiltersOpen(true)} aria-haspopup="dialog" aria-expanded={mobileFiltersOpen} aria-controls="discovery-mobile-filters" aria-label="Open industry and location filters" title="Filters"><SlidersHorizontal aria-hidden="true" />{discovery.place ? <i aria-hidden="true" /> : null}</button>
      </div>
      <div className="discovery-summary-row">
        <div className="discovery-summary-copy"><span className="discovery-kicker">{discovery.industry.label}</span><strong>{discovery.total} Showrooms across {discovery.locationCount} {discovery.locationCount === 1 ? "location" : "locations"}</strong><small>Search or zoom into clusters to reveal businesses at their reviewed locations.</small></div>
      </div>
      <div className="discovery-map-tools">
        <IndustryPicker discovery={discovery} action={action} />
        <DiscoverySearch id="discovery-search-desktop" value={searchInput} suggestions={discovery.suggestions} onChange={setSearchInput} onSelect={applySearch} onClear={() => applySearch("")} />
        <label className="discovery-location-picker"><span className="sr-only">Filter by region or city</span><select aria-label="Filter by region or city" value={discovery.place} onChange={(event) => router.replace(discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: event.target.value }), { scroll: false })}><option value="">All Ethiopia</option><optgroup label="Regions">{discovery.places.filter((place) => place.kind === "region").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup><optgroup label="Cities">{discovery.places.filter((place) => place.kind === "city").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup></select></label>
        <button className="discovery-near-me" type="button" onClick={useNearMe} title="Center the map near me"><MapPinIcon />Near me</button>
        <div className="discovery-zoom" aria-label="Map controls"><button type="button" onClick={() => zoomBy(1.5)} title="Zoom in" aria-label="Zoom in">+</button><button type="button" onClick={() => zoomBy(1 / 1.5)} title="Zoom out" aria-label="Zoom out">−</button><button type="button" onClick={resetMap} title="Center Ethiopia" aria-label="Center Ethiopia">◎</button></div>
      </div>
      <span className="sr-only" aria-live="polite">{nearMeStatus}</span>
    </div> : null}

    <dialog ref={filterDialogRef} id="discovery-mobile-filters" className="discovery-filter-sheet" aria-labelledby="discovery-filter-title" onClose={() => setMobileFiltersOpen(false)} onCancel={() => setMobileFiltersOpen(false)} onClick={(event) => { if (event.target === filterDialogRef.current) setMobileFiltersOpen(false); }}>
      <section>
        <header><div><span>Refine the map</span><h3 id="discovery-filter-title">Filters</h3></div><button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X aria-hidden="true" /></button></header>
        <div className="discovery-filter-body">
          <fieldset><legend>Industry</legend><div className="discovery-filter-industries">{discovery.industries.map((industry) => <Link key={industry.key} data-industry={industry.key} className={industry.key === discovery.industry.key ? "active" : ""} aria-current={industry.key === discovery.industry.key ? "true" : undefined} href={discoveryHref(action, { industry: industry.key, q: discovery.query, place: discovery.place })} onClick={() => setMobileFiltersOpen(false)}><i className="industry-accent-swatch" aria-hidden="true" /><IndustryIcon name={industry.icon} /><span>{compactIndustryLabels[industry.key] || industry.label}</span></Link>)}</div></fieldset>
          <label className="discovery-filter-place"><span>Region or city</span><select aria-label="Filter by region or city" value={discovery.place} onChange={(event) => { setMobileFiltersOpen(false); router.replace(discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: event.target.value }), { scroll: false }); }}><option value="">All Ethiopia</option><optgroup label="Regions">{discovery.places.filter((place) => place.kind === "region").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup><optgroup label="Cities">{discovery.places.filter((place) => place.kind === "city").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup></select></label>
        </div>
        <button className="discovery-filter-done" type="button" onClick={() => setMobileFiltersOpen(false)}>Show {discovery.total} {discovery.total === 1 ? "showroom" : "showrooms"}</button>
      </section>
    </dialog>

    <div className="discovery-map-shell">
      {industrySelected ? <div className="discovery-mobile-map-toolbar"><span>{discovery.total} {discovery.total === 1 ? "showroom" : "showrooms"}</span><div aria-label="Map controls"><button type="button" onClick={useNearMe} title="Center the map near me" aria-label="Center the map near me"><LocateFixed aria-hidden="true" /></button><button type="button" onClick={() => zoomBy(1.5)} title="Zoom in" aria-label="Zoom in"><Plus aria-hidden="true" /></button><button type="button" onClick={() => zoomBy(1 / 1.5)} title="Zoom out" aria-label="Zoom out"><Minus aria-hidden="true" /></button><button type="button" onClick={resetMap} title="Center Ethiopia" aria-label="Center Ethiopia"><Crosshair aria-hidden="true" /></button></div></div> : null}
      <div className="discovery-map-stage">
        {mapFailed ? <div className="discovery-map-fallback"><p>The marketplace map is temporarily unavailable.</p><button type="button" onClick={() => window.location.reload()}>Retry map</button></div> : null}
        {!mapFailed ? <MarketplaceMap
          ref={mapRef}
          showrooms={discovery.showrooms}
          nearbyGroups={discovery.nearbyGroups}
          featuredNowBusinessId={discovery.featuredNowBusinessId}
          selectedShowroomId={selectedShowroomId}
          requestedView={requestedView}
          onViewChange={(mapView) => {
            mapViewRef.current = mapView;
            rememberNavigation(activeNearbyGroupKey, mapView);
          }}
          onOpenNearbyGroup={openNearbyGroup}
          onSelectShowroom={(showroom) => {
            setSelectedShowroomId(showroom.id);
            rememberNavigation(activeNearbyGroupKey);
          }}
          onError={() => setMapFailed(true)}
        /> : null}
        {!industrySelected ? <IndustryStartChooser discovery={discovery} action={action} /> : null}
        {activeNearbyGroup ? <NearbyShowroomsViewer group={activeNearbyGroup} showrooms={activeNearbyShowrooms} featuredNowBusinessId={discovery.featuredNowBusinessId} selectedShowroomId={selectedShowroomId} onSelect={(showroomId) => {
          setSelectedShowroomId(showroomId);
          rememberNavigation(activeNearbyGroup.key);
        }} onBack={() => {
          setSelectedShowroomId(null);
        }} onClose={() => {
          setActiveNearbyGroupKey(null);
          setSelectedShowroomId(null);
          rememberNavigation(null);
        }} onOpen={rememberCurrentPublicWorkspace} /> : null}
        {selectedShowroom && !activeNearbyGroup ? <ShowroomPreview showroom={selectedShowroom} source="discovery" onClose={() => setSelectedShowroomId(null)} onOpen={rememberCurrentPublicWorkspace} presence={showroomPresence(selectedShowroom, discovery.featuredNowBusinessId)} /> : null}
      </div>
    </div>
    </div>

  </section>;
}

function ShowroomImage({ showroom }: { showroom: DiscoveryShowroom }) {
  const [failed, setFailed] = useState(false);
  return showroom.imagePath && !failed ? <Image src={showroom.imagePath} alt="" width={240} height={150} onError={() => setFailed(true)} /> : <span className={`discovery-image-fallback ${showroom.fallbackStyle}`} aria-hidden="true"><i>{showroom.name.slice(0, 1)}</i><b>{showroom.name}</b></span>;
}

function ShowroomPreview({ showroom, source, onClose, onOpen, label, presence }: { showroom: DiscoveryShowroom; source: "discovery" | "featured"; onClose: () => void; onOpen?: () => void; label?: string; presence?: ShowroomPresence }) {
  const previewRef = useRef<HTMLElement | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);
  useEffect(() => {
    if (!portalRoot) return;
    previewRef.current?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, portalRoot, showroom.id]);
  if (!portalRoot) return null;
  const status = presence?.label || label || (showroom.sponsored ? "Sponsored showroom" : showroom.productionScale === "growing_factory" ? "Growing factory" : "Workshop / producer");
  return createPortal(<div className="discovery-preview-layer"><button className="discovery-preview-scrim" type="button" tabIndex={-1} onClick={onClose} aria-label="Dismiss showroom preview" /><aside ref={previewRef} className="discovery-preview" role="dialog" aria-modal="false" aria-labelledby={`showroom-preview-${showroom.id}`} tabIndex={-1}><article><button className="discovery-preview-close" type="button" onClick={onClose} aria-label="Close showroom preview"><X aria-hidden="true" /></button><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span className={presence?.kind ? `presence-${presence.kind}` : undefined}>{status}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3><p>{showroom.tagline}</p><small>{showroom.city} · {showroom.zone} · {showroom.region}</small><Link href={`/@${showroom.handle}?ref=${source}`} onClick={onOpen}>Open showroom <b aria-hidden="true">→</b></Link></div></article></aside></div>, portalRoot);
}

function NearbyShowroomsViewer({
  group,
  showrooms,
  featuredNowBusinessId,
  selectedShowroomId,
  onSelect,
  onBack,
  onClose,
  onOpen,
}: {
  group: DiscoveryNearbyGroup;
  showrooms: DiscoveryShowroom[];
  featuredNowBusinessId: number | null;
  selectedShowroomId: number | null;
  onSelect: (showroomId: number) => void;
  onBack: () => void;
  onClose: () => void;
  onOpen: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const selectedShowroom = showrooms.find((showroom) => showroom.id === selectedShowroomId) || null;
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, [group.key]);
  useEffect(() => {
    if (selectedShowroom) backRef.current?.focus({ preventScroll: true });
  }, [selectedShowroomId]);

  return <aside className={`nearby-showroom-viewer${selectedShowroom ? " detail-open" : ""}`} role="dialog" aria-modal="false" aria-labelledby="nearby-showroom-title" onKeyDown={(event) => {
    if (event.key === "Escape") onClose();
  }}>
    <header>
      {selectedShowroom
        ? <button ref={backRef} className="nearby-showroom-back" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" /><span>Back to nearby</span></button>
        : <div className="nearby-showroom-heading"><span>{group.city}</span><h2 id="nearby-showroom-title">Showrooms nearby</h2><p>{group.count} businesses in this area</p></div>}
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close nearby showrooms"><X aria-hidden="true" /></button>
    </header>
    {selectedShowroom ? <NearbyShowroomDetail showroom={selectedShowroom} presence={showroomPresence(selectedShowroom, featuredNowBusinessId)} onOpen={onOpen} /> : <div className="nearby-showroom-grid">
      {showrooms.map((showroom) => {
        const presence = showroomPresence(showroom, featuredNowBusinessId);
        return <button key={showroom.id} type="button" data-showroom-id={showroom.id} data-industry={showroom.primaryIndustryKey} data-presence={presence.kind || undefined} className={`${presence.kind ? ` ${presence.kind}` : ""}${selectedShowroomId === showroom.id ? " selected" : ""}`} onClick={() => onSelect(showroom.id)} aria-label={`${showroom.name}, ${showroom.primaryIndustryLabel}, ${showroom.city}.${presence.label ? ` ${presence.label}.` : ""} View details.`}>
          <span className="nearby-showroom-media"><ShowroomImage showroom={showroom} />{presence.kind ? <i>{presence.shortLabel}</i> : null}</span>
          <span className="nearby-showroom-copy"><small>{showroom.primaryIndustryShortLabel}</small><strong>{showroom.name}</strong><em>View details</em></span>
        </button>;
      })}
    </div>}
  </aside>;
}

function NearbyShowroomDetail({ showroom, presence, onOpen }: { showroom: DiscoveryShowroom; presence: ShowroomPresence; onOpen: () => void }) {
  const status = presence.label || (showroom.sponsored ? "Sponsored showroom" : showroom.productionScale === "growing_factory" ? "Growing factory" : "Workshop / producer");
  return <article className="nearby-showroom-detail">
    <ShowroomImage showroom={showroom} />
    <div>
      <span className={presence.kind ? `presence-${presence.kind}` : undefined}>{status}</span>
      <h2 id="nearby-showroom-title">{showroom.name}</h2>
      <p>{showroom.tagline}</p>
      <small>{showroom.city} · {showroom.zone} · {showroom.region}</small>
      <Link href={`/@${showroom.handle}?ref=discovery`} onClick={onOpen}>Open showroom <b aria-hidden="true">→</b></Link>
    </div>
  </article>;
}
