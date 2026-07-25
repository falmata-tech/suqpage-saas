import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = fs.realpathSync(process.cwd());
const nextRoot = path.join(root, ".next");
assert(fs.existsSync(nextRoot), "Run a production build before checking output-file traces");

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
const findings = [];
for (const manifest of manifests) {
  const trace = JSON.parse(fs.readFileSync(manifest, "utf8"));
  assert(Array.isArray(trace.files), `${path.relative(root, manifest)} has no files array`);
  for (const referenced of trace.files) {
    const absolute = path.resolve(path.dirname(manifest), referenced);
    const projectRelative = path.relative(root, absolute).replaceAll("\\", "/");
    if (
      !projectRelative.startsWith("../") &&
      !projectRelative.startsWith(".next/") &&
      !projectRelative.startsWith("node_modules/") &&
      forbidden.test(projectRelative)
    ) {
      findings.push(`${path.relative(root, manifest)} -> ${projectRelative}`);
    }
  }
}

assert.equal(
  findings.length,
  0,
  `Output-file traces include ${findings.length} private runtime/generated references across: ${[
    ...new Set(findings.map((finding) => finding.split(" -> ")[1].split("/")[0])),
  ].join(", ")}`,
);
console.log(`Validated ${manifests.length} output-file traces with no private runtime paths.`);
