import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const extraFiles = [
  "MIRTPAGE-MASTER-PROMPT.md",
  "components/MirtPageBrand.tsx",
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
  if (retiredIdentity.test(content.toString("utf8"))) violations.push(file);
}

assert.deepEqual(violations, [], `retired platform identity remains in: ${violations.join(", ")}`);
assert.equal(JSON.parse(fs.readFileSync("package.json", "utf8")).name, "mirtpage-saas-mvp");
assert.ok(fs.existsSync("public/brand/mirtpage-mark.svg"));
assert.ok(fs.existsSync("MIRTPAGE-MASTER-PROMPT.md"));
console.log("MirtPage identity contract passed across tracked text and platform assets.");
