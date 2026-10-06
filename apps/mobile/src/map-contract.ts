import type { MapShop, NearbyGroup } from "@suqpage/contracts";
export type MapControls = {
  zoom: (direction: 1 | -1) => void;
  reset: () => void;
  focus: (shop: MapShop) => void;
};
export type MapProps = {
  shops: MapShop[];
  groups?: NearbyGroup[];
  selectedId?: number | null;
  onGroup?: (shops: MapShop[]) => void;
  onSelect: (shop: MapShop) => void;
  height?: number;
};
