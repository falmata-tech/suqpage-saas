import {pointInMapViewport} from '../../../lib/map/map-display-location';
import Supercluster from "supercluster";
import type { MapShop, NearbyGroup } from "@suqpage/contracts";
import { shopCoordinate } from "./native-map-model";

type Counts = { featured: number; live: number };
type Point = Counts & { shopId: number };
export type MapBounds = [number, number, number, number];
export type MarkerItem = {
  key: string;
  center: [number, number];
  kind: "shop" | "cluster" | "nearby";
  count: number;
  presence: "featured" | "live" | "";
  shop?: MapShop;
  shops?: MapShop[];
  expansionZoom?: number;
};
export function markerIndex(shops: MapShop[]) {
  const index = new Supercluster<Point, Counts>({ radius: 52, maxZoom: 13, minPoints: 2,
    map: p => ({ featured: p.featured, live: p.live }),
    reduce: (a, b) => { a.featured += b.featured; a.live += b.live; } });
  const seen = new Set<number>();
  index.load(shops.flatMap(shop => {
    const coordinates = shopCoordinate(shop);
    if (!coordinates || seen.has(shop.id)) return [];
    seen.add(shop.id);
    return [{ type: "Feature" as const, properties: { shopId: shop.id,
      featured: shop.isFeatured ? 1 : 0, live: shop.isLive && !shop.isFeatured ? 1 : 0 },
      geometry: { type: "Point" as const, coordinates } }];
  }));
  return index;
}
function presence(shops: MapShop[]): MarkerItem["presence"] {
  return shops.some(s => s.isFeatured) ? "featured" : shops.some(s => s.isLive) ? "live" : "";
}
export function visibleMarkers(index: ReturnType<typeof markerIndex>, shops: MapShop[], groups: NearbyGroup[], bounds: MapBounds, zoom: number): MarkerItem[] {
  const byId = new Map(shops.filter(s => shopCoordinate(s)).map(s => [s.id, s]));
  const inside = ([x, y]: [number, number]) => pointInMapViewport(x,y,bounds);
  const item = (shop: MapShop): MarkerItem => ({ key: `shop-${shop.id}`, kind: "shop", center: shopCoordinate(shop)!, count: 1, shop, presence: presence([shop]) });
  if (zoom < 14) return index.getClusters(bounds, Math.floor(zoom)).flatMap(feature => {
    const p = feature.properties;
    if ("cluster_id" in p) return [{ key: `cluster-${p.cluster_id}`, kind: "cluster" as const,
      center: feature.geometry.coordinates as [number, number], count: p.point_count,
      presence: p.featured ? "featured" as const : p.live ? "live" as const : "" as const,
      expansionZoom: Math.min(14, Math.max(zoom + 1, index.getClusterExpansionZoom(p.cluster_id))) }];
    const shop = byId.get(p.shopId);
    return shop ? [item(shop)] : [];
  });
  const grouped = new Set<number>();
  const nearby: MarkerItem[] = [];
  for (const group of groups) {
    const members = [...new Set(group.showroomIds)].flatMap(id => byId.get(id) ? [byId.get(id)!] : []);
    if (members.length < 2 || !Number.isFinite(group.latitude) || !Number.isFinite(group.longitude)) continue;
    members.forEach(s => grouped.add(s.id));
    const center: [number, number] = [group.longitude, group.latitude];
    if (inside(center)) nearby.push({ key: `nearby-${group.key}`, kind: "nearby", center, count: members.length, shops: members, presence: presence(members) });
  }
  return [...nearby, ...[...byId.values()].filter(s => !grouped.has(s.id) && inside(shopCoordinate(s)!)).map(item)];
}
export function markerNameLines(name: string): string {
  const words = name.trim().split(/\s+/).flatMap(w => Array.from(w).length > 13 ? (w.match(/.{1,13}/gu) || [w]) : [w]);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last && Array.from(last + " " + word).length <= 13) lines[lines.length - 1] += " " + word;
    else if (lines.length < 3) lines.push(word);
    else { lines[2] = Array.from(lines[2]).slice(0, 12).join("") + "…"; break; }
  }
  return lines.join("\n");
}
