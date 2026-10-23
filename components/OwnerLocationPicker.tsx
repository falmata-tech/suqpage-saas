"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, GridLayer } from "leaflet";
import { mapProviderConfig } from "../lib/map-provider";
import { createMapTileLoader } from "../lib/map/map-tile-loader";
import styles from "./OwnerLocationPicker.module.css";

export type MapPoint = { latitude: number; longitude: number };
type Props = {
  city: { latitude: number; longitude: number };
  point: MapPoint | null;
  disabled?: boolean;
  t: (key: string) => string;
  onChange: (point: MapPoint | null) => void;
};

export default function OwnerLocationPicker({ city, point, disabled = false, t, onChange }: Props) {
  const element = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const callback = useRef(onChange);
  const pointRef = useRef(point);
  const readyRef = useRef(false);
  const errorRef = useRef(false);
  const disabledRef = useRef(disabled);
  const [tileError, setTileError] = useState(false);
  const [tileRevision, setTileRevision] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  callback.current = onChange;
  pointRef.current = point;
  disabledRef.current = disabled;

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;
    let layer: GridLayer | null = null;
    let loader: ReturnType<typeof createMapTileLoader<import("leaflet").Coords>> | null = null;
    setMapReady(false);
    setTileError(false);
    void import("leaflet").then((L) => {
      if (disposed || !element.current) return;
      const provider = mapProviderConfig();
      map = L.map(element.current, {
        center: pointRef.current ? [pointRef.current.latitude, pointRef.current.longitude] : [city.latitude, city.longitude], zoom: 15, minZoom: 12, maxZoom: 19,
        zoomControl: true, attributionControl: true, keyboard: true, scrollWheelZoom: true,
        doubleClickZoom: true, boxZoom: false, worldCopyJump: false,
      });
      mapRef.current = map;
      map.attributionControl.setPosition("bottomright");
      map.attributionControl.addAttribution(provider.attributionHtml);

      const startTiles = () => {
        if (disposed || !map) return;
        loader?.dispose();
        if (layer) map.removeLayer(layer);
        setTileError(false);
        const tileLayer = L.gridLayer({
          attribution: provider.attributionHtml,
          maxNativeZoom: provider.maxNativeZoom,
          maxZoom: provider.maxZoom,
          keepBuffer: 0,
          updateWhenIdle: true,
          updateWhenZooming: false,
          tileSize: 256,
        });
        loader = createMapTileLoader({
          getTileUrl: (coords: import("leaflet").Coords) => L.Util.template(provider.tileUrlTemplate, { x: coords.x, y: coords.y, z: coords.z }),
          onFailure: () => {
            if (disposed || layer !== tileLayer || mapRef.current !== map) return;
            loader?.dispose();
            map?.removeLayer(tileLayer);
            layer = null;
            readyRef.current = false;
            errorRef.current = true;
            setTileError(true);
          },
        });
        Object.assign(tileLayer, { createTile: (coords: import("leaflet").Coords, done: import("leaflet").DoneCallback) => loader!.createTile(coords, done) });
        tileLayer.on("tileunload", event => loader?.unload(event.tile));
        tileLayer.on("tileabort", event => loader?.unload(event.tile));
        tileLayer.on("load", () => { if (!disposed) { readyRef.current = true; setMapReady(true); } });
        layer = tileLayer;
        tileLayer.addTo(map!);
      };
      startTiles();

      const icon = L.divIcon({ className: "", html: '<span class="owner-location-map-pin" aria-hidden="true"></span>', iconSize: [32, 40], iconAnchor: [16, 38] });
      const moveMarker = (next: MapPoint | null) => {
        if (!map || disposed) return;
        if (!next) { markerRef.current?.remove(); markerRef.current = null; return; }
        if (!markerRef.current) {
          markerRef.current = L.marker([next.latitude, next.longitude], { icon, draggable: !disabled, keyboard: true, title: "Public storefront location" }).addTo(map);
          markerRef.current.on("dragend", () => {
            const at = markerRef.current?.getLatLng();
            if (at) callback.current({ latitude: at.lat, longitude: at.lng });
          });
        } else markerRef.current.setLatLng([next.latitude, next.longitude]);
      };
      moveMarker(pointRef.current);
      map.on("click", event => {
        if (disabledRef.current || !readyRef.current || errorRef.current) return;
        callback.current({ latitude: event.latlng.lat, longitude: event.latlng.lng });
      });
      map.on("keypress", event => {
        if (event.originalEvent.key === "Enter" && !pointRef.current && readyRef.current && !errorRef.current && !disabledRef.current) {
          const at = map?.getCenter();
          if (at) callback.current({ latitude: at.lat, longitude: at.lng });
        }
      });
    }).catch(() => { if (!disposed) setTileError(true); });
    return () => {
      disposed = true;
      readyRef.current = false;
      errorRef.current = false;
      loader?.dispose();
      markerRef.current = null;
      mapRef.current = null;
      map?.remove();
    };
  }, [city.latitude, city.longitude, tileRevision]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    void import("leaflet").then(L => {
      if (!mapRef.current || mapRef.current !== map) return;
      const icon = L.divIcon({ className: "", html: '<span class="owner-location-map-pin" aria-hidden="true"></span>', iconSize: [32, 40], iconAnchor: [16, 38] });
      if (!point) { markerRef.current?.remove(); markerRef.current = null; return; }
      if (!markerRef.current) {
        markerRef.current = L.marker([point.latitude, point.longitude], { icon, draggable: !disabled, keyboard: true, title: "Public storefront location" }).addTo(map);
        markerRef.current.on("dragend", () => { const at=markerRef.current?.getLatLng(); if(at) callback.current({latitude:at.lat,longitude:at.lng}); });
      } else markerRef.current.setLatLng([point.latitude, point.longitude]);
    });
  }, [point, disabled]);

  function placeAtCenter() {
    const center = mapRef.current?.getCenter();
    if (center && readyRef.current && !errorRef.current && !disabledRef.current) callback.current({ latitude: center.lat, longitude: center.lng });
  }

  return <div className={styles.picker}>
    <p className={styles.status}>{t("Customers will see this exact public location.")}</p>
    <div ref={element} className={styles.map} role="application" aria-label={t("Storefront location map")} data-testid="owner-location-map" />
    {tileError ? <p className={`${styles.status} ${styles.alert}`} role="alert">{t("The map could not load. Retry before choosing a public location.")}</p> : null}
    {!tileError&&!mapReady ? <p className={styles.status} role="status">{t("Loading…")}</p> : null}
    <div className={styles.actions}>
      <button className="btn secondary" type="button" disabled={disabled || !mapReady || tileError} onClick={placeAtCenter}>{t("Place pin at map center")}</button>
      {tileError ? <button className="btn secondary" type="button" disabled={disabled} onClick={() => { readyRef.current=false;errorRef.current=false;setMapReady(false);setTileRevision(value => value + 1); }}>{t("Retry map")}</button> : null}
    </div>
    <p className={styles.status} role="status">{point ? `${t("Exact location selected")}: ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}` : mapReady&&!tileError?t("Tap the map to place the storefront pin."):""}</p>
  </div>;
}
