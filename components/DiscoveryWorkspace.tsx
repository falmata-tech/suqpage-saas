"use client";

import Image from "next/image";
import Link from "next/link";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CitySuq, DiscoveryBooth, DiscoveryView } from "@/lib/discovery";

const MAP_WIDTH = 900;
const MAP_HEIGHT = 650;

type MapFeature = {
  type: "Feature";
  properties: Record<string, string | number | [number, number]>;
  geometry: GeoPermissibleObjects;
};

type MapCollection = {
  type: "FeatureCollection";
  features: MapFeature[];
};

const iconPath: Record<string, string> = {
  circuit: "M4 4h6v6H4zM14 14h6v6h-6zM10 7h4v10h-4M7 10v4h10",
  leaf: "M19 4C11 4 5 8 5 15c4 1 9-1 12-5-3 4-7 6-12 7M5 20c1-6 5-10 11-13",
  sprout: "M12 21v-9M12 14c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 11c0-4 3-7 8-7 0 5-3 8-8 8",
  tool: "M14 6 6 14l4 4 8-8M15 3l6 6-3 3-6-6zM4 16l4 4-2 2H2v-4z",
  home: "M3 11 12 4l9 7v9h-6v-6H9v6H3z",
  thread: "M7 4h10v4H7zM8 8h8l2 12H6zM9 12h6M8 16h8",
};

function IndustryIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPath[name] || iconPath.home} />
    </svg>
  );
}

export default function DiscoveryWorkspace({
  discovery,
  embedded = false,
}: {
  discovery: DiscoveryView;
  embedded?: boolean;
}) {
  const [view, setView] = useState<"map" | "list">("map");
  const [regions, setRegions] = useState<MapCollection | null>(null);
  const [zones, setZones] = useState<MapCollection | null>(null);
  const [places, setPlaces] = useState<MapCollection | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedHostKey, setSelectedHostKey] = useState("");
  const [selectedBoothId, setSelectedBoothId] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    setSelectedHostKey("");
    setSelectedBoothId(null);
  }, [discovery.industry.key, discovery.query]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/geo/ethiopia-admin1-2023.geojson").then((response) => {
        if (!response.ok) throw new Error("Map unavailable");
        return response.json() as Promise<MapCollection>;
      }),
      fetch("/geo/ethiopia-admin2-2023.geojson").then((response) => response.ok ? response.json() as Promise<MapCollection> : null),
      fetch("/geo/ethiopia-places-osm.geojson").then((response) => response.ok ? response.json() as Promise<MapCollection> : null),
    ]).then(([regionData, zoneData, placeData]) => {
      if (!active) return;
      setRegions(regionData);
      setZones(zoneData);
      setPlaces(placeData);
    }).catch(() => {
      if (active) setMapFailed(true);
    });
    return () => { active = false; };
  }, []);

  const projection = useMemo(() => regions
    ? geoMercator().fitExtent(
      [[52, 34], [MAP_WIDTH - 52, MAP_HEIGHT - 34]],
      regions as unknown as GeoPermissibleObjects,
    )
    : null, [regions]);
  const path = useMemo(() => projection ? geoPath(projection) : null, [projection]);
  const selectedHost = discovery.hosts.find((host) => host.key === selectedHostKey) || null;
  const selectedBooth = discovery.booths.find((booth) => booth.id === selectedBoothId) || null;
  const selectedHostBooths = selectedHost
    ? discovery.booths.filter((booth) => booth.hostKey === selectedHost.key)
    : [];
  const featuredBooths = discovery.booths.filter((booth) => booth.featured).slice(0, 5);

  useEffect(() => {
    if (!svgRef.current || !groupRef.current || !projection) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 6])
      .extent([[0, 0], [MAP_WIDTH, MAP_HEIGHT]])
      .translateExtent([[-70, -60], [MAP_WIDTH + 70, MAP_HEIGHT + 60]])
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      selection.call(zoomRef.current.transform, transform);
    } else {
      selection.transition().duration(360).call(zoomRef.current.transform, transform);
    }
  }

  function frameHost(host: CitySuq) {
    const point = projection?.([host.longitude, host.latitude]);
    if (!point) return;
    animate(zoomIdentity.translate(MAP_WIDTH / 2, MAP_HEIGHT / 2).scale(4.2).translate(-point[0], -point[1]));
  }

  function openHost(key: string) {
    const host = discovery.hosts.find((candidate) => candidate.key === key);
    if (!host) return;
    setSelectedHostKey(host.key);
    setSelectedBoothId(null);
    frameHost(host);
  }

  function resetMap() {
    setSelectedHostKey("");
    setSelectedBoothId(null);
    animate(zoomIdentity);
  }

  function zoomBy(factor: number) {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(220).call(zoomRef.current.scaleBy, factor);
  }

  const action = embedded ? "/" : "/discover";
  return (
    <section className="discovery" id="discover" aria-labelledby="discovery-title">
      <div className="discovery-switcher">
        <div className="discovery-switcher-head">
          <div>
            <span className="discovery-kicker">Find makers across Ethiopia</span>
            <h2 id="discovery-title">Choose what you want to discover.</h2>
          </div>
          <p>Each business has a permanent Suq with its products, story, and direct inquiry.</p>
        </div>
        <nav className="discovery-industries" aria-label="Industries">
          {discovery.industries.map((industry) => (
            <Link
              key={industry.key}
              className={industry.key === discovery.industry.key ? "active" : ""}
              href={`${action}?industry=${encodeURIComponent(industry.key)}#discover`}
              aria-current={industry.key === discovery.industry.key ? "page" : undefined}
            >
              <IndustryIcon name={industry.icon} />
              <span>{industry.label}</span>
            </Link>
          ))}
        </nav>
        <form className="discovery-search" action={action} method="get">
          <input type="hidden" name="industry" value={discovery.industry.key} />
          <label>
            <span className="sr-only">Search this industry</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg>
            <input name="q" defaultValue={discovery.query} maxLength={80} placeholder="Search a business, product, craft, or place" />
          </label>
          <button type="submit">Search</button>
          {discovery.query ? <Link href={`${action}?industry=${discovery.industry.key}#discover`}>Clear</Link> : null}
        </form>
        <FeaturedRail booths={featuredBooths} />
      </div>

      <div className="discovery-summary">
        <div>
          <span className="discovery-kicker">{discovery.industry.label}</span>
          <strong>{discovery.total} Suqs in {discovery.hosts.length} {discovery.hosts.length === 1 ? "city" : "cities"}</strong>
          <small>{discovery.featuredCount} featured in this view</small>
        </div>
        <div className="discovery-tabs" role="tablist" aria-label="Discovery view">
          <button type="button" role="tab" aria-selected={view === "map"} className={view === "map" ? "active" : ""} onClick={() => setView("map")}>Map</button>
          <button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List</button>
        </div>
      </div>

      {view === "list" ? (
        <DiscoveryList booths={discovery.booths} />
      ) : (
        <div className="discovery-map-shell">
          <div className="discovery-map-tools">
            <div className="discovery-city-picker">
              <span>Explore a City Suq</span>
              <div role="group" aria-label="City Suqs">
                <button type="button" aria-pressed={!selectedHost} onClick={resetMap}>All Ethiopia</button>
                {discovery.hosts.map((host) => <button key={host.key} type="button" aria-pressed={selectedHostKey === host.key} onClick={() => openHost(host.key)}><strong>{host.city}</strong><small>{host.boothCount} Suqs</small></button>)}
              </div>
            </div>
            {!selectedHost ? <div className="discovery-zoom" aria-label="Map controls">
              <button type="button" onClick={() => zoomBy(1.35)} title="Zoom in" aria-label="Zoom in">+</button>
              <button type="button" onClick={() => zoomBy(1 / 1.35)} title="Zoom out" aria-label="Zoom out">-</button>
              <button type="button" onClick={resetMap} title="Center City Suqs" aria-label="Center City Suqs">◎</button>
            </div> : null}
          </div>
          <div className={`discovery-map-stage${selectedHost ? " city-open" : ""}`}>
            {mapFailed ? <div className="discovery-map-fallback"><p>The map could not load, but every Suq is still available.</p><button type="button" onClick={() => setView("list")}>Open list</button></div> : null}
            {!mapFailed && !path ? <div className="discovery-map-loading">Loading Ethiopia map...</div> : null}
            {!mapFailed && path && projection ? (
              <svg ref={svgRef} className="discovery-map" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Interactive Ethiopia map with City Suqs" tabIndex={selectedHost ? -1 : 0}>
                <rect className="discovery-map-bg" width={MAP_WIDTH} height={MAP_HEIGHT} />
                <g ref={groupRef}>
                  <g className="discovery-regions">{regions?.features.map((feature, index) => <path key={`${String(feature.properties.name)}-${index}`} d={path(feature as unknown as GeoPermissibleObjects) || undefined} />)}</g>
                  <g className="discovery-zones">{zones?.features.map((feature, index) => <path key={`${String(feature.properties.name)}-${index}`} d={path(feature as unknown as GeoPermissibleObjects) || undefined} />)}</g>
                  {zoomLevel >= 1.8 ? <g className="discovery-places">{places?.features.filter((feature) => feature.properties.place === "city").slice(0, 26).map((feature, index) => {
                    const coordinates = (feature.geometry as { coordinates?: [number, number] }).coordinates;
                    const point = coordinates ? projection(coordinates) : null;
                    return point ? <text key={`${String(feature.properties.name)}-${index}`} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`}>{String(feature.properties.name)}</text> : null;
                  })}</g> : null}
                  <g className="discovery-hubs">{discovery.hosts.map((host) => {
                    const point = projection([host.longitude, host.latitude]);
                    return point ? <g key={host.key} className={selectedHostKey === host.key ? "selected" : ""} transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`} role="button" tabIndex={0} aria-label={`${host.city} City Suq, ${host.boothCount} businesses`} onClick={() => openHost(host.key)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openHost(host.key); }}><circle className="hub-pulse" r="27" /><circle className="hub-core" r="18" /><text className="hub-count" textAnchor="middle" y="5">{host.boothCount}</text><text className="hub-name" textAnchor="middle" y="47">{host.city}</text></g> : null;
                  })}</g>
                </g>
              </svg>
            ) : null}
            {selectedHost ? <CityVenue host={selectedHost} booths={selectedHostBooths} selectedBoothId={selectedBoothId} onSelectBooth={setSelectedBoothId} onClose={resetMap} /> : null}
            <span className="discovery-attribution">Boundaries: FEWS NET · Places: OpenStreetMap contributors</span>
          </div>
          {selectedBooth ? <BoothPreview booth={selectedBooth} onClose={() => setSelectedBoothId(null)} /> : null}
        </div>
      )}
    </section>
  );
}

function boothPosition(index: number, total: number): CSSProperties {
  const positions = [
    [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4],
    [4, 4], [4, 3], [4, 2], [4, 1], [3, 1], [2, 1],
  ];
  const perimeterIndex = total >= positions.length
    ? index
    : Math.floor(index * positions.length / total);
  const [row, column] = positions[perimeterIndex];
  return { gridRow: row, gridColumn: column };
}

function CityVenue({ host, booths, selectedBoothId, onSelectBooth, onClose }: {
  host: CitySuq;
  booths: DiscoveryBooth[];
  selectedBoothId: number | null;
  onSelectBooth: (id: number) => void;
  onClose: () => void;
}) {
  const [hall, setHall] = useState(1);
  useEffect(() => setHall(1), [host.key]);
  const hallBooths = booths.filter((booth) => booth.hall === hall);
  return (
    <section className="city-venue" aria-labelledby="city-venue-title">
      <header>
        <div><span className="discovery-kicker">Permanent city discovery</span><h3 id="city-venue-title">{host.city} City Suq</h3><p>{host.zone}, {host.region} · {host.boothCount} independent businesses</p></div>
        <div className="city-venue-actions">
          {host.hallCount > 1 ? <div className="city-halls" aria-label="City Suq halls">{Array.from({ length: host.hallCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-pressed={hall === number} onClick={() => setHall(number)}>Hall {number}</button>)}</div> : <span>Hall 1</span>}
          <button className="city-close" type="button" onClick={onClose} aria-label={`Close ${host.city} City Suq`} title="Close City Suq">×</button>
        </div>
      </header>
      <div className="city-floor">
        <div className="city-lobby" aria-hidden="true">
          <div className="city-court">
            <i className="city-planter planter-one" /><i className="city-planter planter-two" />
            <i className="city-planter planter-three" /><i className="city-planter planter-four" />
            <span className="city-water" />
            <span className="city-bench bench-one" /><span className="city-bench bench-two" />
          </div>
          <strong>City Suq</strong><span>{host.city} maker court</span>
        </div>
        <span className="city-entrance">Entrance</span>
        {hallBooths.map((booth, index) => <button key={booth.id} type="button" style={boothPosition(index, hallBooths.length)} className={`city-booth${selectedBoothId === booth.id ? " selected" : ""}`} onClick={() => onSelectBooth(booth.id)} aria-label={`${booth.reference}, ${booth.name}`}><BoothImage booth={booth} /><span><b>{booth.reference}</b><strong>{booth.name}</strong></span></button>)}
      </div>
    </section>
  );
}

function FeaturedRail({ booths }: { booths: DiscoveryBooth[] }) {
  if (!booths.length) return null;
  return <section className="discovery-featured" aria-labelledby="featured-suq-title">
    <div className="discovery-featured-heading"><span id="featured-suq-title">Featured Suqs</span><small>Selected by SuqPage</small></div>
    <div className="discovery-featured-rail">{booths.map((booth) => <Link key={booth.id} href={`/@${booth.handle}?ref=discovery`}><BoothImage booth={booth} /><span><b>{booth.name}</b><small>{booth.originCity} · Visit Suq</small></span></Link>)}</div>
  </section>;
}

function BoothImage({ booth }: { booth: DiscoveryBooth }) {
  const [failed, setFailed] = useState(false);
  return booth.imagePath && !failed
    ? <Image src={booth.imagePath} alt="" width={240} height={150} onError={() => setFailed(true)} />
    : <span className={`discovery-image-fallback ${booth.fallbackStyle}`} aria-hidden="true"><i>{booth.name.slice(0, 1)}</i><b>{booth.name}</b></span>;
}

function BoothPreview({ booth, onClose }: { booth: DiscoveryBooth; onClose: () => void }) {
  return <aside className="discovery-preview" aria-live="polite"><BoothImage booth={booth} /><div><span>{booth.reference}{booth.featured ? " · Featured" : ""}</span><h3>{booth.name}</h3><p>{booth.tagline}</p><small>Based in {booth.originCity}, {booth.originRegion}</small><Link href={`/@${booth.handle}?ref=discovery`}>Visit Suq</Link></div><button type="button" onClick={onClose} aria-label="Close business preview">×</button></aside>;
}

function DiscoveryList({ booths }: { booths: DiscoveryBooth[] }) {
  if (!booths.length) return <div className="discovery-empty"><h3>No Suqs match this search yet.</h3><p>Try another word or choose a different industry.</p></div>;
  return <div className="discovery-list">{booths.map((booth) => <article key={booth.id}><BoothImage booth={booth} /><div><span>{booth.reference}{booth.featured ? " · Featured" : ""}</span><h3>{booth.name}</h3><p>{booth.tagline}</p><small>{booth.originCity}, {booth.originRegion}</small></div><Link href={`/@${booth.handle}?ref=discovery`}>Visit Suq</Link></article>)}</div>;
}
