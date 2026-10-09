import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import {wrappedMapLongitude} from '../../../lib/map/map-display-location';
import { shopCoordinate, initialMapView, nextMapZoom } from "./native-map-model";
import { markerIndex, visibleMarkers } from "./map-markers";
import { MapMarker } from "./MapMarker";
import { useApp } from "./runtime";
import type { MapControls, MapProps } from "./map-contract";
export default forwardRef<MapControls, MapProps>(function MarketMap(props, ref) {
  const { shops, height = 500 } = props, { t } = useApp();
  const container = useRef<HTMLDivElement>(null), map = useRef<LeafletMap | null>(null);
  const index = useMemo(() => markerIndex(shops), [shops]);
  const latest = useRef({ ...props, index, t });
  latest.current = { ...props, index, t };
  useImperativeHandle(ref, () => ({
    zoom: d => { if (map.current) map.current.setZoom(nextMapZoom(map.current.getZoom(), d)); },
    reset: () => { map.current?.setView([initialMapView.center[1], initialMapView.center[0]], initialMapView.zoom); },
    focus: shop => {
      const point = shopCoordinate(shop);
      if (point) map.current?.setView([point[1], point[0]], Math.max(12, map.current.getZoom()));
    },
  }), []);
  useEffect(() => {
    let live = true, roots: Root[] = [], group: LayerGroup | undefined;
    const cleanupMarkers = () => { const removed = roots; roots = []; group?.clearLayers(); queueMicrotask(() => removed.forEach(root => root.unmount())); };
    void import("leaflet").then(L => {
      if (!live || !container.current) return;
      const m = L.map(container.current, { zoomControl: false, attributionControl: false, minZoom: 1, maxZoom: 19, worldCopyJump: true })
        .setView([initialMapView.center[1], initialMapView.center[0]], initialMapView.zoom);
      map.current = m;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, keepBuffer: 0, updateWhenIdle: true }).addTo(m);
      group = L.layerGroup().addTo(m);
      const render = () => {
        cleanupMarkers();
        const { shops, groups = [], selectedId, index, t, onGroup, onSelect } = latest.current;
        const b = m.getBounds();
        const items = visibleMarkers(index, shops, groups, [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], m.getZoom());
        for (const item of items) {
          const el = document.createElement("div");
          const icon = L.divIcon({ className: "suqpage-map-marker", html: el, iconSize: [96, 86], iconAnchor: [48, 31] });
          const marker = L.marker([item.center[1], wrappedMapLongitude(item.center[0],m.getCenter().lng)], { icon, keyboard: false }).addTo(group!);
          if (item.kind === "shop") {
            // Only the glyph/name children are interactive, not the 96px layout frame.
            el.style.pointerEvents = "none";
            const container = marker.getElement();
            if (container) container.style.pointerEvents = "none";
          }
          const root = createRoot(el); roots.push(root);
          root.render(<MapMarker item={item} selected={item.shop?.id === selectedId}
            label={item.shop ? `${item.shop.name}. ${t("Open page preview")}` : t("{count} nearby businesses", { count: item.count })}
            badge={item.presence ? t(item.presence === "featured" ? "Featured" : "Live") : ""} nearby={t("Nearby")}
            onPress={() => {
              if (item.kind === "cluster") m.setView([item.center[1], item.center[0]], item.expansionZoom!);
              else if (item.kind === "nearby") onGroup?.(item.shops || []);
              else if (item.shop) onSelect(item.shop);
            }}/>);
        }
        if (container.current) { container.current.dataset.mapZoom = String(m.getZoom()); container.current.dataset.mapCenter = `${m.getCenter().lat.toFixed(5)},${m.getCenter().lng.toFixed(5)}`; container.current.dataset.mapMarkerCount = String(items.length); }
      };
      m.on("moveend", render); render();
    });
    return () => { live = false; cleanupMarkers(); map.current?.remove(); map.current = null; };
  }, []);
  useEffect(() => { map.current?.fire("moveend"); }, [index, props.groups, props.selectedId, t]);
  useEffect(() => { map.current?.invalidateSize(); }, [height]);
  return <>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <div ref={container} aria-label={t("Business map")} style={{ height, width: "100%", overflow: "hidden", zIndex: 0, background: "#dfe9e8" }}/>
  </>;
});
