import assert from "node:assert/strict";
import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const home = read("app/page.tsx");
const discovery = read("components/DiscoveryWorkspace.tsx");
const about = read("app/about/page.tsx");
const signup = read("app/request/page.tsx");
const login = read("app/login/page.tsx");
const metadata = read("app/layout.tsx");
const publicNarrative = [home, discovery, about, signup, login, metadata].join("\n");

assert.match(home, /For the people who choose to make here/);
assert.match(home, /small and growing Ethiopian producers/);
assert.match(home, /personal or wholesale needs/);
assert.match(discovery, /Find the people behind what Ethiopia makes/);
assert.match(discovery, /by what they produce and where they work/);

for (const commitment of ["time", "savings", "land", "tools", "skill", "reputation"]) {
  assert.match(about, new RegExp(`\\b${commitment}\\b`), `About must acknowledge producer ${commitment}`);
}
assert.match(about, /supports jobs and local supply/);
assert.match(about, /permanent professional showroom/);
assert.match(about, /Consumer and wholesale buyers/);
assert.match(about, /The producer keeps its identity, customer relationship, and control of the conversation/);

assert.match(signup, /You have already invested in making, growing, or processing something here/);
assert.match(signup, /Nothing appears publicly until you approve the design and MirtPage publishes it/);
assert.match(login, /Manage the professional presence behind your work/);
assert.match(metadata, /Discover small and growing Ethiopian producers/);

for (const overclaim of [
  /guaranteed sales/i,
  /every business pays taxes/i,
  /verified jobs/i,
  /certified by MirtPage/i,
  /shop now/i,
]) {
  assert.doesNotMatch(publicNarrative, overclaim, `Public narrative contains prohibited overclaim: ${overclaim}`);
}

const showroomFiles = fs.readdirSync("components/showroom", { recursive: true })
  .filter((file) => typeof file === "string" && /\.(tsx?|css)$/.test(file))
  .map((file) => read(`components/showroom/${file}`))
  .join("\n");
for (const platformSlogan of [
  "For the people who choose to make here",
  "MirtPage closes that visibility gap",
  "Producing locally is a commitment worth backing",
]) {
  assert.doesNotMatch(showroomFiles, new RegExp(platformSlogan), `Platform narrative leaked into client showrooms: ${platformSlogan}`);
}

console.log("MirtPage maker-first public narrative contract passed.");
