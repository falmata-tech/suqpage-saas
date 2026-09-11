import { spawn } from "node:child_process";
import process from "node:process";

process.loadEnvFile(".local/supabase-runtime.env");

function assertLoopback(raw, port, label) {
  const url = new URL(raw || "");
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || url.port !== port) {
    throw new Error(`${label} must use the local Supabase loopback port ${port}.`);
  }
}

if (process.env.MIRTPAGE_DATABASE_DRIVER !== "postgres") {
  throw new Error("Local development requires MIRTPAGE_DATABASE_DRIVER=postgres.");
}
if (process.env.MIRTPAGE_AUTH_DRIVER !== "supabase") {
  throw new Error("Local development requires MIRTPAGE_AUTH_DRIVER=supabase.");
}
if (process.env.MIRTPAGE_MEDIA_DRIVER !== "supabase") {
  throw new Error("Local development requires MIRTPAGE_MEDIA_DRIVER=supabase.");
}
assertLoopback(process.env.MIRTPAGE_POSTGRES_URL, "54322", "Local database URL");
assertLoopback(process.env.MIRTPAGE_SUPABASE_URL, "54321", "Local provider URL");

const port = process.env.PORT || "3000";
if (!/^\d{4,5}$/.test(port) || Number(port) < 1024 || Number(port) > 65535) {
  throw new Error("PORT must be an available local TCP port from 1024 to 65535.");
}

const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", port],
  { cwd: process.cwd(), env: process.env, stdio: "inherit" },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => next.kill(signal));
}
next.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
