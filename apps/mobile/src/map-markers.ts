import {mapClusterIndex,mapClusterMarkers,mapExposedGroup,MAP_GROUP_DEFAULT_CAPACITY,type MapClusterBounds} from '../../../lib/map/map-clustering';
import type { MapShop, NearbyGroup } from "@suqpage/contracts";
import { shopCoordinate } from "./native-map-model";

export type MapBounds = MapClusterBounds;
export type MarkerItem = {
  key: string;
  center: [number, number];
  anchor: [number, number];
  kind: "shop" | "cluster" | "nearby" | "aggregate";
  expansionZoom?: number;
  count: number;
  presence: "featured" | "live" | "";
  shop?: MapShop;
  shops?: MapShop[];
};
export function markerIndex(shops: MapShop[],capacity=MAP_GROUP_DEFAULT_CAPACITY) {
  return mapClusterIndex(shops.flatMap(shop => {
    const coordinates = shopCoordinate(shop);
    return coordinates?[{id:shop.id,longitude:coordinates[0],latitude:coordinates[1],featured:shop.isFeatured,live:shop.isLive}]:[];
  }),capacity);
}
export function visibleMarkers(index: ReturnType<typeof markerIndex>, shops: MapShop[], _groups: NearbyGroup[], bounds: MapBounds, zoom: number): MarkerItem[] {
  const byId = new Map<number,MapShop>();
  for(const shop of shops)if(!byId.has(shop.id)&&shopCoordinate(shop))byId.set(shop.id,shop);
  return mapClusterMarkers(index,bounds,zoom).flatMap(marker=>{
    const members=marker.ids.flatMap(id=>byId.has(id)?[byId.get(id)!]:[]);
    if(!members.length)return [];
    return [{key:marker.key,kind:marker.kind,center:marker.center,anchor:marker.anchor,count:members.length,...(marker.expansionZoom===undefined?{}:{expansionZoom:marker.expansionZoom}),
      presence:members.some(s=>s.isFeatured)?'featured' as const:members.some(s=>s.isLive)?'live' as const:'' as const,
      ...(marker.kind==='shop'?{shop:members[0]}:{shops:members})}];
  });
}
export function currentGroupMembers(index:ReturnType<typeof markerIndex>,shops:MapShop[],ids:readonly number[],normalizedZoom:number):MapShop[]{
  const group=mapExposedGroup(index,ids,normalizedZoom);if(!group)return [];
  const members=group.ids.flatMap(id=>{const shop=shops.find(item=>item.id===id);return shop?[shop]:[];});
  return members.length===group.count?members:[];
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
