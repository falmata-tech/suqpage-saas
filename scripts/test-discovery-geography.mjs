import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const provider = read("lib/map-provider.ts");
const tileLoader = read("lib/map/map-tile-loader.ts");
const renderer = read("components/MarketplaceMap.tsx");
const workspace = read("components/DiscoveryWorkspace.tsx");
const config = read("next.config.ts");
const serviceWorker = read("public/sw.js");
const privacy = read("app/(public)/privacy/page.tsx");
const environment = read(".env.example");
const packageJson = JSON.parse(read("package.json"));

assert.match(provider, /tileUrlTemplate: "https:\/\/tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png"/);
assert.match(provider, /https:\/\/www\.openstreetmap\.org\/copyright/);
assert.match(provider, /OpenStreetMap contributors/);
assert.match(provider, /NEXT_PUBLIC_SUQPAGE_MAP_PROVIDER \|\| "osm-standard"/);
assert.match(environment, /NEXT_PUBLIC_SUQPAGE_MAP_PROVIDER=osm-standard/);
assert.equal(packageJson.dependencies.leaflet, "^1.9.4");
assert.equal(packageJson.dependencies.supercluster, "^8.0.1");
for (const dependency of ["d3-geo", "d3-selection", "d3-transition", "d3-zoom"]) {
  assert.equal(packageJson.dependencies[dependency], undefined, `${dependency} is absent from the public map runtime`);
}

assert.match(renderer, /L\.gridLayer\(/);
assert.match(renderer, /L\.Util\.template\(provider\.tileUrlTemplate,\s*\{x:coords.x,y:coords.y,z:coords.z\}/);
// S127's shared hierarchy owns the viewport query; the renderer no longer
// reaches directly into Supercluster's historical getClusters API.
assert.match(renderer, /mapClusterMarkers\(clusterIndexRef\.current,\s*viewport,\s*zoom\)/);
for (const bound of ['getWest','getSouth','getEast','getNorth']) assert.ok(renderer.includes(`bounds.${bound}()`));
assert.match(renderer, /keepBuffer: 0/);
assert.match(renderer, /updateWhenIdle: true/);
assert.match(renderer, /updateWhenZooming: false/);
assert.match(renderer, /tileSize: 256/); // GridLayer has no retina URL/size rewriting.
assert.doesNotMatch(renderer, /fetch\(|prefetch|\/api\//i);
assert.doesNotMatch(workspace, /\/geo\/|d3-(?:geo|selection|transition|zoom)/);
assert.match(config, /img-src 'self' data: blob: https:\/\/tile\.openstreetmap\.org/);
assert.match(config, /connect-src 'self' https:\/\/tile\.openstreetmap\.org/);
assert.match(tileLoader, /cache:'default'/);
assert.match(tileLoader, /credentials:'omit'/);
assert.match(tileLoader, /referrerPolicy:'strict-origin-when-cross-origin'/);
assert.doesNotMatch(tileLoader, /cache:'(?:reload|no-store|no-cache)'|setRequestHeader|X-Requested-With|User-Agent/);
assert.match(read('app/layout.tsx'), /referrer:'strict-origin-when-cross-origin'/);
for (const route of ['app/(public)/tracking/page.tsx','app/(public)/tracking/[reference]/page.tsx']) {
  assert.match(read(route), /referrer:\s*['"]no-referrer['"]/, 'Tracking retains its private policy');
}
assert.match(serviceWorker, /if \(url\.origin !== self\.location\.origin \|\| url\.pathname\.startsWith\("\/api"\)\) return;/);
assert.match(privacy, /The web and Android maps request map tiles from OpenStreetMap/);
assert.match(privacy, /Android uses MapLibre and caches map tiles on your device/);
assert.match(privacy, /Tile requests do not include your account details or search text/);

console.log("OSM basemap contract passed: one direct provider, default-cache/status-aware tiles, public origin referrers, private Tracking and no proxy/prefetch/PWA tile cache.");
