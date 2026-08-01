import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { geoContains } from "d3-geo";

const source = process.argv[2];
if (!source || !fs.existsSync(source)) {
  throw new Error("Usage: node scripts/build-discovery-geography.mjs /path/to/ethiopia.osm.pbf");
}

const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-geography-"));
const roadsPbf = path.join(temp, "roads.osm.pbf");
const roadsJson = path.join(temp, "roads.geojson");
const placesPbf = path.join(temp, "places.osm.pbf");
const placesJson = path.join(temp, "places.geojson");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} failed with status ${result.status}`);
}

function squaredDistance(point, left, right) {
  let x = left[0];
  let y = left[1];
  let dx = right[0] - x;
  let dy = right[1] - y;
  if (dx || dy) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = right[0];
      y = right[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  const threshold = tolerance * tolerance;
  while (stack.length) {
    const [start, end] = stack.pop();
    let farthest = threshold;
    let index = -1;
    for (let cursor = start + 1; cursor < end; cursor += 1) {
      const distance = squaredDistance(points[cursor], points[start], points[end]);
      if (distance > farthest) {
        farthest = distance;
        index = cursor;
      }
    }
    if (index !== -1) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }
  return points.filter((_, index) => keep[index]);
}

function quantize(point) {
  return [Number(point[0].toFixed(5)), Number(point[1].toFixed(5))];
}

try {
  run("osmium", ["tags-filter", source, "w/highway=motorway,trunk,primary,secondary", "-o", roadsPbf]);
  run("osmium", ["export", roadsPbf, "-o", roadsJson]);
  run("osmium", ["tags-filter", source, "n/place=city,town,village", "-o", placesPbf]);
  run("osmium", ["export", placesPbf, "-o", placesJson]);

  const boundary = JSON.parse(fs.readFileSync(path.join(root, "public/geo/ethiopia-admin1-2023.geojson"), "utf8"));
  const roadSource = JSON.parse(fs.readFileSync(roadsJson, "utf8"));
  const placeSource = JSON.parse(fs.readFileSync(placesJson, "utf8"));
  const classes = ["motorway", "trunk", "primary", "secondary"];
  const tolerances = { motorway: 0.0015, trunk: 0.002, primary: 0.0025, secondary: 0.0035 };
  const roadLines = new Map(classes.map((key) => [key, []]));

  for (const feature of roadSource.features) {
    const roadClass = feature.properties?.highway;
    if (!roadLines.has(roadClass)) continue;
    const sourceLines = feature.geometry?.type === "LineString"
      ? [feature.geometry.coordinates]
      : feature.geometry?.type === "MultiLineString"
        ? feature.geometry.coordinates
        : [];
    for (const line of sourceLines) {
      const reduced = simplify(line.map(quantize), tolerances[roadClass]);
      if (reduced.length >= 2) roadLines.get(roadClass).push(reduced);
    }
  }

  const roads = {
    type: "FeatureCollection",
    source: "OpenStreetMap via Geofabrik",
    sourceDate: "2026-07-31T20:21:56Z",
    features: classes.map((roadClass) => ({
      type: "Feature",
      properties: { highway: roadClass },
      geometry: { type: "MultiLineString", coordinates: roadLines.get(roadClass) },
    })),
  };

  const places = {
    type: "FeatureCollection",
    source: "OpenStreetMap via Geofabrik",
    sourceDate: "2026-07-31T20:21:56Z",
    features: placeSource.features
      .filter((feature) => feature.geometry?.type === "Point")
      .filter((feature) => geoContains(boundary, feature.geometry.coordinates))
      .map((feature) => ({
        type: "Feature",
        properties: {
          name: String(feature.properties?.["name:en"] || feature.properties?.name || "").slice(0, 100),
          localName: String(feature.properties?.["name:am"] || "").slice(0, 100),
          place: feature.properties?.place,
          population: Number.parseInt(feature.properties?.population || "0", 10) || 0,
        },
        geometry: { type: "Point", coordinates: quantize(feature.geometry.coordinates) },
      }))
      .filter((feature) => feature.properties.name)
      .sort((left, right) => {
        const rank = { city: 0, town: 1, village: 2 };
        return rank[left.properties.place] - rank[right.properties.place]
          || right.properties.population - left.properties.population
          || left.properties.name.localeCompare(right.properties.name);
      }),
  };

  fs.writeFileSync(path.join(root, "public/geo/ethiopia-major-roads-osm.geojson"), JSON.stringify(roads));
  fs.writeFileSync(path.join(root, "public/geo/ethiopia-places-osm.geojson"), JSON.stringify(places));
  console.log(`Wrote ${roads.features.length} road layers and ${places.features.length} places.`);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
