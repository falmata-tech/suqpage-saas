import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const roadsPath = "public/geo/ethiopia-major-roads-osm.geojson";
const placesPath = "public/geo/ethiopia-places-osm.geojson";
const attribution = fs.readFileSync("public/geo/ATTRIBUTION.md", "utf8");
const roads = read(roadsPath);
const places = read(placesPath);

assert.equal(roads.source, "OpenStreetMap via Geofabrik");
assert.deepEqual(roads.features.map((feature) => feature.properties.highway), ["motorway", "trunk", "primary", "secondary"]);
assert(roads.features.every((feature) => feature.geometry.type === "MultiLineString" && feature.geometry.coordinates.length > 0));
assert(places.features.filter((feature) => feature.properties.place === "city").length >= 40);
assert(places.features.filter((feature) => feature.properties.place === "town").length >= 500);
assert(places.features.every((feature) => feature.geometry.type === "Point" && feature.properties.name.length <= 100));
assert(fs.statSync(roadsPath).size < 1_500_000, "simplified roads must stay below 1.5 MB");
assert(fs.statSync(placesPath).size < 1_000_000, "places must stay below 1 MB");
assert(attribution.includes("Geofabrik") && attribution.includes("Open Database License"));
console.log(`Local geography passed: ${roads.features.length} road layers, ${places.features.length} places, ${fs.statSync(roadsPath).size + fs.statSync(placesPath).size} bytes.`);
