"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import Supercluster from "supercluster";
import { ArrowLeft, CalendarClock, ChevronDown, Crosshair, ExternalLink, List as ListIcon, LocateFixed, Map as MapIcon, Minus, Plus, Radio, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { buildDistrictVenueLayout, buildExhibitionGridVenueLayout } from "@/lib/discovery-venue-layout";
import type { DiscoveryCityGroup, DiscoverySearchSuggestion, DiscoveryShowroom, FeaturedShowroomsView, MarketplaceDiscoveryView, WeeklyFeaturedProgram } from "@/lib/discovery";
import {
  buildFeaturedProgramAgenda,
  featuredBroadcastPhase,
  featuredProgramTimeLabel,
  resolveFeaturedProgramSessions,
  type FeaturedBoothWalkthrough,
  type FeaturedBroadcastPhase,
  type FeaturedProgramAgendaEntry,
} from "@/lib/featured-program";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";

const MAP_WIDTH = 900;
const MAP_HEIGHT = 650;
const BASE_CLUSTER_ZOOM = 5;
const MAX_CLUSTER_ZOOM = 10;
const MAX_MAP_ZOOM = 9;
const MAX_MAP_SCALE = 2 ** (MAX_MAP_ZOOM - BASE_CLUSTER_ZOOM);
const CITY_GATEWAY_ZOOM = 8;
const CITY_GATEWAY_SCALE = 2 ** (CITY_GATEWAY_ZOOM - BASE_CLUSTER_ZOOM);
const SHOWROOM_DETAIL_SCALE = CITY_GATEWAY_SCALE;
const ETHIOPIA_BOUNDS: [number, number, number, number] = [32, 3, 49, 15];
const DISCOVERY_SESSION_KEY = "mirtpage:discovery-navigation:v1";
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

type DiscoverySessionState = {
  scope: string;
  activeCityKey: string | null;
  mapTransform: { x: number; y: number; k: number };
  updatedAt: number;
};

function readDiscoverySession(scope: string): DiscoverySessionState | null {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(DISCOVERY_SESSION_KEY) || "null") as DiscoverySessionState | null;
    if (!parsed || parsed.scope !== scope || Date.now() - parsed.updatedAt > 2 * 60 * 60 * 1000) return null;
    if (![parsed.mapTransform.x, parsed.mapTransform.y, parsed.mapTransform.k].every(Number.isFinite)) return null;
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

type MapFeature = {
  type: "Feature";
  properties: Record<string, string | number | [number, number]>;
  geometry: GeoPermissibleObjects;
};

type MapCollection = {
  type: "FeatureCollection";
  features: MapFeature[];
};

type MarkerProperties = { showroomId: number; sponsored: boolean; live: boolean; featured: boolean };
type ClusterProperties = { sponsoredCount: number; liveCount: number; featuredCount: number };

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

function MarkerPresenceBadge({ kind, text, y }: { kind: "featured" | "live"; text: string; y: number }) {
  const width = kind === "featured" ? 58 : Math.max(36, 18 + text.length * 5);
  return <g className={`marker-presence marker-presence-${kind}`} transform={`translate(0 ${y})`} aria-hidden="true"><rect x={-width / 2} y="-9" width={width} height="18" rx="4" /><circle cx={-width / 2 + 9} r="3" /><text x="5" y="3" textAnchor="middle">{text}</text></g>;
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

function IndustryPicker({ discovery, action, view }: { discovery: MarketplaceDiscoveryView; action: string; view: "map" | "list" }) {
  return <details className="discovery-industry-picker">
    <summary data-industry={discovery.industry.key} aria-label="Choose an industry"><IndustryIcon name={discovery.industry.icon} /><span><small>Industry</small><b>{compactIndustryLabels[discovery.industry.key] || discovery.industry.label}</b></span><i aria-hidden="true">⌄</i></summary>
    <div className="discovery-industry-menu" role="menu" aria-label="Filter showrooms by industry">
      {discovery.industries.map((industry) => <Link key={industry.key} data-industry={industry.key} role="menuitemradio" aria-checked={industry.key === discovery.industry.key} href={discoveryHref(action, { industry: industry.key, q: discovery.query, place: discovery.place, view })}><i className="industry-accent-swatch" aria-hidden="true" /><IndustryIcon name={industry.icon} /><span>{industry.label}</span></Link>)}
    </div>
  </details>;
}

function mapZoomForScale(scale: number) {
  return Math.max(BASE_CLUSTER_ZOOM, Math.min(MAX_MAP_ZOOM, Math.floor(BASE_CLUSTER_ZOOM + Math.log2(scale))));
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
  const [view, setView] = useState<"map" | "list">(discovery.view);
  const [searchInput, setSearchInput] = useState(discovery.query);
  const [regions, setRegions] = useState<MapCollection | null>(null);
  const [zones, setZones] = useState<MapCollection | null>(null);
  const [places, setPlaces] = useState<MapCollection | null>(null);
  const [roads, setRoads] = useState<MapCollection | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedShowroomId, setSelectedShowroomId] = useState<number | null>(null);
  const [activeCityKey, setActiveCityKey] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [nearMeStatus, setNearMeStatus] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterDialogRef = useRef<HTMLDialogElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const mapTransformRef = useRef<ZoomTransform>(zoomIdentity);
  const mapPersistenceEnabledRef = useRef(true);
  const navigationScope = useMemo(() => [action, discovery.industry.key, discovery.query, discovery.place, discovery.view].join("|"), [action, discovery.industry.key, discovery.place, discovery.query, discovery.view]);

  useEffect(() => {
    setSelectedShowroomId(null);
    setActiveCityKey(null);
    setView(discovery.view);
    mapPersistenceEnabledRef.current = true;
  }, [discovery.industry.key, discovery.place, discovery.query, discovery.view]);

  useEffect(() => {
    const saved = readDiscoverySession(navigationScope);
    if (saved) {
      mapTransformRef.current = zoomIdentity.translate(saved.mapTransform.x, saved.mapTransform.y).scale(saved.mapTransform.k);
      setZoomLevel(saved.mapTransform.k);
      setActiveCityKey(discovery.cityGroups.some((group) => group.key === saved.activeCityKey) ? saved.activeCityKey : null);
    } else {
      mapTransformRef.current = zoomIdentity;
      setZoomLevel(1);
    }
    try {
      window.sessionStorage.setItem(DISCOVERY_RETURN_KEY, `${window.location.pathname}${window.location.search}#discover`);
    } catch {}
  }, [discovery.cityGroups, navigationScope]);

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
        view,
      }), { scroll: false });
    }, 420);
    return () => window.clearTimeout(timer);
  }, [action, discovery.industry.key, discovery.place, discovery.query, router, searchInput, view]);

  function rememberNavigation(activeCity: string | null, transform = mapTransformRef.current) {
    writeDiscoverySession({
      scope: navigationScope,
      activeCityKey: activeCity,
      mapTransform: { x: transform.x, y: transform.y, k: transform.k },
      updatedAt: Date.now(),
    });
  }

  function selectDiscoveryView(nextView: "map" | "list") {
    if (nextView === "list") {
      setActiveCityKey(null);
      rememberNavigation(null);
    }
    setView(nextView);
    router.replace(discoveryHref(action, {
      industry: discovery.industry.key,
      q: discovery.query,
      place: discovery.place,
      view: nextView,
    }), { scroll: false });
  }

  function applySearch(nextQuery: string) {
    const boundedQuery = nextQuery.trim().slice(0, 80);
    setSearchInput(boundedQuery);
    router.replace(discoveryHref(action, {
      industry: discovery.industry.key,
      q: boundedQuery,
      place: discovery.place,
      view,
    }), { scroll: false });
  }

  useEffect(() => {
    let active = true;
    fetch("/geo/ethiopia-admin1-2023.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("Map unavailable");
        return response.json() as Promise<MapCollection>;
      })
      .then((data) => { if (active) setRegions(data); })
      .catch(() => { if (active) setMapFailed(true); });
    const loadDetails = () => Promise.all([
        fetch("/geo/ethiopia-admin2-2023.geojson").then((response) => response.ok ? response.json() as Promise<MapCollection> : null),
        fetch("/geo/ethiopia-places-osm.geojson").then((response) => response.ok ? response.json() as Promise<MapCollection> : null),
        fetch("/geo/ethiopia-major-roads-osm.geojson").then((response) => response.ok ? response.json() as Promise<MapCollection> : null),
      ]).then(([zoneData, placeData, roadData]) => {
        if (!active) return;
        setZones(zoneData);
        setPlaces(placeData);
        setRoads(roadData);
      }).catch(() => undefined);
    let cancelDetailLoad: () => void;
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(loadDetails, { timeout: 1_200 });
      cancelDetailLoad = () => window.cancelIdleCallback(idleId);
    } else {
      const timeoutId = globalThis.setTimeout(loadDetails, 120);
      cancelDetailLoad = () => globalThis.clearTimeout(timeoutId);
    }
    return () => {
      active = false;
      cancelDetailLoad();
    };
  }, []);

  const projection = useMemo(() => regions
    ? geoMercator().fitExtent([[52, 34], [MAP_WIDTH - 52, MAP_HEIGHT - 34]], regions as unknown as GeoPermissibleObjects)
    : null, [regions]);
  const path = useMemo(() => projection ? geoPath(projection) : null, [projection]);
  const selectedShowroom = discovery.showrooms.find((showroom) => showroom.id === selectedShowroomId) || null;
  const activeCity = discovery.cityGroups.find((group) => group.key === activeCityKey) || null;
  const groupedShowroomIds = useMemo(() => new Set(discovery.cityGroups.flatMap((group) => group.showrooms.map((showroom) => showroom.id))), [discovery.cityGroups]);

  const clusterIndex = useMemo(() => {
    const index = new Supercluster<MarkerProperties, ClusterProperties>({
      radius: 52,
      maxZoom: MAX_CLUSTER_ZOOM,
      minPoints: 2,
      map: (properties) => ({ sponsoredCount: properties.sponsored ? 1 : 0, liveCount: properties.live && !properties.featured ? 1 : 0, featuredCount: properties.featured ? 1 : 0 }),
      reduce: (accumulated, properties) => {
        accumulated.sponsoredCount += properties.sponsoredCount;
        accumulated.liveCount += properties.liveCount;
        accumulated.featuredCount += properties.featuredCount;
      },
    });
    index.load(discovery.showrooms.map((showroom) => ({
      type: "Feature" as const,
      properties: { showroomId: showroom.id, sponsored: showroom.sponsored, live: showroom.isLive, featured: showroom.id === discovery.featuredNowBusinessId },
      geometry: { type: "Point" as const, coordinates: [showroom.longitude, showroom.latitude] },
    })));
    return index;
  }, [discovery.featuredNowBusinessId, discovery.showrooms]);
  const clusterZoom = mapZoomForScale(zoomLevel);
  const markers = useMemo(() => clusterIndex.getClusters(ETHIOPIA_BOUNDS, clusterZoom), [clusterIndex, clusterZoom]);

  const visiblePlaces = useMemo(() => {
    if (!places) return [];
    const cities = places.features.filter((feature) => feature.properties.place === "city");
    const towns = places.features.filter((feature) => feature.properties.place === "town");
    const villages = places.features.filter((feature) => feature.properties.place === "village");
    if (zoomLevel < 1.7) return cities.slice(0, 20);
    if (zoomLevel < 3.2) return [...cities, ...towns.slice(0, 45)];
    if (zoomLevel < 6) return [...cities, ...towns.slice(0, 180)];
    return [...cities, ...towns, ...villages.slice(0, 180)];
  }, [places, zoomLevel]);

  useEffect(() => {
    if (activeCityKey) return;
    if (!svgRef.current || !groupRef.current || !projection) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_MAP_SCALE])
      .extent([[0, 0], [MAP_WIDTH, MAP_HEIGHT]])
      .translateExtent([[-90, -75], [MAP_WIDTH + 90, MAP_HEIGHT + 75]])
      .on("zoom", (event: { transform: ZoomTransform }) => {
        mapTransformRef.current = event.transform;
        select(groupRef.current).attr("transform", event.transform.toString());
      })
      .on("end", (event: { transform: ZoomTransform }) => {
        setZoomLevel(event.transform.k);
        if (mapPersistenceEnabledRef.current) rememberNavigation(null, event.transform);
      });
    const svg = select(svgRef.current);
    zoomRef.current = behavior;
    svg.call(behavior).on("dblclick.zoom", null);
    svg.call(behavior.transform, mapTransformRef.current);
    return () => { svg.on(".zoom", null); zoomRef.current = null; };
  }, [activeCityKey, navigationScope, projection]);

  function animate(transform: ZoomTransform) {
    if (!svgRef.current || !zoomRef.current) return;
    const selection = select(svgRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) selection.call(zoomRef.current.transform, transform);
    else selection.transition().duration(360).call(zoomRef.current.transform, transform);
  }

  function framePoint(longitude: number, latitude: number, scale: number) {
    const point = projection?.([longitude, latitude]);
    if (!point) return;
    animate(zoomIdentity.translate(MAP_WIDTH / 2, MAP_HEIGHT / 2).scale(scale).translate(-point[0], -point[1]));
  }

  function openCluster(clusterId: number, coordinates: [number, number]) {
    const expansion = clusterIndex.getClusterExpansionZoom(clusterId);
    const scale = Math.min(CITY_GATEWAY_SCALE, Math.max(1.8, 2 ** (expansion - BASE_CLUSTER_ZOOM)));
    framePoint(coordinates[0], coordinates[1], scale);
  }

  function activateShowroom(showroom: DiscoveryShowroom) {
    if (mapTransformRef.current.k < SHOWROOM_DETAIL_SCALE - 0.01) {
      setSelectedShowroomId(null);
      framePoint(showroom.longitude, showroom.latitude, SHOWROOM_DETAIL_SCALE);
      return;
    }
    setSelectedShowroomId(showroom.id);
  }

  function resetMap() {
    setActiveCityKey(null);
    setSelectedShowroomId(null);
    mapPersistenceEnabledRef.current = true;
    rememberNavigation(null, zoomIdentity);
    animate(zoomIdentity);
  }

  function zoomBy(factor: number) {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(220).call(zoomRef.current.scaleBy, factor);
  }

  function useNearMe() {
    if (!navigator.geolocation) {
      setNearMeStatus("Location is not available in this browser.");
      return;
    }
    setNearMeStatus("Finding your general area...");
    mapPersistenceEnabledRef.current = false;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (coords.longitude < ETHIOPIA_BOUNDS[0] || coords.latitude < ETHIOPIA_BOUNDS[1] || coords.longitude > ETHIOPIA_BOUNDS[2] || coords.latitude > ETHIOPIA_BOUNDS[3]) {
        mapPersistenceEnabledRef.current = true;
        setNearMeStatus("Your location is outside the current Ethiopia map.");
        return;
      }
      framePoint(coords.longitude, coords.latitude, 3.2);
      setNearMeStatus("Map centered near your location.");
    }, () => {
      mapPersistenceEnabledRef.current = true;
      setNearMeStatus("Location was not shared. Choose a region or city instead.");
    }, {
      enableHighAccuracy: false,
      timeout: 8_000,
      maximumAge: 300_000,
    });
  }

  function mapLabelLines(name: string, maxLineLength = 13, maxLines = 3) {
    const words = name
      .trim()
      .split(/\s+/)
      .flatMap((word) =>
        word.length <= maxLineLength
          ? [word]
          : word.match(new RegExp(`.{1,${maxLineLength}}`, "g")) || [word],
      );
    const lines: string[] = [];
    let truncated = false;
    for (const word of words) {
      const current = lines.at(-1);
      if (current && `${current} ${word}`.length <= maxLineLength) {
        lines[lines.length - 1] = `${current} ${word}`;
      } else if (lines.length < maxLines) {
        lines.push(word);
      } else {
        truncated = true;
        break;
      }
    }
    if (truncated && lines.length) {
      lines[lines.length - 1] = `${lines.at(-1)?.slice(0, maxLineLength - 1)}…`;
    }
    return lines;
  }

  function renderShowroomPoint(showroom: DiscoveryShowroom) {
    const point = projection?.([showroom.longitude, showroom.latitude]);
    if (!point) return null;
    const detailed = zoomLevel >= SHOWROOM_DETAIL_SCALE - 0.01;
    const activate = () => activateShowroom(showroom);
    const presence = showroomPresence(showroom, discovery.featuredNowBusinessId);
    const labelLines = mapLabelLines(showroom.name);
    return <g key={`showroom-${showroom.id}`} data-showroom-id={showroom.id} data-industry={showroom.primaryIndustryKey} data-latitude={showroom.latitude} data-longitude={showroom.longitude} data-presence={presence.kind || undefined} className={`discovery-point${showroom.sponsored ? " sponsored" : ""}${presence.kind ? ` ${presence.kind}` : ""}${selectedShowroomId === showroom.id ? " selected" : ""}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${showroom.name}, ${showroom.primaryIndustryLabel}, ${showroom.city}.${presence.label ? ` ${presence.label}.` : ""} ${detailed ? "Open business preview." : "Zoom to business."}`} onClick={activate} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") activate(); }}>
      <circle className="point-halo" cy="-4" r="27" />
      <path className="point-showroom-pin" d="M0 31C-5 24-22 10-22-7a22 22 0 1 1 44 0C22 10 5 24 0 31Z" />
      <path className="point-showroom-store" d="M-12-12h24l3 7h-30ZM-11-5v15h22V-5M-5 10V2h10v8M-10-1h5M5-1h5" />
      <text className="point-showroom-label" y="42" textAnchor="middle">
        {labelLines.map((line, index) => (
          <tspan key={`${line}-${index}`} x="0" dy={index === 0 ? 0 : 8}>{line}</tspan>
        ))}
      </text>
      {presence.kind ? <MarkerPresenceBadge kind={presence.kind} text={presence.shortLabel.toUpperCase()} y={-39} /> : null}
    </g>;
  }

  const showCityGateways = clusterZoom >= CITY_GATEWAY_ZOOM;
  return <section className="discovery discovery-marketplace" id="discover" aria-label="MirtPage showroom marketplace">
    {!hideIntro ? <div className="discovery-switcher">
      <div className="discovery-switcher-head"><div><span className="discovery-kicker">Online showrooms across Ethiopian production</span><h2 id="discovery-title">Find businesses equipped to make or supply what you need.</h2></div><p>Search by product, skill, production capability, industry, or reviewed location, then visit the showroom and contact the business directly.</p></div>
    </div> : null}

    <div className={`discovery-workbench discovery-workbench-${view}`}>
    <div className="discovery-summary">
      <div className="discovery-mobile-command">
        <DiscoverySearch id="discovery-search-mobile" value={searchInput} suggestions={discovery.suggestions} onChange={setSearchInput} onSelect={applySearch} onClear={() => applySearch("")} />
        <button className="discovery-mobile-filter-trigger" type="button" onClick={() => setMobileFiltersOpen(true)} aria-haspopup="dialog" aria-expanded={mobileFiltersOpen} aria-controls="discovery-mobile-filters" aria-label="Open industry and location filters" title="Filters"><SlidersHorizontal aria-hidden="true" />{discovery.place ? <i aria-hidden="true" /> : null}</button>
        <div className="discovery-mobile-view-tabs" role="tablist" aria-label="Discovery view"><button type="button" role="tab" aria-selected={view === "map"} className={view === "map" ? "active" : ""} onClick={() => selectDiscoveryView("map")} aria-label="Map view" title="Map view"><MapIcon aria-hidden="true" /></button><button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "active" : ""} onClick={() => selectDiscoveryView("list")} aria-label="List view" title="List view"><ListIcon aria-hidden="true" /></button></div>
      </div>
      <div className="discovery-summary-row">
        <div className="discovery-summary-copy"><span className="discovery-kicker">{discovery.industry.label}</span><strong>{discovery.total} Showrooms across {discovery.locationCount} {discovery.locationCount === 1 ? "location" : "locations"}</strong><small>Search or zoom into clusters to reveal businesses at their reviewed locations.</small></div>
        <div className="discovery-tabs" role="tablist" aria-label="Discovery view"><button type="button" role="tab" aria-selected={view === "map"} className={view === "map" ? "active" : ""} onClick={() => selectDiscoveryView("map")}>Map</button><button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "active" : ""} onClick={() => selectDiscoveryView("list")}>List</button></div>
      </div>
      <div className={`discovery-map-tools${view === "list" ? " list-only" : activeCity ? " city-open" : ""}`}>
        <IndustryPicker discovery={discovery} action={action} view={view} />
        <DiscoverySearch id="discovery-search-desktop" value={searchInput} suggestions={discovery.suggestions} onChange={setSearchInput} onSelect={applySearch} onClear={() => applySearch("")} />
        {!activeCity ? <>
          <label className="discovery-location-picker"><span className="sr-only">Filter by region or city</span><select aria-label="Filter by region or city" value={discovery.place} onChange={(event) => router.replace(discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: event.target.value, view }), { scroll: false })}><option value="">All Ethiopia</option><optgroup label="Regions">{discovery.places.filter((place) => place.kind === "region").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup><optgroup label="Cities">{discovery.places.filter((place) => place.kind === "city").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup></select></label>
          {view === "map" ? <button className="discovery-near-me" type="button" onClick={useNearMe} title="Center the map near me"><MapPinIcon />Near me</button> : null}
          {view === "map" ? <div className="discovery-zoom" aria-label="Map controls"><button type="button" onClick={() => zoomBy(1.5)} title="Zoom in" aria-label="Zoom in">+</button><button type="button" onClick={() => zoomBy(1 / 1.5)} title="Zoom out" aria-label="Zoom out">−</button><button type="button" onClick={resetMap} title="Center Ethiopia" aria-label="Center Ethiopia">◎</button></div> : null}
        </> : null}
      </div>
      <span className="sr-only" aria-live="polite">{nearMeStatus}</span>
    </div>

    <dialog ref={filterDialogRef} id="discovery-mobile-filters" className="discovery-filter-sheet" aria-labelledby="discovery-filter-title" onClose={() => setMobileFiltersOpen(false)} onCancel={() => setMobileFiltersOpen(false)} onClick={(event) => { if (event.target === filterDialogRef.current) setMobileFiltersOpen(false); }}>
      <section>
        <header><div><span>Refine the map</span><h3 id="discovery-filter-title">Filters</h3></div><button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X aria-hidden="true" /></button></header>
        <div className="discovery-filter-body">
          <fieldset><legend>Industry</legend><div className="discovery-filter-industries">{discovery.industries.map((industry) => <Link key={industry.key} data-industry={industry.key} className={industry.key === discovery.industry.key ? "active" : ""} aria-current={industry.key === discovery.industry.key ? "true" : undefined} href={discoveryHref(action, { industry: industry.key, q: discovery.query, place: discovery.place, view })} onClick={() => setMobileFiltersOpen(false)}><i className="industry-accent-swatch" aria-hidden="true" /><IndustryIcon name={industry.icon} /><span>{compactIndustryLabels[industry.key] || industry.label}</span></Link>)}</div></fieldset>
          <label className="discovery-filter-place"><span>Region or city</span><select aria-label="Filter by region or city" value={discovery.place} onChange={(event) => { setMobileFiltersOpen(false); router.replace(discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: event.target.value, view }), { scroll: false }); }}><option value="">All Ethiopia</option><optgroup label="Regions">{discovery.places.filter((place) => place.kind === "region").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup><optgroup label="Cities">{discovery.places.filter((place) => place.kind === "city").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup></select></label>
        </div>
        <button className="discovery-filter-done" type="button" onClick={() => setMobileFiltersOpen(false)}>Show {discovery.total} {discovery.total === 1 ? "showroom" : "showrooms"}</button>
      </section>
    </dialog>

    {view === "list" ? <DiscoveryList discovery={discovery} action={action} /> : <div className="discovery-map-shell">
      {activeCity ? <CityMarketplacePanel group={activeCity} industryKey={discovery.industry.key} featuredNowBusinessId={discovery.featuredNowBusinessId} onBack={() => { setActiveCityKey(null); rememberNavigation(null); }} /> : <>
      <div className="discovery-mobile-map-toolbar"><span>{discovery.total} {discovery.total === 1 ? "showroom" : "showrooms"}</span><div aria-label="Map controls"><button type="button" onClick={useNearMe} title="Center the map near me" aria-label="Center the map near me"><LocateFixed aria-hidden="true" /></button><button type="button" onClick={() => zoomBy(1.5)} title="Zoom in" aria-label="Zoom in"><Plus aria-hidden="true" /></button><button type="button" onClick={() => zoomBy(1 / 1.5)} title="Zoom out" aria-label="Zoom out"><Minus aria-hidden="true" /></button><button type="button" onClick={resetMap} title="Center Ethiopia" aria-label="Center Ethiopia"><Crosshair aria-hidden="true" /></button></div></div>
      <div className="discovery-map-stage">
        {mapFailed ? <div className="discovery-map-fallback"><p>The map could not load, but every showroom is still available.</p><button type="button" onClick={() => setView("list")}>Open list</button></div> : null}
        {!mapFailed && !path ? <div className="discovery-map-loading">Loading Ethiopia map...</div> : null}
        {!mapFailed && path && projection ? <svg ref={svgRef} className="discovery-map" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="group" aria-label="Interactive Ethiopia map with clustered showroom locations">
          <rect className="discovery-map-bg" width={MAP_WIDTH} height={MAP_HEIGHT} />
          <g ref={groupRef}>
            <g className="discovery-regions">{regions?.features.map((feature, index) => <path key={`${String(feature.properties.name)}-${index}`} d={path(feature as unknown as GeoPermissibleObjects) || undefined} />)}</g>
            {roads ? <g className="discovery-roads">{roads.features.map((feature) => <path key={String(feature.properties.highway)} className={`road-${String(feature.properties.highway)}`} d={path(feature as unknown as GeoPermissibleObjects) || undefined} />)}</g> : null}
            {zoomLevel >= 1.65 ? <g className="discovery-zones">{zones?.features.map((feature, index) => <path key={`${String(feature.properties.name)}-${index}`} d={path(feature as unknown as GeoPermissibleObjects) || undefined} />)}</g> : null}
            <g className="discovery-places">{visiblePlaces.map((feature, index) => {
              const coordinates = (feature.geometry as { coordinates?: [number, number] }).coordinates;
              const point = coordinates ? projection(coordinates) : null;
              return point ? <text key={`${String(feature.properties.name)}-${index}`} className={`place-${String(feature.properties.place)}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`}>{String(feature.properties.name)}</text> : null;
            })}</g>
            <g className="discovery-markers">{showCityGateways ? <>
              {discovery.cityGroups.map((group) => {
                const point = projection([group.longitude, group.latitude]);
                const featured = group.showrooms.some((showroom) => showroom.id === discovery.featuredNowBusinessId);
                const liveCount = group.showrooms.filter((showroom) => showroom.isLive && showroom.id !== discovery.featuredNowBusinessId).length;
                const statusLabel = featured ? "Featured now" : liveCount ? `${liveCount} live` : "";
                return point ? <g key={group.key} data-city-key={group.key} data-presence={featured ? "featured" : liveCount ? "live" : undefined} className={`discovery-city-gateway${featured ? " featured" : liveCount ? " live" : ""}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${group.city} marketplace, ${group.count} businesses.${statusLabel ? ` ${statusLabel}.` : ""} Open virtual floor.`} onClick={() => { setSelectedShowroomId(null); setActiveCityKey(group.key); rememberNavigation(group.key); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { setSelectedShowroomId(null); setActiveCityKey(group.key); rememberNavigation(group.key); } }}><circle className="city-gateway-halo" r="34" /><path className="city-gateway-building" d="M-20 15V-10L0-22l20 12v25M-13 15V-7h26v22M-7-1h5v6h-5zM2-1h5v6H2zM-7 9h14v6H-7z" /><circle className="city-gateway-count" cx="18" cy="-18" r="13" /><text className="city-gateway-number" x="18" y="-14" textAnchor="middle">{group.count}</text><text className="city-gateway-name" y="34" textAnchor="middle">{group.city}</text>{featured ? <MarkerPresenceBadge kind="featured" text="FEATURED" y={-45} /> : liveCount ? <MarkerPresenceBadge kind="live" text={`${liveCount} LIVE`} y={-45} /> : null}</g> : null;
              })}
              {discovery.showrooms.filter((showroom) => !groupedShowroomIds.has(showroom.id)).map(renderShowroomPoint)}
            </> : markers.map((marker) => {
              const point = projection(marker.geometry.coordinates as [number, number]);
              if (!point) return null;
              const properties = marker.properties;
              if ("cluster_id" in properties) {
                const featuredCount = properties.featuredCount || 0;
                const liveCount = properties.liveCount || 0;
                return <g key={`cluster-${properties.cluster_id}`} data-presence={featuredCount ? "featured" : liveCount ? "live" : undefined} className={`discovery-cluster${featuredCount ? " featured" : liveCount ? " live" : ""}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${properties.point_count} nearby showrooms.${featuredCount ? " One is featured now." : liveCount ? ` ${liveCount} live now.` : ""} Zoom to reveal.`} onClick={() => openCluster(properties.cluster_id, marker.geometry.coordinates as [number, number])} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openCluster(properties.cluster_id, marker.geometry.coordinates as [number, number]); }}><circle className="cluster-halo" r="27" /><circle className="cluster-core" r="19" /><text textAnchor="middle" y="5">{properties.point_count}</text>{featuredCount ? <MarkerPresenceBadge kind="featured" text="FEATURED" y={-32} /> : liveCount ? <MarkerPresenceBadge kind="live" text={`${liveCount} LIVE`} y={-32} /> : null}</g>;
              }
              const showroom = discovery.showrooms.find((candidate) => candidate.id === properties.showroomId);
              if (!showroom) return null;
              return renderShowroomPoint(showroom);
            })}</g>
          </g>
        </svg> : null}
        <a className="discovery-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Map data © OpenStreetMap contributors · Boundaries: FEWS NET</a>
        {selectedShowroom ? <ShowroomPreview showroom={selectedShowroom} source="discovery" onClose={() => setSelectedShowroomId(null)} presence={showroomPresence(selectedShowroom, discovery.featuredNowBusinessId)} /> : null}
      </div></>}
    </div>}
    </div>

  </section>;
}

function ShowroomImage({ showroom }: { showroom: DiscoveryShowroom }) {
  const [failed, setFailed] = useState(false);
  return showroom.imagePath && !failed ? <Image src={showroom.imagePath} alt="" width={240} height={150} onError={() => setFailed(true)} /> : <span className={`discovery-image-fallback ${showroom.fallbackStyle}`} aria-hidden="true"><i>{showroom.name.slice(0, 1)}</i><b>{showroom.name}</b></span>;
}

function ShowroomPreview({ showroom, source, onClose, label, presence }: { showroom: DiscoveryShowroom; source: "discovery" | "featured"; onClose: () => void; label?: string; presence?: ShowroomPresence }) {
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
  return createPortal(<div className="discovery-preview-layer"><button className="discovery-preview-scrim" type="button" tabIndex={-1} onClick={onClose} aria-label="Dismiss showroom preview" /><aside ref={previewRef} className="discovery-preview" role="dialog" aria-modal="false" aria-labelledby={`showroom-preview-${showroom.id}`} tabIndex={-1}><article><button className="discovery-preview-close" type="button" onClick={onClose} aria-label="Close showroom preview"><X aria-hidden="true" /></button><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span className={presence?.kind ? `presence-${presence.kind}` : undefined}>{status}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3><p>{showroom.tagline}</p><small>{showroom.city} · {showroom.zone} · {showroom.region}</small><Link href={`/@${showroom.handle}?ref=${source}`}>Open showroom <b aria-hidden="true">→</b></Link></div></article></aside></div>, portalRoot);
}

function cityFloorLayout(showrooms: readonly DiscoveryShowroom[], groupIndustries: boolean, targetAspect: number) {
  if (groupIndustries) {
    return buildDistrictVenueLayout(showrooms.map((showroom) => ({
      key: showroom.primaryIndustryKey,
      label: showroom.primaryIndustryShortLabel,
    })), 218, 186, targetAspect);
  }
  return {
    ...buildExhibitionGridVenueLayout(showrooms.length, 218, 186, targetAspect),
    districts: [],
  };
}

function useResponsiveVenueStage(defaultAspect: number) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [targetAspect, setTargetAspect] = useState(defaultAspect);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const bounds = stage.getBoundingClientRect();
      if (bounds.width < 1 || bounds.height < 1) return;
      const measured = Math.min(2.25, Math.max(.65, bounds.width / bounds.height));
      const band = Math.round(measured * 4) / 4;
      setTargetAspect((current) => current === band ? current : band);
    };
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    update();
    return () => observer.disconnect();
  }, []);

  return { stageRef, targetAspect };
}

function useFloorNavigation(width: number, height: number, externalStageRef?: RefObject<HTMLDivElement | null>, onTap?: (target: Element) => void) {
  const internalStageRef = useRef<HTMLDivElement | null>(null);
  const stageRef = externalStageRef || internalStageRef;
  const floorRef = useRef<HTMLDivElement | null>(null);
  const zoomLabelRef = useRef<HTMLSpanElement | null>(null);
  const behaviorRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const fitTransformRef = useRef<ZoomTransform>(zoomIdentity);
  const tapHandlerRef = useRef(onTap);
  const gestureRef = useRef<{ x: number; y: number; target: Element } | null>(null);
  tapHandlerRef.current = onTap;

  useEffect(() => {
    const stage = stageRef.current;
    const floor = floorRef.current;
    if (!stage || !floor) return;
    const selection = select(stage);
    const floorSelection = select(floor);
    const gesturePoint = (event: MouseEvent | TouchEvent) => {
      if ("changedTouches" in event) {
        const touch = event.changedTouches[0] || event.touches[0];
        return touch ? { x: touch.clientX, y: touch.clientY } : null;
      }
      return { x: event.clientX, y: event.clientY };
    };
    const behavior = zoom<HTMLDivElement, unknown>()
      .clickDistance(6)
      .tapDistance(10)
      .filter((event) => {
        const target = event.target as Element | null;
        if (event.type === "wheel") return true;
        return !target?.closest("input, select, textarea");
      })
      .on("start.floor-tap", (event: { sourceEvent?: MouseEvent | TouchEvent }) => {
        const sourceEvent = event.sourceEvent;
        const target = sourceEvent?.target;
        const point = sourceEvent ? gesturePoint(sourceEvent) : null;
        gestureRef.current = point && target instanceof Element
          ? { ...point, target }
          : null;
      })
      .on("zoom", (event: { transform: ZoomTransform }) => {
        floorSelection.style("transform", `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`).style("transform-origin", "0 0");
        if (zoomLabelRef.current) zoomLabelRef.current.textContent = `${Math.round(event.transform.k * 100)}%`;
      })
      .on("end.floor-tap", (event: { sourceEvent?: MouseEvent | TouchEvent }) => {
        const start = gestureRef.current;
        gestureRef.current = null;
        const point = event.sourceEvent ? gesturePoint(event.sourceEvent) : null;
        if (start && point && Math.hypot(point.x - start.x, point.y - start.y) <= 6) {
          tapHandlerRef.current?.(start.target);
        }
      });
    behaviorRef.current = behavior;
    selection.call(behavior).on("dblclick.zoom", null);

    const fitFloor = () => {
      const bounds = stage.getBoundingClientRect();
      const fit = Math.min(1, (bounds.width - 28) / width, (bounds.height - 28) / height);
      const scale = fit;
      behavior
        .extent([[0, 0], [bounds.width, bounds.height]])
        .translateExtent([[-80, -80], [width + 80, height + 80]])
        .scaleExtent([Math.min(fit, scale), 1.6]);
      const transform = zoomIdentity
        .translate((bounds.width - width * scale) / 2, (bounds.height - height * scale) / 2)
        .scale(scale);
      fitTransformRef.current = transform;
      selection.call(behavior.transform, transform);
    };
    const observer = new ResizeObserver(fitFloor);
    observer.observe(stage);
    fitFloor();
    return () => {
      observer.disconnect();
      selection.on(".zoom", null);
      behaviorRef.current = null;
    };
  }, [height, width]);

  function zoomFloor(factor: number) {
    const stage = stageRef.current;
    const behavior = behaviorRef.current;
    if (!stage || !behavior) return;
    const selection = select(stage);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) selection.call(behavior.scaleBy, factor);
    else selection.transition().duration(180).call(behavior.scaleBy, factor);
  }

  function resetFloor() {
    const stage = stageRef.current;
    const behavior = behaviorRef.current;
    if (!stage || !behavior) return;
    const selection = select(stage);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) selection.call(behavior.transform, fitTransformRef.current);
    else selection.transition().duration(220).call(behavior.transform, fitTransformRef.current);
  }

  return { stageRef, floorRef, zoomLabelRef, zoomFloor, resetFloor };
}

function CityMarketplacePanel({ group, industryKey, featuredNowBusinessId, onBack }: { group: DiscoveryCityGroup; industryKey: string; featuredNowBusinessId: number | null; onBack: () => void }) {
  const responsiveStage = useResponsiveVenueStage(1.35);
  const layout = useMemo(() => cityFloorLayout(group.showrooms, industryKey === "all", responsiveStage.targetAspect), [group.showrooms, industryKey, responsiveStage.targetAspect]);
  const { floorRef, zoomLabelRef, zoomFloor, resetFloor } = useFloorNavigation(layout.width, layout.height, responsiveStage.stageRef);

  return <section className={`city-showroom-panel${industryKey === "all" ? "" : " industry-themed"}`} data-industry={industryKey} aria-labelledby="city-showroom-title">
    <section className="city-showroom-shell">
      <header className="city-showroom-head"><div><span className="discovery-kicker">{group.region} marketplace</span><h2 id="city-showroom-title">Made near {group.city}</h2><p>{group.count} independent showrooms in one place.</p></div><button className="city-showroom-back" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" />Back to map</button></header>
      <div className="venue-zoom-toolbar city-showroom-actions" aria-label="City marketplace controls"><span ref={zoomLabelRef} aria-live="polite">100%</span><button type="button" onClick={() => zoomFloor(1.25)} title="Zoom in" aria-label="Zoom in to city marketplace">+</button><button type="button" onClick={() => zoomFloor(.8)} title="Zoom out" aria-label="Zoom out of city marketplace">−</button><button type="button" onClick={resetFloor} title="Fit city marketplace" aria-label="Fit city marketplace to view">◎</button></div>
      <div ref={responsiveStage.stageRef} className="city-showroom-stage" aria-label={`${group.city} virtual marketplace floor`}>
        <div ref={floorRef} className="city-showroom-floor" style={{ width: layout.width, height: layout.height }}>
          <div className="city-showroom-place" aria-hidden="true"><span>{group.city}</span><b>Local makers</b><small>{group.count} showrooms</small></div>
          {layout.districts.map((district) => <div key={district.key} className="city-industry-district" data-industry={district.key} style={{ left: district.left, top: district.top, width: district.width, height: district.height }}><span><b>{district.label}</b><small>{district.count} {district.count === 1 ? "showroom" : "showrooms"}</small></span></div>)}
          {group.showrooms.map((showroom, index) => {
            const position = layout.positions[index];
            const presence = showroomPresence(showroom, featuredNowBusinessId);
            return <Link key={showroom.id} className={`city-showroom-shop${presence.kind ? ` ${presence.kind}` : ""}`} data-showroom-id={showroom.id} data-industry={showroom.primaryIndustryKey} data-presence={presence.kind || undefined} aria-label={`${showroom.name}, ${showroom.primaryIndustryLabel}.${presence.label ? ` ${presence.label}.` : ""} Open showroom.`} href={`/@${showroom.handle}?ref=discovery`} style={{ left: position.left, top: position.top, width: layout.cardWidth, height: layout.cardHeight }}><span className="city-shop-kiosk"><span className="city-shop-fascia"><b>{showroom.primaryIndustryShortLabel}</b><i className={presence.kind ? "city-shop-presence" : "city-shop-open"}>{presence.shortLabel || "Open"}</i></span><span className="city-shop-display"><ShowroomImage showroom={showroom} /></span><span className="city-shop-details"><strong>{showroom.name}</strong><small>{presence.label || showroom.primaryIndustryShortLabel}</small><em>Open showroom</em></span></span><i className="city-shop-platform" aria-hidden="true" /></Link>;
          })}
        </div>
      </div>
    </section>
  </section>;
}

function DiscoveryList({ discovery, action }: { discovery: MarketplaceDiscoveryView; action: string }) {
  const { list } = discovery;
  if (!list.items.length) return <div className="discovery-empty"><h3>No showrooms match this search yet.</h3><p>Try another word or industry.</p></div>;
  const pageHref = (page: number) => discoveryHref(action, {
    industry: discovery.industry.key,
    q: discovery.query,
    place: discovery.place,
    view: "list",
    page,
  });
  return <div className="discovery-list-wrap" data-industry={discovery.industry.key}><div className="discovery-list">{list.items.map((showroom) => <article key={showroom.id} data-showroom-id={showroom.id} data-industry={showroom.primaryIndustryKey} aria-label={`${showroom.name}, ${showroom.primaryIndustryLabel}`}><ShowroomImage showroom={showroom} /><div><div className="discovery-list-meta"><span className="discovery-list-industry"><i aria-hidden="true" />{showroom.primaryIndustryShortLabel}</span><em>{showroom.sponsored ? "Sponsored" : showroom.productionScale === "growing_factory" ? "Growing factory" : "Workshop / producer"}</em></div><h3>{showroom.name}</h3><p>{showroom.tagline}</p><small>{showroom.city}, {showroom.region}</small></div><Link href={`/@${showroom.handle}?ref=discovery`}>Open showroom</Link></article>)}</div>{list.pageCount > 1 ? <nav className="discovery-pages" aria-label="Showroom list pages">{list.page > 1 ? <Link href={pageHref(list.page - 1)} rel="prev">Previous</Link> : <span className="disabled">Previous</span>}<span>Page {list.page} of {list.pageCount}</span>{list.page < list.pageCount ? <Link href={pageHref(list.page + 1)} rel="next">Next</Link> : <span className="disabled">Next</span>}</nav> : null}</div>;
}

function featuredFloorLayout(count: number, targetAspect: number) {
  return buildExhibitionGridVenueLayout(count, 224, 190, targetAspect);
}

function FeaturedFloor({ featured, walkthroughs, featuredNowBusinessId }: { featured: WeeklyFeaturedProgram; walkthroughs: FeaturedBoothWalkthrough[]; featuredNowBusinessId: number | null }) {
  const [selected, setSelected] = useState<DiscoveryShowroom | null>(null);
  const responsiveStage = useResponsiveVenueStage(1.35);
  const layout = useMemo(() => featuredFloorLayout(featured.boothCount, responsiveStage.targetAspect), [featured.boothCount, responsiveStage.targetAspect]);
  const sessions = useMemo(() => resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy), [featured.boothCount, featured.programPolicy]);
  const { floorRef, zoomLabelRef, zoomFloor, resetFloor } = useFloorNavigation(layout.width, layout.height, responsiveStage.stageRef, (target) => {
    const businessId = Number(target.closest<HTMLElement>(".featured-booth[data-business-id]")?.dataset.businessId);
    const showroom = featured.booths.find((booth) => booth.revealed && booth.showroom.id === businessId)?.showroom;
    if (showroom) setSelected(showroom);
  });
  useEffect(() => setSelected(null), [featured.dateLabel, featured.industryCode]);

  if (!featured.booths.length) return <div className="discovery-empty"><h3>Today&apos;s featured showroom floor is being prepared.</h3><p>More businesses will appear here as their showrooms are published.</p></div>;
  return <div className="featured-floor-wrap">
    <div className="venue-zoom-toolbar featured-floor-actions" aria-label="Featured showroom floor controls"><span ref={zoomLabelRef} aria-live="polite">100%</span><button type="button" onClick={() => zoomFloor(1.25)} title="Zoom in" aria-label="Zoom in to featured showroom floor">+</button><button type="button" onClick={() => zoomFloor(.8)} title="Zoom out" aria-label="Zoom out of featured showroom floor">−</button><button type="button" onClick={resetFloor} title="Fit featured showroom floor" aria-label="Fit featured showroom floor to view">◎</button></div>
    <div ref={responsiveStage.stageRef} className="featured-floor-stage" aria-label={`${featured.title}, one continuous virtual floor`}>
      <div ref={floorRef} className="featured-floor" style={{ width: layout.width, height: layout.height }}>
        <div className="featured-pavilion" aria-hidden="true"><strong>{featured.industryCode}</strong><small>{featured.isToday ? "Open today" : "Floor preview"}</small></div>
        {featured.booths.map((booth, index) => {
          const position = layout.positions[index];
          const row = Math.floor(index / layout.columns) + 1;
          const walkthrough = walkthroughs[index];
          const walkthroughLabel = walkthrough
            ? `${walkthrough.label} EAT`
            : `${featuredProgramTimeLabel(sessions.morning.startMinute, sessions.afternoon.endMinute)} EAT`;
          const isCurrent = Boolean(featured.isToday && booth.revealed && booth.showroom.id === featuredNowBusinessId);
          const style = { left: position.left, top: position.top, width: layout.cardWidth, height: layout.cardHeight };
          if (!booth.revealed) return <div key={booth.reference} data-featured-slot={booth.slot} style={style} className="featured-booth featured-booth-outline" aria-label={`${booth.reference}, booth preview, walkthrough ${walkthroughLabel}`}><span className="featured-booth-kiosk"><span className="featured-booth-fascia"><b>R{row} · {booth.reference}</b><i>{String(booth.slot).padStart(2, "0")}</i></span><span className="featured-booth-display"><span className="featured-booth-placeholder" aria-hidden="true"><i /><i /><i /></span></span><span className="featured-booth-details"><strong>Reserved booth</strong><small>Walkthrough {walkthroughLabel}</small></span></span><i className="featured-booth-platform" aria-hidden="true" /></div>;
          const showroom = booth.showroom;
          const presence = showroomPresence(showroom, featuredNowBusinessId);
          return <button key={showroom.id} data-business-id={showroom.id} data-walkthrough-current={isCurrent || undefined} data-presence={presence.kind || undefined} type="button" style={style} className={`featured-booth${isCurrent ? " walkthrough-current" : presence.kind === "live" ? " merchant-live" : ""}${selected?.id === showroom.id ? " selected" : ""}`} onClick={() => setSelected(showroom)} aria-label={`${booth.reference}, ${showroom.name}, walkthrough ${walkthroughLabel}${presence.label ? `, ${presence.label}` : ""}`}><span className="featured-booth-kiosk"><span className="featured-booth-fascia"><b>R{row} · {booth.reference}</b><i className={presence.kind ? "featured-booth-live" : undefined}>{presence.shortLabel || String(booth.slot).padStart(2, "0")}</i></span><span className="featured-booth-display"><ShowroomImage showroom={showroom} /></span><span className="featured-booth-details"><strong>{showroom.name}</strong><small>{presence.label || showroom.city} · {walkthroughLabel}</small></span></span><i className="featured-booth-platform" aria-hidden="true" /></button>;
        })}
      </div>
    </div>
    {selected ? <ShowroomPreview showroom={selected} source="featured" onClose={() => setSelected(null)} presence={showroomPresence(selected, featuredNowBusinessId)} /> : null}
  </div>;
}

function FeaturedWeekNav({ featured, action, mapIndustry, query, place, view }: { featured: WeeklyFeaturedProgram; action: string; mapIndustry: string; query: string; place: string; view: "map" | "list" | "" }) {
  return <nav className="featured-week" aria-label="Daily featured showroom schedule">{featured.schedule.map((day) => <Link key={day.weekday} href={discoveryHref(action, { industry: mapIndustry, q: query, place, view, featuredDay: day.weekday }, "daily-featured-title")} className={[day.weekday === featured.selectedWeekday ? "active" : "", day.isToday ? "today" : ""].filter(Boolean).join(" ")} aria-current={day.weekday === featured.selectedWeekday ? "date" : undefined} aria-label={`${day.dayLabel}, ${day.dateLabel}, ${day.industryLabel}${day.isToday ? ", today" : ""}`}><span><IndustryIcon name={day.industryIcon} /></span><b>{day.dayLabel.slice(0, 3)}</b><small>{day.dateLabel}</small><em>{day.industryLabel}</em>{day.isToday ? <mark>Today</mark> : null}</Link>)}</nav>;
}

function TodayProgramSchedule({ featured, agenda }: { featured: WeeklyFeaturedProgram; agenda: FeaturedProgramAgendaEntry[] }) {
  if (!featured.isToday) return null;
  const sessions = resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy);
  const intermission = agenda.find((entry) => entry.kind === "intermission");
  const sessionSummary = [sessions.morning, sessions.afternoon]
    .filter((session) => session.boothCount > 0)
    .map((session) => `${session.session === "morning" ? "Morning" : "Evening"} ${featuredProgramTimeLabel(session.startMinute, session.endMinute)}`)
    .join(" · ");
  const boothName = (slot: number) => {
    const booth = featured.booths[slot - 1];
    return booth?.revealed ? booth.showroom.name : `Booth ${slot}`;
  };
  const sessionSection = (session: "morning" | "afternoon", label: string) => {
    const entries = agenda.filter((entry) => entry.session === session && (entry.kind === "booth" || entry.kind === "sponsor_break"));
    if (!entries.length) return null;
    const resolved = sessions[session];
    return <section className={`featured-agenda-session featured-agenda-${session}`} aria-label={`${label} featured showroom schedule`}>
      <header><span>{label}</span><strong>{featuredProgramTimeLabel(resolved.startMinute, resolved.endMinute)} EAT</strong></header>
      <ol>{entries.map((entry) => entry.kind === "booth"
        ? <li key={`booth-${entry.slot}`} className={entry.current ? "current" : undefined} aria-current={entry.current ? "time" : undefined}><time>{entry.label}</time><span><b>{boothName(entry.slot)}</b><small>Booth {String(entry.slot).padStart(2, "0")}</small></span></li>
        : <li key={`${entry.kind}-${entry.start}`} className={`featured-agenda-break${entry.current ? " current" : ""}`} aria-current={entry.current ? "time" : undefined}><time>{entry.timeLabel}</time><span><b>{entry.label}</b><small>Program break</small></span></li>)}</ol>
    </section>;
  };
  return <details className="featured-agenda">
    <summary><CalendarClock aria-hidden="true" /><span><small>Today's schedule</small><strong>{sessionSummary || "No presentations scheduled"}</strong></span><em>{featured.boothCount} {featured.boothCount === 1 ? "showroom" : "showrooms"}</em><ChevronDown className="featured-agenda-chevron" aria-hidden="true" /></summary>
    <div className="featured-agenda-body">
      {sessionSection("morning", "Morning session")}
      {intermission?.kind === "intermission" ? <div className={`featured-agenda-intermission${intermission.current ? " current" : ""}`} aria-current={intermission.current ? "time" : undefined}><span>{intermission.label}</span><strong>{intermission.timeLabel} EAT</strong></div> : null}
      {sessionSection("afternoon", "Evening session")}
      <p>Five-minute booth changeovers are included between listed presentations unless a sponsor break is shown.</p>
    </div>
  </details>;
}

function SponsoredRail({ showrooms }: { showrooms: DiscoveryShowroom[] }) {
  const sponsors = showrooms.slice(0, 5);
  const [mobileStart, setMobileStart] = useState(0);
  useEffect(() => {
    if (sponsors.length <= 2) return;
    const timer = window.setInterval(() => setMobileStart((current) => (current + 2) % sponsors.length), 7_000);
    return () => window.clearInterval(timer);
  }, [sponsors.length]);
  const mobileVisible = new Set([mobileStart, (mobileStart + 1) % Math.max(1, sponsors.length)]);

  if (!sponsors.length) return null;
  return <aside className="discovery-sponsored" id="featured-sponsors" aria-labelledby="featured-sponsors-title">
    <header className="discovery-sponsored-heading"><div><span>Paid placement</span><h2 id="featured-sponsors-title">Sponsors</h2><p>Businesses supporting their placement on MirtPage.</p></div><small>{sponsors.length} sponsors</small></header>
    <div className="discovery-sponsored-rail">{sponsors.map((showroom, index) => <Link key={showroom.id} href={`/@${showroom.handle}?ref=sponsor`} data-mobile-visible={mobileVisible.has(index) ? "true" : undefined}><ShowroomImage showroom={showroom} /><span><small>Sponsor</small><b>{showroom.name}</b><em>Open showroom <strong aria-hidden="true">→</strong></em></span></Link>)}</div>
  </aside>;
}

function WeeklyFeatured({ featured, sponsoredShowrooms, featuredNowBusinessId, action, mapIndustry, query, place, view }: { featured: WeeklyFeaturedProgram; sponsoredShowrooms: DiscoveryShowroom[]; featuredNowBusinessId: number | null; action: string; mapIndustry: string; query: string; place: string; view: "map" | "list" | "" }) {
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
  const agenda = useMemo(() => selectedDay
    ? buildFeaturedProgramAgenda(selectedDay.dateIso, featured.boothCount, broadcastNow ?? Date.parse(`${selectedDay.dateIso}T00:00:00+03:00`), featured.programPolicy)
    : [], [broadcastNow, featured.boothCount, featured.programPolicy, selectedDay]);
  const walkthroughs = useMemo(
    () => agenda.filter((entry): entry is FeaturedBoothWalkthrough => entry.kind === "booth"),
    [agenda],
  );
  useEffect(() => {
    if (featured.isToday || !today) return;
    const timer = window.setTimeout(() => {
      router.replace(discoveryHref(action, { industry: mapIndustry, q: query, place, view, featuredDay: today.weekday }, "daily-featured-title"), { scroll: false });
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [action, featured.isToday, featured.selectedWeekday, mapIndustry, place, query, router, today, view]);
  return <section className={`daily-featured featured-theme-${featured.industryCode.toLowerCase()}`} aria-labelledby="daily-featured-title">
    <div className="featured-program-header">
      <header className="daily-featured-head"><div><span className="discovery-kicker">{featured.industryLabel} · {featured.dayLabel} · {featured.dateLabel} · Country-wide</span><h1 id="daily-featured-title">{featured.title}</h1><p>{featured.isToday ? `Explore today's ${featured.industryLabel.toLowerCase()} showrooms from across Ethiopia on one continuous floor, then continue into any permanent showroom.` : `Preview ${featured.industryLabel.toLowerCase()} showrooms for ${featured.dayLabel}. Business names and booth designs are revealed when this program opens.`}</p></div><FeaturedBroadcastStatus featured={featured} selectedDay={selectedDay} now={broadcastNow} agenda={agenda} /></header>
      <TodayProgramSchedule featured={featured} agenda={agenda} />
    </div>
    <div className="featured-experience"><FeaturedWeekNav featured={featured} action={action} mapIndustry={mapIndustry} query={query} place={place} view={view} /><FeaturedFloor featured={featured} walkthroughs={walkthroughs} featuredNowBusinessId={featuredNowBusinessId} /><SponsoredRail showrooms={sponsoredShowrooms} /></div>
  </section>;
}

export function FeaturedShowroomsWorkspace({ discovery, sponsoredShowrooms }: { discovery: FeaturedShowroomsView; sponsoredShowrooms: DiscoveryShowroom[] }) {
  return <section className="discovery discovery-featured-experience" aria-label="Daily Featured Showrooms experience">
    <WeeklyFeatured featured={discovery.featured} sponsoredShowrooms={sponsoredShowrooms} featuredNowBusinessId={discovery.featuredNowBusinessId} action="/featured" mapIndustry="" query="" place="" view="" />
  </section>;
}

function FeaturedBroadcastStatus({ featured, selectedDay, now, agenda }: { featured: WeeklyFeaturedProgram; selectedDay: WeeklyFeaturedProgram["schedule"][number] | undefined; now: number | null; agenda: FeaturedProgramAgendaEntry[] }) {
  if (!selectedDay) return null;
  const sessions = resolveFeaturedProgramSessions(featured.boothCount, featured.programPolicy);
  const phase: FeaturedBroadcastPhase = now === null ? "scheduled" : featuredBroadcastPhase(selectedDay.dateIso, featured.boothCount, now, featured.programPolicy);
  const activeEntry = agenda.find((entry) => entry.current);
  const activeWalkthrough = activeEntry?.kind === "booth" ? activeEntry : null;
  const activeBooth = activeWalkthrough ? featured.booths[activeWalkthrough.slot - 1] : null;
  const activeBusiness = activeBooth?.revealed ? activeBooth.showroom.name : null;
  const sessionSummary = `Morning ${featuredProgramTimeLabel(sessions.morning.startMinute, sessions.morning.endMinute)} · Evening ${featuredProgramTimeLabel(sessions.afternoon.startMinute, sessions.afternoon.endMinute)} EAT`;
  const afternoonRestart = featuredProgramTimeLabel(sessions.afternoon.startMinute, sessions.afternoon.startMinute).split("–")[0];
  const content = phase === "live"
    ? activeWalkthrough
      ? { title: `TikTok Live · ${activeBooth?.reference || "Booth walkthrough"}`, detail: `${activeBusiness ? `Now visiting ${activeBusiness} · ` : ""}${activeWalkthrough.label} EAT`, action: "Watch live", href: MIRTPAGE_TIKTOK_URL }
      : activeEntry && (activeEntry.kind === "changeover" || activeEntry.kind === "sponsor_break")
        ? { title: `${activeEntry.label} · ${activeEntry.timeLabel} EAT`, detail: "The next featured showroom begins shortly.", action: "Watch live", href: MIRTPAGE_TIKTOK_URL }
        : { title: "TikTok Live program", detail: sessionSummary, action: "Watch live", href: MIRTPAGE_TIKTOK_URL }
    : phase === "intermission"
      ? { title: `${featured.programPolicy.intermissionLabel} · ${featuredProgramTimeLabel(sessions.morning.endMinute, sessions.afternoon.startMinute)} EAT`, detail: `Evening walkthroughs resume at ${afternoonRestart} EAT.`, action: "TikTok", href: MIRTPAGE_TIKTOK_URL }
    : phase === "ended"
      ? { title: "Livestream ended", detail: "Watch the business recordings on YouTube.", action: "View recordings", href: MIRTPAGE_YOUTUBE_URL }
      : { title: `TikTok Live ${featured.isToday ? "today" : selectedDay.dayLabel}`, detail: sessionSummary, action: "TikTok", href: MIRTPAGE_TIKTOK_URL };
  return <aside className={`featured-program featured-program-${phase}`} aria-label="Featured showroom livestream status"><span><Radio aria-hidden="true" />{featured.isToday ? "Today’s featured showrooms" : "Featured showroom preview"}</span><strong>{content.title}</strong><small>{content.detail}</small>{content.href ? <a href={content.href} target="_blank" rel="noreferrer">{content.action}<ExternalLink aria-hidden="true" /></a> : null}</aside>;
}
