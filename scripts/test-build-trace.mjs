import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";

const root = fs.realpathSync(process.cwd());
const nextRoot = path.join(root, ".next");
const nextConfig = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");
assert(fs.existsSync(nextRoot), "Run a production build before checking output-file traces");
assert.match(nextConfig, /\.\/node_modules\/@img\/sharp-linux-x64\/\*\*\/\*/);
assert.match(nextConfig, /\.\/node_modules\/@img\/sharp-libvips-linux-x64\/\*\*\/\*/);

const manifests = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.endsWith(".nft.json")) manifests.push(absolute);
  }
}
walk(nextRoot);
assert(manifests.length > 0, "Production build did not emit output-file trace manifests");

const forbidden = /^(?:\.env(?:$|\.)|\.git(?:\/|$)|\.local(?:\/|$)|app(?:\/|$)|backups(?:\/|$)|data(?:\/|$)|docs(?:\/|$)|lib(?:\/|$)|public(?:\/|$)|scripts(?:\/|$)|showroom-sdk(?:\/|$)|specs(?:\/|$)|test-results(?:\/|$)|playwright-report(?:\/|$)|.*\.md$|Dockerfile$|docker-compose\.yml$|next\.config\.ts$|package-lock\.json$)/i;
// DEP-045/ADR-0027: this reviewed public gazetteer is required by the server
// adapter's fs read. This is not permission to trace other lib/source data.
const publicCatalog = "lib/world-place-catalog.json";
const catalogSha256 = "6f1e53448f713084dbabb9b49a7e471e09be680add56d0cec212aaa082d0cee9";
const provenance = {
  source: "GeoNames cities5000; Ethiopian places remain the existing OSM catalog",
  retrieved: "2026-10-15",
  license: "CC BY 4.0",
  sourceUrl: "https://download.geonames.org/export/dump/",
  sourceSha256: "c1da82518ad0af441033c3019ae853a3f1d25fa8553e767c4fed4e64f8ad95f0",
  columns: ["id", "name", "localName", "region", "countryCode", "latitude", "longitude", "aliases"],
};
function validateCatalogShape(catalog) {
  assert.deepEqual(Object.keys(catalog).sort(), ["cities", "metadata"]);
  assert.deepEqual(catalog.metadata, provenance, "Only reviewed public source/license metadata is admitted");
  assert(Array.isArray(catalog.cities) && catalog.cities.length > 0 && catalog.cities.length <= 100000);
  const ids = new Set();
  for (const row of catalog.cities) {
    assert(Array.isArray(row) && row.length === 8, "Catalog rows contain geography only");
    const [id, name, localName, region, country, latitude, longitude, aliases] = row;
    assert(typeof id === "string" && /^gn-[1-9]\d{0,10}$/.test(id) && !ids.has(id));
    ids.add(id);
    for (const value of [name, localName, region]) assert(typeof value === "string" && value.length <= 256);
    assert(name.length > 0 && typeof country === "string" && /^[A-Z]{2}$/.test(country));
    assert(Number.isFinite(latitude) && latitude >= -90 && latitude <= 90);
    assert(Number.isFinite(longitude) && longitude >= -180 && longitude <= 180);
    assert(Array.isArray(aliases) && aliases.length <= 64 && aliases.every(value => typeof value === "string" && value.length <= 256));
  }
}
function validateCatalogFile(projectRoot) {
  const absolute = path.join(projectRoot, publicCatalog);
  const stat = fs.lstatSync(absolute);
  assert(stat.isFile() && fs.realpathSync(absolute) === absolute, "Public catalog must be the canonical regular file, never a symlink/substitute");
  assert(stat.size > 0 && stat.size <= 10 * 1024 * 1024, "Public geography asset remains bounded");
  const bytes = fs.readFileSync(absolute);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), catalogSha256, "Public catalog differs from the reviewed snapshot");
  const catalog = JSON.parse(bytes.toString("utf8"));
  validateCatalogShape(catalog);
  return catalog;
}
function forbiddenProjectPath(relative) {
  return !relative.startsWith("../") && !relative.startsWith(".next/") && !relative.startsWith("node_modules/") && forbidden.test(relative);
}
function privateTraceReference(projectRoot, absolute) {
  const relative = path.relative(projectRoot, absolute).replaceAll("\\", "/");
  let realRelative = relative, regular = false;
  try {
    regular = fs.lstatSync(absolute).isFile();
    realRelative = path.relative(projectRoot, fs.realpathSync(absolute)).replaceAll("\\", "/");
  } catch { /* Retain the existing source-path rule for other missing trace files. */ }
  if (relative === publicCatalog || realRelative === publicCatalog) {
    return !(relative === publicCatalog && realRelative === publicCatalog && regular);
  }
  return forbiddenProjectPath(relative) || forbiddenProjectPath(realRelative);
}

// Execute the same path/shape guards against bounded positive/negative fixtures.
const fixtureRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-trace-guard-")));
try {
  for (const directory of ["lib", ".next", ".local", "node_modules"]) fs.mkdirSync(path.join(fixtureRoot, directory));
  const catalogPath = path.join(fixtureRoot, publicCatalog);
  fs.writeFileSync(catalogPath, "{}");
  for (const reference of [publicCatalog, "lib/./world-place-catalog.json", "lib/../lib/world-place-catalog.json"]) {
    assert.equal(privateTraceReference(fixtureRoot, path.resolve(fixtureRoot, reference)), false);
  }
  for (const reference of ["lib/world-place-catalog-copy.json", "lib/World-place-catalog.json", "lib/place-catalog.json", "lib/private.ts", ".local/world-place-catalog.json", "data/world-place-catalog.json", ".env", "docs/review.md", "scripts/private.mjs"]) {
    assert.equal(privateTraceReference(fixtureRoot, path.resolve(fixtureRoot, reference)), true);
  }
  const alias = path.join(fixtureRoot, ".next/catalog-alias.json");
  fs.symlinkSync(catalogPath, alias);
  assert.equal(privateTraceReference(fixtureRoot, alias), true, "Build-directory alias cannot acquire the catalog exception");
  const privatePath = path.join(fixtureRoot, ".local/private.json");
  fs.writeFileSync(privatePath, "{}");
  const privateAlias = path.join(fixtureRoot, "node_modules/private-alias.json");
  fs.symlinkSync(privatePath, privateAlias);
  assert.equal(privateTraceReference(fixtureRoot, privateAlias), true, "Allowed-looking aliases do not bypass private-path rejection");
  assert.throws(() => validateCatalogFile(fixtureRoot), /reviewed snapshot/);
  fs.unlinkSync(catalogPath); fs.symlinkSync(privatePath, catalogPath);
  assert.equal(privateTraceReference(fixtureRoot, catalogPath), true);
  assert.throws(() => validateCatalogFile(fixtureRoot), /canonical regular file/);
  fs.unlinkSync(catalogPath);
  assert.throws(() => validateCatalogFile(fixtureRoot), /ENOENT/);
  const valid = {metadata: provenance, cities: [["gn-1", "City", "", "Region", "ET", 9, 39, []]]};
  validateCatalogShape(valid);
  assert.throws(() => validateCatalogShape({...valid, privateContacts: []}));
  assert.throws(() => validateCatalogShape({...valid, metadata: {...provenance, license: "private"}}));
  assert.throws(() => validateCatalogShape({...valid, cities: [[...valid.cities[0], "private"]]}));
  assert.throws(() => validateCatalogShape({...valid, cities: [["gn-1", "City", "", "Region", "ET", 91, 39, []]]}));
  assert.throws(() => validateCatalogShape({...valid, cities: [valid.cities[0], valid.cities[0]]}));
} finally { fs.rmSync(fixtureRoot, {recursive: true, force: true}); }

const catalog = validateCatalogFile(root);
let catalogReferences = 0;
const findings = [];
const requiredNextRuntimeFiles = new Set([
  "node_modules/next/dist/server/lib/source-maps.js",
  "node_modules/next/dist/server/lib/lru-cache.js",
]);
for (const manifest of manifests) {
  const trace = JSON.parse(fs.readFileSync(manifest, "utf8"));
  assert(Array.isArray(trace.files), `${path.relative(root, manifest)} has no files array`);
  for (const referenced of trace.files) {
    const absolute = path.resolve(path.dirname(manifest), referenced);
    const projectRelative = path.relative(root, absolute).replaceAll("\\", "/");
    requiredNextRuntimeFiles.delete(projectRelative);
    if (projectRelative === publicCatalog) catalogReferences++;
    if (privateTraceReference(root, absolute)) {
      findings.push(`${path.relative(root, manifest)} -> ${projectRelative}`);
    }
  }
}
assert(catalogReferences > 0, "Output-file traces omitted the required server country-city asset");

const browserFiles = [];
function browserWalk(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) browserWalk(absolute);
    else if (entry.name.endsWith(".js")) browserFiles.push(absolute);
  }
}
const snapshotIds = [catalog.cities[0][0], catalog.cities[Math.floor(catalog.cities.length / 2)][0], catalog.cities.at(-1)[0]];
const containsSnapshot = source => source.includes(provenance.sourceSha256) || snapshotIds.every(id => source.includes(id));
function assertNoDistributedSnapshot(coverage) {
  assert(![...coverage.values()].every(files => files.length > 0), `Browser chunks collectively include the server city snapshot across: ${[...new Set([...coverage.values()].flat())].join(", ")}`);
}
assert.equal(containsSnapshot("ordinary country selector"), false);
assert.equal(containsSnapshot(JSON.stringify({cities: snapshotIds})), true, "A bundled city payload is rejected even if metadata is removed");
const distributedChunks = snapshotIds.map(id => JSON.stringify({city: id}));
assert(distributedChunks.every(source => !containsSnapshot(source)), "Each split fragment alone lacks a full snapshot signature");
const distributedCoverage = new Map(snapshotIds.map(id => [id, distributedChunks.flatMap((source, i) => source.includes(id) ? [`fixture-${i}.js`] : [])]));
assert.throws(() => assertNoDistributedSnapshot(distributedCoverage), /collectively include/, "Snapshot IDs distributed across chunks cannot bypass admission");
assertNoDistributedSnapshot(new Map([...distributedCoverage].map(([id, files], i) => [id, i === 0 ? [] : files])));
browserWalk(path.join(nextRoot, "static"));
assert(browserFiles.length > 0, "Production browser chunks were not found");
const browserSnapshotIds = new Map(snapshotIds.map(id => [id, []]));
for (const file of browserFiles) {
  const source = fs.readFileSync(file, "utf8");
  assert(!containsSnapshot(source), `${path.relative(root, file)} includes the full server city snapshot`);
  for (const id of snapshotIds) if (source.includes(id)) browserSnapshotIds.get(id).push(path.relative(root, file));
}
assertNoDistributedSnapshot(browserSnapshotIds);

assert(
  requiredNextRuntimeFiles.size === 0,
  `Output-file traces omitted Vercel-required Next.js runtime files: ${[
    ...requiredNextRuntimeFiles,
  ].join(", ")}`,
);

assert.equal(
  findings.length,
  0,
  `Output-file traces include ${findings.length} private runtime/generated references across: ${[
    ...new Set(findings.map((finding) => finding.split(" -> ")[1].split("/")[0])),
  ].join(", ")}`,
);
console.log(`Validated ${manifests.length} output-file traces with no private runtime paths; reviewed public catalog required (${catalogReferences} references), absent from ${browserFiles.length} browser chunks.`);
