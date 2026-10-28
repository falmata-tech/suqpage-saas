import type { FeatureCollection, Point } from 'geojson';
import type { MapShop } from '@africmade/contracts';
import { mapDisplayLocation } from '../../../lib/map/map-display-location';
import {MAP_MAX_ZOOM} from '../../../lib/map/map-clustering';

export const initialMapView = {center: [39.7, 9.03] as [number, number], zoom: 6};
export const osmStyle = {
  version: 8 as const,
  sources: {osm: {type: 'raster' as const, tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19,
    attribution: '© OpenStreetMap contributors'}},
  layers: [{id: 'osm', type: 'raster' as const, source: 'osm'}],
};
const nativeFixtureStyle = {
  version: 8 as const,
  metadata: {'mirtpage:fixture': 'mirtpage-native-background-v1'},
  sources: {},
  layers: [{id: 'fixture-background', type: 'background' as const, paint: {'background-color': '#f5f2e8'}}],
};
/** Explicit synthetic native review; malformed/release requests never use public tiles. */
export function nativeMapStyle(development: boolean, fixtureFlag: string | undefined) {
  if (fixtureFlag === undefined || fixtureFlag === '') return osmStyle;
  if (fixtureFlag !== '1') throw new Error('Invalid native map fixture flag.');
  if (!development) throw new Error('Native map fixture is development-only.');
  return nativeFixtureStyle;
}

export function shopCoordinate(shop: MapShop): [number, number] | null {
  if (!Number.isSafeInteger(shop.id) || shop.id <= 0 || !Number.isFinite(shop.latitude) ||
      !Number.isFinite(shop.longitude) || Math.abs(shop.latitude) > 85.051129 || Math.abs(shop.longitude) > 180) return null;
  const point = mapDisplayLocation(shop);
  return [point.longitude, point.latitude];
}
export function shopFeatures(shops: MapShop[]): FeatureCollection<Point, {shopId: number}> {
  const seen = new Set<number>();
  return {type: 'FeatureCollection', features: shops.flatMap(shop => {
    const coordinates = shopCoordinate(shop);
    if (!coordinates || seen.has(shop.id)) return [];
    seen.add(shop.id);
    return [{type: 'Feature' as const, id: shop.id, properties: {shopId: shop.id}, geometry: {type: 'Point' as const, coordinates}}];
  })};
}
export function selectedMapShop(id: unknown, shops: MapShop[]): MapShop | undefined {
  return typeof id === 'number' ? shops.find(shop => shop.id === id && shopCoordinate(shop) !== null) : undefined;
}
export function nextMapZoom(current: number, direction: 1 | -1, maximum=MAP_MAX_ZOOM): number {
  return Math.max(1, Math.min(maximum, (Number.isFinite(current) ? current : 6) + direction));
}
