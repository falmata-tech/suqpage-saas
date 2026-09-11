import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const extraFiles = [
  "MIRTPAGE-MASTER-PROMPT.md",
  "components/AfricMadeBrand.tsx",
  "specs/frontend/FE-024-mirtpage-marketplace-and-attention-shell.md",
  "specs/backend/BE-023-discovery-scale-and-attention-projection.md",
  "specs/deployment/DEP-020-mirtpage-marketplace-rollout.md",
];
const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
const retiredIdentity = new RegExp(`${["s", "u", "q", "page"].join("")}|\\b${["s", "u", "q"].join("")}s?\\b`, "i");
const violations = [];

for (const file of new Set([...trackedFiles, ...extraFiles])) {
  if (!fs.existsSync(file) || file.startsWith("feature-request-docs-and-assets/")) continue;
  const content = fs.readFileSync(file);
  if (content.includes(0)) continue;
  const text = content.toString("utf8").replaceAll("SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT", "");
  if (retiredIdentity.test(text)) violations.push(file);
}

assert.deepEqual(violations, [], `retired platform identity remains in: ${violations.join(", ")}`);
assert.equal(JSON.parse(fs.readFileSync("package.json", "utf8")).name, "africmade-saas-mvp");
assert.ok(fs.existsSync("public/brand/africmade-mark.svg"));
assert.ok(fs.existsSync("MIRTPAGE-MASTER-PROMPT.md"));
const mark = fs.readFileSync("public/brand/africmade-mark.svg", "utf8").toLowerCase();
for (const color of ["#202428", "#ff4b00"]) assert.ok(mark.includes(color), `mark is missing ${color}`);
const platformStyles = ["app/globals.css", "app/landing.css", "app/discovery.css"]
  .map((file) => fs.readFileSync(file, "utf8").toLowerCase())
  .join("\n");
for (const color of ["#202428", "#c93600", "#ff4b00", "#f4f4f2", "#fff0e8"]) {
  assert.ok(platformStyles.includes(color), `platform styles are missing ${color}`);
}
for (const retiredColor of ["#5b3df5", "#6240ad", "#6847ba", "#4f318f", "#543398", "#57369e"]) {
  assert.equal(platformStyles.includes(retiredColor), false, `retired platform color remains: ${retiredColor}`);
}
const showroomApp = fs.readFileSync("components/showroom/ShowroomApp.tsx", "utf8");
const showroomStyles = fs.readFileSync("components/showroom/showrooms.css", "utf8").toLowerCase();
assert.match(showroomApp, /className=\{`showroom-host-bar/);
assert.match(showroomApp, /showroom-host-bar-shell/);
assert.match(showroomApp, /aria-label="Back to Market"/);
assert.match(showroomApp, />Back to Market</);
assert.doesNotMatch(showroomApp, /Powered by/);
assert.match(showroomApp, /style=\{runtimeTokenVariables as CSSProperties/);
assert.ok(showroomStyles.includes(".showroom-host-bar"));
assert.ok(showroomStyles.includes("background:rgb(255 255 255 / 96%)"));
assert.ok(showroomStyles.includes("outline:3px solid #ff4b00"));
const discoveryWorkspace = fs.readFileSync("components/DiscoveryWorkspace.tsx", "utf8");
assert.doesNotMatch(discoveryWorkspace, /aria-label="Production scale"/);
assert.match(discoveryWorkspace, /className="discovery-summary"/);
assert.match(discoveryWorkspace, /className="discovery-search" role="search"/);
for (const publicRoute of ["app/(public)/page.tsx", "app/discover/page.tsx"]) {
  assert.doesNotMatch(fs.readFileSync(publicRoute, "utf8"), /query\.scale/);
}
console.log("AfricMade identity contract passed across tracked text and platform assets.");
