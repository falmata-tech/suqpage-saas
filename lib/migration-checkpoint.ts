import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { backupRoot, databasePath } from "./config";

type BackupManifest = {
  createdAt?: string;
  sourceDatabase?: string;
  integrity?: string;
  foreignKeyFailures?: number;
  databaseBytes?: number;
  databaseSha256?: string;
};

export function assertDestructiveMigrationCheckpoint(label: string) {
  if (process.env.SUQPAGE_APPROVE_DESTRUCTIVE_MIGRATIONS !== "1") {
    throw new Error(
      `${label} requires a stopped single-instance deployment, npm run backup, and SUQPAGE_APPROVE_DESTRUCTIVE_MIGRATIONS=1.`,
    );
  }
  const root = backupRoot();
  const manifests = fs.existsSync(root)
    ? fs
        .readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(root, entry.name, "backup.json"))
        .filter((manifest) => fs.existsSync(manifest))
    : [];
  const candidates = manifests
    .map((manifestPath) => {
      try {
        return {
          manifestPath,
          manifest: JSON.parse(
            fs.readFileSync(manifestPath, "utf8"),
          ) as BackupManifest,
        };
      } catch {
        return null;
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort(
      (a, b) =>
        Date.parse(b.manifest.createdAt || "") -
        Date.parse(a.manifest.createdAt || ""),
    );
  const candidate = candidates.find(
    ({ manifest }) =>
      path.resolve(manifest.sourceDatabase || "") === databasePath() &&
      manifest.integrity === "ok" &&
      manifest.foreignKeyFailures === 0 &&
      Number.isFinite(manifest.databaseBytes) &&
      /^[a-f0-9]{64}$/.test(manifest.databaseSha256 || "") &&
      Date.now() - Date.parse(manifest.createdAt || "") <= 24 * 60 * 60 * 1000,
  );
  if (!candidate) {
    throw new Error(
      `${label} requires a verified backup of this database created within 24 hours.`,
    );
  }
  const backupDatabase = path.join(
    path.dirname(candidate.manifestPath),
    "suqpage.db",
  );
  if (!fs.existsSync(backupDatabase)) {
    throw new Error(`${label} backup database is missing.`);
  }
  const currentHash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(databasePath()))
    .digest("hex");
  const backupHash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(backupDatabase))
    .digest("hex");
  if (
    currentHash !== candidate.manifest.databaseSha256 ||
    backupHash !== candidate.manifest.databaseSha256
  ) {
    throw new Error(
      `${label} backup no longer matches the database. Stop writes and create a new backup.`,
    );
  }
  const filesystem = fs.statfsSync(path.dirname(databasePath()));
  const freeBytes = Number(filesystem.bavail) * Number(filesystem.bsize);
  const requiredBytes = Math.max(
    Number(candidate.manifest.databaseBytes) * 3,
    10 * 1024 * 1024,
  );
  if (freeBytes < requiredBytes) {
    throw new Error(`${label} requires more free disk space.`);
  }
}
