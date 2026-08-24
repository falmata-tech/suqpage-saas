"use client";

import Supercluster from "supercluster";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { DiscoveryNearbyGroup, DiscoveryShowroom } from "@/lib/discovery";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";
import { mapProviderConfig } from "@/lib/map-provider";

const ETHIOPIA_CENTER: [number, number] = [9.145, 40.4897];
const ETHIOPIA_BOUNDS: [[number, number], [number, number]] = [[2.5, 31.5], [15.5, 49.5]];
const DEFAULT_ZOOM = 5;
const NEARBY_GROUP_ZOOM = 14;
const SHOWROOM_DETAIL_ZOOM = 12;
const CLUSTER_MAX_ZOOM = NEARBY_GROUP_ZOOM - 1;

type MapView = {
  center: [number, number];
  zoom: number;
};

type MarkerProperties = {
  showroomId: number;
  sponsored: boolean;
  live: boolean;
  featured: boolean;
};

type ClusterProperties = {
  sponsoredCount: number;
  liveCount: number;
  featuredCount: number;
};

export type MarketplaceMapController = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  centerAt: (latitude: number, longitude: number, zoom?: number) => void;
  getView: () => MapView;
};

type MarketplaceMapProps = {
  showrooms: DiscoveryShowroom[];
  nearbyGroups: DiscoveryNearbyGroup[];
  featuredNowBusinessId: number | null;
  selectedShowroomId: number | null;
  requestedView: MapView | null;
  onViewChange: (view: MapView) => void;
  onOpenNearbyGroup: (group: DiscoveryNearbyGroup) => void;
  onSelectShowroom: (showroom: DiscoveryShowroom) => void;
  onError: () => void;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);
}

function markerLabelLines(name: string, maxLineLength = 13, maxLines = 3) {
  const words = name.trim().split(/\s+/).flatMap((word) =>
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

function presenceFor(showroom: DiscoveryShowroom, featuredNowBusinessId: number | null) {
  if (showroom.id === featuredNowBusinessId) return { kind: "featured", label: "Featured now" } as const;
  if (showroom.isLive && showroom.livePlatform) {
    return { kind: "live", label: `Live on ${LIVE_PLATFORM_LABELS[showroom.livePlatform]}` } as const;
  }
  return { kind: "", label: "" } as const;
}

const MarketplaceMap = forwardRef<MarketplaceMapController, MarketplaceMapProps>(function MarketplaceMap({
  showrooms,
  nearbyGroups,
  featuredNowBusinessId,
  selectedShowroomId,
  requestedView,
  onViewChange,
  onOpenNearbyGroup,
  onSelectShowroom,
  onError,
}, forwardedRef) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  const requestedViewRef = useRef(requestedView);
  const callbackRef = useRef({ onViewChange, onOpenNearbyGroup, onSelectShowroom, onError });
  const dataRef = useRef({ showrooms, nearbyGroups, featuredNowBusinessId, selectedShowroomId });
  const clusterIndex = useMemo(() => {
    const index = new Supercluster<MarkerProperties, ClusterProperties>({
      radius: 52,
      maxZoom: CLUSTER_MAX_ZOOM,
      minPoints: 2,
      map: (properties) => ({
        sponsoredCount: properties.sponsored ? 1 : 0,
        liveCount: properties.live && !properties.featured ? 1 : 0,
        featuredCount: properties.featured ? 1 : 0,
      }),
      reduce: (accumulated, properties) => {
        accumulated.sponsoredCount += properties.sponsoredCount;
        accumulated.liveCount += properties.liveCount;
        accumulated.featuredCount += properties.featuredCount;
      },
    });
    index.load(showrooms.map((showroom) => ({
      type: "Feature" as const,
      properties: {
        showroomId: showroom.id,
        sponsored: showroom.sponsored,
        live: showroom.isLive,
        featured: showroom.id === featuredNowBusinessId,
      },
      geometry: { type: "Point" as const, coordinates: [showroom.longitude, showroom.latitude] },
    })));
    return index;
  }, [featuredNowBusinessId, showrooms]);
  const clusterIndexRef = useRef(clusterIndex);

  callbackRef.current = { onViewChange, onOpenNearbyGroup, onSelectShowroom, onError };
  dataRef.current = { showrooms, nearbyGroups, featuredNowBusinessId, selectedShowroomId };
  clusterIndexRef.current = clusterIndex;
  requestedViewRef.current = requestedView;

  useImperativeHandle(forwardedRef, () => ({
    zoomIn() { mapRef.current?.zoomIn(); },
    zoomOut() { mapRef.current?.zoomOut(); },
    reset() { mapRef.current?.fitBounds(ETHIOPIA_BOUNDS, { animate: true, padding: [12, 12] }); },
    centerAt(latitude, longitude, zoom = 12) { mapRef.current?.setView([latitude, longitude], zoom, { animate: true }); },
    getView() {
      const map = mapRef.current;
      if (!map) return { center: ETHIOPIA_CENTER, zoom: DEFAULT_ZOOM };
      const center = map.getCenter();
      return { center: [center.lat, center.lng], zoom: map.getZoom() };
    },
  }), []);

  useEffect(() => {
    if (!requestedView || !mapRef.current) return;
    mapRef.current.setView(requestedView.center, requestedView.zoom, { animate: false });
  }, [requestedView]);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame = 0;

    void import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;
      const provider = mapProviderConfig();
      map = L.map(containerRef.current, {
        attributionControl: true,
        center: ETHIOPIA_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 5,
        maxZoom: provider.maxZoom,
        maxBounds: ETHIOPIA_BOUNDS,
        maxBoundsViscosity: 0.65,
        zoomControl: false,
        preferCanvas: true,
        wheelDebounceTime: 80,
        wheelPxPerZoomLevel: 100,
        zoomSnap: 1,
      });
      mapRef.current = map;
      map.attributionControl.setPosition("bottomleft");
      if (requestedViewRef.current) {
        map.setView(requestedViewRef.current.center, requestedViewRef.current.zoom, { animate: false });
      }
      markerLayerRef.current = L.layerGroup().addTo(map);
      tileLayerRef.current = L.tileLayer(provider.tileUrlTemplate, {
        attribution: provider.attributionHtml,
        maxNativeZoom: provider.maxNativeZoom,
        maxZoom: provider.maxZoom,
        keepBuffer: 0,
        updateWhenIdle: true,
        updateWhenZooming: false,
        detectRetina: false,
      }).addTo(map);

      const renderMarkers = () => {
        if (!map || !markerLayerRef.current || !containerRef.current) return;
        markerLayerRef.current.clearLayers();
        markerRefs.current = [];
        const data = dataRef.current;
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        const viewport: [number, number, number, number] = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ];
        const showroomById = new Map(data.showrooms.map((showroom) => [showroom.id, showroom]));
        const groupedShowroomIds = new Set(data.nearbyGroups.flatMap((group) => group.showroomIds));
        let mountedMarkerCount = 0;

        const addMarker = (marker: Marker, accessibleName: string) => {
          marker.addTo(markerLayerRef.current!);
          const element = marker.getElement();
          element?.setAttribute("role", "button");
          element?.setAttribute("aria-label", accessibleName);
          markerRefs.current.push(marker);
          mountedMarkerCount += 1;
        };

        if (zoom >= NEARBY_GROUP_ZOOM) {
          for (const group of data.nearbyGroups) {
            if (!bounds.contains([group.latitude, group.longitude])) continue;
            const groupShowrooms = group.showroomIds.map((id) => showroomById.get(id)).filter((item): item is DiscoveryShowroom => Boolean(item));
            const featured = group.showroomIds.includes(data.featuredNowBusinessId || -1);
            const liveCount = groupShowrooms.filter((showroom) => showroom.isLive && showroom.id !== data.featuredNowBusinessId).length;
            const status = featured ? '<span class="mp-map-status mp-map-status-featured">Featured</span>' : liveCount ? `<span class="mp-map-status mp-map-status-live">${liveCount} live</span>` : "";
            const icon = L.divIcon({
              className: "mp-map-div-icon",
              html: `<span class="mp-map-nearby${featured ? " is-featured" : liveCount ? " is-live" : ""}" data-nearby-group-key="${escapeHtml(group.key)}"><b>${group.count}</b><small>Nearby</small>${status}</span>`,
              iconSize: [58, 58],
              iconAnchor: [29, 29],
            });
            const marker = L.marker([group.latitude, group.longitude], {
              icon,
              keyboard: true,
              title: `${group.count} nearby showrooms in ${group.city}`,
              alt: `${group.count} nearby showrooms in ${group.city}`,
              riseOnHover: true,
            }).on("click", () => callbackRef.current.onOpenNearbyGroup(group));
            addMarker(marker, `${group.count} nearby showrooms in ${group.city}. Open nearby showrooms.`);
          }
          for (const showroom of data.showrooms) {
            if (groupedShowroomIds.has(showroom.id) || !bounds.contains([showroom.latitude, showroom.longitude])) continue;
            const presence = presenceFor(showroom, data.featuredNowBusinessId);
            const lines = markerLabelLines(showroom.name).map((line) => `<span>${escapeHtml(line)}</span>`).join("");
            const status = presence.kind ? `<em class="mp-map-status mp-map-status-${presence.kind}">${escapeHtml(presence.kind === "featured" ? "Featured" : "Live")}</em>` : "";
            const icon = L.divIcon({
              className: "mp-map-div-icon",
              html: `<span class="mp-map-showroom${data.selectedShowroomId === showroom.id ? " is-selected" : ""}${presence.kind ? ` is-${presence.kind}` : ""}" data-showroom-id="${showroom.id}" data-latitude="${showroom.latitude}" data-longitude="${showroom.longitude}"${presence.kind ? ` data-presence="${presence.kind}"` : ""}><i class="mp-map-storefront" aria-hidden="true"><i></i></i><b>${lines}</b>${status}</span>`,
              iconSize: [96, 74],
              iconAnchor: [48, 31],
            });
            const marker = L.marker([showroom.latitude, showroom.longitude], {
              icon,
              keyboard: true,
              title: showroom.name,
              alt: `${showroom.name}, ${showroom.primaryIndustryLabel}, ${showroom.city}`,
              riseOnHover: true,
            }).on("click", () => callbackRef.current.onSelectShowroom(showroom));
            addMarker(marker, `${showroom.name}, ${showroom.primaryIndustryLabel}, ${showroom.city}. Open business preview.`);
          }
        } else {
          const markers = clusterIndexRef.current.getClusters(viewport, zoom);
          for (const feature of markers) {
            const [longitude, latitude] = feature.geometry.coordinates;
            if ("cluster_id" in feature.properties) {
              const clusterId = feature.properties.cluster_id;
              const featuredCount = feature.properties.featuredCount || 0;
              const liveCount = feature.properties.liveCount || 0;
              const status = featuredCount ? '<span class="mp-map-status mp-map-status-featured">Featured</span>' : liveCount ? `<span class="mp-map-status mp-map-status-live">${liveCount} live</span>` : "";
              const icon = L.divIcon({
                className: "mp-map-div-icon",
                html: `<span class="mp-map-cluster${featuredCount ? " is-featured" : liveCount ? " is-live" : ""}"><b>${feature.properties.point_count}</b>${status}</span>`,
                iconSize: [46, 46],
                iconAnchor: [23, 23],
              });
              const marker = L.marker([latitude, longitude], {
                icon,
                keyboard: true,
                title: `${feature.properties.point_count} nearby showrooms`,
                alt: `${feature.properties.point_count} nearby showrooms. Zoom to reveal.`,
              }).on("click", () => {
                const expansionZoom = clusterIndexRef.current.getClusterExpansionZoom(clusterId);
                map?.setView([latitude, longitude], Math.min(expansionZoom, NEARBY_GROUP_ZOOM), { animate: true });
              });
              addMarker(marker, `${feature.properties.point_count} nearby showrooms. Zoom to reveal.`);
              continue;
            }
            const showroom = showroomById.get(feature.properties.showroomId);
            if (!showroom) continue;
            const presence = presenceFor(showroom, data.featuredNowBusinessId);
            const lines = markerLabelLines(showroom.name).map((line) => `<span>${escapeHtml(line)}</span>`).join("");
            const status = presence.kind ? `<em class="mp-map-status mp-map-status-${presence.kind}">${escapeHtml(presence.kind === "featured" ? "Featured" : "Live")}</em>` : "";
            const icon = L.divIcon({
              className: "mp-map-div-icon",
              html: `<span class="mp-map-showroom${data.selectedShowroomId === showroom.id ? " is-selected" : ""}${presence.kind ? ` is-${presence.kind}` : ""}" data-showroom-id="${showroom.id}" data-latitude="${showroom.latitude}" data-longitude="${showroom.longitude}"${presence.kind ? ` data-presence="${presence.kind}"` : ""}><i class="mp-map-storefront" aria-hidden="true"><i></i></i><b>${lines}</b>${status}</span>`,
              iconSize: [96, 74],
              iconAnchor: [48, 31],
            });
            const marker = L.marker([latitude, longitude], {
              icon,
              keyboard: true,
              title: showroom.name,
              alt: `${showroom.name}, ${showroom.primaryIndustryLabel}, ${showroom.city}`,
              riseOnHover: true,
            }).on("click", () => {
              if ((map?.getZoom() || 0) < SHOWROOM_DETAIL_ZOOM) {
                map?.setView([latitude, longitude], SHOWROOM_DETAIL_ZOOM, { animate: true });
              } else {
                callbackRef.current.onSelectShowroom(showroom);
              }
            });
            addMarker(marker, `${showroom.name}, ${showroom.primaryIndustryLabel}, ${showroom.city}. ${zoom < SHOWROOM_DETAIL_ZOOM ? "Zoom to business." : "Open business preview."}`);
          }
        }

        containerRef.current.dataset.mapZoom = String(zoom);
        const center = map.getCenter();
        containerRef.current.dataset.mapCenter = `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`;
        containerRef.current.dataset.mapMarkerCount = String(mountedMarkerCount);
        containerRef.current.dataset.nearbyGroupCount = String(data.nearbyGroups.length);
      };

      const commitView = () => {
        if (!map) return;
        renderMarkers();
        const center = map.getCenter();
        callbackRef.current.onViewChange({ center: [center.lat, center.lng], zoom: map.getZoom() });
      };
      map.on("moveend", commitView);
      tileLayerRef.current.on("tileerror", () => {
        if (containerRef.current) containerRef.current.dataset.tileStatus = "degraded";
      });
      tileLayerRef.current.on("load", () => {
        if (containerRef.current) containerRef.current.dataset.tileStatus = "ready";
      });
      renderMarkers();
      resizeObserver = new ResizeObserver(() => {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(() => map?.invalidateSize({ pan: false }));
      });
      resizeObserver.observe(containerRef.current);
      window.setTimeout(() => map?.invalidateSize({ pan: false }), 120);
    }).catch(() => callbackRef.current.onError());

    return () => {
      disposed = true;
      markerRefs.current = [];
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(resizeFrame);
      mapRef.current = null;
      tileLayerRef.current = null;
      markerLayerRef.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fire("moveend");
  }, [clusterIndex, featuredNowBusinessId, nearbyGroups, selectedShowroomId, showrooms]);

  return <div
    ref={containerRef}
    className="discovery-map"
    data-map-provider={mapProviderConfig().id}
    data-map-marker-count="0"
    data-map-zoom={DEFAULT_ZOOM}
    role="region"
    aria-label="Interactive OpenStreetMap map with clustered showroom locations"
  />;
});

export default MarketplaceMap;
