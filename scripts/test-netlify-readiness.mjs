import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("netlify.toml", "utf8");
const nodeVersion = fs.readFileSync(".nvmrc", "utf8").trim();
const environment = fs.readFileSync(".env.example", "utf8");
const gitignore = fs.readFileSync(".gitignore", "utf8");

assert.match(config, /command = "npm run build"/);
assert.match(config, new RegExp(`NODE_VERSION = "${nodeVersion.replaceAll(".", "\\.")}"`));
assert.doesNotMatch(config, /SUPABASE|POSTGRES|SERVICE_ROLE|PRIVACY_SALT|DATABASE_URL/i, "Netlify config contains no runtime secret names or values");
assert.doesNotMatch(config, /open-next|opennext|@netlify\/plugin-nextjs/i, "Netlify OpenNext adapter is not pinned");
assert.match(gitignore, /^\.netlify\/$/m, "Local Netlify site-link state must stay out of Git");
for (const name of [
  "MIRTPAGE_DATABASE_DRIVER",
  "MIRTPAGE_POSTGRES_URL",
  "MIRTPAGE_MEDIA_DRIVER",
  "MIRTPAGE_AUTH_DRIVER",
  "NEXT_PUBLIC_MIRTPAGE_MAP_PROVIDER",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY",
  "MIRTPAGE_EMAIL_OTP_ENABLED",
  "MIRTPAGE_GOOGLE_AUTH_ENABLED",
]) assert.match(environment, new RegExp(`^${name}=`, "m"));
assert.match(environment, /^MIRTPAGE_DATABASE_DRIVER=postgres$/m);
assert.match(environment, /^MIRTPAGE_MEDIA_DRIVER=supabase$/m);
assert.match(environment, /^MIRTPAGE_AUTH_DRIVER=supabase$/m);
assert.match(environment, /^NEXT_PUBLIC_MIRTPAGE_MAP_PROVIDER=osm-standard$/m);

console.log("Netlify provider-neutral build and Supabase environment contracts passed.");
