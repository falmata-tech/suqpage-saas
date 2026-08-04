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

assert.match(home, /A marketplace for Ethiopian production/);
assert.match(home, /Find what Ethiopia makes/);
assert.match(home, /direct retail or wholesale inquiry/);
assert.match(home, /You built the product\. We build the place buyers find it/);
assert.match(discovery, /Search Ethiopia&apos;s production, not another product feed/);
assert.match(discovery, /by what they make and where they operate/);

for (const commitment of ["equipment", "materials", "land", "training", "wages", "discipline"]) {
  assert.match(about, new RegExp(`\\b${commitment}\\b`), `About must acknowledge producer ${commitment}`);
}
assert.match(about, /Production is a bet on Ethiopia/);
assert.match(about, /Good products cannot grow if buyers cannot find them/);
assert.match(about, /permanent showroom and a place on a searchable national map/);
assert.match(about, /The relationship stays directly with the producer/);

assert.match(signup, /Put your production where buyers can find it/);
assert.match(signup, /MirtPage&apos;s discovery marketplace/);
assert.match(signup, /Nothing appears publicly until you approve the design and MirtPage publishes it/);
assert.match(login, /Manage your showroom, customer inquiries, design requests/);
assert.match(metadata, /Search what Ethiopia makes/);

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
  "Production is a bet on Ethiopia",
  "You built the product. We build the place buyers find it",
  "Good products cannot grow if buyers cannot find them",
]) {
  assert.doesNotMatch(showroomFiles, new RegExp(platformSlogan), `Platform narrative leaked into client showrooms: ${platformSlogan}`);
}

console.log("MirtPage maker-first public narrative contract passed.");
