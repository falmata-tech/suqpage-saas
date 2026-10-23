import assert from 'node:assert/strict';
import {mapDisplayLocation} from '../lib/map/map-display-location';
import {DENSE_DEMO_BUSINESSES} from '../lib/dense-demo-seed';
import {
  MAP_MAX_ZOOM, MAP_NATIVE_MAX_ZOOM, MAP_CITY_ZOOM, MAP_GROUP_OVERFLOW_DISPLACEMENT_METERS, MAP_GROUP_DISTANCE_METERS, MAP_GROUP_MAX_MEMBERS, MAP_GROUP_DEFAULT_CAPACITY,
  MAP_GROUP_FANOUT_PITCH, MAP_GROUP_FANOUT_ATTEMPTS, MAP_GROUP_MAX_DISPLACEMENT_METERS, MAP_GROUP_ROW_HEIGHT, MAP_GROUP_COMPACT_ROW_HEIGHT,
  clampMapZoom, normalizeNativeMapZoom, mapClusterIndex, mapClusterMarkers, mapFixedGroup, mapExposedGroup,
  mapGroupPageSize, mapGroupPickerLayout, mapGroupCapacity, mapGroupChromeHeight, mapGroupDirectChromeHeight,
  type MapClusterBounds, type MapClusterPoint,
} from '../lib/map/map-clustering';

const world: MapClusterBounds = [-180, -85.051129, 180, 85.051129];
const point = (id: number, longitude = 0, latitude = 0): MapClusterPoint => ({id, longitude, latitude});
const longitudeAtMeters = (meters: number) => meters / 6_371_000 * 180 / Math.PI;
let passed = 0;
function test(name: string, run: () => void) {run(); passed += 1; console.log('PASS ' + name);}
const groupIds = (source: readonly MapClusterPoint[]) => mapClusterIndex(source).groups.map(group => [...group.ids]);
const pixel = ([longitude, latitude]: readonly number[], zoom: number): [number, number] => {
  const size = 256 * 2 ** zoom, sin = Math.sin(latitude * Math.PI / 180);
  return [(longitude + 180) / 360 * size, (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size];
};

test('S155 opening zoom shows separate regional groups for the66-city portfolio', () => {
  const cities: Array<[count: number, longitude: number, latitude: number]> = [
    [21, 38.8, 9], [9, 39.3, 8.5], [8, 38.5, 7], [7, 36.8, 7.7],
    [5, 37.4, 11.6], [4, 37.856817, 7.547703], [4, 41.9, 9.6],
    [4, 39.997595, 7.130915], [2, 37.6, 6], [1, 39, 8.8], [1, 37.463559, 12.597016],
  ];
  const source = cities.flatMap(([count, longitude, latitude], city) =>
    Array.from({length: count}, (_, item) => mapDisplayLocation({...point(city * 100 + item + 1, longitude, latitude), locationMode: 'area' as const})));
  assert.equal(source.length, 66);
  const index = mapClusterIndex(source);
  const initial = mapClusterMarkers(index, world, 5);
  assert.ok(initial.length >= 8, 'the opening view shows several city regions instead of one country-spanning badge');
  assert.ok(Math.max(...initial.map(item => item.count)) <= 22, 'only nearby overlapping groups combine at the country overview');
  const regional = mapClusterMarkers(index, world, 9);
  const cityPins = mapClusterMarkers(index, world, MAP_CITY_ZOOM);
  assert.ok(regional.length >= initial.length, 'a coarse zoom count splits into as many or more local groups while preserving every canonical city anchor');
  assert.ok(cityPins.length > regional.length && Math.max(...cityPins.map(item => item.count)) <= MAP_GROUP_DEFAULT_CAPACITY,
    'the city-level click reveals reachable numbered circles without inventing sub-city locations');
  for (const zoom of [5, 9, 10, 11, MAP_CITY_ZOOM, MAP_MAX_ZOOM]) {
    const markers = mapClusterMarkers(index, world, zoom);
    const ids = markers.flatMap(item => item.ids).sort((left, right) => left - right);
    assert.deepEqual(ids, source.map(item => item.id).sort((left, right) => left - right));
    assert.ok(markers.every(item => item.count === item.ids.length), 'counts match represented businesses at every zoom');
  }
});

test('S155 synthetic Addis points cluster without adding per-business city offsets', () => {
  const source = DENSE_DEMO_BUSINESSES.map((business, index) => mapDisplayLocation({
    ...point(index + 1, business.longitude, business.latitude),
    locationMode: 'area' as const,
  }));
  assert.equal(source.length, 20);
  assert.equal(new Set(source.map(item => `${item.latitude},${item.longitude}`)).size, source.length,
    'the explicit city-area fixture points are distinct without synthetic coordinate offsets');
  const index = mapClusterIndex(source);
  const district = mapClusterMarkers(index, world, 7);
  const closer = mapClusterMarkers(index, world, 8);
  assert.ok(closer.length > district.length, 'zooming into Addis reveals more local groups from the fixture coordinates');
  assert.ok(Math.max(...closer.map(item => item.count)) <= 5, 'the city no longer stays hidden in a large count');
  assert.deepEqual(closer.flatMap(item => item.ids).sort((a, b) => a - b), source.map(item => item.id).sort((a, b) => a - b));
});

test('S154 city-level displays seven fitting phone groups before any street-detail zoom', () => {
  const saved = Array.from({length:21}, (_, item) => ({...point(item + 1, 38.75, 9.03), locationMode:'area' as const}));
  const before = JSON.stringify(saved), source = saved.map(mapDisplayLocation);
  for (const capacity of [3,6]) {
    const index = mapClusterIndex(source,capacity), visible = mapClusterMarkers(index,world,12);
    assert.equal(visible.length,capacity===3?7:4);
    assert.equal(visible.length,index.groups.length,'City zoom exposes every fitting fixed group, not a single21 aggregate');
    assert.ok(visible.every(item=>item.kind==='cluster'&&item.count<=capacity&&item.expansionZoom===undefined));
    assert.deepEqual(visible.flatMap(item=>item.ids).sort((a,b)=>a-b),saved.map(item=>item.id));
    for (const item of visible) assert.equal(mapExposedGroup(index,item.ids,12)?.key,item.key);
    const outer=mapClusterMarkers(index,world,6)[0];
    assert.equal(outer.kind,'aggregate');assert.ok(outer.expansionZoom!>6&&outer.expansionZoom!<=MAP_CITY_ZOOM,'A city aggregate expands in bounded steps before the terminal preview level');assert.ok(mapClusterMarkers(index,world,outer.expansionZoom!).length>mapClusterMarkers(index,world,6).length,'One aggregate activation reveals geographic children');
  }
  assert.equal(JSON.stringify(saved),before,'Visual spacing never mutates saved address coordinates');
});

test('fixed3km membership, finite5/10km display spacing and matched city/district scales', () => {
  assert.equal(MAP_GROUP_DISTANCE_METERS, 3000); assert.equal(MAP_GROUP_MAX_DISPLACEMENT_METERS,5000); assert.equal(MAP_GROUP_OVERFLOW_DISPLACEMENT_METERS,10000);
  assert.equal(MAP_GROUP_MAX_MEMBERS, 6); assert.equal(MAP_GROUP_DEFAULT_CAPACITY, 3);
  assert.equal(MAP_CITY_ZOOM,12); assert.equal(MAP_MAX_ZOOM,13); assert.equal(MAP_NATIVE_MAX_ZOOM,12);
  assert.equal(clampMapZoom(19), MAP_MAX_ZOOM); assert.equal(clampMapZoom(0), 1);
  assert.equal(clampMapZoom(Number.NaN), 6); assert.equal(clampMapZoom(12.75), 12.75);
  assert.equal(normalizeNativeMapZoom(17), MAP_MAX_ZOOM); assert.equal(normalizeNativeMapZoom(1), 2);
});

test('valid unique coordinate snapshot, zero/dateline and no second area offset or private payload', () => {
  const original = {...point(1, 39.7, 9.03), description: 'not public marker payload'};
  const index = mapClusterIndex([original, original, point(0), point(-1), point(1.5),
    point(Number.MAX_SAFE_INTEGER + 1), point(2, 181), point(3, 0, 86), point(4, Number.NaN),
    point(5, 0, Number.POSITIVE_INFINITY), point(6), point(7, 180, -85.051129)]);
  original.longitude = 0;
  assert.equal(index.points.size, 3); assert.equal(index.points.get(1)?.longitude, 39.7);
  assert.equal(index.points.get(7)?.longitude, -180);
  assert.deepEqual(mapFixedGroup(index, [1])?.anchor, [39.7, 9.03]);
  assert.deepEqual(mapFixedGroup(index, [6])?.center, [0, 0]);
  assert.doesNotMatch(JSON.stringify(mapClusterMarkers(index, world, MAP_MAX_ZOOM)), /not public marker payload/);
  assert.deepEqual(mapClusterMarkers(mapClusterIndex([]), world, MAP_MAX_ZOOM), []);
});

test('a city-only singleton stays a shop marker at every zoom and keeps its canonical anchor', () => {
  const city = {...point(42, 38.75, 9.03), locationMode: 'area' as const};
  assert.deepEqual(mapDisplayLocation(city), city, 'City-only coordinates are never fanned out into a guessed storefront location');
  const index = mapClusterIndex([city]);
  assert.equal(index.groups[0]?.kind, 'cluster', 'The fixed group key retains current-member authority');
  for (const zoom of [1, 5, 9, MAP_CITY_ZOOM, MAP_MAX_ZOOM]) {
    const marker = mapClusterMarkers(index, world, zoom)[0];
    assert.equal(marker.kind, 'shop'); assert.equal(marker.count, 1); assert.equal(marker.expansionZoom, undefined);
    assert.deepEqual(marker.anchor, [38.75, 9.03]);
    assert.equal(marker.center[0], 38.75); assert.equal(marker.center[1], 9.03);
  }
  assert.ok(mapExposedGroup(index, [42], MAP_MAX_ZOOM), 'The singleton remains a current, reachable business marker');
});

test('an overlapping overview singleton joins a zoomable multi-business count, then separates as a shop pin', () => {
  const source: MapClusterPoint[] = [
    {...point(1, 38.75, 9.03), locationMode: 'area'},
    point(2, 38.75, 9.8), point(3, 38.751, 9.8), point(4, 38.752, 9.8),
  ];
  const index = mapClusterIndex(source, 3);
  const overview = mapClusterMarkers(index, world, 5);
  assert.ok(overview.every(marker => marker.count > 1), 'No overlapping overview tap target is a numbered one-business marker.');
  assert.equal(overview.reduce((sum, marker) => sum + marker.count, 0), source.length);
  assert.ok(overview.some(marker => marker.kind === 'aggregate' && marker.count === 4 && marker.expansionZoom! > 5),
    'The nearby screen collision becomes a multi-business circle that expands far enough to separate its member markers.');
  const filtered = mapClusterMarkers(mapClusterIndex([source[0]]), world, 5)[0];
  assert.equal(filtered.kind, 'shop', 'A sole city-filtered business is shown as a shop glyph directly.');
  assert.deepEqual(filtered.center, [38.75, 9.03], 'Filtering keeps its pin at the canonical city point.');
  const city = mapClusterMarkers(index, world, 12);
  assert.equal(city.find(marker => marker.ids.includes(1))?.kind, 'shop', 'When zoom separates it, the city-only business returns to its own shop glyph.');
});

test('3km edge boundary and connected neighborhoods with only truly isolated singletons', () => {
  assert.deepEqual(groupIds([point(1), point(2, longitudeAtMeters(MAP_GROUP_DISTANCE_METERS-1))]), [[1, 2]]);
  assert.deepEqual(groupIds([point(1), point(2, longitudeAtMeters(MAP_GROUP_DISTANCE_METERS+1))]), [[1], [2]]);
  const chain = Array.from({length: 8}, (_, index) => point(index + 1, longitudeAtMeters(index * 600)));
  const groups = mapClusterIndex([...chain, point(99, 40)]).groups;
  assert.deepEqual(groups.filter(group => group.kind === 'cluster').map(group => group.count).sort(), [2,3,3],
    'Compact1200m triples fit the3km comfort budget without arbitrary singletons');
  assert.deepEqual(groups.filter(group => group.kind === 'shop').map(group => [...group.ids]), [[99]]);
  assert.deepEqual(groups.flatMap(group => [...group.ids]).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 99]);
});

test('balanced2/3 partitions contain every ID exactly once with no singleton leftovers for2through200', () => {
  for (let count = 2; count <= 200; count += 1) {
    const index = mapClusterIndex(Array.from({length: count}, (_, item) => point(item + 1, 38.75, 9.03)));
    const sizes = index.groups.map(group => group.count), ids = index.groups.flatMap(group => [...group.ids]);
    assert.equal(sizes.length, Math.ceil(count / 3));
    assert.ok(sizes.every(size => size === 2 || size === 3));
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1);
    assert.equal(ids.length, count); assert.equal(new Set(ids).size, count);
  }
  assert.deepEqual(groupIds([1, 2, 3, 4].map(id => point(id))), [[1, 2], [3, 4]]);
  assert.deepEqual(groupIds([1, 2, 3, 4, 5].map(id => point(id))), [[1, 2, 3], [4, 5]]);
  assert.deepEqual(groupIds([1, 2, 3, 4, 5, 6, 7].map(id => point(id))), [[1, 2, 3], [4, 5], [6, 7]]);
});

test('nearest spatial order and ID ties are deterministic, including the transitive star graph', () => {
  const source = [point(100, 0), point(2, .001), point(3, .002), point(1, .003)];
  assert.deepEqual(groupIds(source), [[1, 3], [2, 100]]);
  assert.deepEqual(groupIds(source), groupIds([...source].reverse()));
  const spoke=MAP_GROUP_DISTANCE_METERS*.875;
  const star = [point(1), point(2, longitudeAtMeters(spoke)),
    point(3, -longitudeAtMeters(spoke/2), longitudeAtMeters(spoke*Math.sqrt(3)/2)),
    point(4, -longitudeAtMeters(spoke/2), -longitudeAtMeters(spoke*Math.sqrt(3)/2))];
  assert.deepEqual(mapClusterIndex(star).groups.map(group => group.count), [2, 2]);
  // Connected neighborhoods do not promise every final pair is within3km.
});

test('terminal membership stays fixed while outer hierarchy merges whole groups across zooms', () => {
  const source = Array.from({length: 8}, (_, index) => ({...point(index + 1, 38.75, 9.03),
    live: index === 0, featured: index === 1}));
  const index = mapClusterIndex(source);
  const expected = index.groups.map(group => ({key: group.key, ids: [...group.ids], count: group.count, presence: group.presence}));
  for (const zoom of [1, 3.5, 6, 13, 14, 17.5, MAP_MAX_ZOOM, 19, 100]) {
    const actual = mapClusterMarkers(index, world, zoom);
    assert.deepEqual(actual.flatMap(marker => marker.ids).sort((a,b)=>a-b), source.map(row=>row.id));
    for (const group of index.groups) {
      const container = actual.filter(marker => group.ids.some(id => marker.ids.includes(id)));
      assert.equal(container.length,1); assert.ok(group.ids.every(id=>container[0].ids.includes(id)), 'Terminal members never split');
    }
    for(const item of actual){
      assert.equal(item.count,item.ids.length);
      if(item.kind==='aggregate'){
        assert.ok(item.expansionZoom!>Math.floor(clampMapZoom(zoom))&&item.expansionZoom!<=MAP_MAX_ZOOM);
        assert.equal(mapFixedGroup(index,item.ids),null,'Outer aggregates cannot authorize a modal');
      }else {
        assert.equal(mapFixedGroup(index,item.ids)?.key,item.key);
        assert.equal(item.expansionZoom,undefined,'Exposed terminal groups open without another zoom');
      }
    }
    assert.deepEqual(index.groups.map(group => ({key:group.key,ids:[...group.ids],count:group.count,presence:group.presence})),expected);
    if(zoom>=MAP_MAX_ZOOM)assert.deepEqual(actual.map(({key,ids,count,presence})=>({key,ids,count,presence})),expected);
  }
  assert.equal(mapFixedGroup(index, [3, 1, 2])?.presence, 'featured');
  assert.deepEqual(mapClusterMarkers(index, world, normalizeNativeMapZoom(17)), mapClusterMarkers(index, world, MAP_MAX_ZOOM));
});

test('S140 exposed final groups open below maximum while hidden subgroups and stale membership remain denied', () => {
  const source = [point(1,38.75,9.03),point(2,38.75,9.03),point(3,38.75,9.03),
    point(4,38.77,9.03),point(5,38.77,9.03),point(6,38.77,9.03)];
  const index=mapClusterIndex(source,3),world:MapClusterBounds=[-180,-85,180,85];
  const outer=mapClusterMarkers(index,world,6);
  assert.equal(outer.length,1);assert.equal(outer[0].kind,'aggregate');assert.equal(outer[0].count,6);
  assert.ok(outer[0].expansionZoom!>6&&outer[0].expansionZoom!<=MAP_CITY_ZOOM,'A fitting terminal layout expands to its next visible level, no farther than city scale');
  for(const fixed of index.groups){assert.equal(mapExposedGroup(index,fixed.ids,6),null,'Known final IDs cannot bypass a current outer aggregate');}
  assert.equal(mapExposedGroup(index,outer[0].ids,6),null,'An outer count does not authorize a picker');
  const exposed=mapClusterMarkers(index,world,13);
  assert.equal(exposed.length,2);assert.ok(exposed.every(item=>item.kind==='cluster'&&item.count===3&&item.expansionZoom===undefined));
  for(const item of exposed){
    assert.equal(mapExposedGroup(index,item.ids,13)?.key,item.key);
    assert.equal(mapExposedGroup(index,item.ids,normalizeNativeMapZoom(12))?.key,item.key,'Native raw12 has identical terminal authority');
    assert.equal(mapExposedGroup(index,item.ids.slice(0,2),13),null,'A fabricated subset is not a current terminal');
    assert.equal(mapExposedGroup(mapClusterIndex(source,6),item.ids,13),null,'Capacity repartition invalidates the old group');
  }
  const filtered=mapClusterIndex(source.filter(point=>point.id!==1),3);
  assert.equal(mapExposedGroup(filtered,[1,2,3],13),null,'A removed public member cannot be restored');
  const only=mapClusterIndex(source.slice(0,3),3);
  for(const zoom of[1,6,13,MAP_MAX_ZOOM])assert.equal(mapExposedGroup(only,[1,2,3],zoom)?.key,'cluster:1-2-3','A sole bounded terminal needs no street-detail threshold');
});

test('restored references require exact current fixed membership after filtering/repartition', () => {
  const four = [1, 2, 3, 4].map(id => point(id)), initial = mapClusterIndex(four);
  assert.equal(mapFixedGroup(initial, [2, 1])?.key, 'cluster:1-2');
  for (const stale of [[1], [1, 1], [1, 999], [1, 2, 3, 4], [Number.NaN]]) assert.equal(mapFixedGroup(initial, stale), null);
  const five = mapClusterIndex([...four, point(5)]);
  assert.equal(mapFixedGroup(five, [1, 2]), null, 'Old pair cannot authorize a subset of the new triple');
  assert.equal(mapFixedGroup(five, [3, 2, 1])?.key, 'cluster:1-2-3');
  assert.equal(mapFixedGroup(mapClusterIndex([point(1), point(3), point(4), point(5)]), [1, 2, 3]), null);
  const result = mapClusterMarkers(five, world, MAP_MAX_ZOOM);
  result[0].ids.push(999); result[0].anchor[0] = 0; result[0].center[0] = 100;
  assert.equal(mapFixedGroup(five, [1, 2, 3])?.ids.includes(999), false);
  assert.deepEqual(mapClusterMarkers(five, world, MAP_MAX_ZOOM)[0].ids, [1, 2, 3]);
  const exposed=mapExposedGroup(five,[1,2,3],12)!;exposed.ids.push(999);exposed.center[0]=100;
  assert.deepEqual(mapExposedGroup(five,[1,2,3],12)?.ids,[1,2,3],'Returned display authority cannot mutate the cached full-scope layout');
});

test('200coincident shops have67 separate clickable2/3 markers at detail zoom with true immutable anchors', () => {
  assert.equal(MAP_GROUP_FANOUT_PITCH, 56); assert.equal(MAP_GROUP_FANOUT_ATTEMPTS, 4096);
  const source = Array.from({length: 200}, (_, index) => point(index + 1, 38.75, 9.03));
  const index = mapClusterIndex(source), markers = mapClusterMarkers(index, world, MAP_MAX_ZOOM);
  assert.equal(markers.length, 67);
  assert.equal(markers.filter(marker => marker.count === 2).length, 1);
  assert.equal(markers.filter(marker => marker.count === 3).length, 66);
  assert.equal(new Set(markers.map(marker => marker.center.join(','))).size, 67);
  for (const marker of markers) assert.deepEqual(marker.anchor, [38.75, 9.03]);
  for (let left = 0; left < markers.length; left += 1) for (let right = left + 1; right < markers.length; right += 1) {
    const a = pixel(markers[left].center, MAP_MAX_ZOOM), b = pixel(markers[right].center, MAP_MAX_ZOOM);
    assert.ok(Math.abs(a[0] - b[0]) >= 55.99 || Math.abs(a[1] - b[1]) >= 55.99, '48px badges retain8px separation');
  }
  assert.deepEqual(markers, mapClusterMarkers(mapClusterIndex([...source].reverse()), world, MAP_MAX_ZOOM));
  assert.deepEqual(source[0], point(1, 38.75, 9.03));
});

test('full-scope fanout precedes viewport filtering and panning reveals displaced offscreen-anchor groups', () => {
  const index = mapClusterIndex(Array.from({length: 30}, (_, item) => point(item + 1, 38.75, 9.03)));
  const all = mapClusterMarkers(index, world, MAP_MAX_ZOOM);
  const displaced = all.find(marker => Math.abs(marker.center[0] - marker.anchor[0]) > .00001)!;
  assert.ok(displaced);
  const [longitude, latitude] = displaced.center;
  const bounds: MapClusterBounds = [longitude - .000001, latitude - .000001, longitude + .000001, latitude + .000001];
  assert.ok(displaced.anchor[0] < bounds[0] || displaced.anchor[0] > bounds[2]);
  assert.deepEqual(mapClusterMarkers(index, bounds, MAP_MAX_ZOOM), [displaced]);
  assert.deepEqual(mapClusterMarkers(index, world, MAP_MAX_ZOOM), all, 'Panning never repacks the group set');
});

test('dateline neighborhoods and wrapped visible worlds retain exact membership without duplicates', () => {
  const index = mapClusterIndex([point(1, 179.9999), point(2, -179.9999), point(3, 0)]);
  assert.deepEqual(index.groups.find(group => group.kind === 'cluster')?.ids, [1, 2]);
  assert.ok(Math.abs(Math.abs(mapFixedGroup(index, [1, 2])!.anchor[0]) - 180) < .00001);
  const normal = mapClusterMarkers(index, [170, -10, 190, 10], MAP_MAX_ZOOM);
  assert.deepEqual(normal.flatMap(marker => marker.ids), [1, 2]);
  assert.deepEqual(mapClusterMarkers(index, [170, -10, -170, 10], MAP_MAX_ZOOM), normal);
  assert.deepEqual(mapClusterMarkers(index, [530, -10, 550, 10], MAP_MAX_ZOOM), normal);
  assert.deepEqual(mapClusterMarkers(index, [-190, -10, -170, 10], MAP_MAX_ZOOM), normal);
  assert.deepEqual(mapClusterMarkers(index, [-10, -10, 10, 10], MAP_MAX_ZOOM).flatMap(marker => marker.ids), [3]);
  assert.deepEqual(mapClusterMarkers(index, [0, 10, 20, -10], MAP_MAX_ZOOM), []);
  assert.deepEqual(mapClusterMarkers(index, [Number.NaN, 0, 20, 10], MAP_MAX_ZOOM), []);
});

test('bounded whole-world/polar fallback keeps every ID and never enlarges fixed groups', () => {
  const source = [
    ...Array.from({length: 100}, (_, item) => point(item + 1, -179 + item % 20 * MAP_MAX_ZOOM, -72 + Math.floor(item / 20) * 32)),
    ...Array.from({length: 100}, (_, item) => point(item + 101, 38.75, 85.051129)),
  ];
  const index = mapClusterIndex(source);
  for (const zoom of [1, MAP_MAX_ZOOM]) {
    const markers = mapClusterMarkers(index, world, zoom);
    assert.deepEqual(markers.flatMap(marker => marker.ids).sort((a, b) => a - b), source.map(row => row.id));
    assert.ok(markers.every(marker => marker.count >= 1 && (marker.kind === 'aggregate' || marker.count <= 3)));
    assert.ok(markers.every(marker => marker.center.every(Number.isFinite) && Math.abs(marker.center[1]) <= 85.051129));
  }
});

test('one all-fit sizing policy admits desktop6/phone3, compact short rows and no paging or truncation', () => {
  assert.equal(MAP_GROUP_ROW_HEIGHT, 108); assert.equal(MAP_GROUP_COMPACT_ROW_HEIGHT, 84);
  assert.equal(mapGroupCapacity(1440, 800), 6); assert.equal(mapGroupCapacity(320, 456), 3);
  assert.equal(mapGroupCapacity(296, 388), 3); assert.equal(mapGroupCapacity(296, 388, 2), 1);
  const normal = mapGroupPickerLayout(320, 456, 1, 3);
  assert.deepEqual(normal, {admitted:true,capacity:3,pageSize:3,paged:false,chromeHeight:112,rowHeight:108,compact:false});
  assert.equal(mapGroupPickerLayout(296,388,1,3).rowHeight,84);
  const desktop=mapGroupPickerLayout(760,800,1,6);
  assert.equal(desktop.admitted,true);assert.equal(desktop.pageSize,6);assert.equal(desktop.paged,false);
  const enlarged=mapGroupPickerLayout(296,388,2,1);
  assert.equal(enlarged.admitted,true);assert.equal(enlarged.pageSize,1);assert.equal(enlarged.rowHeight,164);assert.equal(enlarged.paged,false);
  const stale=mapGroupPickerLayout(296,388,2,3);
  assert.equal(stale.admitted,false);assert.equal(stale.pageSize,0);assert.equal(stale.paged,false);
  assert.equal(mapGroupChromeHeight(1.5),264);assert.equal(mapGroupDirectChromeHeight(1.5),168);
  for(const width of [296,390,599,600,1440])for(const height of [240,296,388,456,800])for(const scale of [1,1.25,1.5,2]){
    const capacity=mapGroupCapacity(width,height,scale);
    assert.ok(capacity>=1&&capacity<=(width>=600?6:3));
    for(const count of [1,2,3,4,5,6,200]){
      const layout=mapGroupPickerLayout(width,height,scale,count);
      assert.equal(layout.paged,false);assert.equal(layout.admitted,count<=capacity);
      assert.equal(layout.pageSize,layout.admitted?count:0);
      assert.equal(mapGroupPageSize(width,height,scale,count),layout.pageSize);
      if(layout.admitted&&mapGroupDirectChromeHeight(scale)+108<=height){
        const rows=Math.ceil(count/(width>=600?2:1));
        assert.ok(layout.chromeHeight+rows*layout.rowHeight+(rows-1)*8<=height);
      }
    }
  }
  assert.equal(mapGroupPickerLayout(390,800,1,Number.NaN).admitted,false);
  assert.equal(mapGroupPickerLayout(390,800,1,0).admitted,false);
  assert.equal(mapGroupPageSize(Number.NaN,Number.NaN),0);
});

test('capacities1through6 preserve every current member and distinguish forced circles from truly isolated shops',()=>{
  const source=[...Array.from({length:13},(_,index)=>point(index+1,38.75,9.03)),point(99,50,20)];
  for(let capacity=1;capacity<=6;capacity++){
    const index=mapClusterIndex(source,capacity),cohort=index.groups.filter(group=>!group.ids.includes(99));
    assert.equal(index.capacity,capacity);
    assert.deepEqual(index.groups.flatMap(group=>[...group.ids]).sort((a,b)=>a-b),source.map(row=>row.id));
    assert.ok(cohort.every(group=>group.kind==='cluster'&&group.count<=capacity));
    const forced=cohort.filter(group=>group.count===1);
    assert.equal(forced.length,capacity===1?13:capacity===2?1:0);
    assert.equal(index.groups.find(group=>group.ids.includes(99))?.kind,'shop');
    for(const group of index.groups)assert.equal(mapFixedGroup(index,[...group.ids].reverse())?.key,group.key);
    const initial=index.groups.map(group=>({key:group.key,ids:[...group.ids],count:group.count}));
    for(const zoom of [1,6,14,MAP_MAX_ZOOM]){
      const markers=mapClusterMarkers(index,world,zoom);
      assert.deepEqual(markers.flatMap(marker=>marker.ids).sort((a,b)=>a-b),source.map(row=>row.id));
      if(zoom===MAP_MAX_ZOOM)assert.deepEqual(markers.map(({key,ids,count})=>({key,ids,count})),initial);
    }
  }
  const desktop=mapClusterIndex(Array.from({length:6},(_,index)=>point(index+1,longitudeAtMeters(index*100))),6);
  assert.deepEqual(desktop.groups.map(group=>group.count),[6],'Comfortably close shops use desktop capacity rather than needless pairs');
  const old=mapClusterIndex(Array.from({length:6},(_,index)=>point(index+1)),3);
  const resized=mapClusterIndex(Array.from({length:6},(_,index)=>point(index+1)),6);
  assert.ok(mapFixedGroup(old,[1,2,3]));assert.equal(mapFixedGroup(resized,[1,2,3]),null);
  assert.equal(mapFixedGroup(resized,[6,5,4,3,2,1])?.count,6);
  assert.equal(mapClusterIndex([point(1),point(2)],99).capacity,6);
  assert.equal(mapClusterIndex([point(1),point(2)],Number.NaN).capacity,3);
});

const haversine = (a: MapClusterPoint, b: MapClusterPoint): number => {
  const radians = Math.PI / 180, x = (a.latitude - b.latitude) * radians, y = (a.longitude - b.longitude) * radians;
  const value = Math.sin(x / 2) ** 2 + Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * Math.sin(y / 2) ** 2;
  return 12_742_000 * Math.asin(Math.sqrt(Math.min(1, value)));
};
const partitionCost = (groups: readonly (readonly MapClusterPoint[])[]) => {
  const widths = groups.map(group => Math.max(0, ...group.flatMap(left => group.map(right => haversine(left, right)))));
  return {maximum: Math.max(...widths), total: widths.reduce((sum, value) => sum + value, 0)};
};
function nearestOrder(points: readonly MapClusterPoint[]): MapClusterPoint[] {
  const remaining = new Set(points), result: MapClusterPoint[] = [];
  let current = [...points].sort((left, right) => left.latitude - right.latitude || left.longitude - right.longitude || left.id - right.id)[0];
  while (remaining.size) {
    result.push(current); remaining.delete(current);
    const next = [...remaining].sort((left, right) => haversine(current, left) - haversine(current, right) || left.id - right.id)[0];
    if (next) current = next;
  }
  return result;
}

test('compact partitions avoid needless remote branch jumps, including63/183 where all-triples cannot',()=>{
  for(const lengths of [[20,20,20],[20,21,21],[60,60,60],[60,61,61]]){
    const points=[point(1,38.75,9.03)];let id=2;
    for(let branch=0;branch<3;branch++)for(let step=1;step<=lengths[branch];step++){
      const angle=[0,120,240][branch]*Math.PI/180,distance=step*700;
      points.push(point(id++,38.75+Math.sin(angle)*distance/(111195*Math.cos(9.03*Math.PI/180)),9.03+Math.cos(angle)*distance/111195));
    }
    const index=mapClusterIndex(points,3),byId=new Map(points.map(row=>[row.id,row]));
    const actual=index.groups.map(group=>group.ids.map(id=>byId.get(id)!));
    assert.ok(partitionCost(actual).maximum<MAP_GROUP_DISTANCE_METERS+1);
    assert.ok(index.groups.length>=Math.ceil(points.length/3));
    assert.ok(index.groups.length<=Math.floor(points.length/2));
    assert.ok(index.groups.every(group=>group.count===2||group.count===3));
    const order=nearestOrder(points),positions=new Map(order.map((row,offset)=>[row.id,offset]));
    const intervals=index.groups.map(group=>group.ids.map(id=>positions.get(id)!).sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0]);
    assert.deepEqual(intervals.flat(),order.map((_,offset)=>offset));
    assert.ok(intervals.every(interval=>interval.at(-1)!-interval[0]+1===interval.length));
    assert.deepEqual(index.groups,mapClusterIndex([...points].reverse(),3).groups);
  }
});

test('adaptive two-pass comfort-budget/count/diameter objective matches brute-force any-chunk oracle',()=>{
  let seed=17,cases=0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let count=2;count<=12;count++)for(let capacity=2;capacity<=6;capacity++)for(let attempt=0;attempt<6;attempt++){
    // A walk with sub-neighborhood edges guarantees one connected neighborhood.
    const points:MapClusterPoint[]=[];let longitude=38,latitude=9;
    for(let offset=0;offset<count;offset++){longitude+=(random()-.5)*.004;latitude+=(random()-.5)*.004;points.push(point(offset+1,longitude,latitude));}
    const order=nearestOrder(points),forced=capacity===2&&count%2===1?1:0;
    const candidates:Array<{maximum:number;total:number;count:number}>=[];
    const enumerate=(position:number,remainingSingles:number,groups:MapClusterPoint[][])=>{
      if(position===order.length){if(remainingSingles===0)candidates.push({...partitionCost(groups),count:groups.length});return;}
      for(let size=capacity;size>=2;size--)if(position+size<=order.length)enumerate(position+size,remainingSingles,[...groups,order.slice(position,position+size)]);
      if(remainingSingles)enumerate(position+1,remainingSingles-1,[...groups,order.slice(position,position+1)]);
    };
    enumerate(0,forced,[]);
    const limit=Math.max(MAP_GROUP_DISTANCE_METERS,Math.min(...candidates.map(candidate=>candidate.maximum)));
    const valid=candidates.filter(candidate=>candidate.maximum<=limit);
    const minimumCount=Math.min(...valid.map(candidate=>candidate.count));
    const minimumTotal=Math.min(...valid.filter(candidate=>candidate.count===minimumCount).map(candidate=>candidate.total));
    const byId=new Map(points.map(row=>[row.id,row])),index=mapClusterIndex(points,capacity);
    const actual=partitionCost(index.groups.map(group=>group.ids.map(id=>byId.get(id)!)));
    assert.ok(actual.maximum<=limit+1e-8);assert.equal(index.groups.length,minimumCount);
    assert.ok(Math.abs(actual.total-minimumTotal)<1e-6);
    cases++;
  }
  assert.equal(cases,330);
});

test('plain-circle display positions stay within finite10km while broad hierarchy retains honest centroids',()=>{
  assert.equal(MAP_GROUP_MAX_DISPLACEMENT_METERS,5000); assert.equal(MAP_GROUP_OVERFLOW_DISPLACEMENT_METERS,10000);
  for(const latitude of [9.03,85.051129,-85.051129])for(const capacity of [1,3,6]){
    const index=mapClusterIndex(Array.from({length:30},(_,item)=>point(item+1,38.75,latitude)),capacity);
    const keys=index.groups.map(group=>group.key);
    for(const zoom of [1,3.5,6,10,14,MAP_MAX_ZOOM]){
      const markers=mapClusterMarkers(index,world,zoom);
      assert.deepEqual(markers.flatMap(marker=>marker.ids).sort((a,b)=>a-b),Array.from({length:30},(_,item)=>item+1));
      if(zoom===MAP_MAX_ZOOM)assert.deepEqual(markers.map(marker=>marker.key),keys);
      for(const marker of markers)assert.ok(haversine(point(1,...marker.anchor),point(2,...marker.center))<=MAP_GROUP_OVERFLOW_DISPLACEMENT_METERS+.00001);
      if(latitude===9.03&&zoom<=6)assert.ok(markers.every(marker=>marker.center[0]===marker.anchor[0]&&marker.center[1]===marker.anchor[1]),'Wide map must not manufacture remote badge locations');
    }
  }
  const dense=mapClusterMarkers(mapClusterIndex(Array.from({length:200},(_,item)=>({...point(item+1,38.75,9.03),locationMode:'area' as const})),1),world,MAP_MAX_ZOOM);
  assert.equal(dense.length,200);assert.ok(dense.every(marker=>marker.kind==='shop'&&marker.count===1));
  for(let left=0;left<dense.length;left++)for(let right=left+1;right<dense.length;right++){
    const a=pixel(dense[left].center,MAP_MAX_ZOOM),b=pixel(dense[right].center,MAP_MAX_ZOOM);
    assert.ok(Math.abs(a[0]-b[0])>=47.99||Math.abs(a[1]-b[1])>=49.99,'Compact city-only shop glyphs and locality chips do not overlap');
  }
});

function assertSeparated(markers: ReturnType<typeof mapClusterMarkers>, zoom: number): void {
  const size=256*2**zoom;
  for(let left=0;left<markers.length;left++)for(let right=left+1;right<markers.length;right++){
    const a=pixel(markers[left].center,zoom),b=pixel(markers[right].center,zoom);
    const dx=Math.abs(a[0]-b[0])%size;
    assert.ok(Math.min(dx,size-dx)>=55.99||Math.abs(a[1]-b[1])>=55.99,'Every48px circle retains8px clearance, including wrapped worlds');
  }
}

test('S154 dense city overflow stays aggregated until one bounded district expansion with no hidden modal bypass',()=>{
  const source=Array.from({length:200},(_,item)=>point(item+1,0,0)), before=JSON.stringify(source);
  const index=mapClusterIndex(source,1),city=mapClusterMarkers(index,world,MAP_CITY_ZOOM);
  assert.equal(city.length,1);assert.equal(city[0].kind,'aggregate');assert.equal(city[0].count,200);
  assert.equal(city[0].expansionZoom,MAP_MAX_ZOOM);
  for(const group of index.groups)assert.equal(mapExposedGroup(index,group.ids,MAP_CITY_ZOOM),null,'A hidden fixed leaf never authorizes a modal');
  const district=mapClusterMarkers(index,world,city[0].expansionZoom!);
  assert.equal(district.length,200);assert.ok(district.every(item=>item.kind==='shop'&&item.count===1&&item.expansionZoom===undefined));
  assert.deepEqual(district.flatMap(item=>item.ids).sort((a,b)=>a-b),source.map(item=>item.id));assertSeparated(district,MAP_MAX_ZOOM);
  assert.ok(district.some(item=>haversine(point(1,...item.anchor),point(2,...item.center))>MAP_GROUP_MAX_DISPLACEMENT_METERS),'The finite10km fallback is necessary for200 coincident targets');
  for(const item of district){assert.deepEqual(item.anchor,[0,0]);assert.ok(haversine(point(1,...item.anchor),point(2,...item.center))<=10000.00001);assert.equal(mapExposedGroup(index,item.ids,MAP_MAX_ZOOM)?.key,item.key);}
  assert.equal(JSON.stringify(source),before);
});

test('S154 bounded final layout qualifies200 targets at equator, dateline and both projected polar edges',()=>{
  for(const [longitude,latitude] of [[0,0],[179.9999,0],[-179.9999,9.03],[38.75,85.051129],[38.75,-85.051129]])for(const capacity of [1,3,6]){
    const source=Array.from({length:200},(_,item)=>point(item+1,longitude,latitude)),index=mapClusterIndex(source,capacity);
    const final=mapClusterMarkers(index,world,MAP_MAX_ZOOM);
    assert.equal(final.length,index.groups.length);assert.ok(final.every(item=>item.count===1?item.kind==='shop':item.kind==='cluster'&&item.count<=capacity));assertSeparated(final,MAP_MAX_ZOOM);
    assert.deepEqual(final.flatMap(item=>item.ids).sort((a,b)=>a-b),source.map(item=>item.id));
    for(const item of final){assert.ok(item.center.every(Number.isFinite));assert.ok(Math.abs(item.center[1])<=85.051129);assert.ok(haversine(point(1,...item.anchor),point(2,...item.center))<=10000.00001);}
    assert.deepEqual(final,mapClusterMarkers(mapClusterIndex([...source].reverse(),capacity),world,MAP_MAX_ZOOM));
  }
});

test('S154 near-coincident200 anchors share fallback spacing rather than overlapping independent grid phases',()=>{
  let seed=217;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(const jitter of [.00001,.001,.01,.03]){
    const source=Array.from({length:200},(_,item)=>point(item+1,(random()-.5)*jitter,(random()-.5)*jitter));
    const index=mapClusterIndex(source,1),final=mapClusterMarkers(index,world,MAP_MAX_ZOOM);
    assert.equal(final.length,200);assertSeparated(final,MAP_MAX_ZOOM);
    assert.deepEqual(final.flatMap(item=>item.ids).sort((a,b)=>a-b),source.map(item=>item.id));
    for(const item of final)assert.ok(haversine(point(1,...item.anchor),point(2,...item.center))<=10000.00001);
  }
});

test('S154 ordinary city groups use minimal nearby positions and panning never repacks their full-scope layout',()=>{
  const source=Array.from({length:21},(_,item)=>mapDisplayLocation({...point(item+1,38.75,9.03),locationMode:'area' as const}));
  const index=mapClusterIndex(source,3),city=mapClusterMarkers(index,world,MAP_CITY_ZOOM);assertSeparated(city,MAP_CITY_ZOOM);
  assert.ok(city.every(item=>haversine(point(1,...item.anchor),point(2,...item.center))<=5000.00001),'Ordinary current city groups need no10km fallback');
  const chosen=city.find(item=>item.center[0]!==item.anchor[0])!;assert.ok(chosen);
  const [x,y]=chosen.center, bounds:MapClusterBounds=[x-.000001,y-.000001,x+.000001,y+.000001];
  assert.deepEqual(mapClusterMarkers(index,bounds,MAP_CITY_ZOOM),[chosen]);
  assert.deepEqual(mapClusterMarkers(index,world,MAP_CITY_ZOOM),city);
});

test('outer counts sum real shops and expansion progresses to exact all-fit terminal groups',()=>{
  const source=[...Array.from({length:3},(_,item)=>({...point(item+1,38.75,9.03),featured:item===0})),
    ...Array.from({length:2},(_,item)=>({...point(item+4,38.79,9.03),live:true})),point(6,38.83,9.03)];
  const index=mapClusterIndex(source,3), broad=mapClusterMarkers(index,world,6);
  assert.equal(index.groups.length,3); assert.equal(broad.length,1);
  assert.equal(broad[0].kind,'aggregate'); assert.equal(broad[0].count,6,'Three terminal points represent six businesses');
  assert.equal(broad[0].presence,'featured');assert.deepEqual(broad[0].ids,[1,2,3,4,5,6]);
  assert.deepEqual(broad[0].center,broad[0].anchor);assert.equal(mapFixedGroup(index,broad[0].ids),null);
  let expansion=broad[0].expansionZoom!, expanded=mapClusterMarkers(index,world,expansion), attempts=0;
  while(expanded.length===1&&expanded[0].kind==='aggregate'&&expanded[0].expansionZoom!==undefined&&attempts++<MAP_MAX_ZOOM){
    expansion=expanded[0].expansionZoom!;expanded=mapClusterMarkers(index,world,expansion);
  }
  assert.ok(expanded.length>1,'Repeated meaningful expansion steps eventually separate the visible member groups');
  assert.deepEqual(expanded.flatMap(item=>item.ids).sort((a,b)=>a-b),broad[0].ids);
  const leaves=mapClusterMarkers(index,world,MAP_MAX_ZOOM);
  assert.deepEqual(leaves.map(item=>item.key).sort(),index.groups.map(group=>group.key).sort());
  assert.ok(leaves.every(item=>item.kind!=='aggregate'&&item.expansionZoom===undefined));
  assert.deepEqual(leaves.find(item=>item.count===3)?.ids,[1,2,3]);
  assert.deepEqual(leaves.find(item=>item.count===2)?.ids,[4,5]);
  assert.equal(leaves.find(item=>item.count===1)?.kind,'shop');
  const singleTerminal=mapClusterIndex(Array.from({length:6},(_,item)=>point(item+1,38.75,9.03)),6);
  assert.equal(mapClusterMarkers(singleTerminal,world,1)[0].kind,'cluster','One terminal group never becomes a fake outer aggregate');
  for(const zoom of [1,6,14,17,17.999,MAP_MAX_ZOOM]){assert.equal(mapClusterMarkers(singleTerminal,world,zoom)[0].expansionZoom,undefined,'A current final circle needs no extra camera movement');assert.ok(mapExposedGroup(singleTerminal,[1,2,3,4,5,6],zoom),'Exact current terminal membership is exposed at its existing camera');}
  assert.equal(mapFixedGroup(singleTerminal,[1,2,3,4,5,6])?.expansionZoom,undefined,'Exact membership lookup does not invent a camera action');
  assert.equal(mapClusterMarkers(mapClusterIndex([point(99)]),world,1)[0].expansionZoom,undefined,'Genuinely isolated shop preview remains direct');
  const filtered=mapClusterIndex(source.filter(item=>item.id!==6));
  assert.deepEqual(mapClusterMarkers(filtered,world,6).flatMap(item=>item.ids),[1,2,3,4,5]);
  broad[0].ids.push(999);broad[0].center[0]=0;
  assert.deepEqual(mapClusterMarkers(index,world,6)[0].ids,[1,2,3,4,5,6]);
});

test('hierarchy handles nearby dateline terminal groups and exact public scope at every integer zoom',()=>{
  const source=[point(1,179.99),point(2,179.99),point(3,-179.99),point(4,-179.99)];
  const index=mapClusterIndex(source),broad=mapClusterMarkers(index,world,6);
  assert.equal(index.groups.length,2);assert.equal(broad.length,1);assert.equal(broad[0].kind,'aggregate');
  assert.equal(broad[0].count,4);assert.ok(Math.abs(Math.abs(broad[0].anchor[0])-180)<.001);
  assert.deepEqual(mapClusterMarkers(index,[170,-10,-170,10],6),broad);
  assert.deepEqual(mapClusterMarkers(index,[530,-10,550,10],6),broad);
  const dense=mapClusterIndex(Array.from({length:200},(_,item)=>point(item+1,38.75,9.03)),1);
  for(let zoom=1;zoom<=MAP_MAX_ZOOM;zoom++){
    const markers=mapClusterMarkers(dense,world,zoom),ids=markers.flatMap(item=>item.ids);
    assert.equal(ids.length,200);assert.equal(new Set(ids).size,200);
    assert.ok(markers.every(item=>item.count===item.ids.length));
    if(zoom<MAP_MAX_ZOOM){assert.equal(markers.length,1);assert.equal(markers[0].kind,'aggregate');assert.equal(markers[0].expansionZoom,MAP_MAX_ZOOM);}
    else assert.ok(markers.every(item=>item.kind==='shop'&&item.count===1));
  }
  assert.deepEqual(mapClusterMarkers(index,world,MAP_MAX_ZOOM),mapClusterMarkers(index,world,normalizeNativeMapZoom(17)));
  assert.deepEqual(mapClusterMarkers(index,world,6),mapClusterMarkers(mapClusterIndex([...source].reverse()),world,6));
});

test('fixed neighborhood membership survives screen partitions that render one-member shop glyphs',()=>{
  const source=[point(1),point(2,longitudeAtMeters(1500)),point(3,longitudeAtMeters(2999)),point(99,1)];
  for(const capacity of [1,2,3,4,5,6]){
    const index=mapClusterIndex(source,capacity);
    for(const item of source){
      const hasPeer=source.some(peer=>peer.id!==item.id&&haversine(item,peer)<=MAP_GROUP_DISTANCE_METERS);
      const terminal=index.groups.find(group=>group.ids.includes(item.id))!;
      assert.equal(terminal.kind,hasPeer?'cluster':'shop');
      if(hasPeer&&terminal.count===1)assert.ok(capacity===1||capacity===2,'Only unavoidable capacity remainders become counted singletons');
    }
    assert.equal(index.groups.find(group=>group.ids.includes(99))?.key,'shop:99');
  }
});

console.log('Hierarchical all-fit terminal map grouping: '+passed+' focused contracts passed.');
