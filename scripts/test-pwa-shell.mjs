import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const manifest = JSON.parse(read("public/manifest.webmanifest"));

assert.equal(manifest.name, "MirtPage");
assert.equal(manifest.start_url, "/");
assert.equal(manifest.scope, "/");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.theme_color, "#0B1D3A");
assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192" && icon.purpose === "any"));
assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512" && icon.purpose === "any"));
assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512" && icon.purpose === "maskable"));

for (const [file, size] of [
  ["public/pwa/favicon-32.png", 32],
  ["public/pwa/apple-touch-icon.png", 180],
  ["public/pwa/icon-192.png", 192],
  ["public/pwa/icon-512.png", 512],
  ["public/pwa/icon-maskable-512.png", 512],
]) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} exists`);
  const metadata = await sharp(path.join(root, file)).metadata();
  assert.equal(metadata.width, size, `${file} width`);
  assert.equal(metadata.height, size, `${file} height`);
  assert.equal(metadata.format, "png", `${file} format`);
}

const worker = read("public/sw.js");
assert.doesNotThrow(() => new Function(worker), "service worker source parses");
assert.match(worker, /const CACHE_PREFIX = "mirtpage-pwa-"/);
assert.match(worker, /const PRIVATE_PATHS = \["\/api", "\/dashboard", "\/preview", "\/login", "\/request"\]/);
assert.match(worker, /if \(request\.method !== "GET"\) return/);
assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.match(worker, /putBounded\(PAGE_CACHE, request, response\.clone\(\), 20\)/);
assert.match(worker, /putBounded\(ASSET_CACHE, request, response\.clone\(\), 80\)/);
assert.match(worker, /caches\.match\(OFFLINE_URL\)/);
assert.doesNotMatch(worker, /POST|backgroundSync|pushManager/i);

const layout = read("app/layout.tsx");
assert.match(layout, /manifest:"\/manifest\.webmanifest"/);
assert.match(layout, /appleWebApp:\{capable:true/);
assert.match(layout, /viewportFit:"cover"/);
assert.match(layout, /<PwaRegistration \/>/);

const registration = read("components/PwaRegistration.tsx");
assert.match(registration, /process\.env\.NODE_ENV !== "production"/);
assert.match(registration, /NEXT_PUBLIC_MIRTPAGE_PWA_ENABLED === "false"/);
assert.match(registration, /navigator\.serviceWorker\.register\("\/sw\.js"/);
assert.match(registration, /updateViaCache: "none"/);
assert.match(registration, /name\.startsWith\(CACHE_PREFIX\)/);

const publicNavigation = read("components/PublicMobileNavigation.tsx");
for (const label of ["Market", "Featured", "About"]) assert.match(publicNavigation, new RegExp(`label: "${label}"`));
for (const label of ["Sign up", "Sign in"]) assert.match(publicNavigation, new RegExp(`label: "${label}"`));
assert.match(publicNavigation, /<span>More<\/span>/);
assert.match(publicNavigation, /aria-haspopup="dialog"/);
assert.match(publicNavigation, /aria-current=\{active \? "page" : undefined\}/);

for (const file of ["app/page.tsx", "app/featured/page.tsx", "app/about/page.tsx"]) {
  assert.match(read(file), /<PublicAppShell>/, `${file} renders the shared public application shell`);
}
assert.match(read("components/PublicAppShell.tsx"), /<PublicMobileNavigation \/>/);
for (const file of ["app/login/page.tsx", "app/request/page.tsx", "app/privacy/page.tsx", "app/terms/page.tsx", "app/contact-success/page.tsx", "app/invite/[token]/page.tsx"]) {
  assert.match(read(file), /<PublicMobileNavigation \/>/, `${file} renders shared phone navigation`);
}
assert.match(read("app/discover/page.tsx"), /redirect\(/);

const landingCss = read("app/landing.css");
assert.match(landingCss, /\.landing-header,\.landing-footer \{ display: none; \}/);
assert.match(landingCss, /\.public-mobile-tabs \{ display: grid; position: fixed;/);
assert.match(landingCss, /env\(safe-area-inset-bottom\)/);
assert.match(landingCss, /\.public-mobile-tabs \{ grid-template-columns: repeat\(4/);

const workspace = read("components/WorkspaceNavigation.tsx");
assert.doesNotMatch(workspace, /<header className="workspace-mobile-header">/);
assert.match(workspace, /className="workspace-mobile-tabs"/);
assert.match(workspace, /const primaryItems = priority/);
assert.match(workspace, /<NavigationGroups groups=\{groups\} onNavigate=/);

const globals = read("app/globals.css");
assert.match(globals, /\.workspace-mobile-tabs\{display:grid;position:fixed/);
assert.match(globals, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
assert.match(globals, /\.workspace-drawer\{width:100%;height:auto;max-height:min\(84dvh,760px\)/);

assert.match(read("components/showroom/bank/bank.module.css"), /@media \(max-width: 760px\) \{\s+\.footer \{\s+display: none;/);
assert.match(read("components/showroom/showrooms.css"), /@media \(max-width: 620px\) \{\s+\.showroom-host-bar[\s\S]+?\.sr-footer \{\s+display: none;/);

const nextConfig = read("next.config.ts");
assert.match(nextConfig, /source: "\/sw\.js"/);
assert.match(nextConfig, /Service-Worker-Allowed/);
assert.match(nextConfig, /no-cache, no-store, must-revalidate/);

const cleanupWorker = read("scripts/pwa-cleanup-worker.js");
assert.doesNotThrow(() => new Function(cleanupWorker), "PWA cleanup worker source parses");
assert.match(cleanupWorker, /name\.startsWith\(CACHE_PREFIX\)/);
assert.match(cleanupWorker, /self\.registration\.unregister\(\)/);
assert.doesNotMatch(cleanupWorker, /addEventListener\("fetch"/);

console.log("PWA manifest, cache policy, and mobile application shell contracts passed.");
