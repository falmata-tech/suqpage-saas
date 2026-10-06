import { platformEnvironment } from "../lib/platform-environment.mjs";
import { spawn } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { ensureLocalServices } from "./local-dev-services.mjs";

export async function launchLocalDev(prepare = ensureLocalServices) {

try { process.loadEnvFile(".local/supabase-runtime.env"); }
catch { throw new Error('Local settings are missing or unreadable. Run npm run local:supabase:configure after starting local Supabase.'); }
Object.assign(process.env, platformEnvironment());

function assertLoopback(raw, port, label) {
  let url;
  try { url = new URL(raw || ""); }
  catch { throw new Error(`${label} is missing or invalid. Run npm run local:supabase:configure.`); }
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || url.port !== port) {
    throw new Error(`${label} must use the local Supabase loopback port ${port}.`);
  }
}

if (process.env.SUQPAGE_DATABASE_DRIVER !== "postgres") {
  throw new Error("Local development requires SUQPAGE_DATABASE_DRIVER=postgres.");
}
if (process.env.SUQPAGE_AUTH_DRIVER !== "supabase") {
  throw new Error("Local development requires SUQPAGE_AUTH_DRIVER=supabase.");
}
if (process.env.SUQPAGE_MEDIA_DRIVER !== "supabase") {
  throw new Error("Local development requires SUQPAGE_MEDIA_DRIVER=supabase.");
}
assertLoopback(process.env.SUQPAGE_POSTGRES_URL, "54322", "Local database URL");
assertLoopback(process.env.SUQPAGE_SUPABASE_URL, "54321", "Local provider URL");
assertLoopback(process.env.NEXT_PUBLIC_SUPABASE_URL, "54321", "Local browser provider URL");

let port = process.env.PORT || "3000";
let hostname = '127.0.0.1';
const rawArgs = process.argv.slice(2);
const allowLan = rawArgs.includes('--allow-lan');
const args = rawArgs.filter(arg => arg !== '--allow-lan');
for (let i = 0; i < args.length; i++) {
  const [flag, inline] = args[i].split('=', 2);
  if (!['--port', '-p', '--hostname', '-H'].includes(flag)) throw new Error('Supported development options: --hostname and --port.');
  const value = inline ?? args[++i];
  if (!value) throw new Error(`A value is required for ${flag}.`);
  if (flag === '--port' || flag === '-p') port = value;
  else hostname = value;
}
if (!['127.0.0.1', 'localhost', '::1'].includes(hostname) && !(allowLan && hostname === '0.0.0.0')) throw new Error('Development hostname must be a loopback address.');
if (!/^\d{4,5}$/.test(port) || Number(port) < 1024 || Number(port) > 65535) {
  throw new Error("PORT must be an available local TCP port from 1024 to 65535.");
}
const origin = `http://${hostname === '::1' ? '[::1]' : hostname === '0.0.0.0' ? '127.0.0.1' : hostname}:${port}`;
process.env.PORT = port;
process.env.NEXT_PUBLIC_APP_URL = origin;
process.env.SUQPAGE_CANONICAL_URL = origin;

await prepare();

const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--hostname", hostname, "--port", port],
  { cwd: process.cwd(), env: process.env, stdio: "inherit" },
);
next.on('error', () => { console.error('Could not start Next.js. Check that dependencies are installed.'); process.exitCode = 1; });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => next.kill(signal));
}
next.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal === 'SIGINT' || signal === 'SIGTERM' ? 0 : 1);
});

}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  launchLocalDev().catch(error => { console.error(error.message); process.exitCode = 1; });
}
