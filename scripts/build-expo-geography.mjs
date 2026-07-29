import fs from "node:fs";
import path from "node:path";
import { geoContains } from "d3-geo";

const root = process.cwd();
const admin1Path = path.join(root, "public/geo/ethiopia-admin1-2023.geojson");
const admin2Source =
  process.env.SUQPAGE_ADMIN2_SOURCE ||
  "/tmp/ethiopia-admin2-2023-source.geojson";
const placesSource =
  process.env.SUQPAGE_OSM_PLACES_SOURCE ||
  "/tmp/ethiopia-osm-places.json";
const roadsSource =
  process.env.SUQPAGE_OSM_ROADS_SOURCE ||
  "/tmp/ethiopia-osm-major-roads.json";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function round(value) {
  return Number(value.toFixed(4));
}

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (!dx && !dy) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
        (dx * dx + dy * dy),
    ),
  );
  return Math.hypot(
    point[0] - (start[0] + t * dx),
    point[1] - (start[1] + t * dy),
  );
}

function simplifyLine(points, tolerance) {
  if (points.length <= 2) return points.map(([x, y]) => [round(x), round(y)]);
  let maximum = 0;
  let index = 0;
  for (let cursor = 1; cursor < points.length - 1; cursor += 1) {
    const distance = perpendicularDistance(
      points[cursor],
      points[0],
      points[points.length - 1],
    );
    if (distance > maximum) {
      maximum = distance;
      index = cursor;
    }
  }
  if (maximum <= tolerance) {
    return [
      [round(points[0][0]), round(points[0][1])],
      [round(points[points.length - 1][0]), round(points[points.length - 1][1])],
    ];
  }
  const left = simplifyLine(points.slice(0, index + 1), tolerance);
  const right = simplifyLine(points.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

function simplifyRing(ring, tolerance) {
  const open = ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
    ? ring.slice(0, -1)
    : ring;
  const simplified = simplifyLine(open, tolerance);
  if (simplified.length < 3) {
    return ring.map(([x, y]) => [round(x), round(y)]);
  }
  return [...simplified, simplified[0]];
}

function simplifyGeometry(geometry, tolerance) {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map((ring) =>
        simplifyRing(ring, tolerance)),
    };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) => simplifyRing(ring, tolerance))),
    };
  }
  throw new Error(`Unsupported boundary geometry ${geometry.type}.`);
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value)}\n`);
}

const admin1 = readJson(admin1Path);
const insideEthiopia = (point) =>
  admin1.features.some((feature) => geoContains(feature, point));

const admin2 = readJson(admin2Source);
const zones = {
  type: "FeatureCollection",
  features: admin2.features.map((feature) => ({
    type: "Feature",
    properties: {
      name: feature.properties.admin_2 || feature.properties.name,
      region: feature.properties.admin_1,
      centroid: feature.properties.centroid.map(round),
      code: feature.properties.p_code,
    },
    geometry: simplifyGeometry(feature.geometry, 0.008),
  })),
};
writeJson(path.join(root, "public/geo/ethiopia-admin2-2023.geojson"), zones);

const placesRaw = readJson(placesSource);
const places = placesRaw.elements
  .filter((element) =>
    Number.isFinite(element.lon) &&
    Number.isFinite(element.lat) &&
    insideEthiopia([element.lon, element.lat]))
  .map((element) => ({
    type: "Feature",
    properties: {
      name: element.tags?.["name:en"] || element.tags?.name || "",
      place: element.tags?.place,
      population: Number.parseInt(element.tags?.population || "0", 10) || 0,
    },
    geometry: {
      type: "Point",
      coordinates: [round(element.lon), round(element.lat)],
    },
  }))
  .filter((feature) => feature.properties.name)
  .sort((left, right) =>
    Number(right.properties.place === "city") -
      Number(left.properties.place === "city") ||
    right.properties.population - left.properties.population ||
    left.properties.name.localeCompare(right.properties.name));
writeJson(path.join(root, "public/geo/ethiopia-places-osm.geojson"), {
  type: "FeatureCollection",
  features: places,
});

let roadsWritten = false;
if (fs.existsSync(roadsSource)) {
  try {
    const roadsRaw = readJson(roadsSource);
    const roads = roadsRaw.elements
      .filter((element) => Array.isArray(element.geometry))
      .map((element) => {
        const coordinates = element.geometry
          .map((point) => [point.lon, point.lat])
          .filter(([longitude, latitude]) =>
            Number.isFinite(longitude) && Number.isFinite(latitude));
        return {
          type: "Feature",
          properties: {
            highway: element.tags?.highway || "trunk",
            name: element.tags?.["name:en"] || element.tags?.name || "",
            ref: element.tags?.ref || "",
          },
          geometry: {
            type: "LineString",
            coordinates: simplifyLine(coordinates, 0.004),
          },
        };
      })
      .filter((feature) =>
        feature.geometry.coordinates.length >= 2 &&
        feature.geometry.coordinates.some(insideEthiopia));
    writeJson(path.join(root, "public/geo/ethiopia-major-roads-osm.geojson"), {
      type: "FeatureCollection",
      features: roads,
    });
    roadsWritten = true;
  } catch {
    console.warn("Raw road source was unavailable or incomplete.");
  }
}

if (!roadsWritten) {
  const routeFiles = fs.readdirSync("/tmp")
    .filter((file) => /^ethiopia-road-a\d+\.json$/.test(file))
    .sort();
  const routes = routeFiles.flatMap((file) => {
    const response = readJson(path.join("/tmp", file));
    const coordinates = response.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coordinates)) return [];
    return [{
      type: "Feature",
      properties: {
        ref: file.match(/ethiopia-road-(a\d+)\.json/)?.[1].toUpperCase() || "",
        source: "OpenStreetMap via OSRM",
      },
      geometry: {
        type: "LineString",
        coordinates: simplifyLine(coordinates, 0.004),
      },
    }];
  });
  if (routes.length) {
    writeJson(path.join(root, "public/geo/ethiopia-major-roads-osm.geojson"), {
      type: "FeatureCollection",
      features: routes,
    });
    roadsWritten = true;
  }
}

console.log(
  `Built ${zones.features.length} zones, ${places.length} place labels, and ${roadsWritten ? "local road corridors" : "no road layer"}.`,
);
