"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { geoMercator, geoPath, type GeoPermissibleObjects, type GeoProjection } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import Supercluster from "supercluster";
import { ArrowLeft, Crosshair, LocateFixed, Minus, Plus, SlidersHorizontal, X } from "lucide-react";
import { memo, startTransition, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DiscoveryNearbyGroup, DiscoverySearchSuggestion, DiscoveryShowroom, MarketplaceDiscoveryView } from "@/lib/discovery";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";

const MAP_WIDTH = 900;
const MAP_HEIGHT = 650;
const BASE_CLUSTER_ZOOM = 5;
const MAX_CLUSTER_ZOOM = 18;
const MAX_MAP_ZOOM = 18;
const MAX_MAP_SCALE = 2 ** (MAX_MAP_ZOOM - BASE_CLUSTER_ZOOM);
const NEARBY_GROUP_ZOOM = 14;
const SHOWROOM_DETAIL_SCALE = 8;
const ETHIOPIA_BOUNDS: [number, number, number, number] = [32, 3, 49, 15];
const DISCOVERY_SESSION_KEY = "mirtpage:discovery-navigation:v1";
const DISCOVERY_RETURN_KEY = "mirtpage:last-marketplace-url:v1";
const MAX_PLACE_LABELS = 180;

type DiscoverySessionState = {
  scope: string;
  activeNearbyGroupKey: string | null;
  mapTransform: { x: number; y: number; k: number };
  updatedAt: number;
};

type CommittedMapViewport = {
  x: number;
  y: number;
  k: number;
};

type ProjectedPath = {
  key: string;
  d: string | undefined;
};

type ProjectedRoadPath = ProjectedPath & {
  className: string;
};

const MapGeographyLayers = memo(function MapGeographyLayers({
  regionPaths,
  zonePaths,
  majorRoadPaths,
  primaryRoadPaths,
  secondaryRoadPaths,
  showZones,
  showPrimaryRoads,
  showSecondaryRoads,
}: {
  regionPaths: ProjectedPath[];
  zonePaths: ProjectedPath[];
  majorRoadPaths: ProjectedRoadPath[];
  primaryRoadPaths: ProjectedRoadPath[];
  secondaryRoadPaths: ProjectedRoadPath[];
  showZones: boolean;
  showPrimaryRoads: boolean;
  showSecondaryRoads: boolean;
}) {
  return <>
    <g className="discovery-regions">{regionPaths.map((regionPath) => <path key={regionPath.key} d={regionPath.d} />)}</g>
    <g className="discovery-roads">
      {majorRoadPaths.map((roadPath) => <path key={roadPath.key} className={roadPath.className} d={roadPath.d} />)}
      {showPrimaryRoads ? primaryRoadPaths.map((roadPath) => <path key={roadPath.key} className={roadPath.className} d={roadPath.d} />) : null}
      {showSecondaryRoads ? secondaryRoadPaths.map((roadPath) => <path key={roadPath.key} className={roadPath.className} d={roadPath.d} />) : null}
    </g>
    {showZones ? <g className="discovery-zones">{zonePaths.map((zonePath) => <path key={zonePath.key} d={zonePath.d} />)}</g> : null}
  </>;
});

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

type MapFeature = {
  type: "Feature";
  properties: Record<string, string | number | [number, number]>;
  geometry: GeoPermissibleObjects;
};

type MapCollection = {
  type: "FeatureCollection";
  features: MapFeature[];
};

async function fetchMapCollection(path: string) {
  const response = await fetch(path);
  return response.ok ? response.json() as Promise<MapCollection> : null;
}

function projectMapPlaces(collection: MapCollection | null, projection: GeoProjection | null) {
  return collection && projection ? collection.features.flatMap((feature) => {
    const coordinates = (feature.geometry as { coordinates?: [number, number] }).coordinates;
    const point = coordinates ? projection(coordinates) : null;
    return point ? [{ feature, point }] : [];
  }) : [];
}

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

function mapZoomForScale(scale: number) {
  return Math.max(BASE_CLUSTER_ZOOM, Math.min(MAX_MAP_ZOOM, Math.floor(BASE_CLUSTER_ZOOM + Math.log2(scale))));
}

function projectedPointIsVisible(point: [number, number] | null, bounds: { left: number; right: number; top: number; bottom: number }) {
  return Boolean(point
    && point[0] >= bounds.left
    && point[0] <= bounds.right
    && point[1] >= bounds.top
    && point[1] <= bounds.bottom);
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
  const [regions, setRegions] = useState<MapCollection | null>(null);
  const [zones, setZones] = useState<MapCollection | null>(null);
  const [cityPlaces, setCityPlaces] = useState<MapCollection | null>(null);
  const [townPlaces, setTownPlaces] = useState<MapCollection | null>(null);
  const [villagePlaces, setVillagePlaces] = useState<MapCollection | null>(null);
  const [majorRoads, setMajorRoads] = useState<MapCollection | null>(null);
  const [primaryRoads, setPrimaryRoads] = useState<MapCollection | null>(null);
  const [secondaryRoads, setSecondaryRoads] = useState<MapCollection | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedShowroomId, setSelectedShowroomId] = useState<number | null>(null);
  const [activeNearbyGroupKey, setActiveNearbyGroupKey] = useState<string | null>(null);
  const [mapViewport, setMapViewport] = useState<CommittedMapViewport>({ x: 0, y: 0, k: 1 });
  const [nearMeStatus, setNearMeStatus] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterDialogRef = useRef<HTMLDialogElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const mapTransformRef = useRef<ZoomTransform>(zoomIdentity);
  const mapPersistenceEnabledRef = useRef(true);
  const navigationScope = useMemo(() => [action, discovery.industry.key, discovery.query, discovery.place].join("|"), [action, discovery.industry.key, discovery.place, discovery.query]);

  useEffect(() => {
    setSelectedShowroomId(null);
    setActiveNearbyGroupKey(null);
    mapPersistenceEnabledRef.current = true;
  }, [discovery.industry.key, discovery.place, discovery.query]);

  useEffect(() => {
    const saved = readDiscoverySession(navigationScope);
    if (saved) {
      mapTransformRef.current = zoomIdentity.translate(saved.mapTransform.x, saved.mapTransform.y).scale(saved.mapTransform.k);
      setMapViewport(saved.mapTransform);
      const savedGroup = discovery.nearbyGroups.find((group) => group.key === saved.activeNearbyGroupKey) || null;
      setActiveNearbyGroupKey(savedGroup?.key || null);
    } else {
      mapTransformRef.current = zoomIdentity;
      setMapViewport({ x: 0, y: 0, k: 1 });
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

  function rememberNavigation(activeGroup: string | null, transform = mapTransformRef.current) {
    writeDiscoverySession({
      scope: navigationScope,
      activeNearbyGroupKey: activeGroup,
      mapTransform: { x: transform.x, y: transform.y, k: transform.k },
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
        fetchMapCollection("/geo/ethiopia-admin2-2023.geojson"),
        fetchMapCollection("/geo/ethiopia-places-cities-osm.geojson"),
        fetchMapCollection("/geo/ethiopia-roads-major-osm.geojson"),
      ]).then(([zoneData, placeData, roadData]) => {
        if (!active) return;
        setZones(zoneData);
        setCityPlaces(placeData);
        setMajorRoads(roadData);
      }).catch(() => undefined);
    let cancelDetailLoad: () => void;
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(loadDetails, { timeout: 3_000 });
      cancelDetailLoad = () => window.cancelIdleCallback(idleId);
    } else {
      const timeoutId = globalThis.setTimeout(loadDetails, 1_500);
      cancelDetailLoad = () => globalThis.clearTimeout(timeoutId);
    }
    return () => {
      active = false;
      cancelDetailLoad();
    };
  }, []);

  const loadPrimaryRoads = mapViewport.k >= 1.45;
  const loadTowns = mapViewport.k >= 1.7;
  const loadSecondaryRoads = mapViewport.k >= 2.4;
  const loadVillages = mapViewport.k >= 3.2;
  useEffect(() => {
    type DetailTier = "primaryRoads" | "townPlaces" | "secondaryRoads" | "villagePlaces";
    const requests: Promise<[DetailTier, MapCollection | null]>[] = [];
    let active = true;
    if (loadPrimaryRoads && !primaryRoads) requests.push(fetchMapCollection("/geo/ethiopia-roads-primary-osm.geojson").then((data) => ["primaryRoads", data]));
    if (loadTowns && !townPlaces) requests.push(fetchMapCollection("/geo/ethiopia-places-towns-osm.geojson").then((data) => ["townPlaces", data]));
    if (loadSecondaryRoads && !secondaryRoads) requests.push(fetchMapCollection("/geo/ethiopia-roads-secondary-osm.geojson").then((data) => ["secondaryRoads", data]));
    if (loadVillages && !villagePlaces) requests.push(fetchMapCollection("/geo/ethiopia-places-villages-osm.geojson").then((data) => ["villagePlaces", data]));
    if (requests.length) void Promise.all(requests).then((results) => {
      if (!active) return;
      for (const [tier, data] of results) {
        if (tier === "primaryRoads") setPrimaryRoads(data);
        else if (tier === "townPlaces") setTownPlaces(data);
        else if (tier === "secondaryRoads") setSecondaryRoads(data);
        else setVillagePlaces(data);
      }
    });
    return () => { active = false; };
  }, [loadPrimaryRoads, loadSecondaryRoads, loadTowns, loadVillages, primaryRoads, secondaryRoads, townPlaces, villagePlaces]);

  const projection = useMemo(() => regions
    ? geoMercator().fitExtent([[52, 34], [MAP_WIDTH - 52, MAP_HEIGHT - 34]], regions as unknown as GeoPermissibleObjects)
    : null, [regions]);
  const path = useMemo(() => projection ? geoPath(projection) : null, [projection]);
  const regionPaths = useMemo(() => path && regions ? regions.features.map((feature, index) => ({
    key: `${String(feature.properties.name)}-${index}`,
    d: path(feature as unknown as GeoPermissibleObjects) || undefined,
  })) : [], [path, regions]);
  const zonePaths = useMemo(() => path && zones ? zones.features.map((feature, index) => ({
    key: `${String(feature.properties.name)}-${index}`,
    d: path(feature as unknown as GeoPermissibleObjects) || undefined,
  })) : [], [path, zones]);
  const majorRoadPaths = useMemo(() => path && majorRoads ? majorRoads.features.map((feature) => ({
    key: String(feature.properties.highway),
    className: `road-${String(feature.properties.highway)}`,
    d: path(feature as unknown as GeoPermissibleObjects) || undefined,
  })) : [], [majorRoads, path]);
  const primaryRoadPaths = useMemo(() => path && primaryRoads ? primaryRoads.features.map((feature) => ({
    key: String(feature.properties.highway),
    className: `road-${String(feature.properties.highway)}`,
    d: path(feature as unknown as GeoPermissibleObjects) || undefined,
  })) : [], [path, primaryRoads]);
  const secondaryRoadPaths = useMemo(() => path && secondaryRoads ? secondaryRoads.features.map((feature) => ({
    key: String(feature.properties.highway),
    className: `road-${String(feature.properties.highway)}`,
    d: path(feature as unknown as GeoPermissibleObjects) || undefined,
  })) : [], [path, secondaryRoads]);
  const zoomLevel = mapViewport.k;
  const viewportMapBounds = useMemo(() => {
    const padding = 56;
    return {
      left: (-mapViewport.x - padding) / mapViewport.k,
      right: (MAP_WIDTH - mapViewport.x + padding) / mapViewport.k,
      top: (-mapViewport.y - padding) / mapViewport.k,
      bottom: (MAP_HEIGHT - mapViewport.y + padding) / mapViewport.k,
    };
  }, [mapViewport]);
  const viewportGeoBounds = useMemo<[number, number, number, number]>(() => {
    if (!projection) return ETHIOPIA_BOUNDS;
    const corners = [
      projection.invert?.([viewportMapBounds.left, viewportMapBounds.top]),
      projection.invert?.([viewportMapBounds.right, viewportMapBounds.top]),
      projection.invert?.([viewportMapBounds.left, viewportMapBounds.bottom]),
      projection.invert?.([viewportMapBounds.right, viewportMapBounds.bottom]),
    ].filter((point): point is [number, number] => Boolean(point));
    if (!corners.length) return ETHIOPIA_BOUNDS;
    const longitudes = corners.map((point) => point[0]);
    const latitudes = corners.map((point) => point[1]);
    return [
      Math.max(ETHIOPIA_BOUNDS[0], Math.min(...longitudes)),
      Math.max(ETHIOPIA_BOUNDS[1], Math.min(...latitudes)),
      Math.min(ETHIOPIA_BOUNDS[2], Math.max(...longitudes)),
      Math.min(ETHIOPIA_BOUNDS[3], Math.max(...latitudes)),
    ];
  }, [projection, viewportMapBounds]);
  const showroomById = useMemo(() => new Map(discovery.showrooms.map((showroom) => [showroom.id, showroom])), [discovery.showrooms]);
  const selectedShowroom = showroomById.get(selectedShowroomId || -1) || null;
  const activeNearbyGroup = discovery.nearbyGroups.find((group) => group.key === activeNearbyGroupKey) || null;
  const activeNearbyShowrooms = useMemo(() => activeNearbyGroup?.showroomIds.map((showroomId) => showroomById.get(showroomId)).filter((showroom): showroom is DiscoveryShowroom => Boolean(showroom)) || [], [activeNearbyGroup, showroomById]);
  const nearbyShowroomIds = useMemo(() => new Set(discovery.nearbyGroups.flatMap((group) => group.showroomIds)), [discovery.nearbyGroups]);

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
  const markers = useMemo(() => clusterIndex.getClusters(viewportGeoBounds, clusterZoom), [clusterIndex, clusterZoom, viewportGeoBounds]);

  const projectedCities = useMemo(() => projectMapPlaces(cityPlaces, projection), [cityPlaces, projection]);
  const projectedTowns = useMemo(() => projectMapPlaces(townPlaces, projection), [townPlaces, projection]);
  const projectedVillages = useMemo(() => projectMapPlaces(villagePlaces, projection), [villagePlaces, projection]);
  const rankedCities = useMemo(() => [...projectedCities].sort((left, right) =>
    Number(right.feature.properties.population || 0) - Number(left.feature.properties.population || 0)
    || String(left.feature.properties.name).localeCompare(String(right.feature.properties.name)),
  ), [projectedCities]);
  const rankedDetailedPlaces = useMemo(() => [...projectedTowns, ...projectedVillages].sort((left, right) =>
    String(left.feature.properties.place).localeCompare(String(right.feature.properties.place))
    || String(left.feature.properties.name).localeCompare(String(right.feature.properties.name)),
  ), [projectedTowns, projectedVillages]);
  const visibleCityCandidates = useMemo(() => {
    if (zoomLevel < 1.7) return rankedCities.slice(0, 20);
    return rankedCities.filter(({ point }) => projectedPointIsVisible(point, viewportMapBounds));
  }, [rankedCities, viewportMapBounds, zoomLevel]);
  const visibleCityPlaces = visibleCityCandidates.slice(0, 8);
  const visibleDetailedPlaces = useMemo(() => {
    const additionalCities = visibleCityCandidates.slice(8);
    if (zoomLevel < 1.7) return additionalCities;
    const candidates = zoomLevel < 3.2 ? projectedTowns : rankedDetailedPlaces;
    return [...additionalCities, ...candidates]
      .filter(({ point }) => projectedPointIsVisible(point, viewportMapBounds))
      .slice(0, Math.max(0, MAX_PLACE_LABELS - visibleCityPlaces.length));
  }, [projectedTowns, rankedDetailedPlaces, viewportMapBounds, visibleCityCandidates, visibleCityPlaces.length, zoomLevel]);
  const visiblePlaceCount = visibleCityPlaces.length + visibleDetailedPlaces.length;
  const visibleNearbyGroups = useMemo(() => discovery.nearbyGroups.filter((group) => projectedPointIsVisible(projection?.([group.longitude, group.latitude]) || null, viewportMapBounds)), [discovery.nearbyGroups, projection, viewportMapBounds]);
  const visibleUngroupedShowrooms = useMemo(() => discovery.showrooms.filter((showroom) => !nearbyShowroomIds.has(showroom.id) && projectedPointIsVisible(projection?.([showroom.longitude, showroom.latitude]) || null, viewportMapBounds)), [discovery.showrooms, nearbyShowroomIds, projection, viewportMapBounds]);

  useEffect(() => {
    if (!svgRef.current || !groupRef.current || !projection) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_MAP_SCALE])
      .extent([[0, 0], [MAP_WIDTH, MAP_HEIGHT]])
      .translateExtent([[-90, -75], [MAP_WIDTH + 90, MAP_HEIGHT + 75]])
      .on("start", () => {
        svgRef.current?.classList.add("map-navigating");
      })
      .on("zoom", (event: { transform: ZoomTransform }) => {
        mapTransformRef.current = event.transform;
        select(groupRef.current).attr("transform", event.transform.toString());
      })
      .on("end", (event: { transform: ZoomTransform }) => {
        svgRef.current?.classList.remove("map-navigating");
        startTransition(() => setMapViewport({ x: event.transform.x, y: event.transform.y, k: event.transform.k }));
        if (mapPersistenceEnabledRef.current) rememberNavigation(null, event.transform);
      });
    const svg = select(svgRef.current);
    zoomRef.current = behavior;
    svg.call(behavior).on("dblclick.zoom", null);
    svg.call(behavior.transform, mapTransformRef.current);
    return () => { svg.on(".zoom", null); svgRef.current?.classList.remove("map-navigating"); zoomRef.current = null; };
  }, [navigationScope, projection]);

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
    const scale = Math.min(MAX_MAP_SCALE, Math.max(1.8, 2 ** (expansion - BASE_CLUSTER_ZOOM)));
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
    setActiveNearbyGroupKey(null);
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
      <circle className="point-hit-target" cy="-1" r="22" />
      <path className="point-showroom-pin" d="M0 18C-3 14-14 6-14-5a14 14 0 1 1 28 0C14 6 3 14 0 18Z" />
      <path className="point-showroom-store" d="M-8-10H8l2 5h-20ZM-8-5V7H8V-5M-3 7V1h6v6M-7-1h4M3-1h4" />
      <text className="point-showroom-label" y="29" textAnchor="middle">
        {labelLines.map((line, index) => (
          <tspan key={`${line}-${index}`} x="0" dy={index === 0 ? 0 : 8}>{line}</tspan>
        ))}
      </text>
      {presence.kind ? <MarkerPresenceBadge kind={presence.kind} text={presence.shortLabel.toUpperCase()} y={-31} /> : null}
    </g>;
  }

  const industrySelected = Boolean(discovery.industry.key);
  const showNearbyGroups = industrySelected && clusterZoom >= NEARBY_GROUP_ZOOM;
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
        {!mapFailed && !path ? <div className="discovery-map-loading">Loading Ethiopia map...</div> : null}
        {!mapFailed && path && projection ? <svg ref={svgRef} className="discovery-map" data-map-zoom={zoomLevel.toFixed(2)} data-cluster-zoom={clusterZoom} data-nearby-group-count={discovery.nearbyGroups.length} data-visible-nearby-group-count={visibleNearbyGroups.length} data-map-marker-count={showNearbyGroups ? visibleNearbyGroups.length + visibleUngroupedShowrooms.length : markers.length} data-map-label-count={visiblePlaceCount} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="group" aria-label="Interactive Ethiopia map with clustered showroom locations">
          <rect className="discovery-map-bg" width={MAP_WIDTH} height={MAP_HEIGHT} />
          <g ref={groupRef}>
            <MapGeographyLayers regionPaths={regionPaths} zonePaths={zonePaths} majorRoadPaths={majorRoadPaths} primaryRoadPaths={primaryRoadPaths} secondaryRoadPaths={secondaryRoadPaths} showZones={zoomLevel >= 1.65} showPrimaryRoads={zoomLevel >= 1.45} showSecondaryRoads={zoomLevel >= 2.4} />
            <g className="discovery-places"><g className="discovery-place-cities">{visibleCityPlaces.map(({ feature, point }, index) => <text key={`${String(feature.properties.name)}-${index}`} className="place-city" transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`}>{String(feature.properties.name)}</text>)}</g><g className="discovery-place-details">{visibleDetailedPlaces.map(({ feature, point }, index) => <text key={`${String(feature.properties.name)}-${index}`} className={`place-${String(feature.properties.place)}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`}>{String(feature.properties.name)}</text>)}</g></g>
            <g className="discovery-markers">{showNearbyGroups ? <>
              {visibleNearbyGroups.map((group) => {
                const point = projection([group.longitude, group.latitude]);
                const groupShowrooms = group.showroomIds.map((showroomId) => showroomById.get(showroomId)).filter((showroom): showroom is DiscoveryShowroom => Boolean(showroom));
                const featured = group.showroomIds.includes(discovery.featuredNowBusinessId || -1);
                const liveCount = groupShowrooms.filter((showroom) => showroom.isLive && showroom.id !== discovery.featuredNowBusinessId).length;
                const statusLabel = featured ? "Featured now" : liveCount ? `${liveCount} live` : "";
                return point ? <g key={group.key} data-nearby-group-key={group.key} data-presence={featured ? "featured" : liveCount ? "live" : undefined} className={`discovery-nearby-group${featured ? " featured" : liveCount ? " live" : ""}${activeNearbyGroupKey === group.key ? " selected" : ""}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${group.count} nearby showrooms in ${group.city}.${statusLabel ? ` ${statusLabel}.` : ""} Open nearby showrooms.`} onClick={() => openNearbyGroup(group)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openNearbyGroup(group); }}><circle className="cluster-halo" r="27" /><circle className="cluster-core" r="19" /><text textAnchor="middle" y="5">{group.count}</text><text className="nearby-group-name" y="31" textAnchor="middle">Nearby</text>{featured ? <MarkerPresenceBadge kind="featured" text="FEATURED" y={-32} /> : liveCount ? <MarkerPresenceBadge kind="live" text={`${liveCount} LIVE`} y={-32} /> : null}</g> : null;
              })}
              {visibleUngroupedShowrooms.map(renderShowroomPoint)}
            </> : markers.map((marker) => {
              const point = projection(marker.geometry.coordinates as [number, number]);
              if (!point) return null;
              const properties = marker.properties;
              if ("cluster_id" in properties) {
                const featuredCount = properties.featuredCount || 0;
                const liveCount = properties.liveCount || 0;
                return <g key={`cluster-${properties.cluster_id}`} data-presence={featuredCount ? "featured" : liveCount ? "live" : undefined} className={`discovery-cluster${featuredCount ? " featured" : liveCount ? " live" : ""}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${properties.point_count} nearby showrooms.${featuredCount ? " One is featured now." : liveCount ? ` ${liveCount} live now.` : ""} Zoom to reveal.`} onClick={() => openCluster(properties.cluster_id, marker.geometry.coordinates as [number, number])} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openCluster(properties.cluster_id, marker.geometry.coordinates as [number, number]); }}><circle className="cluster-halo" r="27" /><circle className="cluster-core" r="19" /><text textAnchor="middle" y="5">{properties.point_count}</text>{featuredCount ? <MarkerPresenceBadge kind="featured" text="FEATURED" y={-32} /> : liveCount ? <MarkerPresenceBadge kind="live" text={`${liveCount} LIVE`} y={-32} /> : null}</g>;
              }
              const showroom = showroomById.get(properties.showroomId);
              if (!showroom) return null;
              return renderShowroomPoint(showroom);
            })}</g>
          </g>
        </svg> : null}
        <a className="discovery-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Map data © OpenStreetMap contributors · Boundaries: FEWS NET</a>
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
