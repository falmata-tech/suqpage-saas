"use client";

import Image from "next/image";
import Link from "next/link";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import Supercluster from "supercluster";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { DailyIndustryExpo, DiscoverySuq, DiscoveryView, ExpoBooth } from "@/lib/discovery";

const MAP_WIDTH = 900;
const MAP_HEIGHT = 650;
const BASE_CLUSTER_ZOOM = 5;
const MAX_CLUSTER_ZOOM = 12;
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

type MarkerProperties = { suqId: number; featured: boolean };
type ClusterProperties = { featuredCount: number };

const iconPath: Record<string, string> = {
  circuit: "M4 4h6v6H4zM14 14h6v6h-6zM10 7h4v10h-4M7 10v4h10",
  leaf: "M19 4C11 4 5 8 5 15c4 1 9-1 12-5-3 4-7 6-12 7M5 20c1-6 5-10 11-13",
  sprout: "M12 21v-9M12 14c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 11c0-4 3-7 8-7 0 5-3 8-8 8",
  tool: "M14 6 6 14l4 4 8-8M15 3l6 6-3 3-6-6zM4 16l4 4-2 2H2v-4z",
  home: "M3 11 12 4l9 7v9h-6v-6H9v6H3z",
  thread: "M7 4h10v4H7zM8 8h8l2 12H6zM9 12h6M8 16h8",
};

function IndustryIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={iconPath[name] || iconPath.home} /></svg>;
}

function mapZoomForScale(scale: number) {
  return Math.max(BASE_CLUSTER_ZOOM, Math.min(MAX_CLUSTER_ZOOM, Math.floor(BASE_CLUSTER_ZOOM + Math.log2(scale))));
}

export default function DiscoveryWorkspace({ discovery, embedded = false }: { discovery: DiscoveryView; embedded?: boolean }) {
  const [view, setView] = useState<"map" | "list">("map");
  const [regions, setRegions] = useState<MapCollection | null>(null);
  const [zones, setZones] = useState<MapCollection | null>(null);
  const [places, setPlaces] = useState<MapCollection | null>(null);
  const [roads, setRoads] = useState<MapCollection | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedSuqId, setSelectedSuqId] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    setSelectedSuqId(null);
  }, [discovery.industry.key, discovery.query]);

  useEffect(() => {
    let active = true;
    fetch("/geo/ethiopia-admin1-2023.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("Map unavailable");
        return response.json() as Promise<MapCollection>;
      })
      .then((data) => { if (active) setRegions(data); })
      .catch(() => { if (active) setMapFailed(true); });
    Promise.all([
      fetch("/geo/ethiopia-admin2-2023.geojson").then((response) => response.ok ? response.json() as Promise<MapCollection> : null),
      fetch("/geo/ethiopia-places-osm.geojson").then((response) => response.ok ? response.json() as Promise<MapCollection> : null),
      fetch("/geo/ethiopia-major-roads-osm.geojson").then((response) => response.ok ? response.json() as Promise<MapCollection> : null),
    ]).then(([zoneData, placeData, roadData]) => {
      if (!active) return;
      setZones(zoneData);
      setPlaces(placeData);
      setRoads(roadData);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const projection = useMemo(() => regions
    ? geoMercator().fitExtent([[52, 34], [MAP_WIDTH - 52, MAP_HEIGHT - 34]], regions as unknown as GeoPermissibleObjects)
    : null, [regions]);
  const path = useMemo(() => projection ? geoPath(projection) : null, [projection]);
  const selectedSuq = discovery.suqs.find((suq) => suq.id === selectedSuqId) || null;
  const featuredSuqs = discovery.suqs.filter((suq) => suq.featured).slice(0, 5);

  const clusterIndex = useMemo(() => {
    const index = new Supercluster<MarkerProperties, ClusterProperties>({
      radius: 52,
      maxZoom: MAX_CLUSTER_ZOOM,
      minPoints: 2,
      map: (properties) => ({ featuredCount: properties.featured ? 1 : 0 }),
      reduce: (accumulated, properties) => { accumulated.featuredCount += properties.featuredCount; },
    });
    index.load(discovery.suqs.map((suq) => ({
      type: "Feature" as const,
      properties: { suqId: suq.id, featured: suq.featured },
      geometry: { type: "Point" as const, coordinates: [suq.longitude, suq.latitude] },
    })));
    return index;
  }, [discovery.suqs]);
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
    for (const suq of discovery.suqs) {
      const key = `${suq.city}\u0000${suq.region}`;
      const current = grouped.get(key) || { city: suq.city, region: suq.region, latitude: 0, longitude: 0, count: 0 };
      current.latitude += suq.latitude;
      current.longitude += suq.longitude;
      current.count += 1;
      grouped.set(key, current);
    }
    return [...grouped.values()].map((location) => ({ ...location, latitude: location.latitude / location.count, longitude: location.longitude / location.count }))
      .sort((left, right) => right.count - left.count || left.city.localeCompare(right.city));
  }, [discovery.suqs]);

  useEffect(() => {
    if (!svgRef.current || !groupRef.current || !projection) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .extent([[0, 0], [MAP_WIDTH, MAP_HEIGHT]])
      .translateExtent([[-90, -75], [MAP_WIDTH + 90, MAP_HEIGHT + 75]])
      .on("zoom", (event: { transform: ZoomTransform }) => {
        select(groupRef.current).attr("transform", event.transform.toString());
        setZoomLevel(event.transform.k);
      });
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
    const scale = Math.min(12, Math.max(1.8, 2 ** (expansion - BASE_CLUSTER_ZOOM)));
    framePoint(coordinates[0], coordinates[1], scale);
  }

  function resetMap() {
    setSelectedSuqId(null);
    animate(zoomIdentity);
  }

  function zoomBy(factor: number) {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(220).call(zoomRef.current.scaleBy, factor);
  }

  const action = embedded ? "/" : "/discover";
  return <section className="discovery" id="discover" aria-labelledby="discovery-title">
    <div className="discovery-switcher">
      <div className="discovery-switcher-head"><div><span className="discovery-kicker">Explore Ethiopia&apos;s product businesses</span><h2 id="discovery-title">Choose an industry. Find a Suq.</h2></div><p>Browse by real business location, then step into today&apos;s country-wide industry Expo.</p></div>
      <nav className="discovery-industries" aria-label="Industries">
        {discovery.industries.map((industry) => <Link key={industry.key} className={industry.key === discovery.industry.key ? "active" : ""} href={`${action}?industry=${encodeURIComponent(industry.key)}#discover`} aria-current={industry.key === discovery.industry.key ? "page" : undefined}><IndustryIcon name={industry.icon} /><span>{industry.label}</span></Link>)}
      </nav>
      <form className="discovery-search" action={action} method="get"><input type="hidden" name="industry" value={discovery.industry.key} /><label><span className="sr-only">Search this industry</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg><input name="q" defaultValue={discovery.query} maxLength={80} placeholder="Search a business, product, craft, or place" /></label><button type="submit">Search</button>{discovery.query ? <Link href={`${action}?industry=${discovery.industry.key}#discover`}>Clear</Link> : null}</form>
      <FeaturedRail suqs={featuredSuqs} />
    </div>

    <div className="discovery-summary"><div><span className="discovery-kicker">{discovery.industry.label}</span><strong>{discovery.total} Suqs across {discovery.locationCount} {discovery.locationCount === 1 ? "location" : "locations"}</strong><small>Zoom into clusters to reveal each business at its reviewed location.</small></div><div className="discovery-tabs" role="tablist" aria-label="Discovery view"><button type="button" role="tab" aria-selected={view === "map"} className={view === "map" ? "active" : ""} onClick={() => setView("map")}>Map</button><button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List</button></div></div>

    {view === "list" ? <DiscoveryList suqs={discovery.suqs} /> : <div className="discovery-map-shell">
      <div className="discovery-map-tools">
        <label className="discovery-location-picker"><span>Jump to a location</span><select defaultValue="" onChange={(event) => {
          if (!event.target.value) { resetMap(); return; }
          const location = locations[Number(event.target.value)];
          if (location) framePoint(location.longitude, location.latitude, 5);
        }}><option value="">All Ethiopia</option>{locations.map((location, index) => <option key={`${location.city}-${location.region}`} value={index}>{location.city}, {location.region} ({location.count})</option>)}</select></label>
        <div className="discovery-zoom" aria-label="Map controls"><button type="button" onClick={() => zoomBy(1.5)} title="Zoom in" aria-label="Zoom in">+</button><button type="button" onClick={() => zoomBy(1 / 1.5)} title="Zoom out" aria-label="Zoom out">−</button><button type="button" onClick={resetMap} title="Center Ethiopia" aria-label="Center Ethiopia">◎</button></div>
      </div>
      <div className="discovery-map-stage">
        {mapFailed ? <div className="discovery-map-fallback"><p>The map could not load, but every Suq is still available.</p><button type="button" onClick={() => setView("list")}>Open list</button></div> : null}
        {!mapFailed && !path ? <div className="discovery-map-loading">Loading Ethiopia map...</div> : null}
        {!mapFailed && path && projection ? <svg ref={svgRef} className="discovery-map" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Interactive Ethiopia map with clustered Suq locations" tabIndex={0}>
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
            <g className="discovery-markers">{markers.map((marker) => {
              const point = projection(marker.geometry.coordinates as [number, number]);
              if (!point) return null;
              const properties = marker.properties;
              if ("cluster_id" in properties) {
                return <g key={`cluster-${properties.cluster_id}`} className="discovery-cluster" transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${properties.point_count} nearby Suqs. Zoom to reveal.`} onClick={() => openCluster(properties.cluster_id, marker.geometry.coordinates as [number, number])} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openCluster(properties.cluster_id, marker.geometry.coordinates as [number, number]); }}><circle className="cluster-halo" r="27" /><circle className="cluster-core" r="19" /><text textAnchor="middle" y="5">{properties.point_count}</text></g>;
              }
              const suq = discovery.suqs.find((candidate) => candidate.id === properties.suqId);
              if (!suq) return null;
              return <g key={`suq-${suq.id}`} className={`discovery-point${suq.featured ? " featured" : ""}${selectedSuqId === suq.id ? " selected" : ""}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${suq.name}, ${suq.city}. Open preview.`} onClick={() => setSelectedSuqId(suq.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedSuqId(suq.id); }}><circle className="point-halo" r="18" /><path d="M0 13C-3 8-9 3-9-5a9 9 0 1 1 18 0c0 8-6 13-9 18Z" /><circle cx="0" cy="-5" r="3" /></g>;
            })}</g>
          </g>
        </svg> : null}
        <a className="discovery-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Map data © OpenStreetMap contributors · Boundaries: FEWS NET</a>
        {selectedSuq ? <SuqPreview suq={selectedSuq} source="discovery" onClose={() => setSelectedSuqId(null)} /> : null}
      </div>
    </div>}

    <DailyExpo expo={discovery.expo} />
  </section>;
}

function FeaturedRail({ suqs }: { suqs: DiscoverySuq[] }) {
  if (!suqs.length) return null;
  return <section className="discovery-featured" aria-labelledby="featured-suq-title"><div className="discovery-featured-heading"><span id="featured-suq-title">Featured Suqs</span><small>Selected by SuqPage</small></div><div className="discovery-featured-rail">{suqs.map((suq) => <Link key={suq.id} href={`/@${suq.handle}?ref=discovery`}><SuqImage suq={suq} /><span><b>{suq.name}</b><small>{suq.city} · Visit Suq</small></span></Link>)}</div></section>;
}

function SuqImage({ suq }: { suq: DiscoverySuq }) {
  const [failed, setFailed] = useState(false);
  return suq.imagePath && !failed ? <Image src={suq.imagePath} alt="" width={240} height={150} onError={() => setFailed(true)} /> : <span className={`discovery-image-fallback ${suq.fallbackStyle}`} aria-hidden="true"><i>{suq.name.slice(0, 1)}</i><b>{suq.name}</b></span>;
}

function SuqPreview({ suq, source, onClose }: { suq: DiscoverySuq; source: "discovery" | "expo"; onClose: () => void }) {
  return <aside className="discovery-preview" aria-live="polite"><SuqImage suq={suq} /><div><span>{suq.featured ? "Featured · " : ""}{suq.city}</span><h3>{suq.name}</h3><p>{suq.tagline}</p><small>{suq.zone}, {suq.region}</small><Link href={`/@${suq.handle}?ref=${source}`}>Visit Suq</Link></div><button type="button" onClick={onClose} aria-label="Close business preview">×</button></aside>;
}

function DiscoveryList({ suqs }: { suqs: DiscoverySuq[] }) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [suqs]);
  if (!suqs.length) return <div className="discovery-empty"><h3>No Suqs match this search yet.</h3><p>Try another word or choose a different industry.</p></div>;
  const pageSize = 5;
  const pageCount = Math.ceil(suqs.length / pageSize);
  const visible = suqs.slice((page - 1) * pageSize, page * pageSize);
  return <div className="discovery-list-wrap"><div className="discovery-list">{visible.map((suq) => <article key={suq.id}><SuqImage suq={suq} /><div><span>{suq.featured ? "Featured" : "Local Suq"}</span><h3>{suq.name}</h3><p>{suq.tagline}</p><small>{suq.city}, {suq.region}</small></div><Link href={`/@${suq.handle}?ref=discovery`}>Visit Suq</Link></article>)}</div>{pageCount > 1 ? <nav className="discovery-pages" aria-label="Suq list pages"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>Next</button></nav> : null}</div>;
}

function boothPosition(index: number, total: number): CSSProperties {
  const positions = [[1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [3, 1], [2, 1]];
  const perimeterIndex = total >= positions.length ? index : Math.floor(index * positions.length / total);
  const [row, column] = positions[perimeterIndex];
  return { gridRow: row, gridColumn: column };
}

function DailyExpo({ expo }: { expo: DailyIndustryExpo }) {
  const [hall, setHall] = useState(1);
  const [selected, setSelected] = useState<ExpoBooth | null>(null);
  useEffect(() => { setHall(1); setSelected(null); }, [expo.title]);
  const hallBooths = expo.booths.filter((booth) => booth.hall === hall);
  return <section className="daily-expo" aria-labelledby="daily-expo-title">
    <header className="daily-expo-head"><div><span className="discovery-kicker">Open every day · Country-wide</span><h2 id="daily-expo-title">{expo.title}</h2><p>Walk one focused virtual floor, meet businesses from across Ethiopia, and continue into any permanent Suq.</p></div><div className="expo-hall-controls" role="group" aria-label="Expo halls">{Array.from({ length: expo.hallCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-pressed={hall === number} onClick={() => { setHall(number); setSelected(null); }}>Hall {number}</button>)}</div></header>
    {hallBooths.length ? <div className="expo-floor-wrap"><div className="expo-floor" aria-label={`${expo.title}, Hall ${hall}`}>
      <div className="expo-center" aria-hidden="true"><span className="expo-canopy" /><i className="expo-planter expo-planter-one" /><i className="expo-planter expo-planter-two" /><i className="expo-planter expo-planter-three" /><strong>{expo.industryCode}</strong><small>Maker Expo</small></div>
      <span className="expo-entrance">Hall {hall} entrance</span>
      {hallBooths.map((booth, index) => <button key={booth.id} type="button" style={boothPosition(index, hallBooths.length)} className={`expo-booth${selected?.id === booth.id ? " selected" : ""}`} onClick={() => setSelected(booth)} aria-label={`${booth.reference}, ${booth.name}`}><SuqImage suq={booth} /><span><b>{booth.reference}</b><strong>{booth.name}</strong></span></button>)}
    </div>{selected ? <SuqPreview suq={selected} source="expo" onClose={() => setSelected(null)} /> : null}</div> : <div className="discovery-empty"><h3>This Expo floor is being prepared.</h3><p>Choose another industry or clear the search to see more Suqs.</p></div>}
  </section>;
}
