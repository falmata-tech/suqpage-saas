import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("netlify.toml", "utf8");
const nodeVersion = fs.readFileSync(".nvmrc", "utf8").trim();
const environment = fs.readFileSync(".env.example", "utf8");
const gitignore = fs.readFileSync(".gitignore", "utf8");

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

console.log("Netlify provider-neutral build and Supabase environment contracts passed.");
