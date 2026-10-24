"use client";
import {wrappedMapLongitude} from '@/lib/map-display-location';
import { useUiText } from "@/lib/i18n/ui";


import { mapDisplayLocation } from "@/lib/map-display-location";
import {clampMapZoom,MAP_MAX_ZOOM,MAP_GROUP_MAX_MEMBERS,mapClusterIndex,mapClusterMarkers,mapExposedGroup} from '@/lib/map/map-clustering';
import {resizeLeafletPreservingCenter,leafletViewForPersistence} from '@/lib/map/leaflet-resize';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, GridLayer } from "leaflet";
import type { DiscoveryNearbyGroup, DiscoveryShowroom } from "@/lib/discovery";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";
import { mapProviderConfig } from "@/lib/map-provider";
import { createMapTileLoader } from "@/lib/map/map-tile-loader";

const ETHIOPIA_CENTER: [number, number] = [9.145, 40.4897];
const ETHIOPIA_BOUNDS: [[number, number], [number, number]] = [[2.5, 31.5], [15.5, 49.5]];
const DEFAULT_ZOOM = 5;
const SHOWROOM_DETAIL_ZOOM = 12;
const STOREFRONT_GLYPH = `<svg class="mp-map-storefront" viewBox="0 7 36 25" aria-hidden="true"><rect x="5" y="9" width="26" height="23" rx="2" fill="currentColor" stroke="white" stroke-width="1.5"/><path d="M5 3H31L34 11H2Z" fill="currentColor" stroke="white" stroke-width="1.5"/><path d="M9 16H27M9 19H27M11 30V23H25V30" fill="none" stroke="white" stroke-width="1.4"/></svg>`;

type MapView = {
  center: [number, number];
  zoom: number;
};

type LeafletPendingZoom = LeafletMap & {
  _animatingZoom?: boolean;
  _onZoomTransitionEnd?: () => void;
};

function removeOwnedMap(map: LeafletMap) {
  map.stop();
  // Leaflet 1.9.4 remove()/stop() leave its 250ms zoom fallback pending.
  // Finish only this active instance while its pane exists; the SDK's later
  // fallback then sees a completed zoom. No global patch or animation disable.
  const pending = map as LeafletPendingZoom;
  if (pending._animatingZoom && typeof pending._onZoomTransitionEnd === "function") pending._onZoomTransitionEnd();
  map.remove();
}

export type MarketplaceMapController = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  centerAt: (latitude: number, longitude: number, zoom?: number) => void;
  getView: () => MapView;
};

type MarketplaceMapProps = {
  showrooms: DiscoveryShowroom[];
  groupCapacity?:number;
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
  showrooms: sourceShowrooms,
  featuredNowBusinessId,
  groupCapacity=3,
  selectedShowroomId,
  requestedView,
  onViewChange,
  onOpenNearbyGroup,
  onSelectShowroom,
  onError,
}, forwardedRef) {
  const t = useUiText();
  const textRef = useRef(t);
  textRef.current = t;
  const showrooms = useMemo(() => sourceShowrooms.map(mapDisplayLocation), [sourceShowrooms]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<GridLayer | null>(null);
  const retryTiles = useRef<(() => void) | null>(null);
  const [tileFailed, setTileFailed] = useState(false);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  const requestedViewRef = useRef(requestedView);
  const callbackRef = useRef({ onViewChange, onOpenNearbyGroup, onSelectShowroom, onError });
  const dataRef = useRef({ showrooms, featuredNowBusinessId, selectedShowroomId });
  const clusterIndex = useMemo(() => mapClusterIndex(showrooms.map(showroom=>({
    id:showroom.id,latitude:showroom.latitude,longitude:showroom.longitude,locationMode:showroom.locationMode,
    featured:showroom.id===featuredNowBusinessId,live:showroom.isLive,
  })),groupCapacity), [featuredNowBusinessId,showrooms,groupCapacity]);
  const clusterIndexRef = useRef(clusterIndex);

  callbackRef.current = { onViewChange, onOpenNearbyGroup, onSelectShowroom, onError };
  dataRef.current = { showrooms, featuredNowBusinessId, selectedShowroomId };
  clusterIndexRef.current = clusterIndex;
  requestedViewRef.current = requestedView;

  useImperativeHandle(forwardedRef, () => ({
    zoomIn() { const map=mapRef.current;if(map)map.setZoom(clampMapZoom(map.getZoom()+1)); },
    zoomOut() { const map=mapRef.current;if(map)map.setZoom(clampMapZoom(map.getZoom()-1)); },
    reset() { mapRef.current?.fitBounds(ETHIOPIA_BOUNDS, { animate: true, padding: [12, 12],maxZoom:MAP_MAX_ZOOM }); },
    centerAt(latitude, longitude, zoom = 12) { mapRef.current?.setView([latitude, longitude], clampMapZoom(Math.max(zoom, mapRef.current.getZoom())), { animate: true }); },
    getView() {
      const map = mapRef.current;
      if (!map) return { center: ETHIOPIA_CENTER, zoom: DEFAULT_ZOOM };
      const view = leafletViewForPersistence(map);
      return { center: [view.center.lat, view.center.lng], zoom: view.zoom };
    },
  }), []);

  useEffect(() => {
    if (!requestedView || !mapRef.current) return;
    mapRef.current.setView(requestedView.center, clampMapZoom(requestedView.zoom), { animate: false });
  }, [requestedView]);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame = 0;
    let resizeTimer: number | undefined;
    let commitView: (() => void) | null = null;
    let resizing = false;
    let disposeTiles: (() => void) | undefined;
    const invalidateMapSize = () => {
      if (disposed || !map || mapRef.current !== map) return;
      let resized = false;
      resizing = true;
      try { resized = resizeLeafletPreservingCenter(map); }
      finally { resizing = false; }
      if (resized) commitView?.();
    };

    void import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;
      const provider = mapProviderConfig();
      map = L.map(containerRef.current, {
        attributionControl: true,
        center: ETHIOPIA_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 1,
        worldCopyJump: true,
        trackResize: false,
        maxZoom: MAP_MAX_ZOOM,
        zoomControl: false,
        preferCanvas: true,
        wheelDebounceTime: 80,
        wheelPxPerZoomLevel: 100,
        zoomSnap: 1,
      });
      mapRef.current = map;
      map.attributionControl.setPosition("bottomleft");
      if (requestedViewRef.current) {
        map.setView(requestedViewRef.current.center, clampMapZoom(requestedViewRef.current.zoom), { animate: false });
      }
      markerLayerRef.current = L.layerGroup().addTo(map);
      // Keep attribution present when only the failed raster is removed.
      map.attributionControl.addAttribution(provider.attributionHtml);
      const startTiles = () => {
        if (disposed || !map || mapRef.current !== map) return;
        disposeTiles?.();
        if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
        setTileFailed(false);
        if (containerRef.current) { containerRef.current.dataset.tileStatus = 'loading'; delete containerRef.current.dataset.tileFailure; delete containerRef.current.dataset.tileHttpStatus; }
        // GridLayer is Leaflet's asynchronous-tile extension. TileLayer's img
        // abort routine would overwrite callbacks owned by this fetch loader.
        const layer = L.gridLayer({
          attribution: provider.attributionHtml,
          maxNativeZoom: provider.maxNativeZoom,
          maxZoom: provider.maxZoom,
          keepBuffer: 0,
          updateWhenIdle: true,
          updateWhenZooming: false,
          tileSize: 256,
        });
        const loader = createMapTileLoader({
          getTileUrl: (coords: import('leaflet').Coords) => L.Util.template(provider.tileUrlTemplate, {x:coords.x,y:coords.y,z:coords.z}),
          onFailure: failure => {
            if (disposed || !map || mapRef.current !== map || tileLayerRef.current !== layer) return;
            loader.dispose();
            map.removeLayer(layer);
            tileLayerRef.current = null;
            if (containerRef.current) {
              containerRef.current.dataset.tileStatus = 'degraded';
              containerRef.current.dataset.tileFailure = failure.kind;
              if (failure.status !== undefined) containerRef.current.dataset.tileHttpStatus = String(failure.status);
            }
            setTileFailed(true);
          },
        });
        Object.assign(layer, {createTile: (coords: import('leaflet').Coords, done: import('leaflet').DoneCallback) => loader.createTile(coords, done)});
        layer.on('tileunload', event => loader.unload(event.tile));
        layer.on('tileabort', event => loader.unload(event.tile));
        layer.on('load', () => {
          if (!disposed && tileLayerRef.current === layer && containerRef.current) containerRef.current.dataset.tileStatus = 'ready';
        });
        disposeTiles = () => loader.dispose();
        tileLayerRef.current = layer;
        layer.addTo(map);
      };
      retryTiles.current = startTiles;
      startTiles();

      const renderMarkers = () => {
        if (disposed || !map || mapRef.current !== map || !markerLayerRef.current || !containerRef.current) return;
        // A modal can restore its trigger before the selected-marker update
        // runs. Keep that deliberate map focus through our own DOM replacement.
        // Focus inside a dialog or any other control is never claimed here.
        const active=document.activeElement;
        const focused=active instanceof HTMLElement&&containerRef.current.contains(active)?active.closest<HTMLElement>('.leaflet-marker-icon'):null;
        const focusedGroup=focused?.querySelector<HTMLElement>('[data-map-group-key]')?.dataset.mapGroupKey;
        const focusedShop=focused?.querySelector<HTMLElement>('[data-showroom-id]')?.dataset.showroomId;
        markerLayerRef.current.clearLayers();
        markerRefs.current = [];
        const data = dataRef.current;
        const t = textRef.current;
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        const viewport: [number, number, number, number] = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ];
        const showroomById = new Map(data.showrooms.map((showroom) => [showroom.id, showroom]));
        let mountedMarkerCount = 0;
        let mountedGroupCount = 0;
        let restoredMarkerFocus=false;

        const addMarker = (marker: Marker, accessibleName: string) => {
          const coordinate=marker.getLatLng();
          marker.setLatLng([coordinate.lat,wrappedMapLongitude(coordinate.lng,map!.getCenter().lng)]);
          marker.addTo(markerLayerRef.current!);
          const element = marker.getElement();
          element?.setAttribute("role", "button");
          element?.setAttribute("aria-label", accessibleName);
          element?.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            event.stopPropagation();
            marker.fire("click");
          });
          if(element&&((focusedGroup&&element.querySelector<HTMLElement>('[data-map-group-key]')?.dataset.mapGroupKey===focusedGroup)
            ||(focusedShop&&element.querySelector<HTMLElement>('[data-showroom-id]')?.dataset.showroomId===focusedShop))){element.focus({preventScroll:true});restoredMarkerFocus=true;}
          markerRefs.current.push(marker);
          mountedMarkerCount += 1;
        };

        for (const item of mapClusterMarkers(clusterIndexRef.current,viewport,zoom)) {
          const [longitude,latitude]=item.center;
          if(item.kind==='aggregate'){
            const status=item.presence?`<span class="mp-map-status mp-map-status-${item.presence}">${escapeHtml(t(item.presence==='featured'?'Featured':'Live'))}</span>`:'';
            const icon=L.divIcon({className:'mp-map-div-icon',html:`<span class="mp-map-cluster${item.presence?` is-${item.presence}`:''}" data-map-group-kind="aggregate" data-map-group-key="${escapeHtml(item.key)}" data-map-group-count="${item.count}" data-map-member-ids="${item.ids.join(',')}"><b>${item.count}</b>${status}</span>`,iconSize:[48,48],iconAnchor:[23,23]});
            const label=t('{count} businesses. Zoom in.',{count:item.count});
            const marker=L.marker([latitude,longitude],{icon,keyboard:true,title:label,alt:label,riseOnHover:true,autoPanOnFocus:false});
            marker.on('click',()=>{
              if(!map||mapRef.current!==map)return;
              const nextZoom=clampMapZoom(Math.max(map.getZoom()+1,item.expansionZoom??map.getZoom()+1));
              if(nextZoom>map.getZoom())map.setView(marker.getLatLng(),nextZoom,{animate:true});
            });
            addMarker(marker,label);
            mountedGroupCount++;
            continue;
          }
          if(item.kind==='cluster'&&item.count>1){
            const members=item.ids.flatMap(id=>showroomById.get(id)?[showroomById.get(id)!]:[]);
            if(members.length!==item.count||members.length<1||members.length>Math.min(MAP_GROUP_MAX_MEMBERS,clusterIndexRef.current.capacity))continue;
            const status=item.presence?`<span class="mp-map-status mp-map-status-${item.presence}">${escapeHtml(t(item.presence==='featured'?'Featured':'Live'))}</span>`:'';
            const icon=L.divIcon({className:'mp-map-div-icon',html:`<span class="mp-map-cluster${item.presence?` is-${item.presence}`:''}" data-map-group-kind="cluster" data-map-group-key="${escapeHtml(item.key)}" data-map-group-count="${item.count}" data-map-member-ids="${item.ids.join(',')}"><b>${item.count}</b>${status}</span>`,iconSize:[48,48],iconAnchor:[23,23]});
            const labelBase=item.count===1?t('1 business. View business.'):t('{count} businesses. View businesses.',{count:item.count});
            const label=labelBase;
            const group:DiscoveryNearbyGroup={key:item.key,latitude:item.anchor[1],longitude:item.anchor[0],count:item.count,showroomIds:item.ids,
              city:members.every(shop=>shop.city===members[0].city)?members[0].city:'',
              region:members.every(shop=>shop.region===members[0].region)?members[0].region:''};
            const marker=L.marker([latitude,longitude],{icon,keyboard:true,title:label,alt:label,riseOnHover:true,autoPanOnFocus:false});
            marker.on('click',()=>{
              if(!map||mapRef.current!==map)return;
              if(mapExposedGroup(clusterIndexRef.current,item.ids,map.getZoom()))callbackRef.current.onOpenNearbyGroup(group);
            });
            addMarker(marker,label);
            mountedGroupCount++;
            continue;
          }
          const showroom=showroomById.get(item.ids[0]);
          if(!showroom)continue;
          const presence=presenceFor(showroom,data.featuredNowBusinessId);
          const lines=markerLabelLines(showroom.name).map(line=>`<span>${escapeHtml(line)}</span>`).join('');
          const status=presence.kind?`<em class="mp-map-status mp-map-status-${presence.kind}">${escapeHtml(t(presence.kind==='featured'?'Featured':'Live'))}</em>`:'';
          const icon=L.divIcon({className:'mp-map-div-icon',
            html:`<span class="mp-map-showroom${data.selectedShowroomId===showroom.id?' is-selected':''}${presence.kind?` is-${presence.kind}`:''}" data-showroom-id="${showroom.id}" data-location-mode="${showroom.locationMode}" data-latitude="${showroom.latitude}" data-longitude="${showroom.longitude}"${presence.kind?` data-presence="${presence.kind}"`:''}>${STOREFRONT_GLYPH}<b>${lines}</b>${status}</span>`,iconSize:[44,44],iconAnchor:[22,25]});
          const markerLabel=`${showroom.name}, ${t(showroom.primaryIndustryLabel)}, ${showroom.city}. ${t('Open page preview')}.`;
          const marker=L.marker([latitude,longitude],{icon,keyboard:true,title:markerLabel,
            alt:markerLabel,riseOnHover:true})
            .on('click',()=>{
              if((map?.getZoom()||0)<SHOWROOM_DETAIL_ZOOM)map?.setView([latitude,longitude],clampMapZoom(SHOWROOM_DETAIL_ZOOM),{animate:true});
              callbackRef.current.onSelectShowroom(showroom);
            });
          addMarker(marker,markerLabel);
        }

        if((focusedGroup||focusedShop)&&!restoredMarkerFocus){
          const controls=containerRef.current.closest('.discovery-map-stage')?.querySelectorAll<HTMLButtonElement>('.discovery-floating-buttons button:not(:disabled)');
          const control=controls&&[...controls].find(element=>element.getClientRects().length&&!element.closest('[inert]'));
          (control||containerRef.current).focus({preventScroll:true});
        }
        containerRef.current.dataset.mapZoom = String(zoom);
        const center = map.getCenter();
        containerRef.current.dataset.mapCenter = `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`;
        containerRef.current.dataset.mapCenterPrecise = `${center.lat},${center.lng}`;
        containerRef.current.dataset.mapMarkerCount = String(mountedMarkerCount);
        containerRef.current.dataset.nearbyGroupCount = String(mountedGroupCount);
      };

      commitView = () => {
        if (disposed || resizing || !map || mapRef.current !== map) return;
        renderMarkers();
        const view = leafletViewForPersistence(map);
        callbackRef.current.onViewChange({ center: [view.center.lat, view.center.lng], zoom: view.zoom });
      };
      map.on("moveend", commitView);
      renderMarkers();
      resizeObserver = new ResizeObserver(() => {
        if (disposed || !map || mapRef.current !== map) return;
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(invalidateMapSize);
      });
      resizeObserver.observe(containerRef.current);
      resizeTimer = window.setTimeout(invalidateMapSize, 120);
    }).catch(() => { if (!disposed) callbackRef.current.onError(); });

    return () => {
      disposed = true;
      retryTiles.current = null;
      disposeTiles?.();
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(resizeTimer);
      const instance = map;
      map = null;
      // SDK resize events can arrive after remove() has destroyed its pane.
      if (commitView) instance?.off("moveend", commitView);
      if (mapRef.current === instance) {
        markerRefs.current = [];
        mapRef.current = null;
        tileLayerRef.current = null;
        markerLayerRef.current = null;
      }
      if (instance) removeOwnedMap(instance);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fire("moveend");
  }, [clusterIndex, featuredNowBusinessId, selectedShowroomId, showrooms, t]);

  return <><div
    ref={containerRef}
    className="discovery-map"
    data-map-provider={mapProviderConfig().id}
    data-map-marker-count="0"
    data-map-zoom={DEFAULT_ZOOM}
    role="region"
    aria-label={t("Interactive OpenStreetMap map with clustered AfricMade page locations")}
  />{tileFailed && <div className="discovery-map-background-status" role="status">
    <p>{t('Map background is unavailable. You can still explore businesses.')}</p>
    <button type="button" onClick={() => retryTiles.current?.()}>{t('Retry map')}</button>
  </div>}</>;
});

export default MarketplaceMap;
