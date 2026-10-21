import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseEnv } from "node:util";
import { spawn, spawnSync } from "node:child_process";
const root = path.resolve(import.meta.dirname, "..");
const mode = process.argv[2] || "web";
if (!["web", "android", "phone"].includes(mode))
  throw Error("Use web, android or phone.");
const local = parseEnv(
  fs.readFileSync(path.join(root, ".local/supabase-runtime.env"), "utf8"),
);
const provider = new URL(local.NEXT_PUBLIC_SUPABASE_URL || "");
if (
  !["127.0.0.1", "localhost"].includes(provider.hostname) ||
  provider.port !== "54321"
)
  throw Error(
    "Configure local Supabase first: npm run local:supabase:configure",
  );
const interfaces = os.networkInterfaces();
const lan = Object.entries(interfaces)
  .sort(([a], [b]) => Number(!a.startsWith("en")) - Number(!b.startsWith("en")))
  .flatMap(([, values]) => values || [])
  .find(
    (v) =>
      v.family === "IPv4" &&
      !v.internal &&
      /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(v.address),
  )?.address;
if (mode === "phone" && !lan)
  throw Error("Connect this Mac and your phone to the same Wi-Fi network.");
const host = mode === "phone" ? lan : "127.0.0.1";
const sdk = path.join(os.homedir(), "Library/Android/sdk");
const env = {
  ...process.env,
  ANDROID_HOME: sdk,
  ANDROID_SDK_ROOT: sdk,
  PATH: `${sdk}/platform-tools:${sdk}/emulator:${sdk}/cmdline-tools/latest/bin:${process.env.PATH || ""}`,
  EXPO_PUBLIC_API_ORIGIN: `http://${host}:3102`,
  EXPO_PUBLIC_SUPABASE_URL: `http://${host}:54321`,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    local.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};
if (!env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  throw Error("Missing local public Auth key.");
const health = await fetch(`http://${host}:3102/api/health`, {
  signal: AbortSignal.timeout(5000),
}).catch(() => null);
if (!health?.ok)
  throw Error(
    mode === "phone"
      ? "Start the phone-accessible API first: npm run dev:mobile"
      : "Start the local API first: npm run dev -- --port 3102",
  );
if (mode === "android")
  for (const port of [3102, 54321, 8082]) {
    const result = spawnSync("adb", ["reverse", `tcp:${port}`, `tcp:${port}`], {
      env,
      stdio: "inherit",
    });
    if (result.status !== 0)
      throw Error("Start the Suqpage Android emulator first, then retry.");
  }
const args = [
  "start",
  "--port",
  "8082",
  ...(mode === "web"
    ? ["--web", "--host", "localhost"]
    : mode === "android"
      ? ["--dev-client", "--android", "--host", "localhost"]
      : ["--dev-client", "--host", "lan"]),
];
console.log(`Suqpage ${mode} testing: API http://${host}:3102`);
const child = spawn(
  process.execPath,
  [path.join(root, "node_modules/expo/bin/cli"), ...args],
  { cwd: path.join(root, "apps/mobile"), env, stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => {
  process.exitCode = code || 0;
});
