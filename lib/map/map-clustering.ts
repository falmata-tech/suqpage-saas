import Supercluster from 'supercluster';
import {pointInMapViewport} from './map-display-location';

/** Interaction zooms use a 256 CSS-pixel world, independently of tile size. */
export const MAP_MAX_ZOOM = 18;
export const MAP_NATIVE_MAX_ZOOM = MAP_MAX_ZOOM - 1;
/** Outer hierarchy radius in normalized256-world CSS pixels. */
export const MAP_CLUSTER_RADIUS = 96;
export const MAP_GROUP_DISTANCE_METERS = 3000;
export const MAP_GROUP_MAX_DISPLACEMENT_METERS = 800;
export const MAP_GROUP_MAX_MEMBERS = 6;
export const MAP_GROUP_DEFAULT_CAPACITY = 3;
export const MAP_GROUP_FANOUT_PITCH = 56;
export const MAP_GROUP_FANOUT_ATTEMPTS = 4096;
export const MAP_GROUP_ROW_HEIGHT = 108;
export const MAP_GROUP_COMPACT_ROW_HEIGHT = 84;
export const MAP_GROUP_ROW_GAP = 8;
export const MAP_GROUP_CHROME_HEIGHT = 176;
export const MAP_GROUP_DIRECT_CHROME_HEIGHT = 112;
export const MAP_GROUP_MAX_ROWS = 3;
const MERCATOR_LATITUDE = 85.051129;

export type MapClusterPoint = {
  id: number;
  latitude: number;
  longitude: number;
  featured?: boolean;
  live?: boolean;
};
export type MapClusterBounds = [west: number, south: number, east: number, north: number];
export type MapClusterMarker = {
  key: string;
  kind: 'shop' | 'cluster' | 'aggregate';
  center: [longitude: number, latitude: number];
  anchor: [longitude: number, latitude: number];
  ids: number[];
  count: number;
  presence: 'featured' | 'live' | '';
  /** Only outer aggregates zoom; currently exposed terminal groups open in place. */
  expansionZoom?: number;
};
export type MapFixedGroup = Readonly<{
  key: string;
  kind: 'shop' | 'cluster';
  anchor: readonly [longitude: number, latitude: number];
  ids: readonly number[];
  count: number;
  presence: 'featured' | 'live' | '';
}>;
export type MapClusterIndex = {
  readonly capacity: number;
  readonly points: ReadonlyMap<number, Readonly<MapClusterPoint>>;
  readonly groups: readonly MapFixedGroup[];
  readonly byKey: ReadonlyMap<string, MapFixedGroup>;
};

export function clampMapZoom(zoom: number): number {
  return Math.max(1, Math.min(MAP_MAX_ZOOM, Number.isFinite(zoom) ? zoom : 6));
}

/** MapLibre's world is 512dp at camera zoom zero; Leaflet's is 256px. */
export function normalizeNativeMapZoom(cameraZoom: number): number {
  return clampMapZoom(Number.isFinite(cameraZoom) ? cameraZoom + 1 : 6);
}

function longitude(value: number): number {
  if (value >= -180 && value < 180) return value;
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function validPoint(point: MapClusterPoint): boolean {
  return Number.isSafeInteger(point.id) && point.id > 0
    && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= MERCATOR_LATITUDE
    && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
}

function distanceMeters(left: Pick<MapClusterPoint, 'latitude' | 'longitude'>, right: Pick<MapClusterPoint, 'latitude' | 'longitude'>): number {
  const radians = Math.PI / 180;
  const latitude = (right.latitude - left.latitude) * radians;
  const deltaLongitude = longitude(right.longitude - left.longitude) * radians;
  const a = Math.sin(latitude / 2) ** 2 + Math.cos(left.latitude * radians)
    * Math.cos(right.latitude * radians) * Math.sin(deltaLongitude / 2) ** 2;
  return 12_742_000 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
}

function groupAnchor(members: readonly MapClusterPoint[]): [number, number] {
  const reference = members[0].longitude;
  if (members.every(member => member.longitude === reference && member.latitude === members[0].latitude)) {
    return [reference, members[0].latitude];
  }
  return [longitude(reference + members.reduce((sum, member) => sum + longitude(member.longitude - reference), 0) / members.length),
    members.reduce((sum, member) => sum + member.latitude, 0) / members.length];
}

/** Keep nearest-spatial order while avoiding remote remainder groups. */
function balancedSpatialGroups(order: readonly number[], distances: readonly Float64Array[], capacity: number): number[][] {
  if (order.length < 2 || capacity === 1) return order.map(index => [index]);
  const forcedSingles = capacity === 2 && order.length % 2 === 1 ? 1 : 0;
  const table = () => Array.from({length: order.length + 1}, () => Array<number>(forcedSingles + 1).fill(Number.POSITIVE_INFINITY));
  const widths = order.map((_, position) => {
    const values = Array<number>(capacity + 1).fill(0);
    for (let size = 2; size <= capacity && position + size <= order.length; size += 1) {
      values[size] = values[size - 1];
      for (let left = position; left < position + size - 1; left += 1) {
        values[size] = Math.max(values[size], distances[order[left]][order[position + size - 1]]);
      }
    }
    return values;
  });
  const sizes = Array.from({length: capacity - 1}, (_, index) => capacity - index);
  // First find the minimum possible largest diameter. One optional singleton
  //is allowed only when an odd cohort cannot otherwise fit capacity two.
  const bottleneck = table(); bottleneck[order.length][0] = 0;
  for (let position = order.length - 1; position >= 0; position -= 1) {
    for (let singles = 0; singles <= forcedSingles; singles += 1) {
      for (const size of singles ? [...sizes, 1] : sizes) {
        const remaining = singles - (size === 1 ? 1 : 0);
        if (position + size > order.length) continue;
        bottleneck[position][singles] = Math.min(bottleneck[position][singles],
          Math.max(widths[position][size], bottleneck[position + size][remaining]));
      }
    }
  }
  // Distances below the neighborhood's3km comfort budget are equally acceptable.
  // Among those partitions prefer fewer groups, then smaller total diameter.
  // Separate passes retain candidates that a lexicographic prefix would lose.
  const limit = Math.max(MAP_GROUP_DISTANCE_METERS, bottleneck[0][forcedSingles]);
  const groupCounts = table(), total = table();
  groupCounts[order.length][0] = total[order.length][0] = 0;
  const choices = order.map(() => Array<number>(forcedSingles + 1).fill(0));
  for (let position = order.length - 1; position >= 0; position -= 1) {
    for (let singles = 0; singles <= forcedSingles; singles += 1) {
      // Descending sizes and strict improvement preserve larger-first ties.
      for (const size of singles ? [...sizes, 1] : sizes) {
        const remaining = singles - (size === 1 ? 1 : 0);
        if (position + size > order.length || widths[position][size] > limit) continue;
        const count = 1 + groupCounts[position + size][remaining];
        const sum = widths[position][size] + total[position + size][remaining];
        if (count < groupCounts[position][singles] || count === groupCounts[position][singles] && sum < total[position][singles]) {
          groupCounts[position][singles] = count; total[position][singles] = sum; choices[position][singles] = size;
        }
      }
    }
  }
  const groups: number[][] = [];
  let position = 0, singles = forcedSingles;
  while (position < order.length) {
    const size = choices[position][singles];
    if (size < 1 || size > capacity) throw new Error('Fixed map group partition is inconsistent.');
    groups.push(order.slice(position, position + size));
    position += size; singles -= size === 1 ? 1 : 0;
  }
  return groups;
}

/** Input coordinates have already passed the shared public display projection. */
export function mapClusterIndex(source: readonly MapClusterPoint[], requestedCapacity = MAP_GROUP_DEFAULT_CAPACITY): MapClusterIndex {
  const capacity = Number.isFinite(requestedCapacity)
    ? Math.max(1, Math.min(MAP_GROUP_MAX_MEMBERS, Math.floor(requestedCapacity))) : MAP_GROUP_DEFAULT_CAPACITY;
  const points = new Map<number, Readonly<MapClusterPoint>>();
  for (const point of source) {
    if (validPoint(point) && !points.has(point.id)) {
      points.set(point.id, Object.freeze({...point, longitude: longitude(point.longitude)}));
    }
  }
  const ordered = [...points.values()].sort((left, right) => left.id - right.id);
  const distances = ordered.map(() => new Float64Array(ordered.length));
  const parents = ordered.map((_, index) => index);
  const root = (index: number): number => {
    while (parents[index] !== index) {
      parents[index] = parents[parents[index]];
      index = parents[index];
    }
    return index;
  };
  // The server's current public map scope is bounded to200; pair checks do not
  // depend on map movement or introduce a database/API request.
  for (let left = 0; left < ordered.length; left += 1) {
    for (let right = left + 1; right < ordered.length; right += 1) {
      const distance = distanceMeters(ordered[left], ordered[right]);
      distances[left][right] = distances[right][left] = distance;
      if (distance <= MAP_GROUP_DISTANCE_METERS) parents[root(right)] = root(left);
    }
  }
  const cohorts = new Map<number, number[]>();
  for (let index = 0; index < ordered.length; index += 1) {
    const identity = root(index), cohort = cohorts.get(identity) || [];
    cohort.push(index);
    cohorts.set(identity, cohort);
  }
  const groups: MapFixedGroup[] = [];
  for (const cohort of cohorts.values()) {
    const remaining = new Set(cohort);
    let current = [...cohort].sort((left, right) => ordered[left].latitude - ordered[right].latitude
      || ordered[left].longitude - ordered[right].longitude || ordered[left].id - ordered[right].id)[0];
    const nearest: number[] = [];
    while (remaining.size) {
      nearest.push(current);
      remaining.delete(current);
      let next: number | undefined;
      for (const candidate of remaining) {
        if (next === undefined || distances[current][candidate] < distances[current][next]
          || distances[current][candidate] === distances[current][next] && ordered[candidate].id < ordered[next].id) next = candidate;
      }
      if (next !== undefined) current = next;
    }
    for (const partition of balancedSpatialGroups(nearest, distances, capacity)) {
      const members = partition.map(index => ordered[index]);
      const ids = members.map(member => member.id).sort((left, right) => left - right);
      const kind = cohort.length > 1 ? 'cluster' : 'shop';
      const presence = members.some(member => member.featured) ? 'featured' : members.some(member => member.live) ? 'live' : '';
      groups.push(Object.freeze({key: `${kind}:${ids.join('-')}`, kind, ids: Object.freeze(ids),
        count: ids.length, anchor: Object.freeze(groupAnchor(members)), presence}));
    }
  }
  groups.sort((left, right) => left.key < right.key ? -1 : left.key > right.key ? 1 : 0);
  return {capacity, points, groups: Object.freeze(groups), byKey: new Map(groups.map(group => [group.key, group]))};
}

function marker(group: MapFixedGroup, center: [number, number] = [...group.anchor]): MapClusterMarker {
  return {...group, anchor: [...group.anchor], center, ids: [...group.ids]};
}

/** Exact fixed membership, independent of zoom/fanout; saved subsets are not authority. */
export function mapFixedGroup(index: MapClusterIndex, ids: readonly number[]): MapClusterMarker | null {
  if (!ids.length || ids.length > index.capacity || ids.some(id => !Number.isSafeInteger(id) || id <= 0)
    || new Set(ids).size !== ids.length) return null;
  const sorted = [...ids].sort((left, right) => left - right);
  const group = index.byKey.get(`cluster:${sorted.join('-')}`)
    || (ids.length === 1 ? index.byKey.get(`shop:${sorted[0]}`) : undefined);
  return group ? marker(group) : null;
}

type Pixel = {x: number; y: number};
type Footprint = Pixel & {halfWidth: number; halfHeight: number};
const layoutCache = new WeakMap<MapClusterIndex, {zoom: number; markers: readonly MapClusterMarker[]}>();
type HierarchyPoint = {groupKey: string; shopCount: number; featured: boolean; live: boolean};
type HierarchyTotals = Omit<HierarchyPoint, 'groupKey'>;
const hierarchyCache = new WeakMap<MapClusterIndex, Supercluster<HierarchyPoint, HierarchyTotals>>();

function hierarchy(index: MapClusterIndex): Supercluster<HierarchyPoint, HierarchyTotals> {
  const cached = hierarchyCache.get(index);
  if (cached) return cached;
  // Put the seam in the largest empty longitude gap. This keeps nearby groups
  // across the dateline together without changing any public display coordinate.
  // A fully populated global ring still has one bounded hierarchy seam.
  const longitudes = index.groups.map(group => group.anchor[0]).sort((left, right) => left - right);
  let largestGap = -1, seam = 0;
  for (let position = 0; position < longitudes.length; position += 1) {
    const next = position + 1 < longitudes.length ? longitudes[position + 1] : longitudes[0] + 360;
    const gap = next - longitudes[position];
    if (gap > largestGap) {largestGap = gap; seam = longitudes[position] + gap / 2;}
  }
  const rotation = longitude(180 - seam);
  const result = new Supercluster<HierarchyPoint, HierarchyTotals>({
    minZoom: 0, maxZoom: MAP_MAX_ZOOM - 1, minPoints: 2,
    radius: MAP_CLUSTER_RADIUS, extent: 256,
    map: properties => ({shopCount: properties.shopCount, featured: properties.featured, live: properties.live}),
    reduce: (total, value) => {
      total.shopCount += value.shopCount;
      total.featured ||= value.featured; total.live ||= value.live;
    },
  }).load(index.groups.map(group => ({type: 'Feature',
    geometry: {type: 'Point', coordinates: [longitude(group.anchor[0] + rotation), group.anchor[1]]},
    properties: {groupKey: group.key, shopCount: group.count,
      featured: group.presence === 'featured', live: group.presence === 'live'},
  })));
  hierarchyCache.set(index, result);
  return result;
}

function hierarchyMarkers(index: MapClusterIndex, zoom: number): MapClusterMarker[] {
  // Query the complete scope before display spacing/viewport filtering. A pan
  // must not regroup shops or replace the authority of a restored terminal set.
  const tree = hierarchy(index);
  return tree.getClusters([-180, -90, 180, 90], Math.floor(zoom)).map(feature => {
    if (!('cluster' in feature.properties)) {
      return marker(index.byKey.get(feature.properties.groupKey)!);
    }
    const properties = feature.properties;
    // The public projection is bounded200. Enumerate at most its terminal-point
    // count, rather than Infinity, and sum shops rather than subgroup counts.
    const leaves = tree.getLeaves(properties.cluster_id, index.groups.length, 0);
    const ids = leaves.flatMap(leaf => [...index.byKey.get(leaf.properties.groupKey)!.ids]).sort((left, right) => left - right);
    const anchor = groupAnchor(ids.map(id => index.points.get(id)!));
    return {key: `aggregate:${ids.join('-')}`, kind: 'aggregate', ids, count: properties.shopCount,
      anchor, center: [...anchor], presence: properties.featured ? 'featured' : properties.live ? 'live' : '',
      expansionZoom: Math.min(MAP_MAX_ZOOM, tree.getClusterExpansionZoom(properties.cluster_id))};
  });
}

/** A restored or clicked group must be a current terminal, not hidden inside an aggregate. */
export function mapExposedGroup(index: MapClusterIndex, ids: readonly number[], normalizedZoom: number): MapClusterMarker | null {
  const fixed = mapFixedGroup(index, ids);
  if (fixed?.kind !== 'cluster') return null;
  return hierarchyMarkers(index, clampMapZoom(normalizedZoom))
    .find(item => item.kind === 'cluster' && item.key === fixed.key) || null;
}
const spiral = (() => {
  const values: Pixel[] = [];
  let x = 0, y = 0, dx = 1, dy = 0, run = 0, length = 1, turns = 0;
  while (values.length < MAP_GROUP_FANOUT_ATTEMPTS) {
    values.push({x, y}); x += dx; y += dy; run += 1;
    if (run === length) {
      [dx, dy] = [-dy, dx]; run = 0; turns += 1;
      if (turns % 2 === 0) length += 1;
    }
  }
  return values;
})();

function project(anchor: readonly [number, number], world: number): Pixel {
  const sin = Math.sin(anchor[1] * Math.PI / 180);
  return {x: (anchor[0] + 180) / 360 * world,
    y: Math.max(0, Math.min(world, (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * world))};
}

function unproject(point: Pixel, world: number): [number, number] {
  return [longitude(point.x / world * 360 - 180), Math.atan(Math.sinh(Math.PI * (1 - 2 * point.y / world))) * 180 / Math.PI];
}

function wrappedPixel(value: number, world: number): number {
  return value >= 0 && value < world ? value : ((value % world) + world) % world;
}

function layout(index: MapClusterIndex, zoom: number): readonly MapClusterMarker[] {
  const cached = layoutCache.get(index);
  if (cached?.zoom === zoom) return cached.markers;
  const world = 256 * 2 ** zoom;
  const occupied: Footprint[] = [];
  const result: MapClusterMarker[] = [];
  const visible = hierarchyMarkers(index, zoom);
  // Ordinary outer clusters remain at their public centroid and zoom in when
  // activated. Only final all-fit leaf circles receive bounded spacing.
  for (const item of visible.filter(item => item.kind === 'aggregate')) {
    occupied.push({...project(item.anchor, world), halfWidth: 28, halfHeight: 28});
    result.push(item);
  }
  // Leave isolated shops at their true public point and reserve the existing
  //94x86 name/glyph footprint (plus8px clearance) before placing group badges.
  for (const group of visible.filter(group => group.kind === 'shop')) {
    const anchor = project(group.anchor, world);
    occupied.push({...anchor, y: anchor.y + 12, halfWidth: 51, halfHeight: 47});
    result.push(group);
  }
  for (const group of visible.filter(group => group.kind === 'cluster')) {
    const anchor = project(group.anchor, world);
    const metersPerPixel = 2 * Math.PI * 6_371_000 * Math.cos(group.anchor[1] * Math.PI / 180) / world;
    const maxOffset = MAP_GROUP_MAX_DISPLACEMENT_METERS / metersPerPixel;
    const candidates = maxOffset < MAP_GROUP_FANOUT_PITCH ? [spiral[0]] : spiral;
    let chosen = {...anchor};
    let bestCount = Number.POSITIVE_INFINITY, bestArea = Number.POSITIVE_INFINITY;
    for (const step of candidates) {
      if (Math.hypot(step.x, step.y) * MAP_GROUP_FANOUT_PITCH > maxOffset) continue;
      const candidate = {x: wrappedPixel(anchor.x + step.x * MAP_GROUP_FANOUT_PITCH, world),
        y: Math.max(28, Math.min(world - 28, anchor.y + step.y * MAP_GROUP_FANOUT_PITCH))};
      const coordinate = unproject(candidate, world);
      if (distanceMeters({longitude: group.anchor[0], latitude: group.anchor[1]},
        {longitude: coordinate[0], latitude: coordinate[1]}) > MAP_GROUP_MAX_DISPLACEMENT_METERS) continue;
      let count = 0, area = 0;
      for (const other of occupied) {
        const delta = Math.abs(candidate.x - other.x) % world;
        const overlapX = 28 + other.halfWidth - Math.min(delta, world - delta);
        const overlapY = 28 + other.halfHeight - Math.abs(candidate.y - other.y);
        if (overlapX > 0 && overlapY > 0) {count += 1; area += overlapX * overlapY;}
      }
      if (count < bestCount || count === bestCount && area < bestArea) {
        bestCount = count; bestArea = area; chosen = candidate;
      }
      if (count === 0) break;
    }
    // At wide zoom honest locality takes precedence over badge separation.
    // Keep the best placement within800m (or the true anchor if none qualifies),
    //never silently merge/drop IDs or move shops across countries to make room.
    occupied.push({...chosen, halfWidth: 28, halfHeight: 28});
    const center: [number, number] = chosen.x === anchor.x && chosen.y === anchor.y
      ? [...group.anchor] : unproject(chosen, world);
    result.push({...group, center});
  }
  result.sort((left, right) => left.key < right.key ? -1 : left.key > right.key ? 1 : 0);
  layoutCache.set(index, {zoom, markers: result});
  return result;
}

export function mapClusterMarkers(index: MapClusterIndex, bounds: MapClusterBounds, normalizedZoom: number): MapClusterMarker[] {
  if (!bounds.every(Number.isFinite) || bounds[1] > bounds[3]) return [];
  return layout(index, clampMapZoom(normalizedZoom))
    .filter(item => pointInMapViewport(item.center[0], item.center[1], bounds))
    .map(item => ({...item, ids: [...item.ids], anchor: [...item.anchor], center: [...item.center]}));
}

/**
 * Available picker width/height exclude outer margins and safe-area insets.
 * Shared all-fit admission uses112px header/count/padding and no pager. Older
 *176px paging constants remain exports only for compatibility, not this layout.
 */
export function mapGroupChromeHeight(fontScale = 1): number {
  const scale = Number.isFinite(fontScale) ? Math.max(1, fontScale) : 1;
  return Math.ceil(MAP_GROUP_CHROME_HEIGHT * scale);
}

export function mapGroupDirectChromeHeight(fontScale = 1): number {
  const scale = Number.isFinite(fontScale) ? Math.max(1, fontScale) : 1;
  return Math.ceil(MAP_GROUP_DIRECT_CHROME_HEIGHT * scale);
}

export type MapGroupPickerLayout = {
  admitted: boolean;
  capacity: number;
  pageSize: number;
  rowHeight: number;
  compact: boolean;
  paged: boolean;
  chromeHeight: number;
};

/** Compute once for both the current index and its modal; zoom is irrelevant. */
export function mapGroupCapacity(width: number, height: number, fontScale = 1): number {
  const scale = Number.isFinite(fontScale) ? Math.max(1, fontScale) : 1;
  const availableHeight = Number.isFinite(height) ? height : 0;
  const columns = Number.isFinite(width) && width >= 600 ? 2 : 1;
  const rowHeight = Math.ceil(MAP_GROUP_COMPACT_ROW_HEIGHT * scale);
  const rows = Math.floor((availableHeight - mapGroupDirectChromeHeight(scale) + MAP_GROUP_ROW_GAP) / (rowHeight + MAP_GROUP_ROW_GAP));
  return Math.max(1, Math.min(columns === 2 ? MAP_GROUP_MAX_MEMBERS : MAP_GROUP_DEFAULT_CAPACITY, rows * columns));
}

export function mapGroupPickerLayout(width: number, height: number, fontScale = 1, count = MAP_GROUP_DEFAULT_CAPACITY): MapGroupPickerLayout {
  const scale = Number.isFinite(fontScale) ? Math.max(1, fontScale) : 1;
  const availableHeight = Number.isFinite(height) ? height : 0, capacity = mapGroupCapacity(width, height, scale);
  const admitted = Number.isInteger(count) && count >= 1 && count <= capacity;
  const columns = Number.isFinite(width) && width >= 600 ? 2 : 1;
  const rowHeight = Math.ceil(MAP_GROUP_ROW_HEIGHT * scale);
  const directRows = Math.ceil(Math.max(1, Math.min(MAP_GROUP_MAX_MEMBERS, Number.isFinite(count) ? count : 1)) / columns);
  const directChrome = mapGroupDirectChromeHeight(scale), common = {admitted, capacity, pageSize: admitted ? count : 0, paged: false, chromeHeight: directChrome};
  if (directChrome + directRows * rowHeight + (directRows - 1) * MAP_GROUP_ROW_GAP <= availableHeight) {
    return {...common, rowHeight, compact: false};
  }
  const compactHeight = Math.ceil(MAP_GROUP_COMPACT_ROW_HEIGHT * scale);
  if (directChrome + directRows * compactHeight + (directRows - 1) * MAP_GROUP_ROW_GAP <= availableHeight) {
    return {...common, rowHeight: compactHeight, compact: true};
  }
  const fallbackRow = Math.max(MAP_GROUP_ROW_HEIGHT, Math.min(rowHeight, availableHeight - directChrome));
  return {...common, rowHeight: fallbackRow, compact: true};
}

export function mapGroupPageSize(width: number, height: number, fontScale = 1, count = MAP_GROUP_DEFAULT_CAPACITY): number {
  return mapGroupPickerLayout(width, height, fontScale, count).pageSize;
}
