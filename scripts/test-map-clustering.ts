import assert from 'node:assert/strict';
import {
  MAP_MAX_ZOOM, MAP_NATIVE_MAX_ZOOM, MAP_GROUP_DISTANCE_METERS, MAP_GROUP_MAX_MEMBERS, MAP_GROUP_DEFAULT_CAPACITY,
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

test('fixed3km neighborhoods, independent800meter display cap and matched final scale', () => {
  assert.equal(MAP_GROUP_DISTANCE_METERS, 3000); assert.equal(MAP_GROUP_MAX_DISPLACEMENT_METERS,800);
  assert.equal(MAP_GROUP_MAX_MEMBERS, 6); assert.equal(MAP_GROUP_DEFAULT_CAPACITY, 3);
  assert.equal(MAP_MAX_ZOOM, 18); assert.equal(MAP_NATIVE_MAX_ZOOM, 17);
  assert.equal(clampMapZoom(19), 18); assert.equal(clampMapZoom(0), 1);
  assert.equal(clampMapZoom(Number.NaN), 6); assert.equal(clampMapZoom(17.75), 17.75);
  assert.equal(normalizeNativeMapZoom(17), 18); assert.equal(normalizeNativeMapZoom(1), 2);
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
  assert.doesNotMatch(JSON.stringify(mapClusterMarkers(index, world, 18)), /not public marker payload/);
  assert.deepEqual(mapClusterMarkers(mapClusterIndex([]), world, 18), []);
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
  for (const zoom of [1, 3.5, 6, 13, 14, 17.5, 18, 19, 100]) {
    const actual = mapClusterMarkers(index, world, zoom);
    assert.deepEqual(actual.flatMap(marker => marker.ids).sort((a,b)=>a-b), source.map(row=>row.id));
    for (const group of index.groups) {
      const container = actual.filter(marker => group.ids.some(id => marker.ids.includes(id)));
      assert.equal(container.length,1); assert.ok(group.ids.every(id=>container[0].ids.includes(id)), 'Terminal members never split');
    }
    for(const item of actual){
      assert.equal(item.count,item.ids.length);
      if(item.kind==='aggregate'){
        assert.ok(item.expansionZoom!>Math.floor(clampMapZoom(zoom))&&item.expansionZoom!<=18);
        assert.equal(mapFixedGroup(index,item.ids),null,'Outer aggregates cannot authorize a modal');
      }else {
        assert.equal(mapFixedGroup(index,item.ids)?.key,item.key);
        assert.equal(item.expansionZoom,undefined,'Exposed terminal groups open without another zoom');
      }
    }
    assert.deepEqual(index.groups.map(group => ({key:group.key,ids:[...group.ids],count:group.count,presence:group.presence})),expected);
    if(zoom>=18)assert.deepEqual(actual.map(({key,ids,count,presence})=>({key,ids,count,presence})),expected);
  }
  assert.equal(mapFixedGroup(index, [3, 1, 2])?.presence, 'featured');
  assert.deepEqual(mapClusterMarkers(index, world, normalizeNativeMapZoom(17)), mapClusterMarkers(index, world, 18));
});

test('S140 exposed final groups open below maximum while hidden subgroups and stale membership remain denied', () => {
  const source = [point(1,38.75,9.03),point(2,38.75,9.03),point(3,38.75,9.03),
    point(4,38.77,9.03),point(5,38.77,9.03),point(6,38.77,9.03)];
  const index=mapClusterIndex(source,3),world:MapClusterBounds=[-180,-85,180,85];
  const outer=mapClusterMarkers(index,world,6);
  assert.equal(outer.length,1);assert.equal(outer[0].kind,'aggregate');assert.equal(outer[0].count,6);
  assert.equal(outer[0].expansionZoom,13,'The existing normal hierarchy expansion is unchanged');
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
  for(const zoom of[1,6,13,18])assert.equal(mapExposedGroup(only,[1,2,3],zoom)?.key,'cluster:1-2-3','A sole bounded terminal needs no street-detail threshold');
});

test('restored references require exact current fixed membership after filtering/repartition', () => {
  const four = [1, 2, 3, 4].map(id => point(id)), initial = mapClusterIndex(four);
  assert.equal(mapFixedGroup(initial, [2, 1])?.key, 'cluster:1-2');
  for (const stale of [[1], [1, 1], [1, 999], [1, 2, 3, 4], [Number.NaN]]) assert.equal(mapFixedGroup(initial, stale), null);
  const five = mapClusterIndex([...four, point(5)]);
  assert.equal(mapFixedGroup(five, [1, 2]), null, 'Old pair cannot authorize a subset of the new triple');
  assert.equal(mapFixedGroup(five, [3, 2, 1])?.key, 'cluster:1-2-3');
  assert.equal(mapFixedGroup(mapClusterIndex([point(1), point(3), point(4), point(5)]), [1, 2, 3]), null);
  const result = mapClusterMarkers(five, world, 18);
  result[0].ids.push(999); result[0].anchor[0] = 0; result[0].center[0] = 100;
  assert.equal(mapFixedGroup(five, [1, 2, 3])?.ids.includes(999), false);
  assert.deepEqual(mapClusterMarkers(five, world, 18)[0].ids, [1, 2, 3]);
});

test('200coincident shops have67 separate clickable2/3 markers at detail zoom with true immutable anchors', () => {
  assert.equal(MAP_GROUP_FANOUT_PITCH, 56); assert.equal(MAP_GROUP_FANOUT_ATTEMPTS, 4096);
  const source = Array.from({length: 200}, (_, index) => point(index + 1, 38.75, 9.03));
  const index = mapClusterIndex(source), markers = mapClusterMarkers(index, world, 18);
  assert.equal(markers.length, 67);
  assert.equal(markers.filter(marker => marker.count === 2).length, 1);
  assert.equal(markers.filter(marker => marker.count === 3).length, 66);
  assert.equal(new Set(markers.map(marker => marker.center.join(','))).size, 67);
  for (const marker of markers) assert.deepEqual(marker.anchor, [38.75, 9.03]);
  for (let left = 0; left < markers.length; left += 1) for (let right = left + 1; right < markers.length; right += 1) {
    const a = pixel(markers[left].center, 18), b = pixel(markers[right].center, 18);
    assert.ok(Math.abs(a[0] - b[0]) >= 55.99 || Math.abs(a[1] - b[1]) >= 55.99, '48px badges retain8px separation');
  }
  assert.deepEqual(markers, mapClusterMarkers(mapClusterIndex([...source].reverse()), world, 18));
  assert.deepEqual(source[0], point(1, 38.75, 9.03));
});

test('full-scope fanout precedes viewport filtering and panning reveals displaced offscreen-anchor groups', () => {
  const index = mapClusterIndex(Array.from({length: 30}, (_, item) => point(item + 1, 38.75, 9.03)));
  const all = mapClusterMarkers(index, world, 18);
  const displaced = all.find(marker => Math.abs(marker.center[0] - marker.anchor[0]) > .00001)!;
  assert.ok(displaced);
  const [longitude, latitude] = displaced.center;
  const bounds: MapClusterBounds = [longitude - .000001, latitude - .000001, longitude + .000001, latitude + .000001];
  assert.ok(displaced.anchor[0] < bounds[0] || displaced.anchor[0] > bounds[2]);
  assert.deepEqual(mapClusterMarkers(index, bounds, 18), [displaced]);
  assert.deepEqual(mapClusterMarkers(index, world, 18), all, 'Panning never repacks the group set');
});

test('dateline neighborhoods and wrapped visible worlds retain exact membership without duplicates', () => {
  const index = mapClusterIndex([point(1, 179.9999), point(2, -179.9999), point(3, 0)]);
  assert.deepEqual(index.groups.find(group => group.kind === 'cluster')?.ids, [1, 2]);
  assert.ok(Math.abs(Math.abs(mapFixedGroup(index, [1, 2])!.anchor[0]) - 180) < .00001);
  const normal = mapClusterMarkers(index, [170, -10, 190, 10], 18);
  assert.deepEqual(normal.flatMap(marker => marker.ids), [1, 2]);
  assert.deepEqual(mapClusterMarkers(index, [170, -10, -170, 10], 18), normal);
  assert.deepEqual(mapClusterMarkers(index, [530, -10, 550, 10], 18), normal);
  assert.deepEqual(mapClusterMarkers(index, [-190, -10, -170, 10], 18), normal);
  assert.deepEqual(mapClusterMarkers(index, [-10, -10, 10, 10], 18).flatMap(marker => marker.ids), [3]);
  assert.deepEqual(mapClusterMarkers(index, [0, 10, 20, -10], 18), []);
  assert.deepEqual(mapClusterMarkers(index, [Number.NaN, 0, 20, 10], 18), []);
});

test('bounded whole-world/polar fallback keeps every ID and never enlarges fixed groups', () => {
  const source = [
    ...Array.from({length: 100}, (_, item) => point(item + 1, -179 + item % 20 * 18, -72 + Math.floor(item / 20) * 32)),
    ...Array.from({length: 100}, (_, item) => point(item + 101, 38.75, 85.051129)),
  ];
  const index = mapClusterIndex(source);
  for (const zoom of [1, 18]) {
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
    for(const zoom of [1,6,14,18]){
      const markers=mapClusterMarkers(index,world,zoom);
      assert.deepEqual(markers.flatMap(marker=>marker.ids).sort((a,b)=>a-b),source.map(row=>row.id));
      if(zoom===18)assert.deepEqual(markers.map(({key,ids,count})=>({key,ids,count})),initial);
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

test('plain-circle display positions stay within800meters while broad hierarchy retains honest centroids',()=>{
  assert.equal(MAP_GROUP_MAX_DISPLACEMENT_METERS,800);
  for(const latitude of [9.03,85.051129,-85.051129])for(const capacity of [1,3,6]){
    const index=mapClusterIndex(Array.from({length:30},(_,item)=>point(item+1,38.75,latitude)),capacity);
    const keys=index.groups.map(group=>group.key);
    for(const zoom of [1,3.5,6,10,14,18]){
      const markers=mapClusterMarkers(index,world,zoom);
      assert.deepEqual(markers.flatMap(marker=>marker.ids).sort((a,b)=>a-b),Array.from({length:30},(_,item)=>item+1));
      if(zoom===18)assert.deepEqual(markers.map(marker=>marker.key),keys);
      for(const marker of markers)assert.ok(haversine(point(1,...marker.anchor),point(2,...marker.center))<=800.00001);
      if(latitude===9.03&&zoom<=6)assert.ok(markers.every(marker=>marker.center[0]===marker.anchor[0]&&marker.center[1]===marker.anchor[1]),'Wide map must not manufacture remote badge locations');
    }
  }
  const dense=mapClusterMarkers(mapClusterIndex(Array.from({length:200},(_,item)=>point(item+1,38.75,9.03)),1),world,18);
  assert.equal(dense.length,200);assert.ok(dense.every(marker=>marker.kind==='cluster'&&marker.count===1));
  for(let left=0;left<dense.length;left++)for(let right=left+1;right<dense.length;right++){
    const a=pixel(dense[left].center,18),b=pixel(dense[right].center,18);
    assert.ok(Math.abs(a[0]-b[0])>=55.99||Math.abs(a[1]-b[1])>=55.99);
  }
});

test('outer counts sum real shops and expansion progresses to exact all-fit terminal groups',()=>{
  const source=[...Array.from({length:3},(_,item)=>({...point(item+1,38.75,9.03),featured:item===0})),
    ...Array.from({length:2},(_,item)=>({...point(item+4,38.79,9.03),live:true})),point(6,38.83,9.03)];
  const index=mapClusterIndex(source,3), broad=mapClusterMarkers(index,world,6);
  assert.equal(index.groups.length,3); assert.equal(broad.length,1);
  assert.equal(broad[0].kind,'aggregate'); assert.equal(broad[0].count,6,'Three terminal points represent six businesses');
  assert.equal(broad[0].presence,'featured');assert.deepEqual(broad[0].ids,[1,2,3,4,5,6]);
  assert.deepEqual(broad[0].center,broad[0].anchor);assert.equal(mapFixedGroup(index,broad[0].ids),null);
  const expanded=mapClusterMarkers(index,world,broad[0].expansionZoom!);
  assert.ok(expanded.length>1,'Clicking expansion level actually reveals children');
  assert.deepEqual(expanded.flatMap(item=>item.ids).sort((a,b)=>a-b),broad[0].ids);
  const leaves=mapClusterMarkers(index,world,18);
  assert.deepEqual(leaves.map(item=>item.key).sort(),index.groups.map(group=>group.key).sort());
  assert.ok(leaves.every(item=>item.kind!=='aggregate'&&item.expansionZoom===undefined));
  assert.deepEqual(leaves.find(item=>item.count===3)?.ids,[1,2,3]);
  assert.deepEqual(leaves.find(item=>item.count===2)?.ids,[4,5]);
  assert.equal(leaves.find(item=>item.count===1)?.kind,'shop');
  const singleTerminal=mapClusterIndex(Array.from({length:6},(_,item)=>point(item+1,38.75,9.03)),6);
  assert.equal(mapClusterMarkers(singleTerminal,world,1)[0].kind,'cluster','One terminal group never becomes a fake outer aggregate');
  for(const zoom of [1,6,14,17,17.999,18]){assert.equal(mapClusterMarkers(singleTerminal,world,zoom)[0].expansionZoom,undefined,'A current final circle needs no extra camera movement');assert.ok(mapExposedGroup(singleTerminal,[1,2,3,4,5,6],zoom),'Exact current terminal membership is exposed at its existing camera');}
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
  for(let zoom=1;zoom<=18;zoom++){
    const markers=mapClusterMarkers(dense,world,zoom),ids=markers.flatMap(item=>item.ids);
    assert.equal(ids.length,200);assert.equal(new Set(ids).size,200);
    assert.ok(markers.every(item=>item.count===item.ids.length));
    if(zoom<18){assert.equal(markers.length,1);assert.equal(markers[0].kind,'aggregate');assert.equal(markers[0].expansionZoom,18);}
    else assert.ok(markers.every(item=>item.kind==='cluster'&&item.count===1));
  }
  assert.deepEqual(mapClusterMarkers(index,world,18),mapClusterMarkers(index,world,normalizeNativeMapZoom(17)));
  assert.deepEqual(mapClusterMarkers(index,world,6),mapClusterMarkers(mapClusterIndex([...source].reverse()),world,6));
});

test('an eligible peer within3km always prevents a shop glyph even when capacity forces one-card circles',()=>{
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
