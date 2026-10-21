import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import {wrappedMapLongitude} from '../../../lib/map/map-display-location';
import { shopCoordinate, initialMapView, nextMapZoom } from "./native-map-model";
import { markerIndex, visibleMarkers } from "./map-markers";
import { MapMarker } from "./MapMarker";
import { useApp } from "./runtime";
import type { MapControls, MapProps } from "./map-contract";
import {MAP_MAX_ZOOM} from '../../../lib/map/map-clustering';
import {resizeLeafletPreservingCenter,leafletViewForPersistence} from './leaflet-resize';
import {mapProviderConfig} from '../../../lib/map-provider';
import {createMapTileLoader} from '../../../lib/map/map-tile-loader';

type LeafletPendingZoom = LeafletMap & {
  _animatingZoom?: boolean;
  _onZoomTransitionEnd?: () => void;
};

function removeOwnedMap(map: LeafletMap) {
  map.stop();
  // Leaflet 1.9.4 leaves a 250ms zoom fallback pending after remove()/stop().
  // Complete only this active instance while its pane still exists, matching
  // the web adapter; later SDK completion then observes a finished animation.
  const pending = map as LeafletPendingZoom;
  if (pending._animatingZoom && typeof pending._onZoomTransitionEnd === "function") pending._onZoomTransitionEnd();
  map.remove();
}

export default forwardRef<MapControls, MapProps>(function MarketMap(props, ref) {
  const { shops, height = 500 } = props, { t } = useApp();
  const container = useRef<HTMLDivElement>(null), map = useRef<LeafletMap | null>(null);
  const retryTiles = useRef<(() => void) | null>(null);
  const [tileFailed, setTileFailed] = useState(false);
  const index = useMemo(() => markerIndex(shops,props.groupCapacity), [shops,props.groupCapacity]);
  const latest = useRef({ ...props, index, t });
  const startingView=useRef(props.initialView||initialMapView);
  const resizing=useRef(false);
  latest.current = { ...props, index, t };
  useImperativeHandle(ref, () => ({
    zoom: d => { if (map.current) map.current.setZoom(nextMapZoom(map.current.getZoom(), d)); },
    reset: () => { map.current?.setView([initialMapView.center[1], initialMapView.center[0]], initialMapView.zoom); },
    focus: shop => {
      const point = shopCoordinate(shop);
      if (point) map.current?.setView([point[1], point[0]], Math.min(MAP_MAX_ZOOM,Math.max(12, map.current.getZoom())));
    },
  }), []);
  function resizeMap(){const instance=map.current;if(!instance)return;resizing.current=true;let resized=false;try{resized=resizeLeafletPreservingCenter(instance);}finally{resizing.current=false;}if(resized)instance.fire('moveend');}
  useEffect(() => {
    let live = true, roots: Root[] = [], group: LayerGroup | undefined, instance: LeafletMap | undefined, renderMarkers: (() => void) | undefined,resizeFrame:number|undefined;
    let disposeTiles: (() => void) | undefined;
    const resize=()=>{if(!live)return;if(resizeFrame!==undefined)cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resizeFrame=undefined;if(live&&instance&&map.current===instance)resizeMap();});};
    window.addEventListener('resize',resize);
    // A retained/flex route can acquire its actual size without a window event
    // or height-prop change. Observe only this owned map container; the resize
    // helper ignores hidden zero geometry and preserves the current camera.
    const sizeObserver=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(resize);
    if(container.current)sizeObserver?.observe(container.current);
    const cleanupMarkers = () => { const removed = roots; roots = []; group?.clearLayers(); queueMicrotask(() => removed.forEach(root => root.unmount())); };
    void import("leaflet").then(L => {
      if (!live || !container.current) return;
      const m = L.map(container.current, { zoomControl: false, attributionControl: false, minZoom: 1, maxZoom: MAP_MAX_ZOOM, worldCopyJump: true,trackResize:false })
        .setView([startingView.current.center[1],startingView.current.center[0]],Math.max(1,Math.min(MAP_MAX_ZOOM,startingView.current.zoom)));
      instance = m; map.current = m;
      const provider = mapProviderConfig();
      let raster: import('leaflet').GridLayer | undefined;
      const startTiles = () => {
        if (!live || map.current !== m) return;
        disposeTiles?.();
        if (raster) m.removeLayer(raster);
        setTileFailed(false);
        if (container.current) { container.current.dataset.tileStatus = 'loading'; delete container.current.dataset.tileFailure; delete container.current.dataset.tileHttpStatus; }
        // The public async GridLayer contract leaves fetch/image cancellation
        // with our loader instead of TileLayer's built-in image-only aborts.
        const layer = L.gridLayer({
          maxZoom: provider.maxZoom, maxNativeZoom: provider.maxNativeZoom,
          keepBuffer: 0, updateWhenIdle: true, updateWhenZooming: false, tileSize: 256,
        });
        const loader = createMapTileLoader({
          getTileUrl: (coords: import('leaflet').Coords) => L.Util.template(provider.tileUrlTemplate, {x:coords.x,y:coords.y,z:coords.z}),
          onFailure: failure => {
            if (!live || map.current !== m || raster !== layer) return;
            loader.dispose(); m.removeLayer(layer); raster = undefined;
            if (container.current) {
              container.current.dataset.tileStatus = 'degraded';
              container.current.dataset.tileFailure = failure.kind;
              if (failure.status !== undefined) container.current.dataset.tileHttpStatus = String(failure.status);
            }
            setTileFailed(true);
          },
        });
        Object.assign(layer, {createTile: (coords: import('leaflet').Coords, done: import('leaflet').DoneCallback) => loader.createTile(coords, done)});
        layer.on('tileunload', event => loader.unload(event.tile));
        layer.on('tileabort', event => loader.unload(event.tile));
        layer.on('load', () => {
          if (live && raster === layer && container.current) container.current.dataset.tileStatus = 'ready';
        });
        disposeTiles = () => loader.dispose(); raster = layer; layer.addTo(m);
      };
      retryTiles.current = startTiles; startTiles();
      group = L.layerGroup().addTo(m);
      const render = () => {
        if (!live || map.current !== m) return;
        cleanupMarkers();
        const { shops, groups = [], selectedId, index, t,onZoomChange,onViewChange } = latest.current;
        const b = m.getBounds();
        const items = visibleMarkers(index, shops, groups, [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], m.getZoom());
        for (const item of items) {
          const displayLongitude=wrappedMapLongitude(item.center[0],m.getCenter().lng);
          const el = document.createElement("div");
          if(item.kind!=='shop')el.dataset.mapGroupIds=item.shops?.map(shop=>shop.id).sort((a,b)=>a-b).join(',');
          const icon = L.divIcon({ className: "suqpage-map-marker", html: el, iconSize: [96, 86], iconAnchor: [48, 31] });
          const marker = L.marker([item.center[1], displayLongitude], { icon, keyboard: false }).addTo(group!);
          {
            // Only the glyph/name children are interactive, not the 96px layout frame.
            el.style.pointerEvents = "none";
            const container = marker.getElement();
            if (container) container.style.pointerEvents = "none";
          }
          const root = createRoot(el); roots.push(root);
          root.render(<MapMarker item={item} selected={item.shop?.id === selectedId}
            label={item.shop ? `${item.shop.name}. ${t("Open page preview")}` : item.expansionZoom!==undefined?item.count===1?t('1 business. Zoom in.'):t('{count} businesses. Zoom in.',{count:item.count}):item.count===1?t('1 business. View business.'):t("{count} businesses. View businesses.", { count: item.count })}
            badge={item.presence ? t(item.presence === "featured" ? "Featured" : "Live") : ""} nearby={t("Nearby")}
            onPress={() => {
              if (!live || map.current !== m) return;
              if(item.expansionZoom!==undefined)m.setView([item.center[1],wrappedMapLongitude(item.center[0],m.getCenter().lng)],Math.min(MAP_MAX_ZOOM,Math.max(Math.floor(m.getZoom())+1,item.expansionZoom)));
              else if (item.kind !== "shop") latest.current.onGroup?.(item.shops || []);
              else if (item.shop) latest.current.onSelect(item.shop);
            }}/>);
        }
        if (container.current) { const actual=m.getCenter();container.current.dataset.mapZoom = String(m.getZoom()); container.current.dataset.mapCenter = `${actual.lat.toFixed(5)},${actual.lng.toFixed(5)}`;container.current.dataset.mapCenterPrecise=`${actual.lat},${actual.lng}`; container.current.dataset.mapMarkerCount = String(items.length); }
        onZoomChange?.(m.getZoom());
        if(!resizing.current){const view=leafletViewForPersistence(m);onViewChange?.({center:[view.center.lng,view.center.lat],zoom:view.zoom});}
      };
      renderMarkers = render; m.on("moveend", render); render();resize();
    });
    return () => {
      live = false;
      retryTiles.current = null;
      disposeTiles?.();
      sizeObserver?.disconnect();
      window.removeEventListener('resize',resize);if(resizeFrame!==undefined)cancelAnimationFrame(resizeFrame);
      // Leaflet may deliver a debounced resize moveend after remove() destroys
      // its pane. Detach our listener before destruction, then release only the
      // instance owned by this effect; queued callbacks also check liveness.
      if (renderMarkers) instance?.off("moveend", renderMarkers);
      if (map.current === instance) map.current = null;
      cleanupMarkers(); if (instance) removeOwnedMap(instance);
    };
  }, []);
  useEffect(() => { map.current?.fire("moveend"); }, [index, props.groups, props.selectedId, t]);
  useEffect(() => { resizeMap(); }, [height]);
  return <div style={{height, width:'100%', position:'relative'}}>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <div ref={container} aria-label={t("Business map")} style={{ height:'100%', width: "100%", overflow: "hidden", zIndex: 0, background: "#dfe9e8" }}/>
    {tileFailed && <div role="status" style={{position:'absolute',zIndex:1,top:12,left:12,width:'min(300px, calc(100% - 96px))',boxSizing:'border-box',padding:12,border:'1px solid #d5dfdf',borderRadius:12,background:'rgba(255,255,255,.97)',color:'#35454b',boxShadow:'0 4px 16px rgb(32 36 40 / 9%)'}}>
      <p style={{margin:'0 0 8px',fontSize:14,lineHeight:1.45}}>{t('Map background is unavailable. You can still explore businesses.')}</p>
      <button type="button" onClick={() => retryTiles.current?.()} style={{minHeight:48,padding:'8px 14px',border:'1px solid #c5d1d1',borderRadius:8,background:'#fff',color:'#a73500',font:'inherit',fontSize:14,fontWeight:750,cursor:'pointer'}}>{t('Retry map')}</button>
    </div>}
  </div>;
});
