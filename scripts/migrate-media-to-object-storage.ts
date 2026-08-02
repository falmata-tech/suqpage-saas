import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  mediaRoot,
  requestAttachmentRoot,
  supabaseMediaStorageConfig,
} from "../lib/config";
import { mediaMime } from "../lib/media";
import {
  assertMediaObjectKey,
  SupabaseMediaObjectStore,
  type MediaNamespace,
} from "../lib/media-storage";

type PlannedObject = {
  namespace: MediaNamespace;
  key: string;
  fullPath: string;
  contentType: string;
};

function filesIn(root: string, namespace: MediaNamespace): PlannedObject[] {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .flatMap((entry) => {
      try {
        assertMediaObjectKey(entry.name);
      } catch {
        return [];
      }
      return [{
        namespace,
        key: entry.name,
        fullPath: path.join(root, entry.name),
        contentType: mediaMime(entry.name),
      }];
    });
}

const digest = (bytes: Buffer) =>
  crypto.createHash("sha256").update(bytes).digest("hex");

async function main() {
  const execute = process.argv.includes("--execute");
  const unexpected = process.argv
    .slice(2)
    .filter((value) => !["--execute", "--dry-run"].includes(value));
  if (unexpected.length) throw new Error("Use --dry-run or --execute.");

  const planned = [
    ...filesIn(mediaRoot(), "public"),
    ...filesIn(requestAttachmentRoot(), "requests"),
  ];
  const target = new SupabaseMediaObjectStore(supabaseMediaStorageConfig());
  let copied = 0;
  let retained = 0;
  let bytesChecked = 0;

  for (const item of planned) {
    const source = fs.readFileSync(item.fullPath);
    bytesChecked += source.byteLength;
    const existing = await target.read(item.namespace, item.key, item.contentType);
    if (existing) {
      if (digest(existing.bytes) !== digest(source)) {
        throw new Error("Object-storage verification found a conflicting immutable media object.");
      }
      retained += 1;
      continue;
    }
    if (!execute) continue;
    await target.put(item.namespace, item.key, source, item.contentType);
    const verified = await target.read(item.namespace, item.key, item.contentType);
    if (!verified || digest(verified.bytes) !== digest(source)) {
      throw new Error("Object-storage verification failed after a media copy.");
    }
    copied += 1;
  }

  console.log(JSON.stringify({
    mode: execute ? "execute" : "dry-run",
    planned: planned.length,
    copied,
    alreadyVerified: retained,
    bytesChecked,
    sourceDeleted: false,
    databaseChanged: false,
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Media migration failed.");
  process.exit(1);
});
