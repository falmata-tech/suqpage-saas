import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const generatedDevTypes = path.join(process.cwd(), ".next", "dev", "types");
fs.rmSync(generatedDevTypes, { recursive: true, force: true });

for (const [command, args] of [
  [process.execPath, ["node_modules/next/dist/bin/next", "typegen"]],
  [process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit"]],
]) {
  const result = spawnSync(command, args, { cwd: process.cwd(), env: process.env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
