import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
const sdk =
  process.env.ANDROID_HOME || path.join(os.homedir(), "Library/Android/sdk");
const emulator = path.join(sdk, "emulator/emulator");
if (!fs.existsSync(emulator))
  throw Error("Android Emulator is missing. See docs/MOBILE-TESTING.md.");
const child = spawn(
  emulator,
  [
    "-avd",
    "Suqpage_Pixel_API_35",
    "-memory",
    "3072",
    "-cores",
    "4",
    ...(process.platform === "darwin" && process.arch === "x64"
      ? ["-gpu", "host", "-feature", "-Vulkan"]
      : []),
  ],
  { stdio: "inherit", env: { ...process.env, ANDROID_HOME: sdk } },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => {
  process.exitCode = code || 0;
});
