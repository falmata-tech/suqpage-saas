import fs from "node:fs";
import process from "node:process";

const EXPECTED_NODE = "24.18.1";
const EXPECTED_ENGINE = ">=24.18.1 <25";
const EXPECTED_NODE_IMAGE = "node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const nvm = fs.readFileSync(".nvmrc", "utf8").trim();
const dockerfile = fs.readFileSync("Dockerfile", "utf8");
const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
const failures = [];

if (nvm !== EXPECTED_NODE) failures.push(`.nvmrc must be ${EXPECTED_NODE}`);
if (packageJson.engines?.node !== EXPECTED_ENGINE) {
  failures.push(`package engines.node must be ${EXPECTED_ENGINE}`);
}
const dockerStages = [...dockerfile.matchAll(/^FROM\s+(\S+)/gm)].map((match) => match[1]);
if (!dockerStages.length || dockerStages.some((image) => image !== EXPECTED_NODE_IMAGE)) {
  failures.push("every Docker stage must use the reviewed immutable Node image");
}
const workflowVersions = [...workflow.matchAll(/node-version:\s*([^\s]+)/g)].map((match) => match[1]);
if (!workflowVersions.length || workflowVersions.some((version) => version !== EXPECTED_NODE)) {
  failures.push(`every GitHub Actions Node version must be ${EXPECTED_NODE}`);
}
if (process.versions.node !== EXPECTED_NODE) {
  failures.push(`the active Node runtime is ${process.versions.node}; run nvm use`);
}
if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({
  node: EXPECTED_NODE,
  packageEngine: EXPECTED_ENGINE,
  dockerStages: dockerStages.length,
  workflowJobs: workflowVersions.length,
  immutableContainerDigest: true,
}));
