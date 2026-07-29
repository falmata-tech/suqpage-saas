"use client";

import Link from "next/link";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import {
  zoom,
  zoomIdentity,
  type ZoomBehavior,
  type ZoomTransform,
} from "d3-zoom";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CurrentExpoView,
  ExpoBoothView,
  ExpoHubView,
} from "@/lib/expo";

const MAP_WIDTH = 900;
const MAP_HEIGHT = 710;

type RegionFeature = {
  type: "Feature";
  properties: {
    name: string;
    centroid: [number, number];
    code: string;
  };
  geometry: GeoPermissibleObjects;
};

type RegionCollection = {
  type: "FeatureCollection";
  features: RegionFeature[];
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

export default function ExpoMap({
  expo,
  embedded = false,
}: {
  expo: CurrentExpoView;
  embedded?: boolean;
}) {
  const [view, setView] = useState<"map" | "list">("map");
  const [regions, setRegions] = useState<RegionCollection | null>(null);
  const [zones, setZones] = useState<MapCollection | null>(null);
  const [places, setPlaces] = useState<MapCollection | null>(null);
  const [roads, setRoads] = useState<MapCollection | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedHubKey, setSelectedHubKey] = useState("");
  const [selectedBoothId, setSelectedBoothId] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapGroupRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("suqpage-expo-view");
    if (saved === "map" || saved === "list") setView(saved);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("suqpage-expo-view", view);
  }, [view]);

  useEffect(() => {
    let active = true;
    fetch("/geo/ethiopia-admin1-2023.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("Map data unavailable");
        return response.json() as Promise<RegionCollection>;
      })
      .then((data) => {
        if (active) setRegions(data);
      })
      .catch(() => {
        if (active) setMapFailed(true);
      });
    fetch("/geo/ethiopia-admin2-2023.geojson")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data) setZones(data as MapCollection);
      })
      .catch(() => {});
    fetch("/geo/ethiopia-places-osm.geojson")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data) setPlaces(data as MapCollection);
      })
      .catch(() => {});
    fetch("/geo/ethiopia-major-roads-osm.geojson")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data) setRoads(data as MapCollection);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const projection = useMemo(() => {
    if (!regions) return null;
    return geoMercator().fitExtent(
      [[54, 38], [MAP_WIDTH - 54, MAP_HEIGHT - 42]],
      regions as unknown as GeoPermissibleObjects,
    );
  }, [regions]);

  const path = useMemo(() => projection ? geoPath(projection) : null, [projection]);
  const selectedBooth = selectedBoothId === null
    ? null
    : expo.booths.find((booth) => booth.id === selectedBoothId) || null;
  const selectedHub = expo.map.hubs.find((hub) => hub.key === selectedHubKey) || null;
  const selectedHubBooths = selectedHub
    ? expo.booths.filter((booth) => booth.hubKey === selectedHub.key)
    : [];

  useEffect(() => {
    const svg = svgRef.current;
    const group = mapGroupRef.current;
    if (!svg || !group || !projection) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 7])
      .extent([[0, 0], [MAP_WIDTH, MAP_HEIGHT]])
      .translateExtent([[-80, -70], [MAP_WIDTH + 80, MAP_HEIGHT + 70]])
      .on("zoom", (event: { transform: ZoomTransform }) => {
        select(group).attr("transform", event.transform.toString());
        setZoomLevel(event.transform.k);
      });
    zoomBehaviorRef.current = behavior;
    const svgSelection = select(svg);
    svgSelection.call(behavior).on("dblclick.zoom", null);
    return () => {
      svgSelection.on(".zoom", null);
      zoomBehaviorRef.current = null;
    };
  }, [projection]);

  function animateTo(transform: ZoomTransform) {
    const svg = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svg || !behavior) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selection = select(svg);
    if (reduceMotion) {
      selection.call(behavior.transform, transform);
      return;
    }
    selection
      .transition()
      .duration(420)
      .call(behavior.transform, transform);
  }

  function framePoint(longitude: number, latitude: number, scale = 3.5) {
    const point = projection?.([longitude, latitude]);
    if (!point) return;
    animateTo(
      zoomIdentity
        .translate(MAP_WIDTH / 2, MAP_HEIGHT / 2)
        .scale(scale)
        .translate(-point[0], -point[1]),
    );
  }

  function selectHub(hubKey: string) {
    setSelectedHubKey(hubKey);
    setSelectedBoothId(null);
  }

  function viewEthiopia() {
    setSelectedHubKey("");
    setSelectedBoothId(null);
    animateTo(zoomIdentity);
  }

  function centerActiveExpos() {
    if (!projection || !expo.map.hubs.length) return;
    if (expo.map.hubs.length === 1) {
      const hub = expo.map.hubs[0];
      framePoint(hub.longitude, hub.latitude);
      return;
    }
    const points = expo.map.hubs
      .map((hub) => projection([hub.longitude, hub.latitude]))
      .filter((point): point is [number, number] => Boolean(point));
    const minX = Math.min(...points.map((point) => point[0]));
    const maxX = Math.max(...points.map((point) => point[0]));
    const minY = Math.min(...points.map((point) => point[1]));
    const maxY = Math.max(...points.map((point) => point[1]));
    const width = Math.max(80, maxX - minX);
    const height = Math.max(80, maxY - minY);
    const scale = Math.max(1.25, Math.min(4.5, 0.64 / Math.max(width / MAP_WIDTH, height / MAP_HEIGHT)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setSelectedHubKey("");
    animateTo(
      zoomIdentity
        .translate(MAP_WIDTH / 2, MAP_HEIGHT / 2)
        .scale(scale)
        .translate(-centerX, -centerY),
    );
  }

  function zoomBy(factor: number) {
    const svg = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svg || !behavior) return;
    select(svg)
      .transition()
      .duration(240)
      .call(behavior.scaleBy, factor);
  }

  if (expo.status === "unavailable") {
    return (
      <section className="expo-empty" aria-labelledby="expo-unavailable-title">
        <h2 id="expo-unavailable-title">Expo unavailable</h2>
        <p>The daily Expo schedule is not configured yet. Permanent showrooms remain available.</p>
        <Link className="btn brand" href="/#showrooms">View showrooms</Link>
      </section>
    );
  }

  if (expo.status === "empty") {
    return (
      <section className="expo-empty" aria-labelledby="expo-empty-title">
        <h2 id="expo-empty-title">Today&apos;s Expo is preparing its booths</h2>
        <p>Participating businesses need approved booth media and verified locations. Their permanent showrooms remain open.</p>
        <Link className="btn brand" href="/#showrooms">View showrooms</Link>
      </section>
    );
  }

  return (
    <section
      className={`expo-explorer${embedded ? " expo-explorer-embedded" : ""}`}
      aria-labelledby="expo-title"
    >
      <div className="expo-heading">
        <div>
          <span className="expo-kicker">Live daily Expo</span>
          <h2 id="expo-title">{expo.themeName}</h2>
          <p>
            {expo.map.hubs.length} host {expo.map.hubs.length === 1 ? "city" : "cities"} welcoming{" "}
            {expo.booths.length} {expo.booths.length === 1 ? "business" : "businesses"} today.
          </p>
        </div>
        <div className="expo-tabs" role="tablist" aria-label="Expo view">
          <button
            type="button"
            role="tab"
            aria-selected={view === "map"}
            className={view === "map" ? "active" : ""}
            onClick={() => setView("map")}
          >
            Map View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
          >
            List View
          </button>
        </div>
      </div>

      {view === "map" ? (
        <div className="expo-map-shell">
          <div className="expo-commandbar">
            <label className="expo-hub-select">
              <span>Jump to a host city</span>
              <select
                value={selectedHubKey}
                onChange={(event) => {
                  if (event.target.value) selectHub(event.target.value);
                  else viewEthiopia();
                }}
              >
                <option value="">Ethiopia · all active Expos</option>
                {expo.map.hubs.map((hub) => (
                  <option key={hub.key} value={hub.key}>
                    {hub.city}, {hub.zone} · {hub.boothCount} booths
                  </option>
                ))}
              </select>
            </label>
            {selectedHub ? (
              <div className="expo-map-controls" aria-label="Expo venue controls">
                <button type="button" className="expo-country-return" onClick={viewEthiopia}>
                  View Ethiopia
                </button>
              </div>
            ) : (
              <div className="expo-map-controls" aria-label="Expo map controls">
                <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => zoomBy(1.4)}>+</button>
                <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.4)}>−</button>
                <button type="button" onClick={centerActiveExpos}>Center today&apos;s Expos</button>
                <button type="button" onClick={viewEthiopia}>View Ethiopia</button>
              </div>
            )}
          </div>

          {selectedHub ? (
            <ExpoVenue
              key={selectedHub.key}
              hub={selectedHub}
              booths={selectedHubBooths}
              selectedBoothId={selectedBoothId}
              onSelectBooth={setSelectedBoothId}
            />
          ) : mapFailed ? (
            <div className="expo-map-failed">
              <p>The visual map could not load.</p>
              <button type="button" onClick={() => setView("list")}>Open Expo List</button>
            </div>
          ) : (
            <div className="expo-map-stage">
              {!regions || !projection || !path ? (
                <div className="expo-map-loading">Loading Expo map…</div>
              ) : (
                <svg
                  ref={svgRef}
                  className="expo-map"
                  viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                  role="img"
                  aria-label="Interactive map of Ethiopia showing today's host cities"
                  onKeyDown={(event) => {
                    if (event.key === "+" || event.key === "=") zoomBy(1.4);
                    if (event.key === "-") zoomBy(1 / 1.4);
                    if (event.key === "0") viewEthiopia();
                  }}
                  tabIndex={0}
                >
                  <rect className="expo-map-background" width={MAP_WIDTH} height={MAP_HEIGHT} />
                  <g ref={mapGroupRef}>
                    <g className="expo-regions">
                      {regions.features.map((feature) => (
                        <path
                          key={feature.properties.code || feature.properties.name}
                          d={path(feature as unknown as GeoPermissibleObjects) || undefined}
                          data-region={feature.properties.name}
                        />
                      ))}
                    </g>
                    {zones ? (
                      <g className="expo-zones">
                        {zones.features.map((feature) => (
                          <path
                            key={String(feature.properties.code || feature.properties.name)}
                            d={path(feature as unknown as GeoPermissibleObjects) || undefined}
                          />
                        ))}
                      </g>
                    ) : null}
                    {roads ? (
                      <g className="expo-roads" aria-hidden="true">
                        {roads.features.map((feature, index) => (
                          <path
                            key={`${String(feature.properties.ref || feature.properties.name)}-${index}`}
                            d={path(feature as unknown as GeoPermissibleObjects) || undefined}
                          />
                        ))}
                      </g>
                    ) : null}
                    {zoomLevel < 1.7 ? (
                      <g className="expo-region-labels" aria-hidden="true">
                        {regions.features.map((feature) => {
                          const point = projection(feature.properties.centroid);
                          if (!point) return null;
                          return (
                            <text
                              key={feature.properties.name}
                              transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`}
                            >
                              {feature.properties.name}
                            </text>
                          );
                        })}
                      </g>
                    ) : null}
                    {places ? (
                      <g className="expo-place-labels" aria-hidden="true">
                        {places.features
                          .filter((feature) =>
                            zoomLevel >= 2 ||
                            feature.properties.place === "city")
                          .slice(0, zoomLevel >= 2 ? 80 : 18)
                          .map((feature) => {
                            const coordinates = (
                              feature.geometry as { coordinates?: [number, number] }
                            ).coordinates;
                            const point = coordinates ? projection(coordinates) : null;
                            if (!point) return null;
                            const conflictsWithHost = expo.map.hubs.some((hub) => {
                              const hostPoint = projection([hub.longitude, hub.latitude]);
                              return hostPoint &&
                                Math.hypot(point[0] - hostPoint[0], point[1] - hostPoint[1]) <
                                  52 / zoomLevel;
                            });
                            if (conflictsWithHost) return null;
                            return (
                              <g
                                key={`${String(feature.properties.name)}-${coordinates?.join("-")}`}
                                transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`}
                              >
                                <circle r="2.6" />
                                <text x="5" y="3">{String(feature.properties.name)}</text>
                              </g>
                            );
                          })}
                      </g>
                    ) : null}
                    <g className="expo-hubs">
                      {expo.map.hubs.map((hub) => (
                        <HubMarker
                          key={hub.key}
                          hub={hub}
                          projection={projection}
                          zoomLevel={zoomLevel}
                          selected={selectedHubKey === hub.key}
                          onSelect={() => selectHub(hub.key)}
                        />
                      ))}
                    </g>
                  </g>
                </svg>
              )}
              <div className="expo-map-attribution">
                Boundaries: FEWS NET, 2023 · Places and roads: OpenStreetMap contributors
              </div>
            </div>
          )}

          {selectedBooth ? (
            <BoothPreview booth={selectedBooth} onClose={() => setSelectedBoothId(null)} />
          ) : null}
        </div>
      ) : (
        <ExpoList booths={expo.booths} />
      )}
    </section>
  );
}

function HubMarker({
  hub,
  projection,
  zoomLevel,
  selected,
  onSelect,
}: {
  hub: ExpoHubView;
  projection: ReturnType<typeof geoMercator>;
  zoomLevel: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const point = projection([hub.longitude, hub.latitude]);
  if (!point) return null;
  return (
    <g
      className={`expo-hub${selected ? " selected" : ""}`}
      transform={`translate(${point[0]} ${point[1]}) scale(${1 / zoomLevel})`}
      role="button"
      tabIndex={0}
      aria-label={`${hub.city} Expo, ${hub.boothCount} booths`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
    >
      <circle r="27" />
      <circle className="expo-hub-core" r="18" />
      <text className="expo-hub-count" textAnchor="middle" y="5">{hub.boothCount}</text>
      <text className="expo-hub-name" textAnchor="middle" y="48">{hub.city}</text>
    </g>
  );
}

function ExpoVenue({
  hub,
  booths,
  selectedBoothId,
  onSelectBooth,
}: {
  hub: ExpoHubView;
  booths: ExpoBoothView[];
  selectedBoothId: number | null;
  onSelectBooth: (id: number) => void;
}) {
  const [hallNumber, setHallNumber] = useState(1);
  const halls = [...new Set(booths.map((booth) => booth.hallNumber))];
  const hallBooths = booths.filter((booth) => booth.hallNumber === hallNumber);
  const desktopRows = Math.max(1, Math.ceil(hallBooths.length / 4));
  const mobileRows = Math.max(1, Math.ceil(hallBooths.length / 2));
  const venueStyle = {
    "--venue-desktop-height": `${140 + desktopRows * 174 + (desktopRows - 1) * 18}px`,
    "--venue-mobile-height": `${130 + mobileRows * 152 + (mobileRows - 1) * 12}px`,
    "--venue-desktop-rows": desktopRows,
    "--venue-mobile-rows": mobileRows,
  } as CSSProperties;
  return (
    <section className="expo-venue" aria-labelledby="expo-venue-title">
      <header className="expo-venue-header">
        <div>
          <span className="expo-kicker">Today&apos;s host city</span>
          <h3 id="expo-venue-title">{hub.city} Expo</h3>
          <p>{hub.zone}, {hub.region} · {booths.length} participating showrooms</p>
        </div>
        {halls.length > 1 ? (
          <div className="expo-hall-tabs" aria-label="Expo halls">
            {halls.map((hall) => (
              <button
                key={hall}
                type="button"
                aria-pressed={hallNumber === hall}
                onClick={() => setHallNumber(hall)}
              >
                Hall {hall}
              </button>
            ))}
          </div>
        ) : (
          <span className="expo-hall-badge">Hall 1</span>
        )}
      </header>

      <div className="expo-venue-shell" style={venueStyle}>
        <div className="expo-venue-entrance">
          <span>Entrance</span>
          <strong>Reception</strong>
          <small>You are here</small>
        </div>
        <div className="expo-venue-floor" data-booth-count={hallBooths.length}>
          <div className="expo-venue-aisle" aria-hidden="true">
            <span>Hall {hallNumber}</span>
          </div>
          {hallBooths.map((booth, index) => (
            <VenueBooth
              key={booth.id}
              booth={booth}
              index={index}
              hallBoothCount={hallBooths.length}
              selected={selectedBoothId === booth.id}
              onSelect={() => onSelectBooth(booth.id)}
            />
          ))}
        </div>
        <div className="expo-venue-exits" aria-hidden="true">
          <span>Exit A</span>
          <span>Exit B</span>
        </div>
      </div>
    </section>
  );
}

function VenueBooth({
  booth,
  index,
  hallBoothCount,
  selected,
  onSelect,
}: {
  booth: ExpoBoothView;
  index: number;
  hallBoothCount: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const desktopColumnsByRowSize: Record<number, number[]> = {
    1: [2],
    2: [2, 4],
    3: [1, 2, 4],
    4: [1, 2, 4, 5],
  };
  const desktopRow = Math.floor(index / 4) + 1;
  const desktopRowStart = (desktopRow - 1) * 4;
  const desktopRowSize = Math.min(4, hallBoothCount - desktopRowStart);
  const mobileRow = Math.floor(index / 2) + 1;
  const boothStyle = {
    "--booth-desktop-column":
      desktopColumnsByRowSize[desktopRowSize][index - desktopRowStart],
    "--booth-desktop-row": desktopRow,
    "--booth-mobile-column": index % 2 === 0 ? 1 : 3,
    "--booth-mobile-row": mobileRow,
  } as CSSProperties;
  return (
    <button
      type="button"
      className={`expo-venue-booth${selected ? " selected" : ""}`}
      style={boothStyle}
      aria-label={`Select ${booth.name}, ${booth.boothReference}`}
      onClick={onSelect}
    >
      <BoothImage booth={booth} />
      <span className="expo-venue-booth-copy">
        <small>{booth.boothReference}</small>
        <strong>{booth.name}</strong>
      </span>
    </button>
  );
}

function BoothImage({ booth }: { booth: ExpoBoothView }) {
  const [failed, setFailed] = useState(false);
  if (failed || !booth.imageUrl) {
    return (
      <span className="expo-image-fallback" aria-hidden="true">
        <strong>{booth.name.slice(0, 1)}</strong>
        <small>{booth.name}</small>
      </span>
    );
  }
  return <img src={booth.imageUrl} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

function BoothPreview({
  booth,
  onClose,
}: {
  booth: ExpoBoothView;
  onClose: () => void;
}) {
  return (
    <aside className="expo-preview" aria-label={`${booth.name} booth preview`}>
      <button type="button" className="expo-preview-close" aria-label="Close booth preview" onClick={onClose}>×</button>
      <BoothImage booth={booth} />
      <div className="expo-preview-copy">
        <div className="expo-preview-meta">
          <span>{booth.boothReference}</span>
          {booth.featured ? <span>Featured</span> : null}
        </div>
        <p className="expo-preview-industry">{booth.industryLabel}</p>
        <h3>{booth.name}</h3>
        <p className="expo-origin">From {booth.city}, {booth.zone}, {booth.region} · Hosted in {booth.hubCity}</p>
        <p>{booth.description}</p>
        <Link className="expo-showroom-action" href={`/@${booth.handle}`}>Enter showroom</Link>
      </div>
    </aside>
  );
}

function ExpoList({ booths }: { booths: ExpoBoothView[] }) {
  return (
    <div className="expo-list" aria-label="Expo List View">
      {booths.map((booth) => (
        <article key={booth.id} className="expo-list-card">
          <BoothImage booth={booth} />
          <div>
            <div className="expo-preview-meta">
              <span>{booth.boothReference}</span>
              {booth.featured ? <span>Featured</span> : null}
            </div>
            <p className="expo-preview-industry">{booth.industryLabel}</p>
            <h3>{booth.name}</h3>
            <p className="expo-origin">From {booth.city}, {booth.zone}, {booth.region} · Hosted in {booth.hubCity}</p>
            <p>{booth.description}</p>
          </div>
          <Link className="expo-showroom-action" href={`/@${booth.handle}`}>Enter showroom</Link>
        </article>
      ))}
    </div>
  );
}
