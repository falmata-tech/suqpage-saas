import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const provider = read("lib/map-provider.ts");
const renderer = read("components/MarketplaceMap.tsx");
const workspace = read("components/DiscoveryWorkspace.tsx");
const config = read("next.config.ts");
const serviceWorker = read("public/sw.js");
const privacy = read("app/privacy/page.tsx");
const environment = read(".env.example");
const packageJson = JSON.parse(read("package.json"));

assert.match(provider, /tileUrlTemplate: "https:\/\/tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png"/);
assert.match(provider, /https:\/\/www\.openstreetmap\.org\/copyright/);
assert.match(provider, /OpenStreetMap contributors/);
assert.match(provider, /NEXT_PUBLIC_MIRTPAGE_MAP_PROVIDER \|\| "osm-standard"/);
assert.match(environment, /NEXT_PUBLIC_MIRTPAGE_MAP_PROVIDER=osm-standard/);
assert.equal(packageJson.dependencies.leaflet, "^1.9.4");
assert.equal(packageJson.dependencies.supercluster, "^8.0.1");
for (const dependency of ["d3-geo", "d3-selection", "d3-transition", "d3-zoom"]) {
  assert.equal(packageJson.dependencies[dependency], undefined, `${dependency} is absent from the public map runtime`);
}

assert.match(renderer, /L\.tileLayer\(provider\.tileUrlTemplate/);
assert.match(renderer, /getClusters\(viewport, zoom\)/);
assert.match(renderer, /keepBuffer: 0/);
assert.match(renderer, /updateWhenIdle: true/);
assert.match(renderer, /updateWhenZooming: false/);
assert.match(renderer, /detectRetina: false/);
assert.doesNotMatch(renderer, /fetch\(|prefetch|\/api\//i);
assert.doesNotMatch(workspace, /\/geo\/|d3-(?:geo|selection|transition|zoom)/);
assert.match(config, /img-src 'self' data: blob: https:\/\/tile\.openstreetmap\.org/);
assert.match(serviceWorker, /if \(url\.origin !== self\.location\.origin \|\| url\.pathname\.startsWith\("\/api"\)\) return;/);
assert.match(privacy, /does not proxy, prefetch, or retain third-party map tiles/);

console.log("OSM basemap contract passed: one direct provider, visible attribution, bounded viewport rendering, and no proxy/prefetch/PWA tile cache.");
