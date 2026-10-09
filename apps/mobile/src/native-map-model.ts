import type { FeatureCollection, Point } from 'geojson';
import type { MapShop } from '@suqpage/contracts';
import { mapDisplayLocation } from '../../../lib/map/map-display-location';

export const initialMapView = {center: [39.7, 9.03] as [number, number], zoom: 6};
export const osmStyle = {
  version: 8 as const,
  sources: {osm: {type: 'raster' as const, tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19,
    attribution: '© OpenStreetMap contributors'}},
  layers: [{id: 'osm', type: 'raster' as const, source: 'osm'}],
};
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
export function nextMapZoom(current: number, direction: 1 | -1): number {
  return Math.max(1, Math.min(19, (Number.isFinite(current) ? current : 6) + direction));
}
