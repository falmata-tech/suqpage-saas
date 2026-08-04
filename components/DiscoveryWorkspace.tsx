"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import Supercluster from "supercluster";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTION_SCALES } from "@/lib/discovery-contract";
import type { DiscoveryCityGroup, DiscoveryShowroom, DiscoveryView, WeeklyIndustryExpo } from "@/lib/discovery";

const MAP_WIDTH = 900;
const MAP_HEIGHT = 650;
const BASE_CLUSTER_ZOOM = 5;
const MAX_CLUSTER_ZOOM = 10;
const MAX_MAP_ZOOM = 9;
const MAX_MAP_SCALE = 2 ** (MAX_MAP_ZOOM - BASE_CLUSTER_ZOOM);
const CITY_GATEWAY_ZOOM = 8;
const CITY_GATEWAY_SCALE = 2 ** (CITY_GATEWAY_ZOOM - BASE_CLUSTER_ZOOM);
const ETHIOPIA_BOUNDS: [number, number, number, number] = [32, 3, 49, 15];

type MapFeature = {
  type: "Feature";
  properties: Record<string, string | number | [number, number]>;
  geometry: GeoPermissibleObjects;
};

type MapCollection = {
  type: "FeatureCollection";
  features: MapFeature[];
};

type MarkerProperties = { showroomId: number; sponsored: boolean };
type ClusterProperties = { sponsoredCount: number };

const iconPath: Record<string, string> = {
  circuit: "M4 4h6v6H4zM14 14h6v6h-6zM10 7h4v10h-4M7 10v4h10",
  leaf: "M19 4C11 4 5 8 5 15c4 1 9-1 12-5-3 4-7 6-12 7M5 20c1-6 5-10 11-13",
  sprout: "M12 21v-9M12 14c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 11c0-4 3-7 8-7 0 5-3 8-8 8",
  tool: "M14 6 6 14l4 4 8-8M15 3l6 6-3 3-6-6zM4 16l4 4-2 2H2v-4z",
  home: "M3 11 12 4l9 7v9h-6v-6H9v6H3z",
  thread: "M7 4h10v4H7zM8 8h8l2 12H6zM9 12h6M8 16h8",
  live: "M8 8.5a5 5 0 0 0 0 7M5 5.5a9 9 0 0 0 0 13M16 8l5-3v14l-5-3zM3 8h13v8H3z",
};

function IndustryIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={iconPath[name] || iconPath.home} /></svg>;
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

export default function DiscoveryWorkspace({ discovery, embedded = false }: { discovery: DiscoveryView; embedded?: boolean }) {
  const router = useRouter();
  const action = embedded ? "/" : "/discover";
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    setSelectedShowroomId(null);
    setActiveCityKey(null);
    setView(discovery.view);
  }, [discovery.industry.key, discovery.productionScale, discovery.query, discovery.view]);

  useEffect(() => {
    setSearchInput(discovery.query);
  }, [discovery.query]);

  useEffect(() => {
    const nextQuery = searchInput.trim();
    if (nextQuery === discovery.query || (nextQuery.length > 0 && nextQuery.length < 2)) return;
    const timer = window.setTimeout(() => {
      router.replace(discoveryHref(action, {
        industry: discovery.industry.key,
        scale: discovery.productionScale,
        q: nextQuery,
        expoDay: discovery.expo.selectedWeekday,
        view,
      }), { scroll: false });
    }, 420);
    return () => window.clearTimeout(timer);
  }, [action, discovery.expo.selectedWeekday, discovery.industry.key, discovery.productionScale, discovery.query, router, searchInput, view]);

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
  const sponsoredShowrooms = discovery.showrooms.filter((showroom) => showroom.sponsored);
  const groupedShowroomIds = useMemo(() => new Set(discovery.cityGroups.flatMap((group) => group.showrooms.map((showroom) => showroom.id))), [discovery.cityGroups]);

  const clusterIndex = useMemo(() => {
    const index = new Supercluster<MarkerProperties, ClusterProperties>({
      radius: 52,
      maxZoom: MAX_CLUSTER_ZOOM,
      minPoints: 2,
      map: (properties) => ({ sponsoredCount: properties.sponsored ? 1 : 0 }),
      reduce: (accumulated, properties) => { accumulated.sponsoredCount += properties.sponsoredCount; },
    });
    index.load(discovery.showrooms.map((showroom) => ({
      type: "Feature" as const,
      properties: { showroomId: showroom.id, sponsored: showroom.sponsored },
      geometry: { type: "Point" as const, coordinates: [showroom.longitude, showroom.latitude] },
    })));
    return index;
  }, [discovery.showrooms]);
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

  const locations = useMemo(() => {
    const grouped = new Map<string, { city: string; region: string; latitude: number; longitude: number; count: number }>();
    for (const showroom of discovery.showrooms) {
      const key = `${showroom.city.trim().toLocaleLowerCase()}\u0000${showroom.region.trim().toLocaleLowerCase()}`;
      const current = grouped.get(key) || { city: showroom.city, region: showroom.region, latitude: 0, longitude: 0, count: 0 };
      current.latitude += showroom.latitude;
      current.longitude += showroom.longitude;
      current.count += 1;
      grouped.set(key, current);
    }
    return [...grouped.values()].map((location) => ({ ...location, latitude: location.latitude / location.count, longitude: location.longitude / location.count }))
      .sort((left, right) => right.count - left.count || left.city.localeCompare(right.city));
  }, [discovery.showrooms]);

  useEffect(() => {
    if (!svgRef.current || !groupRef.current || !projection) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_MAP_SCALE])
      .extent([[0, 0], [MAP_WIDTH, MAP_HEIGHT]])
      .translateExtent([[-90, -75], [MAP_WIDTH + 90, MAP_HEIGHT + 75]])
      .on("zoom", (event: { transform: ZoomTransform }) => {
        select(groupRef.current).attr("transform", event.transform.toString());
      })
      .on("end", (event: { transform: ZoomTransform }) => setZoomLevel(event.transform.k));
    const svg = select(svgRef.current);
    zoomRef.current = behavior;
    svg.call(behavior).on("dblclick.zoom", null);
    return () => { svg.on(".zoom", null); zoomRef.current = null; };
  }, [projection]);

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

  function resetMap() {
    setSelectedShowroomId(null);
    animate(zoomIdentity);
  }

  function zoomBy(factor: number) {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(220).call(zoomRef.current.scaleBy, factor);
  }

  function renderShowroomPoint(showroom: DiscoveryShowroom) {
    const point = projection?.([showroom.longitude, showroom.latitude]);
    if (!point) return null;
    return <g key={`showroom-${showroom.id}`} data-showroom-id={showroom.id} data-latitude={showroom.latitude} data-longitude={showroom.longitude} className={`discovery-point${showroom.sponsored ? " sponsored" : ""}${selectedShowroomId === showroom.id ? " selected" : ""}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${showroom.name}, ${showroom.city}. Open preview.`} onClick={() => setSelectedShowroomId(showroom.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedShowroomId(showroom.id); }}><circle className="point-halo" r="18" /><path d="M0 13C-3 8-9 3-9-5a9 9 0 1 1 18 0c0 8-6 13-9 18Z" /><circle cx="0" cy="-5" r="3" /></g>;
  }

  const showCityGateways = clusterZoom >= CITY_GATEWAY_ZOOM;
  return <section className="discovery" id="discover" aria-labelledby="discovery-title">
    <div className="discovery-switcher">
      <div className="discovery-switcher-head"><div><span className="discovery-kicker">Local production, closer than you think</span><h2 id="discovery-title">Find the people behind what Ethiopia makes.</h2></div><p>Explore small and growing makers, growers, workshops, processors, and factories by what they produce and where they work.</p></div>
      <nav className="discovery-industries" aria-label="Industries">
        {discovery.industries.map((industry) => <Link key={industry.key} className={industry.key === discovery.industry.key ? "active" : ""} href={discoveryHref(action, { industry: industry.key, scale: discovery.productionScale, expoDay: discovery.expo.selectedWeekday, view })} aria-current={industry.key === discovery.industry.key ? "page" : undefined}><IndustryIcon name={industry.icon} /><span>{industry.label}</span></Link>)}
      </nav>
      <div className="discovery-commandbar">
        <div className="discovery-search" role="search"><label><span className="sr-only">Search this industry. Results update as you type.</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg><input name="q" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={80} placeholder="Business, product, capability, or place" /></label>{searchInput ? <button className="discovery-search-clear" type="button" onClick={() => setSearchInput("")} aria-label="Clear marketplace search" title="Clear search">×</button> : null}</div>
        <nav className="discovery-scale" aria-label="Production scale"><span>Production scale</span><Link className={!discovery.productionScale ? "active" : ""} href={discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, expoDay: discovery.expo.selectedWeekday, view })}>All</Link>{PRODUCTION_SCALES.map((scale) => <Link key={scale.key} className={discovery.productionScale === scale.key ? "active" : ""} href={discoveryHref(action, { industry: discovery.industry.key, scale: scale.key, q: discovery.query, expoDay: discovery.expo.selectedWeekday, view })}>{scale.label}</Link>)}</nav>
      </div>
    </div>

    <div className="discovery-summary"><div><span className="discovery-kicker">{discovery.industry.label}</span><strong>{discovery.total} Showrooms across {discovery.locationCount} {discovery.locationCount === 1 ? "location" : "locations"}</strong><small>Zoom into clusters to reveal each business at its reviewed location.</small></div><div className="discovery-tabs" role="tablist" aria-label="Discovery view"><button type="button" role="tab" aria-selected={view === "map"} className={view === "map" ? "active" : ""} onClick={() => setView("map")}>Map</button><button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List</button></div></div>

    {view === "list" ? <DiscoveryList discovery={discovery} action={action} /> : <div className="discovery-map-shell">
      <div className="discovery-map-tools">
        <label className="discovery-location-picker"><span>Jump to a location</span><select defaultValue="" onChange={(event) => {
          if (!event.target.value) { resetMap(); return; }
          const location = locations[Number(event.target.value)];
          if (location) framePoint(location.longitude, location.latitude, CITY_GATEWAY_SCALE);
        }}><option value="">All Ethiopia</option>{locations.map((location, index) => <option key={`${location.city}-${location.region}`} value={index}>Near {location.city}, {location.region} ({location.count})</option>)}</select></label>
        <div className="discovery-zoom" aria-label="Map controls"><button type="button" onClick={() => zoomBy(1.5)} title="Zoom in" aria-label="Zoom in">+</button><button type="button" onClick={() => zoomBy(1 / 1.5)} title="Zoom out" aria-label="Zoom out">−</button><button type="button" onClick={resetMap} title="Center Ethiopia" aria-label="Center Ethiopia">◎</button></div>
      </div>
      <div className="discovery-map-stage">
        {mapFailed ? <div className="discovery-map-fallback"><p>The map could not load, but every showroom is still available.</p><button type="button" onClick={() => setView("list")}>Open list</button></div> : null}
        {!mapFailed && !path ? <div className="discovery-map-loading">Loading Ethiopia map...</div> : null}
        {!mapFailed && path && projection ? <svg ref={svgRef} className="discovery-map" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Interactive Ethiopia map with clustered showroom locations" tabIndex={0}>
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
                return point ? <g key={group.key} data-city-key={group.key} className="discovery-city-gateway" transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${group.city} marketplace, ${group.count} businesses. Open virtual floor.`} onClick={() => setActiveCityKey(group.key)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setActiveCityKey(group.key); }}><circle className="city-gateway-halo" r="34" /><path d="M-20 15V-10L0-22l20 12v25M-13 15V-7h26v22M-7-1h5v6h-5zM2-1h5v6H2zM-7 9h14v6H-7z" /><circle className="city-gateway-count" cx="18" cy="-18" r="13" /><text className="city-gateway-number" x="18" y="-14" textAnchor="middle">{group.count}</text><text className="city-gateway-name" y="34" textAnchor="middle">{group.city}</text></g> : null;
              })}
              {discovery.showrooms.filter((showroom) => !groupedShowroomIds.has(showroom.id)).map(renderShowroomPoint)}
            </> : markers.map((marker) => {
              const point = projection(marker.geometry.coordinates as [number, number]);
              if (!point) return null;
              const properties = marker.properties;
              if ("cluster_id" in properties) {
                return <g key={`cluster-${properties.cluster_id}`} className="discovery-cluster" transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${properties.point_count} nearby showrooms. Zoom to reveal.`} onClick={() => openCluster(properties.cluster_id, marker.geometry.coordinates as [number, number])} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openCluster(properties.cluster_id, marker.geometry.coordinates as [number, number]); }}><circle className="cluster-halo" r="27" /><circle className="cluster-core" r="19" /><text textAnchor="middle" y="5">{properties.point_count}</text></g>;
              }
              const showroom = discovery.showrooms.find((candidate) => candidate.id === properties.showroomId);
              if (!showroom) return null;
              return renderShowroomPoint(showroom);
            })}</g>
          </g>
        </svg> : null}
        <a className="discovery-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Map data © OpenStreetMap contributors · Boundaries: FEWS NET</a>
        {selectedShowroom ? <ShowroomPreview showroom={selectedShowroom} source="discovery" onClose={() => setSelectedShowroomId(null)} /> : null}
      </div>
    </div>}

    {activeCity ? <CityMarketplaceDialog group={activeCity} onClose={() => setActiveCityKey(null)} /> : null}

    <SponsoredRail showrooms={sponsoredShowrooms} industryLabel={discovery.industry.label} />

    <WeeklyExpo expo={discovery.expo} action={action} mapIndustry={discovery.industry.key} productionScale={discovery.productionScale} query={discovery.query} view={view} />
  </section>;
}

function SponsoredRail({ showrooms, industryLabel }: { showrooms: DiscoveryShowroom[]; industryLabel: string }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || showrooms.length < 2 || paused || interacting || reducedMotion) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const cards = Array.from(rail.querySelectorAll<HTMLElement>("a[data-sponsored-card]"));
      if (cards.length < 2) return;
      activeIndexRef.current = (activeIndexRef.current + 1) % cards.length;
      const card = cards[activeIndexRef.current];
      rail.scrollTo({ left: card.offsetLeft - rail.offsetLeft, behavior: "smooth" });
    }, 4_800);
    return () => window.clearInterval(interval);
  }, [interacting, paused, reducedMotion, showrooms.length]);

  if (!showrooms.length) return null;
  return <section className="discovery-sponsored" aria-labelledby="sponsored-showroom-title">
    <header className="discovery-sponsored-heading">
      <div><span>Sponsored</span><h2 id="sponsored-showroom-title">Showrooms worth a closer look</h2><p>{industryLabel}</p></div>
      <div className="discovery-sponsored-meta"><small>Paid placement</small>{showrooms.length > 1 ? <button type="button" className={paused ? "is-paused" : ""} aria-label={paused ? "Resume sponsored showrooms" : "Pause sponsored showrooms"} title={paused ? "Resume sponsored showrooms" : "Pause sponsored showrooms"} onClick={() => setPaused((current) => !current)}><span aria-hidden="true" /></button> : null}</div>
    </header>
    <div
      className="discovery-sponsored-rail"
      ref={railRef}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onPointerDown={() => setInteracting(true)}
      onPointerUp={() => setInteracting(false)}
      onPointerCancel={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false); }}
      onScroll={(event) => {
        const cards = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[data-sponsored-card]"));
        if (!cards.length) return;
        const scrollLeft = event.currentTarget.scrollLeft;
        activeIndexRef.current = cards.reduce((closest, card, index) => Math.abs(card.offsetLeft - event.currentTarget.offsetLeft - scrollLeft) < Math.abs(cards[closest].offsetLeft - event.currentTarget.offsetLeft - scrollLeft) ? index : closest, 0);
      }}
    >{showrooms.map((showroom) => <Link data-sponsored-card key={showroom.id} href={`/@${showroom.handle}?ref=discovery`}><ShowroomImage showroom={showroom} /><span><small>{showroom.city}</small><b>{showroom.name}</b><em>Open showroom <strong aria-hidden="true">→</strong></em></span></Link>)}</div>
  </section>;
}

function ShowroomImage({ showroom }: { showroom: DiscoveryShowroom }) {
  const [failed, setFailed] = useState(false);
  return showroom.imagePath && !failed ? <Image src={showroom.imagePath} alt="" width={240} height={150} onError={() => setFailed(true)} /> : <span className={`discovery-image-fallback ${showroom.fallbackStyle}`} aria-hidden="true"><i>{showroom.name.slice(0, 1)}</i><b>{showroom.name}</b></span>;
}

function ShowroomPreview({ showroom, source, onClose, label }: { showroom: DiscoveryShowroom; source: "discovery" | "expo"; onClose: () => void; label?: string }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  return <dialog ref={dialogRef} className="discovery-preview" aria-labelledby={`showroom-preview-${showroom.id}`} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}><article><button className="discovery-preview-close" type="button" onClick={onClose} aria-label="Close showroom preview">×</button><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span>{label || (showroom.sponsored ? "Sponsored showroom" : showroom.productionScale === "growing_factory" ? "Growing factory" : "Workshop / producer")}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3><p>{showroom.tagline}</p><small>{showroom.city} · {showroom.zone} · {showroom.region}</small><Link href={`/@${showroom.handle}?ref=${source}`}>Open showroom <b aria-hidden="true">→</b></Link></div></article></dialog>;
}

function cityFloorLayout(count: number) {
  const columns = Math.min(7, Math.max(2, Math.ceil(Math.sqrt(count))));
  const rows = Math.ceil(count / columns);
  const cardWidth = 218;
  const cardHeight = 148;
  const gapX = 48;
  const gapY = 78;
  const paddingX = 52;
  const paddingTop = 132;
  const paddingBottom = 92;
  return {
    columns,
    cardWidth,
    cardHeight,
    gapX,
    gapY,
    paddingX,
    paddingTop,
    width: paddingX * 2 + columns * cardWidth + (columns - 1) * gapX,
    height: paddingTop + rows * cardHeight + Math.max(0, rows - 1) * gapY + paddingBottom,
  };
}

function useFloorNavigation(width: number, height: number, itemCount: number) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const floorRef = useRef<HTMLDivElement | null>(null);
  const zoomLabelRef = useRef<HTMLSpanElement | null>(null);
  const behaviorRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const fitTransformRef = useRef<ZoomTransform>(zoomIdentity);

  useEffect(() => {
    const stage = stageRef.current;
    const floor = floorRef.current;
    if (!stage || !floor) return;
    const selection = select(stage);
    const floorSelection = select(floor);
    const behavior = zoom<HTMLDivElement, unknown>()
      .filter((event) => {
        const target = event.target as Element | null;
        if (event.type === "wheel") return true;
        return !target?.closest("a, button");
      })
      .on("zoom", (event: { transform: ZoomTransform }) => {
        floorSelection.style("transform", `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`).style("transform-origin", "0 0");
        if (zoomLabelRef.current) zoomLabelRef.current.textContent = `${Math.round(event.transform.k * 100)}%`;
      });
    behaviorRef.current = behavior;
    selection.call(behavior).on("dblclick.zoom", null);

    const fitFloor = () => {
      const bounds = stage.getBoundingClientRect();
      const fit = Math.min(1, (bounds.width - 24) / width, (bounds.height - 24) / height);
      const phoneMinimum = itemCount <= 8 ? .88 : .58;
      const scale = bounds.width < 620
        ? Math.min(1, Math.max(fit, phoneMinimum))
        : itemCount <= 6 ? fit : Math.max(fit, .55);
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
  }, [height, itemCount, width]);

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

function CityMarketplaceDialog({ group, onClose }: { group: DiscoveryCityGroup; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const layout = useMemo(() => cityFloorLayout(group.count), [group.count]);
  const { stageRef, floorRef, zoomLabelRef, zoomFloor, resetFloor } = useFloorNavigation(layout.width, layout.height, group.count);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);

  return <dialog ref={dialogRef} className="city-showroom-dialog" aria-labelledby="city-showroom-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <section className="city-showroom-shell">
      <header className="city-showroom-head"><div><span className="discovery-kicker">{group.region} marketplace</span><h2 id="city-showroom-title">Made near {group.city}</h2><p>{group.count} independent showrooms in one place.</p></div><div className="city-showroom-actions" aria-label="City marketplace controls"><span ref={zoomLabelRef} aria-live="polite">100%</span><button type="button" onClick={() => zoomFloor(1.25)} title="Zoom in" aria-label="Zoom in to city marketplace">+</button><button type="button" onClick={() => zoomFloor(.8)} title="Zoom out" aria-label="Zoom out of city marketplace">−</button><button type="button" onClick={resetFloor} title="Fit city marketplace" aria-label="Fit city marketplace to view">◎</button><button className="city-showroom-close" type="button" onClick={onClose} title="Close" aria-label="Close city marketplace">×</button></div></header>
      <div ref={stageRef} className="city-showroom-stage" aria-label={`${group.city} virtual marketplace floor`}>
        <div ref={floorRef} className="city-showroom-floor" style={{ width: layout.width, height: layout.height }}>
          <div className="city-showroom-court" aria-hidden="true"><i /><span>Meet · Browse · Inquire</span><i /></div>
          <div className="city-showroom-place" aria-hidden="true"><span>{group.city}</span><b>Local makers</b><small>{group.count} showrooms</small></div>
          {group.showrooms.map((showroom, index) => {
            const column = index % layout.columns;
            const row = Math.floor(index / layout.columns);
            return <Link key={showroom.id} className="city-showroom-shop" data-showroom-id={showroom.id} href={`/@${showroom.handle}?ref=discovery`} style={{ left: layout.paddingX + column * (layout.cardWidth + layout.gapX), top: layout.paddingTop + row * (layout.cardHeight + layout.gapY), width: layout.cardWidth, height: layout.cardHeight }}><ShowroomImage showroom={showroom} /><span><b>{showroom.sponsored ? "Sponsored showroom" : `${group.city} maker`}</b><strong>{showroom.name}</strong><small>{showroom.tagline}</small><em>Open showroom</em></span></Link>;
          })}
        </div>
      </div>
    </section>
  </dialog>;
}

function DiscoveryList({ discovery, action }: { discovery: DiscoveryView; action: string }) {
  const { list } = discovery;
  if (!list.items.length) return <div className="discovery-empty"><h3>No showrooms match this search yet.</h3><p>Try another word, scale, or industry.</p></div>;
  const pageHref = (page: number) => discoveryHref(action, {
    industry: discovery.industry.key,
    scale: discovery.productionScale,
    q: discovery.query,
    expoDay: discovery.expo.selectedWeekday,
    view: "list",
    page,
  });
  return <div className="discovery-list-wrap"><div className="discovery-list">{list.items.map((showroom) => <article key={showroom.id} data-showroom-id={showroom.id}><ShowroomImage showroom={showroom} /><div><span>{showroom.sponsored ? "Sponsored" : showroom.productionScale === "growing_factory" ? "Growing factory" : "Workshop / producer"}</span><h3>{showroom.name}</h3><p>{showroom.tagline}</p><small>{showroom.city}, {showroom.region}</small></div><Link href={`/@${showroom.handle}?ref=discovery`}>Open showroom</Link></article>)}</div>{list.pageCount > 1 ? <nav className="discovery-pages" aria-label="Showroom list pages">{list.page > 1 ? <Link href={pageHref(list.page - 1)} rel="prev">Previous</Link> : <span className="disabled">Previous</span>}<span>Page {list.page} of {list.pageCount}</span>{list.page < list.pageCount ? <Link href={pageHref(list.page + 1)} rel="next">Next</Link> : <span className="disabled">Next</span>}</nav> : null}</div>;
}

function expoFloorLayout(count: number) {
  const columns = Math.min(7, Math.max(2, Math.ceil(Math.sqrt(count))));
  const rows = Math.ceil(count / columns);
  const cardWidth = 224;
  const cardHeight = 164;
  const gapX = 56;
  const gapY = 78;
  const paddingX = 58;
  const paddingTop = 172;
  const paddingBottom = 92;
  return {
    columns,
    cardWidth,
    cardHeight,
    gapX,
    gapY,
    paddingX,
    paddingTop,
    width: paddingX * 2 + columns * cardWidth + Math.max(0, columns - 1) * gapX,
    height: paddingTop + rows * cardHeight + Math.max(0, rows - 1) * gapY + paddingBottom,
  };
}

function ExpoFloor({ expo }: { expo: WeeklyIndustryExpo }) {
  const [selected, setSelected] = useState<DiscoveryShowroom | null>(null);
  const layout = useMemo(() => expoFloorLayout(expo.boothCount), [expo.boothCount]);
  const { stageRef, floorRef, zoomLabelRef, zoomFloor, resetFloor } = useFloorNavigation(layout.width, layout.height, expo.boothCount);
  useEffect(() => setSelected(null), [expo.dateLabel, expo.industryCode]);

  if (!expo.booths.length) return <div className="discovery-empty"><h3>This Expo floor is being prepared.</h3><p>More businesses will appear here as their showrooms are published.</p></div>;
  return <div className="expo-floor-wrap">
    <div className="expo-floor-actions" aria-label="Expo floor controls"><span ref={zoomLabelRef} aria-live="polite">100%</span><button type="button" onClick={() => zoomFloor(1.25)} title="Zoom in" aria-label="Zoom in to Expo floor">+</button><button type="button" onClick={() => zoomFloor(.8)} title="Zoom out" aria-label="Zoom out of Expo floor">−</button><button type="button" onClick={resetFloor} title="Fit Expo floor" aria-label="Fit Expo floor to view">◎</button></div>
    <div ref={stageRef} className="expo-floor-stage" aria-label={`${expo.title}, one continuous virtual floor`}>
      <div ref={floorRef} className="expo-floor" style={{ width: layout.width, height: layout.height }}>
        <div className="expo-pavilion" aria-hidden="true"><span className="expo-canopy" /><strong>{expo.industryCode}</strong><small>{expo.isToday ? "Open today" : "Floor preview"}</small></div>
        <div className="expo-promenade" aria-hidden="true"><i /><span>{expo.mode === "livestream" ? "MirtPage Featured Enterprises" : "MirtPage Maker Expo"}</span><i /></div>
        {expo.booths.map((booth, index) => {
          const column = index % layout.columns;
          const row = Math.floor(index / layout.columns);
          const style = { left: layout.paddingX + column * (layout.cardWidth + layout.gapX), top: layout.paddingTop + row * (layout.cardHeight + layout.gapY), width: layout.cardWidth, height: layout.cardHeight };
          if (!booth.revealed) return <div key={booth.reference} data-expo-slot={booth.slot} style={style} className="expo-booth expo-booth-outline" aria-label={`${booth.reference}, booth preview`}><span className="expo-booth-placeholder" aria-hidden="true"><i /><i /><i /></span><span><b>{booth.reference}</b><strong>Reserved booth</strong><small>Revealed on {expo.dayLabel}</small></span></div>;
          const showroom = booth.showroom;
          return <button key={showroom.id} data-business-id={showroom.id} type="button" style={style} className={`expo-booth${selected?.id === showroom.id ? " selected" : ""}`} onClick={() => setSelected(showroom)} aria-label={`${booth.reference}, ${showroom.name}`}><ShowroomImage showroom={showroom} /><span><b>{booth.reference}</b><strong>{showroom.name}</strong><small>{showroom.city}</small></span></button>;
        })}
      </div>
    </div>
    {selected ? <ShowroomPreview showroom={selected} source="expo" label={expo.mode === "livestream" ? "Featured Enterprise" : undefined} onClose={() => setSelected(null)} /> : null}
  </div>;
}

function WeeklyExpo({ expo, action, mapIndustry, productionScale, query, view }: { expo: WeeklyIndustryExpo; action: string; mapIndustry: string; productionScale: string; query: string; view: "map" | "list" }) {
  const router = useRouter();
  const today = expo.schedule.find((day) => day.isToday);
  useEffect(() => {
    if (expo.isToday || !today) return;
    const timer = window.setTimeout(() => {
      router.replace(discoveryHref(action, { industry: mapIndustry, scale: productionScale, q: query, view, expoDay: today.weekday }, "daily-expo-title"), { scroll: false });
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [action, expo.isToday, expo.selectedWeekday, mapIndustry, productionScale, query, router, today, view]);
  return <section className={`daily-expo expo-theme-${expo.industryCode.toLowerCase()}`} aria-labelledby="daily-expo-title">
    <nav className="expo-week" aria-label="Weekly Expo schedule">{expo.schedule.map((day) => <Link key={day.weekday} href={discoveryHref(action, { industry: mapIndustry, scale: productionScale, q: query, view, expoDay: day.weekday }, "daily-expo-title")} className={[day.weekday === expo.selectedWeekday ? "active" : "", day.isToday ? "today" : ""].filter(Boolean).join(" ")} aria-current={day.weekday === expo.selectedWeekday ? "date" : undefined}><span><IndustryIcon name={day.industryIcon} /></span><b>{day.dayLabel.slice(0, 3)}</b><small>{day.dateLabel}</small><em>{day.mode === "livestream" ? `Featured Enterprises · ${day.industryLabel}` : day.industryLabel}</em>{day.isToday ? <mark>Today</mark> : null}</Link>)}</nav>
    <header className="daily-expo-head"><div><span className="discovery-kicker">{expo.dayLabel} · {expo.dateLabel} · Country-wide</span><h2 id="daily-expo-title">{expo.title}</h2><p>{expo.isToday ? expo.mode === "livestream" ? "Meet businesses selected by MirtPage, hear directly from their founders in our social livestream, and continue into their permanent showrooms." : `Explore ${expo.title.toLowerCase()} businesses from across Ethiopia on one continuous floor, then continue into any permanent showroom.` : expo.mode === "livestream" ? "Preview this week’s Featured Enterprises floor. MirtPage reveals the selected founders when Sunday’s program opens." : "Preview the floor and plan your visit. Business names and booth designs are revealed when this program opens."}</p></div><span className={`expo-status-badge${expo.isToday ? " open" : ""}`}><i />{expo.isToday ? expo.mode === "livestream" ? "Featured today" : "Open today" : "Preview only"}</span></header>
    <ExpoFloor expo={expo} />
  </section>;
}
