import crypto from "node:crypto";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  databasePath,
  mediaRoot,
  requestAttachmentRoot,
  supabaseMediaStorageConfig,
} from "../lib/config";
import {
  buildMediaReferenceManifest,
  listLocalMediaObjects,
  mediaObjectIdentity,
} from "../lib/media-manifest";
import {
  SupabaseMediaObjectStore,
} from "../lib/media-storage";

const digest = (bytes: Buffer) =>
  crypto.createHash("sha256").update(bytes).digest("hex");

async function main() {
  const execute = process.argv.includes("--execute");
  const unexpected = process.argv
    .slice(2)
    .filter((value) => !["--execute", "--dry-run"].includes(value));
  if (unexpected.length) throw new Error("Use --dry-run or --execute.");

  const db = new DatabaseSync(databasePath(), { readOnly: true });
  const manifest = buildMediaReferenceManifest(db);
  db.close();
  if (manifest.invalidReferenceCount || manifest.malformedDocumentCount) {
    throw new Error("The database media manifest contains invalid retained references.");
  }
  const planned = listLocalMediaObjects(mediaRoot(), requestAttachmentRoot());
  const localByIdentity = new Map(
    planned.map((item) => [mediaObjectIdentity(item.namespace, item.key), item]),
  );
  const expected = new Set(
    manifest.references.map((reference) =>
      mediaObjectIdentity(reference.namespace, reference.key),
    ),
  );
  const target = new SupabaseMediaObjectStore(supabaseMediaStorageConfig());
  let copied = 0;
  let retained = 0;
  let bytesChecked = 0;
  let missing = 0;
  let conflicting = 0;

  for (const item of planned) {
    const source = fs.readFileSync(item.fullPath);
    bytesChecked += source.byteLength;
    const existing = await target.read(item.namespace, item.key, item.contentType);
    if (existing) {
      if (digest(existing.bytes) !== digest(source)) {
        conflicting += 1;
        continue;
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

  for (const reference of manifest.references) {
    const id = mediaObjectIdentity(reference.namespace, reference.key);
    if (localByIdentity.has(id)) continue;
    const existing = await target.read(
      reference.namespace,
      reference.key,
      reference.contentType,
    );
    if (!existing) missing += 1;
  }

  if (missing || conflicting) {
    throw new Error(
      "Object-storage reconciliation found missing or conflicting authoritative media.",
    );
  }

  console.log(JSON.stringify({
    mode: execute ? "execute" : "dry-run",
    planned: planned.length,
    copied,
    alreadyVerified: retained,
    bytesChecked,
    referenced: expected.size,
    sourceUnreferenced: planned.filter(
      (item) => !expected.has(mediaObjectIdentity(item.namespace, item.key)),
    ).length,
    missing,
    conflicting,
    sourceDeleted: false,
    databaseChanged: false,
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Media migration failed.");
  process.exit(1);
});
