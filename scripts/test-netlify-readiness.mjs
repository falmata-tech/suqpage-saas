import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { platformAssetRewrites } from "../lib/platform-assets.ts";

const staticAliases = platformAssetRewrites.map(route => `${route.source} ${route.destination} 200`);
const imageQuery = { url: ":url", w: ":width", q: ":quality" };
const imageDestination = "/.netlify/images?url=:url&w=:width&q=:quality";
const adapterImageRules = [
  { from: "/_next/image", to: imageDestination, status: 200, query: imageQuery },
  { from: "/_ipx/*", to: imageDestination, status: 200, query: imageQuery },
  { from: "/_next/image", to: "/.netlify/images", status: 200, query: {} },
];

/**
 * Test-only admission of physical routing files, before any merge deduplication.
 * The release adapter can reuse this pure check with its parsed generated config.
 * @param {{staticRedirects: readonly string[], generatedRedirects: readonly {
 *   from: string, to: string, status: number, query?: Record<string, string>,
 *   force?: boolean, conditions?: Record<string, unknown>, headers?: Record<string, string>
 * }[], serverFunction: {excluded_routes?: readonly {literal?: string, pattern?: string, expression?: string}[]}}} routing
 */
export function assertNetlifyImageRouting(routing) {
  assert.deepEqual(routing.staticRedirects, staticAliases,
    "Physical _redirects must contain only the unchanged legacy aliases; an image rule shadows the generated query capture");
  const imageRules = routing.generatedRedirects.filter(rule =>
    rule.from.startsWith("/_next/image") || rule.from.startsWith("/_ipx") || rule.to.includes("/.netlify/images"));
  const normalized = imageRules.map(rule => {
    assert.ok(Object.keys(rule).every(key => ["from", "to", "status", "query", "force", "conditions", "headers"].includes(key)),
      "Unexpected image routing field");
    assert.ok(rule.force === undefined || rule.force === false, "Image routes cannot override static content");
    assert.equal(Object.keys(rule.conditions ?? {}).length, 0, "Image routes must not acquire conditions");
    assert.equal(Object.keys(rule.headers ?? {}).length, 0, "Image routes must not forward additional headers");
    return { from: rule.from, to: rule.to, status: rule.status, query: rule.query ?? {} };
  });
  assert.deepEqual(normalized, adapterImageRules,
    "Retain the official query-aware Next/IPX rules before the queryless fallback, with exact source/width/quality captures");
  assert.deepEqual(routing.serverFunction.excluded_routes, [{ literal: "/_next/image" }],
    "The exact image path must stay excluded from the server handler without broadening exclusions");
}

function main() {
const config = fs.readFileSync("netlify.toml", "utf8");
const nodeVersion = fs.readFileSync(".nvmrc", "utf8").trim();
const environment = fs.readFileSync(".env.example", "utf8");
const gitignore = fs.readFileSync(".gitignore", "utf8");
const redirectRules = fs.readFileSync("public/_redirects", "utf8")
  .split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#"));

// DEP-049 B09: _redirects takes precedence over generated TOML. Test the
// physical file as well as the complete adapter contract; a merged view can
// deduplicate the bad static rule and conceal the hosted shadowing defect.
const routing = {
  staticRedirects: redirectRules,
  generatedRedirects: structuredClone(adapterImageRules),
  serverFunction: { excluded_routes: [{ literal: "/_next/image" }] },
};
assertNetlifyImageRouting(routing);
let rejected = 0;
function rejects(label, change) {
  const modified = structuredClone(routing);
  change(modified);
  assert.throws(() => assertNetlifyImageRouting(modified), undefined, label);
  rejected++;
}
rejects("physical simple image shadow", value => value.staticRedirects.unshift("/_next/image /.netlify/images 200"));
rejects("physical wildcard image shadow", value => value.staticRedirects.unshift("/_next/* /.netlify/images 200"));
rejects("changed legacy alias", value => { value.staticRedirects[0] += "!"; });
rejects("missing legacy alias", value => { value.staticRedirects.pop(); });
rejects("reordered legacy aliases", value => { value.staticRedirects.reverse(); });
for (const key of ["url", "w", "q"]) {
  rejects(`missing ${key} capture`, value => { delete value.generatedRedirects[0].query[key]; });
}
rejects("uncaptured image destination", value => { value.generatedRedirects[0].to = "/.netlify/images"; });
rejects("external image destination", value => { value.generatedRedirects[0].to = "https://example.com/image"; });
rejects("fallback before capture", value => { value.generatedRedirects.reverse(); });
rejects("duplicate image rule", value => { value.generatedRedirects.push(structuredClone(value.generatedRedirects[0])); });
rejects("broader CDN wildcard", value => { value.generatedRedirects.push({ from: "/api/*", to: "/.netlify/images", status: 200, query: {} }); });
rejects("missing compatibility rule", value => { value.generatedRedirects.splice(1, 1); });
rejects("missing fallback", value => { value.generatedRedirects.pop(); });
rejects("missing handler exclusion", value => { value.serverFunction.excluded_routes = []; });
rejects("broader handler exclusion", value => { value.serverFunction.excluded_routes = [{ pattern: "/_next/*" }]; });
rejects("additional handler exclusion", value => { value.serverFunction.excluded_routes.push({ literal: "/api/private" }); });

assert.match(config, /command = "node scripts\/check-web-install.cjs && npm run build"/);
assert.match(config, /NPM_FLAGS = "--workspace=@suqpage\/contracts --include-workspace-root"/);
assert.match(config, /SUQPAGE_INSTALL_TARGET = "web"/);
assert.match(config, /publish = "\.next"/, "Only Next output may be selected for adapter packaging");
assert.match(config, new RegExp(`NODE_VERSION = "${nodeVersion.replaceAll(".", "\\.")}"`));
assert.doesNotMatch(config, /SUPABASE|POSTGRES|SERVICE_ROLE|PRIVACY_SALT|DATABASE_URL/i, "Netlify config contains no runtime secret names or values");
assert.match(config, /\[\[plugins\]\]\s+package = "@netlify\/plugin-nextjs"/, "The root app explicitly selects the Next adapter in this monorepo");
const dependencies = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.equal(dependencies.dependencies?.["@netlify/plugin-nextjs"], undefined, "The provider adapter is not pinned in application dependencies");
assert.equal(dependencies.devDependencies?.["@netlify/plugin-nextjs"], undefined, "The provider adapter is not pinned in build dependencies");
assert.match(gitignore, /^\.netlify\/$/m, "Local Netlify site-link state must stay out of Git");
for (const name of [
  "SUQPAGE_DATABASE_DRIVER",
  "SUQPAGE_POSTGRES_URL",
  "SUQPAGE_MEDIA_DRIVER",
  "SUQPAGE_AUTH_DRIVER",
  "NEXT_PUBLIC_SUQPAGE_MAP_PROVIDER",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUQPAGE_SUPABASE_SERVICE_ROLE_KEY",
  "SUQPAGE_EMAIL_OTP_ENABLED",
  "SUQPAGE_GOOGLE_AUTH_ENABLED",
]) assert.match(environment, new RegExp(`^${name}=`, "m"));
assert.match(environment, /^SUQPAGE_DATABASE_DRIVER=postgres$/m);
assert.match(environment, /^SUQPAGE_MEDIA_DRIVER=supabase$/m);
assert.match(environment, /^SUQPAGE_AUTH_DRIVER=supabase$/m);
assert.match(environment, /^NEXT_PUBLIC_SUQPAGE_MAP_PROVIDER=osm-standard$/m);

console.log(`Netlify build/environment contracts and official image routing passed; ${rejected} unsafe routing variants rejected.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
