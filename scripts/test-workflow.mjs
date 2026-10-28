import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const packageLock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
const releaseScript = fs.readFileSync("scripts/release.sh", "utf8");
const acceptanceRunner = fs.readFileSync("scripts/acceptance-runner.mjs", "utf8");
const typecheckScript = fs.readFileSync("scripts/typecheck.mjs", "utf8");
const agentContract = fs.readFileSync("AGENTS.md", "utf8");
const masterPrompt = fs.readFileSync("AFRICMADE-MASTER-PROMPT.md", "utf8");
const showroomWorkflow = fs.readFileSync("showroom-projects/WORKFLOW.md", "utf8");
const showroomBrief = fs.readFileSync("showroom-projects/_template/BRIEF.md", "utf8");
const showroomReview = fs.readFileSync("showroom-projects/_template/reviews/REVIEW.md", "utf8");

function job(name, nextName) {
  const start = workflow.search(new RegExp(`^  ${name}:\\n`, "m"));
  assert.notEqual(start, -1, `GitHub Actions must define the ${name} job`);
  const end = nextName ? workflow.search(new RegExp(`^  ${nextName}:\\n`, "m")) : workflow.length;
  assert(end > start, `Could not determine the end of the ${name} job`);
  return workflow.slice(start, end);
}

const core = job("core", "browser");
const browser = job("browser", "container");
const container = job("container", "dependency");
const dependency = job("dependency", "postgres");
const postgres = job("postgres");

assert.match(workflow, /workflow_dispatch:/, "GitHub Actions must support an operator-triggered run");
assert.match(core, /node-version: 24\.18\.1/, "Core CI must use the supported Node baseline");
const webInstall = "SUQPAGE_INSTALL_TARGET=web npm ci --workspace=@africmade/contracts --include-workspace-root";
const webAudit = "npm audit --workspace=@africmade/contracts --include-workspace-root --audit-level=moderate";
assert.ok(core.includes(`- run: ${webInstall}`), "Core CI must install only web and shared contracts from the lockfile");
assert.equal((core.match(/- run: npm run test:workflow\n/g) ?? []).length, 1,
  "Core CI must run the shared offline workflow gate exactly once");
assert.ok(core.includes(`- run: ${webInstall}\n      - run: npm run test:workflow\n      - run: npm run release:web\n`),
  "Core CI must check workflow scripts immediately after its clean web install and before the expensive release gate");
assert.match(core, /- run: npm run release:web\n/, "Core CI must invoke the complete selected web release contract");
assert.match(core, /- run: npm run test:operations/, "Core CI must retain independent recovery evidence");
assert.match(core, /- run: npm run test:mobile:release-safety/, "Core CI must retain pure Android artifact safety checks");
assert(!core.includes("- run: npm run build"), "Core CI must not drift into a partial duplicate of the release script");
assert(!core.includes("- run: npm run check"), "Core CI must not drift into a partial duplicate of the release script");

assert.match(browser, /node-version: 24\.18\.1/, "Browser CI must use the supported Node baseline");
function assertBrowserRegistryOverride(source) {
  const acceptance = "      - run: npm run test:acceptance\n        env:\n          SUPABASE_INTERNAL_IMAGE_REGISTRY: docker.io\n";
  const acceptanceAt = source.indexOf("      - run: npm run test:acceptance\n");
  const nextStepAt = source.indexOf("\n      - ", acceptanceAt + 1);
  assert(acceptanceAt >= 0 && nextStepAt > acceptanceAt,
    "Browser CI must keep provider-backed acceptance as a required step");
  assert.equal(source.slice(acceptanceAt, nextStepAt + 1), acceptance,
    "Only the required browser acceptance step may select the Docker Hub CLI registry");
  assert(!/^    permissions:/m.test(source),
    "Browser CI must retain the workflow's default contents-read permission");
  assert(!/ghcr\.io|docker login|docker logout|GHCR_TOKEN|GITHUB_TOKEN|packages:\s*(read|write)/i.test(source),
    "Browser CI must not reintroduce GHCR authentication or package permissions");
  assert(!/continue-on-error:/.test(source),
    "Browser CI must fail when required acceptance fails");
}
assertBrowserRegistryOverride(browser);
assert.equal((workflow.match(/SUPABASE_INTERNAL_IMAGE_REGISTRY/g) ?? []).length, 1,
  "Only browser acceptance may override the Supabase CLI image registry");
for (const [name, mutation] of [
  ["missing override", (value) => value.replace("SUPABASE_INTERNAL_IMAGE_REGISTRY: docker.io", "SUPABASE_INTERNAL_IMAGE_REGISTRY: ghcr.io")],
  ["job-wide override", (value) => value.replace("      - run: npm run test:acceptance\n        env:\n          SUPABASE_INTERNAL_IMAGE_REGISTRY: docker.io\n", "      - run: npm run test:acceptance\n")
    .replace("    steps:\n", "    env:\n      SUPABASE_INTERNAL_IMAGE_REGISTRY: docker.io\n    steps:\n")],
  ["GHCR login", (value) => value.replace("      - run: npm ci\n", "      - run: docker login ghcr.io\n      - run: npm ci\n")],
  ["package grant", (value) => value.replace("    steps:\n", "    permissions:\n      contents: read\n      packages: read\n    steps:\n")],
  ["skipped acceptance", (value) => value.replace("      - run: npm run test:acceptance\n", "      - run: npm run test:acceptance\n        if: false\n")],
  ["forgiven acceptance", (value) => value.replace("      - run: npm run test:acceptance\n", "      - run: npm run test:acceptance\n        continue-on-error: true\n")],
  ["missing acceptance", (value) => value.replace("      - run: npm run test:acceptance\n", "")],
]) {
  assert.throws(() => assertBrowserRegistryOverride(mutation(browser)), undefined,
    `Browser registry contract must reject ${name}`);
}
assert.match(workflow, /^permissions:\n  contents: read\n/m,
  "Workflow default must retain read-only repository access");
assert(!/packages:\s*(read|write)/.test(workflow),
  "CI does not need package access for public Docker Hub pulls");
assert.match(container, /node-version: 24\.18\.1/, "Container CI must use the supported Node baseline");
assert.match(container, /- run: npm run test:container/, "Container CI must exercise the production image");
assert.match(dependency, /node-version: 24\.18\.1/, "Dependency CI must use the supported Node baseline");
assert.ok(dependency.includes(`- run: ${webInstall}`), "Dependency CI must audit a clean web and shared-contract installation");
assert.match(dependency, /- run: node scripts\/check-web-install\.cjs/, "Dependency CI must reject native build tools in the web installation");
assert.ok(dependency.includes(`- run: ${webAudit}`), "Dependency CI must audit all selected web/build dependencies at the moderate threshold");
assert.doesNotMatch(core + dependency, /npm audit --omit=dev/, "Web PR jobs must not substitute the native toolchain audit for web admission");
assert.match(postgres, /node-version: 24\.18\.1/, "PostgreSQL CI must use the supported Node baseline");
assert.match(postgres, /- run: npm run test:postgres-readiness/, "PostgreSQL CI must run the disposable migration rehearsal");

for (const [action, tag] of [
  ["actions/checkout", "v7.0.1"],
  ["actions/setup-node", "v7.0.0"],
  ["actions/upload-artifact", "v4"],
]) {
  const references = [...workflow.matchAll(new RegExp(`uses: ${action}@([^\\s]+) # (${tag})`, "g"))];
  assert(references.length > 0, `${action} must remain present at ${tag}`);
  for (const reference of references) {
    assert.match(reference[1], /^[0-9a-f]{40}$/, `${action} must be pinned to an immutable commit SHA`);
  }
}

assert.equal(packageJson.scripts.release, "bash scripts/release.sh");
assert.equal(packageJson.scripts["release:web"], "SUQPAGE_RELEASE_TARGET=web bash scripts/release.sh");
assert.match(releaseScript, /node scripts\/check-web-install\.cjs/, "Web release must reject an installation containing native tools");
assert.match(releaseScript, /npm audit --workspace=@africmade\/contracts --include-workspace-root --audit-level=moderate/, "Web release must audit selected build dependencies");
assert.match(releaseScript, /npm audit --omit=dev --audit-level=moderate/, "Android admission must retain the full monorepo audit without a waiver");
assert.equal(packageJson.scripts["test:container"], "node scripts/test-container.mjs");
assert.equal(packageJson.scripts["test:trace"], "node scripts/test-build-trace.mjs");
assert.equal(packageJson.scripts["test:bank"], "tsx scripts/test-showroom-bank.ts");
assert.match(packageJson.scripts.check, /npm run test:bank/, "Standard check must admit the showroom bank");
assert.equal(packageJson.scripts["test:experience"], "tsx scripts/test-showroom-experience.ts");
assert.match(packageJson.scripts.check, /npm run test:experience/, "Standard check must admit the mobile experience system");
assert.match(releaseScript, /node scripts\/test-build-trace\.mjs/, "Release must reject private output-file traces");
assert.equal(packageJson.scripts.typecheck, "node scripts/typecheck.mjs");
assert.equal(packageJson.engines.node, ">=24.18.1 <25");
for (const [packagePath, entry] of Object.entries(packageLock.packages)) {
  if (!entry.integrity) continue;
  const [algorithm, encoded] = entry.integrity.split("-", 2);
  assert.equal(algorithm, "sha512", `${packagePath} must use SHA-512 integrity`);
  const digest = Buffer.from(encoded, "base64");
  assert.equal(digest.byteLength, 64, `${packagePath} has a malformed SHA-512 integrity digest`);
  assert.equal(digest.toString("base64"), encoded, `${packagePath} has non-canonical integrity data`);
}
assert.match(typecheckScript, /path\.join\(process\.cwd\(\), "\.next", "dev", "types"\)/, "Typecheck cleanup must remain scoped to generated dev types");
assert.match(typecheckScript, /next\/dist\/bin\/next", "typegen"/, "Typecheck must regenerate framework route types");
assert.match(acceptanceRunner, /SUQPAGE_NEXT_DIST_DIR: distDir/, "Acceptance must use its isolated Next.js output");
assert.match(acceptanceRunner, /SUQPAGE_NEXT_TSCONFIG: tsconfigName/, "Acceptance must isolate generated TypeScript configuration");
assert.match(acceptanceRunner, /exclude: \["node_modules", "\.next", "\.next-\*"\]/, "Acceptance TypeScript must exclude generated build trees");
assert.match(acceptanceRunner, /fs\.rmSync\(buildOutputPath/, "Acceptance must clean only its isolated Next.js output");
assert.match(acceptanceRunner, /fs\.rmSync\(tsconfigPath/, "Acceptance must clean its generated TypeScript configuration");
assert.match(agentContract, /showroom-projects\/WORKFLOW\.md/, "Agent contract must require the client-showroom workflow");
assert.match(masterPrompt, /showroom-projects\/WORKFLOW\.md/, "Product contract must require the client-showroom workflow");
assert.match(showroomWorkflow, /full-page 1440px desktop and 390px phone views/, "Showroom workflow must require desktop and phone evidence");
assert.match(showroomWorkflow, /common camera, scale, or venue language/, "Showroom workflow must coordinate City Showroom booths");
for (const heading of ["Identity", "Customer And Goal", "Brand Direction", "Media Authority", "Booth Direction"]) {
  assert.match(showroomBrief, new RegExp(`## ${heading}`), `Showroom brief must include ${heading}`);
}
assert.match(showroomReview, /Blocking and high findings were corrected and recaptured/, "Showroom review must require a correction pass");
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
