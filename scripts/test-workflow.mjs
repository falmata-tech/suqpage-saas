import assert from "node:assert/strict";
import fs from "node:fs";

const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

function job(name, nextName) {
  const start = workflow.indexOf(`  ${name}:\n`);
  assert.notEqual(start, -1, `GitHub Actions must define the ${name} job`);
  const end = nextName ? workflow.indexOf(`  ${nextName}:\n`, start + 1) : workflow.length;
  assert.notEqual(end, -1, `Could not determine the end of the ${name} job`);
  return workflow.slice(start, end);
}

const core = job("core", "browser");
const browser = job("browser", "container");
const container = job("container");

assert.match(core, /node-version: 22\.16\.0/, "Core CI must use the supported Node baseline");
assert.match(core, /- run: npm run release/, "Core CI must invoke the canonical release contract");
assert.match(core, /- run: npm run test:operations/, "Core CI must retain independent recovery evidence");
assert(!core.includes("- run: npm run build"), "Core CI must not drift into a partial duplicate of the release script");
assert(!core.includes("- run: npm run check"), "Core CI must not drift into a partial duplicate of the release script");

assert.match(browser, /node-version: 22\.16\.0/, "Browser CI must use the supported Node baseline");
assert.match(browser, /- run: npm run test:acceptance/, "Browser CI must run Chromium acceptance");
assert.match(container, /node-version: 22\.16\.0/, "Container CI must use the supported Node baseline");
assert.match(container, /- run: npm run test:container/, "Container CI must exercise the production image");

for (const [action, tag] of [
  ["actions/checkout", "v4"],
  ["actions/setup-node", "v4"],
  ["actions/upload-artifact", "v4"],
]) {
  const references = [...workflow.matchAll(new RegExp(`uses: ${action}@([^\\s]+) # (${tag})`, "g"))];
  assert(references.length > 0, `${action} must remain present at ${tag}`);
  for (const reference of references) {
    assert.match(reference[1], /^[0-9a-f]{40}$/, `${action} must be pinned to an immutable commit SHA`);
  }
}

assert.equal(packageJson.scripts.release, "bash scripts/release.sh");
assert.equal(packageJson.scripts["test:container"], "node scripts/test-container.mjs");
console.log("GitHub release, browser, container, Node baseline, and action pinning contracts passed.");
