import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const releaseScript = fs.readFileSync("scripts/release.sh", "utf8");
const acceptanceRunner = fs.readFileSync("scripts/acceptance-runner.mjs", "utf8");
const typecheckScript = fs.readFileSync("scripts/typecheck.mjs", "utf8");

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
assert.equal(packageJson.scripts["test:trace"], "node scripts/test-build-trace.mjs");
assert.equal(packageJson.scripts["test:bank"], "tsx scripts/test-showroom-bank.ts");
assert.match(packageJson.scripts.check, /npm run test:bank/, "Standard check must admit the showroom bank");
assert.match(releaseScript, /node scripts\/test-build-trace\.mjs/, "Release must reject private output-file traces");
assert.equal(packageJson.scripts.typecheck, "node scripts/typecheck.mjs");
assert.equal(packageJson.engines.node, ">=22.16.0");
assert.match(typecheckScript, /path\.join\(process\.cwd\(\), "\.next", "dev", "types"\)/, "Typecheck cleanup must remain scoped to generated dev types");
assert.match(typecheckScript, /next\/dist\/bin\/next", "typegen"/, "Typecheck must regenerate framework route types");
assert.match(acceptanceRunner, /SUQPAGE_NEXT_DIST_DIR: distDir/, "Acceptance must use its isolated Next.js output");
assert.match(acceptanceRunner, /SUQPAGE_NEXT_TSCONFIG: tsconfigName/, "Acceptance must isolate generated TypeScript configuration");
assert.match(acceptanceRunner, /fs\.rmSync\(buildOutputPath/, "Acceptance must clean only its isolated Next.js output");
assert.match(acceptanceRunner, /fs\.rmSync\(tsconfigPath/, "Acceptance must clean its generated TypeScript configuration");
assert.equal(
  spawnSync("git", ["check-ignore", "-q", ".next-acceptance/example/BUILD_ID"]).status,
  0,
  "Acceptance build output must be ignored",
);
assert.equal(
  spawnSync("git", ["check-ignore", "-q", ".acceptance-tsconfig-example.json"]).status,
  0,
  "Acceptance TypeScript configuration must be ignored",
);

const status = () => {
  const result = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || "Could not inspect Git status");
  return result.stdout;
};
const beforeTypegen = status();
const typegen = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "typegen"], { encoding: "utf8" });
assert.equal(typegen.status, 0, typegen.stderr || typegen.stdout || "Next.js type generation failed");
assert.equal(status(), beforeTypegen, "Next.js type generation must not change tracked worktree status");
assert.equal(
  spawnSync("git", ["check-ignore", "-q", "next-env.d.ts"]).status,
  0,
  "next-env.d.ts must be ignored as generated framework output",
);
assert.notEqual(
  spawnSync("git", ["ls-files", "--error-unmatch", "next-env.d.ts"]).status,
  0,
  "next-env.d.ts must not be tracked",
);

console.log("GitHub gates, Node baseline, action pinning, and generated type contracts passed.");
